# 📊 ANALYSE COMPLÈTE — SGG DIGITAL
## Secrétariat Général du Gouvernement - République Gabonaise

**Date d'analyse** : 6 février 2026  
**Version** : 2.0.0  
**Statut** : En développement actif

---

## 📋 TABLE DES MATIÈRES

1. [Vue d'ensemble du projet](#1-vue-densemble-du-projet)
2. [Architecture technique](#2-architecture-technique)
3. [Analyse des modules](#3-analyse-des-modules)
4. [Système des comptes démo](#4-système-des-comptes-démo)
5. [État actuel vs fonctionnel](#5-état-actuel-vs-fonctionnel)
6. [Plan d'implémentation](#6-plan-dimplémentation)
7. [Priorisation des tâches](#7-priorisation-des-tâches)

---

## 1. VUE D'ENSEMBLE DU PROJET

### 1.1 Mission
SGG Digital est la plateforme numérique du **Secrétariat Général du Gouvernement** du Gabon. Elle vise à digitaliser l'ensemble des processus gouvernementaux :
- Suivi du Plan d'Action Gouvernemental (PAG 2026)
- Gestion des nominations
- Cycle législatif
- Journal Officiel
- Conseils des Ministres (e-GOP)
- Cartographie institutionnelle

### 1.2 Stack Technologique

| Couche | Technologies |
|--------|-------------|
| **Frontend** | React 18 + TypeScript + Vite |
| **UI** | Tailwind CSS + Shadcn/UI |
| **State** | React Query (TanStack Query) |
| **Auth** | Supabase Auth |
| **Backend** | Express.js + TypeScript |
| **Database** | PostgreSQL (Google Cloud SQL) |
| **Cache** | Redis |
| **Storage** | Google Cloud Storage |
| **Hosting** | Google Cloud Run |

### 1.3 Structure du Projet

```
sgg.ga/
├── src/                    # Frontend React
│   ├── components/         # 103 composants UI
│   ├── pages/              # 33 pages
│   ├── data/               # Données mock (5 fichiers)
│   ├── hooks/              # 9 hooks personnalisés
│   ├── contexts/           # Auth + Theme
│   ├── services/           # API services
│   └── types/              # TypeScript types
├── backend/                # API Express
│   └── src/
│       ├── routes/         # 9 routes API
│       ├── config/         # DB, Redis, Storage
│       └── middleware/     # Auth middleware
├── database/               # Schema SQL (1872 lignes)
└── public/                 # Assets statiques
```

---

## 2. ARCHITECTURE TECHNIQUE

### 2.1 Schéma Base de Données

La base PostgreSQL utilise **7 schemas** distincts :

| Schema | Description | Tables principales |
|--------|-------------|-------------------|
| `auth` | Authentification & RBAC | users, user_roles, sessions, audit_logs |
| `gar` | Gestion Axée Résultats | priorites_pag, objectifs, rapports, indicateurs |
| `nominations` | Workflow nominations | postes, candidats, dossiers, documents, historique |
| `legislatif` | Cycle législatif 8 étapes | textes, amendements, votes |
| `egop` | e-GOP (CI, RIM, Courrier) | conseils, points_ordre, decisions |
| `jo` | Journal Officiel | numeros, articles, textes_publies |
| `institutions` | Cartographie | institutions, interactions |

### 2.2 Système de Rôles (RBAC)

12 rôles définis avec permissions granulaires par module :

```typescript
type AppRole = 
  | "admin_sgg"           // Accès complet
  | "directeur_sgg"       // Direction SGG
  | "sg_ministere"        // Secrétaire Général Ministère
  | "sgpr"                // Secrétariat Présidence
  | "premier_ministre"    // Cabinet PM
  | "ministre"            // Membres du gouvernement
  | "assemblee"           // Assemblée Nationale
  | "senat"               // Sénat
  | "conseil_etat"        // Conseil d'État
  | "cour_constitutionnelle" // Cour Constitutionnelle
  | "dgjo"                // Direction Journal Officiel
  | "citoyen";            // Accès public (JO only)
```

### 2.3 Architecture Frontend

```
                    ┌─────────────────┐
                    │   App.tsx       │
                    │  (Routes)       │
                    └────────┬────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
  ┌─────▼─────┐       ┌──────▼──────┐      ┌─────▼─────┐
  │  Public   │       │  Protected  │      │   Demo    │
  │  Routes   │       │   Routes    │      │   Mode    │
  └───────────┘       └─────────────┘      └───────────┘
        │                    │                    │
        │            ┌───────▼───────┐            │
        │            │ ProtectedRoute│◄───────────┘
        │            │  Component    │
        │            └───────────────┘
        │                    │
        │            ┌───────▼───────┐
        │            │  Auth Check   │
        │            │  Real / Demo  │
        │            └───────────────┘
```

---

## 3. ANALYSE DES MODULES

### 3.1 Modules Existants

| Module | Page | État UI | État API | Données |
|--------|------|---------|----------|---------|
| **Dashboard** | ✅ Complet | 6 sections par rôle | ❌ Mock | `demoData.ts` |
| **GAR** | ✅ Complet | Charts + Filtres | ❌ Mock | `pag2026Data.ts` |
| **Nominations** | ✅ Complet | Workflow 12 étapes | ❌ Mock | `demoData.ts` |
| **Matrice Reporting** | ✅ Complet | Tableau + Validation | ❌ Mock | `reportingData.ts` |
| **PTM/PTG** | ✅ Complet | 5 sous-pages | ❌ Mock | `ptmData.ts` |
| **Journal Officiel** | ✅ Complet | Public + Admin | ❌ Mock | `demoData.ts` |
| **Institutions** | ✅ Complet | Cartographie | ❌ Mock | Inline |
| **Cycle Législatif** | ✅ Complet | 8 étapes | ❌ Mock | Inline |
| **e-GOP** | ✅ Complet | CI + RIM | ❌ Mock | Inline |
| **Documents** | ✅ Complet | Gestion docs | ❌ Mock | Inline |
| **Profil** | ✅ Complet | Settings user | ❌ Mock | Inline |
| **Admin Users** | ✅ Complet | RBAC | ❌ Mock | Inline |

### 3.2 Points Forts Actuels

1. **UI Complète et Moderne** : Design system gouvernemental cohérent
2. **RBAC Sophistiqué** : 12 rôles avec permissions granulaires
3. **Dashboards Contextuels** : 6 types de dashboards selon le profil
4. **Comptes Démo Fonctionnels** : 15 profils utilisateurs simulés
5. **Workflow de Validation** : Matrice à 3 niveaux (Ministère → SGG → SGPR)
6. **Page PAG 2026** : Présentation publique complète du plan gouvernemental

### 3.3 Lacunes Identifiées

| Catégorie | Lacune | Impact |
|-----------|--------|--------|
| **Backend** | API routes non connectées à la DB | Toutes les données sont mock |
| **Auth** | Supabase configuré mais non utilisé pour les démos | Démos contournent l'auth |
| **Data** | Pas de persistance | Actions non sauvegardées |
| **Workflow** | Pas de notifications réelles | Pas d'alertes email |
| **Search** | Recherche non fonctionnelle | UI uniquement |
| **Export** | PDF/Excel non fonctionnels | UI uniquement |
| **Upload** | Upload fichiers non fonctionnel | UI uniquement |

---

## 4. SYSTÈME DES COMPTES DÉMO

### 4.1 Les 15 Comptes Disponibles

#### Catégorie EXÉCUTIF (5 comptes)
| ID | Titre | Accès Modules |
|----|-------|---------------|
| `president` | Président de la République | Dashboard, Nominations, Décisions |
| `vice-president` | Vice-Président | Conseil des Ministres, Dashboard |
| `premier-ministre` | Premier Ministre | CI, Coordination, Reporting |
| `ministre` | Ministre Sectoriel | GAR, Nominations, Matrice Reporting |
| `sg-ministere` | Secrétaire Général Ministère | Saisie GAR, Nominations, Documents |

#### Catégorie PRÉSIDENCE (1 compte)
| ID | Titre | Accès Modules |
|----|-------|---------------|
| `sgpr` | SGPR | Lecture Complète, Arbitrages, Validation SGPR |

#### Catégorie LÉGISLATIF (2 comptes)
| ID | Titre | Accès Modules |
|----|-------|---------------|
| `assemblee` | Assemblée Nationale | Projets de Loi, Cycle Législatif |
| `senat` | Sénat | Projets de Loi, Cycle Législatif |

#### Catégorie JURIDICTIONNEL (2 comptes)
| ID | Titre | Accès Modules |
|----|-------|---------------|
| `conseil-etat` | Conseil d'État | Avis Juridiques, Textes |
| `cour-constitutionnelle` | Cour Constitutionnelle | Contrôle Constitutionnel |

#### Catégorie ADMINISTRATIF SGG (3 comptes)
| ID | Titre | Accès Modules |
|----|-------|---------------|
| `sgg-admin` | Administrateur SGG | TOUS (Admin Système) |
| `sgg-directeur` | Directeur SGG | Lecture, Validation, Édition |
| `dgjo` | Direction JO | Publication JO, Archives |

#### Catégorie PUBLIC (2 comptes)
| ID | Titre | Accès Modules |
|----|-------|---------------|
| `citoyen` | Citoyen | Journal Officiel (lecture) |
| `professionnel-droit` | Professionnel du Droit | Journal Officiel, Recherche Avancée |

### 4.2 Fonctionnement du Mode Démo

```typescript
// Demo.tsx - Stockage de l'utilisateur démo
sessionStorage.setItem("demoUser", JSON.stringify({
  id: account.id,
  title: account.title,
  role: account.role,
  institution: account.institution,
  access: account.access,
  category: account.category,
}));

// ProtectedRoute.tsx - Vérification
const isDemoMode = demoUser !== null;
if (isDemoMode) {
  // Bypass Supabase Auth
  // Check module access via useDemoUser hook
}
```

### 4.3 Ce qui FONCTIONNE en mode démo

| Fonctionnalité | État |
|----------------|------|
| Navigation entre pages | ✅ |
| Affichage des données mock | ✅ |
| Dashboard contextuel par rôle | ✅ |
| Restrictions d'accès par module | ✅ |
| Visualisation des tableaux | ✅ |
| Graphiques et statistiques | ✅ |
| Changement de thème (dark/light) | ✅ |

### 4.4 Ce qui NE FONCTIONNE PAS en mode démo

| Fonctionnalité | État | Raison |
|----------------|------|--------|
| Création de données | ❌ | Pas de persistance |
| Modification de données | ❌ | Données statiques |
| Upload de fichiers | ❌ | Backend non connecté |
| Export PDF/Excel | ❌ | Service non implémenté |
| Recherche | ❌ | Pas d'index/filtrage backend |
| Notifications temps réel | ❌ | Pas de WebSocket |
| Workflow de validation | ❌ | Pas de persistance |

---

## 5. ÉTAT ACTUEL VS FONCTIONNEL

### 5.1 Matrice de Fonctionnalité

```
                          ACTUEL                    CIBLE
                    ┌─────────────────┐      ┌─────────────────┐
     Frontend UI    │     100%        │      │      100%       │
                    └─────────────────┘      └─────────────────┘
                    ┌─────────────────┐      ┌─────────────────┐
     Backend API    │      30%        │──────▶      100%       │
                    └─────────────────┘      └─────────────────┘
                    ┌─────────────────┐      ┌─────────────────┐
     Database       │      0%         │──────▶      100%       │
                    └─────────────────┘      └─────────────────┘
                    ┌─────────────────┐      ┌─────────────────┐
     Auth Réelle    │      20%        │──────▶      100%       │
                    └─────────────────┘      └─────────────────┘
                    ┌─────────────────┐      ┌─────────────────┐
     Persistance    │      0%         │──────▶      100%       │
                    └─────────────────┘      └─────────────────┘
```

### 5.2 Détail par Module

#### GAR (Gestion Axée sur les Résultats)
- **UI** : ✅ Complète (filtres, graphiques, export button)
- **Backend** : Routes définies (`/api/gar/*`) mais retournent mock
- **DB** : Schema `gar` créé, tables vides
- **À faire** : Connecter API → DB, seeding initial

#### Nominations
- **UI** : ✅ Complète (workflow 12 étapes, détails candidat)
- **Backend** : Routes définies (`/api/nominations/*`) non fonctionnelles
- **DB** : Schema `nominations` créé, tables vides
- **À faire** : CRUD complet, upload documents

#### Journal Officiel
- **UI** : ✅ Double version (public + admin)
- **Backend** : Routes définies (`/api/jo/*`) mock
- **DB** : Schema `jo` créé
- **À faire** : Migration textes existants, recherche full-text

#### Matrice Reporting
- **UI** : ✅ Très complète (saisie, validation 3 niveaux, suivi, exports)
- **Backend** : Non défini
- **DB** : Utilise `gar.rapports`
- **À faire** : API dédiée, workflow notifications

---

## 6. PLAN D'IMPLÉMENTATION

### 6.1 Phase 1 : Fondations (2 semaines)

#### Semaine 1 : Infrastructure
- [ ] Déployer schéma PostgreSQL sur Cloud SQL
- [ ] Configurer Redis pour sessions/cache
- [ ] Créer les 15 comptes utilisateurs réels
- [ ] Seeder les données de référence (institutions, postes)

#### Semaine 2 : Auth & RBAC
- [ ] Connecter `AuthContext` à Supabase (déjà configuré)
- [ ] Synchroniser `auth.users` avec Supabase
- [ ] Implémenter middleware JWT backend
- [ ] Tests d'authentification E2E

### 6.2 Phase 2 : Module GAR (2 semaines)

#### Semaine 3 : API GAR
- [ ] `GET /api/gar/priorites` → Récupérer 8 priorités PAG
- [ ] `GET /api/gar/objectifs` → Liste avec filtres
- [ ] `GET /api/gar/dashboard` → Statistiques agrégées
- [ ] `GET /api/gar/rapports` → Rapports mensuels

#### Semaine 4 : Matrice Reporting
- [ ] `POST /api/gar/rapports` → Saisie rapport
- [ ] `PUT /api/gar/rapports/:id/submit` → Soumission
- [ ] `PUT /api/gar/rapports/:id/validate-sgg` → Validation SGG
- [ ] `PUT /api/gar/rapports/:id/validate-sgpr` → Validation SGPR
- [ ] Système de notifications (email + in-app)

### 6.3 Phase 3 : Module Nominations (2 semaines)

#### Semaine 5 : CRUD Nominations
- [ ] `GET /api/nominations/dossiers` → Liste avec filtres
- [ ] `POST /api/nominations/dossiers` → Créer dossier
- [ ] `PUT /api/nominations/dossiers/:id` → Modifier
- [ ] Upload documents (CV, diplômes) vers Cloud Storage

#### Semaine 6 : Workflow Nominations
- [ ] Machine à états pour les 12 statuts
- [ ] Transitions autorisées par rôle
- [ ] Journal d'audit automatique
- [ ] Génération PDF acte de nomination

### 6.4 Phase 4 : Journal Officiel (2 semaines)

#### Semaine 7 : Publication JO
- [ ] `GET /api/jo/numeros` → Numéros JO
- [ ] `GET /api/jo/textes` → Recherche textes
- [ ] `POST /api/jo/textes` → Publication
- [ ] Recherche full-text PostgreSQL

#### Semaine 8 : Open Data JO
- [ ] API publique (rate limited)
- [ ] Export PDF textes
- [ ] Consolidation textes (versions)
- [ ] RSS/Atom feed

### 6.5 Phase 5 : e-GOP & Législatif (2 semaines)

#### Semaine 9 : e-GOP
- [ ] Gestion Conseils des Ministres
- [ ] Points d'ordre du jour
- [ ] Décisions et relevés
- [ ] Calendrier partagé

#### Semaine 10 : Cycle Législatif
- [ ] 8 étapes du cycle
- [ ] Suivi inter-institutions
- [ ] Navette parlementaire
- [ ] Interface Parlement

### 6.6 Phase 6 : Polish & Production (2 semaines)

#### Semaine 11 : Optimisations
- [ ] Caching Redis
- [ ] Pagination curseur
- [ ] Indexes PostgreSQL
- [ ] Tests de charge

#### Semaine 12 : Déploiement
- [ ] CI/CD GitHub Actions
- [ ] Monitoring (Cloud Logging)
- [ ] Backup automatisé
- [ ] Documentation API (OpenAPI)

---

## 7. PRIORISATION DES TÂCHES

### 7.1 Priorité CRITIQUE (Must Have)

| # | Tâche | Effort | Module |
|---|-------|--------|--------|
| 1 | Déployer DB PostgreSQL | 2h | Infra |
| 2 | Créer 15 comptes réels | 2h | Auth |
| 3 | Connecter Auth à Supabase | 4h | Auth |
| 4 | API GAR lecture | 8h | GAR |
| 5 | API Matrice saisie/validation | 16h | GAR |
| 6 | API Nominations CRUD | 12h | Nominations |

### 7.2 Priorité HAUTE (Should Have)

| # | Tâche | Effort | Module |
|---|-------|--------|--------|
| 7 | Upload documents | 8h | Nominations |
| 8 | Notifications email | 8h | Global |
| 9 | API Journal Officiel | 12h | JO |
| 10 | Recherche full-text | 4h | JO |

### 7.3 Priorité MOYENNE (Nice to Have)

| # | Tâche | Effort | Module |
|---|-------|--------|--------|
| 11 | Export PDF/Excel | 8h | Global |
| 12 | API e-GOP | 16h | e-GOP |
| 13 | API Législatif | 16h | Législatif |
| 14 | Dashboard temps réel | 8h | Dashboard |

### 7.4 Effort Total Estimé

| Phase | Semaines | Heures |
|-------|----------|--------|
| Phase 1 : Fondations | 2 | 40h |
| Phase 2 : GAR | 2 | 60h |
| Phase 3 : Nominations | 2 | 50h |
| Phase 4 : JO | 2 | 40h |
| Phase 5 : e-GOP/Législatif | 2 | 60h |
| Phase 6 : Production | 2 | 40h |
| **TOTAL** | **12 semaines** | **~290h** |

---

## 📎 ANNEXES

### A. Commandes Utiles

```bash
# Démarrer le dev server
npm run dev

# Build production
npm run build

# Lancer le backend
cd backend && npm run dev

# Appliquer le schéma DB
psql $DATABASE_URL < database/schema.sql
```

### B. Variables d'Environnement Requises

```env
# Frontend
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=

# Backend
DATABASE_URL=
REDIS_URL=
JWT_SECRET=
GCS_BUCKET_NAME=

# Services
SENDGRID_API_KEY=
```

### C. Contacts

- **Projet** : SGG Digital
- **Client** : Secrétariat Général du Gouvernement, Gabon
- **Développement** : OKA Tech

---

*Document généré automatiquement le 6 février 2026*
