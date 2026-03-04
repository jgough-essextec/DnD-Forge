# Story 42.1 — Bundle Size Analysis & Reduction

> **Epic 42: Performance Optimization** | **Phase 6: Polish & Export** (Weeks 11-12)

## Description

As a developer, I need the production bundle to be under 500KB gzipped (excluding SRD data) for fast initial loads. This story covers analyzing the bundle with a visualizer, implementing route-based code splitting, auditing tree-shaking, optimizing fonts, and ensuring images are properly optimized.

## Technical Context

- **App**: D&D Character Forge — full-stack Django + React web application for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, React Query (server state), Zustand (UI state), Django REST Framework, PostgreSQL, React Router, WeasyPrint (server-side PDF), Playwright (E2E testing)
- **Architecture**: Django REST API backend, React SPA frontend, PostgreSQL persistence, Django session auth
- **Prior Phases Available**: Phases 1-5 (complete character creation, sheet display, session play, DM/campaign features)
- **Performance Targets**: Bundle <500KB gzipped (excluding SRD data), FCP <1.5s, TTI <3s, Lighthouse >90
- **Accessibility Target**: WCAG 2.1 AA compliance
- **Expected Heavy Dependencies**: React (~45KB), React Query (~15KB), framer-motion (~60KB), Three.js (~150KB if added), SRD data files
- **Code Split Targets**: Core (React, router, React Query, Zustand, Tailwind, shared), Gallery, Sheet, Wizard, DM, Dice
- **Font Optimization**: Cinzel subset to uppercase + digits (~30KB instead of ~100KB), Inter subset to Latin, font-display: swap
- **Image Optimization**: Avatar images as optimized JPEGs <=100KB, race/class placeholders as inline SVGs

## Tasks

- [ ] **T42.1.1** — Run `npx vite-bundle-visualizer` (or `rollup-plugin-visualizer`) to generate a treemap of the production bundle. Identify the largest dependencies. Expected heavy hitters: React (~45KB), React Query (~15KB), framer-motion (~60KB), Three.js (~150KB if added), SRD data files
- [ ] **T42.1.2** — **Code splitting with lazy imports:** split the app into route-based chunks:
  - Core chunk: React, router, React Query, Zustand, Tailwind runtime, shared components
  - Gallery chunk: gallery components (loaded on `/`)
  - Sheet chunk: character sheet components (loaded on `/character/:id`)
  - Wizard chunk: creation wizard components (loaded on `/character/new`)
  - DM chunk: campaign dashboard, combat tracker, session log (loaded on `/campaign/*`)
  - Dice chunk: dice roller, animations (loaded on first dice roll trigger)
  - Note: PDF generation is handled server-side by WeasyPrint, so no client-side PDF library chunk is needed
  - Use `React.lazy()` and `Suspense` with route-level splitting
- [ ] **T42.1.3** — **Tree-shaking audit:** verify that unused exports from large libraries are tree-shaken. Check: lucide-react (import only used icons, not the entire set), lodash (use `lodash-es` for tree-shaking), shadcn/ui (only import used components)
- [ ] **T42.1.4** — **Font optimization:** Cinzel and Inter are Google Fonts loaded externally. Options: (a) self-host with `font-display: swap` and subset to only the characters used (Latin), (b) use system font stack as fallback during load. Cinzel: subset to uppercase + digits for headings only (~30KB instead of ~100KB)
- [ ] **T42.1.5** — **Image optimization:** avatar images are stored as base64 via the API. Ensure the resize/crop step (Phase 3) produces optimized JPEGs at <=100KB per avatar. Race/class placeholder images: use inline SVGs instead of PNGs

## Acceptance Criteria

- Bundle visualization treemap generated showing all dependency sizes
- Production bundle is under 500KB gzipped (excluding SRD data)
- App is split into at minimum 6 route-based chunks (Core, Gallery, Sheet, Wizard, DM, Dice)
- `React.lazy()` and `Suspense` are used for all route-level code splitting
- Tree-shaking is verified — no unused library exports in the production bundle
- lucide-react imports only individual icons, not the full icon set
- Fonts are self-hosted with `font-display: swap` and subsetted to Latin characters
- Cinzel font is subsetted to uppercase + digits (~30KB)
- Avatar images are optimized to <=100KB per image
- Race/class placeholder images use inline SVGs instead of PNGs

## Testing Requirements

### Unit Tests (Vitest)
_For pure functions, calculations, data transforms, utilities, type guards, validators_

- `should verify lucide-react imports only individual icons (not full icon set) via import analysis`
- `should verify lodash uses lodash-es for tree-shaking`
- `should verify Cinzel font is subsetted to uppercase + digits (~30KB not ~100KB)`
- `should verify avatar image resize produces optimized JPEGs at <=100KB per image`

### E2E Tests (Playwright)
_For critical user journeys, multi-step flows, full-page interactions_

- `should produce production bundle under 500KB gzipped (excluding SRD data)`
- `should split app into at minimum 6 route-based chunks (Core, Gallery, Sheet, Wizard, DM, Dice)`
- `should load Dice chunk only on first dice roll trigger (not at initial page load)`
- `should render gallery page without loading Sheet, Wizard, DM, or Dice chunks`
- `should use font-display: swap for all self-hosted fonts`

### Test Dependencies
- Vite bundle visualizer output for size verification
- Production build artifacts for chunk analysis
- Route-level chunk loading verification via network monitoring
- Font file size measurement utility

## Identified Gaps

- **Performance**: No specification for maximum acceptable initial bundle (Core chunk) size
- **Error Handling**: No fallback specified if code-split chunk fails to load (network error during lazy import)
- **Edge Cases**: Three.js dice upgrade decision not finalized (impacts bundle budget significantly: ~150KB)
- **Dependency Issues**: framer-motion (~60KB) replacement with CSS animations not decided

## Dependencies

- All Phase 1-5 features complete (need final bundle to measure)
- Should be the first performance story addressed (affects all load times)

## Notes

- PDF generation is handled server-side by WeasyPrint, eliminating the need for a large client-side PDF library
- Three.js (~150KB) should only be added if the dice upgrade is approved AND it fits within the budget after splitting
- If framer-motion (~60KB) pushes over budget, consider replacing with CSS animations for simple transitions
- Vite's `build.rollupOptions.output.manualChunks` can be used for fine-grained chunk control
- Run the bundle visualizer before AND after optimizations to verify improvements
