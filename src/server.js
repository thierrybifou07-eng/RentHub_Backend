import express from "express";
import cors from "cors";
import compression from "compression";
import { createServer } from "node:http";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import "../config/env.js";
import apiRouter from "./routes.js";
import { corsOptions } from "../config/corsOptions.js";
import { loginLimiter, forgotPasswordLimiter, registerLimiter, profileUpdateLimiter, passwordChangeLimiter, avatarLimiter } from "../config/rateLimiter.js";
import { handleWebhook } from "./modules/subscriptions/stripe.webhook.js";
import { initSocket } from "./realtime/socket.js";
import "./database/setupAssociations.js";
import errorHandler from "./shared/middlewares/errorHandler.js";
import { notFound } from "./shared/helpers/response.helpers.js";
import MediaRouter from "./modules/media/media.router.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(cors(corsOptions));

app.use(compression({ threshold: 1024 }));

app.post("/api/v1/stripe/webhook", express.raw({ type: "application/json" }), handleWebhook);

app.use("/uploads", express.static(resolve(__dirname, "../public/uploads"), { maxAge: "30d", immutable: true }));

app.use("/api/v1", MediaRouter);

app.use(express.json());

app.use("/api/v1/auth/login", loginLimiter);
app.use("/api/v1/auth/forgot-password", forgotPasswordLimiter);
app.use("/api/v1/auth/register", registerLimiter);
app.use("/api/v1/auth/me", profileUpdateLimiter);
app.use("/api/v1/auth/me/password", passwordChangeLimiter);
app.use("/api/v1/media/avatar", avatarLimiter);


app.use("/api/v1", apiRouter);

// 404 — route not found
app.use((req, res) => {
    return res.status(404).json(notFound(`Cannot ${req.method} ${req.originalUrl}`));
});

// Global error handler (must be last)
app.use(errorHandler);

const httpServer = createServer(app);
initSocket(httpServer);

const port = process.env.PORT;
httpServer.listen(port, process.env.HOST, () => {
    console.log(`Le serveur est ouvert sur le port http://localhost:${port}`);
});

