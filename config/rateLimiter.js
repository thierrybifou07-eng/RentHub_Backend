import rateLimit from "express-rate-limit";

export const loginLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { status: "fail", message: "Too many login attempts, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});

export const forgotPasswordLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { status: "fail", message: "Too many password reset requests, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});

export const registerLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { status: "fail", message: "Too many registration attempts, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});
