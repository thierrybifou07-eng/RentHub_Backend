import { Server } from "socket.io";
import { corsOptions } from "../../config/corsOptions.js";
import { verifyToken } from "../modules/auth/jwt.js";

let io = null;

/**
 * Initialise Socket.IO sur le serveur HTTP existant.
 * Authentification : JWT fourni au handshake (socket.handshake.auth.token).
 * Chaque utilisateur authentifié rejoint sa salle personnelle "user:{id}".
 */
export function initSocket(httpServer) {
    if (io) return io;

    io = new Server(httpServer, {
        cors: corsOptions,
    });

    // Middleware d'authentification au handshake
    io.use((socket, next) => {
        const token = socket.handshake.auth?.token;
        if (!token) return next(new Error("unauthorized"));

        try {
            const payload = verifyToken(token);
            socket.user = { id: payload.id, role: payload.role };
            return next();
        } catch {
            return next(new Error("unauthorized"));
        }
    });

    io.on("connection", (socket) => {
        socket.join(`user:${socket.user.id}`);
        socket.on("disconnect", () => {
            /* la salle est libérée automatiquement */
        });
    });

    return io;
}

/**
 * Retourne l'instance Socket.IO (null si non initialisée).
 * Permet d'émettre des événements depuis les contrôleurs.
 */
export function getIO() {
    return io;
}
