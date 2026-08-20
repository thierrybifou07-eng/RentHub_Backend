import { ROLE_IDS } from "../../../config/auth/app.js";
import { forbidden, unauthorized } from "../../shared/helpers/response.helpers.js";

export function isRoot(req, res, next) {
    if (!req.user) return res.status(401).json(unauthorized());
    if (req.user.role !== ROLE_IDS.ROOT) {
        return res.status(403).json(forbidden());
    }
    next();
}
