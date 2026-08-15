import SubscriptionPlan from "../models/subscription-plan.model.js";

const seedSubscriptionPlans = async () => {
    const plans = [
        {
            code: "FREE",
            label: "Gratuit",
            description: "Plan de base sans engagement",
            price: 0,
            duration_days: null,
            priority: 0,
            features: { max_media: 5, max_active_announcements: 5 },
        },
        {
            code: "PREMIUM",
            label: "Premium",
            description: "Visibilité boostée et badge Premium",
            price: 15000,
            duration_days: 30,
            priority: 1,
            features: { badge: true, max_media: 15, max_active_announcements: 25 },
        },
        {
            code: "VIP",
            label: "VIP",
            description: "Visibilité maximale, annonces en tête et badge exclusif",
            price: 30000,
            duration_days: 30,
            priority: 2,
            features: { badge: true, max_media: 50, max_active_announcements: 100, featured: true },
        },
    ];

    for (const plan of plans) {
        const [instance] = await SubscriptionPlan.findOrCreate({ where: { code: plan.code }, defaults: plan });
        await instance.update(plan);
    }
    console.log(`${plans.length} subscription plans seeded successfully.`);
};

export default seedSubscriptionPlans;
