-- ============================================================================
-- NEXUS-OMEGA M2 — NEOCORTEX Schema Bio-Inspiré
-- Migration 001 : Tables du système nerveux digital
-- ============================================================================

-- Create NEOCORTEX schema
CREATE SCHEMA IF NOT EXISTS neocortex;

-- ── 💓 SIGNAUX (Système Limbique) ──────────────────────────────────────────
-- Bus central de signaux pondérés. Chaque mutation émet un signal.
CREATE TABLE neocortex.signaux (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type            VARCHAR(100) NOT NULL,           -- Ex: NOMINATION_CREEE, GAR_RAPPORT_SOUMIS
    source          VARCHAR(100) NOT NULL,           -- Cortex émetteur (METIER, SYSTEME, UTILISATEUR)
    destination     VARCHAR(100),                    -- Cortex cible (NULL = broadcast)
    entite_type     VARCHAR(80),                     -- Ex: nomination, objectif_gar, texte_legislatif
    entite_id       UUID,                            -- ID de l'entité concernée
    payload         JSONB DEFAULT '{}',              -- Données du signal (flexible)
    confiance       NUMERIC(3,2) DEFAULT 1.0         -- 0.00 à 1.00 (poids du signal)
                    CHECK (confiance >= 0 AND confiance <= 1),
    priorite        VARCHAR(10) NOT NULL DEFAULT 'NORMAL'
                    CHECK (priorite IN ('LOW', 'NORMAL', 'HIGH', 'CRITICAL')),
    correlation_id  UUID NOT NULL,                   -- Regroupe les signaux liés
    parent_signal_id UUID REFERENCES neocortex.signaux(id),  -- Chaînage de signaux
    ttl_seconds     INTEGER,                         -- Durée de vie (NULL = permanent)
    traite          BOOLEAN DEFAULT FALSE,           -- A été routé/traité
    erreur          TEXT,                             -- Message d'erreur si échec
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Index optimisés pour requêtes fréquentes
CREATE INDEX idx_signaux_type ON neocortex.signaux(type);
CREATE INDEX idx_signaux_timestamp ON neocortex.signaux(created_at DESC);
CREATE INDEX idx_signaux_non_traite ON neocortex.signaux(traite, priorite) WHERE traite = FALSE;
CREATE INDEX idx_signaux_correlation ON neocortex.signaux(correlation_id);
CREATE INDEX idx_signaux_entite ON neocortex.signaux(entite_type, entite_id);

-- ── 📚 HISTORIQUE_ACTIONS (Hippocampe) ─────────────────────────────────────
-- Mémoire exhaustive de toutes les actions utilisateur et système
CREATE TABLE neocortex.historique_actions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action          VARCHAR(100) NOT NULL,           -- Ex: CREER, MODIFIER, SUPPRIMER
    categorie       VARCHAR(30) NOT NULL             -- METIER, SYSTEME, UTILISATEUR, SECURITE
                    CHECK (categorie IN ('METIER', 'SYSTEME', 'UTILISATEUR', 'SECURITE')),
    entite_type     VARCHAR(80) NOT NULL,            -- Type de l'entité
    entite_id       UUID,                            -- ID de l'entité
    user_id         UUID,                            -- Qui a fait l'action
    user_email      VARCHAR(255),                    -- Email de l'utilisateur
    user_role       VARCHAR(50),                     -- Rôle au moment de l'action
    details         JSONB DEFAULT '{}',              -- { avant: {...}, apres: {...} }
    metadata        JSONB DEFAULT '{}',              -- Contexte additionnel (IP, UA, etc.)
    correlation_id  UUID,                            -- Lien avec le signal limbique
    duration_ms     INTEGER,                         -- Durée d'exécution
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_historique_entite ON neocortex.historique_actions(entite_type, entite_id);
CREATE INDEX idx_historique_user ON neocortex.historique_actions(user_id, created_at DESC);
CREATE INDEX idx_historique_timestamp ON neocortex.historique_actions(created_at DESC);
CREATE INDEX idx_historique_categorie ON neocortex.historique_actions(categorie, action);

-- ── 🔧 CONFIG_SYSTEME (Plasticité) ────────────────────────────────────────
-- Configuration dynamique modifiable sans redéploiement
CREATE TABLE neocortex.config_systeme (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cle             VARCHAR(200) NOT NULL UNIQUE,    -- Ex: rate_limit.max_requests
    valeur          JSONB NOT NULL,                  -- Valeur (n'importe quel type JSON)
    description     TEXT,                            -- Description humaine
    categorie       VARCHAR(50) DEFAULT 'general',   -- Groupe logique
    modifie_par     UUID,                            -- Dernier utilisateur à modifier
    version         INTEGER DEFAULT 1,               -- Version pour optimistic locking
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_config_cle ON neocortex.config_systeme(cle);
CREATE INDEX idx_config_categorie ON neocortex.config_systeme(categorie);

-- ── 📈 METRIQUES (Monitoring Cortex) ──────────────────────────────────────
-- Métriques agrégées pour le monitoring du système
CREATE TABLE neocortex.metriques (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nom             VARCHAR(200) NOT NULL,           -- Ex: signaux.emis, gar.taux_execution
    valeur          NUMERIC NOT NULL,                -- Valeur numérique
    unite           VARCHAR(30),                     -- ms, count, percent, bytes
    periode         VARCHAR(20) NOT NULL             -- minute, heure, jour, semaine, mois
                    CHECK (periode IN ('minute', 'heure', 'jour', 'semaine', 'mois')),
    dimensions      JSONB DEFAULT '{}',              -- Labels additionnels { cortex: 'limbique' }
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_metriques_nom ON neocortex.metriques(nom, created_at DESC);
CREATE INDEX idx_metriques_periode ON neocortex.metriques(periode, created_at DESC);

-- ── 🧬 POIDS_ADAPTATIFS (Plasticité Synaptique) ──────────────────────────
-- Poids qui s'ajustent automatiquement en fonction des résultats
CREATE TABLE neocortex.poids_adaptatifs (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    signal_type             VARCHAR(100) NOT NULL,   -- Type de signal associé
    regle                   VARCHAR(200) NOT NULL,   -- Règle métier associée
    poids                   NUMERIC(5,4) DEFAULT 0.5 -- 0.0000 à 1.0000
                            CHECK (poids >= 0 AND poids <= 1),
    executions_reussies     INTEGER DEFAULT 0,
    executions_echouees     INTEGER DEFAULT 0,
    dernier_ajustement      TIMESTAMPTZ DEFAULT NOW(),
    created_at              TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(signal_type, regle)
);

CREATE INDEX idx_poids_signal ON neocortex.poids_adaptatifs(signal_type);

-- ── 👂 NOTIFICATIONS (Cortex Auditif) ─────────────────────────────────────
-- Notifications multi-canal pour les utilisateurs
CREATE TABLE neocortex.notifications (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL,                   -- Destinataire
    type            VARCHAR(50) NOT NULL,            -- info, alerte, action, systeme
    canal           VARCHAR(20) NOT NULL DEFAULT 'in_app'  -- in_app, email, sms
                    CHECK (canal IN ('in_app', 'email', 'sms')),
    titre           VARCHAR(500) NOT NULL,
    message         TEXT NOT NULL,
    lien            VARCHAR(500),                    -- URL vers l'action
    entite_type     VARCHAR(80),                     -- Entité liée
    entite_id       UUID,
    signal_id       UUID REFERENCES neocortex.signaux(id),  -- Signal source
    lu              BOOLEAN DEFAULT FALSE,
    lu_at           TIMESTAMPTZ,
    expire_at       TIMESTAMPTZ,                     -- Auto-expiration
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON neocortex.notifications(user_id, lu, created_at DESC);
CREATE INDEX idx_notifications_type ON neocortex.notifications(type, created_at DESC);

-- ── 🏃 TACHES_ASYNC (Cortex Moteur) ──────────────────────────────────────
-- File d'attente pour les actions externes asynchrones
CREATE TABLE neocortex.taches_async (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type            VARCHAR(100) NOT NULL,           -- Ex: ENVOYER_EMAIL, GENERER_PDF
    payload         JSONB NOT NULL DEFAULT '{}',     -- Données de la tâche
    statut          VARCHAR(20) NOT NULL DEFAULT 'en_attente'
                    CHECK (statut IN ('en_attente', 'en_cours', 'termine', 'echoue', 'annule')),
    priorite        INTEGER DEFAULT 5                -- 1 (haute) à 10 (basse)
                    CHECK (priorite >= 1 AND priorite <= 10),
    tentatives      INTEGER DEFAULT 0,
    max_tentatives  INTEGER DEFAULT 3,
    prochaine_exec  TIMESTAMPTZ DEFAULT NOW(),       -- Pour retry avec backoff
    resultat        JSONB,                           -- Résultat en cas de succès
    erreur          TEXT,                             -- Dernière erreur
    signal_id       UUID REFERENCES neocortex.signaux(id),
    created_by      UUID,
    started_at      TIMESTAMPTZ,
    completed_at    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_taches_statut ON neocortex.taches_async(statut, priorite, prochaine_exec)
    WHERE statut IN ('en_attente', 'en_cours');
CREATE INDEX idx_taches_type ON neocortex.taches_async(type, created_at DESC);

-- ── Seed config_systeme with defaults ──────────────────────────────────────

INSERT INTO neocortex.config_systeme (cle, valeur, description, categorie) VALUES
    ('rate_limit.global.max_requests', '200', 'Max requêtes par fenêtre de 15 min', 'securite'),
    ('rate_limit.auth.max_attempts', '10', 'Max tentatives de connexion', 'securite'),
    ('signal.ttl_default_seconds', '86400', 'TTL par défaut des signaux (24h)', 'limbique'),
    ('signal.batch_size', '100', 'Nombre de signaux traités par cycle', 'limbique'),
    ('historique.retention_jours', '365', 'Rétention de l'historique en jours', 'hippocampe'),
    ('metriques.aggregation_interval', '3600', 'Intervalle d'agrégation en secondes', 'monitoring'),
    ('notification.email_enabled', 'true', 'Activer les notifications par email', 'auditif'),
    ('notification.sms_enabled', 'false', 'Activer les notifications par SMS', 'auditif'),
    ('prefrontal.score_seuil_auto_approve', '0.85', 'Seuil de score pour approbation auto', 'prefrontal'),
    ('plasticite.ajustement_pas', '0.05', 'Pas d''ajustement des poids synaptiques', 'plasticite'),
    ('moteur.max_concurrent_tasks', '10', 'Tâches async simultanées max', 'moteur'),
    ('circadien.nettoyage_signaux_heure', '3', 'Heure de nettoyage quotidien (0-23)', 'circadien')
ON CONFLICT (cle) DO NOTHING;

-- ── Seed poids_adaptatifs with initial weights ─────────────────────────────

INSERT INTO neocortex.poids_adaptatifs (signal_type, regle, poids) VALUES
    ('NOMINATION_CREEE', 'notification_sg_ministere', 0.90),
    ('NOMINATION_CREEE', 'notification_admin_sgg', 0.95),
    ('NOMINATION_VALIDEE', 'notification_candidat', 0.80),
    ('GAR_RAPPORT_SOUMIS', 'validation_auto_si_complet', 0.70),
    ('GAR_RAPPORT_SOUMIS', 'notification_directeur', 0.85),
    ('TEXTE_LEGISLATIF_SOUMIS', 'analyse_prerequis', 0.75),
    ('TEXTE_LEGISLATIF_PUBLIE', 'notification_jo', 0.95),
    ('JO_PUBLICATION', 'notification_publique', 0.90),
    ('EGOP_CI_PLANIFIE', 'notification_participants', 0.85),
    ('PTM_INITIATIVE_SOUMISE', 'notification_validateur', 0.80),
    ('ALERTE_SYSTEME', 'notification_admin', 1.00),
    ('SECURITE_CONNEXION_ECHOUEE', 'blocage_temporaire', 0.60)
ON CONFLICT (signal_type, regle) DO NOTHING;

-- ============================================================================
-- DONE — NEOCORTEX schema created with 7 tables, 18 indexes, and seed data
-- ============================================================================
