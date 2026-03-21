/**
 * FFTChart — Espectro de frecuencias en tiempo real.
 *
 * Usa canvas nativo con requestAnimationFrame para máximo rendimiento.
 * Eliminado Plotly (SVG re-render por cada mensaje = alta latencia).
 * Mismo patrón que AceleracionWidget: dataRef + rAF loop.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useMQTT as useWebSocket } from '../../hooks/useMQTT';

const LS_KEY = 'mbc_selected_node';
const EVENT_NAME = 'mbc-node-select';
function getStoredNode() {
    try { return parseInt(localStorage.getItem(LS_KEY) || '1', 10); } catch { return 1; }
}

interface FFTAxisData {
    frecuencias: number[];
    amplitudes: number[];
    pico_frecuencia: number;
    pico_amplitud: number;
}

interface FFTData {
    eje_x: FFTAxisData;
    eje_y: FFTAxisData;
    eje_z: FFTAxisData;
    sample_rate: number;
    ventana_muestras: number;
    timestamp: number;
}

const COLORS = {
    x: '#ef4444',
    y: '#22c55e',
    z: '#3b82f6',
    bg: '#121214',
    grid: 'rgba(255,255,255,0.06)',
    text: '#9ca3af',
    cardBorder: 'rgba(255,255,255,0.05)',
};

export default function FFTChart() {
    const [nodeId, setNodeId] = useState<number>(getStoredNode);
    const { data, connected } = useWebSocket<FFTData>(`fft?node=${nodeId}`);

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animRef   = useRef<number>(0);
    const dataRef   = useRef<FFTData | null>(null);
    const headerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: Event) => setNodeId((e as CustomEvent<number>).detail);
        window.addEventListener(EVENT_NAME, handler);
        return () => window.removeEventListener(EVENT_NAME, handler);
    }, []);

    // Limpiar al cambiar de nodo
    useEffect(() => { dataRef.current = null; }, [nodeId]);

    // Actualizar ref y header con info de picos (sin re-render React)
    useEffect(() => {
        if (!data) return;
        dataRef.current = data;

        if (headerRef.current) {
            const peaksEl = headerRef.current.querySelector('#fft-peaks');
            if (peaksEl) {
                peaksEl.innerHTML = [
                    { label: 'X', d: data.eje_x, c: COLORS.x },
                    { label: 'Y', d: data.eje_y, c: COLORS.y },
                    { label: 'Z', d: data.eje_z, c: COLORS.z },
                ].map(p =>
                    `<span style="color:${p.c};font-family:monospace;font-size:11px;padding:2px 8px;background:rgba(255,255,255,0.03);border-radius:4px;">
                        Pico ${p.label}: ${p.d.pico_frecuencia.toFixed(1)} Hz (${p.d.pico_amplitud.toFixed(4)} g)
                    </span>`
                ).join('');
            }
            const infoEl = headerRef.current.querySelector('#fft-info');
            if (infoEl) {
                infoEl.textContent = `fs: ${data.sample_rate} Hz | ${data.ventana_muestras} muestras`;
            }
        }
    }, [data]);

    const render = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) { animRef.current = requestAnimationFrame(render); return; }
        const ctx = canvas.getContext('2d');
        if (!ctx) { animRef.current = requestAnimationFrame(render); return; }

        // Resize solo cuando el tamaño real cambia (evita limpiar GPU texture cada frame)
        const dpr  = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        const newW = Math.round(rect.width  * dpr);
        const newH = Math.round(rect.height * dpr);
        if (canvas.width !== newW || canvas.height !== newH) {
            canvas.width  = newW;
            canvas.height = newH;
        }
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        const W = rect.width, H = rect.height;
        const d = dataRef.current;

        ctx.fillStyle = COLORS.bg;
        ctx.fillRect(0, 0, W, H);

        if (!d || d.eje_x.frecuencias.length < 2) {
            ctx.fillStyle = COLORS.text;
            ctx.font = '13px Inter,system-ui,sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('Esperando datos FFT...', W / 2, H / 2);
            animRef.current = requestAnimationFrame(render);
            return;
        }

        const pad = { top: 15, right: 20, bottom: 46, left: 62 };
        const pw  = W - pad.left - pad.right;
        const ph  = H - pad.top  - pad.bottom;

        const freqs = d.eje_x.frecuencias;
        const fMin  = freqs[0];
        const fMax  = freqs[freqs.length - 1];

        // Rango Y: máximo de los 3 ejes
        let yMax = 0;
        for (const ax of [d.eje_x, d.eje_y, d.eje_z]) {
            for (const v of ax.amplitudes) { if (v > yMax) yMax = v; }
        }
        yMax = yMax * 1.15 || 0.001;
        const yMin = 0;

        const mapX = (f: number) => pad.left + ((f - fMin) / (fMax - fMin)) * pw;
        const mapY = (v: number) => pad.top + ph - ((v - yMin) / (yMax - yMin)) * ph;

        // Grid horizontal
        ctx.strokeStyle = COLORS.grid;
        ctx.lineWidth   = 0.5;
        ctx.font        = '9px Inter,sans-serif';
        const gridY = 5;
        for (let i = 0; i <= gridY; i++) {
            const y   = pad.top + (ph * i) / gridY;
            const val = yMax - (yMax * i) / gridY;
            ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(W - pad.right, y); ctx.stroke();
            ctx.fillStyle  = COLORS.text;
            ctx.textAlign  = 'right';
            ctx.fillText(val.toFixed(4), pad.left - 4, y + 3);
        }

        // Grid vertical + etiquetas Hz
        const gridX = 8;
        for (let i = 0; i <= gridX; i++) {
            const x   = pad.left + (pw * i) / gridX;
            const val = fMin + (fMax - fMin) * i / gridX;
            ctx.beginPath(); ctx.moveTo(x, pad.top); ctx.lineTo(x, pad.top + ph); ctx.stroke();
            ctx.fillStyle = COLORS.text;
            ctx.textAlign = 'center';
            ctx.fillText(`${val.toFixed(0)} Hz`, x, pad.top + ph + 14);
        }

        // Label eje Y
        ctx.save();
        ctx.translate(14, pad.top + ph / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.textAlign  = 'center';
        ctx.fillStyle  = COLORS.text;
        ctx.font       = '10px Inter,sans-serif';
        ctx.fillText('Amplitud (g)', 0, 0);
        ctx.restore();

        // Dibujar las 3 series
        const series = [
            { amps: d.eje_x.amplitudes, color: COLORS.x, peak: d.eje_x.pico_frecuencia, peakAmp: d.eje_x.pico_amplitud },
            { amps: d.eje_y.amplitudes, color: COLORS.y, peak: d.eje_y.pico_frecuencia, peakAmp: d.eje_y.pico_amplitud },
            { amps: d.eje_z.amplitudes, color: COLORS.z, peak: d.eje_z.pico_frecuencia, peakAmp: d.eje_z.pico_amplitud },
        ];

        for (const s of series) {
            ctx.beginPath();
            ctx.strokeStyle = s.color;
            ctx.lineWidth   = 1.5;
            for (let i = 0; i < freqs.length; i++) {
                const x = mapX(freqs[i]);
                const y = mapY(s.amps[i]);
                i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
            }
            ctx.stroke();
        }

        // Líneas verticales en picos dominantes
        for (const s of series) {
            if (s.peak <= 0) continue;
            const px = mapX(s.peak);
            const py = mapY(s.peakAmp);
            ctx.setLineDash([3, 3]);
            ctx.strokeStyle = s.color;
            ctx.lineWidth   = 1;
            ctx.globalAlpha = 0.5;
            ctx.beginPath(); ctx.moveTo(px, pad.top); ctx.lineTo(px, pad.top + ph); ctx.stroke();
            ctx.globalAlpha = 1;
            ctx.setLineDash([]);
            ctx.fillStyle  = s.color;
            ctx.font       = '9px monospace';
            ctx.textAlign  = 'center';
            ctx.fillText(`${s.peak.toFixed(1)}Hz`, px, Math.max(py - 6, pad.top + 10));
        }

        // Leyenda
        const legend = [{ label: 'X', color: COLORS.x }, { label: 'Y', color: COLORS.y }, { label: 'Z', color: COLORS.z }];
        let lx = W - pad.right - 5;
        ctx.font = '10px Inter,sans-serif';
        for (let i = legend.length - 1; i >= 0; i--) {
            const item = legend[i];
            const tw   = ctx.measureText(item.label).width;
            lx -= tw + 22;
            ctx.fillStyle = item.color;
            ctx.fillRect(lx, pad.top + 4, 14, 2);
            ctx.fillStyle  = COLORS.text;
            ctx.textAlign  = 'left';
            ctx.fillText(item.label, lx + 17, pad.top + 10);
        }

        animRef.current = requestAnimationFrame(render);
    }, []);

    useEffect(() => {
        animRef.current = requestAnimationFrame(render);
        return () => cancelAnimationFrame(animRef.current);
    }, [render]);

    return (
        <div style={{
            backgroundColor: COLORS.bg,
            border: `1px solid ${COLORS.cardBorder}`,
            borderRadius: '12px',
            padding: '20px',
            width: '100%',
            minWidth: 0,
            overflow: 'hidden',
        }}>
            {/* Header — actualizado vía DOM directo, sin re-renders React */}
            <div ref={headerRef} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                    <h3 style={{ color: '#fff', fontSize: '14px', fontWeight: 500, margin: 0 }}>
                        📊 Espectro FFT — Análisis de Frecuencias
                    </h3>
                    <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: '4px',
                        fontSize: '11px', padding: '2px 8px', borderRadius: '9999px',
                        backgroundColor: connected ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                        color: connected ? '#22c55e' : '#ef4444',
                        border: `1px solid ${connected ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`,
                    }}>
                        {connected ? '● En vivo' : '○ Desconectado'}
                    </span>
                    <span id="fft-info" style={{ color: COLORS.text, fontSize: '11px' }} />
                </div>
                {/* Picos dominantes — actualizados vía DOM sin re-render */}
                <div id="fft-peaks" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }} />
            </div>

            {/* Canvas */}
            <canvas
                ref={canvasRef}
                data-chart-id="fft"
                style={{ width: '100%', height: '320px', display: 'block', borderRadius: '8px' }}
            />
        </div>
    );
}
