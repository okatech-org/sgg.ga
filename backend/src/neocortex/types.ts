/**
 * NEOCORTEX — Types, Constants & Helpers
 * Système nerveux digital — Types centralisés
 */

// ============================================================================
// SIGNAL TYPES — Tous les types de signaux du système
// ============================================================================

export const SIGNAL_TYPES = {
    // ── Métier : GAR ──
    GAR_OBJECTIF_CREE: 'GAR_OBJECTIF_CREE',
    GAR_OBJECTIF_MODIFIE: 'GAR_OBJECTIF_MODIFIE',
    GAR_OBJECTIF_SUPPRIME: 'GAR_OBJECTIF_SUPPRIME',
    GAR_RAPPORT_SOUMIS: 'GAR_RAPPORT_SOUMIS',
    GAR_RAPPORT_VALIDE: 'GAR_RAPPORT_VALIDE',
    GAR_RAPPORT_REJETE: 'GAR_RAPPORT_REJETE',

    // ── Métier : Nominations ──
    NOMINATION_CREEE: 'NOMINATION_CREEE',
    NOMINATION_MODIFIEE: 'NOMINATION_MODIFIEE',
    NOMINATION_TRANSITION: 'NOMINATION_TRANSITION',
    NOMINATION_VALIDEE: 'NOMINATION_VALIDEE',
    NOMINATION_REJETEE: 'NOMINATION_REJETEE',

    // ── Métier : Cycle Législatif ──
    TEXTE_LEGISLATIF_CREE: 'TEXTE_LEGISLATIF_CREE',
    TEXTE_LEGISLATIF_SOUMIS: 'TEXTE_LEGISLATIF_SOUMIS',
    TEXTE_LEGISLATIF_MODIFIE: 'TEXTE_LEGISLATIF_MODIFIE',
    TEXTE_LEGISLATIF_PUBLIE: 'TEXTE_LEGISLATIF_PUBLIE',

    // ── Métier : e-GOP ──
    EGOP_CI_PLANIFIE: 'EGOP_CI_PLANIFIE',
    EGOP_CI_MODIFIE: 'EGOP_CI_MODIFIE',
    EGOP_RIM_CREE: 'EGOP_RIM_CREE',
    EGOP_COURRIER_RECU: 'EGOP_COURRIER_RECU',
    EGOP_COURRIER_TRAITE: 'EGOP_COURRIER_TRAITE',

    // ── Métier : Journal Officiel ──
    JO_PUBLICATION: 'JO_PUBLICATION',
    JO_TEXTE_AJOUTE: 'JO_TEXTE_AJOUTE',

    // ── Métier : PTM/PTG ──
    PTM_INITIATIVE_CREEE: 'PTM_INITIATIVE_CREEE',
    PTM_INITIATIVE_SOUMISE: 'PTM_INITIATIVE_SOUMISE',
    PTM_INITIATIVE_VALIDEE: 'PTM_INITIATIVE_VALIDEE',
    PTM_INITIATIVE_REJETEE: 'PTM_INITIATIVE_REJETEE',
    PTM_INITIATIVE_INSCRITE_PTG: 'PTM_INITIATIVE_INSCRITE_PTG',

    // ── Métier : Institutions ──
    INSTITUTION_CREEE: 'INSTITUTION_CREEE',
    INSTITUTION_MODIFIEE: 'INSTITUTION_MODIFIEE',

    // ── Utilisateur ──
    UTILISATEUR_CONNECTE: 'UTILISATEUR_CONNECTE',
    UTILISATEUR_DECONNECTE: 'UTILISATEUR_DECONNECTE',
    UTILISATEUR_CREE: 'UTILISATEUR_CREE',
    UTILISATEUR_MODIFIE: 'UTILISATEUR_MODIFIE',
    UTILISATEUR_ROLE_CHANGE: 'UTILISATEUR_ROLE_CHANGE',
    UTILISATEUR_2FA_ACTIVE: 'UTILISATEUR_2FA_ACTIVE',

    // ── Workflow ──
    WORKFLOW_DEMARRE: 'WORKFLOW_DEMARRE',
    WORKFLOW_APPROUVE: 'WORKFLOW_APPROUVE',
    WORKFLOW_REJETE: 'WORKFLOW_REJETE',
    WORKFLOW_ESCALADE: 'WORKFLOW_ESCALADE',
    WORKFLOW_TERMINE: 'WORKFLOW_TERMINE',

    // ── Système ──
    ALERTE_SYSTEME: 'ALERTE_SYSTEME',
    CONFIG_MODIFIEE: 'CONFIG_MODIFIEE',
    POIDS_AJUSTE: 'POIDS_AJUSTE',
    CACHE_INVALIDE: 'CACHE_INVALIDE',
    TACHE_TERMINEE: 'TACHE_TERMINEE',
    TACHE_ECHOUEE: 'TACHE_ECHOUEE',

    // ── Sécurité ──
    SECURITE_CONNEXION_ECHOUEE: 'SECURITE_CONNEXION_ECHOUEE',
    SECURITE_TOKEN_REVOQUE: 'SECURITE_TOKEN_REVOQUE',
    SECURITE_ACCES_REFUSE: 'SECURITE_ACCES_REFUSE',
    SECURITE_BRUTE_FORCE: 'SECURITE_BRUTE_FORCE',
} as const;

export type SignalType = typeof SIGNAL_TYPES[keyof typeof SIGNAL_TYPES];

// ============================================================================
// CORTEX — Modules du système nerveux
// ============================================================================

export const CORTEX = {
    LIMBIQUE: 'LIMBIQUE',           // Bus de signaux
    HIPPOCAMPE: 'HIPPOCAMPE',       // Mémoire / audit trail
    PREFRONTAL: 'PREFRONTAL',       // Décisions / workflows
    PLASTICITE: 'PLASTICITE',       // Config dynamique
    SENSORIEL: 'SENSORIEL',         // Entrées externes
    VISUEL: 'VISUEL',               // Fichiers / médias
    AUDITIF: 'AUDITIF',             // Notifications
    MOTEUR: 'MOTEUR',               // Actions externes
    MONITORING: 'MONITORING',       // Santé système
    CIRCADIEN: 'CIRCADIEN',         // Tâches planifiées
} as const;

export type CortexModule = typeof CORTEX[keyof typeof CORTEX];

// ============================================================================
// CATEGORIES D'ACTION — Pour l'hippocampe
// ============================================================================

export const CATEGORIES_ACTION = {
    METIER: 'METIER',
    SYSTEME: 'SYSTEME',
    UTILISATEUR: 'UTILISATEUR',
    SECURITE: 'SECURITE',
} as const;

export type CategorieAction = typeof CATEGORIES_ACTION[keyof typeof CATEGORIES_ACTION];

// ============================================================================
// PRIORITÉS
// ============================================================================

export const PRIORITES = {
    LOW: 'LOW',
    NORMAL: 'NORMAL',
    HIGH: 'HIGH',
    CRITICAL: 'CRITICAL',
} as const;

export type Priorite = typeof PRIORITES[keyof typeof PRIORITES];

// ============================================================================
// INTERFACES
// ============================================================================

export interface SignalPondere {
    type: SignalType;
    source: CortexModule | string;
    destination?: CortexModule | string;
    entiteType?: string;
    entiteId?: string;
    payload: Record<string, unknown>;
    confiance: number; // 0.0 – 1.0
    priorite: Priorite;
    correlationId: string;
    parentSignalId?: string;
    ttlSeconds?: number;
}

export interface ActionHistorique {
    action: string;
    categorie: CategorieAction;
    entiteType: string;
    entiteId?: string;
    userId?: string;
    userEmail?: string;
    userRole?: string;
    details: {
        avant?: Record<string, unknown>;
        apres?: Record<string, unknown>;
        [key: string]: unknown;
    };
    metadata?: Record<string, unknown>;
    correlationId?: string;
    durationMs?: number;
}

export interface ConfigSysteme {
    cle: string;
    valeur: unknown;
    description?: string;
    categorie?: string;
}

export interface Notification {
    userId: string;
    type: 'info' | 'alerte' | 'action' | 'systeme';
    canal: 'in_app' | 'email' | 'sms';
    titre: string;
    message: string;
    lien?: string;
    entiteType?: string;
    entiteId?: string;
    signalId?: string;
    expireAt?: Date;
}

export interface TacheAsync {
    type: string;
    payload: Record<string, unknown>;
    priorite?: number;
    maxTentatives?: number;
    signalId?: string;
    createdBy?: string;
}

export interface ScorePondere {
    valeur: number; // 0.0 – 1.0
    poids: number;  // poids relatif
    label?: string; // description du critère
}

export interface DecisionResult {
    score: number;
    decision: 'approve' | 'reject' | 'review';
    details: ScorePondere[];
    seuils: { auto_approve: number; auto_reject: number };
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Génère un correlation ID unique pour regrouper les signaux liés
 */
export function genererCorrelationId(): string {
    return crypto.randomUUID();
}

/**
 * Calcule un score pondéré à partir de plusieurs critères.
 * Chaque critère a une valeur (0-1) et un poids.
 * Le résultat est la moyenne pondérée normalisée.
 */
export function calculerScorePondere(scores: ScorePondere[]): number {
    if (scores.length === 0) return 0;

    const totalPoids = scores.reduce((sum, s) => sum + s.poids, 0);
    if (totalPoids === 0) return 0;

    const scoreTotal = scores.reduce((sum, s) => sum + s.valeur * s.poids, 0);
    return Math.round((scoreTotal / totalPoids) * 10000) / 10000; // 4 decimal places
}

/**
 * Détermine la priorité d'un signal basée sur le type
 */
export function determinerPriorite(type: SignalType): Priorite {
    if (type.startsWith('SECURITE_') || type === SIGNAL_TYPES.ALERTE_SYSTEME) {
        return PRIORITES.CRITICAL;
    }
    if (type.includes('VALIDE') || type.includes('PUBLIE') || type.includes('APPROUVE')) {
        return PRIORITES.HIGH;
    }
    if (type.includes('SOUMIS') || type.includes('TRANSITION')) {
        return PRIORITES.HIGH;
    }
    if (type.startsWith('UTILISATEUR_') || type.includes('CONFIG_')) {
        return PRIORITES.LOW;
    }
    return PRIORITES.NORMAL;
}

/**
 * Détermine la catégorie d'une action pour l'hippocampe
 */
export function determinerCategorie(type: string): CategorieAction {
    if (type.startsWith('SECURITE_')) return CATEGORIES_ACTION.SECURITE;
    if (type.startsWith('UTILISATEUR_')) return CATEGORIES_ACTION.UTILISATEUR;
    if (type.startsWith('ALERTE_') || type.startsWith('CONFIG_') ||
        type.startsWith('CACHE_') || type.startsWith('TACHE_') ||
        type.startsWith('POIDS_')) {
        return CATEGORIES_ACTION.SYSTEME;
    }
    return CATEGORIES_ACTION.METIER;
}
