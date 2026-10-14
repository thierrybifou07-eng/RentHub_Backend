// src/modules/super-admin/super-admin.openapi.js
export const superAdminOpenApi = {
    openapi: '3.1.0',
    info: { title: 'Module Super Admin', version: '1.0.0' },
    paths: {
        '/api/v1/super-admin/audit-logs': {
            get: {
                tags: ['Super Admin'],
                summary: 'Obtenir les logs d\'audit',
                security: [
                    { root: [] }
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
                        description: 'Logs d\'audit récupérés avec succès',
                        content: {
                            'application/json': {
                                schema: {
                                    type: "object",
                                    properties: {
                                        status: { type: "string", example: "success" },
                                        message: { type: "string", example: "Audit logs retrieved successfully" },
                                        data: {
                                            type: "object",
                                            properties: {
                                                logs: {
                                                    type: "array",
                                                    items: {
                                                        type: "object",
                                                        properties: {
                                                            id: { type: "string", example: "log_1" },
                                                            action: { type: "string", example: "user_created" },
                                                            userId: { type: "string", example: "usr_1" },
                                                            details: { type: "string", example: "User created" },
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
        '/api/v1/super-admin/audit-logs/stats': {
            get: {
                tags: ['Super Admin'],
                summary: 'Obtenir les statistiques des logs d\'audit',
                security: [
                    { root: [] }
                ],
                responses: {
                    200: {
                        description: 'Statistiques des logs récupérées avec succès',
                        content: {
                            'application/json': {
                                schema: {
                                    type: "object",
                                    properties: {
                                        status: { type: "string", example: "success" },
                                        message: { type: "string", example: "Audit stats retrieved successfully" },
                                        data: {
                                            type: "object",
                                            properties: {
                                                totalUsers: { type: "integer", example: 100 },
                                                totalActions: { type: "integer", example: 500 },
                                                actionsByType: {
                                                    type: "object",
                                                    additionalProperties: { type: "integer" },
                                                    example: { "user_created": 50, "user_deleted": 20 }
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
        '/api/v1/super-admin/audit-logs/{id}': {
            get: {
                tags: ['Super Admin'],
                summary: 'Obtenir un log d\'audit par ID',
                security: [
                    { root: [] }
                ],
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: { type: 'string' },
                        description: 'ID du log d\'audit'
                    }
                ],
                responses: {
                    200: {
                        description: 'Log d\'audit récupéré avec succès',
                        content: {
                            'application/json': {
                                schema: {
                                    type: "object",
                                    properties: {
                                        status: { type: "string", example: "success" },
                                        message: { type: "string", example: "Audit log retrieved successfully" },
                                        data: {
                                            type: "object",
                                            properties: {
                                                id: { type: "string", example: "log_2" },
                                                action: { type: "string", example: "user_updated" },
                                                userId: { type: "string", example: "usr_2" },
                                                details: { type: "string", example: "User updated" },
                                                createdAt: { type: "string", format: "date-time" }
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
        '/api/v1/super-admin/users': {
            get: {
                tags: ['Super Admin'],
                summary: 'Obtenir tous les utilisateurs avec leurs rôles',
                security: [
                    { root: [] }
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
                        description: 'Utilisateurs récupérés avec succès',
                        content: {
                            'application/json': {
                                schema: {
                                    type: "object",
                                    properties: {
                                        status: { type: "string", example: "success" },
                                        message: { type: "string", example: "Users with roles retrieved successfully" },
                                        data: {
                                            type: "object",
                                            properties: {
                                                users: {
                                                    type: "array",
                                                    items: {
                                                        type: "object",
                                                        properties: {
                                                            id: { type: "string", example: "usr_3" },
                                                            email: { type: "string", example: "user@example.com" },
                                                            firstname: { type: "string", example: "John" },
                                                            lastname: { type: "string", example: "Doe" },
                                                            role: { type: "string", example: "user" },
                                                            isActive: { type: "boolean", example: true }
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
        '/api/v1/super-admin/users/{id}': {
            get: {
                tags: ['Super Admin'],
                summary: 'Obtenir les détails d\'un utilisateur',
                security: [
                    { root: [] }
                ],
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: { type: 'string' },
                        description: 'ID de l\'utilisateur'
                    }
                ],
                responses: {
                    200: {
                        description: 'Utilisateur récupéré avec succès',
                        content: {
                            'application/json': {
                                schema: {
                                    type: "object",
                                    properties: {
                                        status: { type: "string", example: "success" },
                                        message: { type: "string", example: "User details retrieved successfully" },
                                        data: {
                                            type: "object",
                                            properties: {
                                                id: { type: "string", example: "usr_4" },
                                                email: { type: "string", example: "admin@example.com" },
                                                firstname: { type: "string", example: "Admin" },
                                                lastname: { type: "string", example: "User" },
                                                role: { type: "string", example: "admin" },
                                                isActive: { type: "boolean", example: true },
                                                createdAt: { type: "string", format: "date-time" }
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
        '/api/v1/super-admin/users/{id}/role': {
            patch: {
                tags: ['Super Admin'],
                summary: 'Changer le rôle d\'un utilisateur',
                security: [
                    { root: [] }
                ],
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: { type: 'string' },
                        description: 'ID de l\'utilisateur'
                    }
                ],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: "object",
                                properties: {
                                    newRole: { type: "string", example: "admin" },
                                    currentRole: { type: "string", example: "user" }
                                },
                                required: ["newRole", "currentRole"]
                            }
                        }
                    }
                },
                responses: {
                    200: {
                        description: 'Rôle utilisateur mis à jour avec succès',
                        content: {
                            'application/json': {
                                schema: {
                                    type: "object",
                                    properties: {
                                        status: { type: "string", example: "success" },
                                        message: { type: "string", example: "User role updated successfully" },
                                        data: {
                                            type: "object",
                                            properties: {
                                                id: { type: "string", example: "usr_5" },
                                                role: { type: "string", example: "admin" }
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
        '/api/v1/super-admin/users/{id}/status': {
            patch: {
                tags: ['Super Admin'],
                summary: 'Changer le statut d\'un utilisateur',
                security: [
                    { root: [] }
                ],
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: { type: 'string' },
                        description: 'ID de l\'utilisateur'
                    }
                ],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: "object",
                                properties: {
                                    newStatus: { type: "string", example: "ACTIVE" },
                                    currentStatus: { type: "string", example: "PENDING" },
                                    reason: { type: "string", example: "Admin review" }
                                },
                                required: ["newStatus", "currentStatus"]
                            }
                        }
                    }
                },
                responses: {
                    200: {
                        description: 'Statut utilisateur mis à jour avec succès',
                        content: {
                            'application/json': {
                                schema: {
                                    type: "object",
                                    properties: {
                                        status: { type: "string", example: "success" },
                                        message: { type: "string", example: "User status updated successfully" },
                                        data: {
                                            type: "object",
                                            properties: {
                                                id: { type: "string", example: "usr_6" },
                                                status: { type: "string", example: "ACTIVE" }
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
        '/api/v1/super-admin/users/{id}/password-reset': {
            patch: {
                tags: ['Super Admin'],
                summary: 'Réinitialiser le mot de passe d\'un utilisateur',
                security: [
                    { root: [] }
                ],
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: { type: 'string' },
                        description: 'ID de l\'utilisateur'
                    }
                ],
                responses: {
                    200: {
                        description: 'Mot de passe réinitialisé avec succès',
                        content: {
                            'application/json': {
                                schema: {
                                    type: "object",
                                    properties: {
                                        status: { type: "string", example: "success" },
                                        message: { type: "string", example: "Password reset successfully" },
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
        '/api/v1/super-admin/users/{id}': {
            delete: {
                tags: ['Super Admin'],
                summary: 'Supprimer un utilisateur (soft delete)',
                security: [
                    { root: [] }
                ],
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: { type: 'string' },
                        description: 'ID de l\'utilisateur'
                    }
                ],
                responses: {
                    200: {
                        description: 'Utilisateur supprimé avec succès',
                        content: {
                            'application/json': {
                                schema: {
                                    type: "object",
                                    properties: {
                                        status: { type: "string", example: "success" },
                                        message: { type: "string", example: "User deleted successfully" },
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