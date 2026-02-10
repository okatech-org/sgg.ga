/**
 * SGG Digital — Service WebSocket Temps Réel
 *
 * Passerelle entre Redis Pub/Sub et les clients WebSocket.
 * Permet aux dashboards et aux interfaces de recevoir des updates
 * en temps réel sans polling.
 *
 * Architecture :
 *   Redis Pub/Sub  ──▶  WebSocket Server  ──▶  Browser Clients
 *
 * Canaux supportés :
 *   - notifications      → alertes utilisateur
 *   - data:changed       → changements de données (cache invalidation)
 *   - reporting:update   → mises à jour rapports
 *   - admin:broadcast    → messages admin broadcast
 *
 * Sécurité :
 *   - Authentification JWT sur le handshake
 *   - Canaux filtrés par rôle/permissions
 *   - Heartbeat pour détection de déconnexion
 *   - Rate limiting des messages entrants
 */

import { WebSocketServer, WebSocket } from 'ws';
import { IncomingMessage } from 'http';
import type { Server } from 'http';
import jwt from 'jsonwebtoken';
import { subscribeNotifications, publishNotification } from '../config/redis.js';

// ── Types ───────────────────────────────────────────────────────────────────

export interface WSClient {
    ws: WebSocket;
    userId: string;
    email: string;
    role: string;
    institutionId?: string;
    subscribedChannels: Set<string>;
    lastPing: number;
    messageCount: number;
    messageWindowStart: number;
}

export interface WSMessage {
    type: 'subscribe' | 'unsubscribe' | 'ping' | 'broadcast';
    channel?: string;
    data?: any;
}

export interface WSOutboundMessage {
    type: 'notification' | 'data_change' | 'broadcast' | 'error' | 'pong' | 'subscribed' | 'unsubscribed';
    channel?: string;
    data?: any;
    timestamp: number;
}

// ── Constants ───────────────────────────────────────────────────────────────

const JWT_SECRET = process.env.JWT_SECRET || '';
const HEARTBEAT_INTERVAL = 30_000; // 30s
const CLIENT_TIMEOUT = 60_000;     // 60s (2 missed heartbeats)
const MAX_MESSAGES_PER_MINUTE = 30;
const MAX_PAYLOAD_SIZE = 4096;     // 4KB max message

// Channels accessible per role
const ROLE_CHANNELS: Record<string, string[]> = {
    admin_sgg: ['notifications', 'data:changed', 'reporting:update', 'admin:broadcast', 'system:metrics'],
    directeur_sgg: ['notifications', 'data:changed', 'reporting:update', 'admin:broadcast'],
    sgpr: ['notifications', 'data:changed', 'reporting:update'],
    sg_ministere: ['notifications', 'reporting:update'],
    premier_ministre: ['notifications', 'data:changed'],
    ministre: ['notifications', 'reporting:update'],
    dgjo: ['notifications'],
    citoyen: ['notifications'],
    assemblee: ['notifications'],
    senat: ['notifications'],
    conseil_etat: ['notifications'],
    cour_constitutionnelle: ['notifications'],
};

// ── State ───────────────────────────────────────────────────────────────────

const clients = new Map<string, WSClient>();
let wss: WebSocketServer | null = null;
let heartbeatTimer: NodeJS.Timeout | null = null;

// Stats
const stats = {
    totalConnections: 0,
    totalMessages: 0,
    totalBroadcasts: 0,
    startedAt: Date.now(),
};

// ── Core Setup ──────────────────────────────────────────────────────────────

/**
 * Initialize WebSocket server attached to the HTTP server.
 * Call once at server startup.
 */
export function initWebSocket(server: Server): WebSocketServer {
    wss = new WebSocketServer({
        server,
        path: '/ws',
        maxPayload: MAX_PAYLOAD_SIZE,
        verifyClient: (info, callback) => {
            // Extract JWT from query string or header
            const token = extractToken(info.req);
            if (!token) {
                callback(false, 401, 'Authentication required');
                return;
            }

            try {
                const decoded = jwt.verify(token, JWT_SECRET) as any;
                (info.req as any).user = decoded;
                callback(true);
            } catch {
                callback(false, 401, 'Invalid token');
            }
        },
    });

    wss.on('connection', handleConnection);

    // Start heartbeat checker
    heartbeatTimer = setInterval(checkHeartbeats, HEARTBEAT_INTERVAL);

    // Subscribe to Redis notifications and forward to WS clients
    setupRedisForwarding();

    console.log('[WS] ✅ WebSocket server initialized on /ws');
    return wss;
}

/**
 * Shutdown WebSocket server
 */
export function closeWebSocket(): void {
    if (heartbeatTimer) {
        clearInterval(heartbeatTimer);
        heartbeatTimer = null;
    }

    if (wss) {
        // Close all client connections
        for (const [id, client] of clients) {
            sendMessage(client, { type: 'broadcast', data: { message: 'Server shutting down' }, timestamp: Date.now() });
            client.ws.close(1001, 'Server shutdown');
        }
        clients.clear();

        wss.close();
        wss = null;
        console.log('[WS] WebSocket server closed');
    }
}

// ── Connection Handler ──────────────────────────────────────────────────────

function handleConnection(ws: WebSocket, req: IncomingMessage): void {
    const user = (req as any).user;
    if (!user) {
        ws.close(1008, 'Authentication failed');
        return;
    }

    const clientId = `${user.userId}-${Date.now()}`;
    const client: WSClient = {
        ws,
        userId: user.userId,
        email: user.email,
        role: user.role,
        institutionId: user.institutionId,
        subscribedChannels: new Set(['notifications']), // Auto-subscribe to notifications
        lastPing: Date.now(),
        messageCount: 0,
        messageWindowStart: Date.now(),
    };

    clients.set(clientId, client);
    stats.totalConnections++;

    console.log(`[WS] 🟢 Client connected: ${user.email} (${user.role}) — ${clients.size} total`);

    // Send welcome message
    sendMessage(client, {
        type: 'subscribed',
        channel: 'notifications',
        data: {
            message: 'Connecté au système de notifications SGG Digital',
            clientId,
            availableChannels: ROLE_CHANNELS[user.role] || ['notifications'],
        },
        timestamp: Date.now(),
    });

    // Handle incoming messages
    ws.on('message', (rawData) => {
        try {
            // Rate limiting
            if (!checkMessageRateLimit(client)) {
                sendMessage(client, {
                    type: 'error',
                    data: { code: 'RATE_LIMITED', message: 'Trop de messages, veuillez patienter' },
                    timestamp: Date.now(),
                });
                return;
            }

            const message: WSMessage = JSON.parse(rawData.toString());
            handleClientMessage(clientId, client, message);
        } catch {
            sendMessage(client, {
                type: 'error',
                data: { code: 'INVALID_MESSAGE', message: 'Format de message invalide' },
                timestamp: Date.now(),
            });
        }
    });

    // Handle disconnect
    ws.on('close', (code, reason) => {
        clients.delete(clientId);
        console.log(`[WS] 🔴 Client disconnected: ${user.email} (code: ${code}) — ${clients.size} total`);
    });

    // Handle errors
    ws.on('error', (error) => {
        console.error(`[WS] Error for ${user.email}:`, error.message);
        clients.delete(clientId);
    });
}

// ── Message Handlers ────────────────────────────────────────────────────────

function handleClientMessage(clientId: string, client: WSClient, message: WSMessage): void {
    stats.totalMessages++;

    switch (message.type) {
        case 'subscribe':
            handleSubscribe(client, message.channel);
            break;

        case 'unsubscribe':
            handleUnsubscribe(client, message.channel);
            break;

        case 'ping':
            client.lastPing = Date.now();
            sendMessage(client, { type: 'pong', timestamp: Date.now() });
            break;

        case 'broadcast':
            // Only admin can broadcast
            if (client.role === 'admin_sgg') {
                broadcastToChannel('admin:broadcast', message.data);
            } else {
                sendMessage(client, {
                    type: 'error',
                    data: { code: 'FORBIDDEN', message: 'Seuls les admins peuvent broadcastér' },
                    timestamp: Date.now(),
                });
            }
            break;

        default:
            sendMessage(client, {
                type: 'error',
                data: { code: 'UNKNOWN_TYPE', message: `Type de message inconnu: ${message.type}` },
                timestamp: Date.now(),
            });
    }
}

function handleSubscribe(client: WSClient, channel?: string): void {
    if (!channel) {
        sendMessage(client, {
            type: 'error',
            data: { code: 'MISSING_CHANNEL', message: 'Canal requis' },
            timestamp: Date.now(),
        });
        return;
    }

    const allowedChannels = ROLE_CHANNELS[client.role] || ['notifications'];
    if (!allowedChannels.includes(channel)) {
        sendMessage(client, {
            type: 'error',
            data: { code: 'FORBIDDEN', message: `Accès au canal "${channel}" non autorisé pour votre rôle` },
            timestamp: Date.now(),
        });
        return;
    }

    client.subscribedChannels.add(channel);
    sendMessage(client, {
        type: 'subscribed',
        channel,
        data: { message: `Abonné au canal "${channel}"` },
        timestamp: Date.now(),
    });
}

function handleUnsubscribe(client: WSClient, channel?: string): void {
    if (!channel) return;

    // Cannot unsubscribe from notifications
    if (channel === 'notifications') {
        sendMessage(client, {
            type: 'error',
            data: { code: 'CANNOT_UNSUBSCRIBE', message: 'Impossible de se désabonner des notifications' },
            timestamp: Date.now(),
        });
        return;
    }

    client.subscribedChannels.delete(channel);
    sendMessage(client, {
        type: 'unsubscribed',
        channel,
        data: { message: `Désabonné du canal "${channel}"` },
        timestamp: Date.now(),
    });
}

// ── Broadcasting ────────────────────────────────────────────────────────────

/**
 * Broadcast a message to all clients subscribed to a channel
 */
export function broadcastToChannel(channel: string, data: any): void {
    stats.totalBroadcasts++;
    let delivered = 0;

    const message: WSOutboundMessage = {
        type: channel === 'notifications' ? 'notification' :
            channel === 'data:changed' ? 'data_change' : 'broadcast',
        channel,
        data,
        timestamp: Date.now(),
    };

    for (const [, client] of clients) {
        if (client.subscribedChannels.has(channel) && client.ws.readyState === WebSocket.OPEN) {
            sendMessage(client, message);
            delivered++;
        }
    }

    if (delivered > 0) {
        console.log(`[WS] 📡 Broadcast "${channel}" → ${delivered} client(s)`);
    }
}

/**
 * Send a message to a specific user (all their connections)
 */
export function sendToUser(userId: string, channel: string, data: any): void {
    const message: WSOutboundMessage = {
        type: 'notification',
        channel,
        data,
        timestamp: Date.now(),
    };

    for (const [, client] of clients) {
        if (client.userId === userId && client.ws.readyState === WebSocket.OPEN) {
            sendMessage(client, message);
        }
    }
}

/**
 * Send a message to all clients with a specific role
 */
export function sendToRole(role: string, channel: string, data: any): void {
    const message: WSOutboundMessage = {
        type: 'notification',
        channel,
        data,
        timestamp: Date.now(),
    };

    for (const [, client] of clients) {
        if (client.role === role && client.subscribedChannels.has(channel) && client.ws.readyState === WebSocket.OPEN) {
            sendMessage(client, message);
        }
    }
}

// ── Redis Forwarding ────────────────────────────────────────────────────────

async function setupRedisForwarding(): Promise<void> {
    try {
        await subscribeNotifications((type, data) => {
            // Forward Redis notifications to WebSocket clients
            broadcastToChannel('notifications', { type, ...data });

            // Also forward data change events
            if (type === 'data_changed') {
                broadcastToChannel('data:changed', data);
            }
        });
        console.log('[WS] ✅ Redis → WebSocket forwarding active');
    } catch (err) {
        console.warn('[WS] ⚠️ Redis forwarding unavailable:', (err as Error).message);
    }
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function sendMessage(client: WSClient, message: WSOutboundMessage): void {
    if (client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(JSON.stringify(message));
    }
}

function extractToken(req: IncomingMessage): string | null {
    // From query parameter: ws://server/ws?token=xxx
    const url = new URL(req.url || '', `http://${req.headers.host}`);
    const queryToken = url.searchParams.get('token');
    if (queryToken) return queryToken;

    // From Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
        return authHeader.substring(7);
    }

    return null;
}

function checkMessageRateLimit(client: WSClient): boolean {
    const now = Date.now();
    const elapsed = now - client.messageWindowStart;

    // Reset window every minute
    if (elapsed >= 60_000) {
        client.messageCount = 0;
        client.messageWindowStart = now;
    }

    client.messageCount++;
    return client.messageCount <= MAX_MESSAGES_PER_MINUTE;
}

function checkHeartbeats(): void {
    const now = Date.now();
    const stale: string[] = [];

    for (const [id, client] of clients) {
        if (now - client.lastPing > CLIENT_TIMEOUT) {
            stale.push(id);
            client.ws.close(1001, 'Heartbeat timeout');
        } else if (client.ws.readyState === WebSocket.OPEN) {
            // Send server-side ping
            sendMessage(client, { type: 'pong', data: { serverTime: now }, timestamp: now });
        }
    }

    for (const id of stale) {
        clients.delete(id);
    }

    if (stale.length > 0) {
        console.log(`[WS] ♻️ Cleaned ${stale.length} stale connection(s) — ${clients.size} remaining`);
    }
}

// ── Stats ───────────────────────────────────────────────────────────────────

export function getWSStats() {
    return {
        ...stats,
        activeConnections: clients.size,
        uptimeMs: Date.now() - stats.startedAt,
        clientsByRole: Array.from(clients.values()).reduce((acc, c) => {
            acc[c.role] = (acc[c.role] || 0) + 1;
            return acc;
        }, {} as Record<string, number>),
    };
}
