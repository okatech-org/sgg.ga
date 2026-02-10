/**
 * NEOCORTEX — 🧠 Middleware Auto-Signal
 * Intercepte automatiquement les mutations (POST/PUT/PATCH/DELETE)
 * pour émettre des signaux limbiques et loguer dans l'hippocampe.
 *
 * Usage dans server.ts:
 *   app.use('/api/gar', neocortexMiddleware('gar'));
 */

import { Request, Response, NextFunction } from 'express';
import { emettreSignalMetier } from './limbique.js';
import { loguerAction } from './hippocampe.js';
import {
    SIGNAL_TYPES,
    SignalType,
    CATEGORIES_ACTION,
    genererCorrelationId,
    determinerCategorie,
} from './types.js';

// Type de la requête authentifiée (de votre middleware auth existant)
interface AuthenticatedRequest extends Request {
    user?: {
        userId: string;
        email: string;
        role: string;
    };
}

// ============================================================================
// MAPPING MODULE → SIGNAUX
// ============================================================================

/** Détermine le type de signal à émettre en fonction du module et de la méthode HTTP */
const SIGNAL_MAP: Record<string, Record<string, SignalType>> = {
    gar: {
        POST: SIGNAL_TYPES.GAR_OBJECTIF_CREE,
        PUT: SIGNAL_TYPES.GAR_OBJECTIF_MODIFIE,
        PATCH: SIGNAL_TYPES.GAR_OBJECTIF_MODIFIE,
        DELETE: SIGNAL_TYPES.GAR_OBJECTIF_SUPPRIME,
    },
    nominations: {
        POST: SIGNAL_TYPES.NOMINATION_CREEE,
        PUT: SIGNAL_TYPES.NOMINATION_MODIFIEE,
        PATCH: SIGNAL_TYPES.NOMINATION_TRANSITION,
        DELETE: SIGNAL_TYPES.NOMINATION_REJETEE,
    },
    legislatif: {
        POST: SIGNAL_TYPES.TEXTE_LEGISLATIF_CREE,
        PUT: SIGNAL_TYPES.TEXTE_LEGISLATIF_MODIFIE,
        PATCH: SIGNAL_TYPES.TEXTE_LEGISLATIF_SOUMIS,
    },
    egop: {
        POST: SIGNAL_TYPES.EGOP_CI_PLANIFIE,
        PUT: SIGNAL_TYPES.EGOP_CI_MODIFIE,
        PATCH: SIGNAL_TYPES.EGOP_CI_MODIFIE,
    },
    jo: {
        POST: SIGNAL_TYPES.JO_TEXTE_AJOUTE,
        PUT: SIGNAL_TYPES.JO_TEXTE_AJOUTE,
    },
    ptm: {
        POST: SIGNAL_TYPES.PTM_INITIATIVE_CREEE,
        PUT: SIGNAL_TYPES.PTM_INITIATIVE_SOUMISE,
        PATCH: SIGNAL_TYPES.PTM_INITIATIVE_SOUMISE,
    },
    institutions: {
        POST: SIGNAL_TYPES.INSTITUTION_CREEE,
        PUT: SIGNAL_TYPES.INSTITUTION_MODIFIEE,
        PATCH: SIGNAL_TYPES.INSTITUTION_MODIFIEE,
    },
    workflows: {
        POST: SIGNAL_TYPES.WORKFLOW_DEMARRE,
        PUT: SIGNAL_TYPES.WORKFLOW_APPROUVE,
        PATCH: SIGNAL_TYPES.WORKFLOW_APPROUVE,
    },
};

/** Détermine l'action humaine à écrire dans l'hippocampe */
function actionPourMethode(method: string): string {
    switch (method) {
        case 'POST': return 'CREER';
        case 'PUT': return 'MODIFIER';
        case 'PATCH': return 'MODIFIER';
        case 'DELETE': return 'SUPPRIMER';
        default: return method;
    }
}

// ============================================================================
// MIDDLEWARE
// ============================================================================

/**
 * Middleware NEOCORTEX pour un module donné.
 * N'intercepte que les mutations (POST/PUT/PATCH/DELETE).
 * Pour les GET, passe directement au handler.
 */
export function neocortexMiddleware(module: string) {
    return (req: Request, res: Response, next: NextFunction): void => {
        // Ignorer les lectures
        if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') {
            return next();
        }

        const authReq = req as AuthenticatedRequest;
        const correlationId = genererCorrelationId();
        const startTime = Date.now();

        // Stocker le correlationId dans la request pour l'utiliser dans le handler
        (req as any).__neocortex = {
            correlationId,
            module,
            startTime,
        };

        // Capturer la réponse pour loguer après le handler
        const originalJson = res.json.bind(res);
        res.json = function (body: any) {
            const durationMs = Date.now() - startTime;
            const succes = res.statusCode >= 200 && res.statusCode < 300;

            // Émission asynchrone — ne bloque jamais la réponse
            setImmediate(async () => {
                try {
                    const signalType = SIGNAL_MAP[module]?.[req.method];
                    const entiteId = req.params?.id || body?.data?.id || body?.id || '';

                    // 1. Émettre le signal limbique
                    if (signalType) {
                        await emettreSignalMetier(
                            signalType,
                            module,
                            String(entiteId),
                            {
                                method: req.method,
                                path: req.path,
                                statusCode: res.statusCode,
                                body: succes ? (req.body || {}) : undefined,
                            },
                            { correlationId }
                        );
                    }

                    // 2. Loguer dans l'hippocampe
                    await loguerAction({
                        action: actionPourMethode(req.method),
                        categorie: determinerCategorie(signalType || ''),
                        entiteType: module,
                        entiteId: String(entiteId),
                        userId: authReq.user?.userId,
                        userEmail: authReq.user?.email,
                        userRole: authReq.user?.role,
                        details: {
                            method: req.method,
                            path: req.path,
                            statusCode: res.statusCode,
                            ...(succes && req.body ? { apres: req.body } : {}),
                            ...(!succes ? { erreur: body?.error } : {}),
                        },
                        metadata: {
                            ip: req.ip,
                            userAgent: req.get('user-agent'),
                        },
                        correlationId,
                        durationMs,
                    });
                } catch (error) {
                    // Le NEOCORTEX ne doit JAMAIS bloquer l'API
                    console.error(`[NEOCORTEX Middleware] Erreur post-response:`, error);
                }
            });

            return originalJson(body);
        };

        next();
    };
}

/**
 * Index module — export tout le NEOCORTEX depuis un seul point.
 */
export { neocortexMiddleware as default };
