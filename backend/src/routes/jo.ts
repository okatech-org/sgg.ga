/**
 * SGG Digital - Journal Officiel Routes
 * Open Data portal
 */

import { Router, Response } from 'express';
import { query } from '../config/database.js';
import { cacheGet, cacheSet, cacheDelete } from '../config/redis.js';
import { authenticate, optionalAuth, requirePermission, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

// =============================================================================
// PUBLIC ROUTES (no auth required for JO access)
// =============================================================================

/**
 * GET /api/jo/textes
 * List published texts (public)
 */
router.get('/textes', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { page = 1, limit = 20, type, annee, search, ministere_id, date_debut, date_fin } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const params: any[] = [];
    let whereClause = "WHERE t.statut = 'publie'";
    let idx = 1;

    if (type) { whereClause += ` AND t.type = $${idx}`; params.push(type); idx++; }
    if (annee) { whereClause += ` AND EXTRACT(YEAR FROM t.date_publication) = $${idx}`; params.push(Number(annee)); idx++; }
    if (ministere_id) { whereClause += ` AND t.institution_origine_id = $${idx}`; params.push(ministere_id); idx++; }
    if (date_debut) { whereClause += ` AND t.date_publication >= $${idx}`; params.push(date_debut); idx++; }
    if (date_fin) { whereClause += ` AND t.date_publication <= $${idx}`; params.push(date_fin); idx++; }
    if (search) {
      whereClause += ` AND (t.titre ILIKE $${idx} OR t.numero ILIKE $${idx} OR t.resume ILIKE $${idx})`;
      params.push(`%${search}%`); idx++;
    }

    const countResult = await query(`SELECT COUNT(*) FROM jo.textes t ${whereClause}`, params);

    params.push(Number(limit), offset);
    const result = await query(`
      SELECT t.id, t.numero, t.type, t.titre, t.titre_court, t.signataire, t.signataire_fonction,
             t.date_signature, t.date_publication, t.resume, t.fichier_url, t.nb_vues, t.nb_telechargements,
             n.numero as numero_jo, n.date_publication as date_jo,
             i.nom as institution_nom, i.sigle as institution_sigle
      FROM jo.textes t
      JOIN jo.numeros n ON t.numero_jo_id = n.id
      LEFT JOIN institutions.institutions i ON t.institution_origine_id = i.id
      ${whereClause}
      ORDER BY t.date_publication DESC
      LIMIT $${idx} OFFSET $${idx + 1}
    `, params);

    const total = parseInt(countResult.rows[0].count);

    res.json({
      success: true,
      data: result.rows,
      pagination: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / Number(limit)) },
    });
  } catch (error) {
    console.error('List JO textes error:', error);
    res.status(500).json({ success: false, error: { code: 'FETCH_ERROR', message: 'Erreur' } });
  }
});

/**
 * GET /api/jo/textes/search
 * Full-text search (public)
 */
router.get('/textes/search', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { q, page = 1, limit = 20 } = req.query;

    if (!q || String(q).length < 2) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_QUERY', message: 'La recherche doit contenir au moins 2 caracteres' },
      });
    }

    const offset = (Number(page) - 1) * Number(limit);
    const searchQuery = String(q).split(' ').join(' & ');

    const countResult = await query(`
      SELECT COUNT(*)
      FROM jo.textes t
      WHERE t.statut = 'publie' AND t.search_vector @@ to_tsquery('french', $1)
    `, [searchQuery]);

    const result = await query(`
      SELECT t.id, t.numero, t.type, t.titre, t.signataire, t.date_publication, t.resume, t.fichier_url,
             n.numero as numero_jo,
             ts_rank(t.search_vector, to_tsquery('french', $1)) as rank
      FROM jo.textes t
      JOIN jo.numeros n ON t.numero_jo_id = n.id
      WHERE t.statut = 'publie' AND t.search_vector @@ to_tsquery('french', $1)
      ORDER BY rank DESC, t.date_publication DESC
      LIMIT $2 OFFSET $3
    `, [searchQuery, Number(limit), offset]);

    const total = parseInt(countResult.rows[0].count);

    res.json({
      success: true,
      data: result.rows,
      pagination: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / Number(limit)) },
    });
  } catch (error) {
    console.error('Search JO error:', error);
    res.status(500).json({ success: false, error: { code: 'SEARCH_ERROR', message: 'Erreur' } });
  }
});

/**
 * GET /api/jo/textes/:id
 * Get single text (public)
 */
router.get('/textes/:id', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const result = await query(`
      SELECT t.*, n.numero as numero_jo, n.date_publication as date_jo, n.fichier_url as jo_fichier_url,
             i.nom as institution_nom, i.sigle as institution_sigle
      FROM jo.textes t
      JOIN jo.numeros n ON t.numero_jo_id = n.id
      LEFT JOIN institutions.institutions i ON t.institution_origine_id = i.id
      WHERE t.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Texte non trouve' } });
    }

    // Get articles
    const articlesResult = await query(`
      SELECT * FROM jo.articles WHERE texte_id = $1 ORDER BY ordre
    `, [id]);

    // Get annexes
    const annexesResult = await query(`
      SELECT * FROM jo.annexes WHERE texte_id = $1 ORDER BY ordre
    `, [id]);

    // Increment view count (async, don't wait)
    query('UPDATE jo.textes SET nb_vues = nb_vues + 1 WHERE id = $1', [id]).catch(() => { });

    res.json({
      success: true,
      data: {
        ...result.rows[0],
        articles: articlesResult.rows,
        annexes: annexesResult.rows,
      },
    });
  } catch (error) {
    console.error('Get JO texte error:', error);
    res.status(500).json({ success: false, error: { code: 'FETCH_ERROR', message: 'Erreur' } });
  }
});

/**
 * POST /api/jo/:id/view
 * Increment view count
 */
router.post('/textes/:id/view', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    await query('UPDATE jo.textes SET nb_vues = nb_vues + 1 WHERE id = $1', [id]);

    res.json({ success: true });
  } catch (error) {
    res.json({ success: true }); // Don't fail on view tracking
  }
});

/**
 * GET /api/jo/numeros
 * List JO numbers (public)
 */
router.get('/numeros', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { page = 1, limit = 20, annee, type } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const params: any[] = [];
    let whereClause = 'WHERE is_publie = true';
    let idx = 1;

    if (annee) { whereClause += ` AND annee = $${idx}`; params.push(Number(annee)); idx++; }
    if (type) { whereClause += ` AND type = $${idx}`; params.push(type); idx++; }

    const countResult = await query(`SELECT COUNT(*) FROM jo.numeros ${whereClause}`, params);

    params.push(Number(limit), offset);
    const result = await query(`
      SELECT * FROM jo.numeros
      ${whereClause}
      ORDER BY date_publication DESC
      LIMIT $${idx} OFFSET $${idx + 1}
    `, params);

    const total = parseInt(countResult.rows[0].count);

    res.json({
      success: true,
      data: result.rows,
      pagination: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / Number(limit)) },
    });
  } catch (error) {
    console.error('List JO numeros error:', error);
    res.status(500).json({ success: false, error: { code: 'FETCH_ERROR', message: 'Erreur' } });
  }
});

/**
 * GET /api/jo/numeros/:id
 * Get JO number with texts (public)
 */
router.get('/numeros/:id', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const result = await query(`SELECT * FROM jo.numeros WHERE id = $1`, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Numero non trouve' } });
    }

    const textesResult = await query(`
      SELECT id, numero, type, titre, signataire, page_debut, page_fin
      FROM jo.textes
      WHERE numero_jo_id = $1
      ORDER BY page_debut
    `, [id]);

    res.json({
      success: true,
      data: {
        ...result.rows[0],
        textes: textesResult.rows,
      },
    });
  } catch (error) {
    console.error('Get JO numero error:', error);
    res.status(500).json({ success: false, error: { code: 'FETCH_ERROR', message: 'Erreur' } });
  }
});

/**
 * GET /api/jo/stats
 * Get JO statistics (public)
 */
router.get('/stats', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const cacheKey = 'jo:stats';
    let stats = await cacheGet<any>(cacheKey);

    if (!stats) {
      const globalResult = await query(`
        SELECT
          COUNT(DISTINCT n.id) as total_numeros,
          COUNT(t.id) as total_textes,
          SUM(t.nb_vues) as total_vues,
          SUM(t.nb_telechargements) as total_telechargements
        FROM jo.numeros n
        LEFT JOIN jo.textes t ON n.id = t.numero_jo_id
        WHERE n.is_publie = true
      `);

      const byTypeResult = await query(`
        SELECT type, COUNT(*) as count
        FROM jo.textes
        WHERE statut = 'publie'
        GROUP BY type
        ORDER BY count DESC
      `);

      const byYearResult = await query(`
        SELECT EXTRACT(YEAR FROM date_publication) as annee, COUNT(*) as count
        FROM jo.textes
        WHERE statut = 'publie'
        GROUP BY EXTRACT(YEAR FROM date_publication)
        ORDER BY annee DESC
        LIMIT 10
      `);

      const popularResult = await query(`
        SELECT id, numero, titre, type, nb_vues, nb_telechargements
        FROM jo.textes
        WHERE statut = 'publie'
        ORDER BY nb_vues DESC
        LIMIT 10
      `);

      const recentResult = await query(`
        SELECT t.id, t.numero, t.titre, t.type, t.date_publication, n.numero as numero_jo
        FROM jo.textes t
        JOIN jo.numeros n ON t.numero_jo_id = n.id
        WHERE t.statut = 'publie'
        ORDER BY t.date_publication DESC
        LIMIT 10
      `);

      stats = {
        global: globalResult.rows[0],
        par_type: byTypeResult.rows,
        par_annee: byYearResult.rows,
        populaires: popularResult.rows,
        recents: recentResult.rows,
      };

      await cacheSet(cacheKey, stats, 600);
    }

    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('Get JO stats error:', error);
    res.status(500).json({ success: false, error: { code: 'FETCH_ERROR', message: 'Erreur' } });
  }
});

/**
 * GET /api/jo/popular
 * Get popular texts (public)
 */
router.get('/popular', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { limit = 10 } = req.query;

    const cacheKey = `jo:popular:${limit}`;
    let popular = await cacheGet<any[]>(cacheKey);

    if (!popular) {
      const result = await query(`
        SELECT t.id, t.numero, t.titre, t.type, t.date_publication, t.resume,
               t.nb_vues, t.nb_telechargements, t.fichier_url,
               n.numero as numero_jo
        FROM jo.textes t
        JOIN jo.numeros n ON t.numero_jo_id = n.id
        WHERE t.statut = 'publie'
        ORDER BY t.nb_vues DESC, t.nb_telechargements DESC
        LIMIT $1
      `, [Number(limit)]);

      popular = result.rows;
      await cacheSet(cacheKey, popular, 600);
    }

    res.json({ success: true, data: popular });
  } catch (error) {
    console.error('Get popular error:', error);
    res.status(500).json({ success: false, error: { code: 'FETCH_ERROR', message: 'Erreur' } });
  }
});

// =============================================================================
// PROTECTED ROUTES (DGJO role required)
// =============================================================================

/**
 * POST /api/jo/numeros
 * Create JO number (DGJO only)
 */
router.post('/numeros', authenticate, requirePermission('jo', 'write'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const data = req.body;

    const result = await query(`
      INSERT INTO jo.numeros (numero, annee, numero_ordre, type, titre, date_publication, fichier_url)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [data.numero, data.annee, data.numero_ordre, data.type || 'ordinaire', data.titre, data.date_publication, data.fichier_url]);

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Create JO numero error:', error);
    res.status(500).json({ success: false, error: { code: 'CREATE_ERROR', message: 'Erreur' } });
  }
});

/**
 * POST /api/jo/textes
 * Create JO text (DGJO only)
 */
router.post('/textes', authenticate, requirePermission('jo', 'write'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const data = req.body;

    const result = await query(`
      INSERT INTO jo.textes (
        numero_jo_id, numero, type, titre, titre_court, signataire, signataire_fonction,
        institution_origine_id, date_signature, date_publication, date_entree_vigueur,
        page_debut, page_fin, visa, considerants, dispositif, resume, fichier_url,
        mots_cles, texte_legislatif_id, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
      RETURNING *
    `, [
      data.numero_jo_id, data.numero, data.type, data.titre, data.titre_court,
      data.signataire, data.signataire_fonction, data.institution_origine_id,
      data.date_signature, data.date_publication, data.date_entree_vigueur,
      data.page_debut, data.page_fin, data.visa, data.considerants, data.dispositif,
      data.resume, data.fichier_url, data.mots_cles || [], data.texte_legislatif_id,
      req.user?.userId
    ]);

    // Update numero nb_textes
    await query(`
      UPDATE jo.numeros SET nb_textes = (SELECT COUNT(*) FROM jo.textes WHERE numero_jo_id = $1)
      WHERE id = $1
    `, [data.numero_jo_id]);

    await cacheDelete('jo:stats');

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Create JO texte error:', error);
    res.status(500).json({ success: false, error: { code: 'CREATE_ERROR', message: 'Erreur' } });
  }
});

/**
 * PATCH /api/jo/numeros/:id/publish
 * Publish JO number (DGJO only)
 */
router.patch('/numeros/:id/publish', authenticate, requirePermission('jo', 'publish'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const result = await query(`
      UPDATE jo.numeros
      SET is_publie = true, date_parution_effective = NOW(), publie_par = $1
      WHERE id = $2
      RETURNING *
    `, [req.user?.userId, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Numero non trouve' } });
    }

    // Update all texts status
    await query(`UPDATE jo.textes SET statut = 'publie' WHERE numero_jo_id = $1`, [id]);

    await cacheDelete('jo:stats');

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Publish JO error:', error);
    res.status(500).json({ success: false, error: { code: 'PUBLISH_ERROR', message: 'Erreur' } });
  }
});

// =============================================================================
// SUBSCRIPTIONS
// =============================================================================

/**
 * POST /api/jo/abonnements
 * Create subscription (public)
 */
router.post('/abonnements', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { email, nom, types_textes, mots_cles, frequence } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: { code: 'MISSING_EMAIL', message: 'Email requis' },
      });
    }

    // Generate unsubscribe token
    const token = require('crypto').randomBytes(32).toString('hex');

    const result = await query(`
      INSERT INTO jo.abonnements (email, nom, types_textes, mots_cles, frequence, token_desinscription)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (email) DO UPDATE SET
        nom = EXCLUDED.nom,
        types_textes = EXCLUDED.types_textes,
        mots_cles = EXCLUDED.mots_cles,
        frequence = EXCLUDED.frequence,
        is_active = true
      RETURNING id
    `, [email, nom, types_textes || [], mots_cles || [], frequence || 'immediat', token]);

    res.status(201).json({
      success: true,
      data: { message: 'Abonnement cree avec succes' },
    });
  } catch (error) {
    console.error('Create abonnement error:', error);
    res.status(500).json({ success: false, error: { code: 'CREATE_ERROR', message: 'Erreur' } });
  }
});

/**
 * DELETE /api/jo/abonnements/:token
 * Unsubscribe (public)
 */
router.delete('/abonnements/:token', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { token } = req.params;

    const result = await query(`
      UPDATE jo.abonnements SET is_active = false WHERE token_desinscription = $1 RETURNING id
    `, [token]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Abonnement non trouve' },
      });
    }

    res.json({ success: true, data: { message: 'Desinscription effectuee' } });
  } catch (error) {
    console.error('Unsubscribe error:', error);
    res.status(500).json({ success: false, error: { code: 'DELETE_ERROR', message: 'Erreur' } });
  }
});

export default router;
