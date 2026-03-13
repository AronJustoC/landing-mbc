/**
 * ConnectionStatus — Indicador global del estado de conexión MQTT.
 *
 * Muestra si el broker MQTT está accesible y los sensores transmiten.
 * Verde pulsante = broker conectado, Rojo = sin conexión.
 *
 * Sin túnel: conexión directa vía MQTT over WebSocket.
 */

import { useState, useEffect, useRef } from 'react';
// NO import mqtt at module level — SSR crash (WebSocket undefined in Node.js).
// Dynamic import inside useEffect, same pattern as FFTChart with Plotly.
import { MQTT_URL, MQTT_USERNAME, MQTT_PASSWORD, MQTT_TOPIC_BASE } from '../../config';

export default function ConnectionStatus() {
    const [brokerOnline, setBrokerOnline]     = useState(false);
    const [daqActive, setDaqActive]           = useState(false);
    const [lastUpdate, setLastUpdate]         = useState<string>('--');
    const clientRef   = useRef<{ end: (force?: boolean) => void } | null>(null);
    const mountedRef  = useRef(true);

    useEffect(() => {
        mountedRef.current = true;

        // Dynamic import — evita SSR crash (mismo patrón que Plotly en FFTChart)
        import('mqtt').then(({ default: mqtt }) => {
            if (!mountedRef.current) return;

            const client = mqtt.connect(MQTT_URL, {
                username:        MQTT_USERNAME || undefined,
                password:        MQTT_PASSWORD || undefined,
                clientId:        `mbc_status_${Math.random().toString(16).slice(2, 8)}`,
                keepalive:       60,
                reconnectPeriod: 5000,
                clean:           true,
            });
            clientRef.current = client;

            client.on('connect', () => {
                if (!mountedRef.current) return;
                setBrokerOnline(true);
                client.subscribe(`${MQTT_TOPIC_BASE}/status`, { qos: 1 });
            });

            client.on('disconnect', () => {
                if (!mountedRef.current) return;
                setBrokerOnline(false);
                setDaqActive(false);
            });

            client.on('offline', () => {
                if (!mountedRef.current) return;
                setBrokerOnline(false);
                setDaqActive(false);
            });

            client.on('message', (_topic: string, message: Buffer) => {
                if (!mountedRef.current) return;
                try {
                    const payload = JSON.parse(message.toString());
                    if (typeof payload.acquiring === 'boolean') {
                        setDaqActive(payload.acquiring);
                    }
                    setLastUpdate(new Date().toLocaleTimeString('es-PE'));
                } catch { /* ignore */ }
            });
        });

        return () => {
            mountedRef.current = false;
            clientRef.current?.end(true);
        };
    }, []);

    const statusColor = brokerOnline
        ? (daqActive ? '#22c55e' : '#f59e0b')
        : '#ef4444';

    const statusBg = brokerOnline
        ? (daqActive ? 'rgba(34,197,94,0.1)' : 'rgba(245,158,11,0.1)')
        : 'rgba(239,68,68,0.1)';

    const statusBorder = brokerOnline
        ? (daqActive ? 'rgba(34,197,94,0.2)' : 'rgba(245,158,11,0.2)')
        : 'rgba(239,68,68,0.2)';

    const statusText = brokerOnline
        ? (daqActive ? 'MQTT · DAQ Activo' : 'MQTT · DAQ Inactivo')
        : 'Broker MQTT Offline';

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '8px',
            padding: '6px 12px',
            backgroundColor: statusBg,
            border: `1px solid ${statusBorder}`,
            borderRadius: '9999px',
            maxWidth: '100%',
        }}>
            <span style={{ position: 'relative', display: 'inline-flex', width: '8px', height: '8px' }}>
                {brokerOnline && (
                    <span style={{
                        position: 'absolute',
                        inset: 0,
                        borderRadius: '50%',
                        backgroundColor: statusColor,
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
                    backgroundColor: statusColor,
                }} />
            </span>
            <span style={{ fontSize: '12px', fontWeight: 500, color: statusColor }}>
                {statusText}
            </span>
            <span style={{ fontSize: '10px', color: '#6b7280' }}>
                {lastUpdate}
            </span>
            <style>{`
        @keyframes ping {
          75%, 100% { transform: scale(2); opacity: 0; }
        }
      `}</style>
        </div>
    );
}
