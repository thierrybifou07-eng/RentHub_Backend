// src/modules/notifications/notification.openapi.js
export const notificationOpenApi = {
    openapi: '3.1.0',
    info: { title: 'Module Notifications', version: '1.0.0' },
    paths: {
        '/api/v1/notifications': {
            get: {
                tags: ['Notifications'],
                summary: 'Obtenir les notifications de l\'utilisateur',
                security: [
                    { auth: [] }
                ],
                parameters: [
                    {
                        name: 'page',
                        in: 'query',
                        required: false,
                        schema: { type: 'integer', minimum: 1, default: 1 },
                        description: 'Numéro de page'
                    },
                    {
                        name: 'limit',
                        in: 'query',
                        required: false,
                        schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
                        description: 'Nombre de notifications par page'
                    }
                ],
                responses: {
                    200: {
                        description: 'Notifications récupérées avec succès',
                        content: {
                            'application/json': {
                                schema: {
                                    type: "object",
                                    properties: {
                                        status: { type: "string", example: "success" },
                                        message: { type: "string", example: "User notifications retrieved successfully" },
                                        data: {
                                            type: "object",
                                            properties: {
                                                notifications: {
                                                    type: "array",
                                                    items: {
                                                        type: "object",
                                                        properties: {
                                                            id: { type: "string", example: "notif_1" },
                                                            title: { type: "string", example: "Nouveau message" },
                                                            message: { type: "string", example: "Vous avez un nouveau message" },
                                                            isRead: { type: "boolean", example: false },
                                                            createdAt: { type: "string", format: "date-time" }
                                                        }
                                                    }
                                                },
                                                total: { type: "integer" },
                                                page: { type: "integer" },
                                                limit: { type: "integer" }
                                            }
                                        }
                                    },
                                    required: ["status", "message", "data"]
                                }
                            }
                        }
                    }
                }
            }
        },
        '/api/v1/notifications/unread-count': {
            get: {
                tags: ['Notifications'],
                summary: 'Nombre de notifications non lues',
                security: [
                    { auth: [] }
                ],
                responses: {
                    200: {
                        description: 'Nombre de notifications non lues récupéré avec succès',
                        content: {
                            'application/json': {
                                schema: {
                                    type: "object",
                                    properties: {
                                        status: { type: "string", example: "success" },
                                        message: { type: "string", example: "Unread notification count retrieved successfully" },
                                        data: { type: "integer", example: 5 }
                                    },
                                    required: ["status", "message", "data"]
                                }
                            }
                        }
                    }
                }
            }
        },
        '/api/v1/notifications/read-all': {
            patch: {
                tags: ['Notifications'],
                summary: 'Marquer toutes les notifications comme lues',
                security: [
                    { auth: [] }
                ],
                responses: {
                    200: {
                        description: 'Toutes les notifications marquées comme lues',
                        content: {
                            'application/json': {
                                schema: {
                                    type: "object",
                                    properties: {
                                        status: { type: "string", example: "success" },
                                        message: { type: "string", example: "All notifications marked as read" },
                                        data: { type: "object" }
                                    },
                                    required: ["status", "message", "data"]
                                }
                            }
                        }
                    }
                }
            }
        },
        '/api/v1/notifications/{id}/read': {
            patch: {
                tags: ['Notifications'],
                summary: 'Marquer une notification comme lue',
                security: [
                    { auth: [] }
                ],
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: { type: 'string' },
                        description: 'ID de la notification'
                    }
                ],
                responses: {
                    200: {
                        description: 'Notification marquée comme lue',
                        content: {
                            'application/json': {
                                schema: {
                                    type: "object",
                                    properties: {
                                        status: { type: "string", example: "success" },
                                        message: { type: "string", example: "Notification marked as read" },
                                        data: { type: "object" }
                                    },
                                    required: ["status", "message", "data"]
                                }
                            }
                        }
                    }
                }
            }
        },
        '/api/v1/notifications/{id}': {
            delete: {
                tags: ['Notifications'],
                summary: 'Supprimer une notification',
                security: [
                    { auth: [] }
                ],
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: { type: 'string' },
                        description: 'ID de la notification'
                    }
                ],
                responses: {
                    200: {
                        description: 'Notification supprimée avec succès',
                        content: {
                            'application/json': {
                                schema: {
                                    type: "object",
                                    properties: {
                                        status: { type: "string", example: "success" },
                                        message: { type: "string", example: "Notification deleted successfully" },
                                        data: { type: "object" }
                                    },
                                    required: ["status", "message", "data"]
                                }
                            }
                        }
                    }
                }
            }
        },
        '/api/v1/notifications/read-all': {
            delete: {
                tags: ['Notifications'],
                summary: 'Supprimer toutes les notifications',
                security: [
                    { auth: [] }
                ],
                responses: {
                    200: {
                        description: 'Toutes les notifications supprimées',
                        content: {
                            'application/json': {
                                schema: {
                                    type: "object",
                                    properties: {
                                        status: { type: "string", example: "success" },
                                        message: { type: "string", example: "All notifications deleted" },
                                        data: { type: "object" }
                                    },
                                    required: ["status", "message", "data"]
                                }
                            }
                        }
                    }
                }
            }
        }
    }
};