// src/config/openapi.helpers.js
/**
 * Génère le schéma OpenAPI pour une réponse de succès standardisée
 * @param messageExample
 * @param {Object} dataSchema - Le schéma JSON décrivant l'objet à l'intérieur de "data"
 */
export const makeSuccessResponse = (messageExample, dataSchema) => {
    const schema = {
        type: "object",
        properties: {
            status: { type: "string", example: "success" },
            message: { type: "string", example: messageExample },
            data: dataSchema
        }
    };
    return { 'application/json': { schema: schema } };
};

/**
 * Génère le schéma OpenAPI pour une réponse d'erreur standardisée
 * @param messageExample
 */
export const makeErrorResponse = (messageExample) => {
    const schema = {
        type: "object",
        properties: {
            status: { type: "string", example: "error" },
            message: { type: "string", example: messageExample }
        }
    };
    return { 'application/json': { schema: schema } };
};