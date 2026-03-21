/**
 * CaptureAllButton — Captura todos los gráficos del dashboard como PNG.
 * Descarga cada uno por separado con nombre legible + timestamp.
 */

import { useState } from 'react';
import { captureAllCharts, downloadCaptures } from '../../utils/chartCapture';

export default function CaptureAllButton() {
    const [status, setStatus] = useState<'idle' | 'capturing' | 'done'>('idle');

    const handleCapture = async () => {
        setStatus('capturing');
        try {
            const captures = await captureAllCharts();
            downloadCaptures(captures);
            setStatus('done');
            setTimeout(() => setStatus('idle'), 2000);
        } catch (err) {
            console.error('[CaptureAll] Error:', err);
            setStatus('idle');
        }
    };

    const label = status === 'capturing'
        ? 'Capturando...'
        : status === 'done'
        ? '✓ Descargados'
        : '📷 Capturar Gráficos';

    return (
        <button
            onClick={handleCapture}
            disabled={status === 'capturing'}
            style={{
                display:         'flex',
                alignItems:      'center',
                gap:             '6px',
                padding:         '6px 14px',
                backgroundColor: status === 'done'
                    ? 'rgba(34, 197, 94, 0.1)'
                    : 'rgba(6, 182, 212, 0.1)',
                border: `1px solid ${status === 'done'
                    ? 'rgba(34, 197, 94, 0.3)'
                    : 'rgba(6, 182, 212, 0.3)'}`,
                borderRadius: '8px',
                color:        status === 'done' ? '#22c55e' : '#06b6d4',
                fontSize:     '13px',
                fontFamily:   'inherit',
                cursor:       status === 'capturing' ? 'not-allowed' : 'pointer',
                opacity:      status === 'capturing' ? 0.6 : 1,
                transition:   'all 0.2s',
                whiteSpace:   'nowrap',
            }}
        >
            {label}
        </button>
    );
}
