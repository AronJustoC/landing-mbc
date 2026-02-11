
export interface ServiceData {
    id: string;
    title: string;
    name?: string; // Backwards compatibility for header
    href: string; // Link to the service page
    shortDescription: string;
    description?: string; // Backwards compatibility for header
    fullDescription: string;
    benefits: string[];
    features: string[];
    imagePrompt: string;
    icon: string;
}

export const services: ServiceData[] = [
    {
        id: "analisis-dinamico-estructural",
        title: "Análisis Dinámico Estructural",
        href: "/servicios/analisis-dinamico-estructural",
        shortDescription: "Analisis Modal Operacional (OMA), Analisis de Deflexión Operativa (ODS), Estudio de Elementos Finitos (FEA) y Medición de Deformaciones.",
        fullDescription: "Realizamos estudios profundos de la dinámica de estructuras y maquinaria para identificar resonancias, frecuencias naturales y modos de vibración que podrían causar fatiga estructural o fallas prematuras. Combina OMA, ODS y FEA para una solución integral.",
        benefits: [
            "Identificación precisa de frecuencias naturales.",
            "Solución a problemas crónicos de vibración.",
            "Validación de comportamiento dinámico.",
            "Prevención de fallas por fatiga."
        ],
        features: [
            "Análisis Modal Operacional (OMA)",
            "ODS (Operational Deflection Shapes)",
            "Estudio de Elementos Finitos (FEA)",
            "Medición de Deformaciones"
        ],
        imagePrompt: "Dynamic structural analysis wireframe",
        icon: "lucide:waves"
    },
    {
        id: "analisis-vibratorio",
        title: "Análisis Vibratorio",
        href: "/servicios/analisis-vibratorio",
        shortDescription: "Diagnostico Vibratorio Estructural y Equipos Rotativos.",
        fullDescription: "Diagnóstico experto de problemas vibratorios en estructuras y maquinaria rotativa. Identificamos desbalance, desalineación, holguras y problemas estructurales mediante análisis espectral avanzado.",
        benefits: [
            "Detección temprana de fallas mecánicas.",
            "Reducción de paradas no programadas.",
            "Extensión de la vida útil de rodamientos.",
            "Diagnóstico preciso de la raíz del problema."
        ],
        features: [
            "Análisis Espectral de Vibraciones",
            "Diagnóstico de Equipos Rotativos",
            "Evaluación de Severidad Vibratoria",
            "Balanceo Dinámico en Sitio"
        ],
        imagePrompt: "Vibration analysis waveform spectrum",
        icon: "lucide:activity"
    },
    {
        id: "monitoreo-condicion",
        title: "Monitoreo de Condición",
        href: "/servicios/monitoreo-condicion",
        shortDescription: "Monitoreo de Parametros Vibratorio y Deformaciones.",
        fullDescription: "Seguimiento continuo de la salud de sus activos mediante el control de parámetros vibratorios y deformaciones. Detecte cambios sutiles antes de que se conviertan en fallas catastróficas.",
        benefits: [
            "Tendencias de evolución de fallas.",
            "Planificación optimizada de mantenimiento.",
            "Reducción de costos correctivos.",
            "Control total sobre la salud del activo."
        ],
        features: [
            "Tendencias de Vibración Global",
            "Monitoreo de Envolvente de Aceleración",
            "Control de Deformaciones Estáticas",
            "Alarmas Tempranas Configurables"
        ],
        imagePrompt: "Condition monitoring dashboard graphs",
        icon: "lucide:monitor-check"
    },
    {
        id: "inspeccion-integridad-estructural",
        title: "Inspección de Integridad Estructural",
        href: "/servicios/inspeccion-integridad-estructural",
        shortDescription: "Ensayos No Destructivos.",
        fullDescription: "Evaluación exhaustiva de la integridad de componentes y estructuras mediante Ensayos No Destructivos (END). Detectamos grietas, corrosión y defectos ocultos sin dañar el equipo.",
        benefits: [
            "Detección de defectos subsuperficiales.",
            "Aseguramiento de la calidad de soldaduras.",
            "Evaluación de corrosión y desgaste.",
            "Certificación de seguridad operativa."
        ],
        features: [
            "Ultrasonido (UT)",
            "Partículas Magnéticas (MT)",
            "Líquidos Penetrantes (PT)",
            "Inspección Visual Remota (RVI)"
        ],
        imagePrompt: "Nondestructive testing inspection",
        icon: "lucide:scan-eye"
    },
    {
        id: "ingenieria-confiabilidad",
        title: "Ingeniería de Confiabilidad",
        href: "/servicios/ingenieria-confiabilidad",
        shortDescription: "Optimización de estrategias de mantenimiento basadas en datos y riesgo.",
        fullDescription: "Transformamos la gestión de mantenimiento mediante el análisis de datos y riesgos. Diseñamos estrategias RCM y análisis de causa raíz para maximizar la disponibilidad y rentabilidad.",
        benefits: [
            "Planes de mantenimiento costo-efectivos.",
            "Reducción de recurrencia de fallas.",
            "Mejora del OEE (Eficiencia Global).",
            "Gestión de riesgos optimizada."
        ],
        features: [
            "Mantenimiento Centrado en Confiabilidad (RCM)",
            "Análisis de Causa Raíz (RCA)",
            "Análisis de Criticidad",
            "Optimización de Repuestos"
        ],
        imagePrompt: "Reliability engineering charts",
        icon: "lucide:shield-check"
    },
    {
        id: "monitoreo-kpis-zarandas",
        title: "Monitoreo de KPIs Dinamicos en Zarandas",
        href: "/servicios/monitoreo-kpis-zarandas",
        shortDescription: "Monitoreo en Línea de Parametros de Stroke, Aceleración G y RPM Operativo.",
        fullDescription: "Solución especializada para el monitoreo de zarandas vibratorias. Control en tiempo real de Stroke, aceleraciones G y RPM para asegurar una clasificación eficiente y prevenir daños estructurales.",
        benefits: [
            "Optimización de la eficiencia de cribado.",
            "Prevención de fracturas en cuerpos de zarandas.",
            "Control de operación dentro de diseño.",
            "Alerta de condiciones de resonancia."
        ],
        features: [
            "Medición de Stroke en Tiempo Real",
            "Monitoreo de Aceleración G",
            "Control de RPM y Fase",
            "Detección de Movimiento Irregular"
        ],
        imagePrompt: "Vibrating screen monitoring system",
        icon: "lucide:bar-chart-2"
    },
    {
        id: "estudio-frf",
        title: "Estudio de Función de Respuesta en Frecuencia",
        href: "/servicios/estudio-frf",
        shortDescription: "Extracción de parametros modales FRF, Rigidez y Amortiguamiento.",
        fullDescription: "Pruebas experimentales para determinar las Funciones de Respuesta en Frecuencia (FRF) de sistemas mecánicos. Obtenemos parámetros clave como rigidez dinámica, masa aparente y amortiguamiento.",
        benefits: [
            "Caracterización dinámica precisa.",
            "Validación de modelos matemáticos.",
            "Solución a problemas de resonancia.",
            "Diseño de absorbedores dinámicos."
        ],
        features: [
            "Pruebas de Impacto Instrumentadas",
            "Excitación con Shaker Electrodinámico",
            "Cálculo de Rigidez Dinámica",
            "Estimación de Amortiguamiento Modal"
        ],
        imagePrompt: "Frequency response function graph",
        icon: "lucide:audio-waveform"
    },
    {
        id: "exposicion-humana",
        title: "Monitoreo y Evaluación de Exposición Humana a Vibraciones – ISO 2631",
        href: "/servicios/exposicion-humana",
        shortDescription: "Análisis de Exposición, Identificación de Condiciones Críticas del Cuerpo Humano.",
        fullDescription: "Evaluación de vibraciones de cuerpo entero y mano-brazo según normativa ISO 2631. Protegemos la salud ocupacional de los operadores identificando condiciones críticas de exposición.",
        benefits: [
            "Cumplimiento normativo ISO 2631.",
            "Protección de la salud del operador.",
            "Reducción de fatiga laboral.",
            "Prevención de enfermedades profesionales."
        ],
        features: [
            "Medición de Vibración Cuerpo Entero",
            "Medición de Vibración Mano-Brazo",
            "Cálculo de Dosis Diaria A(8)",
            "Mapas de Riesgo Vibratorio"
        ],
        imagePrompt: "Human vibration exposure analysis",
        icon: "lucide:user-check"
    }
];
