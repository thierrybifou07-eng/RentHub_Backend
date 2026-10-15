// src/modules/reports/report.openapi.js
import { makeErrorResponse, makeSuccessResponse } from "../../../config/openapi/openapi.helpers.js";

const ReportSchema = {
    type: "object",
    properties: {
        id: { type: "integer", example: 31 },
        reporter_id: { type: "integer", example: 1 },
        announcement_id: { type: "integer", example: 7 },
        announcement: { type: "object", nullable: true, properties: {} },
        reporter: { type: "object", nullable: true, properties: {} },
        reason: { type: "string", example: "L'annonce contient des informations trompeuses." },
        status_id: { type: "integer", example: 1, description: "1=PENDING, 2=REVIEWED, 3=DISMISSED, 4=ACTIONED" },
        admin_note: { type: "string", nullable: true },
        createdAt: { type: "string", format: "date-time" },
        updatedAt: { type: "string", format: "date-time" },
    },
};

const AdminNoteBody = {
    required: false,
    content: {
        "application/json": {
            schema: {
                type: "object",
                properties: { adminNote: { type: "string", maxLength: 2000, example: "Signalement retenu." } },
            },
        },
    },
};

const IdParam = [
    { name: "id", in: "path", required: true, schema: { type: "integer", minimum: 1 }, description: "ID du signalement" },
];
const Auth = [{ bearerAuth: [] }];
const AdminOnly = [{ bearerAuth: [] }];
const NotAdmin = { description: "Accès refusé - rôle admin requis", content: makeErrorResponse("Forbidden") };
const NotFound = { description: "Signalement introuvable", content: makeErrorResponse("Report not found") };

// --- Configuration OpenAPI du module Signalements ---
export const reportOpenApi = {
    openapi: "3.1.0",
    info: { title: "Module Rapports", version: "1.0.0" },
    paths: {
        "/api/v1/reports": {
            post: {
                tags: ["Rapports"],
                summary: "Signaler une annonce",
                security: Auth,
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    announcementId: { type: "integer", example: 7 },
                                    reason: { type: "string", minLength: 10, maxLength: 2000, example: "Photos non conformes à la réalité." },
                                },
                                required: ["announcementId", "reason"],
                            },
                        },
                    },
                },
                responses: {
                    200: { description: "Signalement créé", content: makeSuccessResponse("Report created successfully", ReportSchema) },
                    400: { description: "Raison trop courte ou données invalides", content: makeErrorResponse("Reason must be at least 10 characters") },
                    403: { description: "Email non vérifié ou compte inactif", content: makeErrorResponse("Forbidden") },
                    404: { description: "Annonce introuvable", content: makeErrorResponse("Announcement not found") },
                    409: { description: "Annonce déjà signalée par cet utilisateur", content: makeErrorResponse("Already reported") },
                },
            },
        },

        "/api/v1/reports/admin": {
            get: {
                tags: ["Rapports"],
                summary: "Lister les signalements",
                security: AdminOnly,
                parameters: [
                    {
                        name: "status_id",
                        in: "query",
                        schema: { type: "integer", enum: [1, 2, 3, 4] },
                        description: "1=PENDING, 2=REVIEWED, 3=DISMISSED, 4=ACTIONED",
                    },
                    { name: "page", in: "query", schema: { type: "integer", minimum: 1, default: 1 }, description: "Numéro de page" },
                    {
                        name: "limit",
                        in: "query",
                        schema: { type: "integer", minimum: 1, maximum: 100, default: 20 },
                        description: "Éléments par page",
                    },
                ],
                responses: {
                    200: {
                        description: "Signalements récupérés",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        status: { type: "string", example: "success" },
                                        message: { type: "string", example: "Reports retrieved successfully" },
                                        data: { type: "array", items: ReportSchema },
                                        pagination: {
                                            type: "object",
                                            properties: {
                                                page: { type: "integer", example: 1 },
                                                limit: { type: "integer", example: 20 },
                                                total: { type: "integer", example: 5 },
                                                totalPages: { type: "integer", example: 1 },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                    403: NotAdmin,
                },
            },
        },

        "/api/v1/reports/admin/:id": {
            get: {
                tags: ["Rapports"],
                summary: "Obtenir un signalement par ID",
                security: AdminOnly,
                parameters: IdParam,
                responses: {
                    200: { description: "Signalement récupéré", content: makeSuccessResponse("Report retrieved successfully", ReportSchema) },
                    400: { description: "ID invalide", content: makeErrorResponse("Invalid id") },
                    403: NotAdmin,
                    404: NotFound,
                },
            },
        },

        "/api/v1/reports/admin/:id/review": {
            patch: {
                tags: ["Rapports"],
                summary: "Marquer un signalement comme examiné",
                security: AdminOnly,
                parameters: IdParam,
                responses: {
                    200: {
                        description: "Signalement examiné",
                        content: makeSuccessResponse("Report reviewed successfully", ReportSchema),
                    },
                    400: { description: "ID invalide ou transition impossible", content: makeErrorResponse("Invalid status transition") },
                    403: NotAdmin,
                    404: NotFound,
                },
            },
        },

        "/api/v1/reports/admin/:id/dismiss": {
            patch: {
                tags: ["Rapports"],
                summary: "Classer un signalement sans suite",
                security: AdminOnly,
                parameters: IdParam,
                requestBody: AdminNoteBody,
                responses: {
                    200: {
                        description: "Signalement rejeté (sans suite)",
                        content: makeSuccessResponse("Report dismissed successfully", ReportSchema),
                    },
                    400: { description: "Note trop longue ou transition impossible", content: makeErrorResponse("Note cannot exceed 2000 characters") },
                    403: NotAdmin,
                    404: NotFound,
                },
            },
        },

        "/api/v1/reports/admin/:id/take-action": {
            patch: {
                tags: ["Rapports"],
                summary: "Prendre une action sur l'annonce signalée",
                description: "Applique une sanction sur l'annonce ou son auteur (archivage, suspension, suppression).",
                security: AdminOnly,
                parameters: IdParam,
                requestBody: AdminNoteBody,
                responses: {
                    200: {
                        description: "Action effectuée",
                        content: makeSuccessResponse("Action taken successfully", ReportSchema),
                    },
                    400: { description: "Note trop longue ou transition impossible", content: makeErrorResponse("Note cannot exceed 2000 characters") },
                    403: NotAdmin,
                    404: NotFound,
                },
            },
        },
    },
};
