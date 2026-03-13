/**
 * OrbitaXYWidget — Diagrama de órbita X vs Y.
 *
 * Acumula las últimas N muestras de aceleración y grafica
 * X en el eje horizontal, Y en el eje vertical (estilo osciloscopio).
 * Muestra el patrón de movimiento orbital de la zaranda.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useMQTT as useWebSocket } from '../../hooks/useMQTT';

const LS_KEY = 'mbc_selected_node';
const EVENT_NAME = 'mbc-node-select';
function getStoredNode() {
    try { return parseInt(localStorage.getItem(LS_KEY) || '1', 10); } catch { return 1; }
}

interface AceleracionData {
    x: number[]; y: number[]; z: number[];
    timestamps: number[];
    aceleracion_total: number;
    fuente?: string;
}

const ORBIT_BUFFER = 600; // puntos para trazar la órbita

const COLORS = {
    orbit: '#06b6d4',   // cian (trayectoria)
    tail:  'rgba(6,182,212,0.3)',
    dot:   '#ffffff',
    grid:  'rgba(255,255,255,0.12)',
    text:  '#9ca3af',
    bg:    '#000000',
    border:'#333333',
};

export default function OrbitaXYWidget() {
    const [nodeId, setNodeId] = useState<number>(getStoredNode);
    const { data, connected } = useWebSocket<AceleracionData>(`aceleracion?node=${nodeId}`);

    useEffect(() => {
        const handler = (e: Event) => setNodeId((e as CustomEvent<number>).detail);
        window.addEventListener(EVENT_NAME, handler);
        return () => window.removeEventListener(EVENT_NAME, handler);
    }, []);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animRef   = useRef<number>(0);
    const bufRef    = useRef<{ x: number[]; y: number[] }>({ x: [], y: [] });

    // Limpiar órbita al cambiar de nodo para no mezclar trayectorias
    useEffect(() => {
        bufRef.current = { x: [], y: [] };
    }, [nodeId]);

    useEffect(() => {
        if (!data || !data.x || data.x.length === 0) return;
        const buf = bufRef.current;
        for (let i = 0; i < data.x.length; i++) {
            buf.x.push(data.x[i]);
            buf.y.push(data.y[i]);
        }
        while (buf.x.length > ORBIT_BUFFER) { buf.x.shift(); buf.y.shift(); }
    }, [data]);

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
        const pad = 40;
        const pw = W - pad * 2;
        const ph = H - pad * 2;

        ctx.fillStyle = COLORS.bg;
        ctx.fillRect(0, 0, W, H);

        const buf = bufRef.current;
        if (buf.x.length < 2) {
            ctx.fillStyle = COLORS.text;
            ctx.font = '12px Inter,sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('Esperando datos...', W / 2, H / 2);
            animRef.current = requestAnimationFrame(render);
            return;
        }

        // Rango dinámico (simétrico)
        const all = [...buf.x, ...buf.y];
        const maxAbs = Math.max(...all.map(Math.abs), 0.01) * 1.15;

        const mapX = (v: number) => pad + ((v + maxAbs) / (2 * maxAbs)) * pw;
        const mapY = (v: number) => pad + ((maxAbs - v) / (2 * maxAbs)) * ph;

        // Grid + ejes
        ctx.strokeStyle = COLORS.grid;
        ctx.lineWidth = 0.5;
        for (let i = 0; i <= 8; i++) {
            const gx = pad + (pw * i) / 8;
            const gy = pad + (ph * i) / 8;
            ctx.beginPath(); ctx.moveTo(gx, pad); ctx.lineTo(gx, pad + ph); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(pad, gy); ctx.lineTo(pad + pw, gy); ctx.stroke();
        }

        // Ejes centrales
        ctx.strokeStyle = 'rgba(255,255,255,0.25)';
        ctx.lineWidth = 0.8;
        const cx = mapX(0), cy = mapY(0);
        ctx.beginPath(); ctx.moveTo(cx, pad); ctx.lineTo(cx, pad + ph); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(pad, cy); ctx.lineTo(pad + pw, cy); ctx.stroke();

        // Labels
        ctx.fillStyle = COLORS.text;
        ctx.font = '10px Inter,sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('X (g)', W / 2, H - 6);
        ctx.save(); ctx.translate(12, H / 2); ctx.rotate(-Math.PI / 2);
        ctx.fillText('Y (g)', 0, 0); ctx.restore();

        // Eje labels valores
        ctx.font = '9px Inter,sans-serif';
        ctx.fillText((-maxAbs).toFixed(3), pad, pad + ph + 14);
        ctx.fillText((maxAbs).toFixed(3), pad + pw, pad + ph + 14);

        // Trayectoria con gradiente de opacidad (tail → head)
        const n = buf.x.length;
        for (let i = 1; i < n; i++) {
            const alpha = 0.15 + 0.85 * (i / n);
            ctx.beginPath();
            ctx.strokeStyle = `rgba(6,182,212,${alpha})`;
            ctx.lineWidth = 1.2;
            ctx.moveTo(mapX(buf.x[i - 1]), mapY(buf.y[i - 1]));
            ctx.lineTo(mapX(buf.x[i]),     mapY(buf.y[i]));
            ctx.stroke();
        }

        // Punto actual
        const lx = mapX(buf.x[n - 1]);
        const ly = mapY(buf.y[n - 1]);
        ctx.beginPath();
        ctx.arc(lx, ly, 4, 0, Math.PI * 2);
        ctx.fillStyle = COLORS.dot;
        ctx.fill();

        animRef.current = requestAnimationFrame(render);
    }, []);

    useEffect(() => {
        animRef.current = requestAnimationFrame(render);
        return () => cancelAnimationFrame(animRef.current);
    }, [render]);

    return (
        <div style={{ backgroundColor: '#000', border: '1px solid #333', borderRadius: 12, padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <h3 style={{ color: '#fff', fontSize: 14, fontWeight: 500, margin: 0 }}>🔵 Órbita XY</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ color: '#9ca3af', fontSize: 11 }}>últimas {ORBIT_BUFFER} muestras</span>
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
            <canvas
                ref={canvasRef}
                style={{ width: '100%', height: 280, display: 'block', borderRadius: 8 }}
            />
        </div>
    );
}
