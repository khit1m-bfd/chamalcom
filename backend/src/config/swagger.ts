import swaggerJsdoc from 'swagger-jsdoc';
import { env } from './env';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'ChamalCom API',
      version: '1.0.0',
      description: `
# ChamalCom — API de gestion de location saisonnière

Plateforme de location saisonnière à Oued Laou, Tanger-Tétouan-Al Hoceima, Maroc.

## Authentification
Cette API utilise JWT Bearer tokens. Le refresh token est géré via httpOnly cookie.

## Rôles
- **admin** : Gestion globale de la plateforme
- **proprietaire** : Gestion des appartements et réservations
- **client** : Réservation et avis
      `,
      contact: {
        name: 'ChamalCom Support',
        email: 'support@chamalcom.ma',
      },
    },
    servers: [
      {
        url: `http://localhost:${env.PORT}/api/v1`,
        description: 'Serveur de développement',
      },
      {
        url: 'https://api.chamalcom.ma/api/v1',
        description: 'Serveur de production',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Access token JWT (valide 15 minutes)',
        },
      },
      schemas: {
        ApiSuccess: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: { type: 'object' },
            message: { type: 'string' },
          },
        },
        ApiError: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: { type: 'string' },
            details: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: { type: 'string' },
                  message: { type: 'string' },
                },
              },
            },
          },
        },
        PaginationMeta: {
          type: 'object',
          properties: {
            page: { type: 'integer' },
            limit: { type: 'integer' },
            total: { type: 'integer' },
            totalPages: { type: 'integer' },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
    tags: [
      { name: 'Auth', description: 'Authentification (3 espaces séparés)' },
      { name: 'Appartements', description: 'Gestion des appartements' },
      { name: 'Images', description: 'Upload et gestion des images' },
      { name: 'Réservations', description: 'Réservations et disponibilité' },
      { name: 'Paiements', description: 'Paiements et remboursements' },
      { name: 'Avis', description: 'Avis et notes' },
      { name: 'Admin', description: 'Administration de la plateforme' },
      { name: 'Propriétaire', description: 'Dashboard propriétaire' },
    ],
  },
  apis: ['./src/modules/**/*.routes.ts', './src/modules/**/*.controller.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
