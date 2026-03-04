# Epic 48 — Authentication & Authorization

> **Phase 1: Foundation** (Weeks 1-2)

## Summary

This epic adds Django-based authentication and authorization to the D&D Character Forge application. It covers user registration, login/logout, session management, permission-based ownership of characters and campaigns, password reset, and React route protection.

## Technical Scope

- **Backend**: Django auth system, Django REST Framework token/session auth, custom User model
- **Frontend**: React auth state, protected routes, login/register forms
- **Database**: Custom User model extending AbstractUser, user FK on Character and Campaign models
- **API Endpoints**: Registration, login, logout, password reset, current user profile
- **Permissions**: IsOwner permission class for character/campaign ownership

## Stories

| # | Title | Focus |
|---|-------|-------|
| 48.1 | Django User Model & Registration API | Custom User model, registration endpoint |
| 48.2 | Login & Session Management | Login endpoint, token handling, React auth state |
| 48.3 | Logout & Token Handling | Logout endpoint, frontend token clearing |
| 48.4 | Permission-Based Ownership | User FK on models, IsOwner permission class |
| 48.5 | Password Reset Flow | Reset request/confirm endpoints, React forms |
| 48.6 | Auth-Protected React Routes | Route guards, login redirect, auth context |

## Testing Strategy

| Layer | Tool | Focus |
|-------|------|-------|
| Backend Unit | pytest + Django TestCase | Model validation, serializer logic |
| Backend API | pytest + DRF APITestCase | Endpoint auth, permissions, flows |
| Frontend Unit | Vitest + MSW | Auth hooks, token handling, form validation |
| E2E | Playwright | Full login/register/logout flows |

## Dependencies

- **Depends on:** Epic 1 (project scaffolding), Epic 5 (database layer — models need User FK)
- **Blocks:** All stories that require authenticated API access (Epics 5, 6, 22, 33-38)

## Key Decisions

- Using Django's built-in auth system (AbstractUser) for maximum compatibility
- Session-based auth for simplicity (JWT optional future enhancement)
- All Character and Campaign models have owner FK to User
- Registration is open (no invite system) but can be restricted later
