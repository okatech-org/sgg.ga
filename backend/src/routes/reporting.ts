/**
 * SGG Digital - Reporting Routes (PAG 2026 Matrice de Reporting)
 *
 * Endpoints CRUD pour les rapports mensuels des ministères,
 * le workflow de validation (SGG → SGPR), et le suivi de remplissage.
 *
 * Remplace les fallbacks mock du frontend reportingApi.ts
 */

import { Router, Response } from 'express';
import { query, transaction } from '../config/database.js';
import { cacheGet, cacheSet, cacheDelete } from '../config/redis.js';
import { authenticate, requirePermission, requireRole, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

// All reporting routes require authentication
router.use(authenticate);

// ============================================================================
// GET — Matrice complète
// ============================================================================

/**
 * GET /api/reporting/matrice
 * Get the full reporting matrix for a given period
 */
router.get('/matrice', async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { mois, annee = new Date().getFullYear(), pilier_id, ministere_id, statut } = req.query;
        const params: any[] = [annee];
        let whereClause = 'WHERE rm.annee = $1';
        let paramIndex = 2;

        if (mois) {
            whereClause += ` AND rm.mois = $${paramIndex++}`;
            params.push(Number(mois));
        }
        if (pilier_id) {
            whereClause += ` AND pp.id = $${paramIndex++}`;
            params.push(pilier_id);
        }
        if (ministere_id) {
            whereClause += ` AND rm.ministere_id = $${paramIndex++}`;
            params.push(ministere_id);
        }
        if (statut) {
            whereClause += ` AND rm.statut_validation = $${paramIndex++}`;
            params.push(statut);
        }
        // Restrict by institution for SG ministère
        if (req.user?.role === 'sg_ministere' && req.user?.institutionId) {
            whereClause += ` AND rm.ministere_id = $${paramIndex++}`;
            params.push(req.user.institutionId);
        }

        const cacheKey = `reporting:matrice:${JSON.stringify(req.query)}`;
        let data = await cacheGet<any>(cacheKey);

        if (!data) {
            const result = await query(`
        SELECT rm.*,
               pp.code as pilier_code, pp.nom as pilier_nom, pp.couleur as pilier_couleur,
               prog.code_programme, prog.libelle_programme, prog.mesure_presidentielle,
               prog.objectif_strategique, prog.resultats_attendus, prog.actions_projets,
               i.nom as ministere_nom, i.sigle as ministere_sigle,
               u_soumis.full_name as soumis_par_nom,
               u_valide_sgg.full_name as valide_sgg_par_nom,
               u_valide_sgpr.full_name as valide_sgpr_par_nom
        FROM reporting.rapports_mensuels rm
        JOIN reporting.programmes_pag prog ON rm.programme_id = prog.id
        JOIN reporting.piliers_presidentiels pp ON prog.pilier_id = pp.id
        JOIN institutions.institutions i ON rm.ministere_id = i.id
        LEFT JOIN auth.users u_soumis ON rm.soumis_par_id = u_soumis.id
        LEFT JOIN auth.users u_valide_sgg ON rm.valide_sgg_par_id = u_valide_sgg.id
        LEFT JOIN auth.users u_valide_sgpr ON rm.valide_sgpr_par_id = u_valide_sgpr.id
        ${whereClause}
        ORDER BY pp.id, prog.code_programme, i.nom
      `, params);

            data = result.rows;
            await cacheSet(cacheKey, data, 120); // 2 minutes
        }

        res.json({ success: true, data });
    } catch (error) {
        console.error('Get matrice error:', error);
        res.status(500).json({
            success: false,
            error: { code: 'FETCH_ERROR', message: 'Erreur lors de la récupération de la matrice' },
        });
    }
});

// ============================================================================
// GET — Statistiques dashboard reporting
// ============================================================================

/**
 * GET /api/reporting/stats
 * Global reporting statistics
 */
router.get('/stats', async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { annee = new Date().getFullYear(), mois } = req.query;

        const cacheKey = `reporting:stats:${annee}:${mois || 'all'}`;
        let stats = await cacheGet<any>(cacheKey);

        if (!stats) {
            const params: any[] = [annee];
            const moisFilter = mois ? ` AND mois = $2` : '';
            if (mois) params.push(Number(mois));

            const result = await query(`
        SELECT
          COUNT(*) as total_rapports,
          COUNT(CASE WHEN statut_validation = 'brouillon' THEN 1 END) as brouillons,
          COUNT(CASE WHEN statut_validation = 'soumis' THEN 1 END) as soumis,
          COUNT(CASE WHEN statut_validation = 'valide_sgg' THEN 1 END) as valides_sgg,
          COUNT(CASE WHEN statut_validation = 'valide_sgpr' THEN 1 END) as valides_sgpr,
          COUNT(CASE WHEN statut_validation = 'rejete' THEN 1 END) as rejetes,
          COALESCE(SUM(budget_md_fcfa), 0) as budget_total,
          COALESCE(SUM(engage_md_fcfa), 0) as engage_total,
          COALESCE(SUM(decaisse_md_fcfa), 0) as decaisse_total,
          COALESCE(AVG(pct_execution_financiere), 0) as moy_execution_financiere,
          COALESCE(AVG(pct_avancement_physique), 0) as moy_avancement_physique
        FROM reporting.rapports_mensuels
        WHERE annee = $1 ${moisFilter}
      `, params);

            stats = result.rows[0];
            await cacheSet(cacheKey, stats, 120);
        }

        res.json({ success: true, data: stats });
    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({
            success: false,
            error: { code: 'FETCH_ERROR', message: 'Erreur récupération statistiques' },
        });
    }
});

// ============================================================================
// GET — Rapport individuel
// ============================================================================

/**
 * GET /api/reporting/rapports/:id
 * Get a single report with full detail
 */
router.get('/rapports/:id', async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { id } = req.params;

        const result = await query(`
      SELECT rm.*,
             pp.code as pilier_code, pp.nom as pilier_nom,
             prog.libelle_programme,
             i.nom as ministere_nom, i.sigle as ministere_sigle
      FROM reporting.rapports_mensuels rm
      JOIN reporting.programmes_pag prog ON rm.programme_id = prog.id
      JOIN reporting.piliers_presidentiels pp ON prog.pilier_id = pp.id
      JOIN institutions.institutions i ON rm.ministere_id = i.id
      WHERE rm.id = $1
    `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: { code: 'NOT_FOUND', message: 'Rapport non trouvé' },
            });
        }

        // Get audit trail
        const historyResult = await query(`
      SELECT * FROM reporting.historique_modifications
      WHERE rapport_id = $1 ORDER BY modifie_le DESC LIMIT 20
    `, [id]);

        res.json({
            success: true,
            data: { ...result.rows[0], historique: historyResult.rows },
        });
    } catch (error) {
        console.error('Get rapport error:', error);
        res.status(500).json({
            success: false,
            error: { code: 'FETCH_ERROR', message: 'Erreur récupération rapport' },
        });
    }
});

// ============================================================================
// POST — Soumettre un rapport
// ============================================================================

/**
 * POST /api/reporting/rapports/:id/submit
 */
router.post('/rapports/:id/submit',
    requirePermission('reporting', 'write'),
    async (req: AuthenticatedRequest, res: Response) => {
        try {
            const { id } = req.params;
            const data = req.body;

            const result = await transaction(async (client) => {
                // Update report data + status
                const updated = await client.query(`
          UPDATE reporting.rapports_mensuels
          SET statut_validation = 'soumis',
              soumis_par_id = $2,
              date_soumission = NOW(),
              activites_realisees = COALESCE($3, activites_realisees),
              budget_md_fcfa = COALESCE($4, budget_md_fcfa),
              engage_md_fcfa = COALESCE($5, engage_md_fcfa),
              decaisse_md_fcfa = COALESCE($6, decaisse_md_fcfa),
              indicateurs_kpi = COALESCE($7, indicateurs_kpi),
              pct_avancement_physique = COALESCE($8, pct_avancement_physique),
              observations_contraintes = COALESCE($9, observations_contraintes),
              modifie_le = NOW()
          WHERE id = $1 AND statut_validation IN ('brouillon', 'rejete')
          RETURNING *
        `, [
                    id, req.user?.userId,
                    data.activites_realisees, data.budget_md_fcfa,
                    data.engage_md_fcfa, data.decaisse_md_fcfa,
                    data.indicateurs_kpi, data.pct_avancement_physique,
                    data.observations_contraintes,
                ]);

                if (updated.rows.length === 0) {
                    throw new Error('INVALID_STATE');
                }

                // Audit trail
                await client.query(`
          INSERT INTO reporting.historique_modifications (rapport_id, champ_modifie, nouvelle_valeur, modifie_par_id, modifie_par_nom)
          VALUES ($1, 'statut_validation', 'soumis', $2, $3)
        `, [id, req.user?.userId, 'submission']);

                return updated.rows[0];
            }, req.user?.userId);

            await cacheDelete('reporting:*');

            res.json({ success: true, message: 'Rapport soumis avec succès', data: result });
        } catch (error: any) {
            if (error.message === 'INVALID_STATE') {
                return res.status(400).json({
                    success: false,
                    error: { code: 'INVALID_STATE', message: 'Le rapport ne peut pas être soumis dans son état actuel' },
                });
            }
            console.error('Submit rapport error:', error);
            res.status(500).json({
                success: false,
                error: { code: 'SUBMIT_ERROR', message: 'Erreur lors de la soumission' },
            });
        }
    }
);

// ============================================================================
// PUT — Sauvegarder brouillon
// ============================================================================

/**
 * PUT /api/reporting/rapports/:id/draft
 */
router.put('/rapports/:id/draft',
    requirePermission('reporting', 'write'),
    async (req: AuthenticatedRequest, res: Response) => {
        try {
            const { id } = req.params;
            const data = req.body;

            const result = await query(`
        UPDATE reporting.rapports_mensuels
        SET activites_realisees = COALESCE($2, activites_realisees),
            budget_md_fcfa = COALESCE($3, budget_md_fcfa),
            engage_md_fcfa = COALESCE($4, engage_md_fcfa),
            decaisse_md_fcfa = COALESCE($5, decaisse_md_fcfa),
            indicateurs_kpi = COALESCE($6, indicateurs_kpi),
            pct_avancement_physique = COALESCE($7, pct_avancement_physique),
            observations_contraintes = COALESCE($8, observations_contraintes),
            modifie_le = NOW()
        WHERE id = $1 AND statut_validation = 'brouillon'
        RETURNING *
      `, [
                id,
                data.activites_realisees, data.budget_md_fcfa,
                data.engage_md_fcfa, data.decaisse_md_fcfa,
                data.indicateurs_kpi, data.pct_avancement_physique,
                data.observations_contraintes,
            ]);

            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    error: { code: 'NOT_FOUND', message: 'Rapport non trouvé ou non modifiable' },
                });
            }

            res.json({ success: true, message: 'Brouillon enregistré', data: result.rows[0] });
        } catch (error) {
            console.error('Save draft error:', error);
            res.status(500).json({
                success: false,
                error: { code: 'SAVE_ERROR', message: 'Erreur lors de l\'enregistrement' },
            });
        }
    }
);

// ============================================================================
// PATCH — Validation SGG
// ============================================================================

/**
 * PATCH /api/reporting/rapports/:id/validate-sgg
 */
router.patch('/rapports/:id/validate-sgg',
    requireRole('admin_sgg', 'directeur_sgg'),
    async (req: AuthenticatedRequest, res: Response) => {
        try {
            const { id } = req.params;
            const { commentaire } = req.body;

            const result = await query(`
        UPDATE reporting.rapports_mensuels
        SET statut_validation = 'valide_sgg',
            valide_sgg_par_id = $2,
            date_validation_sgg = NOW(),
            commentaire_validation = $3,
            modifie_le = NOW()
        WHERE id = $1 AND statut_validation = 'soumis'
        RETURNING *
      `, [id, req.user?.userId, commentaire]);

            if (result.rows.length === 0) {
                return res.status(400).json({
                    success: false,
                    error: { code: 'INVALID_STATE', message: 'Le rapport doit être en statut "soumis"' },
                });
            }

            await cacheDelete('reporting:*');

            res.json({
                success: true,
                message: 'Rapport validé par le SGG',
                newStatut: 'valide_sgg',
                data: result.rows[0],
            });
        } catch (error) {
            console.error('Validate SGG error:', error);
            res.status(500).json({
                success: false,
                error: { code: 'VALIDATE_ERROR', message: 'Erreur lors de la validation SGG' },
            });
        }
    }
);

// ============================================================================
// PATCH — Validation SGPR
// ============================================================================

/**
 * PATCH /api/reporting/rapports/:id/validate-sgpr
 */
router.patch('/rapports/:id/validate-sgpr',
    requireRole('admin_sgg', 'sgpr', 'premier_ministre'),
    async (req: AuthenticatedRequest, res: Response) => {
        try {
            const { id } = req.params;
            const { commentaire } = req.body;

            const result = await query(`
        UPDATE reporting.rapports_mensuels
        SET statut_validation = 'valide_sgpr',
            valide_sgpr_par_id = $2,
            date_validation_sgpr = NOW(),
            commentaire_validation = $3,
            modifie_le = NOW()
        WHERE id = $1 AND statut_validation = 'valide_sgg'
        RETURNING *
      `, [id, req.user?.userId, commentaire]);

            if (result.rows.length === 0) {
                return res.status(400).json({
                    success: false,
                    error: { code: 'INVALID_STATE', message: 'Le rapport doit être en statut "validé SGG"' },
                });
            }

            await cacheDelete('reporting:*');

            res.json({
                success: true,
                message: 'Rapport validé et publié par le SGPR',
                newStatut: 'valide_sgpr',
                data: result.rows[0],
            });
        } catch (error) {
            console.error('Validate SGPR error:', error);
            res.status(500).json({
                success: false,
                error: { code: 'VALIDATE_ERROR', message: 'Erreur lors de la validation SGPR' },
            });
        }
    }
);

// ============================================================================
// PATCH — Rejet
// ============================================================================

/**
 * PATCH /api/reporting/rapports/:id/reject
 */
router.patch('/rapports/:id/reject',
    requireRole('admin_sgg', 'directeur_sgg', 'sgpr'),
    async (req: AuthenticatedRequest, res: Response) => {
        try {
            const { id } = req.params;
            const { motif } = req.body;

            if (!motif) {
                return res.status(400).json({
                    success: false,
                    error: { code: 'MISSING_MOTIF', message: 'Le motif de rejet est obligatoire' },
                });
            }

            const result = await query(`
        UPDATE reporting.rapports_mensuels
        SET statut_validation = 'rejete',
            motif_rejet = $2,
            modifie_le = NOW()
        WHERE id = $1 AND statut_validation IN ('soumis', 'valide_sgg')
        RETURNING *
      `, [id, motif]);

            if (result.rows.length === 0) {
                return res.status(400).json({
                    success: false,
                    error: { code: 'INVALID_STATE', message: 'Le rapport ne peut pas être rejeté dans son état actuel' },
                });
            }

            await cacheDelete('reporting:*');

            res.json({
                success: true,
                message: 'Rapport rejeté',
                newStatut: 'rejete',
                data: result.rows[0],
            });
        } catch (error) {
            console.error('Reject rapport error:', error);
            res.status(500).json({
                success: false,
                error: { code: 'REJECT_ERROR', message: 'Erreur lors du rejet' },
            });
        }
    }
);

// ============================================================================
// POST — Batch validation SGG
// ============================================================================

/**
 * POST /api/reporting/rapports/batch-validate-sgg
 */
router.post('/rapports/batch-validate-sgg',
    requireRole('admin_sgg', 'directeur_sgg'),
    async (req: AuthenticatedRequest, res: Response) => {
        try {
            const { rapportIds } = req.body;

            if (!Array.isArray(rapportIds) || rapportIds.length === 0) {
                return res.status(400).json({
                    success: false,
                    error: { code: 'INVALID_INPUT', message: 'Liste de rapports vide' },
                });
            }

            const result = await query(`
        UPDATE reporting.rapports_mensuels
        SET statut_validation = 'valide_sgg',
            valide_sgg_par_id = $2,
            date_validation_sgg = NOW(),
            modifie_le = NOW()
        WHERE id = ANY($1::uuid[]) AND statut_validation = 'soumis'
      `, [rapportIds, req.user?.userId]);

            await cacheDelete('reporting:*');

            res.json({ success: true, count: result.rowCount });
        } catch (error) {
            console.error('Batch validate SGG error:', error);
            res.status(500).json({
                success: false,
                error: { code: 'BATCH_ERROR', message: 'Erreur lors de la validation en masse' },
            });
        }
    }
);

// ============================================================================
// POST — Batch validation SGPR
// ============================================================================

/**
 * POST /api/reporting/rapports/batch-validate-sgpr
 */
router.post('/rapports/batch-validate-sgpr',
    requireRole('admin_sgg', 'sgpr', 'premier_ministre'),
    async (req: AuthenticatedRequest, res: Response) => {
        try {
            const { rapportIds } = req.body;

            if (!Array.isArray(rapportIds) || rapportIds.length === 0) {
                return res.status(400).json({
                    success: false,
                    error: { code: 'INVALID_INPUT', message: 'Liste de rapports vide' },
                });
            }

            const result = await query(`
        UPDATE reporting.rapports_mensuels
        SET statut_validation = 'valide_sgpr',
            valide_sgpr_par_id = $2,
            date_validation_sgpr = NOW(),
            modifie_le = NOW()
        WHERE id = ANY($1::uuid[]) AND statut_validation = 'valide_sgg'
      `, [rapportIds, req.user?.userId]);

            await cacheDelete('reporting:*');

            res.json({ success: true, count: result.rowCount });
        } catch (error) {
            console.error('Batch validate SGPR error:', error);
            res.status(500).json({
                success: false,
                error: { code: 'BATCH_ERROR', message: 'Erreur lors de la validation SGPR en masse' },
            });
        }
    }
);

// ============================================================================
// GET — Suivi de remplissage
// ============================================================================

/**
 * GET /api/reporting/suivi
 * Completion tracking per ministry and period
 */
router.get('/suivi', async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { annee = new Date().getFullYear(), mois } = req.query;

        const cacheKey = `reporting:suivi:${annee}:${mois || 'all'}`;
        let data = await cacheGet<any>(cacheKey);

        if (!data) {
            const params: any[] = [annee];
            const moisFilter = mois ? ` AND rm.mois = $2` : '';
            if (mois) params.push(Number(mois));

            const result = await query(`
        SELECT
          i.id as ministere_id,
          i.nom as ministere_nom,
          i.sigle as ministere_sigle,
          rm.mois,
          rm.statut_validation as statut,
          rm.modifie_le as date_remplissage,
          CASE
            WHEN rm.statut_validation IS NULL THEN 'non_saisi'
            ELSE rm.statut_validation
          END as etat,
          COALESCE(
            EXTRACT(DAY FROM NOW() - (make_date(${annee}::int, rm.mois::int, 15))),
            0
          ) as jours_retard
        FROM institutions.institutions i
        LEFT JOIN reporting.rapports_mensuels rm ON i.id = rm.ministere_id AND rm.annee = $1 ${moisFilter}
        WHERE i.type = 'ministere' AND i.is_active = true
        ORDER BY i.nom, rm.mois
      `, params);

            data = result.rows;
            await cacheSet(cacheKey, data, 120);
        }

        res.json({ success: true, data });
    } catch (error) {
        console.error('Get suivi error:', error);
        res.status(500).json({
            success: false,
            error: { code: 'FETCH_ERROR', message: 'Erreur récupération suivi remplissage' },
        });
    }
});

export default router;
