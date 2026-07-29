import { Op } from "sequelize";
import { Announcement, Media, MediaType, City, PropertyType, User } from "../../database/models/index.js";
import ANNOUNCEMENT_STATUS from "./announcementStatus.js";
import MEDIA_TYPE_CODES from "../media/mediaType.js";
import { verifyToken } from "../auth/jwt.js";
import { sendTemplateEmail } from "../../shared/helpers/sendMail.js";
import {
    success,
    created,
    updated,
    deleted,
    notFound,
    forbidden,
    paginated,
} from "../../shared/helpers/response.helpers.js";

const handleServerError = (res, err) => {
    console.error(err);
    return res
        .status(500)
        .json({ status: "error", message: process.env.NODE_ENV === "production" ? "Internal server error" : err.message });
};

const announcementsInclude = [
    { model: City, as: "City", attributes: ["id", "name"] },
    { model: PropertyType, as: "PropertyType", attributes: ["id", "code", "label"] },
    {
        model: Media,
        as: "Media",
        where: { mediable_type: "Announcement" },
        required: false,
        include: [{ model: MediaType, as: "MediaType", attributes: ["id", "code", "label"] }],
    },
];

export const getAll = async (req, res) => {
    try {
        const { minPrice, maxPrice, property_type_id, city_id, furnished, minRooms, maxRooms, page, limit, sort } = req.query;

        const where = { status_id: ANNOUNCEMENT_STATUS.ACTIVE };

        if (minPrice || maxPrice) {
            where.price = {};
            if (minPrice) where.price[Op.gte] = minPrice;
            if (maxPrice) where.price[Op.lte] = maxPrice;
        }
        if (property_type_id) where.property_type_id = property_type_id;
        if (city_id) where.city_id = city_id;
        if (furnished !== undefined) where.furnished = furnished === "true" || furnished === true;
        if (minRooms || maxRooms) {
            where.rooms = {};
            if (minRooms) where.rooms[Op.gte] = minRooms;
            if (maxRooms) where.rooms[Op.lte] = maxRooms;
        }

        let order;
        switch (sort) {
            case "price_asc": order = [["price", "ASC"]]; break;
            case "price_desc": order = [["price", "DESC"]]; break;
            case "oldest": order = [["createdAt", "ASC"]]; break;
            case "newest":
            default: order = [["createdAt", "DESC"]]; break;
        }

        const offset = (page - 1) * limit;

        const { count, rows } = await Announcement.findAndCountAll({
            where,
            include: announcementsInclude,
            order,
            limit: Number(limit),
            offset: Number(offset),
            distinct: true,
        });

        return res.status(200).json(paginated("Announcements retrieved successfully", rows, {
            page: Number(page),
            limit: Number(limit),
            total: count,
            totalPages: Math.ceil(count / limit),
        }));
    } catch (err) {
        return handleServerError(res, err);
    }
};

function getOptionalUser(req) {
    const authHeader = req.headers["authorization"];
    if (!authHeader || typeof authHeader !== "string") return null;
    const [bearer, token, ...others] = authHeader.split(" ");
    if (bearer.toLowerCase() !== "bearer" || !token || others.length > 0) return null;
    try {
        return verifyToken(token);
    } catch {
        return null;
    }
}

export const getById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = getOptionalUser(req);

        const where = { id };

        if (!user) {
            where.status_id = ANNOUNCEMENT_STATUS.ACTIVE;
        }

        const announcement = await Announcement.findOne({
            where,
            include: announcementsInclude,
            paranoid: true,
        });

        if (!announcement) return res.status(404).json(notFound("Announcement not found"));

        if (user && announcement.user_id === user.id) {
            return res.status(200).json(success("Announcement retrieved successfully", announcement));
        }

        if (announcement.status_id !== ANNOUNCEMENT_STATUS.ACTIVE) {
            return res.status(404).json(notFound("Announcement not found"));
        }

        return res.status(200).json(success("Announcement retrieved successfully", announcement));
    } catch (err) {
        return handleServerError(res, err);
    }
};

export const getMyAnnouncements = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const offset = (page - 1) * limit;

        const { count, rows } = await Announcement.findAndCountAll({
            where: { user_id: req.user.id },
            include: announcementsInclude,
            order: [["createdAt", "DESC"]],
            limit,
            offset,
            distinct: true,
            paranoid: false,
        });

        return res.status(200).json(paginated("Announcements retrieved successfully", rows, {
            page,
            limit,
            total: count,
            totalPages: Math.ceil(count / limit),
        }));
    } catch (err) {
        return handleServerError(res, err);
    }
};

export const create = async (req, res) => {
    try {
        const body = {
            ...req.body,
            user_id: req.user.id,
            status_id: ANNOUNCEMENT_STATUS.PENDING_REVIEW,
        };

        const announcement = await Announcement.create(body);

        if (req.files && req.files.length > 0) {
            const mediaType = await MediaType.findOne({ where: { code: MEDIA_TYPE_CODES.ANNOUNCEMENT_IMAGE } });
            const mediaItems = req.files.map((file, index) => ({
                media_type_id: mediaType.id,
                url: file.path.replace(/\\/g, "/"),
                filename: file.originalname,
                mime_type: file.mimetype,
                file_size: file.size,
                is_primary: index === 0,
                mediable_id: announcement.id,
                mediable_type: "Announcement",
            }));
            await Media.bulkCreate(mediaItems);
        }

        const result = await Announcement.findByPk(announcement.id, {
            include: { model: Media, as: "Media", where: { mediable_type: "Announcement" }, required: false },
        });

        try {
            const owner = await User.findByPk(req.user.id, { attributes: ["email", "lastname", "firstname"] });
            if (owner) {
                await sendTemplateEmail(owner.email, "Annonce soumise avec succès", "announcementCreated", {
                    username: `${owner.lastname} ${owner.firstname}`,
                    announcementTitle: announcement.title,
                });
            }
        } catch (e) {
            console.error(e.message);
        }

        return res.status(201).json(created("Announcement created successfully", result));
    } catch (err) {
        return handleServerError(res, err);
    }
};

export const update = async (req, res) => {
    try {
        const announcement = req.announcement;

        await Announcement.update(req.body, { where: { id: announcement.id } });

        const result = await Announcement.findByPk(announcement.id, {
            include: announcementsInclude,
            paranoid: false,
        });

        return res.status(200).json(updated("Announcement updated successfully", result));
    } catch (err) {
        return handleServerError(res, err);
    }
};

export const delete_ = async (req, res) => {
    try {
        const announcement = req.announcement;

        await Announcement.destroy({ where: { id: announcement.id } });

        return res.status(200).json(deleted("Announcement deleted successfully"));
    } catch (err) {
        return handleServerError(res, err);
    }
};

export const uploadImages = async (req, res) => {
    try {
        const announcement = req.announcement;

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ status: "fail", message: "No files provided" });
        }

        const existingMediaCount = await Media.count({ where: { mediable_id: announcement.id, mediable_type: "Announcement" } });
        const mediaType = await MediaType.findOne({ where: { code: MEDIA_TYPE_CODES.ANNOUNCEMENT_IMAGE } });

        const mediaItems = req.files.map((file, index) => ({
            media_type_id: mediaType.id,
            url: file.path.replace(/\\/g, "/"),
            filename: file.originalname,
            mime_type: file.mimetype,
            file_size: file.size,
            is_primary: existingMediaCount === 0 && index === 0,
            mediable_id: announcement.id,
            mediable_type: "Announcement",
        }));

        const createdMedia = await Media.bulkCreate(mediaItems);

        return res.status(201).json(created("Files uploaded successfully", createdMedia));
    } catch (err) {
        return handleServerError(res, err);
    }
};

export const deleteImage = async (req, res) => {
    try {
        const { imageId } = req.params;

        const media = await Media.findOne({
            where: { id: imageId, mediable_type: "Announcement" },
            include: {
                model: Announcement,
                attributes: ["id", "user_id"],
            },
        });

        if (!media) return res.status(404).json(notFound("Media not found"));

        if (media.Announcement.user_id !== req.user.id) return res.status(403).json(forbidden());

        await media.destroy();

        return res.status(200).json(deleted("File deleted successfully"));
    } catch (err) {
        return handleServerError(res, err);
    }
};

export const getPending = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const offset = (page - 1) * limit;

        const { count, rows } = await Announcement.findAndCountAll({
            where: { status_id: ANNOUNCEMENT_STATUS.PENDING_REVIEW },
            include: announcementsInclude,
            order: [["createdAt", "ASC"]],
            limit,
            offset,
            distinct: true,
            paranoid: false,
        });

        return res.status(200).json(paginated("Pending announcements retrieved successfully", rows, {
            page,
            limit,
            total: count,
            totalPages: Math.ceil(count / limit),
        }));
    } catch (err) {
        return handleServerError(res, err);
    }
};

export const approve = async (req, res) => {
    try {
        const { id } = req.params;

        const announcement = await Announcement.findByPk(id, { paranoid: false });

        if (!announcement) return res.status(404).json(notFound("Announcement not found"));

        if (announcement.status_id !== ANNOUNCEMENT_STATUS.PENDING_REVIEW) {
            return res.status(400).json({ status: "fail", message: "Announcement is not in pending review status" });
        }

        await announcement.update({ status_id: ANNOUNCEMENT_STATUS.ACTIVE });

        try {
            const owner = await User.findByPk(announcement.user_id, { attributes: ["email", "lastname", "firstname"] });
            if (owner) {
                await sendTemplateEmail(owner.email, "Annonce approuvée", "announcementApproved", {
                    username: `${owner.lastname} ${owner.firstname}`,
                    announcementTitle: announcement.title,
                });
            }
        } catch (e) {
            console.error(e.message);
        }

        return res.status(200).json(success("Announcement approved successfully", announcement));
    } catch (err) {
        return handleServerError(res, err);
    }
};

export const reject = async (req, res) => {
    try {
        const { id } = req.params;

        const announcement = await Announcement.findByPk(id, { paranoid: false });

        if (!announcement) return res.status(404).json(notFound("Announcement not found"));

        if (announcement.status_id !== ANNOUNCEMENT_STATUS.PENDING_REVIEW) {
            return res.status(400).json({ status: "fail", message: "Announcement is not in pending review status" });
        }

        await announcement.update({ status_id: ANNOUNCEMENT_STATUS.REJECTED });

        try {
            const owner = await User.findByPk(announcement.user_id, { attributes: ["email", "lastname", "firstname"] });
            if (owner) {
                await sendTemplateEmail(owner.email, "Annonce non retenue", "announcementRejected", {
                    username: `${owner.lastname} ${owner.firstname}`,
                    announcementTitle: announcement.title,
                    reason: req.body.reason || "Votre annonce ne respecte pas nos conditions générales d'utilisation.",
                });
            }
        } catch (e) {
            console.error(e.message);
        }

        return res.status(200).json(success("Announcement rejected successfully", announcement));
    } catch (err) {
        return handleServerError(res, err);
    }
};
