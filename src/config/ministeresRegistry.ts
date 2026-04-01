/**
 * SGG Digital — Registre Unifié des 35 Ministères
 * Source unique de vérité pour tous les ministères, leur ordre protocolaire,
 * et leurs directions sous tutelle.
 * Correspond aux codes de la table institutions.institutions en base de données.
 */

// =============================================================================
// TYPES
// =============================================================================

export interface DirectionEntry {
  id: string;
  nom: string;
  sigle: string;
}

export interface MinistereEntry {
  /** ID interne (ex: "min-numerique") */
  id: string;
  /** Code DB (ex: "MIN-NUM") — correspond à institutions.institutions.code */
  code: string;
  /** Nom complet */
  nom: string;
  /** Nom court pour affichage */
  nomCourt: string;
  /** Sigle */
  sigle: string;
  /** Ordre protocolaire (pour tri) */
  ordreProtocole: number;
  /** Catégorie protocolaire */
  categorie: 'souverainete' | 'economique' | 'social' | 'technique';
  /** Directions / établissements sous tutelle */
  directions: DirectionEntry[];
}

// =============================================================================
// REGISTRE DES 35 MINISTÈRES
// =============================================================================

export const MINISTERES_REGISTRY: MinistereEntry[] = [
  // ─── MINISTÈRES DE SOUVERAINETÉ ──────────────────────────────────────────
  {
    id: 'min-defense',
    code: 'MIN-DEF',
    nom: 'Ministère de la Défense Nationale',
    nomCourt: 'Min. Défense',
    sigle: 'MDN',
    ordreProtocole: 11,
    categorie: 'souverainete',
    directions: [],
  },
  {
    id: 'min-interieur',
    code: 'MIN-INT',
    nom: 'Ministère de l\'Intérieur et de la Sécurité',
    nomCourt: 'Min. Intérieur',
    sigle: 'MI',
    ordreProtocole: 12,
    categorie: 'souverainete',
    directions: [],
  },
  {
    id: 'min-affaires-etrangeres',
    code: 'MIN-AE',
    nom: 'Ministère des Affaires Étrangères',
    nomCourt: 'Min. Affaires Étrangères',
    sigle: 'MAE',
    ordreProtocole: 13,
    categorie: 'souverainete',
    directions: [],
  },
  {
    id: 'min-justice',
    code: 'MIN-JUST',
    nom: 'Ministère de la Justice, Garde des Sceaux',
    nomCourt: 'Min. Justice',
    sigle: 'MJ',
    ordreProtocole: 14,
    categorie: 'souverainete',
    directions: [],
  },

  // ─── MINISTÈRES ÉCONOMIQUES ──────────────────────────────────────────────
  {
    id: 'min-economie',
    code: 'MIN-ECO',
    nom: 'Ministère de l\'Économie et des Participations',
    nomCourt: 'Min. Économie',
    sigle: 'MEP',
    ordreProtocole: 15,
    categorie: 'economique',
    directions: [],
  },
  {
    id: 'min-budget',
    code: 'MIN-BUDGET',
    nom: 'Ministère du Budget et des Comptes Publics',
    nomCourt: 'Min. Budget',
    sigle: 'MBP',
    ordreProtocole: 16,
    categorie: 'economique',
    directions: [],
  },
  {
    id: 'min-planification',
    code: 'MIN-PLAN',
    nom: 'Ministère de la Planification et de la Prospective',
    nomCourt: 'Min. Planification',
    sigle: 'MPP',
    ordreProtocole: 17,
    categorie: 'economique',
    directions: [],
  },

  // ─── MINISTÈRES SOCIAUX ──────────────────────────────────────────────────
  {
    id: 'min-education',
    code: 'MIN-EDU',
    nom: 'Ministère de l\'Éducation Nationale',
    nomCourt: 'Min. Éducation',
    sigle: 'MEN',
    ordreProtocole: 18,
    categorie: 'social',
    directions: [],
  },
  {
    id: 'min-enseignement-sup',
    code: 'MIN-ESUP',
    nom: 'Ministère de l\'Enseignement Supérieur et de la Recherche Scientifique',
    nomCourt: 'Min. Ens. Supérieur',
    sigle: 'MESRS',
    ordreProtocole: 19,
    categorie: 'social',
    directions: [],
  },
  {
    id: 'min-sante',
    code: 'MIN-SANTE',
    nom: 'Ministère de la Santé',
    nomCourt: 'Min. Santé',
    sigle: 'MSAS',
    ordreProtocole: 20,
    categorie: 'social',
    directions: [],
  },
  {
    id: 'min-affaires-sociales',
    code: 'MIN-AS',
    nom: 'Ministère des Affaires Sociales et des Droits de la Femme',
    nomCourt: 'Min. Affaires Sociales',
    sigle: 'MASDF',
    ordreProtocole: 21,
    categorie: 'social',
    directions: [],
  },
  {
    id: 'min-travail',
    code: 'MIN-TRAV',
    nom: 'Ministère du Travail, de l\'Emploi et de la Protection Sociale',
    nomCourt: 'Min. Travail',
    sigle: 'MTEPS',
    ordreProtocole: 22,
    categorie: 'social',
    directions: [],
  },
  {
    id: 'min-fonction-publique',
    code: 'MIN-FP',
    nom: 'Ministère de la Fonction Publique et du Renouveau du Service Public',
    nomCourt: 'Min. Fonction Publique',
    sigle: 'MFPRSP',
    ordreProtocole: 23,
    categorie: 'social',
    directions: [
      { id: 'dir-dgfp', nom: 'Direction Générale de la Fonction Publique', sigle: 'DGFP' },
      { id: 'dir-enap', nom: 'École Nationale d\'Administration Publique', sigle: 'ENAP' },
    ],
  },

  // ─── MINISTÈRES TECHNIQUES ───────────────────────────────────────────────
  {
    id: 'min-agriculture',
    code: 'MIN-AGRI',
    nom: 'Ministère de l\'Agriculture, de l\'Élevage et de la Pêche',
    nomCourt: 'Min. Agriculture',
    sigle: 'MAEP',
    ordreProtocole: 24,
    categorie: 'technique',
    directions: [],
  },
  {
    id: 'min-eaux-forets',
    code: 'MIN-EF',
    nom: 'Ministère des Eaux et Forêts',
    nomCourt: 'Min. Eaux et Forêts',
    sigle: 'MEF',
    ordreProtocole: 25,
    categorie: 'technique',
    directions: [],
  },
  {
    id: 'min-environnement',
    code: 'MIN-ENV',
    nom: 'Ministère de l\'Environnement, du Climat et de la Transition Énergétique',
    nomCourt: 'Min. Environnement',
    sigle: 'MECTE',
    ordreProtocole: 26,
    categorie: 'technique',
    directions: [],
  },
  {
    id: 'min-mines',
    code: 'MIN-MINES',
    nom: 'Ministère des Mines',
    nomCourt: 'Min. Mines',
    sigle: 'MM',
    ordreProtocole: 27,
    categorie: 'technique',
    directions: [],
  },
  {
    id: 'min-petrole',
    code: 'MIN-PET',
    nom: 'Ministère du Pétrole et du Gaz',
    nomCourt: 'Min. Pétrole',
    sigle: 'MPG',
    ordreProtocole: 28,
    categorie: 'technique',
    directions: [],
  },
  {
    id: 'min-energie',
    code: 'MIN-ENERG',
    nom: 'Ministère de l\'Énergie et des Ressources Hydrauliques',
    nomCourt: 'Min. Énergie',
    sigle: 'MERH',
    ordreProtocole: 29,
    categorie: 'technique',
    directions: [],
  },
  {
    id: 'min-infrastructures',
    code: 'MIN-INFRA',
    nom: 'Ministère des Infrastructures et des Travaux Publics',
    nomCourt: 'Min. Infrastructures',
    sigle: 'MITP',
    ordreProtocole: 30,
    categorie: 'technique',
    directions: [],
  },
  {
    id: 'min-habitat',
    code: 'MIN-HABITAT',
    nom: 'Ministère de l\'Habitat, de l\'Urbanisme et du Cadastre',
    nomCourt: 'Min. Habitat',
    sigle: 'MHUC',
    ordreProtocole: 31,
    categorie: 'technique',
    directions: [],
  },
  {
    id: 'min-transports',
    code: 'MIN-TRANS',
    nom: 'Ministère des Transports',
    nomCourt: 'Min. Transports',
    sigle: 'MT',
    ordreProtocole: 32,
    categorie: 'technique',
    directions: [],
  },
  {
    id: 'min-numerique',
    code: 'MIN-NUM',
    nom: 'Ministère de l\'Économie Numérique et des Nouvelles Technologies',
    nomCourt: 'Min. Numérique',
    sigle: 'MENNT',
    ordreProtocole: 33,
    categorie: 'technique',
    directions: [
      { id: 'dir-cgi', nom: 'Centre Gabonais d\'Informatique', sigle: 'CGI' },
      { id: 'dir-dgpn', nom: 'Direction Générale de la Programmation Numérique', sigle: 'DGPN' },
    ],
  },
  {
    id: 'min-communication',
    code: 'MIN-COM',
    nom: 'Ministère de la Communication et des Médias',
    nomCourt: 'Min. Communication',
    sigle: 'MCM',
    ordreProtocole: 34,
    categorie: 'technique',
    directions: [],
  },
  {
    id: 'min-culture',
    code: 'MIN-CULTURE',
    nom: 'Ministère de la Culture, des Arts et du Patrimoine',
    nomCourt: 'Min. Culture',
    sigle: 'MCAP',
    ordreProtocole: 35,
    categorie: 'technique',
    directions: [],
  },
  {
    id: 'min-sport',
    code: 'MIN-SPORT',
    nom: 'Ministère des Sports',
    nomCourt: 'Min. Sports',
    sigle: 'MS',
    ordreProtocole: 36,
    categorie: 'technique',
    directions: [],
  },
  {
    id: 'min-jeunesse',
    code: 'MIN-JEUNE',
    nom: 'Ministère de la Jeunesse et de la Vie Associative',
    nomCourt: 'Min. Jeunesse',
    sigle: 'MJVA',
    ordreProtocole: 37,
    categorie: 'technique',
    directions: [],
  },
  {
    id: 'min-promotion-femme',
    code: 'MIN-FEMME',
    nom: 'Ministère de la Promotion de la Femme et de la Condition Féminine',
    nomCourt: 'Min. Promotion Femme',
    sigle: 'MPFCF',
    ordreProtocole: 38,
    categorie: 'technique',
    directions: [],
  },
  {
    id: 'min-commerce',
    code: 'MIN-COMMERCE',
    nom: 'Ministère du Commerce et de l\'Industrie',
    nomCourt: 'Min. Commerce',
    sigle: 'MCI',
    ordreProtocole: 39,
    categorie: 'technique',
    directions: [],
  },
  {
    id: 'min-tourisme',
    code: 'MIN-TOURISME',
    nom: 'Ministère du Tourisme et de l\'Artisanat',
    nomCourt: 'Min. Tourisme',
    sigle: 'MTA',
    ordreProtocole: 40,
    categorie: 'technique',
    directions: [],
  },
  {
    id: 'min-decentralisation',
    code: 'MIN-DECEN',
    nom: 'Ministère de la Décentralisation et du Développement Local',
    nomCourt: 'Min. Décentralisation',
    sigle: 'MDDL',
    ordreProtocole: 41,
    categorie: 'technique',
    directions: [],
  },
  {
    id: 'min-relations-parlement',
    code: 'MIN-REL-PARL',
    nom: 'Ministère chargé des Relations avec les Institutions Constitutionnelles',
    nomCourt: 'Min. Relations Institutions',
    sigle: 'MRIC',
    ordreProtocole: 42,
    categorie: 'technique',
    directions: [],
  },
  {
    id: 'min-reforme',
    code: 'MIN-REFORME',
    nom: 'Ministère de la Réforme de l\'État',
    nomCourt: 'Min. Réforme État',
    sigle: 'MRE',
    ordreProtocole: 43,
    categorie: 'technique',
    directions: [],
  },
  {
    id: 'min-formation-pro',
    code: 'MIN-FP-PRO',
    nom: 'Ministère de la Formation Professionnelle',
    nomCourt: 'Min. Formation Pro',
    sigle: 'MFP',
    ordreProtocole: 44,
    categorie: 'technique',
    directions: [],
  },
  {
    id: 'min-peche',
    code: 'MIN-PECHE',
    nom: 'Ministère de la Pêche et de l\'Économie Maritime',
    nomCourt: 'Min. Pêche',
    sigle: 'MPEM',
    ordreProtocole: 45,
    categorie: 'technique',
    directions: [],
  },
];

// =============================================================================
// FONCTIONS UTILITAIRES
// =============================================================================

/** Récupère un ministère par son ID */
export function getMinistereById(id: string): MinistereEntry | undefined {
  return MINISTERES_REGISTRY.find(m => m.id === id);
}

/** Récupère un ministère par son code DB */
export function getMinistereByCode(code: string): MinistereEntry | undefined {
  return MINISTERES_REGISTRY.find(m => m.code === code);
}

/** Récupère le ministère de tutelle d'une direction */
export function getMinistereTutelle(directionId: string): MinistereEntry | undefined {
  return MINISTERES_REGISTRY.find(m => m.directions.some(d => d.id === directionId));
}

/** Récupère les directions d'un ministère */
export function getDirections(ministereId: string): DirectionEntry[] {
  return getMinistereById(ministereId)?.directions ?? [];
}

/** Récupère tous les ministères triés par ordre protocolaire */
export function getMinisteresTriesParProtocole(): MinistereEntry[] {
  return [...MINISTERES_REGISTRY].sort((a, b) => a.ordreProtocole - b.ordreProtocole);
}

/** Récupère les ministères qui ont des directions sous tutelle */
export function getMinisteresAvecDirections(): MinistereEntry[] {
  return MINISTERES_REGISTRY.filter(m => m.directions.length > 0);
}

/** Toutes les directions à plat avec leur ministère de tutelle */
export function getAllDirections(): (DirectionEntry & { ministereId: string; ministereNom: string })[] {
  return MINISTERES_REGISTRY.flatMap(m =>
    m.directions.map(d => ({
      ...d,
      ministereId: m.id,
      ministereNom: m.nomCourt,
    }))
  );
}

/** Format pour les interfaces MinistereInfo existantes (compatibilité reportingData/ptmData) */
export function toMinistereInfo(): { id: string; nom: string; sigle: string }[] {
  return MINISTERES_REGISTRY.map(m => ({
    id: m.id,
    nom: m.nom,
    sigle: m.sigle,
  }));
}
