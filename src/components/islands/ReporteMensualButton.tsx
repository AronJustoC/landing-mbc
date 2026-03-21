/**
 * ReporteMensualButton — Captura todos los gráficos y genera un .pptx
 * enviando las imágenes al endpoint POST /api/reportes/mensual del backend.
 */

import { useState } from 'react';
import { captureAllCharts } from '../../utils/chartCapture';
import { DAQ_API_BASE } from '../../config';

type Status = 'idle' | 'capturing' | 'generating' | 'done' | 'error';

const MESES = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

const INPUT_STYLE: React.CSSProperties = {
    backgroundColor: '#1a1a1e',
    border: '1px solid rgba(6,182,212,0.3)',
    borderRadius: '6px',
    color: '#e5e7eb',
    fontSize: '13px',
    padding: '7px 10px',
    outline: 'none',
    fontFamily: 'inherit',
    cursor: 'pointer',
};

export default function ReporteMensualButton() {
    const now = new Date();
    const [mes,      setMes]      = useState<number>(now.getMonth());
    const [anio,     setAnio]     = useState<number>(now.getFullYear());
    const [usarIA,   setUsarIA]   = useState<boolean>(false);
    const [status,   setStatus]   = useState<Status>('idle');
    const [errorMsg, setError]    = useState('');

    const busy = status === 'capturing' || status === 'generating';

    const handleGenerar = async () => {
        setStatus('capturing');
        setError('');

        try {
            // 1. Capturar todos los gráficos del dashboard
            const capturas = await captureAllCharts();

            if (capturas.length === 0) {
                setError('No se pudieron capturar los gráficos. Verifica que el DAQ esté corriendo y los widgets visibles, luego intenta de nuevo.');
                setStatus('error');
                setTimeout(() => setStatus('idle'), 5000);
                return;
            }

            // 2. Enviar al backend
            setStatus('generating');
            const periodo = `${MESES[mes]} ${anio}`;

            const res = await fetch(`${DAQ_API_BASE}/reportes/mensual`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    periodo,
                    usar_ia: usarIA,
                    capturas: capturas.map(c => ({ name: c.name, dataUrl: c.dataUrl })),
                }),
            });

            if (!res.ok) {
                const detail = await res.text();
                throw new Error(detail || `Error ${res.status}`);
            }

            // 3. Descargar el archivo .pptx
            const blob     = await res.blob();
            const url      = URL.createObjectURL(blob);
            const link     = document.createElement('a');
            link.href      = url;
            link.download  = `Reporte_MBC_${MESES[mes]}_${anio}.pptx`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            setStatus('done');
            setTimeout(() => setStatus('idle'), 3000);

        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Error desconocido';
            setError(msg);
            setStatus('error');
            setTimeout(() => setStatus('idle'), 5000);
        }
    };

    const btnColor =
        status === 'done'  ? '#22c55e' :
        status === 'error' ? '#ef4444' : '#06b6d4';

    const btnBg =
        status === 'done'  ? 'rgba(34,197,94,0.12)' :
        status === 'error' ? 'rgba(239,68,68,0.12)' : 'rgba(6,182,212,0.12)';

    const btnBorder =
        status === 'done'  ? 'rgba(34,197,94,0.4)' :
        status === 'error' ? 'rgba(239,68,68,0.4)'  : 'rgba(6,182,212,0.4)';

    const btnLabel =
        status === 'capturing'  ? 'Capturando gráficos...'    :
        status === 'generating' ? (usarIA ? 'Analizando con IA...' : 'Generando PPT...') :
        status === 'done'       ? '✓ Descargado'              :
        status === 'error'      ? '✗ Error'                   : '⬇ Generar PPT';

    const years = Array.from({ length: 4 }, (_, i) => now.getFullYear() - 1 + i);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                {/* Selector de mes */}
                <select
                    value={mes}
                    onChange={e => setMes(parseInt(e.target.value))}
                    disabled={busy}
                    style={{ ...INPUT_STYLE, opacity: busy ? 0.5 : 1 }}
                >
                    {MESES.map((m, i) => (
                        <option key={m} value={i}>{m}</option>
                    ))}
                </select>

                {/* Selector de año */}
                <select
                    value={anio}
                    onChange={e => setAnio(parseInt(e.target.value))}
                    disabled={busy}
                    style={{ ...INPUT_STYLE, opacity: busy ? 0.5 : 1 }}
                >
                    {years.map(y => (
                        <option key={y} value={y}>{y}</option>
                    ))}
                </select>

                {/* Toggle análisis IA */}
                <label style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    cursor: busy ? 'not-allowed' : 'pointer',
                    opacity: busy ? 0.5 : 1,
                    userSelect: 'none',
                }}>
                    <div
                        onClick={() => !busy && setUsarIA(v => !v)}
                        style={{
                            width: '36px', height: '20px', borderRadius: '10px',
                            backgroundColor: usarIA ? 'rgba(6,182,212,0.8)' : '#374151',
                            position: 'relative', transition: 'background-color 0.2s',
                            flexShrink: 0,
                        }}
                    >
                        <div style={{
                            position: 'absolute', top: '3px',
                            left: usarIA ? '19px' : '3px',
                            width: '14px', height: '14px', borderRadius: '50%',
                            backgroundColor: '#fff', transition: 'left 0.2s',
                        }} />
                    </div>
                    <span style={{ fontSize: '12px', color: usarIA ? '#06b6d4' : '#6b7280' }}>
                        Análisis IA
                    </span>
                </label>

                {/* Botón generar */}
                <button
                    onClick={handleGenerar}
                    disabled={busy}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '7px',
                        padding: '7px 18px',
                        backgroundColor: btnBg,
                        border: `1px solid ${btnBorder}`,
                        borderRadius: '8px',
                        color: btnColor,
                        fontSize: '13px',
                        fontFamily: 'inherit',
                        cursor: busy ? 'not-allowed' : 'pointer',
                        opacity: busy ? 0.75 : 1,
                        transition: 'all 0.2s',
                        whiteSpace: 'nowrap',
                        fontWeight: 500,
                    }}
                >
                    {busy && (
                        <span style={{
                            width: '13px', height: '13px', borderRadius: '50%',
                            border: '2px solid currentColor', borderTopColor: 'transparent',
                            animation: 'spin 0.8s linear infinite', display: 'inline-block',
                            flexShrink: 0,
                        }} />
                    )}
                    {btnLabel}
                </button>
            </div>

            {/* Advertencia de tiempo con IA */}
            {usarIA && status === 'idle' && (
                <p style={{ fontSize: '11px', color: '#9ca3af', margin: 0 }}>
                    Con análisis IA el tiempo de generación es de ~30-60 seg (una llamada por gráfica).
                </p>
            )}

            {/* Mensaje de error */}
            {status === 'error' && errorMsg && (
                <p style={{ fontSize: '12px', color: '#ef4444', margin: 0 }}>
                    {errorMsg}
                </p>
            )}

            {/* Información de capturas */}
            {status === 'capturing' && (
                <p style={{ fontSize: '11px', color: '#6b7280', margin: 0 }}>
                    Capturando Aceleración, FFT, Velocidad, Órbita, Tendencia...
                </p>
            )}
            {status === 'generating' && usarIA && (
                <p style={{ fontSize: '11px', color: '#06b6d4', margin: 0 }}>
                    Claude está analizando cada gráfica, esto puede tardar un momento...
                </p>
            )}

            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}
