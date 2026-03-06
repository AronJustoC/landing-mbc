/**
 * HistoricoWidget — Datos históricos del HDF5.
 *
 * Lee el archivo HDF5 completo via REST GET /api/historico
 * y muestra los 3 canales (X, Y, Z) en una gráfica de aceleración.
 * Incluye botón de actualización manual.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { API_BASE, FETCH_HEADERS } from '../../config';

const LS_KEY = 'mbc_selected_node';
const EVENT_NAME = 'mbc-node-select';
function getStoredNode() {
    try { return parseInt(localStorage.getItem(LS_KEY) || '1', 10); } catch { return 1; }
}

interface HistoricoData {
    timestamps: number[];
    x: number[]; y: number[]; z: number[];
    total: number;
}

const COLORS = {
    x: '#ff4444', y: '#44ff44', z: '#4488ff',
    grid:  'rgba(255,255,255,0.12)',
    text:  '#9ca3af',
    bg:    '#000000',
    border:'#333333',
};

export default function HistoricoWidget() {
    const [nodeId, setNodeId] = useState<number>(getStoredNode);
    const [data, setData] = useState<HistoricoData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError]   = useState<string | null>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animRef   = useRef<number>(0);
    const dataRef   = useRef<HistoricoData | null>(null);

    // Sincronizar con selección de nodo
    useEffect(() => {
        const handler = (e: Event) => setNodeId((e as CustomEvent<number>).detail);
        window.addEventListener(EVENT_NAME, handler);
        return () => window.removeEventListener(EVENT_NAME, handler);
    }, []);

    const fetchHistorico = useCallback(async (nid: number) => {
        setLoading(true);
        setError(null);
        dataRef.current = null;
        try {
            const res = await fetch(`${API_BASE}/historico?node=${nid}`, { headers: FETCH_HEADERS, signal: AbortSignal.timeout(10000) });
            const d: HistoricoData = await res.json();
            setData(d);
            dataRef.current = d;
        } catch {
            setError('Error al cargar datos históricos');
        } finally {
            setLoading(false);
        }
    }, []);

    // Carga inicial y al cambiar de nodo
    useEffect(() => { fetchHistorico(nodeId); }, [nodeId, fetchHistorico]);

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
        const pw  = W - pad.left - pad.right;
        const ph  = H - pad.top  - pad.bottom;

        ctx.fillStyle = COLORS.bg;
        ctx.fillRect(0, 0, W, H);

        const d = dataRef.current;
        if (!d || d.x.length < 2) {
            ctx.fillStyle = COLORS.text;
            ctx.font = '12px Inter,sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(d?.total === 0 ? 'Sin datos en HDF5' : 'Cargando...', W / 2, H / 2);
            animRef.current = requestAnimationFrame(render);
            return;
        }

        const allVals = [...d.x, ...d.y, ...d.z];
        const minV = Math.min(...allVals);
        const maxV = Math.max(...allVals);
        const span = maxV - minV || 0.001;
        const n    = d.x.length;

        const mapX = (i: number) => pad.left + (i / (n - 1)) * pw;
        const mapY = (v: number) => pad.top  + ph - ((v - minV) / span) * ph;

        // Grid
        ctx.strokeStyle = COLORS.grid;
        ctx.lineWidth = 0.5;
        for (let i = 0; i <= 6; i++) {
            const y = pad.top + (ph * i) / 6;
            const v = maxV - (span * i) / 6;
            ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(W - pad.right, y); ctx.stroke();
            ctx.fillStyle = COLORS.text; ctx.font = '9px Inter,sans-serif'; ctx.textAlign = 'right';
            ctx.fillText(v.toFixed(3), pad.left - 4, y + 3);
        }
        for (let i = 0; i <= 12; i++) {
            const x = pad.left + (pw * i) / 12;
            ctx.beginPath(); ctx.moveTo(x, pad.top); ctx.lineTo(x, pad.top + ph); ctx.stroke();
        }

        // Y label
        ctx.save();
        ctx.translate(12, H / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.textAlign = 'center';
        ctx.fillStyle = COLORS.text;
        ctx.font = '10px Inter,sans-serif';
        ctx.fillText('Aceleración (g)', 0, 0);
        ctx.restore();

        // Series X, Y, Z
        const series = [
            { vals: d.x, color: COLORS.x },
            { vals: d.y, color: COLORS.y },
            { vals: d.z, color: COLORS.z },
        ];
        series.forEach(({ vals, color }) => {
            ctx.beginPath();
            ctx.strokeStyle = color;
            ctx.lineWidth = 0.8;
            for (let i = 0; i < vals.length; i++) {
                const x = mapX(i), y = mapY(vals[i]);
                i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
            }
            ctx.stroke();
        });

        // X axis: timestamps
        if (d.timestamps.length >= 2) {
            const fmt = (ts: number) => new Date(ts * 1000).toLocaleString('es-PE', { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' });
            ctx.fillStyle = COLORS.text;
            ctx.font = '9px Inter,sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText(fmt(d.timestamps[0]), pad.left, H - 4);
            ctx.textAlign = 'right';
            ctx.fillText(fmt(d.timestamps[d.timestamps.length - 1]), W - pad.right, H - 4);
        }

        animRef.current = requestAnimationFrame(render);
    }, []);

    useEffect(() => {
        animRef.current = requestAnimationFrame(render);
        return () => cancelAnimationFrame(animRef.current);
    }, [render]);

    return (
        <div style={{ backgroundColor: '#000', border: '1px solid #333', borderRadius: 12, padding: 20 }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <h3 style={{ color: '#fff', fontSize: 14, fontWeight: 500, margin: 0 }}>🗂 Histórico HDF5</h3>
                    <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '4px', backgroundColor: 'rgba(6,182,212,0.15)', color: '#06b6d4', border: '1px solid rgba(6,182,212,0.3)' }}>
                        Nodo {nodeId}
                    </span>
                    {data && (
                        <span style={{ color: '#6b7280', fontSize: 11 }}>
                            {data.total.toLocaleString()} muestras
                        </span>
                    )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {/* Leyenda */}
                    {[['X', COLORS.x], ['Y', COLORS.y], ['Z', COLORS.z]].map(([l, c]) => (
                        <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <div style={{ width: 14, height: 2, backgroundColor: c }} />
                            <span style={{ color: '#9ca3af', fontSize: 11 }}>{l}</span>
                        </div>
                    ))}
                    <button
                        onClick={() => fetchHistorico(nodeId)}
                        disabled={loading}
                        style={{
                            padding: '4px 12px', fontSize: 11, borderRadius: 6,
                            backgroundColor: loading ? 'rgba(6,182,212,0.05)' : 'rgba(6,182,212,0.1)',
                            color: '#06b6d4', border: '1px solid rgba(6,182,212,0.3)',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            opacity: loading ? 0.6 : 1,
                        }}
                    >
                        {loading ? '⟳ Cargando...' : '↺ Actualizar'}
                    </button>
                </div>
            </div>

            {error && (
                <div style={{ padding: '6px 12px', marginBottom: 8, borderRadius: 6, backgroundColor: 'rgba(234,179,8,0.1)', color: '#eab308', border: '1px solid rgba(234,179,8,0.3)', fontSize: 12 }}>
                    ⚠ {error}
                </div>
            )}

            <canvas ref={canvasRef} style={{ width: '100%', height: 240, display: 'block', borderRadius: 8 }} />
        </div>
    );
}
