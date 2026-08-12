import stripe from "../../../config/stripe.js";
import { SubscriptionPlan, UserSubscription, User } from "../../database/models/index.js";
import { sendTemplateEmail } from "../../shared/helpers/sendMail.js";
import { notify } from "../notifications/notification.helpers.js";

const activateSubscription = async (paymentIntent) => {
    const piId = paymentIntent.id;

    const subscription = await UserSubscription.findOne({
        where: { stripe_payment_intent_id: piId },
        include: [{ model: SubscriptionPlan }],
    });

    if (!subscription) {
        console.error(`Webhook: no subscription found for PI ${piId}`);
        return;
    }

    if (subscription.status !== "WAITING_PAYMENT") {
        console.log(`Webhook: subscription ${subscription.id} already processed (${subscription.status})`);
        return;
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
        const user = await User.findByPk(subscription.user_id, { attributes: ["email", "lastname", "firstname"] });
        if (user) {
            await sendTemplateEmail(user.email, "Abonnement activé", "subscriptionActivated", {
                username: `${user.lastname} ${user.firstname}`,
                planLabel: plan.label,
                endDate: endDate.toISOString().slice(0, 10),
                appUrl: process.env.APP_URL || "https://renthub.fr",
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
    });
};

const markPaymentFailed = async (paymentIntent) => {
    const piId = paymentIntent.id;

    const subscription = await UserSubscription.findOne({
        where: { stripe_payment_intent_id: piId, status: "WAITING_PAYMENT" },
    });

    if (subscription) {
        await subscription.update({ status: "FAILED" });
        await notify(subscription.user_id, {
            type: "subscription_failed",
            title: "Paiement de l'abonnement échoué",
            body: "Le paiement de votre abonnement n'a pas pu être finalisé.",
            data: { subscriptionId: subscription.id },
        });
    }
};

export const handleWebhook = async (req, res) => {
    const sig = req.headers["stripe-signature"];

    let event;
    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        console.error("Webhook signature verification failed:", err.message);
        return res.status(400).json({ status: "fail", message: "Invalid signature" });
    }

    switch (event.type) {
        case "payment_intent.succeeded":
            await activateSubscription(event.data.object);
            break;
        case "payment_intent.payment_failed":
            await markPaymentFailed(event.data.object);
            break;
        default:
            console.log(`Webhook: unhandled event type ${event.type}`);
    }

    res.status(200).json({ received: true });
};
