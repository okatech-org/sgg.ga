/**
 * SGG Digital - Authentication Routes
 */

import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { query } from '../config/database.js';
import { cacheDelete } from '../config/redis.js';
import { authenticate, generateToken, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

/**
 * POST /api/auth/login
 * User login
 */
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_FIELDS',
          message: 'Email et mot de passe requis',
        },
      });
    }

    // Find user
    const userResult = await query(
      `SELECT u.id, u.email, u.password_hash, u.full_name, u.is_active, u.is_verified,
              u.failed_login_count, u.locked_until, u.totp_enabled
       FROM auth.users u
       WHERE u.email = $1`,
      [email.toLowerCase()]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Email ou mot de passe incorrect',
        },
      });
    }

    const user = userResult.rows[0];

    // Check if account is locked
    if (user.locked_until && new Date(user.locked_until) > new Date()) {
      return res.status(423).json({
        success: false,
        error: {
          code: 'ACCOUNT_LOCKED',
          message: 'Compte temporairement verrouille. Reessayez plus tard.',
        },
      });
    }

    // Check if account is active
    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'ACCOUNT_INACTIVE',
          message: 'Compte desactive. Contactez l\'administrateur.',
        },
      });
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password_hash);

    if (!isValid) {
      // Increment failed login count
      const failedCount = (user.failed_login_count || 0) + 1;
      const lockUntil = failedCount >= 5
        ? new Date(Date.now() + 15 * 60 * 1000) // Lock for 15 minutes after 5 failures
        : null;

      await query(
        `UPDATE auth.users
         SET failed_login_count = $1, locked_until = $2
         WHERE id = $3`,
        [failedCount, lockUntil, user.id]
      );

      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Email ou mot de passe incorrect',
        },
      });
    }

    // Get user role
    const roleResult = await query(
      `SELECT role, institution_id
       FROM auth.user_roles
       WHERE user_id = $1 AND is_primary = true
       LIMIT 1`,
      [user.id]
    );

    const userRole = roleResult.rows[0] || { role: 'citoyen', institution_id: null };

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: userRole.role,
      institutionId: userRole.institution_id,
    });

    // Update user login info
    await query(
      `UPDATE auth.users
       SET last_login = NOW(),
           login_count = COALESCE(login_count, 0) + 1,
           failed_login_count = 0,
           locked_until = NULL
       WHERE id = $1`,
      [user.id]
    );

    // Clear user cache
    await cacheDelete(`user:${user.id}`);

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          role: userRole.role,
          institution_id: userRole.institution_id,
          totp_enabled: user.totp_enabled,
        },
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'LOGIN_ERROR',
        message: 'Erreur lors de la connexion',
      },
    });
  }
});

/**
 * POST /api/auth/logout
 * User logout
 */
router.post('/logout', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Clear user cache
    if (req.user) {
      await cacheDelete(`user:${req.user.userId}`);
    }

    res.json({
      success: true,
      data: {
        message: 'Deconnexion reussie',
      },
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'LOGOUT_ERROR',
        message: 'Erreur lors de la deconnexion',
      },
    });
  }
});

/**
 * GET /api/auth/me
 * Get current user info
 */
router.get('/me', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;

    const result = await query(
      `SELECT u.id, u.email, u.full_name, u.phone, u.avatar_url,
              u.is_active, u.is_verified, u.totp_enabled,
              u.last_login, u.created_at,
              r.role, r.institution_id,
              i.nom as institution_nom, i.code as institution_code
       FROM auth.users u
       LEFT JOIN auth.user_roles r ON u.id = r.user_id AND r.is_primary = true
       LEFT JOIN institutions.institutions i ON r.institution_id = i.id
       WHERE u.id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'Utilisateur non trouve',
        },
      });
    }

    const user = result.rows[0];

    // Get all user roles
    const rolesResult = await query(
      `SELECT r.role, r.institution_id, r.is_primary, i.nom as institution_nom
       FROM auth.user_roles r
       LEFT JOIN institutions.institutions i ON r.institution_id = i.id
       WHERE r.user_id = $1`,
      [userId]
    );

    res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        phone: user.phone,
        avatar_url: user.avatar_url,
        is_active: user.is_active,
        is_verified: user.is_verified,
        totp_enabled: user.totp_enabled,
        last_login: user.last_login,
        created_at: user.created_at,
        primary_role: user.role,
        institution: user.institution_id ? {
          id: user.institution_id,
          nom: user.institution_nom,
          code: user.institution_code,
        } : null,
        roles: rolesResult.rows,
      },
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: 'Erreur lors de la recuperation des informations',
      },
    });
  }
});

/**
 * POST /api/auth/refresh
 * Refresh token
 */
router.post('/refresh', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'NOT_AUTHENTICATED',
          message: 'Authentification requise',
        },
      });
    }

    // Generate new token
    const token = generateToken({
      userId: req.user.userId,
      email: req.user.email,
      role: req.user.role,
      institutionId: req.user.institutionId,
    });

    res.json({
      success: true,
      data: {
        token,
      },
    });
  } catch (error) {
    console.error('Refresh error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'REFRESH_ERROR',
        message: 'Erreur lors du rafraichissement du token',
      },
    });
  }
});

/**
 * POST /api/auth/change-password
 * Change password
 */
router.post('/change-password', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { current_password, new_password } = req.body;

    if (!current_password || !new_password) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_FIELDS',
          message: 'Mot de passe actuel et nouveau mot de passe requis',
        },
      });
    }

    if (new_password.length < 8) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'WEAK_PASSWORD',
          message: 'Le mot de passe doit contenir au moins 8 caracteres',
        },
      });
    }

    // Get current password hash
    const result = await query(
      'SELECT password_hash FROM auth.users WHERE id = $1',
      [req.user?.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'Utilisateur non trouve',
        },
      });
    }

    // Verify current password
    const isValid = await bcrypt.compare(current_password, result.rows[0].password_hash);

    if (!isValid) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_PASSWORD',
          message: 'Mot de passe actuel incorrect',
        },
      });
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(new_password, 10);

    // Update password
    await query(
      'UPDATE auth.users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
      [newPasswordHash, req.user?.userId]
    );

    res.json({
      success: true,
      data: {
        message: 'Mot de passe modifie avec succes',
      },
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'CHANGE_PASSWORD_ERROR',
        message: 'Erreur lors du changement de mot de passe',
      },
    });
  }
});

export default router;
