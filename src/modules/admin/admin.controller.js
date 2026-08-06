import { Op, fn, col } from "sequelize";
import {
    User,
    Announcement,
    Report,
    UserSubscription,
    Favorite,
    Message,
} from "../../database/models/index.js";
import ANNOUNCEMENT_STATUS from "../announcements/announcementStatus.js";
import { ROLE_IDS, ROLE_NAMES } from "../../../config/auth/app.js";
import USER_STATUS from "../auth/userStatus.js";
import { badRequest, fail, forbidden, notFound, paginated, success, unauthorized, updated, validationFail } from "../../shared/helpers/response.helpers.js";
import { sendTemplateEmail } from "../../shared/helpers/sendMail.js";

const handleServerError = (res, err) => {
    console.error(err);
    return res
        .status(500)
        .json({ status: "error", message: process.env.NODE_ENV === "production" ? "Internal server error" : err.message });
};

const thirtyDaysAgo = () => new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

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

        return res.status(200).json(success("Stats retrieved successfully", {
            users: { total: totalUsers, owners: ownersCount, tenants: tenantsCount, newLast30d: newUsers },
            announcements: { total: totalAnnouncements, active: activeAnnouncements, pending: pendingAnnouncements, rejected: rejectedAnnouncements, rented: rentedAnnouncements },
            reports: { total: totalReports, pending: pendingReports },
            subscriptions: { total: totalSubscriptions, pending: pendingSubscriptions, active: activeSubscriptions },
            favorites: { total: totalFavorites },
            messages: { total: totalMessages, unread: unreadMessages },
        }));
    } catch (err) {
        return handleServerError(res, err);
    }
};

export const getEvolution = async (req, res) => {
    try {
        const since = thirtyDaysAgo();

        const [usersByDay, announcementsByDay] = await Promise.all([
            User.findAll({
                attributes: [[fn("DATE", col("createdAt")), "date"], [fn("COUNT", col("id")), "count"]],
                where: { createdAt: { [Op.gte]: since } },
                group: [fn("DATE", col("createdAt"))],
                order: [[fn("DATE", col("createdAt")), "ASC"]],
                raw: true,
            }),
            Announcement.findAll({
                attributes: [[fn("DATE", col("createdAt")), "date"], [fn("COUNT", col("id")), "count"]],
                where: { createdAt: { [Op.gte]: since } },
                group: [fn("DATE", col("createdAt"))],
                order: [[fn("DATE", col("createdAt")), "ASC"]],
                raw: true,
                paranoid: false,
            }),
        ]);

        return res.status(200).json(success("Evolution retrieved successfully", {
            users: usersByDay,
            announcements: announcementsByDay,
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
                include: [{ model: User, as: "user", attributes: ["id", "firstname", "lastname", "email"] }],
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
        const { userId, currentRole, newRole
        } = req.body


        const currentRoleId = Number(getKeyByValue(ROLE_NAMES, currentRole))
        const newRoleId = Number(getKeyByValue(ROLE_NAMES, newRole))

        const userToUpdate = await User.findByPk(userId)

        if (!userToUpdate) return res.status(404).json(notFound())

        if (id === userId) return res.status(401).json({ ...forbidden(), error: "You can't change yourself" })

        if (userToUpdate.role_id === (ROLE_IDS.ADMIN || ROLE_IDS.ROOT)) return res.status(401).json(forbidden())

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

    /**
     * This function is used to find the id of or the role value
     * 
     * @param {Object} obj The object of our roles
     * @param {string} value The value that we have to find the key
     * @returns 
     */
    try {
        const { id } = req.user
        const { userId, currentStatus, newStatus
        } = req.body

        const currentStatusId = USER_STATUS[currentStatus]

        const newStatusId = USER_STATUS[newStatus]

        const userToUpdate = await User.findByPk(userId)

        if (!userToUpdate) return res.status(404).json(notFound())

        if (id === userId) return res.status(401).json({ ...forbidden(), error: "You can't change yourself" })

        if (userToUpdate.user_status_id === USER_STATUS.PENDING_VERIFICATION) return res.status(401).json(unauthorized("The user is not verified yet"))

        if (newStatus === currentStatus) return res.status(400).json(fail('The new status must be different of the last current role'))

        if (userToUpdate.user_status_id !== currentStatusId) return res.status(409).json(validationFail("Invalid credentials"))

        userToUpdate.set({ user_status_id: newStatusId })
        await userToUpdate.save()

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

        const where = {};

        if (search) {
            where[Op.or] = [
                { firstname: { [Op.like]: `%${search}%` } },
                { lastname: { [Op.like]: `%${search}%` } },
                { email: { [Op.like]: `%${search}%` } },
            ];
        }

        if (role_id) where.role_id = role_id;
        if (user_status_id) where.user_status_id = user_status_id;

        const { count, rows } = await User.findAndCountAll({
            where,
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
        const user = await User.findByPk(req.params.id);

        if (!user) return res.status(404).json(notFound("User not found"));

        return res.status(200).json(success("User retrieved successfully", user));
    } catch (err) {
        return handleServerError(res, err);
    }
};