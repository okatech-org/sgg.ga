-- ============================================================================
-- NEXUS-OMEGA M4 — Renforcement Sécurité & Performance BDD
-- Migration 003 : Index manquants, contraintes d'intégrité, audit trigger
-- ============================================================================
-- Idempotent : utilise IF NOT EXISTS partout.
-- ============================================================================

-- ── 1. Table de suivi des migrations ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.schema_migrations (
    id              SERIAL PRIMARY KEY,
    version         VARCHAR(20) NOT NULL UNIQUE,
    name            VARCHAR(255) NOT NULL,
    executed_at     TIMESTAMPTZ DEFAULT NOW(),
    checksum        VARCHAR(64),
    execution_ms    INTEGER
);

-- Enregistrer les migrations précédentes si pas déjà fait
INSERT INTO public.schema_migrations (version, name) VALUES
    ('001', 'neocortex_schema'),
    ('002', 'create_app_user'),
    ('003', 'security_hardening')
ON CONFLICT (version) DO NOTHING;

-- ── 2. Index supplémentaires pour performance ─────────────────────────────

-- Index covering pour les notifications non-lues (requête la plus fréquente du frontend)
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread 
    ON neocortex.notifications(user_id, created_at DESC) 
    WHERE lu = FALSE;

-- Index pour le nettoyage circadien des signaux expirés
CREATE INDEX IF NOT EXISTS idx_signaux_ttl_cleanup 
    ON neocortex.signaux(created_at, ttl_seconds) 
    WHERE ttl_seconds IS NOT NULL;

-- Index pour les tâches async prêtes à exécuter (cortex moteur polling)
CREATE INDEX IF NOT EXISTS idx_taches_ready 
    ON neocortex.taches_async(prochaine_exec, priorite) 
    WHERE statut = 'en_attente';

-- Index partiel pour les sessions actives uniquement
CREATE INDEX IF NOT EXISTS idx_sessions_active 
    ON auth.sessions(user_id, expires_at) 
    WHERE expires_at > NOW();

-- Index GIN sur payload JSONB des signaux (recherche dans le contenu)
CREATE INDEX IF NOT EXISTS idx_signaux_payload_gin 
    ON neocortex.signaux USING gin(payload);

-- Index sur les métriques les plus récentes par nom
CREATE INDEX IF NOT EXISTS idx_metriques_recent 
    ON neocortex.metriques(nom, created_at DESC) 
    INCLUDE (valeur, unite);

-- ── 3. Contraintes d'intégrité manquantes ─────────────────────────────────

-- Contrainte : email format basique
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chk_users_email_format'
  ) THEN
    ALTER TABLE auth.users ADD CONSTRAINT chk_users_email_format
      CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');
  END IF;
END $$;

-- Contrainte : téléphone format basique (optionnel, donc NULL autorisé)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chk_users_phone_format'
  ) THEN
    ALTER TABLE auth.users ADD CONSTRAINT chk_users_phone_format
      CHECK (phone IS NULL OR phone ~ '^\+?[0-9\s\-]{6,20}$');
  END IF;
END $$;

-- Contrainte : password_hash non vide
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chk_users_password_hash_notempty'
  ) THEN
    ALTER TABLE auth.users ADD CONSTRAINT chk_users_password_hash_notempty
      CHECK (length(password_hash) >= 8);
  END IF;
END $$;

-- ── 4. Trigger pour mise à jour automatique de updated_at ─────────────────

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Appliquer sur les tables avec updated_at
DO $$
DECLARE
  tbl RECORD;
BEGIN
  FOR tbl IN
    SELECT schemaname, tablename
    FROM pg_tables
    WHERE (schemaname IN ('auth', 'gar', 'nominations', 'legislatif', 'egop', 'jo', 'institutions', 'neocortex'))
    AND tablename IN (
      SELECT table_name FROM information_schema.columns 
      WHERE column_name = 'updated_at'
    )
  LOOP
    EXECUTE format(
      'DROP TRIGGER IF EXISTS trigger_updated_at ON %I.%I; 
       CREATE TRIGGER trigger_updated_at 
         BEFORE UPDATE ON %I.%I 
         FOR EACH ROW 
         EXECUTE FUNCTION update_updated_at_column()',
      tbl.schemaname, tbl.tablename,
      tbl.schemaname, tbl.tablename
    );
  END LOOP;
END $$;

-- ── 5. Politique de rétention des données (nettoyage automatique) ────────

-- Vue matérialisée pour les stats d'utilisation (rafraîchie par le circadien)
CREATE MATERIALIZED VIEW IF NOT EXISTS neocortex.stats_quotidiennes AS
  SELECT 
    DATE(created_at) as jour,
    COUNT(*) FILTER (WHERE TRUE) as total_signaux,
    COUNT(*) FILTER (WHERE traite = TRUE) as signaux_traites,
    COUNT(*) FILTER (WHERE priorite = 'CRITICAL') as signaux_critiques,
    AVG(CASE WHEN traite THEN 1.0 ELSE 0 END) as taux_traitement
  FROM neocortex.signaux
  WHERE created_at > NOW() - INTERVAL '90 days'
  GROUP BY DATE(created_at)
  ORDER BY jour DESC;

-- Index unique pour le REFRESH CONCURRENTLY
CREATE UNIQUE INDEX IF NOT EXISTS idx_stats_quot_jour 
    ON neocortex.stats_quotidiennes(jour);

-- ── 6. Row Level Security (RLS) sur les notifications ────────────────────
-- Les utilisateurs ne doivent voir que LEURS notifications

ALTER TABLE neocortex.notifications ENABLE ROW LEVEL SECURITY;

-- Politique : chaque utilisateur ne voit que ses propres notifications
-- Note : le backend utilise set_config('app.current_user_id', ...) 
--        avant chaque requête
DROP POLICY IF EXISTS notifications_user_policy ON neocortex.notifications;
CREATE POLICY notifications_user_policy ON neocortex.notifications
  USING (user_id::text = current_setting('app.current_user_id', true))
  WITH CHECK (user_id::text = current_setting('app.current_user_id', true));

-- Le rôle sgg_app est soumis au RLS
ALTER TABLE neocortex.notifications FORCE ROW LEVEL SECURITY;

-- Exception : créer une politique pour que le système puisse tout voir
-- (pour les tâches admin et le cortex moteur)
DROP POLICY IF EXISTS notifications_system_policy ON neocortex.notifications;
CREATE POLICY notifications_system_policy ON neocortex.notifications
  FOR ALL
  USING (current_setting('app.current_user_id', true) IS NULL 
         OR current_setting('app.current_user_id', true) = '')
  WITH CHECK (TRUE);

-- ============================================================================
-- DONE — Migration 003 : Sécurité renforcée
-- • 6 index supplémentaires  
-- • 3 contraintes d'intégrité
-- • Trigger updated_at automatique
-- • Vue matérialisée stats quotidiennes
-- • RLS sur notifications
-- • Table schema_migrations pour le versioning
-- ============================================================================
