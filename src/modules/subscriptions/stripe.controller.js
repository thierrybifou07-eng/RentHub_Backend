import { SubscriptionPlan, UserSubscription, User } from "../../database/models/index.js";
import stripe from "../../../config/stripe.js";
import { sendTemplateEmail } from "../../shared/helpers/sendMail.js";
import {
    success,
    created,
    badRequest,
    notFound,
} from "../../shared/helpers/response.helpers.js";
import { ROLE_IDS } from "../../../config/auth/app.js";

const handleServerError = (res, err) => {
    console.error(err);
    return res
        .status(500)
        .json({ status: "error", message: process.env.NODE_ENV === "production" ? "Internal server error" : err.message });
};

export const createPaymentIntent = async (req, res) => {
    try {
        const { planId } = req.body;

        if (req.user.role !== ROLE_IDS.OWNER && req.user.role !== ROLE_IDS.AGENCY) {
            return res.status(403).json(badRequest("Only owners and agencies can subscribe"));
        }

        const plan = await SubscriptionPlan.findByPk(planId);
        if (!plan) return res.status(404).json(notFound("Plan not found"));

        if (plan.price === 0) {
            return res.status(400).json(badRequest("Cannot subscribe to the free plan"));
        }

        const activeSubscription = await UserSubscription.findOne({
            where: { user_id: req.user.id, status: "ACTIVE" },
        });
        if (activeSubscription) {
            return res.status(400).json(badRequest("You already have an active subscription"));
        }

        const pendingSubscription = await UserSubscription.findOne({
            where: { user_id: req.user.id, status: "WAITING_PAYMENT" },
        });
        if (pendingSubscription) {
            return res.status(400).json(badRequest("You already have a pending payment. Complete or cancel it first"));
        }

        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(parseFloat(plan.price) * 100),
            currency: "eur",
            metadata: { planId: plan.id.toString(), userId: req.user.id.toString() },
        });

        const subscription = await UserSubscription.create({
            user_id: req.user.id,
            plan_id: plan.id,
            status: "WAITING_PAYMENT",
            stripe_payment_intent_id: paymentIntent.id,
        });

        return res.status(201).json(created("Payment intent created", {
            clientSecret: paymentIntent.client_secret,
            subscriptionId: subscription.id,
        }));
    } catch (err) {
        return handleServerError(res, err);
    }
};

export const confirmPayment = async (req, res) => {
    try {
        const { paymentIntentId } = req.body;

        const subscription = await UserSubscription.findOne({
            where: { stripe_payment_intent_id: paymentIntentId, user_id: req.user.id },
            include: [{ model: SubscriptionPlan }],
        });

        if (!subscription) return res.status(404).json(notFound("Subscription not found"));

        if (subscription.status !== "WAITING_PAYMENT") {
            return res.status(400).json(badRequest("Subscription is not waiting for payment"));
        }

        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

        if (paymentIntent.status !== "succeeded") {
            return res.status(400).json(badRequest(`Payment has not succeeded (status: ${paymentIntent.status})`));
        }

        const plan = subscription.SubscriptionPlan;
        const startDate = new Date();
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + plan.duration_days);

        await subscription.update({
            status: "ACTIVE",
            start_date: startDate.toISOString().slice(0, 10),
            end_date: endDate.toISOString().slice(0, 10),
        });

        try {
            const user = await User.findByPk(req.user.id, { attributes: ["email", "lastname", "firstname"] });
            if (user) {
                await sendTemplateEmail(user.email, "Abonnement activé", "subscriptionActivated", {
                    username: `${user.lastname} ${user.firstname}`,
                    planLabel: plan.label,
                    endDate: endDate.toISOString().slice(0, 10),
                    appUrl: process.env.APP_URL || "https://renthub.fr",
                    heading: "Abonnement activé"

                });
            }
        } catch (e) {
            console.error(e.message);
        }

        return res.status(200).json(success("Subscription activated successfully", subscription));
    } catch (err) {
        return handleServerError(res, err);
    }
};
