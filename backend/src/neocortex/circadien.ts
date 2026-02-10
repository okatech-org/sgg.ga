/**
 * NEOCORTEX — ⏰ Horloge Circadienne (Crons)
 * Tâches planifiées qui maintiennent le système en bonne santé.
 * Utilise setInterval natif Node.js (pas de dépendance externe).
 */

import { routerSignauxEnAttente, nettoyerSignaux, statsLimbique } from './limbique.js';
import { calculerMetriques, purgerHistorique, statsHippocampe } from './hippocampe.js';
import { purgerNotifications } from './auditif.js';
import { traiterTachesEnAttente, purgerTaches, statsMoteur } from './moteur.js';
import { lireConfigOuDefaut } from './plasticite.js';
import { query } from '../config/database.js';

const intervals: NodeJS.Timeout[] = [];

// ============================================================================
// TÂCHES PLANIFIÉES
// ============================================================================

/**
 * Routage des signaux en attente — toutes les 10 secondes.
 */
async function cronRoutagSignaux(): Promise<void> {
    try {
        const batchSize = await lireConfigOuDefaut<number>('signal.batch_size', 100);
        const processed = await routerSignauxEnAttente(batchSize);
        if (processed > 0) {
            console.log(`[Circadien] Routé ${processed} signaux`);
        }
    } catch (error) {
        console.error('[Circadien] Erreur routage signaux:', error);
    }
}

/**
 * Traitement des tâches async — toutes les 30 secondes.
 */
async function cronTachesAsync(): Promise<void> {
    try {
        const maxConcurrent = await lireConfigOuDefaut<number>('moteur.max_concurrent_tasks', 10);
        const result = await traiterTachesEnAttente(maxConcurrent);
        if (result.traitees > 0) {
            console.log(`[Circadien] Tâches: ${result.reussies} OK, ${result.echouees} KO / ${result.traitees}`);
        }
    } catch (error) {
        console.error('[Circadien] Erreur tâches async:', error);
    }
}

/**
 * Calcul des métriques hippocampe — toutes les heures.
 */
async function cronMetriques(): Promise<void> {
    try {
        await calculerMetriques();
        console.log('[Circadien] Métriques calculées');
    } catch (error) {
        console.error('[Circadien] Erreur calcul métriques:', error);
    }
}

/**
 * Health check du système — toutes les 5 minutes.
 */
async function cronHealthCheck(): Promise<void> {
    try {
        const [limbique, hippocampe, moteur] = await Promise.all([
            statsLimbique(),
            statsHippocampe(),
            statsMoteur(),
        ]);

        // Insérer les métriques de santé
        await query(
            `INSERT INTO neocortex.metriques (nom, valeur, unite, periode, dimensions)
       VALUES
         ('systeme.signaux_non_traites', $1, 'count', 'minute', '{}'),
         ('systeme.actions_24h', $2, 'count', 'minute', '{}'),
         ('systeme.taches_en_attente', $3, 'count', 'minute', '{}')`,
            [limbique.nonTraites, hippocampe.derniere24h, moteur.enAttente]
        );

        // Alerte si trop de signaux en attente
        if (limbique.nonTraites > 500) {
            console.warn(`[Circadien] ⚠️ ${limbique.nonTraites} signaux non traités!`);
        }
    } catch (error) {
        console.error('[Circadien] Erreur health check:', error);
    }
}

/**
 * Nettoyage quotidien — une fois par jour (à 3h du matin).
 */
async function cronNettoyageQuotidien(): Promise<void> {
    try {
        const retentionSignaux = await lireConfigOuDefaut<number>('signal.ttl_default_seconds', 86400) / 86400;
        const retentionHistorique = await lireConfigOuDefaut<number>('historique.retention_jours', 365);

        const [signaux, notifs, taches] = await Promise.all([
            nettoyerSignaux(Math.max(retentionSignaux, 7)),
            purgerNotifications(90),
            purgerTaches(30),
        ]);

        console.log(`[Circadien] Nettoyage: ${signaux} signaux, ${notifs} notifs, ${taches} tâches purgées`);

        // Purge historique mensuelle (plus rare)
        const now = new Date();
        if (now.getDate() === 1) {
            const purged = await purgerHistorique(retentionHistorique);
            console.log(`[Circadien] Purge historique mensuelle: ${purged} entrées`);
        }
    } catch (error) {
        console.error('[Circadien] Erreur nettoyage:', error);
    }
}

// ============================================================================
// START / STOP
// ============================================================================

/**
 * Démarrer l'horloge circadienne.
 * Appelé au démarrage du serveur.
 */
export function demarrerHorlogeCircadienne(): void {
    console.log('[Circadien] 🕐 Horloge circadienne démarrée');

    // Routage signaux — toutes les 10 secondes
    intervals.push(setInterval(cronRoutagSignaux, 10_000));

    // Tâches async — toutes les 30 secondes
    intervals.push(setInterval(cronTachesAsync, 30_000));

    // Métriques — toutes les heures
    intervals.push(setInterval(cronMetriques, 3_600_000));

    // Health check — toutes les 5 minutes
    intervals.push(setInterval(cronHealthCheck, 300_000));

    // Nettoyage quotidien — toutes les 24h
    intervals.push(setInterval(cronNettoyageQuotidien, 86_400_000));

    // Exécution initiale (après 5 secondes pour laisser le serveur démarrer)
    setTimeout(() => {
        cronRoutagSignaux();
        cronHealthCheck();
    }, 5000);
}

/**
 * Arrêter l'horloge circadienne (graceful shutdown).
 */
export function arreterHorlogeCircadienne(): void {
    console.log('[Circadien] 🕐 Arrêt de l\'horloge circadienne');
    for (const interval of intervals) {
        clearInterval(interval);
    }
    intervals.length = 0;
}
