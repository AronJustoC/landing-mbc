/**
 * SensorSummaryCard — Card clickable de métricas por sensor/nodo.
 *
 * Al hacer click, publica el nodo seleccionado vía localStorage + CustomEvent
 * para que todos los widgets del dashboard se sincronicen.
 */

import { useState, useEffect } from 'react';
import { useMQTT as useWebSocket } from '../../hooks/useMQTT';

interface EjeData {
    accel_g: number;
    stroke_mm: number;
}

interface MetricasData {
    accel_total: number;
    stroke_total: number;
    rpm: number;
    fase: number;
    ejes: { x: EjeData; y: EjeData; z: EjeData };
    timestamp: number;
}

interface SensorSummaryCardProps {
    sensorName: string;
    sensorId?: string;
    nodeId?: number;
}

const COLORS = {
    bg: '#121214',
    bgActive: '#0d1f2d',
    cardBorder: 'rgba(255, 255, 255, 0.05)',
    activeBorder: '#06b6d4',
    accent: '#06b6d4',
    text: '#e5e7eb',
    textDim: '#9ca3af',
    textMuted: '#6b7280',
    tableBorder: 'rgba(255, 255, 255, 0.08)',
};

const LS_KEY = 'mbc_selected_node';
const EVENT_NAME = 'mbc-node-select';

function getStoredNode(): number {
    try {
        const v = localStorage.getItem(LS_KEY);
        return v ? parseInt(v, 10) : 1;
    } catch {
        return 1;
    }
}

export default function SensorSummaryCard({ sensorName, sensorId, nodeId }: SensorSummaryCardProps) {
    const hasNode = nodeId !== undefined;
    const [isSelected, setIsSelected] = useState(() => hasNode && getStoredNode() === nodeId);
    const { data, connected } = useWebSocket<MetricasData>(hasNode ? `metricas?node=${nodeId}` : '__disabled__');

    // Sincronizar con eventos de otros cards
    useEffect(() => {
        if (!hasNode) return;
        const handler = (e: Event) => {
            const selected = (e as CustomEvent<number>).detail;
            setIsSelected(selected === nodeId);
        };
        window.addEventListener(EVENT_NAME, handler);
        return () => window.removeEventListener(EVENT_NAME, handler);
    }, [nodeId, hasNode]);

    const handleClick = () => {
        if (!hasNode) return;
        localStorage.setItem(LS_KEY, String(nodeId));
        window.dispatchEvent(new CustomEvent<number>(EVENT_NAME, { detail: nodeId }));
    };

    const metrics = [
        { label: 'Accel.', value: data?.accel_total ?? 0, unit: 'g',  color: '#ef4444' },
        { label: 'Stroke', value: data?.stroke_total ?? 0, unit: 'mm', color: '#f59e0b' },
        { label: 'RPM',    value: data?.rpm ?? 0,          unit: '',   color: '#22c55e' },
        { label: 'Phase',  value: data?.fase ?? 0,         unit: '°',  color: '#8b5cf6' },
    ];

    const ejes = data ? [
        { axis: 'X', accel: data.ejes.x.accel_g, stroke: data.ejes.x.stroke_mm },
        { axis: 'Y', accel: data.ejes.y.accel_g, stroke: data.ejes.y.stroke_mm },
        { axis: 'Z', accel: data.ejes.z.accel_g, stroke: data.ejes.z.stroke_mm },
    ] : [];

    return (
        <div
            onClick={handleClick}
            style={{
                backgroundColor: isSelected ? COLORS.bgActive : COLORS.bg,
                border: `1px solid ${isSelected ? COLORS.activeBorder : COLORS.cardBorder}`,
                borderRadius: '12px',
                overflow: 'hidden',
                cursor: hasNode ? 'pointer' : 'default',
                transition: 'border-color 0.2s, background-color 0.2s, box-shadow 0.2s',
                boxShadow: isSelected ? '0 0 0 1px rgba(6,182,212,0.3), 0 4px 20px rgba(6,182,212,0.1)' : 'none',
                outline: 'none',
                opacity: hasNode ? 1 : 0.5,
                position: 'relative',
            }}
        >
            {/* Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '16px 20px',
                borderBottom: `1px solid ${COLORS.tableBorder}`,
                background: isSelected
                    ? 'linear-gradient(135deg, rgba(6,182,212,0.15) 0%, rgba(59,130,246,0.08) 100%)'
                    : 'linear-gradient(135deg, rgba(6,182,212,0.06) 0%, rgba(59,130,246,0.04) 100%)',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                        width: '32px', height: '32px', borderRadius: '8px',
                        background: isSelected
                            ? 'linear-gradient(135deg, #06b6d4, #3b82f6)'
                            : 'linear-gradient(135deg, rgba(6,182,212,0.4), rgba(59,130,246,0.4))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '14px',
                    }}>
                        ⚡
                    </div>
                    <div>
                        <h3 style={{ color: isSelected ? '#fff' : '#d1d5db', fontSize: '15px', fontWeight: 600, margin: 0 }}>
                            {sensorName}
                        </h3>
                        {sensorId && (
                            <span style={{ color: COLORS.textMuted, fontSize: '11px' }}>{sensorId}</span>
                        )}
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {isSelected && (
                        <span style={{
                            fontSize: '9px', padding: '2px 6px', borderRadius: '4px',
                            backgroundColor: 'rgba(6,182,212,0.2)', color: '#06b6d4',
                            border: '1px solid rgba(6,182,212,0.4)', fontWeight: 600,
                            textTransform: 'uppercase', letterSpacing: '0.05em',
                        }}>
                            ACTIVO
                        </span>
                    )}
                    <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: '4px',
                        fontSize: '10px', padding: '3px 8px', borderRadius: '9999px',
                        backgroundColor: !hasNode ? 'rgba(107,114,128,0.1)' : connected ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                        color: !hasNode ? '#6b7280' : connected ? '#22c55e' : '#ef4444',
                        border: `1px solid ${!hasNode ? 'rgba(107,114,128,0.2)' : connected ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`,
                        fontWeight: 500,
                    }}>
                        <span style={{
                            width: '5px', height: '5px', borderRadius: '50%',
                            backgroundColor: !hasNode ? '#6b7280' : connected ? '#22c55e' : '#ef4444',
                        }} />
                        {!hasNode ? 'N/A' : connected ? 'LIVE' : 'OFF'}
                    </span>
                </div>
            </div>

            {/* Metrics Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', borderBottom: `1px solid ${COLORS.tableBorder}` }}>
                {metrics.map((m, i) => (
                    <div key={m.label} style={{
                        padding: '12px 6px', textAlign: 'center',
                        borderRight: i < 3 ? `1px solid ${COLORS.tableBorder}` : 'none',
                    }}>
                        <div style={{ fontSize: '10px', color: COLORS.textMuted, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            {m.label}
                        </div>
                        <div style={{ fontSize: '20px', fontWeight: 700, color: '#fff', fontFamily: 'monospace', lineHeight: 1.2 }}>
                            {typeof m.value === 'number' ? m.value.toFixed(m.unit === '' ? 0 : 2) : '--'}
                        </div>
                        {m.unit && <div style={{ fontSize: '10px', color: m.color, marginTop: '2px' }}>{m.unit}</div>}
                    </div>
                ))}
            </div>

            {/* Per-Axis Table */}
            <div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                    <thead>
                        <tr style={{ backgroundColor: 'rgba(255,255,255,0.03)' }}>
                            <th style={{ padding: '8px', textAlign: 'left', color: COLORS.textMuted, fontWeight: 500, fontSize: '11px', borderBottom: `1px solid ${COLORS.tableBorder}` }}>Axis</th>
                            <th style={{ padding: '8px', textAlign: 'center', color: COLORS.textMuted, fontWeight: 500, fontSize: '11px', borderBottom: `1px solid ${COLORS.tableBorder}` }}>Accel. (G)</th>
                            <th style={{ padding: '8px', textAlign: 'center', color: COLORS.textMuted, fontWeight: 500, fontSize: '11px', borderBottom: `1px solid ${COLORS.tableBorder}` }}>Stroke (mm)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {(ejes.length > 0 ? ejes : [
                            { axis: 'X', accel: 0, stroke: 0 },
                            { axis: 'Y', accel: 0, stroke: 0 },
                            { axis: 'Z', accel: 0, stroke: 0 },
                        ]).map((row, i) => (
                            <tr key={row.axis} style={{ borderBottom: i < 2 ? `1px solid ${COLORS.tableBorder}` : 'none' }}>
                                <td style={{ padding: '8px', color: '#fff', fontWeight: 600 }}>{row.axis}</td>
                                <td style={{ padding: '8px', textAlign: 'center', color: COLORS.text, fontFamily: 'monospace', fontWeight: 600 }}>{row.accel.toFixed(2)}</td>
                                <td style={{ padding: '8px', textAlign: 'center', color: COLORS.text, fontFamily: 'monospace', fontWeight: 600 }}>{row.stroke.toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
