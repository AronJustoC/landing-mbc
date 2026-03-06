/**
 * Hook reutilizable para conexión WebSocket con auto-reconexión.
 * Soporta endpoints dinámicos (e.g. 'aceleracion?node=33192').
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { WS_BASE } from '../config';

const WS_BASE_URL = WS_BASE;
const isDev = import.meta.env.DEV;
const RECONNECT_DELAY_MS = 3000;

interface UseWebSocketResult<T> {
    data: T | null;
    connected: boolean;
}

export function useWebSocket<T>(endpoint: string): UseWebSocketResult<T> {
    const [data, setData] = useState<T | null>(null);
    const [connected, setConnected] = useState(false);
    const wsRef = useRef<WebSocket | null>(null);
    const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isMountedRef = useRef(true);

    const connect = useCallback(() => {
        if (!isMountedRef.current) return;
        // Endpoint especial para deshabilitar conexión (cards sin nodo asignado)
        if (endpoint === '__disabled__') return;

        const sep = endpoint.includes('?') ? '&' : '?';
        const url = `${WS_BASE_URL}/${endpoint}${isDev ? '' : `${sep}ngrok-skip-browser-warning=true`}`;

        try {
            const ws = new WebSocket(url);
            wsRef.current = ws;

            ws.onopen = () => {
                if (!isMountedRef.current) return;
                setConnected(true);
            };

            ws.onclose = () => {
                if (!isMountedRef.current) return;
                setConnected(false);
                reconnectTimerRef.current = setTimeout(() => {
                    if (isMountedRef.current) connect();
                }, RECONNECT_DELAY_MS);
            };

            ws.onerror = () => {
                ws.close();
            };

            ws.onmessage = (event) => {
                if (!isMountedRef.current) return;
                try {
                    const parsed = JSON.parse(event.data) as T;
                    setData(parsed);
                } catch {
                    console.warn(`[WS] Error parseando mensaje de ${endpoint}`);
                }
            };
        } catch {
            reconnectTimerRef.current = setTimeout(() => {
                if (isMountedRef.current) connect();
            }, RECONNECT_DELAY_MS);
        }
    }, [endpoint]);

    useEffect(() => {
        isMountedRef.current = true;
        // Cerrar conexión anterior si el endpoint cambió
        if (wsRef.current) {
            wsRef.current.onclose = null;
            wsRef.current.close();
            wsRef.current = null;
        }
        setData(null);
        connect();

        return () => {
            isMountedRef.current = false;
            if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
            if (wsRef.current) {
                wsRef.current.onclose = null;
                wsRef.current.close();
            }
        };
    }, [connect]);

    return { data, connected };
}
