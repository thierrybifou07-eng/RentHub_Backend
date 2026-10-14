// src/modules/reports/report.openapi.js
export const reportOpenApi = {
    openapi: '3.1.0',
    info: { title: 'Module Rapports', version: '1.0.0' },
    paths: {
        '/api/v1/reports': {
            post: {
                tags: ['Rapports'],
                summary: 'Créer un nouveau rapport',
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
                                    type: { type: "string", example: "spam" },
                                    title: { type: "string", example: "Contenu spam" },
                                    description: { type: "string", example: "Description du problème" },
                                    referenceId: { type: "string", example: "prop_1" }
                                },
                                required: ["type", "title"]
                            }
                        }
                    }
                },
                responses: {
                    200: {
                        description: 'Rapport créé avec succès',
                        content: {
                            'application/json': {
                                schema: {
                                    type: "object",
                                    properties: {
                                        status: { type: "string", example: "success" },
                                        message: { type: "string", example: "Report created successfully" },
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
        '/api/v1/reports/admin': {
            get: {
                tags: ['Rapports'],
                summary: 'Lister tous les rapports (admin uniquement)',
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
                    },
                    {
                        name: 'status',
                        in: 'query',
                        required: false,
                        schema: { type: "string" },
                        description: 'Filtrer par statut'
                    }
                ],
                responses: {
                    200: {
                        description: 'Rapports récupérés avec succès',
                        content: {
                            'application/json': {
                                schema: {
                                    type: "object",
                                    properties: {
                                        status: { type: "string", example: "success" },
                                        message: { type: "string", example: "Reports list retrieved successfully" },
                                        data: {
                                            type: "object",
                                            properties: {
                                                reports: {
                                                    type: "array",
                                                    items: {
                                                        type: "object",
                                                        properties: {
                                                            id: { type: "string", example: "rep_1" },
                                                            type: { type: "string", example: "spam" },
                                                            title: { type: "string", example: "Contenu spam" },
                                                            description: { type: "string", example: "Description du problème" },
                                                            status: { type: "string", example: "pending" },
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
        '/api/v1/reports/admin/{id}': {
            get: {
                tags: ['Rapports'],
                summary: 'Obtenir un rapport par ID (admin uniquement)',
                security: [
                    { auth: [] }
                ],
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: { type: 'string' },
                        description: 'ID du rapport'
                    }
                ],
                responses: {
                    200: {
                        description: 'Rapport récupéré avec succès',
                        content: {
                            'application/json': {
                                schema: {
                                    type: "object",
                                    properties: {
                                        status: { type: "string", example: "success" },
                                        message: { type: "string", example: "Report retrieved successfully" },
                                        data: {
                                            type: "object",
                                            properties: {
                                                id: { type: "string", example: "rep_1" },
                                                                type: { type: "string", example: "spam" },
                                                                title: { type: "string", example: "Contenu spam" },
                                                                description: { type: "string", example: "Description du problème" },
                                                                status: { type: "string", example: "pending" },
                                                                createdAt: { type: "string", format: "date-time" }
                                            }
                                        }
                                    },
                                    required: ["status", "message", "data"]
                                }
                            }
                        }
                    },
                    404: {
                        description: 'Rapport non trouvé',
                        content: {
                            'application/json': {
                                schema: {
                                    type: "object",
                                    properties: {
                                        status: { type: "string", example: "error" },
                                        message: { type: "string", example: "Report not found" }
                                    },
                                    required: ["status", "message"]
                                }
                            }
                        }
                    }
                }
            }
        },
        '/api/v1/reports/admin/{id}/review': {
            patch: {
                tags: ['Rapports'],
                summary: 'Réviser un rapport (admin uniquement)',
                security: [
                    { auth: [] }
                ],
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: { type: 'string' },
                        description: 'ID du rapport'
                    }
                ],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: "object",
                                properties: {
                                    adminNote: { type: "string", example: "Review note" }
                                },
                                required: ["adminNote"]
                            }
                        }
                    }
                },
                responses: {
                    200: {
                        description: 'Rapport révisé avec succès',
                        content: {
                            'application/json': {
                                schema: {
                                    type: "object",
                                    properties: {
                                        status: { type: "string", example: "success" },
                                        message: { type: "string", example: "Report reviewed successfully" },
                                        data: {
                                            type: "object",
                                            properties: {
                                                id: { type: "string", example: "rep_1" },
                                                status: { type: "string", example: "reviewed" }
                                            }
                                        }
                                    },
                                    required: ["status", "message", "data"]
                                }
                            }
                        }
                    },
                    400: {
                        description: 'Données invalides',
                        content: {
                            'application/json': {
                                schema: {
                                    type: "object",
                                    properties: {
                                        status: { type: "string", example: "error" },
                                        message: { type: "string", example: "Invalid data" }
                                    },
                                    required: ["status", "message"]
                                }
                            }
                        }
                    }
                }
            }
        },
        '/api/v1/reports/admin/{id}/dismiss': {
            patch: {
                tags: ['Rapports'],
                summary: 'Ignorer un rapport (admin uniquement)',
                security: [
                    { auth: [] }
                ],
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: { type: 'string' },
                        description: 'ID du rapport'
                    }
                ],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: "object",
                                properties: {
                                    adminNote: { type: "string", example: "Dismiss note" }
                                },
                                required: ["adminNote"]
                            }
                        }
                    }
                },
                responses: {
                    200: {
                        description: 'Rapport ignoré avec succès',
                        content: {
                            'application/json': {
                                schema: {
                                    type: "object",
                                    properties: {
                                        status: { type: "string", example: "success" },
                                        message: { type: "string", example: "Report dismissed successfully" },
                                        data: {
                                            type: "object",
                                            properties: {
                                                id: { type: "string", example: "rep_1" },
                                                status: { type: "string", example: "dismissed" }
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
        '/api/v1/reports/admin/{id}/take-action': {
            patch: {
                tags: ['Rapports'],
                summary: 'Prendre une action sur un rapport (admin uniquement)',
                security: [
                    { auth: [] }
                ],
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: { type: 'string' },
                        description: 'ID du rapport'
                    }
                ],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: "object",
                                properties: {
                                    action: { type: "string", example: "resolve" },
                                    adminNote: { type: "string", example: "Action note" }
                                },
                                required: ["action"]
                            }
                        }
                    }
                },
                responses: {
                    200: {
                        description: 'Action effectuée avec succès',
                        content: {
                            'application/json': {
                                schema: {
                                    type: "object",
                                    properties: {
                                        status: { type: "string", example: "success" },
                                        message: { type: "string", example: "Action performed successfully" },
                                        data: {
                                            type: "object",
                                            properties: {
                                                id: { type: "string", example: "rep_1" },
                                                status: { type: "string", example: "actioned" }
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