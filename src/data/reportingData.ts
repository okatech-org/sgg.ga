/**
 * SGG Digital — Données Mock Matrice de Reporting PAG 2026
 * 8 piliers, 10 programmes, rapports mensuels, ministères, notifications
 */

import type {
  PilierPresidentiel,
  ProgrammePAG,
  GouvernanceProgramme,
  RapportMensuel,
  HistoriqueModification,
  NotificationReporting,
  MinistereInfo,
  SuiviMinistere,
} from '@/types/reporting';

// =============================================================================
// 8 PILIERS PRÉSIDENTIELS
// =============================================================================

export const PILIERS: PilierPresidentiel[] = [
  { id: 1, code: 'energie_eau', nom: 'Énergie & Eau', couleur: '#3B82F6', icone: 'Zap' },
  { id: 2, code: 'education', nom: 'Éducation & Formation', couleur: '#F59E0B', icone: 'GraduationCap' },
  { id: 3, code: 'sante', nom: 'Santé', couleur: '#EF4444', icone: 'HeartPulse' },
  { id: 4, code: 'habitat', nom: 'Habitat & Cadre de Vie', couleur: '#22C55E', icone: 'Home' },
  { id: 5, code: 'infrastructures', nom: 'Infrastructures & Numérique', couleur: '#8B5CF6', icone: 'Globe' },
  { id: 6, code: 'agriculture', nom: 'Agriculture & Souveraineté Alimentaire', couleur: '#10B981', icone: 'Wheat' },
  { id: 7, code: 'gouvernance', nom: 'Gouvernance & Administration', couleur: '#6366F1', icone: 'Shield' },
  { id: 8, code: 'justice', nom: 'Justice & Sécurité', couleur: '#EC4899', icone: 'Scale' },
];

// =============================================================================
// 10 PROGRAMMES PAG (Colonnes 1-6)
// =============================================================================

export const PROGRAMMES: ProgrammePAG[] = [
  {
    id: 'prog-001',
    pilierId: 1,
    mesurePresidentielle: 'Accès universel à l\'électricité et à l\'eau potable',
    codeProgramme: 'P1-01',
    libelleProgramme: 'Programme Dernier Kilomètre — Accès Universel Électricité (FNEE)',
    objectifStrategique: '50 000 raccordements électricité et eau pour les populations rurales et périurbaines',
    resultatsAttendus: '50 000 foyers raccordés, 4 stations/ouvrages livrés, réduction de 30% des coupures',
    actionsProjets: 'Extension réseau électrique rural, construction de mini-centrales solaires, réhabilitation adductions',
  },
  {
    id: 'prog-002',
    pilierId: 1,
    mesurePresidentielle: 'Sécurisation des adductions d\'eau potable',
    codeProgramme: 'P1-02',
    libelleProgramme: 'Sécurisation Adductions Eau Potable',
    objectifStrategique: 'Garantir l\'accès à l\'eau potable dans les 9 provinces',
    resultatsAttendus: '4 stations de traitement livrées, 200 km de réseau réhabilité',
    actionsProjets: 'Réhabilitation stations SEEG, forages en zone rurale, extensions réseau',
  },
  {
    id: 'prog-003',
    pilierId: 2,
    mesurePresidentielle: 'Réforme du système éducatif et formation professionnelle',
    codeProgramme: 'P2-01',
    libelleProgramme: 'Formation Technique & Professionnelle',
    objectifStrategique: 'Former 10 000 jeunes aux métiers porteurs d\'ici fin 2026',
    resultatsAttendus: '10 000 jeunes formés, 20 centres de formation opérationnels, taux d\'insertion de 60%',
    actionsProjets: 'Création de centres de formation, partenariats public-privé, certification internationale',
  },
  {
    id: 'prog-004',
    pilierId: 3,
    mesurePresidentielle: 'Couverture Santé Universelle',
    codeProgramme: 'P3-01',
    libelleProgramme: 'Couverture Santé Universelle (CSU)',
    objectifStrategique: 'Couvrir 80% de la population par un régime d\'assurance maladie',
    resultatsAttendus: '1,2 million de bénéficiaires enrôlés, 50 formations sanitaires réhabilitées',
    actionsProjets: 'Enrôlement populations, réhabilitation hôpitaux, approvisionnement médicaments essentiels',
  },
  {
    id: 'prog-005',
    pilierId: 4,
    mesurePresidentielle: 'Programme de logements sociaux',
    codeProgramme: 'P4-01',
    libelleProgramme: 'Logements Sociaux (FGHL)',
    objectifStrategique: 'Construire 5 000 logements sociaux dans les principales villes',
    resultatsAttendus: '5 000 logements livrés, 3 zones d\'aménagement viabilisées',
    actionsProjets: 'Construction logements Angondjé/Bikélé, viabilisation parcelles, PPP immobilier',
  },
  {
    id: 'prog-006',
    pilierId: 5,
    mesurePresidentielle: 'Désenclavement routier du territoire',
    codeProgramme: 'P5-01',
    libelleProgramme: 'Désenclavement Routes (FNI)',
    objectifStrategique: 'Bitumer 500 km de routes nationales et provinciales',
    resultatsAttendus: '500 km bitumés, 20 ponts construits, temps de trajet réduit de 40%',
    actionsProjets: 'Route Ntoum-Cocobeach, Route Ndendé-Tchibanga, ponts Ogooué, entretien routier',
  },
  {
    id: 'prog-007',
    pilierId: 5,
    mesurePresidentielle: 'Transformation numérique de l\'économie',
    codeProgramme: 'P5-02',
    libelleProgramme: 'Numérique & Télécommunications',
    objectifStrategique: 'Connecter 90% du territoire au haut débit d\'ici 2027',
    resultatsAttendus: '2 000 km de fibre optique déployés, couverture 4G à 95%, 50 services dématérialisés',
    actionsProjets: 'Déploiement fibre optique, data center souverain, plateforme e-gouvernement',
  },
  {
    id: 'prog-008',
    pilierId: 6,
    mesurePresidentielle: 'Souveraineté alimentaire et intensification agricole',
    codeProgramme: 'P6-01',
    libelleProgramme: 'Intensification Agricole (FNDA)',
    objectifStrategique: 'Réduire les importations alimentaires de 50% d\'ici 2028',
    resultatsAttendus: '20 000 ha mis en valeur, 5 000 exploitants accompagnés, 3 agropoles créés',
    actionsProjets: 'Agropoles Ntoum/Kango/Lambaréné, mécanisation, financement exploitants',
  },
  {
    id: 'prog-009',
    pilierId: 7,
    mesurePresidentielle: 'Modernisation de l\'administration publique',
    codeProgramme: 'P7-01',
    libelleProgramme: 'Modernisation Administration Publique',
    objectifStrategique: 'Dématérialiser 80% des procédures administratives',
    resultatsAttendus: '100 procédures dématérialisées, temps de traitement réduit de 60%, satisfaction usagers >70%',
    actionsProjets: 'Plateforme Mon Service Public, interconnexion ministères, formation agents, guichet unique',
  },
  {
    id: 'prog-010',
    pilierId: 8,
    mesurePresidentielle: 'Accès à la justice et sécurité des personnes',
    codeProgramme: 'P8-01',
    libelleProgramme: 'Accès à la Justice & Sécurité',
    objectifStrategique: 'Rapprocher la justice des justiciables et renforcer la sécurité',
    resultatsAttendus: '10 tribunaux réhabilités, délais de jugement réduits de 40%, 5 commissariats construits',
    actionsProjets: 'Réhabilitation tribunaux, aide juridictionnelle, construction commissariats, vidéosurveillance',
  },
];

// =============================================================================
// GOUVERNANCE PAR PROGRAMME (Colonnes 7-9)
// =============================================================================

export const GOUVERNANCES: GouvernanceProgramme[] = [
  {
    programmeId: 'prog-001',
    ministerePiloteId: 'min-energie',
    ministerePiloteNom: 'Ministère de l\'Énergie et de l\'Eau',
    ministeresCoResponsables: ['Min. Économie', 'Min. Aménagement du Territoire'],
    ministeresCoResponsablesIds: ['min-economie', 'min-amenagement'],
    partenairesPTF: ['Banque Mondiale', 'AFD', 'BAD'],
  },
  {
    programmeId: 'prog-002',
    ministerePiloteId: 'min-energie',
    ministerePiloteNom: 'Ministère de l\'Énergie et de l\'Eau',
    ministeresCoResponsables: ['Min. Santé', 'Min. Intérieur'],
    ministeresCoResponsablesIds: ['min-sante', 'min-interieur'],
    partenairesPTF: ['UNICEF', 'AFD'],
  },
  {
    programmeId: 'prog-003',
    ministerePiloteId: 'min-education',
    ministerePiloteNom: 'Ministère de l\'Éducation Nationale',
    ministeresCoResponsables: ['Min. Formation Professionnelle', 'Min. Emploi'],
    ministeresCoResponsablesIds: ['min-formation-pro', 'min-emploi'],
    partenairesPTF: ['UNESCO', 'Banque Mondiale'],
  },
  {
    programmeId: 'prog-004',
    ministerePiloteId: 'min-sante',
    ministerePiloteNom: 'Ministère de la Santé',
    ministeresCoResponsables: ['Min. Affaires Sociales', 'CNAMGS'],
    ministeresCoResponsablesIds: ['min-affaires-sociales'],
    partenairesPTF: ['OMS', 'Banque Mondiale', 'Fonds Mondial'],
  },
  {
    programmeId: 'prog-005',
    ministerePiloteId: 'min-habitat',
    ministerePiloteNom: 'Ministère de l\'Habitat et de l\'Urbanisme',
    ministeresCoResponsables: ['Min. Économie', 'ANUTTC'],
    ministeresCoResponsablesIds: ['min-economie'],
    partenairesPTF: ['BAD', 'Shelter Afrique'],
  },
  {
    programmeId: 'prog-006',
    ministerePiloteId: 'min-infrastructures',
    ministerePiloteNom: 'Ministère des Infrastructures et des Travaux Publics',
    ministeresCoResponsables: ['Min. Transports', 'Min. Défense'],
    ministeresCoResponsablesIds: ['min-transports', 'min-defense'],
    partenairesPTF: ['BAD', 'BEI', 'Chine Exim Bank'],
  },
  {
    programmeId: 'prog-007',
    ministerePiloteId: 'min-numerique',
    ministerePiloteNom: 'Ministère de l\'Économie Numérique',
    ministeresCoResponsables: ['Min. Communication', 'ARCEP'],
    ministeresCoResponsablesIds: ['min-communication'],
    partenairesPTF: ['Banque Mondiale', 'UIT', 'Smart Africa'],
  },
  {
    programmeId: 'prog-008',
    ministerePiloteId: 'min-agriculture',
    ministerePiloteNom: 'Ministère de l\'Agriculture',
    ministeresCoResponsables: ['Min. Eaux et Forêts', 'Min. Commerce'],
    ministeresCoResponsablesIds: ['min-eaux-forets', 'min-commerce'],
    partenairesPTF: ['FAO', 'FIDA', 'BAD'],
  },
  {
    programmeId: 'prog-009',
    ministerePiloteId: 'min-fonction-publique',
    ministerePiloteNom: 'Ministère de la Fonction Publique',
    ministeresCoResponsables: ['Min. Économie Numérique', 'SGG'],
    ministeresCoResponsablesIds: ['min-numerique'],
    partenairesPTF: ['PNUD', 'UE'],
  },
  {
    programmeId: 'prog-010',
    ministerePiloteId: 'min-justice',
    ministerePiloteNom: 'Ministère de la Justice',
    ministeresCoResponsables: ['Min. Intérieur', 'Min. Défense'],
    ministeresCoResponsablesIds: ['min-interieur', 'min-defense'],
    partenairesPTF: ['PNUD', 'UE', 'France'],
  },
];

// =============================================================================
// RAPPORTS MENSUELS — Janvier 2026 (5 validés, 3 soumis, 2 brouillons)
// =============================================================================

export const RAPPORTS_MENSUELS: RapportMensuel[] = [
  // --- VALIDÉ SGPR (5 rapports) ---
  {
    id: 'rap-001',
    programmeId: 'prog-001',
    ministereId: 'min-energie',
    periodeMois: 1,
    periodeAnnee: 2026,
    soumisParId: 'sg-energie',
    soumisParNom: 'SG Min. Énergie',
    dateDebut: '2026-01-06',
    dateFin: '2026-01-31',
    activitesRealisees: 'Raccordement de 4 200 foyers dans les provinces de l\'Estuaire et du Haut-Ogooué. Livraison de 2 mini-centrales solaires à Makokou et Mouila. Lancement de l\'appel d\'offres pour les transformateurs.',
    budgetMdFcfa: 82,
    engageMdFcfa: 53.3,
    decaisseMdFcfa: 34.4,
    pctExecutionFinanciere: 42,
    encadrementJuridique: 'Décret n°2025-342 portant création du FNEE',
    indicateursKpi: 'Raccordements: 4 200/50 000 (8,4%) | Mini-centrales: 2/10 (20%)',
    pctAvancementPhysique: 15,
    statutProgramme: 'en_cours',
    observationsContraintes: 'Retard d\'approvisionnement en transformateurs (délai fournisseur +45j). Difficultés d\'accès zones rurales en saison des pluies.',
    statutValidation: 'valide_sgpr',
    valideSGGParId: 'sgg-directeur',
    valideSGGParNom: 'Dir. CTCO/SGG',
    dateValidationSGG: '2026-02-03',
    valideSGPRParId: 'sgpr',
    valideSGPRParNom: 'SGPR',
    dateValidationSGPR: '2026-02-05',
    commentaireValidation: 'Rapport conforme. Surveiller les délais fournisseur.',
    motifRejet: null,
    creeLe: '2026-01-28',
    modifieLe: '2026-02-05',
  },
  {
    id: 'rap-006',
    programmeId: 'prog-006',
    ministereId: 'min-infrastructures',
    periodeMois: 1,
    periodeAnnee: 2026,
    soumisParId: 'sg-infrastructures',
    soumisParNom: 'SG Min. Infrastructures',
    dateDebut: '2026-01-08',
    dateFin: '2026-01-31',
    activitesRealisees: 'Avancement des travaux Route Ntoum-Cocobeach (lot 1 : 12 km bitumés). Début terrassement pont Ogooué-Lambaréné. Réception provisoire tronçon Ndendé-Mouila.',
    budgetMdFcfa: 18,
    engageMdFcfa: 9.9,
    decaisseMdFcfa: 7.2,
    pctExecutionFinanciere: 40,
    encadrementJuridique: 'Convention de financement BAD signée le 15/12/2025',
    indicateursKpi: 'Routes bitumées: 42 km/500 km (8,4%) | Ponts: 0/20 (0%)',
    pctAvancementPhysique: 12,
    statutProgramme: 'en_cours',
    observationsContraintes: 'Saison des pluies ralentit les travaux de terrassement. Mobilisation entreprises satisfaisante.',
    statutValidation: 'valide_sgpr',
    valideSGGParId: 'sgg-directeur',
    valideSGGParNom: 'Dir. CTCO/SGG',
    dateValidationSGG: '2026-02-02',
    valideSGPRParId: 'sgpr',
    valideSGPRParNom: 'SGPR',
    dateValidationSGPR: '2026-02-04',
    commentaireValidation: null,
    motifRejet: null,
    creeLe: '2026-01-29',
    modifieLe: '2026-02-04',
  },
  {
    id: 'rap-007',
    programmeId: 'prog-007',
    ministereId: 'min-numerique',
    periodeMois: 1,
    periodeAnnee: 2026,
    soumisParId: 'sg-numerique',
    soumisParNom: 'SG Min. Numérique',
    dateDebut: '2026-01-02',
    dateFin: '2026-01-31',
    activitesRealisees: 'Déploiement de 180 km de fibre optique Libreville-Franceville. Mise en service data center souverain phase 1. Lancement portail e-gouvernement (12 services en ligne).',
    budgetMdFcfa: 15,
    engageMdFcfa: 12,
    decaisseMdFcfa: 9.75,
    pctExecutionFinanciere: 65,
    encadrementJuridique: 'Loi n°2025-018 sur l\'économie numérique promulguée',
    indicateursKpi: 'Fibre optique: 180 km/2 000 km (9%) | Services en ligne: 12/50 (24%)',
    pctAvancementPhysique: 22,
    statutProgramme: 'en_cours',
    observationsContraintes: 'Bonne dynamique. Partenariat Smart Africa accélérant le déploiement.',
    statutValidation: 'valide_sgpr',
    valideSGGParId: 'sgg-directeur',
    valideSGGParNom: 'Dir. CTCO/SGG',
    dateValidationSGG: '2026-02-01',
    valideSGPRParId: 'sgpr',
    valideSGPRParNom: 'SGPR',
    dateValidationSGPR: '2026-02-03',
    commentaireValidation: 'Excellent taux d\'exécution. Programme pilote.',
    motifRejet: null,
    creeLe: '2026-01-27',
    modifieLe: '2026-02-03',
  },
  {
    id: 'rap-009',
    programmeId: 'prog-009',
    ministereId: 'min-fonction-publique',
    periodeMois: 1,
    periodeAnnee: 2026,
    soumisParId: 'sg-fonction-publique',
    soumisParNom: 'SG Min. Fonction Publique',
    dateDebut: '2026-01-05',
    dateFin: '2026-01-31',
    activitesRealisees: 'Dématérialisation de 15 procédures administratives sur la plateforme Mon Service Public. Formation de 200 agents aux outils numériques. Audit des processus dans 5 ministères.',
    budgetMdFcfa: 8.5,
    engageMdFcfa: 7.225,
    decaisseMdFcfa: 5.95,
    pctExecutionFinanciere: 70,
    encadrementJuridique: 'Décret n°2025-401 sur la modernisation administrative',
    indicateursKpi: 'Procédures dématérialisées: 15/100 (15%) | Agents formés: 200/2 000 (10%)',
    pctAvancementPhysique: 18,
    statutProgramme: 'en_cours',
    observationsContraintes: 'Résistance au changement dans certains ministères. Nécessité de renforcer l\'accompagnement.',
    statutValidation: 'valide_sgpr',
    valideSGGParId: 'sgg-directeur',
    valideSGGParNom: 'Dir. CTCO/SGG',
    dateValidationSGG: '2026-02-02',
    valideSGPRParId: 'sgpr',
    valideSGPRParNom: 'SGPR',
    dateValidationSGPR: '2026-02-04',
    commentaireValidation: null,
    motifRejet: null,
    creeLe: '2026-01-28',
    modifieLe: '2026-02-04',
  },
  {
    id: 'rap-010',
    programmeId: 'prog-010',
    ministereId: 'min-justice',
    periodeMois: 1,
    periodeAnnee: 2026,
    soumisParId: 'sg-justice',
    soumisParNom: 'SG Min. Justice',
    dateDebut: '2026-01-06',
    dateFin: '2026-01-31',
    activitesRealisees: 'Lancement des travaux de réhabilitation des tribunaux de Franceville et Oyem. Recrutement de 30 magistrats auxiliaires. Mise en place de l\'aide juridictionnelle pilote.',
    budgetMdFcfa: 10,
    engageMdFcfa: 5,
    decaisseMdFcfa: 3.5,
    pctExecutionFinanciere: 35,
    encadrementJuridique: 'Loi organique n°2025-023 sur l\'organisation judiciaire',
    indicateursKpi: 'Tribunaux réhabilités: 0/10 (0%) | Magistrats recrutés: 30/50 (60%)',
    pctAvancementPhysique: 10,
    statutProgramme: 'en_preparation',
    observationsContraintes: 'Travaux de réhabilitation tributaires des études techniques. Délais de passation de marchés.',
    statutValidation: 'valide_sgpr',
    valideSGGParId: 'sgg-directeur',
    valideSGGParNom: 'Dir. CTCO/SGG',
    dateValidationSGG: '2026-02-03',
    valideSGPRParId: 'sgpr',
    valideSGPRParNom: 'SGPR',
    dateValidationSGPR: '2026-02-05',
    commentaireValidation: 'Attention au faible taux d\'exécution financière.',
    motifRejet: null,
    creeLe: '2026-01-30',
    modifieLe: '2026-02-05',
  },

  // --- SOUMIS (3 rapports) ---
  {
    id: 'rap-002',
    programmeId: 'prog-002',
    ministereId: 'min-energie',
    periodeMois: 1,
    periodeAnnee: 2026,
    soumisParId: 'sg-energie',
    soumisParNom: 'SG Min. Énergie',
    dateDebut: '2026-01-10',
    dateFin: '2026-01-31',
    activitesRealisees: 'Réhabilitation station de traitement de Ntoum (phase 1). Lancement forages dans la Ngounié (5 sites). Diagnostic réseau Libreville Sud.',
    budgetMdFcfa: 28,
    engageMdFcfa: 12.6,
    decaisseMdFcfa: 8.4,
    pctExecutionFinanciere: 30,
    encadrementJuridique: '',
    indicateursKpi: 'Stations: 0/4 (en cours) | Forages: 5 lancés/20 prévus',
    pctAvancementPhysique: 8,
    statutProgramme: 'en_cours',
    observationsContraintes: 'Mobilisation des entreprises de forage en cours. Budget UNICEF non encore décaissé.',
    statutValidation: 'soumis',
    valideSGGParId: null,
    valideSGGParNom: null,
    dateValidationSGG: null,
    valideSGPRParId: null,
    valideSGPRParNom: null,
    dateValidationSGPR: null,
    commentaireValidation: null,
    motifRejet: null,
    creeLe: '2026-01-29',
    modifieLe: '2026-01-31',
  },
  {
    id: 'rap-004',
    programmeId: 'prog-004',
    ministereId: 'min-sante',
    periodeMois: 1,
    periodeAnnee: 2026,
    soumisParId: 'sg-sante',
    soumisParNom: 'SG Min. Santé',
    dateDebut: '2026-01-03',
    dateFin: '2026-01-31',
    activitesRealisees: 'Enrôlement de 85 000 bénéficiaires CSU dans l\'Estuaire et l\'Ogooué-Maritime. Réception de 2 lots de médicaments essentiels. Réhabilitation CMS Nzeng-Ayong.',
    budgetMdFcfa: 101.5,
    engageMdFcfa: 60.9,
    decaisseMdFcfa: 38.57,
    pctExecutionFinanciere: 38,
    encadrementJuridique: 'Loi n°2025-015 sur la Couverture Santé Universelle',
    indicateursKpi: 'Bénéficiaires: 85 000/1 200 000 (7%) | Formations sanitaires: 2/50 (4%)',
    pctAvancementPhysique: 10,
    statutProgramme: 'en_cours',
    observationsContraintes: 'Lenteur du processus d\'enrôlement dans les provinces de l\'intérieur. Nécessité de renforcer les équipes mobiles.',
    statutValidation: 'soumis',
    valideSGGParId: null,
    valideSGGParNom: null,
    dateValidationSGG: null,
    valideSGPRParId: null,
    valideSGPRParNom: null,
    dateValidationSGPR: null,
    commentaireValidation: null,
    motifRejet: null,
    creeLe: '2026-01-30',
    modifieLe: '2026-02-01',
  },
  {
    id: 'rap-008',
    programmeId: 'prog-008',
    ministereId: 'min-agriculture',
    periodeMois: 1,
    periodeAnnee: 2026,
    soumisParId: 'sg-agriculture',
    soumisParNom: 'SG Min. Agriculture',
    dateDebut: '2026-01-07',
    dateFin: '2026-01-31',
    activitesRealisees: 'Lancement agropole de Ntoum (défrichage 500 ha). Distribution de 1 000 kits d\'intrants aux exploitants de la Ngounié. Signature convention FIDA.',
    budgetMdFcfa: 25,
    engageMdFcfa: 10,
    decaisseMdFcfa: 6.25,
    pctExecutionFinanciere: 25,
    encadrementJuridique: 'Décret n°2025-380 portant création du FNDA',
    indicateursKpi: 'Hectares: 500/20 000 (2,5%) | Exploitants: 1 000/5 000 (20%)',
    pctAvancementPhysique: 8,
    statutProgramme: 'en_preparation',
    observationsContraintes: 'Retard dans la livraison des engins de mécanisation. Coordination avec les collectivités locales à renforcer.',
    statutValidation: 'soumis',
    valideSGGParId: null,
    valideSGGParNom: null,
    dateValidationSGG: null,
    valideSGPRParId: null,
    valideSGPRParNom: null,
    dateValidationSGPR: null,
    commentaireValidation: null,
    motifRejet: null,
    creeLe: '2026-01-31',
    modifieLe: '2026-02-01',
  },

  // --- BROUILLONS (2 rapports) ---
  {
    id: 'rap-003',
    programmeId: 'prog-003',
    ministereId: 'min-education',
    periodeMois: 1,
    periodeAnnee: 2026,
    soumisParId: null,
    soumisParNom: null,
    dateDebut: '2026-01-06',
    dateFin: null,
    activitesRealisees: 'Identification des sites pour 5 nouveaux centres de formation.',
    budgetMdFcfa: 12.5,
    engageMdFcfa: 8.75,
    decaisseMdFcfa: 6.875,
    pctExecutionFinanciere: 55,
    encadrementJuridique: '',
    indicateursKpi: '',
    pctAvancementPhysique: 5,
    statutProgramme: 'en_preparation',
    observationsContraintes: '',
    statutValidation: 'brouillon',
    valideSGGParId: null,
    valideSGGParNom: null,
    dateValidationSGG: null,
    valideSGPRParId: null,
    valideSGPRParNom: null,
    dateValidationSGPR: null,
    commentaireValidation: null,
    motifRejet: null,
    creeLe: '2026-02-01',
    modifieLe: '2026-02-03',
  },
  {
    id: 'rap-005',
    programmeId: 'prog-005',
    ministereId: 'min-habitat',
    periodeMois: 1,
    periodeAnnee: 2026,
    soumisParId: null,
    soumisParNom: null,
    dateDebut: '2026-01-15',
    dateFin: null,
    activitesRealisees: 'Études topographiques zone Bikélé en cours.',
    budgetMdFcfa: 12,
    engageMdFcfa: 4.2,
    decaisseMdFcfa: 2.4,
    pctExecutionFinanciere: 20,
    encadrementJuridique: '',
    indicateursKpi: '',
    pctAvancementPhysique: 3,
    statutProgramme: 'en_preparation',
    observationsContraintes: '',
    statutValidation: 'brouillon',
    valideSGGParId: null,
    valideSGGParNom: null,
    dateValidationSGG: null,
    valideSGPRParId: null,
    valideSGPRParNom: null,
    dateValidationSGPR: null,
    commentaireValidation: null,
    motifRejet: null,
    creeLe: '2026-02-02',
    modifieLe: '2026-02-04',
  },
];

// =============================================================================
// 35 MINISTÈRES
// =============================================================================

export const MINISTERES: MinistereInfo[] = [
  { id: 'min-energie', nom: 'Ministère de l\'Énergie et de l\'Eau', sigle: 'MEE' },
  { id: 'min-education', nom: 'Ministère de l\'Éducation Nationale', sigle: 'MEN' },
  { id: 'min-sante', nom: 'Ministère de la Santé', sigle: 'MSAS' },
  { id: 'min-habitat', nom: 'Ministère de l\'Habitat et de l\'Urbanisme', sigle: 'MHU' },
  { id: 'min-infrastructures', nom: 'Ministère des Infrastructures', sigle: 'MITP' },
  { id: 'min-numerique', nom: 'Ministère de l\'Économie Numérique', sigle: 'MEN' },
  { id: 'min-agriculture', nom: 'Ministère de l\'Agriculture', sigle: 'MAGR' },
  { id: 'min-fonction-publique', nom: 'Ministère de la Fonction Publique', sigle: 'MFP' },
  { id: 'min-justice', nom: 'Ministère de la Justice', sigle: 'MJ' },
  { id: 'min-defense', nom: 'Ministère de la Défense Nationale', sigle: 'MDN' },
  { id: 'min-interieur', nom: 'Ministère de l\'Intérieur', sigle: 'MI' },
  { id: 'min-affaires-etrangeres', nom: 'Ministère des Affaires Étrangères', sigle: 'MAE' },
  { id: 'min-economie', nom: 'Ministère de l\'Économie et des Finances', sigle: 'MEF' },
  { id: 'min-budget', nom: 'Ministère du Budget', sigle: 'MB' },
  { id: 'min-commerce', nom: 'Ministère du Commerce', sigle: 'MC' },
  { id: 'min-transports', nom: 'Ministère des Transports', sigle: 'MT' },
  { id: 'min-communication', nom: 'Ministère de la Communication', sigle: 'MCOM' },
  { id: 'min-culture', nom: 'Ministère de la Culture et des Arts', sigle: 'MCA' },
  { id: 'min-sport', nom: 'Ministère des Sports', sigle: 'MS' },
  { id: 'min-emploi', nom: 'Ministère de l\'Emploi', sigle: 'MEMPL' },
  { id: 'min-eaux-forets', nom: 'Ministère des Eaux et Forêts', sigle: 'MEFC' },
  { id: 'min-environnement', nom: 'Ministère de l\'Environnement', sigle: 'ME' },
  { id: 'min-mines', nom: 'Ministère des Mines', sigle: 'MM' },
  { id: 'min-petrole', nom: 'Ministère du Pétrole et du Gaz', sigle: 'MPG' },
  { id: 'min-tourisme', nom: 'Ministère du Tourisme', sigle: 'MTOUR' },
  { id: 'min-affaires-sociales', nom: 'Ministère des Affaires Sociales', sigle: 'MAS' },
  { id: 'min-promotion-femme', nom: 'Ministère de la Promotion de la Femme', sigle: 'MPF' },
  { id: 'min-jeunesse', nom: 'Ministère de la Jeunesse', sigle: 'MJ' },
  { id: 'min-formation-pro', nom: 'Ministère de la Formation Professionnelle', sigle: 'MFPRO' },
  { id: 'min-enseignement-sup', nom: 'Ministère de l\'Enseignement Supérieur', sigle: 'MES' },
  { id: 'min-amenagement', nom: 'Ministère de l\'Aménagement du Territoire', sigle: 'MAT' },
  { id: 'min-travail', nom: 'Ministère du Travail', sigle: 'MTRAV' },
  { id: 'min-reforme', nom: 'Ministère de la Réforme des Institutions', sigle: 'MRI' },
  { id: 'min-relations-parlement', nom: 'Ministère des Relations avec le Parlement', sigle: 'MRP' },
  { id: 'min-decentralisation', nom: 'Ministère de la Décentralisation', sigle: 'MDEC' },
];

// =============================================================================
// SUIVI REMPLISSAGE (Heatmap data — Janvier 2026 pour 10 ministères pilotes)
// =============================================================================

export const SUIVI_MINISTERES: SuiviMinistere[] = [
  // Janvier 2026 — Les 10 ministères pilotes
  { ministereId: 'min-energie', ministereNom: 'Min. Énergie et Eau', ministereSigle: 'MEE', mois: 1, annee: 2026, statut: 'valide', dateRemplissage: '2026-01-28', joursRetard: 0, tauxCompletude: 100 },
  { ministereId: 'min-education', ministereNom: 'Min. Éducation Nationale', ministereSigle: 'MEN', mois: 1, annee: 2026, statut: 'brouillon', dateRemplissage: '2026-02-01', joursRetard: 6, tauxCompletude: 30 },
  { ministereId: 'min-sante', ministereNom: 'Min. Santé', ministereSigle: 'MSAS', mois: 1, annee: 2026, statut: 'soumis', dateRemplissage: '2026-01-30', joursRetard: 0, tauxCompletude: 85 },
  { ministereId: 'min-habitat', ministereNom: 'Min. Habitat', ministereSigle: 'MHU', mois: 1, annee: 2026, statut: 'brouillon', dateRemplissage: '2026-02-02', joursRetard: 8, tauxCompletude: 20 },
  { ministereId: 'min-infrastructures', ministereNom: 'Min. Infrastructures', ministereSigle: 'MITP', mois: 1, annee: 2026, statut: 'valide', dateRemplissage: '2026-01-29', joursRetard: 0, tauxCompletude: 100 },
  { ministereId: 'min-numerique', ministereNom: 'Min. Économie Numérique', ministereSigle: 'MNUM', mois: 1, annee: 2026, statut: 'valide', dateRemplissage: '2026-01-27', joursRetard: 0, tauxCompletude: 100 },
  { ministereId: 'min-agriculture', ministereNom: 'Min. Agriculture', ministereSigle: 'MAGR', mois: 1, annee: 2026, statut: 'soumis', dateRemplissage: '2026-01-31', joursRetard: 1, tauxCompletude: 90 },
  { ministereId: 'min-fonction-publique', ministereNom: 'Min. Fonction Publique', ministereSigle: 'MFP', mois: 1, annee: 2026, statut: 'valide', dateRemplissage: '2026-01-28', joursRetard: 0, tauxCompletude: 100 },
  { ministereId: 'min-justice', ministereNom: 'Min. Justice', ministereSigle: 'MJ', mois: 1, annee: 2026, statut: 'valide', dateRemplissage: '2026-01-30', joursRetard: 0, tauxCompletude: 100 },
  // 3 ministères sans rapport (en retard)
  { ministereId: 'min-defense', ministereNom: 'Min. Défense Nationale', ministereSigle: 'MDN', mois: 1, annee: 2026, statut: 'non_saisi', dateRemplissage: null, joursRetard: 12, tauxCompletude: 0 },
  { ministereId: 'min-interieur', ministereNom: 'Min. Intérieur', ministereSigle: 'MI', mois: 1, annee: 2026, statut: 'non_saisi', dateRemplissage: null, joursRetard: 12, tauxCompletude: 0 },
  { ministereId: 'min-commerce', ministereNom: 'Min. Commerce', ministereSigle: 'MC', mois: 1, annee: 2026, statut: 'non_saisi', dateRemplissage: null, joursRetard: 12, tauxCompletude: 0 },
];

// =============================================================================
// NOTIFICATIONS MOCK
// =============================================================================

export const NOTIFICATIONS_MOCK: NotificationReporting[] = [
  {
    id: 'notif-001',
    type: 'rapport_soumis',
    titre: 'Rapport soumis',
    message: 'Le Min. Santé a soumis son rapport pour le programme CSU (Janvier 2026).',
    destinataireId: 'sgg-admin',
    destinataireNom: 'Admin SGG',
    lue: false,
    dateCreation: '2026-02-01T10:30:00',
    lienAction: '/matrice-reporting/validation',
    rapportId: 'rap-004',
    programmeId: 'prog-004',
    ministereId: 'min-sante',
  },
  {
    id: 'notif-002',
    type: 'rapport_soumis',
    titre: 'Rapport soumis',
    message: 'Le Min. Agriculture a soumis son rapport pour le programme FNDA (Janvier 2026).',
    destinataireId: 'sgg-admin',
    destinataireNom: 'Admin SGG',
    lue: false,
    dateCreation: '2026-02-01T14:15:00',
    lienAction: '/matrice-reporting/validation',
    rapportId: 'rap-008',
    programmeId: 'prog-008',
    ministereId: 'min-agriculture',
  },
  {
    id: 'notif-003',
    type: 'deadline_depassee',
    titre: 'Deadline dépassée',
    message: 'Le Min. Éducation Nationale n\'a pas soumis son rapport pour Janvier 2026 (retard: 6 jours).',
    destinataireId: 'sgg-admin',
    destinataireNom: 'Admin SGG',
    lue: true,
    dateCreation: '2026-02-06T08:00:00',
    lienAction: '/matrice-reporting/suivi',
    ministereId: 'min-education',
  },
  {
    id: 'notif-004',
    type: 'rapport_valide_sgpr',
    titre: 'Rapport validé SGPR',
    message: 'Le rapport du programme FNEE (Min. Énergie) pour Janvier 2026 a été validé par le SGPR.',
    destinataireId: 'sg-ministere',
    destinataireNom: 'SG Min. Énergie',
    lue: false,
    dateCreation: '2026-02-05T16:00:00',
    lienAction: '/matrice-reporting',
    rapportId: 'rap-001',
    programmeId: 'prog-001',
    ministereId: 'min-energie',
  },
  {
    id: 'notif-005',
    type: 'anomalie_detectee',
    titre: 'Anomalie détectée',
    message: 'Écart significatif entre exécution financière (20%) et avancement physique (3%) sur le programme Logements Sociaux.',
    destinataireId: 'sgg-admin',
    destinataireNom: 'Admin SGG',
    lue: false,
    dateCreation: '2026-02-04T09:30:00',
    lienAction: '/matrice-reporting',
    rapportId: 'rap-005',
    programmeId: 'prog-005',
    ministereId: 'min-habitat',
  },
  {
    id: 'notif-006',
    type: 'rappel_mi_periode',
    titre: 'Rappel mi-période',
    message: 'Rappel: La date limite de soumission des rapports de Février 2026 est le 28/02/2026.',
    destinataireId: 'sg-ministere',
    destinataireNom: 'Tous les SG Ministères',
    lue: true,
    dateCreation: '2026-02-15T08:00:00',
    lienAction: '/matrice-reporting/saisie',
  },
];

// =============================================================================
// HISTORIQUE DES MODIFICATIONS MOCK
// =============================================================================

export const HISTORIQUE_MOCK: HistoriqueModification[] = [
  {
    id: 'hist-001',
    rapportId: 'rap-001',
    champModifie: 'activitesRealisees',
    ancienneValeur: 'Raccordement de 3 800 foyers...',
    nouvelleValeur: 'Raccordement de 4 200 foyers dans les provinces de l\'Estuaire et du Haut-Ogooué...',
    modifieParId: 'sg-energie',
    modifieParNom: 'SG Min. Énergie',
    modifieLe: '2026-01-29T14:30:00',
  },
  {
    id: 'hist-002',
    rapportId: 'rap-001',
    champModifie: 'statutValidation',
    ancienneValeur: 'brouillon',
    nouvelleValeur: 'soumis',
    modifieParId: 'sg-energie',
    modifieParNom: 'SG Min. Énergie',
    modifieLe: '2026-01-30T09:00:00',
  },
  {
    id: 'hist-003',
    rapportId: 'rap-001',
    champModifie: 'statutValidation',
    ancienneValeur: 'soumis',
    nouvelleValeur: 'valide_sgg',
    modifieParId: 'sgg-directeur',
    modifieParNom: 'Dir. CTCO/SGG',
    modifieLe: '2026-02-03T11:00:00',
  },
  {
    id: 'hist-004',
    rapportId: 'rap-001',
    champModifie: 'statutValidation',
    ancienneValeur: 'valide_sgg',
    nouvelleValeur: 'valide_sgpr',
    modifieParId: 'sgpr',
    modifieParNom: 'SGPR',
    modifieLe: '2026-02-05T15:00:00',
  },
];

// =============================================================================
// HELPERS
// =============================================================================

export function getPilierById(id: number): PilierPresidentiel | undefined {
  return PILIERS.find(p => p.id === id);
}

export function getProgrammeById(id: string): ProgrammePAG | undefined {
  return PROGRAMMES.find(p => p.id === id);
}

export function getGouvernanceByProgramme(programmeId: string): GouvernanceProgramme | undefined {
  return GOUVERNANCES.find(g => g.programmeId === programmeId);
}

export function getRapportByProgrammeEtPeriode(
  programmeId: string,
  mois: number,
  annee: number
): RapportMensuel | undefined {
  return RAPPORTS_MENSUELS.find(
    r => r.programmeId === programmeId && r.periodeMois === mois && r.periodeAnnee === annee
  );
}

export function getMinistereById(id: string): MinistereInfo | undefined {
  return MINISTERES.find(m => m.id === id);
}

/**
 * Retourne tous les programmes dans lesquels un ministère est impliqué
 * (en tant que pilote OU co-responsable).
 * Chaque résultat inclut le rôle du ministère dans le programme.
 */
export type RoleMinistereProgramme = 'pilote' | 'co-responsable';

export interface ProgrammeMinistere {
  programme: ProgrammePAG;
  gouvernance: GouvernanceProgramme;
  role: RoleMinistereProgramme;
}

export function getProgrammesForMinistere(ministereId: string): ProgrammeMinistere[] {
  const results: ProgrammeMinistere[] = [];

  for (const gouv of GOUVERNANCES) {
    const programme = PROGRAMMES.find(p => p.id === gouv.programmeId);
    if (!programme) continue;

    if (gouv.ministerePiloteId === ministereId) {
      results.push({ programme, gouvernance: gouv, role: 'pilote' });
    } else if (gouv.ministeresCoResponsablesIds.includes(ministereId)) {
      results.push({ programme, gouvernance: gouv, role: 'co-responsable' });
    }
  }

  return results;
}

/**
 * Retourne le rôle d'un ministère dans un programme donné.
 * null si le ministère n'est pas impliqué.
 */
export function getRoleInProgramme(
  ministereId: string,
  programmeId: string
): RoleMinistereProgramme | null {
  const gouv = GOUVERNANCES.find(g => g.programmeId === programmeId);
  if (!gouv) return null;

  if (gouv.ministerePiloteId === ministereId) return 'pilote';
  if (gouv.ministeresCoResponsablesIds.includes(ministereId)) return 'co-responsable';
  return null;
}

/**
 * Vérifie si un ministère est impliqué dans un programme (pilote ou co-responsable)
 */
export function isMinistereInProgramme(ministereId: string, programmeId: string): boolean {
  return getRoleInProgramme(ministereId, programmeId) !== null;
}

