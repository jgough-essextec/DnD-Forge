# Story 1.3 — Install Runtime Dependencies

> **Epic 1: Project Scaffolding & Developer Toolchain** | **Phase 1: Foundation** (Weeks 1-2)

## Description
As a developer, I need all frontend and backend runtime dependencies installed and verified so downstream code can use them immediately. This covers React Query and Axios for server-state management and API communication, Zustand for client-side UI state, and a Python requirements file for the Django REST Framework backend.

## Technical Context
- **App**: D&D Character Forge — full-stack Django + React web application for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, React Query (server state), Zustand (UI state), Django REST Framework, PostgreSQL, React Router
- **Architecture**: Django REST API backend, React SPA frontend, PostgreSQL persistence, Django session auth
- **Domain**: D&D 5th Edition SRD — 9 races (with subraces), 12 classes (with subclasses), ability scores, skills, spells, equipment, backgrounds, feats
- **Server state**: `@tanstack/react-query` manages all server-state (fetching, caching, synchronisation) with `axios` as the HTTP client
- **Client state**: Zustand manages UI-only state (wizard step, sidebar open/closed, dice roller) with persist middleware for sessionStorage/localStorage
- **Backend**: Django REST Framework serves the API; PostgreSQL stores all persistent data; `django-cors-headers` enables cross-origin requests from the Vite dev server
- **PDF generation**: `weasyprint` runs server-side in Django to render character-sheet HTML templates to PDF
- **Routing**: React Router v6 provides client-side routing with lazy loading support
- **Utilities**: `uuid` for generating unique IDs, `lodash-es` for tree-shakeable utility functions, `clsx` + `tailwind-merge` for conditional class names
- **Drag and drop**: `@dnd-kit` suite for sortable equipment lists, spell management, etc.
- **Animation**: `framer-motion` for page transitions and UI animations
- **Icons**: `lucide-react` for consistent iconography throughout the app

## Tasks

### Frontend Dependencies
- [ ] **T1.3.1** — Install client state management: `zustand` + `zustand/middleware` (persist)
- [ ] **T1.3.2** — Install server state and HTTP client: `@tanstack/react-query`, `@tanstack/react-query-devtools`, `axios`
- [ ] **T1.3.3** — Install routing: `react-router-dom` v6
- [ ] **T1.3.4** — Install utilities: `uuid`, `lodash-es` (tree-shakeable), `clsx`, `tailwind-merge`
- [ ] **T1.3.5** — Install drag-and-drop: `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`
- [ ] **T1.3.6** — Install animation: `framer-motion`
- [ ] **T1.3.7** — Install icons: `lucide-react`
- [ ] **T1.3.8** — Set up React Query provider: create `src/lib/queryClient.ts` with default options (staleTime, retry, refetchOnWindowFocus) and wrap the app root in `<QueryClientProvider>` in `main.tsx`
- [ ] **T1.3.9** — Create `src/lib/api.ts` with a pre-configured Axios instance (baseURL pointing to Django API, withCredentials for session auth, JSON content-type header)

### Backend Dependencies
- [ ] **T1.3.10** — Create `backend/requirements.txt` containing: `django>=5.0`, `djangorestframework`, `psycopg2-binary`, `django-cors-headers`, `weasyprint`, `python-dotenv`
- [ ] **T1.3.11** — Create a Python virtual environment (`backend/.venv`) and install `backend/requirements.txt`

### Verification
- [ ] **T1.3.12** — Create a frontend dependency verification script that imports each package and logs success
- [ ] **T1.3.13** — Verify backend dependencies install without errors: `pip install -r backend/requirements.txt && python -c "import django; import rest_framework; import corsheaders; import weasyprint"`

## Acceptance Criteria
- All frontend packages are installed and appear in `package.json` dependencies
- `backend/requirements.txt` exists and lists all required Python packages
- All Python packages install cleanly into a virtual environment without errors
- `<QueryClientProvider>` wraps the application root in `main.tsx`
- `src/lib/queryClient.ts` exports a configured `QueryClient` with sensible defaults
- `src/lib/api.ts` exports a configured Axios instance pointed at the Django API base URL
- Each frontend package can be successfully imported in a TypeScript file without type errors
- The frontend dependency verification script runs and confirms all imports succeed
- No version conflicts or peer dependency warnings in `npm install` output
- Tree-shaking works correctly for `lodash-es` (verify with bundle analysis)

## Testing Requirements

### Unit Tests (Vitest)
_For pure functions, calculations, data transforms, utilities, type guards, validators_

- `should import zustand and create a basic store without errors`
- `should import @tanstack/react-query and create a QueryClient without errors`
- `should import axios and create a configured instance without errors`
- `should import react-router-dom and access BrowserRouter without errors`
- `should import uuid and generate a valid UUID v4`
- `should import lodash-es functions with tree-shaking (debounce, cloneDeep, set)`
- `should import clsx and tailwind-merge and produce merged class strings`
- `should import @dnd-kit/core and access DndContext`
- `should import framer-motion and access motion component`
- `should import lucide-react and access icon components`
- `should render the app root with QueryClientProvider wrapping it`

### Integration Tests (Vitest + MSW)
_For verifying Axios instance and React Query integration_

- `should make a GET request through the configured Axios instance and receive mocked data via MSW`
- `should use React Query's useQuery with the Axios instance to fetch and cache data`

### E2E Tests (Playwright)
_For critical user journeys, multi-step flows, full-page interactions_

- `should build the application successfully with all dependencies bundled`

### Test Dependencies
- MSW (Mock Service Worker) for intercepting Axios HTTP requests in tests
- Frontend dependency verification script from T1.3.12
- Backend dependency verification command from T1.3.13

## Identified Gaps

- **Performance**: No bundle size targets specified for tree-shaking verification of lodash-es
- **Dependency Issues**: No specification for handling peer dependency conflicts between @dnd-kit and React version
- **Dependency Issues**: framer-motion `prefers-reduced-motion` configuration not specified as acceptance criteria
- **Configuration**: No specification for React Query devtools — should only be included in development builds
- **Configuration**: Exact Axios baseURL and CORS allowed-origins are environment-dependent and need `.env` coordination between frontend and backend

## Dependencies
- **Depends on:** Story 1.1 (project must be initialized)
- **Blocks:** Epic 5 (Database Layer — needs Django models + DRF serializers), Epic 6 (State Management — needs Zustand + React Query), Story 1.5 (Routing — needs React Router)

## Notes
- `@tanstack/react-query` replaces any direct IndexedDB/Dexie usage; all persistent data lives in PostgreSQL and is fetched via the Django REST API
- Configure `queryClient` defaults carefully: `staleTime` of 5 minutes is a reasonable starting point for SRD reference data that rarely changes; character data should use shorter stale times
- The Axios instance in `src/lib/api.ts` must set `withCredentials: true` so Django session cookies are sent on cross-origin requests during development (Vite on port 5173, Django on port 8000)
- `django-cors-headers` must be configured in Django settings to allow the Vite dev server origin
- `weasyprint` handles PDF generation server-side, replacing the previous client-side jsPDF + html2canvas approach; this produces higher-fidelity output and avoids browser rendering inconsistencies
- Use `lodash-es` instead of `lodash` to ensure tree-shaking works with Vite/Rollup
- Install TypeScript type packages (`@types/uuid`, etc.) as dev dependencies where needed
- The `@dnd-kit` packages share a peer dependency on React; verify compatibility with the installed React version
- `framer-motion` should be configured to respect `prefers-reduced-motion` for accessibility
- `python-dotenv` is used to load `.env` files in Django settings for database credentials, secret key, and debug flags
