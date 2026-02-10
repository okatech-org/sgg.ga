/**
 * SGG Digital — Backend Service Workflow (Approbation Multi-Niveaux)
 *
 * Gère les processus d'approbation avec :
 *   - Définition de workflows par type de dossier
 *   - Étapes ordonnées avec des rôles requis
 *   - Transitions d'état contrôlées
 *   - Historique complet des actions
 *   - Deadlines et escalade
 *
 * Exemple de flux type "Décret" :
 *   Rédaction → Validation SG → Visa Juridique → Approbation SGPR → Publication JO
 *
 * Table SQL (à créer via migration) :
 *
 *   CREATE TABLE workflows (
 *     id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
 *     type            VARCHAR(50) NOT NULL,
 *     name            VARCHAR(255) NOT NULL,
 *     description     TEXT,
 *     steps           JSONB NOT NULL DEFAULT '[]',
 *     created_by      UUID NOT NULL,
 *     created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
 *     updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
 *   );
 *
 *   CREATE TABLE workflow_instances (
 *     id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
 *     workflow_id     UUID NOT NULL REFERENCES workflows(id),
 *     dossier_id      UUID NOT NULL,
 *     dossier_type    VARCHAR(50) NOT NULL,
 *     current_step    INTEGER DEFAULT 0,
 *     status          VARCHAR(20) DEFAULT 'pending',
 *     priority        VARCHAR(10) DEFAULT 'normal',
 *     metadata        JSONB DEFAULT '{}',
 *     deadline        TIMESTAMP WITH TIME ZONE,
 *     started_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
 *     completed_at    TIMESTAMP WITH TIME ZONE,
 *     created_by      UUID NOT NULL
 *   );
 *
 *   CREATE TABLE workflow_actions (
 *     id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
 *     instance_id     UUID NOT NULL REFERENCES workflow_instances(id),
 *     step_index      INTEGER NOT NULL,
 *     action          VARCHAR(20) NOT NULL,
 *     actor_id        UUID NOT NULL,
 *     actor_email     VARCHAR(255) NOT NULL,
 *     actor_role      VARCHAR(50) NOT NULL,
 *     comment         TEXT,
 *     attachments     JSONB DEFAULT '[]',
 *     created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
 *   );
 *
 *   CREATE INDEX idx_wfi_status ON workflow_instances(status);
 *   CREATE INDEX idx_wfi_dossier ON workflow_instances(dossier_id);
 *   CREATE INDEX idx_wfa_instance ON workflow_actions(instance_id);
 */

import { query } from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';
import { publishNotification } from '../config/redis.js';

// ── Types ───────────────────────────────────────────────────────────────────

export type WorkflowStatus = 'pending' | 'in_progress' | 'approved' | 'rejected' | 'cancelled' | 'escalated';
export type WorkflowAction = 'submit' | 'approve' | 'reject' | 'return' | 'escalate' | 'cancel' | 'comment';
export type WorkflowPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface WorkflowStep {
    /** Step order (0-indexed) */
    index: number;
    /** Step display name */
    name: string;
    /** Description */
    description?: string;
    /** Roles that can act on this step */
    requiredRoles: string[];
    /** Optional specific user ID required */
    requiredUserId?: string;
    /** Can this step be skipped? */
    optional?: boolean;
    /** Deadline in hours from step start */
    deadlineHours?: number;
    /** Action needed: approve, validate, sign, etc. */
    actionLabel: string;
}

export interface WorkflowDefinition {
    id?: string;
    type: string;
    name: string;
    description?: string;
    steps: WorkflowStep[];
    createdBy: string;
    createdAt?: Date;
}

export interface WorkflowInstance {
    id: string;
    workflowId: string;
    dossierId: string;
    dossierType: string;
    currentStep: number;
    status: WorkflowStatus;
    priority: WorkflowPriority;
    metadata: Record<string, any>;
    deadline?: Date;
    startedAt: Date;
    completedAt?: Date;
    createdBy: string;
    // Joined
    workflowName?: string;
    steps?: WorkflowStep[];
}

export interface WorkflowActionEntry {
    id?: string;
    instanceId: string;
    stepIndex: number;
    action: WorkflowAction;
    actorId: string;
    actorEmail: string;
    actorRole: string;
    comment?: string;
    attachments?: string[];
    createdAt?: Date;
}

// ── Predefined Workflows ────────────────────────────────────────────────────

export const WORKFLOW_TEMPLATES: Record<string, Omit<WorkflowDefinition, 'id' | 'createdBy'>> = {
    decret: {
        type: 'decret',
        name: 'Circuit Décret Présidentiel',
        description: 'Processus complet de validation d\'un décret présidentiel',
        steps: [
            { index: 0, name: 'Rédaction', requiredRoles: ['sg_ministere', 'directeur_sgg'], actionLabel: 'Soumettre', deadlineHours: 72 },
            { index: 1, name: 'Contrôle Juridique', requiredRoles: ['directeur_sgg', 'conseiller_juridique'], actionLabel: 'Valider', deadlineHours: 48 },
            { index: 2, name: 'Visa SG Gouvernement', requiredRoles: ['directeur_sgg', 'admin_sgg'], actionLabel: 'Apposer visa', deadlineHours: 24 },
            { index: 3, name: 'Approbation SGPR', requiredRoles: ['sgpr'], actionLabel: 'Approuver', deadlineHours: 48 },
            { index: 4, name: 'Signature Présidence', requiredRoles: ['sgpr', 'admin_sgg'], actionLabel: 'Signer' },
            { index: 5, name: 'Publication JO', requiredRoles: ['dgjo', 'admin_sgg'], actionLabel: 'Publier', deadlineHours: 24 },
        ],
    },
    nomination: {
        type: 'nomination',
        name: 'Circuit Nomination',
        description: 'Processus de nomination d\'un responsable gouvernemental',
        steps: [
            { index: 0, name: 'Proposition', requiredRoles: ['ministre', 'sg_ministere'], actionLabel: 'Proposer', deadlineHours: 72 },
            { index: 1, name: 'Examen SGG', requiredRoles: ['directeur_sgg', 'admin_sgg'], actionLabel: 'Examiner', deadlineHours: 48 },
            { index: 2, name: 'Validation SGPR', requiredRoles: ['sgpr'], actionLabel: 'Valider', deadlineHours: 72 },
            { index: 3, name: 'Conseil des Ministres', requiredRoles: ['admin_sgg', 'premier_ministre'], actionLabel: 'Approuver' },
            { index: 4, name: 'Publication', requiredRoles: ['dgjo'], actionLabel: 'Publier', deadlineHours: 24 },
        ],
    },
    rapport: {
        type: 'rapport',
        name: 'Circuit Rapport GAR',
        description: 'Processus de validation d\'un rapport de performance',
        steps: [
            { index: 0, name: 'Soumission', requiredRoles: ['point_focal', 'sg_ministere'], actionLabel: 'Soumettre' },
            { index: 1, name: 'Validation SG', requiredRoles: ['sg_ministere'], actionLabel: 'Valider', deadlineHours: 48 },
            { index: 2, name: 'Contrôle SGG', requiredRoles: ['directeur_sgg', 'admin_sgg'], actionLabel: 'Contrôler', deadlineHours: 72 },
            { index: 3, name: 'Approbation finale', requiredRoles: ['directeur_sgg', 'admin_sgg'], actionLabel: 'Approuver', deadlineHours: 48 },
        ],
    },
    texte_legislatif: {
        type: 'texte_legislatif',
        name: 'Circuit Texte Législatif',
        description: 'Circuit de validation d\'un projet de texte législatif',
        steps: [
            { index: 0, name: 'Rédaction', requiredRoles: ['sg_ministere', 'ministre'], actionLabel: 'Soumettre', deadlineHours: 168 },
            { index: 1, name: 'Examen Interministériel', requiredRoles: ['directeur_sgg'], actionLabel: 'Examiner', deadlineHours: 120 },
            { index: 2, name: 'Arbitrage SGPR', requiredRoles: ['sgpr'], actionLabel: 'Arbitrer', deadlineHours: 72 },
            { index: 3, name: 'Conseil des Ministres', requiredRoles: ['premier_ministre', 'admin_sgg'], actionLabel: 'Adopter' },
            { index: 4, name: 'Transmission Parlement', requiredRoles: ['admin_sgg'], actionLabel: 'Transmettre', deadlineHours: 48 },
        ],
    },
};

// ── Core Functions ──────────────────────────────────────────────────────────

/**
 * Create a workflow definition
 */
export async function createWorkflow(def: WorkflowDefinition): Promise<string> {
    const id = def.id || uuidv4();

    await query(
        `INSERT INTO workflows (id, type, name, description, steps, created_by)
     VALUES ($1, $2, $3, $4, $5, $6)`,
        [id, def.type, def.name, def.description || null, JSON.stringify(def.steps), def.createdBy]
    );

    return id;
}

/**
 * Start a new workflow instance for a dossier
 */
export async function startWorkflow(params: {
    workflowId: string;
    dossierId: string;
    dossierType: string;
    priority?: WorkflowPriority;
    metadata?: Record<string, any>;
    deadline?: Date;
    createdBy: string;
}): Promise<string> {
    const id = uuidv4();

    await query(
        `INSERT INTO workflow_instances
      (id, workflow_id, dossier_id, dossier_type, status, priority, metadata, deadline, created_by)
     VALUES ($1, $2, $3, $4, 'pending', $5, $6, $7, $8)`,
        [
            id,
            params.workflowId,
            params.dossierId,
            params.dossierType,
            params.priority || 'normal',
            JSON.stringify(params.metadata || {}),
            params.deadline?.toISOString() || null,
            params.createdBy,
        ]
    );

    // Notify relevant roles
    try {
        const wf = await getWorkflowDefinition(params.workflowId);
        if (wf && wf.steps.length > 0) {
            const firstStep = wf.steps[0];
            await publishNotification('workflow_started', {
                instanceId: id,
                workflowName: wf.name,
                dossierType: params.dossierType,
                nextStep: firstStep.name,
                requiredRoles: firstStep.requiredRoles,
                priority: params.priority || 'normal',
            });
        }
    } catch { /* notification failure shouldn't block workflow */ }

    return id;
}

/**
 * Process a workflow action (approve, reject, return, etc.)
 */
export async function processAction(params: {
    instanceId: string;
    action: WorkflowAction;
    actorId: string;
    actorEmail: string;
    actorRole: string;
    comment?: string;
    attachments?: string[];
}): Promise<{ success: boolean; nextStep?: WorkflowStep; status: WorkflowStatus }> {
    // Get instance with workflow
    const instanceResult = await query(
        `SELECT wi.*, w.steps, w.name as workflow_name
     FROM workflow_instances wi
     JOIN workflows w ON wi.workflow_id = w.id
     WHERE wi.id = $1`,
        [params.instanceId]
    );

    if (instanceResult.rows.length === 0) {
        throw new Error('Instance de workflow non trouvée');
    }

    const instance = instanceResult.rows[0];
    const steps: WorkflowStep[] = instance.steps;
    const currentStep = steps[instance.current_step];

    if (!currentStep) {
        throw new Error('Étape actuelle invalide');
    }

    // Verify actor has permission for this step
    if (!currentStep.requiredRoles.includes(params.actorRole) &&
        (!currentStep.requiredUserId || currentStep.requiredUserId !== params.actorId)) {
        throw new Error(`Rôle "${params.actorRole}" non autorisé pour cette étape`);
    }

    // Record the action
    await query(
        `INSERT INTO workflow_actions
      (id, instance_id, step_index, action, actor_id, actor_email, actor_role, comment, attachments)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
            uuidv4(),
            params.instanceId,
            instance.current_step,
            params.action,
            params.actorId,
            params.actorEmail,
            params.actorRole,
            params.comment || null,
            JSON.stringify(params.attachments || []),
        ]
    );

    let newStatus: WorkflowStatus = instance.status;
    let nextStep: WorkflowStep | undefined;

    switch (params.action) {
        case 'approve':
        case 'submit':
            // Move to next step
            const nextIndex = instance.current_step + 1;
            if (nextIndex >= steps.length) {
                // All steps completed
                newStatus = 'approved';
                await query(
                    `UPDATE workflow_instances SET status = 'approved', current_step = $1, completed_at = NOW(), updated_at = NOW() WHERE id = $2`,
                    [nextIndex, params.instanceId]
                );
            } else {
                newStatus = 'in_progress';
                nextStep = steps[nextIndex];
                await query(
                    `UPDATE workflow_instances SET status = 'in_progress', current_step = $1, updated_at = NOW() WHERE id = $2`,
                    [nextIndex, params.instanceId]
                );
            }
            break;

        case 'reject':
            newStatus = 'rejected';
            await query(
                `UPDATE workflow_instances SET status = 'rejected', completed_at = NOW(), updated_at = NOW() WHERE id = $1`,
                [params.instanceId]
            );
            break;

        case 'return':
            // Return to previous step
            const prevIndex = Math.max(0, instance.current_step - 1);
            newStatus = 'in_progress';
            nextStep = steps[prevIndex];
            await query(
                `UPDATE workflow_instances SET current_step = $1, updated_at = NOW() WHERE id = $2`,
                [prevIndex, params.instanceId]
            );
            break;

        case 'escalate':
            newStatus = 'escalated';
            await query(
                `UPDATE workflow_instances SET status = 'escalated', priority = 'urgent', updated_at = NOW() WHERE id = $1`,
                [params.instanceId]
            );
            break;

        case 'cancel':
            newStatus = 'cancelled';
            await query(
                `UPDATE workflow_instances SET status = 'cancelled', completed_at = NOW(), updated_at = NOW() WHERE id = $1`,
                [params.instanceId]
            );
            break;

        case 'comment':
            // Comment only, no status change
            break;
    }

    // Notify
    try {
        await publishNotification('workflow_action', {
            instanceId: params.instanceId,
            workflowName: instance.workflow_name,
            action: params.action,
            actorEmail: params.actorEmail,
            stepName: currentStep.name,
            newStatus,
            nextStep: nextStep?.name,
        });
    } catch { /* silent */ }

    return { success: true, nextStep, status: newStatus };
}

/**
 * Get workflow definition by ID
 */
async function getWorkflowDefinition(workflowId: string): Promise<WorkflowDefinition | null> {
    const result = await query(`SELECT * FROM workflows WHERE id = $1`, [workflowId]);
    if (result.rows.length === 0) return null;

    const row = result.rows[0];
    return {
        id: row.id,
        type: row.type,
        name: row.name,
        description: row.description,
        steps: row.steps,
        createdBy: row.created_by,
        createdAt: row.created_at,
    };
}

/**
 * Get workflow instance with full history
 */
export async function getWorkflowInstance(instanceId: string): Promise<WorkflowInstance & { history: WorkflowActionEntry[] }> {
    const instanceResult = await query(
        `SELECT wi.*, w.name as workflow_name, w.steps
     FROM workflow_instances wi
     JOIN workflows w ON wi.workflow_id = w.id
     WHERE wi.id = $1`,
        [instanceId]
    );

    if (instanceResult.rows.length === 0) {
        throw new Error('Instance non trouvée');
    }

    const row = instanceResult.rows[0];

    const historyResult = await query(
        `SELECT * FROM workflow_actions WHERE instance_id = $1 ORDER BY created_at ASC`,
        [instanceId]
    );

    return {
        id: row.id,
        workflowId: row.workflow_id,
        dossierId: row.dossier_id,
        dossierType: row.dossier_type,
        currentStep: row.current_step,
        status: row.status,
        priority: row.priority,
        metadata: row.metadata,
        deadline: row.deadline,
        startedAt: row.started_at,
        completedAt: row.completed_at,
        createdBy: row.created_by,
        workflowName: row.workflow_name,
        steps: row.steps,
        history: historyResult.rows.map((h: any) => ({
            id: h.id,
            instanceId: h.instance_id,
            stepIndex: h.step_index,
            action: h.action,
            actorId: h.actor_id,
            actorEmail: h.actor_email,
            actorRole: h.actor_role,
            comment: h.comment,
            attachments: h.attachments,
            createdAt: h.created_at,
        })),
    };
}

/**
 * List workflow instances with filters
 */
export async function listWorkflowInstances(filters: {
    status?: WorkflowStatus;
    dossierType?: string;
    priority?: WorkflowPriority;
    assignedRole?: string;
    createdBy?: string;
    limit?: number;
    offset?: number;
}): Promise<{ instances: WorkflowInstance[]; total: number }> {
    const conditions: string[] = [];
    const params: any[] = [];
    let idx = 1;

    if (filters.status) {
        conditions.push(`wi.status = $${idx++}`);
        params.push(filters.status);
    }
    if (filters.dossierType) {
        conditions.push(`wi.dossier_type = $${idx++}`);
        params.push(filters.dossierType);
    }
    if (filters.priority) {
        conditions.push(`wi.priority = $${idx++}`);
        params.push(filters.priority);
    }
    if (filters.createdBy) {
        conditions.push(`wi.created_by = $${idx++}`);
        params.push(filters.createdBy);
    }

    // For role-based filtering: check if current step's required roles include the filter
    if (filters.assignedRole) {
        conditions.push(`w.steps->wi.current_step->>'requiredRoles' LIKE $${idx++}`);
        params.push(`%${filters.assignedRole}%`);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const limit = Math.min(filters.limit || 50, 200);
    const offset = filters.offset || 0;

    const countResult = await query(
        `SELECT COUNT(*) as total FROM workflow_instances wi JOIN workflows w ON wi.workflow_id = w.id ${where}`,
        params
    );

    const result = await query(
        `SELECT wi.*, w.name as workflow_name, w.steps
     FROM workflow_instances wi
     JOIN workflows w ON wi.workflow_id = w.id
     ${where}
     ORDER BY wi.started_at DESC
     LIMIT $${idx++} OFFSET $${idx++}`,
        [...params, limit, offset]
    );

    return {
        instances: result.rows.map((r: any) => ({
            id: r.id,
            workflowId: r.workflow_id,
            dossierId: r.dossier_id,
            dossierType: r.dossier_type,
            currentStep: r.current_step,
            status: r.status,
            priority: r.priority,
            metadata: r.metadata,
            deadline: r.deadline,
            startedAt: r.started_at,
            completedAt: r.completed_at,
            createdBy: r.created_by,
            workflowName: r.workflow_name,
            steps: r.steps,
        })),
        total: parseInt(countResult.rows[0]?.total || '0'),
    };
}

/**
 * Check for overdue workflow instances and escalate them
 */
export async function checkAndEscalateOverdue(): Promise<number> {
    const result = await query(
        `UPDATE workflow_instances
     SET status = 'escalated', priority = 'urgent', updated_at = NOW()
     WHERE status IN ('pending', 'in_progress')
       AND deadline IS NOT NULL
       AND deadline < NOW()
     RETURNING id`
    );

    const count = result.rowCount || 0;
    if (count > 0) {
        console.log(`[Workflow] ⚠️ ${count} workflow(s) escaladé(s) pour dépassement de deadline`);

        try {
            await publishNotification('workflow_escalated', {
                count,
                ids: result.rows.map((r: any) => r.id),
            });
        } catch { /* silent */ }
    }

    return count;
}
