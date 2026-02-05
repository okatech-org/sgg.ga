/**
 * SGG Digital - Types TypeScript
 * Correspondant au schema PostgreSQL avec 7 schemas
 */

// =============================================================================
// TYPES DE BASE
// =============================================================================

export type UUID = string;
export type Timestamp = string;
export type Json = Record<string, unknown>;

// =============================================================================
// SCHEMA: AUTH - Authentification et RBAC (12 roles)
// =============================================================================

export type AppRole =
  | 'admin_sgg'
  | 'directeur_sgg'
  | 'sg_ministere'
  | 'sgpr'
  | 'premier_ministre'
  | 'ministre'
  | 'assemblee'
  | 'senat'
  | 'conseil_etat'
  | 'cour_constitutionnelle'
  | 'dgjo'
  | 'citoyen';

export type PermissionType = 'read' | 'write' | 'approve' | 'reject' | 'publish' | 'admin';

export type Module = 'gar' | 'nominations' | 'legislatif' | 'egop' | 'jo';

export interface User {
  id: UUID;
  email: string;
  full_name: string;
  phone?: string;
  avatar_url?: string;
  is_active: boolean;
  is_verified: boolean;
  totp_enabled: boolean;
  last_login?: Timestamp;
  login_count: number;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface UserRole {
  id: UUID;
  user_id: UUID;
  role: AppRole;
  institution_id?: UUID;
  is_primary: boolean;
  granted_by?: UUID;
  granted_at: Timestamp;
  expires_at?: Timestamp;
  created_at: Timestamp;
}

export interface RolePermission {
  id: UUID;
  role: AppRole;
  module: Module;
  permission: PermissionType;
  conditions: Json;
  created_at: Timestamp;
}

export interface Session {
  id: UUID;
  user_id: UUID;
  token: string;
  refresh_token?: string;
  ip_address?: string;
  user_agent?: string;
  device_fingerprint?: string;
  expires_at: Timestamp;
  created_at: Timestamp;
}

export interface AuditLog {
  id: UUID;
  user_id?: UUID;
  action: string;
  module: string;
  table_name: string;
  record_id?: UUID;
  old_values?: Json;
  new_values?: Json;
  ip_address?: string;
  user_agent?: string;
  created_at: Timestamp;
}

// =============================================================================
// SCHEMA: INSTITUTIONS - Cartographie Institutionnelle
// =============================================================================

export type InstitutionType =
  | 'presidence'
  | 'primature'
  | 'ministere'
  | 'secretariat_general'
  | 'direction_generale'
  | 'direction'
  | 'service'
  | 'assemblee'
  | 'senat'
  | 'juridiction'
  | 'autorite_independante'
  | 'etablissement_public'
  | 'collectivite';

export type NiveauDigitalisation =
  | 'niveau_0'
  | 'niveau_1'
  | 'niveau_2'
  | 'niveau_3'
  | 'niveau_4';

export interface Institution {
  id: UUID;
  code: string;
  nom: string;
  nom_court?: string;
  sigle?: string;
  type: InstitutionType;
  parent_id?: UUID;
  ordre_protocole?: number;
  adresse?: string;
  ville: string;
  telephone?: string;
  email?: string;
  site_web?: string;
  logo_url?: string;
  responsable_nom?: string;
  responsable_fonction?: string;
  date_nomination?: string;
  niveau_digitalisation: NiveauDigitalisation;
  date_connexion_sgg?: string;
  nb_agents: number;
  budget_annuel?: number;
  is_active: boolean;
  metadata: Json;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface InstitutionInteraction {
  id: UUID;
  institution_source_id: UUID;
  institution_cible_id: UUID;
  type_interaction: string;
  description?: string;
  frequence?: string;
  flux_documents: Json[];
  is_active: boolean;
  created_at: Timestamp;
  updated_at: Timestamp;
}

// =============================================================================
// SCHEMA: GAR - Gestion Axee sur les Resultats (PAG 2026)
// =============================================================================

export type PrioritePresidentielle =
  | 'sante'
  | 'education'
  | 'infrastructure'
  | 'agriculture'
  | 'numerique'
  | 'emploi'
  | 'environnement'
  | 'gouvernance';

export type ObjectifStatus =
  | 'planifie'
  | 'en_cours'
  | 'en_retard'
  | 'atteint'
  | 'partiellement_atteint'
  | 'abandonne';

export type RapportStatus =
  | 'attendu'
  | 'en_retard'
  | 'soumis'
  | 'en_revision'
  | 'valide'
  | 'rejete';

export interface PrioritePAG {
  id: UUID;
  code: string;
  priorite: PrioritePresidentielle;
  titre: string;
  description?: string;
  budget_alloue: number;
  budget_consomme: number;
  taux_consommation: number;
  nb_objectifs_total: number;
  nb_objectifs_atteints: number;
  taux_realisation: number;
  icone?: string;
  couleur?: string;
  ordre: number;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface GARObjectif {
  id: UUID;
  code: string;
  priorite_id: UUID;
  ministere_id: UUID;
  titre: string;
  description?: string;
  annee: number;
  trimestre?: number;
  // Indicateurs (21 colonnes)
  indicateur_cle?: string;
  unite_mesure?: string;
  valeur_reference?: number;
  valeur_cible?: number;
  valeur_t1?: number;
  valeur_t2?: number;
  valeur_t3?: number;
  valeur_t4?: number;
  valeur_realisee?: number;
  taux_execution: number;
  // Budget
  budget_prevu: number;
  budget_engage: number;
  budget_decaisse: number;
  // Statut
  statut: ObjectifStatus;
  date_debut?: string;
  date_echeance?: string;
  date_achevement?: string;
  // Responsables
  responsable_nom?: string;
  responsable_email?: string;
  // Hierarchie
  parent_id?: UUID;
  niveau: number;
  observations?: string;
  metadata: Json;
  created_by?: UUID;
  updated_by?: UUID;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface GARIndicateur {
  id: UUID;
  objectif_id: UUID;
  code: string;
  libelle: string;
  description?: string;
  type_indicateur?: string;
  unite?: string;
  source_donnees?: string;
  frequence_collecte?: string;
  valeur_baseline?: number;
  valeur_cible?: number;
  valeur_actuelle?: number;
  date_derniere_maj?: Timestamp;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface MatriceGAREntry {
  priorite: PrioritePresidentielle;
  objectif_code: string;
  indicateur: string;
  unite: string;
  cible_annuelle: number;
  realisation_mois: number;
  cumul_annuel: number;
  ecart: number;
  taux_realisation: number;
  budget_alloue: number;
  budget_consomme: number;
  observations?: string;
}

export interface GARRapport {
  id: UUID;
  ministere_id: UUID;
  annee: number;
  mois: number;
  donnees_matrice: MatriceGAREntry[];
  nb_objectifs_suivis: number;
  nb_objectifs_atteints: number;
  nb_objectifs_en_retard: number;
  taux_global_realisation: number;
  synthese?: string;
  difficultes?: string;
  perspectives?: string;
  recommandations?: string;
  fichier_url?: string;
  fichier_excel_url?: string;
  statut: RapportStatus;
  date_limite?: string;
  date_soumission?: Timestamp;
  date_validation?: Timestamp;
  soumis_par?: UUID;
  valide_par?: UUID;
  observations_validation?: string;
  created_at: Timestamp;
  updated_at: Timestamp;
}

// Vue Dashboard GAR
export interface GARDashboardItem {
  priorite_id: UUID;
  priorite: PrioritePresidentielle;
  priorite_titre: string;
  budget_alloue: number;
  budget_consomme: number;
  taux_consommation: number;
  nb_objectifs: number;
  objectifs_atteints: number;
  objectifs_en_retard: number;
  objectifs_en_cours: number;
  taux_execution_moyen: number;
}

// =============================================================================
// SCHEMA: NOMINATIONS - Workflow des Nominations
// =============================================================================

export type NominationStatus =
  | 'brouillon'
  | 'soumis'
  | 'recevabilite'
  | 'examen_sgg'
  | 'avis_favorable'
  | 'avis_defavorable'
  | 'transmis_sgpr'
  | 'arbitrage_pm'
  | 'conseil_ministres'
  | 'valide_cm'
  | 'signature'
  | 'signe'
  | 'publie_jo'
  | 'rejete';

export type TypeNomination =
  | 'premiere_nomination'
  | 'mutation'
  | 'promotion'
  | 'detachement'
  | 'mise_disposition'
  | 'reintegration'
  | 'fin_fonction';

export type CategorieEmploi = 'A1' | 'A2' | 'A3' | 'B1' | 'B2' | 'C';

export interface Poste {
  id: UUID;
  code: string;
  titre: string;
  institution_id: UUID;
  direction?: string;
  categorie: CategorieEmploi;
  grade?: string;
  echelon?: number;
  diplome_minimum?: string;
  experience_minimum?: number;
  competences_requises: Json[];
  indice_debut?: number;
  indice_fin?: number;
  is_vacant: boolean;
  titulaire_actuel_id?: UUID;
  date_vacance?: string;
  description?: string;
  is_active: boolean;
  metadata: Json;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface Candidat {
  id: UUID;
  matricule?: string;
  civilite?: string;
  nom: string;
  prenom: string;
  nom_jeune_fille?: string;
  date_naissance: string;
  lieu_naissance?: string;
  nationalite: string;
  sexe?: 'M' | 'F';
  email?: string;
  telephone?: string;
  telephone_secondaire?: string;
  adresse?: string;
  corps?: string;
  grade_actuel?: string;
  echelon_actuel?: number;
  institution_actuelle_id?: UUID;
  poste_actuel?: string;
  date_entree_fonction_publique?: string;
  diplome_plus_eleve?: string;
  etablissement_diplome?: string;
  annee_diplome?: number;
  autres_diplomes: Json[];
  photo_url?: string;
  cv_url?: string;
  casier_judiciaire_verifie: boolean;
  date_verification_casier?: string;
  created_by?: UUID;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface NominationDossier {
  id: UUID;
  reference: string;
  candidat_id: UUID;
  poste_id: UUID;
  ministere_proposant_id: UUID;
  type: TypeNomination;
  statut: NominationStatus;
  etape_actuelle: number;
  // Dates cles
  date_soumission?: Timestamp;
  date_recevabilite?: Timestamp;
  date_examen_sgg?: Timestamp;
  date_transmission_sgpr?: Timestamp;
  date_conseil_ministres?: string;
  date_signature?: string;
  date_publication_jo?: string;
  date_prise_fonction?: string;
  // Conseil des Ministres
  cm_reference?: string;
  cm_point_ordre?: number;
  // Evaluation SGG
  score_adequation?: number;
  avis_sgg?: string;
  recommandation_sgg?: string;
  agent_traitant_id?: UUID;
  // Motifs
  motif_proposition?: string;
  motif_rejet?: string;
  observations?: string;
  // Acte
  acte_numero?: string;
  acte_date?: string;
  acte_signataire?: string;
  acte_url?: string;
  // Metadata
  delai_traitement?: number;
  is_urgent: boolean;
  metadata: Json;
  created_by?: UUID;
  updated_by?: UUID;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface NominationDocument {
  id: UUID;
  dossier_id: UUID;
  type: string;
  nom_fichier: string;
  fichier_url: string;
  taille_octets?: number;
  mime_type?: string;
  is_obligatoire: boolean;
  is_verifie: boolean;
  verifie_par?: UUID;
  date_verification?: Timestamp;
  observations?: string;
  uploaded_by?: UUID;
  created_at: Timestamp;
}

export interface NominationHistorique {
  id: UUID;
  dossier_id: UUID;
  action: string;
  ancien_statut?: NominationStatus;
  nouveau_statut?: NominationStatus;
  commentaire?: string;
  acteur_id: UUID;
  acteur_role?: AppRole;
  acteur_nom?: string;
  metadata: Json;
  created_at: Timestamp;
}

// Vue avec details
export interface NominationDossierDetails extends NominationDossier {
  candidat_nom: string;
  candidat_prenom: string;
  candidat_matricule?: string;
  candidat_grade?: string;
  poste_titre: string;
  poste_categorie: CategorieEmploi;
}

// =============================================================================
// SCHEMA: LEGISLATIF - Cycle Legislatif en 8 Etapes
// =============================================================================

export type TexteType =
  | 'loi_organique'
  | 'loi_ordinaire'
  | 'ordonnance'
  | 'decret'
  | 'arrete'
  | 'decision'
  | 'circulaire'
  | 'instruction';

export type TexteStatus =
  // Etape 1: Soumission
  | 'redaction'
  | 'soumis'
  // Etape 2: Examen SGG
  | 'examen_sgg'
  | 'validation_sgg'
  // Etape 3: Conseil d'Etat
  | 'transmission_ce'
  | 'examen_ce'
  | 'avis_ce_recu'
  // Etape 4: Conseil des Ministres
  | 'inscription_cm'
  | 'adopte_cm'
  // Etape 5: Parlement
  | 'depot_an'
  | 'commission_an'
  | 'vote_an'
  | 'depot_senat'
  | 'commission_senat'
  | 'vote_senat'
  | 'cmp'
  | 'vote_definitif'
  // Etape 6: Cour Constitutionnelle
  | 'saisine_cc'
  | 'examen_cc'
  | 'decision_cc'
  // Etape 7: Promulgation
  | 'transmission_presidence'
  | 'signature_promulgation'
  // Etape 8: Publication JO
  | 'transmission_jo'
  | 'publie_jo'
  // Autres
  | 'rejete'
  | 'retire'
  | 'caduc';

export type NatureAvis =
  | 'favorable'
  | 'favorable_reserves'
  | 'defavorable'
  | 'conforme'
  | 'non_conforme'
  | 'irrecevable';

export interface TexteLegislatif {
  id: UUID;
  reference: string;
  titre: string;
  titre_court?: string;
  type: TexteType;
  ministere_origine_id: UUID;
  statut: TexteStatus;
  etape_actuelle: number;
  is_urgence: boolean;
  is_loi_finances: boolean;
  is_loi_reglement: boolean;
  session_parlementaire?: string;
  legislature?: string;
  // Dates du cycle (8 etapes)
  date_depot?: Timestamp;
  date_reception_sgg?: Timestamp;
  date_examen_sgg?: Timestamp;
  date_validation_sgg?: Timestamp;
  date_saisine_ce?: Timestamp;
  date_avis_ce?: Timestamp;
  date_inscription_cm?: Timestamp;
  date_adoption_cm?: Timestamp;
  cm_reference?: string;
  date_depot_an?: Timestamp;
  date_vote_an?: Timestamp;
  date_depot_senat?: Timestamp;
  date_vote_senat?: Timestamp;
  date_vote_definitif?: Timestamp;
  date_saisine_cc?: Timestamp;
  date_decision_cc?: Timestamp;
  date_transmission_presidence?: Timestamp;
  date_promulgation?: Timestamp;
  date_transmission_jo?: Timestamp;
  date_publication_jo?: Timestamp;
  numero_jo?: string;
  delai_restant?: number;
  delai_alerte: number;
  objet?: string;
  expose_motifs?: string;
  resume?: string;
  fichier_projet_url?: string;
  fichier_expose_url?: string;
  fichier_etude_impact_url?: string;
  mots_cles: string[];
  observations?: string;
  metadata: Json;
  created_by?: UUID;
  updated_by?: UUID;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface TexteVersion {
  id: UUID;
  texte_id: UUID;
  numero_version: number;
  titre?: string;
  contenu?: string;
  fichier_url?: string;
  motif_modification?: string;
  etape_creation?: TexteStatus;
  created_by?: UUID;
  created_at: Timestamp;
}

export interface TexteAvis {
  id: UUID;
  texte_id: UUID;
  institution_id: UUID;
  type_avis: string;
  nature: NatureAvis;
  numero_avis?: string;
  date_saisine?: Timestamp;
  date_reponse?: Timestamp;
  delai_jours?: number;
  resume?: string;
  recommandations?: string;
  reserves?: string;
  fichier_url?: string;
  created_at: Timestamp;
}

export interface TexteHistorique {
  id: UUID;
  texte_id: UUID;
  etape: number;
  action: string;
  ancien_statut?: TexteStatus;
  nouveau_statut?: TexteStatus;
  institution_id?: UUID;
  commentaire?: string;
  acteur_id: UUID;
  acteur_nom?: string;
  metadata: Json;
  created_at: Timestamp;
}

export interface Amendement {
  id: UUID;
  texte_id: UUID;
  numero: string;
  article_vise?: string;
  auteur_type?: string;
  auteur_nom?: string;
  objet?: string;
  dispositif?: string;
  expose_sommaire?: string;
  statut: string;
  date_depot?: Timestamp;
  date_examen?: Timestamp;
  created_at: Timestamp;
}

// Vue progression
export interface TexteProgression extends TexteLegislatif {
  pourcentage_progression: number;
  nom_etape: string;
}

// =============================================================================
// SCHEMA: EGOP - e-GOP (Conseils, Reunions, Courrier)
// =============================================================================

export type ReunionStatus =
  | 'planifiee'
  | 'convocations_envoyees'
  | 'confirmee'
  | 'en_cours'
  | 'terminee'
  | 'compte_rendu_redige'
  | 'decisions_publiees'
  | 'reportee'
  | 'annulee';

export type CourrierType = 'entrant' | 'sortant' | 'interne';

export type CourrierStatus =
  | 'recu'
  | 'enregistre'
  | 'en_traitement'
  | 'traite'
  | 'repondu'
  | 'classe'
  | 'archive';

export type Priorite = 'basse' | 'normale' | 'haute' | 'urgente' | 'tres_urgente';

export interface Conseil {
  id: UUID;
  reference: string;
  type: string;
  titre: string;
  objet?: string;
  date_conseil: string;
  heure_debut?: string;
  heure_fin?: string;
  duree_prevue?: number;
  lieu?: string;
  president_institution_id?: UUID;
  president_nom?: string;
  president_fonction?: string;
  secretaire_id?: UUID;
  statut: ReunionStatus;
  nb_institutions_convoquees: number;
  nb_institutions_confirmees: number;
  nb_presents: number;
  ordre_du_jour?: string;
  ordre_du_jour_url?: string;
  dossier_preparatoire_url?: string;
  compte_rendu?: string;
  compte_rendu_url?: string;
  releve_decisions?: string;
  releve_decisions_url?: string;
  nb_dossiers_examines: number;
  nb_decisions_prises: number;
  metadata: Json;
  created_by?: UUID;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface ConseilParticipant {
  id: UUID;
  conseil_id: UUID;
  institution_id: UUID;
  representant_prevu_nom?: string;
  representant_prevu_fonction?: string;
  statut: string;
  representant_effectif_nom?: string;
  representant_effectif_fonction?: string;
  heure_arrivee?: string;
  heure_depart?: string;
  observations?: string;
  created_at: Timestamp;
}

export interface ConseilDossier {
  id: UUID;
  conseil_id: UUID;
  ordre: number;
  titre: string;
  resume?: string;
  ministere_rapporteur_id?: UUID;
  rapporteur_nom?: string;
  note_presentation_url?: string;
  projet_texte_url?: string;
  autres_documents: Json[];
  duree_examen?: number;
  decision?: string;
  suite_a_donner?: string;
  responsable_suivi?: string;
  delai_suivi?: string;
  is_adopte?: boolean;
  observations?: string;
  created_at: Timestamp;
}

export interface Reunion {
  id: UUID;
  reference: string;
  objet: string;
  type?: string;
  date_reunion: string;
  heure_debut?: string;
  heure_fin?: string;
  lieu?: string;
  is_visioconference: boolean;
  lien_visio?: string;
  convocateur_institution_id?: UUID;
  convocateur_nom?: string;
  statut: ReunionStatus;
  ordre_du_jour?: string;
  compte_rendu?: string;
  compte_rendu_url?: string;
  decisions?: string;
  actions_a_suivre: ActionSuivi[];
  metadata: Json;
  created_by?: UUID;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface ActionSuivi {
  action: string;
  responsable: string;
  delai: string;
  statut: string;
}

export interface ReunionParticipant {
  id: UUID;
  reunion_id: UUID;
  institution_id: UUID;
  statut: string;
  representant_nom?: string;
  created_at: Timestamp;
}

export interface Courrier {
  id: UUID;
  reference: string;
  type: CourrierType;
  objet: string;
  contenu?: string;
  expediteur_institution_id?: UUID;
  expediteur_nom?: string;
  expediteur_fonction?: string;
  expediteur_email?: string;
  destinataire_institution_id?: UUID;
  destinataire_nom?: string;
  destinataire_fonction?: string;
  destinataire_email?: string;
  copies: CopieDestinataire[];
  date_courrier?: string;
  date_reception?: Timestamp;
  date_enregistrement: Timestamp;
  date_traitement?: Timestamp;
  date_reponse?: Timestamp;
  delai_reponse?: number;
  priorite: Priorite;
  statut: CourrierStatus;
  affecte_a_id?: UUID;
  affecte_a_nom?: string;
  traite_par_id?: UUID;
  fichier_principal_url?: string;
  pieces_jointes: PieceJointe[];
  courrier_parent_id?: UUID;
  courrier_reponse_id?: UUID;
  confidentiel: boolean;
  mots_cles: string[];
  observations?: string;
  metadata: Json;
  created_by?: UUID;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface CopieDestinataire {
  institution_id?: UUID;
  nom: string;
  email?: string;
}

export interface PieceJointe {
  nom: string;
  url: string;
  taille?: number;
  type?: string;
}

export interface CourrierHistorique {
  id: UUID;
  courrier_id: UUID;
  action: string;
  ancien_statut?: CourrierStatus;
  nouveau_statut?: CourrierStatus;
  commentaire?: string;
  acteur_id?: UUID;
  acteur_nom?: string;
  created_at: Timestamp;
}

// =============================================================================
// SCHEMA: JO - Journal Officiel Open Data
// =============================================================================

export type PublicationType =
  | 'loi'
  | 'loi_organique'
  | 'ordonnance'
  | 'decret'
  | 'arrete'
  | 'decision'
  | 'circulaire'
  | 'avis'
  | 'communique'
  | 'annonce'
  | 'rectificatif';

export type PublicationStatus =
  | 'en_preparation'
  | 'valide'
  | 'publie'
  | 'rectifie'
  | 'abroge';

export interface NumeroJO {
  id: UUID;
  numero: string;
  annee: number;
  numero_ordre: number;
  type: string;
  titre?: string;
  date_publication: string;
  date_parution_effective?: string;
  fichier_url?: string;
  nb_pages?: number;
  taille_mo?: number;
  nb_textes: number;
  nb_vues: number;
  nb_telechargements: number;
  is_publie: boolean;
  publie_par?: UUID;
  metadata: Json;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface TexteJO {
  id: UUID;
  numero_jo_id: UUID;
  numero: string;
  type: PublicationType;
  titre: string;
  titre_court?: string;
  signataire: string;
  signataire_fonction?: string;
  co_signataires: CoSignataire[];
  institution_origine_id?: UUID;
  ministere?: string;
  date_signature: string;
  date_publication: string;
  date_entree_vigueur?: string;
  page_debut?: number;
  page_fin?: number;
  visa?: string;
  considerants?: string;
  dispositif?: string;
  resume?: string;
  fichier_url?: string;
  statut: PublicationStatus;
  is_consolide: boolean;
  texte_consolide_url?: string;
  modifie: UUID[];
  modifie_par: UUID[];
  abroge: UUID[];
  abroge_par?: UUID;
  texte_legislatif_id?: UUID;
  mots_cles: string[];
  nb_vues: number;
  nb_telechargements: number;
  metadata: Json;
  created_by?: UUID;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface CoSignataire {
  nom: string;
  fonction: string;
}

export interface ArticleJO {
  id: UUID;
  texte_id: UUID;
  numero: string;
  titre?: string;
  contenu: string;
  ordre: number;
  is_modifie: boolean;
  is_abroge: boolean;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface AnnexeJO {
  id: UUID;
  texte_id: UUID;
  numero?: string;
  titre?: string;
  description?: string;
  fichier_url: string;
  ordre: number;
  created_at: Timestamp;
}

export interface AbonnementJO {
  id: UUID;
  email: string;
  nom?: string;
  types_textes: PublicationType[];
  mots_cles: string[];
  institutions: UUID[];
  frequence: string;
  is_active: boolean;
  token_desinscription: string;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface StatistiqueJO {
  id: UUID;
  texte_id?: UUID;
  numero_jo_id?: UUID;
  action: string;
  session_id?: string;
  ip_hash?: string;
  user_agent?: string;
  referrer?: string;
  created_at: Timestamp;
}

// Vues
export interface JOStatistiquesGlobales {
  mois: Timestamp;
  type: PublicationType;
  nb_textes: number;
  total_vues: number;
  total_telechargements: number;
}

export interface TexteJOPopulaire extends TexteJO {
  numero_jo: string;
  date_jo: string;
}

// =============================================================================
// TYPES UTILITAIRES
// =============================================================================

// Reponse API paginee
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Reponse API standard
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Configuration des etapes du cycle legislatif
export const ETAPES_CYCLE_LEGISLATIF = [
  { numero: 1, nom: 'Soumission', statuts: ['redaction', 'soumis'] },
  { numero: 2, nom: 'Examen SGG', statuts: ['examen_sgg', 'validation_sgg'] },
  { numero: 3, nom: "Conseil d'Etat", statuts: ['transmission_ce', 'examen_ce', 'avis_ce_recu'] },
  { numero: 4, nom: 'Conseil des Ministres', statuts: ['inscription_cm', 'adopte_cm'] },
  { numero: 5, nom: 'Parlement', statuts: ['depot_an', 'commission_an', 'vote_an', 'depot_senat', 'commission_senat', 'vote_senat', 'cmp', 'vote_definitif'] },
  { numero: 6, nom: 'Cour Constitutionnelle', statuts: ['saisine_cc', 'examen_cc', 'decision_cc'] },
  { numero: 7, nom: 'Promulgation', statuts: ['transmission_presidence', 'signature_promulgation'] },
  { numero: 8, nom: 'Publication JO', statuts: ['transmission_jo', 'publie_jo'] },
] as const;

// Labels des roles
export const ROLE_LABELS: Record<AppRole, string> = {
  admin_sgg: 'Administrateur SGG',
  directeur_sgg: 'Directeur SGG',
  sg_ministere: 'Secretaire General Ministere',
  sgpr: 'SGPR',
  premier_ministre: 'Premier Ministre',
  ministre: 'Ministre',
  assemblee: 'Assemblee Nationale',
  senat: 'Senat',
  conseil_etat: "Conseil d'Etat",
  cour_constitutionnelle: 'Cour Constitutionnelle',
  dgjo: 'Direction Journal Officiel',
  citoyen: 'Citoyen',
};

// Labels des priorites PAG
export const PRIORITE_LABELS: Record<PrioritePresidentielle, string> = {
  sante: 'Sante pour Tous',
  education: 'Education de Qualite',
  infrastructure: 'Infrastructures Modernes',
  agriculture: 'Securite Alimentaire',
  numerique: 'Transformation Numerique',
  emploi: 'Emploi des Jeunes',
  environnement: 'Developpement Durable',
  gouvernance: 'Bonne Gouvernance',
};

// Couleurs des priorites
export const PRIORITE_COLORS: Record<PrioritePresidentielle, string> = {
  sante: '#EF4444',
  education: '#3B82F6',
  infrastructure: '#8B5CF6',
  agriculture: '#22C55E',
  numerique: '#06B6D4',
  emploi: '#F59E0B',
  environnement: '#10B981',
  gouvernance: '#6366F1',
};

// Icones des priorites (Lucide React)
export const PRIORITE_ICONS: Record<PrioritePresidentielle, string> = {
  sante: 'Heart',
  education: 'GraduationCap',
  infrastructure: 'Building2',
  agriculture: 'Wheat',
  numerique: 'Laptop',
  emploi: 'Users',
  environnement: 'TreePine',
  gouvernance: 'Shield',
};
