
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
    icon?: string; // Icon name for header
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
    imageAlt?: string;
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
        metaTitle: "Análisis Dinámico Estructural (OMA/ODS/FEA) | MBC Predictive",
        metaDescription: "Servicios de Análisis Modal Operacional, ODS y Elementos Finitos. Identificamos resonancias y prevenimos fallas estructurales en maquinaria.",
        keywords: ["OMA", "ODS", "FEA", "Análisis Modal", "Vibraciones Estructurales"],
        imageAlt: "Representación digital de análisis estructural dinámico con malla de elementos finitos"
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
        metaTitle: "Análisis de Vibraciones y Diagnóstico | MBC Predictive",
        metaDescription: "Diagnóstico experto de vibraciones en maquinaria rotativa. Detección de desbalance, desalineación y fallas en rodamientos.",
        keywords: ["Análisis Vibratorio", "Balanceo Dinámico", "Mantenimiento Predictivo", "Vibraciones Mecánicas"],
        imageAlt: "Espectro de forma de onda de análisis vibratorio en monitor"
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
        metaTitle: "Monitoreo de Condición y Salud de Activos | MBC Predictive",
        metaDescription: "Seguimiento continuo de parámetros vibratorios y deformaciones. Detecte fallas antes de que ocurran con nuestro sistema de monitoreo.",
        keywords: ["Monitoreo de Condición", "Salud de Activos", "Sensores IoT", "Mantenimiento 4.0"],
        imageAlt: "Panel de control con gráficos de monitoreo de condición en tiempo real"
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
        metaTitle: "Ensayos No Destructivos (END) e Integridad | MBC Predictive",
        metaDescription: "Inspección de integridad estructural mediante ultrasonido, partículas magnéticas y líquidos penetrantes. Detección de grietas y corrosión.",
        keywords: ["Ensayos No Destructivos", "END", "Ultrasonido", "Inspección Estructural", "Corrosión"],
        imageAlt: "Inspector realizando pruebas no destructivas en estructura metálica"
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
        metaTitle: "Ingeniería de Confiabilidad y Mantenimiento RCM | MBC Predictive",
        metaDescription: "Optimice su mantenimiento con RCM y análisis de causa raíz (RCA). Estrategias basadas en datos para maximizar la disponibilidad.",
        keywords: ["Ingeniería de Confiabilidad", "RCM", "Análisis Causa Raíz", "Gestión de Activos"],
        imageAlt: "Gráficos estadísticos de ingeniería de confiabilidad y análisis de riesgo"
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
        metaTitle: "Monitoreo de Zarandas Vibratorias y KPIs | MBC Predictive",
        metaDescription: "Control en tiempo real de Stroke, aceleración G y RPM en zarandas. Optimice la clasificación y prevenga daños estructurales.",
        keywords: ["Zarandas Vibratorias", "Monitoreo Zarandas", "Stroke", "Aceleración G", "Minería"],
        imageAlt: "Sistema de monitoreo digital instalado en zaranda vibratoria industrial"
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
        metaTitle: "Estudio FRF y Pruebas de Impacto | MBC Predictive",
        metaDescription: "Determinación de Funciones de Respuesta en Frecuencia (FRF), rigidez dinámica y amortiguamiento mediante pruebas de impacto.",
        keywords: ["FRF", "Función Respuesta Frecuencia", "Rigidez Dinámica", "Pruebas de Impacto", "Modal Testing"],
        imageAlt: "Gráfico de función de respuesta en frecuencia (FRF) mostrando picos de resonancia"
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
        metaTitle: "Medición de Vibraciones Cuerpo Entero ISO 2631 | MBC Predictive",
        metaDescription: "Evaluación de exposición humana a vibraciones según ISO 2631. Proteja la salud ocupacional midiendo vibración mano-brazo y cuerpo entero.",
        keywords: ["ISO 2631", "Vibración Cuerpo Entero", "Vibración Mano Brazo", "Salud Ocupacional", "Higiene Industrial"],
        imageAlt: "Esquema de análisis de exposición humana a vibraciones en operador de maquinaria"
    }
];
