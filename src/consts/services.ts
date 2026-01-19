
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
}

export const services: ServiceData[] = [
    {
        id: "analisis-dinamico-estructural",
        title: "Análisis Dinámico Estructural",
        href: "/servicios/analisis-dinamico-estructural",
        shortDescription: "Estudios avanzados de dinámica estructural: OMA, ODS y análisis modal.",
        fullDescription: "Realizamos estudios profundos de la dinámica de estructuras y maquinaria para identificar resonancias, frecuencias naturales y modos de vibración que podrían causar fatiga estructural o fallas prematuras. Nuestro enfoque combina mediciones de campo con análisis avanzados para resolver problemas crónicos de vibración.",
        benefits: [
            "Identificación precisa de frecuencias naturales y modos de vibración.",
            "Solución definitiva a problemas crónicos de vibración.",
            "Validación de comportamiento dinámico ante cargas operativas.",
            "Prevención de fallas por fatiga y resonancia."
        ],
        features: [
            "Análisis Modal Operacional (OMA)",
            "ODS (Operational Deflection Shapes)",
            "Pruebas de Impacto (Bump Test)",
            "Análisis de Respuesta Transitoria",
            "Correlación Test-Modelo"
        ],
        imagePrompt: "Dynamic structural analysis, 3D wireframe mesh of industrial structure vibrating with colorful stress zones in cyan and blue, mode shapes visualization, dark background, scientific and precise engineering look."
    },
    {
        id: "evaluacion-estructural",
        title: "Evaluación Estructural",
        href: "/servicios/evaluacion-estructural",
        shortDescription: "Análisis de integridad estructural con extensometría y ensayos no destructivos.",
        fullDescription: "Evaluamos la salud estructural de instalaciones críticas utilizando técnicas avanzadas como extensometría (strain gauges), inspección por ultrasonido y análisis de tensiones. Garantizamos que sus estructuras soporten las cargas operativas de manera segura y cumplan con los estándares normativos.",
        benefits: [
            "Medición directa de deformaciones y esfuerzos reales.",
            "Garantía de seguridad estructural certificada.",
            "Cumplimiento de normativas internacionales.",
            "Planes de refuerzo optimizados basados en datos."
        ],
        features: [
            "Extensometría (Strain Gauges)",
            "Análisis de Tensiones en Campo",
            "Inspección por Ultrasonido (UT)",
            "Evaluación de Fatiga Estructural",
            "Medición de Esfuerzos Residuales"
        ],
        imagePrompt: "Structural evaluation with strain gauges, industrial steel structure with sensors attached, data visualization overlays showing stress and strain measurements in cyan, professional engineering setting."
    },
    {
        id: "simulacion-fem",
        title: "Simulación FEM",
        href: "/servicios/simulacion-fem",
        shortDescription: "Modelado y simulación por elementos finitos para análisis estructural y dinámico.",
        fullDescription: "Aplicamos el Método de Elementos Finitos (FEM) para simular el comportamiento de estructuras y componentes bajo diversas condiciones de carga. Desde análisis estáticos hasta dinámicos, nuestras simulaciones permiten validar diseños, optimizar geometrías y predecir puntos críticos antes de la fabricación.",
        benefits: [
            "Validación virtual de diseños antes de fabricación.",
            "Optimización de peso y resistencia de componentes.",
            "Predicción de puntos de falla y concentración de esfuerzos.",
            "Reducción de costos de prototipado físico."
        ],
        features: [
            "Análisis Estático Lineal y No Lineal",
            "Análisis Modal y de Frecuencias",
            "Análisis Dinámico Transitorio",
            "Análisis de Fatiga y Vida Útil",
            "Optimización Topológica"
        ],
        imagePrompt: "FEM simulation visualization, 3D mesh of mechanical component with stress gradients in cyan blue color spectrum, finite element mesh visible, engineering software interface aesthetic, dark professional background."
    },
    {
        id: "monitoreo-activos",
        title: "Monitoreo de Activos",
        href: "/servicios/monitoreo-activos",
        shortDescription: "Seguimiento continuo 24/7 de la condición de sus equipos críticos.",
        fullDescription: "Implementamos sistemas de monitoreo continuo (online) que vigilan sus activos más críticos las 24 horas del día, los 7 días de la semana. Reciba alertas instantáneas ante cualquier desviación de los parámetros normales de operación, permitiendo decisiones proactivas de mantenimiento.",
        benefits: [
            "Vigilancia ininterrumpida 24/7 de equipos críticos.",
            "Alertas tempranas automáticas vía SMS, email o app.",
            "Acceso remoto a la condición de máquinas desde cualquier lugar.",
            "Integración con sistemas SCADA/DCS existentes."
        ],
        features: [
            "Sensores IoT Industriales",
            "Sistemas de Protección de Maquinaria",
            "Dashboards en Nube Personalizados",
            "Análisis de Tendencias Automatizado",
            "Informes de Condición Periódicos"
        ],
        imagePrompt: "Asset monitoring center, multiple screens displaying real-time graphs and machinery status in cyan and dark blue interface, industrial IoT sensors connected, futuristic control room aesthetic."
    },
    {
        id: "ingenieria-confiabilidad",
        title: "Ingeniería de Confiabilidad",
        href: "/servicios/ingenieria-confiabilidad",
        shortDescription: "Optimización de estrategias de mantenimiento basadas en datos y análisis de riesgo.",
        fullDescription: "Transformamos la gestión de sus activos mediante metodologías probadas como RCM (Mantenimiento Centrado en Confiabilidad), FMEA y análisis de causa raíz. Analizamos datos históricos y operativos para diseñar estrategias que maximicen la disponibilidad y minimicen el riesgo operacional.",
        benefits: [
            "Aumento significativo de la disponibilidad operativa (OEE).",
            "Reducción de riesgos operacionales y accidentes.",
            "Toma de decisiones basada en datos (Data-Driven).",
            "Alineación con normas ISO 55000 de gestión de activos."
        ],
        features: [
            "Análisis de Causa Raíz (RCA)",
            "Análisis de Weibull y Vida Útil",
            "Implementación de RCM y FMEA",
            "Optimización de Planes de Mantenimiento",
            "Gestión de Repuestos Críticos"
        ],
        imagePrompt: "Reliability engineering concept, abstract visualization of interconnected nodes and reliability graphs, Weibull curves, blueprint style grid in background, cyan glowing lines, industrial data analytics context."
    },
    {
        id: "soporte-tecnico",
        title: "Soporte Técnico",
        href: "/servicios/soporte-tecnico",
        shortDescription: "Asistencia experta en campo y consultoría especializada de alto nivel.",
        fullDescription: "Ponemos a su disposición nuestro equipo de ingenieros certificados para resolver problemas complejos en campo. Desde el comisionamiento de nuevas instalaciones hasta la resolución de crisis operativas, brindamos respaldo técnico imparcial y de alta calidad.",
        benefits: [
            "Respaldo de ingenieros certificados internacionalmente.",
            "Solución rápida y efectiva a emergencias operativas.",
            "Transferencia de conocimiento a su equipo técnico.",
            "Opinión técnica imparcial e independiente."
        ],
        features: [
            "Asistencia en Paradas de Planta",
            "Comisionamiento de Equipos Rotativos",
            "Auditorías de Programas de Mantenimiento",
            "Capacitación In-House Certificada",
            "Consultoría de Segundo Nivel"
        ],
        imagePrompt: "Technical support engineers in field, engineers with safety helmets analyzing holographic technical data on tablets, industrial plant background, professional lighting with cyan technology highlights."
    }
];
