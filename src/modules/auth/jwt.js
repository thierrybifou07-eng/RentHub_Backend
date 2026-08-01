import jwt from "jsonwebtoken"
import { ROLES, ROLE_NAMES } from "../../../config/auth/app.js"

const secret = process.env.JWT_SECRET

/**
 * Construit le payload du token d'accès avec toutes les informations
 * nécessaires pour identifier l'utilisateur côté frontend.
 * @param {import("sequelize").Model} user
 * @returns {object}
 */
export function buildTokenPayload(user) {
    return {
        id: user.id,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        phone: user.phone,
        role: user.role_id,
        roleName: ROLE_NAMES[user.role_id] || ROLES.USER,
        userStatus: user.user_status_id,
        emailVerifyAt: user.email_verified_at,
        cityId: user.city_id,
    };
}

/**
 * @returns {string}
 * */
export function generateToken(user) {
    return jwt.sign(user, secret, { expiresIn: process.env.JWT_EXPIRES_IN })
}

export function verifyToken(token) {
    return jwt.verify(token, secret);
}
