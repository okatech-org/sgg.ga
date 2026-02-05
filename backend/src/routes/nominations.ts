/**
 * SGG Digital - Nominations Routes
 */

import { Router, Response } from 'express';
import { query } from '../config/database.js';
import { cacheGet, cacheSet, cacheDelete } from '../config/redis.js';
import { authenticate, requirePermission, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

/**
 * GET /api/nominations
 * List nomination dossiers
 */
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { page = 1, limit = 20, statut, ministere_id, type, search, is_urgent } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const params: any[] = [];
    let whereClause = 'WHERE 1=1';
    let paramIndex = 1;

    if (statut) {
      whereClause += ` AND d.statut = $${paramIndex}`;
      params.push(statut);
      paramIndex++;
    }

    if (ministere_id) {
      whereClause += ` AND d.ministere_proposant_id = $${paramIndex}`;
      params.push(ministere_id);
      paramIndex++;
    }

    if (type) {
      whereClause += ` AND d.type = $${paramIndex}`;
      params.push(type);
      paramIndex++;
    }

    if (is_urgent === 'true') {
      whereClause += ` AND d.is_urgent = true`;
    }

    if (search) {
      whereClause += ` AND (d.reference ILIKE $${paramIndex} OR c.nom ILIKE $${paramIndex} OR c.prenom ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    // Filter by user's institution if not admin
    if (req.user?.role === 'sg_ministere' && req.user?.institutionId) {
      whereClause += ` AND d.ministere_proposant_id = $${paramIndex}`;
      params.push(req.user.institutionId);
      paramIndex++;
    }

    const countResult = await query(`
      SELECT COUNT(*) FROM nominations.dossiers d
      JOIN nominations.candidats c ON d.candidat_id = c.id
      ${whereClause}
    `, params);

    params.push(Number(limit), offset);
    const result = await query(`
      SELECT d.*, c.nom as candidat_nom, c.prenom as candidat_prenom, c.matricule as candidat_matricule,
             p.titre as poste_titre, p.categorie as poste_categorie,
             i.nom as ministere_nom, i.sigle as ministere_sigle
      FROM nominations.dossiers d
      JOIN nominations.candidats c ON d.candidat_id = c.id
      JOIN nominations.postes p ON d.poste_id = p.id
      JOIN institutions.institutions i ON d.ministere_proposant_id = i.id
      ${whereClause}
      ORDER BY d.is_urgent DESC, d.date_soumission DESC NULLS LAST, d.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `, params);

    const total = parseInt(countResult.rows[0].count);

    res.json({
      success: true,
      data: result.rows,
      pagination: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / Number(limit)) },
    });
  } catch (error) {
    console.error('List nominations error:', error);
    res.status(500).json({ success: false, error: { code: 'FETCH_ERROR', message: 'Erreur' } });
  }
});

/**
 * GET /api/nominations/stats
 * Get nomination statistics
 */
router.get('/stats', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { annee = new Date().getFullYear() } = req.query;

    const cacheKey = `nominations:stats:${annee}`;
    let stats = await cacheGet<any>(cacheKey);

    if (!stats) {
      const result = await query(`
        SELECT
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE statut = 'brouillon') as brouillon,
          COUNT(*) FILTER (WHERE statut = 'soumis') as soumis,
          COUNT(*) FILTER (WHERE statut IN ('recevabilite', 'examen_sgg')) as en_examen,
          COUNT(*) FILTER (WHERE statut IN ('avis_favorable', 'transmis_sgpr')) as transmis,
          COUNT(*) FILTER (WHERE statut IN ('valide_cm', 'signe', 'publie_jo')) as valides,
          COUNT(*) FILTER (WHERE statut = 'rejete') as rejetes,
          COUNT(*) FILTER (WHERE is_urgent = true) as urgents,
          AVG(CASE WHEN date_publication_jo IS NOT NULL THEN
            EXTRACT(DAY FROM date_publication_jo::timestamp - date_soumission)
          END) as delai_moyen
        FROM nominations.dossiers
        WHERE EXTRACT(YEAR FROM created_at) = $1
      `, [annee]);

      const byMinistereResult = await query(`
        SELECT i.id, i.nom, i.sigle, COUNT(d.id) as nb_nominations,
               COUNT(*) FILTER (WHERE d.statut IN ('valide_cm', 'signe', 'publie_jo')) as valides
        FROM institutions.institutions i
        LEFT JOIN nominations.dossiers d ON i.id = d.ministere_proposant_id
          AND EXTRACT(YEAR FROM d.created_at) = $1
        WHERE i.type = 'ministere' AND i.is_active = true
        GROUP BY i.id, i.nom, i.sigle
        ORDER BY nb_nominations DESC
      `, [annee]);

      stats = {
        global: result.rows[0],
        par_ministere: byMinistereResult.rows,
        annee: Number(annee),
      };

      await cacheSet(cacheKey, stats, 300);
    }

    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ success: false, error: { code: 'FETCH_ERROR', message: 'Erreur' } });
  }
});

/**
 * GET /api/nominations/:id
 * Get single nomination dossier
 */
router.get('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const result = await query(`
      SELECT d.*, c.*, p.titre as poste_titre, p.categorie as poste_categorie, p.grade as poste_grade,
             i_poste.nom as poste_institution_nom,
             i_ministere.nom as ministere_nom, i_ministere.sigle as ministere_sigle
      FROM nominations.dossiers d
      JOIN nominations.candidats c ON d.candidat_id = c.id
      JOIN nominations.postes p ON d.poste_id = p.id
      JOIN institutions.institutions i_poste ON p.institution_id = i_poste.id
      JOIN institutions.institutions i_ministere ON d.ministere_proposant_id = i_ministere.id
      WHERE d.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Dossier non trouve' } });
    }

    // Get documents
    const docsResult = await query(`SELECT * FROM nominations.documents WHERE dossier_id = $1 ORDER BY type`, [id]);

    // Get history
    const historyResult = await query(`
      SELECT h.*, u.full_name as acteur_nom_complet
      FROM nominations.historique h
      LEFT JOIN auth.users u ON h.acteur_id = u.id
      WHERE h.dossier_id = $1
      ORDER BY h.created_at DESC
    `, [id]);

    res.json({
      success: true,
      data: {
        ...result.rows[0],
        documents: docsResult.rows,
        historique: historyResult.rows,
      },
    });
  } catch (error) {
    console.error('Get nomination error:', error);
    res.status(500).json({ success: false, error: { code: 'FETCH_ERROR', message: 'Erreur' } });
  }
});

/**
 * POST /api/nominations
 * Create nomination dossier
 */
router.post('/', requirePermission('nominations', 'write'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { candidat, poste_id, ministere_proposant_id, type, motif_proposition, is_urgent } = req.body;

    // Create or find candidat
    let candidat_id;
    if (candidat.id) {
      candidat_id = candidat.id;
    } else {
      const candidatResult = await query(`
        INSERT INTO nominations.candidats (nom, prenom, date_naissance, lieu_naissance, sexe, email, telephone,
          corps, grade_actuel, diplome_plus_eleve, photo_url, cv_url, created_by)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING id
      `, [candidat.nom, candidat.prenom, candidat.date_naissance, candidat.lieu_naissance,
          candidat.sexe, candidat.email, candidat.telephone, candidat.corps, candidat.grade_actuel,
          candidat.diplome_plus_eleve, candidat.photo_url, candidat.cv_url, req.user?.userId]);
      candidat_id = candidatResult.rows[0].id;
    }

    // Create dossier
    const result = await query(`
      INSERT INTO nominations.dossiers (candidat_id, poste_id, ministere_proposant_id, type,
        motif_proposition, is_urgent, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [candidat_id, poste_id, ministere_proposant_id, type || 'premiere_nomination',
        motif_proposition, is_urgent || false, req.user?.userId]);

    // Add history entry
    await query(`
      INSERT INTO nominations.historique (dossier_id, action, nouveau_statut, acteur_id, acteur_role)
      VALUES ($1, 'creation', 'brouillon', $2, $3)
    `, [result.rows[0].id, req.user?.userId, req.user?.role]);

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Create nomination error:', error);
    res.status(500).json({ success: false, error: { code: 'CREATE_ERROR', message: 'Erreur' } });
  }
});

/**
 * PATCH /api/nominations/:id/status
 * Update nomination status
 */
router.patch('/:id/status', requirePermission('nominations', 'approve'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { statut, commentaire, score_adequation, avis_sgg, recommandation_sgg, motif_rejet } = req.body;

    // Get current status
    const currentResult = await query('SELECT statut FROM nominations.dossiers WHERE id = $1', [id]);
    if (currentResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Dossier non trouve' } });
    }

    const ancien_statut = currentResult.rows[0].statut;

    // Update dossier
    const updates: string[] = ['statut = $1', 'updated_by = $2'];
    const values: any[] = [statut, req.user?.userId];
    let idx = 3;

    if (score_adequation !== undefined) { updates.push(`score_adequation = $${idx}`); values.push(score_adequation); idx++; }
    if (avis_sgg !== undefined) { updates.push(`avis_sgg = $${idx}`); values.push(avis_sgg); idx++; }
    if (recommandation_sgg !== undefined) { updates.push(`recommandation_sgg = $${idx}`); values.push(recommandation_sgg); idx++; }
    if (motif_rejet !== undefined) { updates.push(`motif_rejet = $${idx}`); values.push(motif_rejet); idx++; }

    // Add date based on status
    const dateField = {
      'soumis': 'date_soumission',
      'recevabilite': 'date_recevabilite',
      'examen_sgg': 'date_examen_sgg',
      'transmis_sgpr': 'date_transmission_sgpr',
    }[statut];
    if (dateField) {
      updates.push(`${dateField} = NOW()`);
    }

    values.push(id);
    const result = await query(`
      UPDATE nominations.dossiers SET ${updates.join(', ')}, updated_at = NOW()
      WHERE id = $${idx}
      RETURNING *
    `, values);

    // Add history entry
    await query(`
      INSERT INTO nominations.historique (dossier_id, action, ancien_statut, nouveau_statut, commentaire, acteur_id, acteur_role)
      VALUES ($1, 'changement_statut', $2, $3, $4, $5, $6)
    `, [id, ancien_statut, statut, commentaire, req.user?.userId, req.user?.role]);

    await cacheDelete(`nominations:stats:${new Date().getFullYear()}`);

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ success: false, error: { code: 'UPDATE_ERROR', message: 'Erreur' } });
  }
});

/**
 * GET /api/nominations/:id/history
 * Get nomination history
 */
router.get('/:id/history', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const result = await query(`
      SELECT h.*, u.full_name as acteur_nom_complet
      FROM nominations.historique h
      LEFT JOIN auth.users u ON h.acteur_id = u.id
      WHERE h.dossier_id = $1
      ORDER BY h.created_at DESC
    `, [id]);

    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({ success: false, error: { code: 'FETCH_ERROR', message: 'Erreur' } });
  }
});

/**
 * GET /api/nominations/postes
 * List available positions
 */
router.get('/postes/list', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { institution_id, categorie, is_vacant } = req.query;

    const params: any[] = [];
    let whereClause = 'WHERE p.is_active = true';
    let idx = 1;

    if (institution_id) {
      whereClause += ` AND p.institution_id = $${idx}`;
      params.push(institution_id);
      idx++;
    }

    if (categorie) {
      whereClause += ` AND p.categorie = $${idx}`;
      params.push(categorie);
      idx++;
    }

    if (is_vacant !== undefined) {
      whereClause += ` AND p.is_vacant = $${idx}`;
      params.push(is_vacant === 'true');
      idx++;
    }

    const result = await query(`
      SELECT p.*, i.nom as institution_nom, i.sigle as institution_sigle
      FROM nominations.postes p
      JOIN institutions.institutions i ON p.institution_id = i.id
      ${whereClause}
      ORDER BY p.categorie, p.titre
    `, params);

    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('List postes error:', error);
    res.status(500).json({ success: false, error: { code: 'FETCH_ERROR', message: 'Erreur' } });
  }
});

export default router;
