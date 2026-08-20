import { AuditLog } from "../../database/models/index.js";
import { ROLE_NAMES } from "../../../config/auth/app.js";

/**
 * Middleware qui intercepte les réponses 2xx sur les routes admin/root
 * et log automatiquement les requêtes mutate (POST/PATCH/PUT/DELETE).
 *
 * Monté APRÈS les handlers — il intercepte la réponse via res.json().
 */
export function autoAuditLog(targetType) {
  return (req, res, next) => {
    const mutatingMethods = ["POST", "PATCH", "PUT", "DELETE"];
    if (!mutatingMethods.includes(req.method)) return next();

    const originalJson = res.json.bind(res);

    res.json = function (body) {
      res.json = originalJson;

      const status = res.statusCode;
      if (status >= 200 && status < 300 && req.user) {
        const action = inferAction(req.method, req.path);
        if (action) {
          const roleName = ROLE_NAMES[req.user.role] || "UNKNOWN";
          AuditLog.create({
            actor_id: req.user.id || null,
            actor_email: req.user.email || "system",
            actor_role: roleName,
            action,
            target_type: targetType,
            target_id: extractId(req),
            old_values: null,
            new_values: req.body || null,
            ip_address: req.ip || null,
            user_agent: req.headers?.["user-agent"]?.slice(0, 500) || null,
            metadata: { method: req.method, path: req.path },
          }).catch((err) => console.error("[audit-auto] write failed:", err.message));
        }
      }

      return originalJson(body);
    };

    next();
  };
}

function inferAction(method, path) {
  if (method === "DELETE") return "ACCOUNT_DELETE";
  if (path.includes("/role")) return "ROLE_CHANGE";
  if (path.includes("/status")) return "STATUS_CHANGE";
  if (path.includes("/password")) return "PASSWORD_RESET";
  if (path.includes("/verify")) return "ACCOUNT_VERIFY";
  if (path.includes("/moderate") || path.includes("/announcement")) return "ANNOUNCEMENT_MODERATE";
  if (method === "POST") return "CREATE";
  return "UPDATE";
}

function extractId(req) {
  const raw = req.params?.id || req.params?.userId || null;
  return raw ? Number(raw) : null;
}
