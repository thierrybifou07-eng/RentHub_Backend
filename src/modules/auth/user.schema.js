import Joi from "joi";
import { ROLES } from "../../../config/auth/app.js";
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
    profile: Joi.number().integer().optional(),
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

/* export const sendRegenerateCodeSchema = Joi.object({
    id: Joi.number().integer().required().messages({
        "number.empty": "Id is required",
        "number.base": "Id must be integrer",
    })

}).options({ stripUnknown: true });
 */
// ===== Password reset flow =====


export const sendCodeResetSchema = Joi.object({
    email: Joi.string().email().required().messages({
        "string.empty": "Email is required",
        "string.email": "Email must be a valid email address",
    }),
}).options({ stripUnknown: true });

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

export const validatedCodeSchema = (length = 6) =>
    Joi.object({
        email: Joi.string().email().required().messages({
            "string.empty": "Email is required",
            "string.email": "Email must be a valid email address",
        }),
        code: Joi.string().regex(generateCodeRegex(length)).required().messages({
            "string.empty": "Code is required",
            "string.pattern.base": `Code must be ${length} characters long`,
        }),
    }).options({ stripUnknown: true });
