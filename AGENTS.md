# AGENTS.md - Project Intelligence & Guidelines

Welcome, Agent. This repository is **Landing MBC - Fast Fusion**, a high-performance landing page for a predictive maintenance and engineering firm. It is built with **Astro 5**, **Tailwind CSS 4**, and **TypeScript**.

As an agent operating here, you MUST follow these standards to maintain the architecture's integrity and performance.

---

## 🚀 Tech Stack & Core Commands

| Technology           | Role                                                  |
| :------------------- | :---------------------------------------------------- |
| **Astro 5.x**        | Web Framework (SSR mode for Vercel)                   |
| **Tailwind CSS 4.x** | Styling (using `@tailwindcss/vite` plugin)            |
| **TypeScript**       | Strict type safety (extends `astro/tsconfigs/strict`) |
| **Astro Icon**       | Icon management (Lucide & Simple Icons)               |
| **Nodemailer**       | Server-side email handling                            |

### Essential Commands

- **Development**: `npm run dev` (Starts Astro dev server at `localhost:4321`)
- **Build**: `npm run build` (Production build targeting `./dist/`)
- **Preview**: `npm run preview` (Local preview of the production build)
- **Astro CLI**: `npm run astro [command]` (Astro-specific operations)

_Note: There is currently no testing framework configured. If adding logic-heavy modules, propose Vitest integration._

---

## 📁 Directory Structure & Responsibilities

- `src/assets/`: Static resources (SVG logos, background images).
- `src/components/`: Reusable Astro components.
- `src/components/shareComponents/`: Shared/Common UI elements (e.g., WhatsApp button).
- `src/consts/`: Data single-source-of-truth (SSOT) and Type/Interface definitions.
- `src/layouts/`: Base page structures (e.g., `Layout.astro`).
- `src/pages/`: Routing. Supports both `.astro` pages and `.ts` API routes.
- `src/styles/`: Global CSS and Tailwind directives.

---

## 🛠️ Code Style & Engineering Standards

### 0. Development Workflow

- **Branching**: Use descriptive branch names like `feat/feature-name` or `fix/bug-name`.
- **Commits**: Follow Conventional Commits (e.g., `feat: add contact form`, `fix: header mobile alignment`).
- **Review**: Before finalizing any task, run `npm run build` to ensure Astro's build-time type checking and optimization pass without errors.

### 1. Component Architecture (Astro)

- **Naming**: Use **PascalCase** for all new components (e.g., `ServiceCard.astro`). Existing lowercase components (`header.astro`) are legacy; prefer PascalCase for consistency.
- **Frontmatter**: Keep logic in the `---` block clean. Destructure `Astro.props` early.
- **Props**: Every component MUST have a `Props` interface defined in the frontmatter.
- **Modularity**: If a component exceeds 300 lines, extract sub-components into the same directory or a relevant sub-folder.

```astro
---
interface Props {
  title: string;
  count?: number;
}
const { title, count = 0 } = Astro.props;
---
<div class="card">
  <h2>{title}</h2>
  {count > 0 && <span class="badge">{count}</span>}
</div>
```

### 2. TypeScript Guidelines

- **Strictness**: Follow `astro/tsconfigs/strict`. No `any`, no `@ts-ignore`.
- **Data Modeling**: Define shared interfaces in `src/consts/` files to ensure synchronization between components and API routes.
- **Utility Types**: Leverage TypeScript's utility types (`Pick`, `Omit`, `Partial`) to avoid interface duplication.
- **API Routes**: Explicitly type API route handlers using `APIRoute` from `astro`.

### 3. Styling with Tailwind CSS 4

- **Tailwind 4**: We use the Vite-integrated version. Do not look for `tailwind.config.js`; configuration is handled via CSS variables and Vite plugins.
- **Utilities First**: Avoid writing custom CSS in `<style>` tags unless absolutely necessary for complex animations or third-party overrides.
- **Class Merging**: If dynamic classes are needed, consider using a `cn()` utility (though not currently present, it's a recommended pattern for future growth).
- **Responsive Design**: Always use mobile-first breakpoints (`md:`, `lg:`, etc.).
- **Design Tokens**: Follow the electric blue theme (`#31B0FF`) for highlights and dark backgrounds (`#0a0a0c`) for sections.

### 4. Data & State Management

- **Stateless by Default**: Leverage Astro's "Islands Architecture". Most components should be static HTML.
- **Client Directives**: Use `client:load` or `client:visible` only when interactivity is strictly necessary.
- **External Data**: Store content (services, team, testimonials) in `src/consts/*.ts` files. This makes it easy to update copy without touching UI code.
- **Server Logic**: Use `src/pages/api/` for forms and integrations. Ensure proper `try/catch` blocks and return standard JSON responses with appropriate HTTP status codes.
- **Validation**: Validate incoming request data in API routes before processing.

### 5. Icons & Media

- **Icons**: Use the `<Icon />` component from `astro-icon/components`.
- **Icon Sets**: Prefer `lucide:*` for UI actions and `simple-icons:*` for brand logos.
- **Images**: Use standard `<img>` tags or Astro's Image component (ensure `astro:assets` is configured if needed).

---

## 🛠️ Common Workflows

### Adding a New Service

1. **Define Data**: Update `src/consts/services.ts`. Add a new entry to the `services` array following the `ServiceData` interface.
2. **Assign Slug**: Ensure the `id` is a kebab-case slug that matches the intended URL.
3. **Verify Routing**: Check `src/pages/servicios/[slug].astro` to ensure it correctly pulls the data by ID.
4. **Update Sitemap**: Verify that `src/pages/sitemap.xml.ts` includes the new service automatically.

### Modifying the Navigation

1. **Desktop Menu**: Modify `src/components/header.astro`. Note the multi-column "Mega Menu" logic for services.
2. **Mobile Menu**: Ensure changes are reflected in the `mobile-menu` div within the same file.
3. **Active States**: Use the `isLinkActive` helper function to maintain consistent highlighting.

### API Integrations

1. **Endpoint**: Create a new `.ts` file in `src/pages/api/`.
2. **Server-side**: Always export `const prerender = false` for dynamic API endpoints.
3. **Secrets**: Use `RECAPTCHA_SECRET_KEY` or `SMTP_PASS` from `.env` via `import.meta.env`.

---

## 🧪 Testing & Verification

Since there is no automated test suite (Vitest/Jest) currently configured, you MUST verify changes manually:

1. **Build Check**: Always run `npm run build` after structural changes. Astro's compiler will catch broken imports, type mismatches in components, and routing issues.
2. **Responsive Check**: Verify that any new UI component works on mobile (`sm:`), tablet (`md:`), and desktop (`lg:`).
3. **Link Integrity**: If you modify `src/consts/services.ts`, ensure that all generated links in the navigation and sitemap remain valid.
4. **Form Testing**: For API changes in `src/pages/api/`, use `curl` or a REST client to verify the endpoint (remember to mock the reCAPTCHA token if necessary during local testing).

---

## ⚠️ Critical Rules for Agents

1. **No Refactoring during Fixes**: If you are fixing a bug, do not rename files or change the component structure unless required for the fix.
2. **Environment Variables**: Never hardcode secrets. Access them via `import.meta.env.VARIABLE_NAME`.
3. **SEO & Accessibility**: Always include `alt` tags for images and appropriate `aria-label` for interactive elements.
4. **Performance**: Avoid adding heavy client-side JavaScript. Use Astro's server-side rendering whenever possible.
5. **Internationalization**: The primary language is Spanish (`es`). Ensure all UI strings follow this.

---

## 📝 Change Log & Evolution

- **v1.0.0**: Initial AGENTS.md creation based on Astro 5 / Tailwind 4 stack analysis.

_Agent Note: If you find a pattern not documented here that is consistently used, update this file._
