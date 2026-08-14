import { Router } from "express";
import { addFavorite, removeFavorite, getMyFavorites } from "./favorite.controller.js";
import { authenticate, userHasVerifiedEmail, userIsActive } from "../auth/auth.middleware.js";
import { parseIdParam } from "../../shared/middlewares/parseIdParam.js";

const router = Router();

router.get("/", authenticate, userHasVerifiedEmail, userIsActive, getMyFavorites);
router.post("/:id", authenticate, userHasVerifiedEmail, userIsActive, parseIdParam, addFavorite);
router.delete("/:id", authenticate, userHasVerifiedEmail, userIsActive, parseIdParam, removeFavorite);

export default router;
