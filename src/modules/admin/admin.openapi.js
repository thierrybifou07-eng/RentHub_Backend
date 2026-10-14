// src/modules/admin/admin.openapi.js
import {makeErrorResponse, makeSuccessResponse} from "../../../config/openapi/openapi.helpers.js";

// --- Schémas de réponse pour la gestion des utilisateurs ---
const UserResponseSchema = {
    type: "object",
    properties: {
        id: { type: "string", example: "usr_123" },
        email: { type: "string", example: "user@example.com" },
        firstname: { type: "string", example: "John" },
        lastname: { type: "string", example: " Doe" },
        isActive: { type: "boolean", example: true },
        role: { type: "string", example: "admin" },
        createdAt: { type: "string", format: "date-time" }
    }
};

// --- Schémas de requête pour la gestion des utilisateurs ---
const UserStatusUpdateSchema = {
    type: "object",
    properties: {
        newStatus: { type: "string", example: "ACTIVE" },
        currentStatus: { type: "string", example: "PENDING" },
        reason: { type: "string", example: "Admin review", description: "Raison de la modification" }
    },
    required: ["newStatus", "currentStatus"]
};

const UserRoleUpdateSchema = {
    type: "object",
    properties: {
        newRole: { type: "string", example: "admin" },
        currentRole: { type: "string", example: "user" }
    },
    required: ["newRole", "currentRole"]
};

// --- Configuration OpenAPI du module Admin ---
export const adminOpenApi = {
    openapi: '3.1.0',
    info: { title: 'Module Administration', version: '1.0.0' },
    paths: {
        '/api/v1/users': {
            get: {
                tags: ['Administration'],
                summary: 'Liste des utilisateurs (admin uniquement)',
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
                        name: 'search',
                        in: 'query',
                        required: false,
                        schema: { type: 'string', max: 255 },
                        description: 'Terme de recherche (email, prénom, nom)'
                    },
                    {
                        name: 'role_id',
                        in: 'query',
                        required: false,
                        schema: { type: 'integer' },
                        description: 'Filtrer par ID de rôle'
                    },
                    {
                        name: 'user_status_id',
                        in: 'query',
                        required: false,
                        schema: { type: 'integer' },
                        description: 'Filtrer par ID de statut utilisateur'
                    }
                ],
                responses: {
                    200: {
                        description: 'Liste des utilisateurs récupérée avec succès',
                        content: {
                            'application/json': {
                                schema: {
                                    type: "object",
                                    properties: {
                                        status: { type: "string", example: "success" },
                                        message: { type: "string", example: "Users list retrieved successfully" },
                                        data: {
                                            type: "object",
                                            properties: {
                                                users: {
                                                    type: "array",
                                                    items: UserResponseSchema
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
                    },
                    403: {
                        description: 'Accès refusé - Admin requis',
                        content: makeErrorResponse('Access forbidden')
                    }
                }
            }
        },
        '/api/v1/users/{id}': {
            get: {
                tags: ['Administration'],
                summary: 'Obtenir un utilisateur par ID (admin uniquement)',
                security: [
                    { auth: [] }
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
                                        message: { type: "string", example: "User retrieved successfully" },
                                        data: UserResponseSchema
                                    },
                                    required: ["status", "message", "data"]
                                }
                            }
                        }
                    },
                    404: {
                        description: 'Utilisateur non trouvé',
                        content: makeErrorResponse('User not found')
                    },
                    403: {
                        description: 'Accès refusé - Admin requis',
                        content: makeErrorResponse('Access forbidden')
                    }
                }
            }
        },
        '/users/{userId}/status': {
            patch: {
                tags: ['Administration'],
                summary: 'Mettre à jour le statut d\'un utilisateur (admin uniquement)',
                security: [
                    { auth: [] }
                ],
                parameters: [
                    {
                        name: 'userId',
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
                            schema: UserStatusUpdateSchema
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
                                        data: UserResponseSchema
                                    },
                                    required: ["status", "message", "data"]
                                }
                            }
                        }
                    },
                    400: {
                        description: 'Données invalides',
                        content: makeErrorResponse('Invalid data')
                    },
                    403: {
                        description: 'Accès refusé - Admin requis',
                        content: makeErrorResponse('Access forbidden')
                    }
                }
            }
        },
        '/users/{userId}/role': {
            patch: {
                tags: ['Administration'],
                summary: 'Mettre à jour le rôle d\'un utilisateur (admin uniquement)',
                security: [
                    { auth: [] }
                ],
                parameters: [
                    {
                        name: 'userId',
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
                            schema: UserRoleUpdateSchema
                        }
                    }
                },
                responses: {
                    200: {
                        description: 'Role utilisateur mis à jour avec succès',
                        content: {
                            'application/json': {
                                schema: {
                                    type: "object",
                                    properties: {
                                        status: { type: "string", example: "success" },
                                        message: { type: "string", example: "User role updated successfully" },
                                        data: UserResponseSchema
                                    },
                                    required: ["status", "message", "data"]
                                }
                            }
                        }
                    },
                    400: {
                        description: 'Données invalides',
                        content: makeErrorResponse('Invalid data')
                    },
                    403: {
                        description: 'Accès refusé - Admin requis',
                        content: makeErrorResponse('Access forbidden')
                    }
                }
            }
        },
        '/users/{userId}/verify': {
            patch: {
                tags: ['Administration'],
                summary: 'Vérifier le compte d\'un utilisateur (admin uniquement)',
                security: [
                    { auth: [] }
                ],
                parameters: [
                    {
                        name: 'userId',
                        in: 'path',
                        required: true,
                        schema: { type: 'string' },
                        description: 'ID de l\'utilisateur'
                    }
                ],
                responses: {
                    200: {
                        description: 'Compte utilisateur vérifié avec succès',
                        content: {
                            'application/json': {
                                schema: {
                                    type: "object",
                                    properties: {
                                        status: { type: "string", example: "success" },
                                        message: { type: "string", example: "User account verified successfully" },
                                        data: UserResponseSchema
                                    },
                                    required: ["status", "message", "data"]
                                }
                            }
                        }
                    },
                    400: {
                        description: 'Utilisateur non trouvé ou déjà vérifié',
                        content: makeErrorResponse('User not found or already verified')
                    },
                    403: {
                        description: 'Accès refusé - Admin requis',
                        content: makeErrorResponse('Access forbidden')
                    }
                }
            }
        }
    }
};