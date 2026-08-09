import { Router } from "express";
import { authenticate } from "../src/modules/auth/auth.middleware.js";
import { getMyEmails } from "./devMail.controller.js";
const router = Router();

router.get('/my-emails', authenticate, getMyEmails)

export default router