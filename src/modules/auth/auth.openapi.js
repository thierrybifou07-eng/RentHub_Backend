// src/modules/auth/auth.openapi.js
import { makeErrorResponse, makeSuccessResponse } from "../../../config/openapi/openapi.helpers.js";

// --- Schémas partagés ---
const SafeUserSchema = {
    type: "object",
    properties: {
        id: { type: "integer", example: 1 },
        firstname: { type: "string", example: "John" },
        lastname: { type: "string", example: "Doe" },
        email: { type: "string", format: "email", example: "user@example.com" },
        phone: { type: "string", nullable: true, example: "+33123456789" },
        role_id: { type: "integer", example: 4 },
        user_status_id: { type: "integer", example: 1 },
        email_verified_at: { type: "string", format: "date-time", nullable: true },
        city_id: { type: "integer", nullable: true, example: 1 },
    },
};

const AuthSessionSchema = {
    type: "object",
    properties: {
        token: { type: "string", example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." },
        refreshToken: { type: "string", example: "def502003c27e8a9..." },
        user: SafeUserSchema,
    },
};

const PasswordRules = {
    type: "string",
    format: "password",
    minLength: 8,
    description:
        "Min 8 chars, 1 lowercase, 1 uppercase, 1 digit, 1 special char (@$!%*?&), and no character repeated 4+ times in a row.",
    example: "Str0ng@Pass",
};

const CodeSchema = {
    type: "string",
    minLength: 6,
    maxLength: 6,
    description: "Code à 6 caractères reçu par email.",
    example: "A1B2C3",
};

// --- Configuration OpenAPI du module Auth ---
export const authOpenApi = {
    openapi: "3.1.0",
    info: { title: "Module Authentification", version: "1.0.0" },
    paths: {
        "/api/v1/auth/register": {
            post: {
                tags: ["Authentification"],
                summary: "Créer un compte utilisateur",
                description:
                    "Inscription publique. Le compte est créé en statut PENDING_VERIFICATION (user_status_id=4) avec le rôle TENANT, puis un code de vérification à 6 caractères est envoyé par email.",
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    firstname: { type: "string", minLength: 3, example: "John" },
                                    lastname: { type: "string", minLength: 3, example: "Doe" },
                                    email: { type: "string", format: "email", example: "user@example.com" },
                                    phone: { type: "string", minLength: 10, maxLength: 20, example: "+33123456789" },
                                    gender: { type: "string", enum: ["M", "F"], example: "M" },
                                    password: PasswordRules,
                                    confirmPassword: { type: "string", description: "Doit être identique à password." },
                                    accepted_terms: {
                                        type: "boolean",
                                        enum: [true],
                                        description: "Obligatoire et doit valoir true.",
                                    },
                                },
                                required: ["firstname", "lastname", "email", "password", "confirmPassword", "accepted_terms"],
                            },
                        },
                    },
                },
                responses: {
                    201: {
                        description: "Compte créé avec succès",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        status: { type: "string", example: "success" },
                                        message: { type: "string", example: "Registered successfully" },
                                        emailSent: {
                                            type: "boolean",
                                            description: "`false` si l'envoi de l'email de vérification a échoué.",
                                            example: true,
                                        },
                                    },
                                },
                            },
                        },
                    },
                    400: { description: "Requête invalide", content: makeErrorResponse("You must accept the Terms of Service") },
                    409: { description: "Email ou téléphone déjà utilisé", content: makeErrorResponse("That Email is already taken") },
                    429: { description: "Trop de tentatives d'inscription", content: makeErrorResponse("Too many requests") },
                },
            },
        },

        "/api/v1/auth/login": {
            post: {
                tags: ["Authentification"],
                summary: "Connexion utilisateur",
                description: "Retourne un access token JWT, un refresh token et le profil utilisateur.",
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    email: { type: "string", format: "email", example: "user@example.com" },
                                    password: PasswordRules,
                                },
                                required: ["email", "password"],
                            },
                        },
                    },
                },
                responses: {
                    200: {
                        description: 'Connexion réussie',
                        content: makeSuccessResponse("Login successful", AuthSessionSchema),
                    },
                    400: { description: "Identifiants invalides", content: makeErrorResponse("Invalid credentials") },
                    403: { description: "Compte inactif, suspendu ou non vérifié", content: makeErrorResponse("Account is not active") },
                    429: { description: "Trop de tentatives de connexion", content: makeErrorResponse("Too many requests") },
                },
            },
        },

        "/api/v1/auth/refresh": {
            post: {
                tags: ["Authentification"],
                summary: "Rafraîchir le jeton d'accès",
                description:
                    "Rotation du refresh token. En cas de réutilisation d'un ancien token (détection de vol), toutes les sessions de l'utilisateur sont détruites.",
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    refreshToken: { type: "string", example: "def502003c27e8a9..." },
                                },
                                required: ["refreshToken"],
                            },
                        },
                    },
                },
                responses: {
                    200: {
                        description: "Jetons renouvelés",
                        content: makeSuccessResponse("Token refreshed", AuthSessionSchema),
                    },
                    401: {
                        description: "Session invalide, expirée ou compromise",
                        content: makeErrorResponse("Invalid session"),
                    },
                    403: { description: "Compte inactif", content: makeErrorResponse("Account is not active") },
                },
            },
        },

        "/api/v1/auth/logout": {
            post: {
                tags: ["Authentification"],
                summary: "Fermer la session courante",
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    refreshToken: { type: "string", example: "def502003c27e8a9..." },
                                },
                                required: ["refreshToken"],
                            },
                        },
                    },
                },
                responses: {
                    200: { description: "Session fermée", content: makeSuccessResponse("Logged out successfully", { type: "null" }) },
                },
            },
        },

        "/api/v1/auth/logout-all": {
            post: {
                tags: ["Authentification"],
                summary: "Fermer toutes les sessions de l'utilisateur",
                security: [{ bearerAuth: [] }],
                responses: {
                    200: {
                        description: "Toutes les sessions fermées",
                        content: makeSuccessResponse("Logged out from all devices", { type: "null" }),
                    },
                    401: { description: "Non authentifié", content: makeErrorResponse("Authentication required") },
                },
            },
        },

        "/api/v1/auth/forgot-password": {
            post: {
                tags: ["Authentification"],
                summary: "Demander un code de réinitialisation",
                description:
                    "Réponse volontairement générique pour ne pas révéler si l'email existe. Un code à 6 caractères est envoyé si le compte est valide et actif.",
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    email: { type: "string", format: "email", example: "user@example.com" },
                                },
                                required: ["email"],
                            },
                        },
                    },
                },
                responses: {
                    200: {
                        description: "Demande traitée",
                        content: makeSuccessResponse("If this email is registered, you will receive a code", {
                            type: "object",
                            properties: { emailSent: { type: "boolean", example: true } },
                        }),
                    },
                    401: {
                        description: "Compte suspendu, inactif ou inconnu",
                        content: makeErrorResponse("Contact the administrator"),
                    },
                    429: { description: "Trop de demandes", content: makeErrorResponse("Too many requests") },
                },
            },
        },

        "/api/v1/auth/reset-password": {
            post: {
                tags: ["Authentification"],
                summary: "Réinitialiser le mot de passe avec le code reçu",
                description:
                    "Après succès, de nouvelles sessions sont retournées (token + refreshToken) et le compte passe en PENDING_VERIFICATION.",
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    email: { type: "string", format: "email", example: "user@example.com" },
                                    code: CodeSchema,
                                    password: PasswordRules,
                                    confirmPassword: { type: "string", description: "Doit être identique à password." },
                                },
                                required: ["email", "code", "password", "confirmPassword"],
                            },
                        },
                    },
                },
                responses: {
                    200: {
                        description: "Mot de passe réinitialisé",
                        content: makeSuccessResponse("Password reset successful", AuthSessionSchema),
                    },
                    400: { description: "Code invalide ou expiré", content: makeErrorResponse("Invalid code") },
                    404: { description: "Utilisateur ou code introuvable", content: makeErrorResponse("User not found") },
                    429: { description: "Trop de tentatives", content: makeErrorResponse("Too many invalid attempts") },
                },
            },
        },

        "/api/v1/auth/verify-email": {
            post: {
                tags: ["Authentification"],
                summary: "Vérifier l'adresse email",
                description:
                    "Consomme le code de vérification, positionne email_verified_at et passe le compte en ACTIVE. Le token retourné doit être utilisé car il contient désormais `emailVerifyAt`.",
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    code: CodeSchema,
                                    email: { type: "string", format: "email", example: "user@example.com" },
                                },
                                required: ["code", "email"],
                            },
                        },
                    },
                },
                responses: {
                    200: {
                        description: "Email vérifié avec succès",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        status: { type: "string", example: "success" },
                                        message: { type: "string", example: "Email verified successfully" },
                                        token: { type: "string", description: "Nouveau JWT incluant emailVerifyAt." },
                                        emailSent: { type: "boolean", example: true },
                                        user: SafeUserSchema,
                                    },
                                },
                            },
                        },
                    },
                    400: { description: "Code invalide, expiré ou email déjà vérifié", content: makeErrorResponse("Invalid code") },
                    403: { description: "Le token ne correspond pas à l'utilisateur", content: makeErrorResponse("Invalid token") },
                    404: { description: "Utilisateur introuvable", content: makeErrorResponse("User not found") },
                    429: { description: "Trop de tentatives invalides", content: makeErrorResponse("OTP_ATTEMPTS_EXCEEDED") },
                },
            },
        },

        "/api/v1/auth/regenerate-code": {
            post: {
                tags: ["Authentification"],
                summary: "Régénérer le code de vérification",
                security: [{ bearerAuth: [] }],
                responses: {
                    200: {
                        description: "Nouveau code envoyé",
                        content: makeSuccessResponse("Your code has been regenerated", { type: "null" }),
                    },
                    400: { description: "Le code précédent est encore valide", content: makeErrorResponse("The last code is still valid") },
                    404: { description: "Utilisateur introuvable", content: makeErrorResponse("User not found") },
                    401: { description: "Non authentifié", content: makeErrorResponse("Authentication required") },
                },
            },
        },

        "/api/v1/auth/me": {
            get: {
                tags: ["Authentification"],
                summary: "Obtenir le profil de l'utilisateur connecté",
                security: [{ bearerAuth: [] }],
                responses: {
                    200: {
                        description: "Profil récupéré avec succès",
                        content: makeSuccessResponse("User retrieved successfully", SafeUserSchema),
                    },
                    401: { description: "Non authentifié", content: makeErrorResponse("Authentication required") },
                    404: { description: "Utilisateur introuvable", content: makeErrorResponse("User not found") },
                },
            },
            put: {
                tags: ["Authentification"],
                summary: "Remplacer le profil de l'utilisateur connecté",
                description: "Nécessite un email vérifié et un compte actif.",
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    firstname: { type: "string", minLength: 3, maxLength: 150 },
                                    lastname: { type: "string", minLength: 3, maxLength: 150 },
                                    phone: { type: "string", minLength: 10, maxLength: 20, nullable: true },
                                    birth_date: { type: "string", format: "date", nullable: true, example: "1995-04-12" },
                                    gender: { type: "string", enum: ["M", "F"], nullable: true },
                                    address: { type: "string", maxLength: 255, nullable: true },
                                    city_id: { type: "integer", nullable: true, example: 1 },
                                },
                            },
                        },
                    },
                },
                responses: {
                    200: {
                        description: "Profil mis à jour",
                        content: makeSuccessResponse("Profile updated successfully", SafeUserSchema),
                    },
                    400: { description: "Données invalides", content: makeErrorResponse("Invalid data") },
                    401: { description: "Non authentifié", content: makeErrorResponse("Authentication required") },
                    403: { description: "Email non vérifié ou compte inactif", content: makeErrorResponse("Forbidden") },
                    409: { description: "Téléphone déjà utilisé", content: makeErrorResponse("That phone number is already taken") },
                    429: { description: "Trop de requêtes", content: makeErrorResponse("Too many requests") },
                },
            },
            patch: {
                tags: ["Authentification"],
                summary: "Modifier partiellement le profil de l'utilisateur connecté",
                description: "Alias de PUT /auth/me avec validation du schéma de mise à jour partielle.",
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    firstname: { type: "string", minLength: 3, maxLength: 150 },
                                    lastname: { type: "string", minLength: 3, maxLength: 150 },
                                    phone: { type: "string", minLength: 10, maxLength: 20, nullable: true },
                                    birth_date: { type: "string", format: "date", nullable: true },
                                    gender: { type: "string", enum: ["M", "F"], nullable: true },
                                    address: { type: "string", maxLength: 255, nullable: true },
                                    city_id: { type: "integer", nullable: true },
                                },
                            },
                        },
                    },
                },
                responses: {
                    200: {
                        description: "Profil mis à jour",
                        content: makeSuccessResponse("Profile updated successfully", SafeUserSchema),
                    },
                    400: { description: "Données invalides", content: makeErrorResponse("Invalid data") },
                    401: { description: "Non authentifié", content: makeErrorResponse("Authentication required") },
                    403: { description: "Email non vérifié ou compte inactif", content: makeErrorResponse("Forbidden") },
                    409: { description: "Téléphone déjà utilisé", content: makeErrorResponse("That phone number is already taken") },
                    429: { description: "Trop de requêtes", content: makeErrorResponse("Too many requests") },
                },
            },
            delete: {
                tags: ["Authentification"],
                summary: "Supprimer définitivement son propre compte",
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    password: { type: "string", description: "Mot de passe actuel, pour confirmer la suppression." },
                                },
                                required: ["password"],
                            },
                        },
                    },
                },
                responses: {
                    200: { description: "Compte supprimé", content: makeSuccessResponse("Account deleted successfully", { type: "null" }) },
                    400: { description: "Mot de passe manquant", content: makeErrorResponse("Password is required") },
                    401: { description: "Mot de passe incorrect", content: makeErrorResponse("Invalid password") },
                    403: { description: "Email non vérifié ou compte inactif", content: makeErrorResponse("Forbidden") },
                    404: { description: "Utilisateur introuvable", content: makeErrorResponse("User not found") },
                },
            },
        },

        "/api/v1/auth/me/password": {
            patch: {
                tags: ["Authentification"],
                summary: "Changer son propre mot de passe",
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    currentPassword: { type: "string", description: "Mot de passe actuel." },
                                    newPassword: PasswordRules,
                                    confirmNewPassword: { type: "string", description: "Doit être identique à newPassword." },
                                },
                                required: ["currentPassword", "newPassword", "confirmNewPassword"],
                            },
                        },
                    },
                },
                responses: {
                    200: { description: "Mot de passe modifié", content: makeSuccessResponse("Password changed successfully", { type: "null" }) },
                    400: { description: "Données invalides", content: makeErrorResponse("Invalid data") },
                    401: { description: "Mot de passe actuel incorrect", content: makeErrorResponse("Invalid current password") },
                    403: { description: "Email non vérifié ou compte inactif", content: makeErrorResponse("Forbidden") },
                    429: { description: "Trop de tentatives", content: makeErrorResponse("Too many requests") },
                },
            },
        },
    },
};
