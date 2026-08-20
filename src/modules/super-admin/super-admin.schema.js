import Joi from "joi";
import { ROLES } from "../../../config/auth/app.js";
import USER_STATUS from "../auth/userStatus.js";

const { ROOT, ...adminAccessibleRoles } = ROLES;
const roleValues = Object.values(adminAccessibleRoles);

const statusKeys = Object.keys(USER_STATUS).filter((k) => k !== "PENDING_VERIFICATION");

export const auditLogsFilterSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  actor_id: Joi.number().integer().optional(),
  action: Joi.string().max(50).optional(),
  target_type: Joi.string().max(50).optional(),
  date_from: Joi.date().iso().optional(),
  date_to: Joi.date().iso().optional(),
}).options({ stripUnknown: true });

export const superAdminUsersFilterSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  search: Joi.string().max(255).optional(),
  role_id: Joi.number().integer().optional(),
  user_status_id: Joi.number().integer().optional(),
}).options({ stripUnknown: true });

export const changeUserRoleSchema = Joi.object({
  newRoleId: Joi.number().integer().required().messages({
    "number.base": "newRoleId is required",
    "any.required": "newRoleId is required",
  }),
}).options({ stripUnknown: true });

export const changeUserStatusSchema = Joi.object({
  newStatusId: Joi.number().integer().valid(...Object.values(USER_STATUS)).required().messages({
    "any.only": "newStatusId must be one of: " + Object.values(USER_STATUS).join(", "),
    "any.required": "newStatusId is required",
  }),
}).options({ stripUnknown: true });
