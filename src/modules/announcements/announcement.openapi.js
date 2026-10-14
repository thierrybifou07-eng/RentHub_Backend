// src/modules/announcements/announcement.openapi.js
export const announcementOpenApi = {
    openapi: '3.1.0',
    info: { title: 'Module Annonces', version: '1.0.0' },
    paths: {
        '/api/v1/announcements': {
            get: {
                tags: ['Annonces'],
                summary: 'Lister toutes les annonces publiques',
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
                        description: 'Nombre d\'annonces par page'
                    },
                    {
                        name: 'search',
                        in: 'query',
                        required: false,
                        schema: { type: 'string', max: 255 },
                        description: 'Terme de recherche (titre, description)'
                    }
                ],
                responses: {
                    200: {
                        description: 'Annonces récupérées avec succès',
                        content: {
                            'application/json': {
                                schema: {
                                    type: "object",
                                    properties: {
                                        status: { type: "string", example: "success" },
                                        message: { type: "string", example: "Announces list retrieved successfully" },
                                        data: {
                                            type: "object",
                                            properties: {
                                                announcements: {
                                                    type: "array",
                                                    items: {
                                                        type: "object",
                                                        properties: {
                                                            id: { type: "string", example: "ann_1" },
                                                            title: { type: "string", example: "Nice Apartment" },
                                                            description: { type: "string", example: "A nice apartment in Paris" },
                                                            price: { type: "string", example: "1000" },
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
        '/api/v1/announcements/me': {
            get: {
                tags: ['Annonces'],
                summary: 'Obtenir les annonces de l\'utilisateur',
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
                        description: 'Nombre d\'annonces par page'
                    },
                    {
                        name: 'status_id',
                        in: 'query',
                        required: false,
                        schema: { type: 'string' },
                        description: 'Filtrer par ID de statut'
                    }
                ],
                responses: {
                    200: {
                        description: 'Annonces utilisateur récupérées avec succès',
                        content: {
                            'application/json': {
                                schema: {
                                    type: "object",
                                    properties: {
                                        status: { type: "string", example: "success" },
                                        message: { type: "string", example: "User announcements retrieved successfully" },
                                        data: {
                                            type: "object",
                                            properties: {
                                                announcements: {
                                                    type: "array",
                                                    items: {
                                                        type: "object",
                                                        properties: {
                                                            id: { type: "string", example: "ann_2" },
                                                            title: { type: "string", example: "My Apartment" },
                                                            description: { type: "string", example: "My apartment description" },
                                                            price: { type: "string", example: "800" },
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
        '/api/v1/announcements/admin/pending': {
            get: {
                tags: ['Annonces'],
                summary: 'Obtenir les annonces en attente (admin uniquement)',
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
                        description: 'Nombre d\'annonces par page'
                    }
                ],
                responses: {
                    200: {
                        description: 'Annonces en attente récupérées avec succès',
                        content: {
                            'application/json': {
                                schema: {
                                    type: "object",
                                    properties: {
                                        status: { type: "string", example: "success" },
                                        message: { type: "string", example: "Pending announcements retrieved successfully" },
                                        data: {
                                            type: "object",
                                            properties: {
                                                announcements: {
                                                    type: "array",
                                                    items: {
                                                        type: "object",
                                                        properties: {
                                                            id: { type: "string", example: "ann_3" },
                                                            title: { type: "string", example: "Pending Apartment" },
                                                            description: { type: "string", example: "Pending description" },
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
        '/api/v1/announcements/admin/{id}': {
            get: {
                tags: ['Annonces'],
                summary: 'Obtenir une annonce par ID (admin uniquement)',
                security: [
                    { auth: [] }
                ],
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: { type: 'string' },
                        description: 'ID de l\'annonce'
                    }
                ],
                responses: {
                    200: {
                        description: 'Annonce récupérée avec succès',
                        content: {
                            'application/json': {
                                schema: {
                                    type: "object",
                                    properties: {
                                        status: { type: "string", example: "success" },
                                        message: { type: "string", example: "Announcement retrieved successfully" },
                                        data: {
                                            type: "object",
                                            properties: {
                                                id: { type: "string", example: "ann_4" },
                                                                title: { type: "string", example: "Admin Apartment" },
                                                                description: { type: "string", example: "Admin description" },
                                                                price: { type: "string", example: "1200" },
                                                                status: { type: "string", example: "pending" }
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
        '/api/v1/announcements/admin/{id}/approve': {
            put: {
                tags: ['Annonces'],
                summary: 'Approuver une annonce (admin uniquement)',
                security: [
                    { auth: [] }
                ],
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: { type: 'string' },
                        description: 'ID de l\'annonce'
                    }
                ],
                responses: {
                    200: {
                        description: 'Annonce approuvée avec succès',
                        content: {
                            'application/json': {
                                schema: {
                                    type: "object",
                                    properties: {
                                        status: { type: "string", example: "success" },
                                        message: { type: "string", example: "Announcement approved successfully" },
                                        data: {
                                            type: "object",
                                            properties: {
                                                id: { type: "string", example: "ann_5" },
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
        '/api/v1/announcements/admin/{id}/reject': {
            put: {
                tags: ['Annonces'],
                summary: 'Rejeter une annonce (admin uniquement)',
                security: [
                    { auth: [] }
                ],
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: { type: 'string' },
                        description: 'ID de l\'annonce'
                    }
                ],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: "object",
                                properties: {
                                    reason: { type: "string", example: "Rejection reason" }
                                },
                                required: ["reason"]
                            }
                        }
                    }
                },
                responses: {
                    200: {
                        description: 'Annonce rejetée avec succès',
                        content: {
                            'application/json': {
                                schema: {
                                    type: "object",
                                    properties: {
                                        status: { type: "string", example: "success" },
                                        message: { type: "string", example: "Announcement rejected successfully" },
                                        data: {
                                            type: "object",
                                            properties: {
                                                id: { type: "string", example: "ann_6" },
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
        '/api/v1/announcements/admin/{id}': {
            delete: {
                tags: ['Annonces'],
                summary: 'Supprimer une annonce (admin uniquement)',
                security: [
                    { auth: [] }
                ],
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: { type: 'string' },
                        description: 'ID de l\'annonce'
                    }
                ],
                responses: {
                    200: {
                        description: 'Annonce supprimée avec succès',
                        content: {
                            'application/json': {
                                schema: {
                                    type: "object",
                                    properties: {
                                        status: { type: "string", example: "success" },
                                        message: { type: "string", example: "Announcement deleted successfully" },
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
        '/api/v1/announcements/{id}': {
            get: {
                tags: ['Annonces'],
                summary: 'Obtenir une annonce par ID (public)',
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: { type: 'string' },
                        description: 'ID de l\'annonce'
                    }
                ],
                responses: {
                    200: {
                        description: 'Annonce récupérée avec succès',
                        content: {
                            'application/json': {
                                schema: {
                                    type: "object",
                                    properties: {
                                        status: { type: "string", example: "success" },
                                        message: { type: "string", example: "Announcement retrieved successfully" },
                                        data: {
                                            type: "object",
                                            properties: {
                                                id: { type: "string", example: "ann_7" },
                                                    title: { type: "string", example: "Public Apartment" },
                                                    description: { type: "string", example: "Public description" },
                                                    price: { type: "string", example: "900" }
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
        '/api/v1/announcements': {
            post: {
                tags: ['Annonces'],
                summary: 'Créer une nouvelle annonce',
                security: [
                    { auth: [] }
                ],
                requestBody: {
                    required: true,
                    content: {
                        'multipart/form-data': {
                            schema: {
                                type: "object",
                                properties: {
                                    title: {
                                        type: "string",
                                        example: "New Apartment"
                                    },
                                    description: {
                                        type: "string",
                                        example: "A nice apartment"
                                    },
                                    price: {
                                        type: "string",
                                        example: "1000"
                                    },
                                    media: {
                                        type: "array",
                                        items: {
                                            type: "string",
                                            format: "binary"
                                        },
                                        description: "Fichiers média",
                                        maxItems: 50
                                    }
                                },
                                required: ["title", "description", "price"]
                            }
                        }
                    }
                },
                responses: {
                    200: {
                        description: 'Annonce créée avec succès',
                        content: {
                            'application/json': {
                                schema: {
                                    type: "object",
                                    properties: {
                                        status: { type: "string", example: "success" },
                                        message: { type: "string", example: "Announcement created successfully" },
                                        data: {
                                            type: "object",
                                            properties: {
                                                id: { type: "string", example: "ann_8" },
                                                status: { type: "string", example: "pending" }
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
        '/api/v1/announcements/{id}': {
            put: {
                tags: ['Annonces'],
                summary: 'Mettre à jour une annonce',
                security: [
                    { auth: [] }
                ],
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: { type: 'string' },
                        description: 'ID de l\'annonce'
                    }
                ],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: "object",
                                properties: {
                                    title: { type: "string", example: "Updated Apartment" },
                                    description: { type: "string", example: "Updated description" },
                                    price: { type: "string", example: "1200" }
                                },
                                required: ["title", "description", "price"]
                            }
                        }
                    }
                },
                responses: {
                    200: {
                        description: 'Annonce mise à jour avec succès',
                        content: {
                            'application/json': {
                                schema: {
                                    type: "object",
                                    properties: {
                                        status: { type: "string", example: "success" },
                                        message: { type: "string", example: "Announcement updated successfully" },
                                        data: {
                                            type: "object",
                                            properties: {
                                                id: { type: "string", example: "ann_9" },
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
        '/api/v1/announcements/{id}': {
            delete: {
                tags: ['Annonces'],
                summary: 'Supprimer une annonce (propriétaire)',
                security: [
                    { auth: [] }
                ],
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: { type: 'string' },
                        description: 'ID de l\'annonce'
                    }
                ],
                responses: {
                    200: {
                        description: 'Annonce supprimée avec succès',
                        content: {
                            'application/json': {
                                schema: {
                                    type: "object",
                                    properties: {
                                        status: { type: "string", example: "success" },
                                        message: { type: "string", example: "Announcement deleted successfully" },
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
        '/api/v1/announcements/{id}/archive': {
            patch: {
                tags: ['Annonces'],
                summary: 'Archiver une annonce',
                security: [
                    { auth: [] }
                ],
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: { type: 'string' },
                        description: 'ID de l\'annonce'
                    }
                ],
                responses: {
                    200: {
                        description: 'Annonce archivée avec succès',
                        content: {
                            'application/json': {
                                schema: {
                                    type: "object",
                                    properties: {
                                        status: { type: "string", example: "success" },
                                        message: { type: "string", example: "Announcement archived successfully" },
                                        data: {
                                            type: "object",
                                            properties: {
                                                id: { type: "string", example: "ann_10" },
                                                status: { type: "string", example: "archived" }
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
        '/api/v1/announcements/{id}/resubmit': {
            patch: {
                tags: ['Annonces'],
                summary: 'Rétablir une annonce archivée',
                security: [
                    { auth: [] }
                ],
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: { type: 'string' },
                        description: 'ID de l\'annonce'
                    }
                ],
                responses: {
                    200: {
                        description: 'Annoncerétablie avec succès',
                        content: {
                            'application/json': {
                                schema: {
                                    type: "object",
                                    properties: {
                                        status: { type: "string", example: "success" },
                                        message: { type: "string", example: "Announcement resubmitted successfully" },
                                        data: {
                                            type: "object",
                                            properties: {
                                                id: { type: "string", example: "ann_11" },
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
        }
    }
};