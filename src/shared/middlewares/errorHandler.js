import { ValidationError as SequelizeValidationError, UniqueConstraintError, ForeignKeyConstraintError, DatabaseError } from "sequelize";

const isDev = process.env.NODE_ENV !== "production";

/**
 * Global error-handling middleware (4-argument Express signature).
 * Mount AFTER all routes in server.js.
 *
 * Handles:
 *  - Sequelize errors (validation, unique constraint, FK, generic DB)
 *  - Multer errors
 *  - JWT errors
 *  - Generic catch-all (500)
 *
 * In development the raw error message is included in an `error` field.
 * In production only a safe, generic message is returned.
 */
export default function errorHandler(err, req, res, next) {
    // Already responded — skip
    if (res.headersSent) return next(err);

    let statusCode = err.status || err.statusCode || 500;
    let message = "Internal server error";

    // ── Sequelize: validation (field-level) ──
    if (err instanceof SequelizeValidationError) {
        statusCode = 400;
        message = err.errors[0]?.message || "Validation error";
    }

    // ── Sequelize: unique constraint ──
    else if (err instanceof UniqueConstraintError) {
        statusCode = 409;
        message = "This resource already exists";
    }

    // ── Sequelize: foreign key constraint ──
    else if (err instanceof ForeignKeyConstraintError) {
        statusCode = 400;
        message = "Invalid reference: related resource not found";
    }

    // ── Sequelize: generic database error ──
    else if (err instanceof DatabaseError) {
        statusCode = 500;
        message = "A database error occurred";
    }

    // ── Multer errors (file upload) ──
    else if (err.name === "MulterError" || err.code === "LIMIT_FILE_SIZE" || err.code === "LIMIT_FILE_COUNT") {
        statusCode = 400;
        message = err.message || "File upload error";
    }

    // ── JWT errors ──
    else if (err.name === "TokenExpiredError") {
        statusCode = 401;
        message = "Session expired, please log in again";
    }
    else if (err.name === "JsonWebTokenError" || err.name === "NotBeforeError") {
        statusCode = 401;
        message = "Invalid token";
    }

    // ── Joi validation (if thrown as an error, not via validate middleware) ──
    else if (err.isJoi || err.name === "ValidationError") {
        statusCode = 400;
        message = err.details?.[0]?.message || err.message || "Validation error";
    }

    // ── HTTP errors (e.g. err.status set explicitly by a middleware) ──
    else if (err.status || err.statusCode) {
        message = err.message || message;
    }

    const body = {
        success: false,
        message,
    };

    // In development, attach the raw error for easier debugging
    if (isDev && err.message && message !== err.message) {
        body.error = err.message;
    }

    console.error(`[${req.method}] ${req.originalUrl} — ${statusCode}:`, err.message || err);

    return res.status(statusCode).json(body);
}
