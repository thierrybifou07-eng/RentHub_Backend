// src/config/openapi.config.js
import { merge } from 'openapi-merge';
import {authOpenApi} from "../../src/modules/auth/auth.openapi.js";
import {adminOpenApi} from "../../src/modules/admin/admin.openapi.js";

export function generateOpenApiDocument() {
    // 1. Liste de tous vos modules documentés
    const modulesDocs = [
        { oas: authOpenApi },
        { oas: adminOpenApi },
    ];

    // 2. Fusionner tous les fichiers de manière sécurisée
    const mergeResult = merge(modulesDocs);

    if (mergeResult.output === undefined) {
        throw new Error(`Erreur lors de la fusion OpenAPI : ${mergeResult.message}`);
    }

    const mergedDocument = mergeResult.output;

    // 3. Écraser ou injecter la configuration globale de l'API principale
    mergedDocument.info = {
        title: 'Mon API Backend Modulaire',
        version: '1.0.0',
        description: 'Documentation globale unifiée générée dynamiquement.',
    };

    mergedDocument.servers = [
        { url: 'http://localhost:3000', description: 'Serveur Local' }
    ];

    return mergedDocument;
}