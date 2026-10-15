// src/modules/catalog/catalog.openapi.js
import { makeErrorResponse, makeSuccessResponse } from "../../../config/openapi/openapi.helpers.js";

// --- Configuration OpenAPI du module Catalogue ---
export const catalogOpenApi = {
    openapi: "3.1.0",
    info: { title: "Module Catalogue", version: "1.0.0" },
    paths: {
        "/api/v1/cities": {
            get: {
                tags: ["Catalogue"],
                summary: "Lister toutes les villes",
                responses: {
                    200: {
                        description: "Villes récupérées (triées par nom)",
                        content: makeSuccessResponse("Cities retrieved successfully", {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    id: { type: "integer", example: 1 },
                                    name: { type: "string", example: "Paris" },
                                },
                            },
                        }),
                    },
                    500: { description: "Erreur serveur", content: makeErrorResponse("Internal server error") },
                },
            },
        },

        "/api/v1/property-types": {
            get: {
                tags: ["Catalogue"],
                summary: "Lister tous les types de biens",
                responses: {
                    200: {
                        description: "Types de biens récupérés (triés par libellé)",
                        content: makeSuccessResponse("Property types retrieved successfully", {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    id: { type: "integer", example: 1 },
                                    code: { type: "string", example: "APARTMENT" },
                                    label: { type: "string", example: "Appartement" },
                                },
                            },
                        }),
                    },
                    500: { description: "Erreur serveur", content: makeErrorResponse("Internal server error") },
                },
            },
        },
    },
};
