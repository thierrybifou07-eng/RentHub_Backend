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
import validate from "../../shared/middlewares/validate.js";
const authRoutes = express.Router();

const middleware = async (req, res, next) => {
    console.log(req.headers, 'Access-Control-Allow-Origin');
    next()
}

authRoutes.post("/register", register)
authRoutes.post("/login", login)
authRoutes.post("/forgot-password", forgotPassword)
authRoutes.post("/reset-password", resetPassword)
authRoutes.post("/verify-email", authenticate, verifyEmail)
authRoutes.post("/regenerate-code", authenticate, regenerateCode)
authRoutes.get("/me", authenticate, getCurrentUser)

export default authRoutes;