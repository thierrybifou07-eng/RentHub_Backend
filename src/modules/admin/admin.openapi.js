// src/modules/admin/admin.openapi.js
import { makeErrorResponse, makeSuccessResponse } from "../../../config/openapi/openapi.helpers.js";

// --- Schémas de réponse ---
const UserResponseSchema = {
    type: "object",
    properties: {
        id: { type: "integer", example: 1 },
        email: { type: "string", example: "user@example.com" },
        firstname: { type: "string", example: "John" },
        lastname: { type: "string", example: "Doe" },
        phone: { type: "string", example: "+33612345678" },
        isActive: { type: "boolean", example: true },
        isEmailVerified: { type: "boolean", example: false },
        role: { type: "string", example: "user" },
        avatarUrl: { type: "string", nullable: true, example: null },
        createdAt: { type: "string", format: "date-time" }
    }
};

const UserStatusUpdateSchema = {
    type: "object",
    properties: {
        newStatus: { type: "string", example: "ACTIVE", description: "Nouveau statut de l'utilisateur" },
        currentStatus: { type: "string", example: "PENDING", description: "Statut actuel de l'utilisateur" },
        reason: { type: "string", example: "Verified by admin", description: "Raison de la modification (optionnelle)" }
    },
    required: ["newStatus", "currentStatus"]
};

const UserRoleUpdateSchema = {
    type: "object",
    properties: {
        newRole: { type: "string", example: "admin", description: "Nouveau rôle" },
        currentRole: { type: "string", example: "user", description: "Rôle actuel" }
    },
    required: ["newRole", "currentRole"]
};

const ManageAnnouncementStatusSchema = {
    type: "object",
    properties: {
        status: { type: "string", example: "ACTIVE", description: "Nouveau statut de l'annonce" },
        reason: { type: "string", example: "Content violates rules", description: "Raison (optionnelle)" }
    },
    required: ["status"]
};

const PaginatedUsersSchema = {
    type: "object",
    properties: {
        users: { type: "array", items: UserResponseSchema },
        total: { type: "integer", example: 120 },
        page: { type: "integer", example: 1 },
        limit: { type: "integer", example: 20 }
    }
};

// --- Configuration OpenAPI du module Admin ---
export const adminOpenApi = {
    openapi: "3.1.0",
    info: { title: "Module Administration", version: "1.0.0" },
    paths: {
        // ── GET /admin/stats ────────────────────────────────────────────
        "/api/v1/admin/stats": {
            get: {
                tags: ["Administration"],
                summary: "Statistiques globales du tableau de bord admin",
                security: [{ bearerAuth: [] }],
                responses: {
                    200: {
                        description: "Statistiques récupérées avec succès",
                        content: makeSuccessResponse("Dashboard stats retrieved successfully", {
                            type: "object",
                            properties: {
                                totalUsers: { type: "integer", example: 1500 },
                                activeUsers: { type: "integer", example: 1200 },
                                totalAnnouncements: { type: "integer", example: 350 },
                                pendingAnnouncements: { type: "integer", example: 45 },
                                totalSubscriptions: { type: "integer", example: 200 },
                                activeSubscriptions: { type: "integer", example: 180 }
                            }
                        })
                    },
                    403: {
                        description: "Accès refusé - Admin requis",
                        content: makeErrorResponse("Access forbidden")
                    }
                }
            }
        },

        // ── GET /admin/stats/evolution ──────────────────────────────────
        "/api/v1/admin/stats/evolution": {
            get: {
                tags: ["Administration"],
                summary: "Évolution temporelle des statistiques (graphiques)",
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: "period",
                        in: "query",
                        required: false,
                        schema: { type: "string", enum: ["7d", "30d", "90d", "1y"], default: "30d" },
                        description: "Période d'analyse"
                    }
                ],
                responses: {
                    200: {
                        description: "Évolution des statistiques récupérée avec succès",
                        content: makeSuccessResponse("Stats evolution retrieved successfully", {
                            type: "object",
                            properties: {
                                usersEvolution: {
                                    type: "array",
                                    items: {
                                        type: "object",
                                        properties: {
                                            date: { type: "string", format: "date", example: "2026-10-01" },
                                            count: { type: "integer", example: 15 }
                                        }
                                    }
                                },
                                announcementsEvolution: {
                                    type: "array",
                                    items: {
                                        type: "object",
                                        properties: {
                                            date: { type: "string", format: "date", example: "2026-10-01" },
                                            count: { type: "integer", example: 8 }
                                        }
                                    }
                                }
                            }
                        })
                    },
                    403: {
                        description: "Accès refusé - Admin requis",
                        content: makeErrorResponse("Access forbidden")
                    }
                }
            }
        },

        // ── GET /admin/pending-counts ───────────────────────────────────
        "/api/v1/admin/pending-counts": {
            get: {
                tags: ["Administration"],
                summary: "Nombre d'éléments en attente de modération",
                security: [{ bearerAuth: [] }],
                responses: {
                    200: {
                        description: "Compteurs des éléments en attente récupérés",
                        content: makeSuccessResponse("Pending counts retrieved successfully", {
                            type: "object",
                            properties: {
                                pendingAnnouncements: { type: "integer", example: 12 },
                                pendingReports: { type: "integer", example: 5 },
                                pendingSubscriptions: { type: "integer", example: 3 }
                            }
                        })
                    },
                    403: {
                        description: "Accès refusé - Admin requis",
                        content: makeErrorResponse("Access forbidden")
                    }
                }
            }
        },

        // ── GET /admin/recent-activity ──────────────────────────────────
        "/api/v1/admin/recent-activity": {
            get: {
                tags: ["Administration"],
                summary: "Activité récente de la plateforme",
                security: [{ bearerAuth: [] }],
                responses: {
                    200: {
                        description: "Activité récente récupérée avec succès",
                        content: makeSuccessResponse("Recent activity retrieved successfully", {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    type: { type: "string", example: "user_registered" },
                                    description: { type: "string", example: "New user registered: john.doe@example.com" },
                                    createdAt: { type: "string", format: "date-time" }
                                }
                            }
                        })
                    },
                    403: {
                        description: "Accès refusé - Admin requis",
                        content: makeErrorResponse("Access forbidden")
                    }
                }
            }
        },

        // ── PATCH /admin/manage-announcements-status/:id ────────────────
        "/api/v1/admin/manage-announcements-status/{id}": {
            patch: {
                tags: ["Administration"],
                summary: "Gérer le statut d'une annonce (admin uniquement)",
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: "id",
                        in: "path",
                        required: true,
                        schema: { type: "integer" },
                        description: "ID de l'annonce"
                    }
                ],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: ManageAnnouncementStatusSchema
                        }
                    }
                },
                responses: {
                    200: {
                        description: "Statut de l'annonce mis à jour avec succès",
                        content: makeSuccessResponse("Announcement status updated successfully", {
                            type: "object",
                            properties: {
                                id: { type: "integer", example: 42 },
                                status: { type: "string", example: "ACTIVE" }
                            }
                        })
                    },
                    400: {
                        description: "Données invalides",
                        content: makeErrorResponse("Invalid status")
                    },
                    403: {
                        description: "Accès refusé - Admin requis",
                        content: makeErrorResponse("Access forbidden")
                    },
                    404: {
                        description: "Annonce non trouvée",
                        content: makeErrorResponse("Announcement not found")
                    }
                }
            }
        },

        // ── GET /admin/users ────────────────────────────────────────────
        "/api/v1/admin/users": {
            get: {
                tags: ["Administration"],
                summary: "Liste des utilisateurs (admin uniquement)",
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: "page",
                        in: "query",
                        required: false,
                        schema: { type: "integer", minimum: 1, default: 1 },
                        description: "Numéro de page"
                    },
                    {
                        name: "limit",
                        in: "query",
                        required: false,
                        schema: { type: "integer", minimum: 1, maximum: 100, default: 20 },
                        description: "Nombre d'éléments par page"
                    },
                    {
                        name: "search",
                        in: "query",
                        required: false,
                        schema: { type: "string", maxLength: 255 },
                        description: "Terme de recherche (email, prénom, nom)"
                    },
                    {
                        name: "role_id",
                        in: "query",
                        required: false,
                        schema: { type: "integer" },
                        description: "Filtrer par ID de rôle"
                    },
                    {
                        name: "user_status_id",
                        in: "query",
                        required: false,
                        schema: { type: "integer" },
                        description: "Filtrer par ID de statut utilisateur"
                    }
                ],
                responses: {
                    200: {
                        description: "Liste des utilisateurs récupérée avec succès",
                        content: makeSuccessResponse("Users list retrieved successfully", PaginatedUsersSchema)
                    },
                    403: {
                        description: "Accès refusé - Admin requis",
                        content: makeErrorResponse("Access forbidden")
                    }
                }
            }
        },

        // ── GET /admin/users/:id ────────────────────────────────────────
        "/api/v1/admin/users/{id}": {
            get: {
                tags: ["Administration"],
                summary: "Obtenir un utilisateur par ID (admin uniquement)",
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: "id",
                        in: "path",
                        required: true,
                        schema: { type: "integer" },
                        description: "ID de l'utilisateur"
                    }
                ],
                responses: {
                    200: {
                        description: "Utilisateur récupéré avec succès",
                        content: makeSuccessResponse("User retrieved successfully", UserResponseSchema)
                    },
                    403: {
                        description: "Accès refusé - Admin requis",
                        content: makeErrorResponse("Access forbidden")
                    },
                    404: {
                        description: "Utilisateur non trouvé",
                        content: makeErrorResponse("User not found")
                    }
                }
            }
        },

        // ── PATCH /admin/users/:userId/status ──────────────────────────
        "/api/v1/admin/users/{userId}/status": {
            patch: {
                tags: ["Administration"],
                summary: "Mettre à jour le statut d'un utilisateur (admin uniquement)",
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: "userId",
                        in: "path",
                        required: true,
                        schema: { type: "integer" },
                        description: "ID de l'utilisateur"
                    }
                ],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: UserStatusUpdateSchema
                        }
                    }
                },
                responses: {
                    200: {
                        description: "Statut utilisateur mis à jour avec succès",
                        content: makeSuccessResponse("User status updated successfully", UserResponseSchema)
                    },
                    400: {
                        description: "Données invalides",
                        content: makeErrorResponse("Invalid status transition")
                    },
                    403: {
                        description: "Accès refusé - Admin requis",
                        content: makeErrorResponse("Access forbidden")
                    },
                    404: {
                        description: "Utilisateur non trouvé",
                        content: makeErrorResponse("User not found")
                    }
                }
            }
        },

        // ── PATCH /admin/users/:userId/role ────────────────────────────
        "/api/v1/admin/users/{userId}/role": {
            patch: {
                tags: ["Administration"],
                summary: "Mettre à jour le rôle d'un utilisateur (admin uniquement)",
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: "userId",
                        in: "path",
                        required: true,
                        schema: { type: "integer" },
                        description: "ID de l'utilisateur"
                    }
                ],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: UserRoleUpdateSchema
                        }
                    }
                },
                responses: {
                    200: {
                        description: "Rôle utilisateur mis à jour avec succès",
                        content: makeSuccessResponse("User role updated successfully", UserResponseSchema)
                    },
                    400: {
                        description: "Données invalides",
                        content: makeErrorResponse("Invalid role")
                    },
                    403: {
                        description: "Accès refusé - Admin requis",
                        content: makeErrorResponse("Access forbidden")
                    },
                    404: {
                        description: "Utilisateur non trouvé",
                        content: makeErrorResponse("User not found")
                    }
                }
            }
        },

        // ── PATCH /admin/users/:userId/verify ──────────────────────────
        "/api/v1/admin/users/{userId}/verify": {
            patch: {
                tags: ["Administration"],
                summary: "Vérifier manuellement le compte d'un utilisateur (admin uniquement)",
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: "userId",
                        in: "path",
                        required: true,
                        schema: { type: "integer" },
                        description: "ID de l'utilisateur"
                    }
                ],
                responses: {
                    200: {
                        description: "Compte utilisateur vérifié avec succès",
                        content: makeSuccessResponse("User account verified successfully", UserResponseSchema)
                    },
                    400: {
                        description: "Utilisateur déjà vérifié",
                        content: makeErrorResponse("User account already verified")
                    },
                    403: {
                        description: "Accès refusé - Admin requis",
                        content: makeErrorResponse("Access forbidden")
                    },
                    404: {
                        description: "Utilisateur non trouvé",
                        content: makeErrorResponse("User not found")
                    }
                }
            }
        }
    }
};
