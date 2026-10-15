import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import { env, allowedOrigins, isProd } from './config/env.js';
import { prisma } from './db/client.js';
import { errorHandler } from './middleware/errorHandler.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import { swaggerDocument } from './docs/swagger.js';

// Route imports
import authRoutes from './modules/auth/auth.routes.js';
import institutionRoutes from './modules/institutions/institutions.routes.js';
import departmentRoutes from './modules/departments/departments.routes.js';
import studentRoutes from './modules/students/students.routes.js';
import activityRoutes from './modules/activities/activities.routes.js';
import recordRoutes from './modules/records/records.routes.js';
import verificationRoutes from './modules/verification/verification.routes.js';
import evidenceRoutes from './modules/evidence/evidence.routes.js';
import analyticsRoutes from './modules/analytics/analytics.routes.js';
import notificationRoutes from './modules/notifications/notifications.routes.js';
import auditRoutes from './modules/audit/audit.routes.js';
import subscriptionRoutes from './modules/subscriptions/subscriptions.routes.js';
import portfolioRoutes from './modules/portfolio/portfolio.routes.js';
import publicPortfolioRoutes from './modules/portfolio/publicPortfolios.routes.js';

export function createApp(): Express {
  const app = express();

  // 1. Security Headers
  app.use(
    helmet({
      contentSecurityPolicy: false // Allows Swagger UI and local development
    })
  );

  // 2. CORS with Credentials
  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (e.g. mobile apps, curl) or allowed origins
        if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
          callback(null, true);
        } else {
          callback(null, true); // Dev fallback
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
    })
  );

  // 3. Body Parsing & Cookies
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(cookieParser());

  // 4. Rate Limiting for general API
  app.use(env.API_PREFIX, apiLimiter);

  // 5. Root & Health Endpoints
  app.get('/', (_req: Request, res: Response) => {
    res.json({
      success: true,
      name: 'Pehchaan (SKIT021) SaaS API',
      status: 'UP',
      docs: '/api/v1/docs',
      health: '/api/v1/health'
    });
  });

  app.get('/health', async (_req: Request, res: Response) => {
    try {
      // Test DB connection
      await prisma.$queryRaw`SELECT 1`;
      res.json({
        status: 'UP',
        timestamp: new Date().toISOString(),
        database: 'CONNECTED',
        uptime: process.uptime(),
        environment: env.NODE_ENV
      });
    } catch (e: any) {
      res.status(503).json({
        status: 'DEGRADED',
        timestamp: new Date().toISOString(),
        database: 'DISCONNECTED',
        error: e.message
      });
    }
  });

  app.get(`${env.API_PREFIX}/health`, async (_req: Request, res: Response) => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      res.json({
        status: 'UP',
        timestamp: new Date().toISOString(),
        database: 'CONNECTED',
        uptime: process.uptime(),
        environment: env.NODE_ENV
      });
    } catch (e: any) {
      res.status(503).json({
        status: 'DEGRADED',
        timestamp: new Date().toISOString(),
        database: 'DISCONNECTED',
        error: e.message
      });
    }
  });

  // Database Setup & Sync Endpoint (Protected with Admin Key or Platform Admin)
  const initDbHandler = async (req: Request, res: Response) => {
    try {
      const adminKey = req.headers['x-admin-key'] as string;
      const authHeader = req.headers.authorization;
      const hasValidKey = adminKey && adminKey === env.JWT_SECRET;

      let isPlatformAdmin = false;
      if (authHeader?.startsWith('Bearer ')) {
        const { verifyToken } = await import('./utils/auth.js');
        const token = authHeader.split(' ')[1];
        const payload = verifyToken(token);
        if (payload?.isPlatformAdmin) {
          isPlatformAdmin = true;
        }
      }

      if (!hasValidKey && !isPlatformAdmin) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized: Administrative setup key or platform administrator credentials are required.'
        });
        return;
      }

      const { seedDatabase } = await import('./db/seed.js');
      const { exec } = await import('child_process');
      const { promisify } = await import('util');
      const execAsync = promisify(exec);

      let migrationResult = 'skipped';
      try {
        const { stdout } = await execAsync('npx prisma migrate deploy', { cwd: process.cwd() });
        migrationResult = stdout.trim();
      } catch (mErr: any) {
        migrationResult = mErr.message;
      }

      await seedDatabase();
      res.json({
        success: true,
        message: 'PostgreSQL database verified and seeded successfully!',
        migration: migrationResult
      });
    } catch (e: any) {
      res.status(500).json({
        success: false,
        error: isProd ? 'Database maintenance operation failed.' : e.message
      });
    }
  };

  app.all('/init-db', initDbHandler);
  app.all(`${env.API_PREFIX}/system/init-db`, initDbHandler);

  // 6. OpenAPI Documentation
  app.use(`${env.API_PREFIX}/docs`, swaggerUi.serve, swaggerUi.setup(swaggerDocument));

  // 7. Mount Module Routers
  app.use(`${env.API_PREFIX}/auth`, authRoutes);
  app.use(`${env.API_PREFIX}/institutions`, institutionRoutes);
  app.use(`${env.API_PREFIX}/departments`, departmentRoutes);
  app.use(`${env.API_PREFIX}/students`, studentRoutes);
  app.use(`${env.API_PREFIX}/activities`, activityRoutes);
  app.use(`${env.API_PREFIX}/records`, recordRoutes);
  app.use(`${env.API_PREFIX}/verification`, verificationRoutes);
  app.use(`${env.API_PREFIX}/evidence`, evidenceRoutes);
  app.use(`${env.API_PREFIX}/analytics`, analyticsRoutes);
  app.use(`${env.API_PREFIX}/notifications`, notificationRoutes);
  app.use(`${env.API_PREFIX}/audit`, auditRoutes);
  app.use(`${env.API_PREFIX}/subscriptions`, subscriptionRoutes);
  app.use(`${env.API_PREFIX}/portfolio`, portfolioRoutes);
  app.use(`${env.API_PREFIX}/public/portfolios`, publicPortfolioRoutes);

  // 8. 404 Handler
  app.use((_req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      error: 'Endpoint not found.'
    });
  });

  // 9. Centralized Error Handler
  app.use(errorHandler);

  return app;
}

export default createApp;
