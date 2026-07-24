export const parseIdParam = (req, res, next) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) res.status(400).send({ error: 'Invalid ID parameter' });

    else {
        req.params.id = id; // Update the id in the request parameters
        next();
    }// Call the next middleware or route handler
}

export function getMiddleware(id) {
    return (req, res, next) => {
        if (req.params.id > id) res.status(400).json({ message: 'invalid param id' })
        next()
    }
}

getMiddleware()
