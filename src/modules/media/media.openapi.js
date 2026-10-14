// src/modules/media/media.openapi.js
export const mediaOpenApi = {
    openapi: '3.1.0',
    info: { title: 'Module Media', version: '1.0.0' },
    paths: {
        '/api/v1/media': {
            get: {
                tags: ['Media'],
                summary: 'Obtenir les médias de l\'utilisateur',
                security: [
                    { auth: [] }
                ],
                responses: {
                    200: {
                        description: 'Médias récupérés avec succès',
                        content: {
                            'application/json': {
                                schema: {
                                    type: "object",
                                    properties: {
                                        status: { type: "string", example: "success" },
                                        message: { type: "string", example: "User media retrieved successfully" },
                                        data: {
                                            type: "array",
                                            items: {
                                                type: "object",
                                                properties: {
                                                    id: { type: "string", example: "media_1" },
                                                    type: { type: "string", example: "image" },
                                                    url: { type: "string", format: "uri", example: "https://example.com/media.jpg" },
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
        '/api/v1/media/avatar': {
            post: {
                tags: ['Media'],
                summary: 'Télécharger une avatar',
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
                                    avatar: {
                                        type: "string",
                                        format: "binary",
                                        description: "Fichier image de l'avatar"
                                    }
                                },
                                required: ["avatar"]
                            }
                        }
                    }
                },
                responses: {
                    200: {
                        description: 'Avatar téléchargé avec succès',
                        content: {
                            'application/json': {
                                schema: {
                                    type: "object",
                                    properties: {
                                        status: { type: "string", example: "success" },
                                        message: { type: "string", example: "Avatar uploaded successfully" },
                                        data: {
                                            type: "object",
                                            properties: {
                                                url: { type: "string", format: "uri", example: "https://example.com/avatar.jpg" }
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
        '/api/v1/media/avatar': {
            delete: {
                tags: ['Media'],
                summary: 'Supprimer l\'avatar',
                security: [
                    { auth: [] }
                ],
                responses: {
                    200: {
                        description: 'Avatar supprimé avec succès',
                        content: {
                            'application/json': {
                                schema: {
                                    type: "object",
                                    properties: {
                                        status: { type: "string", example: "success" },
                                        message: { type: "string", example: "Avatar deleted successfully" },
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
        '/api/v1/media/announcements/{id}/images': {
            post: {
                tags: ['Media'],
                summary: 'Télécharger des images pour une annonce',
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
                        'multipart/form-data': {
                            schema: {
                                type: "object",
                                properties: {
                                    images: {
                                        type: "array",
                                        items: {
                                            type: "string",
                                            format: "binary"
                                        },
                                        description: "Fichiers images",
                                        maxItems: 50
                                    }
                                },
                                required: ["images"]
                            }
                        }
                    }
                },
                responses: {
                    200: {
                        description: 'Images téléchargées avec succès',
                        content: {
                            'application/json': {
                                schema: {
                                    type: "object",
                                    properties: {
                                        status: { type: "string", example: "success" },
                                        message: { type: "string", example: "Images uploaded successfully" },
                                        data: {
                                            type: "object",
                                            properties: {
                                                urls: {
                                                    type: "array",
                                                    items: { type: "string", format: "uri" },
                                                    example: ["https://example.com/image1.jpg"]
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
        '/api/v1/media/announcements/{id}/videos': {
            post: {
                tags: ['Media'],
                summary: 'Télécharger des vidéos pour une annonce',
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
                        'multipart/form-data': {
                            schema: {
                                type: "object",
                                properties: {
                                    videos: {
                                        type: "array",
                                        items: {
                                            type: "string",
                                            format: "binary"
                                        },
                                        description: "Fichiers vidéos",
                                        maxItems: 3
                                    }
                                },
                                required: ["videos"]
                            }
                        }
                    }
                },
                responses: {
                    200: {
                        description: 'Vidéos téléchargées avec succès',
                        content: {
                            'application/json': {
                                schema: {
                                    type: "object",
                                    properties: {
                                        status: { type: "string", example: "success" },
                                        message: { type: "string", example: "Videos uploaded successfully" },
                                        data: {
                                            type: "object",
                                            properties: {
                                                urls: {
                                                    type: "array",
                                                    items: { type: "string", format: "uri" },
                                                    example: ["https://example.com/video1.mp4"]
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
        '/api/v1/media/{id}': {
            delete: {
                tags: ['Media'],
                summary: 'Supprimer un média',
                security: [
                    { auth: [] }
                ],
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: { type: 'string' },
                        description: 'ID du média à supprimer'
                    }
                ],
                responses: {
                    200: {
                        description: 'Média supprimé avec succès',
                        content: {
                            'application/json': {
                                schema: {
                                    type: "object",
                                    properties: {
                                        status: { type: "string", example: "success" },
                                        message: { type: "string", example: "Media deleted successfully" },
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