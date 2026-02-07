#!/bin/bash
# ============================================================================
# SGG DIGITAL - Script de déploiement base de données
# Instance : idetude-db (35.195.248.19)
# Base : db_sgg
# ============================================================================

set -e

# Configuration
PSQL="/opt/homebrew/opt/libpq/bin/psql"
HOST="35.195.248.19"
PORT="5432"
DATABASE="db_sgg"
USER="postgres"

# Couleurs pour le terminal
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo ""
echo "=============================================="
echo " SGG DIGITAL - Déploiement Base de Données"
echo "=============================================="
echo ""

# Vérifier si le mot de passe est fourni
if [ -z "$PGPASSWORD" ]; then
  echo -e "${YELLOW}⚠️  Variable PGPASSWORD non définie${NC}"
  echo "Veuillez exécuter :"
  echo "  export PGPASSWORD='votre_mot_de_passe_postgres'"
  echo ""
  read -sp "Ou entrez le mot de passe PostgreSQL : " PGPASSWORD
  export PGPASSWORD
  echo ""
fi

# Fonction pour exécuter un script SQL
run_sql() {
  local script=$1
  local name=$2
  
  echo -e "${YELLOW}▶ Exécution de $name...${NC}"
  
  if $PSQL -h $HOST -p $PORT -U $USER -d $DATABASE -f "$script" 2>&1; then
    echo -e "${GREEN}✅ $name exécuté avec succès${NC}"
  else
    echo -e "${RED}❌ Erreur lors de l'exécution de $name${NC}"
    exit 1
  fi
  echo ""
}

# Vérifier la connexion
echo -e "${YELLOW}🔌 Test de connexion à Cloud SQL...${NC}"
if $PSQL -h $HOST -p $PORT -U $USER -d $DATABASE -c "SELECT 1;" > /dev/null 2>&1; then
  echo -e "${GREEN}✅ Connexion réussie à db_sgg${NC}"
else
  echo -e "${RED}❌ Impossible de se connecter à la base de données${NC}"
  echo "Vérifiez que :"
  echo "  - Votre IP est autorisée dans Cloud SQL"
  echo "  - Le mot de passe est correct"
  echo "  - L'instance est démarrée"
  exit 1
fi
echo ""

# Exécuter les scripts dans l'ordre
echo "=============================================="
echo " Étape 1/4 : Schéma de base de données"
echo "=============================================="
run_sql "database/schema.sql" "Schema (7 schemas, ~24 tables)"

echo "=============================================="
echo " Étape 2/4 : Utilisateurs et Rôles"
echo "=============================================="
run_sql "database/seed/01_users.sql" "15 comptes démo"

echo "=============================================="
echo " Étape 3/4 : Institutions"
echo "=============================================="
run_sql "database/seed/02_institutions.sql" "~45 institutions"

echo "=============================================="
echo " Étape 4/4 : PAG 2026"
echo "=============================================="
run_sql "database/seed/03_pag2026.sql" "8 priorités + 10 programmes"

# Vérification finale
echo "=============================================="
echo " Vérification"
echo "=============================================="

echo -e "${YELLOW}📊 Comptage des données...${NC}"
$PSQL -h $HOST -p $PORT -U $USER -d $DATABASE -c "
SELECT 'Utilisateurs' as table_name, COUNT(*) as count FROM auth.users
UNION ALL SELECT 'Rôles', COUNT(*) FROM auth.user_roles
UNION ALL SELECT 'Institutions', COUNT(*) FROM institutions.institutions
UNION ALL SELECT 'Priorités PAG', COUNT(*) FROM gar.priorites_pag
UNION ALL SELECT 'Objectifs', COUNT(*) FROM gar.objectifs
ORDER BY table_name;
"

echo ""
echo -e "${GREEN}=============================================="
echo " ✅ DÉPLOIEMENT TERMINÉ AVEC SUCCÈS"
echo "=============================================="
echo ""
echo " Base de données : db_sgg"
echo " Instance : idetude-db (35.195.248.19)"
echo " Projet : idetude"
echo "=============================================="
echo -e "${NC}"
