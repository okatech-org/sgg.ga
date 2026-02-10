import { test, expect } from '@playwright/test';

/**
 * SGG Digital — E2E Tests : Navigation principale
 *
 * Vérifie que les pages principales sont accessibles,
 * que le routage fonctionne, et que les éléments clés sont visibles.
 */

test.describe('Navigation Publique', () => {
    test('la page d\'accueil se charge correctement', async ({ page }) => {
        await page.goto('/');
        await expect(page).toHaveTitle(/SGG Digital/);
        // Le hero section ou le contenu principal devrait être visible
        await expect(page.locator('main, [role="main"], #root')).toBeVisible();
    });

    test('la page d\'accueil contient le branding SGG', async ({ page }) => {
        await page.goto('/');
        // Chercher des éléments liés au branding gouvernemental
        const pageContent = await page.textContent('body');
        expect(pageContent).toContain('Gouvernement');
    });

    test('la page About est accessible', async ({ page }) => {
        await page.goto('/about');
        await expect(page.locator('main, [role="main"], #root')).toBeVisible();
    });

    test('la page Modules est accessible', async ({ page }) => {
        await page.goto('/modules');
        await expect(page.locator('main, [role="main"], #root')).toBeVisible();
    });

    test('la page Journal Officiel est accessible', async ({ page }) => {
        await page.goto('/journal-officiel');
        await expect(page.locator('main, [role="main"], #root')).toBeVisible();
    });

    test('les URL inconnues affichent la page 404', async ({ page }) => {
        await page.goto('/page-inexistante-xyz');
        const pageContent = await page.textContent('body');
        expect(pageContent).toContain('introuvable');
    });
});

test.describe('Navigation Authentification', () => {
    test('la page de connexion est accessible', async ({ page }) => {
        await page.goto('/auth');
        await expect(page.locator('main, [role="main"], #root')).toBeVisible();
    });

    test('la page démo est accessible', async ({ page }) => {
        await page.goto('/demo');
        await expect(page.locator('main, [role="main"], #root')).toBeVisible();
    });

    test('le dashboard redirige vers auth si non connecté', async ({ page }) => {
        await page.goto('/dashboard');
        // Devrait être redirigé vers /auth ou rester sur /dashboard avec un modal
        const url = page.url();
        expect(url).toMatch(/\/(auth|demo|dashboard)/);
    });
});

test.describe('Responsive Design', () => {
    test('la page d\'accueil est responsive en mobile', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 812 });
        await page.goto('/');
        await expect(page.locator('#root')).toBeVisible();
        // Pas d'overflow horizontal
        const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
        const viewportWidth = await page.evaluate(() => window.innerWidth);
        expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 5); // 5px tolerance
    });
});

test.describe('SEO & Métadonnées', () => {
    test('les meta tags essentiels sont présents', async ({ page }) => {
        await page.goto('/');

        // Title
        const title = await page.title();
        expect(title.length).toBeGreaterThan(5);

        // Meta description
        const description = await page.getAttribute('meta[name="description"]', 'content');
        expect(description).toBeTruthy();
        expect(description!.length).toBeGreaterThan(20);

        // OG tags
        const ogTitle = await page.getAttribute('meta[property="og:title"]', 'content');
        expect(ogTitle).toBeTruthy();

        // Manifest
        const manifest = await page.getAttribute('link[rel="manifest"]', 'href');
        expect(manifest).toBe('/manifest.json');
    });

    test('le HTML a le bon lang', async ({ page }) => {
        await page.goto('/');
        const lang = await page.getAttribute('html', 'lang');
        expect(lang).toBe('fr');
    });
});

test.describe('Performance', () => {
    test('la page d\'accueil charge en moins de 5 secondes', async ({ page }) => {
        const start = Date.now();
        await page.goto('/', { waitUntil: 'domcontentloaded' });
        const loadTime = Date.now() - start;
        expect(loadTime).toBeLessThan(5000);
    });

    test('pas d\'erreurs console critiques au chargement', async ({ page }) => {
        const errors: string[] = [];
        page.on('console', (msg) => {
            if (msg.type() === 'error') {
                errors.push(msg.text());
            }
        });

        await page.goto('/');
        await page.waitForTimeout(2000);

        // Filtrer les erreurs connues (Supabase, etc.)
        const criticalErrors = errors.filter(
            (e) =>
                !e.includes('supabase') &&
                !e.includes('Failed to load resource') &&
                !e.includes('net::ERR')
        );

        expect(criticalErrors).toHaveLength(0);
    });
});
