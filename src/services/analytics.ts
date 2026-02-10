/**
 * SGG Digital — Service Analytics Frontend
 *
 * Intégration légère et privacy-first d'analytics événementiel.
 * Supporte PostHog en production et un logger local en développement.
 *
 * Usage:
 *   import { analytics } from '@/services/analytics';
 *   analytics.track('rapport_soumis', { rapportId, ministereSigle });
 *   analytics.page('/reporting/matrice');
 *
 * Principes :
 *   - Pas de tracking en mode démo (données fictives)
 *   - Respecte Do Not Track du navigateur
 *   - Aucune donnée PII envoyée (pas de noms, emails, etc.)
 *   - Opt-out possible via localStorage
 */

import { logger } from '@/services/logger';

const analyticsLogger = logger.child('Analytics');

// ─── Types ──────────────────────────────────────────────────────────────────

interface AnalyticsUser {
    id: string;
    role: string;
    institution?: string;
}

type EventProperties = Record<string, string | number | boolean | null | undefined>;

// ─── PostHog Integration ────────────────────────────────────────────────────

const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY;
const POSTHOG_HOST = import.meta.env.VITE_POSTHOG_HOST || 'https://eu.posthog.com';

let posthogInstance: any = null;

async function initPosthog(): Promise<void> {
    if (!POSTHOG_KEY || posthogInstance) return;

    try {
        // Load PostHog via CDN script — avoids requiring the npm package
        await new Promise<void>((resolve, reject) => {
            if ((window as any).posthog) {
                resolve();
                return;
            }
            const script = document.createElement('script');
            script.src = 'https://eu-assets.i.posthog.com/static/array.js';
            script.async = true;
            script.onload = () => resolve();
            script.onerror = () => reject(new Error('PostHog script failed to load'));
            document.head.appendChild(script);
        });

        posthogInstance = (window as any).posthog;
        if (!posthogInstance) return;

        posthogInstance.init(POSTHOG_KEY, {
            api_host: POSTHOG_HOST,
            // Privacy settings
            autocapture: false,         // No automatic click tracking
            capture_pageview: false,    // Manual pageview tracking
            capture_pageleave: true,    // Track session duration
            disable_session_recording: true,
            persistence: 'localStorage',
            // Performance
            loaded: () => {
                analyticsLogger.info('PostHog initialized');
            },
        });
    } catch {
        analyticsLogger.warn('PostHog not available — using local logging');
    }
}

// ─── Analytics Service ──────────────────────────────────────────────────────

class AnalyticsService {
    private isEnabled = true;
    private isDemoMode = false;
    private isInitialized = false;

    /**
     * Initialize analytics — call once in app startup
     */
    async init() {
        if (this.isInitialized) return;
        this.isInitialized = true;

        // Respect Do Not Track
        if (navigator.doNotTrack === '1') {
            this.isEnabled = false;
            analyticsLogger.info('Analytics disabled (Do Not Track)');
            return;
        }

        // Check opt-out
        try {
            if (localStorage.getItem('sgg-analytics-optout') === 'true') {
                this.isEnabled = false;
                analyticsLogger.info('Analytics disabled (user opt-out)');
                return;
            }
        } catch { /* no localStorage */ }

        // Check demo mode
        try {
            if (sessionStorage.getItem('demo_user')) {
                this.isDemoMode = true;
                analyticsLogger.info('Analytics: demo mode — events logged locally only');
            }
        } catch { /* no sessionStorage */ }

        // Initialize PostHog in production
        if (import.meta.env.PROD && !this.isDemoMode) {
            await initPosthog();
        }
    }

    /**
     * Identify the current user (no PII!)
     */
    identify(user: AnalyticsUser) {
        if (!this.shouldTrack()) return;

        analyticsLogger.debug('Identify', { userId: user.id, role: user.role });

        if (posthogInstance) {
            posthogInstance.identify(user.id, {
                role: user.role,
                institution: user.institution,
            });
        }
    }

    /**
     * Track a custom event
     */
    track(event: string, properties?: EventProperties) {
        if (!this.shouldTrack()) return;

        analyticsLogger.debug('Track', { event, ...properties });

        if (posthogInstance) {
            posthogInstance.capture(event, properties);
        }
    }

    /**
     * Track a page view
     */
    page(path: string, properties?: EventProperties) {
        if (!this.shouldTrack()) return;

        analyticsLogger.debug('Page', { path, ...properties });

        if (posthogInstance) {
            posthogInstance.capture('$pageview', {
                $current_url: path,
                ...properties,
            });
        }
    }

    /**
     * Reset identity (on logout)
     */
    reset() {
        if (posthogInstance) {
            posthogInstance.reset();
        }
    }

    /**
     * User opts out of analytics
     */
    optOut() {
        this.isEnabled = false;
        try { localStorage.setItem('sgg-analytics-optout', 'true'); } catch { /* */ }
        if (posthogInstance) posthogInstance.opt_out_capturing();
        analyticsLogger.info('User opted out of analytics');
    }

    /**
     * User opts back in
     */
    optIn() {
        this.isEnabled = true;
        try { localStorage.removeItem('sgg-analytics-optout'); } catch { /* */ }
        if (posthogInstance) posthogInstance.opt_in_capturing();
        analyticsLogger.info('User opted in to analytics');
    }

    /**
     * Check if user has opted out
     */
    isOptedOut(): boolean {
        try {
            return localStorage.getItem('sgg-analytics-optout') === 'true';
        } catch {
            return false;
        }
    }

    // ── Private ────────────────────────────────────────────────────────────

    private shouldTrack(): boolean {
        return this.isEnabled && !this.isDemoMode;
    }
}

export const analytics = new AnalyticsService();

// ─── Predefined Events ──────────────────────────────────────────────────────
// Use these constants instead of raw strings for type safety

export const EVENTS = {
    // Auth
    LOGIN: 'user_login',
    LOGOUT: 'user_logout',
    REGISTER: 'user_register',

    // Reporting
    RAPPORT_CREATED: 'rapport_created',
    RAPPORT_SUBMITTED: 'rapport_submitted',
    RAPPORT_VALIDATED_SGG: 'rapport_validated_sgg',
    RAPPORT_VALIDATED_SGPR: 'rapport_validated_sgpr',
    RAPPORT_REJECTED: 'rapport_rejected',
    RAPPORT_EXPORTED: 'rapport_exported',

    // GAR
    OBJECTIF_CREATED: 'objectif_created',
    OBJECTIF_UPDATED: 'objectif_updated',
    PRIORITY_VIEWED: 'priority_viewed',

    // Navigation
    SEARCH_USED: 'search_used',
    MODULE_ACCESSED: 'module_accessed',
    LANGUAGE_CHANGED: 'language_changed',
    THEME_CHANGED: 'theme_changed',

    // Engagement
    NOTIFICATION_CLICKED: 'notification_clicked',
    EXPORT_DOWNLOADED: 'export_downloaded',
} as const;
