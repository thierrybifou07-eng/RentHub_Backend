import { Router } from "express";
import catalogRoutes from "./modules/catalog/catalog.routes.js";
import authRoutes from "./modules/auth/auth.routes.js";
import announcementRoutes from "./modules/announcements/announcement.routes.js";
import mediaRoutes from "./modules/media/media.routes.js";
import favoriteRoutes from "./modules/favorites/favorite.routes.js";
import conversationRoutes from "./modules/messaging/messaging.routes.js";
import reportRoutes from "./modules/reports/report.routes.js";
import subscriptionRoutes from "./modules/subscriptions/subscription.routes.js";
import adminRoutes from "./modules/admin/admin.routes.js";

const router = Router();

router.use("/", catalogRoutes)
router.use('/auth', authRoutes)
router.use('/announcements', announcementRoutes)
router.use('/media', mediaRoutes)
router.use('/favorites', favoriteRoutes)
router.use('/conversations', conversationRoutes)
router.use('/reports', reportRoutes)
router.use('/subscriptions', subscriptionRoutes)
router.use('/admin', adminRoutes)

export default router;
