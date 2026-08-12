import { Router } from "express";
import {
    getMyNotifications,
    getUnreadNotificationCount,
    markNotificationRead,
    markAllNotificationsRead,
} from "./notification.controller.js";
import { authenticate } from "../auth/auth.middleware.js";
import { parseIdParam } from "../../shared/middlewares/parseIdParam.js";

const router = Router();

router.get("/", authenticate, getMyNotifications);
router.get("/unread-count", authenticate, getUnreadNotificationCount);
router.patch("/read-all", authenticate, markAllNotificationsRead);
router.patch("/:id/read", authenticate, parseIdParam, markNotificationRead);

export default router;
