// config/openapi/openapi.config.js
import { merge } from 'openapi-merge';
import { authOpenApi }         from "../../src/modules/auth/auth.openapi.js";
import { adminOpenApi }        from "../../src/modules/admin/admin.openapi.js";
import { catalogOpenApi }      from "../../src/modules/catalog/catalog.openapi.js";
import { favoriteOpenApi }     from "../../src/modules/favorites/favorite.openapi.js";
import { messagingOpenApi }    from "../../src/modules/messaging/messaging.openapi.js";
import { reportOpenApi }       from "../../src/modules/reports/report.openapi.js";
import { subscriptionOpenApi } from "../../src/modules/subscriptions/subscription.openapi.js";
import { notificationOpenApi } from "../../src/modules/notifications/notification.openapi.js";
import { mediaOpenApi }        from "../../src/modules/media/media.openapi.js";
import { announcementOpenApi } from "../../src/modules/announcements/announcement.openapi.js";
import { superAdminOpenApi }   from "../../src/modules/super-admin/super-admin.openapi.js";

export function generateOpenApiDocument() {
    // 1. Liste de tous les modules documentés
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

    // 2. Fusionner tous les modules de manière sécurisée
    const mergeResult = merge(modulesDocs);

    if (mergeResult.output === undefined) {
        throw new Error(`Erreur lors de la fusion OpenAPI : ${mergeResult.message}`);
    }

    const mergedDocument = mergeResult.output;

    // 3. Configuration globale de l'API
    mergedDocument.info = {
        title: 'RentHub API',
        version: '1.0.0',
        description: `
## RentHub Backend API

API REST complète de la plateforme **RentHub** — location immobilière.

### Modules disponibles
| Module         | Préfixe                    | Description                              |
|----------------|----------------------------|------------------------------------------|
| Auth           | \`/api/v1/auth\`           | Inscription, connexion, profil           |
| Annonces       | \`/api/v1/announcements\`  | CRUD annonces + modération               |
| Catalogue      | \`/api/v1/\`               | Villes et types de biens                 |
| Favoris        | \`/api/v1/favorites\`      | Gestion des favoris                      |
| Messagerie     | \`/api/v1/conversations\`  | Messagerie temps réel                    |
| Media          | \`/api/v1/media\`          | Upload avatar, images, vidéos            |
| Notifications  | \`/api/v1/notifications\`  | Notifications utilisateur                |
| Rapports       | \`/api/v1/reports\`        | Signalement de contenu                   |
| Abonnements    | \`/api/v1/subscriptions\`  | Plans, paiements Stripe                  |
| Admin          | \`/api/v1/admin\`          | Dashboard et gestion admin               |
| Super Admin    | \`/api/v1/super-admin\`    | Audit logs, gestion root                 |

### Authentification
Utilisez le bouton **Authorize** pour saisir votre **Bearer token** (JWT).

\`\`\`
Authorization: Bearer <votre_access_token>
\`\`\`
        `.trim(),
        contact: {
            name: 'RentHub Team',
            email: 'support@renthub.app'
        }
    };

    mergedDocument.servers = [
        { url: 'http://localhost:3000', description: 'Serveur Local (développement)' },
        { url: 'https://api.renthub.app', description: 'Serveur de Production' },
    ];

    // 4. Schémas de sécurité globaux
    mergedDocument.components = mergedDocument.components || {};
    mergedDocument.components.securitySchemes = {
        bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
            description: 'Token JWT obtenu via POST /api/v1/auth/login'
        }
    };

    // 5. Tags globaux (description des groupes dans l'UI Swagger)
    mergedDocument.tags = [
        { name: 'Authentification', description: 'Inscription, connexion, gestion du profil et des sessions' },
        { name: 'Annonces',         description: 'Création, modification et modération des annonces immobilières' },
        { name: 'Catalogue',        description: 'Référentiels statiques : villes et types de biens' },
        { name: 'Favoris',          description: 'Gestion de la liste de favoris de l\'utilisateur' },
        { name: 'Messagerie',       description: 'Conversations et messages entre utilisateurs' },
        { name: 'Media',            description: 'Upload et gestion des médias (avatar, images, vidéos)' },
        { name: 'Notifications',    description: 'Notifications in-app de l\'utilisateur' },
        { name: 'Rapports',         description: 'Signalement et modération des contenus' },
        { name: 'Abonnements',      description: 'Plans d\'abonnement et paiements via Stripe' },
        { name: 'Administration',   description: 'Dashboard, gestion des utilisateurs et annonces (rôle admin)' },
        { name: 'Super Admin',      description: 'Audit logs et gestion avancée (rôle root uniquement)' },
    ];

    return mergedDocument;
}