/**
 * Configuración centralizada de URLs del backend.
 * - Desarrollo (localhost) → HTTP + WS local
 * - Producción (HTTPS)     → HTTPS + WSS vía Cloudflare Tunnel
 */

const isDev = import.meta.env.DEV;

export const API_BASE = isDev
    ? 'http://192.168.1.4:8000/api'
    : 'https://unstalked-transphysically-suzette.ngrok-free.dev/api';

export const WS_BASE = isDev
    ? 'ws://192.168.1.4:8000/ws'
    : 'wss://unstalked-transphysically-suzette.ngrok-free.dev/ws';

// Header requerido por ngrok free tier para evitar la página de advertencia
export const FETCH_HEADERS: Record<string, string> = isDev
    ? {}
    : { 'ngrok-skip-browser-warning': 'true' };
