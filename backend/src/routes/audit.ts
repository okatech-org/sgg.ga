/**
 * SGG Digital — Routes API Audit Trail
 *
 * Endpoints pour consulter l'historique des actions.
 * Réservé aux administrateurs.
 *
 * Routes :
 *   GET  /api/audit          → Liste paginée des logs
 *   GET  /api/audit/stats    → Statistiques résumées
 *   GET  /api/audit/:id      → Détail d'un log
 *   POST /api/audit/purge    → Purger les anciens logs (super admin)
 */

import { Router, Request, Response } from 'express';
import {
    queryAuditLogs,
    getAuditStats,
    purgeOldAuditLogs,
    type AuditAction,
    type AuditModule,
    type AuditStatus,
} from '../services/auditTrail.js';
import { query } from '../config/database.js';
import type { AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

// ── List audit logs (paginated + filtered) ──────────────────────────────────

router.get('/', async (req: Request, res: Response): Promise<void> => {
    try {
        const authReq = req as AuthenticatedRequest;
        if (!authReq.user) {
            res.status(401).json({ error: 'Authentication required' });
            return;
        }

        // Only admin and directeur can access audit logs
        if (!['admin_sgg', 'directeur_sgg'].includes(authReq.user.role)) {
            res.status(403).json({ error: 'Accès réservé aux administrateurs' });
            return;
        }

        const {
            userId,
            action,
            module,
            resourceType,
            resourceId,
            status,
            startDate,
            endDate,
            page = '1',
            pageSize = '50',
            orderBy = 'created_at',
            orderDir = 'DESC',
        } = req.query;

        const limit = Math.min(parseInt(pageSize as string) || 50, 200);
        const offset = (Math.max(parseInt(page as string) || 1, 1) - 1) * limit;

        const result = await queryAuditLogs({
            userId: userId as string,
            action: action as AuditAction,
            module: module as AuditModule,
            resourceType: resourceType as string,
            resourceId: resourceId as string,
            status: status as AuditStatus,
            startDate: startDate ? new Date(startDate as string) : undefined,
            endDate: endDate ? new Date(endDate as string) : undefined,
            limit,
            offset,
            orderBy: orderBy as 'created_at' | 'action' | 'module',
            orderDir: orderDir as 'ASC' | 'DESC',
        });

        res.json({ success: true, data: result });
    } catch (error) {
        console.error('[Audit Route] Erreur liste:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des logs' });
    }
});

// ── Statistics ──────────────────────────────────────────────────────────────

router.get('/stats', async (req: Request, res: Response): Promise<void> => {
    try {
        const authReq = req as AuthenticatedRequest;
        if (!authReq.user) {
            res.status(401).json({ error: 'Authentication required' });
            return;
        }

        if (!['admin_sgg', 'directeur_sgg'].includes(authReq.user.role)) {
            res.status(403).json({ error: 'Accès réservé aux administrateurs' });
            return;
        }

        const days = parseInt(req.query.days as string) || 30;
        const stats = await getAuditStats(Math.min(days, 365));

        res.json({ success: true, data: stats });
    } catch (error) {
        console.error('[Audit Route] Erreur stats:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des statistiques' });
    }
});

// ── Get single entry ────────────────────────────────────────────────────────

router.get('/:id', async (req: Request, res: Response): Promise<void> => {
    try {
        const authReq = req as AuthenticatedRequest;
        if (!authReq.user) {
            res.status(401).json({ error: 'Authentication required' });
            return;
        }

        if (!['admin_sgg', 'directeur_sgg'].includes(authReq.user.role)) {
            res.status(403).json({ error: 'Accès réservé aux administrateurs' });
            return;
        }

        const result = await query(
            `SELECT id, user_id, user_email, user_role, action, resource_type, resource_id,
              module, details, ip_address, user_agent, status, duration_ms, created_at
       FROM audit_logs WHERE id = $1`,
            [req.params.id]
        );

        if (result.rows.length === 0) {
            res.status(404).json({ error: 'Entrée d\'audit non trouvée' });
            return;
        }

        const row = result.rows[0];
        res.json({
            success: true,
            data: {
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
            },
        });
    } catch (error) {
        console.error('[Audit Route] Erreur détail:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération du log' });
    }
});

// ── Purge old entries (super admin only) ────────────────────────────────────

router.post('/purge', async (req: Request, res: Response): Promise<void> => {
    try {
        const authReq = req as AuthenticatedRequest;
        if (!authReq.user) {
            res.status(401).json({ error: 'Authentication required' });
            return;
        }

        if (authReq.user.role !== 'admin_sgg') {
            res.status(403).json({ error: 'Réservé au super administrateur' });
            return;
        }

        const { olderThanDays = 365 } = req.body;
        const days = Math.max(parseInt(olderThanDays) || 365, 30); // Min 30 jours

        const deleted = await purgeOldAuditLogs(days);

        res.json({
            success: true,
            data: {
                deleted,
                message: `${deleted} entrée(s) d'audit supprimée(s) (plus de ${days} jours)`,
            },
        });
    } catch (error) {
        console.error('[Audit Route] Erreur purge:', error);
        res.status(500).json({ error: 'Erreur lors de la purge' });
    }
});

export default router;
