// src/modules/notifications/notification.openapi.js
import { makeErrorResponse, makeSuccessResponse } from "../../../config/openapi/openapi.helpers.js";

const NotificationSchema = {
    type: "object",
    properties: {
        id: { type: "integer", example: 1 },
        title: { type: "string", example: "Nouvelle annonce approuvée" },
        message: { type: "string", example: "Votre annonce 'Appartement Paris 11' a été approuvée." },
        type: { type: "string", example: "announcement_approved" },
        isRead: { type: "boolean", example: false },
        metadata: { type: "object", nullable: true, example: { announcementId: 42 } },
        createdAt: { type: "string", format: "date-time" }
    }
};

// --- Configuration OpenAPI du module Notifications ---
export const notificationOpenApi = {
    openapi: "3.1.0",
    info: { title: "Module Notifications", version: "1.0.0" },
    paths: {
        // ── GET /notifications ──────────────────────────────────────────
        "/api/v1/notifications": {
            get: {
                tags: ["Notifications"],
                summary: "Lister les notifications de l'utilisateur connecté",
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
                        description: "Nombre de notifications par page"
                    }
                ],
                responses: {
                    200: {
                        description: "Notifications récupérées avec succès",
                        content: makeSuccessResponse("User notifications retrieved successfully", {
                            type: "object",
                            properties: {
                                notifications: { type: "array", items: NotificationSchema },
                                total: { type: "integer", example: 25 },
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

        // ── GET /notifications/unread-count ─────────────────────────────
        "/api/v1/notifications/unread-count": {
            get: {
                tags: ["Notifications"],
                summary: "Nombre de notifications non lues",
                security: [{ bearerAuth: [] }],
                responses: {
                    200: {
                        description: "Nombre de notifications non lues récupéré",
                        content: makeSuccessResponse("Unread notification count retrieved successfully", {
                            type: "object",
                            properties: {
                                unreadCount: { type: "integer", example: 5 }
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

        // ── PATCH /notifications/read-all & DELETE /notifications/read-all
        // Note: même chemin, méthodes différentes (PATCH = marquer lues, DELETE = supprimer toutes)
        "/api/v1/notifications/read-all": {
            patch: {
                tags: ["Notifications"],
                summary: "Marquer toutes les notifications comme lues",
                security: [{ bearerAuth: [] }],
                responses: {
                    200: {
                        description: "Toutes les notifications marquées comme lues",
                        content: makeSuccessResponse("All notifications marked as read", {
                            type: "object",
                            properties: {
                                updatedCount: { type: "integer", example: 5 }
                            }
                        })
                    },
                    401: {
                        description: "Non authentifié",
                        content: makeErrorResponse("Unauthorized")
                    }
                }
            },
            delete: {
                tags: ["Notifications"],
                summary: "Supprimer toutes les notifications de l'utilisateur",
                security: [{ bearerAuth: [] }],
                responses: {
                    200: {
                        description: "Toutes les notifications supprimées",
                        content: makeSuccessResponse("All notifications deleted", {
                            type: "object",
                            properties: {
                                deletedCount: { type: "integer", example: 10 }
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

        // ── PATCH /notifications/:id/read ───────────────────────────────
        "/api/v1/notifications/{id}/read": {
            patch: {
                tags: ["Notifications"],
                summary: "Marquer une notification spécifique comme lue",
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: "id",
                        in: "path",
                        required: true,
                        schema: { type: "integer" },
                        description: "ID de la notification"
                    }
                ],
                responses: {
                    200: {
                        description: "Notification marquée comme lue",
                        content: makeSuccessResponse("Notification marked as read", NotificationSchema)
                    },
                    401: {
                        description: "Non authentifié",
                        content: makeErrorResponse("Unauthorized")
                    },
                    403: {
                        description: "Cette notification n'appartient pas à l'utilisateur",
                        content: makeErrorResponse("Access forbidden")
                    },
                    404: {
                        description: "Notification non trouvée",
                        content: makeErrorResponse("Notification not found")
                    }
                }
            }
        },

        // ── DELETE /notifications/:id ───────────────────────────────────
        "/api/v1/notifications/{id}": {
            delete: {
                tags: ["Notifications"],
                summary: "Supprimer une notification spécifique",
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: "id",
                        in: "path",
                        required: true,
                        schema: { type: "integer" },
                        description: "ID de la notification"
                    }
                ],
                responses: {
                    200: {
                        description: "Notification supprimée avec succès",
                        content: makeSuccessResponse("Notification deleted successfully", { type: "object", nullable: true })
                    },
                    401: {
                        description: "Non authentifié",
                        content: makeErrorResponse("Unauthorized")
                    },
                    403: {
                        description: "Cette notification n'appartient pas à l'utilisateur",
                        content: makeErrorResponse("Access forbidden")
                    },
                    404: {
                        description: "Notification non trouvée",
                        content: makeErrorResponse("Notification not found")
                    }
                }
            }
        }
    }
};
