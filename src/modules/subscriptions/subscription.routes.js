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
import {
    createPaymentIntentSchema,
    confirmPaymentSchema,
} from "./stripe.schema.js";
import { createPaymentIntent, confirmPayment } from "./stripe.controller.js";

const router = Router();

router.get("/plans", getPlans);
router.post("/subscribe", authenticate, validate(subscribeSchema), subscribe);
router.get("/me", authenticate, getMySubscription);
router.get("/history", authenticate, getMyHistory);
router.get("/admin", authenticate, isAdmin, validate(subscriptionFilterSchema, "query"), getAllSubscriptions);
router.get("/admin/:id", authenticate, isAdmin, parseIdParam, getSubscriptionById);
router.patch("/admin/:id/activate", authenticate, isAdmin, parseIdParam, validate(adminNoteSchema), activateSubscription);
router.patch("/admin/:id/reject", authenticate, isAdmin, parseIdParam, validate(adminNoteSchema), rejectSubscription);
router.post("/create-payment-intent", authenticate, validate(createPaymentIntentSchema), createPaymentIntent);
router.post("/confirm-payment", authenticate, validate(confirmPaymentSchema), confirmPayment);

export default router;
