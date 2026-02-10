-- ============================================================================
-- NEXUS-OMEGA M4 — Sécurité BDD : Utilisateur Applicatif Dédié
-- Migration 002 : Créer l'utilisateur sgg_app avec permissions minimales
-- ============================================================================
-- IMPORTANT : Exécuter EN TANT QUE postgres (superuser) puis basculer le backend
-- vers sgg_app dans DATABASE_URL.
--
-- Ce script est idempotent (peut être rejoué sans erreur).
-- ============================================================================

-- 1. Créer le rôle applicatif (si inexistant)
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'sgg_app') THEN
    CREATE ROLE sgg_app WITH LOGIN PASSWORD 'CHANGE_ME_IN_PRODUCTION';
    RAISE NOTICE 'Rôle sgg_app créé';
  ELSE
    RAISE NOTICE 'Rôle sgg_app existe déjà';
  END IF;
END
$$;

-- 2. Accorder l'accès à la base de données
GRANT CONNECT ON DATABASE db_sgg TO sgg_app;

-- 3. Permissions par schéma — principe du moindre privilège
-- ── auth ──
GRANT USAGE ON SCHEMA auth TO sgg_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA auth TO sgg_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA auth TO sgg_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA auth
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO sgg_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA auth
  GRANT USAGE, SELECT ON SEQUENCES TO sgg_app;

-- ── gar ──
GRANT USAGE ON SCHEMA gar TO sgg_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA gar TO sgg_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA gar TO sgg_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA gar
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO sgg_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA gar
  GRANT USAGE, SELECT ON SEQUENCES TO sgg_app;

-- ── nominations ──
GRANT USAGE ON SCHEMA nominations TO sgg_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA nominations TO sgg_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA nominations TO sgg_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA nominations
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO sgg_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA nominations
  GRANT USAGE, SELECT ON SEQUENCES TO sgg_app;

-- ── legislatif ──
GRANT USAGE ON SCHEMA legislatif TO sgg_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA legislatif TO sgg_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA legislatif TO sgg_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA legislatif
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO sgg_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA legislatif
  GRANT USAGE, SELECT ON SEQUENCES TO sgg_app;

-- ── egop ──
GRANT USAGE ON SCHEMA egop TO sgg_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA egop TO sgg_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA egop TO sgg_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA egop
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO sgg_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA egop
  GRANT USAGE, SELECT ON SEQUENCES TO sgg_app;

-- ── jo ──
GRANT USAGE ON SCHEMA jo TO sgg_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA jo TO sgg_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA jo TO sgg_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA jo
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO sgg_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA jo
  GRANT USAGE, SELECT ON SEQUENCES TO sgg_app;

-- ── institutions ──
GRANT USAGE ON SCHEMA institutions TO sgg_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA institutions TO sgg_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA institutions TO sgg_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA institutions
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO sgg_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA institutions
  GRANT USAGE, SELECT ON SEQUENCES TO sgg_app;

-- ── neocortex ──
GRANT USAGE ON SCHEMA neocortex TO sgg_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA neocortex TO sgg_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA neocortex TO sgg_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA neocortex
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO sgg_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA neocortex
  GRANT USAGE, SELECT ON SEQUENCES TO sgg_app;

-- 4. Permissions sur les extensions (uuid, pgcrypto)
-- sgg_app peut appeler uuid_generate_v4() et gen_random_uuid()
GRANT USAGE ON SCHEMA public TO sgg_app;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO sgg_app;

-- 5. Permission pour set_config (audit logging)
-- Permet au backend de positionner app.current_user_id via SET
-- Aucune permission spéciale nécessaire pour set_config()

-- 6. Restrictions : PAS de CREATE, DROP, ALTER, TRUNCATE
-- sgg_app ne peut PAS modifier la structure de la BDD
-- Seul postgres (DBA) peut exécuter les migrations

-- ============================================================================
-- VÉRIFICATION : Lister les permissions accordées
-- ============================================================================
-- SELECT grantee, table_schema, table_name, privilege_type
-- FROM information_schema.table_privileges
-- WHERE grantee = 'sgg_app'
-- ORDER BY table_schema, table_name;

-- ============================================================================
-- DONE — Utilisateur applicatif sgg_app créé avec permissions minimales
-- ============================================================================
