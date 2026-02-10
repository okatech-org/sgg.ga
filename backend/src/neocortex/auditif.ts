/**
 * NEOCORTEX — 👂 Cortex Auditif
 * Notifications multi-canal (in-app, email, SMS).
 * Réagit aux signaux pour créer des notifications ciblées.
 */

import { query } from '../config/database.js';
import { Notification } from './types.js';

// ============================================================================
// CRÉATION DE NOTIFICATIONS
// ============================================================================

/**
 * Créer une notification pour un utilisateur.
 */
export async function creerNotification(notif: Notification): Promise<string> {
    try {
        const result = await query<{ id: string }>(
            `INSERT INTO neocortex.notifications
        (user_id, type, canal, titre, message, lien,
         entite_type, entite_id, signal_id, expire_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id`,
            [
                notif.userId,
                notif.type,
                notif.canal,
                notif.titre,
                notif.message,
                notif.lien || null,
                notif.entiteType || null,
                notif.entiteId || null,
                notif.signalId || null,
                notif.expireAt || null,
            ]
        );

        // Pour les canaux email/sms, déclencher l'envoi via le cortex moteur
        // (sera implémenté via taches_async)

        return result.rows[0].id;
    } catch (error) {
        console.error('[Auditif] Erreur création notification:', error);
        return '';
    }
}

/**
 * Créer des notifications pour plusieurs utilisateurs.
 */
export async function notifierGroupe(
    userIds: string[],
    type: Notification['type'],
    titre: string,
    message: string,
    options: {
        canal?: Notification['canal'];
        lien?: string;
        entiteType?: string;
        entiteId?: string;
        signalId?: string;
    } = {}
): Promise<number> {
    let count = 0;
    for (const userId of userIds) {
        const id = await creerNotification({
            userId,
            type,
            canal: options.canal || 'in_app',
            titre,
            message,
            lien: options.lien,
            entiteType: options.entiteType,
            entiteId: options.entiteId,
            signalId: options.signalId,
        });
        if (id) count++;
    }
    return count;
}

/**
 * Notifier tous les utilisateurs d'un rôle donné.
 */
export async function notifierParRole(
    role: string,
    type: Notification['type'],
    titre: string,
    message: string,
    options: {
        canal?: Notification['canal'];
        lien?: string;
        entiteType?: string;
        entiteId?: string;
    } = {}
): Promise<number> {
    const users = await query<{ id: string }>(
        `SELECT id FROM auth.users WHERE role = $1 AND is_active = TRUE`,
        [role]
    );

    const userIds = users.rows.map((r) => r.id);
    return notifierGroupe(userIds, type, titre, message, options);
}

// ============================================================================
// GESTION DES NOTIFICATIONS
// ============================================================================

/**
 * Marquer une notification comme lue.
 */
export async function marquerLue(notifId: string, userId: string): Promise<boolean> {
    const result = await query(
        `UPDATE neocortex.notifications
     SET lu = TRUE, lu_at = NOW()
     WHERE id = $1 AND user_id = $2`,
        [notifId, userId]
    );
    return (result.rowCount || 0) > 0;
}

/**
 * Marquer toutes les notifications d'un utilisateur comme lues.
 */
export async function marquerToutesLues(userId: string): Promise<number> {
    const result = await query(
        `UPDATE neocortex.notifications
     SET lu = TRUE, lu_at = NOW()
     WHERE user_id = $1 AND lu = FALSE`,
        [userId]
    );
    return result.rowCount || 0;
}

/**
 * Lister les notifications d'un utilisateur.
 */
export async function listerNotifications(
    userId: string,
    options: {
        nonLuesSeulement?: boolean;
        type?: string;
        limit?: number;
        offset?: number;
    } = {}
): Promise<{
    notifications: Array<{
        id: string;
        type: string;
        canal: string;
        titre: string;
        message: string;
        lien: string | null;
        entiteType: string | null;
        entiteId: string | null;
        lu: boolean;
        luAt: Date | null;
        createdAt: Date;
    }>;
    totalNonLues: number;
}> {
    const conditions = ['user_id = $1', '(expire_at IS NULL OR expire_at > NOW())'];
    const params: unknown[] = [userId];
    let paramIdx = 2;

    if (options.nonLuesSeulement) {
        conditions.push('lu = FALSE');
    }
    if (options.type) {
        conditions.push(`type = $${paramIdx++}`);
        params.push(options.type);
    }

    const limit = Math.min(options.limit || 50, 200);
    const offset = options.offset || 0;

    const [notifs, countResult] = await Promise.all([
        query(
            `SELECT id, type, canal, titre, message, lien,
              entite_type, entite_id, lu, lu_at, created_at
       FROM neocortex.notifications
       WHERE ${conditions.join(' AND ')}
       ORDER BY created_at DESC
       LIMIT $${paramIdx++} OFFSET $${paramIdx++}`,
            [...params, limit, offset]
        ),
        query(
            `SELECT COUNT(*) as c FROM neocortex.notifications
       WHERE user_id = $1 AND lu = FALSE
         AND (expire_at IS NULL OR expire_at > NOW())`,
            [userId]
        ),
    ]);

    return {
        notifications: notifs.rows.map((r: any) => ({
            id: r.id,
            type: r.type,
            canal: r.canal,
            titre: r.titre,
            message: r.message,
            lien: r.lien,
            entiteType: r.entite_type,
            entiteId: r.entite_id,
            lu: r.lu,
            luAt: r.lu_at,
            createdAt: r.created_at,
        })),
        totalNonLues: parseInt((countResult.rows[0] as any).c),
    };
}

/**
 * Compter les notifications non lues.
 */
export async function compterNonLues(userId: string): Promise<number> {
    const result = await query(
        `SELECT COUNT(*) as c FROM neocortex.notifications
     WHERE user_id = $1 AND lu = FALSE
       AND (expire_at IS NULL OR expire_at > NOW())`,
        [userId]
    );
    return parseInt((result.rows[0] as any).c);
}

/**
 * Purger les notifications expirées ou anciennes.
 */
export async function purgerNotifications(retentionJours = 90): Promise<number> {
    const result = await query(
        `DELETE FROM neocortex.notifications
     WHERE (expire_at IS NOT NULL AND expire_at < NOW())
        OR (lu = TRUE AND created_at < NOW() - ($1 || ' days')::interval)`,
        [retentionJours]
    );
    return result.rowCount || 0;
}
