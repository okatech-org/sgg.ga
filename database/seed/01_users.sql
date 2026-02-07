-- ============================================================================
-- SGG DIGITAL - SEEDING DES 15 COMPTES DEMO
-- Base : db_sgg sur instance idetude-db
-- ============================================================================

-- Activer l'extension pour le hash des mots de passe
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================================
-- INSERTION DES UTILISATEURS
-- Mot de passe pour tous : Demo2026!
-- ============================================================================

INSERT INTO auth.users (id, email, password_hash, full_name, phone, is_active, is_verified) VALUES

-- ========== EXÉCUTIF (5 comptes) ==========
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

-- ========== PRÉSIDENCE (1 compte) ==========
('11111111-1111-1111-1111-111111111106', 'sgpr@presidence.ga', 
 crypt('Demo2026!', gen_salt('bf')), 'Secrétaire Général Présidence République', '+241 01 00 00 06', true, true),

-- ========== LÉGISLATIF (2 comptes) ==========
('11111111-1111-1111-1111-111111111107', 'sg@assemblee.ga', 
 crypt('Demo2026!', gen_salt('bf')), 'SG Assemblée Nationale de Transition', '+241 01 00 00 07', true, true),

('11111111-1111-1111-1111-111111111108', 'sg@senat.ga', 
 crypt('Demo2026!', gen_salt('bf')), 'SG Sénat de Transition', '+241 01 00 00 08', true, true),

-- ========== JURIDICTIONNEL (2 comptes) ==========
('11111111-1111-1111-1111-111111111109', 'greffe@conseiletat.ga', 
 crypt('Demo2026!', gen_salt('bf')), 'Greffier en Chef Conseil d''État', '+241 01 00 00 09', true, true),

('11111111-1111-1111-1111-111111111110', 'greffe@courconstitutionnelle.ga', 
 crypt('Demo2026!', gen_salt('bf')), 'Greffier Cour Constitutionnelle', '+241 01 00 00 10', true, true),

-- ========== ADMINISTRATIF SGG (3 comptes) ==========
('11111111-1111-1111-1111-111111111111', 'admin@sgg.ga', 
 crypt('Demo2026!', gen_salt('bf')), 'Administrateur Système SGG', '+241 01 00 00 11', true, true),

('11111111-1111-1111-1111-111111111112', 'directeur@sgg.ga', 
 crypt('Demo2026!', gen_salt('bf')), 'Directeur CTCO/SGG', '+241 01 00 00 12', true, true),

('11111111-1111-1111-1111-111111111113', 'direction@jo.ga', 
 crypt('Demo2026!', gen_salt('bf')), 'Directeur Général Journal Officiel', '+241 01 00 00 13', true, true),

-- ========== PUBLIC (2 comptes) ==========
('11111111-1111-1111-1111-111111111114', 'citoyen@gmail.com', 
 crypt('Demo2026!', gen_salt('bf')), 'Jean MOUSSAVOU', '+241 07 00 00 14', true, true),

('11111111-1111-1111-1111-111111111115', 'avocat@barreau.ga', 
 crypt('Demo2026!', gen_salt('bf')), 'Me Paul NDONG, Avocat', '+241 07 00 00 15', true, true)

ON CONFLICT (email) DO NOTHING;

-- ============================================================================
-- ATTRIBUTION DES RÔLES
-- ============================================================================

INSERT INTO auth.user_roles (user_id, role, is_primary) VALUES
-- Exécutif
('11111111-1111-1111-1111-111111111101', 'admin_sgg', true),       -- Président (accès total pour démo)
('11111111-1111-1111-1111-111111111102', 'admin_sgg', true),       -- VP
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

-- Administratif SGG
('11111111-1111-1111-1111-111111111111', 'admin_sgg', true),
('11111111-1111-1111-1111-111111111112', 'directeur_sgg', true),
('11111111-1111-1111-1111-111111111113', 'dgjo', true),

-- Public
('11111111-1111-1111-1111-111111111114', 'citoyen', true),
('11111111-1111-1111-1111-111111111115', 'citoyen', true)

ON CONFLICT DO NOTHING;

-- ============================================================================
-- PERMISSIONS PAR RÔLE (Matrice d'accès)
-- ============================================================================

-- Admin SGG : Accès complet
INSERT INTO auth.role_permissions (role, module, permission) VALUES
('admin_sgg', 'dashboard', 'admin'),
('admin_sgg', 'gar', 'admin'),
('admin_sgg', 'nominations', 'admin'),
('admin_sgg', 'legislatif', 'admin'),
('admin_sgg', 'egop', 'admin'),
('admin_sgg', 'jo', 'admin'),
('admin_sgg', 'institutions', 'admin')
ON CONFLICT DO NOTHING;

-- Directeur SGG
INSERT INTO auth.role_permissions (role, module, permission) VALUES
('directeur_sgg', 'dashboard', 'read'),
('directeur_sgg', 'gar', 'approve'),
('directeur_sgg', 'nominations', 'approve'),
('directeur_sgg', 'legislatif', 'read'),
('directeur_sgg', 'egop', 'read'),
('directeur_sgg', 'jo', 'read'),
('directeur_sgg', 'institutions', 'read')
ON CONFLICT DO NOTHING;

-- SGPR
INSERT INTO auth.role_permissions (role, module, permission) VALUES
('sgpr', 'dashboard', 'read'),
('sgpr', 'gar', 'approve'),
('sgpr', 'nominations', 'approve'),
('sgpr', 'legislatif', 'read'),
('sgpr', 'egop', 'approve'),
('sgpr', 'jo', 'read'),
('sgpr', 'institutions', 'read')
ON CONFLICT DO NOTHING;

-- Ministre
INSERT INTO auth.role_permissions (role, module, permission) VALUES
('ministre', 'dashboard', 'read'),
('ministre', 'gar', 'write'),
('ministre', 'nominations', 'write'),
('ministre', 'legislatif', 'read'),
('ministre', 'jo', 'read')
ON CONFLICT DO NOTHING;

-- SG Ministère
INSERT INTO auth.role_permissions (role, module, permission) VALUES
('sg_ministere', 'dashboard', 'read'),
('sg_ministere', 'gar', 'write'),
('sg_ministere', 'nominations', 'write'),
('sg_ministere', 'jo', 'read')
ON CONFLICT DO NOTHING;

-- DGJO
INSERT INTO auth.role_permissions (role, module, permission) VALUES
('dgjo', 'dashboard', 'read'),
('dgjo', 'jo', 'publish')
ON CONFLICT DO NOTHING;

-- Citoyen
INSERT INTO auth.role_permissions (role, module, permission) VALUES
('citoyen', 'jo', 'read')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- VÉRIFICATION
-- ============================================================================

-- Afficher tous les utilisateurs avec leurs rôles
SELECT 
    u.email, 
    u.full_name, 
    ur.role,
    CASE 
        WHEN ur.role IN ('admin_sgg') THEN 'ADMINISTRATIF'
        WHEN ur.role IN ('directeur_sgg') THEN 'ADMINISTRATIF'
        WHEN ur.role IN ('sgpr') THEN 'PRÉSIDENCE'
        WHEN ur.role IN ('premier_ministre', 'ministre', 'sg_ministere') THEN 'EXÉCUTIF'
        WHEN ur.role IN ('assemblee', 'senat') THEN 'LÉGISLATIF'
        WHEN ur.role IN ('conseil_etat', 'cour_constitutionnelle') THEN 'JURIDICTIONNEL'
        WHEN ur.role IN ('dgjo') THEN 'JOURNAL OFFICIEL'
        WHEN ur.role IN ('citoyen') THEN 'PUBLIC'
        ELSE 'AUTRE'
    END as categorie
FROM auth.users u 
JOIN auth.user_roles ur ON u.id = ur.user_id 
ORDER BY categorie, ur.role;
