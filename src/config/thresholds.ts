/**
 * Umbrales de vibración — valores por defecto (editables desde la UI).
 * Los valores activos se almacenan en localStorage y pueden cambiarse
 * en tiempo real desde el widget de velocidad.
 */

export const THRESHOLD_YELLOW_DEFAULT = 2.8;   // mm/s pico — valor por defecto
export const THRESHOLD_RED_DEFAULT    = 7.1;   // mm/s pico — valor por defecto

const LS_YELLOW = 'mbc_threshold_yellow';
const LS_RED    = 'mbc_threshold_red';

export const THRESHOLD_EVENT = 'mbc-threshold-change';

export function getThresholds(): { yellow: number; red: number } {
    try {
        const y = parseFloat(localStorage.getItem(LS_YELLOW) || '');
        const r = parseFloat(localStorage.getItem(LS_RED)    || '');
        return {
            yellow: isNaN(y) ? THRESHOLD_YELLOW_DEFAULT : y,
            red:    isNaN(r) ? THRESHOLD_RED_DEFAULT    : r,
        };
    } catch {
        return { yellow: THRESHOLD_YELLOW_DEFAULT, red: THRESHOLD_RED_DEFAULT };
    }
}

export function setThresholds(yellow: number, red: number) {
    try {
        localStorage.setItem(LS_YELLOW, String(yellow));
        localStorage.setItem(LS_RED,    String(red));
        window.dispatchEvent(new CustomEvent(THRESHOLD_EVENT, { detail: { yellow, red } }));
    } catch { /* SSR */ }
}
