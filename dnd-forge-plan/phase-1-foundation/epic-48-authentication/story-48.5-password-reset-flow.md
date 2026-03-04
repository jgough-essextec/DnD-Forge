# Story 48.5 — Password Reset Flow

> **Epic 48: Authentication & Authorization** | **Phase 1: Foundation** (Weeks 1-2)

## Description
As a user who forgot my password, I need to reset it via email so that I can regain access to my account and my D&D characters and campaigns.

## Technical Context
- **App**: D&D Character Forge — full-stack Django + React web application for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, React Query (server state), Zustand (UI state), Django REST Framework, PostgreSQL, React Router
- **Architecture**: Django REST API backend, React SPA frontend, PostgreSQL persistence, Django session auth
- **Domain**: D&D 5th Edition SRD — 9 races (with subraces), 12 classes (with subclasses), ability scores, skills, spells, equipment, backgrounds, feats
- **Reset flow**: User clicks "Forgot password" on login page -> enters email -> `POST /api/auth/password-reset/` sends email with tokenized link -> user clicks link -> lands on React reset confirmation page -> enters new password -> `POST /api/auth/password-reset/confirm/` validates token and updates password -> redirected to login
- **Token approach**: Uses Django's built-in `PasswordResetTokenGenerator` which creates time-limited, single-use tokens based on user state (password hash, last login, timestamp). Tokens are embedded in a URL sent via email.
- **Email backend**: Configurable via Django settings — `console` backend for development (prints to terminal), SMTP for production

## Tasks
- [ ] **T48.5.1** — Create `POST /api/auth/password-reset/` endpoint — accepts email, generates reset token via `PasswordResetTokenGenerator`, sends email with reset link containing uidb64 + token
- [ ] **T48.5.2** — Create `PasswordResetRequestSerializer` in `backend/users/serializers.py` — validates email format, looks up user (always returns 200 to prevent email enumeration)
- [ ] **T48.5.3** — Create `POST /api/auth/password-reset/confirm/` endpoint — accepts uidb64, token, new_password, validates token, updates password
- [ ] **T48.5.4** — Create `PasswordResetConfirmSerializer` — validates token, decodes uidb64, validates new password strength, updates user password
- [ ] **T48.5.5** — Configure Django email backend in settings (console for dev, SMTP for prod via environment variable)
- [ ] **T48.5.6** — Create password reset email template in `backend/users/templates/` with reset link pointing to frontend URL
- [ ] **T48.5.7** — Create React password reset request form component — email input, submit button, success message
- [ ] **T48.5.8** — Create React password reset confirmation form component — new password, confirm password fields, submit button
- [ ] **T48.5.9** — Add React Router route for `/reset-password` (request form) and `/reset-password/confirm/:uidb64/:token` (confirmation form)
- [ ] **T48.5.10** — Create `usePasswordReset()` and `usePasswordResetConfirm()` React Query mutation hooks
- [ ] **T48.5.11** — Write tests: token generation/validation, email sending, password update, expired token rejection, frontend forms

## Acceptance Criteria
- `POST /api/auth/password-reset/` always returns 200 regardless of whether email exists (prevents email enumeration)
- If the email exists, a reset email is sent containing a tokenized link
- `POST /api/auth/password-reset/confirm/` with valid token and uidb64 updates the user's password and returns 200
- `POST /api/auth/password-reset/confirm/` with expired or invalid token returns 400 with error message
- `POST /api/auth/password-reset/confirm/` with used token returns 400 (tokens are single-use — password change invalidates the token)
- New password must meet minimum strength requirements (8+ characters)
- React request form shows a generic success message ("If an account exists with that email, a reset link has been sent")
- React confirmation form shows validation errors for weak password or token issues
- Successful password reset redirects to login page with a success message
- Email contains a link to the frontend reset confirmation page (not a Django URL)

## Testing Requirements

### Unit Tests (pytest)
_Backend token and serializer tests_

- `should generate valid password reset token for existing user`
- `should validate token and decode uidb64 correctly`
- `should reject expired password reset token`
- `should reject token after password has been changed (single-use)`
- `should reject new password shorter than 8 characters`
- `should validate new password and confirm password match`
- `should always return 200 on reset request regardless of email existence`

### API Tests (pytest + DRF APITestCase)
_Endpoint tests_

- `POST /api/auth/password-reset/ should return 200 for existing email`
- `POST /api/auth/password-reset/ should return 200 for non-existent email (no enumeration)`
- `POST /api/auth/password-reset/ should send email for existing user`
- `POST /api/auth/password-reset/ should not send email for non-existent user`
- `POST /api/auth/password-reset/confirm/ should return 200 and update password with valid token`
- `POST /api/auth/password-reset/confirm/ should return 400 for invalid token`
- `POST /api/auth/password-reset/confirm/ should return 400 for expired token`
- `POST /api/auth/password-reset/confirm/ should return 400 for weak new password`
- `user should be able to login with new password after reset`

### Frontend Tests (Vitest + MSW)
_React component and hook tests_

- `should render password reset request form with email field`
- `should display generic success message after reset request submission`
- `should render password reset confirmation form with password fields`
- `should display error for invalid or expired token`
- `should display validation errors for weak password`
- `should redirect to login page after successful password reset`
- `should call password reset API with form data on submit`
- `should call password reset confirm API with token and new password`

### E2E Tests (Playwright)
_Full password reset flow_

- `should complete password reset request flow and show success message`
- `should complete password reset confirmation with valid token`
- `should show error for invalid reset token`
- `should login with new password after successful reset`

### Test Dependencies
- pytest, pytest-django, factory_boy (backend)
- django.core.mail.outbox (email testing — Django test framework captures sent emails)
- Vitest, MSW, @testing-library/react (frontend)
- Playwright (E2E)

## Identified Gaps
- **Security**: Token expiration duration not specified (Django default is 3 days via `PASSWORD_RESET_TIMEOUT`)
- **Security**: Rate limiting on password reset request endpoint not specified
- **UX**: Email delivery time and retry behavior not specified
- **Infrastructure**: Production SMTP configuration details not defined (provider, credentials management)
- **Edge Cases**: Behavior when user requests multiple resets in quick succession not defined

## Dependencies
- **Depends on:** Story 48.1 (User model), Story 48.2 (login — needed to verify reset worked)
- **Blocks:** None directly

## Notes
- Django's `PasswordResetTokenGenerator` creates tokens based on the user's password hash, last login time, and a timestamp — changing the password automatically invalidates all existing tokens (single-use behavior)
- The `PASSWORD_RESET_TIMEOUT` setting controls token expiration (default 259200 seconds = 3 days). Consider reducing to 1 hour (3600 seconds) for better security.
- The reset email link should point to the React frontend URL (e.g., `https://app.example.com/reset-password/confirm/{uidb64}/{token}`) not a Django URL
- Use `django.core.mail.send_mail()` for sending — it automatically uses the configured email backend
- In tests, Django's test runner uses `locmem` email backend, and sent emails are captured in `django.core.mail.outbox`
- Consider adding a "Resend reset email" button with a cooldown timer on the frontend
