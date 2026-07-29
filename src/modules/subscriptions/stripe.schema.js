import Joi from "joi";

export const createPaymentIntentSchema = Joi.object({
    planId: Joi.number().integer().required().messages({
        "any.required": "Plan ID is required",
        "number.base": "Plan ID must be a number",
    }),
}).options({ stripUnknown: true });

export const confirmPaymentSchema = Joi.object({
    paymentIntentId: Joi.string().pattern(/^pi_/).required().messages({
        "any.required": "Payment Intent ID is required",
        "string.pattern.base": "Invalid Payment Intent ID format",
    }),
}).options({ stripUnknown: true });
