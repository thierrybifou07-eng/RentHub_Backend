import { Announcement } from "../../database/models/index.js";
import { forbidden, unauthorized, notFound } from "../../shared/helpers/response.helpers.js";

export async function isOwner(req, res, next) {
    try {
        const announcement = await Announcement.findByPk(req.params.id, {
            attributes: ["id", "user_id"],
            paranoid: false,
        });

        if (!announcement) return res.status(404).json(notFound("Announcement not found"));

        if (announcement.user_id !== req.user.id) return res.status(403).json(forbidden());

        req.announcement = announcement;
        next();
    } catch (err) {
        return res.status(500).json({ status: "error", message: "Internal server error" });
    }
}

export function isAdmin(req, res, next) {
    if (!req.user) return res.status(401).json(unauthorized());

    const adminRoleId = 2;
    const rootRoleId = 3;

    if (req.user.role !== adminRoleId && req.user.role !== rootRoleId) {
        return res.status(403).json(forbidden());
    }

    next();
}
