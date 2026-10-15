// src/modules/subscriptions/subscription.openapi.js
import { makeErrorResponse, makeSuccessResponse } from "../../../config/openapi/openapi.helpers.js";

const PlanSchema = {
    type: "object",
    properties: {
        id: { type: "integer", example: 1 },
        code: { type: "string", example: "BASIC" },
        label: { type: "string", example: "Basique" },
        price: { type: "number", example: 9.99 },
        duration_days: { type: "integer", example: 30 },
        features: { type: "array", items: { type: "string" }, example: ["5 annonces", "Support email"] },
    },
};

const SubscriptionSchema = {
    type: "object",
    properties: {
        id: { type: "integer", example: 12 },
        user_id: { type: "integer", example: 1 },
        plan_id: { type: "integer", example: 1 },
        plan: { type: "object", nullable: true, properties: {} },
        status: {
            type: "string",
            enum: ["PENDING", "WAITING_PAYMENT", "ACTIVE", "CANCELLED", "REJECTED", "FAILED", "EXPIRED"],
            example: "ACTIVE",
        },
        payment_reference: { type: "string", nullable: true },
        starts_at: { type: "string", format: "date-time", nullable: true },
        expires_at: { type: "string", format: "date-time", nullable: true },
        admin_note: { type: "string", nullable: true },
        createdAt: { type: "string", format: "date-time" },
    },
};

const AdminNoteBody = {
    required: false,
    content: {
        "application/json": {
            schema: {
                type: "object",
                properties: { adminNote: { type: "string", maxLength: 2000, example: "Paiement vérifié manuellement." } },
            },
        },
    },
};

const Auth = [{ bearerAuth: [] }];
const AdminOnly = [{ bearerAuth: [] }];
const NotAdmin = { description: "Accès refusé - rôle admin requis", content: makeErrorResponse("Forbidden") };
const NotFound = { description: "Abonnement introuvable", content: makeErrorResponse("Subscription not found") };
const Forbidden = { description: "Email non vérifié ou compte inactif", content: makeErrorResponse("Forbidden") };

// --- Configuration OpenAPI du module Abonnements ---
export const subscriptionOpenApi = {
    openapi: "3.1.0",
    info: { title: "Module Abonnements", version: "1.0.0" },
    paths: {
        "/api/v1/subscriptions/plans": {
            get: {
                tags: ["Abonnements"],
                summary: "Lister les plans d'abonnement",
                responses: {
                    200: {
                        description: "Plans récupérés",
                        content: makeSuccessResponse("Plans retrieved successfully", { type: "array", items: PlanSchema }),
                    },
                },
            },
        },

        "/api/v1/subscriptions/subscribe": {
            post: {
                tags: ["Abonnements"],
                summary: "S'abonner à un plan",
                security: Auth,
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    planId: { type: "integer", example: 1 },
                                    paymentReference: {
                                        type: "string",
                                        maxLength: 255,
                                        description: "Référence du paiement déjà effectué (paiement hors Stripe).",
                                    },
                                    simulated: { type: "boolean", description: "Drapeaux de test, bypass de la vérification Stripe." },
                                },
                                required: ["planId"],
                            },
                        },
                    },
                },
                responses: {
                    200: {
                        description: "Abonnement créé",
                        content: makeSuccessResponse("Subscription created successfully", SubscriptionSchema),
                    },
                    400: { description: "Données invalides", content: makeErrorResponse("Invalid data") },
                    403: Forbidden,
                    404: { description: "Plan introuvable", content: makeErrorResponse("Plan not found") },
                    409: { description: "Un abonnement est déjà en cours", content: makeErrorResponse("Subscription already exists") },
                },
            },
        },

        "/api/v1/subscriptions/me": {
            get: {
                tags: ["Abonnements"],
                summary: "Obtenir mon abonnement actif",
                security: Auth,
                responses: {
                    200: {
                        description: "Abonnement récupéré",
                        content: makeSuccessResponse("Subscription retrieved successfully", SubscriptionSchema),
                    },
                    403: Forbidden,
                    404: { description: "Aucun abonnement actif", content: makeErrorResponse("No active subscription") },
                },
            },
        },

        "/api/v1/subscriptions/history": {
            get: {
                tags: ["Abonnements"],
                summary: "Historique de mes abonnements",
                security: Auth,
                parameters: [
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
                        description: "Historique récupéré",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        status: { type: "string", example: "success" },
                                        message: { type: "string", example: "Subscription history retrieved successfully" },
                                        data: { type: "array", items: SubscriptionSchema },
                                        pagination: {
                                            type: "object",
                                            properties: {
                                                page: { type: "integer", example: 1 },
                                                limit: { type: "integer", example: 20 },
                                                total: { type: "integer", example: 3 },
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

        "/api/v1/subscriptions/admin": {
            get: {
                tags: ["Abonnements"],
                summary: "Lister tous les abonnements",
                security: AdminOnly,
                parameters: [
                    { name: "page", in: "query", schema: { type: "integer", minimum: 1, default: 1 }, description: "Numéro de page" },
                    {
                        name: "limit",
                        in: "query",
                        schema: { type: "integer", minimum: 1, maximum: 100, default: 20 },
                        description: "Éléments par page",
                    },
                    {
                        name: "status",
                        in: "query",
                        schema: {
                            type: "string",
                            enum: ["PENDING", "WAITING_PAYMENT", "ACTIVE", "CANCELLED", "REJECTED", "FAILED", "EXPIRED"],
                        },
                        description: "Filtrer par statut",
                    },
                ],
                responses: {
                    200: {
                        description: "Abonnements récupérés",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        status: { type: "string", example: "success" },
                                        message: { type: "string", example: "Subscriptions retrieved successfully" },
                                        data: { type: "array", items: SubscriptionSchema },
                                        pagination: {
                                            type: "object",
                                            properties: {
                                                page: { type: "integer", example: 1 },
                                                limit: { type: "integer", example: 20 },
                                                total: { type: "integer", example: 23 },
                                                totalPages: { type: "integer", example: 2 },
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

        "/api/v1/subscriptions/admin/:id": {
            get: {
                tags: ["Abonnements"],
                summary: "Obtenir un abonnement par ID",
                security: AdminOnly,
                parameters: [
                    { name: "id", in: "path", required: true, schema: { type: "integer", minimum: 1 }, description: "ID de l'abonnement" },
                ],
                responses: {
                    200: {
                        description: "Abonnement récupéré",
                        content: makeSuccessResponse("Subscription retrieved successfully", SubscriptionSchema),
                    },
                    400: { description: "ID invalide", content: makeErrorResponse("Invalid id") },
                    403: NotAdmin,
                    404: NotFound,
                },
            },
        },

        "/api/v1/subscriptions/admin/:id/activate": {
            patch: {
                tags: ["Abonnements"],
                summary: "Activer un abonnement",
                security: AdminOnly,
                parameters: [
                    { name: "id", in: "path", required: true, schema: { type: "integer", minimum: 1 }, description: "ID de l'abonnement" },
                ],
                requestBody: AdminNoteBody,
                responses: {
                    200: {
                        description: "Abonnement activé",
                        content: makeSuccessResponse("Subscription activated successfully", SubscriptionSchema),
                    },
                    400: { description: "ID invalide ou transition impossible", content: makeErrorResponse("Invalid status transition") },
                    403: NotAdmin,
                    404: NotFound,
                },
            },
        },

        "/api/v1/subscriptions/admin/:id/reject": {
            patch: {
                tags: ["Abonnements"],
                summary: "Rejeter un abonnement",
                security: AdminOnly,
                parameters: [
                    { name: "id", in: "path", required: true, schema: { type: "integer", minimum: 1 }, description: "ID de l'abonnement" },
                ],
                requestBody: AdminNoteBody,
                responses: {
                    200: {
                        description: "Abonnement rejeté",
                        content: makeSuccessResponse("Subscription rejected successfully", SubscriptionSchema),
                    },
                    400: { description: "ID invalide ou transition impossible", content: makeErrorResponse("Invalid status transition") },
                    403: NotAdmin,
                    404: NotFound,
                },
            },
        },

        "/api/v1/subscriptions/admin/:id/cancel": {
            patch: {
                tags: ["Abonnements"],
                summary: "Annuler un abonnement",
                security: AdminOnly,
                parameters: [
                    { name: "id", in: "path", required: true, schema: { type: "integer", minimum: 1 }, description: "ID de l'abonnement" },
                ],
                requestBody: AdminNoteBody,
                responses: {
                    200: {
                        description: "Abonnement annulé",
                        content: makeSuccessResponse("Subscription cancelled successfully", SubscriptionSchema),
                    },
                    400: { description: "ID invalide ou transition impossible", content: makeErrorResponse("Invalid status transition") },
                    403: NotAdmin,
                    404: NotFound,
                },
            },
        },

        "/api/v1/subscriptions/create-payment-intent": {
            post: {
                tags: ["Abonnements"],
                summary: "Créer une intention de paiement Stripe",
                security: Auth,
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: { planId: { type: "integer", example: 1 } },
                                required: ["planId"],
                            },
                        },
                    },
                },
                responses: {
                    200: {
                        description: "Intention de paiement créée",
                        content: makeSuccessResponse("Payment intent created successfully", {
                            type: "object",
                            properties: {
                                clientSecret: { type: "string", example: "pi_3abc123_secret_xyz" },
                                paymentIntentId: { type: "string", example: "pi_3abc123" },
                            },
                        }),
                    },
                    400: { description: "Données invalides", content: makeErrorResponse("Invalid data") },
                    403: Forbidden,
                    404: { description: "Plan introuvable", content: makeErrorResponse("Plan not found") },
                },
            },
        },

        "/api/v1/subscriptions/confirm-payment": {
            post: {
                tags: ["Abonnements"],
                summary: "Confirmer le paiement Stripe",
                description: "Valide l'intention de paiement auprès de Stripe et active l'abonnement correspondant.",
                security: Auth,
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    paymentIntentId: { type: "string", pattern: "^pi_", example: "pi_3abc123" },
                                },
                                required: ["paymentIntentId"],
                            },
                        },
                    },
                },
                responses: {
                    200: {
                        description: "Paiement confirmé",
                        content: makeSuccessResponse("Payment confirmed successfully", SubscriptionSchema),
                    },
                    400: { description: "Format d'ID invalide", content: makeErrorResponse("Invalid Payment Intent ID format") },
                    403: Forbidden,
                    404: { description: "Intention de paiement introuvable", content: makeErrorResponse("Payment intent not found") },
                    409: { description: "Paiement non abouti", content: makeErrorResponse("Payment has not succeeded") },
                },
            },
        },
    },
};
