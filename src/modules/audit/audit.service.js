import { AuditLog } from "../../database/models/index.js";
import { ROLE_NAMES } from "../../../config/auth/app.js";

/**
 * Crée une entrée dans le journal d'audit.
 *
 * @param {object} params
 * @param {object} params.actor        - req.user (payload JWT)
 * @param {string} params.action       - AUDIT_ACTIONS value
 * @param {string} params.targetType   - AUDIT_TARGET_TYPES value
 * @param {number|null} params.targetId - ID de l'objet cible
 * @param {object|null} params.oldValues - État avant modification
 * @param {object|null} params.newValues - État après modification
 * @param {object|null} params.req      - Requête Express (pour IP / UA)
 * @param {object|null} params.metadata  - Données supplémentaires
 */
export async function logAudit({
  actor,
  action,
  targetType,
  targetId = null,
  oldValues = null,
  newValues = null,
  req = null,
  metadata = null,
}) {
  try {
    const roleName = ROLE_NAMES[actor.role] || "UNKNOWN";

    await AuditLog.create({
      actor_id: actor.id || null,
      actor_email: actor.email || "system",
      actor_role: roleName,
      action,
      target_type: targetType,
      target_id: targetId,
      old_values: oldValues,
      new_values: newValues,
      ip_address: req?.ip || null,
      user_agent: req?.headers?.["user-agent"]?.slice(0, 500) || null,
      metadata,
    });
  } catch (err) {
    console.error("[audit] Failed to write audit log:", err.message);
  }
}
