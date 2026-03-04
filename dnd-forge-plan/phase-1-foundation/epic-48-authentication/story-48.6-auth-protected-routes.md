# Story 48.6 — Auth-Protected React Routes

> **Epic 48: Authentication & Authorization** | **Phase 1: Foundation** (Weeks 1-2)

## Description
As a developer, I need React routes protected by authentication so that unauthenticated users are redirected to the login page and authenticated users cannot access login/register pages unnecessarily.

## Technical Context
- **App**: D&D Character Forge — full-stack Django + React web application for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, React Query (server state), Zustand (UI state), Django REST Framework, PostgreSQL, React Router
- **Architecture**: Django REST API backend, React SPA frontend, PostgreSQL persistence, Django session auth
- **Domain**: D&D 5th Edition SRD — 9 races (with subraces), 12 classes (with subclasses), ability scores, skills, spells, equipment, backgrounds, feats
- **Route protection strategy**: Two wrapper components — `ProtectedRoute` (requires authentication, redirects to `/login` if not) and `PublicOnlyRoute` (requires no authentication, redirects to `/` if already logged in). Both consume the `useAuth()` context from Story 48.2. On initial app load, auth state is unknown until `GET /api/auth/me/` completes, so a loading/splash screen is shown during this check.
- **Protected routes**: Character gallery, character creation/edit, campaign management, settings
- **Public-only routes**: Login, registration, password reset

## Tasks
- [ ] **T48.6.1** — Create `ProtectedRoute` wrapper component in `frontend/src/components/auth/ProtectedRoute.tsx` — checks `useAuth()`, renders children if authenticated, redirects to `/login` if not, shows loading state while auth is being checked
- [ ] **T48.6.2** — Create `PublicOnlyRoute` wrapper component in `frontend/src/components/auth/PublicOnlyRoute.tsx` — checks `useAuth()`, renders children if NOT authenticated, redirects to `/` (gallery) if already authenticated
- [ ] **T48.6.3** — Create `AuthLoadingScreen` component in `frontend/src/components/auth/AuthLoadingScreen.tsx` — displayed during initial auth check (splash screen with app branding and loading spinner)
- [ ] **T48.6.4** — Update `AuthProvider` (from Story 48.2) to expose `isLoading` state that is true until the initial `GET /api/auth/me/` call completes (success or failure)
- [ ] **T48.6.5** — Update React Router configuration to wrap protected routes with `ProtectedRoute` and public auth routes with `PublicOnlyRoute`
- [ ] **T48.6.6** — Store the originally requested URL before redirect to login, so user can be redirected back after successful login (return URL)
- [ ] **T48.6.7** — Handle 401 responses globally in Axios interceptor — when any API call returns 401, clear auth state and redirect to `/login`
- [ ] **T48.6.8** — Write tests: route guard redirects, loading state, return URL behavior, 401 interceptor

## Acceptance Criteria
- Unauthenticated users accessing any protected route (e.g., `/characters`, `/characters/new`) are redirected to `/login`
- Authenticated users accessing `/login` or `/register` are redirected to `/` (character gallery)
- A loading/splash screen is displayed while the initial auth check (`GET /api/auth/me/`) is in progress
- After the auth check completes, the appropriate route content or redirect is shown
- When redirected to `/login`, the originally requested URL is preserved and the user is redirected back to it after successful login
- A global 401 response interceptor clears auth state and redirects to `/login` when any API request returns 401
- The `ProtectedRoute` and `PublicOnlyRoute` components are reusable and accept children

## Testing Requirements

### Unit Tests (pytest)
_No backend tests for this story — all logic is frontend_

### API Tests (pytest + DRF APITestCase)
_No additional API tests — auth check endpoint tested in Story 48.1_

### Frontend Tests (Vitest + MSW)
_React component and routing tests_

- `ProtectedRoute should render children when user is authenticated`
- `ProtectedRoute should redirect to /login when user is not authenticated`
- `ProtectedRoute should show loading screen while auth is being checked`
- `PublicOnlyRoute should render children when user is not authenticated`
- `PublicOnlyRoute should redirect to / when user is authenticated`
- `PublicOnlyRoute should show loading screen while auth is being checked`
- `should preserve return URL when redirecting to login`
- `should redirect to return URL after successful login`
- `should redirect to gallery when no return URL is set`
- `AuthLoadingScreen should render loading spinner and app branding`
- `401 interceptor should clear auth state and redirect to /login`

### E2E Tests (Playwright)
_Full route protection flows_

- `should redirect to /login when accessing /characters without authentication`
- `should redirect to /characters after login when /characters was originally requested`
- `should redirect to / when accessing /login while already authenticated`
- `should show loading screen briefly on initial page load`
- `should redirect to /login when session expires during use`

### Test Dependencies
- Vitest, MSW, @testing-library/react (frontend)
- react-router-dom test utilities (MemoryRouter for testing)
- Playwright (E2E)

## Identified Gaps
- **UX**: Flash of protected content before redirect not addressed (loading screen should prevent this)
- **Security**: Deep link handling for routes with parameters (e.g., `/characters/123/edit`) needs URL encoding for return URL
- **Edge Cases**: Behavior when auth check fails due to network error (not 401) is not defined
- **Performance**: Auth check adds latency to initial page load — consider caching auth state in localStorage as a hint

## Dependencies
- **Depends on:** Story 48.2 (login, `useAuth()` context, `AuthProvider`), Story 1.5 (React Router setup), Story 25.1-25.3 (navigation components)
- **Blocks:** None directly (this story enables route protection for all future protected pages)

## Notes
- The `ProtectedRoute` pattern is a standard React Router approach — wrap route elements rather than using route-level middleware
- The return URL should be stored in React Router's location state (not localStorage) to avoid stale URLs across tabs
- Example usage in router config: `<Route path="/characters" element={<ProtectedRoute><CharacterGallery /></ProtectedRoute>} />`
- The `AuthLoadingScreen` prevents a flash of login page for authenticated users on initial load
- Consider using React Suspense boundaries in combination with the auth check for a cleaner loading experience
- The 401 interceptor should exclude the `/api/auth/login/` and `/api/auth/register/` endpoints to avoid redirect loops
- URL encoding the return URL is important for routes containing query parameters or special characters
