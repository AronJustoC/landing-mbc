/**
 * AceleracionWidget — Gráfico de series de tiempo en tiempo real.
 *
 * Usa canvas nativo con requestAnimationFrame para máximo rendimiento.
 * Muestra aceleración X, Y, Z como curvas continuas con buffer circular.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useMQTT as useWebSocket } from '../../hooks/useMQTT';

const LS_KEY = 'mbc_selected_node';
const EVENT_NAME = 'mbc-node-select';
function getStoredNode() {
    try { return parseInt(localStorage.getItem(LS_KEY) || '1', 10); } catch { return 1; }
}

/** Tipo de datos recibidos del backend */
interface AceleracionData {
    x: number[];
    y: number[];
    z: number[];
    timestamps: number[];
    aceleracion_total: number;
    unidad: string;
    fuente?: string;
}

/** Configuración visual (Estilo MSCL PyQtGraph) */
const BUFFER_SIZE = 800; // Mayor buffer para más historia visual a 256Hz
const COLORS = {
    x: '#ff0000',   // Rojo puro
    y: '#00ff00',   // Verde Neón
    z: '#2060ff',   // Azul Fuerte
    grid: 'rgba(255, 255, 255, 0.15)', // Grid más denso
    text: '#9ca3af',
    bg: '#000000',  // Fondo negro absoluto
    cardBorder: '#333333',
};

export default function AceleracionWidget() {
    const [nodeId, setNodeId] = useState<number>(getStoredNode);
    const { data, connected } = useWebSocket<AceleracionData>(`aceleracion?node=${nodeId}`);

    useEffect(() => {
        const handler = (e: Event) => setNodeId((e as CustomEvent<number>).detail);
        window.addEventListener(EVENT_NAME, handler);
        return () => window.removeEventListener(EVENT_NAME, handler);
    }, []);

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animFrameRef = useRef<number>(0);

    // Buffer circular
    const bufferRef = useRef({
        x: [] as number[],
        y: [] as number[],
        z: [] as number[],
        timestamps: [] as number[],
    });

    // Valor actual para mostrar en header
    const lastDataRef = useRef<AceleracionData | null>(null);

    // Limpiar buffer al cambiar de nodo para no mezclar datos
    useEffect(() => {
        bufferRef.current = { x: [], y: [], z: [], timestamps: [] };
        lastDataRef.current = null;
    }, [nodeId]);
    const headerRef = useRef<HTMLDivElement>(null);

    // Acumular datos en el buffer
    useEffect(() => {
        if (!data) return;

        // Skip if empty arrays were sent
        if (!data.x || data.x.length === 0) return;

        const buf = bufferRef.current;

        // Push all points in chunk
        for (let i = 0; i < data.x.length; i++) {
            buf.x.push(data.x[i]);
            buf.y.push(data.y[i]);
            buf.z.push(data.z[i]);
            buf.timestamps.push(data.timestamps[i]);
        }

        while (buf.x.length > BUFFER_SIZE) {
            buf.x.shift();
            buf.y.shift();
            buf.z.shift();
            buf.timestamps.shift();
        }

        lastDataRef.current = data;

        // Actualizar header con valores actuales
        if (headerRef.current) {
            const totalEl = headerRef.current.querySelector('#acel-total');
            if (totalEl) {
                totalEl.textContent = `|G| = ${data.aceleracion_total.toFixed(4)} g`;
            }
        }
    }, [data]);

    // Función de renderizado del canvas
    const render = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Resize solo cuando el tamaño real cambia — evita limpiar GPU texture en cada frame
        const dpr  = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        const newW = Math.round(rect.width  * dpr);
        const newH = Math.round(rect.height * dpr);
        if (canvas.width !== newW || canvas.height !== newH) {
            canvas.width  = newW;
            canvas.height = newH;
        }
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        const width = rect.width;
        const height = rect.height;
        const buf = bufferRef.current;
        const padding = { top: 10, right: 15, bottom: 38, left: 50 };
        const plotWidth = width - padding.left - padding.right;
        const plotHeight = height - padding.top - padding.bottom;

        // Limpiar
        ctx.fillStyle = COLORS.bg;
        ctx.fillRect(0, 0, width, height);

        if (buf.x.length < 2) {
            ctx.fillStyle = COLORS.text;
            ctx.font = '13px Inter, system-ui, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('Esperando datos DAQ...', width / 2, height / 2);
            animFrameRef.current = requestAnimationFrame(render);
            return;
        }

        // Calcular rango Y dinámico más estricto (Estilo PyQtGraph)
        // Ignoramos el 5% de los outliers para no expandir el rango por un solo pico
        const allValues = [...buf.x, ...buf.y, ...buf.z].sort((a, b) => a - b);
        const lowerBound = allValues[Math.floor(allValues.length * 0.02)] || 0;
        const upperBound = allValues[Math.ceil(allValues.length * 0.98) - 1] || 0;

        // Rango simétrico estricto o mínimo +-0.035g como en la foto
        let maxAbs = Math.max(Math.abs(lowerBound), Math.abs(upperBound), 0.015);

        // Padding mínimo, para que las curvas toquen casi el techo
        const rangePadding = maxAbs * 0.1;
        const yMin = -(maxAbs + rangePadding);
        const yMax = (maxAbs + rangePadding);

        // Estilo de Grid denso (estilo osciloscopio)
        ctx.strokeStyle = COLORS.grid;
        ctx.lineWidth = 0.5;

        // Grid horizontal (más líneas)
        const numGridLinesY = 10;
        ctx.font = '10px Inter, system-ui, sans-serif';
        ctx.fillStyle = COLORS.text;
        ctx.textAlign = 'right';

        for (let i = 0; i <= numGridLinesY; i++) {
            const yPos = padding.top + (plotHeight * i) / numGridLinesY;
            const yVal = yMax - ((yMax - yMin) * i) / numGridLinesY;

            ctx.beginPath();
            ctx.moveTo(padding.left, yPos);
            ctx.lineTo(width - padding.right, yPos);
            ctx.stroke();

            // Textos del eje Y cada 2 líneas para no amontonar
            if (i % 2 === 0) {
                ctx.fillText(yVal.toFixed(3), padding.left - 5, yPos + 3);
            }
        }

        // Grid vertical tenue
        const numGridLinesX = 20;
        for (let i = 0; i <= numGridLinesX; i++) {
            const xPos = padding.left + (plotWidth * i) / numGridLinesX;
            ctx.beginPath();
            ctx.moveTo(xPos, padding.top);
            ctx.lineTo(xPos, padding.top + plotHeight);
            ctx.stroke();
        }

        // Eje X: fecha y hora
        if (buf.timestamps.length >= 2) {
            const numTicks = 5;
            ctx.fillStyle = COLORS.text;
            ctx.font = '9px Inter, system-ui, sans-serif';
            for (let i = 0; i <= numTicks; i++) {
                const idx = Math.floor((i / numTicks) * (buf.timestamps.length - 1));
                const ts  = buf.timestamps[idx];
                const xPos = padding.left + (idx / (buf.timestamps.length - 1)) * plotWidth;
                const d = new Date(ts * 1000);
                const label = d.toLocaleString('es-PE', {
                    month: '2-digit', day: '2-digit',
                    hour: '2-digit', minute: '2-digit', second: '2-digit',
                });
                ctx.textAlign = i === 0 ? 'left' : i === numTicks ? 'right' : 'center';
                ctx.fillText(label, xPos, padding.top + plotHeight + 18);
            }
        }

        // Eje Y label
        ctx.save();
        ctx.translate(12, height / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.textAlign = 'center';
        ctx.fillStyle = COLORS.text;
        ctx.font = '11px Inter, system-ui, sans-serif';
        ctx.fillText('Aceleración (g)', 0, 0);
        ctx.restore();

        // Función para mapear datos al canvas
        const mapX = (i: number) => padding.left + (i / (buf.x.length - 1)) * plotWidth;
        const mapY = (v: number) => padding.top + plotHeight - ((v - yMin) / (yMax - yMin)) * plotHeight;

        // Dibujar cada eje (líneas más finas y nítidas)
        const drawSeries = (values: number[], color: string) => {
            ctx.beginPath();
            ctx.strokeStyle = color;
            ctx.lineWidth = 1.0; // Línea más fina para mayor nitidez en datos densos
            ctx.lineJoin = 'round';
            for (let i = 0; i < values.length; i++) {
                const x = mapX(i);
                // Clamp Y para que no se salga del grid si hay un pico enorme
                let valY = values[i];
                if (valY > yMax) valY = yMax;
                if (valY < yMin) valY = yMin;

                const y = mapY(valY);
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.stroke();
        };

        drawSeries(buf.x, COLORS.x);
        drawSeries(buf.y, COLORS.y);
        drawSeries(buf.z, COLORS.z);

        // Leyenda
        const legendItems = [
            { label: 'X', color: COLORS.x },
            { label: 'Y', color: COLORS.y },
            { label: 'Z', color: COLORS.z },
        ];
        ctx.font = '11px Inter, system-ui, sans-serif';
        let legendX = width - padding.right - 10;
        for (let i = legendItems.length - 1; i >= 0; i--) {
            const item = legendItems[i];
            const textWidth = ctx.measureText(item.label).width;
            legendX -= textWidth + 20;
            ctx.fillStyle = item.color;
            ctx.fillRect(legendX, padding.top + 2, 12, 3);
            ctx.fillStyle = COLORS.text;
            ctx.textAlign = 'left';
            ctx.fillText(item.label, legendX + 15, padding.top + 9);
        }

        animFrameRef.current = requestAnimationFrame(render);
    }, []);

    // Iniciar loop de renderizado
    useEffect(() => {
        animFrameRef.current = requestAnimationFrame(render);
        return () => cancelAnimationFrame(animFrameRef.current);
    }, [render]);

    return (
        <div style={{
            backgroundColor: COLORS.bg,
            border: `1px solid ${COLORS.cardBorder}`,
            borderRadius: '12px',
            padding: '20px',
            position: 'relative',
            width: '100%',
            minWidth: 0,
            overflow: 'hidden',
        }}>
            <div ref={headerRef} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                    <h3 style={{ color: '#fff', fontSize: '14px', fontWeight: 500, margin: 0 }}>
                        ⚡ Aceleración G — X / Y / Z
                    </h3>
                    <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '4px', backgroundColor: 'rgba(6,182,212,0.15)', color: '#06b6d4', border: '1px solid rgba(6,182,212,0.3)' }}>
                        Nodo {nodeId}
                    </span>
                    <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '11px',
                        padding: '2px 8px',
                        borderRadius: '9999px',
                        backgroundColor: connected ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        color: connected ? '#22c55e' : '#ef4444',
                        border: `1px solid ${connected ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
                    }}>
                        <span style={{
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            backgroundColor: connected ? '#22c55e' : '#ef4444',
                            animation: connected ? 'pulse 2s infinite' : 'none',
                        }} />
                        {connected ? 'En vivo' : 'Desconectado'}
                    </span>
                </div>
                <span id="acel-total" style={{ color: '#06b6d4', fontSize: '13px', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
                    |G| = 0.0000 g
                </span>
            </div>
            <div style={{ width: '100%', overflowX: 'auto', minWidth: 0 }}>
                <canvas
                    ref={canvasRef}
                    data-chart-id="aceleracion"
                    style={{ width: '100%', height: '320px', display: 'block', borderRadius: '8px', minWidth: '300px' }}
                />
            </div>
            <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
        </div>
    );
}
