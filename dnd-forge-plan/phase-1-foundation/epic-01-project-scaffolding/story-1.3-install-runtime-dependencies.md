# Story 1.3 — Install Runtime Dependencies

> **Epic 1: Project Scaffolding & Developer Toolchain** | **Phase 1: Foundation** (Weeks 1-2)

## Description
As a developer, I need all non-UI runtime dependencies installed and import-verified so downstream code can use them immediately.

## Technical Context
- **App**: D&D Character Forge — local-first React PWA for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, Zustand (state), Dexie.js (IndexedDB), React Router
- **Architecture**: No backend, pure client-side, offline-capable PWA, IndexedDB for persistence
- **Domain**: D&D 5th Edition SRD — 9 races (with subraces), 12 classes (with subclasses), ability scores, skills, spells, equipment, backgrounds, feats
- **State management**: Zustand is the chosen state management library with persist middleware for sessionStorage/localStorage persistence. It is lightweight and works well with React hooks
- **Database**: Dexie.js wraps IndexedDB for offline-first data persistence. `dexie-react-hooks` provides React hook integration for reactive queries
- **Routing**: React Router v6 provides client-side routing with lazy loading support
- **Utilities**: `uuid` for generating unique IDs (character IDs, etc.), `lodash-es` for tree-shakeable utility functions
- **PDF generation**: `jspdf` and `html2canvas` will be used later for exporting character sheets as PDFs
- **Drag and drop**: `@dnd-kit` suite for sortable equipment lists, spell management, etc.
- **Animation**: `framer-motion` for page transitions and UI animations
- **Icons**: `lucide-react` for consistent iconography throughout the app

## Tasks
- [ ] **T1.3.1** — Install state management: `zustand` + `zustand/middleware` (persist)
- [ ] **T1.3.2** — Install database: `dexie` + `dexie-react-hooks`
- [ ] **T1.3.3** — Install routing: `react-router-dom` v6
- [ ] **T1.3.4** — Install utilities: `uuid`, `lodash-es` (tree-shakeable)
- [ ] **T1.3.5** — Install PDF generation: `jspdf`, `html2canvas`
- [ ] **T1.3.6** — Install drag-and-drop: `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`
- [ ] **T1.3.7** — Install animation: `framer-motion`
- [ ] **T1.3.8** — Install icons: `lucide-react`
- [ ] **T1.3.9** — Create a dependency verification script that imports each package and logs success

## Acceptance Criteria
- All listed packages are installed and appear in `package.json` dependencies
- Each package can be successfully imported in a TypeScript file without type errors
- The dependency verification script runs and confirms all imports succeed
- No version conflicts or peer dependency warnings in `npm install` output
- Tree-shaking works correctly for `lodash-es` (verify with bundle analysis)

## Dependencies
- **Depends on:** Story 1.1 (project must be initialized)
- **Blocks:** Epic 5 (Database Layer — needs Dexie), Epic 6 (State Management — needs Zustand), Story 1.5 (Routing — needs React Router)

## Notes
- Use `lodash-es` instead of `lodash` to ensure tree-shaking works with Vite/Rollup
- Install TypeScript type packages (`@types/uuid`, etc.) as dev dependencies where needed
- The `@dnd-kit` packages share a peer dependency on React; verify compatibility with the installed React version
- `framer-motion` should be configured to respect `prefers-reduced-motion` for accessibility
