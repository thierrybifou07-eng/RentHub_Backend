import Joi from "joi";
import { ROLES } from "../../../config/auth/app.js";
import USER_STATUS from "../auth/userStatus.js";
import ANNOUNCEMENT_STATUS from "../announcements/announcementStatus.js";

const { ROOT, ...list } = ROLES
const rolesValues = Object.values(list)

const { PENDING_VERIFICATION, ...statuses } = USER_STATUS
const statusValues = Object.keys(statuses)

// Exclude PENDING_REVIEW — it is a system-only initial state, not an admin target
const { PENDING_REVIEW: _pr, ...announcementStatuses } = ANNOUNCEMENT_STATUS;
const announcementStatusValues = Object.keys(announcementStatuses);

export const updateUserRoleSchema = Joi.object({

    newRole: Joi.string().valid(...rolesValues).required().messages({
        "any.only": 'The newRole must be one of these choices: ' + rolesValues.join(', '),
        "any.required": "newRole is required",
    }),
    currentRole: Joi.string().valid(...rolesValues).required().messages({
        "any.only": 'The currentRole must be one of these choices: ' + rolesValues.join(', '),
        "any.required": "currentRole is required",
    }),
    userId: Joi.number().integer().required().messages({
        "number.base": "userId is required",
        "any.required": "userId is required",
    }),
}).options({ stripUnknown: true });

export const updateUserStatusSchema = Joi.object({

    newStatus: Joi.string().valid(...statusValues).required().messages({
        "any.only": 'The newStatus must be one of these choices: ' + statusValues.join(', '),
        "any.required": "newStatus is required",
    }),
    currentStatus: Joi.string().valid(...statusValues).required().messages({
        "any.only": 'The currentStatus must be one of these choices: ' + statusValues.join(', '),
        "any.required": "currentStatus is required",
    }),
    userId: Joi.number().integer().required().messages({
        "number.base": "userId is required",
        "any.required": "userId is required",
    }),
}).options({ stripUnknown: true });

// ===== Tâche 1 — Manage announcement status =====

export const manageAnnouncementStatusSchema = Joi.object({
    newStatus: Joi.string().valid(...announcementStatusValues).required().messages({
        "any.only": "newStatus must be one of: " + announcementStatusValues.join(", "),
        "any.required": "newStatus is required",
    }),
}).options({ stripUnknown: true });

// ===== Tâche 3 — List/filter users =====

export const usersFilterSchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    search: Joi.string().max(255).optional().messages({
        "string.max": "Search term cannot exceed {#limit} characters",
    }),
    role_id: Joi.number().integer().optional(),
    user_status_id: Joi.number().integer().optional(),
}).options({ stripUnknown: true });
