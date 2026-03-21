/**
 * NodeSelector — Dropdown para seleccionar el nodo activo.
 * Sincronizado con SensorSummaryCard y todos los widgets
 * mediante localStorage + CustomEvent 'mbc-node-select'.
 */

import { useState, useEffect } from 'react';

const LS_KEY     = 'mbc_selected_node';
const EVENT_NAME = 'mbc-node-select';

const NODES = [
    { id: 1, label: 'Nodo 1 — P1-ZARANDA', addr: '33190' },
    { id: 2, label: 'Nodo 2 — P2-ZARANDA', addr: '33191' },
    { id: 3, label: 'Nodo 3 — P3-ZARANDA', addr: '33192' },
    { id: 4, label: 'Nodo 4 — P4-ZARANDA', addr: '33193' },
];

function getStoredNode(): number {
    try { return parseInt(localStorage.getItem(LS_KEY) || '1', 10); } catch { return 1; }
}

export default function NodeSelector() {
    const [selected, setSelected] = useState<number>(getStoredNode);

    // Escuchar cambios de otros componentes (cards)
    useEffect(() => {
        const handler = (e: Event) => {
            setSelected((e as CustomEvent<number>).detail);
        };
        window.addEventListener(EVENT_NAME, handler);
        return () => window.removeEventListener(EVENT_NAME, handler);
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const id = parseInt(e.target.value, 10);
        setSelected(id);
        localStorage.setItem(LS_KEY, String(id));
        window.dispatchEvent(new CustomEvent<number>(EVENT_NAME, { detail: id }));
    };

    const node = NODES.find(n => n.id === selected)!;

    return (
        <div style={{
            display:        'flex',
            alignItems:     'center',
            gap:            '10px',
            padding:        '10px 16px',
            backgroundColor: 'rgba(6,182,212,0.06)',
            border:          '1px solid rgba(6,182,212,0.2)',
            borderRadius:    '10px',
            marginBottom:    '16px',
        }}>
            <span style={{ color: '#9ca3af', fontSize: '12px', whiteSpace: 'nowrap', fontWeight: 500 }}>
                Nodo activo
            </span>

            <select
                value={selected}
                onChange={handleChange}
                style={{
                    flex:             1,
                    backgroundColor:  '#1a1a1e',
                    border:           '1px solid rgba(6,182,212,0.3)',
                    borderRadius:     '6px',
                    color:            '#fff',
                    fontSize:         '13px',
                    padding:          '6px 10px',
                    cursor:           'pointer',
                    outline:          'none',
                    fontFamily:       'inherit',
                }}
            >
                {NODES.map(n => (
                    <option key={n.id} value={n.id}>{n.label}</option>
                ))}
            </select>

            <span style={{
                fontSize:         '10px',
                padding:          '2px 8px',
                borderRadius:     '9999px',
                backgroundColor:  'rgba(6,182,212,0.15)',
                color:            '#06b6d4',
                border:           '1px solid rgba(6,182,212,0.35)',
                fontFamily:       'monospace',
                whiteSpace:       'nowrap',
            }}>
                #{node.addr}
            </span>
        </div>
    );
}
