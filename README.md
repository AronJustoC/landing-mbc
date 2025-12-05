# Landing MBC - Fast Fusion

![Astro](https://img.shields.io/badge/Astro-5.16.4-BC52EE?style=flat-square&logo=astro)
![Tailwind](https://img.shields.io/badge/Tailwind-4.1.17-06B6D4?style=flat-square&logo=tailwindcss)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0.0-3178C6?style=flat-square&logo=typescript)

> Landing page moderna y responsiva para MBC construida con Astro y Tailwind CSS

## 🚀 Características

- ⚡ **Rendimiento Optimizado** - Construido con Astro 5 para carga ultrarrápida
- 🎨 **Diseño Moderno** - Interfaz elegante con animaciones fluidas y efectos visuales
- 📱 **Totalmente Responsivo** - Adaptado perfectamente a todos los dispositivos
- 🔷 **Tema Azul Eléctrico** - Diseño futurista con acentos de color cyan/azul eléctrico
- ♿ **SEO Optimizado** - Mejorado para motores de búsqueda
- 🌙 **Modo Oscuro** - Interfaz elegante con tema oscuro

## 📁 Estructura del Proyecto

```text
landing-mbc/
├── public/                     # Archivos estáticos públicos
│   ├── favicon.svg            # Icono del sitio
│   └── ...                   # Otros assets públicos
├── src/                      # Código fuente principal
│   ├── assets/              # Recursos y archivos estáticos
│   │   ├── astro.svg        # Logo de Astro
│   │   └── background.svg   # Imágenes de fondo
│   ├── components/          # Componentes de Astro
│   │   ├── Welcome.astro    # Componente de bienvenida principal
│   │   ├── header.astro     # Navegación principal
│   │   ├── hero.astro       # Sección hero
│   │   ├── testimonial.astro # Sección de testimonios
│   │   └── footer.astro     # Pie de página mejorado
│   ├── layouts/             # Layouts base
│   │   └── Layout.astro     # Layout principal del sitio
│   ├── pages/               # Páginas de Astro
│   │   └── index.astro      # Página principal
│   └── styles/              # Hojas de estilo
│       └── global.css       # Estilos globales personalizados
├── astro.config.mjs         # Configuración de Astro
├── package.json             # Dependencias y scripts
├── tsconfig.json           # Configuración de TypeScript
└── .gitignore              # Archivos ignorados por Git
```

## 🛠️ Stack Tecnológico

- **Framework**: [Astro](https://astro.build/) - El framework web moderno
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) - Framework de utilidades CSS
- **Icons**: [Astro Icon](https://github.com/natemoo-re/astro-icon) con Lucide Icons
- **Language**: TypeScript para type safety

## 📦 Scripts Disponibles

| Comando             | Acción                                            |
| :------------------ | :------------------------------------------------ |
| `npm install`       | Instala todas las dependencias                    |
| `npm run dev`       | Inicia servidor de desarrollo en `localhost:4321` |
| `npm run build`     | Construye el sitio para producción en `./dist/`   |
| `npm run preview`   | Previsualiza la build localmente                  |
| `npm run astro ...` | Ejecuta comandos CLI de Astro                     |

## 🚀 Comenzando

### Prerrequisitos

- Node.js 18+
- npm, yarn, o pnpm

### Instalación

1. Clona el repositorio:

```bash
git clone https://github.com/AronJustoC/landing-mbc.git
cd landing-mbc
```

2. Instala las dependencias:

```bash
npm install
```

3. Inicia el servidor de desarrollo:

```bash
npm run dev
```

4. Abre [http://localhost:4321](http://localhost:4321) en tu navegador

### Construcción para Producción

1. Construye el sitio:

```bash
npm run build
```

2. Previsualiza localmente:

```bash
npm run preview
```

## 🎨 Características del Diseño

### Componentes Principales

1. **Header (`header.astro`)**
   - Navegación fija con efectos de scroll
   - Logo animado
   - Links de navegación con hover effects
   - Botón CTA con gradientes

2. **Welcome (`Welcome.astro`)**
   - Sección hero con título destacado
   - Descripción animada
   - Llamada a la acción prominente

3. **Footer (`footer.astro`)**
   - Diseño de 4 columnas responsivo
   - Información de contacto con iconos
   - Links organizados (Empresa, Servicios, Legal)
   - Redes sociales con efectos glassmorphism
   - Botón de login con animación de luz
   - Gradiente oscuro elegante con patrón sutil

### Tema y Estilos

- **Colores Principales**:
  - Azul eléctrico: `#00d4ff`
  - Azul oscuro: `#0099cc`
  - Fondo gradiente: `#0a0a0c` → `#1a1f2e`
  - Textos: Grises claros para mejor legibilidad

- **Animaciones**:
  - Entrada escalonada con scroll reveal
  - Efectos hover en todos los elementos interactivos
  - Transiciones suaves con cubic-bezier
  - Efectos de brillo y resplandor

## 🌟 Mejores Prácticas

- ✅ Código TypeScript para type safety
- ✅ Componentes modulares y reutilizables
- ✅ SEO optimizado con meta tags apropiadas
- ✅ Performance optimizado con island architecture de Astro
- ✅ Diseño responsive con mobile-first
- ✅ Accesibilidad web (WCAG)

## 🚀 Despliegue

El proyecto está listo para desplegar en:

- **Vercel** (Recomendado)
- **Netlify**
- **Cloudflare Pages**
- **GitHub Pages**
- Cualquier hosting estático

Para desplegar, simplemente construye el proyecto y sube la carpeta `dist/` a tu plataforma preferida.

## 🤝 Contribuir

1. Fork el proyecto
2. Crea tu feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT - mira el archivo [LICENSE](LICENSE) para más detalles.

## 👨‍💻 Autor

- **Aron Justo** - _Trabajo inicial_ - [AronJustoC](https://github.com/AronJustoC)

## 🙏 Agradecimientos

- [Astro](https://astro.build/) - Framework web increíblemente rápido
- [Tailwind CSS](https://tailwindcss.com/) - Framework CSS de primera clase
- [Lucide](https://lucide.dev/) - Iconos hermosos y consistentes

---

⭐ Si este proyecto te ayudó, por favor dale una estrella en GitHub!
