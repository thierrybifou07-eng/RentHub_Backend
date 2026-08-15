import { Op } from "sequelize";
import { SubscriptionPlan, UserSubscription, User } from "../../database/models/index.js";
import { sendTemplateEmail } from "../../shared/helpers/sendMail.js";
import { notify, notifyAdmins } from "../notifications/notification.helpers.js";
import {
    success,
    created,
    paginated,
    notFound,
    badRequest,
} from "../../shared/helpers/response.helpers.js";
import { ROLE_IDS } from "../../../config/auth/app.js";

const handleServerError = (res, err) => {
    console.error(err);
    return res
        .status(500)
        .json({ status: "error", message: process.env.NODE_ENV === "production" ? "Internal server error" : err.message });
};

export const getPlans = async (req, res) => {
    try {
        const plans = await SubscriptionPlan.findAll({ order: [["priority", "ASC"]] });
        return res.status(200).json(success("Subscription plans retrieved successfully", plans));
    } catch (err) {
        return handleServerError(res, err);
    }
};

export const subscribe = async (req, res) => {
    try {
        const { planId, paymentReference } = req.body;

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
            where: { user_id: req.user.id, status: "PENDING" },
        });
        if (pendingSubscription) {
            return res.status(400).json(badRequest("You already have a pending subscription request"));
        }

        const subscription = await UserSubscription.create({
            user_id: req.user.id,
            plan_id: planId,
            status: "PENDING",
            payment_reference: paymentReference || null,
        });

        await notifyAdmins({
            type: "new_subscription_request",
            title: "Nouvelle demande d'abonnement",
            body: plan.label,
            data: { subscriptionId: subscription.id, planId },
            actorId: req.user.id,
        });

        return res.status(201).json(created("Subscription request submitted successfully", subscription));
    } catch (err) {
        return handleServerError(res, err);
    }
};

export const getMySubscription = async (req, res) => {
    try {
        const subscription = await UserSubscription.findOne({
            where: { user_id: req.user.id },
            include: [{ model: SubscriptionPlan, attributes: ["id", "code", "label", "description", "price", "priority", "duration_days", "features"] }],
            order: [["createdAt", "DESC"]],
        });

        return res.status(200).json(success("Subscription retrieved successfully", subscription));
    } catch (err) {
        return handleServerError(res, err);
    }
};

export const getMyHistory = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const offset = (page - 1) * limit;

        const { count, rows } = await UserSubscription.findAndCountAll({
            where: { user_id: req.user.id },
            include: [{ model: SubscriptionPlan, attributes: ["id", "code", "label", "price"] }],
            order: [["createdAt", "DESC"]],
            limit,
            offset,
            distinct: true,
        });

        return res.status(200).json(paginated("Subscription history retrieved successfully", rows, {
            page,
            limit,
            total: count,
            totalPages: Math.ceil(count / limit),
        }));
    } catch (err) {
        return handleServerError(res, err);
    }
};

export const getAllSubscriptions = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const offset = (page - 1) * limit;

        const where = {};
        if (req.query.status) where.status = req.query.status;

        const { count, rows } = await UserSubscription.findAndCountAll({
            where,
            include: [
                { model: SubscriptionPlan, attributes: ["id", "code", "label", "price"] },
                { model: User, as: "user", attributes: ["id", "firstname", "lastname", "email"] },
            ],
            order: [["createdAt", "DESC"]],
            limit,
            offset,
            distinct: true,
        });

        return res.status(200).json(paginated("Subscriptions retrieved successfully", rows, {
            page,
            limit,
            total: count,
            totalPages: Math.ceil(count / limit),
        }));
    } catch (err) {
        return handleServerError(res, err);
    }
};

export const getSubscriptionById = async (req, res) => {
    try {
        const subscription = await UserSubscription.findByPk(req.params.id, {
            include: [
                { model: SubscriptionPlan, attributes: ["id", "code", "label", "price", "priority", "features"] },
                { model: User, as: "user", attributes: ["id", "firstname", "lastname", "email"] },
            ],
        });

        if (!subscription) return res.status(404).json(notFound("Subscription not found"));

        return res.status(200).json(success("Subscription retrieved successfully", subscription));
    } catch (err) {
        return handleServerError(res, err);
    }
};

export const activateSubscription = async (req, res) => {
    try {
        const subscription = await UserSubscription.findByPk(req.params.id, {
            include: [{ model: SubscriptionPlan }],
        });

        if (!subscription) return res.status(404).json(notFound("Subscription not found"));

        if (subscription.status !== "PENDING") {
            return res.status(400).json(badRequest("Subscription is not in pending status"));
        }

        const plan = subscription.SubscriptionPlan;
        const startDate = new Date();
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + plan.duration_days);

        await subscription.update({
            status: "ACTIVE",
            start_date: startDate.toISOString().slice(0, 10),
            end_date: endDate.toISOString().slice(0, 10),
            admin_note: req.body.adminNote || null,
        });

        try {
            const user = await User.findByPk(subscription.user_id, { attributes: ["email", "lastname", "firstname"] });
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

        await notify(subscription.user_id, {
            type: "subscription_activated",
            title: "Abonnement activé",
            body: `${plan.label} — actif jusqu'au ${endDate.toISOString().slice(0, 10)}`,
            data: { subscriptionId: subscription.id, planId: plan.id },
            actorId: req.user.id,
        });

        return res.status(200).json(success("Subscription activated successfully", subscription));
    } catch (err) {
        return handleServerError(res, err);
    }
};

export const cancelSubscription = async (req, res) => {
    try {
        const subscription = await UserSubscription.findByPk(req.params.id, {
            include: [{ model: SubscriptionPlan }],
        });

        if (!subscription) return res.status(404).json(notFound("Subscription not found"));

        if (subscription.status !== "ACTIVE") {
            return res.status(400).json(badRequest("Only active subscriptions can be cancelled"));
        }

        await subscription.update({
            status: "CANCELLED",
            admin_note: req.body.adminNote || null,
        });

        await notify(subscription.user_id, {
            type: "subscription_rejected",
            title: "Abonnement annulé",
            body: `${subscription.SubscriptionPlan.label} — abonnement annulé`,
            data: { subscriptionId: subscription.id },
            actorId: req.user.id,
        });

        return res.status(200).json(success("Subscription cancelled successfully", subscription));
    } catch (err) {
        return handleServerError(res, err);
    }
};

export const rejectSubscription = async (req, res) => {
    try {
        const subscription = await UserSubscription.findByPk(req.params.id, {
            include: [{ model: SubscriptionPlan }],
        });

        if (!subscription) return res.status(404).json(notFound("Subscription not found"));

        if (subscription.status !== "PENDING") {
            return res.status(400).json(badRequest("Subscription is not in pending status"));
        }

        await subscription.update({
            status: "REJECTED",
            admin_note: req.body.adminNote || null,
        });

        try {
            const user = await User.findByPk(subscription.user_id, { attributes: ["email", "lastname", "firstname"] });
            if (user) {
                await sendTemplateEmail(user.email, "Abonnement non validé", "subscriptionRejected", {
                    username: `${user.lastname} ${user.firstname}`,
                    planLabel: subscription.SubscriptionPlan.label,
                    reason: req.body.adminNote || null,
                    appUrl: process.env.APP_URL || "https://renthub.fr",
                    heading: "Abonnement non validé"
                });
            }
        } catch (e) {
            console.error(e.message);
        }

        await notify(subscription.user_id, {
            type: "subscription_rejected",
            title: "Abonnement non validé",
            body: subscription.SubscriptionPlan.label,
            data: { subscriptionId: subscription.id },
            actorId: req.user.id,
        });

        return res.status(200).json(success("Subscription rejected successfully", subscription));
    } catch (err) {
        return handleServerError(res, err);
    }
};
