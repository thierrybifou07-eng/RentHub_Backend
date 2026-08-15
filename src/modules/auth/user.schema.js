import Joi from "joi";
import { generateCodeRegex } from "../../shared/helpers/helpers.js";

// Requires: 1 lowercase, 1 uppercase, 1 digit, 1 special char (@$!%*?&),
// min 8 characters, and no character repeated 4+ times in a row.
const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])(?!.*(.)\1\1\1)[A-Za-z\d@$!%*?&]{8,}$/;

const passwordPatternMessage =
    "Password must be at least 8 characters long and include at least one lowercase letter, one uppercase letter, one digit, one special character (@$!%*?&), and must not repeat the same character more than 3 times in a row";

// ===== Registration (public sign-up) =====

export const registerSchema = Joi.object({
    firstname: Joi.string().min(3).required().messages({
        "string.empty": "First name is required",
        "string.base": "First name must be a string",
        "string.min": "First name must contain at least {#limit} characters",
    }),
    lastname: Joi.string().min(3).required().messages({
        "string.empty": "Last name is required",
        "string.base": "Last name must be a string",
        "string.min": "Last name must contain at least {#limit} characters",
    }),
    email: Joi.string().email().required().messages({
        "string.empty": "Email is required",
        "string.email": "Email must be a valid email address",
        "string.base": "Email must be a string",
    }),
    phone: Joi.string().min(10).max(20).optional().messages({
        "string.base": "Phone must be a string",
    }),
    gender: Joi.string().valid("M", "F").optional().messages({
        "any.only": "Gender must be either 'M' or 'F'",
    }),
    password: Joi.string().regex(passwordRegex).required().messages({
        "string.empty": "Password is required",
        "string.base": "Password must be a string",
        "string.pattern.base": passwordPatternMessage,
    }),
    confirmPassword: Joi.string().valid(Joi.ref("password")).required().messages({
        "string.empty": "Password confirmation is required",
        "string.base": "Confirmation must be a string",
        "any.only": "Password and confirmation must match",
    }),
    accepted_terms: Joi.boolean().valid(true).required().messages({
        "any.required": "You must accept the Terms of Service",
        "any.only": "You must accept the Terms of Service",
        "boolean.base": "Acceptance of the Terms of Service is required",
    }),
}).options({ stripUnknown: true });

// ===== Update current user profile (authenticated) =====

export const updateProfileSchema = Joi.object({
    firstname: Joi.string().min(3).max(150).optional().messages({
        "string.empty": "First name is required",
        "string.base": "First name must be a string",
        "string.min": "First name must contain at least {#limit} characters",
        "string.max": "First name cannot exceed {#limit} characters",
    }),
    lastname: Joi.string().min(3).max(150).optional().messages({
        "string.empty": "Last name is required",
        "string.base": "Last name must be a string",
        "string.min": "Last name must contain at least {#limit} characters",
        "string.max": "Last name cannot exceed {#limit} characters",
    }),
    phone: Joi.string().min(10).max(20).allow(null).empty("").optional().messages({
        "string.base": "Phone must be a string",
        "string.min": "Phone must contain at least {#limit} characters",
        "string.max": "Phone cannot exceed {#limit} characters",
    }),
    birth_date: Joi.date().iso().allow(null).optional().messages({
        "date.base": "Birth date must be a valid date",
        "date.iso": "Birth date must be a valid ISO date",
    }),
    gender: Joi.string().valid("M", "F").allow(null).optional().messages({
        "any.only": "Gender must be either 'M' or 'F'",
    }),
    address: Joi.string().max(255).allow(null).empty("").optional().messages({
        "string.base": "Address must be a string",
        "string.max": "Address cannot exceed {#limit} characters",
    }),
    city_id: Joi.allow(null).optional().messages({
        "number.base": "City must be a number",
        "number.integer": "City must be a number",
    }),
}).options({ stripUnknown: true });

// ===== Update an existing user (partial update) =====

export const updateUserSchema = Joi.object({
    id: Joi.number().integer().optional(),
    firstname: Joi.string().min(3).optional().messages({
        "string.min": "First name must contain at least {#limit} characters",
    }),
    lastname: Joi.string().min(3).optional().messages({
        "string.min": "Last name must contain at least {#limit} characters",
    }),
    email: Joi.string().email().optional().messages({
        "string.email": "Email must be a valid email address",
    }),
    gender: Joi.string().valid("M", "F").optional(),
    profile: Joi.number().integer().optional(),
    password: Joi.string().regex(passwordRegex).optional().messages({
        "string.pattern.base": passwordPatternMessage,
    }),
    confirmPassword: Joi.string().when("password", {
        is: Joi.exist(),
        then: Joi.valid(Joi.ref("password")).required().messages({
            "any.only": "Password and confirmation must match",
            "string.base": "Confirmation must be a string",
        }),
        otherwise: Joi.optional(),
    }),
}).options({ stripUnknown: true });

// ===== Create a user (admin) =====

export const createUserSchema = Joi.object({
    firstname: Joi.string().min(3).required().messages({
        "string.empty": "First name is required",
        "string.base": "First name must be a string",
        "string.min": "First name must contain at least {#limit} characters",
    }),
    lastname: Joi.string().min(3).required().messages({
        "string.empty": "Last name is required",
        "string.base": "Last name must be a string",
        "string.min": "Last name must contain at least {#limit} characters",
    }),
    email: Joi.string().email().required().messages({
        "string.empty": "Email is required",
        "string.email": "Email must be a valid email address",
    }),
    password: Joi.string().regex(passwordRegex).required().messages({
        "string.empty": "Password is required",
        "string.pattern.base": passwordPatternMessage,
    }),
    /* roles: Joi.array().items(Joi.string().valid(...Object.values(ROLES))).min(1).required().messages({
      'array.base': 'Roles must be an array',
      'array.includesSingle': 'Roles must contain only valid role names',
      'array.includesUnknown': 'Roles must contain only valid role names',
      'array.min': 'Roles must contain at least {#limit} role names',
      'string.empty': 'Role names cannot be empty',
      'string.base': 'Role names must be strings',
      'any.only': 'Roles must contain only valid role names'
    }) */
}).options({ stripUnknown: true });

// ===== Login =====

export const loginSchema = Joi.object({
    email: Joi.string().email().required().messages({
        "string.empty": "Email is required",
        "string.email": "Email must be a valid email address",
        "string.base": "Email must be a string",
    }),
    password: Joi.string().regex(passwordRegex).required().messages({
        "string.empty": "Password is required",
        "string.base": "Password must be a string",
        "string.pattern.base": passwordPatternMessage,
    }),
}).options({ stripUnknown: true });

// ===== Refresh token (rotation) =====

export const refreshTokenSchema = Joi.object({
    refreshToken: Joi.string().required().messages({
        "string.empty": "Refresh token is required",
        "string.base": "Refresh token must be a string",
    }),
}).options({ stripUnknown: true });

// ===== Password reset flow =====

export const resetPasswordSchema = (length = 6) =>
    Joi.object({
        email: Joi.string().email().required().messages({
            "string.empty": "Email is required",
            "string.email": "Email must be a valid email address",
        }),
        code: Joi.string().regex(generateCodeRegex(length)).required().messages({
            "string.empty": "Code is required",
            "string.pattern.base": `Code must be ${length} characters long`,
        }),
        password: Joi.string().regex(passwordRegex).required().messages({
            "string.empty": "Password is required",
            "string.pattern.base": passwordPatternMessage,
        }),
        confirmPassword: Joi.any().equal(Joi.ref("password")).required().messages({
            "any.only": "Password and confirmation must match",
        }),
    }).options({ stripUnknown: true });

export const verifiedEmailSchema = (length = 6) =>
    Joi.object({
        code: Joi.string().regex(generateCodeRegex(length)).required().messages({
            "string.empty": "Code is required",
            "string.pattern.base": `Code must be ${length} characters long`,
        }),
        email: Joi.string().email().required().messages({
            "string.empty": "Email is required",
            "string.email": "Email must be a valid email address",
        }),
    }).options({ stripUnknown: true });

export const validatedEmailSchema =
    Joi.object({
        email: Joi.string().email().required().messages({
            "string.empty": "Email is required",
            "string.email": "Email must be a valid email address",
        }),
    }).options({ stripUnknown: true });

// ===== Change password (authenticated) =====

export const changePasswordSchema = Joi.object({
    currentPassword: Joi.string().required().messages({
        "string.empty": "Current password is required",
        "any.required": "Current password is required",
    }),
    newPassword: Joi.string().regex(passwordRegex).required().messages({
        "string.empty": "New password is required",
        "string.base": "New password must be a string",
        "string.pattern.base": passwordPatternMessage,
    }),
    confirmNewPassword: Joi.string().valid(Joi.ref("newPassword")).required().messages({
        "string.empty": "Password confirmation is required",
        "any.only": "New password and confirmation must match",
    }),
}).options({ stripUnknown: true });

// ===== Delete account (authenticated) =====

export const deleteAccountSchema = Joi.object({
    password: Joi.string().required().messages({
        "string.empty": "Password is required",
        "any.required": "Password is required",
    }),
}).options({ stripUnknown: true });
