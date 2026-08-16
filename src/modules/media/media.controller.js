import { existsSync, unlinkSync } from "node:fs";
import { Media, MediaType, Announcement } from "../../database/models/index.js";
import MEDIA_TYPE_CODES from "./mediaType.js";
import { toPublicUploadUrl, publicUrlToDiskPath } from "../../shared/helpers/helpers.js";
import {
    success,
    created,
    deleted,
    notFound,
    forbidden,
} from "../../shared/helpers/response.helpers.js";
import { ROLE_IDS } from "../../../config/auth/app.js";
import { getUserPlanLimits } from "../subscriptions/subscriptionQuotas.js";

const handleServerError = (res, err) => {
    console.error(err);
    return res
        .status(500)
        .json({ status: "error", message: process.env.NODE_ENV === "production" ? "Internal server error" : err.message });
};

const removeUploadedFiles = (files) => {
    if (!Array.isArray(files)) return;
    for (const file of files) {
        if (file?.path) {
            try {
                if (existsSync(file.path)) unlinkSync(file.path);
            } catch (_) { /* ignore */ }
        }
    }
};

const isAdmin = (user) => user.role === ROLE_IDS.ADMIN || user.role === ROLE_IDS.ROOT;

const isOwnerOf = (media, user) => {
    if (media.mediable_type === "User") return media.mediable_id === user.id;
    return false;
};

export const uploadAvatar = async (req, res) => {

    try {
        if (!req.file) return res.status(400).json({ status: "fail", message: "No file provided" });

        const existingAvatars = await Media.findAll({
            where: { mediable_id: req.user.id, mediable_type: "User" },
        });

        for (const old of existingAvatars) {
            const filePath = publicUrlToDiskPath(old.url);
            if (existsSync(filePath)) {
                try { unlinkSync(filePath); } catch (_) { }
            }
            await old.destroy();
        }

        const mediaType = await MediaType.findOne({ where: { code: MEDIA_TYPE_CODES.USER_AVATAR } });

        const media = await Media.create({
            media_type_id: mediaType.id,
            url: toPublicUploadUrl(req.file.path),
            filename: req.file.originalname,
            mime_type: req.file.mimetype,
            file_size: req.file.size,
            is_primary: true,
            mediable_id: req.user.id,
            mediable_type: "User",
        });

        return res.status(201).json(created("Avatar uploaded successfully", media));
    } catch (err) {
        return handleServerError(res, err);
    }
};

export const deleteAvatar = async (req, res) => {
    try {
        const media = await Media.findOne({
            where: { mediable_id: req.user.id, mediable_type: "User" },
        });

        if (!media) return res.status(404).json(notFound("No avatar found"));

        const filePath = publicUrlToDiskPath(media.url);
        if (existsSync(filePath)) {
            try { unlinkSync(filePath); } catch (_) { }
        }

        await media.destroy();

        return res.status(200).json(deleted("Avatar deleted successfully"));
    } catch (err) {
        return handleServerError(res, err);
    }
};

export const uploadAnnouncementImages = async (req, res) => {
    try {
        const announcement = req.announcement;

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ status: "fail", message: "No files provided" });
        }

        const mediaType = await MediaType.findOne({ where: { code: MEDIA_TYPE_CODES.ANNOUNCEMENT_IMAGE } });

        const existingMediaCount = await Media.count({
            where: { mediable_id: announcement.id, mediable_type: "Announcement", media_type_id: mediaType.id },
        });

        const { max_media: maxMedia } = await getUserPlanLimits(req.user.id);
        if (existingMediaCount + req.files.length > maxMedia) {
            removeUploadedFiles(req.files);
            return res.status(400).json({ status: "fail", message: `Votre plan autorise un maximum de ${maxMedia} photos par annonce.` });
        }

        const mediaItems = req.files.map((file, index) => ({
            media_type_id: mediaType.id,
            url: toPublicUploadUrl(file.path),
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

export const uploadAnnouncementVideos = async (req, res) => {
    try {
        const announcement = req.announcement;

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ status: "fail", message: "No files provided" });
        }

        const mediaType = await MediaType.findOne({ where: { code: MEDIA_TYPE_CODES.ANNOUNCEMENT_VIDEO } });

        const mediaItems = req.files.map((file) => ({
            media_type_id: mediaType.id,
            url: toPublicUploadUrl(file.path),
            filename: file.originalname,
            mime_type: file.mimetype,
            file_size: file.size,
            is_primary: false,
            mediable_id: announcement.id,
            mediable_type: "Announcement",
        }));

        const createdMedia = await Media.bulkCreate(mediaItems);

        return res.status(201).json(created("Videos uploaded successfully", createdMedia));
    } catch (err) {
        return handleServerError(res, err);
    }
};

export const deleteMedia = async (req, res) => {
    try {
        const { id } = req.params;

        const media = await Media.findByPk(id);

        if (!media) return res.status(404).json(notFound("Media not found"));

        if (!isAdmin(req.user)) {
            if (media.mediable_type === "User" && media.mediable_id !== req.user.id) {
                return res.status(403).json(forbidden());
            }

            if (media.mediable_type === "Announcement") {
                const announcement = await Announcement.findByPk(media.mediable_id, {
                    attributes: ["id", "user_id"],
                    paranoid: false,
                });
                if (!announcement || announcement.user_id !== req.user.id) {
                    return res.status(403).json(forbidden());
                }
            }
        }

        const filePath = publicUrlToDiskPath(media.url);
        if (existsSync(filePath)) {
            try { unlinkSync(filePath); } catch (_) { }
        }

        await media.destroy();

        return res.status(200).json(deleted("Media deleted successfully"));
    } catch (err) {
        return handleServerError(res, err);
    }
};

export const getMyMedia = async (req, res) => {
    try {
        const media = await Media.findAll({
            where: { mediable_id: req.user.id },
            include: { model: MediaType, as: "MediaType", attributes: ["id", "code", "label"] },
            order: [["createdAt", "DESC"]],
        });

        return res.status(200).json(success("Media retrieved successfully", media));
    } catch (err) {
        return handleServerError(res, err);
    }
};
