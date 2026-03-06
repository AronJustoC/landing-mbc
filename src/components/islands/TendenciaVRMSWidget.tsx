/**
 * TendenciaVRMSWidget — Tendencia histórica de VRMS.
 *
 * Muestra la evolución temporal de VRMS X/Y/Z con línea de alarma.
 * Consume el campo `trend` del endpoint /ws/velocidad.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useWebSocket } from '../../hooks/useWebSocket';

const LS_KEY = 'mbc_selected_node';
const EVENT_NAME = 'mbc-node-select';
function getStoredNode() {
    try { return parseInt(localStorage.getItem(LS_KEY) || '1', 10); } catch { return 1; }
}

interface VelocidadData {
    trend: { timestamps: number[]; rx: number[]; ry: number[]; rz: number[] };
    alarm_threshold: number;
    alarm: boolean;
}

const COLORS = {
    x: '#ff4444', y: '#44ff44', z: '#4488ff',
    alarm: '#ff4444',
    grid:  'rgba(255,255,255,0.12)',
    text:  '#9ca3af',
    bg:    '#000000',
};

export default function TendenciaVRMSWidget() {
    const [nodeId, setNodeId] = useState<number>(getStoredNode);
    const { data, connected } = useWebSocket<VelocidadData>(`velocidad?node=${nodeId}`);

    useEffect(() => {
        const handler = (e: Event) => setNodeId((e as CustomEvent<number>).detail);
        window.addEventListener(EVENT_NAME, handler);
        return () => window.removeEventListener(EVENT_NAME, handler);
    }, []);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animRef   = useRef<number>(0);
    const dataRef   = useRef<VelocidadData | null>(null);

    useEffect(() => { if (data) dataRef.current = data; }, [data]);

    const render = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) { animRef.current = requestAnimationFrame(render); return; }
        const ctx = canvas.getContext('2d');
        if (!ctx) { animRef.current = requestAnimationFrame(render); return; }

        const rect = canvas.getBoundingClientRect();
        const dpr  = window.devicePixelRatio || 1;
        canvas.width  = rect.width  * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);

        const W = rect.width, H = rect.height;
        const pad = { top: 8, right: 12, bottom: 28, left: 52 };
        const pw = W - pad.left - pad.right;
        const ph = H - pad.top  - pad.bottom;

        ctx.fillStyle = COLORS.bg;
        ctx.fillRect(0, 0, W, H);

        const d = dataRef.current;
        const tr = d?.trend;
        if (!tr || tr.rx.length < 2) {
            ctx.fillStyle = COLORS.text;
            ctx.font = '12px Inter,sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('Acumulando tendencia...', W / 2, H / 2);
            animRef.current = requestAnimationFrame(render);
            return;
        }

        const threshold = d?.alarm_threshold ?? 5;
        const allVals = [...tr.rx, ...tr.ry, ...tr.rz, threshold];
        const maxV = Math.max(...allVals) * 1.15 || threshold * 1.5;
        const minV = 0;
        const span = maxV - minV || 1;
        const n    = tr.rx.length;

        const mapX = (i: number) => pad.left + (i / (n - 1)) * pw;
        const mapY = (v: number) => pad.top  + ph - ((v - minV) / span) * ph;

        // Grid
        ctx.strokeStyle = COLORS.grid;
        ctx.lineWidth = 0.5;
        for (let i = 0; i <= 5; i++) {
            const y = pad.top + (ph * i) / 5;
            const val = maxV - (span * i) / 5;
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
        ctx.fillText('VRMS (mm/s)', 0, 0);
        ctx.restore();

        // Alarm line
        const ay = mapY(threshold);
        ctx.setLineDash([6, 4]);
        ctx.strokeStyle = COLORS.alarm;
        ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(pad.left, ay); ctx.lineTo(W - pad.right, ay); ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = COLORS.alarm;
        ctx.font = '9px Inter,sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(`Alarma ${threshold} mm/s`, pad.left + 4, ay - 3);

        // Series
        const series = [
            { vals: tr.rx, color: COLORS.x },
            { vals: tr.ry, color: COLORS.y },
            { vals: tr.rz, color: COLORS.z },
        ];
        series.forEach(({ vals, color }) => {
            if (vals.length < 2) return;
            ctx.beginPath();
            ctx.strokeStyle = color;
            ctx.lineWidth = 1.5;
            for (let i = 0; i < vals.length; i++) {
                const x = mapX(i), y = mapY(vals[i]);
                i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
            }
            ctx.stroke();
        });

        // X axis: timestamps
        if (tr.timestamps.length >= 2) {
            const tFirst = tr.timestamps[0];
            const tLast  = tr.timestamps[tr.timestamps.length - 1];
            const fmt = (ts: number) => new Date(ts * 1000).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            ctx.fillStyle = COLORS.text;
            ctx.font = '9px Inter,sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText(fmt(tFirst), pad.left, H - 4);
            ctx.textAlign = 'right';
            ctx.fillText(fmt(tLast), W - pad.right, H - 4);
        }

        animRef.current = requestAnimationFrame(render);
    }, []);

    useEffect(() => {
        animRef.current = requestAnimationFrame(render);
        return () => cancelAnimationFrame(animRef.current);
    }, [render]);

    const pts = data?.trend.rx.length ?? 0;

    return (
        <div style={{ backgroundColor: '#000', border: '1px solid #333', borderRadius: 12, padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <h3 style={{ color: '#fff', fontSize: 14, fontWeight: 500, margin: 0 }}>📉 Tendencia VRMS</h3>
                    {data?.alarm && (
                        <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 9999, backgroundColor: 'rgba(239,68,68,0.2)', color: '#ff4444', border: '1px solid rgba(239,68,68,0.4)' }}>
                            ⚠ ALARMA
                        </span>
                    )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ color: '#6b7280', fontSize: 11 }}>{pts} puntos</span>
                    {[['X', COLORS.x], ['Y', COLORS.y], ['Z', COLORS.z]].map(([l, c]) => (
                        <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <div style={{ width: 14, height: 2, backgroundColor: c }} />
                            <span style={{ color: '#9ca3af', fontSize: 11 }}>{l}</span>
                        </div>
                    ))}
                    <span style={{
                        fontSize: 11, padding: '2px 8px', borderRadius: 9999,
                        backgroundColor: connected ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                        color: connected ? '#22c55e' : '#ef4444',
                        border: `1px solid ${connected ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`,
                    }}>
                        {connected ? 'En vivo' : 'Desconectado'}
                    </span>
                </div>
            </div>
            <canvas ref={canvasRef} style={{ width: '100%', height: 200, display: 'block', borderRadius: 8 }} />
        </div>
    );
}
