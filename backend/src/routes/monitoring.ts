/**
 * SGG Digital - Monitoring Routes
 *
 * Reçoit les events du service de monitoring frontend
 * (erreurs JS, Web Vitals, logs bufferés) et les stocke/forward.
 *
 * En production, ces events seraient forwardés vers Cloud Logging,
 * Sentry, ou Datadog. Ici on les log via Winston.
 */

import { Router, Request, Response } from 'express';

const router = Router();

interface MonitoringEvent {
    type: 'error' | 'performance' | 'navigation';
    timestamp: string;
    data: Record<string, unknown>;
    url: string;
    userAgent: string;
}

interface MonitoringPayload {
    events: MonitoringEvent[];
    app: string;
    version: string;
}

/**
 * POST /api/monitoring/events
 * Receive frontend monitoring events
 * No auth required — events include no sensitive data
 */
router.post('/events', (req: Request, res: Response) => {
    try {
        const payload: MonitoringPayload = req.body;

        if (!payload.events || !Array.isArray(payload.events)) {
            return res.status(400).json({
                success: false,
                error: { code: 'INVALID_PAYLOAD', message: 'Invalid events payload' },
            });
        }

        // Process events
        const errorCount = payload.events.filter((e) => e.type === 'error').length;
        const perfCount = payload.events.filter((e) => e.type === 'performance').length;

        // Log errors to stderr (picked up by Cloud Logging)
        payload.events
            .filter((e) => e.type === 'error')
            .forEach((event) => {
                console.error('[FRONTEND_ERROR]', JSON.stringify({
                    app: payload.app,
                    version: payload.version,
                    timestamp: event.timestamp,
                    url: event.url,
                    ...event.data,
                }));
            });

        // Log performance metrics to stdout
        payload.events
            .filter((e) => e.type === 'performance')
            .forEach((event) => {
                console.log('[WEB_VITAL]', JSON.stringify({
                    app: payload.app,
                    timestamp: event.timestamp,
                    ...event.data,
                }));
            });

        res.json({
            success: true,
            received: payload.events.length,
            errors: errorCount,
            performance: perfCount,
        });
    } catch (error) {
        console.error('Monitoring events error:', error);
        res.status(500).json({
            success: false,
            error: { code: 'MONITORING_ERROR', message: 'Failed to process events' },
        });
    }
});

/**
 * GET /api/monitoring/status
 * Quick status check for monitoring
 */
router.get('/status', (req: Request, res: Response) => {
    res.json({
        success: true,
        data: {
            service: 'sgg-digital-monitoring',
            status: 'active',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
        },
    });
});

export default router;
