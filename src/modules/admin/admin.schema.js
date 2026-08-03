import Joi from "joi";
import { ROLES } from "../../../config/auth/app.js";
import USER_STATUS from "../auth/userStatus.js";

const { ROOT, ...list } = ROLES
const rolesValues = Object.values(list)

const { PENDING_VERIFICATION, ...statuses } = USER_STATUS
const statusValues = Object.keys(statuses)

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
