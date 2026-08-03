import { Router } from "express";
import {
    getStats,
    getEvolution,
    getPendingCounts,
    getRecentActivity,
    manageAnnouncement,
    manageUserStatus,
    manageUserRole,
} from "./admin.controller.js";
import { authenticate } from "../auth/auth.middleware.js";
import { existence, isAdmin } from "./admin.middleware.js";
import validate from "../../shared/middlewares/validate.js";
import { updateUserRoleSchema, updateUserStatusSchema } from "./admin.schema.js";

const router = Router();

router.get("/stats", authenticate, isAdmin, existence, getStats);
router.get("/stats/evolution", authenticate, isAdmin, existence, getEvolution);
router.get("/pending-counts", authenticate, isAdmin, existence, getPendingCounts);
router.get("/recent-activity", authenticate, isAdmin, existence, getRecentActivity);
router.patch("/manage-announcements-status/:id", authenticate, isAdmin, existence, manageAnnouncement);
router.patch("/manage-user-status", authenticate, isAdmin, existence, validate(updateUserStatusSchema), manageUserStatus);
router.patch("/manage-user-role", authenticate, isAdmin, existence, validate(updateUserRoleSchema), manageUserRole);

export default router;
