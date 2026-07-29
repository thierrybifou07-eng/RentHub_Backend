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
import { ROLE_IDS } from "../../../config/auth/app.js";
import { success } from "../../shared/helpers/response.helpers.js";

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
