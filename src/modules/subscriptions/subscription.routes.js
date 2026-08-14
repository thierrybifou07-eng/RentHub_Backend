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
import { authenticate, userHasVerifiedEmail, userIsActive } from "../auth/auth.middleware.js";
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
import { isAdmin } from "../admin/admin.middleware.js";

const router = Router();

router.get("/plans", getPlans);
router.post("/subscribe", authenticate, userHasVerifiedEmail, userIsActive, validate(subscribeSchema), subscribe);
router.get("/me", authenticate, userHasVerifiedEmail, userIsActive, getMySubscription);
router.get("/history", authenticate, userHasVerifiedEmail, userIsActive, getMyHistory);
router.get("/admin", authenticate, userHasVerifiedEmail, userIsActive, isAdmin, validate(subscriptionFilterSchema, "query"), getAllSubscriptions);
router.get("/admin/:id", authenticate, userHasVerifiedEmail, userIsActive, isAdmin, parseIdParam, getSubscriptionById);
router.patch("/admin/:id/activate", authenticate, userHasVerifiedEmail, userIsActive, isAdmin, parseIdParam, validate(adminNoteSchema), activateSubscription);
router.patch("/admin/:id/reject", authenticate, userHasVerifiedEmail, userIsActive, isAdmin, parseIdParam, validate(adminNoteSchema), rejectSubscription);
router.post("/create-payment-intent", authenticate, userHasVerifiedEmail, userIsActive, validate(createPaymentIntentSchema), createPaymentIntent);
router.post("/confirm-payment", authenticate, userHasVerifiedEmail, userIsActive, validate(confirmPaymentSchema), confirmPayment);

export default router;
