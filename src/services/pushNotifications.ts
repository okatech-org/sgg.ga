/**
 * SGG Digital — Service de Notifications Push (Web Push API)
 *
 * Gère l'abonnement, la permission et l'envoi de notifications push
 * via l'API Web Push standard + Service Worker.
 *
 * Fonctionnalités :
 *   - Demande de permission utilisateur (avec gestion du refus)
 *   - Enregistrement du subscription endpoint
 *   - Envoi de notifications locales (sans serveur push)
 *   - Intégration avec le Service Worker existant
 *   - Préférences utilisateur persistantes (localStorage)
 *
 * Catégories de notifications :
 *   - rapport_soumis : Nouveau rapport à valider
 *   - rapport_valide : Rapport approuvé
 *   - rapport_rejete : Rapport rejeté (priorité haute)
 *   - rappel_saisie : Rappel de saisie mensuelle
 *   - alerte_systeme : Alerte technique
 *   - info_generale : Information générale
 */

// ── Types ───────────────────────────────────────────────────────────────────

export type NotificationCategory =
    | 'rapport_soumis'
    | 'rapport_valide'
    | 'rapport_rejete'
    | 'rappel_saisie'
    | 'alerte_systeme'
    | 'info_generale';

export interface PushNotificationPayload {
    title: string;
    body: string;
    category: NotificationCategory;
    icon?: string;
    badge?: string;
    tag?: string;
    url?: string;
    data?: Record<string, unknown>;
    requireInteraction?: boolean;
}

export interface PushPreferences {
    enabled: boolean;
    categories: Record<NotificationCategory, boolean>;
    quietHoursStart?: string; // HH:mm format
    quietHoursEnd?: string;
    sound: boolean;
}

interface PushServiceState {
    permission: NotificationPermission;
    subscription: PushSubscription | null;
    swRegistration: ServiceWorkerRegistration | null;
    preferences: PushPreferences;
}

// ── Constants ───────────────────────────────────────────────────────────────

const PREFS_KEY = 'sgg_push_preferences';
const SUBSCRIPTION_KEY = 'sgg_push_subscription';

const DEFAULT_PREFERENCES: PushPreferences = {
    enabled: true,
    categories: {
        rapport_soumis: true,
        rapport_valide: true,
        rapport_rejete: true,
        rappel_saisie: true,
        alerte_systeme: true,
        info_generale: true,
    },
    quietHoursStart: '22:00',
    quietHoursEnd: '07:00',
    sound: true,
};

const CATEGORY_ICONS: Record<NotificationCategory, string> = {
    rapport_soumis: '📄',
    rapport_valide: '✅',
    rapport_rejete: '❌',
    rappel_saisie: '📋',
    alerte_systeme: '🚨',
    info_generale: 'ℹ️',
};

const CATEGORY_LABELS: Record<NotificationCategory, string> = {
    rapport_soumis: 'Rapports soumis',
    rapport_valide: 'Rapports validés',
    rapport_rejete: 'Rapports rejetés',
    rappel_saisie: 'Rappels de saisie',
    alerte_systeme: 'Alertes système',
    info_generale: 'Informations',
};

// ── Service ─────────────────────────────────────────────────────────────────

class PushNotificationService {
    private state: PushServiceState;

    constructor() {
        this.state = {
            permission: this.getPermission(),
            subscription: null,
            swRegistration: null,
            preferences: this.loadPreferences(),
        };
    }

    // ── Getters ─────────────────────────────────────────────────────────────

    get isSupported(): boolean {
        return 'Notification' in window && 'serviceWorker' in navigator;
    }

    get permission(): NotificationPermission {
        return this.state.permission;
    }

    get isEnabled(): boolean {
        return this.state.preferences.enabled && this.state.permission === 'granted';
    }

    get preferences(): PushPreferences {
        return { ...this.state.preferences };
    }

    // ── Permission ──────────────────────────────────────────────────────────

    private getPermission(): NotificationPermission {
        if (!('Notification' in window)) return 'denied';
        return Notification.permission;
    }

    async requestPermission(): Promise<NotificationPermission> {
        if (!this.isSupported) {
            console.warn('[Push] Web Push API non supportée par ce navigateur');
            return 'denied';
        }

        try {
            const permission = await Notification.requestPermission();
            this.state.permission = permission;

            if (permission === 'granted') {
                console.log('[Push] ✅ Permission accordée');
                await this.registerServiceWorker();
            } else if (permission === 'denied') {
                console.warn('[Push] ❌ Permission refusée par l\'utilisateur');
            }

            return permission;
        } catch (err) {
            console.error('[Push] Erreur demande de permission:', err);
            return 'denied';
        }
    }

    // ── Service Worker Registration ─────────────────────────────────────────

    private async registerServiceWorker(): Promise<void> {
        if (!('serviceWorker' in navigator)) return;

        try {
            const registration = await navigator.serviceWorker.ready;
            this.state.swRegistration = registration;
            console.log('[Push] Service Worker prêt pour les notifications');
        } catch (err) {
            console.error('[Push] Erreur enregistrement SW:', err);
        }
    }

    // ── Preferences ─────────────────────────────────────────────────────────

    private loadPreferences(): PushPreferences {
        try {
            const saved = localStorage.getItem(PREFS_KEY);
            if (saved) {
                return { ...DEFAULT_PREFERENCES, ...JSON.parse(saved) };
            }
        } catch { /* fallback to defaults */ }
        return { ...DEFAULT_PREFERENCES };
    }

    updatePreferences(updates: Partial<PushPreferences>): void {
        this.state.preferences = { ...this.state.preferences, ...updates };
        try {
            localStorage.setItem(PREFS_KEY, JSON.stringify(this.state.preferences));
        } catch { /* ignore */ }
    }

    setCategoryEnabled(category: NotificationCategory, enabled: boolean): void {
        this.state.preferences.categories[category] = enabled;
        this.updatePreferences({ categories: this.state.preferences.categories });
    }

    // ── Quiet Hours ─────────────────────────────────────────────────────────

    private isQuietHours(): boolean {
        const { quietHoursStart, quietHoursEnd } = this.state.preferences;
        if (!quietHoursStart || !quietHoursEnd) return false;

        const now = new Date();
        const currentMinutes = now.getHours() * 60 + now.getMinutes();

        const [startH, startM] = quietHoursStart.split(':').map(Number);
        const [endH, endM] = quietHoursEnd.split(':').map(Number);

        const startMinutes = startH * 60 + startM;
        const endMinutes = endH * 60 + endM;

        // Handle overnight quiet hours (e.g., 22:00 → 07:00)
        if (startMinutes > endMinutes) {
            return currentMinutes >= startMinutes || currentMinutes < endMinutes;
        }

        return currentMinutes >= startMinutes && currentMinutes < endMinutes;
    }

    // ── Send Notification ───────────────────────────────────────────────────

    async notify(payload: PushNotificationPayload): Promise<boolean> {
        // Check if notifications are enabled
        if (!this.isEnabled) {
            console.log('[Push] Notifications désactivées');
            return false;
        }

        // Check category preference
        if (!this.state.preferences.categories[payload.category]) {
            console.log(`[Push] Catégorie "${payload.category}" désactivée`);
            return false;
        }

        // Check quiet hours (override for critical alerts)
        if (this.isQuietHours() && payload.category !== 'alerte_systeme') {
            console.log('[Push] Heures de silence — notification ignorée');
            return false;
        }

        try {
            const icon = payload.icon || '/emblem_gabon.png';
            const badge = payload.badge || '/emblem_gabon.png';
            const categoryEmoji = CATEGORY_ICONS[payload.category];

            // Use Service Worker if available
            if (this.state.swRegistration) {
                await this.state.swRegistration.showNotification(
                    `${categoryEmoji} ${payload.title}`,
                    {
                        body: payload.body,
                        icon,
                        badge,
                        tag: payload.tag || payload.category,
                        data: {
                            url: payload.url || '/dashboard',
                            category: payload.category,
                            ...payload.data,
                        },
                        requireInteraction: payload.requireInteraction ?? (payload.category === 'rapport_rejete'),
                        silent: !this.state.preferences.sound,
                    }
                );
            } else {
                // Fallback to basic Notification API
                new Notification(`${categoryEmoji} ${payload.title}`, {
                    body: payload.body,
                    icon,
                    badge,
                    tag: payload.tag || payload.category,
                    data: {
                        url: payload.url || '/dashboard',
                        ...payload.data,
                    },
                    silent: !this.state.preferences.sound,
                });
            }

            console.log(`[Push] ✅ Notification envoyée: "${payload.title}"`);
            return true;
        } catch (err) {
            console.error('[Push] Erreur envoi notification:', err);
            return false;
        }
    }

    // ── Convenience Methods ─────────────────────────────────────────────────

    async notifyReportSubmitted(ministry: string, month: string): Promise<boolean> {
        return this.notify({
            title: 'Nouveau rapport soumis',
            body: `${ministry} a soumis son rapport pour ${month}`,
            category: 'rapport_soumis',
            url: '/matrice-reporting/validation',
        });
    }

    async notifyReportValidated(ministry: string, month: string, level: 'SGG' | 'SGPR'): Promise<boolean> {
        return this.notify({
            title: `Rapport validé (${level})`,
            body: `Le rapport de ${ministry} pour ${month} a été approuvé`,
            category: 'rapport_valide',
            url: '/matrice-reporting',
        });
    }

    async notifyReportRejected(ministry: string, month: string, reason: string): Promise<boolean> {
        return this.notify({
            title: 'Rapport rejeté',
            body: `Le rapport de ${ministry} pour ${month} a été rejeté. Motif : ${reason}`,
            category: 'rapport_rejete',
            url: '/matrice-reporting/saisie',
            requireInteraction: true,
        });
    }

    async notifyReminder(ministry: string, month: string, deadline: string): Promise<boolean> {
        return this.notify({
            title: 'Rappel de saisie mensuelle',
            body: `${ministry} — Rapport ${month} en attente. Deadline : ${deadline}`,
            category: 'rappel_saisie',
            url: '/matrice-reporting/saisie',
        });
    }

    async notifySystemAlert(title: string, description: string): Promise<boolean> {
        return this.notify({
            title,
            body: description,
            category: 'alerte_systeme',
            requireInteraction: true,
        });
    }
}

// ── Singleton Export ─────────────────────────────────────────────────────────

export const pushService = new PushNotificationService();

export { CATEGORY_LABELS, CATEGORY_ICONS };

export default pushService;
