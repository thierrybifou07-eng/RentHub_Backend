import { Router } from "express";
import authRoutes from "./modules/auth/auth.routes.js";
import announcementRoutes from "./modules/announcements/announcement.routes.js";
import mediaRoutes from "./modules/media/media.routes.js";
import favoriteRoutes from "./modules/favorites/favorite.routes.js";

const router = Router();

router.use('/auth', authRoutes)
router.use('/announcements', announcementRoutes)
router.use('/media', mediaRoutes)
router.use('/favorites', favoriteRoutes)

export default router;
