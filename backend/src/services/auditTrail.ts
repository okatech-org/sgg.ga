/**
 * SGG Digital — Service Audit Trail
 *
 * Enregistre toutes les actions utilisateur dans une table d'historique.
 * Fournit des fonctions de création, lecture, et recherche.
 *
 * Table SQL (à créer via migration) :
 *
 *   CREATE TABLE audit_logs (
 *     id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
 *     user_id         UUID NOT NULL,
 *     user_email      VARCHAR(255) NOT NULL,
 *     user_role       VARCHAR(100) NOT NULL,
 *     action          VARCHAR(100) NOT NULL,
 *     resource_type   VARCHAR(100) NOT NULL,
 *     resource_id     VARCHAR(255),
 *     module          VARCHAR(50),
 *     details         JSONB DEFAULT '{}',
 *     ip_address      VARCHAR(45),
 *     user_agent      TEXT,
 *     status          VARCHAR(20) DEFAULT 'success',
 *     duration_ms     INTEGER,
 *     created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
 *   );
 *
 *   CREATE INDEX idx_audit_user    ON audit_logs(user_id);
 *   CREATE INDEX idx_audit_action  ON audit_logs(action);
 *   CREATE INDEX idx_audit_module  ON audit_logs(module);
 *   CREATE INDEX idx_audit_date    ON audit_logs(created_at);
 *   CREATE INDEX idx_audit_resource ON audit_logs(resource_type, resource_id);
 */

import { query } from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';
import { Request, Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from '../middleware/auth.js';

// ── Types ───────────────────────────────────────────────────────────────────

export type AuditAction =
    | 'create' | 'read' | 'update' | 'delete'
    | 'login' | 'logout' | 'login_failed'
    | 'export' | 'import'
    | 'approve' | 'reject' | 'publish' | 'archive'
    | 'permission_change' | 'role_change'
    | '2fa_enable' | '2fa_disable' | '2fa_verify'
    | 'bulk_update' | 'migration'
    | 'setting_change' | 'password_change';

export type AuditStatus = 'success' | 'failure' | 'error' | 'warning';

export type AuditModule =
    | 'auth' | 'users' | 'institutions'
    | 'gar' | 'nominations' | 'legislatif'
    | 'egop' | 'jo' | 'ptm'
    | 'reporting' | 'admin' | 'system';

export interface AuditEntry {
    id?: string;
    userId: string;
    userEmail: string;
    userRole: string;
    action: AuditAction;
    resourceType: string;
    resourceId?: string;
    module?: AuditModule;
    details?: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
    status?: AuditStatus;
    durationMs?: number;
    createdAt?: Date;
}

export interface AuditQueryOptions {
    userId?: string;
    action?: AuditAction;
    module?: AuditModule;
    resourceType?: string;
    resourceId?: string;
    status?: AuditStatus;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
    orderBy?: 'created_at' | 'action' | 'module';
    orderDir?: 'ASC' | 'DESC';
}

export interface AuditQueryResult {
    entries: AuditEntry[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

// ── Core Functions ──────────────────────────────────────────────────────────

/**
 * Record an audit log entry
 */
export async function logAudit(entry: AuditEntry): Promise<string> {
    const id = entry.id || uuidv4();

    try {
        await query(
            `INSERT INTO audit_logs
        (id, user_id, user_email, user_role, action, resource_type, resource_id,
         module, details, ip_address, user_agent, status, duration_ms)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
            [
                id,
                entry.userId,
                entry.userEmail,
                entry.userRole,
                entry.action,
                entry.resourceType,
                entry.resourceId || null,
                entry.module || null,
                JSON.stringify(entry.details || {}),
                entry.ipAddress || null,
                entry.userAgent || null,
                entry.status || 'success',
                entry.durationMs || null,
            ]
        );

        return id;
    } catch (error) {
        // Fail silently — audit logging should never break the app
        console.error('[Audit] Failed to log entry:', (error as Error).message);
        return id;
    }
}

/**
 * Query audit logs with filtering and pagination
 */
export async function queryAuditLogs(options: AuditQueryOptions = {}): Promise<AuditQueryResult> {
    const {
        userId,
        action,
        module,
        resourceType,
        resourceId,
        status,
        startDate,
        endDate,
        limit = 50,
        offset = 0,
        orderBy = 'created_at',
        orderDir = 'DESC',
    } = options;

    const conditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (userId) {
        conditions.push(`user_id = $${paramIndex++}`);
        params.push(userId);
    }
    if (action) {
        conditions.push(`action = $${paramIndex++}`);
        params.push(action);
    }
    if (module) {
        conditions.push(`module = $${paramIndex++}`);
        params.push(module);
    }
    if (resourceType) {
        conditions.push(`resource_type = $${paramIndex++}`);
        params.push(resourceType);
    }
    if (resourceId) {
        conditions.push(`resource_id = $${paramIndex++}`);
        params.push(resourceId);
    }
    if (status) {
        conditions.push(`status = $${paramIndex++}`);
        params.push(status);
    }
    if (startDate) {
        conditions.push(`created_at >= $${paramIndex++}`);
        params.push(startDate.toISOString());
    }
    if (endDate) {
        conditions.push(`created_at <= $${paramIndex++}`);
        params.push(endDate.toISOString());
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Validate orderBy to prevent SQL injection
    const validOrderBy: Record<string, string> = {
        created_at: 'created_at',
        action: 'action',
        module: 'module',
    };
    const safeOrderBy = validOrderBy[orderBy] || 'created_at';
    const safeOrderDir = orderDir === 'ASC' ? 'ASC' : 'DESC';

    // Get total count
    const countResult = await query(
        `SELECT COUNT(*) as total FROM audit_logs ${whereClause}`,
        params
    );
    const total = parseInt(countResult.rows[0]?.total || '0', 10);

    // Get entries
    const entriesResult = await query(
        `SELECT id, user_id, user_email, user_role, action, resource_type, resource_id,
            module, details, ip_address, user_agent, status, duration_ms, created_at
     FROM audit_logs
     ${whereClause}
     ORDER BY ${safeOrderBy} ${safeOrderDir}
     LIMIT $${paramIndex++} OFFSET $${paramIndex++}`,
        [...params, limit, offset]
    );

    const entries: AuditEntry[] = entriesResult.rows.map((row: any) => ({
        id: row.id,
        userId: row.user_id,
        userEmail: row.user_email,
        userRole: row.user_role,
        action: row.action,
        resourceType: row.resource_type,
        resourceId: row.resource_id,
        module: row.module,
        details: row.details,
        ipAddress: row.ip_address,
        userAgent: row.user_agent,
        status: row.status,
        durationMs: row.duration_ms,
        createdAt: row.created_at,
    }));

    return {
        entries,
        total,
        page: Math.floor(offset / limit) + 1,
        pageSize: limit,
        totalPages: Math.ceil(total / limit),
    };
}

/**
 * Get audit log summary statistics
 */
export async function getAuditStats(days: number = 30): Promise<Record<string, any>> {
    const since = new Date();
    since.setDate(since.getDate() - days);

    try {
        const [
            totalResult,
            actionStats,
            moduleStats,
            statusStats,
            topUsersResult,
        ] = await Promise.all([
            query(
                `SELECT COUNT(*) as total FROM audit_logs WHERE created_at >= $1`,
                [since.toISOString()]
            ),
            query(
                `SELECT action, COUNT(*) as count
         FROM audit_logs WHERE created_at >= $1
         GROUP BY action ORDER BY count DESC LIMIT 10`,
                [since.toISOString()]
            ),
            query(
                `SELECT module, COUNT(*) as count
         FROM audit_logs WHERE created_at >= $1 AND module IS NOT NULL
         GROUP BY module ORDER BY count DESC`,
                [since.toISOString()]
            ),
            query(
                `SELECT status, COUNT(*) as count
         FROM audit_logs WHERE created_at >= $1
         GROUP BY status`,
                [since.toISOString()]
            ),
            query(
                `SELECT user_email, COUNT(*) as count
         FROM audit_logs WHERE created_at >= $1
         GROUP BY user_email ORDER BY count DESC LIMIT 10`,
                [since.toISOString()]
            ),
        ]);

        return {
            period: { days, since: since.toISOString() },
            total: parseInt(totalResult.rows[0]?.total || '0', 10),
            byAction: actionStats.rows.map((r: any) => ({ action: r.action, count: parseInt(r.count) })),
            byModule: moduleStats.rows.map((r: any) => ({ module: r.module, count: parseInt(r.count) })),
            byStatus: statusStats.rows.map((r: any) => ({ status: r.status, count: parseInt(r.count) })),
            topUsers: topUsersResult.rows.map((r: any) => ({ email: r.user_email, count: parseInt(r.count) })),
        };
    } catch (error) {
        console.error('[Audit] Failed to get stats:', (error as Error).message);
        return { error: 'Stats unavailable', total: 0 };
    }
}

/**
 * Clean up old audit logs (retention policy)
 */
export async function purgeOldAuditLogs(olderThanDays: number = 365): Promise<number> {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - olderThanDays);

    try {
        const result = await query(
            `DELETE FROM audit_logs WHERE created_at < $1`,
            [cutoff.toISOString()]
        );
        const count = result.rowCount || 0;
        console.log(`[Audit] Purged ${count} entries older than ${olderThanDays} days`);
        return count;
    } catch (error) {
        console.error('[Audit] Failed to purge:', (error as Error).message);
        return 0;
    }
}

// ── Express Middleware ───────────────────────────────────────────────────────

/**
 * Middleware that automatically logs API requests to the audit trail.
 *
 * Usage: app.use('/api', auditMiddleware('module_name'));
 *
 * Only logs mutating operations (POST, PUT, PATCH, DELETE) by default.
 */
export function auditMiddleware(module?: AuditModule) {
    return (req: Request, res: Response, next: NextFunction) => {
        // Only log write operations
        if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
            return next();
        }

        const startTime = Date.now();

        // Override res.json to capture response status
        const originalJson = res.json.bind(res);
        res.json = function (body: any) {
            const durationMs = Date.now() - startTime;
            const authReq = req as AuthenticatedRequest;

            if (authReq.user) {
                const auditStatus: AuditStatus = res.statusCode >= 400 ? 'failure'
                    : res.statusCode >= 500 ? 'error'
                        : 'success';

                // Determine action from HTTP method
                const actionMap: Record<string, AuditAction> = {
                    POST: 'create',
                    PUT: 'update',
                    PATCH: 'update',
                    DELETE: 'delete',
                };
                const action = actionMap[req.method] || 'update';

                // Extract resource info from URL
                const pathParts = req.path.split('/').filter(Boolean);
                const resourceType = pathParts[0] || 'unknown';
                const resourceId = pathParts[1] || undefined;

                // Log asynchronously (don't block response)
                logAudit({
                    userId: authReq.user.userId,
                    userEmail: authReq.user.email,
                    userRole: authReq.user.role,
                    action,
                    resourceType,
                    resourceId,
                    module,
                    details: {
                        method: req.method,
                        path: req.path,
                        statusCode: res.statusCode,
                        bodyKeys: body && typeof body === 'object' ? Object.keys(body) : [],
                    },
                    ipAddress: (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim()
                        || req.socket.remoteAddress
                        || undefined,
                    userAgent: req.headers['user-agent'],
                    status: auditStatus,
                    durationMs,
                }).catch(() => { /* swallow audit errors */ });
            }

            return originalJson(body);
        };

        next();
    };
}
