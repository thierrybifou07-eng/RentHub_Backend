import { Router } from "express";
import {
    getAll,
    getById,
    getMyAnnouncements,
    create,
    update,
    delete_,
    uploadImages,
    deleteImage,
    getPending,
    approve,
    reject,
} from "./announcement.controller.js";
import { isOwner, isAdmin } from "./announcement.middleware.js";
import { authenticate } from "../auth/auth.middleware.js";
import { parseIdParam } from "../../shared/middlewares/parseIdParam.js";
import validate from "../../shared/middlewares/validate.js";
import createUpload from "../../../config/media/upload.js";
import MEDIA_TYPE_CODES from "../media/mediaType.js";
import {
    createAnnouncementSchema,
    updateAnnouncementSchema,
    announcementFilterSchema,
} from "./announcement.schema.js";

const router = Router();

let announcementImageUpload;
const getUpload = async () => {
    if (!announcementImageUpload) announcementImageUpload = await createUpload(MEDIA_TYPE_CODES.ANNOUNCEMENT_IMAGE);
    return announcementImageUpload;
};

const mediaUploadMiddleware = async (req, res, next) => {
    const upload = await getUpload();
    upload.array("media", 10)(req, res, (err) => {
        if (err) return res.status(400).json({ status: "fail", message: err.message });
        next();
    });
};

router.get("/", validate(announcementFilterSchema, "query"), getAll);
router.get("/me", authenticate, getMyAnnouncements);
router.get("/admin/pending", authenticate, isAdmin, getPending);
router.put("/admin/:id/approve", authenticate, isAdmin, parseIdParam, approve);
router.put("/admin/:id/reject", authenticate, isAdmin, parseIdParam, reject);
router.get("/:id", parseIdParam, getById);
router.post("/", authenticate, mediaUploadMiddleware, validate(createAnnouncementSchema), create);
router.put("/:id", authenticate, parseIdParam, isOwner, validate(updateAnnouncementSchema), update);
router.delete("/:id", authenticate, parseIdParam, isOwner, delete_);
router.post("/:id/media", authenticate, parseIdParam, isOwner, mediaUploadMiddleware, uploadImages);
router.delete("/:id/media/:imageId", authenticate, parseIdParam, isOwner, deleteImage);

export default router;
