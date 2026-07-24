import joi from 'joi'
import Joi from "joi"
import { ROLES } from "../../../config/auth/app.js";
import { generateCodeRegex } from "../../shared/helpers/helpers.js";

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
export const userDefaultSchema = joi.object().keys(
    {
        id: Joi.number().integer().optional(),
        firstname: Joi.string().min(3).when('id', {
            is: Joi.exist(),
            then: Joi.optional(),
            otherwise: Joi.required().messages({
                'string.empty': 'Lastname is required',
                'string.base': 'Lastname must be a string',
                'string.min': 'lastname must contain at least {#limit} characters'
            })
        }),
        lastname: Joi.string().min(3).when('id', {
            is: Joi.exist(),
            then: Joi.optional(),
            otherwise: Joi.required().messages({
                'string.empty': 'Last name is required',
                'string.base': 'Last name must be a string',
                'string.min': 'lastname must contain at least {#limit} characters'
            })
        }),
        email: Joi.string().email().when('id', {
            is: Joi.exist(),
            then: Joi.optional(),
            otherwise: Joi.required()
        }),
        gender: Joi.string().valid('M', 'F').optional(),
        profile: Joi.number().integer().optional(),
        password: Joi.string().regex(passwordRegex).when('id', {
            is: Joi.exist(),
            then: Joi.optional(),
            otherwise: Joi.required()
        }),
        confirmPassword: Joi.string().when('password', {
            is: Joi.exist(),
            then: Joi.valid(Joi.ref('password')).required().messages({
                'any.only': 'Password and confirmation must match',
                'string.base': 'Confirmation must be a string'
            }),
            otherwise: Joi.optional()
        })
    }
).options({ stripUnknown: true })

export const sendCodeResetSchema = joi.object().keys(
    {
        email: Joi.string().email().required()
    }).options({ stripUnknown: true })

export const resetPasswordSchema = (length = 6) => {
    return joi.object().keys(
        {
            email: joi.string().email().required(),
            code: Joi.string().regex(generateCodeRegex(length)).required(),
            password: joi.string().pattern(passwordRegex).required(),
            confirmPassword: joi.any().equal(joi.ref("password")).required().messages({
                "any.only": "Les mots de passe doivent être identiques !"
            })
        }).options({ stripUnknown: true })
}

export const createUserSchema = joi.object().keys(
    {
        firstname: Joi.string().min(3).required(),
        lastname: Joi.string().min(3).required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(8).when('id', {
            is: Joi.exist(),
            then: Joi.optional(),
            otherwise: Joi.required()
        }),
        roles: Joi.array().items(Joi.string().valid(...Object.values(ROLES))).min(1).required().messages({
            'array.base': 'Roles must be an array',
            'array.includesSingle': 'Roles must contain only valid role names',
            'array.includesUnknown': 'Roles must contain only valid role names',
            'array.min': 'Roles must contain at least {#limit} role names',
            'string.empty': 'Role names cannot be empty',
            'string.base': 'Role names must be strings',
            'any.only': 'Roles must contain only valid role names'
        })
    }).options({ stripUnknown: true })

export const loginSchema = joi.object().keys(
    {
        email: Joi.string().email().required().messages({
            'string.empty': 'Email is required',
            'string.email': 'Email must be a valid email.ejs address',
            'string.base': 'Email must be a string'
        }),
        password: Joi.string().regex(passwordRegex).required().messages({
            'string.empty': 'Password is required',
            'string.base': 'Password must be a string',
            'string.pattern.base': 'Password must contain at least one lowercase letter, one uppercase letter, one digit, and be at least 8 characters long',
        })
    }).options({ stripUnknown: true })

export const validatedCodeSchema = (length = 6) => {
    return joi.object().keys(
        {
            code: joi.string().regex(generateCodeRegex(length)).required()
        }
    )
}