/**
 * SGG Digital - Database Configuration
 * Configuration for Google Cloud SQL PostgreSQL connection
 * 
 * NEXUS-OMEGA M4 — Sécurité renforcée :
 * - Utilisateur applicatif sgg_app (pas postgres)
 * - SSL obligatoire en production
 * - Logging sécurisé (pas de secrets dans les logs)
 */

import { Pool, PoolConfig, QueryResult, QueryResultRow } from 'pg';

// ── Validation de la configuration ────────────────────────────────────────
if (!process.env.DATABASE_URL) {
  console.error('❌ FATAL: DATABASE_URL is not defined. Set it in .env or Secret Manager.');
  process.exit(1);
}

const dbUrl = new URL(process.env.DATABASE_URL);
const dbUser = dbUrl.username;
const dbHost = dbUrl.hostname;
const dbName = dbUrl.pathname.slice(1).split('?')[0];
const isProduction = process.env.NODE_ENV === 'production';

// ── Avertissement sécurité ────────────────────────────────────────────────
if (dbUser === 'postgres') {
  console.warn('⚠️  SECURITY: Using superuser "postgres" — switch to "sgg_app" for production!');
  console.warn('   Run: database/migrations/002_create_app_user.sql');
}

if (isProduction && !process.env.DATABASE_URL.includes('sslmode=require')) {
  console.warn('⚠️  SECURITY: sslmode=require is recommended in production DATABASE_URL');
}

// Environment configuration
const config: PoolConfig = {
  // Connection from environment variable (set by Secret Manager)
  connectionString: process.env.DATABASE_URL,

  // Pool configuration
  max: parseInt(process.env.DB_POOL_MAX || '10'),
  min: parseInt(process.env.DB_POOL_MIN || '2'),
  idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || '30000'),
  connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT || '10000'),

  // SSL configuration for Cloud SQL
  // Auto-detect: if DATABASE_URL contains sslmode=require, pg handles it
  // Otherwise, enable SSL for known Cloud SQL IPs
  ssl: process.env.DATABASE_URL?.includes('sslmode=require')
    ? undefined // pg parses sslmode from connection string
    : process.env.DATABASE_URL?.includes('35.195.248.19')
      ? { rejectUnauthorized: isProduction }
      : (isProduction ? { rejectUnauthorized: true } : false),

  // Application name for query identification
  application_name: 'sgg-digital-api',
};

// Log database connection info (SANS MOT DE PASSE)
console.log(`📦 Database: ${dbUser}@${dbHost}/${dbName} (SSL: ${config.ssl !== false ? 'enabled' : 'disabled'}, Pool: ${config.min}-${config.max})`);

// Create the connection pool
export const pool = new Pool(config);

// Pool event handlers
pool.on('connect', (client) => {
  console.log('New database client connected');

  // Set session variables for audit logging
  if (process.env.NODE_ENV === 'production') {
    client.query("SET timezone = 'Africa/Libreville'");
  }
});

pool.on('error', (err) => {
  console.error('Unexpected database pool error:', err);
});

pool.on('remove', () => {
  console.log('Database client removed from pool');
});

/**
 * Execute a query with automatic connection management
 */
export async function query<T extends QueryResultRow = any>(
  text: string,
  params?: any[],
  userId?: string
): Promise<QueryResult<T>> {
  const client = await pool.connect();

  try {
    // Set the current user for audit logging (parameterized to prevent SQL injection)
    if (userId) {
      await client.query('SELECT set_config($1, $2, true)', ['app.current_user_id', userId]);
    }

    const start = Date.now();
    const result = await client.query<T>(text, params as any[]);
    const duration = Date.now() - start;

    // Log slow queries
    if (duration > 1000) {
      console.warn('Slow query detected:', {
        text: text.substring(0, 100),
        duration: `${duration}ms`,
        rows: result.rowCount,
      });
    }

    return result;
  } finally {
    client.release();
  }
}

/**
 * Execute multiple queries in a transaction
 */
export async function transaction<T>(
  callback: (client: any) => Promise<T>,
  userId?: string
): Promise<T> {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    if (userId) {
      await client.query('SELECT set_config($1, $2, true)', ['app.current_user_id', userId]);
    }

    const result = await callback(client);

    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Health check for the database connection
 */
export async function healthCheck(): Promise<boolean> {
  try {
    const result = await pool.query('SELECT 1 as health');
    return result.rows[0]?.health === 1;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
}

/**
 * Get pool statistics
 */
export function getPoolStats() {
  return {
    totalCount: pool.totalCount,
    idleCount: pool.idleCount,
    waitingCount: pool.waitingCount,
  };
}

/**
 * Gracefully close the pool (for shutdown)
 */
export async function closePool(): Promise<void> {
  console.log('Closing database pool...');
  await pool.end();
  console.log('Database pool closed');
}

/**
 * Initialize database connection (alias for pool.connect test)
 */
export async function connectDB(): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query('SELECT 1');
    console.log('Database connection established');
  } finally {
    client.release();
  }
}

/**
 * Close database (alias for closePool)
 */
export async function closeDB(): Promise<void> {
  await closePool();
}

// Export types
export type { QueryResult };
