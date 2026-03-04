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
- [ ] **T1.4.7** — Install and configure Playwright for E2E testing with `npx playwright install`
- [ ] **T1.4.8** — Create `src/test/utils/` with: `renderWithProviders.tsx` (test render wrapper), `mockStores.ts` (Zustand store mocks), `testData.ts` (character/race/class fixtures)
- [ ] **T1.4.9** — Create `e2e/` directory with Playwright config and base fixtures
- [ ] **T1.4.10** — Add npm scripts: `test:e2e`, `test:e2e:headed`, `test:all`

## Acceptance Criteria
- `npm run test` runs all test files and reports results
- `npm run test:watch` starts Vitest in watch mode for development
- `npm run test:coverage` generates an HTML coverage report in `coverage/`
- The smoke test passes, confirming the test environment is correctly configured
- Path aliases (`@/`) resolve correctly in test files
- Testing Library matchers (e.g., `toBeInTheDocument()`) are available globally in tests

## Testing Requirements

### Unit Tests (Vitest)
_For pure functions, calculations, data transforms, utilities, type guards, validators_

- `should run vitest and execute test files matching *.test.ts(x) pattern`
- `should resolve @/ path alias in test files to src/`
- `should have Testing Library matchers (toBeInTheDocument) available globally`
- `should render App component in jsdom environment without errors`
- `should generate HTML coverage report in coverage/ directory`
- `should support watch mode via test:watch script`
- `should export renderWithProviders utility that wraps components with required providers`
- `should export mockStores utility with Zustand store mocks for character, wizard, UI, and dice stores`
- `should export testData utility with character, race, and class fixture data`

### E2E Tests (Playwright)
_For critical user journeys, multi-step flows, full-page interactions_

- `should install Playwright browsers successfully via npx playwright install`
- `should run Playwright test suite via test:e2e npm script`
- `should run Playwright in headed mode via test:e2e:headed npm script`
- `should run all tests (unit + E2E) via test:all npm script`
- `should load application in Playwright browser and verify page title`
- `should have e2e/ directory with Playwright config and base fixtures`

### Test Dependencies
- jsdom environment for component rendering
- @testing-library/jest-dom for extended matchers
- Playwright browsers installed via `npx playwright install`
- `src/test/utils/renderWithProviders.tsx` — test render wrapper with providers
- `src/test/utils/mockStores.ts` — Zustand store mocks
- `src/test/utils/testData.ts` — character/race/class fixture data

## Identified Gaps

- **Error Handling**: No specification for what happens when coverage thresholds are not met (fail CI vs warning)
- **Accessibility**: No mention of accessibility testing tools (axe-core integration with Testing Library)
- **Performance**: No test execution time targets for CI pipeline
- **Dependency Issues**: Playwright browser installation may require system-level dependencies not specified

## Dependencies
- **Depends on:** Story 1.1 (project must be initialized with Vite + TypeScript)
- **Blocks:** All test writing in Epics 4-7 depends on the testing framework being configured

## Notes
- Vitest configuration can either live in `vitest.config.ts` or be inlined in `vite.config.ts` under a `test` key. A separate file is preferred for clarity
- The `setup.ts` file should import `@testing-library/jest-dom` to extend Vitest matchers
- Path aliases in Vitest must mirror the `tsconfig.json` path aliases exactly or tests will fail to resolve imports
- Coverage thresholds can be enforced in CI later but should not block local development initially
