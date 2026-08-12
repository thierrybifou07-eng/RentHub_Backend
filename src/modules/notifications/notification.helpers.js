import { Op } from "sequelize";
import { Notification, User } from "../../database/models/index.js";
import { getIO } from "../../realtime/socket.js";
import { ROLE_IDS } from "../../../config/auth/app.js";

/**
 * Crée une notification en base et l'émet en temps réel
 * (salle "user:{userId}") si le destinataire est connecté.
 *
 * @param {number} userId - destinataire
 * @param {{ type: string, title: string, body?: string|null, data?: object|null, actorId?: number|null }} payload
 */
export async function notify(userId, { type, title, body = null, data = null, actorId = null }) {
    if (!userId) return null;

    try {
        const notification = await Notification.create({
            user_id: userId,
            actor_id: actorId,
            type,
            title,
            body,
            data,
        });

        const io = getIO();
        if (io) {
            io.to(`user:${userId}`).emit("notification:new", notification.toJSON());
        }

        return notification;
    } catch (err) {
        console.error("Failed to create notification:", err.message);
        return null;
    }
}

/**
 * Notifie tous les administrateurs (ADMIN + ROOT) d'un événement de modération.
 */
export async function notifyAdmins(payload) {
    try {
        const admins = await User.findAll({
            where: { role_id: { [Op.in]: [ROLE_IDS.ADMIN, ROLE_IDS.ROOT] } },
            attributes: ["id"],
        });
        for (const admin of admins) {
            await notify(admin.id, payload);
        }
    } catch (err) {
        console.error("Failed to notify admins:", err.message);
    }
}
