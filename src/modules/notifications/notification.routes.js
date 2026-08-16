import { Router } from "express";
import {
    getMyNotifications,
    getUnreadNotificationCount,
    markNotificationRead,
    markAllNotificationsRead,
    deleteNotification,
    deleteAllNotifications,
} from "./notification.controller.js";
import { authenticate, userHasVerifiedEmail, userIsActive } from "../auth/auth.middleware.js";
import { parseIdParam } from "../../shared/middlewares/parseIdParam.js";

const router = Router();

router.get("/", authenticate, userHasVerifiedEmail, userIsActive, getMyNotifications);
router.get("/unread-count", authenticate, userHasVerifiedEmail, userIsActive, getUnreadNotificationCount);
router.patch("/read-all", authenticate, userHasVerifiedEmail, userIsActive, markAllNotificationsRead);
router.patch("/:id/read", authenticate, userHasVerifiedEmail, userIsActive, parseIdParam, markNotificationRead);
router.delete("/read-all", authenticate, userHasVerifiedEmail, userIsActive, deleteAllNotifications);
router.delete("/:id", authenticate, userHasVerifiedEmail, userIsActive, parseIdParam, deleteNotification);

export default router;
