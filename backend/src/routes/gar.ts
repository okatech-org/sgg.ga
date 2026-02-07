/**
 * SGG Digital - GAR (Gestion Axee sur les Resultats) Routes
 * PAG 2026 - Plan d'Action Gouvernemental
 */

import { Router, Response } from 'express';
import { query } from '../config/database.js';
import { cacheGet, cacheSet, cacheDelete } from '../config/redis.js';
import { authenticate, requirePermission, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

// ============================================================================
// PUBLIC ROUTES (No authentication required)
// ============================================================================

/**
 * GET /api/gar/public/priorities
 * Get PAG priorities (public access for PAG 2026 page)
 */
router.get('/public/priorities', async (req, res: Response) => {
  try {
    const result = await query(`
      SELECT 
        p.id, p.code, p.priorite, p.titre, p.description, 
        p.icone, p.couleur, p.ordre, p.budget_alloue,
        COUNT(DISTINCT o.id) as nb_objectifs_actifs,
        COUNT(DISTINCT CASE WHEN o.statut = 'atteint' THEN o.id END) as objectifs_atteints,
        COUNT(DISTINCT CASE WHEN o.statut = 'en_retard' THEN o.id END) as objectifs_en_retard,
        COALESCE(ROUND(AVG(o.taux_execution)::numeric, 1), 0) as taux_execution_moyen
      FROM gar.priorites_pag p
      LEFT JOIN gar.objectifs o ON p.id = o.priorite_id AND o.annee = EXTRACT(YEAR FROM NOW())
      GROUP BY p.id
      ORDER BY p.ordre
    `);

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error('Get public priorities error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: 'Erreur lors de la recuperation des priorites',
      },
    });
  }
});

/**
 * GET /api/gar/public/stats
 * Get basic PAG stats (public)
 */
router.get('/public/stats', async (req, res: Response) => {
  try {
    const annee = Number(req.query.annee) || new Date().getFullYear();

    const result = await query(`
      SELECT
        COUNT(DISTINCT o.id) as total_objectifs,
        COUNT(DISTINCT CASE WHEN o.statut = 'atteint' THEN o.id END) as objectifs_atteints,
        COUNT(DISTINCT CASE WHEN o.statut = 'en_cours' THEN o.id END) as objectifs_en_cours,
        COALESCE(ROUND(AVG(o.taux_execution)::numeric, 1), 0) as taux_execution_global,
        COALESCE(SUM(o.budget_prevu), 0) as budget_total_prevu,
        COALESCE(SUM(o.budget_decaisse), 0) as budget_total_decaisse,
        (SELECT COUNT(*) FROM institutions.institutions WHERE type = 'ministere' AND is_active = true) as nb_ministeres
      FROM gar.objectifs o
      WHERE o.annee = $1
    `, [annee]);

    res.json({
      success: true,
      data: {
        ...result.rows[0],
        annee,
      },
    });
  } catch (error) {
    console.error('Get public stats error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: 'Erreur lors de la recuperation des statistiques',
      },
    });
  }
});

// ============================================================================
// AUTHENTICATED ROUTES
// ============================================================================

// All following GAR routes require authentication
router.use(authenticate);

/**
 * GET /api/gar/priorities
 * Get all PAG priorities
 */
router.get('/priorities', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const cacheKey = 'gar:priorities';
    let priorities = await cacheGet<any[]>(cacheKey);

    if (!priorities) {
      const result = await query(`
        SELECT p.*,
               COUNT(DISTINCT o.id) as nb_objectifs_actifs,
               COUNT(DISTINCT CASE WHEN o.statut = 'atteint' THEN o.id END) as objectifs_atteints,
               COUNT(DISTINCT CASE WHEN o.statut = 'en_retard' THEN o.id END) as objectifs_en_retard,
               COALESCE(AVG(o.taux_execution), 0) as taux_execution_moyen
        FROM gar.priorites_pag p
        LEFT JOIN gar.objectifs o ON p.id = o.priorite_id AND o.annee = EXTRACT(YEAR FROM NOW())
        GROUP BY p.id
        ORDER BY p.ordre
      `);
      priorities = result.rows;
      await cacheSet(cacheKey, priorities, 300); // 5 minutes
    }

    res.json({
      success: true,
      data: priorities,
    });
  } catch (error) {
    console.error('Get priorities error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: 'Erreur lors de la recuperation des priorites',
      },
    });
  }
});

/**
 * GET /api/gar/dashboard
 * Get GAR dashboard data
 */
router.get('/dashboard', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { annee = new Date().getFullYear() } = req.query;

    const cacheKey = `gar:dashboard:${annee}`;
    let dashboard = await cacheGet<any>(cacheKey);

    if (!dashboard) {
      // Get priorities with stats
      const prioritiesResult = await query(`
        SELECT * FROM gar.v_dashboard
      `);

      // Get global stats
      const globalStatsResult = await query(`
        SELECT
          COUNT(DISTINCT o.id) as total_objectifs,
          COUNT(DISTINCT CASE WHEN o.statut = 'atteint' THEN o.id END) as objectifs_atteints,
          COUNT(DISTINCT CASE WHEN o.statut = 'en_cours' THEN o.id END) as objectifs_en_cours,
          COUNT(DISTINCT CASE WHEN o.statut = 'en_retard' THEN o.id END) as objectifs_en_retard,
          COALESCE(AVG(o.taux_execution), 0) as taux_execution_global,
          COALESCE(SUM(o.budget_prevu), 0) as budget_total_prevu,
          COALESCE(SUM(o.budget_decaisse), 0) as budget_total_decaisse
        FROM gar.objectifs o
        WHERE o.annee = $1
      `, [annee]);

      // Get ministries performance
      const ministeresResult = await query(`
        SELECT
          i.id, i.nom, i.sigle,
          COUNT(DISTINCT o.id) as nb_objectifs,
          COUNT(DISTINCT CASE WHEN o.statut = 'atteint' THEN o.id END) as objectifs_atteints,
          COALESCE(AVG(o.taux_execution), 0) as taux_execution_moyen,
          COUNT(DISTINCT r.id) FILTER (WHERE r.statut = 'valide') as rapports_valides,
          COUNT(DISTINCT r.id) FILTER (WHERE r.statut = 'en_retard') as rapports_en_retard
        FROM institutions.institutions i
        LEFT JOIN gar.objectifs o ON i.id = o.ministere_id AND o.annee = $1
        LEFT JOIN gar.rapports r ON i.id = r.ministere_id AND r.annee = $1
        WHERE i.type = 'ministere' AND i.is_active = true
        GROUP BY i.id, i.nom, i.sigle
        ORDER BY taux_execution_moyen DESC
      `, [annee]);

      // Get recent reports
      const reportsResult = await query(`
        SELECT r.*, i.nom as ministere_nom, i.sigle as ministere_sigle
        FROM gar.rapports r
        JOIN institutions.institutions i ON r.ministere_id = i.id
        WHERE r.annee = $1
        ORDER BY r.date_soumission DESC NULLS LAST
        LIMIT 10
      `, [annee]);

      dashboard = {
        priorities: prioritiesResult.rows,
        globalStats: globalStatsResult.rows[0],
        ministeres: ministeresResult.rows,
        recentReports: reportsResult.rows,
        annee: Number(annee),
      };

      await cacheSet(cacheKey, dashboard, 300);
    }

    res.json({
      success: true,
      data: dashboard,
    });
  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: 'Erreur lors de la recuperation du tableau de bord',
      },
    });
  }
});

/**
 * GET /api/gar/objectifs
 * Get objectives with filters
 */
router.get('/objectifs', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      page = 1,
      limit = 20,
      annee = new Date().getFullYear(),
      ministere_id,
      priorite_id,
      statut,
      search,
    } = req.query;

    const offset = (Number(page) - 1) * Number(limit);
    const params: any[] = [annee];
    let whereClause = 'WHERE o.annee = $1';
    let paramIndex = 2;

    if (ministere_id) {
      whereClause += ` AND o.ministere_id = $${paramIndex}`;
      params.push(ministere_id);
      paramIndex++;
    }

    if (priorite_id) {
      whereClause += ` AND o.priorite_id = $${paramIndex}`;
      params.push(priorite_id);
      paramIndex++;
    }

    if (statut) {
      whereClause += ` AND o.statut = $${paramIndex}`;
      params.push(statut);
      paramIndex++;
    }

    if (search) {
      whereClause += ` AND (o.titre ILIKE $${paramIndex} OR o.code ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    // Get total count
    const countResult = await query(`
      SELECT COUNT(*) FROM gar.objectifs o ${whereClause}
    `, params);

    // Get objectives
    params.push(Number(limit), offset);
    const result = await query(`
      SELECT o.*,
             p.titre as priorite_titre, p.priorite as priorite_code, p.couleur,
             i.nom as ministere_nom, i.sigle as ministere_sigle
      FROM gar.objectifs o
      JOIN gar.priorites_pag p ON o.priorite_id = p.id
      JOIN institutions.institutions i ON o.ministere_id = i.id
      ${whereClause}
      ORDER BY o.priorite_id, o.code
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
    console.error('Get objectifs error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: 'Erreur lors de la recuperation des objectifs',
      },
    });
  }
});

/**
 * GET /api/gar/objectifs/:id
 * Get single objective
 */
router.get('/objectifs/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const result = await query(`
      SELECT o.*,
             p.titre as priorite_titre, p.priorite as priorite_code, p.couleur,
             i.nom as ministere_nom, i.sigle as ministere_sigle
      FROM gar.objectifs o
      JOIN gar.priorites_pag p ON o.priorite_id = p.id
      JOIN institutions.institutions i ON o.ministere_id = i.id
      WHERE o.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Objectif non trouve',
        },
      });
    }

    // Get indicators
    const indicatorsResult = await query(`
      SELECT * FROM gar.indicateurs WHERE objectif_id = $1 ORDER BY code
    `, [id]);

    // Get child objectives
    const childrenResult = await query(`
      SELECT * FROM gar.objectifs WHERE parent_id = $1 ORDER BY code
    `, [id]);

    res.json({
      success: true,
      data: {
        ...result.rows[0],
        indicateurs: indicatorsResult.rows,
        sous_objectifs: childrenResult.rows,
      },
    });
  } catch (error) {
    console.error('Get objectif error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: 'Erreur lors de la recuperation de l\'objectif',
      },
    });
  }
});

/**
 * POST /api/gar/objectifs
 * Create new objective
 */
router.post('/objectifs',
  requirePermission('gar', 'write'),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const data = req.body;

      const result = await query(`
        INSERT INTO gar.objectifs (
          code, priorite_id, ministere_id, titre, description, annee, trimestre,
          indicateur_cle, unite_mesure, valeur_reference, valeur_cible,
          budget_prevu, date_debut, date_echeance, responsable_nom, responsable_email,
          parent_id, niveau, observations, created_by
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20
        )
        RETURNING *
      `, [
        data.code, data.priorite_id, data.ministere_id, data.titre, data.description,
        data.annee || new Date().getFullYear(), data.trimestre,
        data.indicateur_cle, data.unite_mesure, data.valeur_reference, data.valeur_cible,
        data.budget_prevu, data.date_debut, data.date_echeance,
        data.responsable_nom, data.responsable_email,
        data.parent_id, data.niveau || 1, data.observations,
        req.user?.userId
      ]);

      // Clear caches
      await cacheDelete('gar:priorities');
      await cacheDelete(`gar:dashboard:${data.annee || new Date().getFullYear()}`);

      res.status(201).json({
        success: true,
        data: result.rows[0],
      });
    } catch (error) {
      console.error('Create objectif error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'CREATE_ERROR',
          message: 'Erreur lors de la creation de l\'objectif',
        },
      });
    }
  }
);

/**
 * PATCH /api/gar/objectifs/:id
 * Update objective
 */
router.patch('/objectifs/:id',
  requirePermission('gar', 'write'),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const data = req.body;

      // Build dynamic update
      const updates: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      const allowedFields = [
        'titre', 'description', 'indicateur_cle', 'unite_mesure',
        'valeur_reference', 'valeur_cible', 'valeur_t1', 'valeur_t2', 'valeur_t3', 'valeur_t4',
        'valeur_realisee', 'budget_prevu', 'budget_engage', 'budget_decaisse',
        'statut', 'date_debut', 'date_echeance', 'date_achevement',
        'responsable_nom', 'responsable_email', 'observations'
      ];

      for (const field of allowedFields) {
        if (data[field] !== undefined) {
          updates.push(`${field} = $${paramIndex}`);
          values.push(data[field]);
          paramIndex++;
        }
      }

      if (updates.length === 0) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'NO_UPDATES',
            message: 'Aucune modification fournie',
          },
        });
      }

      updates.push(`updated_by = $${paramIndex}`);
      values.push(req.user?.userId);
      paramIndex++;

      values.push(id);

      const result = await query(`
        UPDATE gar.objectifs
        SET ${updates.join(', ')}, updated_at = NOW()
        WHERE id = $${paramIndex}
        RETURNING *
      `, values);

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Objectif non trouve',
          },
        });
      }

      // Clear caches
      await cacheDelete('gar:priorities');
      await cacheDelete(`gar:dashboard:${result.rows[0].annee}`);

      res.json({
        success: true,
        data: result.rows[0],
      });
    } catch (error) {
      console.error('Update objectif error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'UPDATE_ERROR',
          message: 'Erreur lors de la mise a jour de l\'objectif',
        },
      });
    }
  }
);

/**
 * GET /api/gar/rapports
 * Get monthly reports
 */
router.get('/rapports', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      page = 1,
      limit = 20,
      annee = new Date().getFullYear(),
      mois,
      ministere_id,
      statut,
    } = req.query;

    const offset = (Number(page) - 1) * Number(limit);
    const params: any[] = [annee];
    let whereClause = 'WHERE r.annee = $1';
    let paramIndex = 2;

    if (mois) {
      whereClause += ` AND r.mois = $${paramIndex}`;
      params.push(mois);
      paramIndex++;
    }

    if (ministere_id) {
      whereClause += ` AND r.ministere_id = $${paramIndex}`;
      params.push(ministere_id);
      paramIndex++;
    }

    if (statut) {
      whereClause += ` AND r.statut = $${paramIndex}`;
      params.push(statut);
      paramIndex++;
    }

    // Check user's institution
    if (req.user?.role === 'sg_ministere' && req.user?.institutionId) {
      whereClause += ` AND r.ministere_id = $${paramIndex}`;
      params.push(req.user.institutionId);
      paramIndex++;
    }

    // Get total count
    const countResult = await query(`
      SELECT COUNT(*) FROM gar.rapports r ${whereClause}
    `, params);

    // Get reports
    params.push(Number(limit), offset);
    const result = await query(`
      SELECT r.*, i.nom as ministere_nom, i.sigle as ministere_sigle,
             u_soumis.full_name as soumis_par_nom,
             u_valide.full_name as valide_par_nom
      FROM gar.rapports r
      JOIN institutions.institutions i ON r.ministere_id = i.id
      LEFT JOIN auth.users u_soumis ON r.soumis_par = u_soumis.id
      LEFT JOIN auth.users u_valide ON r.valide_par = u_valide.id
      ${whereClause}
      ORDER BY r.annee DESC, r.mois DESC, i.nom
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
    console.error('Get rapports error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: 'Erreur lors de la recuperation des rapports',
      },
    });
  }
});

/**
 * POST /api/gar/rapports
 * Submit monthly report
 */
router.post('/rapports',
  requirePermission('gar', 'write'),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const data = req.body;

      // Check if report already exists
      const existingResult = await query(`
        SELECT id FROM gar.rapports
        WHERE ministere_id = $1 AND annee = $2 AND mois = $3
      `, [data.ministere_id, data.annee, data.mois]);

      if (existingResult.rows.length > 0) {
        return res.status(409).json({
          success: false,
          error: {
            code: 'ALREADY_EXISTS',
            message: 'Un rapport existe deja pour cette periode',
          },
        });
      }

      const result = await query(`
        INSERT INTO gar.rapports (
          ministere_id, annee, mois, donnees_matrice,
          nb_objectifs_suivis, nb_objectifs_atteints, nb_objectifs_en_retard,
          taux_global_realisation, synthese, difficultes, perspectives, recommandations,
          fichier_url, fichier_excel_url, statut, date_soumission, soumis_par
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, 'soumis', NOW(), $15
        )
        RETURNING *
      `, [
        data.ministere_id, data.annee, data.mois, JSON.stringify(data.donnees_matrice || []),
        data.nb_objectifs_suivis || 0, data.nb_objectifs_atteints || 0, data.nb_objectifs_en_retard || 0,
        data.taux_global_realisation || 0, data.synthese, data.difficultes, data.perspectives,
        data.recommandations, data.fichier_url, data.fichier_excel_url,
        req.user?.userId
      ]);

      // Clear dashboard cache
      await cacheDelete(`gar:dashboard:${data.annee}`);

      res.status(201).json({
        success: true,
        data: result.rows[0],
      });
    } catch (error) {
      console.error('Create rapport error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'CREATE_ERROR',
          message: 'Erreur lors de la soumission du rapport',
        },
      });
    }
  }
);

/**
 * PATCH /api/gar/rapports/:id/validate
 * Validate or reject a report
 */
router.patch('/rapports/:id/validate',
  requirePermission('gar', 'approve'),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const { statut, observations } = req.body;

      if (!['valide', 'rejete'].includes(statut)) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_STATUS',
            message: 'Statut invalide. Utiliser "valide" ou "rejete"',
          },
        });
      }

      const result = await query(`
        UPDATE gar.rapports
        SET statut = $1, date_validation = NOW(), valide_par = $2, observations_validation = $3
        WHERE id = $4
        RETURNING *
      `, [statut, req.user?.userId, observations, id]);

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Rapport non trouve',
          },
        });
      }

      // Clear dashboard cache
      await cacheDelete(`gar:dashboard:${result.rows[0].annee}`);

      res.json({
        success: true,
        data: result.rows[0],
      });
    } catch (error) {
      console.error('Validate rapport error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'VALIDATE_ERROR',
          message: 'Erreur lors de la validation du rapport',
        },
      });
    }
  }
);

/**
 * GET /api/gar/ministeres/:id/stats
 * Get ministry GAR statistics
 */
router.get('/ministeres/:id/stats', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { annee = new Date().getFullYear() } = req.query;

    const result = await query(`
      SELECT
        i.id, i.nom, i.sigle,
        COUNT(DISTINCT o.id) as nb_objectifs,
        COUNT(DISTINCT CASE WHEN o.statut = 'atteint' THEN o.id END) as objectifs_atteints,
        COUNT(DISTINCT CASE WHEN o.statut = 'en_cours' THEN o.id END) as objectifs_en_cours,
        COUNT(DISTINCT CASE WHEN o.statut = 'en_retard' THEN o.id END) as objectifs_en_retard,
        COALESCE(AVG(o.taux_execution), 0) as taux_execution_moyen,
        COALESCE(SUM(o.budget_prevu), 0) as budget_total_prevu,
        COALESCE(SUM(o.budget_decaisse), 0) as budget_total_decaisse
      FROM institutions.institutions i
      LEFT JOIN gar.objectifs o ON i.id = o.ministere_id AND o.annee = $2
      WHERE i.id = $1
      GROUP BY i.id, i.nom, i.sigle
    `, [id, annee]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Ministere non trouve',
        },
      });
    }

    // Get reports status
    const reportsResult = await query(`
      SELECT mois, statut, date_soumission, date_validation
      FROM gar.rapports
      WHERE ministere_id = $1 AND annee = $2
      ORDER BY mois
    `, [id, annee]);

    // Get objectives by priority
    const byPriorityResult = await query(`
      SELECT p.priorite, p.titre, p.couleur,
             COUNT(o.id) as nb_objectifs,
             COALESCE(AVG(o.taux_execution), 0) as taux_execution_moyen
      FROM gar.priorites_pag p
      LEFT JOIN gar.objectifs o ON p.id = o.priorite_id AND o.ministere_id = $1 AND o.annee = $2
      GROUP BY p.id, p.priorite, p.titre, p.couleur
      ORDER BY p.ordre
    `, [id, annee]);

    res.json({
      success: true,
      data: {
        ...result.rows[0],
        rapports: reportsResult.rows,
        par_priorite: byPriorityResult.rows,
        annee: Number(annee),
      },
    });
  } catch (error) {
    console.error('Get ministere stats error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: 'Erreur lors de la recuperation des statistiques',
      },
    });
  }
});

export default router;
