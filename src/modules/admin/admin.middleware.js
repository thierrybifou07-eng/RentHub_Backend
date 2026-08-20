import { ROLE_IDS } from "../../../config/auth/app.js";
import { User } from "../../database/models/index.js";
import { forbidden, notFound, unauthorized } from "../../shared/helpers/response.helpers.js";
import USER_STATUS from "../auth/userStatus.js";

export function isAdmin(req, res, next) {
    if (!req.user) return res.status(401).json(unauthorized());

    if (req.user.role !== ROLE_IDS.ADMIN) {
        return res.status(403).json(forbidden());
    }

    next();
}

export async function existence(req, res, next) {
    const { id, userStatus } = req.user
    const user = await User.scope('onlyId').findByPk(id)
    if (!user || userStatus !== USER_STATUS.ACTIVE) return res.status(403).json(forbidden());
    next();
}