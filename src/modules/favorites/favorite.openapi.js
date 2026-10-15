// src/modules/favorites/favorite.openapi.js
import { makeErrorResponse, makeSuccessResponse } from "../../../config/openapi/openapi.helpers.js";

const FavoriteSchema = {
    type: "object",
    properties: {
        id: { type: "integer", example: 18 },
        user_id: { type: "integer", example: 1 },
        announcement_id: { type: "integer", example: 7 },
        announcement: {
            type: "object",
            nullable: true,
            properties: {
                id: { type: "integer", example: 7 },
                title: { type: "string", example: "Appartement lumineux" },
                price: { type: "number", example: 1200 },
                status_id: { type: "integer", example: 1 },
                media: { type: "array", items: { type: "object", properties: {} } },
            },
        },
        createdAt: { type: "string", format: "date-time" },
    },
};

const Auth = [{ bearerAuth: [] }];
const Forbidden = { description: "Email non vérifié ou compte inactif", content: makeErrorResponse("Forbidden") };

// --- Configuration OpenAPI du module Favoris ---
export const favoriteOpenApi = {
    openapi: "3.1.0",
    info: { title: "Module Favoris", version: "1.0.0" },
    paths: {
        "/api/v1/favorites": {
            get: {
                tags: ["Favoris"],
                summary: "Lister mes annonces favorites",
                security: Auth,
                parameters: [
                    { name: "page", in: "query", schema: { type: "integer", minimum: 1, default: 1 }, description: "Numéro de page" },
                    {
                        name: "limit",
                        in: "query",
                        schema: { type: "integer", minimum: 1, default: 20 },
                        description: "Éléments par page",
                    },
                ],
                responses: {
                    200: {
                        description: "Favoris récupérés",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        status: { type: "string", example: "success" },
                                        message: { type: "string", example: "Favorites retrieved successfully" },
                                        data: { type: "array", items: FavoriteSchema },
                                        pagination: {
                                            type: "object",
                                            properties: {
                                                page: { type: "integer", example: 1 },
                                                limit: { type: "integer", example: 20 },
                                                total: { type: "integer", example: 4 },
                                                totalPages: { type: "integer", example: 1 },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                    403: Forbidden,
                },
            },
        },

        "/api/v1/favorites/:id": {
            post: {
                tags: ["Favoris"],
                summary: "Ajouter une annonce à mes favoris",
                security: Auth,
                parameters: [
                    { name: "id", in: "path", required: true, schema: { type: "integer", minimum: 1 }, description: "ID de l'annonce" },
                ],
                responses: {
                    201: {
                        description: "Annonce ajoutée aux favoris",
                        content: makeSuccessResponse("Announcement added to favorites", { type: "null" }),
                    },
                    400: { description: "ID invalide", content: makeErrorResponse("Invalid id") },
                    403: {
                        description: "Annonce non active, propriétaire inactif, ou compte non autorisé",
                        content: makeErrorResponse("Tenants can only favorite active announcements"),
                    },
                    404: { description: "Annonce introuvable", content: makeErrorResponse("Announcement not found") },
                    409: { description: "Annonce déjà en favoris", content: makeErrorResponse("This announcement is already in your favorites") },
                },
            },
            delete: {
                tags: ["Favoris"],
                summary: "Retirer une annonce de mes favoris",
                security: Auth,
                parameters: [
                    { name: "id", in: "path", required: true, schema: { type: "integer", minimum: 1 }, description: "ID de l'annonce" },
                ],
                responses: {
                    200: {
                        description: "Annonce retirée des favoris",
                        content: makeSuccessResponse("Announcement removed from favorites", { type: "null" }),
                    },
                    400: { description: "ID invalide", content: makeErrorResponse("Invalid id") },
                    403: Forbidden,
                    404: { description: "Favori introuvable", content: makeErrorResponse("Favorite not found") },
                },
            },
        },
    },
};
