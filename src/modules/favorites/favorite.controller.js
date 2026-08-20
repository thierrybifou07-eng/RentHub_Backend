import { Op } from "sequelize";
import { Favorite, Announcement, Media, MediaType, User } from "../../database/models/index.js";
import ANNOUNCEMENT_STATUS from "../announcements/announcementStatus.js";
import USER_STATUS from "../auth/userStatus.js";
import { ROLE_IDS } from "../../../config/auth/app.js";
import {
    success,
    created,
    deleted,
    paginated,
    notFound,
    conflict,
    forbidden,
} from "../../shared/helpers/response.helpers.js";

const handleServerError = (res, err) => {
    console.error(err);
    return res
        .status(500)
        .json({ status: "error", message: process.env.NODE_ENV === "production" ? "Internal server error" : err.message });
};

const favoritesInclude = [
    {
        model: Media,
        as: "Media",
        where: { mediable_type: "Announcement" },
        required: false,
        include: [{ model: MediaType, as: "MediaType", attributes: ["id", "code", "label"] }],
    },
];

export const addFavorite = async (req, res) => {
    try {
        const announcementId = req.params.id;
        const userId = req.user.id;

        const announcement = await Announcement.findByPk(announcementId, {
            attributes: ["id", "status_id", "user_id"],
            include: [{ model: User, as: "owner", attributes: ["id", "user_status_id"] }],
            paranoid: false,
        });

        if (!announcement) return res.status(404).json(notFound("Announcement not found"));

        if (req.user.role === ROLE_IDS.TENANT) {
            if (announcement.status_id !== ANNOUNCEMENT_STATUS.ACTIVE) {
                return res.status(403).json(forbidden("Tenants can only favorite active announcements"));
            }
            if (announcement.owner?.user_status_id !== USER_STATUS.ACTIVE) {
                return res.status(403).json(forbidden("Cannot favorite an announcement from an inactive owner"));
            }
        }

        const existing = await Favorite.findOne({ where: { user_id: userId, announcement_id: announcementId } });

        if (existing) return res.status(409).json(conflict("This announcement is already in your favorites"));

        await Favorite.create({ user_id: userId, announcement_id: announcementId });

        return res.status(201).json(created("Announcement added to favorites"));
    } catch (err) {
        return handleServerError(res, err);
    }
};

export const removeFavorite = async (req, res) => {
    try {
        const announcementId = req.params.id;
        const userId = req.user.id;

        const favorite = await Favorite.findOne({ where: { user_id: userId, announcement_id: announcementId } });

        if (!favorite) return res.status(404).json(notFound("Favorite not found"));

        await favorite.destroy();

        return res.status(200).json(deleted("Announcement removed from favorites"));
    } catch (err) {
        return handleServerError(res, err);
    }
};

export const getMyFavorites = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const offset = (page - 1) * limit;

        const { count, rows } = await Favorite.findAndCountAll({
            where: { user_id: req.user.id },
            include: {
                model: Announcement,
                include: [
                    ...favoritesInclude,
                    { model: User, as: "owner", attributes: ["id", "user_status_id"] },
                ],
                paranoid: false,
            },
            order: [["createdAt", "DESC"]],
            limit,
            offset,
        });

        const filtered = rows.filter((fav) => {
            const ann = fav.Announcement;
            if (!ann || ann.deleted_at) return false;
            if (ann.owner && ann.owner.user_status_id !== USER_STATUS.ACTIVE) return false;
            return true;
        });

        // Strip internal owner status from response
        const result = filtered.map((fav) => {
            const json = fav.toJSON();
            if (json.Announcement?.owner) delete json.Announcement.owner;
            return json;
        });

        return res.status(200).json(paginated("Favorites retrieved successfully", result, {
            page,
            limit,
            total: filtered.length,
            totalPages: Math.ceil(filtered.length / limit),
        }));
    } catch (err) {
        return handleServerError(res, err);
    }
};
