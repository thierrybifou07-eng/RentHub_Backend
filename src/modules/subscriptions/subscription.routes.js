import { Router } from "express";
import {
    getPlans,
    subscribe,
    getMySubscription,
    getMyHistory,
    getAllSubscriptions,
    getSubscriptionById,
    activateSubscription,
    rejectSubscription,
} from "./subscription.controller.js";
import { authenticate } from "../auth/auth.middleware.js";
import { isAdmin } from "../announcements/announcement.middleware.js";
import { parseIdParam } from "../../shared/middlewares/parseIdParam.js";
import validate from "../../shared/middlewares/validate.js";
import {
    subscribeSchema,
    subscriptionFilterSchema,
    adminNoteSchema,
} from "./subscription.schema.js";

const router = Router();

router.get("/plans", getPlans);
router.post("/subscribe", authenticate, validate(subscribeSchema), subscribe);
router.get("/me", authenticate, getMySubscription);
router.get("/history", authenticate, getMyHistory);
router.get("/admin", authenticate, isAdmin, validate(subscriptionFilterSchema, "query"), getAllSubscriptions);
router.get("/admin/:id", authenticate, isAdmin, parseIdParam, getSubscriptionById);
router.patch("/admin/:id/activate", authenticate, isAdmin, parseIdParam, validate(adminNoteSchema), activateSubscription);
router.patch("/admin/:id/reject", authenticate, isAdmin, parseIdParam, validate(adminNoteSchema), rejectSubscription);

export default router;
