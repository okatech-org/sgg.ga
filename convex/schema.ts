/**
 * SGG Digital - Convex Schema
 * Migrated from 7 PostgreSQL schemas (~35 tables) to Convex document model
 * Architecture: 8 modules (auth, institutions, gar, nominations, legislatif, egop, jo, ptm)
 */
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// ─── Shared validators ────────────────────────────────────────────────────────
const appRole = v.union(
  v.literal("admin_sgg"),
  v.literal("directeur_sgg"),
  v.literal("sg_ministere"),
  v.literal("sgpr"),
  v.literal("premier_ministre"),
  v.literal("ministre"),
  v.literal("assemblee"),
  v.literal("senat"),
  v.literal("conseil_etat"),
  v.literal("cour_constitutionnelle"),
  v.literal("dgjo"),
  v.literal("citoyen")
);

const permissionType = v.union(
  v.literal("read"),
  v.literal("write"),
  v.literal("approve"),
  v.literal("reject"),
  v.literal("publish"),
  v.literal("admin")
);

export default defineSchema({
  // ══════════════════════════════════════════════════════════════════════════
  // AUTH - Authentification et RBAC (12 rôles)
  // ══════════════════════════════════════════════════════════════════════════

  users: defineTable({
    email: v.string(),
    passwordHash: v.string(),
    fullName: v.string(),
    phone: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    // Status
    isActive: v.boolean(),
    isVerified: v.boolean(),
    // Verification
    verificationToken: v.optional(v.string()),
    resetToken: v.optional(v.string()),
    resetTokenExpires: v.optional(v.number()),
    // 2FA/TOTP
    totpSecret: v.optional(v.string()),
    totpEnabled: v.boolean(),
    backupCodes: v.optional(v.array(v.string())),
    // Audit
    lastLogin: v.optional(v.number()),
    loginCount: v.number(),
    failedLoginCount: v.number(),
    lockedUntil: v.optional(v.number()),
  })
    .index("by_email", ["email"])
    .index("by_active", ["isActive"]),

  userRoles: defineTable({
    userId: v.id("users"),
    role: appRole,
    institutionId: v.optional(v.id("institutions")),
    isPrimary: v.boolean(),
    grantedBy: v.optional(v.id("users")),
    grantedAt: v.number(),
    expiresAt: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_role", ["role"])
    .index("by_user_role", ["userId", "role"]),

  rolePermissions: defineTable({
    role: appRole,
    module: v.string(),
    permission: permissionType,
    conditions: v.optional(v.any()),
  })
    .index("by_role", ["role"])
    .index("by_role_module", ["role", "module"]),

  sessions: defineTable({
    userId: v.id("users"),
    token: v.string(),
    refreshToken: v.optional(v.string()),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    deviceFingerprint: v.optional(v.string()),
    expiresAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_token", ["token"])
    .index("by_expires", ["expiresAt"]),

  auditLogs: defineTable({
    userId: v.optional(v.id("users")),
    action: v.string(),
    module: v.string(),
    tableName: v.string(),
    recordId: v.optional(v.string()),
    oldValues: v.optional(v.any()),
    newValues: v.optional(v.any()),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
  })
    .index("by_user", ["userId"])
    .index("by_module", ["module"]),

  // ══════════════════════════════════════════════════════════════════════════
  // INSTITUTIONS - Cartographie Institutionnelle
  // ══════════════════════════════════════════════════════════════════════════

  institutions: defineTable({
    code: v.string(),
    nom: v.string(),
    nomCourt: v.optional(v.string()),
    sigle: v.optional(v.string()),
    type: v.union(
      v.literal("presidence"),
      v.literal("primature"),
      v.literal("ministere"),
      v.literal("secretariat_general"),
      v.literal("direction_generale"),
      v.literal("direction"),
      v.literal("service"),
      v.literal("assemblee"),
      v.literal("senat"),
      v.literal("juridiction"),
      v.literal("autorite_independante"),
      v.literal("etablissement_public"),
      v.literal("collectivite")
    ),
    // Hierarchy
    parentId: v.optional(v.id("institutions")),
    ordreProtocole: v.optional(v.number()),
    // Coordinates
    adresse: v.optional(v.string()),
    ville: v.optional(v.string()),
    telephone: v.optional(v.string()),
    email: v.optional(v.string()),
    siteWeb: v.optional(v.string()),
    logoUrl: v.optional(v.string()),
    // Responsible
    responsableNom: v.optional(v.string()),
    responsableFonction: v.optional(v.string()),
    dateNomination: v.optional(v.string()),
    // Digitalization
    niveauDigitalisation: v.optional(
      v.union(
        v.literal("niveau_0"),
        v.literal("niveau_1"),
        v.literal("niveau_2"),
        v.literal("niveau_3"),
        v.literal("niveau_4")
      )
    ),
    dateConnexionSgg: v.optional(v.string()),
    // Stats
    nbAgents: v.optional(v.number()),
    budgetAnnuel: v.optional(v.number()),
    isActive: v.boolean(),
    metadata: v.optional(v.any()),
  })
    .index("by_code", ["code"])
    .index("by_type", ["type"])
    .index("by_parent", ["parentId"]),

  institutionInteractions: defineTable({
    institutionSourceId: v.id("institutions"),
    institutionCibleId: v.id("institutions"),
    typeInteraction: v.string(),
    description: v.optional(v.string()),
    frequence: v.optional(v.string()),
    fluxDocuments: v.optional(v.any()),
    isActive: v.boolean(),
  })
    .index("by_source", ["institutionSourceId"])
    .index("by_cible", ["institutionCibleId"]),

  // ══════════════════════════════════════════════════════════════════════════
  // GAR - Gestion Axée sur les Résultats (PAG 2026)
  // ══════════════════════════════════════════════════════════════════════════

  garPrioritesPag: defineTable({
    code: v.string(),
    priorite: v.union(
      v.literal("sante"),
      v.literal("education"),
      v.literal("infrastructure"),
      v.literal("agriculture"),
      v.literal("numerique"),
      v.literal("emploi"),
      v.literal("environnement"),
      v.literal("gouvernance")
    ),
    titre: v.string(),
    description: v.optional(v.string()),
    // Budget
    budgetAlloue: v.number(),
    budgetConsomme: v.number(),
    // Objectifs
    nbObjectifsTotal: v.number(),
    nbObjectifsAtteints: v.number(),
    icone: v.optional(v.string()),
    couleur: v.optional(v.string()),
    ordre: v.number(),
  }).index("by_code", ["code"]),

  garObjectifs: defineTable({
    code: v.string(),
    prioriteId: v.id("garPrioritesPag"),
    ministereId: v.id("institutions"),
    // Details
    titre: v.string(),
    description: v.optional(v.string()),
    annee: v.number(),
    trimestre: v.optional(v.number()),
    // Indicators (21 columns matrix)
    indicateurCle: v.optional(v.string()),
    uniteMesure: v.optional(v.string()),
    valeurReference: v.optional(v.number()),
    valeurCible: v.optional(v.number()),
    valeurT1: v.optional(v.number()),
    valeurT2: v.optional(v.number()),
    valeurT3: v.optional(v.number()),
    valeurT4: v.optional(v.number()),
    valeurRealisee: v.optional(v.number()),
    // Budget
    budgetPrevu: v.number(),
    budgetEngage: v.number(),
    budgetDecaisse: v.number(),
    // Status
    statut: v.union(
      v.literal("planifie"),
      v.literal("en_cours"),
      v.literal("en_retard"),
      v.literal("atteint"),
      v.literal("partiellement_atteint"),
      v.literal("abandonne")
    ),
    dateDebut: v.optional(v.string()),
    dateEcheance: v.optional(v.string()),
    dateAchevement: v.optional(v.string()),
    // Responsible
    responsableNom: v.optional(v.string()),
    responsableEmail: v.optional(v.string()),
    // Hierarchy
    parentId: v.optional(v.id("garObjectifs")),
    niveau: v.number(),
    observations: v.optional(v.string()),
    metadata: v.optional(v.any()),
    createdBy: v.optional(v.id("users")),
    updatedBy: v.optional(v.id("users")),
  })
    .index("by_priorite", ["prioriteId"])
    .index("by_ministere", ["ministereId"])
    .index("by_annee", ["annee"])
    .index("by_statut", ["statut"]),

  garRapports: defineTable({
    ministereId: v.id("institutions"),
    annee: v.number(),
    mois: v.number(),
    // Matrix data (21 columns)
    donneesMatrice: v.any(),
    // Summary
    nbObjectifsSuivis: v.number(),
    nbObjectifsAtteints: v.number(),
    nbObjectifsEnRetard: v.number(),
    tauxGlobalRealisation: v.number(),
    // Comments
    synthese: v.optional(v.string()),
    difficultes: v.optional(v.string()),
    perspectives: v.optional(v.string()),
    recommandations: v.optional(v.string()),
    // Files
    fichierUrl: v.optional(v.string()),
    fichierExcelUrl: v.optional(v.string()),
    // Workflow
    statut: v.union(
      v.literal("attendu"),
      v.literal("en_retard"),
      v.literal("soumis"),
      v.literal("en_revision"),
      v.literal("valide"),
      v.literal("rejete")
    ),
    dateLimite: v.optional(v.string()),
    dateSoumission: v.optional(v.number()),
    dateValidation: v.optional(v.number()),
    soumisPar: v.optional(v.id("users")),
    validePar: v.optional(v.id("users")),
    observationsValidation: v.optional(v.string()),
  })
    .index("by_ministere", ["ministereId"])
    .index("by_periode", ["annee", "mois"])
    .index("by_statut", ["statut"]),

  garIndicateurs: defineTable({
    objectifId: v.id("garObjectifs"),
    code: v.string(),
    libelle: v.string(),
    description: v.optional(v.string()),
    typeIndicateur: v.optional(v.string()),
    unite: v.optional(v.string()),
    sourceDonnees: v.optional(v.string()),
    frequenceCollecte: v.optional(v.string()),
    valeurBaseline: v.optional(v.number()),
    valeurCible: v.optional(v.number()),
    valeurActuelle: v.optional(v.number()),
    dateDerniereMaj: v.optional(v.number()),
  }).index("by_objectif", ["objectifId"]),

  // ══════════════════════════════════════════════════════════════════════════
  // NOMINATIONS - Workflow des Nominations
  // ══════════════════════════════════════════════════════════════════════════

  nominationsPostes: defineTable({
    code: v.string(),
    titre: v.string(),
    institutionId: v.id("institutions"),
    direction: v.optional(v.string()),
    categorie: v.union(
      v.literal("A1"),
      v.literal("A2"),
      v.literal("A3"),
      v.literal("B1"),
      v.literal("B2"),
      v.literal("C")
    ),
    grade: v.optional(v.string()),
    echelon: v.optional(v.number()),
    diplomeMinimum: v.optional(v.string()),
    experienceMinimum: v.optional(v.number()),
    competencesRequises: v.optional(v.any()),
    indiceDebut: v.optional(v.number()),
    indiceFin: v.optional(v.number()),
    isVacant: v.boolean(),
    titulaireActuelId: v.optional(v.string()),
    dateVacance: v.optional(v.string()),
    description: v.optional(v.string()),
    isActive: v.boolean(),
    metadata: v.optional(v.any()),
  })
    .index("by_institution", ["institutionId"])
    .index("by_categorie", ["categorie"])
    .index("by_vacant", ["isVacant"]),

  nominationsCandidats: defineTable({
    matricule: v.optional(v.string()),
    civilite: v.optional(v.string()),
    nom: v.string(),
    prenom: v.string(),
    nomJeuneFille: v.optional(v.string()),
    dateNaissance: v.string(),
    lieuNaissance: v.optional(v.string()),
    nationalite: v.optional(v.string()),
    sexe: v.optional(v.string()),
    email: v.optional(v.string()),
    telephone: v.optional(v.string()),
    telephoneSecondaire: v.optional(v.string()),
    adresse: v.optional(v.string()),
    corps: v.optional(v.string()),
    gradeActuel: v.optional(v.string()),
    echelonActuel: v.optional(v.number()),
    institutionActuelleId: v.optional(v.id("institutions")),
    posteActuel: v.optional(v.string()),
    dateEntreeFonctionPublique: v.optional(v.string()),
    diplomePlusEleve: v.optional(v.string()),
    etablissementDiplome: v.optional(v.string()),
    anneeDiplome: v.optional(v.number()),
    autresDiplomes: v.optional(v.any()),
    photoUrl: v.optional(v.string()),
    cvUrl: v.optional(v.string()),
    casierJudiciaireVerifie: v.boolean(),
    dateVerificationCasier: v.optional(v.string()),
    createdBy: v.optional(v.id("users")),
  })
    .index("by_matricule", ["matricule"])
    .index("by_nom", ["nom", "prenom"]),

  nominationsDossiers: defineTable({
    reference: v.string(),
    candidatId: v.id("nominationsCandidats"),
    posteId: v.id("nominationsPostes"),
    ministereProposantId: v.id("institutions"),
    type: v.union(
      v.literal("premiere_nomination"),
      v.literal("mutation"),
      v.literal("promotion"),
      v.literal("detachement"),
      v.literal("mise_disposition"),
      v.literal("reintegration"),
      v.literal("fin_fonction")
    ),
    statut: v.union(
      v.literal("brouillon"),
      v.literal("soumis"),
      v.literal("recevabilite"),
      v.literal("examen_sgg"),
      v.literal("avis_favorable"),
      v.literal("avis_defavorable"),
      v.literal("transmis_sgpr"),
      v.literal("arbitrage_pm"),
      v.literal("conseil_ministres"),
      v.literal("valide_cm"),
      v.literal("signature"),
      v.literal("signe"),
      v.literal("publie_jo"),
      v.literal("rejete")
    ),
    etapeActuelle: v.number(),
    // Key dates
    dateSoumission: v.optional(v.number()),
    dateRecevabilite: v.optional(v.number()),
    dateExamenSgg: v.optional(v.number()),
    dateTransmissionSgpr: v.optional(v.number()),
    dateConseilMinistres: v.optional(v.string()),
    dateSignature: v.optional(v.string()),
    datePublicationJo: v.optional(v.string()),
    datePriseFonction: v.optional(v.string()),
    // CM
    cmReference: v.optional(v.string()),
    cmPointOrdre: v.optional(v.number()),
    // SGG evaluation
    scoreAdequation: v.optional(v.number()),
    avisSgg: v.optional(v.string()),
    recommandationSgg: v.optional(v.string()),
    agentTraitantId: v.optional(v.id("users")),
    // Motifs
    motifProposition: v.optional(v.string()),
    motifRejet: v.optional(v.string()),
    observations: v.optional(v.string()),
    // Acte
    acteNumero: v.optional(v.string()),
    acteDate: v.optional(v.string()),
    acteSignataire: v.optional(v.string()),
    acteUrl: v.optional(v.string()),
    // Metadata
    delaiTraitement: v.optional(v.number()),
    isUrgent: v.boolean(),
    metadata: v.optional(v.any()),
    createdBy: v.optional(v.id("users")),
    updatedBy: v.optional(v.id("users")),
  })
    .index("by_reference", ["reference"])
    .index("by_candidat", ["candidatId"])
    .index("by_poste", ["posteId"])
    .index("by_statut", ["statut"])
    .index("by_ministere", ["ministereProposantId"]),

  nominationsDocuments: defineTable({
    dossierId: v.id("nominationsDossiers"),
    type: v.string(),
    nomFichier: v.string(),
    fichierUrl: v.string(),
    tailleOctets: v.optional(v.number()),
    mimeType: v.optional(v.string()),
    isObligatoire: v.boolean(),
    isVerifie: v.boolean(),
    verifiePar: v.optional(v.id("users")),
    dateVerification: v.optional(v.number()),
    observations: v.optional(v.string()),
    uploadedBy: v.optional(v.id("users")),
  }).index("by_dossier", ["dossierId"]),

  nominationsHistorique: defineTable({
    dossierId: v.id("nominationsDossiers"),
    action: v.string(),
    ancienStatut: v.optional(v.string()),
    nouveauStatut: v.optional(v.string()),
    commentaire: v.optional(v.string()),
    acteurId: v.id("users"),
    acteurRole: v.optional(v.string()),
    acteurNom: v.optional(v.string()),
    metadata: v.optional(v.any()),
  }).index("by_dossier", ["dossierId"]),

  // ══════════════════════════════════════════════════════════════════════════
  // LEGISLATIF - Cycle Législatif en 8 Étapes
  // ══════════════════════════════════════════════════════════════════════════

  legislatifTextes: defineTable({
    reference: v.string(),
    titre: v.string(),
    titreCourt: v.optional(v.string()),
    type: v.union(
      v.literal("loi_organique"),
      v.literal("loi_ordinaire"),
      v.literal("ordonnance"),
      v.literal("decret"),
      v.literal("arrete"),
      v.literal("decision"),
      v.literal("circulaire"),
      v.literal("instruction")
    ),
    ministereOrigineId: v.id("institutions"),
    statut: v.union(
      v.literal("redaction"),
      v.literal("soumis"),
      v.literal("examen_sgg"),
      v.literal("validation_sgg"),
      v.literal("transmission_ce"),
      v.literal("examen_ce"),
      v.literal("avis_ce_recu"),
      v.literal("inscription_cm"),
      v.literal("adopte_cm"),
      v.literal("depot_an"),
      v.literal("commission_an"),
      v.literal("vote_an"),
      v.literal("depot_senat"),
      v.literal("commission_senat"),
      v.literal("vote_senat"),
      v.literal("cmp"),
      v.literal("vote_definitif"),
      v.literal("saisine_cc"),
      v.literal("examen_cc"),
      v.literal("decision_cc"),
      v.literal("transmission_presidence"),
      v.literal("signature_promulgation"),
      v.literal("transmission_jo"),
      v.literal("publie_jo"),
      v.literal("rejete"),
      v.literal("retire"),
      v.literal("caduc")
    ),
    etapeActuelle: v.number(),
    // Characteristics
    isUrgence: v.boolean(),
    isLoiFinances: v.boolean(),
    isLoiReglement: v.boolean(),
    sessionParlementaire: v.optional(v.string()),
    legislature: v.optional(v.string()),
    // Dates (8 steps)
    dateDepot: v.optional(v.number()),
    dateReceptionSgg: v.optional(v.number()),
    dateExamenSgg: v.optional(v.number()),
    dateValidationSgg: v.optional(v.number()),
    dateSaisineCe: v.optional(v.number()),
    dateAvisCe: v.optional(v.number()),
    dateInscriptionCm: v.optional(v.number()),
    dateAdoptionCm: v.optional(v.number()),
    cmReference: v.optional(v.string()),
    dateDepotAn: v.optional(v.number()),
    dateVoteAn: v.optional(v.number()),
    dateDepotSenat: v.optional(v.number()),
    dateVoteSenat: v.optional(v.number()),
    dateVoteDefinitif: v.optional(v.number()),
    dateSaisineCc: v.optional(v.number()),
    dateDecisionCc: v.optional(v.number()),
    dateTransmissionPresidence: v.optional(v.number()),
    datePromulgation: v.optional(v.number()),
    dateTransmissionJo: v.optional(v.number()),
    datePublicationJo: v.optional(v.number()),
    numeroJo: v.optional(v.string()),
    // Delays
    delaiRestant: v.optional(v.number()),
    delaiAlerte: v.optional(v.number()),
    // Content
    objet: v.optional(v.string()),
    exposeMotifs: v.optional(v.string()),
    resume: v.optional(v.string()),
    // Files
    fichierProjetUrl: v.optional(v.string()),
    fichierExposeUrl: v.optional(v.string()),
    fichierEtudeImpactUrl: v.optional(v.string()),
    // Metadata
    motsCles: v.optional(v.array(v.string())),
    observations: v.optional(v.string()),
    metadata: v.optional(v.any()),
    createdBy: v.optional(v.id("users")),
    updatedBy: v.optional(v.id("users")),
  })
    .index("by_reference", ["reference"])
    .index("by_type", ["type"])
    .index("by_statut", ["statut"])
    .index("by_ministere", ["ministereOrigineId"])
    .index("by_etape", ["etapeActuelle"]),

  legislatifVersions: defineTable({
    texteId: v.id("legislatifTextes"),
    numeroVersion: v.number(),
    titre: v.optional(v.string()),
    contenu: v.optional(v.string()),
    fichierUrl: v.optional(v.string()),
    motifModification: v.optional(v.string()),
    etapeCreation: v.optional(v.string()),
    createdBy: v.optional(v.id("users")),
  }).index("by_texte", ["texteId"]),

  legislatifAvis: defineTable({
    texteId: v.id("legislatifTextes"),
    institutionId: v.id("institutions"),
    typeAvis: v.string(),
    nature: v.union(
      v.literal("favorable"),
      v.literal("favorable_reserves"),
      v.literal("defavorable"),
      v.literal("conforme"),
      v.literal("non_conforme"),
      v.literal("irrecevable")
    ),
    numeroAvis: v.optional(v.string()),
    dateSaisine: v.optional(v.number()),
    dateReponse: v.optional(v.number()),
    delaiJours: v.optional(v.number()),
    resume: v.optional(v.string()),
    recommandations: v.optional(v.string()),
    reserves: v.optional(v.string()),
    fichierUrl: v.optional(v.string()),
  })
    .index("by_texte", ["texteId"])
    .index("by_institution", ["institutionId"]),

  legislatifHistorique: defineTable({
    texteId: v.id("legislatifTextes"),
    etape: v.number(),
    action: v.string(),
    ancienStatut: v.optional(v.string()),
    nouveauStatut: v.optional(v.string()),
    institutionId: v.optional(v.id("institutions")),
    commentaire: v.optional(v.string()),
    acteurId: v.id("users"),
    acteurNom: v.optional(v.string()),
    metadata: v.optional(v.any()),
  }).index("by_texte", ["texteId"]),

  legislatifAmendements: defineTable({
    texteId: v.id("legislatifTextes"),
    numero: v.string(),
    articleVise: v.optional(v.string()),
    auteurType: v.optional(v.string()),
    auteurNom: v.optional(v.string()),
    objet: v.optional(v.string()),
    dispositif: v.optional(v.string()),
    exposeSommaire: v.optional(v.string()),
    statut: v.optional(v.string()),
    dateDepot: v.optional(v.number()),
    dateExamen: v.optional(v.number()),
  }).index("by_texte", ["texteId"]),

  // ══════════════════════════════════════════════════════════════════════════
  // EGOP - e-GOP (Conseils, Réunions, Courrier)
  // ══════════════════════════════════════════════════════════════════════════

  egopConseils: defineTable({
    reference: v.string(),
    type: v.string(),
    titre: v.string(),
    objet: v.optional(v.string()),
    // Planning
    dateConseil: v.string(),
    heureDebut: v.optional(v.string()),
    heureFin: v.optional(v.string()),
    dureePrevue: v.optional(v.number()),
    lieu: v.optional(v.string()),
    // Presidency
    presidentInstitutionId: v.optional(v.id("institutions")),
    presidentNom: v.optional(v.string()),
    presidentFonction: v.optional(v.string()),
    secretaireId: v.optional(v.id("users")),
    // Status
    statut: v.union(
      v.literal("planifiee"),
      v.literal("convocations_envoyees"),
      v.literal("confirmee"),
      v.literal("en_cours"),
      v.literal("terminee"),
      v.literal("compte_rendu_redige"),
      v.literal("decisions_publiees"),
      v.literal("reportee"),
      v.literal("annulee")
    ),
    // Participants
    nbInstitutionsConvoquees: v.number(),
    nbInstitutionsConfirmees: v.number(),
    nbPresents: v.number(),
    // Documents
    ordreDuJour: v.optional(v.string()),
    ordreDuJourUrl: v.optional(v.string()),
    dossierPreparatoireUrl: v.optional(v.string()),
    compteRendu: v.optional(v.string()),
    compteRenduUrl: v.optional(v.string()),
    releveDecisions: v.optional(v.string()),
    releveDecisionsUrl: v.optional(v.string()),
    // Decisions
    nbDossiersExamines: v.number(),
    nbDecisionsPrises: v.number(),
    metadata: v.optional(v.any()),
    createdBy: v.optional(v.id("users")),
  })
    .index("by_date", ["dateConseil"])
    .index("by_statut", ["statut"]),

  egopConseilParticipants: defineTable({
    conseilId: v.id("egopConseils"),
    institutionId: v.id("institutions"),
    representantPrevuNom: v.optional(v.string()),
    representantPrevuFonction: v.optional(v.string()),
    statut: v.optional(v.string()),
    representantEffectifNom: v.optional(v.string()),
    representantEffectifFonction: v.optional(v.string()),
    heureArrivee: v.optional(v.string()),
    heureDepart: v.optional(v.string()),
    observations: v.optional(v.string()),
  })
    .index("by_conseil", ["conseilId"])
    .index("by_institution", ["institutionId"]),

  egopConseilDossiers: defineTable({
    conseilId: v.id("egopConseils"),
    ordre: v.number(),
    titre: v.string(),
    resume: v.optional(v.string()),
    ministereRapporteurId: v.optional(v.id("institutions")),
    rapporteurNom: v.optional(v.string()),
    notePresentationUrl: v.optional(v.string()),
    projetTexteUrl: v.optional(v.string()),
    autresDocuments: v.optional(v.any()),
    dureeExamen: v.optional(v.number()),
    decision: v.optional(v.string()),
    suiteADonner: v.optional(v.string()),
    responsableSuivi: v.optional(v.string()),
    delaiSuivi: v.optional(v.string()),
    isAdopte: v.optional(v.boolean()),
    observations: v.optional(v.string()),
  }).index("by_conseil", ["conseilId"]),

  egopReunions: defineTable({
    reference: v.string(),
    objet: v.string(),
    type: v.optional(v.string()),
    dateReunion: v.string(),
    heureDebut: v.optional(v.string()),
    heureFin: v.optional(v.string()),
    lieu: v.optional(v.string()),
    isVisioconference: v.boolean(),
    lienVisio: v.optional(v.string()),
    convocateurInstitutionId: v.optional(v.id("institutions")),
    convocateurNom: v.optional(v.string()),
    statut: v.union(
      v.literal("planifiee"),
      v.literal("convocations_envoyees"),
      v.literal("confirmee"),
      v.literal("en_cours"),
      v.literal("terminee"),
      v.literal("compte_rendu_redige"),
      v.literal("decisions_publiees"),
      v.literal("reportee"),
      v.literal("annulee")
    ),
    ordreDuJour: v.optional(v.string()),
    compteRendu: v.optional(v.string()),
    compteRenduUrl: v.optional(v.string()),
    decisions: v.optional(v.string()),
    actionsASuivre: v.optional(v.any()),
    metadata: v.optional(v.any()),
    createdBy: v.optional(v.id("users")),
  })
    .index("by_date", ["dateReunion"])
    .index("by_statut", ["statut"]),

  egopReunionParticipants: defineTable({
    reunionId: v.id("egopReunions"),
    institutionId: v.id("institutions"),
    statut: v.optional(v.string()),
    representantNom: v.optional(v.string()),
  }).index("by_reunion", ["reunionId"]),

  egopCourriers: defineTable({
    reference: v.string(),
    type: v.union(
      v.literal("entrant"),
      v.literal("sortant"),
      v.literal("interne")
    ),
    objet: v.string(),
    contenu: v.optional(v.string()),
    // Sender
    expediteurInstitutionId: v.optional(v.id("institutions")),
    expediteurNom: v.optional(v.string()),
    expediteurFonction: v.optional(v.string()),
    expediteurEmail: v.optional(v.string()),
    // Recipient
    destinataireInstitutionId: v.optional(v.id("institutions")),
    destinataireNom: v.optional(v.string()),
    destinataireFonction: v.optional(v.string()),
    destinataireEmail: v.optional(v.string()),
    // Copies
    copies: v.optional(v.any()),
    // Dates
    dateCourrier: v.optional(v.string()),
    dateReception: v.optional(v.number()),
    dateTraitement: v.optional(v.number()),
    dateReponse: v.optional(v.number()),
    delaiReponse: v.optional(v.number()),
    // Status
    priorite: v.union(
      v.literal("basse"),
      v.literal("normale"),
      v.literal("haute"),
      v.literal("urgente"),
      v.literal("tres_urgente")
    ),
    statut: v.union(
      v.literal("recu"),
      v.literal("enregistre"),
      v.literal("en_traitement"),
      v.literal("traite"),
      v.literal("repondu"),
      v.literal("classe"),
      v.literal("archive")
    ),
    // Assignment
    affecteAId: v.optional(v.id("users")),
    affecteANom: v.optional(v.string()),
    traiteParId: v.optional(v.id("users")),
    // Files
    fichierPrincipalUrl: v.optional(v.string()),
    piecesJointes: v.optional(v.any()),
    // Reply chain
    courrierParentId: v.optional(v.id("egopCourriers")),
    courrierReponseId: v.optional(v.id("egopCourriers")),
    // Classification
    confidentiel: v.boolean(),
    motsCles: v.optional(v.array(v.string())),
    observations: v.optional(v.string()),
    metadata: v.optional(v.any()),
    createdBy: v.optional(v.id("users")),
  })
    .index("by_reference", ["reference"])
    .index("by_type", ["type"])
    .index("by_statut", ["statut"])
    .index("by_priorite", ["priorite"]),

  egopCourrierHistorique: defineTable({
    courrierId: v.id("egopCourriers"),
    action: v.string(),
    ancienStatut: v.optional(v.string()),
    nouveauStatut: v.optional(v.string()),
    commentaire: v.optional(v.string()),
    acteurId: v.optional(v.id("users")),
    acteurNom: v.optional(v.string()),
  }).index("by_courrier", ["courrierId"]),

  // ══════════════════════════════════════════════════════════════════════════
  // JO - Journal Officiel Open Data
  // ══════════════════════════════════════════════════════════════════════════

  joNumeros: defineTable({
    numero: v.string(),
    annee: v.number(),
    numeroOrdre: v.number(),
    type: v.optional(v.string()),
    titre: v.optional(v.string()),
    datePublication: v.string(),
    dateParutionEffective: v.optional(v.string()),
    fichierUrl: v.optional(v.string()),
    nbPages: v.optional(v.number()),
    tailleMo: v.optional(v.number()),
    nbTextes: v.number(),
    nbVues: v.number(),
    nbTelechargements: v.number(),
    isPublie: v.boolean(),
    publiePar: v.optional(v.id("users")),
    metadata: v.optional(v.any()),
  })
    .index("by_date", ["datePublication"])
    .index("by_annee", ["annee"]),

  joTextes: defineTable({
    numeroJoId: v.id("joNumeros"),
    numero: v.string(),
    type: v.union(
      v.literal("loi"),
      v.literal("loi_organique"),
      v.literal("ordonnance"),
      v.literal("decret"),
      v.literal("arrete"),
      v.literal("decision"),
      v.literal("circulaire"),
      v.literal("avis"),
      v.literal("communique"),
      v.literal("annonce"),
      v.literal("rectificatif")
    ),
    titre: v.string(),
    titreCourt: v.optional(v.string()),
    // Signatory
    signataire: v.string(),
    signataireFonction: v.optional(v.string()),
    coSignataires: v.optional(v.any()),
    // Institution
    institutionOrigineId: v.optional(v.id("institutions")),
    ministere: v.optional(v.string()),
    // Dates
    dateSignature: v.string(),
    datePublication: v.string(),
    dateEntreeVigueur: v.optional(v.string()),
    // Pagination
    pageDebut: v.optional(v.number()),
    pageFin: v.optional(v.number()),
    // Content
    visa: v.optional(v.string()),
    considerants: v.optional(v.string()),
    dispositif: v.optional(v.string()),
    resume: v.optional(v.string()),
    fichierUrl: v.optional(v.string()),
    // Consolidation
    statut: v.union(
      v.literal("en_preparation"),
      v.literal("valide"),
      v.literal("publie"),
      v.literal("rectifie"),
      v.literal("abroge")
    ),
    isConsolide: v.boolean(),
    texteConsolideUrl: v.optional(v.string()),
    // Relations
    modifie: v.optional(v.any()),
    modifiePar: v.optional(v.any()),
    abroge: v.optional(v.any()),
    abrogePar: v.optional(v.id("joTextes")),
    texteLegislatifId: v.optional(v.id("legislatifTextes")),
    // Search
    motsCles: v.optional(v.array(v.string())),
    // Stats
    nbVues: v.number(),
    nbTelechargements: v.number(),
    metadata: v.optional(v.any()),
    createdBy: v.optional(v.id("users")),
  })
    .index("by_numero_jo", ["numeroJoId"])
    .index("by_type", ["type"])
    .index("by_date", ["datePublication"])
    .index("by_statut", ["statut"]),

  joArticles: defineTable({
    texteId: v.id("joTextes"),
    numero: v.string(),
    titre: v.optional(v.string()),
    contenu: v.string(),
    ordre: v.number(),
    isModifie: v.boolean(),
    isAbroge: v.boolean(),
  }).index("by_texte", ["texteId"]),

  joAnnexes: defineTable({
    texteId: v.id("joTextes"),
    numero: v.optional(v.string()),
    titre: v.optional(v.string()),
    description: v.optional(v.string()),
    fichierUrl: v.string(),
    ordre: v.number(),
  }).index("by_texte", ["texteId"]),

  joAbonnements: defineTable({
    email: v.string(),
    nom: v.optional(v.string()),
    typesTextes: v.optional(v.array(v.string())),
    motsCles: v.optional(v.array(v.string())),
    frequence: v.optional(v.string()),
    isActive: v.boolean(),
    tokenDesinscription: v.optional(v.string()),
  })
    .index("by_email", ["email"])
    .index("by_active", ["isActive"]),

  joStatistiques: defineTable({
    texteId: v.optional(v.id("joTextes")),
    numeroJoId: v.optional(v.id("joNumeros")),
    action: v.string(),
    sessionId: v.optional(v.string()),
    ipHash: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    referrer: v.optional(v.string()),
  })
    .index("by_texte", ["texteId"])
    .index("by_numero", ["numeroJoId"]),

  // ══════════════════════════════════════════════════════════════════════════
  // PTM - Programme de Travail du Ministère
  // ══════════════════════════════════════════════════════════════════════════

  ptmInitiatives: defineTable({
    ministereId: v.id("institutions"),
    annee: v.number(),
    rubrique: v.union(
      v.literal("projet_texte_legislatif"),
      v.literal("politique_generale"),
      v.literal("missions_conferences")
    ),
    numero: v.number(),
    intitule: v.string(),
    cadrage: v.union(
      v.literal("sept_priorites"),
      v.literal("pag"),
      v.literal("pncd"),
      v.literal("pap")
    ),
    cadrageDetail: v.optional(v.string()),
    incidenceFinanciere: v.boolean(),
    loiFinance: v.boolean(),
    servicesPorteurs: v.optional(v.array(v.id("institutions"))),
    dateTransmissionSgg: v.optional(v.number()),
    observations: v.optional(v.string()),
    programmePagId: v.optional(v.id("garPrioritesPag")),
    // Workflow
    statut: v.union(
      v.literal("brouillon"),
      v.literal("soumis_sgg"),
      v.literal("valide_sgg"),
      v.literal("inscrit_ptg"),
      v.literal("rejete")
    ),
    soumisPar: v.optional(v.id("users")),
    dateSoumission: v.optional(v.number()),
    valideSggPar: v.optional(v.id("users")),
    dateValidationSgg: v.optional(v.number()),
    commentaireSgg: v.optional(v.string()),
    inscritPtgPar: v.optional(v.id("users")),
    dateInscriptionPtg: v.optional(v.number()),
    motifRejet: v.optional(v.string()),
    rapportMensuelId: v.optional(v.id("garRapports")),
    createdBy: v.optional(v.id("users")),
    updatedBy: v.optional(v.id("users")),
  })
    .index("by_ministere", ["ministereId"])
    .index("by_annee", ["annee"])
    .index("by_statut", ["statut"])
    .index("by_rubrique", ["rubrique"]),

  ptmHistorique: defineTable({
    initiativeId: v.id("ptmInitiatives"),
    action: v.string(),
    ancienStatut: v.optional(v.string()),
    nouveauStatut: v.optional(v.string()),
    commentaire: v.optional(v.string()),
    acteurId: v.id("users"),
    acteurNom: v.optional(v.string()),
  }).index("by_initiative", ["initiativeId"]),
});
