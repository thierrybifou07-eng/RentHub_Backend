// src/modules/super-admin/super-admin.openapi.js
import { makeErrorResponse, makeSuccessResponse } from "../../../config/openapi/openapi.helpers.js";

const AuditLogSchema = {
    type: "object",
    properties: {
        id: { type: "integer", example: 501 },
        actor_id: { type: "integer", nullable: true, example: 3 },
        actor: { type: "object", nullable: true, properties: {} },
        action: {
            type: "string",
            enum: ["ROLE_CHANGE", "STATUS_CHANGE", "PASSWORD_RESET", "ACCOUNT_DELETE", "ACCOUNT_VERIFY", "ANNOUNCEMENT_MODERATE", "LOGIN", "LOGOUT"],
            example: "ROLE_CHANGE",
        },
        target_type: { type: "string", enum: ["USER", "ANNOUNCEMENT", "SUBSCRIPTION", "REPORT"], example: "USER" },
        target_id: { type: "integer", nullable: true, example: 12 },
        metadata: { type: "object", nullable: true, additionalProperties: true },
        ip_address: { type: "string", nullable: true, example: "127.0.0.1" },
        createdAt: { type: "string", format: "date-time" },
    },
};

const UserSchema = {
    type: "object",
    properties: {
        id: { type: "integer", example: 12 },
        firstname: { type: "string", example: "John" },
        lastname: { type: "string", example: "Doe" },
        email: { type: "string", format: "email", example: "user@example.com" },
        phone: { type: "string", nullable: true },
        role_id: { type: "integer", example: 2, description: "1=USER, 2=ADMIN, 3=ROOT, 4=TENANT, 5=OWNER, 6=AGENCY" },
        role: { type: "object", nullable: true, properties: {} },
        user_status_id: { type: "integer", example: 1, description: "1=ACTIVE, 2=INACTIVE, 3=SUSPENDED, 4=PENDING_VERIFICATION" },
        email_verified_at: { type: "string", format: "date-time", nullable: true },
        last_login_at: { type: "string", format: "date-time", nullable: true },
        deleted_at: { type: "string", format: "date-time", nullable: true },
        createdAt: { type: "string", format: "date-time" },
    },
};

const IdParam = [
    { name: "id", in: "path", required: true, schema: { type: "integer", minimum: 1 }, description: "ID de la ressource" },
];
const RootOnly = [{ bearerAuth: [] }];
const NotRoot = { description: "Accès refusé - rôle root requis", content: makeErrorResponse("Forbidden") };
const UserNotFound = { description: "Utilisateur introuvable", content: makeErrorResponse("User not found") };
const NotFound = { description: "Log d'audit introuvable", content: makeErrorResponse("Audit log not found") };

// --- Configuration OpenAPI du module Super Admin ---
export const superAdminOpenApi = {
    openapi: "3.1.0",
    info: { title: "Module Super Admin", version: "1.0.0" },
    paths: {
        "/api/v1/super-admin/audit-logs": {
            get: {
                tags: ["Super Admin"],
                summary: "Lister les logs d'audit",
                security: RootOnly,
                parameters: [
                    { name: "page", in: "query", schema: { type: "integer", minimum: 1, default: 1 }, description: "Numéro de page" },
                    {
                        name: "limit",
                        in: "query",
                        schema: { type: "integer", minimum: 1, maximum: 100, default: 20 },
                        description: "Éléments par page",
                    },
                    { name: "actor_id", in: "query", schema: { type: "integer" }, description: "Filtrer par auteur de l'action" },
                    { name: "action", in: "query", schema: { type: "string", maxLength: 50 }, description: "Filtrer par type d'action" },
                    { name: "target_type", in: "query", schema: { type: "string", maxLength: 50 }, description: "Filtrer par type de cible" },
                    { name: "date_from", in: "query", schema: { type: "string", format: "date-time" }, description: "Date de début (ISO)" },
                    { name: "date_to", in: "query", schema: { type: "string", format: "date-time" }, description: "Date de fin (ISO)" },
                ],
                responses: {
                    200: {
                        description: "Logs d'audit récupérés",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        status: { type: "string", example: "success" },
                                        message: { type: "string", example: "Audit logs retrieved successfully" },
                                        data: { type: "array", items: AuditLogSchema },
                                        pagination: {
                                            type: "object",
                                            properties: {
                                                page: { type: "integer", example: 1 },
                                                limit: { type: "integer", example: 20 },
                                                total: { type: "integer", example: 340 },
                                                totalPages: { type: "integer", example: 17 },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                    403: NotRoot,
                },
            },
        },

        "/api/v1/super-admin/audit-logs/stats": {
            get: {
                tags: ["Super Admin"],
                summary: "Statistiques agrégées des logs d'audit",
                security: RootOnly,
                responses: {
                    200: {
                        description: "Statistiques récupérées",
                        content: makeSuccessResponse("Audit stats retrieved successfully", {
                            type: "object",
                            properties: {
                                totalLogs: { type: "integer", example: 340 },
                                byAction: {
                                    type: "object",
                                    additionalProperties: { type: "integer" },
                                    example: { ROLE_CHANGE: 42, STATUS_CHANGE: 17, LOGIN: 281 },
                                },
                                byTargetType: {
                                    type: "object",
                                    additionalProperties: { type: "integer" },
                                    example: { USER: 120, ANNOUNCEMENT: 90 },
                                },
                            },
                        }),
                    },
                    403: NotRoot,
                },
            },
        },

        "/api/v1/super-admin/audit-logs/:id": {
            get: {
                tags: ["Super Admin"],
                summary: "Obtenir un log d'audit par ID",
                security: RootOnly,
                parameters: IdParam.map((p) => ({ ...p, description: "ID du log d'audit" })),
                responses: {
                    200: { description: "Log récupéré", content: makeSuccessResponse("Audit log retrieved successfully", AuditLogSchema) },
                    400: { description: "ID invalide", content: makeErrorResponse("Invalid id") },
                    403: NotRoot,
                    404: NotFound,
                },
            },
        },

        "/api/v1/super-admin/users": {
            get: {
                tags: ["Super Admin"],
                summary: "Lister tous les utilisateurs (tous rôles)",
                security: RootOnly,
                parameters: [
                    { name: "page", in: "query", schema: { type: "integer", minimum: 1, default: 1 }, description: "Numéro de page" },
                    {
                        name: "limit",
                        in: "query",
                        schema: { type: "integer", minimum: 1, maximum: 100, default: 20 },
                        description: "Éléments par page",
                    },
                    { name: "search", in: "query", schema: { type: "string", maxLength: 255 }, description: "Recherche (email, prénom, nom)" },
                    { name: "role_id", in: "query", schema: { type: "integer" }, description: "Filtrer par ID de rôle" },
                    { name: "user_status_id", in: "query", schema: { type: "integer" }, description: "Filtrer par ID de statut utilisateur" },
                ],
                responses: {
                    200: {
                        description: "Utilisateurs récupérés",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        status: { type: "string", example: "success" },
                                        message: { type: "string", example: "Users retrieved successfully" },
                                        data: { type: "array", items: UserSchema },
                                        pagination: {
                                            type: "object",
                                            properties: {
                                                page: { type: "integer", example: 1 },
                                                limit: { type: "integer", example: 20 },
                                                total: { type: "integer", example: 137 },
                                                totalPages: { type: "integer", example: 7 },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                    403: NotRoot,
                },
            },
        },

        "/api/v1/super-admin/users/:id": {
            get: {
                tags: ["Super Admin"],
                summary: "Obtenir le détail d'un utilisateur",
                security: RootOnly,
                parameters: IdParam.map((p) => ({ ...p, description: "ID de l'utilisateur" })),
                responses: {
                    200: { description: "Utilisateur récupéré", content: makeSuccessResponse("User retrieved successfully", UserSchema) },
                    400: { description: "ID invalide", content: makeErrorResponse("Invalid id") },
                    403: NotRoot,
                    404: UserNotFound,
                },
            },
            delete: {
                tags: ["Super Admin"],
                summary: "Supprimer un utilisateur (soft delete)",
                security: RootOnly,
                parameters: IdParam.map((p) => ({ ...p, description: "ID de l'utilisateur" })),
                responses: {
                    200: {
                        description: "Utilisateur supprimé",
                        content: makeSuccessResponse("User deleted successfully", { type: "null" }),
                    },
                    400: { description: "ID invalide", content: makeErrorResponse("Invalid id") },
                    403: NotRoot,
                    404: UserNotFound,
                },
            },
        },

        "/api/v1/super-admin/users/:id/role": {
            patch: {
                tags: ["Super Admin"],
                summary: "Changer le rôle d'un utilisateur",
                security: RootOnly,
                parameters: IdParam.map((p) => ({ ...p, description: "ID de l'utilisateur" })),
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    newRoleId: {
                                        type: "integer",
                                        enum: [1, 2, 3, 4, 5, 6],
                                        example: 2,
                                        description: "1=USER, 2=ADMIN, 3=ROOT, 4=TENANT, 5=OWNER, 6=AGENCY",
                                    },
                                },
                                required: ["newRoleId"],
                            },
                        },
                    },
                },
                responses: {
                    200: { description: "Rôle modifié", content: makeSuccessResponse("User role updated successfully", UserSchema) },
                    400: { description: "Rôle invalide ou identique", content: makeErrorResponse("Invalid role") },
                    403: NotRoot,
                    404: UserNotFound,
                },
            },
        },

        "/api/v1/super-admin/users/:id/status": {
            patch: {
                tags: ["Super Admin"],
                summary: "Changer le statut d'un utilisateur",
                security: RootOnly,
                parameters: IdParam.map((p) => ({ ...p, description: "ID de l'utilisateur" })),
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    newStatusId: { type: "integer", enum: [1, 2, 3, 4], example: 3, description: "1=ACTIVE, 2=INACTIVE, 3=SUSPENDED, 4=PENDING_VERIFICATION" },
                                    reason: { type: "string", maxLength: 500, example: "Comptes compromis" },
                                },
                                required: ["newStatusId"],
                            },
                        },
                    },
                },
                responses: {
                    200: { description: "Statut modifié", content: makeSuccessResponse("User status updated successfully", UserSchema) },
                    400: { description: "Statut invalide ou identique", content: makeErrorResponse("Invalid status") },
                    403: NotRoot,
                    404: UserNotFound,
                },
            },
        },

        "/api/v1/super-admin/users/:id/password-reset": {
            patch: {
                tags: ["Super Admin"],
                summary: "Réinitialiser le mot de passe d'un utilisateur",
                description: "Envoie un nouveau code de réinitialisation à l'utilisateur concerné.",
                security: RootOnly,
                parameters: IdParam.map((p) => ({ ...p, description: "ID de l'utilisateur" })),
                responses: {
                    200: {
                        description: "Réinitialisation déclenchée",
                        content: makeSuccessResponse("Password reset email sent successfully", { type: "null" }),
                    },
                    400: { description: "ID invalide", content: makeErrorResponse("Invalid id") },
                    403: NotRoot,
                    404: UserNotFound,
                },
            },
        },
    },
};
