/**
 * SGG Digital — Hook React pour WebSocket Temps Réel
 *
 * Se connecte au serveur WebSocket et fournit les messages
 * en temps réel aux composants React.
 *
 * Usage :
 *   const { isConnected, messages, subscribe, unsubscribe } = useWebSocket();
 */

import { useState, useEffect, useCallback, useRef } from 'react';

// ── Types ───────────────────────────────────────────────────────────────────

export interface WSIncomingMessage {
    type: 'notification' | 'data_change' | 'broadcast' | 'error' | 'pong' | 'subscribed' | 'unsubscribed';
    channel?: string;
    data?: any;
    timestamp: number;
}

type MessageHandler = (message: WSIncomingMessage) => void;

interface UseWebSocketOptions {
    /** Auto-connect on mount (default: true) */
    autoConnect?: boolean;
    /** Auto-reconnect on disconnect (default: true) */
    autoReconnect?: boolean;
    /** Max reconnection attempts (default: 10) */
    maxReconnectAttempts?: number;
    /** Reconnection delay base in ms (default: 1000) */
    reconnectDelay?: number;
    /** Channels to auto-subscribe to */
    channels?: string[];
}

interface UseWebSocketReturn {
    /** Whether the WebSocket is connected */
    isConnected: boolean;
    /** Connection status */
    status: 'connecting' | 'connected' | 'disconnected' | 'reconnecting' | 'error';
    /** Last N received messages */
    messages: WSIncomingMessage[];
    /** Last error message */
    lastError: string | null;
    /** Subscribe to a channel */
    subscribe: (channel: string) => void;
    /** Unsubscribe from a channel */
    unsubscribe: (channel: string) => void;
    /** Send a custom message */
    send: (message: any) => void;
    /** Manually connect */
    connect: () => void;
    /** Manually disconnect */
    disconnect: () => void;
    /** Add a message handler for a specific type */
    onMessage: (handler: MessageHandler) => () => void;
}

// ── Constants ───────────────────────────────────────────────────────────────

const MAX_STORED_MESSAGES = 100;
const PING_INTERVAL = 25_000; // 25s (under server's 30s heartbeat)

/**
 * Get the WebSocket URL based on the current environment
 */
function getWSUrl(token: string): string {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = import.meta.env.VITE_API_URL
        ? new URL(import.meta.env.VITE_API_URL).host
        : window.location.host;
    return `${protocol}//${host}/ws?token=${encodeURIComponent(token)}`;
}

// ── Hook ────────────────────────────────────────────────────────────────────

export function useWebSocket(options: UseWebSocketOptions = {}): UseWebSocketReturn {
    const {
        autoConnect = true,
        autoReconnect = true,
        maxReconnectAttempts = 10,
        reconnectDelay = 1000,
        channels = [],
    } = options;

    const [isConnected, setIsConnected] = useState(false);
    const [status, setStatus] = useState<UseWebSocketReturn['status']>('disconnected');
    const [messages, setMessages] = useState<WSIncomingMessage[]>([]);
    const [lastError, setLastError] = useState<string | null>(null);

    const wsRef = useRef<WebSocket | null>(null);
    const reconnectAttemptsRef = useRef(0);
    const reconnectTimerRef = useRef<NodeJS.Timeout | null>(null);
    const pingTimerRef = useRef<NodeJS.Timeout | null>(null);
    const handlersRef = useRef<Set<MessageHandler>>(new Set());
    const mountedRef = useRef(true);

    // ── Get Auth Token ──────────────────────────────────────────────────────

    const getToken = useCallback((): string | null => {
        // Try localStorage (our auth context stores JWT there)
        try {
            const token = localStorage.getItem('sgg_auth_token');
            if (token) return token;

            // Try session storage
            const sessionToken = sessionStorage.getItem('sgg_auth_token');
            if (sessionToken) return sessionToken;
        } catch { /* ignore */ }

        return null;
    }, []);

    // ── Message Handler ─────────────────────────────────────────────────────

    const handleMessage = useCallback((event: MessageEvent) => {
        try {
            const message: WSIncomingMessage = JSON.parse(event.data);

            // Handle internal message types
            if (message.type === 'pong') return; // Heartbeat response
            if (message.type === 'error') {
                setLastError(message.data?.message || 'Unknown error');
                return;
            }

            // Store message
            setMessages(prev => {
                const updated = [message, ...prev];
                return updated.slice(0, MAX_STORED_MESSAGES);
            });

            // Notify all registered handlers
            for (const handler of handlersRef.current) {
                try {
                    handler(message);
                } catch (err) {
                    console.error('[WS Hook] Handler error:', err);
                }
            }
        } catch (err) {
            console.error('[WS Hook] Failed to parse message:', err);
        }
    }, []);

    // ── Connect ─────────────────────────────────────────────────────────────

    const connect = useCallback(() => {
        const token = getToken();
        if (!token) {
            console.warn('[WS Hook] No auth token — skipping WebSocket connection');
            return;
        }

        // Close existing connection
        if (wsRef.current) {
            wsRef.current.close();
        }

        setStatus('connecting');
        const url = getWSUrl(token);

        try {
            const ws = new WebSocket(url);
            wsRef.current = ws;

            ws.onopen = () => {
                if (!mountedRef.current) return;
                setIsConnected(true);
                setStatus('connected');
                setLastError(null);
                reconnectAttemptsRef.current = 0;
                if (import.meta.env.DEV) console.log('[WS] Connected');

                // Auto-subscribe to requested channels
                for (const channel of channels) {
                    ws.send(JSON.stringify({ type: 'subscribe', channel }));
                }

                // Start ping interval
                pingTimerRef.current = setInterval(() => {
                    if (ws.readyState === WebSocket.OPEN) {
                        ws.send(JSON.stringify({ type: 'ping' }));
                    }
                }, PING_INTERVAL);
            };

            ws.onmessage = handleMessage;

            ws.onclose = (event) => {
                if (!mountedRef.current) return;
                setIsConnected(false);
                setStatus('disconnected');

                if (pingTimerRef.current) {
                    clearInterval(pingTimerRef.current);
                    pingTimerRef.current = null;
                }

                if (import.meta.env.DEV) console.log(`[WS] Disconnected (code: ${event.code})`);

                // Auto-reconnect with exponential backoff
                if (autoReconnect && reconnectAttemptsRef.current < maxReconnectAttempts && event.code !== 1000) {
                    const delay = reconnectDelay * Math.pow(2, reconnectAttemptsRef.current);
                    reconnectAttemptsRef.current++;
                    setStatus('reconnecting');
                    if (import.meta.env.DEV) console.log(`[WS] Reconnecting in ${delay}ms (attempt ${reconnectAttemptsRef.current}/${maxReconnectAttempts})`);

                    reconnectTimerRef.current = setTimeout(connect, delay);
                }
            };

            ws.onerror = () => {
                if (!mountedRef.current) return;
                setStatus('error');
                setLastError('WebSocket connection error');
            };
        } catch (err) {
            setStatus('error');
            setLastError((err as Error).message);
        }
    }, [getToken, handleMessage, autoReconnect, maxReconnectAttempts, reconnectDelay, channels]);

    // ── Disconnect ──────────────────────────────────────────────────────────

    const disconnect = useCallback(() => {
        if (reconnectTimerRef.current) {
            clearTimeout(reconnectTimerRef.current);
            reconnectTimerRef.current = null;
        }
        if (pingTimerRef.current) {
            clearInterval(pingTimerRef.current);
            pingTimerRef.current = null;
        }
        if (wsRef.current) {
            reconnectAttemptsRef.current = maxReconnectAttempts; // Prevent auto-reconnect
            wsRef.current.close(1000, 'Client disconnect');
            wsRef.current = null;
        }

        setIsConnected(false);
        setStatus('disconnected');
    }, [maxReconnectAttempts]);

    // ── Subscribe / Unsubscribe ─────────────────────────────────────────────

    const subscribe = useCallback((channel: string) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ type: 'subscribe', channel }));
        }
    }, []);

    const unsubscribe = useCallback((channel: string) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ type: 'unsubscribe', channel }));
        }
    }, []);

    // ── Send ────────────────────────────────────────────────────────────────

    const send = useCallback((message: any) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify(message));
        }
    }, []);

    // ── On Message Handler ──────────────────────────────────────────────────

    const onMessage = useCallback((handler: MessageHandler) => {
        handlersRef.current.add(handler);
        // Return cleanup function
        return () => {
            handlersRef.current.delete(handler);
        };
    }, []);

    // ── Lifecycle ───────────────────────────────────────────────────────────

    useEffect(() => {
        mountedRef.current = true;

        if (autoConnect) {
            // Small delay to ensure auth token is available
            const timer = setTimeout(connect, 500);
            return () => {
                clearTimeout(timer);
                mountedRef.current = false;
                disconnect();
            };
        }

        return () => {
            mountedRef.current = false;
            disconnect();
        };
    }, [autoConnect, connect, disconnect]);

    return {
        isConnected,
        status,
        messages,
        lastError,
        subscribe,
        unsubscribe,
        send,
        connect,
        disconnect,
        onMessage,
    };
}

export default useWebSocket;
