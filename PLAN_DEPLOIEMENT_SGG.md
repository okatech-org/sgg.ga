# 🚀 PLAN DE DÉPLOIEMENT SGG DIGITAL
## Adapté à l'Infrastructure Hub Cloud SQL Existante

**Date** : 6 février 2026  
**Instance Cloud SQL** : `idetude-db` (IP: 35.195.248.19)  
**Nouvelle base à créer** : `db_sgg`

---

## 📋 RÉSUMÉ DE L'INFRASTRUCTURE EXISTANTE

### Hub Cloud SQL Unique

| Projet | Base de Données | État |
|--------|-----------------|------|
| **iEtude** | `postgres` | ✅ Active, peuplée |
| **Digitalium** | `db_digitalium` | 📋 À créer |
| **Nexus** | `db_nexus` | 📋 À créer |
| **SGG Digital** | `db_sgg` | 📋 **À créer** |

### Avantages de cette Architecture
- 💰 **Économie** : ~100€/mois (1 instance au lieu de 4)
- 🔧 **Maintenance** : Un seul point de gestion
- 📊 **Monitoring** : Métriques centralisées
- 🔐 **Sécurité** : Isolation par base de données

---

## 🗓️ PHASE 0 : PRÉPARATION INFRASTRUCTURE (1 jour)

### 0.1 Créer la Base de Données SGG

```bash
# Connexion à l'instance Hub
gcloud sql connect idetude-db --user=postgres

# Créer la base dédiée SGG
CREATE DATABASE db_sgg 
  WITH ENCODING='UTF8' 
  LC_COLLATE='fr_FR.UTF-8' 
  LC_CTYPE='fr_FR.UTF-8'
  TEMPLATE=template0;

# Créer un utilisateur dédié (optionnel mais recommandé)
CREATE USER sgg_user WITH PASSWORD 'SGG_Secure_2026!';
GRANT ALL PRIVILEGES ON DATABASE db_sgg TO sgg_user;

# Se connecter à la nouvelle base
\c db_sgg

# Vérifier
\dt
```

### 0.2 Configurer le Projet SGG.ga

**Fichier** : `.env` (à créer/modifier)

```env
# ====== SUPABASE (Auth Frontend) ======
VITE_SUPABASE_PROJECT_ID="yzijbtwpavfefboxofus"
VITE_SUPABASE_PUBLISHABLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
VITE_SUPABASE_URL="https://yzijbtwpavfefboxofus.supabase.co"

# ====== CLOUD SQL (Backend API) ======
CLOUDSQL_INSTANCE="idetude-db"
CLOUDSQL_IP="35.195.248.19"
CLOUDSQL_DATABASE="db_sgg"
CLOUDSQL_USER="sgg_user"
CLOUDSQL_PASSWORD="SGG_Secure_2026!"

# URL de connexion complète
DATABASE_URL="postgresql://sgg_user:SGG_Secure_2026!@35.195.248.19:5432/db_sgg?sslmode=require"

# ====== BACKEND CONFIG ======
PORT=8080
NODE_ENV=development
JWT_SECRET="votre-secret-jwt-256-bits"

# ====== REDIS (optionnel pour cache) ======
REDIS_URL="redis://localhost:6379"

# ====== API PUBLIC URL ======
VITE_API_URL="http://localhost:8080"
```

**Fichier** : `backend/.env`

```env
DATABASE_URL="postgresql://sgg_user:SGG_Secure_2026!@35.195.248.19:5432/db_sgg?sslmode=require"
PORT=8080
NODE_ENV=development
JWT_SECRET="votre-secret-jwt-256-bits"
```

### 0.3 Vérifier la Connexion

```bash
# Tester depuis le backend
cd backend
npm run dev

# Dans un autre terminal
curl http://localhost:8080/api/health
# Devrait retourner : { "status": "ok", "database": "connected" }
```

---

## 🗄️ PHASE 1 : DÉPLOIEMENT DU SCHÉMA (1-2 jours)

### 1.1 Exécuter le Schéma Complet

```bash
# Connexion à la base SGG
gcloud sql connect idetude-db --user=postgres --database=db_sgg

# Exécuter le schéma (7 schemas, ~1800 lignes)
\i /chemin/vers/sgg.ga/database/schema.sql

# Vérifier les schemas créés
\dn
# Devrait afficher : auth, gar, nominations, legislatif, egop, jo, institutions
```

### 1.2 Script de Vérification

```sql
-- Vérifier les tables créées
SELECT schemaname, tablename 
FROM pg_tables 
WHERE schemaname IN ('auth', 'gar', 'nominations', 'legislatif', 'egop', 'jo', 'institutions')
ORDER BY schemaname, tablename;

-- Compter les tables par schema
SELECT schemaname, COUNT(*) as nb_tables
FROM pg_tables 
WHERE schemaname IN ('auth', 'gar', 'nominations', 'legislatif', 'egop', 'jo', 'institutions')
GROUP BY schemaname;
```

**Résultat attendu** :
| Schema | Nb Tables |
|--------|-----------|
| auth | 4 |
| gar | 4 |
| nominations | 5 |
| legislatif | 3 |
| egop | 3 |
| jo | 3 |
| institutions | 2 |

---

## 👥 PHASE 2 : CRÉATION DES COMPTES (1 jour)

### 2.1 Script de Seeding des Utilisateurs

**Fichier à créer** : `database/seed/01_users.sql`

```sql
-- ============================================================================
-- SGG DIGITAL - SEEDING DES 15 COMPTES DEMO
-- ============================================================================

-- Activer l'extension pour le hash des mots de passe
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================================
-- INSERTION DES UTILISATEURS
-- ============================================================================

INSERT INTO auth.users (id, email, password_hash, full_name, phone, is_active, is_verified) VALUES
-- EXÉCUTIF (5 comptes)
('11111111-1111-1111-1111-111111111101', 'president@presidence.ga', 
 crypt('Demo2026!', gen_salt('bf')), 'S.E.M. Brice Clotaire OLIGUI NGUEMA', '+241 01 00 00 01', true, true),
 
('11111111-1111-1111-1111-111111111102', 'vp@presidence.ga', 
 crypt('Demo2026!', gen_salt('bf')), 'Vice-Président de la République', '+241 01 00 00 02', true, true),
 
('11111111-1111-1111-1111-111111111103', 'pm@primature.ga', 
 crypt('Demo2026!', gen_salt('bf')), 'Raymond NDONG SIMA, Premier Ministre', '+241 01 00 00 03', true, true),

('11111111-1111-1111-1111-111111111104', 'ministre@economie.gouv.ga', 
 crypt('Demo2026!', gen_salt('bf')), 'Mays MOUISSI, Ministre de l''Économie', '+241 01 00 00 04', true, true),

('11111111-1111-1111-1111-111111111105', 'sg@economie.gouv.ga', 
 crypt('Demo2026!', gen_salt('bf')), 'Jean-Pierre MBOUMBA, SG Économie', '+241 01 00 00 05', true, true),

-- PRÉSIDENCE (1 compte)
('11111111-1111-1111-1111-111111111106', 'sgpr@presidence.ga', 
 crypt('Demo2026!', gen_salt('bf')), 'Secrétaire Général Présidence République', '+241 01 00 00 06', true, true),

-- LÉGISLATIF (2 comptes)
('11111111-1111-1111-1111-111111111107', 'sg@assemblee.ga', 
 crypt('Demo2026!', gen_salt('bf')), 'SG Assemblée Nationale de Transition', '+241 01 00 00 07', true, true),

('11111111-1111-1111-1111-111111111108', 'sg@senat.ga', 
 crypt('Demo2026!', gen_salt('bf')), 'SG Sénat de Transition', '+241 01 00 00 08', true, true),

-- JURIDICTIONNEL (2 comptes)
('11111111-1111-1111-1111-111111111109', 'greffe@conseiletat.ga', 
 crypt('Demo2026!', gen_salt('bf')), 'Greffier en Chef Conseil d''État', '+241 01 00 00 09', true, true),

('11111111-1111-1111-1111-111111111110', 'greffe@courconstitutionnelle.ga', 
 crypt('Demo2026!', gen_salt('bf')), 'Greffier Cour Constitutionnelle', '+241 01 00 00 10', true, true),

-- ADMINISTRATIF SGG (3 comptes)
('11111111-1111-1111-1111-111111111111', 'admin@sgg.ga', 
 crypt('Demo2026!', gen_salt('bf')), 'Administrateur Système SGG', '+241 01 00 00 11', true, true),

('11111111-1111-1111-1111-111111111112', 'directeur@sgg.ga', 
 crypt('Demo2026!', gen_salt('bf')), 'Directeur CTCO/SGG', '+241 01 00 00 12', true, true),

('11111111-1111-1111-1111-111111111113', 'direction@jo.ga', 
 crypt('Demo2026!', gen_salt('bf')), 'Directeur Journal Officiel', '+241 01 00 00 13', true, true),

-- PUBLIC (2 comptes)
('11111111-1111-1111-1111-111111111114', 'citoyen@gmail.com', 
 crypt('Demo2026!', gen_salt('bf')), 'Jean MOUSSAVOU', '+241 07 00 00 14', true, true),

('11111111-1111-1111-1111-111111111115', 'avocat@barreau.ga', 
 crypt('Demo2026!', gen_salt('bf')), 'Me Paul NDONG, Avocat', '+241 07 00 00 15', true, true);

-- ============================================================================
-- ATTRIBUTION DES RÔLES
-- ============================================================================

INSERT INTO auth.user_roles (user_id, role, is_primary) VALUES
-- Exécutif
('11111111-1111-1111-1111-111111111101', 'admin_sgg', true),  -- Président (accès total pour démo)
('11111111-1111-1111-1111-111111111102', 'admin_sgg', true),  -- VP
('11111111-1111-1111-1111-111111111103', 'premier_ministre', true),
('11111111-1111-1111-1111-111111111104', 'ministre', true),
('11111111-1111-1111-1111-111111111105', 'sg_ministere', true),

-- Présidence
('11111111-1111-1111-1111-111111111106', 'sgpr', true),

-- Législatif
('11111111-1111-1111-1111-111111111107', 'assemblee', true),
('11111111-1111-1111-1111-111111111108', 'senat', true),

-- Juridictionnel
('11111111-1111-1111-1111-111111111109', 'conseil_etat', true),
('11111111-1111-1111-1111-111111111110', 'cour_constitutionnelle', true),

-- Administratif
('11111111-1111-1111-1111-111111111111', 'admin_sgg', true),
('11111111-1111-1111-1111-111111111112', 'directeur_sgg', true),
('11111111-1111-1111-1111-111111111113', 'dgjo', true),

-- Public
('11111111-1111-1111-1111-111111111114', 'citoyen', true),
('11111111-1111-1111-1111-111111111115', 'citoyen', true);

-- ============================================================================
-- VÉRIFICATION
-- ============================================================================
SELECT u.email, u.full_name, ur.role 
FROM auth.users u 
JOIN auth.user_roles ur ON u.id = ur.user_id 
ORDER BY ur.role;
```

### 2.2 Script des Institutions

**Fichier à créer** : `database/seed/02_institutions.sql`

```sql
-- ============================================================================
-- SGG DIGITAL - SEEDING DES INSTITUTIONS
-- ============================================================================

-- Présidence
INSERT INTO institutions.institutions (code, nom, sigle, type, ordre_protocole) VALUES
('PRES', 'Présidence de la République', 'PR', 'presidence', 1),
('SGPR', 'Secrétariat Général de la Présidence', 'SGPR', 'secretariat_general', 2),
('PRIM', 'Primature', 'PM', 'primature', 3),
('SGG', 'Secrétariat Général du Gouvernement', 'SGG', 'secretariat_general', 4);

-- Ministères (35) - Ordre protocolaire
INSERT INTO institutions.institutions (code, nom, sigle, type, ordre_protocole) VALUES
('MIN-DEF', 'Ministère de la Défense Nationale', 'MDN', 'ministere', 10),
('MIN-INT', 'Ministère de l''Intérieur et de la Sécurité', 'MI', 'ministere', 11),
('MIN-AE', 'Ministère des Affaires Étrangères', 'MAE', 'ministere', 12),
('MIN-JUST', 'Ministère de la Justice', 'MJ', 'ministere', 13),
('MIN-ECO', 'Ministère de l''Économie et des Finances', 'MEF', 'ministere', 14),
('MIN-BUDGET', 'Ministère du Budget et des Comptes Publics', 'MBP', 'ministere', 15),
('MIN-PLAN', 'Ministère de la Planification', 'MPLAN', 'ministere', 16),
('MIN-EDU', 'Ministère de l''Éducation Nationale', 'MEN', 'ministere', 17),
('MIN-ESUP', 'Ministère de l''Enseignement Supérieur', 'MESRS', 'ministere', 18),
('MIN-SANTE', 'Ministère de la Santé', 'MSAS', 'ministere', 19),
('MIN-AS', 'Ministère des Affaires Sociales', 'MAS', 'ministere', 20),
('MIN-TRAV', 'Ministère du Travail et de l''Emploi', 'MTE', 'ministere', 21),
('MIN-FP', 'Ministère de la Fonction Publique', 'MFP', 'ministere', 22),
('MIN-AGRI', 'Ministère de l''Agriculture', 'MAGRI', 'ministere', 23),
('MIN-EF', 'Ministère des Eaux et Forêts', 'MEF', 'ministere', 24),
('MIN-ENV', 'Ministère de l''Environnement', 'MENV', 'ministere', 25),
('MIN-MINES', 'Ministère des Mines', 'MMINES', 'ministere', 26),
('MIN-PET', 'Ministère du Pétrole et du Gaz', 'MPG', 'ministere', 27),
('MIN-ENERG', 'Ministère de l''Énergie et de l''Eau', 'MEE', 'ministere', 28),
('MIN-INFRA', 'Ministère des Infrastructures', 'MITP', 'ministere', 29),
('MIN-HABITAT', 'Ministère de l''Habitat et de l''Urbanisme', 'MHU', 'ministere', 30),
('MIN-TRANS', 'Ministère des Transports', 'MT', 'ministere', 31),
('MIN-NUM', 'Ministère de l''Économie Numérique', 'MNUM', 'ministere', 32),
('MIN-COM', 'Ministère de la Communication', 'MCOM', 'ministere', 33),
('MIN-CULTURE', 'Ministère de la Culture et des Arts', 'MCA', 'ministere', 34),
('MIN-SPORT', 'Ministère des Sports', 'MS', 'ministere', 35),
('MIN-JEUNE', 'Ministère de la Jeunesse', 'MJ', 'ministere', 36),
('MIN-FEMME', 'Ministère de la Promotion de la Femme', 'MPF', 'ministere', 37),
('MIN-COMMERCE', 'Ministère du Commerce', 'MCE', 'ministere', 38),
('MIN-TOURISME', 'Ministère du Tourisme', 'MTOUR', 'ministere', 39),
('MIN-DECEN', 'Ministère de la Décentralisation', 'MDEC', 'ministere', 40),
('MIN-REL-PARL', 'Ministère Relations avec le Parlement', 'MRP', 'ministere', 41),
('MIN-REFORME', 'Ministère de la Réforme des Institutions', 'MRI', 'ministere', 42),
('MIN-FP-PRO', 'Ministère de la Formation Professionnelle', 'MFPRO', 'ministere', 43),
('MIN-PECHE', 'Ministère de la Pêche et de l''Aquaculture', 'MPA', 'ministere', 44);

-- Institutions Législatives
INSERT INTO institutions.institutions (code, nom, sigle, type, ordre_protocole) VALUES
('AN', 'Assemblée Nationale de Transition', 'ANT', 'assemblee', 5),
('SEN', 'Sénat de Transition', 'ST', 'senat', 6);

-- Institutions Juridictionnelles
INSERT INTO institutions.institutions (code, nom, sigle, type, ordre_protocole) VALUES
('CC', 'Cour Constitutionnelle', 'CC', 'juridiction', 7),
('CE', 'Conseil d''État', 'CE', 'juridiction', 8),
('CDC', 'Cour de Cassation', 'CDC', 'juridiction', 9),
('CC-COMPTES', 'Cour des Comptes', 'CDC', 'juridiction', 9);

-- Direction Journal Officiel
INSERT INTO institutions.institutions (code, nom, sigle, type, ordre_protocole, parent_id) VALUES
('DGJO', 'Direction Générale du Journal Officiel', 'DGJO', 'direction_generale', 100,
 (SELECT id FROM institutions.institutions WHERE code = 'SGG'));
```

### 2.3 Script des Priorités PAG 2026

**Fichier à créer** : `database/seed/03_pag2026.sql`

```sql
-- ============================================================================
-- SGG DIGITAL - SEEDING PAG 2026 (8 PRIORITÉS)
-- ============================================================================

INSERT INTO gar.priorites_pag (code, priorite, titre, description, icone, couleur, ordre, budget_alloue) VALUES
('P1', 'energie_eau', 'Énergie & Eau', 
 'Accès universel à l''électricité et à l''eau potable pour tous les Gabonais', 
 'Zap', '#3B82F6', 1, 500000000000),

('P2', 'education', 'Éducation & Formation', 
 'Réforme du système éducatif et formation professionnelle des jeunes', 
 'GraduationCap', '#F59E0B', 2, 350000000000),

('P3', 'sante', 'Santé', 
 'Couverture Santé Universelle et modernisation du système de santé', 
 'HeartPulse', '#EF4444', 3, 450000000000),

('P4', 'habitat', 'Habitat & Cadre de Vie', 
 'Programme de logements sociaux et amélioration du cadre de vie', 
 'Home', '#22C55E', 4, 280000000000),

('P5', 'infrastructure', 'Infrastructures & Numérique', 
 'Désenclavement routier et transformation numérique de l''économie', 
 'Globe', '#8B5CF6', 5, 750000000000),

('P6', 'agriculture', 'Agriculture & Souveraineté Alimentaire', 
 'Intensification agricole et réduction de la dépendance aux importations', 
 'Wheat', '#10B981', 6, 200000000000),

('P7', 'gouvernance', 'Gouvernance & Administration', 
 'Modernisation de l''administration publique et dématérialisation', 
 'Shield', '#6366F1', 7, 150000000000),

('P8', 'justice', 'Justice & Sécurité', 
 'Accès à la justice et renforcement de la sécurité des personnes', 
 'Scale', '#EC4899', 8, 180000000000);

-- Vérification
SELECT code, titre, budget_alloue / 1000000000 as budget_mds_fcfa FROM gar.priorites_pag ORDER BY ordre;
```

### 2.4 Exécution des Seeds

```bash
# Se connecter à la base SGG
gcloud sql connect idetude-db --user=postgres --database=db_sgg

# Exécuter les scripts de seeding
\i database/seed/01_users.sql
\i database/seed/02_institutions.sql
\i database/seed/03_pag2026.sql

# Vérifications
SELECT COUNT(*) as nb_users FROM auth.users;
SELECT COUNT(*) as nb_institutions FROM institutions.institutions;
SELECT COUNT(*) as nb_priorites FROM gar.priorites_pag;
```

---

## 🔌 PHASE 3 : CONNEXION BACKEND (2-3 jours)

### 3.1 Modifier la Configuration Database

**Fichier** : `backend/src/config/database.ts` (déjà existant, vérifier)

```typescript
import { Pool, PoolConfig, QueryResult } from 'pg';

const config: PoolConfig = {
  // Utiliser la variable d'environnement
  connectionString: process.env.DATABASE_URL,
  
  // Pool configuration
  max: 10,
  min: 2,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
  
  // SSL pour Cloud SQL
  ssl: process.env.NODE_ENV === 'production' 
    ? { rejectUnauthorized: false }
    : false,
    
  application_name: 'sgg-digital-api',
};

export const pool = new Pool(config);

// Tester la connexion au démarrage
pool.on('connect', () => {
  console.log('✅ Connecté à Cloud SQL (db_sgg)');
});

pool.on('error', (err) => {
  console.error('❌ Erreur Cloud SQL:', err);
});
```

### 3.2 Modifier les Routes API pour Utiliser la DB

**Exemple** : `backend/src/routes/gar.ts`

```typescript
import { Router, Request, Response } from 'express';
import { pool } from '../config/database.js';

const router = Router();

// GET /api/gar/priorites
router.get('/priorites', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT * FROM gar.priorites_pag ORDER BY ordre
    `);
    
    res.json({
      success: true,
      data: result.rows,
      count: result.rowCount
    });
  } catch (error) {
    console.error('Erreur priorités:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erreur lors de la récupération des priorités' 
    });
  }
});

// GET /api/gar/dashboard
router.get('/dashboard', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`SELECT * FROM gar.v_dashboard`);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur dashboard' });
  }
});

export default router;
```

### 3.3 Tester la Connexion

```bash
# Terminal 1 : Démarrer le backend
cd backend
npm run dev

# Terminal 2 : Tester les endpoints
curl http://localhost:8080/api/health
# { "status": "ok", "database": "connected" }

curl http://localhost:8080/api/gar/priorites
# { "success": true, "data": [...8 priorités...], "count": 8 }
```

---

## 📊 PHASE 4 : CONNECTER LE FRONTEND (2 jours)

### 4.1 Créer un Service API

**Fichier à créer** : `src/services/api.ts`

```typescript
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Fonction helper pour les requêtes
async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });
    
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    return { success: false, error: 'Erreur de connexion' };
  }
}

// ========== GAR API ==========
export const garApi = {
  getPriorites: () => fetchApi('/api/gar/priorites'),
  getDashboard: () => fetchApi('/api/gar/dashboard'),
  getObjectifs: (filters?: Record<string, string>) => {
    const params = new URLSearchParams(filters);
    return fetchApi(`/api/gar/objectifs?${params}`);
  },
  getRapports: (filters?: Record<string, string>) => {
    const params = new URLSearchParams(filters);
    return fetchApi(`/api/gar/rapports?${params}`);
  },
};

// ========== INSTITUTIONS API ==========
export const institutionsApi = {
  getAll: () => fetchApi('/api/institutions'),
  getMinisteres: () => fetchApi('/api/institutions?type=ministere'),
};

// ========== AUTH API ==========
export const authApi = {
  getProfile: (userId: string) => fetchApi(`/api/users/${userId}`),
};
```

### 4.2 Hook de Données avec React Query

**Fichier à créer** : `src/hooks/useGARData.ts`

```typescript
import { useQuery } from '@tanstack/react-query';
import { garApi } from '@/services/api';

export function usePriorites() {
  return useQuery({
    queryKey: ['gar', 'priorites'],
    queryFn: garApi.getPriorites,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useDashboardGAR() {
  return useQuery({
    queryKey: ['gar', 'dashboard'],
    queryFn: garApi.getDashboard,
    refetchInterval: 30 * 1000, // Refresh toutes les 30s
  });
}

export function useRapports(filters?: Record<string, string>) {
  return useQuery({
    queryKey: ['gar', 'rapports', filters],
    queryFn: () => garApi.getRapports(filters),
  });
}
```

### 4.3 Intégrer dans les Composants

**Exemple** : Modifier `src/pages/GAR.tsx` pour utiliser les vraies données

```typescript
import { usePriorites, useDashboardGAR } from '@/hooks/useGARData';

export default function GAR() {
  const { data: prioritesResponse, isLoading: loadingPriorites } = usePriorites();
  const { data: dashboardResponse, isLoading: loadingDashboard } = useDashboardGAR();
  
  // Fallback sur les données mock si l'API échoue
  const priorites = prioritesResponse?.data || MOCK_PRIORITES;
  const dashboard = dashboardResponse?.data || MOCK_DASHBOARD;
  
  if (loadingPriorites || loadingDashboard) {
    return <LoadingSpinner />;
  }
  
  // ... reste du composant
}
```

---

## 📋 CHECKLIST DE DÉPLOIEMENT

### Phase 0 : Infrastructure ✅
- [ ] Créer la base `db_sgg` sur l'instance `idetude-db`
- [ ] Créer l'utilisateur `sgg_user`
- [ ] Configurer les fichiers `.env`
- [ ] Tester la connexion

### Phase 1 : Schéma
- [ ] Exécuter `database/schema.sql`
- [ ] Vérifier les 7 schemas créés
- [ ] Vérifier les tables (~24)

### Phase 2 : Seeding
- [ ] Créer les 15 comptes utilisateurs
- [ ] Créer les ~45 institutions
- [ ] Créer les 8 priorités PAG
- [ ] Vérifier les données

### Phase 3 : Backend API
- [ ] Modifier `database.ts` pour Cloud SQL
- [ ] Implémenter les routes GAR (GET)
- [ ] Implémenter les routes Institutions
- [ ] Tester avec curl

### Phase 4 : Frontend
- [ ] Créer `src/services/api.ts`
- [ ] Créer les hooks React Query
- [ ] Modifier les pages pour utiliser l'API
- [ ] Fallback sur mock si erreur

---

## 🕐 TIMELINE ESTIMÉE

| Phase | Durée | Cumul |
|-------|-------|-------|
| Phase 0 : Infrastructure | 0.5 jour | 0.5 jour |
| Phase 1 : Schéma DB | 0.5 jour | 1 jour |
| Phase 2 : Seeding | 1 jour | 2 jours |
| Phase 3 : Backend API | 2-3 jours | 4-5 jours |
| Phase 4 : Frontend | 2 jours | 6-7 jours |

**Total : ~1 semaine** pour avoir les comptes démo connectés à de vraies données persistantes.

---

## 🔧 COMMANDES RAPIDES

```bash
# Connexion à la base SGG
gcloud sql connect idetude-db --user=postgres --database=db_sgg

# Créer la base (si pas encore fait)
CREATE DATABASE db_sgg;

# Exécuter tout le setup
\i database/schema.sql
\i database/seed/01_users.sql
\i database/seed/02_institutions.sql
\i database/seed/03_pag2026.sql

# Vérification rapide
SELECT 'users' as table, COUNT(*) as count FROM auth.users
UNION ALL SELECT 'institutions', COUNT(*) FROM institutions.institutions
UNION ALL SELECT 'priorites', COUNT(*) FROM gar.priorites_pag;
```

---

*Plan adapté à l'infrastructure Hub Cloud SQL existante - 6 février 2026*
