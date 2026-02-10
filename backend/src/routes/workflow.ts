/**
 * SGG Digital — Routes API Workflow
 *
 * Endpoints pour gérer les circuits d'approbation.
 *
 * Routes :
 *   GET    /api/workflows              → Lister les définitions
 *   POST   /api/workflows              → Créer un workflow
 *   GET    /api/workflows/templates     → Obtenir les templates prédéfinis
 *   GET    /api/workflows/instances     → Lister les instances
 *   POST   /api/workflows/instances     → Démarrer une instance
 *   GET    /api/workflows/instances/:id → Détail instance + historique
 *   POST   /api/workflows/instances/:id/action → Agir sur une instance
 */

import { Router, Request, Response } from 'express';
import {
    createWorkflow,
    startWorkflow,
    processAction,
    getWorkflowInstance,
    listWorkflowInstances,
    WORKFLOW_TEMPLATES,
    type WorkflowAction,
    type WorkflowPriority,
    type WorkflowStatus,
} from '../services/workflow.js';
import type { AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

// ── List workflow definitions ───────────────────────────────────────────────

router.get('/templates', async (_req: Request, res: Response): Promise<void> => {
    try {
        res.json({ success: true, data: WORKFLOW_TEMPLATES });
    } catch (error) {
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// ── Create workflow definition ──────────────────────────────────────────────

router.post('/', async (req: Request, res: Response): Promise<void> => {
    try {
        const authReq = req as AuthenticatedRequest;
        if (!authReq.user) {
            res.status(401).json({ error: 'Authentication required' });
            return;
        }

        if (!['admin_sgg', 'directeur_sgg'].includes(authReq.user.role)) {
            res.status(403).json({ error: 'Réservé aux administrateurs' });
            return;
        }

        const { type, name, description, steps } = req.body;
        if (!type || !name || !steps || !Array.isArray(steps)) {
            res.status(400).json({ error: 'type, name, et steps sont requis' });
            return;
        }

        const id = await createWorkflow({
            type, name, description, steps,
            createdBy: authReq.user.userId,
        });

        res.status(201).json({ success: true, data: { id } });
    } catch (error) {
        console.error('[Workflow Route] Erreur création:', error);
        res.status(500).json({ error: 'Erreur lors de la création du workflow' });
    }
});

// ── List workflow instances ─────────────────────────────────────────────────

router.get('/instances', async (req: Request, res: Response): Promise<void> => {
    try {
        const authReq = req as AuthenticatedRequest;
        if (!authReq.user) {
            res.status(401).json({ error: 'Authentication required' });
            return;
        }

        const { status, dossierType, priority, page = '1', pageSize = '20' } = req.query;
        const limit = Math.min(parseInt(pageSize as string) || 20, 100);
        const offset = (Math.max(parseInt(page as string) || 1, 1) - 1) * limit;

        const result = await listWorkflowInstances({
            status: status as WorkflowStatus | undefined,
            dossierType: dossierType as string | undefined,
            priority: priority as WorkflowPriority | undefined,
            limit,
            offset,
        });

        res.json({
            success: true,
            data: {
                instances: result.instances,
                total: result.total,
                page: Math.floor(offset / limit) + 1,
                pageSize: limit,
            },
        });
    } catch (error) {
        console.error('[Workflow Route] Erreur liste instances:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// ── Start workflow instance ─────────────────────────────────────────────────

router.post('/instances', async (req: Request, res: Response): Promise<void> => {
    try {
        const authReq = req as AuthenticatedRequest;
        if (!authReq.user) {
            res.status(401).json({ error: 'Authentication required' });
            return;
        }

        const { workflowId, dossierId, dossierType, priority, metadata, deadline } = req.body;
        if (!workflowId || !dossierId || !dossierType) {
            res.status(400).json({ error: 'workflowId, dossierId, et dossierType sont requis' });
            return;
        }

        const id = await startWorkflow({
            workflowId,
            dossierId,
            dossierType,
            priority,
            metadata,
            deadline: deadline ? new Date(deadline) : undefined,
            createdBy: authReq.user.userId,
        });

        res.status(201).json({ success: true, data: { id } });
    } catch (error) {
        console.error('[Workflow Route] Erreur démarrage:', error);
        res.status(500).json({ error: 'Erreur lors du démarrage du workflow' });
    }
});

// ── Get workflow instance detail ────────────────────────────────────────────

router.get('/instances/:id', async (req: Request, res: Response): Promise<void> => {
    try {
        const authReq = req as AuthenticatedRequest;
        if (!authReq.user) {
            res.status(401).json({ error: 'Authentication required' });
            return;
        }

        const instance = await getWorkflowInstance(req.params.id);
        res.json({ success: true, data: instance });
    } catch (error) {
        const msg = (error as Error).message;
        if (msg.includes('non trouvée')) {
            res.status(404).json({ error: msg });
            return;
        }
        console.error('[Workflow Route] Erreur détail:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// ── Process workflow action ─────────────────────────────────────────────────

router.post('/instances/:id/action', async (req: Request, res: Response): Promise<void> => {
    try {
        const authReq = req as AuthenticatedRequest;
        if (!authReq.user) {
            res.status(401).json({ error: 'Authentication required' });
            return;
        }

        const { action, comment, attachments } = req.body;
        if (!action) {
            res.status(400).json({ error: 'action est requis' });
            return;
        }

        const validActions: WorkflowAction[] = ['submit', 'approve', 'reject', 'return', 'escalate', 'cancel', 'comment'];
        if (!validActions.includes(action)) {
            res.status(400).json({ error: `Action invalide: ${action}`, validActions });
            return;
        }

        const result = await processAction({
            instanceId: req.params.id,
            action,
            actorId: authReq.user.userId,
            actorEmail: authReq.user.email,
            actorRole: authReq.user.role,
            comment,
            attachments,
        });

        res.json({ success: true, data: result });
    } catch (error) {
        const msg = (error as Error).message;
        if (msg.includes('non trouvée') || msg.includes('non autorisé')) {
            res.status(403).json({ error: msg });
            return;
        }
        console.error('[Workflow Route] Erreur action:', error);
        res.status(500).json({ error: 'Erreur lors du traitement de l\'action' });
    }
});

export default router;
