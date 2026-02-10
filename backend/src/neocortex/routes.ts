/**
 * NEOCORTEX — 📡 Routes API
 * Expose les endpoints du système nerveux digital.
 */

import { Router, Request, Response } from 'express';
import type { AuthenticatedRequest } from '../middleware/auth.js';

import { statsLimbique, listerSignauxNonTraites } from './limbique.js';
import { listerHistorique, historiqueEntite, statsHippocampe } from './hippocampe.js';
import {
    lireConfig,
    ecrireConfig,
    lireConfigsParCategorie,
    lirePoidsAdaptatifs,
} from './plasticite.js';
import { validerTransition, evaluerAutoApprobation } from './prefrontal.js';
import {
    listerNotifications,
    marquerLue,
    marquerToutesLues,
    compterNonLues,
} from './auditif.js';
import { statsMoteur } from './moteur.js';
import { query } from '../config/database.js';

const router = Router();

// ============================================================================
// 📊 TABLEAU DE BORD NEOCORTEX
// ============================================================================

/**
 * GET /api/neocortex/dashboard
 * Vue d'ensemble du système nerveux — toutes les métriques résumées.
 */
router.get('/dashboard', async (req: Request, res: Response): Promise<void> => {
    try {
        const authReq = req as AuthenticatedRequest;
        if (!authReq.user || !['admin_sgg', 'directeur_sgg'].includes(authReq.user.role)) {
            res.status(403).json({ error: 'Accès réservé aux administrateurs' });
            return;
        }

        const [limbique, hippocampe, moteur] = await Promise.all([
            statsLimbique(),
            statsHippocampe(),
            statsMoteur(),
        ]);

        res.json({
            success: true,
            data: {
                limbique,
                hippocampe,
                moteur,
                timestamp: new Date().toISOString(),
            },
        });
    } catch (error) {
        console.error('[NEOCORTEX Route] dashboard error:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// ============================================================================
// 💓 SIGNAUX (Limbique)
// ============================================================================

/**
 * GET /api/neocortex/signaux
 * Lister les signaux non traités.
 */
router.get('/signaux', async (req: Request, res: Response): Promise<void> => {
    try {
        const authReq = req as AuthenticatedRequest;
        if (!authReq.user || !['admin_sgg', 'directeur_sgg'].includes(authReq.user.role)) {
            res.status(403).json({ error: 'Accès réservé aux administrateurs' });
            return;
        }

        const limit = Math.min(parseInt(req.query.limit as string) || 50, 200);
        const result = await listerSignauxNonTraites(limit);
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// ============================================================================
// 📚 HISTORIQUE (Hippocampe)
// ============================================================================

/**
 * GET /api/neocortex/historique
 * Historique des actions avec filtres.
 */
router.get('/historique', async (req: Request, res: Response): Promise<void> => {
    try {
        const authReq = req as AuthenticatedRequest;
        if (!authReq.user || !['admin_sgg', 'directeur_sgg'].includes(authReq.user.role)) {
            res.status(403).json({ error: 'Accès réservé aux administrateurs' });
            return;
        }

        const { entiteType, entiteId, userId, categorie, action, dateDebut, dateFin, page, limit } = req.query;

        const result = await listerHistorique({
            entiteType: entiteType as string,
            entiteId: entiteId as string,
            userId: userId as string,
            categorie: categorie as any,
            action: action as string,
            dateDebut: dateDebut ? new Date(dateDebut as string) : undefined,
            dateFin: dateFin ? new Date(dateFin as string) : undefined,
            page: parseInt(page as string) || 1,
            limit: parseInt(limit as string) || 50,
        });

        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

/**
 * GET /api/neocortex/historique/:entiteType/:entiteId
 * Timeline d'une entité spécifique.
 */
router.get('/historique/:entiteType/:entiteId', async (req: Request, res: Response): Promise<void> => {
    try {
        const authReq = req as AuthenticatedRequest;
        if (!authReq.user) {
            res.status(401).json({ error: 'Authentification requise' });
            return;
        }

        const { entiteType, entiteId } = req.params;
        const timeline = await historiqueEntite(entiteType, entiteId);
        res.json({ success: true, data: timeline });
    } catch (error) {
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// ============================================================================
// 🔧 CONFIG (Plasticité)
// ============================================================================

/**
 * GET /api/neocortex/config
 * Lire toutes les configs ou par catégorie.
 */
router.get('/config', async (req: Request, res: Response): Promise<void> => {
    try {
        const authReq = req as AuthenticatedRequest;
        if (!authReq.user || !['admin_sgg', 'directeur_sgg'].includes(authReq.user.role)) {
            res.status(403).json({ error: 'Accès réservé aux administrateurs' });
            return;
        }

        const categorie = req.query.categorie as string;
        if (categorie) {
            const configs = await lireConfigsParCategorie(categorie);
            res.json({ success: true, data: configs });
        } else {
            const result = await query(
                `SELECT cle, valeur, description, categorie, version, updated_at
         FROM neocortex.config_systeme ORDER BY categorie, cle`
            );
            res.json({ success: true, data: result.rows });
        }
    } catch (error) {
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

/**
 * GET /api/neocortex/config/:cle
 * Lire une config spécifique.
 */
router.get('/config/:cle', async (req: Request, res: Response): Promise<void> => {
    try {
        const authReq = req as AuthenticatedRequest;
        if (!authReq.user) {
            res.status(401).json({ error: 'Authentification requise' });
            return;
        }

        const valeur = await lireConfig(req.params.cle);
        if (valeur === null) {
            res.status(404).json({ error: 'Configuration non trouvée' });
            return;
        }

        res.json({ success: true, data: { cle: req.params.cle, valeur } });
    } catch (error) {
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

/**
 * PUT /api/neocortex/config/:cle
 * Modifier une config (admin uniquement).
 */
router.put('/config/:cle', async (req: Request, res: Response): Promise<void> => {
    try {
        const authReq = req as AuthenticatedRequest;
        if (!authReq.user || authReq.user.role !== 'admin_sgg') {
            res.status(403).json({ error: 'Réservé au super administrateur' });
            return;
        }

        const { valeur, description } = req.body;
        if (valeur === undefined) {
            res.status(400).json({ error: 'valeur est requis' });
            return;
        }

        await ecrireConfig(req.params.cle, valeur, authReq.user.userId, description);
        res.json({ success: true, data: { cle: req.params.cle, valeur } });
    } catch (error) {
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// ============================================================================
// 🎯 DÉCISIONS (Préfrontal)
// ============================================================================

/**
 * POST /api/neocortex/decision/transition/validate
 * Valider si une transition est autorisée.
 */
router.post('/decision/transition/validate', async (req: Request, res: Response): Promise<void> => {
    try {
        const authReq = req as AuthenticatedRequest;
        if (!authReq.user) {
            res.status(401).json({ error: 'Authentification requise' });
            return;
        }

        const { module, statutActuel, nouveauStatut } = req.body;
        if (!module || !statutActuel || !nouveauStatut) {
            res.status(400).json({ error: 'module, statutActuel et nouveauStatut requis' });
            return;
        }

        const result = validerTransition(module, statutActuel, nouveauStatut);
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

/**
 * POST /api/neocortex/decision/auto-approbation
 * Évaluer un dossier pour auto-approbation.
 */
router.post('/decision/auto-approbation', async (req: Request, res: Response): Promise<void> => {
    try {
        const authReq = req as AuthenticatedRequest;
        if (!authReq.user) {
            res.status(401).json({ error: 'Authentification requise' });
            return;
        }

        const { module, entiteId, completude, delai, historique, conformite, urgence } = req.body;
        if (!module || !entiteId || completude === undefined || conformite === undefined) {
            res.status(400).json({ error: 'module, entiteId, completude et conformite requis' });
            return;
        }

        const result = await evaluerAutoApprobation(
            module,
            entiteId,
            { completude, delai: delai ?? 1, historique: historique ?? 0.5, conformite, urgence },
            authReq.user.userId
        );

        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// ============================================================================
// 👂 NOTIFICATIONS (Auditif)
// ============================================================================

/**
 * GET /api/neocortex/notifications
 * Mes notifications.
 */
router.get('/notifications', async (req: Request, res: Response): Promise<void> => {
    try {
        const authReq = req as AuthenticatedRequest;
        if (!authReq.user) {
            res.status(401).json({ error: 'Authentification requise' });
            return;
        }

        const { nonLues, type, limit, offset } = req.query;

        const result = await listerNotifications(authReq.user.userId, {
            nonLuesSeulement: nonLues === 'true',
            type: type as string,
            limit: parseInt(limit as string) || 50,
            offset: parseInt(offset as string) || 0,
        });

        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

/**
 * GET /api/neocortex/notifications/count
 * Nombre de notifications non lues.
 */
router.get('/notifications/count', async (req: Request, res: Response): Promise<void> => {
    try {
        const authReq = req as AuthenticatedRequest;
        if (!authReq.user) {
            res.status(401).json({ error: 'Authentification requise' });
            return;
        }

        const count = await compterNonLues(authReq.user.userId);
        res.json({ success: true, data: { nonLues: count } });
    } catch (error) {
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

/**
 * PATCH /api/neocortex/notifications/:id/lue
 * Marquer une notification comme lue.
 */
router.patch('/notifications/:id/lue', async (req: Request, res: Response): Promise<void> => {
    try {
        const authReq = req as AuthenticatedRequest;
        if (!authReq.user) {
            res.status(401).json({ error: 'Authentification requise' });
            return;
        }

        const success = await marquerLue(req.params.id, authReq.user.userId);
        if (!success) {
            res.status(404).json({ error: 'Notification non trouvée' });
            return;
        }

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

/**
 * PATCH /api/neocortex/notifications/lire-tout
 * Marquer toutes les notifications comme lues.
 */
router.patch('/notifications/lire-tout', async (req: Request, res: Response): Promise<void> => {
    try {
        const authReq = req as AuthenticatedRequest;
        if (!authReq.user) {
            res.status(401).json({ error: 'Authentification requise' });
            return;
        }

        const count = await marquerToutesLues(authReq.user.userId);
        res.json({ success: true, data: { marquees: count } });
    } catch (error) {
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// ============================================================================
// 🧬 POIDS ADAPTATIFS
// ============================================================================

/**
 * GET /api/neocortex/poids/:signalType
 * Lire les poids adaptatifs pour un signal donné.
 */
router.get('/poids/:signalType', async (req: Request, res: Response): Promise<void> => {
    try {
        const authReq = req as AuthenticatedRequest;
        if (!authReq.user || !['admin_sgg', 'directeur_sgg'].includes(authReq.user.role)) {
            res.status(403).json({ error: 'Accès réservé aux administrateurs' });
            return;
        }

        const poids = await lirePoidsAdaptatifs(req.params.signalType);
        res.json({ success: true, data: poids });
    } catch (error) {
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// ============================================================================
// 📈 MÉTRIQUES
// ============================================================================

/**
 * GET /api/neocortex/metriques
 * Dernières métriques du système.
 */
router.get('/metriques', async (req: Request, res: Response): Promise<void> => {
    try {
        const authReq = req as AuthenticatedRequest;
        if (!authReq.user || !['admin_sgg', 'directeur_sgg'].includes(authReq.user.role)) {
            res.status(403).json({ error: 'Accès réservé aux administrateurs' });
            return;
        }

        const { nom, periode, limit: lim } = req.query;
        const conditions: string[] = [];
        const params: unknown[] = [];
        let idx = 1;

        if (nom) { conditions.push(`nom = $${idx++}`); params.push(nom); }
        if (periode) { conditions.push(`periode = $${idx++}`); params.push(periode); }

        const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
        const result = await query(
            `SELECT nom, valeur, unite, periode, dimensions, created_at
       FROM neocortex.metriques
       ${where}
       ORDER BY created_at DESC
       LIMIT $${idx}`,
            [...params, Math.min(parseInt(lim as string) || 100, 500)]
        );

        res.json({ success: true, data: result.rows });
    } catch (error) {
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

export default router;
