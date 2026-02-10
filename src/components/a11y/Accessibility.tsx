/**
 * SGG Digital — Composant Accessibilité (WCAG 2.1 AA)
 *
 * Ajoute des raccourcis d'accessibilité et les skip-links
 * nécessaires pour la conformité WCAG 2.1 niveau AA.
 *
 * Fonctionnalités :
 *   - Skip to main content link (visible au focus)
 *   - Live region pour les annonces screen reader
 *   - Raccourci clavier Alt+1 → contenu principal
 *   - Focus trap utilities
 *   - Préfère les animations réduites (prefers-reduced-motion)
 */

import { useEffect, useCallback, useRef, useState } from 'react';

// ─── Skip Link Component ────────────────────────────────────────────────────

export function SkipLinks() {
    return (
        <div className="sr-only focus-within:not-sr-only">
            <a
                href="#main-content"
                className="
          fixed top-2 left-2 z-[9999]
          bg-primary text-primary-foreground
          px-4 py-2 rounded-md
          text-sm font-medium
          focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2
          transition-transform translate-y-[-100%] focus:translate-y-0
        "
            >
                Aller au contenu principal
            </a>
        </div>
    );
}

// ─── Live Region for Announcements ──────────────────────────────────────────

let liveRegion: HTMLDivElement | null = null;

/**
 * Announce a message to screen readers via a live region
 */
export function announce(message: string, priority: 'polite' | 'assertive' = 'polite') {
    if (typeof document === 'undefined') return;

    if (!liveRegion) {
        liveRegion = document.createElement('div');
        liveRegion.setAttribute('role', 'status');
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        liveRegion.className = 'sr-only';
        liveRegion.id = 'a11y-live-region';
        document.body.appendChild(liveRegion);
    }

    liveRegion.setAttribute('aria-live', priority);
    // Clear then set to trigger re-announcement
    liveRegion.textContent = '';
    requestAnimationFrame(() => {
        liveRegion!.textContent = message;
    });
}

// ─── Keyboard Navigation Hook ───────────────────────────────────────────────

/**
 * Hook for managing keyboard navigation shortcuts
 */
export function useAccessibilityShortcuts() {
    useEffect(() => {
        function handleKeyDown(event: KeyboardEvent) {
            // Alt+1 → Skip to main content
            if (event.altKey && event.key === '1') {
                event.preventDefault();
                const main = document.getElementById('main-content') || document.querySelector('main');
                if (main) {
                    main.setAttribute('tabindex', '-1');
                    main.focus();
                    announce('Contenu principal');
                }
            }

            // Alt+2 → Skip to navigation
            if (event.altKey && event.key === '2') {
                event.preventDefault();
                const nav = document.querySelector('nav');
                if (nav) {
                    const firstLink = nav.querySelector('a, button') as HTMLElement;
                    firstLink?.focus();
                    announce('Navigation');
                }
            }
        }

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);
}

// ─── Focus Trap Hook ────────────────────────────────────────────────────────

/**
 * Trap focus within a container (for modals, dialogs)
 */
export function useFocusTrap(isActive: boolean) {
    const containerRef = useRef<HTMLDivElement>(null);

    const handleKeyDown = useCallback(
        (event: KeyboardEvent) => {
            if (!isActive || !containerRef.current || event.key !== 'Tab') return;

            const focusableElements = containerRef.current.querySelectorAll<HTMLElement>(
                'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
            );

            if (focusableElements.length === 0) return;

            const first = focusableElements[0];
            const last = focusableElements[focusableElements.length - 1];

            if (event.shiftKey) {
                if (document.activeElement === first) {
                    event.preventDefault();
                    last.focus();
                }
            } else {
                if (document.activeElement === last) {
                    event.preventDefault();
                    first.focus();
                }
            }
        },
        [isActive]
    );

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    return containerRef;
}

// ─── Reduced Motion Hook ────────────────────────────────────────────────────

/**
 * Detect user's preference for reduced motion
 */
export function usePrefersReducedMotion(): boolean {
    const [prefersReduced, setPrefersReduced] = useState(() => {
        if (typeof window === 'undefined') return false;
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    });

    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        const handler = (event: MediaQueryListEvent) => setPrefersReduced(event.matches);
        mediaQuery.addEventListener('change', handler);
        return () => mediaQuery.removeEventListener('change', handler);
    }, []);

    return prefersReduced;
}

// ─── Color Contrast Utilities ───────────────────────────────────────────────

/**
 * Calculate relative luminance of a hex color
 */
export function relativeLuminance(hex: string): number {
    const rgb = hexToRgb(hex);
    if (!rgb) return 0;

    const [r, g, b] = [rgb.r, rgb.g, rgb.b].map((c) => {
        const s = c / 255;
        return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    });

    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Calculate WCAG contrast ratio between two colors
 */
export function contrastRatio(color1: string, color2: string): number {
    const l1 = relativeLuminance(color1);
    const l2 = relativeLuminance(color2);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if contrast meets WCAG AA requirements
 * Normal text: 4.5:1, Large text: 3:1
 */
export function meetsWCAGAA(fg: string, bg: string, isLargeText = false): boolean {
    const ratio = contrastRatio(fg, bg);
    return ratio >= (isLargeText ? 3 : 4.5);
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const cleaned = hex.replace('#', '');
    const match = cleaned.match(/.{2}/g);
    if (!match) return null;
    return {
        r: parseInt(match[0], 16),
        g: parseInt(match[1], 16),
        b: parseInt(match[2], 16),
    };
}
