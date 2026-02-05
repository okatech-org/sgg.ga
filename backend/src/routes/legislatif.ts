/**
 * SGG Digital - Legislatif Routes
 * Cycle legislatif en 8 etapes
 */

import { Router, Response } from 'express';
import { query } from '../config/database.js';
import { cacheGet, cacheSet, cacheDelete } from '../config/redis.js';
import { authenticate, requirePermission, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

/**
 * GET /api/legislatif/textes
 * List legislative texts
 */
router.get('/textes', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { page = 1, limit = 20, type, statut, ministere_id, etape, is_urgence, search } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const params: any[] = [];
    let whereClause = 'WHERE 1=1';
    let idx = 1;

    if (type) { whereClause += ` AND t.type = $${idx}`; params.push(type); idx++; }
    if (statut) { whereClause += ` AND t.statut = $${idx}`; params.push(statut); idx++; }
    if (ministere_id) { whereClause += ` AND t.ministere_origine_id = $${idx}`; params.push(ministere_id); idx++; }
    if (etape) { whereClause += ` AND t.etape_actuelle = $${idx}`; params.push(Number(etape)); idx++; }
    if (is_urgence === 'true') { whereClause += ` AND t.is_urgence = true`; }
    if (search) {
      whereClause += ` AND (t.reference ILIKE $${idx} OR t.titre ILIKE $${idx})`;
      params.push(`%${search}%`); idx++;
    }

    const countResult = await query(`SELECT COUNT(*) FROM legislatif.textes t ${whereClause}`, params);

    params.push(Number(limit), offset);
    const result = await query(`
      SELECT t.*, i.nom as ministere_nom, i.sigle as ministere_sigle,
             CASE
               WHEN t.statut = 'publie_jo' THEN 100
               WHEN t.statut IN ('transmission_jo', 'signature_promulgation') THEN 90
               WHEN t.statut IN ('decision_cc', 'examen_cc', 'saisine_cc') THEN 80
               WHEN t.statut IN ('vote_definitif', 'cmp', 'vote_senat', 'vote_an') THEN 70
               WHEN t.statut IN ('commission_senat', 'depot_senat', 'commission_an', 'depot_an') THEN 60
               WHEN t.statut IN ('adopte_cm', 'inscription_cm') THEN 50
               WHEN t.statut IN ('avis_ce_recu', 'examen_ce', 'transmission_ce') THEN 35
               WHEN t.statut IN ('validation_sgg', 'examen_sgg') THEN 20
               WHEN t.statut = 'soumis' THEN 10
               ELSE 5
             END AS pourcentage_progression
      FROM legislatif.textes t
      JOIN institutions.institutions i ON t.ministere_origine_id = i.id
      ${whereClause}
      ORDER BY t.is_urgence DESC, t.created_at DESC
      LIMIT $${idx} OFFSET $${idx + 1}
    `, params);

    const total = parseInt(countResult.rows[0].count);

    res.json({
      success: true,
      data: result.rows,
      pagination: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / Number(limit)) },
    });
  } catch (error) {
    console.error('List textes error:', error);
    res.status(500).json({ success: false, error: { code: 'FETCH_ERROR', message: 'Erreur' } });
  }
});

/**
 * GET /api/legislatif/dashboard
 * Get legislative dashboard
 */
router.get('/dashboard', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const cacheKey = 'legislatif:dashboard';
    let dashboard = await cacheGet<any>(cacheKey);

    if (!dashboard) {
      // Stats by stage
      const stageResult = await query(`
        SELECT etape_actuelle, COUNT(*) as count
        FROM legislatif.textes
        WHERE statut NOT IN ('publie_jo', 'rejete', 'retire', 'caduc')
        GROUP BY etape_actuelle
        ORDER BY etape_actuelle
      `);

      // Stats by type
      const typeResult = await query(`
        SELECT type, COUNT(*) as count,
               COUNT(*) FILTER (WHERE statut = 'publie_jo') as publies
        FROM legislatif.textes
        WHERE created_at >= NOW() - INTERVAL '1 year'
        GROUP BY type
      `);

      // Urgent texts
      const urgentResult = await query(`
        SELECT t.*, i.nom as ministere_nom
        FROM legislatif.textes t
        JOIN institutions.institutions i ON t.ministere_origine_id = i.id
        WHERE t.is_urgence = true AND t.statut NOT IN ('publie_jo', 'rejete', 'retire', 'caduc')
        ORDER BY t.created_at
        LIMIT 10
      `);

      // Recent activity
      const recentResult = await query(`
        SELECT t.id, t.reference, t.titre, t.type, t.statut, t.etape_actuelle, t.updated_at
        FROM legislatif.textes t
        ORDER BY t.updated_at DESC
        LIMIT 10
      `);

      // Global stats
      const globalResult = await query(`
        SELECT
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE statut = 'publie_jo') as publies,
          COUNT(*) FILTER (WHERE statut NOT IN ('publie_jo', 'rejete', 'retire', 'caduc')) as en_cours,
          COUNT(*) FILTER (WHERE is_urgence = true) as urgents,
          AVG(CASE WHEN date_publication_jo IS NOT NULL THEN
            EXTRACT(DAY FROM date_publication_jo::timestamp - date_depot)
          END) as delai_moyen
        FROM legislatif.textes
        WHERE created_at >= NOW() - INTERVAL '1 year'
      `);

      dashboard = {
        par_etape: stageResult.rows,
        par_type: typeResult.rows,
        urgents: urgentResult.rows,
        recents: recentResult.rows,
        global: globalResult.rows[0],
        etapes: [
          { numero: 1, nom: 'Soumission' },
          { numero: 2, nom: 'Examen SGG' },
          { numero: 3, nom: "Conseil d'Etat" },
          { numero: 4, nom: 'Conseil des Ministres' },
          { numero: 5, nom: 'Parlement' },
          { numero: 6, nom: 'Cour Constitutionnelle' },
          { numero: 7, nom: 'Promulgation' },
          { numero: 8, nom: 'Publication JO' },
        ],
      };

      await cacheSet(cacheKey, dashboard, 300);
    }

    res.json({ success: true, data: dashboard });
  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({ success: false, error: { code: 'FETCH_ERROR', message: 'Erreur' } });
  }
});

/**
 * GET /api/legislatif/textes/:id
 * Get single text with full details
 */
router.get('/textes/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const result = await query(`
      SELECT t.*, i.nom as ministere_nom, i.sigle as ministere_sigle
      FROM legislatif.textes t
      JOIN institutions.institutions i ON t.ministere_origine_id = i.id
      WHERE t.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Texte non trouve' } });
    }

    // Get versions
    const versionsResult = await query(`
      SELECT * FROM legislatif.versions WHERE texte_id = $1 ORDER BY numero_version DESC
    `, [id]);

    // Get avis
    const avisResult = await query(`
      SELECT a.*, i.nom as institution_nom
      FROM legislatif.avis a
      JOIN institutions.institutions i ON a.institution_id = i.id
      WHERE a.texte_id = $1
      ORDER BY a.date_saisine DESC
    `, [id]);

    // Get history
    const historyResult = await query(`
      SELECT h.*, u.full_name as acteur_nom_complet, i.nom as institution_nom
      FROM legislatif.historique h
      LEFT JOIN auth.users u ON h.acteur_id = u.id
      LEFT JOIN institutions.institutions i ON h.institution_id = i.id
      WHERE h.texte_id = $1
      ORDER BY h.created_at DESC
    `, [id]);

    // Get amendments
    const amendementsResult = await query(`
      SELECT * FROM legislatif.amendements WHERE texte_id = $1 ORDER BY numero
    `, [id]);

    res.json({
      success: true,
      data: {
        ...result.rows[0],
        versions: versionsResult.rows,
        avis: avisResult.rows,
        historique: historyResult.rows,
        amendements: amendementsResult.rows,
      },
    });
  } catch (error) {
    console.error('Get texte error:', error);
    res.status(500).json({ success: false, error: { code: 'FETCH_ERROR', message: 'Erreur' } });
  }
});

/**
 * POST /api/legislatif/textes
 * Create new text
 */
router.post('/textes', requirePermission('legislatif', 'write'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const data = req.body;

    const result = await query(`
      INSERT INTO legislatif.textes (
        titre, titre_court, type, ministere_origine_id, is_urgence, is_loi_finances,
        objet, expose_motifs, resume, fichier_projet_url, fichier_expose_url,
        mots_cles, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *
    `, [
      data.titre, data.titre_court, data.type, data.ministere_origine_id,
      data.is_urgence || false, data.is_loi_finances || false,
      data.objet, data.expose_motifs, data.resume,
      data.fichier_projet_url, data.fichier_expose_url,
      data.mots_cles || [], req.user?.userId
    ]);

    // Create first version
    await query(`
      INSERT INTO legislatif.versions (texte_id, numero_version, titre, fichier_url, created_by)
      VALUES ($1, 1, $2, $3, $4)
    `, [result.rows[0].id, data.titre, data.fichier_projet_url, req.user?.userId]);

    // Add history
    await query(`
      INSERT INTO legislatif.historique (texte_id, etape, action, nouveau_statut, acteur_id)
      VALUES ($1, 1, 'creation', 'redaction', $2)
    `, [result.rows[0].id, req.user?.userId]);

    await cacheDelete('legislatif:dashboard');

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Create texte error:', error);
    res.status(500).json({ success: false, error: { code: 'CREATE_ERROR', message: 'Erreur' } });
  }
});

/**
 * PATCH /api/legislatif/textes/:id/status
 * Update text status (advance in cycle)
 */
router.patch('/textes/:id/status', requirePermission('legislatif', 'approve'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { statut, etape, commentaire } = req.body;

    const currentResult = await query('SELECT statut, etape_actuelle FROM legislatif.textes WHERE id = $1', [id]);
    if (currentResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Texte non trouve' } });
    }

    const ancien_statut = currentResult.rows[0].statut;
    const nouvelle_etape = etape || currentResult.rows[0].etape_actuelle;

    // Build date update based on status
    const dateFields: Record<string, string> = {
      'soumis': 'date_depot',
      'examen_sgg': 'date_reception_sgg',
      'validation_sgg': 'date_validation_sgg',
      'transmission_ce': 'date_saisine_ce',
      'avis_ce_recu': 'date_avis_ce',
      'inscription_cm': 'date_inscription_cm',
      'adopte_cm': 'date_adoption_cm',
      'depot_an': 'date_depot_an',
      'vote_an': 'date_vote_an',
      'depot_senat': 'date_depot_senat',
      'vote_senat': 'date_vote_senat',
      'vote_definitif': 'date_vote_definitif',
      'saisine_cc': 'date_saisine_cc',
      'decision_cc': 'date_decision_cc',
      'transmission_presidence': 'date_transmission_presidence',
      'signature_promulgation': 'date_promulgation',
      'transmission_jo': 'date_transmission_jo',
      'publie_jo': 'date_publication_jo',
    };

    let dateUpdate = '';
    if (dateFields[statut]) {
      dateUpdate = `, ${dateFields[statut]} = NOW()`;
    }

    const result = await query(`
      UPDATE legislatif.textes
      SET statut = $1, etape_actuelle = $2, updated_by = $3, updated_at = NOW() ${dateUpdate}
      WHERE id = $4
      RETURNING *
    `, [statut, nouvelle_etape, req.user?.userId, id]);

    // Add history
    await query(`
      INSERT INTO legislatif.historique (texte_id, etape, action, ancien_statut, nouveau_statut, commentaire, acteur_id)
      VALUES ($1, $2, 'changement_statut', $3, $4, $5, $6)
    `, [id, nouvelle_etape, ancien_statut, statut, commentaire, req.user?.userId]);

    await cacheDelete('legislatif:dashboard');

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ success: false, error: { code: 'UPDATE_ERROR', message: 'Erreur' } });
  }
});

/**
 * POST /api/legislatif/textes/:id/avis
 * Add avis (CE or CC)
 */
router.post('/textes/:id/avis', requirePermission('legislatif', 'write'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const result = await query(`
      INSERT INTO legislatif.avis (
        texte_id, institution_id, type_avis, nature, numero_avis,
        date_saisine, date_reponse, resume, recommandations, reserves, fichier_url
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `, [
      id, data.institution_id, data.type_avis, data.nature, data.numero_avis,
      data.date_saisine, data.date_reponse, data.resume, data.recommandations,
      data.reserves, data.fichier_url
    ]);

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Create avis error:', error);
    res.status(500).json({ success: false, error: { code: 'CREATE_ERROR', message: 'Erreur' } });
  }
});

/**
 * GET /api/legislatif/textes/:id/versions
 * Get text versions
 */
router.get('/textes/:id/versions', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const result = await query(`
      SELECT v.*, u.full_name as created_by_name
      FROM legislatif.versions v
      LEFT JOIN auth.users u ON v.created_by = u.id
      WHERE v.texte_id = $1
      ORDER BY v.numero_version DESC
    `, [id]);

    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Get versions error:', error);
    res.status(500).json({ success: false, error: { code: 'FETCH_ERROR', message: 'Erreur' } });
  }
});

/**
 * GET /api/legislatif/textes/:id/avis
 * Get text avis
 */
router.get('/textes/:id/avis', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const result = await query(`
      SELECT a.*, i.nom as institution_nom, i.sigle as institution_sigle
      FROM legislatif.avis a
      JOIN institutions.institutions i ON a.institution_id = i.id
      WHERE a.texte_id = $1
      ORDER BY a.date_saisine DESC
    `, [id]);

    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Get avis error:', error);
    res.status(500).json({ success: false, error: { code: 'FETCH_ERROR', message: 'Erreur' } });
  }
});

export default router;
