/**
 * HojaDeRuta — Imagen de ubicación de sensores en la zaranda.
 * Cada nodo tiene su propia foto de instalación.
 * El nodo activo se resalta en la leyenda y cambia la imagen mostrada.
 */

import { useState, useEffect, useRef } from 'react';
import imgP1 from '../../assets/roadmap/right-feed-P1.jpg';
import imgP2 from '../../assets/roadmap/left-feed-P2.jpg';
import imgP3 from '../../assets/roadmap/right-discharge-P3.jpg';
import imgP4 from '../../assets/roadmap/left-discharge-P4.jpg';

const LS_KEY     = 'mbc_selected_node';
const EVENT_NAME = 'mbc-node-select';

function getStoredNode(): number {
    try { return parseInt(localStorage.getItem(LS_KEY) || '1', 10); } catch { return 1; }
}

// markerX / markerY: posición del sensor sobre la imagen en % (0-100).
// Ajustar según la ubicación real del sensor en cada foto.
const NODES = [
    { id: 1, label: 'P1', description: 'Alimentación derecha',   img: imgP1.src ?? imgP1, markerX: 21, markerY: 43 },
    { id: 2, label: 'P2', description: 'Alimentación izquierda', img: imgP2.src ?? imgP2, markerX: 71, markerY: 43 },
    { id: 3, label: 'P3', description: 'Descarga derecha',       img: imgP3.src ?? imgP3, markerX: 53.5, markerY: 71 },
    { id: 4, label: 'P4', description: 'Descarga izquierda',     img: imgP4.src ?? imgP4, markerX: 48, markerY: 78 },
];

export default function HojaDeRuta() {
    const [activeNode, setActiveNode] = useState<number>(getStoredNode);

    useEffect(() => {
        const handler = (e: Event) => setActiveNode((e as CustomEvent<number>).detail);
        window.addEventListener(EVENT_NAME, handler);
        return () => window.removeEventListener(EVENT_NAME, handler);
    }, []);

    const handleSelect = (id: number) => {
        setActiveNode(id);
        localStorage.setItem(LS_KEY, String(id));
        window.dispatchEvent(new CustomEvent<number>(EVENT_NAME, { detail: id }));
    };

    const node = NODES.find(n => n.id === activeNode)!;

    // ── Pan + Zoom de imagen ─────────────────────────────────────────────────
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [scale, setScale]   = useState(0.5);
    const [dragging, setDragging] = useState(false);
    const dragStart  = useRef<{ mx: number; my: number; ox: number; oy: number } | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const imgRef       = useRef<HTMLImageElement>(null);

    // Resetear al cambiar de nodo
    useEffect(() => { setOffset({ x: 0, y: 0 }); setScale(0.5); }, [activeNode]);

    /** Limita el offset para que la imagen nunca salga del contenedor */
    const clamp = (x: number, y: number, currentScale: number) => {
        if (!containerRef.current || !imgRef.current) return { x, y };
        const cw = containerRef.current.offsetWidth;
        const ch = containerRef.current.offsetHeight;
        const iw = imgRef.current.offsetWidth  * currentScale;
        const ih = imgRef.current.offsetHeight * currentScale;
        const maxX = Math.max(0, (iw - cw) / 2);
        const maxY = Math.max(0, (ih - ch) / 2);
        return {
            x: Math.max(-maxX, Math.min(maxX, x)),
            y: Math.max(-maxY, Math.min(maxY, y)),
        };
    };

    const onMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        dragStart.current = { mx: e.clientX, my: e.clientY, ox: offset.x, oy: offset.y };
        setDragging(true);
    };

    const onMouseMove = (e: React.MouseEvent) => {
        if (!dragStart.current) return;
        const raw = {
            x: dragStart.current.ox + (e.clientX - dragStart.current.mx),
            y: dragStart.current.oy + (e.clientY - dragStart.current.my),
        };
        setOffset(clamp(raw.x, raw.y, scale));
    };

    const onMouseUp = () => { dragStart.current = null; setDragging(false); };

    const onWheel = (e: React.WheelEvent) => {
        e.preventDefault();
        setScale(prev => {
            const next = Math.min(1, Math.max(0.5, prev - e.deltaY * 0.001));
            setOffset(o => clamp(o.x, o.y, next));
            return next;
        });
    };

    return (
        <div style={{
            backgroundColor: '#121214',
            border: '1px solid rgba(255,255,255,0.05)',
            borderRadius: '12px',
            overflow: 'hidden',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
        }}>
            {/* Header */}
            <div style={{
                padding: '18px 24px',
                borderBottom: '1px solid rgba(255,255,255,0.08)',
                background: 'linear-gradient(135deg, rgba(6,182,212,0.08) 0%, rgba(59,130,246,0.04) 100%)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
                <div>
                    <h3 style={{ color: '#fff', fontSize: '15px', fontWeight: 600, margin: 0 }}>
                        🗺 Hoja de Ruta
                    </h3>
                    <p style={{ color: '#6b7280', fontSize: '12px', margin: '2px 0 0' }}>
                        {node.description}
                    </p>
                </div>
                <span style={{
                    fontSize: '10px', padding: '3px 10px', borderRadius: '9999px',
                    backgroundColor: 'rgba(6,182,212,0.15)', color: '#06b6d4',
                    border: '1px solid rgba(6,182,212,0.3)', fontWeight: 600,
                }}>
                    {node.label} activo
                </span>
            </div>

            {/* Imagen del nodo activo — arrastrable */}
            <div
                ref={containerRef}
                style={{
                    overflow: 'hidden', flex: 1, minHeight: 0,
                    position: 'relative',
                    cursor: dragging ? 'grabbing' : 'grab',
                }}
                onMouseDown={onMouseDown}
                onMouseMove={onMouseMove}
                onMouseUp={onMouseUp}
                onMouseLeave={onMouseUp}
                onWheel={onWheel}
            >
                {/* Wrapper: imagen + marcador se transforman juntos */}
                <div style={{
                    position: 'absolute',
                    top: '50%', left: '50%',
                    transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px)) scale(${scale})`,
                    transformOrigin: 'center center',
                    transition: dragging ? 'none' : 'transform 0.15s',
                    lineHeight: 0,
                }}>
                    <img
                        ref={imgRef}
                        key={activeNode}
                        src={node.img}
                        alt={`Ubicación sensor ${node.label} — ${node.description}`}
                        draggable={false}
                        style={{
                            display: 'block',
                            width: 'auto', height: 'auto',
                            minWidth: `${containerRef.current?.offsetWidth ?? 300}px`,
                            minHeight: `${containerRef.current?.offsetHeight ?? 200}px`,
                            maxWidth: 'none',
                            userSelect: 'none',
                        }}
                    />
                    {/* Marcador de ubicación del sensor */}
                    <div style={{
                        position: 'absolute',
                        left: `${node.markerX}%`,
                        top:  `${node.markerY}%`,
                        transform: 'translate(-50%, -50%)',
                        pointerEvents: 'none',
                    }}>
                        {/* Anillo pulsante */}
                        <div style={{
                            position: 'absolute',
                            width: '128px', height: '128px',
                            borderRadius: '50%',
                            border: '3px solid rgba(6,182,212,0.6)',
                            top: '50%', left: '50%',
                            transform: 'translate(-50%, -50%)',
                            animation: 'ping 1.5s cubic-bezier(0,0,0.2,1) infinite',
                        }} />
                        {/* Punto central */}
                        <div style={{
                            width: '56px', height: '56px',
                            borderRadius: '50%',
                            backgroundColor: '#06b6d4',
                            border: '3px solid #fff',
                            boxShadow: '0 0 32px rgba(6,182,212,0.9)',
                            position: 'relative', zIndex: 1,
                        }} />
                        {/* Etiqueta */}
                        <div style={{
                            position: 'absolute',
                            top: '18px', left: '50%',
                            transform: 'translateX(-50%)',
                            backgroundColor: 'rgba(0,0,0,0.75)',
                            color: '#06b6d4',
                            fontSize: '10px', fontWeight: 700,
                            padding: '2px 6px', borderRadius: '4px',
                            whiteSpace: 'nowrap', border: '1px solid rgba(6,182,212,0.4)',
                        }}>
                            {node.label}
                        </div>
                    </div>
                </div>

                {/* Indicador de zoom */}
                <span style={{
                    position: 'absolute', bottom: '8px', right: '8px',
                    fontSize: '10px', padding: '2px 7px', borderRadius: '4px',
                    backgroundColor: 'rgba(0,0,0,0.6)', color: '#9ca3af',
                    fontFamily: 'monospace', pointerEvents: 'none',
                }}>
                    {Math.round(scale * 100)}%
                </span>
            </div>
            <style>{`
                @keyframes ping {
                    75%, 100% { transform: translate(-50%,-50%) scale(2); opacity: 0; }
                }
            `}</style>

        </div>
    );
}
