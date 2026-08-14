import { Router } from "express";
import {
    uploadAvatar,
    deleteAvatar,
    uploadAnnouncementImages,
    uploadAnnouncementVideos,
    deleteMedia,
    getMyMedia,
} from "./media.controller.js";
import { authenticate, userHasVerifiedEmail, userIsActive } from "../auth/auth.middleware.js";
import { isOwner as isAnnouncementOwner } from "../announcements/announcement.middleware.js";
import { parseIdParam } from "../../shared/middlewares/parseIdParam.js";
import createUpload from "../../../config/media/upload.js";
import MEDIA_TYPE_CODES from "./mediaType.js";

const router = Router();

router.get("/", authenticate, userHasVerifiedEmail, userIsActive, getMyMedia);

router.post("/avatar", authenticate, userHasVerifiedEmail, userIsActive, async (req, res, next) => {
    const upload = await createUpload(MEDIA_TYPE_CODES.USER_AVATAR, (r) => String(r.user.id));
    upload.single("avatar")(req, res, (err) => {
        if (err) return res.status(400).json({ status: "fail", message: err.message });
        next();
    });
}, uploadAvatar);

router.delete("/avatar", authenticate, userHasVerifiedEmail, userIsActive, deleteAvatar);

router.post("/announcements/:id/images", authenticate, userHasVerifiedEmail, userIsActive, parseIdParam, isAnnouncementOwner, async (req, res, next) => {
    const upload = await createUpload(MEDIA_TYPE_CODES.ANNOUNCEMENT_IMAGE, (r) => String(r.params.id));
    upload.array("images", 10)(req, res, (err) => {
        if (err) return res.status(400).json({ status: "fail", message: err.message });
        next();
    });
}, uploadAnnouncementImages);

router.post("/announcements/:id/videos", authenticate, userHasVerifiedEmail, userIsActive, parseIdParam, isAnnouncementOwner, async (req, res, next) => {
    const upload = await createUpload(MEDIA_TYPE_CODES.ANNOUNCEMENT_VIDEO, (r) => String(r.params.id));
    upload.array("videos", 3)(req, res, (err) => {
        if (err) return res.status(400).json({ status: "fail", message: err.message });
        next();
    });
}, uploadAnnouncementVideos);

router.delete("/:id", authenticate, userHasVerifiedEmail, userIsActive, parseIdParam, deleteMedia);

export default router;
