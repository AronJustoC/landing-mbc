# UI/UX Refactor "Promax" - Landing MBC

## TL;DR

> **Quick Summary**: Refactor the current landing page to achieve a "Promax" UI/UX level, unifying the design system, enhancing animations, and improving layout flow (Bento Grids) without modifying original texts or losing the industrial/maintenance identity.
> 
> **Deliverables**:
> - Centralized Design System in `global.css`.
> - Unified Scroll-Reveal Animation System.
> - Modern Bento Grid layout for Services.
> - Premium Hover Effects and Glassmorphism.
> - Astro View Transitions integration.
> 
> **Estimated Effort**: Medium
> **Parallel Execution**: YES - 2 waves
> **Critical Path**: Design System → Component Refactor → Integration

---

## Context

### Original Request
"quiero que usando las skill necesarias sin modificar textos no nada mejores elos estilo usa ui ux promax skill de ni tenerlo instala lo haz un refactor de todo mejorando sin perder la apariecia orifinal ni los texto solo mejora la pagina relacioand a ui ux"

### Interview Summary
**Key Discussions**:
- **Aesthetic**: Maintain the industrial/predictive maintenance vibe (mines, ports, vibration analysis).
- **Animation**: Subtle and fluid.
- **Structural Changes**: Allowed for better flow (UX), provided texts are preserved.

**Research Findings**:
- Current tech: Astro 5, Tailwind 4.
- Hardcoded colors (#31B0FF, #08080A) found throughout the components.
- Duplicated animation logic in `hero.astro` and `services.astro`.

### Metis Review
**Identified Gaps** (addressed):
- **Unification**: Styles and animations are fragmented.
- **Performance**: High use of backdrop-blur and radial-gradients can be optimized.
- **Consistency**: Hardcoded values make future changes difficult.

---

## Work Objectives

### Core Objective
Transform the landing page into a premium industrial interface with modern UI/UX patterns, high consistency, and fluid interactions.

### Concrete Deliverables
- `src/styles/global.css`: Updated with comprehensive Tailwind 4 theme variables.
- `src/components/AnimateItem.astro`: New shared component for scroll-reveal logic.
- `src/layouts/Layout.astro`: Enabled View Transitions and centralized metadata.
- `src/components/services.astro`: Refactored into a Bento Grid layout.
- `src/components/hero/`: Refactored Hero sub-components for better hierarchy.

### Definition of Done
- [ ] `npm run build` completes without errors.
- [ ] No original texts have been modified.
- [ ] All sections reveal smoothly on scroll.
- [ ] Layout is fully responsive (mobile, tablet, desktop).

### Must Have
- Electric Blue (#31B0FF) as primary accent.
- Deep Dark (#08080A) as primary background.
- Semantic HTML and ARIA labels.

### Must NOT Have (Guardrails)
- NO text changes (copy-paste exactly what's there).
- NO removal of existing images.
- NO heavy external JS libraries (keep it Astro/CSS native).

---

## Verification Strategy

### Test Decision
- **Infrastructure exists**: NO
- **Automated tests**: None (Agent-Executed QA)

### Agent-Executed QA Scenarios

Scenario: Smooth Scroll Reveal and Navigation
  Tool: Playwright (playwright skill)
  Preconditions: Dev server running on localhost:4321
  Steps:
    1. Navigate to: http://localhost:4321/
    2. Scroll down slowly through all sections.
    3. Assert: All sections with `.animate-item` become visible (`opacity: 1`) on scroll.
    4. Click a service card link.
    5. Assert: Smooth transition to service detail page (View Transitions).
    6. Screenshot: .sisyphus/evidence/scroll-reveal.png
  Expected Result: All items reveal smoothly; navigation feels fluid.
  Evidence: .sisyphus/evidence/scroll-reveal.png

Scenario: Responsive Bento Grid
  Tool: Playwright (playwright skill)
  Preconditions: Dev server running
  Steps:
    1. Set viewport to 375x667 (Mobile).
    2. Navigate to: http://localhost:4321/
    3. Assert: Services grid stacks vertically or in a single-column layout.
    4. Set viewport to 1440x900 (Desktop).
    5. Assert: Services grid uses an asymmetric Bento layout.
    6. Screenshot: .sisyphus/evidence/responsive-grid.png
  Expected Result: Layout adapts perfectly to both mobile and desktop.
  Evidence: .sisyphus/evidence/responsive-grid.png

Scenario: Design System Consistency
  Tool: Bash (grep)
  Preconditions: Files refactored
  Steps:
    1. Search for hex code `#31B0FF` in `src/components/`.
    2. Assert: It should NOT be hardcoded (except in `global.css`). It should use `brand` color utility.
  Expected Result: Components use Tailwind theme variables.

---

## Execution Strategy

### Parallel Execution Waves

Wave 1 (Start Immediately):
├── Task 1: Design System Unification (global.css)
└── Task 2: Animation Orchestrator (AnimateItem.astro)

Wave 2 (After Wave 1):
├── Task 3: Hero Section Refactor
├── Task 4: Services Bento Grid Refactor
└── Task 5: Layout & View Transitions

### Dependency Matrix

| Task | Depends On | Blocks | Can Parallelize With |
|------|------------|--------|---------------------|
| 1 | None | 3, 4 | 2 |
| 2 | None | 3, 4 | 1 |
| 3 | 1, 2 | 5 | 4 |
| 4 | 1, 2 | 5 | 3 |
| 5 | 3, 4 | None | None |

---

## TODOs

- [ ] 1. Design System Unification
  **What to do**:
  - Update `src/styles/global.css` with `@theme` block including: `--color-brand`, `--color-brand-muted`, `--color-bg`, `--color-surface`, `--spacing-fluid`.
  - Replace hardcoded hex values in `src/layouts/Layout.astro` and `src/styles/global.css` with variables.
  
  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Requires precise Tailwind 4 configuration and styling.
  - **Skills**: [`tailwind-4`]
  
  **Acceptance Criteria**:
  - `global.css` contains all theme variables.
  - No hardcoded `#08080A` or `#31B0FF` in global styles.
  
  **References**:
  - `src/styles/global.css` (existing minimal theme)

- [ ] 2. Animation Orchestrator
  **What to do**:
  - Create `src/components/AnimateItem.astro` that wraps a slot with the IntersectionObserver logic.
  - Centralize the JS logic to avoid duplication.
  
  **Recommended Agent Profile**:
  - **Category**: `unspecified-low`
    - Reason: Simple component creation and script centralization.
  
  **Acceptance Criteria**:
  - New component exists.
  - Logic handles both initial load and Astro page transitions.

- [ ] 3. Hero Section Refactor "Promax"
  **What to do**:
  - Refactor `src/components/hero.astro` and its sub-components (`HeroMain.astro`, etc.).
  - Improve typography (tracking, leading).
  - Add "premium" glassmorphism effects to stats cards.
  - Ensure all texts are exactly as the original.
  
  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: [`frontend-ui-ux`, `tailwind-4`]

  **Acceptance Criteria**:
  - Hero section looks "premium" but retains its identity.
  - All original texts preserved.

- [ ] 4. Services Bento Grid Refactor
  **What to do**:
  - Refactor `src/components/services.astro` to use an asymmetric grid (Bento style).
  - Improve service cards with better border-glows and image masks.
  - Ensure icons and links are preserved.
  
  **Recommended Agent Profile**:
  - **Category**: `artistry`
    - Reason: Requires creative layout work to achieve the Bento look.
  - **Skills**: [`frontend-ui-ux`, `tailwind-4`]

  **Acceptance Criteria**:
  - Services are displayed in a modern Bento grid.
  - Responsive behavior is flawless.

- [ ] 5. Integration & View Transitions
  **What to do**:
  - Enable `ViewTransitions` in `src/layouts/Layout.astro`.
  - Final pass on all components to ensure they use the new design system and animation component.
  - Run `npm run build` to verify integrity.

  **Recommended Agent Profile**:
  - **Category**: `quick`
  
  **Acceptance Criteria**:
  - Site builds successfully.
  - Smooth transitions between pages.

---

## Success Criteria

### Verification Commands
```bash
npm run build  # Expected: "build finished"
```

### Final Checklist
- [ ] No texts modified.
- [ ] Tailwind 4 variables used throughout.
- [ ] Modern UI/UX (Bento, Glass, Fluid Animations).
- [ ] Mobile-first responsiveness.
