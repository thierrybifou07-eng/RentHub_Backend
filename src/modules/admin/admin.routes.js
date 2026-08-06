import { Router } from "express";
import {
    getStats,
    getEvolution,
    getPendingCounts,
    getRecentActivity,
    manageAnnouncement,
    manageUserStatus,
    manageUserRole,
    verifyUserAccount,
    getUsers,
    getUserById,
} from "./admin.controller.js";
import { authenticate } from "../auth/auth.middleware.js";
import { existence, isAdmin } from "./admin.middleware.js";
import validate from "../../shared/middlewares/validate.js";
import { parseIdParam } from "../../shared/middlewares/parseIdParam.js";
import {
    updateUserRoleSchema,
    updateUserStatusSchema,
    manageAnnouncementStatusSchema,
    usersFilterSchema,
} from "./admin.schema.js";

const router = Router();

// Dashboard
router.get("/stats", authenticate, isAdmin, existence, getStats);
router.get("/stats/evolution", authenticate, isAdmin, existence, getEvolution);
router.get("/pending-counts", authenticate, isAdmin, existence, getPendingCounts);
router.get("/recent-activity", authenticate, isAdmin, existence, getRecentActivity);

// Announcement management
router.patch("/manage-announcements-status/:id", authenticate, isAdmin, existence, parseIdParam, validate(manageAnnouncementStatusSchema), manageAnnouncement);

// User management
router.patch("/manage-user-status", authenticate, isAdmin, existence, validate(updateUserStatusSchema), manageUserStatus);
router.patch("/manage-user-role", authenticate, isAdmin, existence, validate(updateUserRoleSchema), manageUserRole);
router.patch("/verify-user/:id", authenticate, isAdmin, existence, parseIdParam, verifyUserAccount);

// User listing (Tâche 3)
router.get("/users", authenticate, isAdmin, existence, validate(usersFilterSchema, "query"), getUsers);
router.get("/users/:id", authenticate, isAdmin, existence, parseIdParam, getUserById);

export default router;
