/**
 * SGG Digital — Routes API pour l'Authentification 2FA
 *
 * Endpoints :
 *   POST /api/auth/2fa/setup      → Initier la configuration 2FA
 *   POST /api/auth/2fa/activate   → Activer le 2FA après vérification du code
 *   POST /api/auth/2fa/verify     → Vérifier un code TOTP à la connexion
 *   POST /api/auth/2fa/disable    → Désactiver le 2FA
 *   GET  /api/auth/2fa/status     → Statut 2FA de l'utilisateur
 *   POST /api/auth/2fa/recovery   → Régénérer les codes de récupération
 */

import { Router, Request, Response } from 'express';
import {
    setup2FA,
    activate2FA,
    verify2FA,
    disable2FA,
    get2FAStatus,
    regenerateRecoveryCodes,
} from '../services/twoFactor.js';
import type { AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

/**
 * POST /api/auth/2fa/setup
 * Initier la configuration 2FA — retourne le secret, URI pour QR, et codes de récupération
 */
router.post('/setup', async (req: Request, res: Response): Promise<void> => {
    try {
        const authReq = req as AuthenticatedRequest;
        if (!authReq.user) {
            res.status(401).json({ error: 'Authentication required' });
            return;
        }

        const result = await setup2FA(authReq.user.userId, authReq.user.email);

        res.json({
            success: true,
            data: {
                secret: result.secret,
                uri: result.uri,
                recoveryCodes: result.recoveryCodes,
                instructions: {
                    fr: 'Scannez le QR code avec votre application d\'authentification (Google Authenticator, Authy, etc.)',
                    en: 'Scan the QR code with your authenticator app (Google Authenticator, Authy, etc.)',
                },
            },
        });
    } catch (error) {
        console.error('[2FA Route] Erreur setup:', error);
        res.status(500).json({ error: 'Erreur lors de la configuration 2FA' });
    }
});

/**
 * POST /api/auth/2fa/activate
 * Activer le 2FA en vérifiant un code TOTP
 * Body: { code: "123456" }
 */
router.post('/activate', async (req: Request, res: Response): Promise<void> => {
    try {
        const authReq = req as AuthenticatedRequest;
        if (!authReq.user) {
            res.status(401).json({ error: 'Authentication required' });
            return;
        }

        const { code } = req.body;
        if (!code || typeof code !== 'string' || code.length !== 6) {
            res.status(400).json({ error: 'Code TOTP invalide (6 chiffres requis)' });
            return;
        }

        const activated = await activate2FA(authReq.user.userId, code);

        if (activated) {
            res.json({
                success: true,
                message: 'Authentification à deux facteurs activée avec succès',
            });
        } else {
            res.status(400).json({
                success: false,
                error: 'Code invalide. Veuillez réessayer avec un nouveau code depuis votre application.',
            });
        }
    } catch (error) {
        console.error('[2FA Route] Erreur activation:', error);
        res.status(500).json({ error: 'Erreur lors de l\'activation 2FA' });
    }
});

/**
 * POST /api/auth/2fa/verify
 * Vérifier un code TOTP lors de la connexion
 * Body: { userId: "uuid", code: "123456" }
 */
router.post('/verify', async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId, code } = req.body;

        if (!userId || !code) {
            res.status(400).json({ error: 'userId et code requis' });
            return;
        }

        const result = await verify2FA(userId, code);

        if (result.valid) {
            const response: Record<string, unknown> = {
                success: true,
                verified: true,
            };

            if (result.usedRecoveryCode) {
                response.warning = `Code de récupération utilisé. ${result.remainingRecoveryCodes} code(s) restant(s).`;
                response.remainingRecoveryCodes = result.remainingRecoveryCodes;
            }

            res.json(response);
        } else {
            res.status(401).json({
                success: false,
                verified: false,
                error: 'Code invalide',
            });
        }
    } catch (error) {
        console.error('[2FA Route] Erreur vérification:', error);
        res.status(500).json({ error: 'Erreur lors de la vérification 2FA' });
    }
});

/**
 * POST /api/auth/2fa/disable
 * Désactiver le 2FA (nécessite un code TOTP valide)
 * Body: { code: "123456" }
 */
router.post('/disable', async (req: Request, res: Response): Promise<void> => {
    try {
        const authReq = req as AuthenticatedRequest;
        if (!authReq.user) {
            res.status(401).json({ error: 'Authentication required' });
            return;
        }

        const { code } = req.body;
        if (!code) {
            res.status(400).json({ error: 'Code TOTP requis pour désactiver le 2FA' });
            return;
        }

        // Verify current code before disabling
        const verification = await verify2FA(authReq.user.userId, code);
        if (!verification.valid) {
            res.status(401).json({ error: 'Code invalide — impossible de désactiver le 2FA' });
            return;
        }

        await disable2FA(authReq.user.userId);

        res.json({
            success: true,
            message: 'Authentification à deux facteurs désactivée',
        });
    } catch (error) {
        console.error('[2FA Route] Erreur désactivation:', error);
        res.status(500).json({ error: 'Erreur lors de la désactivation 2FA' });
    }
});

/**
 * GET /api/auth/2fa/status
 * Obtenir le statut 2FA de l'utilisateur connecté
 */
router.get('/status', async (req: Request, res: Response): Promise<void> => {
    try {
        const authReq = req as AuthenticatedRequest;
        if (!authReq.user) {
            res.status(401).json({ error: 'Authentication required' });
            return;
        }

        const status = await get2FAStatus(authReq.user.userId);

        res.json({
            success: true,
            data: status,
        });
    } catch (error) {
        console.error('[2FA Route] Erreur statut:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération du statut 2FA' });
    }
});

/**
 * POST /api/auth/2fa/recovery
 * Régénérer les codes de récupération (nécessite un code TOTP valide)
 * Body: { code: "123456" }
 */
router.post('/recovery', async (req: Request, res: Response): Promise<void> => {
    try {
        const authReq = req as AuthenticatedRequest;
        if (!authReq.user) {
            res.status(401).json({ error: 'Authentication required' });
            return;
        }

        const { code } = req.body;
        if (!code) {
            res.status(400).json({ error: 'Code TOTP requis' });
            return;
        }

        // Verify current code first
        const verification = await verify2FA(authReq.user.userId, code);
        if (!verification.valid) {
            res.status(401).json({ error: 'Code invalide' });
            return;
        }

        const newCodes = await regenerateRecoveryCodes(authReq.user.userId);

        res.json({
            success: true,
            data: {
                recoveryCodes: newCodes,
                message: 'Nouveaux codes de récupération générés. Conservez-les en lieu sûr.',
            },
        });
    } catch (error) {
        console.error('[2FA Route] Erreur régénération:', error);
        res.status(500).json({ error: 'Erreur lors de la régénération des codes' });
    }
});

export default router;
