/**
 * ConnectionStatus — Indicador global del estado de conexión WebSocket.
 *
 * Muestra visualmente si el backend está accesible y los WebSockets
 * están transmitiendo datos. Verde pulsante = conectado, Rojo = offline.
 */

import { useState, useEffect, useRef, useCallback } from 'react';

const HEALTH_URL = 'http://192.168.1.4:8000/health';
const CHECK_INTERVAL_MS = 5000;

export default function ConnectionStatus() {
    const [backendOnline, setBackendOnline] = useState(false);
    const [lastCheck, setLastCheck] = useState<string>('--');
    const isMountedRef = useRef(true);

    const checkHealth = useCallback(async () => {
        try {
            const response = await fetch(HEALTH_URL, {
                method: 'GET',
                signal: AbortSignal.timeout(3000),
            });
            const data = await response.json();
            if (isMountedRef.current) {
                setBackendOnline(data.status === 'ok');
                setLastCheck(new Date().toLocaleTimeString('es-PE'));
            }
        } catch {
            if (isMountedRef.current) {
                setBackendOnline(false);
                setLastCheck(new Date().toLocaleTimeString('es-PE'));
            }
        }
    }, []);

    useEffect(() => {
        isMountedRef.current = true;
        checkHealth();
        const interval = setInterval(checkHealth, CHECK_INTERVAL_MS);

        return () => {
            isMountedRef.current = false;
            clearInterval(interval);
        };
    }, [checkHealth]);

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '8px',
            padding: '6px 12px',
            backgroundColor: backendOnline ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            border: `1px solid ${backendOnline ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
            borderRadius: '9999px',
            maxWidth: '100%',
        }}>
            <span style={{ position: 'relative', display: 'inline-flex', width: '8px', height: '8px' }}>
                {backendOnline && (
                    <span style={{
                        position: 'absolute',
                        inset: 0,
                        borderRadius: '50%',
                        backgroundColor: '#22c55e',
                        opacity: 0.75,
                        animation: 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
                    }} />
                )}
                <span style={{
                    position: 'relative',
                    display: 'inline-flex',
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: backendOnline ? '#22c55e' : '#ef4444',
                }} />
            </span>
            <span style={{
                fontSize: '12px',
                fontWeight: 500,
                color: backendOnline ? '#22c55e' : '#ef4444',
            }}>
                {backendOnline ? 'Backend en Línea' : 'Backend Offline'}
            </span>
            <span style={{ fontSize: '10px', color: '#6b7280' }}>
                {lastCheck}
            </span>
            <style>{`
        @keyframes ping {
          75%, 100% {
            transform: scale(2);
            opacity: 0;
          }
        }
      `}</style>
        </div>
    );
}
