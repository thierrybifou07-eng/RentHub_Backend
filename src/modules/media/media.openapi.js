// src/modules/media/media.openapi.js
import { makeErrorResponse, makeSuccessResponse } from "../../../config/openapi/openapi.helpers.js";

const MediaSchema = {
    type: "object",
    properties: {
        id: { type: "integer", example: 55 },
        user_id: { type: "integer", example: 1 },
        announcement_id: { type: "integer", nullable: true },
        media_type_id: { type: "integer", example: 1 },
        filename: { type: "string", example: "avatar_1712345678.png" },
        url: { type: "string", example: "/uploads/avatar/avatar_1712345678.png" },
        size: { type: "integer", example: 184320 },
        createdAt: { type: "string", format: "date-time" },
    },
};

const Auth = [{ bearerAuth: [] }];
const Forbidden = { description: "Email non vérifié ou compte inactif", content: makeErrorResponse("Forbidden") };
const NotOwner = { description: "Vous n'êtes pas propriétaire du média", content: makeErrorResponse("Forbidden") };

// --- Configuration OpenAPI du module Media ---
export const mediaOpenApi = {
    openapi: "3.1.0",
    info: { title: "Module Media", version: "1.0.0" },
    paths: {
        "/api/v1/media": {
            get: {
                tags: ["Media"],
                summary: "Lister mes médias",
                security: Auth,
                responses: {
                    200: {
                        description: "Médias récupérés",
                        content: makeSuccessResponse("Media retrieved successfully", { type: "array", items: MediaSchema }),
                    },
                    403: Forbidden,
                },
            },
        },

        "/api/v1/media/avatar": {
            post: {
                tags: ["Media"],
                summary: "Téléverser mon avatar",
                description: "Un seul fichier, champ `avatar`. Taille maximale : 5 Mo. Remplace l'avatar existant.",
                security: Auth,
                requestBody: {
                    required: true,
                    content: {
                        "multipart/form-data": {
                            schema: {
                                type: "object",
                                properties: {
                                    avatar: { type: "string", format: "binary", description: "Image de l'avatar (max 5 Mo)." },
                                },
                                required: ["avatar"],
                            },
                        },
                    },
                },
                responses: {
                    201: { description: "Avatar téléversé", content: makeSuccessResponse("Avatar uploaded successfully", MediaSchema) },
                    400: {
                        description: "Fichier trop volumineux ou upload échoué",
                        content: makeErrorResponse("Fichier trop volumineux. Taille maximale : 5 Mo."),
                    },
                    403: Forbidden,
                },
            },
            delete: {
                tags: ["Media"],
                summary: "Supprimer mon avatar",
                security: Auth,
                responses: {
                    200: {
                        description: "Avatar supprimé",
                        content: makeSuccessResponse("Avatar deleted successfully", { type: "null" }),
                    },
                    403: Forbidden,
                    404: { description: "Aucun avatar à supprimer", content: makeErrorResponse("No avatar found") },
                },
            },
        },

        "/api/v1/media/announcements/:id/images": {
            post: {
                tags: ["Media"],
                summary: "Téléverser des images pour une annonce",
                description: "Jusqu'à 50 images, champ `images`, 10 Mo max par fichier. Le propriétaire de l'annonce est requis.",
                security: Auth,
                parameters: [
                    { name: "id", in: "path", required: true, schema: { type: "integer", minimum: 1 }, description: "ID de l'annonce" },
                ],
                requestBody: {
                    required: true,
                    content: {
                        "multipart/form-data": {
                            schema: {
                                type: "object",
                                properties: {
                                    images: {
                                        type: "array",
                                        maxItems: 50,
                                        items: { type: "string", format: "binary" },
                                        description: "Images (10 Mo max par fichier).",
                                    },
                                },
                                required: ["images"],
                            },
                        },
                    },
                },
                responses: {
                    201: {
                        description: "Images téléversées",
                        content: makeSuccessResponse("Files uploaded successfully", { type: "array", items: MediaSchema }),
                    },
                    400: {
                        description: "Fichier trop volumineux ou trop de fichiers",
                        content: makeErrorResponse("Fichier trop volumineux. Taille maximale : 10 Mo."),
                    },
                    403: { description: "Vous n'êtes pas propriétaire de l'annonce", content: makeErrorResponse("Forbidden") },
                    404: { description: "Annonce introuvable", content: makeErrorResponse("Announcement not found") },
                },
            },
        },

        "/api/v1/media/announcements/:id/videos": {
            post: {
                tags: ["Media"],
                summary: "Téléverser des vidéos pour une annonce",
                description: "Jusqu'à 3 vidéos, champ `videos`, 20 Mo max par fichier. Le propriétaire de l'annonce est requis.",
                security: Auth,
                parameters: [
                    { name: "id", in: "path", required: true, schema: { type: "integer", minimum: 1 }, description: "ID de l'annonce" },
                ],
                requestBody: {
                    required: true,
                    content: {
                        "multipart/form-data": {
                            schema: {
                                type: "object",
                                properties: {
                                    videos: {
                                        type: "array",
                                        maxItems: 3,
                                        items: { type: "string", format: "binary" },
                                        description: "Vidéos (20 Mo max par fichier).",
                                    },
                                },
                                required: ["videos"],
                            },
                        },
                    },
                },
                responses: {
                    201: {
                        description: "Vidéos téléversées",
                        content: makeSuccessResponse("Videos uploaded successfully", { type: "array", items: MediaSchema }),
                    },
                    400: {
                        description: "Fichier trop volumineux ou trop de fichiers",
                        content: makeErrorResponse("Fichier trop volumineux. Taille maximale : 20 Mo."),
                    },
                    403: { description: "Vous n'êtes pas propriétaire de l'annonce", content: makeErrorResponse("Forbidden") },
                    404: { description: "Annonce introuvable", content: makeErrorResponse("Announcement not found") },
                },
            },
        },

        "/api/v1/media/:id": {
            delete: {
                tags: ["Media"],
                summary: "Supprimer un média",
                security: Auth,
                parameters: [
                    { name: "id", in: "path", required: true, schema: { type: "integer", minimum: 1 }, description: "ID du média" },
                ],
                responses: {
                    200: {
                        description: "Média supprimé",
                        content: makeSuccessResponse("Media deleted successfully", { type: "null" }),
                    },
                    400: { description: "ID invalide", content: makeErrorResponse("Invalid id") },
                    403: NotOwner,
                    404: { description: "Média introuvable", content: makeErrorResponse("Media not found") },
                },
            },
        },
    },
};
