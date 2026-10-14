// src/modules/messaging/messaging.openapi.js
export const messagingOpenApi = {
    openapi: '3.1.0',
    info: { title: 'Module Messagerie', version: '1.0.0' },
    paths: {
        '/api/v1/conversations': {
            post: {
                tags: ['Messagerie'],
                summary: 'Démarrer une nouvelle conversation',
                security: [
                    { auth: [] }
                ],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: "object",
                                properties: {
                                    recipientId: { type: "string", example: "usr_456" },
                                    subject: { type: "string", example: "Objet du message" }
                                },
                                required: ["recipientId"]
                            }
                        }
                    }
                },
                responses: {
                    200: {
                        description: 'Conversation démarrée avec succès',
                        content: {
                            'application/json': {
                                schema: {
                                    type: "object",
                                    properties: {
                                        status: { type: "string", example: "success" },
                                        message: { type: "string", example: "Conversation started successfully" },
                                        data: {
                                            type: "object",
                                            properties: {
                                                conversationId: { type: "string", example: "conv_1" }
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
        '/api/v1/conversations': {
            get: {
                tags: ['Messagerie'],
                summary: 'Obtenir les conversations de l\'utilisateur',
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
                        description: 'Nombre de conversations par page'
                    }
                ],
                responses: {
                    200: {
                        description: 'Conversations récupérées avec succès',
                        content: {
                            'application/json': {
                                schema: {
                                    type: "object",
                                    properties: {
                                        status: { type: "string", example: "success" },
                                        message: { type: "string", example: "User conversations retrieved successfully" },
                                        data: {
                                            type: "object",
                                            properties: {
                                                conversations: {
                                                    type: "array",
                                                    items: {
                                                        type: "object",
                                                        properties: {
                                                            id: { type: "string", example: "conv_1" },
                                                            recipientId: { type: "string", example: "usr_456" },
                                                            recipientName: { type: "string", example: "John Doe" },
                                                            lastMessage: { type: "string", example: "Hello!" },
                                                            lastMessageAt: { type: "string", format: "date-time" }
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
        '/api/v1/conversations/unread-count': {
            get: {
                tags: ['Messagerie'],
                summary: 'Nombre de messages non lus',
                security: [
                    { auth: [] }
                ],
                responses: {
                    200: {
                        description: 'Nombre de messages non lus récupéré avec succès',
                        content: {
                            'application/json': {
                                schema: {
                                    type: "object",
                                    properties: {
                                        status: { type: "string", example: "success" },
                                        message: { type: "string", example: "Unread count retrieved successfully" },
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
        '/api/v1/conversations/{id}/messages': {
            get: {
                tags: ['Messagerie'],
                summary: 'Obtenir les messages d\'une conversation',
                security: [
                    { auth: [] }
                ],
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: { type: 'string' },
                        description: 'ID de la conversation'
                    }
                ],
                responses: {
                    200: {
                        description: 'Messages récupérés avec succès',
                        content: {
                            'application/json': {
                                schema: {
                                    type: "object",
                                    properties: {
                                        status: { type: "string", example: "success" },
                                        message: { type: "string", example: "Messages retrieved successfully" },
                                        data: {
                                            type: "array",
                                            items: {
                                                type: "object",
                                                properties: {
                                                    id: { type: "string", example: "msg_1" },
                                                    senderId: { type: "string", example: "usr_789" },
                                                    senderName: { type: "string", example: "John Doe" },
                                                    content: { type: "string", example: "Hello!" },
                                                    createdAt: { type: "string", format: "date-time" }
                                                }
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
        '/api/v1/conversations/{id}/messages': {
            post: {
                tags: ['Messagerie'],
                summary: 'Envoyer un message',
                security: [
                    { auth: [] }
                ],
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: { type: 'string' },
                        description: 'ID de la conversation'
                    }
                ],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: "object",
                                properties: {
                                    content: { type: "string", example: "Bonjour !" }
                                },
                                required: ["content"]
                            }
                        }
                    }
                },
                responses: {
                    200: {
                        description: 'Message envoyé avec succès',
                        content: {
                            'application/json': {
                                schema: {
                                    type: "object",
                                    properties: {
                                        status: { type: "string", example: "success" },
                                        message: { type: "string", example: "Message sent successfully" },
                                        data: {
                                            type: "object",
                                            properties: {
                                                messageId: { type: "string", example: "msg_2" }
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
        }
    }
};