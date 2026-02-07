-- ============================================================================
-- SGG DIGITAL - SEEDING DES INSTITUTIONS
-- Base : db_sgg sur instance idetude-db
-- ============================================================================

-- ============================================================================
-- INSTITUTIONS SOUVERAINES
-- ============================================================================

-- Présidence et Secrétariats
INSERT INTO institutions.institutions (code, nom, nom_court, sigle, type, ordre_protocole, adresse, ville, is_active) VALUES
('PRES', 'Présidence de la République', 'Présidence', 'PR', 'presidence', 1, 'Boulevard Triomphal Omar Bongo', 'Libreville', true),
('SGPR', 'Secrétariat Général de la Présidence de la République', 'SGPR', 'SGPR', 'secretariat_general', 2, 'Boulevard Triomphal Omar Bongo', 'Libreville', true),
('PRIM', 'Primature', 'Primature', 'PM', 'primature', 3, 'Boulevard Triomphal Omar Bongo', 'Libreville', true),
('SGG', 'Secrétariat Général du Gouvernement', 'SGG', 'SGG', 'secretariat_general', 4, 'Immeuble du 2 Décembre', 'Libreville', true)
ON CONFLICT (code) DO NOTHING;

-- ============================================================================
-- INSTITUTIONS LÉGISLATIVES
-- ============================================================================

INSERT INTO institutions.institutions (code, nom, nom_court, sigle, type, ordre_protocole, adresse, ville, is_active) VALUES
('AN', 'Assemblée Nationale de Transition', 'Assemblée Nationale', 'ANT', 'assemblee', 5, 'Boulevard du Bord de Mer', 'Libreville', true),
('SEN', 'Sénat de Transition', 'Sénat', 'ST', 'senat', 6, 'Cité de la Démocratie', 'Libreville', true)
ON CONFLICT (code) DO NOTHING;

-- ============================================================================
-- INSTITUTIONS JURIDICTIONNELLES
-- ============================================================================

INSERT INTO institutions.institutions (code, nom, nom_court, sigle, type, ordre_protocole, adresse, ville, is_active) VALUES
('CC', 'Cour Constitutionnelle', 'Cour Constitutionnelle', 'CC', 'juridiction', 7, 'Boulevard Triomphal Omar Bongo', 'Libreville', true),
('CE', 'Conseil d''État', 'Conseil d''État', 'CE', 'juridiction', 8, 'Palais de Justice', 'Libreville', true),
('CDC', 'Cour de Cassation', 'Cour de Cassation', 'CC', 'juridiction', 9, 'Palais de Justice', 'Libreville', true),
('CCOMPTES', 'Cour des Comptes', 'Cour des Comptes', 'CDC', 'juridiction', 10, 'Libreville', 'Libreville', true)
ON CONFLICT (code) DO NOTHING;

-- ============================================================================
-- 35 MINISTÈRES (Ordre protocolaire gouvernemental)
-- ============================================================================

INSERT INTO institutions.institutions (code, nom, nom_court, sigle, type, ordre_protocole, is_active) VALUES
-- Ministères de Souveraineté
('MIN-DEF', 'Ministère de la Défense Nationale', 'Min. Défense', 'MDN', 'ministere', 11, true),
('MIN-INT', 'Ministère de l''Intérieur et de la Sécurité', 'Min. Intérieur', 'MI', 'ministere', 12, true),
('MIN-AE', 'Ministère des Affaires Étrangères', 'Min. Affaires Étrangères', 'MAE', 'ministere', 13, true),
('MIN-JUST', 'Ministère de la Justice, Garde des Sceaux', 'Min. Justice', 'MJ', 'ministere', 14, true),

-- Ministères Économiques
('MIN-ECO', 'Ministère de l''Économie et des Participations', 'Min. Économie', 'MEP', 'ministere', 15, true),
('MIN-BUDGET', 'Ministère du Budget et des Comptes Publics', 'Min. Budget', 'MBP', 'ministere', 16, true),
('MIN-PLAN', 'Ministère de la Planification et de la Prospective', 'Min. Planification', 'MPP', 'ministere', 17, true),

-- Ministères Sociaux
('MIN-EDU', 'Ministère de l''Éducation Nationale', 'Min. Éducation', 'MEN', 'ministere', 18, true),
('MIN-ESUP', 'Ministère de l''Enseignement Supérieur et de la Recherche Scientifique', 'Min. Ens. Supérieur', 'MESRS', 'ministere', 19, true),
('MIN-SANTE', 'Ministère de la Santé', 'Min. Santé', 'MSAS', 'ministere', 20, true),
('MIN-AS', 'Ministère des Affaires Sociales et des Droits de la Femme', 'Min. Affaires Sociales', 'MASDF', 'ministere', 21, true),
('MIN-TRAV', 'Ministère du Travail, de l''Emploi et de la Protection Sociale', 'Min. Travail', 'MTEPS', 'ministere', 22, true),
('MIN-FP', 'Ministère de la Fonction Publique et du Renouveau du Service Public', 'Min. Fonction Publique', 'MFPRSP', 'ministere', 23, true),

-- Ministères Techniques
('MIN-AGRI', 'Ministère de l''Agriculture, de l''Élevage et de la Pêche', 'Min. Agriculture', 'MAEP', 'ministere', 24, true),
('MIN-EF', 'Ministère des Eaux et Forêts', 'Min. Eaux et Forêts', 'MEF', 'ministere', 25, true),
('MIN-ENV', 'Ministère de l''Environnement, du Climat et de la Transition Énergétique', 'Min. Environnement', 'MECTE', 'ministere', 26, true),
('MIN-MINES', 'Ministère des Mines', 'Min. Mines', 'MM', 'ministere', 27, true),
('MIN-PET', 'Ministère du Pétrole et du Gaz', 'Min. Pétrole', 'MPG', 'ministere', 28, true),
('MIN-ENERG', 'Ministère de l''Énergie et des Ressources Hydrauliques', 'Min. Énergie', 'MERH', 'ministere', 29, true),
('MIN-INFRA', 'Ministère des Infrastructures et des Travaux Publics', 'Min. Infrastructures', 'MITP', 'ministere', 30, true),
('MIN-HABITAT', 'Ministère de l''Habitat, de l''Urbanisme et du Cadastre', 'Min. Habitat', 'MHUC', 'ministere', 31, true),
('MIN-TRANS', 'Ministère des Transports', 'Min. Transports', 'MT', 'ministere', 32, true),
('MIN-NUM', 'Ministère de l''Économie Numérique et des Nouvelles Technologies', 'Min. Numérique', 'MENNT', 'ministere', 33, true),
('MIN-COM', 'Ministère de la Communication et des Médias', 'Min. Communication', 'MCM', 'ministere', 34, true),
('MIN-CULTURE', 'Ministère de la Culture, des Arts et du Patrimoine', 'Min. Culture', 'MCAP', 'ministere', 35, true),
('MIN-SPORT', 'Ministère des Sports', 'Min. Sports', 'MS', 'ministere', 36, true),
('MIN-JEUNE', 'Ministère de la Jeunesse et de la Vie Associative', 'Min. Jeunesse', 'MJVA', 'ministere', 37, true),
('MIN-FEMME', 'Ministère de la Promotion de la Femme et de la Condition Féminine', 'Min. Promotion Femme', 'MPFCF', 'ministere', 38, true),
('MIN-COMMERCE', 'Ministère du Commerce et de l''Industrie', 'Min. Commerce', 'MCI', 'ministere', 39, true),
('MIN-TOURISME', 'Ministère du Tourisme et de l''Artisanat', 'Min. Tourisme', 'MTA', 'ministere', 40, true),
('MIN-DECEN', 'Ministère de la Décentralisation et du Développement Local', 'Min. Décentralisation', 'MDDL', 'ministere', 41, true),
('MIN-REL-PARL', 'Ministère chargé des Relations avec les Institutions Constitutionnelles', 'Min. Relations Institutions', 'MRIC', 'ministere', 42, true),
('MIN-REFORME', 'Ministère de la Réforme de l''État', 'Min. Réforme État', 'MRE', 'ministere', 43, true),
('MIN-FP-PRO', 'Ministère de la Formation Professionnelle', 'Min. Formation Pro', 'MFP', 'ministere', 44, true),
('MIN-PECHE', 'Ministère de la Pêche et de l''Économie Maritime', 'Min. Pêche', 'MPEM', 'ministere', 45, true)
ON CONFLICT (code) DO NOTHING;

-- ============================================================================
-- DIRECTIONS DU SGG (rattachées au SGG)
-- ============================================================================

INSERT INTO institutions.institutions (code, nom, nom_court, sigle, type, ordre_protocole, parent_id, is_active) 
SELECT 
    'DGJO', 
    'Direction Générale du Journal Officiel', 
    'DG Journal Officiel', 
    'DGJO', 
    'direction_generale', 
    100,
    id,
    true
FROM institutions.institutions WHERE code = 'SGG'
ON CONFLICT (code) DO NOTHING;

INSERT INTO institutions.institutions (code, nom, nom_court, sigle, type, ordre_protocole, parent_id, is_active) 
SELECT 
    'CTCO', 
    'Cellule Technique de Coordination et d''Organisation', 
    'CTCO', 
    'CTCO', 
    'direction', 
    101,
    id,
    true
FROM institutions.institutions WHERE code = 'SGG'
ON CONFLICT (code) DO NOTHING;

INSERT INTO institutions.institutions (code, nom, nom_court, sigle, type, ordre_protocole, parent_id, is_active) 
SELECT 
    'DAJ', 
    'Direction des Affaires Juridiques', 
    'DAJ', 
    'DAJ', 
    'direction', 
    102,
    id,
    true
FROM institutions.institutions WHERE code = 'SGG'
ON CONFLICT (code) DO NOTHING;

INSERT INTO institutions.institutions (code, nom, nom_court, sigle, type, ordre_protocole, parent_id, is_active) 
SELECT 
    'DAN', 
    'Direction des Actes et Nominations', 
    'DAN', 
    'DAN', 
    'direction', 
    103,
    id,
    true
FROM institutions.institutions WHERE code = 'SGG'
ON CONFLICT (code) DO NOTHING;

-- ============================================================================
-- INTERACTIONS INSTITUTIONNELLES (Flux de travail)
-- ============================================================================

-- SGG coordonne tous les ministères
INSERT INTO institutions.interactions (institution_source_id, institution_cible_id, type_interaction, description, frequence, is_active)
SELECT 
    sgg.id,
    min.id,
    'coordination',
    'Coordination gouvernementale',
    'quotidien',
    true
FROM institutions.institutions sgg
CROSS JOIN institutions.institutions min
WHERE sgg.code = 'SGG' AND min.type = 'ministere'
ON CONFLICT DO NOTHING;

-- Ministères soumettent au SGG
INSERT INTO institutions.interactions (institution_source_id, institution_cible_id, type_interaction, description, frequence, is_active)
SELECT 
    min.id,
    sgg.id,
    'soumission',
    'Soumission projets de textes et rapports GAR',
    'hebdomadaire',
    true
FROM institutions.institutions sgg
CROSS JOIN institutions.institutions min
WHERE sgg.code = 'SGG' AND min.type = 'ministere'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- VÉRIFICATION
-- ============================================================================

SELECT type, COUNT(*) as nb_institutions 
FROM institutions.institutions 
GROUP BY type 
ORDER BY nb_institutions DESC;
