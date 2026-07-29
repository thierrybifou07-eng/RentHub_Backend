import Joi from "joi";

export const createAnnouncementSchema = Joi.object({
    title: Joi.string().min(3).max(255).required().messages({
        "string.empty": "Title is required",
        "string.min": "Title must contain at least {#limit} characters",
    }),
    description: Joi.string().allow("", null).optional(),
    price: Joi.number().positive().precision(2).required().messages({
        "number.base": "Price must be a number",
        "number.positive": "Price must be positive",
        "any.required": "Price is required",
    }),
    surface_area: Joi.number().positive().precision(2).optional().messages({
        "number.positive": "Surface area must be positive",
    }),
    rooms: Joi.number().integer().min(0).optional(),
    bedrooms: Joi.number().integer().min(0).optional(),
    bathrooms: Joi.number().integer().min(0).optional(),
    furnished: Joi.boolean().optional(),
    property_type_id: Joi.number().integer().required().messages({
        "number.base": "Property type is required",
        "any.required": "Property type is required",
    }),
    city_id: Joi.number().integer().required().messages({
        "number.base": "City is required",
        "any.required": "City is required",
    }),
}).options({ stripUnknown: true });

export const updateAnnouncementSchema = Joi.object({
    title: Joi.string().min(3).max(255).optional(),
    description: Joi.string().allow("", null).optional(),
    price: Joi.number().positive().precision(2).optional(),
    surface_area: Joi.number().positive().precision(2).optional(),
    rooms: Joi.number().integer().min(0).optional(),
    bedrooms: Joi.number().integer().min(0).optional(),
    bathrooms: Joi.number().integer().min(0).optional(),
    furnished: Joi.boolean().optional(),
    property_type_id: Joi.number().integer().optional(),
    city_id: Joi.number().integer().optional(),
}).options({ stripUnknown: true });

export const announcementFilterSchema = Joi.object({
    minPrice: Joi.number().positive().optional(),
    maxPrice: Joi.number().positive().optional(),
    property_type_id: Joi.number().integer().optional(),
    city_id: Joi.number().integer().optional(),
    furnished: Joi.boolean().optional(),
    minRooms: Joi.number().integer().min(0).optional(),
    maxRooms: Joi.number().integer().min(0).optional(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    sort: Joi.string().valid("price_asc", "price_desc", "newest", "oldest").default("newest"),
}).options({ stripUnknown: true });
