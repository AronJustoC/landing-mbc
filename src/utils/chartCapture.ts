/**
 * chartCapture.ts — Captura de todos los análisis del dashboard como PNG.
 *
 * Estrategia por elemento:
 *   1. <canvas> con dimensiones > 0  → toDataURL() directo
 *   2. <canvas> con dimensiones = 0  → mostrar contenedor, esperar redibujado, toDataURL()
 *   3. SVG de Plotly                 → serialización SVG → canvas
 *   4. Fallback html2canvas          → para paneles HTML puros
 */

export interface ChartCapture {
    id:        string;
    name:      string;
    dataUrl:   string;
    timestamp: string;
}

// Orden en que aparecerán en el PPT
const CAPTURE_ORDER = [
    'panel-sensor-activo',
    'hoja-de-ruta',
    'aceleracion-widget',
    'fft-widget',
    'velocidad-widget',
    'orbita-widget',
    'tendencia-widget',
    'historico-widget',
];

function isoTimestamp(): string {
    return new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-');
}

function triggerDownload(dataUrl: string, filename: string) {
    const a = document.createElement('a');
    a.href     = dataUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

// ── Helpers de show/hide ──────────────────────────────────────────────────────

function showParent(el: HTMLElement): HTMLElement | null {
    const parent = el.closest('.hidden') as HTMLElement | null;
    if (parent) {
        parent.classList.remove('hidden');
        parent.style.visibility = 'hidden';   // en layout pero invisible al usuario
    }
    return parent;
}

function hideParent(parent: HTMLElement | null) {
    if (parent) {
        parent.style.visibility = '';
        parent.classList.add('hidden');
    }
}

// ── Captura canvas con fondo oscuro ──────────────────────────────────────────

function drawCanvasWithBg(src: HTMLCanvasElement): string {
    const out = document.createElement('canvas');
    out.width  = src.width;
    out.height = src.height;
    const ctx = out.getContext('2d')!;
    ctx.fillStyle = '#0a0a0c';
    ctx.fillRect(0, 0, out.width, out.height);
    ctx.drawImage(src, 0, 0);
    return out.toDataURL('image/png');
}

// ── Estrategia 1 y 2: canvas interno ─────────────────────────────────────────

async function captureViaCanvas(
    el: HTMLElement,
    canvas: HTMLCanvasElement,
    id: string,
    name: string,
): Promise<ChartCapture | null> {

    // Si el canvas ya tiene dimensiones válidas, captura directa
    if (canvas.width > 0 && canvas.height > 0) {
        try {
            return { id, name, dataUrl: drawCanvasWithBg(canvas), timestamp: isoTimestamp() };
        } catch { /* si falla, intentar mostrando el elemento */ }
    }

    // Canvas con dimensiones 0: el chart se inicializó oculto o aún no se ha dibujado.
    // Mostrar el contenedor para que Chart.js/Plotly calcule dimensiones y redibuje.
    const parent = showParent(el);
    // Forzar resize para que Chart.js detecte el cambio de tamaño
    window.dispatchEvent(new Event('resize'));
    // Esperar que el chart redibuje (Chart.js usa ResizeObserver + rAF internamente)
    await new Promise(r => setTimeout(r, 400));

    let result: ChartCapture | null = null;
    if (canvas.width > 0 && canvas.height > 0) {
        try {
            result = { id, name, dataUrl: drawCanvasWithBg(canvas), timestamp: isoTimestamp() };
        } catch (err) {
            console.warn(`[captureCanvas retry] ${id}:`, err);
        }
    }

    hideParent(parent);
    return result;
}

// ── Estrategia 3: SVG Plotly ──────────────────────────────────────────────────

async function captureViaSVG(
    el: HTMLElement,
    svg: SVGElement,
    id: string,
    name: string,
): Promise<ChartCapture | null> {
    // Si el SVG no tiene dimensiones, mostrarlo brevemente
    let svgW = parseFloat(svg.getAttribute('width')  || '0');
    let svgH = parseFloat(svg.getAttribute('height') || '0');

    const parent = (svgW === 0 || svgH === 0) ? showParent(el) : null;
    if (parent) {
        await new Promise(r => setTimeout(r, 100));
        svgW = parseFloat(svg.getAttribute('width')  || '0') || svg.getBoundingClientRect().width  || 800;
        svgH = parseFloat(svg.getAttribute('height') || '0') || svg.getBoundingClientRect().height || 400;
    }

    return new Promise(resolve => {
        try {
            const serialized = new XMLSerializer().serializeToString(svg);
            const blob = new Blob([serialized], { type: 'image/svg+xml;charset=utf-8' });
            const url  = URL.createObjectURL(blob);
            const img  = new Image();

            img.onload = () => {
                const out = document.createElement('canvas');
                out.width  = svgW || 800;
                out.height = svgH || 400;
                const ctx = out.getContext('2d')!;
                ctx.fillStyle = '#0a0a0c';
                ctx.fillRect(0, 0, out.width, out.height);
                ctx.drawImage(img, 0, 0, out.width, out.height);
                URL.revokeObjectURL(url);
                hideParent(parent);
                resolve({ id, name, dataUrl: out.toDataURL('image/png'), timestamp: isoTimestamp() });
            };
            img.onerror = () => {
                URL.revokeObjectURL(url);
                hideParent(parent);
                resolve(null);
            };
            img.src = url;
        } catch (err) {
            console.warn(`[captureSVG] ${id}:`, err);
            hideParent(parent);
            resolve(null);
        }
    });
}

// ── Estrategia 4: html2canvas (paneles HTML puros) ────────────────────────────

async function captureViaHtml2Canvas(
    el: HTMLElement,
    id: string,
    name: string,
): Promise<ChartCapture | null> {
    try {
        const { default: html2canvas } = await import('html2canvas');
        const parent = showParent(el);
        if (parent) await new Promise(r => setTimeout(r, 80));

        const canvas = await html2canvas(el, {
            backgroundColor: '#0a0a0c',
            scale:      1.5,
            useCORS:    true,
            logging:    false,
            allowTaint: true,
        });

        hideParent(parent);
        return { id, name, dataUrl: canvas.toDataURL('image/png'), timestamp: isoTimestamp() };
    } catch (err) {
        console.warn(`[html2canvas] ${id}:`, err);
        return null;
    }
}

// ── Selector principal ────────────────────────────────────────────────────────

async function captureElement(
    el: HTMLElement,
    id: string,
    name: string,
): Promise<ChartCapture | null> {

    // 1 & 2: canvas interno (Chart.js, canvas nativo)
    const canvases = Array.from(el.querySelectorAll<HTMLCanvasElement>('canvas'));
    if (canvases.length > 0) {
        // Elegir el canvas más grande (el principal, no los overlays)
        const main = canvases.reduce((best, c) =>
            c.width * c.height > best.width * best.height ? c : best
        );
        const result = await captureViaCanvas(el, main, id, name);
        if (result) return result;
    }

    // 3: SVG Plotly
    const plotlySvg = el.querySelector<SVGElement>('svg.main-svg, svg.js-plotly-plot svg');
    if (plotlySvg) {
        const result = await captureViaSVG(el, plotlySvg, id, name);
        if (result) return result;
    }

    // 4: fallback html2canvas
    return captureViaHtml2Canvas(el, id, name);
}

// ── API pública ───────────────────────────────────────────────────────────────

export async function captureAllCharts(): Promise<ChartCapture[]> {
    const results: ChartCapture[] = [];

    for (const captureId of CAPTURE_ORDER) {
        const el = document.querySelector<HTMLElement>(`[data-capture-id="${captureId}"]`);
        if (!el) continue;

        const name    = el.getAttribute('data-capture-name') ?? captureId;
        const capture = await captureElement(el, captureId, name);
        if (capture) results.push(capture);
    }

    return results;
}

export function downloadCaptures(captures: ChartCapture[]): void {
    const ts = isoTimestamp();
    for (const c of captures) {
        triggerDownload(c.dataUrl, `${c.name}_${ts}.png`);
    }
}
