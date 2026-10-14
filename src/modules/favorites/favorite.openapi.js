// src/modules/favorites/favorite.openapi.js
export const favoriteOpenApi = {
    openapi: '3.1.0',
    info: { title: 'Module Favoris', version: '1.0.0' },
    paths: {
        '/api/v1/favorites': {
            get: {
                tags: ['Favoris'],
                summary: 'Obtenir les favoris de l\'utilisateur',
                security: [
                    { auth: [] }
                ],
                responses: {
                    200: {
                        description: 'Favoris récupérés avec succès',
                        content: {
                            'application/json': {
                                schema: {
                                    type: "object",
                                    properties: {
                                        status: { type: "string", example: "success" },
                                        message: { type: "string", example: "Favorites retrieved successfully" },
                                        data: {
                                            type: "array",
                                            items: {
                                                type: "object",
                                                properties: {
                                                    id: { type: "string", example: "fav_1" },
                                                    propertyId: { type: "string", example: "prop_1" },
                                                    propertyTitle: { type: "string", example: "Nice Apartment" }
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
        '/api/v1/favorites/{id}': {
            post: {
                tags: ['Favoris'],
                summary: 'Ajouter un favori',
                security: [
                    { auth: [] }
                ],
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: { type: 'string' },
                        description: 'ID du bien à ajouter en favoris'
                    }
                ],
                responses: {
                    200: {
                        description: 'Favori ajouté avec succès',
                        content: {
                            'application/json': {
                                schema: {
                                    type: "object",
                                    properties: {
                                        status: { type: "string", example: "success" },
                                        message: { type: "string", example: "Favorite added successfully" },
                                        data: { type: "object" }
                                    },
                                    required: ["status", "message", "data"]
                                }
                            }
                        }
                    },
                    400: {
                        description: 'Bien déjà en favoris',
                        content: {
                            'application/json': {
                                schema: {
                                    type: "object",
                                    properties: {
                                        status: { type: "string", example: "error" },
                                        message: { type: "string", example: "Property already in favorites" }
                                    },
                                    required: ["status", "message"]
                                }
                            }
                        }
                    }
                }
            },
            delete: {
                tags: ['Favoris'],
                summary: 'Supprimer un favori',
                security: [
                    { auth: [] }
                ],
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: { type: 'string' },
                        description: 'ID du bien à retirer des favoris'
                    }
                ],
                responses: {
                    200: {
                        description: 'Favori supprimé avec succès',
                        content: {
                            'application/json': {
                                schema: {
                                    type: "object",
                                    properties: {
                                        status: { type: "string", example: "success" },
                                        message: { type: "string", example: "Favorite removed successfully" },
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