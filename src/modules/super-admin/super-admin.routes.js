import { Router } from "express";
import {
  getAuditLogs,
  getAuditLogById,
  getAuditStats,
  getUsersAllRoles,
  getUserDetail,
  changeUserRole,
  changeUserStatus,
  adminResetPassword,
  softDeleteUser,
} from "./super-admin.controller.js";
import { authenticate, userHasVerifiedEmail, userIsActive } from "../auth/auth.middleware.js";
import { existence, isAdmin } from "../admin/admin.middleware.js";
import { isRoot } from "../admin/isRoot.middleware.js";
import validate from "../../shared/middlewares/validate.js";
import { parseIdParam } from "../../shared/middlewares/parseIdParam.js";
import {
  auditLogsFilterSchema,
  superAdminUsersFilterSchema,
  changeUserRoleSchema,
  changeUserStatusSchema,
} from "./super-admin.schema.js";

const router = Router();

const rootMiddleware = [authenticate, userHasVerifiedEmail, userIsActive, isRoot, existence];

// ── Audit Logs ──────────────────────────────────────────────────
router.get("/audit-logs", ...rootMiddleware, validate(auditLogsFilterSchema, "query"), getAuditLogs);
router.get("/audit-logs/stats", ...rootMiddleware, getAuditStats);
router.get("/audit-logs/:id", ...rootMiddleware, parseIdParam, getAuditLogById);

// ── User Management ─────────────────────────────────────────────
router.get("/users", ...rootMiddleware, validate(superAdminUsersFilterSchema, "query"), getUsersAllRoles);
router.get("/users/:id", ...rootMiddleware, parseIdParam, getUserDetail);
router.patch("/users/:id/role", ...rootMiddleware, parseIdParam, validate(changeUserRoleSchema), changeUserRole);
router.patch("/users/:id/status", ...rootMiddleware, parseIdParam, validate(changeUserStatusSchema), changeUserStatus);
router.patch("/users/:id/password-reset", ...rootMiddleware, parseIdParam, adminResetPassword);
router.delete("/users/:id", ...rootMiddleware, parseIdParam, softDeleteUser);

export default router;
