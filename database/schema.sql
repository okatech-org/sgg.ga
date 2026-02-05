-- ============================================================================
-- SGG DIGITAL - SCHEMA DE BASE DE DONNEES POSTGRESQL
-- Architecture : 7 Schemas selon le Rapport Gouvernemental
-- Pour Google Cloud SQL
-- Version: 2.0.0
-- Date: 2026-02-05
-- ============================================================================

-- ============================================================================
-- EXTENSIONS
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "unaccent";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================================================
-- CREATION DES 7 SCHEMAS
-- ============================================================================
CREATE SCHEMA IF NOT EXISTS auth;       -- Authentification et RBAC
CREATE SCHEMA IF NOT EXISTS gar;        -- Gestion Axee sur les Resultats (PAG 2026)
CREATE SCHEMA IF NOT EXISTS nominations; -- Workflow des nominations
CREATE SCHEMA IF NOT EXISTS legislatif; -- Cycle legislatif en 8 etapes
CREATE SCHEMA IF NOT EXISTS egop;       -- e-GOP (CI, RIM, Courrier)
CREATE SCHEMA IF NOT EXISTS jo;         -- Journal Officiel Open Data
CREATE SCHEMA IF NOT EXISTS institutions; -- Cartographie institutionnelle

-- ============================================================================
-- SCHEMA: auth - Authentification et RBAC (12 roles)
-- ============================================================================

-- Types enumeres pour l'authentification
CREATE TYPE auth.app_role AS ENUM (
    'admin_sgg',            -- Administrateur SGG (acces complet)
    'directeur_sgg',        -- Directeur au sein du SGG
    'sg_ministere',         -- Secretaire General de Ministere
    'sgpr',                 -- Secretariat General Presidence Republique
    'premier_ministre',     -- Cabinet du Premier Ministre
    'ministre',             -- Ministre
    'assemblee',            -- Assemblee Nationale
    'senat',                -- Senat
    'conseil_etat',         -- Conseil d'Etat
    'cour_constitutionnelle', -- Cour Constitutionnelle
    'dgjo',                 -- Direction Generale Journal Officiel
    'citoyen'               -- Citoyen (acces JO uniquement)
);

CREATE TYPE auth.permission_type AS ENUM (
    'read',
    'write',
    'approve',
    'reject',
    'publish',
    'admin'
);

-- Table: Utilisateurs
CREATE TABLE auth.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    avatar_url TEXT,

    -- Statut
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,

    -- Verification
    verification_token VARCHAR(255),
    reset_token VARCHAR(255),
    reset_token_expires TIMESTAMP WITH TIME ZONE,

    -- 2FA/TOTP
    totp_secret VARCHAR(255),
    totp_enabled BOOLEAN DEFAULT FALSE,
    backup_codes TEXT[],

    -- Audit
    last_login TIMESTAMP WITH TIME ZONE,
    login_count INTEGER DEFAULT 0,
    failed_login_count INTEGER DEFAULT 0,
    locked_until TIMESTAMP WITH TIME ZONE,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_auth_users_email ON auth.users(email);
CREATE INDEX idx_auth_users_active ON auth.users(is_active);

-- Table: Roles utilisateurs
CREATE TABLE auth.user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role auth.app_role NOT NULL DEFAULT 'citoyen',
    institution_id UUID, -- Reference vers institutions.institutions
    is_primary BOOLEAN DEFAULT FALSE,
    granted_by UUID REFERENCES auth.users(id),
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, role, institution_id)
);

CREATE INDEX idx_auth_user_roles_user ON auth.user_roles(user_id);
CREATE INDEX idx_auth_user_roles_role ON auth.user_roles(role);

-- Table: Permissions par role et module
CREATE TABLE auth.role_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role auth.app_role NOT NULL,
    module VARCHAR(50) NOT NULL, -- gar, nominations, legislatif, egop, jo
    permission auth.permission_type NOT NULL,
    conditions JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(role, module, permission)
);

-- Table: Sessions
CREATE TABLE auth.sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    token VARCHAR(500) NOT NULL UNIQUE,
    refresh_token VARCHAR(500) UNIQUE,
    ip_address INET,
    user_agent TEXT,
    device_fingerprint VARCHAR(255),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_auth_sessions_user ON auth.sessions(user_id);
CREATE INDEX idx_auth_sessions_token ON auth.sessions(token);
CREATE INDEX idx_auth_sessions_expires ON auth.sessions(expires_at);

-- Table: Journal d'audit global
CREATE TABLE auth.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    action VARCHAR(100) NOT NULL,
    module VARCHAR(50) NOT NULL,
    table_name VARCHAR(100) NOT NULL,
    record_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_auth_audit_user ON auth.audit_logs(user_id);
CREATE INDEX idx_auth_audit_module ON auth.audit_logs(module);
CREATE INDEX idx_auth_audit_date ON auth.audit_logs(created_at);

-- ============================================================================
-- SCHEMA: institutions - Cartographie Institutionnelle
-- ============================================================================

CREATE TYPE institutions.institution_type AS ENUM (
    'presidence',
    'primature',
    'ministere',
    'secretariat_general',
    'direction_generale',
    'direction',
    'service',
    'assemblee',
    'senat',
    'juridiction',
    'autorite_independante',
    'etablissement_public',
    'collectivite'
);

CREATE TYPE institutions.niveau_digitalisation AS ENUM (
    'niveau_0',  -- Aucune digitalisation
    'niveau_1',  -- En cours de digitalisation
    'niveau_2',  -- Partiellement digitalise
    'niveau_3',  -- Totalement digitalise
    'niveau_4'   -- Digitalise et interconnecte
);

-- Table: Institutions
CREATE TABLE institutions.institutions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    nom VARCHAR(255) NOT NULL,
    nom_court VARCHAR(100),
    sigle VARCHAR(20),
    type institutions.institution_type NOT NULL,

    -- Hierarchie
    parent_id UUID REFERENCES institutions.institutions(id),
    ordre_protocole INTEGER,

    -- Coordonnees
    adresse TEXT,
    ville VARCHAR(100) DEFAULT 'Libreville',
    telephone VARCHAR(50),
    email VARCHAR(255),
    site_web VARCHAR(255),
    logo_url TEXT,

    -- Responsable
    responsable_nom VARCHAR(255),
    responsable_fonction VARCHAR(255),
    date_nomination DATE,

    -- Digitalisation
    niveau_digitalisation institutions.niveau_digitalisation DEFAULT 'niveau_0',
    date_connexion_sgg DATE,

    -- Statistiques
    nb_agents INTEGER DEFAULT 0,
    budget_annuel DECIMAL(15,2),

    is_active BOOLEAN DEFAULT TRUE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_institutions_type ON institutions.institutions(type);
CREATE INDEX idx_institutions_code ON institutions.institutions(code);
CREATE INDEX idx_institutions_parent ON institutions.institutions(parent_id);

-- Table: Interactions entre institutions
CREATE TABLE institutions.interactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    institution_source_id UUID NOT NULL REFERENCES institutions.institutions(id),
    institution_cible_id UUID NOT NULL REFERENCES institutions.institutions(id),
    type_interaction VARCHAR(100) NOT NULL, -- tutelle, partenariat, controle, etc.
    description TEXT,
    frequence VARCHAR(50), -- quotidien, hebdomadaire, mensuel, ponctuel
    flux_documents JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_interactions_source ON institutions.interactions(institution_source_id);
CREATE INDEX idx_interactions_cible ON institutions.interactions(institution_cible_id);

-- Table: Ministeres (vue specialisee)
CREATE VIEW institutions.v_ministeres AS
SELECT * FROM institutions.institutions
WHERE type = 'ministere' AND is_active = TRUE
ORDER BY ordre_protocole;

-- ============================================================================
-- SCHEMA: gar - Gestion Axee sur les Resultats (PAG 2026)
-- ============================================================================

CREATE TYPE gar.priorite_presidentielle AS ENUM (
    'sante',                    -- Sante pour tous
    'education',                -- Education de qualite
    'infrastructure',           -- Infrastructures modernes
    'agriculture',              -- Securite alimentaire
    'numerique',                -- Transformation numerique
    'emploi',                   -- Emploi des jeunes
    'environnement',            -- Developpement durable
    'gouvernance'               -- Bonne gouvernance
);

CREATE TYPE gar.objectif_status AS ENUM (
    'planifie',
    'en_cours',
    'en_retard',
    'atteint',
    'partiellement_atteint',
    'abandonne'
);

CREATE TYPE gar.rapport_status AS ENUM (
    'attendu',
    'en_retard',
    'soumis',
    'en_revision',
    'valide',
    'rejete'
);

-- Table: Priorites Presidentielles PAG 2026
CREATE TABLE gar.priorites_pag (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(20) UNIQUE NOT NULL,
    priorite gar.priorite_presidentielle NOT NULL UNIQUE,
    titre VARCHAR(255) NOT NULL,
    description TEXT,

    -- Budget
    budget_alloue DECIMAL(15,2) DEFAULT 0,
    budget_consomme DECIMAL(15,2) DEFAULT 0,
    taux_consommation DECIMAL(5,2) GENERATED ALWAYS AS (
        CASE WHEN budget_alloue > 0
        THEN ROUND((budget_consomme / budget_alloue) * 100, 2)
        ELSE 0 END
    ) STORED,

    -- Objectifs
    nb_objectifs_total INTEGER DEFAULT 0,
    nb_objectifs_atteints INTEGER DEFAULT 0,
    taux_realisation DECIMAL(5,2) GENERATED ALWAYS AS (
        CASE WHEN nb_objectifs_total > 0
        THEN ROUND((nb_objectifs_atteints::DECIMAL / nb_objectifs_total) * 100, 2)
        ELSE 0 END
    ) STORED,

    icone VARCHAR(50),
    couleur VARCHAR(20),
    ordre INTEGER DEFAULT 0,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: Objectifs strategiques
CREATE TABLE gar.objectifs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    priorite_id UUID NOT NULL REFERENCES gar.priorites_pag(id),
    ministere_id UUID NOT NULL, -- Reference vers institutions.institutions

    -- Details
    titre VARCHAR(500) NOT NULL,
    description TEXT,
    annee INTEGER NOT NULL DEFAULT EXTRACT(YEAR FROM NOW()),
    trimestre INTEGER CHECK (trimestre >= 1 AND trimestre <= 4),

    -- Indicateurs (21 colonnes du rapport)
    indicateur_cle VARCHAR(255),
    unite_mesure VARCHAR(50),
    valeur_reference DECIMAL(15,2),
    valeur_cible DECIMAL(15,2),
    valeur_t1 DECIMAL(15,2),
    valeur_t2 DECIMAL(15,2),
    valeur_t3 DECIMAL(15,2),
    valeur_t4 DECIMAL(15,2),
    valeur_realisee DECIMAL(15,2),
    taux_execution DECIMAL(5,2) GENERATED ALWAYS AS (
        CASE WHEN valeur_cible > 0
        THEN ROUND((COALESCE(valeur_realisee, 0) / valeur_cible) * 100, 2)
        ELSE 0 END
    ) STORED,

    -- Budget dedie
    budget_prevu DECIMAL(15,2) DEFAULT 0,
    budget_engage DECIMAL(15,2) DEFAULT 0,
    budget_decaisse DECIMAL(15,2) DEFAULT 0,

    -- Statut
    statut gar.objectif_status DEFAULT 'planifie',
    date_debut DATE,
    date_echeance DATE,
    date_achevement DATE,

    -- Responsables
    responsable_nom VARCHAR(255),
    responsable_email VARCHAR(255),

    -- Hierarchie
    parent_id UUID REFERENCES gar.objectifs(id),
    niveau INTEGER DEFAULT 1, -- 1=strategique, 2=operationnel, 3=action

    observations TEXT,
    metadata JSONB DEFAULT '{}',

    created_by UUID,
    updated_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_gar_objectifs_priorite ON gar.objectifs(priorite_id);
CREATE INDEX idx_gar_objectifs_ministere ON gar.objectifs(ministere_id);
CREATE INDEX idx_gar_objectifs_annee ON gar.objectifs(annee);
CREATE INDEX idx_gar_objectifs_statut ON gar.objectifs(statut);

-- Table: Rapports GAR mensuels (matrice 21 colonnes)
CREATE TABLE gar.rapports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ministere_id UUID NOT NULL, -- Reference vers institutions.institutions
    annee INTEGER NOT NULL,
    mois INTEGER NOT NULL CHECK (mois >= 1 AND mois <= 12),

    -- Matrice 21 colonnes resumee
    donnees_matrice JSONB NOT NULL DEFAULT '[]',
    /*
    Structure:
    [
        {
            "priorite": "sante",
            "objectif_code": "OBJ-2026-001",
            "indicateur": "Taux de couverture vaccinale",
            "unite": "%",
            "cible_annuelle": 95,
            "realisation_mois": 72,
            "cumul_annuel": 72,
            "ecart": -23,
            "taux_realisation": 75.8,
            "budget_alloue": 5000000000,
            "budget_consomme": 3200000000,
            "observations": "Retard livraison vaccins"
        }
    ]
    */

    -- Resume
    nb_objectifs_suivis INTEGER DEFAULT 0,
    nb_objectifs_atteints INTEGER DEFAULT 0,
    nb_objectifs_en_retard INTEGER DEFAULT 0,
    taux_global_realisation DECIMAL(5,2) DEFAULT 0,

    -- Commentaires
    synthese TEXT,
    difficultes TEXT,
    perspectives TEXT,
    recommandations TEXT,

    -- Fichiers
    fichier_url TEXT,
    fichier_excel_url TEXT,

    -- Workflow
    statut gar.rapport_status DEFAULT 'attendu',
    date_limite DATE,
    date_soumission TIMESTAMP WITH TIME ZONE,
    date_validation TIMESTAMP WITH TIME ZONE,

    soumis_par UUID,
    valide_par UUID,
    observations_validation TEXT,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(ministere_id, annee, mois)
);

CREATE INDEX idx_gar_rapports_ministere ON gar.rapports(ministere_id);
CREATE INDEX idx_gar_rapports_periode ON gar.rapports(annee, mois);
CREATE INDEX idx_gar_rapports_statut ON gar.rapports(statut);

-- Table: Indicateurs de suivi
CREATE TABLE gar.indicateurs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    objectif_id UUID NOT NULL REFERENCES gar.objectifs(id) ON DELETE CASCADE,

    code VARCHAR(50) NOT NULL,
    libelle VARCHAR(255) NOT NULL,
    description TEXT,

    type_indicateur VARCHAR(50), -- quantitatif, qualitatif, mixte
    unite VARCHAR(50),
    source_donnees VARCHAR(255),
    frequence_collecte VARCHAR(50), -- mensuel, trimestriel, annuel

    valeur_baseline DECIMAL(15,2),
    valeur_cible DECIMAL(15,2),
    valeur_actuelle DECIMAL(15,2),
    date_derniere_maj TIMESTAMP WITH TIME ZONE,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_gar_indicateurs_objectif ON gar.indicateurs(objectif_id);

-- Vue: Tableau de bord GAR
CREATE VIEW gar.v_dashboard AS
SELECT
    p.id AS priorite_id,
    p.priorite,
    p.titre AS priorite_titre,
    p.budget_alloue,
    p.budget_consomme,
    p.taux_consommation,
    COUNT(DISTINCT o.id) AS nb_objectifs,
    COUNT(DISTINCT CASE WHEN o.statut = 'atteint' THEN o.id END) AS objectifs_atteints,
    COUNT(DISTINCT CASE WHEN o.statut = 'en_retard' THEN o.id END) AS objectifs_en_retard,
    COUNT(DISTINCT CASE WHEN o.statut = 'en_cours' THEN o.id END) AS objectifs_en_cours,
    COALESCE(AVG(o.taux_execution), 0) AS taux_execution_moyen
FROM gar.priorites_pag p
LEFT JOIN gar.objectifs o ON p.id = o.priorite_id AND o.annee = EXTRACT(YEAR FROM NOW())
GROUP BY p.id, p.priorite, p.titre, p.budget_alloue, p.budget_consomme, p.taux_consommation
ORDER BY p.ordre;

-- ============================================================================
-- SCHEMA: nominations - Workflow des Nominations
-- ============================================================================

CREATE TYPE nominations.nomination_status AS ENUM (
    'brouillon',            -- En cours de redaction
    'soumis',               -- Soumis par le ministere
    'recevabilite',         -- Controle de recevabilite
    'examen_sgg',           -- Examen SGG (conformite, adequation)
    'avis_favorable',       -- Avis favorable SGG
    'avis_defavorable',     -- Avis defavorable SGG
    'transmis_sgpr',        -- Transmis au SGPR
    'arbitrage_pm',         -- Arbitrage Premier Ministre
    'conseil_ministres',    -- Inscrit au CM
    'valide_cm',            -- Valide par Conseil des Ministres
    'signature',            -- En attente de signature
    'signe',                -- Acte signe
    'publie_jo',            -- Publie au JO
    'rejete'                -- Rejete
);

CREATE TYPE nominations.type_nomination AS ENUM (
    'premiere_nomination',
    'mutation',
    'promotion',
    'detachement',
    'mise_disposition',
    'reintegration',
    'fin_fonction'
);

CREATE TYPE nominations.categorie_emploi AS ENUM (
    'A1',   -- Emplois superieurs de l'Etat
    'A2',   -- Directeurs generaux
    'A3',   -- Directeurs
    'B1',   -- Chefs de service
    'B2',   -- Autres emplois
    'C'     -- Emplois subordonnes
);

-- Table: Postes/Emplois
CREATE TABLE nominations.postes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    titre VARCHAR(255) NOT NULL,
    institution_id UUID NOT NULL, -- Reference vers institutions.institutions
    direction VARCHAR(255),

    categorie nominations.categorie_emploi NOT NULL,
    grade VARCHAR(100),
    echelon INTEGER,

    -- Profil requis
    diplome_minimum VARCHAR(255),
    experience_minimum INTEGER, -- en annees
    competences_requises JSONB DEFAULT '[]',

    -- Remuneration
    indice_debut INTEGER,
    indice_fin INTEGER,

    is_vacant BOOLEAN DEFAULT TRUE,
    titulaire_actuel_id UUID,
    date_vacance DATE,

    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    metadata JSONB DEFAULT '{}',

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_nominations_postes_institution ON nominations.postes(institution_id);
CREATE INDEX idx_nominations_postes_categorie ON nominations.postes(categorie);
CREATE INDEX idx_nominations_postes_vacant ON nominations.postes(is_vacant);

-- Table: Candidats
CREATE TABLE nominations.candidats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    matricule VARCHAR(50) UNIQUE,

    -- Etat civil
    civilite VARCHAR(10),
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    nom_jeune_fille VARCHAR(100),
    date_naissance DATE NOT NULL,
    lieu_naissance VARCHAR(255),
    nationalite VARCHAR(100) DEFAULT 'Gabonaise',
    sexe CHAR(1) CHECK (sexe IN ('M', 'F')),

    -- Coordonnees
    email VARCHAR(255),
    telephone VARCHAR(50),
    telephone_secondaire VARCHAR(50),
    adresse TEXT,

    -- Situation professionnelle
    corps VARCHAR(255),
    grade_actuel VARCHAR(100),
    echelon_actuel INTEGER,
    institution_actuelle_id UUID,
    poste_actuel VARCHAR(255),
    date_entree_fonction_publique DATE,

    -- Formation
    diplome_plus_eleve VARCHAR(255),
    etablissement_diplome VARCHAR(255),
    annee_diplome INTEGER,
    autres_diplomes JSONB DEFAULT '[]',

    -- Photo et documents
    photo_url TEXT,
    cv_url TEXT,

    -- Verification
    casier_judiciaire_verifie BOOLEAN DEFAULT FALSE,
    date_verification_casier DATE,

    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_nominations_candidats_matricule ON nominations.candidats(matricule);
CREATE INDEX idx_nominations_candidats_nom ON nominations.candidats(nom, prenom);

-- Table: Dossiers de nomination
CREATE TABLE nominations.dossiers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reference VARCHAR(50) UNIQUE NOT NULL,

    -- Parties prenantes
    candidat_id UUID NOT NULL REFERENCES nominations.candidats(id),
    poste_id UUID NOT NULL REFERENCES nominations.postes(id),
    ministere_proposant_id UUID NOT NULL, -- Reference vers institutions.institutions

    -- Type
    type nominations.type_nomination NOT NULL DEFAULT 'premiere_nomination',

    -- Statut et workflow
    statut nominations.nomination_status NOT NULL DEFAULT 'brouillon',
    etape_actuelle INTEGER DEFAULT 1,

    -- Dates cles
    date_soumission TIMESTAMP WITH TIME ZONE,
    date_recevabilite TIMESTAMP WITH TIME ZONE,
    date_examen_sgg TIMESTAMP WITH TIME ZONE,
    date_transmission_sgpr TIMESTAMP WITH TIME ZONE,
    date_conseil_ministres DATE,
    date_signature DATE,
    date_publication_jo DATE,
    date_prise_fonction DATE,

    -- Conseil des Ministres
    cm_reference VARCHAR(100),
    cm_point_ordre INTEGER,

    -- Evaluation SGG
    score_adequation INTEGER CHECK (score_adequation >= 0 AND score_adequation <= 100),
    avis_sgg TEXT,
    recommandation_sgg VARCHAR(50), -- favorable, defavorable, reserve
    agent_traitant_id UUID,

    -- Motifs
    motif_proposition TEXT,
    motif_rejet TEXT,
    observations TEXT,

    -- Acte
    acte_numero VARCHAR(100),
    acte_date DATE,
    acte_signataire VARCHAR(255),
    acte_url TEXT,

    -- Metadata
    delai_traitement INTEGER, -- en jours
    is_urgent BOOLEAN DEFAULT FALSE,
    metadata JSONB DEFAULT '{}',

    created_by UUID,
    updated_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_nominations_dossiers_reference ON nominations.dossiers(reference);
CREATE INDEX idx_nominations_dossiers_candidat ON nominations.dossiers(candidat_id);
CREATE INDEX idx_nominations_dossiers_poste ON nominations.dossiers(poste_id);
CREATE INDEX idx_nominations_dossiers_statut ON nominations.dossiers(statut);
CREATE INDEX idx_nominations_dossiers_ministere ON nominations.dossiers(ministere_proposant_id);
CREATE INDEX idx_nominations_dossiers_date_soumission ON nominations.dossiers(date_soumission);

-- Table: Documents de nomination
CREATE TABLE nominations.documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dossier_id UUID NOT NULL REFERENCES nominations.dossiers(id) ON DELETE CASCADE,

    type VARCHAR(100) NOT NULL, -- cv, acte_naissance, diplome, casier, attestation, etc.
    nom_fichier VARCHAR(255) NOT NULL,
    fichier_url TEXT NOT NULL,
    taille_octets BIGINT,
    mime_type VARCHAR(100),

    -- Verification
    is_obligatoire BOOLEAN DEFAULT FALSE,
    is_verifie BOOLEAN DEFAULT FALSE,
    verifie_par UUID,
    date_verification TIMESTAMP WITH TIME ZONE,
    observations TEXT,

    uploaded_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_nominations_docs_dossier ON nominations.documents(dossier_id);
CREATE INDEX idx_nominations_docs_type ON nominations.documents(type);

-- Table: Historique des actions
CREATE TABLE nominations.historique (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dossier_id UUID NOT NULL REFERENCES nominations.dossiers(id) ON DELETE CASCADE,

    action VARCHAR(100) NOT NULL,
    ancien_statut nominations.nomination_status,
    nouveau_statut nominations.nomination_status,
    commentaire TEXT,

    acteur_id UUID NOT NULL,
    acteur_role auth.app_role,
    acteur_nom VARCHAR(255),

    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_nominations_hist_dossier ON nominations.historique(dossier_id);
CREATE INDEX idx_nominations_hist_date ON nominations.historique(created_at);

-- Vue: Nominations avec details
CREATE VIEW nominations.v_dossiers_details AS
SELECT
    d.*,
    c.nom AS candidat_nom,
    c.prenom AS candidat_prenom,
    c.matricule AS candidat_matricule,
    c.grade_actuel AS candidat_grade,
    p.titre AS poste_titre,
    p.categorie AS poste_categorie
FROM nominations.dossiers d
JOIN nominations.candidats c ON d.candidat_id = c.id
JOIN nominations.postes p ON d.poste_id = p.id;

-- ============================================================================
-- SCHEMA: legislatif - Cycle Legislatif en 8 Etapes
-- ============================================================================

CREATE TYPE legislatif.texte_type AS ENUM (
    'loi_organique',
    'loi_ordinaire',
    'ordonnance',
    'decret',
    'arrete',
    'decision',
    'circulaire',
    'instruction'
);

CREATE TYPE legislatif.texte_status AS ENUM (
    -- Etape 1: Soumission
    'redaction',
    'soumis',

    -- Etape 2: Examen SGG
    'examen_sgg',
    'validation_sgg',

    -- Etape 3: Conseil d'Etat
    'transmission_ce',
    'examen_ce',
    'avis_ce_recu',

    -- Etape 4: Conseil des Ministres
    'inscription_cm',
    'adopte_cm',

    -- Etape 5: Parlement
    'depot_an',
    'commission_an',
    'vote_an',
    'depot_senat',
    'commission_senat',
    'vote_senat',
    'cmp',
    'vote_definitif',

    -- Etape 6: Cour Constitutionnelle
    'saisine_cc',
    'examen_cc',
    'decision_cc',

    -- Etape 7: Promulgation
    'transmission_presidence',
    'signature_promulgation',

    -- Etape 8: Publication JO
    'transmission_jo',
    'publie_jo',

    -- Autres
    'rejete',
    'retire',
    'caduc'
);

CREATE TYPE legislatif.nature_avis AS ENUM (
    'favorable',
    'favorable_reserves',
    'defavorable',
    'conforme',
    'non_conforme',
    'irrecevable'
);

-- Table: Projets de textes
CREATE TABLE legislatif.textes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reference VARCHAR(50) UNIQUE NOT NULL,

    -- Identification
    titre VARCHAR(500) NOT NULL,
    titre_court VARCHAR(255),
    type legislatif.texte_type NOT NULL,
    ministere_origine_id UUID NOT NULL, -- Reference vers institutions.institutions

    -- Workflow
    statut legislatif.texte_status NOT NULL DEFAULT 'redaction',
    etape_actuelle INTEGER DEFAULT 1, -- 1 a 8

    -- Caracteristiques
    is_urgence BOOLEAN DEFAULT FALSE,
    is_loi_finances BOOLEAN DEFAULT FALSE,
    is_loi_reglement BOOLEAN DEFAULT FALSE,
    session_parlementaire VARCHAR(100),
    legislature VARCHAR(50),

    -- Dates du cycle (8 etapes)
    -- Etape 1
    date_depot TIMESTAMP WITH TIME ZONE,

    -- Etape 2
    date_reception_sgg TIMESTAMP WITH TIME ZONE,
    date_examen_sgg TIMESTAMP WITH TIME ZONE,
    date_validation_sgg TIMESTAMP WITH TIME ZONE,

    -- Etape 3
    date_saisine_ce TIMESTAMP WITH TIME ZONE,
    date_avis_ce TIMESTAMP WITH TIME ZONE,

    -- Etape 4
    date_inscription_cm TIMESTAMP WITH TIME ZONE,
    date_adoption_cm TIMESTAMP WITH TIME ZONE,
    cm_reference VARCHAR(100),

    -- Etape 5
    date_depot_an TIMESTAMP WITH TIME ZONE,
    date_vote_an TIMESTAMP WITH TIME ZONE,
    date_depot_senat TIMESTAMP WITH TIME ZONE,
    date_vote_senat TIMESTAMP WITH TIME ZONE,
    date_vote_definitif TIMESTAMP WITH TIME ZONE,

    -- Etape 6
    date_saisine_cc TIMESTAMP WITH TIME ZONE,
    date_decision_cc TIMESTAMP WITH TIME ZONE,

    -- Etape 7
    date_transmission_presidence TIMESTAMP WITH TIME ZONE,
    date_promulgation TIMESTAMP WITH TIME ZONE,

    -- Etape 8
    date_transmission_jo TIMESTAMP WITH TIME ZONE,
    date_publication_jo TIMESTAMP WITH TIME ZONE,
    numero_jo VARCHAR(50),

    -- Delais
    delai_restant INTEGER, -- en jours
    delai_alerte INTEGER DEFAULT 5,

    -- Contenu
    objet TEXT,
    expose_motifs TEXT,
    resume TEXT,

    -- Fichiers
    fichier_projet_url TEXT,
    fichier_expose_url TEXT,
    fichier_etude_impact_url TEXT,

    -- Metadonnees
    mots_cles TEXT[],
    observations TEXT,
    metadata JSONB DEFAULT '{}',

    created_by UUID,
    updated_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_legislatif_textes_reference ON legislatif.textes(reference);
CREATE INDEX idx_legislatif_textes_type ON legislatif.textes(type);
CREATE INDEX idx_legislatif_textes_statut ON legislatif.textes(statut);
CREATE INDEX idx_legislatif_textes_ministere ON legislatif.textes(ministere_origine_id);
CREATE INDEX idx_legislatif_textes_etape ON legislatif.textes(etape_actuelle);
CREATE INDEX idx_legislatif_textes_urgence ON legislatif.textes(is_urgence) WHERE is_urgence = TRUE;

-- Table: Versions des textes
CREATE TABLE legislatif.versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    texte_id UUID NOT NULL REFERENCES legislatif.textes(id) ON DELETE CASCADE,

    numero_version INTEGER NOT NULL,
    titre VARCHAR(500),
    contenu TEXT,
    fichier_url TEXT,

    motif_modification TEXT,
    etape_creation legislatif.texte_status,

    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(texte_id, numero_version)
);

CREATE INDEX idx_legislatif_versions_texte ON legislatif.versions(texte_id);

-- Table: Avis sur les textes
CREATE TABLE legislatif.avis (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    texte_id UUID NOT NULL REFERENCES legislatif.textes(id) ON DELETE CASCADE,

    institution_id UUID NOT NULL, -- CE, CC, SGG, etc.
    type_avis VARCHAR(50) NOT NULL, -- conseil_etat, cour_constit, sgg, commission_an, etc.

    nature legislatif.nature_avis NOT NULL,
    numero_avis VARCHAR(100),

    date_saisine TIMESTAMP WITH TIME ZONE,
    date_reponse TIMESTAMP WITH TIME ZONE,
    delai_jours INTEGER,

    resume TEXT,
    recommandations TEXT,
    reserves TEXT,
    fichier_url TEXT,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_legislatif_avis_texte ON legislatif.avis(texte_id);
CREATE INDEX idx_legislatif_avis_institution ON legislatif.avis(institution_id);

-- Table: Historique du cycle legislatif
CREATE TABLE legislatif.historique (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    texte_id UUID NOT NULL REFERENCES legislatif.textes(id) ON DELETE CASCADE,

    etape INTEGER NOT NULL,
    action VARCHAR(100) NOT NULL,
    ancien_statut legislatif.texte_status,
    nouveau_statut legislatif.texte_status,

    institution_id UUID,
    commentaire TEXT,

    acteur_id UUID NOT NULL,
    acteur_nom VARCHAR(255),

    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_legislatif_hist_texte ON legislatif.historique(texte_id);
CREATE INDEX idx_legislatif_hist_etape ON legislatif.historique(etape);

-- Table: Amendements
CREATE TABLE legislatif.amendements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    texte_id UUID NOT NULL REFERENCES legislatif.textes(id) ON DELETE CASCADE,

    numero VARCHAR(50) NOT NULL,
    article_vise VARCHAR(100),
    auteur_type VARCHAR(50), -- gouvernement, depute, senateur, commission
    auteur_nom VARCHAR(255),

    objet TEXT,
    dispositif TEXT,
    expose_sommaire TEXT,

    statut VARCHAR(50) DEFAULT 'depose', -- depose, adopte, rejete, retire, tombe
    date_depot TIMESTAMP WITH TIME ZONE,
    date_examen TIMESTAMP WITH TIME ZONE,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_legislatif_amendements_texte ON legislatif.amendements(texte_id);

-- Vue: Progression des textes (8 etapes)
CREATE VIEW legislatif.v_progression AS
SELECT
    t.*,
    CASE
        WHEN t.statut = 'publie_jo' THEN 100
        WHEN t.statut IN ('transmission_jo', 'signature_promulgation') THEN 90
        WHEN t.statut IN ('decision_cc', 'examen_cc', 'saisine_cc') THEN 80
        WHEN t.statut IN ('vote_definitif', 'cmp', 'vote_senat', 'vote_an') THEN 70
        WHEN t.statut IN ('commission_senat', 'depot_senat', 'commission_an', 'depot_an') THEN 60
        WHEN t.statut IN ('adopte_cm', 'inscription_cm') THEN 50
        WHEN t.statut IN ('avis_ce_recu', 'examen_ce', 'transmission_ce') THEN 35
        WHEN t.statut IN ('validation_sgg', 'examen_sgg') THEN 20
        WHEN t.statut = 'soumis' THEN 10
        ELSE 5
    END AS pourcentage_progression,
    CASE
        WHEN t.etape_actuelle = 1 THEN 'Soumission'
        WHEN t.etape_actuelle = 2 THEN 'Examen SGG'
        WHEN t.etape_actuelle = 3 THEN 'Conseil d''Etat'
        WHEN t.etape_actuelle = 4 THEN 'Conseil des Ministres'
        WHEN t.etape_actuelle = 5 THEN 'Parlement'
        WHEN t.etape_actuelle = 6 THEN 'Cour Constitutionnelle'
        WHEN t.etape_actuelle = 7 THEN 'Promulgation'
        WHEN t.etape_actuelle = 8 THEN 'Publication JO'
        ELSE 'Inconnu'
    END AS nom_etape
FROM legislatif.textes t;

-- ============================================================================
-- SCHEMA: egop - e-GOP (Conseils, Reunions, Courrier)
-- ============================================================================

CREATE TYPE egop.reunion_status AS ENUM (
    'planifiee',
    'convocations_envoyees',
    'confirmee',
    'en_cours',
    'terminee',
    'compte_rendu_redige',
    'decisions_publiees',
    'reportee',
    'annulee'
);

CREATE TYPE egop.courrier_type AS ENUM (
    'entrant',
    'sortant',
    'interne'
);

CREATE TYPE egop.courrier_status AS ENUM (
    'recu',
    'enregistre',
    'en_traitement',
    'traite',
    'repondu',
    'classe',
    'archive'
);

CREATE TYPE egop.priorite AS ENUM (
    'basse',
    'normale',
    'haute',
    'urgente',
    'tres_urgente'
);

-- Table: Conseils Interministeriels
CREATE TABLE egop.conseils (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reference VARCHAR(50) UNIQUE NOT NULL,

    -- Details
    type VARCHAR(100) NOT NULL, -- conseil_ministres, conseil_interministeriel, conseil_cabinet
    titre VARCHAR(500) NOT NULL,
    objet TEXT,

    -- Planification
    date_conseil DATE NOT NULL,
    heure_debut TIME,
    heure_fin TIME,
    duree_prevue INTEGER, -- en minutes
    lieu VARCHAR(255),

    -- Presidence
    president_institution_id UUID,
    president_nom VARCHAR(255),
    president_fonction VARCHAR(255),

    -- Secretariat
    secretaire_id UUID,

    -- Statut
    statut egop.reunion_status NOT NULL DEFAULT 'planifiee',

    -- Participants
    nb_institutions_convoquees INTEGER DEFAULT 0,
    nb_institutions_confirmees INTEGER DEFAULT 0,
    nb_presents INTEGER DEFAULT 0,

    -- Documents
    ordre_du_jour TEXT,
    ordre_du_jour_url TEXT,
    dossier_preparatoire_url TEXT,
    compte_rendu TEXT,
    compte_rendu_url TEXT,
    releve_decisions TEXT,
    releve_decisions_url TEXT,

    -- Decisions
    nb_dossiers_examines INTEGER DEFAULT 0,
    nb_decisions_prises INTEGER DEFAULT 0,

    metadata JSONB DEFAULT '{}',
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_egop_conseils_date ON egop.conseils(date_conseil);
CREATE INDEX idx_egop_conseils_type ON egop.conseils(type);
CREATE INDEX idx_egop_conseils_statut ON egop.conseils(statut);

-- Table: Participants aux conseils
CREATE TABLE egop.conseil_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conseil_id UUID NOT NULL REFERENCES egop.conseils(id) ON DELETE CASCADE,

    institution_id UUID NOT NULL,
    representant_prevu_nom VARCHAR(255),
    representant_prevu_fonction VARCHAR(255),

    -- Presence
    statut VARCHAR(50) DEFAULT 'convoque', -- convoque, confirme, present, absent, excuse, represente
    representant_effectif_nom VARCHAR(255),
    representant_effectif_fonction VARCHAR(255),

    heure_arrivee TIME,
    heure_depart TIME,

    observations TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_egop_participants_conseil ON egop.conseil_participants(conseil_id);
CREATE INDEX idx_egop_participants_institution ON egop.conseil_participants(institution_id);

-- Table: Dossiers/Points a l'ordre du jour
CREATE TABLE egop.conseil_dossiers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conseil_id UUID NOT NULL REFERENCES egop.conseils(id) ON DELETE CASCADE,

    ordre INTEGER NOT NULL,
    titre VARCHAR(500) NOT NULL,
    resume TEXT,

    ministere_rapporteur_id UUID,
    rapporteur_nom VARCHAR(255),

    -- Documents
    note_presentation_url TEXT,
    projet_texte_url TEXT,
    autres_documents JSONB DEFAULT '[]',

    -- Deliberation
    duree_examen INTEGER, -- en minutes
    decision TEXT,
    suite_a_donner TEXT,
    responsable_suivi VARCHAR(255),
    delai_suivi DATE,

    is_adopte BOOLEAN,
    observations TEXT,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_egop_dossiers_conseil ON egop.conseil_dossiers(conseil_id);

-- Table: Reunions Interministerielles (RIM)
CREATE TABLE egop.reunions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reference VARCHAR(50) UNIQUE NOT NULL,

    objet VARCHAR(500) NOT NULL,
    type VARCHAR(100), -- technique, coordination, arbitrage, suivi

    -- Planification
    date_reunion DATE NOT NULL,
    heure_debut TIME,
    heure_fin TIME,
    lieu VARCHAR(255),
    is_visioconference BOOLEAN DEFAULT FALSE,
    lien_visio VARCHAR(500),

    -- Convocateur
    convocateur_institution_id UUID,
    convocateur_nom VARCHAR(255),

    -- Statut
    statut egop.reunion_status NOT NULL DEFAULT 'planifiee',

    -- Contenu
    ordre_du_jour TEXT,
    compte_rendu TEXT,
    compte_rendu_url TEXT,
    decisions TEXT,

    -- Suivi
    actions_a_suivre JSONB DEFAULT '[]',
    /*
    [
        {
            "action": "Description de l'action",
            "responsable": "Ministere X",
            "delai": "2026-03-15",
            "statut": "en_cours"
        }
    ]
    */

    metadata JSONB DEFAULT '{}',
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_egop_reunions_date ON egop.reunions(date_reunion);
CREATE INDEX idx_egop_reunions_statut ON egop.reunions(statut);

-- Table: Participants aux RIM
CREATE TABLE egop.reunion_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reunion_id UUID NOT NULL REFERENCES egop.reunions(id) ON DELETE CASCADE,

    institution_id UUID NOT NULL,
    statut VARCHAR(50) DEFAULT 'convoque',
    representant_nom VARCHAR(255),

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_egop_reunion_part_reunion ON egop.reunion_participants(reunion_id);

-- Table: Courriers electroniques
CREATE TABLE egop.courriers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reference VARCHAR(50) UNIQUE NOT NULL,

    type egop.courrier_type NOT NULL,
    objet VARCHAR(500) NOT NULL,
    contenu TEXT,

    -- Expediteur
    expediteur_institution_id UUID,
    expediteur_nom VARCHAR(255),
    expediteur_fonction VARCHAR(255),
    expediteur_email VARCHAR(255),

    -- Destinataire
    destinataire_institution_id UUID,
    destinataire_nom VARCHAR(255),
    destinataire_fonction VARCHAR(255),
    destinataire_email VARCHAR(255),

    -- Copies
    copies JSONB DEFAULT '[]', -- [{institution_id, nom, email}]

    -- Dates
    date_courrier DATE,
    date_reception TIMESTAMP WITH TIME ZONE,
    date_enregistrement TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    date_traitement TIMESTAMP WITH TIME ZONE,
    date_reponse TIMESTAMP WITH TIME ZONE,
    delai_reponse INTEGER, -- en jours

    -- Statut
    priorite egop.priorite DEFAULT 'normale',
    statut egop.courrier_status DEFAULT 'recu',

    -- Affectation
    affecte_a_id UUID,
    affecte_a_nom VARCHAR(255),
    traite_par_id UUID,

    -- Fichiers
    fichier_principal_url TEXT,
    pieces_jointes JSONB DEFAULT '[]',

    -- Reponse
    courrier_parent_id UUID REFERENCES egop.courriers(id),
    courrier_reponse_id UUID REFERENCES egop.courriers(id),

    -- Classification
    confidentiel BOOLEAN DEFAULT FALSE,
    mots_cles TEXT[],

    observations TEXT,
    metadata JSONB DEFAULT '{}',

    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_egop_courriers_reference ON egop.courriers(reference);
CREATE INDEX idx_egop_courriers_type ON egop.courriers(type);
CREATE INDEX idx_egop_courriers_statut ON egop.courriers(statut);
CREATE INDEX idx_egop_courriers_priorite ON egop.courriers(priorite);
CREATE INDEX idx_egop_courriers_date ON egop.courriers(date_reception);
CREATE INDEX idx_egop_courriers_affecte ON egop.courriers(affecte_a_id);
CREATE INDEX idx_egop_courriers_expediteur ON egop.courriers(expediteur_institution_id);
CREATE INDEX idx_egop_courriers_destinataire ON egop.courriers(destinataire_institution_id);

-- Table: Historique des courriers
CREATE TABLE egop.courrier_historique (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    courrier_id UUID NOT NULL REFERENCES egop.courriers(id) ON DELETE CASCADE,

    action VARCHAR(100) NOT NULL,
    ancien_statut egop.courrier_status,
    nouveau_statut egop.courrier_status,
    commentaire TEXT,

    acteur_id UUID,
    acteur_nom VARCHAR(255),

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_egop_courrier_hist_courrier ON egop.courrier_historique(courrier_id);

-- ============================================================================
-- SCHEMA: jo - Journal Officiel Open Data
-- ============================================================================

CREATE TYPE jo.publication_type AS ENUM (
    'loi',
    'loi_organique',
    'ordonnance',
    'decret',
    'arrete',
    'decision',
    'circulaire',
    'avis',
    'communique',
    'annonce',
    'rectificatif'
);

CREATE TYPE jo.publication_status AS ENUM (
    'en_preparation',
    'valide',
    'publie',
    'rectifie',
    'abroge'
);

-- Table: Numeros du Journal Officiel
CREATE TABLE jo.numeros (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    numero VARCHAR(50) UNIQUE NOT NULL,

    annee INTEGER NOT NULL,
    numero_ordre INTEGER NOT NULL,

    type VARCHAR(50) DEFAULT 'ordinaire', -- ordinaire, special, supplementaire
    titre VARCHAR(255),

    date_publication DATE NOT NULL,
    date_parution_effective DATE,

    -- Fichier PDF complet
    fichier_url TEXT,
    nb_pages INTEGER,
    taille_mo DECIMAL(10,2),

    -- Statistiques
    nb_textes INTEGER DEFAULT 0,
    nb_vues INTEGER DEFAULT 0,
    nb_telechargements INTEGER DEFAULT 0,

    is_publie BOOLEAN DEFAULT FALSE,
    publie_par UUID,

    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(annee, numero_ordre)
);

CREATE INDEX idx_jo_numeros_date ON jo.numeros(date_publication);
CREATE INDEX idx_jo_numeros_annee ON jo.numeros(annee);

-- Table: Textes publies au JO
CREATE TABLE jo.textes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    numero_jo_id UUID NOT NULL REFERENCES jo.numeros(id),

    -- Identification
    numero VARCHAR(100) NOT NULL,
    type jo.publication_type NOT NULL,
    titre VARCHAR(500) NOT NULL,
    titre_court VARCHAR(255),

    -- Signataire
    signataire VARCHAR(255) NOT NULL,
    signataire_fonction VARCHAR(255),
    co_signataires JSONB DEFAULT '[]',

    -- Institution
    institution_origine_id UUID,
    ministere VARCHAR(255),

    -- Dates
    date_signature DATE NOT NULL,
    date_publication DATE NOT NULL,
    date_entree_vigueur DATE,

    -- Pagination dans le JO
    page_debut INTEGER,
    page_fin INTEGER,

    -- Contenu
    visa TEXT,
    considerants TEXT,
    dispositif TEXT,
    resume TEXT,

    -- Fichier individuel
    fichier_url TEXT,

    -- Consolidation
    statut jo.publication_status DEFAULT 'publie',
    is_consolide BOOLEAN DEFAULT FALSE,
    texte_consolide_url TEXT,

    -- Relations
    modifie JSONB DEFAULT '[]',      -- Textes modifies par celui-ci
    modifie_par JSONB DEFAULT '[]',  -- Textes qui modifient celui-ci
    abroge JSONB DEFAULT '[]',       -- Textes abroges
    abroge_par UUID REFERENCES jo.textes(id),

    -- Lien avec le cycle legislatif
    texte_legislatif_id UUID, -- Reference vers legislatif.textes

    -- Recherche
    search_vector TSVECTOR,
    mots_cles TEXT[],

    -- Statistiques
    nb_vues INTEGER DEFAULT 0,
    nb_telechargements INTEGER DEFAULT 0,

    metadata JSONB DEFAULT '{}',
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_jo_textes_numero_jo ON jo.textes(numero_jo_id);
CREATE INDEX idx_jo_textes_numero ON jo.textes(numero);
CREATE INDEX idx_jo_textes_type ON jo.textes(type);
CREATE INDEX idx_jo_textes_date_pub ON jo.textes(date_publication);
CREATE INDEX idx_jo_textes_institution ON jo.textes(institution_origine_id);
CREATE INDEX idx_jo_textes_statut ON jo.textes(statut);
CREATE INDEX idx_jo_textes_search ON jo.textes USING GIN(search_vector);
CREATE INDEX idx_jo_textes_mots_cles ON jo.textes USING GIN(mots_cles);

-- Table: Articles des textes
CREATE TABLE jo.articles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    texte_id UUID NOT NULL REFERENCES jo.textes(id) ON DELETE CASCADE,

    numero VARCHAR(50) NOT NULL,
    titre VARCHAR(500),
    contenu TEXT NOT NULL,

    ordre INTEGER NOT NULL,
    is_modifie BOOLEAN DEFAULT FALSE,
    is_abroge BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_jo_articles_texte ON jo.articles(texte_id);
CREATE INDEX idx_jo_articles_ordre ON jo.articles(texte_id, ordre);

-- Table: Annexes des textes
CREATE TABLE jo.annexes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    texte_id UUID NOT NULL REFERENCES jo.textes(id) ON DELETE CASCADE,

    numero VARCHAR(50),
    titre VARCHAR(500),
    description TEXT,
    fichier_url TEXT NOT NULL,

    ordre INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_jo_annexes_texte ON jo.annexes(texte_id);

-- Table: Abonnements citoyens (alertes)
CREATE TABLE jo.abonnements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    email VARCHAR(255) NOT NULL,
    nom VARCHAR(255),

    -- Preferences
    types_textes jo.publication_type[] DEFAULT '{}',
    mots_cles TEXT[] DEFAULT '{}',
    institutions UUID[] DEFAULT '{}',

    frequence VARCHAR(50) DEFAULT 'immediat', -- immediat, quotidien, hebdomadaire

    is_active BOOLEAN DEFAULT TRUE,
    token_desinscription VARCHAR(255) UNIQUE,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_jo_abonnements_email ON jo.abonnements(email);
CREATE INDEX idx_jo_abonnements_active ON jo.abonnements(is_active);

-- Table: Statistiques d'acces
CREATE TABLE jo.statistiques (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    texte_id UUID REFERENCES jo.textes(id) ON DELETE CASCADE,
    numero_jo_id UUID REFERENCES jo.numeros(id) ON DELETE CASCADE,

    action VARCHAR(50) NOT NULL, -- vue, telechargement, partage

    -- Tracking anonymise
    session_id VARCHAR(255),
    ip_hash VARCHAR(64),
    user_agent TEXT,
    referrer VARCHAR(500),

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_jo_stats_texte ON jo.statistiques(texte_id);
CREATE INDEX idx_jo_stats_numero ON jo.statistiques(numero_jo_id);
CREATE INDEX idx_jo_stats_date ON jo.statistiques(created_at);

-- Vue: Statistiques du JO
CREATE VIEW jo.v_statistiques_globales AS
SELECT
    DATE_TRUNC('month', date_publication) AS mois,
    type,
    COUNT(*) AS nb_textes,
    SUM(nb_vues) AS total_vues,
    SUM(nb_telechargements) AS total_telechargements
FROM jo.textes
GROUP BY DATE_TRUNC('month', date_publication), type
ORDER BY mois DESC, type;

-- Vue: Textes populaires
CREATE VIEW jo.v_textes_populaires AS
SELECT
    t.*,
    n.numero AS numero_jo,
    n.date_publication AS date_jo
FROM jo.textes t
JOIN jo.numeros n ON t.numero_jo_id = n.id
ORDER BY t.nb_vues DESC, t.nb_telechargements DESC
LIMIT 50;

-- ============================================================================
-- FONCTIONS GLOBALES
-- ============================================================================

-- Fonction de mise a jour du timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Fonction de mise a jour du vecteur de recherche JO
CREATE OR REPLACE FUNCTION jo.update_search_vector()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector :=
        setweight(to_tsvector('french', COALESCE(NEW.titre, '')), 'A') ||
        setweight(to_tsvector('french', COALESCE(NEW.titre_court, '')), 'A') ||
        setweight(to_tsvector('french', COALESCE(NEW.resume, '')), 'B') ||
        setweight(to_tsvector('french', COALESCE(NEW.dispositif, '')), 'C') ||
        setweight(to_tsvector('french', COALESCE(NEW.signataire, '')), 'D');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Fonction de generation de reference nomination
CREATE OR REPLACE FUNCTION nominations.generate_reference()
RETURNS TRIGGER AS $$
DECLARE
    year_part VARCHAR(4);
    seq_num INTEGER;
BEGIN
    year_part := TO_CHAR(NOW(), 'YYYY');
    SELECT COALESCE(MAX(CAST(SUBSTRING(reference FROM 10 FOR 4) AS INTEGER)), 0) + 1
    INTO seq_num
    FROM nominations.dossiers
    WHERE reference LIKE 'NOM-' || year_part || '-%';

    NEW.reference := 'NOM-' || year_part || '-' || LPAD(seq_num::TEXT, 4, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Fonction de generation de reference texte legislatif
CREATE OR REPLACE FUNCTION legislatif.generate_reference()
RETURNS TRIGGER AS $$
DECLARE
    prefix VARCHAR(5);
    year_part VARCHAR(4);
    seq_num INTEGER;
BEGIN
    prefix := CASE NEW.type
        WHEN 'loi_ordinaire' THEN 'PL'
        WHEN 'loi_organique' THEN 'PLO'
        WHEN 'ordonnance' THEN 'ORD'
        WHEN 'decret' THEN 'D'
        WHEN 'arrete' THEN 'A'
        WHEN 'decision' THEN 'DEC'
        WHEN 'circulaire' THEN 'CIR'
        WHEN 'instruction' THEN 'INS'
    END;

    year_part := TO_CHAR(NOW(), 'YYYY');
    SELECT COALESCE(MAX(CAST(SUBSTRING(reference FROM LENGTH(prefix) + 7 FOR 4) AS INTEGER)), 0) + 1
    INTO seq_num
    FROM legislatif.textes
    WHERE reference LIKE prefix || '-' || year_part || '-%';

    NEW.reference := prefix || '-' || year_part || '-' || LPAD(seq_num::TEXT, 4, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Fonction d'audit automatique
CREATE OR REPLACE FUNCTION auth.audit_trigger_func()
RETURNS TRIGGER AS $$
DECLARE
    v_user_id UUID;
BEGIN
    BEGIN
        v_user_id := current_setting('app.current_user_id', TRUE)::UUID;
    EXCEPTION WHEN OTHERS THEN
        v_user_id := NULL;
    END;

    IF TG_OP = 'DELETE' THEN
        INSERT INTO auth.audit_logs (user_id, action, module, table_name, record_id, old_values)
        VALUES (v_user_id, 'DELETE', TG_TABLE_SCHEMA, TG_TABLE_NAME, OLD.id, to_jsonb(OLD));
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO auth.audit_logs (user_id, action, module, table_name, record_id, old_values, new_values)
        VALUES (v_user_id, 'UPDATE', TG_TABLE_SCHEMA, TG_TABLE_NAME, NEW.id, to_jsonb(OLD), to_jsonb(NEW));
        RETURN NEW;
    ELSIF TG_OP = 'INSERT' THEN
        INSERT INTO auth.audit_logs (user_id, action, module, table_name, record_id, new_values)
        VALUES (v_user_id, 'INSERT', TG_TABLE_SCHEMA, TG_TABLE_NAME, NEW.id, to_jsonb(NEW));
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Triggers updated_at
CREATE TRIGGER update_auth_users_updated_at BEFORE UPDATE ON auth.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_institutions_updated_at BEFORE UPDATE ON institutions.institutions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_gar_objectifs_updated_at BEFORE UPDATE ON gar.objectifs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_gar_rapports_updated_at BEFORE UPDATE ON gar.rapports
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_nominations_dossiers_updated_at BEFORE UPDATE ON nominations.dossiers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_legislatif_textes_updated_at BEFORE UPDATE ON legislatif.textes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_egop_conseils_updated_at BEFORE UPDATE ON egop.conseils
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_egop_reunions_updated_at BEFORE UPDATE ON egop.reunions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_egop_courriers_updated_at BEFORE UPDATE ON egop.courriers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_jo_numeros_updated_at BEFORE UPDATE ON jo.numeros
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_jo_textes_updated_at BEFORE UPDATE ON jo.textes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Triggers de generation de reference
CREATE TRIGGER generate_nomination_ref BEFORE INSERT ON nominations.dossiers
    FOR EACH ROW WHEN (NEW.reference IS NULL)
    EXECUTE FUNCTION nominations.generate_reference();

CREATE TRIGGER generate_texte_ref BEFORE INSERT ON legislatif.textes
    FOR EACH ROW WHEN (NEW.reference IS NULL)
    EXECUTE FUNCTION legislatif.generate_reference();

-- Trigger de recherche full-text JO
CREATE TRIGGER update_jo_search BEFORE INSERT OR UPDATE ON jo.textes
    FOR EACH ROW EXECUTE FUNCTION jo.update_search_vector();

-- Triggers d'audit
CREATE TRIGGER audit_nominations_dossiers AFTER INSERT OR UPDATE OR DELETE ON nominations.dossiers
    FOR EACH ROW EXECUTE FUNCTION auth.audit_trigger_func();

CREATE TRIGGER audit_legislatif_textes AFTER INSERT OR UPDATE OR DELETE ON legislatif.textes
    FOR EACH ROW EXECUTE FUNCTION auth.audit_trigger_func();

CREATE TRIGGER audit_auth_user_roles AFTER INSERT OR UPDATE OR DELETE ON auth.user_roles
    FOR EACH ROW EXECUTE FUNCTION auth.audit_trigger_func();

-- ============================================================================
-- DONNEES INITIALES
-- ============================================================================

-- Priorites PAG 2026 (8 priorites presidentielles)
INSERT INTO gar.priorites_pag (code, priorite, titre, icone, couleur, ordre) VALUES
('PAG-001', 'sante', 'Sante pour Tous', 'Heart', '#EF4444', 1),
('PAG-002', 'education', 'Education de Qualite', 'GraduationCap', '#3B82F6', 2),
('PAG-003', 'infrastructure', 'Infrastructures Modernes', 'Building2', '#8B5CF6', 3),
('PAG-004', 'agriculture', 'Securite Alimentaire', 'Wheat', '#22C55E', 4),
('PAG-005', 'numerique', 'Transformation Numerique', 'Laptop', '#06B6D4', 5),
('PAG-006', 'emploi', 'Emploi des Jeunes', 'Users', '#F59E0B', 6),
('PAG-007', 'environnement', 'Developpement Durable', 'TreePine', '#10B981', 7),
('PAG-008', 'gouvernance', 'Bonne Gouvernance', 'Shield', '#6366F1', 8);

-- Institutions principales
INSERT INTO institutions.institutions (code, nom, nom_court, sigle, type, ordre_protocole) VALUES
('PRESIDENCE', 'Presidence de la Republique', 'Presidence', 'PR', 'presidence', 1),
('SGPR', 'Secretariat General de la Presidence de la Republique', 'SGPR', 'SGPR', 'secretariat_general', 2),
('PRIMATURE', 'Primature', 'Primature', 'PM', 'primature', 3),
('SGG', 'Secretariat General du Gouvernement', 'SGG', 'SGG', 'secretariat_general', 4),
('AN', 'Assemblee Nationale', 'Assemblee Nationale', 'AN', 'assemblee', 10),
('SENAT', 'Senat', 'Senat', 'SEN', 'senat', 11),
('CE', 'Conseil d''Etat', 'Conseil d''Etat', 'CE', 'juridiction', 20),
('CC', 'Cour Constitutionnelle', 'Cour Constitutionnelle', 'CC', 'juridiction', 21),
('DGJO', 'Direction Generale du Journal Officiel', 'DGJO', 'DGJO', 'direction_generale', 30);

-- Ministeres (exemples selon le gouvernement)
INSERT INTO institutions.institutions (code, nom, nom_court, sigle, type, ordre_protocole) VALUES
('MIN_ECO', 'Ministere de l''Economie et des Participations', 'Economie', 'MEP', 'ministere', 100),
('MIN_BUDGET', 'Ministere du Budget et des Comptes Publics', 'Budget', 'MBP', 'ministere', 101),
('MIN_INT', 'Ministere de l''Interieur et de la Securite', 'Interieur', 'MIS', 'ministere', 102),
('MIN_JUST', 'Ministere de la Justice, Garde des Sceaux', 'Justice', 'MJ', 'ministere', 103),
('MIN_DEF', 'Ministere de la Defense Nationale', 'Defense', 'MDN', 'ministere', 104),
('MIN_AE', 'Ministere des Affaires Etrangeres', 'Affaires Etrangeres', 'MAE', 'ministere', 105),
('MIN_SANTE', 'Ministere de la Sante', 'Sante', 'MS', 'ministere', 106),
('MIN_EDUC', 'Ministere de l''Education Nationale', 'Education', 'MEN', 'ministere', 107),
('MIN_ENSUP', 'Ministere de l''Enseignement Superieur', 'Enseignement Superieur', 'MES', 'ministere', 108),
('MIN_NUM', 'Ministere de l''Economie Numerique', 'Numerique', 'MEN', 'ministere', 109),
('MIN_ENERGIE', 'Ministere de l''Energie et des Ressources Hydrauliques', 'Energie', 'MERH', 'ministere', 110),
('MIN_MINES', 'Ministere des Mines et de la Geologie', 'Mines', 'MMG', 'ministere', 111),
('MIN_TRAVAIL', 'Ministere du Travail et de l''Emploi', 'Travail', 'MTE', 'ministere', 112),
('MIN_AGRI', 'Ministere de l''Agriculture et de l''Elevage', 'Agriculture', 'MAE', 'ministere', 113),
('MIN_ENVIRO', 'Ministere de l''Environnement et des Forets', 'Environnement', 'MEF', 'ministere', 114),
('MIN_TRANS', 'Ministere des Transports', 'Transports', 'MT', 'ministere', 115),
('MIN_HABITAT', 'Ministere de l''Habitat et de l''Urbanisme', 'Habitat', 'MHU', 'ministere', 116),
('MIN_JEUNESSE', 'Ministere de la Jeunesse et des Sports', 'Jeunesse', 'MJS', 'ministere', 117),
('MIN_CULTURE', 'Ministere de la Culture et des Arts', 'Culture', 'MCA', 'ministere', 118),
('MIN_COMM', 'Ministere de la Communication', 'Communication', 'MC', 'ministere', 119);

-- Permissions par role et module (matrice RBAC)
INSERT INTO auth.role_permissions (role, module, permission) VALUES
-- Admin SGG - Acces complet
('admin_sgg', 'gar', 'admin'),
('admin_sgg', 'nominations', 'admin'),
('admin_sgg', 'legislatif', 'admin'),
('admin_sgg', 'egop', 'admin'),
('admin_sgg', 'jo', 'admin'),

-- Directeur SGG
('directeur_sgg', 'gar', 'approve'),
('directeur_sgg', 'nominations', 'approve'),
('directeur_sgg', 'legislatif', 'approve'),
('directeur_sgg', 'egop', 'write'),
('directeur_sgg', 'jo', 'read'),

-- SG Ministere
('sg_ministere', 'gar', 'write'),
('sg_ministere', 'nominations', 'write'),
('sg_ministere', 'legislatif', 'write'),
('sg_ministere', 'egop', 'read'),
('sg_ministere', 'jo', 'read'),

-- SGPR
('sgpr', 'gar', 'read'),
('sgpr', 'nominations', 'approve'),
('sgpr', 'legislatif', 'approve'),
('sgpr', 'egop', 'read'),
('sgpr', 'jo', 'read'),

-- DGJO
('dgjo', 'jo', 'publish'),
('dgjo', 'jo', 'write'),
('dgjo', 'legislatif', 'read'),
('dgjo', 'nominations', 'read'),

-- Citoyen
('citoyen', 'jo', 'read');

-- Utilisateur admin par defaut
INSERT INTO auth.users (email, password_hash, full_name, is_active, is_verified) VALUES
('admin@sgg.ga', crypt('ChangeMe2026!', gen_salt('bf')), 'Administrateur SGG', TRUE, TRUE);

-- Attribuer le role admin_sgg
INSERT INTO auth.user_roles (user_id, role, is_primary)
SELECT id, 'admin_sgg', TRUE FROM auth.users WHERE email = 'admin@sgg.ga';

-- ============================================================================
-- COMMENTAIRES DE DOCUMENTATION
-- ============================================================================

COMMENT ON SCHEMA auth IS 'Schema d''authentification et gestion des roles (RBAC)';
COMMENT ON SCHEMA gar IS 'Schema GAR - Gestion Axee sur les Resultats (PAG 2026)';
COMMENT ON SCHEMA nominations IS 'Schema de gestion des nominations aux emplois superieurs';
COMMENT ON SCHEMA legislatif IS 'Schema du cycle legislatif en 8 etapes';
COMMENT ON SCHEMA egop IS 'Schema e-GOP - Conseils, Reunions, Courrier electronique';
COMMENT ON SCHEMA jo IS 'Schema Journal Officiel - Open Data';
COMMENT ON SCHEMA institutions IS 'Schema de cartographie institutionnelle';

COMMENT ON TABLE auth.users IS 'Utilisateurs de la plateforme SGG Digital';
COMMENT ON TABLE auth.user_roles IS 'Attribution des 12 roles aux utilisateurs';
COMMENT ON TABLE auth.role_permissions IS 'Matrice des permissions par role et module';

COMMENT ON TABLE gar.priorites_pag IS 'Les 8 priorites presidentielles du PAG 2026';
COMMENT ON TABLE gar.objectifs IS 'Objectifs strategiques lies aux priorites PAG';
COMMENT ON TABLE gar.rapports IS 'Rapports mensuels GAR des ministeres (matrice 21 colonnes)';

COMMENT ON TABLE nominations.dossiers IS 'Dossiers de nomination avec workflow complet';
COMMENT ON TABLE nominations.postes IS 'Emplois superieurs de l''Etat';
COMMENT ON TABLE nominations.candidats IS 'Candidats aux nominations';

COMMENT ON TABLE legislatif.textes IS 'Projets de textes legislatifs (cycle 8 etapes)';
COMMENT ON TABLE legislatif.avis IS 'Avis du Conseil d''Etat et Cour Constitutionnelle';

COMMENT ON TABLE egop.conseils IS 'Conseils des Ministres et Interministeriels';
COMMENT ON TABLE egop.reunions IS 'Reunions Interministerielles (RIM)';
COMMENT ON TABLE egop.courriers IS 'Courrier electronique gouvernemental';

COMMENT ON TABLE jo.numeros IS 'Numeros du Journal Officiel';
COMMENT ON TABLE jo.textes IS 'Textes publies au Journal Officiel';

COMMENT ON TABLE institutions.institutions IS 'Cartographie des institutions de l''Etat';
COMMENT ON TABLE institutions.interactions IS 'Interactions et flux entre institutions';
