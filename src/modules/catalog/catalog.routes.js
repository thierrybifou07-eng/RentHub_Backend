import { Router } from "express";
import { getCities, getPropertyTypes } from "./catalog.controller.js";

const router = Router();

router.get("/cities", getCities);
router.get("/property-types", getPropertyTypes);

export default router;
