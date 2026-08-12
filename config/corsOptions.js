
const allowedOrigins = (process.env.CORS_ORIGIN || "")
    .split(",")
    .map(origin => origin.trim())
    .filter(Boolean);

export const corsOptions = {
    // En dev (NODE_ENV !== "production") on accepte n'importe quelle origine
    // (test mobile via l'IP du PC). En production, seules les origines
    // listées dans CORS_ORIGIN (séparées par des virgules) sont autorisées.
    origin(origin, callback) {
        const isDev = process.env.NODE_ENV !== "production";
        if (
            !origin ||
            allowedOrigins.includes(origin) ||
            allowedOrigins.includes("*") ||
            isDev
        ) {
            return callback(null, true);
        }
        return callback(null, false);
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 204
}