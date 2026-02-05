/**
 * SGG Digital - Users Routes
 */

import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { query } from '../config/database.js';
import { cacheDelete } from '../config/redis.js';
import { authenticate, requireRole, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

/**
 * GET /api/users
 * List users
 */
router.get('/',
  requireRole('admin_sgg', 'directeur_sgg'),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { page = 1, limit = 20, role, institution_id, search, is_active } = req.query;
      const offset = (Number(page) - 1) * Number(limit);

      const params: any[] = [];
      let whereClause = 'WHERE 1=1';
      let paramIndex = 1;

      if (role) {
        whereClause += ` AND r.role = $${paramIndex}`;
        params.push(role);
        paramIndex++;
      }

      if (institution_id) {
        whereClause += ` AND r.institution_id = $${paramIndex}`;
        params.push(institution_id);
        paramIndex++;
      }

      if (search) {
        whereClause += ` AND (u.full_name ILIKE $${paramIndex} OR u.email ILIKE $${paramIndex})`;
        params.push(`%${search}%`);
        paramIndex++;
      }

      if (is_active !== undefined) {
        whereClause += ` AND u.is_active = $${paramIndex}`;
        params.push(is_active === 'true');
        paramIndex++;
      }

      const countResult = await query(`
        SELECT COUNT(DISTINCT u.id)
        FROM auth.users u
        LEFT JOIN auth.user_roles r ON u.id = r.user_id AND r.is_primary = true
        ${whereClause}
      `, params);

      params.push(Number(limit), offset);
      const result = await query(`
        SELECT u.id, u.email, u.full_name, u.phone, u.avatar_url,
               u.is_active, u.is_verified, u.last_login, u.created_at,
               r.role, r.institution_id,
               i.nom as institution_nom, i.sigle as institution_sigle
        FROM auth.users u
        LEFT JOIN auth.user_roles r ON u.id = r.user_id AND r.is_primary = true
        LEFT JOIN institutions.institutions i ON r.institution_id = i.id
        ${whereClause}
        ORDER BY u.created_at DESC
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      `, params);

      const total = parseInt(countResult.rows[0].count);

      res.json({
        success: true,
        data: result.rows,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / Number(limit)),
        },
      });
    } catch (error) {
      console.error('List users error:', error);
      res.status(500).json({
        success: false,
        error: { code: 'FETCH_ERROR', message: 'Erreur lors de la recuperation des utilisateurs' },
      });
    }
  }
);

/**
 * GET /api/users/:id
 * Get single user
 */
router.get('/:id',
  requireRole('admin_sgg', 'directeur_sgg'),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;

      const result = await query(`
        SELECT u.id, u.email, u.full_name, u.phone, u.avatar_url,
               u.is_active, u.is_verified, u.last_login, u.created_at
        FROM auth.users u
        WHERE u.id = $1
      `, [id]);

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Utilisateur non trouve' },
        });
      }

      const rolesResult = await query(`
        SELECT r.role, r.institution_id, r.is_primary, i.nom as institution_nom
        FROM auth.user_roles r
        LEFT JOIN institutions.institutions i ON r.institution_id = i.id
        WHERE r.user_id = $1
      `, [id]);

      res.json({
        success: true,
        data: {
          ...result.rows[0],
          roles: rolesResult.rows,
        },
      });
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({
        success: false,
        error: { code: 'FETCH_ERROR', message: 'Erreur lors de la recuperation de l\'utilisateur' },
      });
    }
  }
);

/**
 * POST /api/users
 * Create user
 */
router.post('/',
  requireRole('admin_sgg'),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { email, password, full_name, phone, role, institution_id } = req.body;

      if (!email || !password || !full_name) {
        return res.status(400).json({
          success: false,
          error: { code: 'MISSING_FIELDS', message: 'Email, mot de passe et nom complet requis' },
        });
      }

      // Check if email exists
      const existingResult = await query('SELECT id FROM auth.users WHERE email = $1', [email.toLowerCase()]);
      if (existingResult.rows.length > 0) {
        return res.status(409).json({
          success: false,
          error: { code: 'EMAIL_EXISTS', message: 'Cet email est deja utilise' },
        });
      }

      const passwordHash = await bcrypt.hash(password, 10);

      const userResult = await query(`
        INSERT INTO auth.users (email, password_hash, full_name, phone, is_active, is_verified)
        VALUES ($1, $2, $3, $4, true, true)
        RETURNING id, email, full_name, phone, is_active, is_verified, created_at
      `, [email.toLowerCase(), passwordHash, full_name, phone]);

      const userId = userResult.rows[0].id;

      // Assign role
      await query(`
        INSERT INTO auth.user_roles (user_id, role, institution_id, is_primary, granted_by)
        VALUES ($1, $2, $3, true, $4)
      `, [userId, role || 'citoyen', institution_id, req.user?.userId]);

      res.status(201).json({
        success: true,
        data: userResult.rows[0],
      });
    } catch (error) {
      console.error('Create user error:', error);
      res.status(500).json({
        success: false,
        error: { code: 'CREATE_ERROR', message: 'Erreur lors de la creation de l\'utilisateur' },
      });
    }
  }
);

/**
 * PATCH /api/users/:id
 * Update user
 */
router.patch('/:id',
  requireRole('admin_sgg'),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const { full_name, phone, is_active } = req.body;

      const updates: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      if (full_name !== undefined) {
        updates.push(`full_name = $${paramIndex}`);
        values.push(full_name);
        paramIndex++;
      }

      if (phone !== undefined) {
        updates.push(`phone = $${paramIndex}`);
        values.push(phone);
        paramIndex++;
      }

      if (is_active !== undefined) {
        updates.push(`is_active = $${paramIndex}`);
        values.push(is_active);
        paramIndex++;
      }

      if (updates.length === 0) {
        return res.status(400).json({
          success: false,
          error: { code: 'NO_UPDATES', message: 'Aucune modification fournie' },
        });
      }

      values.push(id);

      const result = await query(`
        UPDATE auth.users SET ${updates.join(', ')}, updated_at = NOW()
        WHERE id = $${paramIndex}
        RETURNING id, email, full_name, phone, is_active, is_verified, updated_at
      `, values);

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Utilisateur non trouve' },
        });
      }

      await cacheDelete(`user:${id}`);

      res.json({ success: true, data: result.rows[0] });
    } catch (error) {
      console.error('Update user error:', error);
      res.status(500).json({
        success: false,
        error: { code: 'UPDATE_ERROR', message: 'Erreur lors de la mise a jour' },
      });
    }
  }
);

/**
 * PATCH /api/users/:id/role
 * Update user role
 */
router.patch('/:id/role',
  requireRole('admin_sgg'),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const { role, institution_id } = req.body;

      await query(`
        UPDATE auth.user_roles SET role = $1, institution_id = $2, granted_by = $3, granted_at = NOW()
        WHERE user_id = $4 AND is_primary = true
      `, [role, institution_id, req.user?.userId, id]);

      await cacheDelete(`user:${id}`);

      res.json({ success: true, data: { message: 'Role mis a jour' } });
    } catch (error) {
      console.error('Update role error:', error);
      res.status(500).json({
        success: false,
        error: { code: 'UPDATE_ERROR', message: 'Erreur lors de la mise a jour du role' },
      });
    }
  }
);

export default router;
