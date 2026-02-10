/**
 * NEOCORTEX — Index
 * Point d'entrée unique du système nerveux digital.
 *
 * Usage:
 *   import { neocortex } from './neocortex/index.js';
 *   neocortex.start();
 *   neocortex.stop();
 */

// Core modules
export { emettreSignal, emettreSignalMetier, routerSignauxEnAttente, nettoyerSignaux, statsLimbique } from './limbique.js';
export { loguerAction, loguerActionMetier, listerHistorique, historiqueEntite, statsHippocampe } from './hippocampe.js';
export { lireConfig, lireConfigOuDefaut, ecrireConfig, lirePoidsAdaptatifs, ajusterPoids } from './plasticite.js';
export { evaluerDecision, validerTransition, executerTransition, evaluerAutoApprobation } from './prefrontal.js';
export { creerNotification, notifierGroupe, notifierParRole, listerNotifications, marquerLue, compterNonLues } from './auditif.js';
export { creerTache, enregistrerHandler, traiterTachesEnAttente, statsMoteur } from './moteur.js';
export { neocortexMiddleware } from './middleware.js';
export { demarrerHorlogeCircadienne, arreterHorlogeCircadienne } from './circadien.js';

// Types
export * from './types.js';

// Routes
export { default as neocortexRoutes } from './routes.js';

// ============================================================================
// Lifecycle
// ============================================================================

import { demarrerHorlogeCircadienne, arreterHorlogeCircadienne } from './circadien.js';

/**
 * Objet NEOCORTEX pour la gestion du cycle de vie.
 */
export const neocortex = {
    /**
     * Démarrer le système nerveux digital.
     * Appelé après la connexion à la base de données.
     */
    start(): void {
        console.log('🧠 NEOCORTEX — Système nerveux digital démarré');
        console.log('   💓 Limbique   → Bus de signaux pondérés');
        console.log('   📚 Hippocampe → Mémoire & audit trail');
        console.log('   🎯 Préfrontal → Décisions & workflows');
        console.log('   🔧 Plasticité → Config dynamique');
        console.log('   👂 Auditif    → Notifications multi-canal');
        console.log('   🏃 Moteur     → Actions async');
        console.log('   ⏰ Circadien  → Tâches planifiées');
        demarrerHorlogeCircadienne();
    },

    /**
     * Arrêter le système nerveux (graceful shutdown).
     */
    stop(): void {
        console.log('🧠 NEOCORTEX — Arrêt du système nerveux');
        arreterHorlogeCircadienne();
    },
};
