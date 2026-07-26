// Centralized, read-only message dictionary (Object.freeze).
// Goal: avoid hardcoded messages scattered across controllers,
// and keep consistent wording throughout the application.

export const MESSAGES = Object.freeze({
  AUTH: Object.freeze({
    REGISTERED: "Your account has been successfully created, please check your email to get the verification code",
    VERIFIED: "Your Email has been successfully verified",
    REQUIRED: "Authentication required",
    INVALID: "Invalid credentials",
    EXPIRED: "Session expired, please log in again",
    FORBIDDEN: "Access denied, insufficient permissions",
  }),

  RES: Object.freeze({
    CREATED: "Resource created successfully",
    UPDATED: "Resource updated successfully",
    DELETED: "Resource deleted successfully",
    FOUND: "Resource retrieved successfully",
    NOT_FOUND: "Resource not found",
    CONFLICT: "This resource already exists",
  }),

  VAL: Object.freeze({
    FAILED: "Validation error",
    REQUIRED: "One or more required fields are missing",
    FORMAT: "Invalid data format",
  }),

  REQ: Object.freeze({
    BAD: "Bad request",
    METHOD: "HTTP method not allowed for this route",
    RATE_LIMIT: "Too many requests, please try again later",
  }),

  SRV: Object.freeze({
    ERR: "Internal server error",
    UNAVAILABLE: "Service temporarily unavailable",
    TIMEOUT: "Request timeout",
  }),
});
