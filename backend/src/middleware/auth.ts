/**
 * SGG Digital - Authentication Middleware
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { query } from '../config/database.js';
import { cacheGet, cacheSet, cacheDelete } from '../config/redis.js';

// SECURITY: JWT_SECRET is mandatory — no fallback to prevent weak defaults
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error('FATAL: JWT_SECRET environment variable is required. Exiting.');
  process.exit(1);
}
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

// Token blacklist prefix for revocation
const TOKEN_BLACKLIST_PREFIX = 'token:blacklist:';

// Types
export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
  institutionId?: string;
}

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

type AppRole =
  | 'admin_sgg'
  | 'directeur_sgg'
  | 'sg_ministere'
  | 'sgpr'
  | 'premier_ministre'
  | 'ministre'
  | 'assemblee'
  | 'senat'
  | 'conseil_etat'
  | 'cour_constitutionnelle'
  | 'dgjo'
  | 'citoyen';

type Module = 'gar' | 'nominations' | 'legislatif' | 'egop' | 'jo';
type Permission = 'read' | 'write' | 'approve' | 'reject' | 'publish' | 'admin';

/**
 * Generate JWT token
 */
export function generateToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * Verify JWT token
 */
export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
}

/**
 * Authentication middleware
 */
export async function authenticate(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: {
          code: 'NO_TOKEN',
          message: 'Token d\'authentification requis',
        },
      });
      return;
    }

    const token = authHeader.substring(7);

    // Verify token
    const decoded = verifyToken(token);

    // Check if user still exists and is active
    const cacheKey = `user:${decoded.userId}`;
    let user = await cacheGet<{ is_active: boolean }>(cacheKey);

    if (!user) {
      const result = await query(
        'SELECT is_active FROM auth.users WHERE id = $1',
        [decoded.userId]
      );

      if (result.rows.length === 0) {
        res.status(401).json({
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'Utilisateur non trouve',
          },
        });
        return;
      }

      user = result.rows[0];
      await cacheSet(cacheKey, user, 300); // Cache for 5 minutes
    }

    if (!user.is_active) {
      res.status(401).json({
        success: false,
        error: {
          code: 'USER_INACTIVE',
          message: 'Compte utilisateur desactive',
        },
      });
      return;
    }

    // Set user in request
    req.user = decoded;

    // Check if token is blacklisted (revoked)
    const isBlacklisted = await cacheGet<boolean>(`${TOKEN_BLACKLIST_PREFIX}${token}`);
    if (isBlacklisted) {
      res.status(401).json({
        success: false,
        error: {
          code: 'TOKEN_REVOKED',
          message: 'Token revoque',
        },
      });
      return;
    }

    // Set user ID for audit logging (using set_config to prevent SQL injection)
    try {
      await query('SELECT set_config($1, $2, true)', ['app.current_user_id', decoded.userId]);
    } catch {
      // Ignore if not in transaction
    }

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Token invalide',
        },
      });
      return;
    }

    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        success: false,
        error: {
          code: 'TOKEN_EXPIRED',
          message: 'Token expire',
        },
      });
      return;
    }

    next(error);
  }
}

/**
 * Optional authentication middleware
 * Sets user if token is valid, but doesn't require it
 */
export async function optionalAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    next();
    return;
  }

  try {
    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    req.user = decoded;
  } catch {
    // Ignore invalid tokens for optional auth
  }

  next();
}

/**
 * Role-based authorization middleware
 */
export function requireRole(...roles: AppRole[]) {
  return async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: {
          code: 'NOT_AUTHENTICATED',
          message: 'Authentification requise',
        },
      });
      return;
    }

    const userRole = req.user.role as AppRole;

    // Admin SGG has access to everything
    if (userRole === 'admin_sgg') {
      next();
      return;
    }

    if (!roles.includes(userRole)) {
      res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Acces non autorise pour ce role',
        },
      });
      return;
    }

    next();
  };
}

/**
 * Permission-based authorization middleware
 */
export function requirePermission(module: Module, permission: Permission) {
  return async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: {
          code: 'NOT_AUTHENTICATED',
          message: 'Authentification requise',
        },
      });
      return;
    }

    const userRole = req.user.role as AppRole;

    // Admin SGG has all permissions
    if (userRole === 'admin_sgg') {
      next();
      return;
    }

    // Check permissions in database
    const cacheKey = `permission:${userRole}:${module}:${permission}`;
    let hasPermission = await cacheGet<boolean>(cacheKey);

    if (hasPermission === null) {
      const result = await query(
        `SELECT 1 FROM auth.role_permissions
         WHERE role = $1 AND module = $2 AND permission = $3`,
        [userRole, module, permission]
      );

      hasPermission = result.rows.length > 0;
      await cacheSet(cacheKey, hasPermission, 3600); // Cache for 1 hour
    }

    if (!hasPermission) {
      res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: `Permission ${permission} sur ${module} non autorisee`,
        },
      });
      return;
    }

    next();
  };
}

/**
 * Check if user can access a specific institution's data
 */
export function requireInstitution() {
  return async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: {
          code: 'NOT_AUTHENTICATED',
          message: 'Authentification requise',
        },
      });
      return;
    }

    const userRole = req.user.role as AppRole;

    // Admin SGG and central roles can access all institutions
    if (['admin_sgg', 'directeur_sgg', 'sgpr', 'premier_ministre'].includes(userRole)) {
      next();
      return;
    }

    // For other roles, check institution access
    const institutionId = req.params.institutionId || req.body?.institution_id;

    if (!institutionId) {
      next();
      return;
    }

    if (req.user.institutionId && req.user.institutionId !== institutionId) {
      res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Acces a cette institution non autorise',
        },
      });
      return;
    }

    next();
  };
}

/**
 * Blacklist a JWT token (for logout / revocation)
 * The token is stored in Redis until its natural expiry
 */
export async function blacklistToken(token: string): Promise<void> {
  try {
    const decoded = jwt.decode(token) as jwt.JwtPayload | null;
    if (!decoded || !decoded.exp) return;
    // TTL = remaining time until token expiry
    const ttl = decoded.exp - Math.floor(Date.now() / 1000);
    if (ttl > 0) {
      await cacheSet(`${TOKEN_BLACKLIST_PREFIX}${token}`, true, ttl);
    }
  } catch {
    // Ignore blacklist errors — token will expire naturally
  }
}

/**
 * Validate password strength
 * Requires: min 8 chars, 1 uppercase, 1 lowercase, 1 digit, 1 special char
 */
export function validatePasswordStrength(password: string): { valid: boolean; message?: string } {
  if (password.length < 8) {
    return { valid: false, message: 'Le mot de passe doit contenir au moins 8 caracteres' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Le mot de passe doit contenir au moins une majuscule' };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Le mot de passe doit contenir au moins une minuscule' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Le mot de passe doit contenir au moins un chiffre' };
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return { valid: false, message: 'Le mot de passe doit contenir au moins un caractere special' };
  }
  return { valid: true };
}
