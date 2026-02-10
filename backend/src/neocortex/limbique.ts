/**
 * NEOCORTEX — 💓 Système Limbique
 * Bus central de signaux pondérés.
 * Chaque mutation émet un signal qui est routé vers les cortex appropriés.
 *
 * Signal Flow:
 *   Mutation → emettreSignal() → DB → routerSignaux() → Cortex cibles
 */

import { query } from '../config/database.js';
import { publishNotification } from '../config/redis.js';
import {
    SignalPondere,
    SignalType,
    SIGNAL_TYPES,
    CORTEX,
    PRIORITES,
    genererCorrelationId,
    determinerPriorite,
} from './types.js';

// ============================================================================
// ÉMISSION DE SIGNAUX
// ============================================================================

/**
 * Émet un signal pondéré dans le système limbique.
 * C'est le point d'entrée principal — chaque mutation doit appeler cette fonction.
 */
export async function emettreSignal(signal: SignalPondere): Promise<string> {
    try {
        const result = await query<{ id: string }>(
            `INSERT INTO neocortex.signaux
        (type, source, destination, entite_type, entite_id,
         payload, confiance, priorite, correlation_id,
         parent_signal_id, ttl_seconds, traite)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, FALSE)
       RETURNING id`,
            [
                signal.type,
                signal.source,
                signal.destination || null,
                signal.entiteType || null,
                signal.entiteId || null,
                JSON.stringify(signal.payload),
                signal.confiance,
                signal.priorite,
                signal.correlationId,
                signal.parentSignalId || null,
                signal.ttlSeconds || null,
            ]
        );

        const signalId = result.rows[0].id;

        // Publier via Redis pour le temps réel (non-bloquant)
        publishNotification('neocortex:signal', {
            id: signalId,
            type: signal.type,
            priorite: signal.priorite,
            entiteType: signal.entiteType,
            entiteId: signal.entiteId,
        }).catch(() => { /* Redis optional */ });

        // Router les signaux critiques immédiatement
        if (signal.priorite === PRIORITES.CRITICAL) {
            setImmediate(() => {
                routerSignal(signalId, signal).catch((err) => {
                    console.error('[Limbique] Routage critique échoué:', err);
                });
            });
        }

        return signalId;
    } catch (error) {
        console.error('[Limbique] Erreur émission signal:', error);
        throw error;
    }
}

/**
 * Raccourci pour émettre un signal métier avec des defaults sensibles.
 * Usage typique dans une mutation :
 *   await emettreSignalMetier('NOMINATION_CREEE', 'nomination', id, { ... });
 */
export async function emettreSignalMetier(
    type: SignalType,
    entiteType: string,
    entiteId: string,
    payload: Record<string, unknown> = {},
    options: {
        correlationId?: string;
        confiance?: number;
        parentSignalId?: string;
        destination?: string;
    } = {}
): Promise<string> {
    return emettreSignal({
        type,
        source: CORTEX.LIMBIQUE,
        destination: options.destination,
        entiteType,
        entiteId,
        payload,
        confiance: options.confiance ?? 1.0,
        priorite: determinerPriorite(type),
        correlationId: options.correlationId || genererCorrelationId(),
        parentSignalId: options.parentSignalId,
    });
}

// ============================================================================
// ROUTAGE DE SIGNAUX
// ============================================================================

/** Mapping type de signal → cortex cibles */
const ROUTING_TABLE: Record<string, string[]> = {
    // Signaux métier → Hippocampe (audit) + Auditif (notifications)
    NOMINATION_CREEE: [CORTEX.HIPPOCAMPE, CORTEX.AUDITIF, CORTEX.PREFRONTAL],
    NOMINATION_VALIDEE: [CORTEX.HIPPOCAMPE, CORTEX.AUDITIF, CORTEX.MOTEUR],
    NOMINATION_TRANSITION: [CORTEX.HIPPOCAMPE, CORTEX.AUDITIF, CORTEX.PREFRONTAL],
    GAR_RAPPORT_SOUMIS: [CORTEX.HIPPOCAMPE, CORTEX.AUDITIF, CORTEX.PREFRONTAL],
    GAR_RAPPORT_VALIDE: [CORTEX.HIPPOCAMPE, CORTEX.AUDITIF],
    TEXTE_LEGISLATIF_SOUMIS: [CORTEX.HIPPOCAMPE, CORTEX.AUDITIF, CORTEX.PREFRONTAL],
    TEXTE_LEGISLATIF_PUBLIE: [CORTEX.HIPPOCAMPE, CORTEX.AUDITIF, CORTEX.MOTEUR],
    JO_PUBLICATION: [CORTEX.HIPPOCAMPE, CORTEX.AUDITIF, CORTEX.MOTEUR],
    PTM_INITIATIVE_SOUMISE: [CORTEX.HIPPOCAMPE, CORTEX.AUDITIF, CORTEX.PREFRONTAL],
    EGOP_CI_PLANIFIE: [CORTEX.HIPPOCAMPE, CORTEX.AUDITIF],

    // Signaux système → Monitoring
    ALERTE_SYSTEME: [CORTEX.MONITORING, CORTEX.AUDITIF],
    CONFIG_MODIFIEE: [CORTEX.PLASTICITE, CORTEX.HIPPOCAMPE],
    TACHE_ECHOUEE: [CORTEX.MONITORING, CORTEX.AUDITIF],

    // Sécurité → Monitoring + Hippocampe
    SECURITE_CONNEXION_ECHOUEE: [CORTEX.MONITORING, CORTEX.HIPPOCAMPE],
    SECURITE_BRUTE_FORCE: [CORTEX.MONITORING, CORTEX.AUDITIF, CORTEX.HIPPOCAMPE],
    SECURITE_ACCES_REFUSE: [CORTEX.HIPPOCAMPE],
};

/**
 * Route un signal vers les cortex cibles.
 * Pour les signaux sans destination explicite, utilise la table de routage.
 */
async function routerSignal(
    signalId: string,
    signal: SignalPondere
): Promise<void> {
    try {
        const destinations = signal.destination
            ? [signal.destination]
            : ROUTING_TABLE[signal.type] || [CORTEX.HIPPOCAMPE]; // Par défaut → hippocampe

        // Marquer comme traité
        await query(
            `UPDATE neocortex.signaux SET traite = TRUE WHERE id = $1`,
            [signalId]
        );

        // Publier vers chaque cortex cible via Redis
        for (const dest of destinations) {
            await publishNotification(`neocortex:route:${dest}`, {
                signalId,
                type: signal.type,
                entiteType: signal.entiteType,
                entiteId: signal.entiteId,
                payload: signal.payload,
                priorite: signal.priorite,
                confiance: signal.confiance,
            }).catch(() => { /* Redis optional */ });
        }
    } catch (error) {
        // Log l'erreur dans le signal
        await query(
            `UPDATE neocortex.signaux SET erreur = $1 WHERE id = $2`,
            [String(error), signalId]
        ).catch(() => { });
        console.error('[Limbique] Erreur routage:', error);
    }
}

// ============================================================================
// TRAITEMENT BATCH (appelé par le cron)
// ============================================================================

/**
 * Traite les signaux non routés en batch.
 * Appelé périodiquement par l'horloge circadienne.
 */
export async function routerSignauxEnAttente(batchSize = 100): Promise<number> {
    const result = await query<{
        id: string;
        type: string;
        source: string;
        destination: string | null;
        entite_type: string | null;
        entite_id: string | null;
        payload: Record<string, unknown>;
        confiance: number;
        priorite: string;
        correlation_id: string;
        parent_signal_id: string | null;
    }>(
        `SELECT id, type, source, destination, entite_type, entite_id,
            payload, confiance, priorite, correlation_id, parent_signal_id
     FROM neocortex.signaux
     WHERE traite = FALSE
     ORDER BY
       CASE priorite
         WHEN 'CRITICAL' THEN 1
         WHEN 'HIGH' THEN 2
         WHEN 'NORMAL' THEN 3
         WHEN 'LOW' THEN 4
       END,
       created_at ASC
     LIMIT $1`,
        [batchSize]
    );

    let processed = 0;
    for (const row of result.rows) {
        await routerSignal(row.id, {
            type: row.type as SignalType,
            source: row.source,
            destination: row.destination || undefined,
            entiteType: row.entite_type || undefined,
            entiteId: row.entite_id || undefined,
            payload: row.payload,
            confiance: row.confiance,
            priorite: row.priorite as any,
            correlationId: row.correlation_id,
            parentSignalId: row.parent_signal_id || undefined,
        });
        processed++;
    }

    return processed;
}

// ============================================================================
// NETTOYAGE
// ============================================================================

/**
 * Purge les signaux traités au-delà de leur TTL ou plus vieux que retention.
 */
export async function nettoyerSignaux(retentionJours = 30): Promise<number> {
    const result = await query(
        `DELETE FROM neocortex.signaux
     WHERE traite = TRUE
       AND (
         (ttl_seconds IS NOT NULL AND created_at + (ttl_seconds * interval '1 second') < NOW())
         OR
         (created_at < NOW() - ($1 || ' days')::interval)
       )`,
        [retentionJours]
    );

    return result.rowCount || 0;
}

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Liste les signaux non traités (pour le monitoring temps réel).
 */
export async function listerSignauxNonTraites(limit = 50): Promise<{
    signaux: Array<{
        id: string;
        type: string;
        priorite: string;
        entiteType: string | null;
        confiance: number;
        createdAt: Date;
    }>;
    total: number;
}> {
    const [signaux, count] = await Promise.all([
        query(
            `SELECT id, type, priorite, entite_type, confiance, created_at
       FROM neocortex.signaux
       WHERE traite = FALSE
       ORDER BY
         CASE priorite
           WHEN 'CRITICAL' THEN 1
           WHEN 'HIGH' THEN 2
           WHEN 'NORMAL' THEN 3
           WHEN 'LOW' THEN 4
         END,
         created_at ASC
       LIMIT $1`,
            [limit]
        ),
        query('SELECT COUNT(*) as total FROM neocortex.signaux WHERE traite = FALSE'),
    ]);

    return {
        signaux: signaux.rows.map((r: any) => ({
            id: r.id,
            type: r.type,
            priorite: r.priorite,
            entiteType: r.entite_type,
            confiance: r.confiance,
            createdAt: r.created_at,
        })),
        total: parseInt(count.rows[0].total),
    };
}

/**
 * Statistiques du système limbique.
 */
export async function statsLimbique(): Promise<{
    total: number;
    nonTraites: number;
    parPriorite: Record<string, number>;
    parType: Array<{ type: string; count: number }>;
    derniere24h: number;
}> {
    const [total, nonTraites, parPriorite, parType, derniere24h] = await Promise.all([
        query('SELECT COUNT(*) as c FROM neocortex.signaux'),
        query('SELECT COUNT(*) as c FROM neocortex.signaux WHERE traite = FALSE'),
        query(`SELECT priorite, COUNT(*) as c FROM neocortex.signaux
           WHERE created_at > NOW() - interval '24 hours'
           GROUP BY priorite`),
        query(`SELECT type, COUNT(*) as c FROM neocortex.signaux
           WHERE created_at > NOW() - interval '24 hours'
           GROUP BY type ORDER BY c DESC LIMIT 10`),
        query(`SELECT COUNT(*) as c FROM neocortex.signaux
           WHERE created_at > NOW() - interval '24 hours'`),
    ]);

    const prioriteMap: Record<string, number> = {};
    parPriorite.rows.forEach((r: any) => { prioriteMap[r.priorite] = parseInt(r.c); });

    return {
        total: parseInt(total.rows[0].c),
        nonTraites: parseInt(nonTraites.rows[0].c),
        parPriorite: prioriteMap,
        parType: parType.rows.map((r: any) => ({ type: r.type, count: parseInt(r.c) })),
        derniere24h: parseInt(derniere24h.rows[0].c),
    };
}
