/**
 * DaqControlPanel — Control del DAQ vía MQTT.
 *
 * Publica comandos en zaranda/daq/cmd y lee estado desde zaranda/status.
 * Sin HTTP, sin túneles — mismo canal que los gráficos en tiempo real.
 */

import { useState, useEffect, useRef } from 'react';
import { useMQTT, publishMQTT } from '../../hooks/useMQTT';
import { MQTT_TOPIC_BASE } from '../../config';

const CMD_TOPIC = `${MQTT_TOPIC_BASE}/daq/cmd`;

interface DaqStatus {
    acquiring:    boolean;
    nodes_active: number[];
    ts:           number;
    online?:      boolean;
}

const COLORS = {
    bg:          '#121214',
    cardBorder:  'rgba(255, 255, 255, 0.05)',
    text:        '#9ca3af',
    textLight:   '#d1d5db',
    white:       '#ffffff',
    green:       '#22c55e',
    greenBg:     'rgba(34, 197, 94, 0.1)',
    greenBorder: 'rgba(34, 197, 94, 0.2)',
    red:         '#ef4444',
    redBg:       'rgba(239, 68, 68, 0.1)',
    redBorder:   'rgba(239, 68, 68, 0.2)',
    cyan:        '#06b6d4',
    cyanBg:      'rgba(6, 182, 212, 0.1)',
    cyanBorder:  'rgba(6, 182, 212, 0.2)',
    yellow:      '#eab308',
    yellowBg:    'rgba(234, 179, 8, 0.1)',
    yellowBorder:'rgba(234, 179, 8, 0.2)',
};

function formatUptime(seconds: number): string {
    if (seconds <= 0) return '0s';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) return `${h}h ${m}m ${s}s`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
}

export default function DaqControlPanel() {
    const { data: status, connected } = useMQTT<DaqStatus>('status');
    const [loading,   setLoading]   = useState(false);
    const [uptime,    setUptime]    = useState(0);
    const startRef = useRef<number | null>(null);

    // Calcular uptime localmente desde cuando acquiring pasó a true
    useEffect(() => {
        if (status?.acquiring) {
            if (startRef.current === null) startRef.current = Date.now();
        } else {
            startRef.current = null;
            setUptime(0);
        }
    }, [status?.acquiring]);

    useEffect(() => {
        if (!status?.acquiring) return;
        const interval = setInterval(() => {
            if (startRef.current !== null) {
                setUptime(Math.floor((Date.now() - startRef.current) / 1000));
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [status?.acquiring]);

    const handleStart = () => {
        setLoading(true);
        publishMQTT(CMD_TOPIC, { cmd: 'start' });
        setTimeout(() => setLoading(false), 1000);
    };

    const handleStop = () => {
        setLoading(true);
        publishMQTT(CMD_TOPIC, { cmd: 'stop' });
        setTimeout(() => setLoading(false), 1000);
    };

    const isRunning     = status?.acquiring ?? false;
    const nodesActive   = status?.nodes_active ?? [];
    const statusColor   = isRunning ? COLORS.green  : COLORS.red;
    const statusBg      = isRunning ? COLORS.greenBg  : COLORS.redBg;
    const statusBorder  = isRunning ? COLORS.greenBorder : COLORS.redBorder;
    const statusText    = isRunning ? 'Activo' : 'Detenido';

    return (
        <div style={{
            backgroundColor: COLORS.bg,
            border: `1px solid ${COLORS.cardBorder}`,
            borderRadius: '12px',
            padding: '20px',
        }}>
            {/* Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px',
                flexWrap: 'wrap',
                gap: '12px',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <h3 style={{ color: COLORS.white, fontSize: '14px', fontWeight: 600, margin: 0 }}>
                        🎛️ Control de Adquisición DAQ
                    </h3>
                    <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: '6px',
                        fontSize: '11px', padding: '3px 10px', borderRadius: '9999px',
                        backgroundColor: statusBg, color: statusColor,
                        border: `1px solid ${statusBorder}`, fontWeight: 500,
                    }}>
                        <span style={{
                            width: '6px', height: '6px', borderRadius: '50%',
                            backgroundColor: statusColor,
                            animation: isRunning ? 'daqPulse 2s infinite' : 'none',
                        }} />
                        {statusText}
                    </span>
                    {/* Indicador de conexión MQTT */}
                    <span style={{
                        fontSize: '10px', padding: '2px 8px', borderRadius: '4px',
                        backgroundColor: connected ? COLORS.cyanBg : COLORS.yellowBg,
                        color: connected ? COLORS.cyan : COLORS.yellow,
                        border: `1px solid ${connected ? COLORS.cyanBorder : COLORS.yellowBorder}`,
                    }}>
                        {connected ? 'MQTT ✓' : 'MQTT...'}
                    </span>
                </div>

                {/* Botones */}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', width: '100%' }}>
                    <button
                        onClick={handleStart}
                        disabled={loading || isRunning || !connected}
                        style={{
                            flex: 1, minWidth: '120px', gap: '6px',
                            padding: '8px 16px', fontSize: '12px', fontWeight: 500,
                            borderRadius: '8px', border: `1px solid ${COLORS.greenBorder}`,
                            backgroundColor: (isRunning || !connected) ? 'transparent' : COLORS.greenBg,
                            color: (isRunning || !connected) ? COLORS.text : COLORS.green,
                            cursor: (isRunning || loading || !connected) ? 'not-allowed' : 'pointer',
                            opacity: (isRunning || loading || !connected) ? 0.5 : 1,
                        }}
                    >
                        ▶ Iniciar
                    </button>
                    <button
                        onClick={handleStop}
                        disabled={loading || !isRunning || !connected}
                        style={{
                            flex: 1, minWidth: '120px', gap: '6px',
                            padding: '8px 16px', fontSize: '12px', fontWeight: 500,
                            borderRadius: '8px', border: `1px solid ${COLORS.redBorder}`,
                            backgroundColor: (!isRunning || !connected) ? 'transparent' : COLORS.redBg,
                            color: (!isRunning || !connected) ? COLORS.text : COLORS.red,
                            cursor: (!isRunning || loading || !connected) ? 'not-allowed' : 'pointer',
                            opacity: (!isRunning || loading || !connected) ? 0.5 : 1,
                        }}
                    >
                        ⏹ Detener
                    </button>
                </div>
            </div>

            {/* Métricas disponibles vía MQTT */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                gap: '12px',
            }}>
                <MetricCard label="Nodos Activos"
                    value={isRunning ? `${nodesActive.length} / 4` : '--'}
                    icon="📡"
                    highlight={isRunning && nodesActive.length > 0}
                />
                <MetricCard label="Tiempo Activo"
                    value={isRunning ? formatUptime(uptime) : '--'}
                    icon="⏱"
                />
                <MetricCard label="Nodos"
                    value={nodesActive.length > 0 ? nodesActive.join(', ') : '--'}
                    icon="🔧"
                />
                <MetricCard label="Tasa"
                    value={isRunning ? '128 Hz' : '--'}
                    icon="⚡"
                    highlight={isRunning}
                />
            </div>

            <style>{`
                @keyframes daqPulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.4; }
                }
            `}</style>
        </div>
    );
}

function MetricCard({ label, value, icon, highlight = false }: {
    label: string; value: string; icon: string; highlight?: boolean;
}) {
    return (
        <div style={{
            padding: '12px', borderRadius: '8px',
            backgroundColor: highlight ? COLORS.cyanBg : 'rgba(255,255,255,0.02)',
            border: `1px solid ${highlight ? COLORS.cyanBorder : 'rgba(255,255,255,0.04)'}`,
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                <span style={{ fontSize: '14px' }}>{icon}</span>
                <span style={{
                    fontSize: '10px', color: COLORS.text,
                    textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 500,
                }}>{label}</span>
            </div>
            <span style={{
                fontSize: '16px', fontWeight: 600,
                color: highlight ? COLORS.cyan : COLORS.white,
                fontFamily: 'monospace',
            }}>{value}</span>
        </div>
    );
}
