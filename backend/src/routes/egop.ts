/**
 * SGG Digital - e-GOP Routes
 * Conseils, Reunions Interministerielles, Courrier
 */

import { Router, Response } from 'express';
import { query } from '../config/database.js';
import { cacheGet, cacheSet, cacheDelete } from '../config/redis.js';
import { authenticate, requirePermission, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

// =============================================================================
// CONSEILS INTERMINISTERIELS
// =============================================================================

/**
 * GET /api/egop/conseils
 * List councils
 */
router.get('/conseils', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { page = 1, limit = 20, type, statut, date_debut, date_fin } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const params: any[] = [];
    let whereClause = 'WHERE 1=1';
    let idx = 1;

    if (type) { whereClause += ` AND c.type = $${idx}`; params.push(type); idx++; }
    if (statut) { whereClause += ` AND c.statut = $${idx}`; params.push(statut); idx++; }
    if (date_debut) { whereClause += ` AND c.date_conseil >= $${idx}`; params.push(date_debut); idx++; }
    if (date_fin) { whereClause += ` AND c.date_conseil <= $${idx}`; params.push(date_fin); idx++; }

    const countResult = await query(`SELECT COUNT(*) FROM egop.conseils c ${whereClause}`, params);

    params.push(Number(limit), offset);
    const result = await query(`
      SELECT c.*, i.nom as president_institution_nom
      FROM egop.conseils c
      LEFT JOIN institutions.institutions i ON c.president_institution_id = i.id
      ${whereClause}
      ORDER BY c.date_conseil DESC, c.heure_debut DESC
      LIMIT $${idx} OFFSET $${idx + 1}
    `, params);

    const total = parseInt(countResult.rows[0].count);

    res.json({
      success: true,
      data: result.rows,
      pagination: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / Number(limit)) },
    });
  } catch (error) {
    console.error('List conseils error:', error);
    res.status(500).json({ success: false, error: { code: 'FETCH_ERROR', message: 'Erreur' } });
  }
});

/**
 * GET /api/egop/conseils/:id
 * Get single council with details
 */
router.get('/conseils/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const result = await query(`SELECT * FROM egop.conseils WHERE id = $1`, [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Conseil non trouve' } });
    }

    const participantsResult = await query(`
      SELECT p.*, i.nom as institution_nom, i.sigle as institution_sigle
      FROM egop.conseil_participants p
      JOIN institutions.institutions i ON p.institution_id = i.id
      WHERE p.conseil_id = $1
      ORDER BY i.ordre_protocole
    `, [id]);

    const dossiersResult = await query(`
      SELECT d.*, i.nom as ministere_rapporteur_nom
      FROM egop.conseil_dossiers d
      LEFT JOIN institutions.institutions i ON d.ministere_rapporteur_id = i.id
      WHERE d.conseil_id = $1
      ORDER BY d.ordre
    `, [id]);

    res.json({
      success: true,
      data: {
        ...result.rows[0],
        participants: participantsResult.rows,
        dossiers: dossiersResult.rows,
      },
    });
  } catch (error) {
    console.error('Get conseil error:', error);
    res.status(500).json({ success: false, error: { code: 'FETCH_ERROR', message: 'Erreur' } });
  }
});

/**
 * POST /api/egop/conseils
 * Create council
 */
router.post('/conseils', requirePermission('egop', 'write'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const data = req.body;

    const result = await query(`
      INSERT INTO egop.conseils (
        type, titre, objet, date_conseil, heure_debut, lieu,
        president_institution_id, president_nom, president_fonction,
        ordre_du_jour, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `, [
      data.type, data.titre, data.objet, data.date_conseil, data.heure_debut, data.lieu,
      data.president_institution_id, data.president_nom, data.president_fonction,
      data.ordre_du_jour, req.user?.userId
    ]);

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Create conseil error:', error);
    res.status(500).json({ success: false, error: { code: 'CREATE_ERROR', message: 'Erreur' } });
  }
});

/**
 * GET /api/egop/conseils/:id/participants
 * Get council participants
 */
router.get('/conseils/:id/participants', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const result = await query(`
      SELECT p.*, i.nom as institution_nom, i.sigle as institution_sigle, i.type as institution_type
      FROM egop.conseil_participants p
      JOIN institutions.institutions i ON p.institution_id = i.id
      WHERE p.conseil_id = $1
      ORDER BY i.ordre_protocole
    `, [id]);

    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Get participants error:', error);
    res.status(500).json({ success: false, error: { code: 'FETCH_ERROR', message: 'Erreur' } });
  }
});

/**
 * GET /api/egop/conseils/:id/dossiers
 * Get council dossiers
 */
router.get('/conseils/:id/dossiers', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const result = await query(`
      SELECT d.*, i.nom as ministere_rapporteur_nom, i.sigle as ministere_rapporteur_sigle
      FROM egop.conseil_dossiers d
      LEFT JOIN institutions.institutions i ON d.ministere_rapporteur_id = i.id
      WHERE d.conseil_id = $1
      ORDER BY d.ordre
    `, [id]);

    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Get dossiers error:', error);
    res.status(500).json({ success: false, error: { code: 'FETCH_ERROR', message: 'Erreur' } });
  }
});

// =============================================================================
// REUNIONS INTERMINISTERIELLES
// =============================================================================

/**
 * GET /api/egop/reunions
 * List meetings
 */
router.get('/reunions', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { page = 1, limit = 20, statut, date_debut, date_fin, convocateur_id } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const params: any[] = [];
    let whereClause = 'WHERE 1=1';
    let idx = 1;

    if (statut) { whereClause += ` AND r.statut = $${idx}`; params.push(statut); idx++; }
    if (date_debut) { whereClause += ` AND r.date_reunion >= $${idx}`; params.push(date_debut); idx++; }
    if (date_fin) { whereClause += ` AND r.date_reunion <= $${idx}`; params.push(date_fin); idx++; }
    if (convocateur_id) { whereClause += ` AND r.convocateur_institution_id = $${idx}`; params.push(convocateur_id); idx++; }

    const countResult = await query(`SELECT COUNT(*) FROM egop.reunions r ${whereClause}`, params);

    params.push(Number(limit), offset);
    const result = await query(`
      SELECT r.*, i.nom as convocateur_institution_nom, i.sigle as convocateur_sigle
      FROM egop.reunions r
      LEFT JOIN institutions.institutions i ON r.convocateur_institution_id = i.id
      ${whereClause}
      ORDER BY r.date_reunion DESC, r.heure_debut DESC
      LIMIT $${idx} OFFSET $${idx + 1}
    `, params);

    const total = parseInt(countResult.rows[0].count);

    res.json({
      success: true,
      data: result.rows,
      pagination: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / Number(limit)) },
    });
  } catch (error) {
    console.error('List reunions error:', error);
    res.status(500).json({ success: false, error: { code: 'FETCH_ERROR', message: 'Erreur' } });
  }
});

/**
 * GET /api/egop/reunions/:id
 * Get single meeting
 */
router.get('/reunions/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const result = await query(`
      SELECT r.*, i.nom as convocateur_institution_nom
      FROM egop.reunions r
      LEFT JOIN institutions.institutions i ON r.convocateur_institution_id = i.id
      WHERE r.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Reunion non trouvee' } });
    }

    const participantsResult = await query(`
      SELECT p.*, i.nom as institution_nom, i.sigle as institution_sigle
      FROM egop.reunion_participants p
      JOIN institutions.institutions i ON p.institution_id = i.id
      WHERE p.reunion_id = $1
    `, [id]);

    res.json({
      success: true,
      data: {
        ...result.rows[0],
        participants: participantsResult.rows,
      },
    });
  } catch (error) {
    console.error('Get reunion error:', error);
    res.status(500).json({ success: false, error: { code: 'FETCH_ERROR', message: 'Erreur' } });
  }
});

/**
 * POST /api/egop/reunions
 * Create meeting
 */
router.post('/reunions', requirePermission('egop', 'write'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const data = req.body;

    const result = await query(`
      INSERT INTO egop.reunions (
        objet, type, date_reunion, heure_debut, lieu, is_visioconference, lien_visio,
        convocateur_institution_id, convocateur_nom, ordre_du_jour, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `, [
      data.objet, data.type, data.date_reunion, data.heure_debut, data.lieu,
      data.is_visioconference || false, data.lien_visio,
      data.convocateur_institution_id, data.convocateur_nom, data.ordre_du_jour,
      req.user?.userId
    ]);

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Create reunion error:', error);
    res.status(500).json({ success: false, error: { code: 'CREATE_ERROR', message: 'Erreur' } });
  }
});

// =============================================================================
// COURRIERS
// =============================================================================

/**
 * GET /api/egop/courriers
 * List courriers
 */
router.get('/courriers', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { page = 1, limit = 20, type, statut, priorite, affecte_a, search } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const params: any[] = [];
    let whereClause = 'WHERE 1=1';
    let idx = 1;

    if (type) { whereClause += ` AND c.type = $${idx}`; params.push(type); idx++; }
    if (statut) { whereClause += ` AND c.statut = $${idx}`; params.push(statut); idx++; }
    if (priorite) { whereClause += ` AND c.priorite = $${idx}`; params.push(priorite); idx++; }
    if (affecte_a) { whereClause += ` AND c.affecte_a_id = $${idx}`; params.push(affecte_a); idx++; }
    if (search) {
      whereClause += ` AND (c.reference ILIKE $${idx} OR c.objet ILIKE $${idx})`;
      params.push(`%${search}%`); idx++;
    }

    // Filter by user's affectations if not admin
    if (req.user?.role === 'sg_ministere' && req.user?.institutionId) {
      whereClause += ` AND (c.destinataire_institution_id = $${idx} OR c.expediteur_institution_id = $${idx})`;
      params.push(req.user.institutionId); idx++;
    }

    const countResult = await query(`SELECT COUNT(*) FROM egop.courriers c ${whereClause}`, params);

    params.push(Number(limit), offset);
    const result = await query(`
      SELECT c.*,
             exp.nom as expediteur_institution_nom, exp.sigle as expediteur_institution_sigle,
             dest.nom as destinataire_institution_nom, dest.sigle as destinataire_institution_sigle,
             u.full_name as affecte_a_nom_complet
      FROM egop.courriers c
      LEFT JOIN institutions.institutions exp ON c.expediteur_institution_id = exp.id
      LEFT JOIN institutions.institutions dest ON c.destinataire_institution_id = dest.id
      LEFT JOIN auth.users u ON c.affecte_a_id = u.id
      ${whereClause}
      ORDER BY
        CASE c.priorite WHEN 'tres_urgente' THEN 1 WHEN 'urgente' THEN 2 WHEN 'haute' THEN 3 ELSE 4 END,
        c.date_reception DESC NULLS LAST
      LIMIT $${idx} OFFSET $${idx + 1}
    `, params);

    const total = parseInt(countResult.rows[0].count);

    res.json({
      success: true,
      data: result.rows,
      pagination: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / Number(limit)) },
    });
  } catch (error) {
    console.error('List courriers error:', error);
    res.status(500).json({ success: false, error: { code: 'FETCH_ERROR', message: 'Erreur' } });
  }
});

/**
 * GET /api/egop/courriers/:id
 * Get single courrier
 */
router.get('/courriers/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const result = await query(`
      SELECT c.*,
             exp.nom as expediteur_institution_nom,
             dest.nom as destinataire_institution_nom,
             u.full_name as affecte_a_nom_complet
      FROM egop.courriers c
      LEFT JOIN institutions.institutions exp ON c.expediteur_institution_id = exp.id
      LEFT JOIN institutions.institutions dest ON c.destinataire_institution_id = dest.id
      LEFT JOIN auth.users u ON c.affecte_a_id = u.id
      WHERE c.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Courrier non trouve' } });
    }

    const historyResult = await query(`
      SELECT h.*, u.full_name as acteur_nom_complet
      FROM egop.courrier_historique h
      LEFT JOIN auth.users u ON h.acteur_id = u.id
      WHERE h.courrier_id = $1
      ORDER BY h.created_at DESC
    `, [id]);

    res.json({
      success: true,
      data: {
        ...result.rows[0],
        historique: historyResult.rows,
      },
    });
  } catch (error) {
    console.error('Get courrier error:', error);
    res.status(500).json({ success: false, error: { code: 'FETCH_ERROR', message: 'Erreur' } });
  }
});

/**
 * POST /api/egop/courriers
 * Create courrier
 */
router.post('/courriers', requirePermission('egop', 'write'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const data = req.body;

    const result = await query(`
      INSERT INTO egop.courriers (
        type, objet, contenu, expediteur_institution_id, expediteur_nom, expediteur_fonction,
        destinataire_institution_id, destinataire_nom, destinataire_fonction,
        date_courrier, priorite, fichier_principal_url, pieces_jointes,
        confidentiel, mots_cles, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      RETURNING *
    `, [
      data.type, data.objet, data.contenu,
      data.expediteur_institution_id, data.expediteur_nom, data.expediteur_fonction,
      data.destinataire_institution_id, data.destinataire_nom, data.destinataire_fonction,
      data.date_courrier, data.priorite || 'normale',
      data.fichier_principal_url, JSON.stringify(data.pieces_jointes || []),
      data.confidentiel || false, data.mots_cles || [],
      req.user?.userId
    ]);

    // Add history
    await query(`
      INSERT INTO egop.courrier_historique (courrier_id, action, nouveau_statut, acteur_id)
      VALUES ($1, 'creation', 'recu', $2)
    `, [result.rows[0].id, req.user?.userId]);

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Create courrier error:', error);
    res.status(500).json({ success: false, error: { code: 'CREATE_ERROR', message: 'Erreur' } });
  }
});

/**
 * PATCH /api/egop/courriers/:id/status
 * Update courrier status
 */
router.patch('/courriers/:id/status', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { statut, commentaire } = req.body;

    const currentResult = await query('SELECT statut FROM egop.courriers WHERE id = $1', [id]);
    if (currentResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Courrier non trouve' } });
    }

    const ancien_statut = currentResult.rows[0].statut;

    let dateUpdate = '';
    if (statut === 'traite') dateUpdate = ', date_traitement = NOW()';
    if (statut === 'repondu') dateUpdate = ', date_reponse = NOW()';

    const result = await query(`
      UPDATE egop.courriers SET statut = $1, updated_at = NOW() ${dateUpdate}
      WHERE id = $2 RETURNING *
    `, [statut, id]);

    await query(`
      INSERT INTO egop.courrier_historique (courrier_id, action, ancien_statut, nouveau_statut, commentaire, acteur_id)
      VALUES ($1, 'changement_statut', $2, $3, $4, $5)
    `, [id, ancien_statut, statut, commentaire, req.user?.userId]);

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ success: false, error: { code: 'UPDATE_ERROR', message: 'Erreur' } });
  }
});

/**
 * PATCH /api/egop/courriers/:id/assign
 * Assign courrier to user
 */
router.patch('/courriers/:id/assign', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { user_id } = req.body;

    // Get user name
    const userResult = await query('SELECT full_name FROM auth.users WHERE id = $1', [user_id]);
    const userName = userResult.rows[0]?.full_name || '';

    const result = await query(`
      UPDATE egop.courriers
      SET affecte_a_id = $1, affecte_a_nom = $2, statut = 'en_traitement', updated_at = NOW()
      WHERE id = $3
      RETURNING *
    `, [user_id, userName, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Courrier non trouve' } });
    }

    await query(`
      INSERT INTO egop.courrier_historique (courrier_id, action, commentaire, acteur_id)
      VALUES ($1, 'affectation', $2, $3)
    `, [id, `Affecte a ${userName}`, req.user?.userId]);

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Assign courrier error:', error);
    res.status(500).json({ success: false, error: { code: 'UPDATE_ERROR', message: 'Erreur' } });
  }
});

/**
 * GET /api/egop/stats
 * Get e-GOP statistics
 */
router.get('/stats', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const cacheKey = 'egop:stats';
    let stats = await cacheGet<any>(cacheKey);

    if (!stats) {
      const conseilsResult = await query(`
        SELECT
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE statut = 'planifiee') as planifies,
          COUNT(*) FILTER (WHERE statut = 'terminee') as termines,
          COUNT(*) FILTER (WHERE date_conseil >= NOW()) as a_venir
        FROM egop.conseils
        WHERE created_at >= NOW() - INTERVAL '1 year'
      `);

      const reunionsResult = await query(`
        SELECT
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE statut = 'planifiee') as planifiees,
          COUNT(*) FILTER (WHERE statut = 'terminee') as terminees
        FROM egop.reunions
        WHERE created_at >= NOW() - INTERVAL '1 year'
      `);

      const courriersResult = await query(`
        SELECT
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE statut IN ('recu', 'enregistre')) as nouveaux,
          COUNT(*) FILTER (WHERE statut = 'en_traitement') as en_traitement,
          COUNT(*) FILTER (WHERE statut IN ('traite', 'repondu')) as traites,
          COUNT(*) FILTER (WHERE priorite IN ('urgente', 'tres_urgente')) as urgents
        FROM egop.courriers
        WHERE created_at >= NOW() - INTERVAL '30 days'
      `);

      stats = {
        conseils: conseilsResult.rows[0],
        reunions: reunionsResult.rows[0],
        courriers: courriersResult.rows[0],
      };

      await cacheSet(cacheKey, stats, 300);
    }

    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ success: false, error: { code: 'FETCH_ERROR', message: 'Erreur' } });
  }
});

export default router;
