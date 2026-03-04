# Story 48.1 — Django User Model & Registration API

> **Epic 48: Authentication & Authorization** | **Phase 1: Foundation** (Weeks 1-2)

## Description
As a new user, I need to register an account so I can create and manage my own D&D characters and campaigns.

## Technical Context
- **App**: D&D Character Forge — full-stack Django + React web application for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, React Query (server state), Zustand (UI state), Django REST Framework, PostgreSQL, React Router
- **Architecture**: Django REST API backend, React SPA frontend, PostgreSQL persistence, Django session auth
- **Domain**: D&D 5th Edition SRD — 9 races (with subraces), 12 classes (with subclasses), ability scores, skills, spells, equipment, backgrounds, feats
- **Auth approach**: Custom User model extending Django's AbstractUser for future extensibility. DRF serializers handle validation. Registration creates user + session.
- **User model fields**: id (UUID PK), email (unique, used as username), display_name, date_joined, is_active

## Tasks
- [ ] **T48.1.1** — Create custom User model in `backend/users/models.py` extending `AbstractUser` with UUID primary key, email as username field, display_name
- [ ] **T48.1.2** — Configure `AUTH_USER_MODEL = 'users.User'` in Django settings
- [ ] **T48.1.3** — Create `UserRegistrationSerializer` in `backend/users/serializers.py` — validates email uniqueness, password strength, creates user
- [ ] **T48.1.4** — Create `POST /api/auth/register/` endpoint — accepts email, password, display_name, returns user data + session token
- [ ] **T48.1.5** — Create `GET /api/auth/me/` endpoint — returns current authenticated user profile
- [ ] **T48.1.6** — Create React registration form component with email, password, confirm password, display name fields
- [ ] **T48.1.7** — Create `useRegister()` React Query mutation hook — calls registration API, stores auth token on success
- [ ] **T48.1.8** — Write tests: backend registration validation, duplicate email rejection, successful registration flow

## Acceptance Criteria
- Custom User model uses email as primary identifier (not default username)
- `POST /api/auth/register/` creates a new user and returns authentication token
- Registration validates: email format, email uniqueness, password minimum 8 chars, password confirmation match
- `GET /api/auth/me/` returns 401 for unauthenticated, user profile for authenticated
- React form shows validation errors from API
- Successful registration redirects to character gallery

## Testing Requirements

### Unit Tests (pytest)
_Backend model and serializer tests_

- `should create user with valid email and password`
- `should reject duplicate email registration`
- `should reject password shorter than 8 characters`
- `should reject mismatched password confirmation`
- `should use UUID as primary key`
- `should set email as USERNAME_FIELD`

### API Tests (pytest + DRF APITestCase)
_Endpoint tests_

- `POST /api/auth/register/ should return 201 with user data and token`
- `POST /api/auth/register/ should return 400 for duplicate email`
- `POST /api/auth/register/ should return 400 for invalid password`
- `GET /api/auth/me/ should return 200 with user profile when authenticated`
- `GET /api/auth/me/ should return 401 when not authenticated`

### Frontend Tests (Vitest + MSW)
_React component and hook tests_

- `should render registration form with all required fields`
- `should display validation errors from API response`
- `should call registration API with form data on submit`
- `should redirect to gallery on successful registration`

### E2E Tests (Playwright)
_Full registration flow_

- `should complete registration flow and land on gallery page`
- `should show error for duplicate email registration`

### Test Dependencies
- pytest, pytest-django, factory_boy (backend)
- Vitest, MSW, @testing-library/react (frontend)
- Playwright (E2E)

## Identified Gaps
- **Security**: Rate limiting on registration endpoint not specified
- **Edge Cases**: Email verification flow not included (future enhancement)
- **Performance**: No specification for maximum concurrent registrations

## Dependencies
- **Depends on:** Story 1.1 (project setup), Story 1.3 (Django installed), Story 1.4 (testing configured)
- **Blocks:** Story 48.2 (login), Story 48.4 (ownership permissions), all authenticated API endpoints

## Notes
- Using `AbstractUser` instead of `AbstractBaseUser` for simplicity — gets admin integration, permissions, groups for free
- Email as username is set via `USERNAME_FIELD = 'email'` and making username field nullable/unused
- Consider adding email normalization (lowercase) in the User model's save method
- Session token is returned in response body AND set as httpOnly cookie for security
