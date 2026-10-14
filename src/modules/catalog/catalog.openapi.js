// src/modules/catalog/catalog.openapi.js
export const catalogOpenApi = {
    openapi: '3.1.0',
    info: { title: 'Module Catalogue', version: '1.0.0' },
    paths: {
        '/api/v1/cities': {
            get: {
                tags: ['Catalogue'],
                summary: 'Liste des villes',
                responses: {
                    200: {
                        description: 'Liste des villes récupérée avec succès',
                        content: {
                            'application/json': {
                                schema: {
                                    type: "object",
                                    properties: {
                                        status: { type: "string", example: "success" },
                                        message: { type: "string", example: "Cities list retrieved successfully" },
                                        data: {
                                            type: "array",
                                            items: {
                                                type: "object",
                                                properties: {
                                                    id: { type: "string", example: "city_1" },
                                                    name: { type: "string", example: "Paris" },
                                                    country: { type: "string", example: "France" }
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
        '/api/v1/property-types': {
            get: {
                tags: ['Catalogue'],
                summary: 'Types de biens disponibles',
                responses: {
                    200: {
                        description: 'Types de biens récupérés avec succès',
                        content: {
                            'application/json': {
                                schema: {
                                    type: "object",
                                    properties: {
                                        status: { type: "string", example: "success" },
                                        message: { type: "string", example: "Property types retrieved successfully" },
                                        data: {
                                            type: "array",
                                            items: {
                                                type: "object",
                                                properties: {
                                                    id: { type: "string", example: "type_1" },
                                                    name: { type: "string", example: "Apartment" },
                                                    description: { type: "string", example: "Appartement" }
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
        }
    }
};