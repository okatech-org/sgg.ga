/**
 * SGG Digital — Types Matrice de Reporting PAG 2026
 * Schéma de données pour le suivi-évaluation GAR
 */

// =============================================================================
// ENUMS & TYPES DE BASE
// =============================================================================

export type StatutValidation =
  | 'brouillon'
  | 'soumis'
  | 'valide_sgg'
  | 'valide_sgpr'
  | 'rejete';

export type StatutProgramme =
  | 'en_cours'
  | 'en_preparation'
  | 'retard'
  | 'termine'
  | 'bloque';

export type BlocReporting =
  | 'cadrage'        // Colonnes 1-6
  | 'gouvernance'    // Colonnes 7-9
  | 'operationnel'   // Colonnes 10-12
  | 'financier'      // Colonnes 13-16
  | 'juridique'      // Colonne 17
  | 'performance';   // Colonnes 18-21

export type PermissionReporting = 'R' | 'W' | 'V' | 'none';

// =============================================================================
// PILIERS PRÉSIDENTIELS (8 piliers)
// =============================================================================

export interface PilierPresidentiel {
  id: number;
  code: string;
  nom: string;
  couleur: string;
  icone: string;
}

// =============================================================================
// BLOC 1 — CADRAGE STRATÉGIQUE (Colonnes 1-6)
// =============================================================================

export interface ProgrammePAG {
  id: string;
  pilierId: number;
  /** Col 1 — Priorité Présidentielle (via pilierId) */
  /** Col 2 — Mesure Présidentielle */
  mesurePresidentielle: string;
  /** Col 3 — Programme / Axe */
  codeProgramme: string;
  libelleProgramme: string;
  /** Col 4 — Objectif Stratégique */
  objectifStrategique: string;
  /** Col 5 — Résultats Attendus */
  resultatsAttendus: string;
  /** Col 6 — Actions / Projets / Réformes */
  actionsProjets: string;
}

// =============================================================================
// BLOC 2 — GOUVERNANCE & COORDINATION (Colonnes 7-9)
// =============================================================================

export interface GouvernanceProgramme {
  programmeId: string;
  /** Col 7 — Pilote Programme (Ministère chef de file) */
  ministerePiloteId: string;
  ministerePiloteNom: string;
  /** Col 8 — Ministères Co-responsables */
  ministeresCoResponsables: string[];
  /** Col 9 — PTF / Partenaires */
  partenairesPTF: string[];
}

// =============================================================================
// BLOC 3-6 — RAPPORT MENSUEL (Colonnes 10-21 + workflow)
// =============================================================================

export interface RapportMensuel {
  id: string;
  programmeId: string;
  ministereId: string;
  periodeMois: number;   // 1-12
  periodeAnnee: number;
  soumisParId: string | null;
  soumisParNom: string | null;

  /** Col 10 — Date Début */
  dateDebut: string | null;
  /** Col 11 — Date Fin */
  dateFin: string | null;
  /** Col 12 — Activités Réalisées (Période) */
  activitesRealisees: string;

  /** Col 13 — Budget (Md FCFA) */
  budgetMdFcfa: number;
  /** Col 14 — Engagé (Md FCFA) */
  engageMdFcfa: number;
  /** Col 15 — Décaissé (Md FCFA) */
  decaisseMdFcfa: number;
  /** Col 16 — % Exécution Financière (calculé: décaissé/budget×100) */
  pctExecutionFinanciere: number;

  /** Col 17 — Encadrement Législatif / Réglementaire */
  encadrementJuridique: string;

  /** Col 18 — Indicateurs de Performance (KPI) */
  indicateursKpi: string;
  /** Col 19 — % Avancement Physique */
  pctAvancementPhysique: number;
  /** Col 20 — Statut */
  statutProgramme: StatutProgramme;
  /** Col 21 — Observations / Contraintes */
  observationsContraintes: string;

  // Workflow de validation
  statutValidation: StatutValidation;
  valideSGGParId: string | null;
  valideSGGParNom: string | null;
  dateValidationSGG: string | null;
  valideSGPRParId: string | null;
  valideSGPRParNom: string | null;
  dateValidationSGPR: string | null;
  commentaireValidation: string | null;
  motifRejet: string | null;

  // Metadata
  creeLe: string;
  modifieLe: string;
}

// =============================================================================
// AUDIT TRAIL
// =============================================================================

export interface HistoriqueModification {
  id: string;
  rapportId: string;
  champModifie: string;
  ancienneValeur: string;
  nouvelleValeur: string;
  modifieParId: string;
  modifieParNom: string;
  modifieLe: string;
}

// =============================================================================
// NOTIFICATIONS
// =============================================================================

export type NotificationType =
  | 'ouverture_periode'
  | 'rappel_mi_periode'
  | 'deadline_approche'
  | 'deadline_depassee'
  | 'rapport_soumis'
  | 'rapport_valide_sgg'
  | 'rapport_valide_sgpr'
  | 'rapport_rejete'
  | 'anomalie_detectee'
  | 'gel_credits';

export interface NotificationReporting {
  id: string;
  type: NotificationType;
  titre: string;
  message: string;
  destinataireId: string;
  destinataireNom: string;
  lue: boolean;
  dateCreation: string;
  lienAction?: string;
  rapportId?: string;
  programmeId?: string;
  ministereId?: string;
}

// =============================================================================
// SUIVI REMPLISSAGE
// =============================================================================

export interface MinistereInfo {
  id: string;
  nom: string;
  sigle: string;
}

export interface SuiviMinistere {
  ministereId: string;
  ministereNom: string;
  ministereSigle: string;
  mois: number;
  annee: number;
  statut: 'valide' | 'soumis' | 'brouillon' | 'non_saisi' | 'non_applicable';
  dateRemplissage: string | null;
  joursRetard: number;
  tauxCompletude: number;
}

// =============================================================================
// VUE AGRÉGÉE — Ligne complète matrice 21 colonnes
// =============================================================================

export interface MatriceReportingRow {
  programme: ProgrammePAG;
  pilier: PilierPresidentiel;
  gouvernance: GouvernanceProgramme;
  rapport: RapportMensuel | null;
}

// =============================================================================
// FILTRES
// =============================================================================

export interface ReportingFilters {
  pilierId?: number | null;
  statutProgramme?: StatutProgramme | null;
  statutValidation?: StatutValidation | null;
  ministereId?: string | null;
  recherche?: string;
  tauxExecutionMin?: number;
  tauxExecutionMax?: number;
  mois: number;
  annee: number;
}

// =============================================================================
// STATISTIQUES DASHBOARD
// =============================================================================

export interface ReportingStats {
  totalProgrammes: number;
  totalBudget: number;
  totalEngage: number;
  totalDecaisse: number;
  moyenneExecutionFinanciere: number;
  moyenneAvancementPhysique: number;
  rapportsParStatut: Record<StatutValidation, number>;
  programmesParStatut: Record<StatutProgramme, number>;
  tauxRemplissageGlobal: number;
  ministeresEnRetard: number;
  rapportsValidésCeMois: number;
}

// =============================================================================
// LABELS & COULEURS
// =============================================================================

export const STATUT_PROGRAMME_LABELS: Record<StatutProgramme, string> = {
  en_cours: 'En cours',
  en_preparation: 'En préparation',
  retard: 'En retard',
  termine: 'Terminé',
  bloque: 'Bloqué',
};

export const STATUT_VALIDATION_LABELS: Record<StatutValidation, string> = {
  brouillon: 'Brouillon',
  soumis: 'Soumis',
  valide_sgg: 'Validé SGG',
  valide_sgpr: 'Validé SGPR',
  rejete: 'Rejeté',
};

export const STATUT_PROGRAMME_COLORS: Record<StatutProgramme, string> = {
  en_cours: 'bg-status-info/10 text-status-info border-status-info/20',
  en_preparation: 'bg-muted text-muted-foreground border-muted',
  retard: 'bg-status-danger/10 text-status-danger border-status-danger/20',
  termine: 'bg-status-success/10 text-status-success border-status-success/20',
  bloque: 'bg-gray-900/10 text-gray-900 border-gray-900/20 dark:bg-gray-100/10 dark:text-gray-100 dark:border-gray-100/20',
};

export const STATUT_VALIDATION_COLORS: Record<StatutValidation, string> = {
  brouillon: 'bg-muted text-muted-foreground border-muted',
  soumis: 'bg-status-info/10 text-status-info border-status-info/20',
  valide_sgg: 'bg-status-warning/10 text-status-warning border-status-warning/20',
  valide_sgpr: 'bg-status-success/10 text-status-success border-status-success/20',
  rejete: 'bg-status-danger/10 text-status-danger border-status-danger/20',
};

export const BLOC_LABELS: Record<BlocReporting, string> = {
  cadrage: 'Cadrage Stratégique',
  gouvernance: 'Gouvernance',
  operationnel: 'Suivi Opérationnel',
  financier: 'Suivi Financier',
  juridique: 'Cadre Juridique',
  performance: 'Performance & Évaluation',
};

export const BLOC_COLORS: Record<BlocReporting, string> = {
  cadrage: 'bg-blue-50/50 dark:bg-blue-950/20',
  gouvernance: 'bg-green-50/50 dark:bg-green-950/20',
  operationnel: 'bg-amber-50/50 dark:bg-amber-950/20',
  financier: 'bg-purple-50/50 dark:bg-purple-950/20',
  juridique: 'bg-red-50/50 dark:bg-red-950/20',
  performance: 'bg-indigo-50/50 dark:bg-indigo-950/20',
};
