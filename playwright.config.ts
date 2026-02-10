import { defineConfig, devices } from '@playwright/test';

/**
 * SGG Digital — Configuration Playwright E2E Tests
 *
 * Exécution : npx playwright test
 * UI Mode  : npx playwright test --ui
 * Report   : npx playwright show-report
 */
export default defineConfig({
    testDir: './e2e',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,
    reporter: process.env.CI
        ? [['html', { open: 'never' }], ['github']]
        : [['html', { open: 'on-failure' }]],

    use: {
        baseURL: 'http://localhost:5173',
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
        locale: 'fr-FR',
        timezoneId: 'Africa/Libreville',
    },

    /* Configure projects for browsers */
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
        {
            name: 'firefox',
            use: { ...devices['Desktop Firefox'] },
        },
        {
            name: 'webkit',
            use: { ...devices['Desktop Safari'] },
        },
        /* Mobile viewports */
        {
            name: 'mobile-chrome',
            use: { ...devices['Pixel 5'] },
        },
        {
            name: 'mobile-safari',
            use: { ...devices['iPhone 13'] },
        },
    ],

    /* Run dev server before starting tests */
    webServer: {
        command: 'bun run dev',
        url: 'http://localhost:5173',
        reuseExistingServer: !process.env.CI,
        timeout: 30_000,
    },
});
