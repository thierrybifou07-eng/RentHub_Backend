import { MESSAGES } from "./messages.js";

// ===== Success responses (2xx) =====

export const registered = (message = MESSAGES.AUTH.REGISTERED) => ({
  status: "success",
  message,
});
/**
 * 
 * @param {string} message
 * @param {string} token The new token of the user
 * @returns 
 */
export const verified = (token) => ({
  status: "success",
  message: MESSAGES.AUTH.VERIFIED,
  token
});

export const success = (message = MESSAGES.RES.FOUND, data = null) => ({
  status: "success",
  message,
  data,
});

export const created = (message = MESSAGES.RES.CREATED, data = null) => ({
  status: "success",
  message,
  data,
});

export const updated = (message = MESSAGES.RES.UPDATED, data = null) => ({
  status: "success",
  message,
  data,
});

export const deleted = (message = MESSAGES.RES.DELETED, data = null) => ({
  status: "success",
  message,
  data,
});

export const paginated = (message = MESSAGES.RES.FOUND, data = [], pagination = {}) => ({
  status: "success",
  message,
  data,
  pagination, // e.g: { page, limit, total, totalPages }
});

// ===== Fail responses (4xx — "expected" errors, caused by the client) =====

export const fail = (message, error = null) => ({
  status: "fail",
  message,
  error,
});

export const badRequest = (message = MESSAGES.REQ.BAD, error = null) => ({
  status: "fail",
  message,
  error,
});

export const validationFail = (message = MESSAGES.VAL.FAILED, errors = []) => ({
  status: "fail",
  message,
  errors, // e.g: [{ field: "email", message: "Invalid email" }]
});

export const unauthorized = (message = MESSAGES.AUTH.REQUIRED) => ({
  status: "fail",
  message,
});

export const forbidden = (message = MESSAGES.AUTH.FORBIDDEN) => ({
  status: "fail",
  message,
});

export const notFound = (message = MESSAGES.RES.NOT_FOUND) => ({
  status: "fail",
  message,
});

export const conflict = (message = MESSAGES.RES.CONFLICT) => ({
  status: "fail",
  message,
});

export const methodNotAllowed = (message = MESSAGES.REQ.METHOD) => ({
  status: "fail",
  message,
});

export const tooManyRequests = (message = MESSAGES.REQ.RATE_LIMIT) => ({
  status: "fail",
  message,
});

// ===== Server error responses (5xx — unexpected errors, bugs, exceptions) =====

export const error = (message = MESSAGES.SRV.ERR) => ({
  status: "error",
  message,
});

export const handleServerError = (res, err) => {
  console.error(err);
  return res
    .status(500)
    .json(error(undefined, process.env.NODE_ENV === "production" ? undefined : err.message));
};


export const serviceUnavailable = (message = MESSAGES.SRV.UNAVAILABLE, err = null) => ({
  status: "error",
  message,
  error: err,
});

export const timeout = (message = MESSAGES.SRV.TIMEOUT, err = null) => ({
  status: "error",
  message,
  error: err,
});
