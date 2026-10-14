// src/modules/subscriptions/subscription.openapi.js
export const subscriptionOpenApi = {
    openapi: '3.1.0',
    info: { title: 'Module Abonnements', version: '1.0.0' },
    paths: {
        '/api/v1/subscriptions/plans': {
            get: {
                tags: ['Abonnements'],
                summary: 'Lister les plans d\'abonnement disponibles',
                responses: {
                    200: {
                        description: 'Plans récupérés avec succès',
                        content: {
                            'application/json': {
                                schema: {
                                    type: "object",
                                    properties: {
                                        status: { type: "string", example: "success" },
                                        message: { type: "string", example: "Subscription plans retrieved successfully" },
                                        data: {
                                            type: "array",
                                            items: {
                                                type: "object",
                                                properties: {
                                                    id: { type: "string", example: "plan_1" },
                                                    name: { type: "string", example: "Basic" },
                                                    price: { type: "string", example: "9.99" },
                                                    features: { type: "array", items: { type: "string" }, example: ["Basic features"] }
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
        '/api/v1/subscriptions/subscribe': {
            post: {
                tags: ['Abonnements'],
                summary: 'S\'abonner à un plan',
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
                                    planId: { type: "string", example: "plan_1" },
                                    paymentMethod: { type: "string", example: "card" }
                                },
                                required: ["planId"]
                            }
                        }
                    }
                },
                responses: {
                    200: {
                        description: 'Abonnement créé avec succès',
                        content: {
                            'application/json': {
                                schema: {
                                    type: "object",
                                    properties: {
                                        status: { type: "string", example: "success" },
                                        message: { type: "string", example: "Subscription created successfully" },
                                        data: {
                                            type: "object",
                                            properties: {
                                                subscriptionId: { type: "string", example: "sub_1" },
                                                status: { type: "string", example: "active" }
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
        '/api/v1/subscriptions/me': {
            get: {
                tags: ['Abonnements'],
                summary: 'Obtenir l\'abonnements de l\'utilisateur',
                security: [
                    { auth: [] }
                ],
                responses: {
                    200: {
                        description: 'Abonnements utilisateur récupérés avec succès',
                        content: {
                            'application/json': {
                                schema: {
                                    type: "object",
                                    properties: {
                                        status: { type: "string", example: "success" },
                                        message: { type: "string", example: "User subscriptions retrieved successfully" },
                                        data: {
                                            type: "object",
                                            properties: {
                                                currentSubscription: {
                                                    type: "object",
                                                    properties: {
                                                        id: { type: "string", example: "sub_1" },
                                                        planId: { type: "string", example: "plan_1" },
                                                        status: { type: "string", example: "active" },
                                                        startedAt: { type: "string", format: "date-time" }
                                                    }
                                                },
                                                history: {
                                                    type: "array",
                                                    items: {
                                                        type: "object",
                                                        properties: {
                                                            id: { type: "string", example: "sub_2" },
                                                            planId: { type: "string", example: "plan_2" },
                                                            status: { type: "string", example: "cancelled" },
                                                            cancelledAt: { type: "string", format: "date-time" }
                                                        }
                                                    }
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
        '/api/v1/subscriptions/history': {
            get: {
                tags: ['Abonnements'],
                summary: 'Obtenir l\'historique des abonnements',
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
                        description: 'Nombre d\'éléments par page'
                    }
                ],
                responses: {
                    200: {
                        description: 'Historique des abonnements récupéré avec succès',
                        content: {
                            'application/json': {
                                schema: {
                                    type: "object",
                                    properties: {
                                        status: { type: "string", example: "success" },
                                        message: { type: "string", example: "Subscription history retrieved successfully" },
                                        data: {
                                            type: "object",
                                            properties: {
                                                subscriptions: {
                                                    type: "array",
                                                    items: {
                                                        type: "object",
                                                        properties: {
                                                            id: { type: "string", example: "sub_3" },
                                                            planId: { type: "string", example: "plan_3" },
                                                            status: { type: "string", example: "active" },
                                                            startedAt: { type: "string", format: "date-time" },
                                                            cancelledAt: { type: "string", format: "date-time" }
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
        '/api/v1/subscriptions/admin': {
            get: {
                tags: ['Abonnements'],
                summary: 'Lister tous les abonnements (admin uniquement)',
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
                        description: 'Nombre d\'éléments par page'
                    }
                ],
                responses: {
                    200: {
                        description: 'Liste des abonnements admin récupérée avec succès',
                        content: {
                            'application/json': {
                                schema: {
                                    type: "object",
                                    properties: {
                                        status: { type: "string", example: "success" },
                                        message: { type: "string", example: "Admin subscriptions list retrieved successfully" },
                                        data: {
                                            type: "object",
                                            properties: {
                                                subscriptions: {
                                                    type: "array",
                                                    items: {
                                                        type: "object",
                                                        properties: {
                                                            id: { type: "string", example: "sub_4" },
                                                            userId: { type: "string", example: "usr_1" },
                                                            planId: { type: "string", example: "plan_1" },
                                                            status: { type: "string", example: "active" }
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
        '/api/v1/subscriptions/admin/{id}': {
            get: {
                tags: ['Abonnements'],
                summary: 'Obtenir un abonnement par ID (admin uniquement)',
                security: [
                    { auth: [] }
                ],
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: { type: 'string' },
                        description: 'ID de l\'abonnement'
                    }
                ],
                responses: {
                    200: {
                        description: 'Abonnement récupéré avec succès',
                        content: {
                            'application/json': {
                                schema: {
                                    type: "object",
                                    properties: {
                                        status: { type: "string", example: "success" },
                                        message: { type: "string", example: "Subscription retrieved successfully" },
                                        data: {
                                            type: "object",
                                            properties: {
                                                id: { type: "string", example: "sub_5" },
                                                                userId: { type: "string", example: "usr_2" },
                                                                planId: { type: "string", example: "plan_1" },
                                                                status: { type: "string", example: "active" },
                                                                startedAt: { type: "string", format: "date-time" },
                                                                cancelledAt: { type: "string", format: "date-time" }
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
        '/api/v1/subscriptions/admin/{id}/activate': {
            patch: {
                tags: ['Abonnements'],
                summary: 'Activer un abonnement (admin uniquement)',
                security: [
                    { auth: [] }
                ],
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: { type: 'string' },
                        description: 'ID de l\'abonnement'
                    }
                ],
                responses: {
                    200: {
                        description: 'Abonnement activé avec succès',
                        content: {
                            'application/json': {
                                schema: {
                                    type: "object",
                                    properties: {
                                        status: { type: "string", example: "success" },
                                        message: { type: "string", example: "Subscription activated successfully" },
                                        data: {
                                            type: "object",
                                            properties: {
                                                id: { type: "string", example: "sub_6" },
                                                status: { type: "string", example: "active" }
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
        '/api/v1/subscriptions/admin/{id}/reject': {
            patch: {
                tags: ['Abonnements'],
                summary: 'Rejeter un abonnement (admin uniquement)',
                security: [
                    { auth: [] }
                ],
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: { type: 'string' },
                        description: 'ID de l\'abonnement'
                    }
                ],
                responses: {
                    200: {
                        description: 'Abonnement rejeté avec succès',
                        content: {
                            'application/json': {
                                schema: {
                                    type: "object",
                                    properties: {
                                        status: { type: "string", example: "success" },
                                        message: { type: "string", example: "Subscription rejected successfully" },
                                        data: {
                                            type: "object",
                                            properties: {
                                                id: { type: "string", example: "sub_7" },
                                                status: { type: "string", example: "rejected" }
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
        '/api/v1/subscriptions/admin/{id}/cancel': {
            patch: {
                tags: ['Abonnements'],
                summary: 'Annuler un abonnement (admin uniquement)',
                security: [
                    { auth: [] }
                ],
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: { type: 'string' },
                        description: 'ID de l\'abonnement'
                    }
                ],
                responses: {
                    200: {
                        description: 'Abonnement annulé avec succès',
                        content: {
                            'application/json': {
                                schema: {
                                    type: "object",
                                    properties: {
                                        status: { type: "string", example: "success" },
                                        message: { type: "string", example: "Subscription cancelled successfully" },
                                        data: {
                                            type: "object",
                                            properties: {
                                                id: { type: "string", example: "sub_8" },
                                                status: { type: "string", example: "cancelled" }
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
        '/api/v1/subscriptions/create-payment-intent': {
            post: {
                tags: ['Abonnements'],
                summary: 'Créer un intent de paiement',
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
                                    amount: { type: "number", example: 9.99 },
                                    currency: { type: "string", example: "usd" }
                                },
                                required: ["amount", "currency"]
                            }
                        }
                    }
                },
                responses: {
                    200: {
                        description: 'Intent de paiement créé avec succès',
                        content: {
                            'application/json': {
                                schema: {
                                    type: "object",
                                    properties: {
                                        status: { type: "string", example: "success" },
                                        message: { type: "string", example: "Payment intent created successfully" },
                                        data: {
                                            type: "object",
                                            properties: {
                                                clientSecret: { type: "string", example: "pi_1_secret" }
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
        '/api/v1/subscriptions/confirm-payment': {
            post: {
                tags: ['Abonnements'],
                summary: 'Confirmer un paiement',
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
                                    paymentIntentId: { type: "string", example: "pi_1" },
                                    status: { type: "string", example: "succeeded" }
                                },
                                required: ["paymentIntentId"]
                            }
                        }
                    }
                },
                responses: {
                    200: {
                        description: 'Paiement confirmé avec succès',
                        content: {
                            'application/json': {
                                schema: {
                                    type: "object",
                                    properties: {
                                        status: { type: "string", example: "success" },
                                        message: { type: "string", example: "Payment confirmed successfully" },
                                        data: {
                                            type: "object",
                                            properties: {
                                                subscriptionId: { type: "string", example: "sub_9" }
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