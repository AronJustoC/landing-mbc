/**
 * FFTChart — Espectro de frecuencias en tiempo real usando Plotly.js.
 *
 * Usa lazy loading de Plotly para evitar el error "self is not defined"
 * que ocurre cuando Plotly intenta ejecutarse en SSR.
 * Muestra los 3 ejes con colores diferenciados.
 */

import { useMemo, useState, useEffect } from 'react';
import { useWebSocket } from '../../hooks/useWebSocket';

const LS_KEY = 'mbc_selected_node';
const EVENT_NAME = 'mbc-node-select';
function getStoredNode() {
    try { return parseInt(localStorage.getItem(LS_KEY) || '1', 10); } catch { return 1; }
}

/** Tipo de datos FFT por eje */
interface FFTAxisData {
    frecuencias: number[];
    amplitudes: number[];
    pico_frecuencia: number;
    pico_amplitud: number;
}

/** Tipo de datos recibidos del backend */
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
    plotBg: '#1a1a1e',
    text: '#9ca3af',
    grid: 'rgba(255, 255, 255, 0.06)',
    cardBorder: 'rgba(255, 255, 255, 0.05)',
};

export default function FFTChart() {
    const [nodeId, setNodeId] = useState<number>(getStoredNode);
    const { data, connected } = useWebSocket<FFTData>(`fft?node=${nodeId}`);
    const [PlotComponent, setPlotComponent] = useState<any>(null);

    useEffect(() => {
        const handler = (e: Event) => setNodeId((e as CustomEvent<number>).detail);
        window.addEventListener(EVENT_NAME, handler);
        return () => window.removeEventListener(EVENT_NAME, handler);
    }, []);

    // Lazy load Plotly solo en el cliente (evita "self is not defined" en SSR)
    useEffect(() => {
        import('react-plotly.js').then((mod) => {
            setPlotComponent(() => mod.default);
        });
    }, []);

    const plotData = useMemo(() => {
        if (!data) return [];

        return [
            {
                x: data.eje_x.frecuencias,
                y: data.eje_x.amplitudes,
                type: 'scatter' as const,
                mode: 'lines' as const,
                name: 'Eje X',
                line: { color: COLORS.x, width: 1.5 },
            },
            {
                x: data.eje_y.frecuencias,
                y: data.eje_y.amplitudes,
                type: 'scatter' as const,
                mode: 'lines' as const,
                name: 'Eje Y',
                line: { color: COLORS.y, width: 1.5 },
            },
            {
                x: data.eje_z.frecuencias,
                y: data.eje_z.amplitudes,
                type: 'scatter' as const,
                mode: 'lines' as const,
                name: 'Eje Z',
                line: { color: COLORS.z, width: 1.5 },
            },
        ];
    }, [data]);

    const layout = useMemo(() => ({
        xaxis: {
            title: { text: 'Frecuencia (Hz)', font: { color: COLORS.text, size: 11 } },
            color: COLORS.text,
            gridcolor: COLORS.grid,
            zerolinecolor: COLORS.grid,
            rangeslider: { visible: true, bgcolor: COLORS.plotBg, bordercolor: COLORS.grid },
        },
        yaxis: {
            title: { text: 'Amplitud (g)', font: { color: COLORS.text, size: 11 } },
            color: COLORS.text,
            gridcolor: COLORS.grid,
            zerolinecolor: COLORS.grid,
        },
        paper_bgcolor: COLORS.bg,
        plot_bgcolor: COLORS.plotBg,
        font: { color: COLORS.text, family: 'Inter, system-ui, sans-serif', size: 11 },
        margin: { t: 10, b: 60, l: 55, r: 15 },
        height: 320,
        legend: {
            orientation: 'h' as const,
            x: 0.5,
            xanchor: 'center' as const,
            y: 1.05,
            font: { size: 11 },
        },
        dragmode: 'zoom' as const,
        autosize: true,
    }), []);

    const config = useMemo(() => ({
        responsive: true,
        displayModeBar: true,
        displaylogo: false,
        modeBarButtonsToRemove: ['lasso2d', 'select2d'],
    }), []);

    // Info de picos dominantes
    const peaksInfo = data ? [
        { label: 'X', freq: data.eje_x.pico_frecuencia, amp: data.eje_x.pico_amplitud, color: COLORS.x },
        { label: 'Y', freq: data.eje_y.pico_frecuencia, amp: data.eje_y.pico_amplitud, color: COLORS.y },
        { label: 'Z', freq: data.eje_z.pico_frecuencia, amp: data.eje_z.pico_amplitud, color: COLORS.z },
    ] : [];

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
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                    <h3 style={{ color: '#fff', fontSize: '14px', fontWeight: 500, margin: 0 }}>
                        📊 Espectro FFT — Análisis de Frecuencias
                    </h3>
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
                        {connected ? '● En vivo' : '○ Desconectado'}
                    </span>
                </div>
                {data && (
                    <span style={{ color: COLORS.text, fontSize: '11px' }}>
                        fs: {data.sample_rate} Hz | {data.ventana_muestras} muestras
                    </span>
                )}
            </div>

            {/* Picos dominantes */}
            {peaksInfo.length > 0 && (
                <div style={{ display: 'flex', gap: '16px', marginBottom: '8px', flexWrap: 'wrap' }}>
                    {peaksInfo.map((peak) => (
                        <span key={peak.label} style={{
                            fontSize: '11px',
                            color: peak.color,
                            fontFamily: 'monospace',
                            padding: '2px 8px',
                            backgroundColor: 'rgba(255,255,255,0.03)',
                            borderRadius: '4px',
                        }}>
                            Pico {peak.label}: {peak.freq.toFixed(1)} Hz ({peak.amp.toFixed(4)} g)
                        </span>
                    ))}
                </div>
            )}

            {/* Gráfico Plotly (lazy loaded) */}
            <div style={{ width: '100%', minWidth: 0 }}>
                {!data || !PlotComponent ? (
                    <div style={{
                        height: '320px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: COLORS.text,
                        fontSize: '13px',
                    }}>
                        {!PlotComponent ? 'Cargando gráfico FFT...' : 'Esperando datos FFT...'}
                    </div>
                ) : (
                    <div style={{ width: '100%', position: 'relative' }}>
                        <PlotComponent
                            data={plotData}
                            layout={layout}
                            config={config}
                            style={{ width: '100%', height: '320px' }}
                            useResizeHandler={true}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
