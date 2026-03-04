# Story 48.3 — Logout & Token Handling

> **Epic 48: Authentication & Authorization** | **Phase 1: Foundation** (Weeks 1-2)

## Description
As a user, I need to log out securely so that my session is invalidated and my data is not accessible to others using the same device.

## Technical Context
- **App**: D&D Character Forge — full-stack Django + React web application for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, React Query (server state), Zustand (UI state), Django REST Framework, PostgreSQL, React Router
- **Architecture**: Django REST API backend, React SPA frontend, PostgreSQL persistence, Django session auth
- **Domain**: D&D 5th Edition SRD — 9 races (with subraces), 12 classes (with subclasses), ability scores, skills, spells, equipment, backgrounds, feats
- **Logout flow**: User clicks logout -> React calls `POST /api/auth/logout/` -> server invalidates session -> React clears auth context, clears React Query cache, clears any local/session storage -> redirects to login page
- **Token handling**: Session token stored as httpOnly cookie (server-managed). Client-side, auth state is held in React Context. On logout, both server session and client state must be cleared to prevent stale data.

## Tasks
- [ ] **T48.3.1** — Create `POST /api/auth/logout/` endpoint in `backend/users/views.py` — calls `django.contrib.auth.logout()`, flushes session, returns 200
- [ ] **T48.3.2** — Create `useLogout()` React Query mutation hook — calls logout API, clears auth context, invalidates all React Query caches
- [ ] **T48.3.3** — Add logout button to application header/navigation component
- [ ] **T48.3.4** — Clear all client-side state on logout: auth context (set user to null), React Query cache (`queryClient.clear()`), any Zustand UI state, localStorage/sessionStorage auth data
- [ ] **T48.3.5** — Redirect to `/login` page after successful logout
- [ ] **T48.3.6** — Handle edge case: logout when session already expired (should still clear client state and redirect)
- [ ] **T48.3.7** — Write tests: logout API session invalidation, client state clearing, redirect behavior

## Acceptance Criteria
- `POST /api/auth/logout/` invalidates the server-side session and returns 200
- After logout, subsequent API requests with the old session token return 401
- React auth context is cleared (user set to null, isAuthenticated set to false)
- React Query cache is fully cleared (no stale character/campaign data from previous user)
- Any localStorage or sessionStorage auth-related data is removed
- User is redirected to `/login` page after logout
- Logout button is visible in the application navigation when authenticated
- Logout works gracefully even if the server session has already expired

## Testing Requirements

### Unit Tests (pytest)
_Backend logout logic tests_

- `should flush Django session on logout`
- `should return 200 on successful logout`
- `should handle logout when no active session exists`

### API Tests (pytest + DRF APITestCase)
_Endpoint tests_

- `POST /api/auth/logout/ should return 200 and invalidate session`
- `POST /api/auth/logout/ should cause subsequent authenticated requests to return 401`
- `POST /api/auth/logout/ should return 200 even when not authenticated (idempotent)`
- `GET /api/auth/me/ should return 401 after logout`

### Frontend Tests (Vitest + MSW)
_React component and hook tests_

- `should render logout button in navigation when authenticated`
- `should not render logout button when not authenticated`
- `should call logout API when logout button clicked`
- `should clear auth context after logout`
- `should clear React Query cache after logout`
- `should redirect to /login after logout`
- `should handle logout gracefully when API returns error`

### E2E Tests (Playwright)
_Full logout flow_

- `should complete logout flow and land on login page`
- `should not be able to access protected pages after logout`
- `should clear all user data from the UI after logout`

### Test Dependencies
- pytest, pytest-django, factory_boy (backend)
- Vitest, MSW, @testing-library/react (frontend)
- Playwright (E2E)

## Identified Gaps
- **Security**: "Logout from all devices" functionality not included (single session invalidation only)
- **Edge Cases**: Behavior during concurrent requests at logout time not specified
- **UX**: Confirmation dialog before logout not specified (may be desirable for long sessions)

## Dependencies
- **Depends on:** Story 48.2 (login, auth context, session management)
- **Blocks:** None directly (logout is a terminal flow)

## Notes
- Django's `logout()` function handles session flushing and cookie deletion server-side
- The logout endpoint should be idempotent — calling it when already logged out should not error
- React Query's `queryClient.clear()` removes all cached data; this is intentional to prevent data leakage between users on the same device
- Consider adding a Zustand reset action if UI state (e.g., sidebar open, selected tab) should also be cleared on logout
- The logout button should be accessible via keyboard navigation (Tab + Enter)
