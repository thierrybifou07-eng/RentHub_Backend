import AuditLog from "../models/audit-log.model.js";
import User from "../models/user.model.js";
import { ROLE_IDS, ROLE_NAMES, AUDIT_ACTIONS, AUDIT_TARGET_TYPES } from "../../../config/auth/app.js";

const SAMPLE_ACTIONS = [
  AUDIT_ACTIONS.ROLE_CHANGE,
  AUDIT_ACTIONS.STATUS_CHANGE,
  AUDIT_ACTIONS.PASSWORD_RESET,
  AUDIT_ACTIONS.ACCOUNT_VERIFY,
  AUDIT_ACTIONS.ANNOUNCEMENT_MODERATE,
  AUDIT_ACTIONS.LOGIN,
]

const TARGET_TYPES = [
  AUDIT_TARGET_TYPES.USER,
  AUDIT_TARGET_TYPES.ANNOUNCEMENT,
  AUDIT_TARGET_TYPES.SUBSCRIPTION,
  AUDIT_TARGET_TYPES.REPORT,
]

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function randomDate(daysBack = 30) {
  const now = Date.now()
  const offset = Math.floor(Math.random() * daysBack * 24 * 60 * 60 * 1000)
  return new Date(now - offset)
}

const seedAuditLogs = async () => {
  const count = await AuditLog.count();
  if (count > 0) {
    console.log("AuditLog table already seeded, skipping...");
    return;
  }

  const users = await User.findAll({ attributes: ["id", "email", "role_id"], paranoid: false });
  if (users.length === 0) {
    console.log("No users found, skipping audit log seeding...");
    return;
  }

  const logs = []

  for (let i = 0; i < 60; i++) {
    const actor = randomItem(users)
    const action = randomItem(SAMPLE_ACTIONS)
    const targetType = randomItem(TARGET_TYPES)
    const targetId = Math.floor(Math.random() * 20) + 1
    const createdAt = randomDate(30)

    const oldValues = action === AUDIT_ACTIONS.ROLE_CHANGE
      ? { role_id: randomItem([1, 4, 5]), role_name: "ROLE_TENANT" }
      : action === AUDIT_ACTIONS.STATUS_CHANGE
        ? { user_status_id: 1 }
        : null

    const newValues = action === AUDIT_ACTIONS.ROLE_CHANGE
      ? { role_id: randomItem([2, 4, 5]), role_name: "ROLE_OWNER" }
      : action === AUDIT_ACTIONS.STATUS_CHANGE
        ? { user_status_id: 3 }
        : action === AUDIT_ACTIONS.PASSWORD_RESET
          ? { reset_by: "root" }
          : null

    logs.push({
      actor_id: actor.id,
      actor_email: actor.email,
      actor_role: ROLE_NAMES[actor.role_id] || "UNKNOWN",
      action,
      target_type: targetType,
      target_id: targetId,
      old_values: oldValues,
      new_values: newValues,
      ip_address: `192.168.1.${Math.floor(Math.random() * 254) + 1}`,
      user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      createdAt,
    })
  }

  await AuditLog.bulkCreate(logs);
  console.log(`${logs.length} audit log entries seeded successfully.`);
};

export default seedAuditLogs;
