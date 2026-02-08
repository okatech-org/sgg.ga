-- ============================================================================
-- SEED: PTM Permissions par role
-- Insert dans auth.role_permissions pour le module PTM
-- ============================================================================

-- Admin SGG : acces complet
INSERT INTO auth.role_permissions (role, module, permission) VALUES
    ('admin_sgg', 'ptm', 'read'),
    ('admin_sgg', 'ptm', 'write'),
    ('admin_sgg', 'ptm', 'approve'),
    ('admin_sgg', 'ptm', 'reject'),
    ('admin_sgg', 'ptm', 'admin')
ON CONFLICT (role, module, permission) DO NOTHING;

-- Directeur SGG : lecture, ecriture, validation
INSERT INTO auth.role_permissions (role, module, permission) VALUES
    ('directeur_sgg', 'ptm', 'read'),
    ('directeur_sgg', 'ptm', 'write'),
    ('directeur_sgg', 'ptm', 'approve'),
    ('directeur_sgg', 'ptm', 'reject')
ON CONFLICT (role, module, permission) DO NOTHING;

-- SG Ministere : lecture et ecriture (saisie initiatives)
INSERT INTO auth.role_permissions (role, module, permission) VALUES
    ('sg_ministere', 'ptm', 'read'),
    ('sg_ministere', 'ptm', 'write')
ON CONFLICT (role, module, permission) DO NOTHING;

-- Ministre : lecture et ecriture
INSERT INTO auth.role_permissions (role, module, permission) VALUES
    ('ministre', 'ptm', 'read'),
    ('ministre', 'ptm', 'write')
ON CONFLICT (role, module, permission) DO NOTHING;

-- SGPR : lecture et validation
INSERT INTO auth.role_permissions (role, module, permission) VALUES
    ('sgpr', 'ptm', 'read'),
    ('sgpr', 'ptm', 'approve')
ON CONFLICT (role, module, permission) DO NOTHING;

-- Premier Ministre : lecture et validation
INSERT INTO auth.role_permissions (role, module, permission) VALUES
    ('premier_ministre', 'ptm', 'read'),
    ('premier_ministre', 'ptm', 'approve')
ON CONFLICT (role, module, permission) DO NOTHING;
