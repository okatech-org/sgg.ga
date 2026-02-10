/**
 * SGG Digital — Données Mock PTM/PTG 2026
 * Workflow hiérarchique: Direction → SG Ministère → SGG → VPG → SGPR
 * Démo: 2 ministères (Éco Numérique + Fonction Publique) avec directions
 */

import type {
  InitiativePTM,
  PTMStats,
  SuiviMinisterePTM,
  RubriquePTM,
  StatutPTM,
  CadrageStrategique,
} from '@/types/ptm';

// =============================================================================
// MINISTÈRES & DIRECTIONS (Structure hiérarchique)
// =============================================================================

export const MINISTERES_PTM = [
  { id: 'min-numerique', nom: 'Ministère de l\'Économie Numérique', sigle: 'MNUM' },
  { id: 'min-fonction-publique', nom: 'Ministère de la Fonction Publique', sigle: 'MFP' },
];

export interface DirectionPTM {
  id: string;
  nom: string;
  sigle: string;
  ministereId: string;
}

export const DIRECTIONS_PTM: DirectionPTM[] = [
  // Éco Numérique — 2 directions
  { id: 'dir-cgi', nom: 'Centre Gabonais d\'Informatique', sigle: 'CGI', ministereId: 'min-numerique' },
  { id: 'dir-dgpn', nom: 'Direction Générale de la Programmation Numérique', sigle: 'DGPN', ministereId: 'min-numerique' },
  // Fonction Publique — 2 directions
  { id: 'dir-dgfp', nom: 'Direction Générale de la Fonction Publique', sigle: 'DGFP', ministereId: 'min-fonction-publique' },
  { id: 'dir-enap', nom: 'École Nationale d\'Administration Publique', sigle: 'ENAP', ministereId: 'min-fonction-publique' },
];

export function getDirectionsByMinistere(ministereId: string): DirectionPTM[] {
  return DIRECTIONS_PTM.filter(d => d.ministereId === ministereId);
}

// =============================================================================
// INITIATIVES PTM — Workflow hiérarchique
// =============================================================================

export const INITIATIVES_PTM: InitiativePTM[] = [
  // ========== Min. Économie Numérique — CGI (3 initiatives) ==========

  {
    id: 'ptm-001',
    ministereId: 'min-numerique',
    ministereNom: 'Ministère de l\'Économie Numérique',
    ministereSigle: 'MNUM',
    directionId: 'dir-cgi',
    directionNom: 'Centre Gabonais d\'Informatique',
    numero: 1,
    rubrique: 'projet_texte_legislatif',
    intitule: 'Décret portant création de l\'Agence Nationale de Cybersécurité',
    cadrage: 'sept_priorites',
    cadrageDetail: 'Transformation numérique — Sécurité des SI',
    incidenceFinanciere: true,
    loiFinance: false,
    servicesPorteurs: ['min-numerique'],
    servicesPorteursNoms: ['Ministère de l\'Économie Numérique'],
    dateTransmissionSGG: null,
    observations: 'Texte finalisé par le CGI. En attente de transmission au SG.',
    programmePAGId: 'prog-007',
    programmePAGNom: 'Numérique & Télécommunications',
    statut: 'brouillon',
    soumisParId: null,
    soumisParNom: null,
    dateSoumission: null,
    valideSGGParId: null,
    valideSGGParNom: null,
    dateValidationSGG: null,
    commentaireSGG: null,
    inscritPTGParId: null,
    inscritPTGParNom: null,
    dateInscriptionPTG: null,
    motifRejet: null,
    rapportMensuelId: null,
    annee: 2026,
    creeLe: '2026-01-15',
    modifieLe: '2026-02-05',
  },
  {
    id: 'ptm-002',
    ministereId: 'min-numerique',
    ministereNom: 'Ministère de l\'Économie Numérique',
    ministereSigle: 'MNUM',
    directionId: 'dir-cgi',
    directionNom: 'Centre Gabonais d\'Informatique',
    numero: 2,
    rubrique: 'projet_texte_legislatif',
    intitule: 'Arrêté fixant les standards d\'interopérabilité des SI publics',
    cadrage: 'pag',
    cadrageDetail: 'e-Gouvernement — Interopérabilité',
    incidenceFinanciere: false,
    loiFinance: false,
    servicesPorteurs: ['min-numerique'],
    servicesPorteursNoms: ['Ministère de l\'Économie Numérique'],
    dateTransmissionSGG: null,
    observations: 'Transmis au SG le 03/02. En cours de consolidation.',
    programmePAGId: 'prog-007',
    programmePAGNom: 'Numérique & Télécommunications',
    statut: 'soumis_sg',
    soumisParId: 'directeur-cgi',
    soumisParNom: 'Dir. CGI',
    dateSoumission: '2026-02-03',
    valideSGGParId: null,
    valideSGGParNom: null,
    dateValidationSGG: null,
    commentaireSGG: null,
    inscritPTGParId: null,
    inscritPTGParNom: null,
    dateInscriptionPTG: null,
    motifRejet: null,
    rapportMensuelId: null,
    annee: 2026,
    creeLe: '2026-01-20',
    modifieLe: '2026-02-03',
  },
  {
    id: 'ptm-003',
    ministereId: 'min-numerique',
    ministereNom: 'Ministère de l\'Économie Numérique',
    ministereSigle: 'MNUM',
    directionId: 'dir-cgi',
    directionNom: 'Centre Gabonais d\'Informatique',
    numero: 3,
    rubrique: 'politique_generale',
    intitule: 'Plan de formation des agents publics aux outils numériques',
    cadrage: 'sept_priorites',
    cadrageDetail: 'Capital humain numérique',
    incidenceFinanciere: true,
    loiFinance: true,
    servicesPorteurs: ['min-numerique', 'min-fonction-publique'],
    servicesPorteursNoms: ['Ministère de l\'Économie Numérique', 'Ministère de la Fonction Publique'],
    dateTransmissionSGG: '2026-01-25',
    observations: 'Consolidé par le SG et transmis au SGG.',
    programmePAGId: null,
    programmePAGNom: null,
    statut: 'soumis_sgg',
    soumisParId: 'sg-ministere',
    soumisParNom: 'SG Min. Éco Numérique',
    dateSoumission: '2026-01-25',
    valideSGGParId: null,
    valideSGGParNom: null,
    dateValidationSGG: null,
    commentaireSGG: null,
    inscritPTGParId: null,
    inscritPTGParNom: null,
    dateInscriptionPTG: null,
    motifRejet: null,
    rapportMensuelId: null,
    annee: 2026,
    creeLe: '2026-01-10',
    modifieLe: '2026-01-25',
  },

  // ========== Min. Économie Numérique — DGPN (3 initiatives) ==========

  {
    id: 'ptm-004',
    ministereId: 'min-numerique',
    ministereNom: 'Ministère de l\'Économie Numérique',
    ministereSigle: 'MNUM',
    directionId: 'dir-dgpn',
    directionNom: 'Direction Générale de la Programmation Numérique',
    numero: 1,
    rubrique: 'projet_texte_legislatif',
    intitule: 'Loi portant cadre juridique de la Signature Électronique',
    cadrage: 'pag',
    cadrageDetail: 'Dématérialisation des services publics',
    incidenceFinanciere: false,
    loiFinance: false,
    servicesPorteurs: ['min-numerique', 'min-justice'],
    servicesPorteursNoms: ['Ministère de l\'Économie Numérique', 'Ministère de la Justice'],
    dateTransmissionSGG: null,
    observations: 'En brouillon. Consultations juridiques en cours.',
    programmePAGId: 'prog-007',
    programmePAGNom: 'Numérique & Télécommunications',
    statut: 'brouillon',
    soumisParId: null,
    soumisParNom: null,
    dateSoumission: null,
    valideSGGParId: null,
    valideSGGParNom: null,
    dateValidationSGG: null,
    commentaireSGG: null,
    inscritPTGParId: null,
    inscritPTGParNom: null,
    dateInscriptionPTG: null,
    motifRejet: null,
    rapportMensuelId: null,
    annee: 2026,
    creeLe: '2026-01-18',
    modifieLe: '2026-02-01',
  },
  {
    id: 'ptm-005',
    ministereId: 'min-numerique',
    ministereNom: 'Ministère de l\'Économie Numérique',
    ministereSigle: 'MNUM',
    directionId: 'dir-dgpn',
    directionNom: 'Direction Générale de la Programmation Numérique',
    numero: 2,
    rubrique: 'politique_generale',
    intitule: 'Stratégie Nationale de Gouvernance des Données (Open Data)',
    cadrage: 'sept_priorites',
    cadrageDetail: 'Transparence et données ouvertes',
    incidenceFinanciere: true,
    loiFinance: false,
    servicesPorteurs: ['min-numerique'],
    servicesPorteursNoms: ['Ministère de l\'Économie Numérique'],
    dateTransmissionSGG: null,
    observations: 'Transmis au SG. Consolidation en cours.',
    programmePAGId: null,
    programmePAGNom: null,
    statut: 'soumis_sg',
    soumisParId: 'directeur-dgpn',
    soumisParNom: 'Dir. DGPN',
    dateSoumission: '2026-02-04',
    valideSGGParId: null,
    valideSGGParNom: null,
    dateValidationSGG: null,
    commentaireSGG: null,
    inscritPTGParId: null,
    inscritPTGParNom: null,
    dateInscriptionPTG: null,
    motifRejet: null,
    rapportMensuelId: null,
    annee: 2026,
    creeLe: '2026-01-22',
    modifieLe: '2026-02-04',
  },
  {
    id: 'ptm-006',
    ministereId: 'min-numerique',
    ministereNom: 'Ministère de l\'Économie Numérique',
    ministereSigle: 'MNUM',
    directionId: 'dir-dgpn',
    directionNom: 'Direction Générale de la Programmation Numérique',
    numero: 3,
    rubrique: 'missions_conferences',
    intitule: 'Conférence régionale CEMAC sur l\'économie numérique',
    cadrage: 'pag',
    cadrageDetail: 'Coopération internationale numérique',
    incidenceFinanciere: true,
    loiFinance: false,
    servicesPorteurs: ['min-numerique'],
    servicesPorteursNoms: ['Ministère de l\'Économie Numérique'],
    dateTransmissionSGG: '2026-01-20',
    observations: 'Consolidé par SGG. Transmis au Chef du Gouvernement.',
    programmePAGId: null,
    programmePAGNom: null,
    statut: 'soumis_pm',
    soumisParId: 'sgg-admin',
    soumisParNom: 'SGG',
    dateSoumission: '2026-02-01',
    valideSGGParId: 'sgg-admin',
    valideSGGParNom: 'Admin SGG',
    dateValidationSGG: '2026-01-30',
    commentaireSGG: 'Validé. Budget mission à confirmer.',
    inscritPTGParId: null,
    inscritPTGParNom: null,
    dateInscriptionPTG: null,
    motifRejet: null,
    rapportMensuelId: null,
    annee: 2026,
    creeLe: '2026-01-10',
    modifieLe: '2026-02-01',
  },

  // ========== Min. Fonction Publique — DGFP (3 initiatives) ==========

  {
    id: 'ptm-007',
    ministereId: 'min-fonction-publique',
    ministereNom: 'Ministère de la Fonction Publique',
    ministereSigle: 'MFP',
    directionId: 'dir-dgfp',
    directionNom: 'Direction Générale de la Fonction Publique',
    numero: 1,
    rubrique: 'projet_texte_legislatif',
    intitule: 'Décret portant statut particulier des agents contractuels de l\'État',
    cadrage: 'pag',
    cadrageDetail: 'Réforme administrative — Statut agents',
    incidenceFinanciere: true,
    loiFinance: true,
    servicesPorteurs: ['min-fonction-publique'],
    servicesPorteursNoms: ['Ministère de la Fonction Publique'],
    dateTransmissionSGG: '2026-01-28',
    observations: 'Texte transmis au SGG après consolidation SG.',
    programmePAGId: null,
    programmePAGNom: null,
    statut: 'consolide_sgg',
    soumisParId: 'sg-ministere-fp',
    soumisParNom: 'SG Min. Fonction Publique',
    dateSoumission: '2026-01-28',
    valideSGGParId: null,
    valideSGGParNom: null,
    dateValidationSGG: null,
    commentaireSGG: null,
    inscritPTGParId: null,
    inscritPTGParNom: null,
    dateInscriptionPTG: null,
    motifRejet: null,
    rapportMensuelId: null,
    annee: 2026,
    creeLe: '2026-01-12',
    modifieLe: '2026-02-02',
  },
  {
    id: 'ptm-008',
    ministereId: 'min-fonction-publique',
    ministereNom: 'Ministère de la Fonction Publique',
    ministereSigle: 'MFP',
    directionId: 'dir-dgfp',
    directionNom: 'Direction Générale de la Fonction Publique',
    numero: 2,
    rubrique: 'politique_generale',
    intitule: 'Programme de modernisation du fichier central des agents de l\'État',
    cadrage: 'sept_priorites',
    cadrageDetail: 'Gouvernance — Transparence des effectifs',
    incidenceFinanciere: true,
    loiFinance: true,
    servicesPorteurs: ['min-fonction-publique', 'min-numerique'],
    servicesPorteursNoms: ['Ministère de la Fonction Publique', 'Ministère de l\'Économie Numérique'],
    dateTransmissionSGG: '2026-02-05',
    observations: 'Transmis au SGPR. En attente validation Présidence.',
    programmePAGId: null,
    programmePAGNom: null,
    statut: 'soumis_sgpr',
    soumisParId: 'premier-ministre',
    soumisParNom: 'Vice-Président du Gouvernement',
    dateSoumission: '2026-02-05',
    valideSGGParId: 'sgg-admin',
    valideSGGParNom: 'Admin SGG',
    dateValidationSGG: '2026-02-03',
    commentaireSGG: 'Validé par le SGG. Transmis PM puis SGPR.',
    inscritPTGParId: null,
    inscritPTGParNom: null,
    dateInscriptionPTG: null,
    motifRejet: null,
    rapportMensuelId: null,
    annee: 2026,
    creeLe: '2026-01-08',
    modifieLe: '2026-02-05',
  },
  {
    id: 'ptm-009',
    ministereId: 'min-fonction-publique',
    ministereNom: 'Ministère de la Fonction Publique',
    ministereSigle: 'MFP',
    directionId: 'dir-dgfp',
    directionNom: 'Direction Générale de la Fonction Publique',
    numero: 3,
    rubrique: 'projet_texte_legislatif',
    intitule: 'Arrêté portant grille indiciaire révisée des fonctionnaires',
    cadrage: 'pag',
    cadrageDetail: 'Politique salariale — Harmonisation',
    incidenceFinanciere: true,
    loiFinance: true,
    servicesPorteurs: ['min-fonction-publique'],
    servicesPorteursNoms: ['Ministère de la Fonction Publique'],
    dateTransmissionSGG: null,
    observations: 'Rejeté par le SG. Incidences financières à détailler.',
    programmePAGId: null,
    programmePAGNom: null,
    statut: 'rejete_sg',
    soumisParId: 'directeur-dgfp',
    soumisParNom: 'Dir. DGFP',
    dateSoumission: '2026-02-01',
    valideSGGParId: null,
    valideSGGParNom: null,
    dateValidationSGG: null,
    commentaireSGG: null,
    inscritPTGParId: null,
    inscritPTGParNom: null,
    dateInscriptionPTG: null,
    motifRejet: 'Manque le chiffrage détaillé des incidences financières. Merci de compléter l\'annexe budgétaire.',
    rapportMensuelId: null,
    annee: 2026,
    creeLe: '2026-01-25',
    modifieLe: '2026-02-02',
  },

  // ========== Min. Fonction Publique — ENAP (3 initiatives) ==========

  {
    id: 'ptm-010',
    ministereId: 'min-fonction-publique',
    ministereNom: 'Ministère de la Fonction Publique',
    ministereSigle: 'MFP',
    directionId: 'dir-enap',
    directionNom: 'École Nationale d\'Administration Publique',
    numero: 1,
    rubrique: 'missions_conferences',
    intitule: 'Séminaire de formation continue des hauts cadres — Promotion 2026',
    cadrage: 'pag',
    cadrageDetail: 'Capital humain — Formation des élites',
    incidenceFinanciere: true,
    loiFinance: false,
    servicesPorteurs: ['min-fonction-publique'],
    servicesPorteursNoms: ['Ministère de la Fonction Publique'],
    dateTransmissionSGG: null,
    observations: 'Programme validé par le SG. Consolidation en cours.',
    programmePAGId: null,
    programmePAGNom: null,
    statut: 'consolide_sg',
    soumisParId: 'directeur-enap',
    soumisParNom: 'Dir. ENAP',
    dateSoumission: '2026-01-30',
    valideSGGParId: null,
    valideSGGParNom: null,
    dateValidationSGG: null,
    commentaireSGG: null,
    inscritPTGParId: null,
    inscritPTGParNom: null,
    dateInscriptionPTG: null,
    motifRejet: null,
    rapportMensuelId: null,
    annee: 2026,
    creeLe: '2026-01-15',
    modifieLe: '2026-02-01',
  },
  {
    id: 'ptm-011',
    ministereId: 'min-fonction-publique',
    ministereNom: 'Ministère de la Fonction Publique',
    ministereSigle: 'MFP',
    directionId: 'dir-enap',
    directionNom: 'École Nationale d\'Administration Publique',
    numero: 2,
    rubrique: 'politique_generale',
    intitule: 'Réforme des cursus de l\'ENAP — Alignement compétences numériques',
    cadrage: 'sept_priorites',
    cadrageDetail: 'Transformation numérique des compétences publiques',
    incidenceFinanciere: false,
    loiFinance: false,
    servicesPorteurs: ['min-fonction-publique', 'min-numerique'],
    servicesPorteursNoms: ['Ministère de la Fonction Publique', 'Ministère de l\'Économie Numérique'],
    dateTransmissionSGG: null,
    observations: 'Brouillon — Concertation avec le MNUM en cours.',
    programmePAGId: null,
    programmePAGNom: null,
    statut: 'brouillon',
    soumisParId: null,
    soumisParNom: null,
    dateSoumission: null,
    valideSGGParId: null,
    valideSGGParNom: null,
    dateValidationSGG: null,
    commentaireSGG: null,
    inscritPTGParId: null,
    inscritPTGParNom: null,
    dateInscriptionPTG: null,
    motifRejet: null,
    rapportMensuelId: null,
    annee: 2026,
    creeLe: '2026-01-28',
    modifieLe: '2026-02-06',
  },
  {
    id: 'ptm-012',
    ministereId: 'min-fonction-publique',
    ministereNom: 'Ministère de la Fonction Publique',
    ministereSigle: 'MFP',
    directionId: 'dir-enap',
    directionNom: 'École Nationale d\'Administration Publique',
    numero: 3,
    rubrique: 'projet_texte_legislatif',
    intitule: 'Décret portant organisation et fonctionnement de l\'ENAP',
    cadrage: 'pncd',
    cadrageDetail: 'Réforme institutionnelle — ENAP',
    incidenceFinanciere: false,
    loiFinance: false,
    servicesPorteurs: ['min-fonction-publique'],
    servicesPorteursNoms: ['Ministère de la Fonction Publique'],
    dateTransmissionSGG: null,
    observations: 'Transmis au SG. En attente consolidation.',
    programmePAGId: null,
    programmePAGNom: null,
    statut: 'soumis_sg',
    soumisParId: 'directeur-enap',
    soumisParNom: 'Dir. ENAP',
    dateSoumission: '2026-02-03',
    valideSGGParId: null,
    valideSGGParNom: null,
    dateValidationSGG: null,
    commentaireSGG: null,
    inscritPTGParId: null,
    inscritPTGParNom: null,
    dateInscriptionPTG: null,
    motifRejet: null,
    rapportMensuelId: null,
    annee: 2026,
    creeLe: '2026-01-20',
    modifieLe: '2026-02-03',
  },
];

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

export function getInitiativesByMinistere(ministereId: string): InitiativePTM[] {
  return INITIATIVES_PTM.filter((init) => init.ministereId === ministereId);
}

export function getInitiativesByDirection(directionId: string): InitiativePTM[] {
  return INITIATIVES_PTM.filter((init) => init.directionId === directionId);
}

export function getInitiativesByRubrique(rubrique: RubriquePTM): InitiativePTM[] {
  return INITIATIVES_PTM.filter((init) => init.rubrique === rubrique);
}

export function getInitiativesByStatut(statut: StatutPTM): InitiativePTM[] {
  return INITIATIVES_PTM.filter((init) => init.statut === statut);
}

export function getInitiativesByCadrage(cadrage: CadrageStrategique): InitiativePTM[] {
  return INITIATIVES_PTM.filter((init) => init.cadrage === cadrage);
}

/**
 * Calcule les statistiques PTM globales
 */
export function getPTMStats(): PTMStats {
  const allStatuts: StatutPTM[] = [
    'brouillon', 'soumis_sg', 'consolide_sg', 'soumis_sgg',
    'consolide_sgg', 'soumis_pm', 'soumis_sgpr',
    'rejete_sg', 'rejete_sgg', 'rejete',
  ];

  const stats: PTMStats = {
    totalInitiatives: INITIATIVES_PTM.length,
    parRubrique: {
      projet_texte_legislatif: 0,
      politique_generale: 0,
      missions_conferences: 0,
    },
    parStatut: Object.fromEntries(allStatuts.map(s => [s, 0])) as Record<StatutPTM, number>,
    tauxInscriptionPTG: 0,
    avecIncidenceFinanciere: 0,
    avecLoiFinance: 0,
    topMinisteres: [],
  };

  INITIATIVES_PTM.forEach((init) => {
    stats.parRubrique[init.rubrique]++;
    if (stats.parStatut[init.statut] !== undefined) {
      stats.parStatut[init.statut]++;
    }
    if (init.incidenceFinanciere) stats.avecIncidenceFinanciere++;
    if (init.loiFinance) stats.avecLoiFinance++;
  });

  // Taux transmission SGPR (end of chain)
  const transmis = INITIATIVES_PTM.filter(i =>
    ['soumis_pm', 'soumis_sgpr'].includes(i.statut)
  ).length;
  stats.tauxInscriptionPTG = Math.round((transmis / stats.totalInitiatives) * 100);

  // Top ministères
  const ministereCounts: Record<string, { nom: string; count: number }> = {};
  INITIATIVES_PTM.forEach((init) => {
    if (!ministereCounts[init.ministereId]) {
      ministereCounts[init.ministereId] = { nom: init.ministereNom, count: 0 };
    }
    ministereCounts[init.ministereId].count++;
  });

  stats.topMinisteres = Object.entries(ministereCounts)
    .map(([id, data]) => ({
      ministereId: id,
      ministereNom: data.nom,
      count: data.count,
    }))
    .sort((a, b) => b.count - a.count);

  return stats;
}

/**
 * Récupère le suivi hiérarchique par ministère
 */
export function getSuiviMinisteres(): SuiviMinisterePTM[] {
  return MINISTERES_PTM.map((min) => {
    const initiativesMin = getInitiativesByMinistere(min.id);
    const transmises = initiativesMin.filter(i => !['brouillon', 'rejete_sg', 'rejete_sgg', 'rejete'].includes(i.statut)).length;
    const enCoursSGG = initiativesMin.filter(i => ['soumis_sgg', 'consolide_sgg'].includes(i.statut)).length;
    const transmisesPM = initiativesMin.filter(i => ['soumis_pm', 'soumis_sgpr'].includes(i.statut)).length;
    const rejetees = initiativesMin.filter(i => i.statut.startsWith('rejete')).length;
    const brouillons = initiativesMin.filter(i => i.statut === 'brouillon').length;

    const derniereSoumission = initiativesMin
      .filter(i => i.dateSoumission)
      .sort((a, b) => new Date(b.dateSoumission!).getTime() - new Date(a.dateSoumission!).getTime())[0];

    return {
      ministereId: min.id,
      ministereNom: min.nom,
      ministereSigle: min.sigle,
      totalInitiatives: initiativesMin.length,
      soumises: transmises,
      validees: enCoursSGG,
      inscrites: transmisesPM,
      rejetees,
      brouillons,
      tauxSoumission: initiativesMin.length > 0 ? Math.round((transmises / initiativesMin.length) * 100) : 0,
      derniereSoumission: derniereSoumission?.dateSoumission || null,
      tauxInscription: initiativesMin.length > 0 ? Math.round((transmisesPM / initiativesMin.length) * 100) : 0,
    };
  });
}
