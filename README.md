# 🏛️ SGG Digital — Plateforme de Digitalisation du SGG

> **Secrétariat Général du Gouvernement du Gabon**  
> Plateforme numérique de coordination gouvernementale et de suivi des politiques publiques.

---

## 📋 Table des Matières

- [Aperçu](#aperçu)
- [Stack Technique](#stack-technique)
- [Installation](#installation)
- [Lancement](#lancement)
- [Structure du Projet](#structure-du-projet)
- [Modules Fonctionnels](#modules-fonctionnels)
- [Tests](#tests)
- [Variables d'Environnement](#variables-denvironnement)
- [Déploiement](#déploiement)

---

## 🎯 Aperçu

SGG Digital est la plateforme officielle de digitalisation du Secrétariat Général du Gouvernement du Gabon. Elle centralise le suivi de l'action gouvernementale à travers plusieurs modules :

- **GAR / PAG 2026** — Gestion Axée sur les Résultats alignée sur le Plan d'Accélération de la Transformation
- **Matrice Reporting** — Rapports mensuels des ministères avec workflow de validation SGG → SGPR
- **Nominations** — Gestion du circuit de nomination des hauts fonctionnaires
- **Journal Officiel** — Publication et consultation des textes juridiques
- **e-GOP** — Conseil des Ministres dématérialisé
- **Cycle Législatif** — Suivi du processus législatif
- **PTM / PTG** — Programmation du Travail des Ministères et du Gouvernement
- **Institutions** — Annuaire institutionnel de la République

---

## 🛠️ Stack Technique

### Frontend
| Technologie | Rôle |
|-------------|------|
| **React 18** | Framework UI |
| **Vite** | Build tool & dev server |
| **TypeScript** | Typage statique |
| **Tailwind CSS** | Utility-first CSS |
| **Shadcn UI / Radix** | Composants UI accessibles |
| **React Query (TanStack)** | Data fetching & cache |
| **Zustand** | State management (reporting) |
| **Framer Motion** | Animations |
| **Zod** | Validation des formulaires |
| **Recharts** | Graphiques et dashboards |

### Backend
| Technologie | Rôle |
|-------------|------|
| **Express.js** | Server HTTP |
| **TypeScript** | Typage |
| **PostgreSQL 15** | Base de données (Cloud SQL) |
| **Redis** | Cache (optionnel) |
| **JWT + Bcrypt** | Authentification |
| **Supabase** | Auth frontend |

### Outils
| Outil | Rôle |
|-------|------|
| **Bun** | Package manager (principal) |
| **Vitest** | Framework de tests |
| **ESLint** | Linting |

---

## 📦 Installation

### Prérequis

- **Node.js** ≥ 20.0.0
- **Bun** (recommandé) ou npm
- **PostgreSQL** (pour le backend)

### Cloner et installer

```bash
# 1. Cloner le dépôt
git clone https://github.com/okatech-org/sgg.ga.git
cd sgg.ga

# 2. Installer les dépendances frontend
bun install
# ou: npm install

# 3. Configurer les variables d'environnement frontend
cp .env.example .env
# Éditer .env avec vos valeurs Supabase et API URL

# 4. Installer les dépendances backend
cd backend
bun install
# ou: npm install

# 5. Configurer les variables d'environnement backend
cp .env.example .env
# Éditer backend/.env avec vos credentials BDD et JWT secret
cd ..
```

---

## 🚀 Lancement

### Mode Développement

```bash
# Frontend (port 5173)
bun run dev

# Backend (port 8080) — dans un terminal séparé
cd backend
bun run dev
```

### Mode Production

```bash
# Build frontend
bun run build

# Build backend
cd backend
bun run build
bun run start
```

### Mode Démo

La plateforme dispose d'un **mode démo** avec 15+ personas pré-configurées. Accessible sans authentification via `/demo`.

---

## 📁 Structure du Projet

```
sgg.ga/
├── src/                         # Code source frontend
│   ├── components/              # Composants React
│   │   ├── ui/                  # 51 composants Shadcn UI
│   │   ├── layout/              # Sidebar, Header, DashboardLayout, GlobalSearch
│   │   ├── dashboard/sections/  # Sections dashboard par catégorie de rôle
│   │   ├── nominations/         # Composants module nominations
│   │   ├── profil/              # Espace utilisateur (10 sous-pages)
│   │   └── landing/             # Page d'accueil publique
│   ├── pages/                   # Pages de l'application (25+)
│   ├── contexts/                # React Contexts (Auth, Theme)
│   ├── hooks/                   # Custom hooks (useDemoUser, useApiData...)
│   ├── services/                # Couche API (api.ts, reportingApi.ts)
│   ├── stores/                  # Zustand stores (reporting)
│   ├── types/                   # Types TypeScript
│   ├── data/                    # Données mock (reporting, PTM)
│   └── test/                    # Tests unitaires (Vitest)
├── backend/                     # Code source backend
│   └── src/
│       ├── server.ts            # Express entry point
│       ├── routes/              # API routes par module
│       ├── config/              # Configuration DB & Redis
│       └── scripts/             # Migration, seed, reset
├── public/                      # Assets statiques
├── .env.example                 # Template variables d'environnement FE
├── package.json                 # Dépendances frontend
├── vite.config.ts               # Configuration Vite
├── vitest.config.ts             # Configuration tests
├── tailwind.config.ts           # Design tokens SGG
└── tsconfig.json                # Configuration TypeScript
```

---

## 🧩 Modules Fonctionnels

| Module | Route | Statut |
|--------|-------|--------|
| **Dashboard** | `/dashboard` | ✅ Opérationnel |
| **GAR / PAG 2026** | `/gar/app` | ✅ Opérationnel |
| **Matrice Reporting** | `/matrice-reporting/*` | ✅ Opérationnel |
| **PTM / PTG** | `/ptm/*` | ✅ Opérationnel |
| **Nominations** | `/nominations/app` | ✅ Opérationnel |
| **Journal Officiel** | `/journal-officiel/app` | ✅ Opérationnel |
| **e-GOP** | `/egop/app` | ✅ Opérationnel |
| **Institutions** | `/institutions/app` | ✅ Opérationnel |
| **Cycle Législatif** | `/cycle-legislatif/app` | ✅ Opérationnel |
| **Formation** | `/formation` | ✅ Opérationnel |
| **Paramètres** | `/parametres` | ✅ Opérationnel |
| **Profil Utilisateur** | `/profil/*` | ✅ Opérationnel |
| **Administration** | `/admin/users` | ✅ Opérationnel |

---

## 🧪 Tests

```bash
# Lancer tous les tests
bun run test

# Tests en mode watch
bun run test:watch

# Couverture de code
bun run test:coverage
```

### Suites de tests existantes
- `schemas.test.ts` — Validation des schemas Zod (profil, mot de passe, support)
- `reportingData.test.ts` — Intégrité des données mock (piliers, programmes)
- `reportingStore.test.ts` — Store Zustand (CRUD, notifications, statuts)
- `demoUser.test.ts` — Système RBAC (accès modules, catégories de rôles)
- `api.test.ts` — Service API (tokens, authentification)
- `utils.test.ts` — Utilitaires (cn, tailwind merge)

---

## 🔐 Variables d'Environnement

### Frontend (`.env`)

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | URL du projet Supabase |
| `VITE_SUPABASE_ANON_KEY` | Clé publique Supabase |
| `VITE_API_URL` | URL du backend API |

### Backend (`backend/.env`)

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Connection string PostgreSQL |
| `JWT_SECRET` | Secret JWT (64 bytes hex) |
| `PORT` | Port du serveur (défaut: 8080) |
| `NODE_ENV` | Environnement (development/production) |

> ⚠️ **Ne jamais committer les fichiers `.env`** — Utiliser les fichiers `.env.example` comme templates.

---

## 🚢 Déploiement

### Architecture cible
- **Frontend** : Build statique déployé sur Firebase Hosting / Cloud Run
- **Backend** : Container Docker sur Cloud Run
- **Base de données** : Cloud SQL PostgreSQL 15 (instance `idetude-db`)
- **Auth** : Supabase (projet hébergé)

### Build de production

```bash
# Frontend
bun run build
# Sortie dans ./dist/

# Backend
cd backend
bun run build
# Sortie dans ./dist/
```

---

## 📄 Licence

Projet propriétaire — **OKA Tech / NTSAGUI**  
© 2026 Secrétariat Général du Gouvernement du Gabon
