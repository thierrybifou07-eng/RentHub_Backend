import { Op, fn, col } from "sequelize";
import {
    User,
    Role,
    UserStatus,
    Announcement,
    Report,
    UserSubscription,
    Favorite,
    Message,
    City,
    PropertyType,
    SubscriptionPlan,
} from "../../database/models/index.js";
import ANNOUNCEMENT_STATUS from "../announcements/announcementStatus.js";
import { ROLE_IDS, ROLE_NAMES, AUDIT_ACTIONS, AUDIT_TARGET_TYPES } from "../../../config/auth/app.js";
import { logAudit } from "../audit/audit.service.js";
import { Session } from "../../database/models/index.js";
import USER_STATUS from "../auth/userStatus.js";
import { badRequest, fail, forbidden, notFound, paginated, success, unauthorized, updated, validationFail } from "../../shared/helpers/response.helpers.js";
import { sendTemplateEmail } from "../../shared/helpers/sendMail.js";

const handleServerError = (res, err) => {
    console.error(err);
    return res
        .status(500)
        .json({ status: "error", message: process.env.NODE_ENV === "production" ? "Internal server error" : err.message });
};

const thirtyDaysAgo = () => daysAgo(30);

const daysAgo = (days) => new Date(Date.now() - days * 24 * 60 * 60 * 1000);

const EVOLUTION_GRANULARITIES = {
    day: { fn: (column) => fn("DATE", col(column)), label: "day" },
    week: { fn: (column) => fn("DATE_FORMAT", col(column), "%x-W%v"), label: "week" },
    month: { fn: (column) => fn("DATE_FORMAT", col(column), "%Y-%m"), label: "month" },
};

const resolveEvolutionGranularity = (days) => {
    if (days <= 90) return EVOLUTION_GRANULARITIES.day;
    if (days <= 200) return EVOLUTION_GRANULARITIES.week;
    return EVOLUTION_GRANULARITIES.month;
};

const parseEvolutionDays = (raw) => {
    const days = parseInt(raw, 10);
    if (!Number.isFinite(days) || days < 1 || days > 365) return 30;
    return days;
};

const evolutionSeries = async (Model, where, dateExpr, paranoid) => {
    return Model.findAll({
        attributes: [[dateExpr, "date"], [fn("COUNT", col("id")), "count"]],
        where,
        group: [dateExpr],
        order: [[dateExpr, "ASC"]],
        raw: true,
        paranoid,
    });
};

export const getStats = async (req, res) => {
    try {
        const since = thirtyDaysAgo();

        const [totalUsers, ownersCount, tenantsCount, newUsers, totalAnnouncements, activeAnnouncements, pendingAnnouncements, rejectedAnnouncements, rentedAnnouncements, totalReports, pendingReports, totalSubscriptions, pendingSubscriptions, activeSubscriptions, totalFavorites, totalMessages, unreadMessages] = await Promise.all([
            User.count(),
            User.count({ where: { role_id: ROLE_IDS.OWNER } }),
            User.count({ where: { role_id: ROLE_IDS.TENANT } }),
            User.count({ where: { createdAt: { [Op.gte]: since } } }),
            Announcement.count({ paranoid: false }),
            Announcement.count({ where: { status_id: ANNOUNCEMENT_STATUS.ACTIVE } }),
            Announcement.count({ where: { status_id: ANNOUNCEMENT_STATUS.PENDING_REVIEW }, paranoid: false }),
            Announcement.count({ where: { status_id: ANNOUNCEMENT_STATUS.REJECTED }, paranoid: false }),
            Announcement.count({ where: { status_id: ANNOUNCEMENT_STATUS.RENTED } }),
            Report.count(),
            Report.count({ where: { status_id: 1 } }),
            UserSubscription.count(),
            UserSubscription.count({ where: { status: "PENDING" } }),
            UserSubscription.count({ where: { status: "ACTIVE" } }),
            Favorite.count(),
            Message.count(),
            Message.count({ where: { read_at: null } }),
        ]);

        const [revenueTotal, revenueLast30d, usersByRole, usersByStatus, plansDistribution, topCities, topTypes] = await Promise.all([
            revenueSum({}),
            revenueSum({ createdAt: { [Op.gte]: since } }),
            groupedBy(User, Role, "role", "role_id"),
            groupedBy(User, UserStatus, "status", "user_status_id"),
            groupedByPlan(),
            groupedTopAnnouncements(City, "City", "city_id", ["id", "name"]),
            groupedTopAnnouncements(PropertyType, "PropertyType", "property_type_id", ["id", "code", "label"]),
        ]);

        return res.status(200).json(success("Stats retrieved successfully", {
            users: { total: totalUsers, owners: ownersCount, tenants: tenantsCount, newLast30d: newUsers, byRole: usersByRole, byStatus: usersByStatus },
            announcements: { total: totalAnnouncements, active: activeAnnouncements, pending: pendingAnnouncements, rejected: rejectedAnnouncements, rented: rentedAnnouncements, topCities, topTypes },
            reports: { total: totalReports, pending: pendingReports },
            subscriptions: { total: totalSubscriptions, pending: pendingSubscriptions, active: activeSubscriptions, byPlan: plansDistribution },
            revenue: { total: revenueTotal, last30d: revenueLast30d },
            favorites: { total: totalFavorites },
            messages: { total: totalMessages, unread: unreadMessages },
        }));
    } catch (err) {
        return handleServerError(res, err);
    }
};

const revenueSum = async (where) => {
    const [result] = await UserSubscription.findAll({
        attributes: [[fn("SUM", col("SubscriptionPlan.price")), "total"]],
        where: { status: "ACTIVE", ...where },
        include: [{ model: SubscriptionPlan, attributes: [] }],
        raw: true,
    });
    return Number(result?.total) || 0;
};

const groupedBy = async (model, related, alias, foreignKey) => {
    const rows = await model.findAll({
        attributes: [foreignKey, [fn("COUNT", col(`${model.name}.id`)), "count"]],
        include: [{ model: related, as: alias, attributes: ["id", "code", "label"] }],
        group: [`${model.name}.${foreignKey}`, `${alias}.id`],
        raw: true,
    });
    return rows.map((row) => ({
        id: row[`${alias}.id`],
        code: row[`${alias}.code`],
        label: row[`${alias}.label`],
        count: Number(row.count) || 0,
    }));
};

const groupedByPlan = async () => {
    const rows = await UserSubscription.findAll({
        attributes: ["plan_id", [fn("COUNT", col("UserSubscription.id")), "count"]],
        include: [{ model: SubscriptionPlan, attributes: ["id", "code", "label", "price"] }],
        group: ["UserSubscription.plan_id", "SubscriptionPlan.id"],
        raw: true,
    });
    return rows.map((row) => ({
        id: row["SubscriptionPlan.id"],
        code: row["SubscriptionPlan.code"],
        label: row["SubscriptionPlan.label"],
        price: Number(row["SubscriptionPlan.price"]) || 0,
        count: Number(row.count) || 0,
    }));
};

const groupedTopAnnouncements = async (related, alias, foreignKey, attrs) => {
    const rows = await Announcement.findAll({
        attributes: [foreignKey, [fn("COUNT", col("Announcement.id")), "count"]],
        include: [{ model: related, as: alias, attributes: attrs }],
        group: [`Announcement.${foreignKey}`, `${alias}.id`],
        order: [[fn("COUNT", col("Announcement.id")), "DESC"]],
        limit: 5,
        paranoid: false,
        raw: true,
    });
    return rows.map((row) => ({
        id: row[`${alias}.id`],
        label: row[`${alias}.label`] || row[`${alias}.name`],
        count: Number(row.count) || 0,
    }));
};

export const getEvolution = async (req, res) => {
    try {
        const days = parseEvolutionDays(req.query.days);
        const granularity = resolveEvolutionGranularity(days);
        const since = daysAgo(days);
        const dateExpr = granularity.fn("createdAt");

        const [usersByDay, announcementsByDay, reportsByDay, subscriptionsByDay] = await Promise.all([
            evolutionSeries(User, { createdAt: { [Op.gte]: since } }, dateExpr),
            evolutionSeries(Announcement, { createdAt: { [Op.gte]: since } }, dateExpr, false),
            evolutionSeries(Report, { createdAt: { [Op.gte]: since } }, dateExpr),
            evolutionSeries(UserSubscription, { createdAt: { [Op.gte]: since } }, dateExpr),
        ]);

        return res.status(200).json(success("Evolution retrieved successfully", {
            days,
            granularity: granularity.label,
            users: usersByDay,
            announcements: announcementsByDay,
            reports: reportsByDay,
            subscriptions: subscriptionsByDay,
        }));
    } catch (err) {
        return handleServerError(res, err);
    }
};

export const getPendingCounts = async (req, res) => {
    try {
        const [pendingAnnouncements, pendingReports, pendingSubscriptions] = await Promise.all([
            Announcement.count({ where: { status_id: ANNOUNCEMENT_STATUS.PENDING_REVIEW }, paranoid: false }),
            Report.count({ where: { status_id: 1 } }),
            UserSubscription.count({ where: { status: "PENDING" } }),
        ]);

        return res.status(200).json(success("Pending counts retrieved successfully", {
            announcements: pendingAnnouncements,
            reports: pendingReports,
            subscriptions: pendingSubscriptions,
        }));
    } catch (err) {
        return handleServerError(res, err);
    }
};

export const getRecentActivity = async (req, res) => {
    try {
        const [latestAnnouncements, latestReports, latestSubscriptions] = await Promise.all([
            Announcement.findAll({
                where: { status_id: ANNOUNCEMENT_STATUS.PENDING_REVIEW },
                include: [{ model: User, as: "owner", attributes: ["id", "firstname", "lastname", "email"] }],
                order: [["createdAt", "DESC"]],
                limit: 10,
                paranoid: false,
            }),
            Report.findAll({
                include: [
                    { model: User, as: "reporter", attributes: ["id", "firstname", "lastname"] },
                ],
                order: [["createdAt", "DESC"]],
                limit: 10,
            }),
            UserSubscription.findAll({
                where: { status: "PENDING" },
                include: [
                    { model: User, as: "user", attributes: ["id", "firstname", "lastname", "email"] },
                ],
                order: [["createdAt", "DESC"]],
                limit: 10,
            }),
        ]);

        return res.status(200).json(success("Recent activity retrieved successfully", {
            announcements: latestAnnouncements,
            reports: latestReports,
            subscriptions: latestSubscriptions,
        }));
    } catch (err) {
        return handleServerError(res, err);
    }
};

export const manageAnnouncement = async (req, res) => {
    try {
        const announcement = await Announcement.findByPk(req.params.id, { paranoid: false });

        if (!announcement) return res.status(404).json(notFound("Announcement not found"));

        const { newStatus } = req.body;
        const newStatusId = ANNOUNCEMENT_STATUS[newStatus];

        if (newStatusId === announcement.status_id) {
            return res.status(400).json(badRequest("Announcement already has this status"));
        }

        announcement.status_id = newStatusId;
        await announcement.save();

        let emailSent = false;
        if (newStatusId === ANNOUNCEMENT_STATUS.ACTIVE) {
            try {
                const user = await User.findByPk(announcement.user_id);
                await sendTemplateEmail(user.email, "Votre annonce à été acceptée", "announcementApproved", {
                    username: `${user.lastname} ${user.firstname}`,
                    heading: "Votre annonce à été acceptée",
                    announcementTitle: announcement.title,
                });
                emailSent = true
            } catch (e) {
                console.error(e.message);
            }
        }
        return res.status(200).json({ ...updated("Announcement status updated successfully", announcement), emailSent });
    } catch (err) {
        return handleServerError(res, err);
    }
}

export const manageUserRole = async (req, res) => {
    /**
     * This function is used to find the id of or the role value
     * 
     * @param {Object} obj The object of our roles
     * @param {string} value The value that we have to find the key
     * @returns 
     */
    function getKeyByValue(obj, value) {
        return Object.keys(obj).find(key => obj[key] === value);
    }
    try {
        const { id } = req.user
        const { currentRole, newRole
        } = req.body
        const userId = Number(req.params.userId)
        const currentRoleId = Number(getKeyByValue(ROLE_NAMES, currentRole))
        const newRoleId = Number(getKeyByValue(ROLE_NAMES, newRole))

        const userToUpdate = await User.findByPk(userId)

        if (!userToUpdate) return res.status(404).json(notFound())

        if (id === userId) return res.status(401).json({ ...forbidden(), error: "You can't change yourself" })

        if ([ROLE_IDS.ADMIN, ROLE_IDS.ROOT].includes(userToUpdate.role_id)) return res.status(401).json(forbidden())

        if (newRole === currentRole) return res.status(400).json(fail('The new role must be different of the last current role'))

        if (userToUpdate.user_status_id !== USER_STATUS.ACTIVE
            || userToUpdate.email_verified_at === null
            || userToUpdate.verified_at === null) return res.status(400).json(fail('The userToUpdate miss requirements and verification'))
        if (userToUpdate.role_id !== currentRoleId) return res.status(409).json(validationFail("Invalid credentials"))

        userToUpdate.set({ role_id: newRoleId })
        await userToUpdate.save()

        res.status(200).json(updated())
    } catch (error) {
        return handleServerError(res, error);
    }



}

export const manageUserStatus = async (req, res) => {
    try {
        const { id } = req.user
        const { currentStatus, newStatus } = req.body
        const userIdParam = Number(req.params.userId)

        const currentStatusId = USER_STATUS[currentStatus]
        const newStatusId = USER_STATUS[newStatus]
        const reason = req.body?.reason || null

        const userToUpdate = await User.findByPk(userIdParam)

        if (!userToUpdate) return res.status(404).json(notFound())

        if (userToUpdate.role_id === ROLE_IDS.ROOT) {
            return res.status(403).json(forbidden("Cannot modify a ROOT user"))
        }

        if (id === userIdParam) return res.status(401).json({ ...forbidden(), error: "You can't change yourself" })

        if (userToUpdate.user_status_id === USER_STATUS.PENDING_VERIFICATION) return res.status(401).json(unauthorized("The user is not verified yet"))

        if (newStatus === currentStatus) return res.status(400).json(fail('The new status must be different of the last current role'))

        if (userToUpdate.user_status_id !== currentStatusId) return res.status(409).json(validationFail("Invalid credentials"))

        userToUpdate.set({ user_status_id: newStatusId })
        await userToUpdate.save()

        if (newStatusId === USER_STATUS.SUSPENDED || newStatusId === USER_STATUS.INACTIVE) {
            await Session.destroy({ where: { user_id: userIdParam } })

            try {
                const template = "accountSuspended"
                const subject = newStatusId === USER_STATUS.SUSPENDED
                    ? "Votre compte a été suspendu"
                    : "Votre compte a été désactivé"
                await sendTemplateEmail(userToUpdate.email, subject, template, {
                    username: `${userToUpdate.lastname} ${userToUpdate.firstname}`,
                    reason: reason || "Non spécifié",
                    supportEmail: "support@renthub.com",
                })
            } catch (e) {
                console.error("[admin] Failed to send status email:", e.message)
            }
        }

        await logAudit({
            actor: req.user,
            action: AUDIT_ACTIONS.STATUS_CHANGE,
            targetType: AUDIT_TARGET_TYPES.USER,
            targetId: userIdParam,
            oldValues: { user_status_id: currentStatusId },
            newValues: { user_status_id: newStatusId },
            req,
            metadata: reason ? { reason } : null,
        })

        res.status(200).json(updated('Resource updated successfully', { userToUpdate }))
    } catch (error) {
        return handleServerError(res, error);
    }
}

export const verifyUserAccount = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);

        if (!user) return res.status(404).json(notFound("User not found"));

        if (!user.email_verified_at) {
            return res.status(400).json(badRequest("User email is not verified yet"));
        }

        if (user.verified_at !== null) {
            return res.status(400).json(badRequest("User account is already verified"));
        }

        user.verified_at = new Date();
        await user.save();

        let emailSent = false;
        try {
            await sendTemplateEmail(user.email, "Votre comte à été verifier avec succès", "congratulation _verified", {
                username: `${user.lastname} ${user.firstname}`,
                heading: "Verification du compte réussie"
            });
            emailSent = true
        } catch (e) {
            console.error(e.message);
        }

        return res.status(200).json({ ...updated("User account verified successfully", user), emailSent });
    } catch (err) {
        return handleServerError(res, err);
    }
};

export const getUsers = async (req, res) => {
    try {
        const { page, limit, search, role_id, user_status_id } = req.query;
        const offset = (page - 1) * limit;

        const where = { role_id: { [Op.ne]: ROLE_IDS.ROOT } };

        if (search) {
            where[Op.or] = [
                { firstname: { [Op.like]: `%${search}%` } },
                { lastname: { [Op.like]: `%${search}%` } },
                { email: { [Op.like]: `%${search}%` } },
            ];
        }

        if (role_id) {
            where.role_id = Number(role_id) === ROLE_IDS.ROOT ? { [Op.ne]: ROLE_IDS.ROOT } : role_id;
        }
        if (user_status_id) where.user_status_id = user_status_id;

        const { count, rows } = await User.findAndCountAll({
            where,
            include: [
                { model: Role, as: "role", attributes: ["id", "code", "label"] },
                { model: UserStatus, as: "status", attributes: ["id", "code", "label"] },
            ],
            limit: Number(limit),
            offset: Number(offset),
            order: [["createdAt", "DESC"]],
            distinct: true,
        });

        return res.status(200).json(paginated("Users retrieved successfully", rows, {
            page: Number(page),
            limit: Number(limit),
            total: count,
            totalPages: Math.ceil(count / limit),
        }));
    } catch (err) {
        return handleServerError(res, err);
    }
};

export const getUserById = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id, {
            attributes: { include: ["createdAt"] },
        });

        if (!user) return res.status(404).json(notFound("User not found"));

        return res.status(200).json(success("User retrieved successfully", user));
    } catch (err) {
        return handleServerError(res, err);
    }
};