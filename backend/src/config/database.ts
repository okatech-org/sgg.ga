/**
 * SGG Digital - Database Configuration
 * Configuration for Google Cloud SQL PostgreSQL connection
 */

import { Pool, PoolConfig, QueryResult } from 'pg';

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
  // SECURITY: rejectUnauthorized should be true in production to prevent MITM attacks
  ssl: process.env.DATABASE_URL?.includes('35.195.248.19')
    ? { rejectUnauthorized: process.env.NODE_ENV === 'production' }
    : (process.env.NODE_ENV === 'production' ? { rejectUnauthorized: true } : false),

  // Application name for query identification
  application_name: 'sgg-digital-api',
};

// Log database connection info
const dbName = process.env.DATABASE_URL?.split('/').pop()?.split('?')[0] || 'unknown';
console.log(`📦 Database config: ${dbName} (SSL: ${config.ssl ? 'enabled' : 'disabled'})`);

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
export async function query<T = any>(
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
    const result = await client.query<T>(text, params);
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
