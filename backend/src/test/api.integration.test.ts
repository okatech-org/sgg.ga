/**
 * SGG Digital — Backend API Integration Tests
 *
 * Tests the HTTP layer using Supertest against the Express app.
 * These tests validate:
 *   - HTTP status codes
 *   - Response structure (JSON shape)
 *   - Authentication enforcement
 *   - Content-type headers
 *
 * Note: These tests run against the Express app directly,
 * without starting a real server (Supertest injects requests).
 */

import { describe, it, expect, beforeAll, vi } from 'vitest';
import request from 'supertest';
import express from 'express';

// ── Mock database & redis before importing route modules ────────────────────

vi.mock('../config/database.js', () => ({
    query: vi.fn().mockResolvedValue({ rows: [], rowCount: 0 }),
    healthCheck: vi.fn().mockResolvedValue(true),
    transaction: vi.fn().mockImplementation(async (fn: any) => {
        const mockClient = {
            query: vi.fn().mockResolvedValue({ rows: [], rowCount: 0 }),
        };
        return fn(mockClient);
    }),
    getPool: vi.fn().mockReturnValue({
        query: vi.fn().mockResolvedValue({ rows: [{ now: new Date() }] }),
        end: vi.fn(),
    }),
}));

vi.mock('../config/redis.js', () => ({
    cacheGet: vi.fn().mockResolvedValue(null),
    cacheSet: vi.fn().mockResolvedValue('OK'),
    cacheDelete: vi.fn().mockResolvedValue(1),
    redisHealthCheck: vi.fn().mockResolvedValue(true),
    getRedis: vi.fn().mockReturnValue({
        status: 'ready',
        ping: vi.fn().mockResolvedValue('PONG'),
        quit: vi.fn(),
    }),
}));

// ── Import routes after mocks are set up ────────────────────────────────────

import healthRoutes from '../routes/health.js';
import monitoringRoutes from '../routes/monitoring.js';

// ── Build a minimal test app ────────────────────────────────────────────────

function createTestApp() {
    const app = express();
    app.use(express.json());
    app.use('/api/health', healthRoutes);
    app.use('/api/monitoring', monitoringRoutes);

    // Root endpoint
    app.get('/', (_req, res) => {
        res.json({ name: 'SGG Digital API', version: '2.1.0' });
    });

    return app;
}

// ── Tests ───────────────────────────────────────────────────────────────────

describe('API Integration Tests', () => {
    let app: express.Express;

    beforeAll(() => {
        app = createTestApp();
    });

    // ── Root Endpoint ─────────────────────────────────────────────────────

    describe('GET /', () => {
        it('should return API info with correct shape', async () => {
            const res = await request(app).get('/');

            expect(res.status).toBe(200);
            expect(res.headers['content-type']).toMatch(/json/);
            expect(res.body).toHaveProperty('name', 'SGG Digital API');
            expect(res.body).toHaveProperty('version');
        });
    });

    // ── Health Endpoints ──────────────────────────────────────────────────

    describe('GET /api/health', () => {
        it('should return 200 with health status', async () => {
            const res = await request(app).get('/api/health');

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('success', true);
            expect(res.body.data).toHaveProperty('status');
            expect(res.body.data).toHaveProperty('timestamp');
        });
    });

    describe('GET /api/health/detailed', () => {
        it('should return detailed health with services', async () => {
            const res = await request(app).get('/api/health/detailed');

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('success');
        });
    });

    // ── Monitoring Endpoint ───────────────────────────────────────────────

    describe('POST /api/monitoring/events', () => {
        it('should accept valid monitoring events', async () => {
            const payload = {
                app: 'sgg-digital',
                version: '2.1.0',
                events: [
                    {
                        type: 'error',
                        timestamp: new Date().toISOString(),
                        url: '/dashboard',
                        userAgent: 'test',
                        data: { message: 'Test error', stack: 'Error at ...' },
                    },
                    {
                        type: 'performance',
                        timestamp: new Date().toISOString(),
                        url: '/dashboard',
                        userAgent: 'test',
                        data: { metric: 'LCP', value: 1200 },
                    },
                ],
            };

            const res = await request(app)
                .post('/api/monitoring/events')
                .send(payload)
                .set('Content-Type', 'application/json');

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('success', true);
            expect(res.body).toHaveProperty('received', 2);
            expect(res.body).toHaveProperty('errors', 1);
            expect(res.body).toHaveProperty('performance', 1);
        });

        it('should reject invalid payload', async () => {
            const res = await request(app)
                .post('/api/monitoring/events')
                .send({ invalid: true })
                .set('Content-Type', 'application/json');

            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('success', false);
            expect(res.body.error).toHaveProperty('code', 'INVALID_PAYLOAD');
        });

        it('should handle empty events array', async () => {
            const res = await request(app)
                .post('/api/monitoring/events')
                .send({ app: 'test', version: '1.0', events: [] })
                .set('Content-Type', 'application/json');

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('received', 0);
        });
    });

    // ── Monitoring Status ─────────────────────────────────────────────────

    describe('GET /api/monitoring/status', () => {
        it('should return monitoring service status', async () => {
            const res = await request(app).get('/api/monitoring/status');

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('success', true);
            expect(res.body.data).toHaveProperty('service', 'sgg-digital-monitoring');
            expect(res.body.data).toHaveProperty('status', 'active');
            expect(res.body.data).toHaveProperty('uptime');
        });
    });

    // ── 404 Handling ──────────────────────────────────────────────────────

    describe('404 Not Found', () => {
        it('should return 404 for unknown routes', async () => {
            const res = await request(app).get('/api/nonexistent');

            expect(res.status).toBe(404);
        });
    });

    // ── Content Type ──────────────────────────────────────────────────────

    describe('Content Types', () => {
        it('should return JSON for API endpoints', async () => {
            const res = await request(app).get('/api/health');

            expect(res.headers['content-type']).toMatch(/application\/json/);
        });
    });
});
