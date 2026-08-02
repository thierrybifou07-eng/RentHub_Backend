export default function validate(schema, target = "body") {
    return (req, res, next) => {
        if (target === "body" && req.params.id) req[target].id = req.params.id
        const { error, value } = schema.validate(req[target], {
            abortEarly: true,
            stripUnknown: true
        })

        if (error) {
            return res.status(400).json({
                message: error.details[0].message
            })
        }

        if (target === "query") {
            Object.defineProperty(req, "query", {
                value,
                writable: true,
                configurable: true,
                enumerable: true
            })
        } else {
            req[target] = value
        }

        next()
    }
}