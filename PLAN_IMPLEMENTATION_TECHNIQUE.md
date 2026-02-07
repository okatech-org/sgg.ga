# 🚀 PLAN D'IMPLÉMENTATION TECHNIQUE
## SGG Digital - Rendre les Comptes Démo Fonctionnels

**Objectif** : Transformer les 15 comptes démo en interfaces complètement fonctionnelles avec persistance des données.

---

## 📋 RÉSUMÉ EXÉCUTIF

### État Actuel
- ✅ **15 comptes démo** configurés avec RBAC
- ✅ **UI complète** pour tous les modules
- ❌ **Aucune persistance** - données mock uniquement
- ❌ **API backend** - routes définies mais non connectées

### Objectif Final
- ✅ Comptes démo avec données persistantes
- ✅ CRUD complet sur tous les modules
- ✅ Workflow de validation fonctionnel
- ✅ Notifications et alertes
- ✅ Export documents

---

## 🏗️ PHASE 1 : INFRASTRUCTURE (3-4 jours)

### 1.1 Déploiement Base de Données

```bash
# Connexion à Cloud SQL
gcloud sql connect sgg-digital-db --user=postgres

# Exécution du schéma
\i database/schema.sql
```

**Fichier à modifier** : `backend/src/config/database.ts`
```typescript
// Vérifier la connexion
const config: PoolConfig = {
  connectionString: process.env.DATABASE_URL, // ✅ Déjà configuré
  ssl: { rejectUnauthorized: false },
};
```

### 1.2 Création des 15 Comptes Réels

**Fichier à créer** : `database/seed/users.sql`

```sql
-- Insérer les 15 comptes démo dans auth.users
INSERT INTO auth.users (id, email, password_hash, full_name, is_active, is_verified) VALUES
  -- EXÉCUTIF
  (uuid_generate_v4(), 'president@presidence.ga', crypt('Demo2026!', gen_salt('bf')), 'S.E.M. le Président', true, true),
  (uuid_generate_v4(), 'vp@presidence.ga', crypt('Demo2026!', gen_salt('bf')), 'Vice-Président de la République', true, true),
  (uuid_generate_v4(), 'pm@primature.ga', crypt('Demo2026!', gen_salt('bf')), 'Premier Ministre', true, true),
  (uuid_generate_v4(), 'ministre@economie.gouv.ga', crypt('Demo2026!', gen_salt('bf')), 'Ministre de l''Économie', true, true),
  (uuid_generate_v4(), 'sg@economie.gouv.ga', crypt('Demo2026!', gen_salt('bf')), 'SG Min. Économie', true, true),
  
  -- PRÉSIDENCE
  (uuid_generate_v4(), 'sgpr@presidence.ga', crypt('Demo2026!', gen_salt('bf')), 'Secrétaire Général Présidence', true, true),
  
  -- LÉGISLATIF
  (uuid_generate_v4(), 'sg@assemblee.ga', crypt('Demo2026!', gen_salt('bf')), 'SG Assemblée Nationale', true, true),
  (uuid_generate_v4(), 'sg@senat.ga', crypt('Demo2026!', gen_salt('bf')), 'SG Sénat', true, true),
  
  -- JURIDICTIONNEL
  (uuid_generate_v4(), 'greffe@conseiletat.ga', crypt('Demo2026!', gen_salt('bf')), 'Greffier Conseil d''État', true, true),
  (uuid_generate_v4(), 'greffe@courconstitutionnelle.ga', crypt('Demo2026!', gen_salt('bf')), 'Greffier Cour Constitutionnelle', true, true),
  
  -- ADMINISTRATIF SGG
  (uuid_generate_v4(), 'admin@sgg.ga', crypt('Demo2026!', gen_salt('bf')), 'Administrateur SGG', true, true),
  (uuid_generate_v4(), 'directeur@sgg.ga', crypt('Demo2026!', gen_salt('bf')), 'Directeur SGG', true, true),
  (uuid_generate_v4(), 'direction@jo.ga', crypt('Demo2026!', gen_salt('bf')), 'Directeur DGJO', true, true),
  
  -- PUBLIC
  (uuid_generate_v4(), 'citoyen@gmail.com', crypt('Demo2026!', gen_salt('bf')), 'Jean MOUSSAVOU', true, true),
  (uuid_generate_v4(), 'avocat@barreau.ga', crypt('Demo2026!', gen_salt('bf')), 'Me Paul NDONG', true, true);

-- Assigner les rôles
INSERT INTO auth.user_roles (user_id, role, is_primary)
SELECT id, 'admin_sgg', true FROM auth.users WHERE email = 'admin@sgg.ga';
-- ... (répéter pour chaque utilisateur)
```

### 1.3 Seeding des Données de Référence

**Fichier à créer** : `database/seed/institutions.sql`

```sql
-- 35 Ministères
INSERT INTO institutions.institutions (code, nom, sigle, type) VALUES
  ('MIN-ECO', 'Ministère de l''Économie et des Finances', 'MEF', 'ministere'),
  ('MIN-EDU', 'Ministère de l''Éducation Nationale', 'MEN', 'ministere'),
  ('MIN-SANTE', 'Ministère de la Santé', 'MSAS', 'ministere'),
  -- ... 32 autres ministères
  ('PRES', 'Présidence de la République', 'PR', 'presidence'),
  ('SGG', 'Secrétariat Général du Gouvernement', 'SGG', 'secretariat_general');
```

---

## 🔐 PHASE 2 : AUTHENTIFICATION (2-3 jours)

### 2.1 Synchronisation Supabase ↔ PostgreSQL

**Fichier à modifier** : `src/contexts/AuthContext.tsx`

```typescript
// Ajouter synchronisation avec notre table auth.users
const fetchUserData = async (userId: string) => {
  // 1. Vérifier dans Supabase (auth native)
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", userId)
    .single();

  // 2. Fallback sur notre backend si pas dans Supabase
  if (!profile) {
    const response = await fetch(`/api/users/${userId}`);
    const userData = await response.json();
    setProfile(userData.profile);
    setRole(userData.role);
  }
};
```

### 2.2 Middleware JWT Backend

**Fichier à créer** : `backend/src/middleware/auth.ts`

```typescript
import jwt from 'jsonwebtoken';
import { query } from '../config/database.js';

export async function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Token manquant' });
  }

  try {
    // Décoder le token Supabase
    const decoded = jwt.verify(token, process.env.SUPABASE_JWT_SECRET);
    
    // Récupérer les infos utilisateur
    const result = await query(
      `SELECT u.*, ur.role 
       FROM auth.users u 
       JOIN auth.user_roles ur ON u.id = ur.user_id 
       WHERE u.id = $1`,
      [decoded.sub]
    );
    
    req.user = result.rows[0];
    req.userId = decoded.sub;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token invalide' });
  }
}
```

### 2.3 Mode Hybride (Demo + Real Auth)

**Logique** : Permettre les deux modes simultanément

```typescript
// ProtectedRoute.tsx - Déjà implémenté ✅
const isDemoMode = demoUser !== null;
if (isDemoMode) {
  // Mode démo : utiliser sessionStorage
} else {
  // Mode réel : utiliser Supabase
}
```

---

## 📊 PHASE 3 : API GAR & MATRICE REPORTING (5-7 jours)

### 3.1 Routes API GAR

**Fichier** : `backend/src/routes/gar.ts`

```typescript
import { Router } from 'express';
import { query } from '../config/database.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// GET /api/gar/priorites - 8 priorités PAG
router.get('/priorites', authMiddleware, async (req, res) => {
  const result = await query(`
    SELECT * FROM gar.priorites_pag ORDER BY ordre
  `);
  res.json({ success: true, data: result.rows });
});

// GET /api/gar/objectifs - Liste filtrée
router.get('/objectifs', authMiddleware, async (req, res) => {
  const { priorite, ministere, annee, statut } = req.query;
  
  let sql = `SELECT * FROM gar.objectifs WHERE 1=1`;
  const params = [];
  
  if (priorite) {
    params.push(priorite);
    sql += ` AND priorite_id = $${params.length}`;
  }
  // ... autres filtres
  
  const result = await query(sql, params);
  res.json({ success: true, data: result.rows });
});

// GET /api/gar/dashboard - Statistiques agrégées
router.get('/dashboard', authMiddleware, async (req, res) => {
  const result = await query(`SELECT * FROM gar.v_dashboard`);
  res.json({ success: true, data: result.rows });
});

// GET /api/gar/rapports - Rapports mensuels
router.get('/rapports', authMiddleware, async (req, res) => {
  const { ministere, annee, mois, statut } = req.query;
  // ... filtrage
});

// POST /api/gar/rapports - Créer/sauvegarder rapport
router.post('/rapports', authMiddleware, async (req, res) => {
  const { 
    ministere_id, annee, mois, donnees_matrice, 
    synthese, difficultes, perspectives 
  } = req.body;
  
  const result = await query(`
    INSERT INTO gar.rapports (ministere_id, annee, mois, donnees_matrice, synthese, difficultes, perspectives, statut, created_by)
    VALUES ($1, $2, $3, $4, $5, $6, $7, 'brouillon', $8)
    RETURNING *
  `, [ministere_id, annee, mois, JSON.stringify(donnees_matrice), synthese, difficultes, perspectives, req.userId]);
  
  res.json({ success: true, data: result.rows[0] });
});

// PUT /api/gar/rapports/:id/submit - Soumettre
router.put('/rapports/:id/submit', authMiddleware, async (req, res) => {
  const { id } = req.params;
  
  const result = await query(`
    UPDATE gar.rapports 
    SET statut = 'soumis', date_soumission = NOW(), soumis_par = $2, updated_at = NOW()
    WHERE id = $1
    RETURNING *
  `, [id, req.userId]);
  
  // Créer notification pour SGG
  await query(`
    INSERT INTO auth.notifications (user_id, type, titre, message, lien_action)
    SELECT id, 'rapport_soumis', 'Nouveau rapport soumis', $2, '/matrice-reporting/validation'
    FROM auth.user_roles WHERE role = 'sgg_directeur'
  `, [id, `Rapport ${result.rows[0].mois}/${result.rows[0].annee} soumis par ${result.rows[0].ministere_id}`]);
  
  res.json({ success: true, data: result.rows[0] });
});

// PUT /api/gar/rapports/:id/validate-sgg
router.put('/rapports/:id/validate-sgg', authMiddleware, async (req, res) => {
  // Vérifier que l'utilisateur a le rôle SGG
  if (!['admin_sgg', 'directeur_sgg'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Accès refusé' });
  }
  
  const { commentaire } = req.body;
  
  const result = await query(`
    UPDATE gar.rapports 
    SET statut = 'valide_sgg', date_validation_sgg = NOW(), valide_sgg_par = $2, commentaire_validation = $3, updated_at = NOW()
    WHERE id = $1
    RETURNING *
  `, [req.params.id, req.userId, commentaire]);
  
  res.json({ success: true, data: result.rows[0] });
});

// PUT /api/gar/rapports/:id/validate-sgpr
router.put('/rapports/:id/validate-sgpr', authMiddleware, async (req, res) => {
  if (req.user.role !== 'sgpr') {
    return res.status(403).json({ error: 'Seul le SGPR peut valider' });
  }
  // ... validation finale
});

export default router;
```

### 3.2 Connecter le Frontend

**Fichier à modifier** : `src/hooks/useReportingData.ts`

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const API_BASE = import.meta.env.VITE_API_URL || '';

// Hook pour récupérer les rapports
export function useRapports(filters: RapportFilters) {
  return useQuery({
    queryKey: ['rapports', filters],
    queryFn: async () => {
      const params = new URLSearchParams(filters as any);
      const response = await fetch(`${API_BASE}/api/gar/rapports?${params}`, {
        headers: {
          'Authorization': `Bearer ${getToken()}`,
        },
      });
      if (!response.ok) throw new Error('Erreur chargement rapports');
      return response.json();
    },
  });
}

// Hook pour soumettre un rapport
export function useSubmitRapport() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (rapportId: string) => {
      const response = await fetch(`${API_BASE}/api/gar/rapports/${rapportId}/submit`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${getToken()}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error('Erreur soumission');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rapports'] });
    },
  });
}
```

---

## 📝 PHASE 4 : API NOMINATIONS (5-7 jours)

### 4.1 Routes API Nominations

**Fichier** : `backend/src/routes/nominations.ts`

```typescript
import { Router } from 'express';
import { query, transaction } from '../config/database.js';
import { authMiddleware } from '../middleware/auth.js';
import { uploadMiddleware, uploadToGCS } from '../config/storage.js';

const router = Router();

// GET /api/nominations/dossiers
router.get('/dossiers', authMiddleware, async (req, res) => {
  const { statut, ministere, categorie } = req.query;
  
  const result = await query(`
    SELECT d.*, c.nom as candidat_nom, c.prenom as candidat_prenom, 
           p.titre as poste_titre, p.categorie
    FROM nominations.dossiers d
    JOIN nominations.candidats c ON d.candidat_id = c.id
    JOIN nominations.postes p ON d.poste_id = p.id
    WHERE 1=1
    ${statut ? `AND d.statut = '${statut}'` : ''}
    ${ministere ? `AND d.ministere_proposant_id = '${ministere}'` : ''}
    ORDER BY d.created_at DESC
  `);
  
  res.json({ success: true, data: result.rows });
});

// POST /api/nominations/dossiers
router.post('/dossiers', authMiddleware, async (req, res) => {
  const { candidat, poste_id, type, motif_proposition } = req.body;
  
  const result = await transaction(async (client) => {
    // 1. Créer ou récupérer le candidat
    let candidatResult = await client.query(`
      SELECT id FROM nominations.candidats WHERE email = $1
    `, [candidat.email]);
    
    if (candidatResult.rows.length === 0) {
      candidatResult = await client.query(`
        INSERT INTO nominations.candidats (nom, prenom, date_naissance, email, ...)
        VALUES ($1, $2, $3, $4, ...)
        RETURNING id
      `, [candidat.nom, candidat.prenom, candidat.date_naissance, candidat.email]);
    }
    
    // 2. Créer le dossier
    const reference = `NOM-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`;
    
    const dossierResult = await client.query(`
      INSERT INTO nominations.dossiers 
        (reference, candidat_id, poste_id, ministere_proposant_id, type, motif_proposition, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [reference, candidatResult.rows[0].id, poste_id, req.user.institution_id, type, motif_proposition, req.userId]);
    
    // 3. Créer l'entrée historique
    await client.query(`
      INSERT INTO nominations.historique (dossier_id, action, nouveau_statut, acteur_id, acteur_nom)
      VALUES ($1, 'Création', 'brouillon', $2, $3)
    `, [dossierResult.rows[0].id, req.userId, req.user.full_name]);
    
    return dossierResult.rows[0];
  });
  
  res.json({ success: true, data: result });
});

// PUT /api/nominations/dossiers/:id/transition
router.put('/dossiers/:id/transition', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { nouveau_statut, commentaire } = req.body;
  
  // Vérifier les transitions autorisées
  const TRANSITIONS = {
    'brouillon': ['soumis'],
    'soumis': ['recevabilite'],
    'recevabilite': ['examen_sgg'],
    'examen_sgg': ['avis_favorable', 'avis_defavorable'],
    'avis_favorable': ['transmis_sgpr'],
    'transmis_sgpr': ['arbitrage_pm', 'conseil_ministres'],
    // ...
  };
  
  const current = await query(`SELECT statut FROM nominations.dossiers WHERE id = $1`, [id]);
  const currentStatut = current.rows[0]?.statut;
  
  if (!TRANSITIONS[currentStatut]?.includes(nouveau_statut)) {
    return res.status(400).json({ error: `Transition ${currentStatut} → ${nouveau_statut} non autorisée` });
  }
  
  const result = await transaction(async (client) => {
    await client.query(`
      UPDATE nominations.dossiers 
      SET statut = $2, updated_at = NOW(), updated_by = $3
      WHERE id = $1
    `, [id, nouveau_statut, req.userId]);
    
    await client.query(`
      INSERT INTO nominations.historique (dossier_id, action, ancien_statut, nouveau_statut, commentaire, acteur_id, acteur_nom)
      VALUES ($1, 'Transition', $2, $3, $4, $5, $6)
    `, [id, currentStatut, nouveau_statut, commentaire, req.userId, req.user.full_name]);
    
    return { id, statut: nouveau_statut };
  });
  
  res.json({ success: true, data: result });
});

// POST /api/nominations/dossiers/:id/documents
router.post('/dossiers/:id/documents', authMiddleware, uploadMiddleware.single('file'), async (req, res) => {
  const { id } = req.params;
  const { type, is_obligatoire } = req.body;
  
  // Upload vers GCS
  const fileUrl = await uploadToGCS(req.file, `nominations/${id}`);
  
  const result = await query(`
    INSERT INTO nominations.documents (dossier_id, type, nom_fichier, fichier_url, taille_octets, mime_type, is_obligatoire, uploaded_by)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *
  `, [id, type, req.file.originalname, fileUrl, req.file.size, req.file.mimetype, is_obligatoire, req.userId]);
  
  res.json({ success: true, data: result.rows[0] });
});

export default router;
```

---

## 📰 PHASE 5 : API JOURNAL OFFICIEL (3-5 jours)

### 5.1 Routes API JO

**Fichier** : `backend/src/routes/jo.ts`

```typescript
import { Router } from 'express';
import { query } from '../config/database.js';

const router = Router();

// GET /api/jo/textes (PUBLIC)
router.get('/textes', async (req, res) => {
  const { q, type, annee, page = 1, limit = 20 } = req.query;
  
  let sql = `
    SELECT t.*, n.numero as numero_jo, n.date_publication
    FROM jo.textes t
    JOIN jo.numeros n ON t.numero_id = n.id
    WHERE t.statut = 'publie'
  `;
  
  // Recherche full-text
  if (q) {
    sql += ` AND (
      t.titre ILIKE '%${q}%' 
      OR t.contenu_texte @@ plainto_tsquery('french', '${q}')
    )`;
  }
  
  if (type) sql += ` AND t.type = '${type}'`;
  if (annee) sql += ` AND EXTRACT(YEAR FROM n.date_publication) = ${annee}`;
  
  sql += ` ORDER BY n.date_publication DESC LIMIT ${limit} OFFSET ${(page - 1) * limit}`;
  
  const result = await query(sql);
  res.json({ success: true, data: result.rows });
});

// GET /api/jo/textes/:id
router.get('/textes/:id', async (req, res) => {
  const result = await query(`
    SELECT t.*, n.numero as numero_jo
    FROM jo.textes t
    JOIN jo.numeros n ON t.numero_id = n.id
    WHERE t.id = $1
  `, [req.params.id]);
  
  // Incrémenter le compteur de vues
  await query(`UPDATE jo.textes SET vues = vues + 1 WHERE id = $1`, [req.params.id]);
  
  res.json({ success: true, data: result.rows[0] });
});

// POST /api/jo/textes (ADMIN)
router.post('/textes', authMiddleware, requireRole(['admin_sgg', 'dgjo']), async (req, res) => {
  // Publication d'un nouveau texte
});

export default router;
```

---

## 🔔 PHASE 6 : NOTIFICATIONS (2-3 jours)

### 6.1 Table Notifications

```sql
CREATE TABLE auth.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  type VARCHAR(50) NOT NULL,
  titre VARCHAR(255) NOT NULL,
  message TEXT,
  lien_action TEXT,
  lue BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 6.2 Service de Notifications

**Fichier à créer** : `backend/src/services/notifications.ts`

```typescript
import { query } from '../config/database.js';
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export async function createNotification({
  userId,
  type,
  titre,
  message,
  lienAction,
  sendEmail = true,
}) {
  // 1. Créer en base
  await query(`
    INSERT INTO auth.notifications (user_id, type, titre, message, lien_action)
    VALUES ($1, $2, $3, $4, $5)
  `, [userId, type, titre, message, lienAction]);
  
  // 2. Envoyer email si demandé
  if (sendEmail) {
    const user = await query(`SELECT email, full_name FROM auth.users WHERE id = $1`, [userId]);
    
    await sgMail.send({
      to: user.rows[0].email,
      from: 'notifications@sgg.ga',
      subject: titre,
      html: `
        <h2>${titre}</h2>
        <p>${message}</p>
        <a href="https://sgg.ga${lienAction}">Voir les détails</a>
      `,
    });
  }
}

// Notifications par type de rôle
export async function notifyRole(role: string, notification: Omit<NotificationParams, 'userId'>) {
  const users = await query(`
    SELECT u.id FROM auth.users u
    JOIN auth.user_roles ur ON u.id = ur.user_id
    WHERE ur.role = $1 AND u.is_active = true
  `, [role]);
  
  for (const user of users.rows) {
    await createNotification({ ...notification, userId: user.id });
  }
}
```

---

## 📤 PHASE 7 : EXPORTS PDF/EXCEL (2-3 jours)

### 7.1 Service d'Export

**Fichier à créer** : `backend/src/services/exports.ts`

```typescript
import PDFDocument from 'pdfkit';
import ExcelJS from 'exceljs';

export async function generateRapportPDF(rapport: RapportMensuel): Promise<Buffer> {
  const doc = new PDFDocument();
  
  doc.font('Helvetica-Bold').fontSize(18)
    .text('RÉPUBLIQUE GABONAISE', { align: 'center' });
  doc.fontSize(14).text('Secrétariat Général du Gouvernement', { align: 'center' });
  doc.moveDown();
  
  doc.fontSize(16).text(`Rapport d'Exécution PAG - ${rapport.periodeMois}/${rapport.periodeAnnee}`);
  doc.moveDown();
  
  // ... contenu du rapport
  
  return new Promise((resolve) => {
    const chunks: Buffer[] = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.end();
  });
}

export async function generateMatriceExcel(rapports: RapportMensuel[]): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Matrice PAG 2026');
  
  // En-têtes (21 colonnes)
  sheet.columns = [
    { header: 'Mesure Présidentielle', key: 'mesure', width: 30 },
    { header: 'Code Programme', key: 'code', width: 12 },
    { header: 'Objectif Stratégique', key: 'objectif', width: 40 },
    // ... 18 autres colonnes
  ];
  
  // Données
  rapports.forEach(r => {
    sheet.addRow({
      mesure: r.mesurePresidentielle,
      code: r.codeProgramme,
      // ...
    });
  });
  
  // Styling
  sheet.getRow(1).font = { bold: true };
  
  return workbook.xlsx.writeBuffer();
}
```

### 7.2 Route d'Export

```typescript
// backend/src/routes/gar.ts
router.get('/rapports/export', authMiddleware, async (req, res) => {
  const { format, periode } = req.query;
  
  const rapports = await query(`SELECT * FROM gar.rapports WHERE ...`);
  
  if (format === 'pdf') {
    const pdf = await generateRapportPDF(rapports.rows[0]);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=rapport-${periode}.pdf`);
    res.send(pdf);
  } else if (format === 'excel') {
    const excel = await generateMatriceExcel(rapports.rows);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=matrice-${periode}.xlsx`);
    res.send(excel);
  }
});
```

---

## 📋 CHECKLIST FINALE

### Infrastructure
- [ ] Cloud SQL PostgreSQL déployé
- [ ] Schema exécuté
- [ ] Redis configuré
- [ ] Cloud Storage bucket créé

### Auth
- [ ] 15 comptes créés
- [ ] Rôles assignés
- [ ] Middleware JWT fonctionnel
- [ ] Mode hybride (demo/real) OK

### GAR
- [ ] API priorités
- [ ] API objectifs
- [ ] API rapports CRUD
- [ ] Workflow validation 3 niveaux
- [ ] Notifications soumission

### Nominations
- [ ] API dossiers CRUD
- [ ] Upload documents
- [ ] Workflow 12 statuts
- [ ] Historique actions
- [ ] Génération acte PDF

### Journal Officiel
- [ ] API textes (public)
- [ ] Recherche full-text
- [ ] Publication (admin)
- [ ] Export PDF

### Notifications
- [ ] Table notifications
- [ ] Service email (SendGrid)
- [ ] Notifications in-app

### Exports
- [ ] PDF rapports
- [ ] Excel matrice
- [ ] PDF actes nomination

---

## 🎯 RÉSUMÉ

| Phase | Durée | Dépendances |
|-------|-------|-------------|
| 1. Infrastructure | 3-4 jours | - |
| 2. Authentification | 2-3 jours | Phase 1 |
| 3. API GAR | 5-7 jours | Phase 2 |
| 4. API Nominations | 5-7 jours | Phase 2 |
| 5. API Journal Officiel | 3-5 jours | Phase 2 |
| 6. Notifications | 2-3 jours | Phase 3, 4 |
| 7. Exports | 2-3 jours | Phase 3, 4, 5 |

**Durée totale estimée** : 6-8 semaines

---

*Plan généré le 6 février 2026*
