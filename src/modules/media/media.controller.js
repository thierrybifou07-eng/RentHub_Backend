import { existsSync, unlinkSync } from "node:fs";
import { Media, MediaType } from "../../database/models/index.js";
import MEDIA_TYPE_CODES from "./mediaType.js";
import {
  success,
  created,
  deleted,
  notFound,
} from "../../shared/helpers/response.helpers.js";

const handleServerError = (res, err) => {
  console.error(err);
  return res
    .status(500)
    .json({ status: "error", message: process.env.NODE_ENV === "production" ? "Internal server error" : err.message });
};

export const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ status: "fail", message: "No file provided" });

    const existingAvatars = await Media.findAll({
      where: { mediable_id: req.user.id, mediable_type: "User" },
    });

    for (const old of existingAvatars) {
      const filePath = old.url;
      if (existsSync(filePath)) {
        try { unlinkSync(filePath); } catch (_) { }
      }
      await old.destroy();
    }

    const mediaType = await MediaType.findOne({ where: { code: MEDIA_TYPE_CODES.USER_AVATAR } });

    const media = await Media.create({
      media_type_id: mediaType.id,
      url: req.file.path.replace(/\\/g, "/"),
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

    const filePath = media.url;
    if (existsSync(filePath)) {
      try { unlinkSync(filePath); } catch (_) { }
    }

    await media.destroy();

    return res.status(200).json(deleted("Avatar deleted successfully"));
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
