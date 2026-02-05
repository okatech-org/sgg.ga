/**
 * SGG Digital - Health Check Routes
 */

import { Router, Request, Response } from 'express';
import { query, healthCheck as dbHealthCheck } from '../config/database.js';
import { redisHealthCheck } from '../config/redis.js';

const router = Router();

/**
 * Basic health check
 */
router.get('/', async (req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'sgg-digital-api',
      version: '2.0.0',
    },
  });
});

/**
 * Detailed health check
 */
router.get('/detailed', async (req: Request, res: Response) => {
  const checks: Record<string, { status: string; latency?: number; error?: string }> = {};

  // Database check
  const dbStart = Date.now();
  try {
    await dbHealthCheck();
    checks.database = {
      status: 'healthy',
      latency: Date.now() - dbStart,
    };
  } catch (error) {
    checks.database = {
      status: 'unhealthy',
      latency: Date.now() - dbStart,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }

  // Redis check
  const redisStart = Date.now();
  try {
    const redisHealthy = await redisHealthCheck();
    checks.redis = {
      status: redisHealthy ? 'healthy' : 'unhealthy',
      latency: Date.now() - redisStart,
    };
  } catch (error) {
    checks.redis = {
      status: 'unhealthy',
      latency: Date.now() - redisStart,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }

  // Overall status
  const allHealthy = Object.values(checks).every(c => c.status === 'healthy');

  res.status(allHealthy ? 200 : 503).json({
    success: allHealthy,
    data: {
      status: allHealthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      service: 'sgg-digital-api',
      version: '2.0.0',
      checks,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
    },
  });
});

/**
 * Readiness check (for Kubernetes/Cloud Run)
 */
router.get('/ready', async (req: Request, res: Response) => {
  try {
    // Check database is accessible
    await query('SELECT 1');

    res.json({
      success: true,
      data: {
        status: 'ready',
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      error: {
        code: 'NOT_READY',
        message: 'Service not ready',
      },
    });
  }
});

/**
 * Liveness check (for Kubernetes/Cloud Run)
 */
router.get('/live', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      status: 'alive',
      timestamp: new Date().toISOString(),
    },
  });
});

export default router;
