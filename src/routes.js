import { Router } from "express";
import authRoutes from "./modules/auth/auth.routes.js";
import announcementRoutes from "./modules/announcements/announcement.routes.js";

const router = Router();

router.use('/auth', authRoutes)
router.use('/announcements', announcementRoutes)

export default router;
