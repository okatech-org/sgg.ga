# SGG Digital — Souveraineté des Données & Architecture Infrastructure

> **Document NEXUS-OMEGA M4** | Version 1.0 | Février 2026

---

## 1. Principes de Souveraineté

Le SGG Digital garantit la **souveraineté numérique** des données de l'État gabonais :

| Principe | Implémentation |
|----------|----------------|
| **Localisation des données** | Google Cloud SQL europe-west1 (Belgique, UE) — RGPD compliant |
| **Contrôle des accès** | Utilisateur applicatif dédié `sgg_app` — pas de superuser en prod |
| **Chiffrement en transit** | SSL/TLS obligatoire (`sslmode=require`) |
| **Chiffrement au repos** | Google Cloud SQL : chiffrement AES-256 natif |
| **Réversibilité** | Export PostgreSQL standard — aucun vendor lock-in |
| **Traçabilité** | Schema `neocortex.*` — historique complet de toutes les actions |
| **Résidence des données** | Aucune donnée dans des services tiers non-européens |

---

## 2. Architecture de Base de Données

### 2.1 Instance Hub

```
🏗️ Instance Hub : idetude-db
├── IP publique : 35.195.248.19 (dev — sera supprimée en prod)
├── IP privée : VPC peering (production)
├── PostgreSQL : 15
├── Région : europe-west1
└── Backup : Quotidien 02:00 UTC, rétention 30 jours, PITR 7 jours
```

### 2.2 Base de données : db_sgg

```
📦 db_sgg
├── 📂 auth           — Authentification, RBAC (12 rôles), sessions, audit
├── 📂 gar            — Gestion Axée sur les Résultats (PAG 2026)
├── 📂 nominations    — Workflow des nominations
├── 📂 legislatif     — Cycle législatif en 8 étapes
├── 📂 egop           — e-GOP (CI, RIM, Courrier)
├── 📂 jo             — Journal Officiel Open Data
├── 📂 institutions   — Cartographie institutionnelle
├── 📂 neocortex      — Système nerveux digital (signaux, historique, config)
└── 📂 public         — schema_migrations, extensions
```

### 2.3 Schéma NEOCORTEX — Tables Bio-Inspirées

| Table | Rôle | Index |
|-------|------|-------|
| `neocortex.signaux` | Bus central de signaux pondérés | 7 index |
| `neocortex.historique_actions` | Mémoire exhaustive (Hippocampe) | 4 index |
| `neocortex.config_systeme` | Configuration dynamique (Plasticité) | 2 index |
| `neocortex.metriques` | Monitoring cortex | 3 index |
| `neocortex.poids_adaptatifs` | Poids synaptiques auto-ajustés | 1 index |
| `neocortex.notifications` | Notifications multi-canal (Auditif) | 2 index + RLS |
| `neocortex.taches_async` | File d'attente async (Moteur) | 3 index |
| `neocortex.stats_quotidiennes` | Vue matérialisée (circadien) | 1 unique |

---

## 3. Sécurité

### 3.1 Utilisateurs BDD

| Utilisateur | Usage | Permissions |
|-------------|-------|-------------|
| `postgres` | DBA uniquement — migrations, maintenance | Superuser |
| `sgg_app` | Backend applicatif | CRUD sur tous les schemas, aucun DDL |

### 3.2 Row Level Security (RLS)

- `neocortex.notifications` : chaque utilisateur ne voit que SES notifications
- Politique système : le backend peut lire toutes les notifications sans `app.current_user_id`

### 3.3 Contraintes d'Intégrité

- Email format vérifié (`chk_users_email_format`)
- Téléphone format vérifié (`chk_users_phone_format`)
- Password hash non vide (`chk_users_password_hash_notempty`)
- Trigger `updated_at` automatique sur toutes les tables avec ce champ

---

## 4. Variables d'Environnement

### 4.1 Développement (`backend/.env`)

```
DATABASE_URL="postgresql://postgres:xxx@35.195.248.19:5432/db_sgg"
```

### 4.2 Production (via GCP Secret Manager)

```
DATABASE_URL="postgresql://sgg_app:STRONG@PRIVATE_IP:5432/db_sgg?sslmode=require"
```

### 4.3 Checklist

- [x] `.env.local` (dev) configuré
- [x] `.env.production.example` documenté
- [x] `.gitignore` couvre tous les `.env*`
- [x] Aucun secret dans le code source
- [x] Templates `.env.example` à jour

---

## 5. Migrations

### 5.1 Système

Runner : `database/migrate.sh` — exécute les fichiers `.sql` dans `database/migrations/` en ordre.

```bash
# Voir l'état
./database/migrate.sh --status

# Exécuter les pendantes
./database/migrate.sh
```

### 5.2 Registre

| Version | Nom | Description |
|---------|-----|-------------|
| 001 | `neocortex_schema` | 7 tables NEOCORTEX, 18 index, seed data |
| 002 | `create_app_user` | Utilisateur `sgg_app` avec permissions minimales |
| 003 | `security_hardening` | Index perf, contraintes, triggers, RLS, vue matérialisée |

---

## 6. Infrastructure GCP

### 6.1 Terraform

Fichier : `infrastructure/terraform/main.tf` (804 lignes)

| Ressource | Type |
|-----------|------|
| VPC + Subnets | `google_compute_network`, `subnetwork` |
| Cloud SQL | `google_sql_database_instance` (PostgreSQL 15) |
| Cloud Run API | `google_cloud_run_v2_service` (Node.js) |
| Cloud Run Frontend | `google_cloud_run_v2_service` (React/Nginx) |
| Redis | `google_redis_instance` (7.0 HA) |
| Storage (3 buckets) | `google_storage_bucket` |
| Secret Manager | `google_secret_manager_secret` (DB, JWT, Redis) |
| Cloud Armor (WAF) | `google_compute_security_policy` |
| Scheduler (3 crons) | `google_cloud_scheduler_job` |
| Monitoring + Alerting | Uptime checks, alert policies |

### 6.2 Coûts estimés

~$825/mois en production (voir `infrastructure/gcp-architecture.md`)

---

## 7. Health Checks

| Endpoint | Rôle |
|----------|------|
| `GET /api/health` | Status simple (pour LB) |
| `GET /api/health/detailed` | BDD + Redis + latences |
| `GET /api/health/ready` | Readiness (Cloud Run) |
| `GET /api/health/live` | Liveness (Cloud Run) |
| `GET /api/health/infra` | Diagnostic M4 complet (dev only) |

---

## 8. Architecture Décidée : Express + PostgreSQL (PAS Convex)

Le M4 NEXUS-OMEGA prévoyait une architecture hybride Convex + PostgreSQL, mais le projet SGG Digital utilise une architecture **Express + PostgreSQL pure** :

- **Temps réel** : géré par le backend Express + polling React Query
- **Source de vérité** : PostgreSQL (schéma `neocortex.*`)
- **Signaux** : stockés dans `neocortex.signaux` (PAS dans Convex)
- **Configuration dynamique** : `neocortex.config_systeme`

Cette architecture est **plus souveraine** qu'un modèle hybride car toutes les données restent dans l'infrastructure contrôlée (Cloud SQL).

---

*Document généré par NEXUS-OMEGA M4 — Février 2026*
