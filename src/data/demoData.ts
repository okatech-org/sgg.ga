/**
 * SGG Digital - Données de démonstration
 * Données mock pour les différents espaces utilisateurs
 */

// Types pour les données de démonstration
export interface DemoNomination {
  id: string;
  poste: string;
  ministere: string;
  candidat: string;
  statut: "en_attente" | "valide" | "rejete" | "en_cours";
  dateProposition: string;
  priorite: "haute" | "normale" | "basse";
}

export interface DemoArbitrage {
  id: string;
  sujet: string;
  ministeres: string[];
  statut: "en_attente" | "traite" | "urgent";
  dateReception: string;
  deadline?: string;
}

export interface DemoDossier {
  id: string;
  titre: string;
  type: "decret" | "nomination" | "texte" | "arbitrage";
  statut: "en_attente" | "signe" | "retourne";
  dateReception: string;
  emetteur: string;
}

export interface DemoProjetLoi {
  id: string;
  titre: string;
  type: "loi" | "ordonnance" | "reglement";
  etape: "depot" | "commission" | "seance" | "vote" | "adopte" | "promulgue";
  chambre: "assemblee" | "senat" | "navette";
  dateDepot: string;
  ministereOrigine: string;
}

export interface DemoAvisJuridique {
  id: string;
  titre: string;
  type: "projet_loi" | "decret" | "reglement" | "constitutionnalite";
  statut: "a_examiner" | "en_cours" | "rendu";
  dateReception: string;
  deadline: string;
  demandeur: string;
}

export interface DemoPublicationJO {
  id: string;
  titre: string;
  type: "loi" | "decret" | "arrete" | "decision";
  statut: "a_publier" | "publie" | "archive";
  dateSignature: string;
  datePublication?: string;
  numeroJO?: string;
}

// =============================================================================
// DONNÉES EXÉCUTIF
// =============================================================================

export const executifData = {
  // Statistiques générales
  stats: {
    tauxExecutionGAR: 67,
    nominationsEnCours: 12,
    decisionsPendantes: 5,
    alertesActives: 3,
    conseilsMinistresAVenir: 2,
  },

  // Nominations pour validation (Président, VP)
  nominationsAValider: [
    {
      id: "nom-001",
      poste: "Directeur Général des Impôts",
      ministere: "Ministère de l'Économie",
      candidat: "Jean-Pierre MOUSSAVOU",
      statut: "en_attente" as const,
      dateProposition: "2026-02-01",
      priorite: "haute" as const,
    },
    {
      id: "nom-002",
      poste: "Ambassadeur au Cameroun",
      ministere: "Ministère des Affaires Étrangères",
      candidat: "Marie NDONG",
      statut: "en_attente" as const,
      dateProposition: "2026-01-28",
      priorite: "haute" as const,
    },
    {
      id: "nom-003",
      poste: "Préfet de l'Estuaire",
      ministere: "Ministère de l'Intérieur",
      candidat: "Paul OBAME",
      statut: "en_cours" as const,
      dateProposition: "2026-01-25",
      priorite: "normale" as const,
    },
  ] as DemoNomination[],

  // Conseils des Ministres à venir
  conseilsMinistres: [
    {
      id: "cm-001",
      date: "2026-02-12",
      heure: "10:00",
      lieu: "Palais de la Présidence",
      pointsOrdreJour: 8,
      president: "S.E.M. le Président de la République",
    },
    {
      id: "cm-002",
      date: "2026-02-26",
      heure: "10:00",
      lieu: "Palais de la Présidence",
      pointsOrdreJour: 5,
      president: "S.E.M. le Président de la République",
    },
  ],

  // Décisions récentes
  decisionsRecentes: [
    {
      id: "dec-001",
      titre: "Décret portant nomination du DG de la SEEG",
      type: "nomination",
      date: "2026-02-03",
      statut: "signe",
    },
    {
      id: "dec-002",
      titre: "Décret relatif à la Zone Économique Spéciale",
      type: "decret",
      date: "2026-02-01",
      statut: "signe",
    },
  ],
};

// =============================================================================
// DONNÉES SGPR (Présidence)
// =============================================================================

export const sgprData = {
  // Statistiques
  stats: {
    dossiersEnAttente: 8,
    arbitragesPendants: 3,
    transmissionsJour: 5,
    urgences: 2,
  },

  // Arbitrages en cours
  arbitrages: [
    {
      id: "arb-001",
      sujet: "Répartition budgétaire Programme Infrastructures 2026",
      ministeres: ["Travaux Publics", "Économie", "Budget"],
      statut: "urgent" as const,
      dateReception: "2026-02-01",
      deadline: "2026-02-10",
    },
    {
      id: "arb-002",
      sujet: "Attribution marché équipements hospitaliers",
      ministeres: ["Santé", "Budget"],
      statut: "en_attente" as const,
      dateReception: "2026-01-28",
    },
    {
      id: "arb-003",
      sujet: "Délimitation zones protégées Ogooué-Maritime",
      ministeres: ["Environnement", "Mines", "Agriculture"],
      statut: "en_attente" as const,
      dateReception: "2026-01-25",
    },
  ] as DemoArbitrage[],

  // Dossiers pour signature présidentielle
  dossiersSignature: [
    {
      id: "dos-001",
      titre: "Décret portant organisation du Ministère de la Santé",
      type: "decret" as const,
      statut: "en_attente" as const,
      dateReception: "2026-02-02",
      emetteur: "Vice-Président du Gouvernement",
    },
    {
      id: "dos-002",
      titre: "Nomination - Ambassadeur en France",
      type: "nomination" as const,
      statut: "en_attente" as const,
      dateReception: "2026-02-01",
      emetteur: "Ministère des Affaires Étrangères",
    },
    {
      id: "dos-003",
      titre: "Projet de loi de finances rectificative 2026",
      type: "texte" as const,
      statut: "en_attente" as const,
      dateReception: "2026-01-30",
      emetteur: "Ministère du Budget",
    },
  ] as DemoDossier[],

  // Suivi des transmissions
  transmissions: [
    { date: "2026-02-05", entrant: 3, sortant: 2 },
    { date: "2026-02-04", entrant: 5, sortant: 4 },
    { date: "2026-02-03", entrant: 2, sortant: 3 },
    { date: "2026-02-02", entrant: 4, sortant: 2 },
    { date: "2026-02-01", entrant: 3, sortant: 5 },
  ],
};

// =============================================================================
// DONNÉES LÉGISLATIF
// =============================================================================

export const legislatifData = {
  // Statistiques
  stats: {
    projetsEnInstance: 8,
    votesAVenir: 3,
    commissionsActives: 6,
    textesAdoptes: 12,
  },

  // Projets de loi en instance
  projetsLoi: [
    {
      id: "pl-001",
      titre: "Projet de loi portant Code de l'Environnement",
      type: "loi" as const,
      etape: "commission" as const,
      chambre: "assemblee" as const,
      dateDepot: "2026-01-15",
      ministereOrigine: "Ministère de l'Environnement",
    },
    {
      id: "pl-002",
      titre: "Projet de loi relatif à la cybersécurité",
      type: "loi" as const,
      etape: "seance" as const,
      chambre: "assemblee" as const,
      dateDepot: "2026-01-10",
      ministereOrigine: "Ministère de l'Économie Numérique",
    },
    {
      id: "pl-003",
      titre: "Projet de loi de finances rectificative 2026",
      type: "loi" as const,
      etape: "depot" as const,
      chambre: "assemblee" as const,
      dateDepot: "2026-02-01",
      ministereOrigine: "Ministère du Budget",
    },
    {
      id: "pl-004",
      titre: "Projet de loi portant statut de la Fonction Publique",
      type: "loi" as const,
      etape: "navette" as const,
      chambre: "senat" as const,
      dateDepot: "2025-12-20",
      ministereOrigine: "Ministère de la Fonction Publique",
    },
  ] as DemoProjetLoi[],

  // Calendrier des votes
  calendrierVotes: [
    {
      id: "vote-001",
      projetLoi: "Projet de loi relatif à la cybersécurité",
      date: "2026-02-15",
      heure: "15:00",
      chambre: "assemblee",
    },
    {
      id: "vote-002",
      projetLoi: "Projet de loi portant statut de la Fonction Publique",
      date: "2026-02-20",
      heure: "10:00",
      chambre: "senat",
    },
  ],

  // Commissions parlementaires
  commissions: [
    { nom: "Commission des Finances", reunions: 3, rapportsRendus: 5 },
    { nom: "Commission des Lois", reunions: 4, rapportsRendus: 3 },
    { nom: "Commission des Affaires Sociales", reunions: 2, rapportsRendus: 2 },
    { nom: "Commission du Développement Durable", reunions: 2, rapportsRendus: 1 },
  ],
};

// =============================================================================
// DONNÉES JURIDICTIONNEL
// =============================================================================

export const juridictionnelData = {
  // Conseil d'État
  conseilEtat: {
    stats: {
      avisARendreUrgent: 2,
      avisEnCours: 5,
      avisRendusMois: 8,
    },
    avis: [
      {
        id: "avis-001",
        titre: "Projet de décret relatif aux marchés publics",
        type: "decret" as const,
        statut: "a_examiner" as const,
        dateReception: "2026-02-01",
        deadline: "2026-02-15",
        demandeur: "Vice-Président du Gouvernement",
      },
      {
        id: "avis-002",
        titre: "Projet de loi portant Code de l'Environnement",
        type: "projet_loi" as const,
        statut: "en_cours" as const,
        dateReception: "2026-01-20",
        deadline: "2026-02-10",
        demandeur: "Gouvernement",
      },
      {
        id: "avis-003",
        titre: "Décret d'application loi foncière",
        type: "decret" as const,
        statut: "rendu" as const,
        dateReception: "2026-01-10",
        deadline: "2026-01-25",
        demandeur: "Ministère de l'Urbanisme",
      },
    ] as DemoAvisJuridique[],
  },

  // Cour Constitutionnelle
  courConstitutionnelle: {
    stats: {
      controlesEnCours: 3,
      decisionsRendues: 15,
      saisinesAnnee: 22,
    },
    controles: [
      {
        id: "ctrl-001",
        titre: "Loi relative à l'état d'urgence sanitaire",
        type: "conformite",
        statut: "en_cours",
        dateSaisine: "2026-01-28",
        saisissant: "Président de l'Assemblée Nationale",
      },
      {
        id: "ctrl-002",
        titre: "Règlement intérieur du Sénat",
        type: "conformite",
        statut: "en_cours",
        dateSaisine: "2026-02-01",
        saisissant: "Président du Sénat",
      },
    ],
    decisionsRecentes: [
      {
        id: "dec-cc-001",
        titre: "Décision n°001/CC/2026 - Loi de finances 2026",
        date: "2026-01-15",
        sens: "conforme",
      },
      {
        id: "dec-cc-002",
        titre: "Décision n°002/CC/2026 - Réforme électorale",
        date: "2026-01-20",
        sens: "conforme_reserves",
      },
    ],
  },
};

// =============================================================================
// DONNÉES ADMINISTRATIF (SGG, DGJO)
// =============================================================================

export const administratifData = {
  // Statistiques système (Admin)
  statsSysteme: {
    utilisateursActifs: 245,
    sessionsJour: 1250,
    documentsTraites: 3420,
    alertesSecurite: 0,
  },

  // Utilisateurs récents
  utilisateursRecents: [
    { id: "usr-001", nom: "Jean MBOUMBA", role: "sg_ministere", dernierAcces: "2026-02-05 14:30" },
    { id: "usr-002", nom: "Marie NDONG", role: "ministre", dernierAcces: "2026-02-05 14:25" },
    { id: "usr-003", nom: "Paul OBAME", role: "sg_ministere", dernierAcces: "2026-02-05 14:20" },
  ],

  // DGJO - Publications
  publicationsJO: [
    {
      id: "pub-001",
      titre: "Décret n°00045/PR/2026 portant nomination",
      type: "decret" as const,
      statut: "a_publier" as const,
      dateSignature: "2026-02-03",
    },
    {
      id: "pub-002",
      titre: "Loi n°002/2026 relative à la cybersécurité",
      type: "loi" as const,
      statut: "a_publier" as const,
      dateSignature: "2026-02-01",
    },
    {
      id: "pub-003",
      titre: "Arrêté n°00123/MEFB/2026",
      type: "arrete" as const,
      statut: "publie" as const,
      dateSignature: "2026-01-28",
      datePublication: "2026-01-30",
      numeroJO: "JO n°15/2026",
    },
  ] as DemoPublicationJO[],

  // Éditions JO
  editionsJO: [
    { numero: "JO n°16/2026", date: "2026-02-05", textes: 12, statut: "en_preparation" },
    { numero: "JO n°15/2026", date: "2026-01-30", textes: 18, statut: "publie" },
    { numero: "JO n°14/2026", date: "2026-01-25", textes: 15, statut: "publie" },
  ],
};

// =============================================================================
// DONNÉES PUBLIC
// =============================================================================

export const publicData = {
  // Publications récentes accessibles
  publicationsRecentes: [
    {
      id: "jo-001",
      titre: "Loi n°001/2026 de finances pour l'année 2026",
      date: "2026-01-15",
      type: "loi",
      numeroJO: "JO n°10/2026",
    },
    {
      id: "jo-002",
      titre: "Décret n°00030/PR/2026 portant organisation du Gouvernement",
      date: "2026-01-10",
      type: "decret",
      numeroJO: "JO n°08/2026",
    },
    {
      id: "jo-003",
      titre: "Arrêté fixant les tarifs des services publics 2026",
      date: "2026-01-05",
      type: "arrete",
      numeroJO: "JO n°05/2026",
    },
  ],

  // Catégories populaires
  categoriesPopulaires: [
    { nom: "Lois", count: 45 },
    { nom: "Décrets", count: 234 },
    { nom: "Arrêtés", count: 567 },
    { nom: "Nominations", count: 189 },
  ],

  // Recherches populaires (pour professionnel du droit)
  recherchesPopulaires: [
    "Code du travail",
    "Marchés publics",
    "Fiscalité entreprises",
    "Droit foncier",
    "Investissements étrangers",
  ],
};

// =============================================================================
// FONCTIONS UTILITAIRES
// =============================================================================

export function getDataForRole(roleId: string) {
  switch (roleId) {
    case "president":
    case "vice-president":
    case "premier-ministre":
    case "ministre":
    case "sg-ministere":
      return executifData;
    case "sgpr":
      return sgprData;
    case "assemblee":
    case "senat":
      return legislatifData;
    case "conseil-etat":
    case "cour-constitutionnelle":
      return juridictionnelData;
    case "sgg-admin":
    case "sgg-directeur":
    case "dgjo":
      return administratifData;
    case "citoyen":
    case "professionnel-droit":
      return publicData;
    default:
      return publicData;
  }
}

// Labels de statut
export const statutLabels = {
  en_attente: "En attente",
  valide: "Validé",
  rejete: "Rejeté",
  en_cours: "En cours",
  traite: "Traité",
  urgent: "Urgent",
  signe: "Signé",
  retourne: "Retourné",
  depot: "Dépôt",
  commission: "Commission",
  seance: "Séance",
  vote: "Vote",
  adopte: "Adopté",
  promulgue: "Promulgué",
  a_examiner: "À examiner",
  rendu: "Rendu",
  a_publier: "À publier",
  publie: "Publié",
  archive: "Archivé",
};

// Couleurs de statut
export const statutColors: Record<string, string> = {
  en_attente: "bg-status-warning/10 text-status-warning border-status-warning/20",
  valide: "bg-status-success/10 text-status-success border-status-success/20",
  rejete: "bg-status-danger/10 text-status-danger border-status-danger/20",
  en_cours: "bg-status-info/10 text-status-info border-status-info/20",
  traite: "bg-status-success/10 text-status-success border-status-success/20",
  urgent: "bg-status-danger/10 text-status-danger border-status-danger/20",
  signe: "bg-status-success/10 text-status-success border-status-success/20",
  retourne: "bg-status-warning/10 text-status-warning border-status-warning/20",
  a_examiner: "bg-status-warning/10 text-status-warning border-status-warning/20",
  rendu: "bg-status-success/10 text-status-success border-status-success/20",
  a_publier: "bg-status-info/10 text-status-info border-status-info/20",
  publie: "bg-status-success/10 text-status-success border-status-success/20",
  archive: "bg-muted text-muted-foreground border-muted",
};
