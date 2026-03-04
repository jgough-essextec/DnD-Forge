# Story 1.4 — Install and Configure Testing Framework

> **Epic 1: Project Scaffolding & Developer Toolchain** | **Phase 1: Foundation** (Weeks 1-2)

## Description
As a developer, I need both frontend and backend test runners configured so I can write and run unit tests for the calculation engine and the Django API from the start. This story sets up Vitest for the React frontend, pytest for the Django backend, MSW for API mocking in frontend tests, and Playwright for end-to-end testing.

## Technical Context
- **App**: D&D Character Forge — full-stack Django + React web application for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, React Query (server state), Zustand (UI state), Django REST Framework, PostgreSQL, React Router
- **Architecture**: Django REST API backend, React SPA frontend, PostgreSQL persistence, Django session auth
- **Domain**: D&D 5th Edition SRD — 9 races (with subraces), 12 classes (with subclasses), ability scores, skills, spells, equipment, backgrounds, feats
- **Frontend test runner**: Vitest is chosen because it natively integrates with Vite, shares the same configuration (path aliases, TypeScript), and provides a Jest-compatible API
- **Backend test runner**: pytest with pytest-django provides fast, expressive testing for Django models, serializers, and views; factory-boy generates test fixtures
- **API mocking**: MSW (Mock Service Worker) intercepts HTTP requests at the network level in frontend tests, replacing the need for fake-indexeddb now that data is fetched from the Django API via Axios
- **DOM testing**: `jsdom` provides a browser-like environment for component testing; `@testing-library/react` provides utilities for rendering and querying React components in tests
- **Testing philosophy**: The calculation engine (Epic 4) requires minimum 150 test cases with >95% line coverage. Overall project target is >80% coverage. Tests are written alongside implementation, not after
- **Coverage**: Frontend HTML coverage reports in `coverage/`; backend coverage via `pytest-cov` in `backend/htmlcov/`

## Tasks

### Frontend — Vitest
- [ ] **T1.4.1** — Install `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`, `jsdom`
- [ ] **T1.4.2** — Configure `vitest.config.ts` with jsdom environment, path aliases matching tsconfig, and coverage reporting
- [ ] **T1.4.3** — Create `src/test/setup.ts` with Testing Library matchers and global test utilities
- [ ] **T1.4.4** — Write a trivial smoke test (`src/App.test.tsx`) that renders the root component and verifies it mounts
- [ ] **T1.4.5** — Add npm scripts: `test`, `test:watch`, `test:coverage`
- [ ] **T1.4.6** — Verify coverage reporting produces an HTML report in `coverage/`

### Frontend — MSW (API Mocking)
- [ ] **T1.4.7** — Install `msw` as a dev dependency
- [ ] **T1.4.8** — Create `src/mocks/handlers.ts` with basic REST API mock handlers for core endpoints (e.g., `GET /api/characters/`, `GET /api/races/`, `GET /api/classes/`)
- [ ] **T1.4.9** — Create `src/mocks/server.ts` that sets up a MSW `setupServer` instance for use in Vitest tests
- [ ] **T1.4.10** — Integrate MSW server lifecycle into `src/test/setup.ts` (beforeAll: `server.listen()`, afterEach: `server.resetHandlers()`, afterAll: `server.close()`)

### Frontend — Test Utilities
- [ ] **T1.4.11** — Create `src/test/utils/renderWithProviders.tsx` — test render wrapper that includes `QueryClientProvider` and `MemoryRouter`
- [ ] **T1.4.12** — Create `src/test/utils/mockStores.ts` — Zustand store mocks for character, wizard, UI, and dice stores
- [ ] **T1.4.13** — Create `src/test/utils/testData.ts` — character, race, and class fixture data matching API response shapes

### Backend — pytest
- [ ] **T1.4.14** — Install `pytest`, `pytest-django`, `pytest-cov`, `factory-boy` into the backend virtual environment and add them to `backend/requirements-dev.txt`
- [ ] **T1.4.15** — Create `backend/pyproject.toml` with `[tool.pytest.ini_options]` configuration: `DJANGO_SETTINGS_MODULE`, test paths, and coverage settings
- [ ] **T1.4.16** — Create `backend/tests/` directory structure with placeholder files: `__init__.py`, `conftest.py`, `test_models.py`, `test_serializers.py`, `test_views.py`
- [ ] **T1.4.17** — Write `backend/tests/conftest.py` with a basic Django test database fixture and factory-boy base class
- [ ] **T1.4.18** — Write a trivial smoke test in `backend/tests/test_models.py` that verifies Django ORM access (e.g., create and query a simple object)
- [ ] **T1.4.19** — Add `test:backend` script to root `package.json` (or `Makefile`): `cd backend && python -m pytest`

### E2E — Playwright
- [ ] **T1.4.20** — Install and configure Playwright for E2E testing with `npx playwright install`
- [ ] **T1.4.21** — Create `e2e/` directory with Playwright config and base fixtures
- [ ] **T1.4.22** — Add npm scripts: `test:e2e`, `test:e2e:headed`, `test:all` (where `test:all` runs frontend unit, backend unit, and E2E suites)

## Acceptance Criteria

### Frontend
- `npm run test` runs all Vitest test files and reports results
- `npm run test:watch` starts Vitest in watch mode for development
- `npm run test:coverage` generates an HTML coverage report in `coverage/`
- The frontend smoke test passes, confirming the Vitest environment is correctly configured
- Path aliases (`@/`) resolve correctly in test files
- Testing Library matchers (e.g., `toBeInTheDocument()`) are available globally in tests
- MSW intercepts API requests in test environment and returns mocked responses
- `renderWithProviders` wraps components with `QueryClientProvider` and `MemoryRouter`

### Backend
- `npm run test:backend` (or `make test-backend`) runs pytest and reports results
- `backend/pyproject.toml` contains `[tool.pytest.ini_options]` with correct `DJANGO_SETTINGS_MODULE`
- `backend/tests/` directory exists with `conftest.py` and placeholder test files
- The backend smoke test passes, confirming Django test database access works
- `pytest-cov` generates a coverage report for the backend

### Full Suite
- `npm run test:all` runs frontend unit tests, backend unit tests, and E2E tests in sequence

## Testing Requirements

### Frontend Unit Tests (Vitest)
_For pure functions, calculations, data transforms, utilities, type guards, validators_

- `should run vitest and execute test files matching *.test.ts(x) pattern`
- `should resolve @/ path alias in test files to src/`
- `should have Testing Library matchers (toBeInTheDocument) available globally`
- `should render App component in jsdom environment without errors`
- `should generate HTML coverage report in coverage/ directory`
- `should support watch mode via test:watch script`
- `should export renderWithProviders utility that wraps components with QueryClientProvider and MemoryRouter`
- `should export mockStores utility with Zustand store mocks for character, wizard, UI, and dice stores`
- `should export testData utility with character, race, and class fixture data matching API response shapes`
- `should intercept API calls via MSW and return mocked JSON responses`
- `should reset MSW handlers between tests to prevent state leakage`

### Backend Unit Tests (pytest)
_For Django models, serializers, views, and business logic_

- `should run pytest and discover tests in backend/tests/ directory`
- `should configure DJANGO_SETTINGS_MODULE via pyproject.toml`
- `should create and access a test database without errors`
- `should generate a backend coverage report via pytest-cov`
- `should provide factory-boy factories in conftest.py for generating test fixtures`

### E2E Tests (Playwright)
_For critical user journeys, multi-step flows, full-page interactions_

- `should install Playwright browsers successfully via npx playwright install`
- `should run Playwright test suite via test:e2e npm script`
- `should run Playwright in headed mode via test:e2e:headed npm script`
- `should run all tests (frontend unit + backend unit + E2E) via test:all npm script`
- `should load application in Playwright browser and verify page title`
- `should have e2e/ directory with Playwright config and base fixtures`

### Test Dependencies

#### Frontend
- jsdom environment for component rendering
- @testing-library/jest-dom for extended matchers
- MSW (Mock Service Worker) for intercepting API requests in tests
- Playwright browsers installed via `npx playwright install`
- `src/mocks/handlers.ts` — MSW REST API mock handlers
- `src/mocks/server.ts` — MSW server instance for Vitest
- `src/test/utils/renderWithProviders.tsx` — test render wrapper with QueryClientProvider + MemoryRouter
- `src/test/utils/mockStores.ts` — Zustand store mocks
- `src/test/utils/testData.ts` — character/race/class fixture data

#### Backend
- pytest + pytest-django for test discovery and Django integration
- pytest-cov for coverage reporting
- factory-boy for generating model instances in tests
- `backend/tests/conftest.py` — shared fixtures and factory base classes

## Identified Gaps

- **Error Handling**: No specification for what happens when coverage thresholds are not met (fail CI vs warning)
- **Accessibility**: No mention of accessibility testing tools (axe-core integration with Testing Library)
- **Performance**: No test execution time targets for CI pipeline
- **Dependency Issues**: Playwright browser installation may require system-level dependencies not specified
- **Configuration**: No specification for whether backend tests use SQLite (fast, in-memory) or PostgreSQL (parity with production) as the test database
- **Configuration**: MSW handler coverage — no specification for which API endpoints must have mock handlers at this stage versus added incrementally

## Dependencies
- **Depends on:** Story 1.1 (project must be initialized with Vite + TypeScript), Story 1.3 (backend virtual environment and requirements must exist)
- **Blocks:** All test writing in Epics 4-7 depends on the testing framework being configured; backend API tests depend on pytest-django being available

## Notes
- **Dual testing strategy**: pytest handles all Django backend tests (models, serializers, views, permissions); Vitest handles all React frontend tests (components, hooks, stores, calculations); Playwright handles end-to-end flows that exercise both stacks together
- MSW replaces fake-indexeddb entirely — since data now lives in PostgreSQL and is fetched via Axios, frontend tests mock the HTTP layer rather than the storage layer
- MSW handlers should mirror the actual Django REST API response shapes so frontend tests stay realistic; keep `src/mocks/handlers.ts` in sync with the API as endpoints evolve
- `renderWithProviders` must create a fresh `QueryClient` per test to prevent cached data from leaking between tests
- Vitest configuration can either live in `vitest.config.ts` or be inlined in `vite.config.ts` under a `test` key. A separate file is preferred for clarity
- The `setup.ts` file should import `@testing-library/jest-dom` to extend Vitest matchers and start the MSW server
- Path aliases in Vitest must mirror the `tsconfig.json` path aliases exactly or tests will fail to resolve imports
- Coverage thresholds can be enforced in CI later but should not block local development initially
- For backend tests, prefer SQLite in-memory for speed during local development; use PostgreSQL in CI for production parity
- factory-boy factories should be defined in `backend/tests/conftest.py` or a dedicated `backend/tests/factories.py` and shared across all test modules
