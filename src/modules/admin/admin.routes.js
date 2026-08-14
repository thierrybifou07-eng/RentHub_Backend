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
import { authenticate, userHasVerifiedEmail, userIsActive } from "../auth/auth.middleware.js";
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
router.get("/stats", authenticate, userHasVerifiedEmail, userIsActive, isAdmin, existence, getStats);
router.get("/stats/evolution", authenticate, userHasVerifiedEmail, userIsActive, isAdmin, existence, getEvolution);
router.get("/pending-counts", authenticate, userHasVerifiedEmail, userIsActive, isAdmin, existence, getPendingCounts);
router.get("/recent-activity", authenticate, userHasVerifiedEmail, userIsActive, isAdmin, existence, getRecentActivity);

// Announcement management
router.patch("/manage-announcements-status/:id", authenticate, userHasVerifiedEmail, userIsActive, isAdmin, existence, parseIdParam, validate(manageAnnouncementStatusSchema), manageAnnouncement);

// User management
router.patch("/users/:userId/status", authenticate, userHasVerifiedEmail, userIsActive, isAdmin, existence, validate(updateUserStatusSchema), manageUserStatus);
router.patch("/users/:userId/role", authenticate, userHasVerifiedEmail, userIsActive, isAdmin, existence, validate(updateUserRoleSchema), manageUserRole);
router.patch("/users/:userId/verify", authenticate, userHasVerifiedEmail, userIsActive, isAdmin, existence, parseIdParam, verifyUserAccount);

// User listing (Tâche 3)
router.get("/users", authenticate, userHasVerifiedEmail, userIsActive, isAdmin, existence, validate(usersFilterSchema, "query"), getUsers);
router.get("/users/:id", authenticate, userHasVerifiedEmail, userIsActive, isAdmin, existence, parseIdParam, getUserById);

export default router;
