import Joi from "joi";
import { ROLES } from "../../../config/auth/app.js";

const { ROOT, ...list } = ROLES

const rolesValues = Object.values(list)

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
    title: Joi.string().min(3).max(255).required().messages({
        "string.empty": "Title is required",
        "string.min": "Title must contain at least {#limit} characters",
    }),
    property_type_id: Joi.number().integer().required().messages({
        "number.base": "Property type is required",
        "any.required": "Property type is required",
    }),
    city_id: Joi.number().integer().required().messages({
        "number.base": "City is required",
        "any.required": "City is required",
    }),
}).options({ stripUnknown: true });
