/**
 * NEOCORTEX — 🏃 Cortex Moteur
 * Exécution d'actions externes et gestion de tâches asynchrones.
 * File d'attente avec retry logic et backoff exponentiel.
 */

import { query } from '../config/database.js';
import { TacheAsync, SIGNAL_TYPES } from './types.js';
import { emettreSignalMetier } from './limbique.js';

// ============================================================================
// CRÉATION DE TÂCHES
// ============================================================================

/**
 * Enregistrer une tâche async dans la file d'attente.
 */
export async function creerTache(tache: TacheAsync): Promise<string> {
    const result = await query<{ id: string }>(
        `INSERT INTO neocortex.taches_async
      (type, payload, priorite, max_tentatives, signal_id, created_by)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id`,
        [
            tache.type,
            JSON.stringify(tache.payload),
            tache.priorite || 5,
            tache.maxTentatives || 3,
            tache.signalId || null,
            tache.createdBy || null,
        ]
    );

    return result.rows[0].id;
}

// ============================================================================
// TRAITEMENT DES TÂCHES
// ============================================================================

/** Handlers pour chaque type de tâche */
type TaskHandler = (payload: Record<string, unknown>) => Promise<Record<string, unknown>>;

const handlers: Map<string, TaskHandler> = new Map();

/**
 * Enregistrer un handler pour un type de tâche.
 */
export function enregistrerHandler(type: string, handler: TaskHandler): void {
    handlers.set(type, handler);
}

/**
 * Traiter les tâches en attente.
 * Appelé périodiquement par le cron ou à la demande.
 */
export async function traiterTachesEnAttente(batchSize = 10): Promise<{
    traitees: number;
    reussies: number;
    echouees: number;
}> {
    // Récupérer les tâches à traiter (SELECT FOR UPDATE pour éviter les doublons)
    const taches = await query<{
        id: string;
        type: string;
        payload: Record<string, unknown>;
        tentatives: number;
        max_tentatives: number;
    }>(
        `UPDATE neocortex.taches_async
     SET statut = 'en_cours', started_at = NOW(), tentatives = tentatives + 1
     WHERE id IN (
       SELECT id FROM neocortex.taches_async
       WHERE statut IN ('en_attente', 'echoue')
         AND tentatives < max_tentatives
         AND prochaine_exec <= NOW()
       ORDER BY priorite ASC, created_at ASC
       LIMIT $1
       FOR UPDATE SKIP LOCKED
     )
     RETURNING id, type, payload, tentatives, max_tentatives`,
        [batchSize]
    );

    let reussies = 0;
    let echouees = 0;

    for (const tache of taches.rows) {
        const handler = handlers.get(tache.type);

        if (!handler) {
            await query(
                `UPDATE neocortex.taches_async
         SET statut = 'echoue', erreur = $1, completed_at = NOW()
         WHERE id = $2`,
                [`Handler non trouvé pour le type: ${tache.type}`, tache.id]
            );
            echouees++;
            continue;
        }

        try {
            const resultat = await handler(tache.payload);

            await query(
                `UPDATE neocortex.taches_async
         SET statut = 'termine', resultat = $1, completed_at = NOW()
         WHERE id = $2`,
                [JSON.stringify(resultat), tache.id]
            );

            // Signal de succès
            await emettreSignalMetier(
                SIGNAL_TYPES.TACHE_TERMINEE,
                'tache_async',
                tache.id,
                { type: tache.type, resultat }
            );

            reussies++;
        } catch (error) {
            const erreurMsg = error instanceof Error ? error.message : String(error);
            const estDerniereTentative = tache.tentatives >= tache.max_tentatives;

            // Backoff exponentiel pour le retry
            const prochainDelai = Math.pow(2, tache.tentatives) * 60; // 2^n minutes

            await query(
                `UPDATE neocortex.taches_async
         SET statut = $1, erreur = $2,
             prochaine_exec = NOW() + ($3 || ' seconds')::interval,
             completed_at = CASE WHEN $1 = 'echoue' THEN NOW() ELSE NULL END
         WHERE id = $4`,
                [
                    estDerniereTentative ? 'echoue' : 'en_attente',
                    erreurMsg,
                    prochainDelai,
                    tache.id,
                ]
            );

            if (estDerniereTentative) {
                await emettreSignalMetier(
                    SIGNAL_TYPES.TACHE_ECHOUEE,
                    'tache_async',
                    tache.id,
                    { type: tache.type, erreur: erreurMsg, tentatives: tache.tentatives }
                );
            }

            echouees++;
        }
    }

    return {
        traitees: taches.rows.length,
        reussies,
        echouees,
    };
}

/**
 * Annuler une tâche en attente.
 */
export async function annulerTache(tacheId: string): Promise<boolean> {
    const result = await query(
        `UPDATE neocortex.taches_async
     SET statut = 'annule', completed_at = NOW()
     WHERE id = $1 AND statut IN ('en_attente', 'echoue')`,
        [tacheId]
    );
    return (result.rowCount || 0) > 0;
}

/**
 * Statistiques du cortex moteur.
 */
export async function statsMoteur(): Promise<{
    enAttente: number;
    enCours: number;
    terminees24h: number;
    echouees24h: number;
    parType: Array<{ type: string; count: number; statut: string }>;
}> {
    const [enAttente, enCours, terminees, echouees, parType] = await Promise.all([
        query(`SELECT COUNT(*) as c FROM neocortex.taches_async WHERE statut = 'en_attente'`),
        query(`SELECT COUNT(*) as c FROM neocortex.taches_async WHERE statut = 'en_cours'`),
        query(`SELECT COUNT(*) as c FROM neocortex.taches_async
           WHERE statut = 'termine' AND completed_at > NOW() - interval '24 hours'`),
        query(`SELECT COUNT(*) as c FROM neocortex.taches_async
           WHERE statut = 'echoue' AND completed_at > NOW() - interval '24 hours'`),
        query(`SELECT type, statut, COUNT(*) as c FROM neocortex.taches_async
           WHERE created_at > NOW() - interval '24 hours'
           GROUP BY type, statut ORDER BY c DESC LIMIT 20`),
    ]);

    return {
        enAttente: parseInt((enAttente.rows[0] as any).c),
        enCours: parseInt((enCours.rows[0] as any).c),
        terminees24h: parseInt((terminees.rows[0] as any).c),
        echouees24h: parseInt((echouees.rows[0] as any).c),
        parType: (parType.rows as any[]).map(r => ({
            type: r.type,
            count: parseInt(r.c),
            statut: r.statut,
        })),
    };
}

/**
 * Purger les tâches terminées/échouées anciennes.
 */
export async function purgerTaches(retentionJours = 30): Promise<number> {
    const result = await query(
        `DELETE FROM neocortex.taches_async
     WHERE statut IN ('termine', 'echoue', 'annule')
       AND completed_at < NOW() - ($1 || ' days')::interval`,
        [retentionJours]
    );
    return result.rowCount || 0;
}

// ============================================================================
// HANDLERS PRÉDÉFINIS
// ============================================================================

// Handler: Envoyer un email (connecté au service email existant)
enregistrerHandler('ENVOYER_EMAIL', async (payload) => {
    const { sendEmail } = await import('../services/email.js');
    const { to, template, variables } = payload as {
        to: { email: string; name?: string };
        template: string;
        variables: Record<string, string | number | boolean>;
    };

    const result = await sendEmail({
        to,
        template: template as any,
        variables: variables || {},
    });
    return { sent: result.success, messageId: result.messageId, dryRun: result.dryRun };
});

// Handler: Générer un export PDF (placeholder — sera connecté)
enregistrerHandler('GENERER_PDF', async (payload) => {
    // TODO: Connect to PDF generation service
    return { generated: false, message: 'PDF generation not yet connected', payload };
});
