/**
 * SGG Digital — Infrastructure i18n (Internationalisation) v2
 *
 * Système de traduction avec chargement dynamique de langues.
 * Supporte le français (par défaut), l'anglais, et l'espagnol.
 * Nouvelles langues chargées à la demande (lazy-loaded).
 *
 * Architecture :
 *   - Fichiers JSON par locale (src/i18n/locales/fr.json, en.json, ...)
 *   - Chargement dynamique : pas de bundle inutile
 *   - Context React pour distribuer la locale et la fonction t()
 *   - Hook useTranslation() pour accéder aux traductions
 *   - Interpolation de variables : t('footer.copyright', { year: 2026 })
 *   - Pluralisation simple : t('items.count', { count: 5 })
 *   - Persistance de la locale en localStorage
 *   - Ajout de langues à chaud via registerLocale()
 *
 * Usage:
 *   import { useTranslation } from '@/i18n';
 *
 *   function MonComposant() {
 *     const { t, locale, setLocale, locales, isLoading } = useTranslation();
 *     return <h1>{t('dashboard.title')}</h1>;
 *   }
 */

import {
    createContext,
    useContext,
    useState,
    useCallback,
    useMemo,
    useEffect,
    type ReactNode,
} from 'react';

import frTranslations from './locales/fr.json';
import enTranslations from './locales/en.json';

// ─── Types ──────────────────────────────────────────────────────────────────

export type Locale = string;

type TranslationDict = Record<string, unknown>;

interface LocaleConfig {
    /** Locale code (e.g. 'fr', 'en', 'es') */
    code: string;
    /** Display label (e.g. 'Français', 'English') */
    label: string;
    /** Flag emoji */
    flag: string;
    /** Direction: 'ltr' or 'rtl' */
    direction: 'ltr' | 'rtl';
    /** Whether translations are bundled (loaded at startup) */
    bundled: boolean;
}

interface I18nContextValue {
    /** Current locale code */
    locale: Locale;
    /** Change the current locale (triggers lazy load if needed) */
    setLocale: (locale: Locale) => Promise<void>;
    /** Translation function with optional interpolation and pluralization */
    t: (key: string, params?: Record<string, string | number>) => string;
    /** List of available locale codes */
    locales: string[];
    /** Full locale configs */
    localeConfigs: LocaleConfig[];
    /** Whether a locale is currently being loaded */
    isLoading: boolean;
    /** Register a new locale dynamically */
    registerLocale: (config: LocaleConfig, translations: TranslationDict) => void;
    /** Get label for a locale */
    getLocaleLabel: (code: string) => string;
    /** Get flag for a locale */
    getLocaleFlag: (code: string) => string;
}

// ─── Built-in Locale Registry ───────────────────────────────────────────────

const localeRegistry: Map<string, LocaleConfig> = new Map([
    ['fr', { code: 'fr', label: 'Français', flag: '🇫🇷', direction: 'ltr', bundled: true }],
    ['en', { code: 'en', label: 'English', flag: '🇬🇧', direction: 'ltr', bundled: true }],
    ['es', { code: 'es', label: 'Español', flag: '🇪🇸', direction: 'ltr', bundled: false }],
    ['pt', { code: 'pt', label: 'Português', flag: '🇵🇹', direction: 'ltr', bundled: false }],
    ['ar', { code: 'ar', label: 'العربية', flag: '🇸🇦', direction: 'rtl', bundled: false }],
    ['zh', { code: 'zh', label: '中文', flag: '🇨🇳', direction: 'ltr', bundled: false }],
]);

// ─── Translation dictionaries (bundled + dynamically loaded) ────────────────

const translations: Record<string, TranslationDict> = {
    fr: frTranslations,
    en: enTranslations,
};

// ─── Dynamic Language Loaders ───────────────────────────────────────────────

/**
 * Lazy-load a locale's translations.
 * Uses dynamic import for code-splitting.
 */
async function loadLocaleTranslations(code: string): Promise<TranslationDict | null> {
    // Already loaded
    if (translations[code]) return translations[code];

    try {
        // Dynamic import — Vite will code-split these
        const module = await import(`./locales/${code}.json`);
        const dict = module.default || module;
        translations[code] = dict;
        if (import.meta.env.DEV) console.log(`[i18n] Locale "${code}" loaded`);
        return dict;
    } catch (err) {
        console.warn(`[i18n] Failed to load locale "${code}"`, err);
        return null;
    }
}

// ─── Exports for backward compatibility ─────────────────────────────────────

export const LOCALE_LABELS: Record<string, string> = {};
export const AVAILABLE_LOCALES: string[] = [];

// Populate on init
for (const [code, config] of localeRegistry) {
    LOCALE_LABELS[code] = config.label;
    AVAILABLE_LOCALES.push(code);
}

// ─── Helpers ────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'sgg-locale';

function getStoredLocale(): string {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored && localeRegistry.has(stored)) return stored;
    } catch {
        // SSR or localStorage unavailable
    }
    // Detect browser language
    const browserLang = navigator?.language?.slice(0, 2);
    if (browserLang && localeRegistry.has(browserLang)) return browserLang;
    return 'fr'; // Default to French
}

function setStoredLocale(locale: string) {
    try {
        localStorage.setItem(STORAGE_KEY, locale);
    } catch {
        // SSR or localStorage unavailable
    }
}

/**
 * Resolve a dot-notation key from a nested object.
 * e.g. getNestedValue({ a: { b: 'hello' } }, 'a.b') => 'hello'
 */
function getNestedValue(obj: TranslationDict, path: string): string | undefined {
    const parts = path.split('.');
    let current: unknown = obj;

    for (const part of parts) {
        if (current == null || typeof current !== 'object') return undefined;
        current = (current as Record<string, unknown>)[part];
    }

    return typeof current === 'string' ? current : undefined;
}

/**
 * Interpolate {variable} placeholders in a string.
 * Also handles simple pluralization via {count} with _one/_other/_zero suffixes.
 *
 * e.g. interpolate('Hello {name}!', { name: 'World' }) => 'Hello World!'
 */
function interpolate(
    template: string,
    params?: Record<string, string | number>
): string {
    if (!params) return template;
    return template.replace(/\{(\w+)\}/g, (_, key) => {
        return key in params ? String(params[key]) : `{${key}}`;
    });
}

/**
 * Resolve plural form of a key.
 * Keys: "items_zero", "items_one", "items_other"
 */
function resolvePluralKey(dict: TranslationDict, key: string, count: number): string | undefined {
    if (count === 0) {
        const zero = getNestedValue(dict, `${key}_zero`);
        if (zero) return zero;
    }
    if (count === 1) {
        const one = getNestedValue(dict, `${key}_one`);
        if (one) return one;
    }
    const other = getNestedValue(dict, `${key}_other`);
    return other || undefined;
}

// ─── React Context ──────────────────────────────────────────────────────────

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
    const [locale, setLocaleState] = useState<string>(getStoredLocale);
    const [isLoading, setIsLoading] = useState(false);

    // Set initial HTML attributes
    useEffect(() => {
        const config = localeRegistry.get(locale);
        document.documentElement.lang = locale;
        document.documentElement.dir = config?.direction || 'ltr';
    }, [locale]);

    const setLocale = useCallback(async (newLocale: string) => {
        if (!localeRegistry.has(newLocale)) {
            if (import.meta.env.DEV) console.warn(`[i18n] Locale "${newLocale}" not registered`);
            return;
        }

        // Load translations if not bundled
        if (!translations[newLocale]) {
            setIsLoading(true);
            const loaded = await loadLocaleTranslations(newLocale);
            setIsLoading(false);

            if (!loaded) {
                if (import.meta.env.DEV) console.warn(`[i18n] Could not load locale "${newLocale}"`);
                return;
            }
        }

        setLocaleState(newLocale);
        setStoredLocale(newLocale);

        const config = localeRegistry.get(newLocale);
        document.documentElement.lang = newLocale;
        document.documentElement.dir = config?.direction || 'ltr';
    }, [locale]);

    const registerLocale = useCallback((config: LocaleConfig, dict: TranslationDict) => {
        localeRegistry.set(config.code, config);
        translations[config.code] = dict;
        LOCALE_LABELS[config.code] = config.label;
        if (!AVAILABLE_LOCALES.includes(config.code)) {
            AVAILABLE_LOCALES.push(config.code);
        }
        if (import.meta.env.DEV) console.log(`[i18n] Locale "${config.code}" registered`);
    }, []);

    const t = useCallback(
        (key: string, params?: Record<string, string | number>): string => {
            const dict = translations[locale] || translations.fr;

            // Try pluralization if 'count' param is present
            if (params && 'count' in params) {
                const plural = resolvePluralKey(dict, key, Number(params.count));
                if (plural) return interpolate(plural, params);
            }

            const value = getNestedValue(dict, key);

            if (value === undefined) {
                // Fallback to French
                if (locale !== 'fr') {
                    // Try plural in French fallback
                    if (params && 'count' in params) {
                        const frPlural = resolvePluralKey(translations.fr, key, Number(params.count));
                        if (frPlural) return interpolate(frPlural, params);
                    }
                    const frValue = getNestedValue(translations.fr, key);
                    if (frValue) return interpolate(frValue, params);
                }
                // Return the key itself as a fallback (useful for debugging)
                return key;
            }

            return interpolate(value, params);
        },
        [locale]
    );

    const getLocaleLabel = useCallback((code: string) => {
        return localeRegistry.get(code)?.label || code;
    }, []);

    const getLocaleFlag = useCallback((code: string) => {
        return localeRegistry.get(code)?.flag || '🏳️';
    }, []);

    const locales = useMemo(() => Array.from(localeRegistry.keys()), []);
    const localeConfigs = useMemo(() => Array.from(localeRegistry.values()), []);

    const value = useMemo(
        () => ({
            locale,
            setLocale,
            t,
            locales,
            localeConfigs,
            isLoading,
            registerLocale,
            getLocaleLabel,
            getLocaleFlag,
        }),
        [locale, setLocale, t, locales, localeConfigs, isLoading, registerLocale, getLocaleLabel, getLocaleFlag]
    );

    return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

// ─── Hook ───────────────────────────────────────────────────────────────────

export function useTranslation(): I18nContextValue {
    const context = useContext(I18nContext);
    if (!context) {
        throw new Error('useTranslation must be used within an <I18nProvider>');
    }
    return context;
}
