/**
 * SGG Digital — Rate Limiting Avancé (Token Bucket)
 *
 * Implémentation d'un rate limiter Token Bucket avec Redis,
 * offrant un contrôle fin par utilisateur, par rôle, et par endpoint.
 *
 * Avantages par rapport au simple sliding window :
 *   - Burst tolérant (permet des pics courts)
 *   - Rechargement progressif des tokens
 *   - Configurations par route/rôle
 *   - Métriques de consommation
 *
 * Algorithme Token Bucket :
 *   - Chaque bucket a une capacité max (tokens)
 *   - Les tokens se rechargent à un taux fixe (refillRate / refillInterval)
 *   - Chaque requête consomme 1+ tokens
 *   - Si pas de tokens disponibles → 429 Too Many Requests
 *
 * Redis Schema par clé :
 *   ratelimit:tb:{identifier} → hash {
 *     tokens:    nombre de tokens restants
 *     lastRefill: timestamp du dernier rechargement
 *   }
 */

import { redis } from '../config/redis.js';
import { Request, Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from '../middleware/auth.js';

// ── Types ───────────────────────────────────────────────────────────────────

export interface TokenBucketConfig {
    /** Maximum number of tokens (bucket capacity) */
    maxTokens: number;
    /** Tokens added per refill interval */
    refillRate: number;
    /** Refill interval in seconds */
    refillInterval: number;
    /** Tokens consumed per request (default: 1) */
    costPerRequest?: number;
    /** Key prefix for Redis */
    prefix?: string;
}

export interface RateLimitResult {
    allowed: boolean;
    remaining: number;
    limit: number;
    retryAfter: number | null;  // seconds until tokens available
    cost: number;
}

export interface RateLimitHeaders {
    'X-RateLimit-Limit': string;
    'X-RateLimit-Remaining': string;
    'X-RateLimit-Reset': string;
    'Retry-After'?: string;
}

// ── Preset Configurations ───────────────────────────────────────────────────

/**
 * Rate limit presets by role.
 * Higher roles get more generous limits.
 */
export const ROLE_PRESETS: Record<string, TokenBucketConfig> = {
    admin_sgg: {
        maxTokens: 500,
        refillRate: 50,
        refillInterval: 60,    // 50 tokens/min → ~500/10min burst
    },
    directeur_sgg: {
        maxTokens: 300,
        refillRate: 30,
        refillInterval: 60,
    },
    sgpr: {
        maxTokens: 200,
        refillRate: 20,
        refillInterval: 60,
    },
    sg_ministere: {
        maxTokens: 200,
        refillRate: 20,
        refillInterval: 60,
    },
    premier_ministre: {
        maxTokens: 200,
        refillRate: 20,
        refillInterval: 60,
    },
    ministre: {
        maxTokens: 150,
        refillRate: 15,
        refillInterval: 60,
    },
    dgjo: {
        maxTokens: 150,
        refillRate: 15,
        refillInterval: 60,
    },
    citoyen: {
        maxTokens: 60,
        refillRate: 10,
        refillInterval: 60,    // 10 tokens/min → 1 min burst of 60
    },
    // Default for unknown roles
    default: {
        maxTokens: 30,
        refillRate: 5,
        refillInterval: 60,
    },
};

/**
 * Route-specific overrides (more restrictive than role)
 */
export const ROUTE_PRESETS: Record<string, Partial<TokenBucketConfig>> = {
    '/api/auth/login': {
        maxTokens: 10,
        refillRate: 2,
        refillInterval: 60,     // 2 login attempts per minute max
    },
    '/api/auth/register': {
        maxTokens: 5,
        refillRate: 1,
        refillInterval: 120,    // 1 registration every 2 min
    },
    '/api/auth/2fa/verify': {
        maxTokens: 5,
        refillRate: 1,
        refillInterval: 30,     // Very restrictive for 2FA brute force prevention
    },
    '/api/audit/purge': {
        maxTokens: 1,
        refillRate: 1,
        refillInterval: 3600,   // 1 purge per hour
    },
    '/api/reporting': {
        maxTokens: 30,
        refillRate: 5,
        refillInterval: 60,     // Data-heavy
        costPerRequest: 2,      // Costs 2 tokens (heavier load)
    },
};

// ── Core Token Bucket ───────────────────────────────────────────────────────

const TB_PREFIX = 'ratelimit:tb:';

/**
 * Check and consume tokens from a bucket.
 * Uses Redis Hash for atomic token management.
 */
export async function consumeTokens(
    identifier: string,
    config: TokenBucketConfig
): Promise<RateLimitResult> {
    const key = `${TB_PREFIX}${config.prefix || ''}${identifier}`;
    const cost = config.costPerRequest || 1;
    const now = Date.now();

    try {
        // Lua script for atomic token bucket check + consume
        const luaScript = `
      local key = KEYS[1]
      local maxTokens = tonumber(ARGV[1])
      local refillRate = tonumber(ARGV[2])
      local refillInterval = tonumber(ARGV[3])
      local cost = tonumber(ARGV[4])
      local now = tonumber(ARGV[5])

      local tokens = tonumber(redis.call('hget', key, 'tokens'))
      local lastRefill = tonumber(redis.call('hget', key, 'lastRefill'))

      -- Initialize bucket if new
      if tokens == nil then
        tokens = maxTokens
        lastRefill = now
      end

      -- Refill tokens based on elapsed time
      local elapsed = (now - lastRefill) / 1000
      local refillIntervalMs = refillInterval * 1000
      local tokensToAdd = math.floor(elapsed / refillInterval) * refillRate

      if tokensToAdd > 0 then
        tokens = math.min(maxTokens, tokens + tokensToAdd)
        lastRefill = now
      end

      -- Check if enough tokens
      local allowed = 0
      if tokens >= cost then
        tokens = tokens - cost
        allowed = 1
      end

      -- Store updated state
      redis.call('hset', key, 'tokens', tokens, 'lastRefill', lastRefill)
      redis.call('expire', key, refillInterval * 10)

      return {allowed, tokens, lastRefill}
    `;

        const result = await redis.eval(
            luaScript,
            1,
            key,
            config.maxTokens,
            config.refillRate,
            config.refillInterval,
            cost,
            now
        ) as number[];

        const allowed = result[0] === 1;
        const remaining = Math.max(0, result[1]);

        // Calculate retry-after if blocked
        let retryAfter: number | null = null;
        if (!allowed) {
            retryAfter = Math.ceil(config.refillInterval / config.refillRate * cost);
        }

        return {
            allowed,
            remaining,
            limit: config.maxTokens,
            retryAfter,
            cost,
        };
    } catch (error) {
        // If Redis is down, allow the request (fail open)
        console.warn('[RateLimit] Redis unavailable, allowing request:', (error as Error).message);
        return {
            allowed: true,
            remaining: config.maxTokens,
            limit: config.maxTokens,
            retryAfter: null,
            cost,
        };
    }
}

/**
 * Get current bucket status without consuming tokens
 */
export async function getBucketStatus(
    identifier: string,
    config: TokenBucketConfig
): Promise<{ tokens: number; maxTokens: number; lastRefill: number }> {
    const key = `${TB_PREFIX}${config.prefix || ''}${identifier}`;

    try {
        const [tokens, lastRefill] = await redis.hmget(key, 'tokens', 'lastRefill');
        return {
            tokens: parseInt(tokens || String(config.maxTokens)),
            maxTokens: config.maxTokens,
            lastRefill: parseInt(lastRefill || '0'),
        };
    } catch {
        return { tokens: config.maxTokens, maxTokens: config.maxTokens, lastRefill: 0 };
    }
}

/**
 * Reset a bucket (e.g., after password change or admin action)
 */
export async function resetBucket(identifier: string, prefix?: string): Promise<void> {
    const key = `${TB_PREFIX}${prefix || ''}${identifier}`;
    try {
        await redis.del(key);
    } catch {
        /* ignore */
    }
}

// ── Express Middleware ───────────────────────────────────────────────────────

/**
 * Express middleware for token bucket rate limiting.
 *
 * Resolves the user identifier and configuration based on:
 *   1. Route-specific overrides
 *   2. User role presets
 *   3. Default config
 *
 * Adds X-RateLimit-* headers to the response.
 *
 * Usage:
 *   app.use('/api', tokenBucketRateLimit());
 *   app.use('/api/auth/login', tokenBucketRateLimit({ maxTokens: 5 }));
 */
export function tokenBucketRateLimit(overrideConfig?: Partial<TokenBucketConfig>) {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        // Determine identifier: userId or IP
        const authReq = req as AuthenticatedRequest;
        const userId = authReq.user?.userId;
        const userRole = authReq.user?.role || 'default';
        const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim()
            || req.socket.remoteAddress
            || 'unknown';

        const identifier = userId ? `user:${userId}` : `ip:${ip}`;

        // Resolve config: override > route preset > role preset > default
        const routeConfig = ROUTE_PRESETS[req.path];
        const roleConfig = ROLE_PRESETS[userRole] || ROLE_PRESETS.default;

        const config: TokenBucketConfig = {
            ...roleConfig,
            ...routeConfig,
            ...overrideConfig,
            prefix: `${req.path}:`,
        };

        // Consume tokens
        const result = await consumeTokens(identifier, config);

        // Set rate limit headers
        res.set('X-RateLimit-Limit', String(result.limit));
        res.set('X-RateLimit-Remaining', String(result.remaining));
        res.set('X-RateLimit-Reset', String(Math.ceil(Date.now() / 1000) + (config.refillInterval || 60)));

        if (!result.allowed) {
            if (result.retryAfter) {
                res.set('Retry-After', String(result.retryAfter));
            }

            res.status(429).json({
                success: false,
                error: {
                    code: 'RATE_LIMITED',
                    message: 'Trop de requêtes. Veuillez réessayer dans un instant.',
                    retryAfter: result.retryAfter,
                    remaining: result.remaining,
                },
            });
            return;
        }

        next();
    };
}

// ── Metrics / Stats ─────────────────────────────────────────────────────────

/**
 * Get rate limiting stats for a specific user
 */
export async function getUserRateLimitStats(userId: string): Promise<Record<string, any>> {
    const pattern = `${TB_PREFIX}*:user:${userId}`;

    try {
        const keys = await redis.keys(pattern);
        const stats: Record<string, any> = {};

        for (const key of keys) {
            const [tokens, lastRefill] = await redis.hmget(key, 'tokens', 'lastRefill');
            const route = key.replace(TB_PREFIX, '').replace(`:user:${userId}`, '');
            stats[route || 'global'] = {
                tokens: parseInt(tokens || '0'),
                lastRefill: parseInt(lastRefill || '0'),
            };
        }

        return {
            userId,
            buckets: stats,
            timestamp: Date.now(),
        };
    } catch {
        return { userId, buckets: {}, timestamp: Date.now() };
    }
}
