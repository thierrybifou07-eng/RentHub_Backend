import Joi from "joi";

export const subscribeSchema = Joi.object({
    planId: Joi.number().integer().required().messages({
        "any.required": "Plan ID is required",
        "number.base": "Plan ID must be a number",
    }),
    paymentReference: Joi.string().min(1).max(255).optional().allow("").messages({
        "string.max": "Payment reference cannot exceed 255 characters",
    }),
    simulated: Joi.boolean().optional().messages({
        "boolean.base": "simulated must be a boolean",
    }),
}).options({ stripUnknown: true });

export const adminNoteSchema = Joi.object({
    adminNote: Joi.string().min(1).max(2000).optional().allow("").messages({
        "string.max": "Note cannot exceed 2000 characters",
    }),
}).options({ stripUnknown: true });

export const subscriptionFilterSchema = Joi.object({
    status: Joi.string().valid("PENDING", "WAITING_PAYMENT", "ACTIVE", "CANCELLED", "REJECTED", "FAILED", "EXPIRED").optional(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
}).options({ stripUnknown: true });
