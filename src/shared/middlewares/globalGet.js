export default function globalGet(req, res, next) {
    if (`${req.method}`.toUpperCase() === 'GET') {
        const page = req.query.page || 1
        req.page = parseInt(page)
    }
    next()
}