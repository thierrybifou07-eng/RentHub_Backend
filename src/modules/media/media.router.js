import { Router } from "express";
import MediaRoutes from "./media.routes.js"
const MediaRouter = Router();

MediaRouter.use("/media", MediaRoutes)

export default MediaRouter;
