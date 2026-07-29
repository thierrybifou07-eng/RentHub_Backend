import { Router } from "express";
import authRoutes from "./modules/auth/auth.routes.js";
import announcementRoutes from "./modules/announcements/announcement.routes.js";
import mediaRoutes from "./modules/media/media.routes.js";

const router = Router();

router.use('/auth', authRoutes)
router.use('/announcements', announcementRoutes)
router.use('/media', mediaRoutes)

export default router;
