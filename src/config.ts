/**
 * Configuración centralizada de URLs del backend.
 * - Desarrollo (localhost) → HTTP + WS local
 * - Producción             → HTTPS + WSS vía tunnel (ngrok / cloudflare)
 *
 * Para cambiar de tunnel: solo editar TUNNEL_HOST y hacer build del frontend.
 */

const isDev = import.meta.env.DEV;

// ← Cambiar esta línea cuando cambie el tunnel
const TUNNEL_HOST = 'unstalked-transphysically-suzette.ngrok-free.dev';

export const API_BASE = isDev
    ? 'http://192.168.1.4:8000/api'
    : `https://${TUNNEL_HOST}/api`;

export const WS_BASE = isDev
    ? 'ws://192.168.1.4:8000/ws'
    : `wss://${TUNNEL_HOST}/ws`;

export const FETCH_HEADERS: Record<string, string> = isDev
    ? {}
    : TUNNEL_HOST.includes('ngrok') ? { 'ngrok-skip-browser-warning': 'true' } : {};
