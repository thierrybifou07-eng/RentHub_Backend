import { Op, fn, col } from "sequelize";
import {
  User,
  Role,
  UserStatus,
  AuditLog,
  Session,
} from "../../database/models/index.js";
import { ROLE_IDS, ROLE_NAMES, AUDIT_ACTIONS, AUDIT_TARGET_TYPES } from "../../../config/auth/app.js";
import USER_STATUS from "../auth/userStatus.js";
import { logAudit } from "../audit/audit.service.js";
import {
  badRequest,
  fail,
  forbidden,
  notFound,
  paginated,
  success,
  updated,
  deleted,
} from "../../shared/helpers/response.helpers.js";
import { sendTemplateEmail } from "../../shared/helpers/sendMail.js";
import { hashPassword } from "../auth/password.js";

const handleServerError = (res, err) => {
  console.error(err);
  return res
    .status(500)
    .json({ status: "error", message: process.env.NODE_ENV === "production" ? "Internal server error" : err.message });
};

// ── Audit Logs ──────────────────────────────────────────────────

export const getAuditLogs = async (req, res) => {
  try {
    const { page, limit, actor_id, action, target_type, date_from, date_to } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (actor_id) where.actor_id = actor_id;
    if (action) where.action = action;
    if (target_type) where.target_type = target_type;
    if (date_from || date_to) {
      where.createdAt = {};
      if (date_from) where.createdAt[Op.gte] = new Date(date_from);
      if (date_to) where.createdAt[Op.lte] = new Date(date_to);
    }

    const { count, rows } = await AuditLog.findAndCountAll({
      where,
      include: [
        { model: User, as: "actor", attributes: ["id", "firstname", "lastname", "email"] },
      ],
      limit: Number(limit),
      offset: Number(offset),
      order: [["createdAt", "DESC"]],
      distinct: true,
    });

    return res.status(200).json(paginated("Audit logs retrieved successfully", rows, {
      page: Number(page),
      limit: Number(limit),
      total: count,
      totalPages: Math.ceil(count / limit),
    }));
  } catch (err) {
    return handleServerError(res, err);
  }
};

export const getAuditLogById = async (req, res) => {
  try {
    const log = await AuditLog.findByPk(req.params.id, {
      include: [
        { model: User, as: "actor", attributes: ["id", "firstname", "lastname", "email"] },
      ],
    });
    if (!log) return res.status(404).json(notFound("Audit log not found"));
    return res.status(200).json(success("Audit log retrieved", log));
  } catch (err) {
    return handleServerError(res, err);
  }
};

export const getAuditStats = async (req, res) => {
  try {
    const [totalLogs, logsByAction, recentActivity] = await Promise.all([
      AuditLog.count(),
      AuditLog.findAll({
        attributes: ["action", [fn("COUNT", col("id")), "count"]],
        group: ["action"],
        raw: true,
      }),
      AuditLog.findAll({
        attributes: ["id", "actor_email", "actor_role", "action", "target_type", "target_id", "createdAt"],
        order: [["createdAt", "DESC"]],
        limit: 10,
        raw: true,
      }),
    ]);

    return res.status(200).json(success("Audit stats retrieved", {
      total: totalLogs,
      byAction: logsByAction.map((r) => ({ action: r.action, count: Number(r.count) })),
      recent: recentActivity,
    }));
  } catch (err) {
    return handleServerError(res, err);
  }
};

// ── User Management (ROOT) ──────────────────────────────────────

export const getUsersAllRoles = async (req, res) => {
  try {
    const { page, limit, search, role_id, user_status_id } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (search) {
      where[Op.or] = [
        { firstname: { [Op.like]: `%${search}%` } },
        { lastname: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
      ];
    }
    if (role_id) where.role_id = role_id;
    if (user_status_id) where.user_status_id = user_status_id;

    const { count, rows } = await User.findAndCountAll({
      where,
      include: [
        { model: Role, as: "role", attributes: ["id", "code", "label"] },
        { model: UserStatus, as: "status", attributes: ["id", "code", "label"] },
      ],
      limit: Number(limit),
      offset: Number(offset),
      order: [["createdAt", "DESC"]],
      distinct: true,
    });

    return res.status(200).json(paginated("Users retrieved successfully", rows, {
      page: Number(page),
      limit: Number(limit),
      total: count,
      totalPages: Math.ceil(count / limit),
    }));
  } catch (err) {
    return handleServerError(res, err);
  }
};

export const getUserDetail = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { include: ["createdAt"] },
    });
    if (!user) return res.status(404).json(notFound("User not found"));
    return res.status(200).json(success("User retrieved", user));
  } catch (err) {
    return handleServerError(res, err);
  }
};

export const changeUserRole = async (req, res) => {
  try {
    const { id: actorId } = req.user;
    const userId = Number(req.params.id);
    const { newRoleId } = req.body;

    if (actorId === userId) {
      return res.status(400).json(fail("You cannot change your own role"));
    }

    const userToUpdate = await User.findByPk(userId);
    if (!userToUpdate) return res.status(404).json(notFound("User not found"));

    if ([ROLE_IDS.ROOT].includes(userToUpdate.role_id)) {
      return res.status(403).json(forbidden("Cannot change the role of a ROOT user"));
    }

    if (![ROLE_IDS.TENANT, ROLE_IDS.OWNER, ROLE_IDS.ADMIN, ROLE_IDS.AGENCY].includes(newRoleId)) {
      return res.status(400).json(badRequest("Invalid target role"));
    }

    if (userToUpdate.role_id === newRoleId) {
      return res.status(400).json(fail("New role must be different from current role"));
    }

    const oldRoleId = userToUpdate.role_id;
    userToUpdate.role_id = newRoleId;
    await userToUpdate.save();

    await logAudit({
      actor: req.user,
      action: AUDIT_ACTIONS.ROLE_CHANGE,
      targetType: AUDIT_TARGET_TYPES.USER,
      targetId: userId,
      oldValues: { role_id: oldRoleId, role_name: ROLE_NAMES[oldRoleId] },
      newValues: { role_id: newRoleId, role_name: ROLE_NAMES[newRoleId] },
      req,
    });

    return res.status(200).json(updated("User role updated successfully"));
  } catch (err) {
    return handleServerError(res, err);
  }
};

export const changeUserStatus = async (req, res) => {
  try {
    const { id: actorId } = req.user;
    const userId = Number(req.params.id);
    const { newStatusId } = req.body;

    if (actorId === userId) {
      return res.status(400).json(fail("You cannot change your own status"));
    }

    const userToUpdate = await User.findByPk(userId);
    if (!userToUpdate) return res.status(404).json(notFound("User not found"));

    if (userToUpdate.role_id === ROLE_IDS.ROOT) {
      return res.status(403).json(forbidden("Cannot change the status of a ROOT user"));
    }

    if (userToUpdate.user_status_id === newStatusId) {
      return res.status(400).json(fail("New status must be different from current status"));
    }

    const oldStatusId = userToUpdate.user_status_id;
    userToUpdate.user_status_id = newStatusId;
    await userToUpdate.save();

    await logAudit({
      actor: req.user,
      action: AUDIT_ACTIONS.STATUS_CHANGE,
      targetType: AUDIT_TARGET_TYPES.USER,
      targetId: userId,
      oldValues: { user_status_id: oldStatusId },
      newValues: { user_status_id: newStatusId },
      req,
    });

    return res.status(200).json(updated("User status updated successfully"));
  } catch (err) {
    return handleServerError(res, err);
  }
};

export const adminResetPassword = async (req, res) => {
  try {
    const userId = Number(req.params.id);
    const user = await User.findByPk(userId);

    if (!user) return res.status(404).json(notFound("User not found"));
    if (user.role_id === ROLE_IDS.ROOT) {
      return res.status(403).json(forbidden("Cannot reset password of a ROOT user"));
    }

    const tempPassword = `Renthub${Date.now().toString(36)}!`;
    user.password = tempPassword;
    await user.save();

    await Session.destroy({ where: { user_id: userId } });

    let emailSent = false;
    try {
      await sendTemplateEmail(user.email, "Réinitialisation de mot de passe par l'administrateur", "resetPasswordSuccess", {
        heading: "Votre mot de passe a été réinitialisé",
        username: `${user.lastname} ${user.firstname}`,
      });
      emailSent = true;
    } catch (e) {
      console.error(e.message);
    }

    await logAudit({
      actor: req.user,
      action: AUDIT_ACTIONS.PASSWORD_RESET,
      targetType: AUDIT_TARGET_TYPES.USER,
      targetId: userId,
      oldValues: null,
      newValues: { reset_by: "root" },
      req,
    });

    return res.status(200).json(updated("Password reset successfully", { tempPassword, emailSent }));
  } catch (err) {
    return handleServerError(res, err);
  }
};

export const softDeleteUser = async (req, res) => {
  try {
    const { id: actorId } = req.user;
    const userId = Number(req.params.id);

    if (actorId === userId) {
      return res.status(400).json(fail("You cannot delete your own account"));
    }

    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json(notFound("User not found"));
    if (user.role_id === ROLE_IDS.ROOT) {
      return res.status(403).json(forbidden("Cannot delete a ROOT user"));
    }

    await Session.destroy({ where: { user_id: userId } });
    await user.destroy();

    await logAudit({
      actor: req.user,
      action: AUDIT_ACTIONS.ACCOUNT_DELETE,
      targetType: AUDIT_TARGET_TYPES.USER,
      targetId: userId,
      oldValues: { email: user.email, role_id: user.role_id },
      newValues: null,
      req,
    });

    return res.status(200).json(deleted("User deleted successfully"));
  } catch (err) {
    return handleServerError(res, err);
  }
};
