/**
 * SGG Digital - PTM (Programme de Travail du Ministère) Routes
 * CRUD + validation workflow pour les initiatives PTM/PTG
 */

import { Router, Response } from 'express';
import { query } from '../config/database.js';
import { cacheGet, cacheSet, cacheDelete } from '../config/redis.js';
import {
    authenticate,
    requirePermission,
    AuthenticatedRequest,
} from '../middleware/auth.js';

const router = Router();

// All PTM routes require authentication
router.use(authenticate);

// ============================================================================
// GET /api/ptm/stats
// Statistiques globales PTM
// ============================================================================

router.get('/stats', async (req: AuthenticatedRequest, res: Response) => {
    try {
        const annee = Number(req.query.annee) || new Date().getFullYear();

        const cacheKey = `ptm:stats:${annee}`;
        let stats = await cacheGet<any>(cacheKey);

        if (!stats) {
            const result = await query(`
        SELECT
          COUNT(*) as total_initiatives,
          COUNT(CASE WHEN rubrique = 'projet_texte_legislatif' THEN 1 END) as projet_texte_legislatif,
          COUNT(CASE WHEN rubrique = 'politique_generale' THEN 1 END) as politique_generale,
          COUNT(CASE WHEN rubrique = 'missions_conferences' THEN 1 END) as missions_conferences,
          COUNT(CASE WHEN statut = 'brouillon' THEN 1 END) as brouillon,
          COUNT(CASE WHEN statut = 'soumis_sgg' THEN 1 END) as soumis_sgg,
          COUNT(CASE WHEN statut = 'valide_sgg' THEN 1 END) as valide_sgg,
          COUNT(CASE WHEN statut = 'inscrit_ptg' THEN 1 END) as inscrit_ptg,
          COUNT(CASE WHEN statut = 'rejete' THEN 1 END) as rejete,
          COUNT(CASE WHEN incidence_financiere = TRUE THEN 1 END) as avec_incidence_financiere,
          COUNT(CASE WHEN loi_finance = TRUE THEN 1 END) as avec_loi_finance
        FROM ptm.initiatives
        WHERE annee = $1
      `, [annee]);

            const row = result.rows[0];
            const total = Number(row.total_initiatives);

            stats = {
                totalInitiatives: total,
                parRubrique: {
                    projet_texte_legislatif: Number(row.projet_texte_legislatif),
                    politique_generale: Number(row.politique_generale),
                    missions_conferences: Number(row.missions_conferences),
                },
                parStatut: {
                    brouillon: Number(row.brouillon),
                    soumis_sgg: Number(row.soumis_sgg),
                    valide_sgg: Number(row.valide_sgg),
                    inscrit_ptg: Number(row.inscrit_ptg),
                    rejete: Number(row.rejete),
                },
                tauxInscriptionPTG: total > 0
                    ? Math.round((Number(row.inscrit_ptg) / total) * 100 * 10) / 10
                    : 0,
                avecIncidenceFinanciere: Number(row.avec_incidence_financiere),
                avecLoiFinance: Number(row.avec_loi_finance),
                annee,
            };

            await cacheSet(cacheKey, stats, 300);
        }

        res.json({ success: true, data: stats });
    } catch (error) {
        console.error('Get PTM stats error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'FETCH_ERROR',
                message: 'Erreur lors de la recuperation des statistiques PTM',
            },
        });
    }
});

// ============================================================================
// GET /api/ptm/initiatives
// Liste avec filtres et pagination
// ============================================================================

router.get('/initiatives', async (req: AuthenticatedRequest, res: Response) => {
    try {
        const {
            page = 1,
            limit = 20,
            annee = new Date().getFullYear(),
            ministere_id,
            statut,
            rubrique,
            search,
        } = req.query;

        const offset = (Number(page) - 1) * Number(limit);
        const params: any[] = [annee];
        let paramIndex = 2;
        let whereClause = 'WHERE i.annee = $1';

        if (ministere_id) {
            whereClause += ` AND i.ministere_id = $${paramIndex}`;
            params.push(ministere_id);
            paramIndex++;
        }

        if (statut) {
            whereClause += ` AND i.statut = $${paramIndex}`;
            params.push(statut);
            paramIndex++;
        }

        if (rubrique) {
            whereClause += ` AND i.rubrique = $${paramIndex}`;
            params.push(rubrique);
            paramIndex++;
        }

        if (search) {
            whereClause += ` AND (i.intitule ILIKE $${paramIndex} OR i.observations ILIKE $${paramIndex})`;
            params.push(`%${search}%`);
            paramIndex++;
        }

        // Filter by user's institution if not admin/central role
        const userRole = req.user?.role;
        if (userRole && ['sg_ministere', 'ministre'].includes(userRole) && req.user?.institutionId) {
            whereClause += ` AND i.ministere_id = $${paramIndex}`;
            params.push(req.user.institutionId);
            paramIndex++;
        }

        // Get total count
        const countResult = await query(
            `SELECT COUNT(*) FROM ptm.initiatives i ${whereClause}`,
            params
        );
        const total = Number(countResult.rows[0].count);

        // Get initiatives with details
        params.push(Number(limit), offset);
        const result = await query(`
      SELECT
        i.*,
        inst.nom AS ministere_nom,
        inst.sigle AS ministere_sigle,
        u_soumis.full_name AS soumis_par_nom,
        u_valide.full_name AS valide_sgg_par_nom,
        u_inscrit.full_name AS inscrit_ptg_par_nom
      FROM ptm.initiatives i
      LEFT JOIN institutions.institutions inst ON i.ministere_id = inst.id
      LEFT JOIN auth.users u_soumis ON i.soumis_par = u_soumis.id
      LEFT JOIN auth.users u_valide ON i.valide_sgg_par = u_valide.id
      LEFT JOIN auth.users u_inscrit ON i.inscrit_ptg_par = u_inscrit.id
      ${whereClause}
      ORDER BY i.rubrique, i.numero ASC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `, params);

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
        console.error('Get PTM initiatives error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'FETCH_ERROR',
                message: 'Erreur lors de la recuperation des initiatives',
            },
        });
    }
});

// ============================================================================
// GET /api/ptm/initiatives/:id
// Detail d'une initiative
// ============================================================================

router.get('/initiatives/:id', async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { id } = req.params;

        const result = await query(`
      SELECT
        i.*,
        inst.nom AS ministere_nom,
        inst.sigle AS ministere_sigle,
        u_soumis.full_name AS soumis_par_nom,
        u_valide.full_name AS valide_sgg_par_nom,
        u_inscrit.full_name AS inscrit_ptg_par_nom
      FROM ptm.initiatives i
      LEFT JOIN institutions.institutions inst ON i.ministere_id = inst.id
      LEFT JOIN auth.users u_soumis ON i.soumis_par = u_soumis.id
      LEFT JOIN auth.users u_valide ON i.valide_sgg_par = u_valide.id
      LEFT JOIN auth.users u_inscrit ON i.inscrit_ptg_par = u_inscrit.id
      WHERE i.id = $1
    `, [id]);

        if (result.rows.length === 0) {
            res.status(404).json({
                success: false,
                error: { code: 'NOT_FOUND', message: 'Initiative non trouvee' },
            });
            return;
        }

        res.json({ success: true, data: result.rows[0] });
    } catch (error) {
        console.error('Get PTM initiative error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'FETCH_ERROR',
                message: 'Erreur lors de la recuperation de l\'initiative',
            },
        });
    }
});

// ============================================================================
// POST /api/ptm/initiatives
// Creer une initiative
// ============================================================================

router.post(
    '/initiatives',
    requirePermission('ptm', 'write'),
    async (req: AuthenticatedRequest, res: Response) => {
        try {
            const {
                ministere_id,
                rubrique,
                intitule,
                cadrage,
                cadrage_detail,
                incidence_financiere,
                loi_finance,
                services_porteurs,
                observations,
                programme_pag_id,
                annee,
            } = req.body;

            if (!ministere_id || !rubrique || !intitule) {
                res.status(400).json({
                    success: false,
                    error: {
                        code: 'VALIDATION_ERROR',
                        message: 'ministere_id, rubrique et intitule sont requis',
                    },
                });
                return;
            }

            // Auto-increment numero per rubrique and ministere
            const numResult = await query(`
        SELECT COALESCE(MAX(numero), 0) + 1 AS next_num
        FROM ptm.initiatives
        WHERE ministere_id = $1 AND rubrique = $2 AND annee = $3
      `, [ministere_id, rubrique, annee || new Date().getFullYear()]);

            const numero = numResult.rows[0].next_num;

            const result = await query(`
        INSERT INTO ptm.initiatives (
          ministere_id, rubrique, numero, intitule, cadrage, cadrage_detail,
          incidence_financiere, loi_finance, services_porteurs,
          observations, programme_pag_id, annee, statut, created_by, updated_by
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'brouillon', $13, $13
        ) RETURNING *
      `, [
                ministere_id, rubrique, numero, intitule,
                cadrage || 'pag', cadrage_detail || null,
                incidence_financiere || false, loi_finance || false,
                services_porteurs || [], observations || null,
                programme_pag_id || null, annee || new Date().getFullYear(),
                req.user?.userId,
            ]);

            // Invalidate stats cache
            await cacheDelete(`ptm:stats:${annee || new Date().getFullYear()}`);

            res.status(201).json({ success: true, data: result.rows[0] });
        } catch (error) {
            console.error('Create PTM initiative error:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 'CREATE_ERROR',
                    message: 'Erreur lors de la creation de l\'initiative',
                },
            });
        }
    }
);

// ============================================================================
// PATCH /api/ptm/initiatives/:id
// Modifier une initiative (seulement si brouillon ou rejete)
// ============================================================================

router.patch(
    '/initiatives/:id',
    requirePermission('ptm', 'write'),
    async (req: AuthenticatedRequest, res: Response) => {
        try {
            const { id } = req.params;

            // Check current status
            const current = await query(
                'SELECT statut, ministere_id, annee FROM ptm.initiatives WHERE id = $1',
                [id]
            );

            if (current.rows.length === 0) {
                res.status(404).json({
                    success: false,
                    error: { code: 'NOT_FOUND', message: 'Initiative non trouvee' },
                });
                return;
            }

            if (!['brouillon', 'rejete'].includes(current.rows[0].statut)) {
                res.status(400).json({
                    success: false,
                    error: {
                        code: 'INVALID_STATUS',
                        message: 'Seules les initiatives en brouillon ou rejetees peuvent etre modifiees',
                    },
                });
                return;
            }

            const allowedFields = [
                'rubrique', 'intitule', 'cadrage', 'cadrage_detail',
                'incidence_financiere', 'loi_finance', 'services_porteurs',
                'observations', 'programme_pag_id',
            ];

            const updates: string[] = [];
            const params: any[] = [];
            let paramIndex = 1;

            for (const field of allowedFields) {
                if (req.body[field] !== undefined) {
                    updates.push(`${field} = $${paramIndex}`);
                    params.push(req.body[field]);
                    paramIndex++;
                }
            }

            if (updates.length === 0) {
                res.status(400).json({
                    success: false,
                    error: { code: 'NO_CHANGES', message: 'Aucun champ a modifier' },
                });
                return;
            }

            updates.push(`updated_by = $${paramIndex}`);
            params.push(req.user?.userId);
            paramIndex++;

            updates.push(`updated_at = NOW()`);

            // If was rejected, reset to brouillon
            if (current.rows[0].statut === 'rejete') {
                updates.push(`statut = 'brouillon'`);
                updates.push(`motif_rejet = NULL`);
            }

            params.push(id);

            const result = await query(`
        UPDATE ptm.initiatives SET ${updates.join(', ')}
        WHERE id = $${paramIndex}
        RETURNING *
      `, params);

            await cacheDelete(`ptm:stats:${current.rows[0].annee}`);

            res.json({ success: true, data: result.rows[0] });
        } catch (error) {
            console.error('Update PTM initiative error:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 'UPDATE_ERROR',
                    message: 'Erreur lors de la modification de l\'initiative',
                },
            });
        }
    }
);

// ============================================================================
// POST /api/ptm/initiatives/:id/submit
// Soumettre pour validation SGG
// ============================================================================

router.post(
    '/initiatives/:id/submit',
    requirePermission('ptm', 'write'),
    async (req: AuthenticatedRequest, res: Response) => {
        try {
            const { id } = req.params;

            const current = await query(
                'SELECT statut, annee FROM ptm.initiatives WHERE id = $1',
                [id]
            );

            if (current.rows.length === 0) {
                res.status(404).json({
                    success: false,
                    error: { code: 'NOT_FOUND', message: 'Initiative non trouvee' },
                });
                return;
            }

            if (current.rows[0].statut !== 'brouillon') {
                res.status(400).json({
                    success: false,
                    error: {
                        code: 'INVALID_STATUS',
                        message: 'Seules les initiatives en brouillon peuvent etre soumises',
                    },
                });
                return;
            }

            const result = await query(`
        UPDATE ptm.initiatives SET
          statut = 'soumis_sgg',
          soumis_par = $1,
          date_soumission = NOW(),
          date_transmission_sgg = NOW(),
          updated_by = $1,
          updated_at = NOW()
        WHERE id = $2
        RETURNING *
      `, [req.user?.userId, id]);

            // Log history
            await query(`
        INSERT INTO ptm.historique (initiative_id, action, ancien_statut, nouveau_statut, acteur_id, acteur_nom)
        VALUES ($1, 'soumission', 'brouillon', 'soumis_sgg', $2, $3)
      `, [id, req.user?.userId, req.user?.email]);

            await cacheDelete(`ptm:stats:${current.rows[0].annee}`);

            res.json({ success: true, data: result.rows[0] });
        } catch (error) {
            console.error('Submit PTM initiative error:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 'SUBMIT_ERROR',
                    message: 'Erreur lors de la soumission de l\'initiative',
                },
            });
        }
    }
);

// ============================================================================
// PATCH /api/ptm/initiatives/:id/validate
// Valider ou rejeter une initiative (SGG)
// ============================================================================

router.patch(
    '/initiatives/:id/validate',
    requirePermission('ptm', 'approve'),
    async (req: AuthenticatedRequest, res: Response) => {
        try {
            const { id } = req.params;
            const { decision, commentaire, motif_rejet } = req.body;

            if (!decision || !['valide_sgg', 'inscrit_ptg', 'rejete'].includes(decision)) {
                res.status(400).json({
                    success: false,
                    error: {
                        code: 'VALIDATION_ERROR',
                        message: 'Decision invalide. Valeurs autorisees: valide_sgg, inscrit_ptg, rejete',
                    },
                });
                return;
            }

            const current = await query(
                'SELECT statut, annee FROM ptm.initiatives WHERE id = $1',
                [id]
            );

            if (current.rows.length === 0) {
                res.status(404).json({
                    success: false,
                    error: { code: 'NOT_FOUND', message: 'Initiative non trouvee' },
                });
                return;
            }

            // Build update based on decision
            let updateFields: string;
            const params: any[] = [req.user?.userId, id];

            if (decision === 'valide_sgg') {
                updateFields = `
          statut = 'valide_sgg',
          valide_sgg_par = $1,
          date_validation_sgg = NOW(),
          commentaire_sgg = $3,
          updated_by = $1,
          updated_at = NOW()
        `;
                params.push(commentaire || null);
            } else if (decision === 'inscrit_ptg') {
                updateFields = `
          statut = 'inscrit_ptg',
          inscrit_ptg_par = $1,
          date_inscription_ptg = NOW(),
          commentaire_sgg = $3,
          updated_by = $1,
          updated_at = NOW()
        `;
                params.push(commentaire || null);
            } else {
                // rejete
                updateFields = `
          statut = 'rejete',
          motif_rejet = $3,
          commentaire_sgg = $4,
          updated_by = $1,
          updated_at = NOW()
        `;
                params.push(motif_rejet || 'Non conforme');
                params.push(commentaire || null);
            }

            const result = await query(
                `UPDATE ptm.initiatives SET ${updateFields} WHERE id = $2 RETURNING *`,
                params
            );

            // Log history
            await query(`
        INSERT INTO ptm.historique (initiative_id, action, ancien_statut, nouveau_statut, commentaire, acteur_id, acteur_nom)
        VALUES ($1, 'validation', $2, $3, $4, $5, $6)
      `, [
                id, current.rows[0].statut, decision,
                commentaire || motif_rejet || null,
                req.user?.userId, req.user?.email,
            ]);

            await cacheDelete(`ptm:stats:${current.rows[0].annee}`);

            res.json({ success: true, data: result.rows[0] });
        } catch (error) {
            console.error('Validate PTM initiative error:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Erreur lors de la validation de l\'initiative',
                },
            });
        }
    }
);

export default router;
