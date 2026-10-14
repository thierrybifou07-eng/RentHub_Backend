// src/modules/auth/auth.openapi.js
import {makeErrorResponse, makeSuccessResponse} from "../../../config/openapi/openapi.helpers.js";

// --- Schémas dédiés UNIQUEMENT à la documentation des réponses ---
const UserSafeResponseSchema = {
    type: "object",
    properties: {
        id: { type: "string", example: "usr_123" },
        email: { type: "string", example: "user@example.com" },
        isActive: { type: "boolean", example: true }
    }
};

const LoginResponseDataSchema = {
    type: "object",
    properties: {
        token: { type: "string", example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." },
        refreshToken: { type: "string", example: "def502003c27e8a9..." },
        user: UserSafeResponseSchema
    }
};

// --- Configuration OpenAPI du module Auth ---
export const authOpenApi = {
    openapi: '3.1.0',
    info: { title: 'Module Authentification', version: '1.0.0' },
    paths: {
        '/api/v1/auth/login': {
            post: {
                tags: ['Authentification'],
                summary: 'Connexion utilisateur',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: "object",
                                properties: {
                                    email: { type: "string", format: "email" },
                                    password: { type: "string", format: "password" }
                                },
                                required: ["email", "password"]
                            }
                        }
                    }
                },
                responses: {
                    200: {
                        description: 'Connexion réussie',
                        content: {
                            'application/json': {
                                schema: LoginResponseDataSchema
                            }
                        }
                    },
                    403: {
                        description: 'Compte inactif',
                        content: makeErrorResponse('Account is not active')
                    }
                }
            }
        },
        '/api/v1/auth/verify-email': {
            get: {
                tags: ['Authentification'],
                summary: 'Vérifier l\'adresse email',
                parameters: [
                    {
                        name: 'token',
                        in: 'query',
                        required: true,
                        schema: { type: 'string' },
                        description: 'Le token de vérification reçu par email'
                    }
                ],
                responses: {
                    200: {
                        description: 'Email vérifié avec succès',
                        content: {
                            'application/json': {
                                schema: {
                                    properties: {
                                        status: { type: "string", example: "success" },
                                        message: { type: "string", example: "Email verified successfully" },
                                        data: { type: "object" }
                                    },
                                    type: "object"
                                }
                            }
                        }
                    }
                }
            }
        },
        '/api/v1/auth/reset-password': {
            post: {
                tags: ['Authentification'],
                summary: 'Réinitialiser le mot de passe',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: "object",
                                properties: {
                                    email: { type: "string", format: "email" }
                                },
                                required: ["email"]
                            }
                        }
                    }
                },
                responses: {
                    200: {
                        description: 'Mot de passe réinitialisé',
                        content: {
                            'application/json': {
                                schema: {
                                    type: "object",
                                    properties: {
                                        status: { type: "string", example: "success" },
                                        message: { type: "string", example: "Password has been reset" },
                                        data: { type: "object" }
                                    },
                                }
                            }
                        }
                    }
                }
            }
        }
    }
};