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

/**
 * Infrastructure diagnostic (M4)
 * Returns database pool stats, PostgreSQL version, schemas, and migration status.
 * Only available in non-production or with internal header.
 */
router.get('/infra', async (req: Request, res: Response): Promise<void> => {
  const isProduction = process.env.NODE_ENV === 'production';
  const hasInternalHeader = req.headers['x-internal-check'] === 'sgg-infra-2026';

  if (isProduction && !hasInternalHeader) {
    res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Internal only' } });
    return;
  }

  const infra: Record<string, any> = {};

  try {
    // PostgreSQL version
    const versionResult = await query('SELECT version()');
    infra.postgresql_version = versionResult.rows[0]?.version?.split(' ').slice(0, 2).join(' ');

    // Current user
    const userResult = await query('SELECT current_user, current_database()');
    infra.db_user = userResult.rows[0]?.current_user;
    infra.db_name = userResult.rows[0]?.current_database;

    // Schemas present
    const schemasResult = await query(`
      SELECT schema_name FROM information_schema.schemata 
      WHERE schema_name NOT IN ('pg_catalog', 'information_schema', 'pg_toast')
      ORDER BY schema_name
    `);
    infra.schemas = schemasResult.rows.map((r: any) => r.schema_name);

    // Migration status
    try {
      const migrationsResult = await query(`
        SELECT version, name, executed_at, execution_ms 
        FROM public.schema_migrations 
        ORDER BY version
      `);
      infra.migrations = migrationsResult.rows;
    } catch {
      infra.migrations = 'schema_migrations table not found — run migrate.sh first';
    }

    // SSL status
    const sslResult = await query('SELECT ssl as using_ssl FROM pg_stat_ssl WHERE pid = pg_backend_pid()');
    infra.ssl_active = sslResult.rows[0]?.using_ssl ?? 'unknown';

    // Pool stats
    const { getPoolStats } = await import('../config/database.js');
    infra.pool = getPoolStats();

    // Table counts per schema
    const tableCountResult = await query(`
      SELECT schemaname as schema, COUNT(*) as table_count
      FROM pg_tables
      WHERE schemaname IN ('auth', 'gar', 'nominations', 'legislatif', 'egop', 'jo', 'institutions', 'neocortex', 'public')
      GROUP BY schemaname
      ORDER BY schemaname
    `);
    infra.tables_per_schema = tableCountResult.rows;

    res.json({
      success: true,
      data: {
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
        infrastructure: infra,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'INFRA_CHECK_FAILED',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
    });
  }
});

export default router;
