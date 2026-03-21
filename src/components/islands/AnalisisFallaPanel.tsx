/**
 * AnalisisFallaPanel — Diagnóstico de fallas mecánicas asistido por IA.
 * Captura todos los gráficos del dashboard y los envía a Claude para
 * obtener un análisis técnico holístico de posibles fallas.
 */

import { useState } from 'react';
import { captureAllCharts } from '../../utils/chartCapture';
import { DAQ_API_BASE } from '../../config';

type Status = 'idle' | 'capturing' | 'analyzing' | 'done' | 'error';
type Severidad = 'Crítica' | 'Alta' | 'Media' | 'Baja' | 'Normal';

interface Hallazgo {
    tipo:        string;
    severidad:   Severidad;
    descripcion: string;
    evidencia:   string;
}

interface AnalisisResult {
    estado_general:   string;
    puntuacion_salud: number;
    diagnostico:      string;
    hallazgos:        Hallazgo[];
    recomendaciones:  string[];
    confianza:        number;
    timestamp:        string;
}

const SEV_COLOR: Record<Severidad, { bg: string; text: string; border: string }> = {
    Crítica: { bg: 'rgba(239,68,68,0.12)',   text: '#ef4444', border: 'rgba(239,68,68,0.35)'   },
    Alta:    { bg: 'rgba(249,115,22,0.12)',  text: '#f97316', border: 'rgba(249,115,22,0.35)'  },
    Media:   { bg: 'rgba(234,179,8,0.12)',   text: '#eab308', border: 'rgba(234,179,8,0.35)'   },
    Baja:    { bg: 'rgba(59,130,246,0.12)',  text: '#3b82f6', border: 'rgba(59,130,246,0.35)'  },
    Normal:  { bg: 'rgba(34,197,94,0.12)',   text: '#22c55e', border: 'rgba(34,197,94,0.35)'   },
};

function healthColor(score: number): string {
    if (score >= 80) return '#22c55e';
    if (score >= 55) return '#eab308';
    if (score >= 30) return '#f97316';
    return '#ef4444';
}

function healthLabel(score: number): string {
    if (score >= 80) return 'Bueno';
    if (score >= 55) return 'Advertencia';
    if (score >= 30) return 'Crítico';
    return 'Falla';
}

export default function AnalisisFallaPanel() {
    const [status,   setStatus]   = useState<Status>('idle');
    const [result,   setResult]   = useState<AnalisisResult | null>(null);
    const [errorMsg, setError]    = useState('');

    const busy = status === 'capturing' || status === 'analyzing';

    const handleAnalizar = async () => {
        setStatus('capturing');
        setError('');
        setResult(null);

        try {
            // 1. Capturar todos los gráficos
            const capturas = await captureAllCharts();

            if (capturas.length === 0) {
                setError('No se pudieron capturar los gráficos. Verifica que el DAQ esté corriendo y los widgets visibles, luego intenta de nuevo.');
                setStatus('error');
                return;
            }

            // 2. Enviar al backend para análisis
            setStatus('analyzing');

            const res = await fetch(`${DAQ_API_BASE}/analisis/falla`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    capturas: capturas.map(c => ({ name: c.name, dataUrl: c.dataUrl })),
                }),
            });

            if (!res.ok) {
                const detail = await res.text();
                throw new Error(detail || `Error ${res.status}`);
            }

            const data = await res.json();
            setResult(data);
            setStatus('done');

        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Error desconocido';
            setError(msg);
            setStatus('error');
        }
    };

    const handleReset = () => {
        setStatus('idle');
        setResult(null);
        setError('');
    };

    // ── Render idle ────────────────────────────────────────────────────────────
    if (status === 'idle' && !result) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                    <div style={{
                        padding: '12px', backgroundColor: 'rgba(168,85,247,0.1)',
                        color: '#a855f7', borderRadius: '8px', flexShrink: 0,
                    }}>
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                            <path d="M11 8v6M8 11h6"/>
                        </svg>
                    </div>
                    <div>
                        <p style={{ color: '#fff', fontWeight: 500, marginBottom: '6px' }}>
                            Diagnóstico asistido por IA
                        </p>
                        <p style={{ fontSize: '13px', color: '#9ca3af', lineHeight: 1.6, maxWidth: '500px' }}>
                            Captura automática de todos los gráficos activos y análisis holístico por Claude.
                            Detecta desbalance, desalineación, falla de rodamientos y resonancias con justificación técnica.
                        </p>
                        <div style={{ display: 'flex', gap: '8px', marginTop: '10px', flexWrap: 'wrap' }}>
                            {['Desbalance', 'Desalineación', 'Rodamientos', 'Resonancias', 'Holguras'].map(tag => (
                                <span key={tag} style={{
                                    fontSize: '11px', padding: '2px 8px',
                                    backgroundColor: 'rgba(168,85,247,0.08)',
                                    color: '#a855f7', border: '1px solid rgba(168,85,247,0.2)',
                                    borderRadius: '4px',
                                }}>
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                <button
                    onClick={handleAnalizar}
                    style={{
                        alignSelf: 'flex-start',
                        display: 'flex', alignItems: 'center', gap: '8px',
                        padding: '9px 20px',
                        backgroundColor: 'rgba(168,85,247,0.12)',
                        border: '1px solid rgba(168,85,247,0.4)',
                        borderRadius: '8px',
                        color: '#a855f7',
                        fontSize: '13px', fontWeight: 500,
                        fontFamily: 'inherit', cursor: 'pointer',
                    }}
                >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
                        <path d="M19 3v4M21 5h-4"/>
                    </svg>
                    Analizar con IA
                </button>
            </div>
        );
    }

    // ── Render loading ─────────────────────────────────────────────────────────
    if (busy) {
        const msg = status === 'capturing'
            ? 'Capturando gráficos del dashboard...'
            : 'Claude está analizando todas las gráficas en busca de patrones de falla...';
        const subMsg = status === 'analyzing'
            ? 'Esto puede tardar 20-40 segundos. Analizando FFT, órbita, tendencias y aceleración...'
            : '';

        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', padding: '32px 0' }}>
                <div style={{
                    width: '40px', height: '40px', borderRadius: '50%',
                    border: '3px solid rgba(168,85,247,0.2)',
                    borderTopColor: '#a855f7',
                    animation: 'spin 0.9s linear infinite',
                }} />
                <p style={{ color: '#d1d5db', fontSize: '14px', textAlign: 'center' }}>{msg}</p>
                {subMsg && (
                    <p style={{ color: '#6b7280', fontSize: '12px', textAlign: 'center', maxWidth: '380px' }}>{subMsg}</p>
                )}
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    // ── Render error ───────────────────────────────────────────────────────────
    if (status === 'error') {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{
                    padding: '14px', backgroundColor: 'rgba(239,68,68,0.08)',
                    border: '1px solid rgba(239,68,68,0.25)', borderRadius: '8px',
                    color: '#ef4444', fontSize: '13px',
                }}>
                    {errorMsg}
                </div>
                <button onClick={handleReset} style={{
                    alignSelf: 'flex-start', padding: '7px 16px',
                    backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '6px', color: '#9ca3af', fontSize: '13px',
                    fontFamily: 'inherit', cursor: 'pointer',
                }}>
                    Reintentar
                </button>
            </div>
        );
    }

    // ── Render resultado ───────────────────────────────────────────────────────
    if (result) {
        const score = result.puntuacion_salud ?? 0;
        const hColor = healthColor(score);
        const hLabel = healthLabel(score);

        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                {/* Header: puntuación de salud */}
                <div style={{
                    display: 'flex', alignItems: 'center', gap: '20px',
                    padding: '16px 20px',
                    backgroundColor: '#111318',
                    border: `1px solid ${hColor}40`,
                    borderRadius: '10px',
                }}>
                    {/* Score circular */}
                    <div style={{ position: 'relative', flexShrink: 0 }}>
                        <svg width="70" height="70" viewBox="0 0 70 70">
                            <circle cx="35" cy="35" r="28" fill="none" stroke="#1f2937" strokeWidth="6"/>
                            <circle cx="35" cy="35" r="28" fill="none" stroke={hColor} strokeWidth="6"
                                strokeDasharray={`${(score / 100) * 175.9} 175.9`}
                                strokeLinecap="round" transform="rotate(-90 35 35)"
                                style={{ transition: 'stroke-dasharray 0.8s ease' }}
                            />
                        </svg>
                        <div style={{
                            position: 'absolute', inset: 0,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            flexDirection: 'column',
                        }}>
                            <span style={{ fontSize: '18px', fontWeight: 700, color: hColor, lineHeight: 1 }}>{score}</span>
                            <span style={{ fontSize: '9px', color: '#6b7280', marginTop: '1px' }}>/ 100</span>
                        </div>
                    </div>

                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                            <span style={{
                                fontSize: '13px', fontWeight: 600,
                                padding: '2px 10px', borderRadius: '20px',
                                backgroundColor: `${hColor}20`,
                                border: `1px solid ${hColor}50`,
                                color: hColor,
                            }}>
                                {result.estado_general || hLabel}
                            </span>
                            <span style={{ fontSize: '11px', color: '#6b7280' }}>
                                Confianza: {result.confianza ?? '—'}%
                            </span>
                        </div>
                        <p style={{ fontSize: '13px', color: '#d1d5db', lineHeight: 1.55, maxWidth: '520px' }}>
                            {result.diagnostico}
                        </p>
                    </div>
                </div>

                {/* Hallazgos */}
                {result.hallazgos?.length > 0 && (
                    <div>
                        <h4 style={{ fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>
                            Hallazgos detectados
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {result.hallazgos.map((h, i) => {
                                const sc = SEV_COLOR[h.severidad] ?? SEV_COLOR.Baja;
                                return (
                                    <div key={i} style={{
                                        padding: '12px 14px',
                                        backgroundColor: '#0f1117',
                                        border: `1px solid ${sc.border}`,
                                        borderLeft: `3px solid ${sc.text}`,
                                        borderRadius: '6px',
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
                                            <span style={{ fontSize: '13px', fontWeight: 600, color: '#e5e7eb' }}>{h.tipo}</span>
                                            <span style={{
                                                fontSize: '10px', padding: '1px 7px', borderRadius: '4px',
                                                backgroundColor: sc.bg, color: sc.text, border: `1px solid ${sc.border}`,
                                            }}>
                                                {h.severidad}
                                            </span>
                                        </div>
                                        <p style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '4px' }}>{h.descripcion}</p>
                                        {h.evidencia && (
                                            <p style={{ fontSize: '11px', color: '#6b7280', fontStyle: 'italic' }}>
                                                Evidencia: {h.evidencia}
                                            </p>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Recomendaciones */}
                {result.recomendaciones?.length > 0 && (
                    <div>
                        <h4 style={{ fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>
                            Acciones recomendadas
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            {result.recomendaciones.map((rec, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                                    <span style={{
                                        flexShrink: 0, marginTop: '1px',
                                        width: '20px', height: '20px', borderRadius: '50%',
                                        backgroundColor: 'rgba(6,182,212,0.1)',
                                        border: '1px solid rgba(6,182,212,0.3)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '10px', fontWeight: 600, color: '#06b6d4',
                                    }}>
                                        {i + 1}
                                    </span>
                                    <p style={{ fontSize: '13px', color: '#d1d5db', lineHeight: 1.5, margin: 0 }}>{rec}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Footer */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <span style={{ fontSize: '11px', color: '#4b5563' }}>
                        Análisis generado: {result.timestamp ? new Date(result.timestamp).toLocaleString('es-AR') : '—'}
                    </span>
                    <button onClick={handleReset} style={{
                        display: 'flex', alignItems: 'center', gap: '6px',
                        padding: '6px 14px',
                        backgroundColor: 'rgba(168,85,247,0.08)',
                        border: '1px solid rgba(168,85,247,0.25)',
                        borderRadius: '6px', color: '#a855f7',
                        fontSize: '12px', fontFamily: 'inherit', cursor: 'pointer',
                    }}>
                        Nuevo análisis
                    </button>
                </div>

            </div>
        );
    }

    return null;
}
