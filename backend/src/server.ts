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
import healthRoutes from './routes/health.js';

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

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/institutions', institutionsRoutes);
app.use('/api/gar', garRoutes);
app.use('/api/nominations', nominationsRoutes);
app.use('/api/legislatif', legislatifRoutes);
app.use('/api/egop', egopRoutes);
app.use('/api/jo', joRoutes);

// Root endpoint
app.get('/', (req: Request, res: Response) => {
  res.json({
    name: 'SGG Digital API',
    version: '2.0.0',
    description: 'API du Secretariat General du Gouvernement - Gabon',
    documentation: '/api/docs',
    health: '/api/health',
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
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);

  // CORS error
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({
      success: false,
      error: {
        code: 'CORS_ERROR',
        message: 'Origine non autorisee',
      },
    });
  }

  // JWT error
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_TOKEN',
        message: 'Token invalide',
      },
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: {
        code: 'TOKEN_EXPIRED',
        message: 'Token expire',
      },
    });
  }

  // Validation error
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: err.message,
      },
    });
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
