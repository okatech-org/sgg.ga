#!/bin/bash
# ============================================================================
# SGG DIGITAL — Script de migration automatique
# Exécute les migrations non encore appliquées dans l'ordre
# ============================================================================
# Usage :
#   ./database/migrate.sh                  # Exécute les migrations pendantes
#   ./database/migrate.sh --status         # Affiche l'état des migrations
#   ./database/migrate.sh --rollback 003   # Rollback d'une migration (si disponible)
# ============================================================================

set -euo pipefail

# ── Configuration ──────────────────────────────────────────────────────────
MIGRATIONS_DIR="$(cd "$(dirname "$0")/migrations" && pwd)"
PSQL="${PSQL_PATH:-/opt/homebrew/opt/libpq/bin/psql}"
HOST="${DB_HOST:-35.195.248.19}"
PORT="${DB_PORT:-5432}"
DATABASE="${DB_NAME:-db_sgg}"
USER="${DB_USER:-postgres}"

# Couleurs
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info()    { echo -e "${BLUE}ℹ $1${NC}"; }
log_success() { echo -e "${GREEN}✅ $1${NC}"; }
log_warn()    { echo -e "${YELLOW}⚠️  $1${NC}"; }
log_error()   { echo -e "${RED}❌ $1${NC}"; }

# ── Vérification mot de passe ─────────────────────────────────────────────
if [ -z "${PGPASSWORD:-}" ]; then
  log_warn "Variable PGPASSWORD non définie"
  read -sp "Mot de passe PostgreSQL pour $USER@$HOST : " PGPASSWORD
  export PGPASSWORD
  echo ""
fi

# ── Test de connexion ─────────────────────────────────────────────────────
log_info "Test de connexion à $DATABASE@$HOST..."
if ! $PSQL -h "$HOST" -p "$PORT" -U "$USER" -d "$DATABASE" -c "SELECT 1;" > /dev/null 2>&1; then
  log_error "Impossible de se connecter à la base de données"
  exit 1
fi
log_success "Connexion OK"

# ── Créer la table de suivi si nécessaire ─────────────────────────────────
$PSQL -h "$HOST" -p "$PORT" -U "$USER" -d "$DATABASE" -q <<'SQL'
CREATE TABLE IF NOT EXISTS public.schema_migrations (
    id              SERIAL PRIMARY KEY,
    version         VARCHAR(20) NOT NULL UNIQUE,
    name            VARCHAR(255) NOT NULL,
    executed_at     TIMESTAMPTZ DEFAULT NOW(),
    checksum        VARCHAR(64),
    execution_ms    INTEGER
);
SQL

# ── Mode --status ─────────────────────────────────────────────────────────
if [ "${1:-}" = "--status" ]; then
  echo ""
  echo "═══════════════════════════════════════════════════════════"
  echo " État des migrations — $DATABASE"
  echo "═══════════════════════════════════════════════════════════"
  
  # Lister les migrations appliquées
  echo ""
  log_info "Migrations appliquées :"
  $PSQL -h "$HOST" -p "$PORT" -U "$USER" -d "$DATABASE" -c \
    "SELECT version, name, executed_at, execution_ms || 'ms' as duration FROM public.schema_migrations ORDER BY version;"
  
  # Lister les migrations pendantes
  echo ""
  log_info "Migrations disponibles sur disque :"
  for f in "$MIGRATIONS_DIR"/*.sql; do
    [ -f "$f" ] || continue
    version=$(basename "$f" | cut -d_ -f1)
    name=$(basename "$f" .sql | cut -d_ -f2-)
    
    applied=$($PSQL -h "$HOST" -p "$PORT" -U "$USER" -d "$DATABASE" -tAc \
      "SELECT COUNT(*) FROM public.schema_migrations WHERE version = '$version';")
    
    if [ "$applied" -gt 0 ]; then
      echo -e "  ${GREEN}✓ $version — $name${NC}"
    else
      echo -e "  ${YELLOW}○ $version — $name (PENDANTE)${NC}"
    fi
  done
  echo ""
  exit 0
fi

# ── Exécuter les migrations pendantes ─────────────────────────────────────
echo ""
echo "═══════════════════════════════════════════════════════════"
echo " Migration Runner — $DATABASE"
echo "═══════════════════════════════════════════════════════════"
echo ""

APPLIED=0
SKIPPED=0
FAILED=0

for f in "$MIGRATIONS_DIR"/*.sql; do
  [ -f "$f" ] || continue
  
  version=$(basename "$f" | cut -d_ -f1)
  name=$(basename "$f" .sql | cut -d_ -f2-)
  checksum=$(md5 -q "$f" 2>/dev/null || md5sum "$f" | cut -d' ' -f1)
  
  # Vérifier si déjà appliquée
  already_applied=$($PSQL -h "$HOST" -p "$PORT" -U "$USER" -d "$DATABASE" -tAc \
    "SELECT COUNT(*) FROM public.schema_migrations WHERE version = '$version';")
  
  if [ "$already_applied" -gt 0 ]; then
    log_info "Skipping $version ($name) — déjà appliquée"
    SKIPPED=$((SKIPPED + 1))
    continue
  fi
  
  # Exécuter la migration
  log_info "Exécution de $version — $name..."
  START_TIME=$(date +%s%N)
  
  if $PSQL -h "$HOST" -p "$PORT" -U "$USER" -d "$DATABASE" -f "$f" > /dev/null 2>&1; then
    END_TIME=$(date +%s%N)
    DURATION_MS=$(( (END_TIME - START_TIME) / 1000000 ))
    
    # Enregistrer la migration
    $PSQL -h "$HOST" -p "$PORT" -U "$USER" -d "$DATABASE" -q -c \
      "INSERT INTO public.schema_migrations (version, name, checksum, execution_ms) 
       VALUES ('$version', '$name', '$checksum', $DURATION_MS) 
       ON CONFLICT (version) DO NOTHING;"
    
    log_success "$version — $name (${DURATION_MS}ms)"
    APPLIED=$((APPLIED + 1))
  else
    log_error "Échec de $version — $name"
    FAILED=$((FAILED + 1))
    exit 1
  fi
done

echo ""
echo "═══════════════════════════════════════════════════════════"
if [ $FAILED -gt 0 ]; then
  log_error "Résultat : $APPLIED appliquées, $SKIPPED ignorées, $FAILED en échec"
else
  log_success "Résultat : $APPLIED appliquées, $SKIPPED ignorées"
fi
echo "═══════════════════════════════════════════════════════════"
echo ""
