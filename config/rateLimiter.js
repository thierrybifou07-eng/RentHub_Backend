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

export const profileUpdateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: { status: "fail", message: "Trop de modifications de profil, veuillez réessayer plus tard" },
  standardHeaders: true,
  legacyHeaders: false,
});

export const passwordChangeLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 3,
  message: { status: "fail", message: "Trop de changements de mot de passe, veuillez réessayer plus tard" },
  standardHeaders: true,
  legacyHeaders: false,
});

export const avatarLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: { status: "fail", message: "Trop de modifications d'avatar, veuillez réessayer plus tard" },
  standardHeaders: true,
  legacyHeaders: false,
});
