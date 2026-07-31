import express from "express";
import {
    forgotPassword,
    login,
    refresh,
    register,
    resetPassword,
    verifyEmail,
    getCurrentUser,
    regenerateCode,
    logout
} from "./auth.controller.js";
import { authenticate } from "./auth.middleware.js";
import validate from "../../shared/middlewares/validate.js";
import { loginSchema, registerSchema, resetPasswordSchema, validatedEmailSchema, verifiedEmailSchema } from "./user.schema.js";
const authRoutes = express.Router();

authRoutes.post("/register", validate(registerSchema), register)
authRoutes.post("/login", validate(loginSchema), login)
authRoutes.post("/refresh", authenticate, refresh)
authRoutes.post("/logout", authenticate, logout)
authRoutes.post("/forgot-password", validate(validatedEmailSchema), forgotPassword)
authRoutes.post("/reset-password", validate(resetPasswordSchema()), resetPassword)
authRoutes.post("/verify-email", authenticate, validate(verifiedEmailSchema()), verifyEmail)
authRoutes.post("/regenerate-code", authenticate, regenerateCode)
authRoutes.get("/me", authenticate, getCurrentUser)

export default authRoutes;