import Joi from "joi";

export const startConversationSchema = Joi.object({
    announcementId: Joi.number().integer().required().messages({
        "any.required": "Announcement ID is required",
        "number.base": "Announcement ID must be a number",
    }),
    content: Joi.string().min(1).max(2000).required().messages({
        "any.required": "Message content is required",
        "string.empty": "Message cannot be empty",
        "string.max": "Message cannot exceed 2000 characters",
    }),
}).options({ stripUnknown: true });

export const sendMessageSchema = Joi.object({
    content: Joi.string().min(1).max(2000).required().messages({
        "any.required": "Message content is required",
        "string.empty": "Message cannot be empty",
        "string.max": "Message cannot exceed 2000 characters",
    }),
}).options({ stripUnknown: true });

export const conversationFilterSchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
}).options({ stripUnknown: true });
