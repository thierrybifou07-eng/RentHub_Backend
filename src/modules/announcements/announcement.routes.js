import { Router } from "express";
import {
    getAll,
    getById,
    getMyAnnouncements,
    create,
    update,
    delete_,
    adminDelete,
    archiveAnnouncement,
    resubmitAnnouncement,
    getPending,
    approve,
    reject,
} from "./announcement.controller.js";
import { isOwner } from "./announcement.middleware.js";
import { authenticate, userHasVerifiedEmail, userIsActive } from "../auth/auth.middleware.js";
import { parseIdParam } from "../../shared/middlewares/parseIdParam.js";
import validate from "../../shared/middlewares/validate.js";
import createUpload from "../../../config/media/upload.js";
import MEDIA_TYPE_CODES from "../media/mediaType.js";
import {
    createAnnouncementSchema,
    updateAnnouncementSchema,
    announcementFilterSchema,
    myAnnouncementsFilterSchema,
    rejectAnnouncementSchema,
} from "./announcement.schema.js";
import { isAdmin } from "../admin/admin.middleware.js";

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

// Public listing with filters + search
router.get("/", validate(announcementFilterSchema, "query"), getAll);

// Owner's own announcements (filterable by status_id)
router.get("/me", authenticate, userHasVerifiedEmail, userIsActive, validate(myAnnouncementsFilterSchema, "query"), getMyAnnouncements);

// Admin — pending queue & moderation
router.get("/admin/pending", authenticate, userHasVerifiedEmail, userIsActive, isAdmin, getPending);
router.put("/admin/:id/approve", authenticate, userHasVerifiedEmail, userIsActive, isAdmin, parseIdParam, approve);
router.put("/admin/:id/reject", authenticate, userHasVerifiedEmail, userIsActive, isAdmin, parseIdParam, validate(rejectAnnouncementSchema), reject);
router.delete("/admin/:id", authenticate, userHasVerifiedEmail, userIsActive, isAdmin, parseIdParam, adminDelete);

// Public detail
router.get("/:id", parseIdParam, getById);

// Owner CRUD
router.post("/", authenticate, userHasVerifiedEmail, userIsActive, mediaUploadMiddleware, validate(createAnnouncementSchema), create);
router.put("/:id", authenticate, userHasVerifiedEmail, userIsActive, parseIdParam, isOwner, validate(updateAnnouncementSchema), update);
router.delete("/:id", authenticate, userHasVerifiedEmail, userIsActive, parseIdParam, isOwner, delete_);

// Owner lifecycle actions
router.patch("/:id/archive", authenticate, userHasVerifiedEmail, userIsActive, parseIdParam, isOwner, archiveAnnouncement);
router.patch("/:id/resubmit", authenticate, userHasVerifiedEmail, userIsActive, parseIdParam, isOwner, resubmitAnnouncement);

export default router;
