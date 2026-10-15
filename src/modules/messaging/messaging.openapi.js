// src/modules/messaging/messaging.openapi.js
import { makeErrorResponse, makeSuccessResponse } from "../../../config/openapi/openapi.helpers.js";

const ConversationSchema = {
    type: "object",
    properties: {
        id: { type: "integer", example: 1 },
        announcementId: { type: "integer", nullable: true, example: 42 },
        participantIds: { type: "array", items: { type: "integer" }, example: [1, 2] },
        lastMessage: { type: "string", nullable: true, example: "Bonjour, est-ce disponible ?" },
        lastMessageAt: { type: "string", format: "date-time", nullable: true },
        unreadCount: { type: "integer", example: 3 },
        createdAt: { type: "string", format: "date-time" }
    }
};

const MessageSchema = {
    type: "object",
    properties: {
        id: { type: "integer", example: 1 },
        conversationId: { type: "integer", example: 1 },
        senderId: { type: "integer", example: 2 },
        senderName: { type: "string", example: "John Doe" },
        content: { type: "string", example: "Bonjour, est-ce disponible ?" },
        isRead: { type: "boolean", example: false },
        createdAt: { type: "string", format: "date-time" }
    }
};

// --- Configuration OpenAPI du module Messagerie ---
export const messagingOpenApi = {
    openapi: "3.1.0",
    info: { title: "Module Messagerie", version: "1.0.0" },
    paths: {
        // ── POST /conversations & GET /conversations ────────────────────
        "/api/v1/conversations": {
            post: {
                tags: ["Messagerie"],
                summary: "Démarrer ou récupérer une conversation existante",
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    recipientId: { type: "integer", example: 2, description: "ID de l'interlocuteur" },
                                    announcementId: { type: "integer", nullable: true, example: 42, description: "ID de l'annonce concernée (optionnel)" }
                                },
                                required: ["recipientId"]
                            }
                        }
                    }
                },
                responses: {
                    200: {
                        description: "Conversation créée ou existante récupérée",
                        content: makeSuccessResponse("Conversation started successfully", ConversationSchema)
                    },
                    400: {
                        description: "Données invalides",
                        content: makeErrorResponse("Validation error")
                    },
                    401: {
                        description: "Non authentifié",
                        content: makeErrorResponse("Unauthorized")
                    },
                    403: {
                        description: "Email non vérifié ou compte inactif",
                        content: makeErrorResponse("Account not active")
                    }
                }
            },
            get: {
                tags: ["Messagerie"],
                summary: "Lister les conversations de l'utilisateur connecté",
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: "page",
                        in: "query",
                        required: false,
                        schema: { type: "integer", minimum: 1, default: 1 },
                        description: "Numéro de page"
                    },
                    {
                        name: "limit",
                        in: "query",
                        required: false,
                        schema: { type: "integer", minimum: 1, maximum: 100, default: 20 },
                        description: "Nombre de conversations par page"
                    }
                ],
                responses: {
                    200: {
                        description: "Conversations récupérées avec succès",
                        content: makeSuccessResponse("User conversations retrieved successfully", {
                            type: "object",
                            properties: {
                                conversations: { type: "array", items: ConversationSchema },
                                total: { type: "integer", example: 10 },
                                page: { type: "integer", example: 1 },
                                limit: { type: "integer", example: 20 }
                            }
                        })
                    },
                    401: {
                        description: "Non authentifié",
                        content: makeErrorResponse("Unauthorized")
                    }
                }
            }
        },

        // ── GET /conversations/unread-count ─────────────────────────────
        "/api/v1/conversations/unread-count": {
            get: {
                tags: ["Messagerie"],
                summary: "Nombre total de messages non lus",
                security: [{ bearerAuth: [] }],
                responses: {
                    200: {
                        description: "Nombre de messages non lus récupéré",
                        content: makeSuccessResponse("Unread count retrieved successfully", {
                            type: "object",
                            properties: {
                                unreadCount: { type: "integer", example: 7 }
                            }
                        })
                    },
                    401: {
                        description: "Non authentifié",
                        content: makeErrorResponse("Unauthorized")
                    }
                }
            }
        },

        // ── GET /conversations/:id/messages & POST /conversations/:id/messages
        "/api/v1/conversations/{id}/messages": {
            get: {
                tags: ["Messagerie"],
                summary: "Lister les messages d'une conversation",
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: "id",
                        in: "path",
                        required: true,
                        schema: { type: "integer" },
                        description: "ID de la conversation"
                    },
                    {
                        name: "page",
                        in: "query",
                        required: false,
                        schema: { type: "integer", minimum: 1, default: 1 },
                        description: "Numéro de page"
                    },
                    {
                        name: "limit",
                        in: "query",
                        required: false,
                        schema: { type: "integer", minimum: 1, maximum: 100, default: 50 },
                        description: "Nombre de messages par page"
                    }
                ],
                responses: {
                    200: {
                        description: "Messages récupérés avec succès",
                        content: makeSuccessResponse("Messages retrieved successfully", {
                            type: "object",
                            properties: {
                                messages: { type: "array", items: MessageSchema },
                                total: { type: "integer", example: 30 },
                                page: { type: "integer", example: 1 },
                                limit: { type: "integer", example: 50 }
                            }
                        })
                    },
                    401: {
                        description: "Non authentifié",
                        content: makeErrorResponse("Unauthorized")
                    },
                    403: {
                        description: "Accès refusé (non participant de la conversation)",
                        content: makeErrorResponse("Access forbidden")
                    },
                    404: {
                        description: "Conversation non trouvée",
                        content: makeErrorResponse("Conversation not found")
                    }
                }
            },
            post: {
                tags: ["Messagerie"],
                summary: "Envoyer un message dans une conversation",
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: "id",
                        in: "path",
                        required: true,
                        schema: { type: "integer" },
                        description: "ID de la conversation"
                    }
                ],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    content: { type: "string", example: "Bonjour, est-ce toujours disponible ?" }
                                },
                                required: ["content"]
                            }
                        }
                    }
                },
                responses: {
                    201: {
                        description: "Message envoyé avec succès",
                        content: makeSuccessResponse("Message sent successfully", MessageSchema)
                    },
                    400: {
                        description: "Contenu du message invalide",
                        content: makeErrorResponse("Message content is required")
                    },
                    401: {
                        description: "Non authentifié",
                        content: makeErrorResponse("Unauthorized")
                    },
                    403: {
                        description: "Accès refusé (non participant de la conversation)",
                        content: makeErrorResponse("Access forbidden")
                    },
                    404: {
                        description: "Conversation non trouvée",
                        content: makeErrorResponse("Conversation not found")
                    }
                }
            }
        }
    }
};
