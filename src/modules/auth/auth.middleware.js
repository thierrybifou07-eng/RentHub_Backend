import { forbidden, unauthorized } from "../../shared/helpers/response.helpers.js"
import { verifyToken } from "./jwt.js"
import USER_STATUS from "./userStatus.js"

function getRequestToken(req) {
    const authHeader = req.headers['authorization']

    if (!authHeader || typeof authHeader !== "string") return null

    const [bearer, token, ...others] = authHeader.split(' ')

    if (bearer.toLowerCase() !== 'bearer' || !token || others.length > 0) return null

    return token
}

export async function authenticate(req, res, next) {
    const token = getRequestToken(req)

    if (!token) return res.status(401).json(unauthorized())

    try {
        req.user = verifyToken(token)
        next()
    }
    catch (e) {
        return res.status(401).json(unauthorized("invalid token"))
    }
}


export async function userHasVerifiedEmail(req, res, next) {
    try {
        if (req.user.emailVerifyAt === null) {
            return res.status(401).json(unauthorized("Verify your email first"))
        } next()
    }
    catch (e) {
        return res.status(401).json(unauthorized("Verify your email first"))
    }
}

export async function userIsActive(req, res, next) {
    try {
        if (req.user.userStatus !== USER_STATUS.ACTIVE) {
            return res.status(401).json(forbidden("Your account is not active"))
        } next()
    }
    catch (e) {
        return res.status(401).json(unauthorized("Verify your email first"))
    }
}