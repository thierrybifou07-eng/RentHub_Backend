import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import "../config/env.js";
import apiRouter from "./routes.js";
import { corsOptions } from "../config/corsOptions.js";
import { loginLimiter, forgotPasswordLimiter, registerLimiter } from "../config/rateLimiter.js";
import { handleWebhook } from "./modules/subscriptions/stripe.webhook.js";
import "./database/setupAssociations.js";

const app = express();

app.use(cors(corsOptions));
app.use(cookieParser());

app.post("/api/v1/stripe/webhook", express.raw({ type: "application/json" }), handleWebhook);

app.use(express.json());

app.use("/api/v1/auth/login", loginLimiter);
app.use("/api/v1/auth/forgot-password", forgotPasswordLimiter);
app.use("/api/v1/auth/register", registerLimiter);

app.use("/api/v1", apiRouter);

const port = process.env.PORT;
app.listen(port, () => {
    console.log(`Le serveur est ouvert sur le port http://localhost:${port}`);
});
