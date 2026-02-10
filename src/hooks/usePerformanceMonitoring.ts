/**
 * SGG Digital — Hook React pour Performance Monitoring
 *
 * Fournit l'état des Core Web Vitals et les outils de diagnostic
 * pour l'affichage dans les dashboards admin.
 *
 * Usage :
 *   const { snapshot, score, rating, metrics } = usePerformanceMonitoring();
 */

import { useState, useEffect, useCallback } from 'react';
import {
    initPerformanceMonitoring,
    getPerformanceSnapshot,
    onMetricUpdate,
    type WebVitalMetric,
    type PerformanceSnapshot,
    type MetricRating,
} from '@/services/performanceMonitoring';

export interface UsePerformanceReturn {
    /** Full performance snapshot */
    snapshot: PerformanceSnapshot | null;
    /** Overall score (0-100) */
    score: number;
    /** Overall rating */
    rating: MetricRating;
    /** Last updated metric */
    lastMetric: WebVitalMetric | null;
    /** Whether monitoring is active */
    isActive: boolean;
    /** Refresh the snapshot manually */
    refresh: () => void;
}

export function usePerformanceMonitoring(
    /** Auto-refresh interval in ms (default: 10000) */
    refreshInterval = 10_000
): UsePerformanceReturn {
    const [snapshot, setSnapshot] = useState<PerformanceSnapshot | null>(null);
    const [lastMetric, setLastMetric] = useState<WebVitalMetric | null>(null);
    const [isActive, setIsActive] = useState(false);

    const refresh = useCallback(() => {
        const snap = getPerformanceSnapshot();
        setSnapshot(snap);
    }, []);

    useEffect(() => {
        // Initialize monitoring
        initPerformanceMonitoring();
        setIsActive(true);

        // Initial snapshot
        const initTimer = setTimeout(refresh, 1000);

        // Listen for metric updates
        const unsubscribe = onMetricUpdate((metric) => {
            setLastMetric(metric);
            refresh();
        });

        // Periodic refresh
        const interval = setInterval(refresh, refreshInterval);

        return () => {
            clearTimeout(initTimer);
            clearInterval(interval);
            unsubscribe();
        };
    }, [refresh, refreshInterval]);

    return {
        snapshot,
        score: snapshot?.score ?? 0,
        rating: snapshot?.rating ?? 'good',
        lastMetric,
        isActive,
        refresh,
    };
}

export default usePerformanceMonitoring;
