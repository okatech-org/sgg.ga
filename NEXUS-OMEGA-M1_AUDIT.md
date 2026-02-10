# 🔴 NEXUS-OMEGA — Module 1 : Audit Exhaustif & Architecture
## Projet : SGG Digital (sgg.ga)
**Date** : 2026-02-10 | **Version NEXUS** : OMEGA | **Module** : 1/5

---

## ÉTAPE 1 — SCAN TOTAL & IMMERSION PROFONDE

### 1.1 Arborescence du Projet

```
sgg.ga/
├── src/                          # Frontend React (315 fichiers TS/TSX)
│   ├── App.tsx                   # Router principal (1369 lignes, 135 routes)
│   ├── main.tsx                  # Point d'entrée (+ SW registration ⚠️)
│   ├── index.css                 # Styles globaux (TailwindCSS)
│   ├── App.css                   # Styles app
│   ├── pages/                    # 125 pages + 10 sous-pages profil
│   ├── components/               # 120 composants (13 sous-dossiers)
│   │   ├── a11y/                 # Accessibilité
│   │   ├── admin/                # Admin
│   │   ├── dashboard/            # Dashboard + sections
│   │   ├── gar/                  # GAR matrice
│   │   ├── landing/              # Landing page
│   │   ├── layout/               # Layout (Header, Sidebar, Breadcrumbs)
│   │   ├── modules/              # Module détail
│   │   ├── nominations/          # Nominations
│   │   ├── onboarding/           # Onboarding
│   │   ├── profil/               # Profil utilisateur
│   │   ├── ptm/                  # PTM composants
│   │   ├── reporting/            # Reporting
│   │   └── ui/                   # Shadcn/UI (39 composants)
│   ├── contexts/                 # AuthContext, ThemeContext
│   ├── hooks/                    # 19 hooks custom
│   ├── services/                 # 11 services (api, monitoring, export, etc.)
│   ├── data/                     # 5 fichiers données mock
│   ├── types/                    # 4 fichiers types
│   ├── stores/                   # 1 store Zustand (reporting)
│   ├── i18n/                     # FR, EN, ES
│   ├── integrations/supabase/    # Client + types Supabase
│   ├── lib/                      # api.ts + utils.ts
│   ├── config/                   # 2 fichiers config
│   └── test/                     # 8 fichiers test
├── backend/                      # Express.js API (36 fichiers)
│   └── src/
│       ├── server.ts             # Serveur principal (355 lignes)
│       ├── config/               # database, redis, firebase, storage
│       ├── middleware/            # auth.ts (397 lignes, RBAC complet)
│       ├── routes/               # 15 fichiers routes
│       ├── services/             # 8 services
│       ├── scripts/              # Migration
│       └── test/                 # 1 fichier test intégration
├── database/
│   ├── schema.sql                # 2001 lignes, 36 tables, 7 vues, 7 schemas
│   └── seed/                     # 4 fichiers seed
├── infrastructure/
│   ├── gcp-architecture.md
│   └── terraform/
├── deploy/                       # nginx.conf
├── e2e/                          # Tests Playwright
├── public/
│   ├── sw.js                     # ⚠️ Service Worker DÉTECTÉ
│   └── manifest.json             # ⚠️ PWA Manifest DÉTECTÉ
├── Dockerfile.frontend           # Multi-stage Bun → Nginx
├── Dockerfile.backend            # Multi-stage Node
└── docs/                         # Documentation
```

### 1.2 Stack Exacte avec Versions

| Couche | Technologie | Version |
|--------|-------------|---------|
| **Runtime frontend** | Bun | via `bunx` |
| **Bundler** | Vite | 5.4.19 |
| **Framework** | React | 18.3.1 |
| **Langage** | TypeScript | 5.8.3 |
| **Router** | React Router DOM | 6.30.1 |
| **State global** | Zustand | 5.0.11 |
| **Data fetching** | TanStack React Query | 5.90.20 |
| **UI Components** | Radix UI | 27 primitives |
| **Design System** | Shadcn/UI + TailwindCSS | 3.4.17 |
| **Animation** | Framer Motion | 12.31.0 |
| **Forms** | React Hook Form + Zod | 7.61.1 / 3.25.76 |
| **Charts** | Recharts | 2.15.4 |
| **Icons** | Lucide React | 0.462.0 |
| **Toast** | Sonner | 1.7.4 |
| **Export** | jsPDF + xlsx | 4.1.0 / 0.18.5 |
| **Backend** | Express.js | 4.18.2 |
| **BDD** | PostgreSQL (Cloud SQL) | pg 8.11.3 |
| **Cache** | Redis (IORedis) | 5.3.2 |
| **Auth backend** | JWT + Bcryptjs | 9.0.2 / 2.4.3 |
| **Auth frontend** | Supabase Auth | 2.94.0 |
| **Sécurité** | Helmet | 7.1.0 |
| **Rate Limit** | express-rate-limit | 7.1.5 |
| **Storage** | Firebase Admin + GCS | 12.0.0 / 7.7.0 |
| **Email** | SendGrid | 8.1.0 |
| **WebSocket** | ws | 8.19.0 |
| **Validation backend** | Joi + Zod | 17.11.0 / 3.22.4 |
| **Logging** | Winston | 3.11.0 |
| **Test** | Vitest + Playwright | 3.2.4 / 1.58.2 |

### 1.3 Points d'Entrée

| Point d'entrée | Fichier | Rôle |
|---|---|---|
| Frontend SPA | `src/main.tsx` | Rendu React + init monitoring prod |
| Routes React | `src/App.tsx` | 135 routes, code-splitting lazy |
| Backend API | `backend/src/server.ts` | Express + DB + Redis + WS |
| Schema BDD | `database/schema.sql` | 7 schemas PostgreSQL |

### 1.4 ⚠️ PWA / Service Worker DÉTECTÉ

```
⚠️ ALERTE PWA DÉTECTÉE
├── public/sw.js                → Service Worker fichier présent
├── public/manifest.json        → PWA manifest présent
└── src/main.tsx L12-18         → Registration SW en production
```

**Directive NEXUS** : ❌ PAS de PWA, PAS de Service Workers
**Action requise** : Supprimer `sw.js`, `manifest.json`, et le bloc SW dans `main.tsx`

### 1.5 Connexion BDD Hub

```
Hub Strategy :
├── Instance : Google Cloud SQL (PostgreSQL)
│   ├── IP : 35.195.248.19
│   ├── Base : db_sgg
│   ├── User : postgres
│   └── SSL : Conditionnel (vérifié dans database.ts L21)
├── Connexion : ✅ Configurée
├── Redis : ✅ IORedis (REDIS_URL dans .env)
├── Supabase : ✅ Frontend auth (yzijbtwpavfefboxofus.supabase.co)
└── Firebase : ✅ Storage backend (firebase-admin)
```

### 1.6 Compréhension de la Vision

- **But fondamental** : Plateforme numérique du Secrétariat Général du Gouvernement du Gabon — digitalisation de l'ensemble des processus gouvernementaux (GAR/PAG 2026, Nominations, Cycle Législatif, Journal Officiel, e-GOP, PTM)
- **Utilisateurs cibles** :
  - 🔴 Admin SGG (accès total)
  - 🟠 SGPR, Premier Ministre (pilotage)
  - 🟡 Ministres, SG Ministère (modules métier)
  - 🟢 Assemblée, Sénat, Juridictions (consultation)
  - 🔵 Citoyens (JO uniquement)
- **Espaces existants** :
  - ✅ Dashboard principal multi-rôle
  - ✅ 24 dashboards sectoriels
  - ✅ Espace profil complet (10 sous-pages)
  - ✅ Admin (users, permissions, advanced, audit)
  - ✅ SGPR Dashboard
  - ✅ Monitoring Dashboard
- **Écart ambition ↔ implémentation** : Frontend très riche (135 pages) mais **124/125 pages utilisent uniquement des données mock**. Seule 1 page est connectée à l'API réelle.

---

## ÉTAPE 2 — TRIAGE PRIORISÉ

### 🔴 P0 — BLOQUANT (8 problèmes)

| # | Problème | Impact | Fichier(s) |
|---|----------|--------|------------|
| P0-1 | **Double système auth** : Frontend utilise Supabase Auth, Backend utilise JWT custom — deux sources de vérité incompatibles | Impossible de savoir qui est vraiment authentifié | `AuthContext.tsx` vs `backend/middleware/auth.ts` |
| P0-2 | **124/125 pages sur données mock** — aucune donnée réelle du backend ne remonte au frontend | L'application est une maquette fonctionnelle, pas une app opérationnelle | Toutes les pages sauf 1 |
| P0-3 | **Double service API** : `src/services/api.ts` (793 lignes, typé) ET `src/lib/api.ts` (527 lignes, `any` partout) — couche API fragmentée | Incohérence, duplication, bugs potentiels | `services/api.ts` + `lib/api.ts` |
| P0-4 | **3 routes dupliquées** dans App.tsx : `/workflows`, `/associations`, `/alertes` — la 2ème écrase la 1ère | Pages inaccessibles, comportement imprévisible | `App.tsx` L467+L757, L1037+L1257, L737+L877 |
| P0-5 | **AuthContext ne connaît que 4 rôles** (`admin_sgg, sg_ministere, sgpr, citoyen`) alors que le schema SQL en définit 12 | 8 rôles dans la BDD ne peuvent pas accéder au frontend | `AuthContext.tsx` L6, L32-37 |
| P0-6 | **PWA/Service Worker actif en production** malgré la directive NEXUS | SW peut cacher des données sensibles gouvernementales | `main.tsx` L12-18, `public/sw.js` |
| P0-7 | **`strict: false`** dans tsconfig — bugs silencieux possibles | Erreurs runtime non détectées à la compilation | `tsconfig.app.json` L19 |
| P0-8 | **Audit route (`/api/audit`) sans authentification** — données sensibles exposées | Fuite potentielle de données d'audit | `backend/src/routes/audit.ts` |

### 🟠 P1 — DÉGRADÉ (12 problèmes)

| # | Problème | Impact | Fichier(s) |
|---|----------|--------|------------|
| P1-1 | **45 usages de `: any`** dans le frontend | Pas de type safety, refactoring dangereux | Réparti dans services, hooks, lib |
| P1-2 | **188 références à mock/demo data** | Bruit dans le code, confusion source de données | Pages + hooks + data/ |
| P1-3 | **12 console.log restants** dans le frontend | Fuites d'info en production | Divers fichiers |
| P1-4 | **`monitoring.ts` et `workflow.ts` backend** sans middleware auth | Routes potentiellement ouvertes | `routes/monitoring.ts`, `routes/workflow.ts` |
| P1-5 | **93 fonctions async sans try/catch** vs 108 avec — ratio 46% non protégé | Erreurs non catchées possibles | Divers |
| P1-6 | **`lib/api.ts` en DEMO_MODE** si `VITE_API_URL` non défini — fallback silencieux aux mocks | Front ne sait jamais s'il est connecté au vrai backend | `lib/api.ts` L10 |
| P1-7 | **Audit middleware appliqué APRÈS les routes** dans server.ts L143-149 | L'audit ne capture pas les requêtes car les routes ont déjà répondu | `backend/src/server.ts` |
| P1-8 | **WebSocket non compatible Cloud Run** (stateless) | WS ne fonctionnera pas en production | `backend/src/services/websocket.ts` |
| P1-9 | **Rate limit global trop restrictif** : 100 req/15min par IP | Bloquant pour les utilisateurs intensifs | `server.ts` L95-107 |
| P1-10 | **Cache invalidation listener** dépend de Redis — pas de fallback | Si Redis down, cache stale silencieusement | `server.ts` L306` |
| P1-11 | **`strictNullChecks: false`** — null non vérifié | Crash runtime sur accès `.property` de null | `tsconfig.app.json` L21 |
| P1-12 | **Code splitting surdimensionné** — 148 imports lazy dans App.tsx | Waterfall de chargement, UX dégradée | `App.tsx` |

### 🟡 P2 — ABSENT (10 problèmes)

| # | Problème | Impact |
|---|----------|--------|
| P2-1 | Pas de tests E2E sur les 14 sous-systèmes (3 fichiers e2e seulement) | Régression silencieuse |
| P2-2 | Pas de CI/CD pipeline (.github présent mais minimal) | Déploiement manuel |
| P2-3 | Pas de monitoring/APM production (PostHog key vide) | Aucune visibilité production |
| P2-4 | Pas de migration Prisma — schema SQL brut | Évolution schema manuelle et risquée |
| P2-5 | i18n incomplet (ES = 3.8KB vs FR = 12.5KB) | UX dégradée en espagnol |
| P2-6 | Pas de health check frontend | Impossible de savoir si le frontend fonctionne |
| P2-7 | Terraform non configuré (dossier vide) | Infrastructure as Code manquante |
| P2-8 | Seeds de BDD : 4 fichiers mais pas de script d'exécution global | Population initiale manuelle |
| P2-9 | OpenAPI spec référence un URL GitHub raw — pas de versioning local | Doc API fragile |
| P2-10 | Pas de gestion des versions (changelog non connecté à git) | Traçabilité absente |

---

## ÉTAPE 3 — AUDIT FRONTEND EXHAUSTIF

### 3.1 Cartographie des Routes (135 routes)

#### Routes Publiques (7)
| Route | Composant | Auth | Score |
|-------|-----------|------|-------|
| `/` | Index (Landing) | ❌ | 8/10 |
| `/modules` | Modules | ❌ | 7/10 |
| `/auth` | Auth | ❌ | 7/10 |
| `/demo` | Demo | ❌ | 7/10 |
| `/about` | About | ❌ | 7/10 |
| `/pag-2026` | PAG2026 | ❌ | 7/10 |
| `/journal-officiel` | JournalOfficiel | ❌ | 6/10 |

#### Routes Module Landing (6 redirects + 1 param)
| Route | Composant | Auth | Score |
|-------|-----------|------|-------|
| `/gar` → `/module/gar` | Redirect | ❌ | OK |
| `/nominations` → `/module/nominations` | Redirect | ❌ | OK |
| `/module/:moduleId` | ModuleLandingPage | ❌ | 7/10 |

#### Routes Protégées — Core Métier (8)
| Route | Composant | Guard | Score |
|-------|-----------|-------|-------|
| `/dashboard` | Dashboard | `requiredModule="dashboard"` | 6/10 — Mock data |
| `/dashboard/gar` | GAR | `requiredModule="gar"` | 6/10 — Mock data |
| `/gar/app` | GAR | `requiredModule="gar"` | ⚠️ Duplique /dashboard/gar |
| `/nominations/app` | Nominations | `requiredModule="nominations"` | 6/10 — Mock data |
| `/cycle-legislatif/app` | CycleLegislatif | `requiredModule="cycleLegislatif"` | 5/10 — Mock data |
| `/egop/app` | EGop | `requiredModule="egop"` | 5/10 — Mock data |
| `/institutions/app` | Institutions | `requiredModule="institutions"` | 5/10 — Mock data |
| `/journal-officiel/app` | JournalOfficielApp | `requiredModule="journalOfficiel"` | 5/10 — Mock data |

#### Routes Protégées — Reporting & PTM (12)
| Route | Guard | Score |
|-------|-------|-------|
| `/matrice-reporting` + 5 sous-routes | `requiredModule="matriceReporting"` | 5/10 — Mock |
| `/ptm/matrice` + 5 sous-routes | `requiredModule="ptmptg"` | 5/10 — Mock |

#### Routes Protégées — Admin (6)
| Route | Guard | Score |
|-------|-------|-------|
| `/admin` | `requiredRoles=["admin_sgg"]` | 5/10 — Mock |
| `/admin/users` | `requiredRoles=["admin_sgg"]` | 5/10 — Mock |
| `/admin/permissions` | `requiredRoles=["admin_sgg"]` | 5/10 — Mock |
| `/admin/advanced` | `requiredRoles=["admin_sgg"]` | 5/10 — Mock |
| `/monitoring` | `requiredRoles=["admin_sgg"]` | 5/10 — Mock |
| `/system-stats` | `requiredRoles=["admin_sgg"]` | 5/10 — Mock |

#### Routes Protégées — Profil Utilisateur (10)
| Route | Guard | Score |
|-------|-------|-------|
| `/profil` → index | ProtectedRoute | 7/10 |
| `/profil/editer` | ProtectedRoute | 6/10 |
| `/profil/securite` | ProtectedRoute | 6/10 |
| `/profil/notifications` | ProtectedRoute | 5/10 |
| `/profil/historique` | ProtectedRoute | 5/10 |
| `/profil/activite` | ProtectedRoute | 5/10 |
| `/profil/acces` | ProtectedRoute | 5/10 |
| `/profil/preferences` | ProtectedRoute | 5/10 |
| `/profil/export` | ProtectedRoute | 5/10 |
| `/profil/aide` | ProtectedRoute | 6/10 |

#### Routes Protégées — Dashboards Sectoriels (24)
Toutes avec `<ProtectedRoute>` simple (pas de rôle requis).
Score moyen : **4/10** — Données mock, pas de backend associé.

Pages : Agriculture, Budget, Education, Emploi, Énergie, Pêche, Foresterie, Habitat, Migration, Mines, Sports, Telecom, Tourisme, Transport, ODD, Workforce, Live, SLA, etc.

#### Routes Protégées — Outils Transversaux (30+)
Score moyen : **4/10** — Données mock.
Pages : Kanban, Archives, Messagerie, Calendrier, Contacts, Sondages, OKR, KPI Builder, Carte, etc.

### 3.2 Problèmes Détectés dans le Frontend

| Catégorie | Compte | Détail |
|-----------|--------|--------|
| Boutons sans handler | 0 | ✅ Aucun `onClick={}` vide détecté |
| Formulaires avec submit | 9 | ✅ Présents |
| TODO/FIXME | 0 | ✅ Aucun |
| `console.log` résiduel | 12 | ⚠️ À nettoyer |
| Données mock en dur | 188 refs | 🔴 Critique — quasi toutes les pages |
| Usages `: any` | 45 | 🟠 À typer progressivement |
| Fonctions async | 93 sans try/catch | 🟠 Risque d'erreurs non gérées |
| Routes dupliquées | 3 paires | 🔴 `/workflows`, `/associations`, `/alertes` |

---

## ÉTAPE 4 — AUDIT BACKEND & CRUD

### 4.1 Routes Backend (15 fichiers, 110 endpoints)

| Route File | Auth Middleware | Endpoints (GET/POST/PUT/PATCH/DELETE) | Score |
|------------|-----------------|---------------------------------------|-------|
| `auth.ts` | Mixte (login=public, me/logout=auth) | ~8 | 8/10 |
| `users.ts` | `authenticate` + `requireRole('admin_sgg','directeur_sgg')` | ~6 | 8/10 |
| `gar.ts` | Public (priorities, stats) + Auth (rest) | ~14 | 7/10 |
| `nominations.ts` | `authenticate` globalement | ~10 | 7/10 |
| `legislatif.ts` | `authenticate` globalement | ~10 | 7/10 |
| `egop.ts` | `authenticate` globalement | ~12 | 7/10 |
| `jo.ts` | Public (search, textes) + Auth (admin) | ~12 | 7/10 |
| `ptm.ts` | `authenticate` globalement | ~10 | 7/10 |
| `reporting.ts` | `authenticate` + `requireRole/Permission` | ~12 | 8/10 |
| `institutions.ts` | `optionalAuth` (GET public) | ~6 | 7/10 |
| `twoFactor.ts` | Via auth route prefix | ~6 | 7/10 |
| `health.ts` | ❌ Aucune (correct) | ~2 | 9/10 |
| `monitoring.ts` | ❌ **Aucune** ⚠️ | ~4 | 3/10 |
| `audit.ts` | ❌ **Aucune** ⚠️ | ~4 | 2/10 |
| `workflow.ts` | ❌ **Aucune** ⚠️ | ~4 | 2/10 |

### 4.2 Matrice CRUD par Entité

| Entité (Schema) | C | R | U | D | Valid. | Auth | Notes |
|-----------------|---|---|---|---|--------|------|-------|
| **auth.users** | ✅ | ✅ | ✅ | ❌ | ✅ Joi | ✅ | Pas de soft-delete route |
| **auth.sessions** | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ | Via login/logout |
| **auth.audit_logs** | ✅ | ✅ | ❌ | ❌ | — | ⚠️ | Read non protégé |
| **institutions** | ❌ | ✅ | ❌ | ❌ | — | ⚠️ | Read-only, pas de CRUD admin |
| **gar.priorites_pag** | ❌ | ✅ | ❌ | ❌ | — | ✅ | Read-only (public) |
| **gar.objectifs** | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | Pas de delete |
| **gar.rapports** | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | Workflow validate |
| **gar.indicateurs** | ❌ | ❌ | ❌ | ❌ | — | — | Non exposé via API |
| **nominations.postes** | ❌ | ❌ | ❌ | ❌ | — | — | Non exposé via API |
| **nominations.candidats** | ❌ | ❌ | ❌ | ❌ | — | — | Non exposé via API |
| **nominations.dossiers** | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | Workflow transition |
| **nominations.documents** | ✅ | ✅ | ❌ | ❌ | — | ✅ | Upload uniquement |
| **nominations.historique** | ✅ | ✅ | ❌ | ❌ | — | ✅ | Auto-créé |
| **legislatif.textes** | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | Workflow complet 8 étapes |
| **egop.ci/rim/courrier** | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | 3 sub-modules |
| **jo.publications** | ✅ | ✅ | ✅ | ❌ | ✅ | Mixte | Public read |
| **ptm.initiatives** | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | Workflow submit/validate |

**Constats** :
- ❌ **Aucune opération DELETE implémentée** sur aucune entité → Soft-delete uniquement via `is_active`
- ⚠️ **3 entités clés sans API** : postes, candidats, indicateurs GAR
- ⚠️ **3 routes sans auth** : monitoring, audit, workflow

---

## ÉTAPE 5 — ÉVALUATION MATURITÉ NEOCORTEX

| Module | Fichier | Présent | État | Description |
|--------|---------|---------|------|-------------|
| Schema bio-inspiré | schema.ts | ❌ | 0% | Aucune table signaux/poids/historique |
| Types & helpers | lib/types.ts | ❌ | 0% | Pas de SIGNAL_TYPES, CORTEX, helpers |
| Système Limbique | limbique.ts | ❌ | 0% | Pas d'émission/routage de signaux |
| Hippocampe | hippocampe.ts | ❌ | 0% | Audit trail basique existe (backend) mais pas bio-inspiré |
| Plasticité | plasticite.ts | ❌ | 0% | Pas de config dynamique |
| Préfrontal | prefrontal.ts | ❌ | 0% | Pas de décisions complexes/scoring |
| Sensoriel | sensoriel.ts | ❌ | 0% | Webhooks absents |
| Cortex Visuel | visuel.ts | ❌ | 0% | Upload partiel (Firebase), pas d'OCR |
| Cortex Auditif | auditif.ts | ❌ | 0% | Notifications Supabase RT (primitives) |
| Cortex Moteur | moteur.ts | ❌ | 0% | Pas de tâches async/Cloud Tasks |
| Horloge Circadienne | crons.ts | ❌ | 0% | Pas de crons |
| Monitoring | monitoring.ts | ❌ | 5% | Service frontend basique, pas NEOCORTEX |
| **SCORE GLOBAL** | | | **0%** | Aucun composant NEOCORTEX |

**Briques existantes valorisables pour NEOCORTEX** :
- ✅ `backend/services/auditTrail.ts` → Base pour Hippocampe
- ✅ `backend/services/cacheInvalidation.ts` → Base pour Plasticité
- ✅ `backend/services/websocket.ts` → Base pour Cortex Auditif
- ✅ `backend/services/workflow.ts` → Base pour Préfrontal
- ✅ `backend/services/rateLimiter.ts` → Brique Sensoriel
- ✅ `hooks/useRealtimeNotifications.ts` → Frontend du Cortex Auditif
- ✅ `backend/services/email.ts` (SendGrid) → Cortex Moteur

---

## ÉTAPE 6 — DÉTECTION SOUS-SYSTÈMES

| # | Sous-système | Fichiers clés | Statut | Cortex NEOCORTEX | Action |
|---|-------------|---------------|--------|------------------|--------|
| 1 | **Dashboard multi-rôle** | Dashboard.tsx + 7 sections + 24 sectoriels | ✅ Rendu OK, mock data | Hippocampe + Préfrontal | Connecter au backend |
| 2 | **GAR (PAG 2026)** | GAR.tsx + GARMatrice21Colonnes + garApi | ✅ UI + API backend | Préfrontal (scoring) | Finaliser connexion frontend↔backend |
| 3 | **Nominations** | Nominations.tsx + 4 composants + workflow API | ✅ UI + API backend | Préfrontal (workflow) | Connecter frontend |
| 4 | **Cycle Législatif** | CycleLegislatif.tsx + legislatif API | ✅ UI + API backend | Préfrontal (8 étapes) | Connecter frontend |
| 5 | **e-GOP** | EGop.tsx + egop API (CI, RIM, Courrier) | ✅ UI + API backend | Limbique (signaux) | Connecter frontend |
| 6 | **Journal Officiel** | JO.tsx + JOApp.tsx + jo API | ✅ UI + API (public) | Sensoriel | Page publique partiellement connectée |
| 7 | **PTM/PTG** | 6 pages PTM + ptm API | ✅ UI + API backend | Préfrontal (workflow) | Connecter frontend |
| 8 | **Reporting/Export** | 5 pages + export services (PDF, Excel) | ✅ UI + export local | Hippocampe | Connecter aux données réelles |
| 9 | **Notifications** | NotificationsPage + hook Supabase RT | ⚠️ Partiel — Supabase RT seul | Cortex Auditif | Unifier avec backend WS |
| 10 | **Admin** | 4 pages admin + users API | ✅ UI + API backend | Préfrontal | Connecter frontend |
| 11 | **i18n** | i18n/ (FR complet, EN complet, ES partiel) | ✅ Fonctionnel | — | Compléter ES |
| 12 | **Upload/Storage** | Firebase config + upload helper | ⚠️ Partiel — config OK, pipeline non connecté | Cortex Visuel | Finaliser pipeline |
| 13 | **Archives** | ArchivesPage.tsx | ⚠️ UI uniquement, mock | Cortex Visuel | Connecter backend |
| 14 | **Messagerie** | MessagingPage.tsx | ⚠️ UI uniquement, mock | Cortex Auditif | Créer backend |
| 15 | **Profil utilisateur** | 10 pages profil + ProfilLayout | ✅ UI bien structurée | — | Connecter au backend |
| 16 | **Onboarding** | Tutorial + Glossaire + HelpMode | ✅ Fonctionnel (local) | — | OK |
| 17 | **Accessibilité** | SkipLinks + shortcuts | ✅ Fonctionnel | — | OK |
| 18 | **Calendrier** | CalendarPage.tsx | ⚠️ UI seule | — | Créer backend |
| 19 | **Kanban** | KanbanPage.tsx | ⚠️ UI seule | — | Créer backend |
| 20 | **Sondages** | SurveysPage.tsx | ⚠️ UI seule | — | Créer backend |
| 21 | **Carte Géo** | GeoMapPage.tsx | ⚠️ UI seule | — | Créer backend |

---

## ÉTAPE 7 — AUDIT INFRASTRUCTURE

### 7.1 Architecture Actuelle

```
                    ┌─────────────────────┐
                    │    Frontend SPA      │
                    │   React/Vite/Bun     │
                    │   (Port 5173 dev)    │
                    └─────┬───────┬───────┘
                          │       │
        Supabase Auth ◄───┘       └───► Express API Backend
        (yzijbt...)                      (Port 8080)
             │                               │
             ▼                               ▼
    ┌────────────────┐             ┌─────────────────┐
    │ Supabase BDD   │             │ Cloud SQL (PG)  │
    │ (profiles,     │             │ db_sgg          │
    │  user_roles)   │             │ 36 tables       │
    └────────────────┘             │ 7 schemas       │
                                   └─────────────────┘
                                          │
                                   ┌──────┴──────┐
                                   │    Redis     │
                                   │  (cache +    │
                                   │   sessions)  │
                                   └─────────────┘
                                          │
                                   ┌──────┴──────┐
                                   │  Firebase    │
                                   │  Storage     │
                                   │  (fichiers)  │
                                   └─────────────┘
```

### 7.2 Problème Architectural Majeur : Double Auth

```
🔴 PROBLÈME CRITIQUE : DOUBLE AUTH

▶ Flux actuel FRONTEND :
  User → Supabase Auth (login) → Session Supabase → profiles table Supabase
  → AuthContext.tsx lit user_roles depuis Supabase → Autorise l'accès

▶ Flux actuel BACKEND :
  Request → Bearer Token (JWT custom) → auth middleware vérifie dans Cloud SQL
  → auth.users table PostgreSQL → Autorise l'access

▶ RÉSULTAT :
  • Un user peut être connecté côté Supabase mais pas reconnu par le backend
  • Les user_roles existent dans DEUX BDD différentes (Supabase + Cloud SQL)
  • Le frontend connaît 4 rôles, le backend en gère 12
  • Aucune synchronisation entre les deux systèmes
```

### 7.3 Stratégie de Souveraineté

| Donnée | Source actuelle | Source cible (souveraine) |
|--------|----------------|--------------------------|
| Utilisateurs | Supabase + Cloud SQL (doublon) | Cloud SQL uniquement |
| Sessions | Supabase tokens + JWT séparés | JWT PostgreSQL uniquement |
| Données métier | Mock frontend | Cloud SQL PostgreSQL |
| Fichiers | Non connecté | Firebase Storage / GCS |
| Cache | Redis (config) | Redis (vérifié) |
| Audit trail | Backend auditTrail.ts | Cloud SQL `auth.audit_logs` |

---

## ÉTAPE 8 — RAPPORT & PLAN ARCHITECTURAL

```
╔══════════════════════════════════════════════════════════════════╗
║                  📊 AUDIT NEXUS-OMEGA M1                         ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                  ║
║  Projet              : SGG Digital (sgg.ga)                      ║
║  Stack               : React 18/Vite 5/TS + Express/TS +        ║
║                        PostgreSQL Cloud SQL + Redis + Firebase   ║
║                                                                  ║
║  Score complétude     : 35%                                      ║
║    ├── Frontend UI    : 85% (pages existent, animations OK)      ║
║    ├── Frontend Data  : 1%  (124/125 pages sur mock data)        ║
║    ├── Backend API    : 70% (110 endpoints, auth, RBAC)          ║
║    ├── BDD Schema     : 90% (36 tables, 7 schemas, indexés)      ║
║    └── Intégration    : 5%  (frontend quasi déconnecté)          ║
║                                                                  ║
║  Score NEOCORTEX      : 0%                                       ║
║  Architecture         : Hybride Triple (PG + Supabase + Firebase)║
║                                                                  ║
║  Problèmes : P0: 8 | P1: 12 | P2: 10                            ║
║  Pages OK             : 7/135 (publiques seulement)              ║
║  Pages connectées API : 1/125 protégées                          ║
║  Boutons actifs       : Tous (pas de onClick vide)               ║
║  Sous-systèmes        : 21 détectés, 7 avec backend              ║
║  PWA/SW               : ⚠️ DÉTECTÉ — à supprimer                ║
║  BDD Hub              : ✅ Cloud SQL connecté (backend seul)     ║
║  Double Auth           : 🔴 Supabase ≠ JWT custom                ║
║                                                                  ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                  ║
║  PLAN D'ACTION NEXUS-OMEGA                                       ║
║                                                                  ║
║  Sprint 0 — Fondations & Urgences P0          (1 semaine)        ║
║  ├── Résoudre double auth → JWT backend seul                     ║
║  ├── Supprimer PWA/SW                                            ║
║  ├── Corriger routes dupliquées (3 paires)                       ║
║  ├── Aligner AuthContext (12 rôles)                              ║
║  ├── Unifier services API (services/api.ts unique)               ║
║  ├── Sécuriser routes audit/monitoring/workflow                  ║
║  ├── Activer strict: true + strictNullChecks                     ║
║  └── Corriger audit middleware ordering                          ║
║                                                                  ║
║  Sprint 1 — NEOCORTEX Core + Backend          (2 semaines)       ║
║  ├── Schéma NEOCORTEX (tables signaux, poids, historique)        ║
║  ├── Système Limbique (émission + routage signaux)               ║
║  ├── Hippocampe (audit enrichi + métriques)                      ║
║  ├── Préfrontal (scoring pondéré + décisions workflow)           ║
║  ├── Exposer API postes, candidats, indicateurs GAR              ║
║  └── Ajouter opérations DELETE (soft-delete)                     ║
║                                                                  ║
║  Sprint 2 — Connexion Frontend ↔ Backend      (2 semaines)       ║
║  ├── Connecter les 7 modules core au backend réel                ║
║  ├── Migrer 124 pages de mock → API réelle                       ║
║  ├── Implémenter React Query hooks par module                    ║
║  ├── Loading states + error boundaries par page                  ║
║  └── Pipeline upload Firebase → frontend                         ║
║                                                                  ║
║  Sprint 3 — Infrastructure & Souveraineté     (1 semaine)        ║
║  ├── Finaliser Cloud SQL sync                                    ║
║  ├── Redis vérification production                               ║
║  ├── WebSocket → alternative Cloud Run (SSE ou polling)          ║
║  ├── Terraform pour infrastructure GCP                           ║
║  └── CI/CD pipeline GitHub Actions                               ║
║                                                                  ║
║  Sprint 4 — UX, Cortex & Polish              (1 semaine)         ║
║  ├── Cortex Visuel (upload + preview)                            ║
║  ├── Cortex Auditif (notifications unifiées)                     ║
║  ├── Cortex Moteur (SendGrid workflows)                          ║
║  ├── Horloge Circadienne (crons rappels)                         ║
║  └── Plasticité (config dynamique)                               ║
║                                                                  ║
║  Sprint 5 — Production & Nettoyage           (1 semaine)         ║
║  ├── Supprimer les 188 références mock                           ║
║  ├── Typer les 45 `any` restants                                 ║
║  ├── Tests E2E sur 14 sous-systèmes                              ║
║  ├── Monitoring/APM PostHog                                      ║
║  ├── Performance audit (Lighthouse, bundle size)                  ║
║  └── Documentation déploiement                                   ║
║                                                                  ║
║  ESTIMATION TOTALE : 6 sprints ≈ 8 semaines                     ║
║  Complexité : 🔴 Élevée                                         ║
║  Risques principaux :                                            ║
║    1. Migration auth double → simple (casse Supabase users)      ║
║    2. 124 pages à reconnecter (volume massif)                    ║
║    3. WebSocket incompatible Cloud Run                           ║
║    4. Redis non vérifié en conditions réelles                    ║
║                                                                  ║
║  PAR OÙ COMMENCER :                                             ║
║  → Module M2 OMEGA : Résolution P0 + NEOCORTEX Core Backend     ║
║    Le contexte projet ci-dessous est pré-rempli.                 ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝
```

---

## CONTEXTE PROJET (pré-rempli pour OMEGA-M2)

```
## CONTEXTE PROJET (pré-rempli par NEXUS-OMEGA M1)

Nom             : SGG Digital (sgg.ga)
Stack frontend  : React 18.3.1 + Vite 5.4.19 + TypeScript 5.8.3
                  TailwindCSS 3.4.17 + Shadcn/UI + Framer Motion 12.31
                  Zustand 5.0.11 + React Query 5.90 + RHF 7.61 + Zod 3.25
                  React Router DOM 6.30 + Recharts 2.15 + Sonner
Backend         : Express.js 4.18.2 + TypeScript
                  15 route files, 110 endpoints (62 GET + 48 mutations)
                  JWT + Bcrypt auth, Helmet, Rate Limiter, Audit Trail
                  WebSocket (ws), SendGrid email, Winston logger
BDD             : PostgreSQL (Google Cloud SQL — 35.195.248.19 / db_sgg)
                  36 tables, 7 vues, 7 schemas (auth, gar, nominations,
                  legislatif, egop, jo, institutions)
                  Redis IORedis (cache + sessions)
                  Supabase (frontend auth fallback — À SUPPRIMER)
                  Firebase Admin (storage — À CONNECTER)
Auth            : 🔴 DOUBLE AUTH À RÉSOUDRE
                  Frontend : Supabase Auth (4 rôles)
                  Backend : JWT custom (12 rôles RBAC)
                  Cible : JWT backend uniquement
État            : 35% fonctionnel globalement
                  Frontend UI : 85% | Frontend Data : 1% | Backend : 70% | BDD : 90%
Fonctionne      :
  ✅ Landing page complète, animée
  ✅ 135 routes React avec code-splitting lazy
  ✅ 120 composants UI (Shadcn/UI complet)
  ✅ Backend Express 110 endpoints avec auth JWT
  ✅ Schema SQL complet 36 tables, well-indexed
  ✅ Auth backend JWT + RBAC + 2FA/TOTP
  ✅ 7 modules métier core ont un backend API
  ✅ Export PDF/Excel, i18n FR/EN, dark mode
  ✅ Profil utilisateur 10 pages, onboarding
Cassé/Manquant  :
  🔴 P0-1 : Double auth Supabase ≠ JWT (2 systèmes incompatibles)
  🔴 P0-2 : 124/125 pages protégées = données mock (0 connexion API)
  🔴 P0-3 : Double service API (services/api.ts + lib/api.ts)
  🔴 P0-4 : 3 routes dupliquées (/workflows, /associations, /alertes)
  🔴 P0-5 : AuthContext ne gère que 4/12 rôles
  🔴 P0-6 : PWA/SW détecté (interdit)
  🔴 P0-7 : strict:false + strictNullChecks:false
  🔴 P0-8 : 3 routes backend sans auth (audit, monitoring, workflow)
  🟠 P1 : 12 problèmes dégradés (voir rapport complet)
  🟡 P2 : 10 features absentes (CI/CD, E2E, Terraform, etc.)
NEOCORTEX       : 0% — Aucun composant bio-inspiré
                  Briques valorisables : auditTrail, cacheInvalidation,
                  websocket, workflow, rateLimiter, email
Priorité        :
  Sprint 0 → Résoudre 8 P0 (fondations + sécurité)
  Sprint 1 → NEOCORTEX Core + backend complet
  Sprint 2 → Connecter 124 pages au backend
  Sprint 3 → Infrastructure + souveraineté
  Sprint 4 → Cortex complets (Visuel, Auditif, Moteur)
  Sprint 5 → Production + nettoyage
```

---

**→ Audit OMEGA-M1 terminé. Prêt pour OMEGA-M2 (NEOCORTEX Full Backend + résolution P0).**
