/**
 * SGG Digital - Backend API Server
 * Express server for Google Cloud Run
 */

// Load environment variables FIRST
import 'dotenv/config';

import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import { connectDB, closeDB } from './config/database.js';
import { connectRedis, closeRedis } from './config/redis.js';

// Routes
import authRoutes from './routes/auth.js';
import usersRoutes from './routes/users.js';
import institutionsRoutes from './routes/institutions.js';
import garRoutes from './routes/gar.js';
import nominationsRoutes from './routes/nominations.js';
import legislatifRoutes from './routes/legislatif.js';
import egopRoutes from './routes/egop.js';
import joRoutes from './routes/jo.js';
import ptmRoutes from './routes/ptm.js';
import healthRoutes from './routes/health.js';
import reportingRoutes from './routes/reporting.js';
import monitoringRoutes from './routes/monitoring.js';
import twoFactorRoutes from './routes/twoFactor.js';
import { startCacheInvalidationListener } from './services/cacheInvalidation.js';
import { initWebSocket, closeWebSocket } from './services/websocket.js';
import auditRoutes from './routes/audit.js';
import { auditMiddleware } from './services/auditTrail.js';
import { tokenBucketRateLimit } from './services/rateLimiter.js';
import workflowRoutes from './routes/workflow.js';
import { authenticate } from './middleware/auth.js';
import { neocortex, neocortexRoutes, neocortexMiddleware } from './neocortex/index.js';

const app: Express = express();
const PORT = process.env.PORT || 8080;

// =============================================================================
// MIDDLEWARE
// =============================================================================

// Security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// CORS configuration
const allowedOrigins = [
  'https://sgg.ga',
  'https://www.sgg.ga',
  'https://admin.sgg.ga',
  process.env.FRONTEND_URL,
  // Development
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:8080',
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined'));
}

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Trop de requetes, veuillez reessayer plus tard',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// Trust proxy (for Cloud Run)
app.set('trust proxy', 1);

// =============================================================================
// ROUTES
// =============================================================================

// Health check (no auth required)
app.use('/api/health', healthRoutes);

// Token bucket rate limiting on sensitive auth routes
app.use('/api/auth/login', tokenBucketRateLimit({ maxTokens: 10, refillRate: 2, refillInterval: 60 }));
app.use('/api/auth/register', tokenBucketRateLimit({ maxTokens: 5, refillRate: 1, refillInterval: 120 }));
app.use('/api/auth/2fa', tokenBucketRateLimit({ maxTokens: 5, refillRate: 1, refillInterval: 30 }));

// Audit trail middleware on write-heavy routes
// NEXUS-OMEGA P1-7: Must be registered BEFORE route handlers
app.use('/api/gar', auditMiddleware('gar'));
app.use('/api/nominations', auditMiddleware('nominations'));
app.use('/api/legislatif', auditMiddleware('legislatif'));
app.use('/api/egop', auditMiddleware('egop'));
app.use('/api/jo', auditMiddleware('jo'));
app.use('/api/ptm', auditMiddleware('ptm'));
app.use('/api/reporting', auditMiddleware('reporting'));

// 🧠 NEOCORTEX — Auto-signal middleware (emits limbique signals on mutations)
app.use('/api/gar', neocortexMiddleware('gar'));
app.use('/api/nominations', neocortexMiddleware('nominations'));
app.use('/api/legislatif', neocortexMiddleware('legislatif'));
app.use('/api/egop', neocortexMiddleware('egop'));
app.use('/api/jo', neocortexMiddleware('jo'));
app.use('/api/ptm', neocortexMiddleware('ptm'));
app.use('/api/institutions', neocortexMiddleware('institutions'));
app.use('/api/workflows', neocortexMiddleware('workflows'));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/institutions', institutionsRoutes);
app.use('/api/gar', garRoutes);
app.use('/api/nominations', nominationsRoutes);
app.use('/api/legislatif', legislatifRoutes);
app.use('/api/egop', egopRoutes);
app.use('/api/jo', joRoutes);
app.use('/api/ptm', ptmRoutes);
app.use('/api/reporting', reportingRoutes);
app.use('/api/monitoring', monitoringRoutes);
app.use('/api/auth/2fa', twoFactorRoutes);

// NEXUS-OMEGA P0-8: Secure audit & workflow routes with authenticate middleware
app.use('/api/audit', authenticate, auditRoutes);
app.use('/api/workflows', authenticate, workflowRoutes);

// 🧠 NEOCORTEX API — System nervous digital
app.use('/api/neocortex', authenticate, neocortexRoutes);

// API Documentation endpoint
app.get('/api/docs', (req: Request, res: Response) => {
  const specUrl = 'https://raw.githubusercontent.com/okatech-org/sgg.ga/main/docs/api/openapi.yaml';
  res.send(`<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <title>SGG Digital API — Documentation</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css">
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
  <script>SwaggerUIBundle({ url: "${specUrl}", dom_id: '#swagger-ui', deepLinking: true });</script>
</body>
</html>`);
});

// Root endpoint
app.get('/', (req: Request, res: Response) => {
  res.json({
    name: 'SGG Digital API',
    version: '3.0.0-nexus-omega',
    description: 'API du Secretariat General du Gouvernement - Gabon (NEOCORTEX enabled)',
    documentation: '/api/docs',
    health: '/api/health',
    endpoints: {
      auth: '/api/auth',
      gar: '/api/gar',
      reporting: '/api/reporting',
      monitoring: '/api/monitoring',
      institutions: '/api/institutions',
      nominations: '/api/nominations',
      legislatif: '/api/legislatif',
      egop: '/api/egop',
      jo: '/api/jo',
      ptm: '/api/ptm',
      audit: '/api/audit',
      workflows: '/api/workflows',
      neocortex: {
        dashboard: '/api/neocortex/dashboard',
        signaux: '/api/neocortex/signaux',
        historique: '/api/neocortex/historique',
        config: '/api/neocortex/config',
        decision: '/api/neocortex/decision',
        notifications: '/api/neocortex/notifications',
        metriques: '/api/neocortex/metriques',
      },
    },
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.path} non trouvee`,
    },
  });
});

// Error handler
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, req: Request, res: Response, _next: NextFunction): void => {
  console.error('Error:', err);

  // CORS error
  if (err.message === 'Not allowed by CORS') {
    res.status(403).json({
      success: false,
      error: {
        code: 'CORS_ERROR',
        message: 'Origine non autorisee',
      },
    });
    return;
  }

  // JWT error
  if (err.name === 'JsonWebTokenError') {
    res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_TOKEN',
        message: 'Token invalide',
      },
    });
    return;
  }

  if (err.name === 'TokenExpiredError') {
    res.status(401).json({
      success: false,
      error: {
        code: 'TOKEN_EXPIRED',
        message: 'Token expire',
      },
    });
    return;
  }

  // Validation error
  if (err.name === 'ValidationError') {
    res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: err.message,
      },
    });
    return;
  }

  // Default error
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: process.env.NODE_ENV === 'production'
        ? 'Erreur interne du serveur'
        : err.message,
    },
  });
});

// =============================================================================
// SERVER STARTUP
// =============================================================================

async function startServer() {
  try {
    console.log('Starting SGG Digital API Server...');

    // Connect to database
    console.log('Connecting to database...');
    await connectDB();
    console.log('Database connected');

    // Connect to Redis (optional - continue if unavailable)
    console.log('Connecting to Redis...');
    try {
      await connectRedis();
      console.log('Redis connected');
    } catch (redisError) {
      console.warn('⚠️ Redis unavailable - running without cache');
    }

    // Start server
    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`Health check: http://localhost:${PORT}/api/health`);
    });

    // Initialize WebSocket server
    try {
      initWebSocket(server);
      console.log('WebSocket server initialized');
    } catch (wsError) {
      console.warn('⚠️ WebSocket initialization failed:', wsError);
    }

    // Start cache invalidation listener
    try {
      await startCacheInvalidationListener();
      console.log('Cache invalidation listener started');
    } catch (cacheError) {
      console.warn('⚠️ Cache invalidation listener failed:', cacheError);
    }

    // 🧠 Start NEOCORTEX nervous system
    try {
      neocortex.start();
    } catch (neoError) {
      console.warn('⚠️ NEOCORTEX startup failed:', neoError);
    }

    // Graceful shutdown
    const shutdown = async (signal: string) => {
      console.log(`\n${signal} received. Starting graceful shutdown...`);

      server.close(async () => {
        console.log('HTTP server closed');

        try {
          await closeDB();
          console.log('Database connection closed');

          await closeRedis();
          console.log('Redis connection closed');

          closeWebSocket();
          console.log('WebSocket server closed');

          neocortex.stop();
          console.log('NEOCORTEX stopped');

          process.exit(0);
        } catch (error) {
          console.error('Error during shutdown:', error);
          process.exit(1);
        }
      });

      // Force close after 30 seconds
      setTimeout(() => {
        console.error('Forced shutdown after timeout');
        process.exit(1);
      }, 30000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

export default app;
