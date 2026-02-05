/**
 * SGG Digital - Institutions Routes
 */

import { Router, Response } from 'express';
import { query } from '../config/database.js';
import { cacheGet, cacheSet } from '../config/redis.js';
import { authenticate, optionalAuth, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

/**
 * GET /api/institutions
 * List institutions (public for basic info)
 */
router.get('/', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { type, parent_id, is_active = 'true' } = req.query;

    const cacheKey = `institutions:list:${type || 'all'}:${parent_id || 'all'}:${is_active}`;
    let institutions = await cacheGet<any[]>(cacheKey);

    if (!institutions) {
      const params: any[] = [];
      let whereClause = 'WHERE 1=1';
      let paramIndex = 1;

      if (type) {
        whereClause += ` AND type = $${paramIndex}`;
        params.push(type);
        paramIndex++;
      }

      if (parent_id) {
        whereClause += ` AND parent_id = $${paramIndex}`;
        params.push(parent_id);
        paramIndex++;
      }

      if (is_active !== 'all') {
        whereClause += ` AND is_active = $${paramIndex}`;
        params.push(is_active === 'true');
        paramIndex++;
      }

      const result = await query(`
        SELECT id, code, nom, nom_court, sigle, type, parent_id, ordre_protocole,
               ville, logo_url, responsable_nom, responsable_fonction,
               niveau_digitalisation, is_active
        FROM institutions.institutions
        ${whereClause}
        ORDER BY ordre_protocole, nom
      `, params);

      institutions = result.rows;
      await cacheSet(cacheKey, institutions, 600); // 10 minutes
    }

    res.json({ success: true, data: institutions });
  } catch (error) {
    console.error('List institutions error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'FETCH_ERROR', message: 'Erreur lors de la recuperation des institutions' },
    });
  }
});

/**
 * GET /api/institutions/ministeres
 * Get ministries only
 */
router.get('/ministeres', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const cacheKey = 'institutions:ministeres';
    let ministeres = await cacheGet<any[]>(cacheKey);

    if (!ministeres) {
      const result = await query(`SELECT * FROM institutions.v_ministeres`);
      ministeres = result.rows;
      await cacheSet(cacheKey, ministeres, 3600);
    }

    res.json({ success: true, data: ministeres });
  } catch (error) {
    console.error('List ministeres error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'FETCH_ERROR', message: 'Erreur lors de la recuperation des ministeres' },
    });
  }
});

/**
 * GET /api/institutions/:id
 * Get single institution with details
 */
router.get('/:id', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const result = await query(`
      SELECT i.*, p.nom as parent_nom, p.sigle as parent_sigle
      FROM institutions.institutions i
      LEFT JOIN institutions.institutions p ON i.parent_id = p.id
      WHERE i.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Institution non trouvee' },
      });
    }

    // Get child institutions
    const childrenResult = await query(`
      SELECT id, code, nom, sigle, type, ordre_protocole
      FROM institutions.institutions
      WHERE parent_id = $1 AND is_active = true
      ORDER BY ordre_protocole, nom
    `, [id]);

    // Get interactions
    const interactionsResult = await query(`
      SELECT i.*,
             s.nom as source_nom, s.sigle as source_sigle,
             c.nom as cible_nom, c.sigle as cible_sigle
      FROM institutions.interactions i
      JOIN institutions.institutions s ON i.institution_source_id = s.id
      JOIN institutions.institutions c ON i.institution_cible_id = c.id
      WHERE (i.institution_source_id = $1 OR i.institution_cible_id = $1)
        AND i.is_active = true
    `, [id]);

    res.json({
      success: true,
      data: {
        ...result.rows[0],
        children: childrenResult.rows,
        interactions: interactionsResult.rows,
      },
    });
  } catch (error) {
    console.error('Get institution error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'FETCH_ERROR', message: 'Erreur lors de la recuperation de l\'institution' },
    });
  }
});

/**
 * GET /api/institutions/:id/hierarchy
 * Get institution hierarchy (parents and children)
 */
router.get('/:id/hierarchy', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Get ancestors using CTE
    const ancestorsResult = await query(`
      WITH RECURSIVE ancestors AS (
        SELECT id, code, nom, sigle, parent_id, 0 as level
        FROM institutions.institutions WHERE id = $1
        UNION ALL
        SELECT i.id, i.code, i.nom, i.sigle, i.parent_id, a.level + 1
        FROM institutions.institutions i
        JOIN ancestors a ON i.id = a.parent_id
      )
      SELECT * FROM ancestors WHERE id != $1 ORDER BY level DESC
    `, [id]);

    // Get descendants using CTE
    const descendantsResult = await query(`
      WITH RECURSIVE descendants AS (
        SELECT id, code, nom, sigle, parent_id, type, 1 as level
        FROM institutions.institutions WHERE parent_id = $1
        UNION ALL
        SELECT i.id, i.code, i.nom, i.sigle, i.parent_id, i.type, d.level + 1
        FROM institutions.institutions i
        JOIN descendants d ON i.parent_id = d.id
      )
      SELECT * FROM descendants ORDER BY level, nom
    `, [id]);

    res.json({
      success: true,
      data: {
        ancestors: ancestorsResult.rows,
        descendants: descendantsResult.rows,
      },
    });
  } catch (error) {
    console.error('Get hierarchy error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'FETCH_ERROR', message: 'Erreur lors de la recuperation de la hierarchie' },
    });
  }
});

/**
 * GET /api/institutions/:id/relations
 * Get institution relations/interactions
 */
router.get('/:id/relations', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const result = await query(`
      SELECT i.*,
             CASE WHEN i.institution_source_id = $1 THEN 'sortant' ELSE 'entrant' END as direction,
             CASE WHEN i.institution_source_id = $1 THEN c.nom ELSE s.nom END as autre_institution_nom,
             CASE WHEN i.institution_source_id = $1 THEN c.sigle ELSE s.sigle END as autre_institution_sigle,
             CASE WHEN i.institution_source_id = $1 THEN c.id ELSE s.id END as autre_institution_id
      FROM institutions.interactions i
      JOIN institutions.institutions s ON i.institution_source_id = s.id
      JOIN institutions.institutions c ON i.institution_cible_id = c.id
      WHERE (i.institution_source_id = $1 OR i.institution_cible_id = $1)
        AND i.is_active = true
      ORDER BY i.type_interaction
    `, [id]);

    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Get relations error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'FETCH_ERROR', message: 'Erreur lors de la recuperation des relations' },
    });
  }
});

/**
 * GET /api/institutions/stats/digitalisation
 * Get digitalization stats
 */
router.get('/stats/digitalisation', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const result = await query(`
      SELECT
        niveau_digitalisation,
        COUNT(*) as count,
        ROUND(COUNT(*)::decimal / SUM(COUNT(*)) OVER () * 100, 2) as percentage
      FROM institutions.institutions
      WHERE is_active = true AND type = 'ministere'
      GROUP BY niveau_digitalisation
      ORDER BY niveau_digitalisation
    `);

    const totalResult = await query(`
      SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE date_connexion_sgg IS NOT NULL) as connectes,
        COUNT(*) FILTER (WHERE niveau_digitalisation IN ('niveau_3', 'niveau_4')) as digitaux
      FROM institutions.institutions
      WHERE is_active = true AND type = 'ministere'
    `);

    res.json({
      success: true,
      data: {
        par_niveau: result.rows,
        totaux: totalResult.rows[0],
      },
    });
  } catch (error) {
    console.error('Get digitalisation stats error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'FETCH_ERROR', message: 'Erreur lors de la recuperation des statistiques' },
    });
  }
});

export default router;
