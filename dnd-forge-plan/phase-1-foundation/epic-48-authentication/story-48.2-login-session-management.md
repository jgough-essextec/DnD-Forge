# Story 48.2 — Login & Session Management

> **Epic 48: Authentication & Authorization** | **Phase 1: Foundation** (Weeks 1-2)

## Description
As a returning user, I need to log in to access my characters and campaigns so I can continue managing my D&D content.

## Technical Context
- **App**: D&D Character Forge — full-stack Django + React web application for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, React Query (server state), Zustand (UI state), Django REST Framework, PostgreSQL, React Router
- **Architecture**: Django REST API backend, React SPA frontend, PostgreSQL persistence, Django session auth
- **Domain**: D&D 5th Edition SRD — 9 races (with subraces), 12 classes (with subclasses), ability scores, skills, spells, equipment, backgrounds, feats
- **Auth approach**: Session-based authentication using Django's built-in session framework. Login endpoint validates credentials and returns a session token. React stores auth state globally via a custom `useAuth()` hook backed by React Context. Axios interceptor attaches the session token to all outgoing API requests.
- **Login flow**: User submits email + password -> API validates credentials -> returns user data + session cookie -> React stores user in auth context -> redirects to gallery

## Tasks
- [ ] **T48.2.1** — Create `LoginSerializer` in `backend/users/serializers.py` — validates email and password fields, authenticates using `django.contrib.auth.authenticate()`
- [ ] **T48.2.2** — Create `POST /api/auth/login/` endpoint — accepts email + password, returns user data + session token on success, 401 on failure
- [ ] **T48.2.3** — Create React login form component with email and password fields, submit button, link to registration, link to password reset
- [ ] **T48.2.4** — Create `useLogin()` React Query mutation hook — calls login API, updates auth context on success
- [ ] **T48.2.5** — Create `useAuth()` React Context + hook — provides `user`, `isAuthenticated`, `isLoading` state globally across the app
- [ ] **T48.2.6** — Create `AuthProvider` component — wraps app, checks auth state on mount via `GET /api/auth/me/`, provides context to children
- [ ] **T48.2.7** — Configure Axios interceptor to attach session/token credentials to all API requests (using `withCredentials` or Authorization header)
- [ ] **T48.2.8** — Ensure auth state persists across page refresh by checking `GET /api/auth/me/` on app initialization
- [ ] **T48.2.9** — Write tests: login API success/failure, auth context behavior, Axios interceptor, login form validation

## Acceptance Criteria
- `POST /api/auth/login/` returns user data and session token for valid credentials
- `POST /api/auth/login/` returns 401 with error message for invalid credentials
- `POST /api/auth/login/` returns 401 with appropriate message for inactive/disabled accounts
- Auth state is available globally via `useAuth()` hook
- Auth state persists across page refresh (checked via `GET /api/auth/me/` on app load)
- Axios interceptor automatically attaches credentials to all API requests
- Login form displays API error messages (invalid credentials, account disabled)
- Successful login redirects to character gallery page

## Testing Requirements

### Unit Tests (pytest)
_Backend serializer and authentication tests_

- `should authenticate user with valid email and password`
- `should reject authentication with incorrect password`
- `should reject authentication with non-existent email`
- `should reject authentication for inactive user account`
- `should normalize email to lowercase before authentication`

### API Tests (pytest + DRF APITestCase)
_Endpoint tests_

- `POST /api/auth/login/ should return 200 with user data and token for valid credentials`
- `POST /api/auth/login/ should return 401 for invalid password`
- `POST /api/auth/login/ should return 401 for non-existent email`
- `POST /api/auth/login/ should return 401 for inactive user`
- `POST /api/auth/login/ should return 400 for missing email or password`

### Frontend Tests (Vitest + MSW)
_React component, hook, and context tests_

- `should render login form with email and password fields`
- `should display error message for invalid credentials`
- `should call login API with form data on submit`
- `should update auth context on successful login`
- `should redirect to gallery on successful login`
- `useAuth() should return user data when authenticated`
- `useAuth() should return null user when not authenticated`
- `useAuth() should show loading state while checking auth`
- `Axios interceptor should attach credentials to API requests`

### E2E Tests (Playwright)
_Full login flow_

- `should complete login flow and land on gallery page`
- `should show error message for invalid credentials`
- `should persist auth state across page refresh`

### Test Dependencies
- pytest, pytest-django, factory_boy (backend)
- Vitest, MSW, @testing-library/react (frontend)
- Playwright (E2E)

## Identified Gaps
- **Security**: Rate limiting on login endpoint not specified (brute force protection)
- **Security**: Account lockout after N failed attempts not specified
- **Edge Cases**: Behavior when session expires mid-use not defined (401 interceptor needed)
- **Performance**: Session storage backend (database vs. cache) not specified

## Dependencies
- **Depends on:** Story 48.1 (User model, registration endpoint, `GET /api/auth/me/`)
- **Blocks:** Story 48.3 (logout), Story 48.6 (protected routes)

## Notes
- Django session auth uses `django.contrib.sessions` middleware — ensure it is in `MIDDLEWARE` settings
- The `AuthProvider` should be placed high in the React component tree (wrapping Router)
- Consider adding a 401 response interceptor in Axios that clears auth state and redirects to login when a session expires
- The `useAuth()` hook should be memoized to prevent unnecessary re-renders
- Login form should support "Enter" key submission for accessibility
