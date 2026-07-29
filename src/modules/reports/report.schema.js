import Joi from "joi";

export const createReportSchema = Joi.object({
    announcementId: Joi.number().integer().required().messages({
        "any.required": "Announcement ID is required",
        "number.base": "Announcement ID must be a number",
    }),
    reason: Joi.string().min(10).max(2000).required().messages({
        "any.required": "Reason is required",
        "string.empty": "Reason cannot be empty",
        "string.min": "Reason must be at least 10 characters",
        "string.max": "Reason cannot exceed 2000 characters",
    }),
}).options({ stripUnknown: true });

export const adminNoteSchema = Joi.object({
    adminNote: Joi.string().min(1).max(2000).optional().allow("").messages({
        "string.max": "Note cannot exceed 2000 characters",
    }),
}).options({ stripUnknown: true });

export const reportFilterSchema = Joi.object({
    status_id: Joi.number().integer().valid(1, 2, 3, 4).optional(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
}).options({ stripUnknown: true });
