import express from "express";
import {
    forgotPassword,
    login,
    register,
    resetPassword,
    verifyEmail,
    getCurrentUser,
    regenerateCode
} from "./auth.controller.js";
import { authenticate, isGrantedAccess } from "./auth.middleware.js";
import { ROLES } from "../../../config/auth/app.js";

const authRoutes = express.Router();

const middleware = async (req, res, next) => {
    console.log(req.headers, 'Access-Control-Allow-Origin//////');
    next()
}

authRoutes.post("/auth/register", register)
authRoutes.post("/auth/login", login)
authRoutes.post("/auth/forgot-password", forgotPassword)
authRoutes.post("/auth/reset-password", resetPassword)
authRoutes.post("/auth/verify-email", authenticate, verifyEmail)
authRoutes.post("/auth/regenerate-code", authenticate, regenerateCode)
authRoutes.get("/auth/me", authenticate, getCurrentUser)

export default authRoutes;