/**
 * Configuración centralizada de URLs del backend.
 *
 * Arquitectura MQTT (sin túnel):
 *   Sensores → backend_MQTT local → EMQX Cloud → Frontend
 *
 * API_BASE  → backend-web (autenticación, REST)
 * MQTT_URL  → broker MQTT para streams de sensores en tiempo real
 */

const isDev = import.meta.env.DEV;

// ── REST API (backend-web — autenticación y gestión de usuarios) ──────────────
const API_HOST = import.meta.env.PUBLIC_API_HOST ?? 'mbcpredictive.com';
export const API_BASE = isDev
    ? 'http://192.168.1.4:8001/api'
    : `https://${API_HOST}/api`;

export const FETCH_HEADERS: Record<string, string> = {};

// ── MQTT Broker (streams de sensores en tiempo real) ──────────────────────────
// Dev:  broker público EMQX (pruebas sin costo)
// Prod: tu instancia EMQX Cloud — cambia PUBLIC_MQTT_HOST en .env de Vercel
const MQTT_HOST_DEV  = 'broker.emqx.io';
const MQTT_HOST_PROD = import.meta.env.PUBLIC_MQTT_HOST ?? 'broker.emqx.io';

export const MQTT_URL = isDev
    ? `ws://${MQTT_HOST_DEV}:8083/mqtt`      // WS sin TLS (dev)
    : `wss://${MQTT_HOST_PROD}:8084/mqtt`;   // WSS con TLS (prod)

export const MQTT_USERNAME = import.meta.env.PUBLIC_MQTT_USERNAME ?? '';
export const MQTT_PASSWORD = import.meta.env.PUBLIC_MQTT_PASSWORD ?? '';

// Tópico base — igual que backend_MQTT/config.py
export const MQTT_TOPIC_BASE = 'zaranda';

// ── DAQ Control API (backend_MQTT — HTTP embebido, puerto 8002) ───────────────
const DAQ_API_HOST = import.meta.env.PUBLIC_DAQ_API_HOST ?? '192.168.1.4';
export const DAQ_API_BASE = isDev
    ? `http://${DAQ_API_HOST}:8002/api`
    : `https://${API_HOST}/api/daq-proxy`;   // en prod: reverse proxy o mismo host

// ── Legacy WebSocket (mantenido para compatibilidad durante migración) ─────────
/** @deprecated usar useMQTT en lugar de useWebSocket */
export const WS_BASE = isDev
    ? 'ws://192.168.1.4:8000/ws'
    : `wss://${API_HOST}/ws`;
