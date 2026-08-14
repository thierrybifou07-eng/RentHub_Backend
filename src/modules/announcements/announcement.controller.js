import { Op, Sequelize } from "sequelize";
import { Announcement, Media, MediaType, City, PropertyType, User } from "../../database/models/index.js";
import ANNOUNCEMENT_STATUS from "./announcementStatus.js";
import MEDIA_TYPE_CODES from "../media/mediaType.js";
import { verifyToken } from "../auth/jwt.js";
import { sendTemplateEmail } from "../../shared/helpers/sendMail.js";
import { notify, notifyAdmins } from "../notifications/notification.helpers.js";
import { toPublicUploadUrl } from "../../shared/helpers/helpers.js";
import {
    success,
    created,
    updated,
    deleted,
    notFound,
    paginated,
    badRequest,
    forbidden,
} from "../../shared/helpers/response.helpers.js";

const handleServerError = (res, err) => {
    console.error(err);
    return res
        .status(500)
        .json({ status: "error", message: process.env.NODE_ENV === "production" ? "Internal server error" : err.message });
};

const favoritesCountAttr = [
    Sequelize.literal(`(SELECT COUNT(*) FROM favorites WHERE favorites.announcement_id = Announcement.id)`),
    'favoritesCount'
];

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
        const { minPrice, maxPrice, property_type_id, city_id, furnished, minRooms, maxRooms, search, page, limit, sort } = req.query;

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
        if (search) {
            where.title = { [Op.like]: `%${search}%` };
        }

        const priorityOrder = Sequelize.literal(`(
            SELECT COALESCE(sp.priority, 0)
            FROM user_subscriptions us
            JOIN subscription_plans sp ON sp.id = us.plan_id
            WHERE us.user_id = Announcement.user_id AND us.status = 'ACTIVE'
            LIMIT 1
        )`);

        let sortOrder;
        switch (sort) {
            case "price_asc": sortOrder = [["price", "ASC"]]; break;
            case "price_desc": sortOrder = [["price", "DESC"]]; break;
            case "oldest": sortOrder = [["createdAt", "ASC"]]; break;
            case "newest":
            default: sortOrder = [["createdAt", "DESC"]]; break;
        }

        const order = [[priorityOrder, "DESC"], ...sortOrder];

        const offset = (page - 1) * limit;

        const { count, rows } = await Announcement.findAndCountAll({
            where,
            include: announcementsInclude,
            attributes: { include: [favoritesCountAttr] },
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
            attributes: { include: [favoritesCountAttr] },
            paranoid: true,
        });


        if (!announcement) return res.status(404).json(notFound("Announcement not found"));

        // An announcement that is not ACTIVE is only accessible to its owner
        // (e.g. while it is pending review) so it can be previewed and edited.
        if (announcement.status_id !== ANNOUNCEMENT_STATUS.ACTIVE) {
            const isOwner = user && user.id === announcement.user_id;
            if (!isOwner) {
                return res.status(404).json(notFound("Announcement not found"));
            }
        }
        const owner = await User.scope('forAnnouncementDetails').findByPk(announcement.user_id)
        if (!owner) return res.status(404).json(notFound("Owner not found"));

        /*      if (user && announcement.user_id === (owner.id || user.id)) {
                 return res.status(200).json(success("Announcement retrieved successfully", { announcement, owner }));
             } */
        return res.status(200).json(success("Announcement retrieved successfully", { announcement, owner }));
    } catch (err) {
        return handleServerError(res, err);
    }
};

export const getMyAnnouncements = async (req, res) => {
    try {
        const { page, limit, status_id } = req.query;
        const pageNum = Number(page) || 1;
        const limitNum = Number(limit) || 20;
        const offset = (pageNum - 1) * limitNum;

        const where = { user_id: req.user.id };
        if (status_id) where.status_id = Number(status_id);

        const { count, rows } = await Announcement.findAndCountAll({
            where,
            include: announcementsInclude,
            attributes: { include: [favoritesCountAttr] },
            order: [["createdAt", "DESC"]],
            limit: limitNum,
            offset,
            distinct: true,
            paranoid: false,
        });

        return res.status(200).json(paginated("Announcements retrieved successfully", rows, {
            page: pageNum,
            limit: limitNum,
            total: count,
            totalPages: Math.ceil(count / limitNum),
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
                url: toPublicUploadUrl(file.path),
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
                    heading: "Annonce soumise avec succès"
                });
            }
        } catch (e) {
            console.error(e.message);
        }

        await notifyAdmins({
            type: "new_pending_announcement",
            title: "Nouvelle annonce à modérer",
            body: announcement.title,
            data: { announcementId: announcement.id },
            actorId: req.user.id,
        });

        return res.status(201).json(created("Announcement created successfully", result));
    } catch (err) {
        return handleServerError(res, err);
    }
};

export const update = async (req, res) => {
    try {
        const announcement = req.announcement;

        // Only announcements still under review can be edited. Published (ACTIVE),
        // rented, archived or rejected ones must be deleted/recreated or resubmitted.
        if (announcement.status_id !== ANNOUNCEMENT_STATUS.PENDING_REVIEW) {
            return res.status(400).json(badRequest("Only announcements under review can be edited. Please delete it and create a new one, or resubmit it if applicable."));
        }

        const updateData = { ...req.body };

        await Announcement.update(updateData, { where: { id: announcement.id } });

        const result = await Announcement.findByPk(announcement.id, {
            include: announcementsInclude,
            attributes: { include: [favoritesCountAttr] },
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

/**
 * Owner archives their own ACTIVE or RENTED announcement.
 * An archived announcement is hidden from public listings.
 */
export const archiveAnnouncement = async (req, res) => {
    try {
        const announcement = req.announcement;

        const archivableStatuses = [ANNOUNCEMENT_STATUS.ACTIVE, ANNOUNCEMENT_STATUS.RENTED];
        if (!archivableStatuses.includes(announcement.status_id)) {
            return res.status(400).json(badRequest("Only active or rented announcements can be archived"));
        }

        await Announcement.update(
            { status_id: ANNOUNCEMENT_STATUS.ARCHIVED },
            { where: { id: announcement.id } }
        );

        const result = await Announcement.findByPk(announcement.id, {
            include: announcementsInclude,
            paranoid: false,
        });

        await notify(announcement.user_id, {
            type: "announcement_archived",
            title: "Annonce archivée",
            body: announcement.title,
            data: { announcementId: announcement.id },
            actorId: req.user.id,
        });

        return res.status(200).json(updated("Announcement archived successfully", result));
    } catch (err) {
        return handleServerError(res, err);
    }
};

/**
 * Owner resubmits an ARCHIVED or REJECTED announcement for review.
 * Puts the announcement back in PENDING_REVIEW.
 */
export const resubmitAnnouncement = async (req, res) => {
    try {
        const announcement = req.announcement;

        const resubmittableStatuses = [ANNOUNCEMENT_STATUS.ARCHIVED, ANNOUNCEMENT_STATUS.REJECTED];
        if (!resubmittableStatuses.includes(announcement.status_id)) {
            return res.status(400).json(badRequest("Only archived or rejected announcements can be resubmitted"));
        }

        await Announcement.update(
            { status_id: ANNOUNCEMENT_STATUS.PENDING_REVIEW },
            { where: { id: announcement.id } }
        );

        const result = await Announcement.findByPk(announcement.id, {
            include: announcementsInclude,
            paranoid: false,
        });

        return res.status(200).json(updated("Announcement resubmitted successfully", result));
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
            attributes: { include: [favoritesCountAttr] },
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
            return res.status(400).json(badRequest("Announcement is not in pending review status"));
        }

        await announcement.update({ status_id: ANNOUNCEMENT_STATUS.ACTIVE });

        try {
            const owner = await User.findByPk(announcement.user_id, { attributes: ["email", "lastname", "firstname"] });
            if (owner) {
                await sendTemplateEmail(owner.email, "Annonce approuvée", "announcementApproved", {
                    username: `${owner.lastname} ${owner.firstname}`,
                    announcementTitle: announcement.title,
                    heading: "Annonce approuvée"
                });
            }
        } catch (e) {
            console.error(e.message);
        }

        await notify(announcement.user_id, {
            type: "announcement_approved",
            title: "Annonce approuvée",
            body: announcement.title,
            data: { announcementId: announcement.id },
            actorId: req.user.id,
        });

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
            return res.status(400).json(badRequest("Announcement is not in pending review status"));
        }

        await announcement.update({ status_id: ANNOUNCEMENT_STATUS.REJECTED });

        try {
            const owner = await User.findByPk(announcement.user_id, { attributes: ["email", "lastname", "firstname"] });
            if (owner) {
                await sendTemplateEmail(owner.email, "Annonce non retenue", "announcementRejected", {
                    username: `${owner.lastname} ${owner.firstname}`,
                    announcementTitle: announcement.title,
                    reason: req.body.reason || "Votre annonce ne respecte pas nos conditions générales d'utilisation.",
                    heading: "Annonce non retenue",
                });
            }
        } catch (e) {
            console.error(e.message);
        }

        await notify(announcement.user_id, {
            type: "announcement_rejected",
            title: "Annonce non retenue",
            body: announcement.title,
            data: { announcementId: announcement.id },
            actorId: req.user.id,
        });

        return res.status(200).json(success("Announcement rejected successfully", announcement));
    } catch (err) {
        return handleServerError(res, err);
    }
};
