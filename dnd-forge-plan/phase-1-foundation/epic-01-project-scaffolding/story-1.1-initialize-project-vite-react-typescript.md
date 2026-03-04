# Story 1.1 — Initialize Project with Vite + React + TypeScript

> **Epic 1: Project Scaffolding & Developer Toolchain** | **Phase 1: Foundation** (Weeks 1-2)

## Description
As a developer, I need a properly configured React TypeScript project so I can begin building components with type safety and hot reload.

## Technical Context
- **App**: D&D Character Forge — local-first React PWA for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, Zustand (state), Dexie.js (IndexedDB), React Router
- **Architecture**: No backend, pure client-side, offline-capable PWA, IndexedDB for persistence
- **Domain**: D&D 5th Edition SRD — 9 races (with subraces), 12 classes (with subclasses), ability scores, skills, spells, equipment, backgrounds, feats
- **Build tool**: Vite with the `react-ts` template for fast HMR and TypeScript compilation
- **TypeScript config**: Strict mode must be enabled for compiler-verified correctness across the entire codebase. Path aliases (`@/` mapping to `src/`) simplify imports throughout the project
- **Directory structure** follows a standard React feature-based layout: `components/`, `data/`, `hooks/`, `stores/`, `utils/`, `types/`, `styles/`

## Tasks
- [ ] **T1.1.1** — Run `npm create vite@latest dnd-forge -- --template react-ts` and verify the project compiles
- [ ] **T1.1.2** — Configure `tsconfig.json` with strict mode, path aliases (`@/` -> `src/`), and `baseUrl`
- [ ] **T1.1.3** — Set up the directory structure per the architecture spec (`components/`, `data/`, `hooks/`, `stores/`, `utils/`, `types/`, `styles/`)
- [ ] **T1.1.4** — Add `.editorconfig` and `.prettierrc` with consistent formatting rules (2-space indent, single quotes, trailing commas)
- [ ] **T1.1.5** — Create a `README.md` with project overview, setup instructions, and architecture summary

## Acceptance Criteria
- Running `npm run dev` starts the Vite dev server with hot module replacement
- TypeScript compiles with zero errors under strict mode
- Path alias `@/` resolves correctly in imports
- Directory structure matches the defined architecture layout
- Formatting rules are applied consistently via `.editorconfig` and `.prettierrc`

## Dependencies
- **Depends on:** None — this is the first story in the first epic
- **Blocks:** Story 1.2 (Tailwind/shadcn), Story 1.3 (Dependencies), Story 1.4 (Testing), Story 1.5 (Routing)

## Notes
- The Vite `react-ts` template comes with a basic App component and some default styles that should be cleaned out after initialization
- Path aliases require configuration in both `tsconfig.json` and `vite.config.ts` (via `resolve.alias`) to work correctly at both compile time and bundle time
