/**
 * NEOCORTEX — 🎯 Cortex Préfrontal
 * Décisions complexes, scoring pondéré, et gestion de workflows.
 * Le centre de décision du système nerveux.
 */

import { query } from '../config/database.js';
import {
    ScorePondere,
    DecisionResult,
    calculerScorePondere,
    SIGNAL_TYPES,
} from './types.js';
import { emettreSignalMetier } from './limbique.js';
import { loguerAction } from './hippocampe.js';
import { lirePoidsAdaptatifs, ajusterPoids, lireConfigOuDefaut } from './plasticite.js';

// ============================================================================
// SCORING PONDÉRÉ
// ============================================================================

/**
 * Évalue une décision multi-critères avec scoring pondéré.
 * Utilise les poids adaptatifs de la plasticité si disponibles.
 *
 * @returns DecisionResult avec score, décision, et détails
 */
export async function evaluerDecision(
    signalType: string,
    criteres: ScorePondere[],
    options: {
        seuilAutoApprove?: number;
        seuilAutoReject?: number;
        entiteType?: string;
        entiteId?: string;
        userId?: string;
    } = {}
): Promise<DecisionResult> {
    // Lire les seuils depuis la config dynamique
    const seuilApprove = options.seuilAutoApprove ??
        await lireConfigOuDefaut<number>('prefrontal.score_seuil_auto_approve', 0.85);
    const seuilReject = options.seuilAutoReject ?? 0.3;

    // Enrichir les poids avec la plasticité (si des poids adaptatifs existent)
    const poidsAdaptatifs = await lirePoidsAdaptatifs(signalType);
    const poidsMap = new Map(poidsAdaptatifs.map(p => [p.regle, p.poids]));

    const criteresEnrichis = criteres.map(c => ({
        ...c,
        poids: poidsMap.has(c.label || '') ? poidsMap.get(c.label || '')! * c.poids : c.poids,
    }));

    const score = calculerScorePondere(criteresEnrichis);

    let decision: 'approve' | 'reject' | 'review';
    if (score >= seuilApprove) {
        decision = 'approve';
    } else if (score <= seuilReject) {
        decision = 'reject';
    } else {
        decision = 'review';
    }

    // Loguer la décision dans l'hippocampe
    await loguerAction({
        action: 'DECISION_EVALUEE',
        categorie: 'SYSTEME',
        entiteType: options.entiteType || 'decision',
        entiteId: options.entiteId,
        userId: options.userId,
        details: {
            signalType,
            score,
            decision,
            criteres: criteresEnrichis,
            seuils: { auto_approve: seuilApprove, auto_reject: seuilReject },
        },
    });

    return {
        score,
        decision,
        details: criteresEnrichis,
        seuils: { auto_approve: seuilApprove, auto_reject: seuilReject },
    };
}

// ============================================================================
// MACHINE À ÉTATS (WORKFLOWS)
// ============================================================================

/** Définition des transitions d'état valides par module */
const TRANSITIONS: Record<string, Record<string, string[]>> = {
    nomination: {
        brouillon: ['soumis_sg'],
        soumis_sg: ['consolide_sg', 'rejete_sg'],
        consolide_sg: ['soumis_sgg'],
        soumis_sgg: ['en_instruction', 'rejete_sgg'],
        en_instruction: ['valide_sgg', 'rejete_sgg', 'retourne'],
        valide_sgg: ['soumis_conseil', 'en_attente_signature'],
        soumis_conseil: ['approuve_conseil', 'rejete_conseil'],
        approuve_conseil: ['en_attente_signature'],
        en_attente_signature: ['signe', 'rejete'],
        signe: ['publie'],
        retourne: ['soumis_sg'],
    },
    texte_legislatif: {
        brouillon: ['depose'],
        depose: ['en_commission'],
        en_commission: ['adopte_commission', 'amende', 'rejete_commission'],
        amende: ['en_commission'],
        adopte_commission: ['seance_pleniere'],
        seance_pleniere: ['adopte', 'rejete'],
        adopte: ['promulgue'],
        promulgue: ['publie_jo'],
    },
    ptm_initiative: {
        brouillon: ['soumis_sg'],
        soumis_sg: ['consolide_sg', 'rejete_sg'],
        consolide_sg: ['soumis_sgg'],
        soumis_sgg: ['valide_sgg', 'rejete_sgg'],
        valide_sgg: ['inscrit_ptg'],
        rejete_sgg: ['brouillon'],
        rejete_sg: ['brouillon'],
    },
    rapport_gar: {
        brouillon: ['soumis'],
        soumis: ['valide', 'rejete'],
        rejete: ['brouillon'],
    },
};

/**
 * Valider si une transition d'état est autorisée.
 */
export function validerTransition(
    module: string,
    statutActuel: string,
    nouveauStatut: string
): { autorise: boolean; transitionsValides: string[] } {
    const transitions = TRANSITIONS[module];
    if (!transitions) {
        return { autorise: false, transitionsValides: [] };
    }

    const transitionsValides = transitions[statutActuel] || [];
    return {
        autorise: transitionsValides.includes(nouveauStatut),
        transitionsValides,
    };
}

/**
 * Exécuter une transition de workflow avec validation et logging.
 */
export async function executerTransition(
    module: string,
    entiteId: string,
    statutActuel: string,
    nouveauStatut: string,
    user: { userId: string; email: string; role: string },
    commentaire?: string
): Promise<{
    succes: boolean;
    message: string;
    decision?: DecisionResult;
}> {
    // Valider la transition
    const { autorise, transitionsValides } = validerTransition(module, statutActuel, nouveauStatut);

    if (!autorise) {
        // Loguer la tentative refusée
        await loguerAction({
            action: 'TRANSITION_REFUSEE',
            categorie: 'SECURITE',
            entiteType: module,
            entiteId,
            userId: user.userId,
            userEmail: user.email,
            userRole: user.role,
            details: {
                statutActuel,
                nouveauStatut,
                transitionsValides,
                commentaire,
            },
        });

        return {
            succes: false,
            message: `Transition de "${statutActuel}" vers "${nouveauStatut}" non autorisée. Transitions valides: ${transitionsValides.join(', ')}`,
        };
    }

    // Émettre le signal de transition
    const signalType = `${module.toUpperCase()}_TRANSITION` as any;
    await emettreSignalMetier(
        signalType in SIGNAL_TYPES ? signalType : SIGNAL_TYPES.WORKFLOW_APPROUVE,
        module,
        entiteId,
        {
            statutAvant: statutActuel,
            statutApres: nouveauStatut,
            commentaire,
            user: { id: user.userId, email: user.email, role: user.role },
        }
    );

    // Loguer dans l'hippocampe
    await loguerAction({
        action: 'TRANSITION_EXECUTEE',
        categorie: 'METIER',
        entiteType: module,
        entiteId,
        userId: user.userId,
        userEmail: user.email,
        userRole: user.role,
        details: {
            avant: { statut: statutActuel },
            apres: { statut: nouveauStatut },
            commentaire,
        },
    });

    return {
        succes: true,
        message: `Transition réussie: ${statutActuel} → ${nouveauStatut}`,
    };
}

/**
 * Évaluer si un dossier peut être auto-approuvé (scoring pondéré).
 */
export async function evaluerAutoApprobation(
    module: string,
    entiteId: string,
    criteres: {
        completude: number;     // % de champs remplis (0-1)
        delai: number;          // Respect du délai (0-1)
        historique: number;     // Taux de succès passé de l'auteur (0-1)
        conformite: number;     // Conformité réglementaire (0-1)
        urgence?: number;       // Niveau d'urgence (0-1, optionnel)
    },
    userId?: string
): Promise<DecisionResult> {
    const scores: ScorePondere[] = [
        { valeur: criteres.completude, poids: 3, label: 'completude' },
        { valeur: criteres.delai, poids: 2, label: 'respect_delai' },
        { valeur: criteres.historique, poids: 2, label: 'historique_auteur' },
        { valeur: criteres.conformite, poids: 4, label: 'conformite_reglementaire' },
    ];

    if (criteres.urgence !== undefined) {
        scores.push({ valeur: criteres.urgence, poids: 1, label: 'urgence' });
    }

    return evaluerDecision(
        `${module.toUpperCase()}_EVALUATION`,
        scores,
        { entiteType: module, entiteId, userId }
    );
}
