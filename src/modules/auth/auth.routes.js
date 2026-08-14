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
    updateCurrentUser,
    changePassword,
    deleteAccount,
} from "./auth.controller.js";
import { authenticate, userHasVerifiedEmail, userIsActive } from "./auth.middleware.js";
import validate from "../../shared/middlewares/validate.js";
import {
    loginSchema,
    registerSchema,
    resetPasswordSchema,
    refreshTokenSchema,
    validatedEmailSchema,
    verifiedEmailSchema,
    updateProfileSchema,
    changePasswordSchema,
    deleteAccountSchema,
} from "./user.schema.js";
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
authRoutes.put("/me", authenticate, userHasVerifiedEmail, userIsActive, validate(updateProfileSchema), updateCurrentUser)
authRoutes.patch("/me", authenticate, userHasVerifiedEmail, userIsActive, validate(updateProfileSchema), updateCurrentUser)
authRoutes.patch("/me/password", authenticate, userHasVerifiedEmail, userIsActive, validate(changePasswordSchema), changePassword)
authRoutes.delete("/me", authenticate, userHasVerifiedEmail, userIsActive, validate(deleteAccountSchema), deleteAccount)

export default authRoutes;