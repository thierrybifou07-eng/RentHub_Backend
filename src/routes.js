import { Router } from "express";
import propertyRoutes from "./modules/property/property.routes.js";

const router = Router();

router.use("/properties", propertyRoutes);

export default router;
