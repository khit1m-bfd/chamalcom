import 'dotenv/config';
import './config/env'; // valider les env en premier
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';

import { env } from './config/env';
import { logger } from './config/logger';
import { prisma } from './config/db';
import { swaggerSpec } from './config/swagger';
import { globalLimiter } from './middlewares/rateLimiter';
import { errorHandler } from './middlewares/errorHandler';

// ─── Route imports ─────────────────────────────────────────────────────────────
import authAdminRoutes from './modules/auth/auth.admin.routes';
import authProprietaireRoutes from './modules/auth/auth.proprietaire.routes';
import authClientRoutes from './modules/auth/auth.client.routes';
import appartementRoutes from './modules/appartement/appartement.routes';
import imageRoutes from './modules/image/image.routes';
import reservationRoutes from './modules/reservation/reservation.routes';
import paiementRoutes from './modules/paiement/paiement.routes';
import avisRoutes from './modules/avis/avis.routes';
import adminRoutes from './modules/admin/admin.routes';
import proprietaireRoutes from './modules/proprietaire/proprietaire.routes';
import notificationRoutes from './modules/notification/notification.routes';

const app = express();

// ─── Security middlewares ──────────────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:', 'https://res.cloudinary.com'],
      scriptSrc: ["'self'"],
    },
  },
}));

app.use(cors({
  origin: (origin, callback) => {
    // Autoriser toutes les origines localhost (n'importe quel port) + FRONTEND_URL
    const allowed = [env.FRONTEND_URL];
    if (!origin || /^http:\/\/localhost(:\d+)?$/.test(origin) || allowed.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS bloqué: ${origin}`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ─── Core middlewares ──────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(globalLimiter);

// ─── Request logger ───────────────────────────────────────────────────────────
app.use((req, _res, next) => {
  logger.info('→ Request', { method: req.method, url: req.url, ip: req.ip });
  next();
});

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({
    success: true,
    data: {
      status: 'ok',
      service: 'ChamalCom API',
      version: '1.0.0',
      environment: env.NODE_ENV,
      timestamp: new Date().toISOString(),
    },
  });
});

// ─── Swagger UI ───────────────────────────────────────────────────────────────
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: 'ChamalCom API Docs',
  customCss: '.swagger-ui .topbar { background: #0A3D6B; }',
}));

// ─── API Routes v1 ────────────────────────────────────────────────────────────
const v1 = '/api/v1';

app.use(`${v1}/auth/admin`, authAdminRoutes);
app.use(`${v1}/auth/proprietaire`, authProprietaireRoutes);
app.use(`${v1}/auth/client`, authClientRoutes);
app.use(`${v1}/appartements`, appartementRoutes);
app.use(`${v1}/images`, imageRoutes);
app.use(`${v1}/reservations`, reservationRoutes);
app.use(`${v1}/paiements`, paiementRoutes);
app.use(`${v1}/avis`, avisRoutes);
app.use(`${v1}/admin`, adminRoutes);
app.use(`${v1}/proprietaire`, proprietaireRoutes);
app.use(`${v1}/notifications`, notificationRoutes);

// ─── 404 ──────────────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, error: 'Route introuvable' });
});

// ─── Global error handler ─────────────────────────────────────────────────────
app.use(errorHandler);

// ─── Start server ─────────────────────────────────────────────────────────────
async function bootstrap(): Promise<void> {
  try {
    await prisma.$connect();
    logger.info('✅ Base de données connectée');

    // Import cron jobs (side-effect only)
    await import('./modules/reservation/reservation.cron');

    app.listen(env.PORT, () => {
      logger.info(`🚀 ChamalCom API démarré`, {
        port: env.PORT,
        env: env.NODE_ENV,
        docs: `http://localhost:${env.PORT}/api/docs`,
      });
    });
  } catch (err) {
    logger.error('❌ Échec du démarrage', { err });
    process.exit(1);
  }
}

process.on('SIGTERM', () => {
  logger.info('SIGTERM reçu, arrêt propre...');
  void prisma.$disconnect().then(() => process.exit(0));
});

process.on('SIGINT', () => {
  logger.info('SIGINT reçu, arrêt propre...');
  void prisma.$disconnect().then(() => process.exit(0));
});

void bootstrap();

export { app };
