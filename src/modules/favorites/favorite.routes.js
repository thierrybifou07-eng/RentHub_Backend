import { Router } from "express";
import { addFavorite, removeFavorite, getMyFavorites } from "./favorite.controller.js";
import { authenticate } from "../auth/auth.middleware.js";
import { parseIdParam } from "../../shared/middlewares/parseIdParam.js";

const router = Router();

router.get("/", authenticate, getMyFavorites);
router.post("/:id", authenticate, parseIdParam, addFavorite);
router.delete("/:id", authenticate, parseIdParam, removeFavorite);

export default router;
