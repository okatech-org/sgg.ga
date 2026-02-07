-- ============================================================================
-- SGG DIGITAL - SEEDING PAG 2026 (8 PRIORITÉS + 10 PROGRAMMES)
-- Base : db_sgg sur instance idetude-db
-- ============================================================================

-- ============================================================================
-- 8 PRIORITÉS PRÉSIDENTIELLES (Piliers du PAG 2026)
-- ============================================================================

INSERT INTO gar.priorites_pag (code, priorite, titre, description, icone, couleur, ordre, budget_alloue) VALUES
('P1', 'energie_eau', 
 'Énergie & Eau', 
 'Accès universel à l''électricité et à l''eau potable pour tous les Gabonais. Programme "Dernier Kilomètre" pour les zones rurales et périurbaines.', 
 'Zap', '#3B82F6', 1, 500000000000),

('P2', 'education', 
 'Éducation & Formation', 
 'Réforme du système éducatif et formation professionnelle des jeunes aux métiers porteurs. Objectif : 10 000 jeunes formés.', 
 'GraduationCap', '#F59E0B', 2, 350000000000),

('P3', 'sante', 
 'Santé pour Tous', 
 'Couverture Santé Universelle (CSU) et modernisation du système de santé. Objectif : 80% de la population couverte.', 
 'HeartPulse', '#EF4444', 3, 450000000000),

('P4', 'habitat', 
 'Habitat & Cadre de Vie', 
 'Programme de 5 000 logements sociaux et amélioration du cadre de vie urbain dans les principales villes.', 
 'Home', '#22C55E', 4, 280000000000),

('P5', 'infrastructure', 
 'Infrastructures & Numérique', 
 'Désenclavement routier (500 km de routes) et transformation numérique : fibre optique, e-gouvernement, data center souverain.', 
 'Globe', '#8B5CF6', 5, 750000000000),

('P6', 'agriculture', 
 'Souveraineté Alimentaire', 
 'Intensification agricole et réduction de 50% de la dépendance aux importations alimentaires. 20 000 ha mis en valeur.', 
 'Wheat', '#10B981', 6, 200000000000),

('P7', 'gouvernance', 
 'Gouvernance & Administration', 
 'Modernisation de l''administration publique : dématérialisation de 80% des procédures et plateforme Mon Service Public.', 
 'Shield', '#6366F1', 7, 150000000000),

('P8', 'justice', 
 'Justice & Sécurité', 
 'Accès à la justice pour tous et renforcement de la sécurité. Réhabilitation de 10 tribunaux, 5 nouveaux commissariats.', 
 'Scale', '#EC4899', 8, 180000000000)

ON CONFLICT (priorite) DO UPDATE SET
  titre = EXCLUDED.titre,
  description = EXCLUDED.description,
  budget_alloue = EXCLUDED.budget_alloue;

-- ============================================================================
-- 10 PROGRAMMES PRIORITAIRES (avec indicateurs)
-- ============================================================================

-- Récupérer les IDs des priorités pour les FK
WITH priorite_ids AS (
  SELECT id, code FROM gar.priorites_pag
)
INSERT INTO gar.objectifs (
  code, priorite_id, ministere_id, titre, description, 
  annee, indicateur_cle, unite_mesure, valeur_cible,
  budget_prevu, statut, date_debut, date_echeance, niveau
)
SELECT
  prog.code,
  p.id,
  (SELECT id FROM institutions.institutions WHERE code = prog.ministere_code LIMIT 1),
  prog.titre,
  prog.description,
  2026,
  prog.indicateur,
  prog.unite,
  prog.cible,
  prog.budget,
  'en_cours',
  '2026-01-01',
  '2026-12-31',
  1
FROM priorite_ids p
CROSS JOIN LATERAL (
  VALUES
    -- P1 : Énergie & Eau
    ('PROG-001', 'P1', 'MIN-ENERG', 'Programme Dernier Kilomètre — Électricité', 
     'Extension du réseau électrique rural et 50 000 raccordements prévus', 
     'Foyers raccordés', 'unités', 50000, 82000000000),
    ('PROG-002', 'P1', 'MIN-ENERG', 'Sécurisation Adductions Eau Potable', 
     'Livraison de 4 stations de traitement, réhabilitation 200 km de réseau', 
     'Stations livrées', 'unités', 4, 28000000000),
    
    -- P2 : Éducation
    ('PROG-003', 'P2', 'MIN-EDU', 'Formation Technique & Professionnelle', 
     'Former 10 000 jeunes aux métiers porteurs, 20 centres de formation opérationnels', 
     'Jeunes formés', 'personnes', 10000, 35000000000),
    
    -- P3 : Santé
    ('PROG-004', 'P3', 'MIN-SANTE', 'Couverture Santé Universelle (CSU)', 
     'Enrôlement de 1,2 million de bénéficiaires, réhabilitation 50 formations sanitaires', 
     'Bénéficiaires enrôlés', 'personnes', 1200000, 101500000000),
    
    -- P4 : Habitat
    ('PROG-005', 'P4', 'MIN-HABITAT', 'Programme Logements Sociaux (FGHL)', 
     'Construction de 5 000 logements sociaux dans les principales villes, 3 zones d''aménagement', 
     'Logements livrés', 'unités', 5000, 120000000000),
    
    -- P5 : Infrastructures
    ('PROG-006', 'P5', 'MIN-INFRA', 'Désenclavement Routes (FNI)', 
     'Bitumage de 500 km de routes nationales, construction 20 ponts', 
     'Km de routes bitumées', 'km', 500, 180000000000),
    ('PROG-007', 'P5', 'MIN-NUM', 'Transformation Numérique', 
     'Déploiement 2 000 km fibre optique, couverture 4G 95%, 50 services e-gouvernement', 
     'Km fibre optique', 'km', 2000, 150000000000),
    
    -- P6 : Agriculture
    ('PROG-008', 'P6', 'MIN-AGRI', 'Intensification Agricole (FNDA)', 
     'Mise en valeur 20 000 ha, accompagnement 5 000 exploitants, 3 agropoles', 
     'Hectares cultivés', 'ha', 20000, 25000000000),
    
    -- P7 : Gouvernance
    ('PROG-009', 'P7', 'MIN-FP', 'Modernisation Administration Publique', 
     'Dématérialisation 100 procédures, formation 2 000 agents, plateforme Mon Service Public', 
     'Procédures dématérialisées', 'unités', 100, 8500000000),
    
    -- P8 : Justice
    ('PROG-010', 'P8', 'MIN-JUST', 'Accès à la Justice', 
     'Réhabilitation 10 tribunaux, recrutement 50 magistrats, construction 5 commissariats', 
     'Tribunaux réhabilités', 'unités', 10, 10000000000)
) AS prog(code, priorite_code, ministere_code, titre, description, indicateur, unite, cible, budget)
WHERE p.code = prog.priorite_code
ON CONFLICT (code) DO NOTHING;

-- ============================================================================
-- RAPPORTS MENSUELS EXEMPLE (Janvier 2026)
-- ============================================================================

-- Insérer 10 rapports mensuels pour Janvier 2026
INSERT INTO gar.rapports (
  ministere_id, annee, mois, donnees_matrice, nb_objectifs_suivis,
  synthesise, difficultes, perspectives, statut, date_limite
)
SELECT 
  i.id,
  2026,
  1,
  '[]'::jsonb,
  1,
  'Rapport mensuel Janvier 2026',
  'Difficultés liées à la saison des pluies',
  'Accélération prévue au T2',
  'attendu',
  '2026-01-31'
FROM institutions.institutions i
WHERE i.code IN ('MIN-ENERG', 'MIN-EDU', 'MIN-SANTE', 'MIN-HABITAT', 'MIN-INFRA', 
                 'MIN-NUM', 'MIN-AGRI', 'MIN-FP', 'MIN-JUST', 'MIN-INT')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- VÉRIFICATION
-- ============================================================================

-- Afficher le résumé du PAG
SELECT 
  p.code,
  p.titre as priorite,
  p.budget_alloue / 1000000000 as budget_mds_fcfa,
  COUNT(o.id) as nb_programmes
FROM gar.priorites_pag p
LEFT JOIN gar.objectifs o ON p.id = o.priorite_id
GROUP BY p.id, p.code, p.titre, p.budget_alloue
ORDER BY p.ordre;

-- Afficher le dashboard
SELECT * FROM gar.v_dashboard;
