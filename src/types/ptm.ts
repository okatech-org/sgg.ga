/**
 * SGG Digital — Types PTM/PTG (Programme de Travail du Ministère / Programme de Travail du Gouvernement)
 * Schéma de données pour la gestion des initiatives, textes législatifs et projets gouvernementaux
 */

// =============================================================================
// ENUMS & TYPES DE BASE
// =============================================================================

export type RubriquePTM = 'projet_texte_legislatif' | 'politique_generale' | 'missions_conferences';
export type StatutPTM =
  | 'brouillon'          // Direction remplit
  | 'soumis_sg'          // Poussé au SG du ministère
  | 'consolide_sg'       // SG consolide les directions
  | 'soumis_sgg'         // SG pousse au SGG
  | 'consolide_sgg'      // SGG consolide les ministères
  | 'soumis_pm'          // SGG pousse au Chef du Gouvernement
  | 'soumis_sgpr'        // PM pousse au SGPR/Président
  | 'rejete_sg'          // Rejeté par le SG
  | 'rejete_sgg'         // Rejeté par le SGG
  | 'rejete';            // Rejeté (legacy)
export type CadrageStrategique = 'sept_priorites' | 'pag' | 'pncd' | 'pap';
export type PermissionPTM = 'R' | 'W' | 'V' | 'none';

// =============================================================================
// INTERFACE PRINCIPALE — InitiativePTM (10 colonnes)
// =============================================================================

/**
 * Initiative PTM — Représente une initiative gouvernementale (loi, politique, mission)
 * Voir colonne par colonne dans les commentaires
 */
export interface InitiativePTM {
  // Identifiants
  id: string;
  ministereId: string;
  ministereNom: string;
  ministereSigle: string;

  /** Direction / Entité sous tutelle qui a créé l'initiative */
  directionId: string;
  directionNom: string;

  // ===== COLONNES PRINCIPALES (10 colonnes) =====

  /** Col 1 — Rubrique PTM */
  rubrique: RubriquePTM;

  /** Col 2 — Numéro d'ordre (par rubrique) */
  numero: number;

  /** Col 3 — Intitulé / Titre initiative */
  intitule: string;

  /** Col 4 — Cadrage Stratégique */
  cadrage: CadrageStrategique;

  /** Col 4 détail — Spécification du cadrage */
  cadrageDetail: string;

  /** Col 5 — Incidence Financière (true/false) */
  incidenceFinanciere: boolean;

  /** Col 6 — Loi de Finance (true/false) */
  loiFinance: boolean;

  /** Col 7 — Services Porteurs (IDs ministères) */
  servicesPorteurs: string[];

  /** Col 7 — Services Porteurs (Noms pour affichage) */
  servicesPorteursNoms: string[];

  /** Col 8 — Date Transmission SGG */
  dateTransmissionSGG: string | null;

  /** Col 9 — Observations/Commentaires */
  observations: string;

  /** Col 10 — Lien Programme PAG */
  programmePAGId: string | null;

  /** Col 10 — Nom Programme PAG (pour affichage) */
  programmePAGNom: string | null;

  // ===== WORKFLOW HIÉRARCHIQUE =====

  /** Statut dans la chaîne Direction → SG → SGG → PM → SGPR */
  statut: StatutPTM;

  /** Transmis par (User ID) — dernière personne ayant transmis */
  soumisParId: string | null;
  soumisParNom: string | null;
  dateSoumission: string | null;

  /** Validé SGG par (legacy, conservé pour compatibilité) */
  valideSGGParId: string | null;
  valideSGGParNom: string | null;
  dateValidationSGG: string | null;
  commentaireSGG: string | null;

  /** Inscrit PTG (legacy) */
  inscritPTGParId: string | null;
  inscritPTGParNom: string | null;
  dateInscriptionPTG: string | null;

  /** Motif de rejet */
  motifRejet: string | null;

  // ===== LIEN VERS REPORTING =====

  /** Lien facultatif vers un rapport mensuel PAG si applicable */
  rapportMensuelId: string | null;

  // ===== METADATA =====

  /** Année fiscale/calendaire */
  annee: number;

  /** Date de création */
  creeLe: string;

  /** Date de dernière modification */
  modifieLe: string;
}

// =============================================================================
// STATISTIQUES
// =============================================================================

export interface PTMStats {
  /** Nombre total d'initiatives */
  totalInitiatives: number;

  /** Distribution par rubrique */
  parRubrique: Record<RubriquePTM, number>;

  /** Distribution par statut */
  parStatut: Record<StatutPTM, number>;

  /** Taux d'inscription au PTG (inscrit_ptg / total × 100) */
  tauxInscriptionPTG: number;

  /** Nombre d'initiatives avec incidence financière */
  avecIncidenceFinanciere: number;

  /** Nombre d'initiatives inscrites à la loi de finance */
  avecLoiFinance: number;

  /** Initiatives par ministère (top 5) */
  topMinisteres: Array<{ ministereId: string; ministereNom: string; count: number }>;
}

// =============================================================================
// FILTRES
// =============================================================================

export interface PTMFilters {
  /** Filtrer par rubrique */
  rubrique: RubriquePTM | 'all';

  /** Filtrer par statut */
  statut: StatutPTM | 'all';

  /** Filtrer par cadrage stratégique */
  cadrage: CadrageStrategique | 'all';

  /** Filtrer par ministère */
  ministereId: string | 'all';

  /** Recherche libre sur intitulé/observations */
  recherche: string;

  /** Année */
  annee: number;
}

// =============================================================================
// SUIVI PAR MINISTÈRE
// =============================================================================

export interface SuiviMinisterePTM {
  /** ID du ministère */
  ministereId: string;

  /** Nom du ministère */
  ministereNom: string;

  /** Sigle du ministère */
  ministereSigle: string;

  /** Total des initiatives */
  totalInitiatives: number;

  /** Initiatives soumises au SGG */
  soumises: number;

  /** Initiatives validées par le SGG */
  validees: number;

  /** Initiatives inscrites au PTG */
  inscrites: number;

  /** Initiatives rejetées */
  rejetees: number;

  /** Initiatives en brouillon */
  brouillons: number;

  /** Taux de soumission (soumises / total × 100) */
  tauxSoumission: number;

  /** Date de la dernière soumission */
  derniereSoumission: string | null;

  /** Taux d'inscription au PTG (inscrites / total × 100) */
  tauxInscription: number;
}

// =============================================================================
// HISTORIQUE MODIFICATIONS
// =============================================================================

export interface HistoriqueModificationPTM {
  /** ID unique */
  id: string;

  /** ID de l'initiative PTM */
  initiativeId: string;

  /** Champ modifié */
  champModifie: string;

  /** Ancienne valeur */
  ancienneValeur: string;

  /** Nouvelle valeur */
  nouvelleValeur: string;

  /** Modifié par (User ID) */
  modifieParId: string;

  /** Modifié par (User Nom) */
  modifieParNom: string;

  /** Date de modification */
  modifieLe: string;
}

// =============================================================================
// NOTIFICATIONS PTM
// =============================================================================

export type NotificationTypePTM =
  | 'initiative_soumise'
  | 'initiative_validee_sgg'
  | 'initiative_inscrite_ptg'
  | 'initiative_rejetee'
  | 'demande_clarification'
  | 'deadline_approche'
  | 'deadline_depassee'
  | 'rapport_incomplet';

export interface NotificationPTM {
  /** ID unique */
  id: string;

  /** Type de notification */
  type: NotificationTypePTM;

  /** Titre */
  titre: string;

  /** Message */
  message: string;

  /** Destinataire (User ID) */
  destinataireId: string;

  /** Destinataire (User Nom) */
  destinataireNom: string;

  /** Statut lecture */
  lue: boolean;

  /** Date de création */
  dateCreation: string;

  /** Lien d'action */
  lienAction?: string;

  /** ID de l'initiative associée */
  initiativeId?: string;

  /** ID du ministère associé */
  ministereId?: string;
}

// =============================================================================
// LABELS & COULEURS
// =============================================================================

export const RUBRIQUE_LABELS: Record<RubriquePTM, string> = {
  projet_texte_legislatif: 'Projets de textes législatifs et réglementaires',
  politique_generale: 'Politique Générale',
  missions_conferences: 'Missions — Conférences — Séminaires',
};

export const RUBRIQUE_SHORT_LABELS: Record<RubriquePTM, string> = {
  projet_texte_legislatif: 'Textes Législatifs',
  politique_generale: 'Politique Générale',
  missions_conferences: 'Missions/Conférences',
};

export const RUBRIQUE_COLORS: Record<RubriquePTM, string> = {
  projet_texte_legislatif: '#3B82F6', // blue
  politique_generale: '#10B981', // green
  missions_conferences: '#F59E0B', // amber
};

export const STATUT_PTM_LABELS: Record<StatutPTM, string> = {
  brouillon: 'Brouillon',
  soumis_sg: 'Transmis au SG',
  consolide_sg: 'Consolidé SG',
  soumis_sgg: 'Transmis au SGG',
  consolide_sgg: 'Consolidé SGG',
  soumis_pm: 'Transmis au PM',
  soumis_sgpr: 'Transmis au SGPR',
  rejete_sg: 'Rejeté par SG',
  rejete_sgg: 'Rejeté par SGG',
  rejete: 'Rejeté',
};

export const STATUT_PTM_COLORS: Record<StatutPTM, string> = {
  brouillon: 'bg-muted text-muted-foreground border-muted',
  soumis_sg: 'bg-sky-100/60 text-sky-700 border-sky-200 dark:bg-sky-900/20 dark:text-sky-400 dark:border-sky-800',
  consolide_sg: 'bg-indigo-100/60 text-indigo-700 border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-400 dark:border-indigo-800',
  soumis_sgg: 'bg-status-info/10 text-status-info border-status-info/20',
  consolide_sgg: 'bg-violet-100/60 text-violet-700 border-violet-200 dark:bg-violet-900/20 dark:text-violet-400 dark:border-violet-800',
  soumis_pm: 'bg-amber-100/60 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800',
  soumis_sgpr: 'bg-status-success/10 text-status-success border-status-success/20',
  rejete_sg: 'bg-orange-100/60 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800',
  rejete_sgg: 'bg-status-danger/10 text-status-danger border-status-danger/20',
  rejete: 'bg-status-danger/10 text-status-danger border-status-danger/20',
};

export const CADRAGE_LABELS: Record<CadrageStrategique, string> = {
  sept_priorites: '7 Priorités Présidentielles',
  pag: 'Plan d\'Action Gouvernemental (PAG)',
  pncd: 'Plan National de Croissance et Développement (PNCD)',
  pap: 'Plan d\'Action Prioritaire (PAP)',
};

export const CADRAGE_SHORT_LABELS: Record<CadrageStrategique, string> = {
  sept_priorites: '7 Priorités',
  pag: 'PAG',
  pncd: 'PNCD',
  pap: 'PAP',
};

export const CADRAGE_COLORS: Record<CadrageStrategique, string> = {
  sept_priorites: 'bg-red-50/50 dark:bg-red-950/20 border-red-200 dark:border-red-800',
  pag: 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800',
  pncd: 'bg-green-50/50 dark:bg-green-950/20 border-green-200 dark:border-green-800',
  pap: 'bg-purple-50/50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800',
};
