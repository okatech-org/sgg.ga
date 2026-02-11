/**
 * SGG Digital - Redis Configuration
 * Configuration for Cloud Memorystore (Redis) connection
 */

import Redis from 'ioredis';

// Parse Redis URL from environment
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

// Create Redis client
export const redis = new (Redis as any)(REDIS_URL, {
  maxRetriesPerRequest: 3,
  retryDelayOnFailover: 100,
  enableReadyCheck: true,
  lazyConnect: true,

  // Connection options
  connectTimeout: 10000,
  commandTimeout: 5000,

  // Reconnection strategy
  retryStrategy(times: number) {
    if (times > 10) {
      console.error('Redis: Max retry attempts reached');
      return null; // Stop retrying
    }
    return Math.min(times * 100, 3000);
  },
});

// Event handlers
redis.on('connect', () => {
  console.log('Redis: Connected');
});

redis.on('ready', () => {
  console.log('Redis: Ready to accept commands');
});

redis.on('error', (error: Error) => {
  console.error('Redis error:', error.message);
});

redis.on('close', () => {
  console.log('Redis: Connection closed');
});

redis.on('reconnecting', () => {
  console.log('Redis: Reconnecting...');
});

/**
 * Initialize Redis connection
 */
export async function connectRedis(): Promise<void> {
  try {
    await redis.connect();
  } catch (error) {
    console.warn('Redis: Connection failed, running without cache');
  }
}

/**
 * Close Redis connection
 */
export async function closeRedis(): Promise<void> {
  console.log('Closing Redis connection...');
  await redis.quit();
  console.log('Redis connection closed');
}

// Cache utilities
const DEFAULT_TTL = 3600; // 1 hour

/**
 * Get a value from cache
 */
export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    const value = await redis.get(key);
    if (!value) return null;
    try {
      return JSON.parse(value) as T;
    } catch {
      return value as unknown as T;
    }
  } catch {
    // Redis unavailable - return null (cache miss)
    return null;
  }
}

/**
 * Set a value in cache
 */
export async function cacheSet(
  key: string,
  value: any,
  ttlSeconds: number = DEFAULT_TTL
): Promise<void> {
  try {
    const serialized = typeof value === 'string' ? value : JSON.stringify(value);
    await redis.setex(key, ttlSeconds, serialized);
  } catch {
    // Redis unavailable - skip caching
  }
}

/**
 * Delete a value from cache
 */
export async function cacheDelete(key: string): Promise<void> {
  try {
    await redis.del(key);
  } catch {
    // Redis unavailable - skip cache delete
  }
}

/**
 * Delete multiple keys by pattern
 */
export async function cacheDeletePattern(pattern: string): Promise<number> {
  const keys = await redis.keys(pattern);
  if (keys.length === 0) return 0;
  return redis.del(...keys);
}

/**
 * Get or set cache with callback
 */
export async function cacheGetOrSet<T>(
  key: string,
  callback: () => Promise<T>,
  ttlSeconds: number = DEFAULT_TTL
): Promise<T> {
  const cached = await cacheGet<T>(key);
  if (cached !== null) {
    return cached;
  }

  const value = await callback();
  await cacheSet(key, value, ttlSeconds);
  return value;
}

// Session management
const SESSION_PREFIX = 'session:';
const SESSION_TTL = 7 * 24 * 60 * 60; // 7 days

/**
 * Store a session
 */
export async function sessionSet(
  sessionId: string,
  data: Record<string, any>
): Promise<void> {
  await cacheSet(`${SESSION_PREFIX}${sessionId}`, data, SESSION_TTL);
}

/**
 * Get a session
 */
export async function sessionGet(
  sessionId: string
): Promise<Record<string, any> | null> {
  return cacheGet(`${SESSION_PREFIX}${sessionId}`);
}

/**
 * Delete a session
 */
export async function sessionDelete(sessionId: string): Promise<void> {
  await cacheDelete(`${SESSION_PREFIX}${sessionId}`);
}

/**
 * Extend session TTL
 */
export async function sessionExtend(sessionId: string): Promise<boolean> {
  const key = `${SESSION_PREFIX}${sessionId}`;
  return (await redis.expire(key, SESSION_TTL)) === 1;
}

// Rate limiting
const RATE_LIMIT_PREFIX = 'ratelimit:';

/**
 * Check rate limit and increment counter
 */
export async function checkRateLimit(
  identifier: string,
  limit: number,
  windowSeconds: number
): Promise<{
  allowed: boolean;
  remaining: number;
  resetAt: number;
}> {
  const key = `${RATE_LIMIT_PREFIX}${identifier}`;
  const now = Date.now();
  const windowStart = now - windowSeconds * 1000;

  // Use a sorted set for sliding window rate limiting
  const pipeline = redis.pipeline();
  pipeline.zremrangebyscore(key, 0, windowStart);
  pipeline.zadd(key, now, `${now}-${Math.random()}`);
  pipeline.zcard(key);
  pipeline.expire(key, windowSeconds);

  const results = await pipeline.exec();
  const count = (results?.[2]?.[1] as number) || 0;

  return {
    allowed: count <= limit,
    remaining: Math.max(0, limit - count),
    resetAt: now + windowSeconds * 1000,
  };
}

// Pub/Sub for real-time notifications
const NOTIFICATION_CHANNEL = 'notifications';

/**
 * Publish a notification
 */
export async function publishNotification(
  type: string,
  data: Record<string, any>
): Promise<void> {
  await redis.publish(
    NOTIFICATION_CHANNEL,
    JSON.stringify({ type, data, timestamp: Date.now() })
  );
}

/**
 * Subscribe to notifications
 */
export async function subscribeNotifications(
  callback: (type: string, data: Record<string, any>) => void
): Promise<void> {
  const subscriber = redis.duplicate();
  await subscriber.subscribe(NOTIFICATION_CHANNEL);

  subscriber.on('message', (channel: string, message: string) => {
    if (channel === NOTIFICATION_CHANNEL) {
      try {
        const { type, data } = JSON.parse(message);
        callback(type, data);
      } catch (error) {
        console.error('Failed to parse notification:', error);
      }
    }
  });
}

// Health check
export async function redisHealthCheck(): Promise<boolean> {
  try {
    const result = await redis.ping();
    return result === 'PONG';
  } catch {
    return false;
  }
}

// Export the client for advanced use cases
export default redis;
