// src/modules/announcements/announcement.openapi.js
import { makeErrorResponse, makeSuccessResponse } from "../../../config/openapi/openapi.helpers.js";

const AnnouncementSchema = {
    type: "object",
    properties: {
        id: { type: "integer", example: 1 },
        title: { type: "string", example: "Bel appartement T3 Paris 11" },
        description: { type: "string", example: "Appartement lumineux de 70m², 3 pièces, balcon." },
        price: { type: "number", example: 1200 },
        surface: { type: "number", nullable: true, example: 70 },
        rooms: { type: "integer", nullable: true, example: 3 },
        cityId: { type: "integer", nullable: true, example: 1 },
        propertyTypeId: { type: "integer", nullable: true, example: 2 },
        status: { type: "string", example: "active", enum: ["pending", "active", "rejected", "archived"] },
        ownerId: { type: "integer", example: 5 },
        rejectionReason: { type: "string", nullable: true, example: null },
        media: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    id: { type: "integer", example: 10 },
                    url: { type: "string", format: "uri", example: "https://res.cloudinary.com/example/image/upload/v1/ann.jpg" },
                    type: { type: "string", example: "image" }
                }
            }
        },
        createdAt: { type: "string", format: "date-time" },
        updatedAt: { type: "string", format: "date-time" }
    }
};

const PaginatedAnnouncementsSchema = {
    type: "object",
    properties: {
        announcements: { type: "array", items: AnnouncementSchema },
        total: { type: "integer", example: 150 },
        page: { type: "integer", example: 1 },
        limit: { type: "integer", example: 20 }
    }
};

const AnnouncementFilterParams = [
    { name: "page", in: "query", required: false, schema: { type: "integer", minimum: 1, default: 1 }, description: "Numéro de page" },
    { name: "limit", in: "query", required: false, schema: { type: "integer", minimum: 1, maximum: 100, default: 20 }, description: "Nombre d'annonces par page" },
    { name: "search", in: "query", required: false, schema: { type: "string", maxLength: 255 }, description: "Terme de recherche (titre, description)" },
    { name: "city_id", in: "query", required: false, schema: { type: "integer" }, description: "Filtrer par ville" },
    { name: "property_type_id", in: "query", required: false, schema: { type: "integer" }, description: "Filtrer par type de bien" },
    { name: "min_price", in: "query", required: false, schema: { type: "number" }, description: "Prix minimum" },
    { name: "max_price", in: "query", required: false, schema: { type: "number" }, description: "Prix maximum" }
];

// --- Configuration OpenAPI du module Annonces ---
export const announcementOpenApi = {
    openapi: "3.1.0",
    info: { title: "Module Annonces", version: "1.0.0" },
    paths: {
        // ── GET /announcements (public) & POST /announcements (owner) ───
        "/api/v1/announcements": {
            get: {
                tags: ["Annonces"],
                summary: "Lister toutes les annonces actives (public)",
                parameters: AnnouncementFilterParams,
                responses: {
                    200: {
                        description: "Annonces récupérées avec succès",
                        content: makeSuccessResponse("Announcements list retrieved successfully", PaginatedAnnouncementsSchema)
                    }
                }
            },
            post: {
                tags: ["Annonces"],
                summary: "Créer une nouvelle annonce (utilisateur authentifié)",
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        "multipart/form-data": {
                            schema: {
                                type: "object",
                                properties: {
                                    title: { type: "string", example: "Bel appartement T3" },
                                    description: { type: "string", example: "Appartement lumineux de 70m²" },
                                    price: { type: "number", example: 1200 },
                                    surface: { type: "number", example: 70 },
                                    rooms: { type: "integer", example: 3 },
                                    city_id: { type: "integer", example: 1 },
                                    property_type_id: { type: "integer", example: 2 },
                                    media: {
                                        type: "array",
                                        items: { type: "string", format: "binary" },
                                        description: "Fichiers images/vidéos (max 50 fichiers)",
                                        maxItems: 50
                                    }
                                },
                                required: ["title", "description", "price"]
                            }
                        }
                    }
                },
                responses: {
                    201: {
                        description: "Annonce créée avec succès (en attente de modération)",
                        content: makeSuccessResponse("Announcement created successfully", AnnouncementSchema)
                    },
                    400: {
                        description: "Données invalides",
                        content: makeErrorResponse("Validation error")
                    },
                    401: {
                        description: "Non authentifié",
                        content: makeErrorResponse("Unauthorized")
                    },
                    403: {
                        description: "Email non vérifié ou compte inactif",
                        content: makeErrorResponse("Email not verified")
                    }
                }
            }
        },

        // ── GET /announcements/me ───────────────────────────────────────
        "/api/v1/announcements/me": {
            get: {
                tags: ["Annonces"],
                summary: "Lister les annonces de l'utilisateur connecté",
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: "page", in: "query", required: false, schema: { type: "integer", minimum: 1, default: 1 }, description: "Numéro de page" },
                    { name: "limit", in: "query", required: false, schema: { type: "integer", minimum: 1, maximum: 100, default: 20 }, description: "Nombre d'annonces par page" },
                    { name: "status_id", in: "query", required: false, schema: { type: "integer" }, description: "Filtrer par statut (ID)" }
                ],
                responses: {
                    200: {
                        description: "Annonces de l'utilisateur récupérées",
                        content: makeSuccessResponse("User announcements retrieved successfully", PaginatedAnnouncementsSchema)
                    },
                    401: {
                        description: "Non authentifié",
                        content: makeErrorResponse("Unauthorized")
                    }
                }
            }
        },

        // ── GET /announcements/admin/pending ────────────────────────────
        "/api/v1/announcements/admin/pending": {
            get: {
                tags: ["Annonces"],
                summary: "File de modération — annonces en attente (admin uniquement)",
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: "page", in: "query", required: false, schema: { type: "integer", minimum: 1, default: 1 }, description: "Numéro de page" },
                    { name: "limit", in: "query", required: false, schema: { type: "integer", minimum: 1, maximum: 100, default: 20 }, description: "Nombre d'annonces par page" }
                ],
                responses: {
                    200: {
                        description: "Annonces en attente récupérées",
                        content: makeSuccessResponse("Pending announcements retrieved successfully", PaginatedAnnouncementsSchema)
                    },
                    401: {
                        description: "Non authentifié",
                        content: makeErrorResponse("Unauthorized")
                    },
                    403: {
                        description: "Accès refusé - Admin requis",
                        content: makeErrorResponse("Access forbidden")
                    }
                }
            }
        },

        // ── GET /announcements/admin/:id & DELETE /announcements/admin/:id
        "/api/v1/announcements/admin/{id}": {
            get: {
                tags: ["Annonces"],
                summary: "Obtenir une annonce (toutes informations) — admin uniquement",
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: "id", in: "path", required: true, schema: { type: "integer" }, description: "ID de l'annonce" }
                ],
                responses: {
                    200: {
                        description: "Annonce récupérée (vue admin)",
                        content: makeSuccessResponse("Announcement retrieved successfully", AnnouncementSchema)
                    },
                    403: { description: "Accès refusé", content: makeErrorResponse("Access forbidden") },
                    404: { description: "Annonce non trouvée", content: makeErrorResponse("Announcement not found") }
                }
            },
            delete: {
                tags: ["Annonces"],
                summary: "Supprimer une annonce — admin uniquement",
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: "id", in: "path", required: true, schema: { type: "integer" }, description: "ID de l'annonce" }
                ],
                responses: {
                    200: {
                        description: "Annonce supprimée par l'admin",
                        content: makeSuccessResponse("Announcement deleted successfully", { type: "object", nullable: true })
                    },
                    403: { description: "Accès refusé", content: makeErrorResponse("Access forbidden") },
                    404: { description: "Annonce non trouvée", content: makeErrorResponse("Announcement not found") }
                }
            }
        },

        // ── PUT /announcements/admin/:id/approve ────────────────────────
        "/api/v1/announcements/admin/{id}/approve": {
            put: {
                tags: ["Annonces"],
                summary: "Approuver une annonce — admin uniquement",
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: "id", in: "path", required: true, schema: { type: "integer" }, description: "ID de l'annonce" }
                ],
                responses: {
                    200: {
                        description: "Annonce approuvée avec succès",
                        content: makeSuccessResponse("Announcement approved successfully", {
                            type: "object",
                            properties: {
                                id: { type: "integer", example: 1 },
                                status: { type: "string", example: "active" }
                            }
                        })
                    },
                    403: { description: "Accès refusé", content: makeErrorResponse("Access forbidden") },
                    404: { description: "Annonce non trouvée", content: makeErrorResponse("Announcement not found") }
                }
            }
        },

        // ── PUT /announcements/admin/:id/reject ─────────────────────────
        "/api/v1/announcements/admin/{id}/reject": {
            put: {
                tags: ["Annonces"],
                summary: "Rejeter une annonce — admin uniquement",
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: "id", in: "path", required: true, schema: { type: "integer" }, description: "ID de l'annonce" }
                ],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    reason: { type: "string", example: "Contenu ne respectant pas nos règles d'utilisation." }
                                },
                                required: ["reason"]
                            }
                        }
                    }
                },
                responses: {
                    200: {
                        description: "Annonce rejetée avec succès",
                        content: makeSuccessResponse("Announcement rejected successfully", {
                            type: "object",
                            properties: {
                                id: { type: "integer", example: 1 },
                                status: { type: "string", example: "rejected" },
                                rejectionReason: { type: "string", example: "Contenu ne respectant pas nos règles." }
                            }
                        })
                    },
                    400: { description: "Raison manquante", content: makeErrorResponse("Rejection reason is required") },
                    403: { description: "Accès refusé", content: makeErrorResponse("Access forbidden") },
                    404: { description: "Annonce non trouvée", content: makeErrorResponse("Announcement not found") }
                }
            }
        },

        // ── GET /announcements/:id (public) & PUT /announcements/:id (owner) & DELETE /announcements/:id (owner)
        "/api/v1/announcements/{id}": {
            get: {
                tags: ["Annonces"],
                summary: "Obtenir le détail d'une annonce par ID (public)",
                parameters: [
                    { name: "id", in: "path", required: true, schema: { type: "integer" }, description: "ID de l'annonce" }
                ],
                responses: {
                    200: {
                        description: "Annonce récupérée avec succès",
                        content: makeSuccessResponse("Announcement retrieved successfully", AnnouncementSchema)
                    },
                    404: { description: "Annonce non trouvée", content: makeErrorResponse("Announcement not found") }
                }
            },
            put: {
                tags: ["Annonces"],
                summary: "Mettre à jour une annonce (propriétaire uniquement)",
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: "id", in: "path", required: true, schema: { type: "integer" }, description: "ID de l'annonce" }
                ],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    title: { type: "string", example: "Appartement T3 rénové" },
                                    description: { type: "string", example: "Description mise à jour" },
                                    price: { type: "number", example: 1300 },
                                    surface: { type: "number", example: 72 },
                                    rooms: { type: "integer", example: 3 },
                                    city_id: { type: "integer", example: 1 },
                                    property_type_id: { type: "integer", example: 2 }
                                }
                            }
                        }
                    }
                },
                responses: {
                    200: {
                        description: "Annonce mise à jour avec succès",
                        content: makeSuccessResponse("Announcement updated successfully", AnnouncementSchema)
                    },
                    400: { description: "Données invalides", content: makeErrorResponse("Validation error") },
                    401: { description: "Non authentifié", content: makeErrorResponse("Unauthorized") },
                    403: { description: "Non propriétaire de l'annonce", content: makeErrorResponse("Access forbidden") },
                    404: { description: "Annonce non trouvée", content: makeErrorResponse("Announcement not found") }
                }
            },
            delete: {
                tags: ["Annonces"],
                summary: "Supprimer une annonce (propriétaire uniquement)",
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: "id", in: "path", required: true, schema: { type: "integer" }, description: "ID de l'annonce" }
                ],
                responses: {
                    200: {
                        description: "Annonce supprimée avec succès",
                        content: makeSuccessResponse("Announcement deleted successfully", { type: "object", nullable: true })
                    },
                    401: { description: "Non authentifié", content: makeErrorResponse("Unauthorized") },
                    403: { description: "Non propriétaire de l'annonce", content: makeErrorResponse("Access forbidden") },
                    404: { description: "Annonce non trouvée", content: makeErrorResponse("Announcement not found") }
                }
            }
        },

        // ── PATCH /announcements/:id/archive ────────────────────────────
        "/api/v1/announcements/{id}/archive": {
            patch: {
                tags: ["Annonces"],
                summary: "Archiver une annonce active (propriétaire uniquement)",
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: "id", in: "path", required: true, schema: { type: "integer" }, description: "ID de l'annonce" }
                ],
                responses: {
                    200: {
                        description: "Annonce archivée avec succès",
                        content: makeSuccessResponse("Announcement archived successfully", {
                            type: "object",
                            properties: {
                                id: { type: "integer", example: 1 },
                                status: { type: "string", example: "archived" }
                            }
                        })
                    },
                    401: { description: "Non authentifié", content: makeErrorResponse("Unauthorized") },
                    403: { description: "Non propriétaire", content: makeErrorResponse("Access forbidden") },
                    404: { description: "Annonce non trouvée", content: makeErrorResponse("Announcement not found") }
                }
            }
        },

        // ── PATCH /announcements/:id/resubmit ───────────────────────────
        "/api/v1/announcements/{id}/resubmit": {
            patch: {
                tags: ["Annonces"],
                summary: "Resoumettre une annonce archivée ou rejetée (propriétaire uniquement)",
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: "id", in: "path", required: true, schema: { type: "integer" }, description: "ID de l'annonce" }
                ],
                responses: {
                    200: {
                        description: "Annonce resoumise avec succès (en attente de modération)",
                        content: makeSuccessResponse("Announcement resubmitted successfully", {
                            type: "object",
                            properties: {
                                id: { type: "integer", example: 1 },
                                status: { type: "string", example: "pending" }
                            }
                        })
                    },
                    400: { description: "L'annonce ne peut pas être resoumise dans son statut actuel", content: makeErrorResponse("Cannot resubmit announcement") },
                    401: { description: "Non authentifié", content: makeErrorResponse("Unauthorized") },
                    403: { description: "Non propriétaire", content: makeErrorResponse("Access forbidden") },
                    404: { description: "Annonce non trouvée", content: makeErrorResponse("Announcement not found") }
                }
            }
        }
    }
};
