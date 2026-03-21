/**
 * useMQTT — Hook React para suscripción a sensores vía MQTT broker.
 *
 * Reemplaza useWebSocket eliminando el túnel ngrok/Cloudflare.
 * Un cliente MQTT singleton se comparte entre todos los componentes.
 *
 * Uso (compatible con la firma anterior de useWebSocket):
 *   const { data, connected } = useMQTT<AceleracionData>('aceleracion?node=1');
 *
 * Tópicos MQTT (backend_MQTT/config.py MQTT_TOPIC_BASE = 'zaranda'):
 *   zaranda/node/{n}/aceleracion
 *   zaranda/node/{n}/fft
 *   zaranda/node/{n}/metricas
 *   zaranda/node/{n}/velocidad
 *   zaranda/status
 */

import { useState, useEffect, useRef } from 'react';
// NO import mqtt at module level — causes SSR crash (WebSocket not available in Node.js).
// Same pattern as FFTChart with Plotly: dynamic import only inside browser useEffect.
import type { MqttClient } from 'mqtt';
import { MQTT_URL, MQTT_USERNAME, MQTT_PASSWORD, MQTT_TOPIC_BASE } from '../config';
import { getThresholds } from '../config/thresholds';

// ── Singleton MQTT client (browser-only) ─────────────────────────────────────
let _client: MqttClient | null = null;
let _clientConnected = false;
let _initPromise: Promise<MqttClient> | null = null;
const _subscribers = new Map<string, Set<(payload: unknown) => void>>();
// Callbacks waiting for the client to be ready
const _readyCallbacks: Array<(client: MqttClient) => void> = [];

async function getClient(): Promise<MqttClient> {
    if (_client) return _client;
    if (_initPromise) return _initPromise;

    _initPromise = import('mqtt').then(({ default: mqtt }) => {
        _client = mqtt.connect(MQTT_URL, {
            username:        MQTT_USERNAME || undefined,
            password:        MQTT_PASSWORD || undefined,
            clientId:        `mbc_dashboard_${Math.random().toString(16).slice(2, 8)}`,
            keepalive:       60,
            reconnectPeriod: 3000,
            connectTimeout:  15000,
            clean:           true,
        });

        _client.on('connect', () => {
            _clientConnected = true;
            // Re-suscribir todos los tópicos activos tras reconexión
            for (const topic of _subscribers.keys()) {
                _client!.subscribe(topic, { qos: 1 });
            }
            _readyCallbacks.forEach(cb => cb(_client!));
            _readyCallbacks.length = 0;
        });

        _client.on('disconnect', () => { _clientConnected = false; });
        _client.on('offline',    () => { _clientConnected = false; });

        _client.on('message', (topic: string, message: Buffer) => {
            const callbacks = _subscribers.get(topic);
            if (!callbacks || callbacks.size === 0) return;
            try {
                const payload = JSON.parse(message.toString());
                callbacks.forEach(cb => cb(payload));
            } catch {
                // mensaje no-JSON ignorado
            }
        });

        return _client;
    });

    return _initPromise;
}

async function subscribe(topic: string, cb: (payload: unknown) => void) {
    if (!_subscribers.has(topic)) {
        _subscribers.set(topic, new Set());
    }
    _subscribers.get(topic)!.add(cb);

    const client = await getClient();
    if (_clientConnected) {
        client.subscribe(topic, { qos: 1 });
    }
}

function unsubscribe(topic: string, cb: (payload: unknown) => void) {
    const set = _subscribers.get(topic);
    if (!set) return;
    set.delete(cb);
    if (set.size === 0) {
        _subscribers.delete(topic);
        _client?.unsubscribe(topic);
    }
}

// ── Adaptadores de payload ────────────────────────────────────────────────────
// Transforman el formato MQTT de backend_MQTT al formato que espera cada widget.

function adaptAceleracion(msg: Record<string, unknown>) {
    const ts  = (msg.ts  as number[]) ?? [];
    const x   = (msg.x   as number[]) ?? [];
    const y   = (msg.y   as number[]) ?? [];
    const z   = (msg.z   as number[]) ?? [];
    const last = x.length - 1;
    return {
        x, y, z,
        timestamps:         ts,
        aceleracion_total:  last >= 0
            ? Math.sqrt(x[last] ** 2 + y[last] ** 2 + z[last] ** 2)
            : 0,
        unidad: 'g',
        fuente: 'mqtt',
    };
}

function adaptFFT(msg: Record<string, unknown>) {
    const freqs   = (msg.freqs   as number[]) ?? [];
    const X       = (msg.X       as number[]) ?? [];
    const Y       = (msg.Y       as number[]) ?? [];
    const Z       = (msg.Z       as number[]) ?? [];
    const peaks_x = (msg.peaks_x as [number, number][]) ?? [];
    const peaks_y = (msg.peaks_y as [number, number][]) ?? [];
    const peaks_z = (msg.peaks_z as [number, number][]) ?? [];

    return {
        eje_x: {
            frecuencias:    freqs,
            amplitudes:     X,
            pico_frecuencia: peaks_x[0]?.[0] ?? 0,
            pico_amplitud:   peaks_x[0]?.[1] ?? 0,
        },
        eje_y: {
            frecuencias:    freqs,
            amplitudes:     Y,
            pico_frecuencia: peaks_y[0]?.[0] ?? 0,
            pico_amplitud:   peaks_y[0]?.[1] ?? 0,
        },
        eje_z: {
            frecuencias:    freqs,
            amplitudes:     Z,
            pico_frecuencia: peaks_z[0]?.[0] ?? 0,
            pico_amplitud:   peaks_z[0]?.[1] ?? 0,
        },
        sample_rate:      (msg.fs  as number)  ?? 128,
        ventana_muestras: freqs.length,
        timestamp:        (msg.ts  as number)  ?? 0,
    };
}

function adaptMetricas(msg: Record<string, unknown>) {
    const rms_x   = (msg.rms_x_g   as number) ?? 0;
    const stroke  = (msg.stroke_mm as number) ?? 0;
    const rpm     = (msg.rpm_x     as number) ?? 0;
    const angle   = (msg.angle_deg as number) ?? 0;
    return {
        accel_total:  rms_x,
        stroke_total: stroke,
        rpm,
        fase:         angle,
        ejes: {
            x: { accel_g: rms_x,  stroke_mm: stroke },
            y: { accel_g: 0,      stroke_mm: 0 },
            z: { accel_g: 0,      stroke_mm: 0 },
        },
        timestamp: (msg.ts as number) ?? 0,
    };
}

function adaptVelocidad(msg: Record<string, unknown>) {
    const vrms  = (msg.vrms  as { x: number; y: number; z: number }) ?? { x: 0, y: 0, z: 0 };
    const vpico = (msg.vpico as { x: number; y: number; z: number }) ?? { x: 0, y: 0, z: 0 };
    const trend = (msg.trend as { timestamps: number[]; rx: number[]; ry: number[]; rz: number[] })
        ?? { timestamps: [], rx: [], ry: [], rz: [] };
    const { yellow, red } = getThresholds();
    const maxVpico = Math.max(vpico.x, vpico.y, vpico.z);
    return {
        timestamps:              (msg.timestamps as number[]) ?? [],
        vx:                      (msg.vx as number[]) ?? [],
        vy:                      (msg.vy as number[]) ?? [],
        vz:                      (msg.vz as number[]) ?? [],
        rx:                      trend.rx,
        ry:                      trend.ry,
        rz:                      trend.rz,
        vrms_actual:             vrms,
        vpico_actual:            vpico,
        alarm:                   maxVpico >= red,
        alarm_warning:           maxVpico >= yellow && maxVpico < red,
        alarm_threshold:         red,
        alarm_warning_threshold: yellow,
        trend,
    };
}

const ADAPTERS: Record<string, (msg: Record<string, unknown>) => unknown> = {
    aceleracion: adaptAceleracion,
    fft:         adaptFFT,
    metricas:    adaptMetricas,
    velocidad:   adaptVelocidad,
};

// ── Publicar mensajes MQTT desde cualquier componente ────────────────────────
/**
 * Publica un payload JSON en un tópico MQTT.
 * Usa el mismo cliente singleton — no crea nueva conexión.
 * @param topic  Tópico completo, e.g. 'zaranda/daq/cmd'
 * @param payload Objeto serializable a JSON
 */
export function publishMQTT(topic: string, payload: object): void {
    getClient().then((client) => {
        if (_clientConnected) {
            client.publish(topic, JSON.stringify(payload), { qos: 1 });
        }
    });
}

// ── Hook principal ────────────────────────────────────────────────────────────

interface UseMQTTResult<T> {
    data:      T | null;
    connected: boolean;
}

/**
 * @param endpoint  Formato igual que useWebSocket: 'aceleracion?node=1'
 *                  Streams soportados: aceleracion | fft | metricas | velocidad
 */
export function useMQTT<T>(endpoint: string): UseMQTTResult<T> {
    const [data,      setData]      = useState<T | null>(null);
    const [connected, setConnected] = useState(false);
    const topicRef = useRef<string>('');

    // Parsear endpoint → topic MQTT
    // Formatos soportados:
    //   'aceleracion?node=1'  → zaranda/node/1/aceleracion
    //   'status'              → zaranda/status   (topic directo, sin node)
    //   '__disabled__'        → sin suscripción
    const topic = (() => {
        if (endpoint === '__disabled__') return '';
        if (!endpoint.includes('?')) {
            // Topic directo: 'status' → 'zaranda/status'
            return `${MQTT_TOPIC_BASE}/${endpoint}`;
        }
        const [path, query = ''] = endpoint.split('?');
        const params = new URLSearchParams(query);
        const nid = parseInt(params.get('node') ?? '1', 10);
        return `${MQTT_TOPIC_BASE}/node/${nid}/${path}`;
    })();

    const stream = topic.split('/').pop() ?? '';

    useEffect(() => {
        if (!topic) return;

        // Clear stale data immediately so widgets don't show old node's values
        setData(null);

        topicRef.current = topic;
        const adapter = ADAPTERS[stream];
        let cancelled = false;

        const handleMessage = (payload: unknown) => {
            if (topicRef.current !== topic) return;
            try {
                const adapted = adapter
                    ? adapter(payload as Record<string, unknown>)
                    : payload;
                setData(adapted as T);
            } catch {
                setData(payload as T);
            }
        };

        // Dynamic import — solo corre en el browser, nunca en SSR
        subscribe(topic, handleMessage);

        getClient().then((client) => {
            if (cancelled) return;
            setConnected(_clientConnected);

            const onConnect    = () => setConnected(true);
            const onDisconnect = () => setConnected(false);
            const onOffline    = () => setConnected(false);

            client.on('connect',    onConnect);
            client.on('disconnect', onDisconnect);
            client.on('offline',    onOffline);

            // Guardar cleanup en ref para el return del effect
            (handleMessage as any)._cleanup = () => {
                client.off('connect',    onConnect);
                client.off('disconnect', onDisconnect);
                client.off('offline',    onOffline);
            };
        });

        return () => {
            cancelled = true;
            topicRef.current = '';
            unsubscribe(topic, handleMessage);
            (handleMessage as any)._cleanup?.();
        };
    }, [topic, stream]);

    return { data, connected };
}
