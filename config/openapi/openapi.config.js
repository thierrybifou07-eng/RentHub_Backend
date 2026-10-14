// src/config/openapi.config.js
import { merge } from 'openapi-merge';
import {authOpenApi} from "../../src/modules/auth/auth.openapi.js";
import {adminOpenApi} from "../../src/modules/admin/admin.openapi.js";
import {catalogOpenApi} from "../../src/modules/catalog/catalog.openapi.js";
import {favoriteOpenApi} from "../../src/modules/favorites/favorite.openapi.js";
import {messagingOpenApi} from "../../src/modules/messaging/messaging.openapi.js";
import {reportOpenApi} from "../../src/modules/reports/report.openapi.js";
import {subscriptionOpenApi} from "../../src/modules/subscriptions/subscription.openapi.js";
import {notificationOpenApi} from "../../src/modules/notifications/notification.openapi.js";
import {mediaOpenApi} from "../../src/modules/media/media.openapi.js";
import {announcementOpenApi} from "../../src/modules/announcements/announcement.openapi.js";
import {superAdminOpenApi} from "../../src/modules/super-admin/super-admin.openapi.js";

export function generateOpenApiDocument() {
    // 1. Liste de tous vos modules documentés
    const modulesDocs = [
        { oas: authOpenApi },
        { oas: adminOpenApi },
        { oas: catalogOpenApi },
        { oas: favoriteOpenApi },
        { oas: messagingOpenApi },
        { oas: reportOpenApi },
        { oas: subscriptionOpenApi },
        { oas: notificationOpenApi },
        { oas: mediaOpenApi },
        { oas: announcementOpenApi },
        { oas: superAdminOpenApi },
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