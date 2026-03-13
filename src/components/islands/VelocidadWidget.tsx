/**
 * VelocidadWidget — Velocidad instantánea y VRMS.
 *
 * Replica VelocityWindow de Daqaceleracionglink200_1.py:
 * - Panel superior: velocidad instantánea Vx / Vy / Vz (mm/s)
 * - Panel inferior: VRMS con línea de alarma (5 mm/s)
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useMQTT as useWebSocket } from '../../hooks/useMQTT';

const LS_KEY = 'mbc_selected_node';
const EVENT_NAME = 'mbc-node-select';
function getStoredNode() {
    try { return parseInt(localStorage.getItem(LS_KEY) || '1', 10); } catch { return 1; }
}

interface VelocidadData {
    timestamps: number[];
    vx: number[]; vy: number[]; vz: number[];
    rx: number[]; ry: number[]; rz: number[];
    vrms_actual: { x: number; y: number; z: number };
    alarm: boolean;
    alarm_threshold: number;
    trend: { timestamps: number[]; rx: number[]; ry: number[]; rz: number[] };
}

const COLORS = {
    x: '#ff4444', y: '#44ff44', z: '#4488ff',
    alarm: '#ff4444',
    grid: 'rgba(255,255,255,0.12)',
    text: '#9ca3af',
    bg: '#000000',
    border: '#333333',
};

function drawChart(
    canvas: HTMLCanvasElement,
    series: { values: number[]; color: string }[],
    yLabel: string,
    alarmY?: number,
    timestamps?: number[],
) {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    const W = rect.width, H = rect.height;
    const pad = { top: 8, right: 12, bottom: 38, left: 52 };
    const pw = W - pad.left - pad.right;
    const ph = H - pad.top - pad.bottom;

    ctx.fillStyle = COLORS.bg;
    ctx.fillRect(0, 0, W, H);

    const all = series.flatMap(s => s.values);
    if (all.length < 2) {
        ctx.fillStyle = COLORS.text;
        ctx.font = '12px Inter,sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Esperando datos...', W / 2, H / 2);
        return;
    }

    const minV = Math.min(...all, alarmY ?? Infinity) * 1.1;
    const maxV = Math.max(...all, alarmY ?? -Infinity) * 1.1;
    const span = maxV - minV || 1;

    const mapY = (v: number) => pad.top + ph - ((v - minV) / span) * ph;

    // Grid
    ctx.strokeStyle = COLORS.grid;
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= 6; i++) {
        const y = pad.top + (ph * i) / 6;
        const val = maxV - (span * i) / 6;
        ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(W - pad.right, y); ctx.stroke();
        ctx.fillStyle = COLORS.text; ctx.font = '9px Inter,sans-serif'; ctx.textAlign = 'right';
        ctx.fillText(val.toFixed(2), pad.left - 4, y + 3);
    }
    for (let i = 0; i <= 10; i++) {
        const x = pad.left + (pw * i) / 10;
        ctx.beginPath(); ctx.moveTo(x, pad.top); ctx.lineTo(x, pad.top + ph); ctx.stroke();
    }

    // Y label
    ctx.save();
    ctx.translate(12, H / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = 'center';
    ctx.fillStyle = COLORS.text;
    ctx.font = '10px Inter,sans-serif';
    ctx.fillText(yLabel, 0, 0);
    ctx.restore();

    // Alarm line
    if (alarmY !== undefined) {
        const ay = mapY(alarmY);
        ctx.setLineDash([6, 4]);
        ctx.strokeStyle = COLORS.alarm;
        ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(pad.left, ay); ctx.lineTo(W - pad.right, ay); ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = COLORS.alarm;
        ctx.font = '9px Inter,sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(`${alarmY} mm/s`, pad.left + 4, ay - 3);
    }

    // Series
    series.forEach(({ values, color }) => {
        if (values.length < 2) return;
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.2;
        for (let i = 0; i < values.length; i++) {
            const x = pad.left + (i / (values.length - 1)) * pw;
            const y = mapY(values[i]);
            i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.stroke();
    });

    // Eje X: fecha y hora
    if (timestamps && timestamps.length >= 2) {
        const n = timestamps.length;
        const numTicks = 4;
        ctx.fillStyle = '#9ca3af';
        ctx.font = '9px Inter,sans-serif';
        for (let i = 0; i <= numTicks; i++) {
            const idx = Math.floor((i / numTicks) * (n - 1));
            const ts  = timestamps[idx];
            const xPos = pad.left + (idx / (n - 1)) * pw;
            const d = new Date(ts * 1000);
            const label = d.toLocaleString('es-PE', {
                month: '2-digit', day: '2-digit',
                hour: '2-digit', minute: '2-digit', second: '2-digit',
            });
            ctx.textAlign = i === 0 ? 'left' : i === numTicks ? 'right' : 'center';
            ctx.fillText(label, xPos, H - 4);
        }
    }
}

export default function VelocidadWidget() {
    const [nodeId, setNodeId] = useState<number>(getStoredNode);
    const { data, connected } = useWebSocket<VelocidadData>(`velocidad?node=${nodeId}`);

    useEffect(() => {
        const handler = (e: Event) => setNodeId((e as CustomEvent<number>).detail);
        window.addEventListener(EVENT_NAME, handler);
        return () => window.removeEventListener(EVENT_NAME, handler);
    }, []);
    const canvasInstRef = useRef<HTMLCanvasElement>(null);
    const canvasRmsRef  = useRef<HTMLCanvasElement>(null);
    const animRef       = useRef<number>(0);
    const dataRef       = useRef<VelocidadData | null>(null);

    // Limpiar al cambiar de nodo
    useEffect(() => { dataRef.current = null; }, [nodeId]);

    useEffect(() => { if (data) dataRef.current = data; }, [data]);

    const render = useCallback(() => {
        const d = dataRef.current;
        if (d && canvasInstRef.current && canvasRmsRef.current) {
            if (d.vx.length > 1) {
                drawChart(canvasInstRef.current,
                    [{ values: d.vx, color: COLORS.x }, { values: d.vy, color: COLORS.y }, { values: d.vz, color: COLORS.z }],
                    'Vel. inst. (mm/s)',
                    undefined,
                    d.timestamps,
                );
            }
            if (d.rx.length > 1) {
                drawChart(canvasRmsRef.current,
                    [{ values: d.rx, color: COLORS.x }, { values: d.ry, color: COLORS.y }, { values: d.rz, color: COLORS.z }],
                    'VRMS (mm/s)',
                    d.alarm_threshold,
                    d.trend?.timestamps,
                );
            }
        }
        animRef.current = requestAnimationFrame(render);
    }, []);

    useEffect(() => {
        animRef.current = requestAnimationFrame(render);
        return () => cancelAnimationFrame(animRef.current);
    }, [render]);

    const d = data;
    const alarm = d?.alarm ?? false;

    return (
        <div style={{ backgroundColor: '#000', border: '1px solid #333', borderRadius: 12, padding: 20 }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <h3 style={{ color: '#fff', fontSize: 14, fontWeight: 500, margin: 0 }}>📈 Velocidad — Instantánea y RMS</h3>
                    <span style={{
                        fontSize: 11, padding: '2px 8px', borderRadius: 9999,
                        backgroundColor: connected ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                        color: connected ? '#22c55e' : '#ef4444',
                        border: `1px solid ${connected ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`,
                    }}>
                        {connected ? 'En vivo' : 'Desconectado'}
                    </span>
                    {alarm && (
                        <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 9999, backgroundColor: 'rgba(239,68,68,0.2)', color: '#ff4444', border: '1px solid rgba(239,68,68,0.4)', fontWeight: 700 }}>
                            ⚠ ALARMA VRMS
                        </span>
                    )}
                </div>
                <div style={{ display: 'flex', gap: 16, fontFamily: 'monospace', fontSize: 12 }}>
                    <span style={{ color: COLORS.x }}>X: {d?.vrms_actual.x.toFixed(3) ?? '--'} mm/s</span>
                    <span style={{ color: COLORS.y }}>Y: {d?.vrms_actual.y.toFixed(3) ?? '--'} mm/s</span>
                    <span style={{ color: COLORS.z }}>Z: {d?.vrms_actual.z.toFixed(3) ?? '--'} mm/s</span>
                </div>
            </div>

            {/* Leyenda */}
            <div style={{ display: 'flex', gap: 16, marginBottom: 8 }}>
                {[['X', COLORS.x], ['Y', COLORS.y], ['Z', COLORS.z]].map(([label, color]) => (
                    <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <div style={{ width: 16, height: 2, backgroundColor: color as string }} />
                        <span style={{ color: COLORS.text, fontSize: 11 }}>{label}</span>
                    </div>
                ))}
            </div>

            {/* Velocidad Instantánea */}
            <p style={{ color: COLORS.text, fontSize: 11, margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Velocidad Instantánea</p>
            <canvas ref={canvasInstRef} style={{ width: '100%', height: 180, display: 'block', borderRadius: 6, marginBottom: 12 }} />

            {/* VRMS */}
            <p style={{ color: COLORS.text, fontSize: 11, margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>VRMS (ventana 1s) — umbral {d?.alarm_threshold ?? 5} mm/s</p>
            <canvas ref={canvasRmsRef} style={{ width: '100%', height: 180, display: 'block', borderRadius: 6 }} />
        </div>
    );
}
