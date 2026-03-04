# Story 1.4 — Install and Configure Testing Framework

> **Epic 1: Project Scaffolding & Developer Toolchain** | **Phase 1: Foundation** (Weeks 1-2)

## Description
As a developer, I need a test runner configured so I can write and run unit tests for the calculation engine from the start.

## Technical Context
- **App**: D&D Character Forge — local-first React PWA for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, Zustand (state), Dexie.js (IndexedDB), React Router
- **Architecture**: No backend, pure client-side, offline-capable PWA, IndexedDB for persistence
- **Domain**: D&D 5th Edition SRD — 9 races (with subraces), 12 classes (with subclasses), ability scores, skills, spells, equipment, backgrounds, feats
- **Test runner**: Vitest is chosen because it natively integrates with Vite, shares the same configuration (path aliases, TypeScript), and provides a Jest-compatible API
- **DOM testing**: `jsdom` provides a browser-like environment for component testing; `@testing-library/react` provides utilities for rendering and querying React components in tests
- **Testing philosophy**: The calculation engine (Epic 4) requires minimum 150 test cases with >95% line coverage. Overall project target is >80% coverage. Tests are written alongside implementation, not after
- **Coverage**: HTML coverage reports will be generated in `coverage/` directory for review

## Tasks
- [ ] **T1.4.1** — Install `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`, `jsdom`
- [ ] **T1.4.2** — Configure `vitest.config.ts` with jsdom environment, path aliases matching tsconfig, and coverage reporting
- [ ] **T1.4.3** — Create `src/test/setup.ts` with Testing Library matchers and global test utilities
- [ ] **T1.4.4** — Write a trivial smoke test (`src/App.test.tsx`) that renders the root component and verifies it mounts
- [ ] **T1.4.5** — Add npm scripts: `test`, `test:watch`, `test:coverage`
- [ ] **T1.4.6** — Verify coverage reporting produces an HTML report in `coverage/`

## Acceptance Criteria
- `npm run test` runs all test files and reports results
- `npm run test:watch` starts Vitest in watch mode for development
- `npm run test:coverage` generates an HTML coverage report in `coverage/`
- The smoke test passes, confirming the test environment is correctly configured
- Path aliases (`@/`) resolve correctly in test files
- Testing Library matchers (e.g., `toBeInTheDocument()`) are available globally in tests

## Dependencies
- **Depends on:** Story 1.1 (project must be initialized with Vite + TypeScript)
- **Blocks:** All test writing in Epics 4-7 depends on the testing framework being configured

## Notes
- Vitest configuration can either live in `vitest.config.ts` or be inlined in `vite.config.ts` under a `test` key. A separate file is preferred for clarity
- The `setup.ts` file should import `@testing-library/jest-dom` to extend Vitest matchers
- Path aliases in Vitest must mirror the `tsconfig.json` path aliases exactly or tests will fail to resolve imports
- Coverage thresholds can be enforced in CI later but should not block local development initially
