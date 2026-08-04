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
    logout,
    logoutAll,
    updateCurrentUser
} from "./auth.controller.js";
import { authenticate } from "./auth.middleware.js";
import validate from "../../shared/middlewares/validate.js";
import { loginSchema, registerSchema, resetPasswordSchema, refreshTokenSchema, validatedEmailSchema, verifiedEmailSchema, updateProfileSchema } from "./user.schema.js";
const authRoutes = express.Router();

authRoutes.post("/register", validate(registerSchema), register)
authRoutes.post("/login", validate(loginSchema), login)
authRoutes.post("/refresh", validate(refreshTokenSchema), refresh)
authRoutes.post("/logout", validate(refreshTokenSchema), logout)
authRoutes.post("/logout-all", authenticate, logoutAll)
authRoutes.post("/forgot-password", validate(validatedEmailSchema), forgotPassword)
authRoutes.post("/reset-password", validate(resetPasswordSchema()), resetPassword)
authRoutes.post("/verify-email", authenticate, validate(verifiedEmailSchema()), verifyEmail)
authRoutes.post("/regenerate-code", authenticate, regenerateCode)
authRoutes.get("/me", authenticate, getCurrentUser)
authRoutes.patch("/me", authenticate, validate(updateProfileSchema), updateCurrentUser)

export default authRoutes;