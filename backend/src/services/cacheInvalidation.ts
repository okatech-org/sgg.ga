/**
 * SGG Digital — Service de Cache Invalidation via Redis Pub/Sub
 *
 * Ce service gère l'invalidation intelligente du cache serveur
 * quand des données sont modifiées. Il utilise Redis Pub/Sub
 * pour notifier toutes les instances (multi-pod/Cloud Run).
 *
 * Canaux :
 *   - cache:invalidate   → invalidation de clés/patterns
 *   - cache:flush        → flush complet d'un module
 *   - data:changed       → événement data-change avec propagation
 *
 * Pattern d'utilisation :
 *   1. Un write (POST/PUT/DELETE) modifie la DB
 *   2. Le handler appelle invalidateCache() ou publishDataChange()
 *   3. Redis Pub/Sub propage l'événement à toutes les instances
 *   4. Chaque instance supprime les clés correspondantes de son cache local
 */

import {
    redis,
    cacheDelete,
    cacheDeletePattern,
    publishNotification,
} from '../config/redis.js';
import type { Redis as RedisType } from 'ioredis';

// ── Types ───────────────────────────────────────────────────────────────────

export type CacheModule =
    | 'institutions'
    | 'gar'
    | 'reporting'
    | 'nominations'
    | 'users'
    | 'jo'
    | 'egop'
    | 'ptm';

export interface InvalidationEvent {
    module: CacheModule;
    keys?: string[];       // specific keys to invalidate
    pattern?: string;      // glob pattern to invalidate (e.g. 'reporting:*')
    reason: string;        // human-readable reason
    userId?: string;       // who triggered it
    timestamp: number;
}

export interface DataChangeEvent {
    module: CacheModule;
    action: 'create' | 'update' | 'delete' | 'batch';
    entityType: string;    // e.g. 'report', 'institution', 'priority'
    entityId?: string;
    userId?: string;
    metadata?: Record<string, unknown>;
    timestamp: number;
}

// ── Constants ───────────────────────────────────────────────────────────────

const CHANNEL_INVALIDATE = 'cache:invalidate';
const CHANNEL_FLUSH = 'cache:flush';
const CHANNEL_DATA_CHANGED = 'data:changed';

// Module-to-cache-prefix mapping
const MODULE_CACHE_PREFIXES: Record<CacheModule, string[]> = {
    institutions: ['institutions:', 'inst:'],
    gar: ['gar:', 'priorities:', 'objectives:'],
    reporting: ['reporting:', 'reports:', 'validation:', 'completion:'],
    nominations: ['nominations:', 'nominees:'],
    users: ['users:', 'profiles:', 'roles:'],
    jo: ['jo:', 'journal:'],
    egop: ['egop:', 'conseil:'],
    ptm: ['ptm:', 'ptg:', 'programme:'],
};

// Cache TTL per module (seconds)
const MODULE_TTL: Record<CacheModule, number> = {
    institutions: 3600,      // 1h — rarely changes
    gar: 1800,               // 30min — priorities/objectives
    reporting: 300,           // 5min — frequently updated
    nominations: 1800,        // 30min
    users: 600,               // 10min
    jo: 3600,                 // 1h — published content
    egop: 1800,               // 30min
    ptm: 1800,                // 30min
};

// ── Invalidation Stats ──────────────────────────────────────────────────────

interface InvalidationStats {
    totalInvalidations: number;
    totalKeysDeleted: number;
    lastInvalidation: number | null;
    byModule: Record<string, number>;
}

const stats: InvalidationStats = {
    totalInvalidations: 0,
    totalKeysDeleted: 0,
    lastInvalidation: null,
    byModule: {},
};

// ── Core Functions ──────────────────────────────────────────────────────────

/**
 * Invalidate specific cache keys for a module
 */
export async function invalidateCache(event: Omit<InvalidationEvent, 'timestamp'>): Promise<number> {
    const fullEvent: InvalidationEvent = {
        ...event,
        timestamp: Date.now(),
    };

    let deletedCount = 0;

    try {
        // Delete specific keys
        if (event.keys && event.keys.length > 0) {
            for (const key of event.keys) {
                await cacheDelete(key);
                deletedCount++;
            }
        }

        // Delete by pattern
        if (event.pattern) {
            const count = await cacheDeletePattern(event.pattern);
            deletedCount += count;
        }

        // If no specific keys or pattern, flush all module keys
        if (!event.keys && !event.pattern) {
            const prefixes = MODULE_CACHE_PREFIXES[event.module] || [];
            for (const prefix of prefixes) {
                const count = await cacheDeletePattern(`${prefix}*`);
                deletedCount += count;
            }
        }

        // Publish to other instances via Pub/Sub
        await redis.publish(CHANNEL_INVALIDATE, JSON.stringify(fullEvent));

        // Update stats
        stats.totalInvalidations++;
        stats.totalKeysDeleted += deletedCount;
        stats.lastInvalidation = fullEvent.timestamp;
        stats.byModule[event.module] = (stats.byModule[event.module] || 0) + 1;

        console.log(
            `[Cache] ♻️ Invalidated ${deletedCount} keys for module "${event.module}" — ${event.reason}`
        );

        return deletedCount;
    } catch (err) {
        console.error('[Cache] Erreur invalidation:', err);
        return 0;
    }
}

/**
 * Flush all cache for a specific module
 */
export async function flushModuleCache(module: CacheModule, reason: string): Promise<number> {
    let totalDeleted = 0;

    const prefixes = MODULE_CACHE_PREFIXES[module] || [];
    for (const prefix of prefixes) {
        const count = await cacheDeletePattern(`${prefix}*`);
        totalDeleted += count;
    }

    // Notify other instances
    await redis.publish(CHANNEL_FLUSH, JSON.stringify({
        module,
        reason,
        timestamp: Date.now(),
    }));

    console.log(`[Cache] 🗑️ Flushed ${totalDeleted} keys for module "${module}" — ${reason}`);
    return totalDeleted;
}

/**
 * Publish a data change event (triggers cache invalidation + optional notifications)
 */
export async function publishDataChange(event: Omit<DataChangeEvent, 'timestamp'>): Promise<void> {
    const fullEvent: DataChangeEvent = {
        ...event,
        timestamp: Date.now(),
    };

    try {
        // Invalidate related cache
        await invalidateCache({
            module: event.module,
            reason: `${event.action} ${event.entityType}${event.entityId ? ` #${event.entityId}` : ''}`,
            userId: event.userId,
        });

        // Publish data change event
        await redis.publish(CHANNEL_DATA_CHANGED, JSON.stringify(fullEvent));

        // For critical changes, also publish a realtime notification
        if (event.action === 'delete' || event.module === 'reporting') {
            await publishNotification('data_changed', {
                module: event.module,
                action: event.action,
                entityType: event.entityType,
                entityId: event.entityId,
            });
        }

        console.log(
            `[Cache] 📢 Data change: ${event.action} ${event.entityType} in ${event.module}`
        );
    } catch (err) {
        console.error('[Cache] Erreur publication data change:', err);
    }
}

// ── Subscriber (runs on each instance) ──────────────────────────────────────

let subscriber: RedisType | null = null;

/**
 * Start listening for cache invalidation events from other instances.
 * Call this once at server startup.
 */
export async function startCacheInvalidationListener(): Promise<void> {
    try {
        const sub = redis.duplicate();
        subscriber = sub;
        await sub.subscribe(CHANNEL_INVALIDATE, CHANNEL_FLUSH, CHANNEL_DATA_CHANGED);

        sub.on('message', async (channel: string, message: string) => {
            try {
                const data = JSON.parse(message);

                switch (channel) {
                    case CHANNEL_INVALIDATE: {
                        const event = data as InvalidationEvent;
                        console.log(`[Cache] 📥 Remote invalidation: ${event.module} — ${event.reason}`);

                        // Delete local cache (the publishing instance already did its own)
                        if (event.keys) {
                            for (const key of event.keys) {
                                await cacheDelete(key);
                            }
                        }
                        if (event.pattern) {
                            await cacheDeletePattern(event.pattern);
                        }
                        break;
                    }

                    case CHANNEL_FLUSH: {
                        const { module, reason } = data;
                        console.log(`[Cache] 📥 Remote flush: ${module} — ${reason}`);
                        const prefixes = MODULE_CACHE_PREFIXES[module as CacheModule] || [];
                        for (const prefix of prefixes) {
                            await cacheDeletePattern(`${prefix}*`);
                        }
                        break;
                    }

                    case CHANNEL_DATA_CHANGED: {
                        const event = data as DataChangeEvent;
                        console.log(
                            `[Cache] 📥 Data changed: ${event.action} ${event.entityType} in ${event.module}`
                        );
                        // Could trigger websocket notifications to connected clients here
                        break;
                    }
                }
            } catch (err) {
                console.error('[Cache] Erreur traitement message pub/sub:', err);
            }
        });

        console.log('[Cache] ✅ Cache invalidation listener started (3 channels)');
    } catch (err) {
        console.warn('[Cache] ⚠️ Could not start invalidation listener (Redis unavailable):', err);
    }
}

/**
 * Stop the cache invalidation listener
 */
export async function stopCacheInvalidationListener(): Promise<void> {
    if (subscriber) {
        await subscriber.unsubscribe();
        await subscriber.quit();
        subscriber = null;
        console.log('[Cache] Cache invalidation listener stopped');
    }
}

// ── Stats ───────────────────────────────────────────────────────────────────

export function getCacheInvalidationStats(): InvalidationStats {
    return { ...stats };
}

/**
 * Get the recommended TTL for a module's cache
 */
export function getModuleTTL(module: CacheModule): number {
    return MODULE_TTL[module] || 3600;
}

// ── Express Middleware (optional) ───────────────────────────────────────────

import type { Request, Response, NextFunction } from 'express';

/**
 * Middleware that auto-invalidates cache after successful write operations.
 * Attach to POST/PUT/PATCH/DELETE routes.
 *
 * Usage:
 *   router.post('/reports', autoCacheInvalidation('reporting', 'report'), handler);
 */
export function autoCacheInvalidation(module: CacheModule, entityType: string) {
    return (req: Request, res: Response, next: NextFunction) => {
        // Store original json method
        const originalJson = res.json.bind(res);

        // Override json to intercept successful responses
        res.json = function (data: any) {
            // Only invalidate for successful write operations
            if (res.statusCode >= 200 && res.statusCode < 300) {
                const method = req.method.toUpperCase();
                const actionMap: Record<string, DataChangeEvent['action']> = {
                    POST: 'create',
                    PUT: 'update',
                    PATCH: 'update',
                    DELETE: 'delete',
                };

                const action = actionMap[method];
                if (action) {
                    // Fire-and-forget invalidation
                    publishDataChange({
                        module,
                        action,
                        entityType,
                        entityId: req.params.id || data?.id,
                        userId: (req as any).user?.userId,
                    }).catch(err => console.error('[Cache] Auto-invalidation error:', err));
                }
            }

            return originalJson(data);
        };

        next();
    };
}
