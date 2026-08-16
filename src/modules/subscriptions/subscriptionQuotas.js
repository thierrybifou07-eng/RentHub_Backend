import { Op } from "sequelize";
import { SubscriptionPlan, UserSubscription, Announcement } from "../../database/models/index.js";
import ANNOUNCEMENT_STATUS from "../announcements/announcementStatus.js";

const FREE_PLAN_LIMITS = { max_media: 5, max_active_announcements: 5 };

const todayString = () => new Date().toISOString().slice(0, 10);

/**
 * Returns the media / active-announcement limits derived from the user's
 * current non-expired ACTIVE subscription plan, falling back to FREE limits.
 */
export const getUserPlanLimits = async (userId) => {
    const subscription = await UserSubscription.findOne({
        where: {
            user_id: userId,
            status: "ACTIVE",
            [Op.or]: [{ end_date: null }, { end_date: { [Op.gte]: todayString() } }],
        },
        include: [{ model: SubscriptionPlan, attributes: ["features", "priority"] }],
        order: [["createdAt", "DESC"]],
    });
    const features = subscription?.SubscriptionPlan?.features || subscription?.plan?.features || {};
    return {
        max_media: features.max_media ?? FREE_PLAN_LIMITS.max_media,
        max_active_announcements: features.max_active_announcements ?? FREE_PLAN_LIMITS.max_active_announcements,
    };
};

/**
 * Counts the user's currently active announcements (soft-deleted excluded).
 */
export const countActiveAnnouncements = async (userId) => {
    return Announcement.count({
        where: { user_id: userId, status_id: ANNOUNCEMENT_STATUS.ACTIVE },
    });
};
