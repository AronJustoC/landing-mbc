/**
 * ActiveSensorPanel — 4 nodos en fila, cada uno clickeable.
 * Al hacer clic en un nodo se actualiza el nodo activo para todos los widgets.
 */

import { useState, useEffect } from 'react';
import { useMQTT as useWebSocket } from '../../hooks/useMQTT';
import { getThresholds, THRESHOLD_EVENT } from '../../config/thresholds';

const LS_KEY     = 'mbc_selected_node';
const EVENT_NAME = 'mbc-node-select';

const NODES = [
    { id: 1, sensorName: 'P1-ZARANDA', sensorId: 'Nodo 1 · 33190' },
    { id: 2, sensorName: 'P2-ZARANDA', sensorId: 'Nodo 2 · 33191' },
    { id: 3, sensorName: 'P3-ZARANDA', sensorId: 'Nodo 3 · 33192' },
    { id: 4, sensorName: 'P4-ZARANDA', sensorId: 'Nodo 4 · 33193' },
];

function getStoredNode(): number {
    try { return parseInt(localStorage.getItem(LS_KEY) || '1', 10); } catch { return 1; }
}

interface MetricasData {
    accel_total: number; stroke_total: number; rpm: number; fase: number;
    ejes: { x: { accel_g: number; stroke_mm: number }; y: { accel_g: number; stroke_mm: number }; z: { accel_g: number; stroke_mm: number } };
}
interface VelocidadData {
    vrms_actual:  { x: number; y: number; z: number };
    vpico_actual: { x: number; y: number; z: number };
}

type AlertLevel = 'green' | 'yellow' | 'red' | 'none';

function getAlertLevel(vpico: { x: number; y: number; z: number } | null, yellow: number, red: number): AlertLevel {
    if (!vpico) return 'none';
    const max = Math.max(vpico.x, vpico.y, vpico.z);
    if (max >= red)    return 'red';
    if (max >= yellow) return 'yellow';
    return 'green';
}

const ALERT_STYLES: Record<AlertLevel, { border: string; shadow: string; badge?: string; badgeBg?: string; badgeBorder?: string }> = {
    none:   { border: 'rgba(255,255,255,0.05)', shadow: 'none' },
    green:  { border: '#22c55e', shadow: '0 0 0 1px rgba(34,197,94,0.3), 0 4px 16px rgba(34,197,94,0.08)',  badge: 'OK',      badgeBg: 'rgba(34,197,94,0.15)',  badgeBorder: 'rgba(34,197,94,0.4)'  },
    yellow: { border: '#eab308', shadow: '0 0 0 1px rgba(234,179,8,0.35),0 4px 16px rgba(234,179,8,0.12)',  badge: 'ALERTA',  badgeBg: 'rgba(234,179,8,0.15)', badgeBorder: 'rgba(234,179,8,0.4)' },
    red:    { border: '#ef4444', shadow: '0 0 0 1px rgba(239,68,68,0.4), 0 4px 16px rgba(239,68,68,0.15)',  badge: 'CRÍTICO', badgeBg: 'rgba(239,68,68,0.15)', badgeBorder: 'rgba(239,68,68,0.4)' },
};

const COLORS = {
    bg: '#121214', bgActive: '#0d1f2d',
    cardBorder: 'rgba(255,255,255,0.05)', activeBorder: '#06b6d4',
    text: '#e5e7eb', textDim: '#9ca3af', textMuted: '#6b7280',
    tableBorder: 'rgba(255,255,255,0.08)',
};

// ── Card individual ───────────────────────────────────────────────────────────
function NodeCard({
    nodeId, sensorName, sensorId, isActive, onClick,
}: {
    nodeId: number; sensorName: string; sensorId: string;
    isActive: boolean; onClick: () => void;
}) {
    const { data, connected } = useWebSocket<MetricasData>(`metricas?node=${nodeId}`);
    const { data: velData }   = useWebSocket<VelocidadData>(`velocidad?node=${nodeId}`);
    const [thresholds, setThresholdsState] = useState(getThresholds);

    useEffect(() => {
        const handler = (e: Event) => setThresholdsState((e as CustomEvent<{ yellow: number; red: number }>).detail);
        window.addEventListener(THRESHOLD_EVENT, handler);
        return () => window.removeEventListener(THRESHOLD_EVENT, handler);
    }, []);

    const vrms  = velData?.vrms_actual  ?? { x: 0, y: 0, z: 0 };
    const vpico = velData?.vpico_actual ?? { x: 0, y: 0, z: 0 };
    const vrmsTotal  = velData ? Math.max(vrms.x, vrms.y, vrms.z) : 0;
    const alertLevel = getAlertLevel(velData ? vpico : null, thresholds.yellow, thresholds.red);
    const alertStyle = ALERT_STYLES[alertLevel];

    // Borde: cyan si activo, alerta si hay alarma, gris si inactivo
    const borderColor = isActive
        ? '#06b6d4'
        : alertLevel !== 'none' ? alertStyle.border : COLORS.cardBorder;
    const boxShadow = isActive
        ? '0 0 0 2px rgba(6,182,212,0.5), 0 4px 20px rgba(6,182,212,0.15)'
        : alertLevel !== 'none' ? alertStyle.shadow : 'none';

    const metrics = [
        { label: 'Accel.',  value: data?.accel_total  ?? 0, unit: 'g',    color: '#ef4444' },
        { label: 'Stroke',  value: data?.stroke_total ?? 0, unit: 'mm',   color: '#f59e0b' },
        { label: 'RPM',     value: data?.rpm          ?? 0, unit: '',     color: '#22c55e' },
        { label: 'Phase',   value: data?.fase         ?? 0, unit: '°',    color: '#8b5cf6' },
        { label: 'RMS Op.', value: vrmsTotal,               unit: 'mm/s', color: '#06b6d4' },
    ];

    const ejes = [
        { axis: 'X', accel: data?.ejes.x.accel_g ?? 0, vrms: vrms.x, vpico: vpico.x },
        { axis: 'Y', accel: data?.ejes.y.accel_g ?? 0, vrms: vrms.y, vpico: vpico.y },
        { axis: 'Z', accel: data?.ejes.z.accel_g ?? 0, vrms: vrms.z, vpico: vpico.z },
    ];

    return (
        <div
            onClick={onClick}
            style={{
                backgroundColor: isActive ? COLORS.bgActive : COLORS.bg,
                border: `1px solid ${borderColor}`,
                borderRadius: '12px', overflow: 'hidden',
                boxShadow, cursor: 'pointer',
                transition: 'border-color 0.2s, box-shadow 0.2s, background-color 0.2s',
                flex: 1,
            }}
        >
            {/* Header */}
            <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '12px 14px',
                borderBottom: `1px solid ${COLORS.tableBorder}`,
                background: isActive
                    ? 'linear-gradient(135deg, rgba(6,182,212,0.18) 0%, rgba(59,130,246,0.1) 100%)'
                    : 'rgba(255,255,255,0.02)',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                        width: '28px', height: '28px', borderRadius: '7px',
                        background: isActive
                            ? 'linear-gradient(135deg, #06b6d4, #3b82f6)'
                            : 'rgba(255,255,255,0.08)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px',
                        transition: 'background 0.2s',
                    }}>⚡</div>
                    <div>
                        <h3 style={{ color: isActive ? '#fff' : '#d1d5db', fontSize: '12px', fontWeight: 700, margin: 0 }}>
                            {sensorName}
                        </h3>
                        <span style={{ color: COLORS.textMuted, fontSize: '10px' }}>{sensorId}</span>
                    </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '3px' }}>
                    {alertLevel !== 'none' && (
                        <span style={{
                            fontSize: '9px', padding: '1px 6px', borderRadius: '4px', fontWeight: 700,
                            backgroundColor: alertStyle.badgeBg, color: alertStyle.border,
                            border: `1px solid ${alertStyle.badgeBorder}`, textTransform: 'uppercase' as const,
                        }}>{alertStyle.badge}</span>
                    )}
                    <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: '4px',
                        fontSize: '9px', padding: '2px 6px', borderRadius: '9999px',
                        backgroundColor: connected ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                        color: connected ? '#22c55e' : '#ef4444',
                        border: `1px solid ${connected ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`,
                    }}>
                        <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: connected ? '#22c55e' : '#ef4444' }} />
                        {connected ? 'EN VIVO' : 'OFFLINE'}
                    </span>
                </div>
            </div>

            {/* Métricas en lista vertical */}
            <div style={{ borderBottom: `1px solid ${COLORS.tableBorder}` }}>
                {metrics.map((m, i) => (
                    <div key={m.label} style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '6px 14px',
                        borderBottom: i < metrics.length - 1 ? `1px solid ${COLORS.tableBorder}` : 'none',
                    }}>
                        <span style={{ fontSize: '10px', color: COLORS.textMuted, textTransform: 'uppercase' as const, letterSpacing: '0.4px' }}>
                            {m.label}
                        </span>
                        <span style={{ fontSize: '13px', fontWeight: 700, color: '#fff', fontFamily: 'monospace' }}>
                            {m.value.toFixed(m.unit === '' ? 0 : 2)}
                            {m.unit && <span style={{ fontSize: '10px', color: m.color, marginLeft: '3px' }}>{m.unit}</span>}
                        </span>
                    </div>
                ))}
            </div>

            {/* Tabla por eje — compacta */}
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                <thead>
                    <tr style={{ backgroundColor: 'rgba(255,255,255,0.02)' }}>
                        {['Eje', 'Acc.(g)', 'VRMS', 'Pico'].map((h, i) => (
                            <th key={h} style={{
                                padding: '6px 8px', textAlign: i === 0 ? 'left' : 'center',
                                color: COLORS.textMuted, fontWeight: 500, fontSize: '10px',
                                borderBottom: `1px solid ${COLORS.tableBorder}`,
                            }}>{h}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {ejes.map((row, i) => (
                        <tr key={row.axis} style={{ borderBottom: i < 2 ? `1px solid ${COLORS.tableBorder}` : 'none' }}>
                            <td style={{ padding: '6px 8px', color: '#fff', fontWeight: 700, fontSize: '11px' }}>{row.axis}</td>
                            <td style={{ padding: '6px 8px', textAlign: 'center', color: COLORS.text, fontFamily: 'monospace' }}>{row.accel.toFixed(2)}</td>
                            <td style={{ padding: '6px 8px', textAlign: 'center', color: '#06b6d4', fontFamily: 'monospace' }}>{row.vrms.toFixed(2)}</td>
                            <td style={{ padding: '6px 8px', textAlign: 'center', color: '#a78bfa', fontFamily: 'monospace' }}>{row.vpico.toFixed(2)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

// ── Panel principal ───────────────────────────────────────────────────────────
export default function ActiveSensorPanel() {
    const [activeNode, setActiveNode] = useState<number>(getStoredNode);

    // Escuchar cambios externos (otros widgets que cambien el nodo)
    useEffect(() => {
        const handler = (e: Event) => setActiveNode((e as CustomEvent<number>).detail);
        window.addEventListener(EVENT_NAME, handler);
        return () => window.removeEventListener(EVENT_NAME, handler);
    }, []);

    const handleSelect = (id: number) => {
        setActiveNode(id);
        localStorage.setItem(LS_KEY, String(id));
        window.dispatchEvent(new CustomEvent<number>(EVENT_NAME, { detail: id }));
    };

    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '12px',
        }}>
            {NODES.map(n => (
                <NodeCard
                    key={n.id}
                    nodeId={n.id}
                    sensorName={n.sensorName}
                    sensorId={n.sensorId}
                    isActive={activeNode === n.id}
                    onClick={() => handleSelect(n.id)}
                />
            ))}
        </div>
    );
}
