import { verifyToken } from "./jwt.js"

function getRequestToken(req) {
    const authHeader = req.headers['authorization']

    if (!authHeader || typeof authHeader !== "string") return null

    const [bearer, token, ...others] = authHeader.split(' ')

    if (bearer.toLowerCase() !== 'bearer' || !token || others.length > 0) return null

    return token
}

export async function authenticate(req, res, next) {
    const token = getRequestToken(req)

    if (!token) return res.status(401).json('access denied')

    try {
        req.user = verifyToken(token)
        next()
    }
    catch (e) {
        return res.status(401).json('invalid token')
    }
}

export function isGranted(roles = []) {
    return (req, res, next) => {
        const userRoles = req.user.roles

        const granted = userRoles.find(role => roles.find(r => r === role))

        if (!granted) return res.status(401).json('access denied')

        next()
    }
}

export function isGrantedAccess(roles) {
    return (req, res, next) => {

        if (!req.user) return res.status(401).json('UnAuthorized')

        const userRoles = req.user.roles

        const granted = roles.some(role => userRoles.includes(role))

        if (!granted) return res.status(401).json('access denied')

        else next()
    }
}

export function authMiddleware(req, res, next) {

    const token = getRequestToken(req)

    if (token) {
        try {
            req.user = verifyToken(token)
        }
        catch (e) {
            return res.status(401).json('invalid token')
        }
    }

    next()
}