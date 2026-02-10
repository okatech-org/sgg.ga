/**
 * SGG Digital — Tests de Charge (k6)
 *
 * Script de test de performance API avec Grafana k6.
 * Simule des scénarios réalistes d'utilisation du portail.
 *
 * Installation :
 *   brew install k6        (macOS)
 *   choco install k6       (Windows)
 *   apt install k6          (Ubuntu/Debian)
 *
 * Exécution :
 *   k6 run tests/load/api-load-test.js
 *   k6 run --vus 50 --duration 2m tests/load/api-load-test.js
 *   K6_CLOUD_TOKEN=xxx k6 cloud tests/load/api-load-test.js
 *
 * Variables d'environnement :
 *   BASE_URL      — URL de base de l'API (défaut: http://localhost:8080)
 *   AUTH_EMAIL     — Email pour l'authentification
 *   AUTH_PASSWORD  — Mot de passe
 *
 * Seuils de réussite :
 *   - 95e percentile temps de réponse < 500ms
 *   - 99e percentile < 1500ms
 *   - Taux d'erreur < 1%
 *   - Débit minimum 100 req/s
 */

import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// ── Custom Metrics ──────────────────────────────────────────────────────────

const errorRate = new Rate('errors');
const authDuration = new Trend('auth_duration', true);
const apiDuration = new Trend('api_duration', true);
const healthDuration = new Trend('health_duration', true);
const totalRequests = new Counter('total_requests');

// ── Configuration ───────────────────────────────────────────────────────────

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8080';
const AUTH_EMAIL = __ENV.AUTH_EMAIL || 'admin@sgg.ga';
const AUTH_PASSWORD = __ENV.AUTH_PASSWORD || 'admin123';

export const options = {
    // ── Scénarios ──────────────────────────────────────────────────────────
    scenarios: {
        // Smoke test: 1 user, 30s — vérification basique
        smoke: {
            executor: 'constant-vus',
            vus: 1,
            duration: '30s',
            startTime: '0s',
            tags: { scenario: 'smoke' },
        },

        // Load test: montée progressive → pic → descente
        load: {
            executor: 'ramping-vus',
            startVUs: 0,
            stages: [
                { duration: '30s', target: 20 },   // Montée
                { duration: '1m', target: 50 },   // Plateau
                { duration: '30s', target: 100 },  // Pic
                { duration: '1m', target: 100 },  // Maintien pic
                { duration: '30s', target: 0 },    // Descente
            ],
            startTime: '30s',
            tags: { scenario: 'load' },
        },

        // Spike test: pic brutal
        spike: {
            executor: 'ramping-vus',
            startVUs: 0,
            stages: [
                { duration: '10s', target: 200 },  // Spike
                { duration: '30s', target: 200 },  // Maintien
                { duration: '10s', target: 0 },    // Retour
            ],
            startTime: '4m',
            tags: { scenario: 'spike' },
        },
    },

    // ── Seuils ─────────────────────────────────────────────────────────────
    thresholds: {
        http_req_duration: [
            'p(95)<500',    // 95% sous 500ms
            'p(99)<1500',   // 99% sous 1.5s
        ],
        errors: ['rate<0.01'],           // Taux erreur < 1%
        http_req_failed: ['rate<0.01'],
        health_duration: ['p(95)<200'],  // Health check < 200ms
        auth_duration: ['p(95)<1000'],   // Auth < 1s
        api_duration: ['p(95)<500'],     // API calls < 500ms
    },
};

// ── Helpers ──────────────────────────────────────────────────────────────────

const headers = {
    'Content-Type': 'application/json',
};

function getAuthHeaders(token) {
    return {
        ...headers,
        Authorization: `Bearer ${token}`,
    };
}

// ── Setup: Authenticate Once ────────────────────────────────────────────────

export function setup() {
    console.log(`🚀 Starting load tests against ${BASE_URL}`);

    // Try to authenticate
    const loginRes = http.post(
        `${BASE_URL}/api/auth/login`,
        JSON.stringify({ email: AUTH_EMAIL, password: AUTH_PASSWORD }),
        { headers }
    );

    let token = null;
    if (loginRes.status === 200) {
        try {
            const body = JSON.parse(loginRes.body);
            token = body.data?.token || body.token;
            console.log('✅ Authentication successful');
        } catch {
            console.log('⚠️ Auth response parse failed');
        }
    } else {
        console.log(`⚠️ Authentication failed (${loginRes.status}) — running tests without auth`);
    }

    return { token };
}

// ── Main Test Function ──────────────────────────────────────────────────────

export default function (data) {
    const token = data.token;

    // ── 1. Health Check ────────────────────────────────────────────────────
    group('Health Check', () => {
        const res = http.get(`${BASE_URL}/api/health`);
        healthDuration.add(res.timings.duration);
        totalRequests.add(1);

        const success = check(res, {
            'health: status 200': (r) => r.status === 200,
            'health: response time < 200ms': (r) => r.timings.duration < 200,
            'health: has status field': (r) => {
                try { return JSON.parse(r.body).status !== undefined; } catch { return false; }
            },
        });
        errorRate.add(!success);
    });

    sleep(0.5);

    // ── 2. Public Endpoints ────────────────────────────────────────────────
    group('Public Endpoints', () => {
        // Institutions list
        const instRes = http.get(`${BASE_URL}/api/institutions`);
        apiDuration.add(instRes.timings.duration);
        totalRequests.add(1);

        check(instRes, {
            'institutions: status 200 or 401': (r) => [200, 401].includes(r.status),
            'institutions: response time < 500ms': (r) => r.timings.duration < 500,
        });

        // API docs
        const docsRes = http.get(`${BASE_URL}/api/docs`);
        totalRequests.add(1);
        check(docsRes, {
            'docs: status 200': (r) => r.status === 200,
        });
    });

    sleep(0.3);

    // ── 3. Authenticated Endpoints ─────────────────────────────────────────
    if (token) {
        const authH = getAuthHeaders(token);

        group('Authenticated API Calls', () => {
            // Users list
            const usersRes = http.get(`${BASE_URL}/api/users`, { headers: authH });
            apiDuration.add(usersRes.timings.duration);
            totalRequests.add(1);

            check(usersRes, {
                'users: status 200': (r) => r.status === 200,
                'users: response time < 500ms': (r) => r.timings.duration < 500,
            });

            // GAR reports
            const garRes = http.get(`${BASE_URL}/api/gar`, { headers: authH });
            apiDuration.add(garRes.timings.duration);
            totalRequests.add(1);

            check(garRes, {
                'gar: status 200 or 404': (r) => [200, 404].includes(r.status),
                'gar: response time < 500ms': (r) => r.timings.duration < 500,
            });

            // Nominations
            const nomRes = http.get(`${BASE_URL}/api/nominations`, { headers: authH });
            apiDuration.add(nomRes.timings.duration);
            totalRequests.add(1);

            check(nomRes, {
                'nominations: status 200 or 404': (r) => [200, 404].includes(r.status),
            });

            // Reporting
            const repRes = http.get(`${BASE_URL}/api/reporting`, { headers: authH });
            apiDuration.add(repRes.timings.duration);
            totalRequests.add(1);

            check(repRes, {
                'reporting: status 200 or 404': (r) => [200, 404].includes(r.status),
            });
        });

        sleep(0.3);

        group('Audit Trail', () => {
            const auditRes = http.get(`${BASE_URL}/api/audit?page=1&pageSize=10`, { headers: authH });
            apiDuration.add(auditRes.timings.duration);
            totalRequests.add(1);

            check(auditRes, {
                'audit: status 200 or 403': (r) => [200, 403].includes(r.status),
                'audit: response time < 500ms': (r) => r.timings.duration < 500,
            });

            const statsRes = http.get(`${BASE_URL}/api/audit/stats?days=7`, { headers: authH });
            apiDuration.add(statsRes.timings.duration);
            totalRequests.add(1);

            check(statsRes, {
                'audit stats: status 200 or 403': (r) => [200, 403].includes(r.status),
            });
        });

        sleep(0.3);

        group('Workflow API', () => {
            const templatesRes = http.get(`${BASE_URL}/api/workflows/templates`, { headers: authH });
            apiDuration.add(templatesRes.timings.duration);
            totalRequests.add(1);

            check(templatesRes, {
                'workflow templates: status 200': (r) => r.status === 200,
            });
        });
    }

    // ── 4. Login Stress ────────────────────────────────────────────────────
    group('Auth Stress', () => {
        const loginRes = http.post(
            `${BASE_URL}/api/auth/login`,
            JSON.stringify({
                email: `user${__VU}@test.ga`,
                password: 'test12345',
            }),
            { headers }
        );
        authDuration.add(loginRes.timings.duration);
        totalRequests.add(1);

        // We expect these to fail (wrong creds) — just testing response time
        check(loginRes, {
            'login stress: response time < 1s': (r) => r.timings.duration < 1000,
            'login stress: returns 4xx': (r) => r.status >= 400 && r.status < 500,
        });
    });

    sleep(Math.random() * 2 + 0.5); // Random think time 0.5-2.5s
}

// ── Teardown ────────────────────────────────────────────────────────────────

export function teardown(data) {
    console.log('\n📊 Load test completed!');
    console.log(`   Auth token: ${data.token ? 'Present' : 'Absent'}`);
    console.log(`   Base URL: ${BASE_URL}`);
}
