/**
 * SGG Digital — Service de Monitoring Frontend
 *
 * Collecte les erreurs du logger et les envoie périodiquement au backend
 * pour centralisation dans un système de monitoring (Cloud Logging, Sentry, etc.).
 *
 * Usage:
 *   import { monitoring } from '@/services/monitoring';
 *   monitoring.start();   // Démarre le flush périodique
 *   monitoring.stop();    // Arrête le flush
 *   monitoring.flush();   // Force un envoi immédiat
 *
 * Le monitoring capture aussi :
 *   - Les erreurs JavaScript globales (window.onerror)
 *   - Les rejections de promesses non gérées
 *   - Les métriques de navigation (Core Web Vitals via PerformanceObserver)
 */

import { logger } from '@/services/logger';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080';
const FLUSH_INTERVAL_MS = 30_000; // 30 secondes
const MAX_BATCH_SIZE = 20;

interface MonitoringEvent {
    type: 'error' | 'performance' | 'navigation';
    timestamp: string;
    data: Record<string, unknown>;
    url: string;
    userAgent: string;
}

class MonitoringService {
    private flushTimer: ReturnType<typeof setInterval> | null = null;
    private eventBuffer: MonitoringEvent[] = [];
    private isStarted = false;

    /**
     * Start monitoring — call once in app initialization (main.tsx)
     */
    start() {
        if (this.isStarted) return;
        this.isStarted = true;

        // ── Global error handler ───────────────────────────────────────────
        window.addEventListener('error', (event) => {
            this.captureError({
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                stack: event.error?.stack?.slice(0, 1000),
            });
        });

        // ── Unhandled promise rejections ───────────────────────────────────
        window.addEventListener('unhandledrejection', (event) => {
            this.captureError({
                message: `Unhandled rejection: ${String(event.reason)}`,
                stack: event.reason?.stack?.slice(0, 1000),
            });
        });

        // ── Core Web Vitals (LCP, FID, CLS) ───────────────────────────────
        this.observeWebVitals();

        // ── Periodic flush ────────────────────────────────────────────────
        this.flushTimer = setInterval(() => this.flush(), FLUSH_INTERVAL_MS);

        // ── Flush on page unload ──────────────────────────────────────────
        window.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden') {
                this.flush();
            }
        });

        logger.info('Monitoring service started');
    }

    /**
     * Stop monitoring
     */
    stop() {
        if (this.flushTimer) {
            clearInterval(this.flushTimer);
            this.flushTimer = null;
        }
        this.isStarted = false;
    }

    /**
     * Capture a custom error event
     */
    captureError(data: Record<string, unknown>) {
        this.pushEvent('error', data);
    }

    /**
     * Capture a performance metric
     */
    capturePerformance(data: Record<string, unknown>) {
        this.pushEvent('performance', data);
    }

    /**
     * Flush all buffered events + logger entries to the backend
     */
    async flush() {
        // Merge logger buffer entries
        const logEntries = logger.getBufferedEntries();
        const logEvents: MonitoringEvent[] = logEntries.map((entry) => ({
            type: 'error' as const,
            timestamp: entry.timestamp,
            data: {
                level: entry.level,
                message: entry.message,
                module: entry.module,
                ...entry.context,
            },
            url: window.location.href,
            userAgent: navigator.userAgent,
        }));

        const allEvents = [...this.eventBuffer, ...logEvents].slice(0, MAX_BATCH_SIZE);

        if (allEvents.length === 0) return;

        // Clear buffers optimistically
        this.eventBuffer = [];
        logger.clearBuffer();

        try {
            const response = await fetch(`${API_BASE}/api/monitoring/events`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    events: allEvents,
                    app: 'sgg-digital',
                    version: import.meta.env.VITE_APP_VERSION || '0.0.0',
                }),
                // Use keepalive for page unload scenarios
                keepalive: true,
            });

            if (!response.ok) {
                // Re-buffer events on failure (drop oldest if too many)
                this.eventBuffer = allEvents.slice(-10);
            }
        } catch {
            // Network error — re-buffer
            this.eventBuffer = allEvents.slice(-10);
        }
    }

    // ── Private helpers ───────────────────────────────────────────────────

    private pushEvent(type: MonitoringEvent['type'], data: Record<string, unknown>) {
        this.eventBuffer.push({
            type,
            timestamp: new Date().toISOString(),
            data,
            url: window.location.href,
            userAgent: navigator.userAgent,
        });

        // Prevent unbounded growth
        if (this.eventBuffer.length > MAX_BATCH_SIZE * 2) {
            this.eventBuffer = this.eventBuffer.slice(-MAX_BATCH_SIZE);
        }
    }

    private observeWebVitals() {
        if (typeof PerformanceObserver === 'undefined') return;

        try {
            // Largest Contentful Paint
            const lcpObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                const lastEntry = entries[entries.length - 1];
                if (lastEntry) {
                    this.capturePerformance({
                        metric: 'LCP',
                        value: Math.round(lastEntry.startTime),
                        unit: 'ms',
                    });
                }
            });
            lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });

            // First Input Delay
            const fidObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries() as PerformanceEventTiming[];
                entries.forEach((entry) => {
                    this.capturePerformance({
                        metric: 'FID',
                        value: Math.round(entry.processingStart - entry.startTime),
                        unit: 'ms',
                    });
                });
            });
            fidObserver.observe({ type: 'first-input', buffered: true });

            // Cumulative Layout Shift
            const clsObserver = new PerformanceObserver((list) => {
                let clsScore = 0;
                list.getEntries().forEach((entry: any) => {
                    if (!entry.hadRecentInput) {
                        clsScore += entry.value;
                    }
                });
                if (clsScore > 0) {
                    this.capturePerformance({
                        metric: 'CLS',
                        value: Math.round(clsScore * 1000) / 1000,
                        unit: 'score',
                    });
                }
            });
            clsObserver.observe({ type: 'layout-shift', buffered: true });
        } catch {
            // PerformanceObserver not supported for these types
        }
    }
}

export const monitoring = new MonitoringService();
