/**
 * NEOCORTEX — 📚 Hippocampe
 * Mémoire du système — audit trail exhaustif avec avant/après pour les updates.
 * Chaque action utilisateur et système est tracée ici.
 */

import { query } from '../config/database.js';
import {
    ActionHistorique,
    CategorieAction,
    CATEGORIES_ACTION,
} from './types.js';

// ============================================================================
// LOGGING D'ACTIONS
// ============================================================================

/**
 * Loguer une action dans l'hippocampe.
 * Pour les updates, fournir details.avant et details.apres.
 */
export async function loguerAction(action: ActionHistorique): Promise<string> {
    try {
        const result = await query<{ id: string }>(
            `INSERT INTO neocortex.historique_actions
        (action, categorie, entite_type, entite_id,
         user_id, user_email, user_role,
         details, metadata, correlation_id, duration_ms)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING id`,
            [
                action.action,
                action.categorie,
                action.entiteType,
                action.entiteId || null,
                action.userId || null,
                action.userEmail || null,
                action.userRole || null,
                JSON.stringify(action.details),
                JSON.stringify(action.metadata || {}),
                action.correlationId || null,
                action.durationMs || null,
            ]
        );

        return result.rows[0].id;
    } catch (error) {
        console.error('[Hippocampe] Erreur logging action:', error);
        // Ne pas throw — l'audit ne doit jamais bloquer l'opération métier
        return '';
    }
}

/**
 * Raccourci pour loguer une action métier avec contexte utilisateur.
 */
export async function loguerActionMetier(
    action: string,
    entiteType: string,
    entiteId: string,
    user: { userId: string; email: string; role: string },
    details: { avant?: Record<string, unknown>; apres?: Record<string, unknown> } = {},
    metadata: Record<string, unknown> = {}
): Promise<string> {
    return loguerAction({
        action,
        categorie: CATEGORIES_ACTION.METIER,
        entiteType,
        entiteId,
        userId: user.userId,
        userEmail: user.email,
        userRole: user.role,
        details,
        metadata,
    });
}

// ============================================================================
// REQUÊTES D'HISTORIQUE
// ============================================================================

interface HistoriqueFilters {
    entiteType?: string;
    entiteId?: string;
    userId?: string;
    categorie?: CategorieAction;
    action?: string;
    dateDebut?: Date;
    dateFin?: Date;
    page?: number;
    limit?: number;
}

/**
 * Lister l'historique des actions avec filtres et pagination.
 */
export async function listerHistorique(filters: HistoriqueFilters = {}): Promise<{
    actions: Array<{
        id: string;
        action: string;
        categorie: string;
        entiteType: string;
        entiteId: string | null;
        userId: string | null;
        userEmail: string | null;
        userRole: string | null;
        details: Record<string, unknown>;
        metadata: Record<string, unknown>;
        correlationId: string | null;
        durationMs: number | null;
        createdAt: Date;
    }>;
    total: number;
    page: number;
    totalPages: number;
}> {
    const conditions: string[] = [];
    const params: unknown[] = [];
    let paramIdx = 1;

    if (filters.entiteType) {
        conditions.push(`entite_type = $${paramIdx++}`);
        params.push(filters.entiteType);
    }
    if (filters.entiteId) {
        conditions.push(`entite_id = $${paramIdx++}`);
        params.push(filters.entiteId);
    }
    if (filters.userId) {
        conditions.push(`user_id = $${paramIdx++}`);
        params.push(filters.userId);
    }
    if (filters.categorie) {
        conditions.push(`categorie = $${paramIdx++}`);
        params.push(filters.categorie);
    }
    if (filters.action) {
        conditions.push(`action = $${paramIdx++}`);
        params.push(filters.action);
    }
    if (filters.dateDebut) {
        conditions.push(`created_at >= $${paramIdx++}`);
        params.push(filters.dateDebut);
    }
    if (filters.dateFin) {
        conditions.push(`created_at <= $${paramIdx++}`);
        params.push(filters.dateFin);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const limit = Math.min(filters.limit || 50, 200);
    const page = Math.max(filters.page || 1, 1);
    const offset = (page - 1) * limit;

    const [data, count] = await Promise.all([
        query(
            `SELECT id, action, categorie, entite_type, entite_id,
              user_id, user_email, user_role, details, metadata,
              correlation_id, duration_ms, created_at
       FROM neocortex.historique_actions
       ${whereClause}
       ORDER BY created_at DESC
       LIMIT $${paramIdx++} OFFSET $${paramIdx++}`,
            [...params, limit, offset]
        ),
        query(
            `SELECT COUNT(*) as total FROM neocortex.historique_actions ${whereClause}`,
            params
        ),
    ]);

    const total = parseInt(count.rows[0].total);

    return {
        actions: data.rows.map((r: any) => ({
            id: r.id,
            action: r.action,
            categorie: r.categorie,
            entiteType: r.entite_type,
            entiteId: r.entite_id,
            userId: r.user_id,
            userEmail: r.user_email,
            userRole: r.user_role,
            details: r.details,
            metadata: r.metadata,
            correlationId: r.correlation_id,
            durationMs: r.duration_ms,
            createdAt: r.created_at,
        })),
        total,
        page,
        totalPages: Math.ceil(total / limit),
    };
}

/**
 * Historique d'une entité spécifique (timeline).
 */
export async function historiqueEntite(
    entiteType: string,
    entiteId: string,
    limit = 50
): Promise<Array<{
    id: string;
    action: string;
    userEmail: string | null;
    userRole: string | null;
    details: Record<string, unknown>;
    createdAt: Date;
}>> {
    const result = await query(
        `SELECT id, action, user_email, user_role, details, created_at
     FROM neocortex.historique_actions
     WHERE entite_type = $1 AND entite_id = $2
     ORDER BY created_at DESC
     LIMIT $3`,
        [entiteType, entiteId, limit]
    );

    return result.rows.map((r: any) => ({
        id: r.id,
        action: r.action,
        userEmail: r.user_email,
        userRole: r.user_role,
        details: r.details,
        createdAt: r.created_at,
    }));
}

// ============================================================================
// MÉTRIQUES HIPPOCAMPE
// ============================================================================

/**
 * Calcule et insère les métriques d'activité dans la table metriques.
 * Appelé périodiquement par le cron circadien.
 */
export async function calculerMetriques(): Promise<void> {
    try {
        // Actions par catégorie dans la dernière heure
        const parCategorie = await query(
            `SELECT categorie, COUNT(*) as c
       FROM neocortex.historique_actions
       WHERE created_at > NOW() - interval '1 hour'
       GROUP BY categorie`
        );

        for (const row of parCategorie.rows as any[]) {
            await query(
                `INSERT INTO neocortex.metriques (nom, valeur, unite, periode, dimensions)
         VALUES ($1, $2, $3, $4, $5)`,
                [
                    'hippocampe.actions_par_categorie',
                    parseInt(row.c),
                    'count',
                    'heure',
                    JSON.stringify({ categorie: row.categorie }),
                ]
            );
        }

        // Actions totales dernière heure
        const total = await query(
            `SELECT COUNT(*) as c FROM neocortex.historique_actions
       WHERE created_at > NOW() - interval '1 hour'`
        );

        await query(
            `INSERT INTO neocortex.metriques (nom, valeur, unite, periode)
       VALUES ($1, $2, $3, $4)`,
            ['hippocampe.actions_totales', parseInt((total.rows[0] as any).c), 'count', 'heure']
        );

        // Utilisateurs actifs dans la dernière heure
        const usersActifs = await query(
            `SELECT COUNT(DISTINCT user_id) as c FROM neocortex.historique_actions
       WHERE created_at > NOW() - interval '1 hour' AND user_id IS NOT NULL`
        );

        await query(
            `INSERT INTO neocortex.metriques (nom, valeur, unite, periode)
       VALUES ($1, $2, $3, $4)`,
            ['hippocampe.utilisateurs_actifs', parseInt((usersActifs.rows[0] as any).c), 'count', 'heure']
        );
    } catch (error) {
        console.error('[Hippocampe] Erreur calcul métriques:', error);
    }
}

/**
 * Purge l'historique plus ancien que le nombre de jours spécifié.
 */
export async function purgerHistorique(retentionJours = 365): Promise<number> {
    const result = await query(
        `DELETE FROM neocortex.historique_actions
     WHERE created_at < NOW() - ($1 || ' days')::interval`,
        [retentionJours]
    );

    return result.rowCount || 0;
}

/**
 * Statistiques hippocampe pour le monitoring.
 */
export async function statsHippocampe(): Promise<{
    totalActions: number;
    derniere24h: number;
    parCategorie: Record<string, number>;
    topActions: Array<{ action: string; count: number }>;
    topUtilisateurs: Array<{ userId: string; email: string; count: number }>;
}> {
    const [total, derniere24h, parCategorie, topActions, topUsers] = await Promise.all([
        query('SELECT COUNT(*) as c FROM neocortex.historique_actions'),
        query(`SELECT COUNT(*) as c FROM neocortex.historique_actions
           WHERE created_at > NOW() - interval '24 hours'`),
        query(`SELECT categorie, COUNT(*) as c FROM neocortex.historique_actions
           WHERE created_at > NOW() - interval '24 hours'
           GROUP BY categorie`),
        query(`SELECT action, COUNT(*) as c FROM neocortex.historique_actions
           WHERE created_at > NOW() - interval '24 hours'
           GROUP BY action ORDER BY c DESC LIMIT 10`),
        query(`SELECT user_id, user_email, COUNT(*) as c FROM neocortex.historique_actions
           WHERE created_at > NOW() - interval '24 hours' AND user_id IS NOT NULL
           GROUP BY user_id, user_email ORDER BY c DESC LIMIT 10`),
    ]);

    const categorieMap: Record<string, number> = {};
    (parCategorie.rows as any[]).forEach((r) => { categorieMap[r.categorie] = parseInt(r.c); });

    return {
        totalActions: parseInt((total.rows[0] as any).c),
        derniere24h: parseInt((derniere24h.rows[0] as any).c),
        parCategorie: categorieMap,
        topActions: (topActions.rows as any[]).map((r) => ({ action: r.action, count: parseInt(r.c) })),
        topUtilisateurs: (topUsers.rows as any[]).map((r) => ({
            userId: r.user_id,
            email: r.user_email || 'unknown',
            count: parseInt(r.c),
        })),
    };
}
