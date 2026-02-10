/**
 * SGG Digital — Service de Performance Monitoring (Core Web Vitals)
 *
 * Mesure et rapporte les métriques de performance Web :
 *   - LCP  (Largest Contentful Paint)
 *   - FID  (First Input Delay)
 *   - INP  (Interaction to Next Paint)
 *   - CLS  (Cumulative Layout Shift)
 *   - FCP  (First Contentful Paint)
 *   - TTFB (Time to First Byte)
 *
 * Les métriques sont :
 *   1. Mesurées via l'API Performance Observer
 *   2. Agrégées en local
 *   3. Envoyées au backend /api/monitoring
 *   4. Rendues accessibles via un hook React
 *
 * Seuils selon Google Web Vitals (https://web.dev/vitals/) :
 *   - LCP  : bon < 2.5s, à améliorer < 4s
 *   - FID  : bon < 100ms, à améliorer < 300ms
 *   - INP  : bon < 200ms, à améliorer < 500ms
 *   - CLS  : bon < 0.1, à améliorer < 0.25
 *   - FCP  : bon < 1.8s, à améliorer < 3s
 *   - TTFB : bon < 800ms, à améliorer < 1.8s
 */

// ── Types ───────────────────────────────────────────────────────────────────

export type MetricName = 'LCP' | 'FID' | 'INP' | 'CLS' | 'FCP' | 'TTFB';
export type MetricRating = 'good' | 'needs-improvement' | 'poor';

export interface WebVitalMetric {
    name: MetricName;
    value: number;
    rating: MetricRating;
    delta: number;
    id: string;
    navigationType: string;
    url: string;
    timestamp: number;
}

export interface PerformanceSnapshot {
    metrics: Record<MetricName, WebVitalMetric | null>;
    score: number;  // 0-100
    rating: MetricRating;
    navigation: NavigationMetrics;
    resources: ResourceMetrics;
    memory?: MemoryMetrics;
    timestamp: number;
}

interface NavigationMetrics {
    domContentLoaded: number;
    loadComplete: number;
    domInteractive: number;
    redirectTime: number;
    dnsLookup: number;
    tcpConnect: number;
    serverResponse: number;
    domParsing: number;
}

interface ResourceMetrics {
    totalResources: number;
    totalTransferSize: number;
    totalDecodedSize: number;
    byType: Record<string, { count: number; size: number }>;
    slowestResources: { name: string; duration: number; size: number }[];
}

interface MemoryMetrics {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
    usagePercent: number;
}

// ── Thresholds ──────────────────────────────────────────────────────────────

const THRESHOLDS: Record<MetricName, { good: number; poor: number }> = {
    LCP: { good: 2500, poor: 4000 },    // ms
    FID: { good: 100, poor: 300 },     // ms
    INP: { good: 200, poor: 500 },     // ms
    CLS: { good: 0.1, poor: 0.25 },   // score
    FCP: { good: 1800, poor: 3000 },    // ms
    TTFB: { good: 800, poor: 1800 },   // ms
};

// ── State ───────────────────────────────────────────────────────────────────

const metrics: Partial<Record<MetricName, WebVitalMetric>> = {};
const observers: PerformanceObserver[] = [];
const listeners: Set<(metric: WebVitalMetric) => void> = new Set();
let reportingInterval: NodeJS.Timeout | null = null;
let isInitialized = false;

// ── Rating Calculation ──────────────────────────────────────────────────────

function getRating(name: MetricName, value: number): MetricRating {
    const threshold = THRESHOLDS[name];
    if (value <= threshold.good) return 'good';
    if (value <= threshold.poor) return 'needs-improvement';
    return 'poor';
}

function generateId(): string {
    return `v${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// ── Observers ───────────────────────────────────────────────────────────────

function observeMetric(type: string, callback: (entries: PerformanceEntryList) => void): void {
    try {
        const observer = new PerformanceObserver((list) => {
            callback(list.getEntries());
        });
        observer.observe({ type, buffered: true });
        observers.push(observer);
    } catch {
        // Observer type not supported
    }
}

function recordMetric(name: MetricName, value: number, delta?: number): void {
    const metric: WebVitalMetric = {
        name,
        value: Math.round(name === 'CLS' ? value * 1000 : value) / (name === 'CLS' ? 1000 : 1),
        rating: getRating(name, value),
        delta: delta || value,
        id: generateId(),
        navigationType: getNavigationType(),
        url: window.location.href,
        timestamp: Date.now(),
    };

    metrics[name] = metric;

    // Notify listeners
    for (const listener of listeners) {
        try { listener(metric); } catch { /* ignore */ }
    }
}

function getNavigationType(): string {
    try {
        const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        return nav?.type || 'navigate';
    } catch {
        return 'unknown';
    }
}

// ── Initialize Observers ────────────────────────────────────────────────────

/**
 * Initialize all Core Web Vitals observers.
 * Call once at application startup.
 */
export function initPerformanceMonitoring(): void {
    if (isInitialized || typeof window === 'undefined') return;
    isInitialized = true;

    // LCP — Largest Contentful Paint
    observeMetric('largest-contentful-paint', (entries) => {
        const lastEntry = entries[entries.length - 1] as any;
        if (lastEntry) {
            recordMetric('LCP', lastEntry.startTime);
        }
    });

    // FID — First Input Delay
    observeMetric('first-input', (entries) => {
        const firstEntry = entries[0] as any;
        if (firstEntry) {
            recordMetric('FID', firstEntry.processingStart - firstEntry.startTime);
        }
    });

    // INP — Interaction to Next Paint
    observeMetric('event', (entries) => {
        let worstINP = 0;
        for (const entry of entries) {
            const e = entry as any;
            const duration = e.duration || 0;
            if (duration > worstINP) {
                worstINP = duration;
            }
        }
        if (worstINP > 0) {
            recordMetric('INP', worstINP);
        }
    });

    // CLS — Cumulative Layout Shift
    let clsValue = 0;
    let sessionValue = 0;
    let sessionEntries: any[] = [];

    observeMetric('layout-shift', (entries) => {
        for (const entry of entries) {
            const e = entry as any;
            if (e.hadRecentInput) continue; // Ignore user-initiated shifts

            const firstSessionEntry = sessionEntries[0];
            const lastSessionEntry = sessionEntries[sessionEntries.length - 1];

            if (sessionValue &&
                e.startTime - lastSessionEntry?.startTime < 1000 &&
                e.startTime - firstSessionEntry?.startTime < 5000) {
                sessionValue += e.value;
                sessionEntries.push(e);
            } else {
                sessionValue = e.value;
                sessionEntries = [e];
            }

            if (sessionValue > clsValue) {
                clsValue = sessionValue;
                recordMetric('CLS', clsValue);
            }
        }
    });

    // FCP — First Contentful Paint
    observeMetric('paint', (entries) => {
        for (const entry of entries) {
            if (entry.name === 'first-contentful-paint') {
                recordMetric('FCP', entry.startTime);
            }
        }
    });

    // TTFB — Time to First Byte
    try {
        const navEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        if (navEntry) {
            recordMetric('TTFB', navEntry.responseStart - navEntry.requestStart);
        }
    } catch { /* ignore */ }

    // Start periodic reporting
    reportingInterval = setInterval(reportMetrics, 60_000); // Every 60s

    // Report on page unload
    if (typeof document !== 'undefined') {
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden') {
                reportMetrics();
            }
        });
    }

    console.log('[Perf] ✅ Core Web Vitals monitoring initialized');
}

/**
 * Stop all observers and reporting
 */
export function stopPerformanceMonitoring(): void {
    for (const observer of observers) {
        observer.disconnect();
    }
    observers.length = 0;

    if (reportingInterval) {
        clearInterval(reportingInterval);
        reportingInterval = null;
    }

    isInitialized = false;
}

// ── Reporting ───────────────────────────────────────────────────────────────

async function reportMetrics(): Promise<void> {
    if (Object.keys(metrics).length === 0) return;

    const payload = {
        type: 'web_vitals',
        metrics: Object.values(metrics).map(m => ({
            name: m.name,
            value: m.value,
            rating: m.rating,
            navigationType: m.navigationType,
        })),
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: Date.now(),
    };

    try {
        const apiUrl = import.meta.env.VITE_API_URL || '';
        if (!apiUrl) return;

        // Use sendBeacon for reliability on unload
        if (navigator.sendBeacon) {
            navigator.sendBeacon(
                `${apiUrl}/api/monitoring`,
                JSON.stringify(payload)
            );
        } else {
            fetch(`${apiUrl}/api/monitoring`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
                keepalive: true,
            }).catch(() => { /* silent */ });
        }
    } catch {
        // Reporting should never fail the app
    }
}

// ── Snapshot ─────────────────────────────────────────────────────────────────

/**
 * Get a complete performance snapshot
 */
export function getPerformanceSnapshot(): PerformanceSnapshot {
    const metricMap: Record<MetricName, WebVitalMetric | null> = {
        LCP: metrics.LCP || null,
        FID: metrics.FID || null,
        INP: metrics.INP || null,
        CLS: metrics.CLS || null,
        FCP: metrics.FCP || null,
        TTFB: metrics.TTFB || null,
    };

    // Calculate overall score (0-100)
    const scores = Object.values(metricMap)
        .filter((m): m is WebVitalMetric => m !== null)
        .map(m => {
            if (m.rating === 'good') return 100;
            if (m.rating === 'needs-improvement') return 60;
            return 30;
        });

    const avgScore = scores.length > 0
        ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
        : 0;

    return {
        metrics: metricMap,
        score: avgScore,
        rating: avgScore >= 80 ? 'good' : avgScore >= 50 ? 'needs-improvement' : 'poor',
        navigation: getNavigationMetrics(),
        resources: getResourceMetrics(),
        memory: getMemoryMetrics(),
        timestamp: Date.now(),
    };
}

function getNavigationMetrics(): NavigationMetrics {
    try {
        const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        if (!nav) return defaultNavigationMetrics();

        return {
            domContentLoaded: Math.round(nav.domContentLoadedEventEnd - nav.startTime),
            loadComplete: Math.round(nav.loadEventEnd - nav.startTime),
            domInteractive: Math.round(nav.domInteractive - nav.startTime),
            redirectTime: Math.round(nav.redirectEnd - nav.redirectStart),
            dnsLookup: Math.round(nav.domainLookupEnd - nav.domainLookupStart),
            tcpConnect: Math.round(nav.connectEnd - nav.connectStart),
            serverResponse: Math.round(nav.responseStart - nav.requestStart),
            domParsing: Math.round(nav.domInteractive - nav.responseEnd),
        };
    } catch {
        return defaultNavigationMetrics();
    }
}

function defaultNavigationMetrics(): NavigationMetrics {
    return {
        domContentLoaded: 0, loadComplete: 0, domInteractive: 0,
        redirectTime: 0, dnsLookup: 0, tcpConnect: 0,
        serverResponse: 0, domParsing: 0,
    };
}

function getResourceMetrics(): ResourceMetrics {
    try {
        const entries = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
        const byType: Record<string, { count: number; size: number }> = {};
        let totalTransfer = 0;
        let totalDecoded = 0;

        for (const entry of entries) {
            const type = entry.initiatorType || 'other';
            if (!byType[type]) byType[type] = { count: 0, size: 0 };
            byType[type].count++;
            byType[type].size += entry.transferSize || 0;
            totalTransfer += entry.transferSize || 0;
            totalDecoded += entry.decodedBodySize || 0;
        }

        const slowest = [...entries]
            .sort((a, b) => b.duration - a.duration)
            .slice(0, 5)
            .map(e => ({
                name: e.name.split('/').pop() || e.name,
                duration: Math.round(e.duration),
                size: e.transferSize || 0,
            }));

        return {
            totalResources: entries.length,
            totalTransferSize: totalTransfer,
            totalDecodedSize: totalDecoded,
            byType,
            slowestResources: slowest,
        };
    } catch {
        return {
            totalResources: 0, totalTransferSize: 0, totalDecodedSize: 0,
            byType: {}, slowestResources: [],
        };
    }
}

function getMemoryMetrics(): MemoryMetrics | undefined {
    try {
        const memory = (performance as any).memory;
        if (!memory) return undefined;

        return {
            usedJSHeapSize: memory.usedJSHeapSize,
            totalJSHeapSize: memory.totalJSHeapSize,
            jsHeapSizeLimit: memory.jsHeapSizeLimit,
            usagePercent: Math.round((memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100),
        };
    } catch {
        return undefined;
    }
}

// ── Listener API ────────────────────────────────────────────────────────────

/**
 * Register a listener for metric updates
 */
export function onMetricUpdate(callback: (metric: WebVitalMetric) => void): () => void {
    listeners.add(callback);
    return () => listeners.delete(callback);
}

/**
 * Get the current value of a specific metric
 */
export function getMetric(name: MetricName): WebVitalMetric | null {
    return metrics[name] || null;
}

/**
 * Get all current metrics
 */
export function getAllMetrics(): Partial<Record<MetricName, WebVitalMetric>> {
    return { ...metrics };
}
