/**
 * DaqControlPanel — Panel de control del proceso DAQ.
 *
 * Permite iniciar/detener la adquisición de datos y muestra métricas
 * en tiempo real: estado, PID, uptime, muestras, tasa de muestreo.
 * Consume los endpoints REST /api/daq/start, /api/daq/stop, /api/daq/status.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { API_BASE } from '../../config';
const STATUS_POLL_INTERVAL_MS = 2000;

/** Estado del DAQ desde el backend */
interface DaqStatus {
    running: boolean;
    pid: number | null;
    mode: string | null;
    uptime_seconds: number;
    total_samples: number;
    sample_rate: number;
    hdf5_exists: boolean;
    hdf5_size_mb: number;
}

/** Colores del sistema de diseño */
const COLORS = {
    bg: '#121214',
    cardBorder: 'rgba(255, 255, 255, 0.05)',
    text: '#9ca3af',
    textLight: '#d1d5db',
    white: '#ffffff',
    green: '#22c55e',
    greenBg: 'rgba(34, 197, 94, 0.1)',
    greenBorder: 'rgba(34, 197, 94, 0.2)',
    red: '#ef4444',
    redBg: 'rgba(239, 68, 68, 0.1)',
    redBorder: 'rgba(239, 68, 68, 0.2)',
    cyan: '#06b6d4',
    cyanBg: 'rgba(6, 182, 212, 0.1)',
    cyanBorder: 'rgba(6, 182, 212, 0.2)',
    yellow: '#eab308',
    yellowBg: 'rgba(234, 179, 8, 0.1)',
    yellowBorder: 'rgba(234, 179, 8, 0.2)',
};

function formatUptime(seconds: number): string {
    if (seconds <= 0) return '0s';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    if (hours > 0) return `${hours}h ${minutes}m ${secs}s`;
    if (minutes > 0) return `${minutes}m ${secs}s`;
    return `${secs}s`;
}

function formatNumber(value: number): string {
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
    return value.toString();
}

export default function DaqControlPanel() {
    const [status, setStatus] = useState<DaqStatus | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const isMountedRef = useRef(true);

    const fetchStatus = useCallback(async () => {
        try {
            const response = await fetch(`${API_BASE}/daq/status`, {
                signal: AbortSignal.timeout(3000),
            });
            const data: DaqStatus = await response.json();
            if (isMountedRef.current) {
                setStatus(data);
                setError(null);
            }
        } catch {
            if (isMountedRef.current) {
                setError('Sin conexión al backend');
            }
        }
    }, []);

    useEffect(() => {
        isMountedRef.current = true;
        fetchStatus();
        const interval = setInterval(fetchStatus, STATUS_POLL_INTERVAL_MS);
        return () => {
            isMountedRef.current = false;
            clearInterval(interval);
        };
    }, [fetchStatus]);

    const handleStart = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE}/daq/start`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mode: 'mscl' }),
            });
            const result = await response.json();
            if (!result.success) {
                setError(result.message);
            }
            // Refrescar estado inmediato
            setTimeout(fetchStatus, 500);
        } catch {
            setError('Error al iniciar DAQ');
        } finally {
            setLoading(false);
        }
    };

    const handleStop = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE}/daq/stop`, {
                method: 'POST',
            });
            const result = await response.json();
            if (!result.success) {
                setError(result.message);
            }
            setTimeout(fetchStatus, 500);
        } catch {
            setError('Error al detener DAQ');
        } finally {
            setLoading(false);
        }
    };

    const isRunning = status?.running ?? false;
    const statusColor = isRunning ? COLORS.green : COLORS.red;
    const statusBg = isRunning ? COLORS.greenBg : COLORS.redBg;
    const statusBorder = isRunning ? COLORS.greenBorder : COLORS.redBorder;
    const statusText = isRunning ? 'Activo' : 'Detenido';
    const statusIcon = isRunning ? '🟢' : '🔴';

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
                    <h3 style={{
                        color: COLORS.white,
                        fontSize: '14px',
                        fontWeight: 600,
                        margin: 0,
                    }}>
                        🎛️ Control de Adquisición DAQ
                    </h3>
                    {/* Status badge */}
                    <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '11px',
                        padding: '3px 10px',
                        borderRadius: '9999px',
                        backgroundColor: statusBg,
                        color: statusColor,
                        border: `1px solid ${statusBorder}`,
                        fontWeight: 500,
                    }}>
                        <span style={{
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            backgroundColor: statusColor,
                            animation: isRunning ? 'daqPulse 2s infinite' : 'none',
                        }} />
                        {statusText}
                    </span>
                    {status?.mode && isRunning && (
                        <span style={{
                            fontSize: '10px',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            backgroundColor: COLORS.cyanBg,
                            color: COLORS.cyan,
                            border: `1px solid ${COLORS.cyanBorder}`,
                            textTransform: 'uppercase',
                            fontWeight: 500,
                            letterSpacing: '0.05em',
                        }}>
                            {status.mode}
                        </span>
                    )}
                </div>

                {/* Botones de control */}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', width: '100%' }}>
                    <button
                        onClick={handleStart}
                        disabled={loading || isRunning}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flex: 1,
                            minWidth: '120px',
                            gap: '6px',
                            padding: '8px 16px',
                            fontSize: '12px',
                            fontWeight: 500,
                            borderRadius: '8px',
                            border: `1px solid ${COLORS.greenBorder}`,
                            backgroundColor: isRunning ? 'transparent' : COLORS.greenBg,
                            color: isRunning ? COLORS.text : COLORS.green,
                            cursor: isRunning || loading ? 'not-allowed' : 'pointer',
                            opacity: isRunning || loading ? 0.5 : 1,
                            transition: 'all 0.2s',
                        }}
                    >
                        ▶ Iniciar
                    </button>
                    <button
                        onClick={handleStop}
                        disabled={loading || !isRunning}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flex: 1,
                            minWidth: '120px',
                            gap: '6px',
                            padding: '8px 16px',
                            fontSize: '12px',
                            fontWeight: 500,
                            borderRadius: '8px',
                            border: `1px solid ${COLORS.redBorder}`,
                            backgroundColor: !isRunning ? 'transparent' : COLORS.redBg,
                            color: !isRunning ? COLORS.text : COLORS.red,
                            cursor: !isRunning || loading ? 'not-allowed' : 'pointer',
                            opacity: !isRunning || loading ? 0.5 : 1,
                            transition: 'all 0.2s',
                        }}
                    >
                        ⏹ Detener
                    </button>
                </div>
            </div>

            {/* Error message */}
            {error && (
                <div style={{
                    padding: '8px 12px',
                    marginBottom: '12px',
                    borderRadius: '8px',
                    backgroundColor: COLORS.yellowBg,
                    color: COLORS.yellow,
                    border: `1px solid ${COLORS.yellowBorder}`,
                    fontSize: '12px',
                }}>
                    ⚠ {error}
                </div>
            )}

            {/* Metrics grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                gap: '12px',
            }}>
                {/* PID */}
                <MetricCard
                    label="PID"
                    value={status?.pid?.toString() ?? '--'}
                    icon="🔧"
                />
                {/* Uptime */}
                <MetricCard
                    label="Tiempo Activo"
                    value={status ? formatUptime(status.uptime_seconds) : '--'}
                    icon="⏱"
                />
                {/* Total muestras */}
                <MetricCard
                    label="Muestras HDF5"
                    value={status ? formatNumber(status.total_samples) : '--'}
                    icon="📊"
                />
                {/* Tasa de muestreo */}
                <MetricCard
                    label="Tasa Actual"
                    value={status ? `${status.sample_rate}/s` : '--'}
                    icon="⚡"
                    highlight={isRunning && status !== null && status.sample_rate > 200}
                />
                {/* HDF5 Size */}
                <MetricCard
                    label="Archivo HDF5"
                    value={status?.hdf5_exists ? `${status.hdf5_size_mb} MB` : 'No existe'}
                    icon="💾"
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

/** Tarjeta de métrica individual */
function MetricCard({ label, value, icon, highlight = false }: {
    label: string;
    value: string;
    icon: string;
    highlight?: boolean;
}) {
    return (
        <div style={{
            padding: '12px',
            borderRadius: '8px',
            backgroundColor: highlight ? COLORS.cyanBg : 'rgba(255, 255, 255, 0.02)',
            border: `1px solid ${highlight ? COLORS.cyanBorder : 'rgba(255, 255, 255, 0.04)'}`,
        }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                marginBottom: '6px',
            }}>
                <span style={{ fontSize: '14px' }}>{icon}</span>
                <span style={{
                    fontSize: '10px',
                    color: COLORS.text,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    fontWeight: 500,
                }}>
                    {label}
                </span>
            </div>
            <span style={{
                fontSize: '16px',
                fontWeight: 600,
                color: highlight ? COLORS.cyan : COLORS.white,
                fontFamily: 'monospace',
            }}>
                {value}
            </span>
        </div>
    );
}
