import jwt from "jsonwebtoken"

const secret = process.env.JWT_SECRET

/**
 * @returns {string}
 * */
export function generateToken(user) {
    return jwt.sign(user, secret, { expiresIn: process.env.JWT_EXPIRES_IN })
}

export function verifyToken(token) {
    return jwt.verify(token, secret);
}