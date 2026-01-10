
export interface ServiceData {
    id: string;
    title: string;
    name?: string; // Backwards compatibility for header
    shortDescription: string;
    description?: string; // Backwards compatibility for header
    fullDescription: string;
    benefits: string[];
    features: string[];
    imagePrompt: string;
    icon?: string; // Icon name for header
}

export const services: ServiceData[] = [
    {
        id: "mantenimiento-predictivo",
        title: "Mantenimiento Predictivo",
        shortDescription: "Monitoreo de condición especializado para predecir fallas antes de que ocurran.",
        fullDescription: "Nuestro servicio de Mantenimiento Predictivo utiliza tecnologías de vanguardia para monitorear la salud de sus activos en tiempo real. Detectamos anomalías incipientes antes de que se conviertan en fallas catastróficas, permitiéndole programar intervenciones solo cuando son estrictamente necesarias.",
        benefits: [
            "Reducción drástica de paradas no programadas.",
            "Optimización de costos de mantenimiento y repuestos.",
            "Extensión de la vida útil de los equipos.",
            "Mejora en la seguridad operativa."
        ],
        features: ["Análisis de Vibraciones ISO 18436", "Termografía Infrarroja", "Ultrasonido Acústico", "Análisis de Aceites"],
        imagePrompt: "Industrial predictive maintenance dashboard with futuristic holographic data visualization, showing vibration waves and heat maps over a heavy machinery engine, cyan and black color scheme, high tech, minimal."
    },
    {
        id: "ingenieria-confiabilidad",
        title: "Ingeniería de Confiabilidad",
        shortDescription: "Optimización de estrategias de mantenimiento basadas en datos precisos y riesgo.",
        fullDescription: "Transformamos la gestión de sus activos mediante metodologías probadas como RCM (Mantenimiento Centrado en Confiabilidad) y FMEA. Analizamos sus datos históricos y operativos para diseñar estrategias que maximicen la disponibilidad y minimicen el riesgo.",
        benefits: [
            "Aumento de la disponibilidad operativa (OEE).",
            "Reducción de riesgos y accidentes.",
            "Toma de decisiones basada en datos (Data-Driven).",
            "Alineación con normas ISO 55000."
        ],
        features: ["Análisis de Causa Raíz (RCA)", "Análisis de Weibull", "Optimización de Planes de Mantenimiento", "Gestión de Repuestos Críticos"],
        imagePrompt: "Reliability engineering concept, abstract visualization of interconnected nodes and stability graphs, blueprint style, blueprint grid in background, cyan glowing lines, industrial context."
    },
    {
        id: "analisis-dinamico",
        title: "Análisis Dinámico",
        shortDescription: "Diagnóstico Vibracional, Modal y Elementos Finitos.",
        fullDescription: "Un paso más allá del monitoreo tradicional. Realizamos estudios profundos de la dinámica de sus estructuras y máquinas, identificando resonancias, frecuencias naturales y modos de vibración que podrían causar fatiga estructural.",
        benefits: [
            "Solución definitiva a problemas crónicos de vibración.",
            "Validación de diseños estructurales.",
            "Prevención de fallas por fatiga.",
            "Aseguramiento de la integridad estructural."
        ],
        features: ["Análisis Modal Operacional (OMA)", "ODS (Operational Deflection Shapes)", "Simulación de Elementos Finitos (FEM)", "Pruebas de Impacto (Bump Test)"],
        imagePrompt: "Dynamic analysis simulation, 3D wireframe mesh of a mechanical part vibrating with colorful stress zones (cyan and blue), dark background, scientific and precise look."
    },
    {
        id: "evaluacion-estructural",
        title: "Evaluación Estructural",
        shortDescription: "Análisis profundo de integridad en infraestructura industrial.",
        fullDescription: "Evaluamos la salud estructural de sus instalaciones críticas (chutes, tolvas, naves industriales) utilizando técnicas no destructivas y modelamiento avanzado. Garantizamos que sus estructuras soporten las cargas operativas de manera segura.",
        benefits: [
            "Garantía de seguridad estructural.",
            "Cumplimiento normativo y legal.",
            "Extensión de vida útil de infraestructura antigua.",
            "Planes de refuerzo optimizados."
        ],
        features: ["Extensometría (Strain Gauges)", "Inspección Visual Especializada", "Cálculo de Cargas y Esfuerzos", "Monitoreo de Grietas"],
        imagePrompt: "Structural integrity scanning, laser grid scanning a large industrial metal structure, highlighting stress points in cyan, night industrial setting, cybernetic aesthetic."
    },
    {
        id: "monitoreo-activos",
        title: "Monitoreo de Activos",
        shortDescription: "Seguimiento continuo 24/7 en tiempo real.",
        fullDescription: "Implementamos sistemas de monitoreo continuo (online) que vigilan sus activos más críticos 24/7. Reciba alertas instantáneas en su celular o centro de control ante cualquier desviación de los parámetros normales de operación.",
        benefits: [
            "Vigilancia ininterrumpida 24/7.",
            "Alertas tempranas automáticas.",
            "Acceso remoto a la condición de la máquina.",
            "Integración con sistemas SCADA/DCS."
        ],
        features: ["Sensores IoT Industriales", "Sistemas de Protección de Maquinaria", "Tableros de Control en Nube", "Informes Automatizados"],
        imagePrompt: "Asset monitoring center, multiple screens displaying real-time graphs and machinery status in cyan and dark blue interface, futuristic control room, depth of field."
    },
    {
        id: "soporte-tecnico",
        title: "Soporte Técnico",
        shortDescription: "Asistencia experta y consultoría de alto nivel.",
        fullDescription: "Ponemos a su disposición nuestro equipo de ingenieros certificados para resolver problemas complejos en campo. Desde el comisionamiento de nuevas plantas hasta la resolución de crisis operativas.",
        benefits: [
            "Respaldo de expertos certificados.",
            "Solución rápida a emergencias.",
            "Transferencia de conocimiento a su equipo.",
            "Imparcialidad técnica."
        ],
        features: ["Asistencia en Paradas de Planta", "Comisionamiento de Equipos", "Auditorías de Mantenimiento", "Capacitación In-House"],
        imagePrompt: "Technical support engineers in field, silhouettes of engineers with safety helmets looking at a holographic tablet with technical data, industrial background, cinematic lighting, cyan highlights."
    }
];
