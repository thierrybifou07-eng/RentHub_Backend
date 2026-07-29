import { Router } from "express";
import {
    getStats,
    getEvolution,
    getPendingCounts,
    getRecentActivity,
} from "./admin.controller.js";
import { authenticate } from "../auth/auth.middleware.js";
import { isAdmin } from "../announcements/announcement.middleware.js";

const router = Router();

router.get("/stats", authenticate, isAdmin, getStats);
router.get("/stats/evolution", authenticate, isAdmin, getEvolution);
router.get("/pending-counts", authenticate, isAdmin, getPendingCounts);
router.get("/recent-activity", authenticate, isAdmin, getRecentActivity);

export default router;
