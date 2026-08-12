import { Notification, User } from "../../database/models/index.js";
import {
    success,
    paginated,
    updated,
    notFound,
} from "../../shared/helpers/response.helpers.js";

const handleServerError = (res, err) => {
    console.error(err);
    return res
        .status(500)
        .json({ status: "error", message: process.env.NODE_ENV === "production" ? "Internal server error" : err.message });
};

export const getMyNotifications = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const offset = (page - 1) * limit;

        const { count, rows } = await Notification.findAndCountAll({
            where: { user_id: req.user.id },
            include: [
                { model: User, as: "actor", attributes: ["id", "firstname", "lastname"] },
            ],
            order: [["createdAt", "DESC"]],
            limit,
            offset,
        });

        return res.status(200).json(paginated("Notifications retrieved successfully", rows, {
            page,
            limit,
            total: count,
            totalPages: Math.ceil(count / limit),
        }));
    } catch (err) {
        return handleServerError(res, err);
    }
};

export const getUnreadNotificationCount = async (req, res) => {
    try {
        const count = await Notification.count({
            where: { user_id: req.user.id, is_read: false },
        });
        return res.status(200).json(success("Unread notification count retrieved", { count }));
    } catch (err) {
        return handleServerError(res, err);
    }
};

export const markNotificationRead = async (req, res) => {
    try {
        const notification = await Notification.findOne({
            where: { id: req.params.id, user_id: req.user.id },
        });

        if (!notification) return res.status(404).json(notFound("Notification not found"));

        await notification.update({ is_read: true, read_at: new Date() });

        return res.status(200).json(updated("Notification marked as read", notification));
    } catch (err) {
        return handleServerError(res, err);
    }
};

export const markAllNotificationsRead = async (req, res) => {
    try {
        const [affectedCount] = await Notification.update(
            { is_read: true, read_at: new Date() },
            { where: { user_id: req.user.id, is_read: false } }
        );

        return res.status(200).json(updated("All notifications marked as read", { count: affectedCount }));
    } catch (err) {
        return handleServerError(res, err);
    }
};
