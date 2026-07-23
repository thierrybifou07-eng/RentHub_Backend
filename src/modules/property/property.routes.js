import { Router } from "express";
import { getAppartments, getAppartmentsById } from "./property.controller.js";

const router = Router();

router.get("/appartments", getAppartments);
router.get("/appartments/:id", getAppartmentsById);

export default router;
