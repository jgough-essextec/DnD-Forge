# Story 5.4 — Auto-Save & Preferences

> **Epic 5: Database Layer (Django ORM + PostgreSQL)** | **Phase 1: Foundation** (Weeks 1-2)

## Description
As a developer, I need a backend preferences API endpoint and a React `useAutoSave` hook that uses React Query mutations with debounce to automatically persist character edits to the Django REST API.

## Technical Context
- **App**: D&D Character Forge — full-stack Django + React web application for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, React Query (server state), Zustand (UI state), Django REST Framework, PostgreSQL, React Router
- **Architecture**: Django REST API backend, React SPA frontend, PostgreSQL persistence, Django session auth
- **Domain**: D&D 5th Edition SRD — 9 races (with subraces), 12 classes (with subclasses), ability scores, skills, spells, equipment, backgrounds, feats
- **Preferences API**: A single-object endpoint for the authenticated user's preferences. `GET /api/preferences/` returns the user's preferences (creating defaults if none exist). `PUT /api/preferences/` updates the preferences. This is not a collection endpoint — there is exactly one preferences record per user, enforced by the OneToOneField to User
- **Auto-save via React Query**: The `useAutoSave` hook uses React Query's `useMutation` to send `PATCH /api/characters/:id/` requests. A 2-second debounce delay prevents excessive API calls while the user is actively editing. The mutation uses optimistic updates to immediately reflect changes in the React Query cache, with automatic rollback on API error
- **Optimistic updates**: When the user makes a character edit, the React Query cache is updated immediately (no loading state visible to the user). If the API call fails, the cache rolls back to the previous value and an error indicator is shown
- **Auto-save indicator**: A small UI component that displays the current save state: "Saving..." (mutation in flight), "Saved" (mutation succeeded), or "Error saving" (mutation failed). This provides feedback without blocking the user's workflow
- **Debounce strategy**: Uses a 2-second debounce (not 500ms) because API calls are more expensive than local IndexedDB writes. Rapid keystrokes and slider adjustments coalesce into a single PATCH request

## Tasks
- [ ] **T5.4.1** — Create `backend/users/serializers.py` with `UserPreferencesSerializer` using `ModelSerializer`. Include fields: `theme`, `auto_save_enabled`, `last_active_character`. Set `id` and `user` as read-only. Create `backend/users/views.py` with `UserPreferencesViewSet` that provides only `retrieve` and `update` actions (no list/create/delete). Override `get_object()` to return the authenticated user's preferences, creating a default record with `get_or_create()` if none exists. Register route at `GET/PUT /api/preferences/` (singular, not a collection)
- [ ] **T5.4.2** — Create React `useAutoSave` hook in `frontend/src/hooks/useAutoSave.ts`. Accept `characterId: string` and `characterData: Partial<Character>` as arguments. Use React Query's `useMutation` to call `PATCH /api/characters/:id/`. Implement a 2-second debounce using `useRef` for the timer and `useEffect` to trigger on data changes. Clean up the timer on unmount. Return `{ status: 'idle' | 'saving' | 'saved' | 'error', lastSavedAt: Date | null }`
- [ ] **T5.4.3** — Implement optimistic updates in the `useAutoSave` mutation. In `onMutate`, cancel outgoing queries for the character, snapshot the previous value from cache, and update the cache optimistically. In `onError`, roll back to the snapshot. In `onSettled`, invalidate the character query to refetch from server
- [ ] **T5.4.4** — Create `AutoSaveIndicator` component in `frontend/src/components/AutoSaveIndicator.tsx`. Display "Saving..." with a spinner during mutation, "Saved" with a checkmark on success (fades after 3 seconds), and "Error saving" with a retry button on failure. Accept the `useAutoSave` return value as props
- [ ] **T5.4.5** — Write tests. Backend: API tests in `backend/users/tests/test_api.py` for the preferences endpoint using `APITestCase` — test GET returns defaults for new user, PUT updates preferences, unauthenticated access is rejected. Frontend: Vitest tests in `frontend/src/hooks/__tests__/useAutoSave.test.ts` using MSW (Mock Service Worker) to mock API calls — test debounce behavior, optimistic update and rollback, cleanup on unmount

## Acceptance Criteria
- `GET /api/preferences/` returns the authenticated user's preferences, creating a default record (theme='dark', auto_save_enabled=True) if none exists
- `PUT /api/preferences/` updates the user's preferences and returns the updated object
- Unauthenticated requests to `/api/preferences/` return 401 or 403
- The `useAutoSave` hook debounces character updates by 2 seconds — multiple rapid changes result in only one API call
- The `useAutoSave` hook does not fire if the character data has not changed (reference equality check)
- Optimistic updates immediately reflect in the React Query cache; failed mutations roll back to the previous cached value
- The `AutoSaveIndicator` component displays "Saving...", "Saved", or "Error saving" based on mutation state
- The debounce timer is cleaned up on component unmount, preventing API calls after the component is gone
- Backend API tests verify preferences CRUD and default creation
- Frontend tests verify debounce coalescing, optimistic updates, rollback on error, and cleanup on unmount

## Testing Requirements

### Backend API Tests (pytest + DRF APITestCase)
_For preferences endpoint behavior, default creation, and permissions_

- `should return 200 with user preferences on GET /api/preferences/`
- `should create default preferences (theme=dark, auto_save_enabled=True) if none exist on GET /api/preferences/`
- `should return 200 with updated preferences on PUT /api/preferences/`
- `should persist preference changes across requests`
- `should return 401 or 403 for unauthenticated requests to /api/preferences/`
- `should not allow accessing another user's preferences`

### Frontend Unit Tests (Vitest + MSW)
_For useAutoSave hook behavior and AutoSaveIndicator component_

- `should debounce API calls by 2 seconds via useAutoSave`
- `should coalesce multiple rapid changes into a single PATCH request via useAutoSave`
- `should not trigger API call if character data has not changed via useAutoSave`
- `should optimistically update React Query cache on mutation via useAutoSave`
- `should roll back React Query cache on API error via useAutoSave`
- `should clean up debounce timer on component unmount via useAutoSave`
- `should return status 'saving' while mutation is in flight`
- `should return status 'saved' after successful mutation`
- `should return status 'error' after failed mutation`
- `should render "Saving..." text when status is saving via AutoSaveIndicator`
- `should render "Saved" text when status is saved via AutoSaveIndicator`
- `should render "Error saving" with retry button when status is error via AutoSaveIndicator`

### Test Dependencies
- Backend: `pytest`, `pytest-django`, `rest_framework.test.APITestCase`, `rest_framework.test.APIClient`, `factory_boy` for test fixtures
- Frontend: `vitest`, `@testing-library/react`, `@testing-library/react-hooks`, `msw` (Mock Service Worker) for API mocking, `vi.useFakeTimers()` for debounce timer testing, `@tanstack/react-query` test utilities (`QueryClientProvider` wrapper)

## Identified Gaps

- **Error Handling**: Auto-save failure retry strategy not specified (retry once? exponential backoff?). Consider adding a single automatic retry before showing the error state
- **Loading/Empty States**: No specification for behavior during initial page load when the character is still being fetched from the API (auto-save should not trigger until initial data is loaded)
- **Edge Cases**: Behavior when the user navigates away while a save is in flight. Consider using `navigator.sendBeacon` or a `beforeunload` handler to flush pending saves
- **Edge Cases**: Conflict resolution when two browser tabs edit the same character simultaneously. Consider adding `updated_at`-based optimistic locking on the PATCH endpoint in a future story

## Dependencies
- **Depends on:** Story 5.1 (UserPreferences model defined and migrated), Story 5.2 (Character PATCH endpoint for auto-save mutations), Story 1.3 (Django/DRF, React Query, MSW installed)
- **Blocks:** Epic 6 Story 6.1 (Character editing UI consumes useAutoSave), Epic 6 Story 6.3 (UI theme consumes preferences API)

## Notes
- The preferences endpoint uses `get_or_create()` in `get_object()` to handle the case where a newly registered user has no preferences record yet. This is a common Django pattern for single-object-per-user endpoints
- The 2-second debounce delay is a balance between responsiveness (user sees "Saved" relatively quickly) and efficiency (not hammering the API on every keystroke). This is configurable via an optional parameter on the hook
- React Query's `useMutation` provides `onMutate`, `onError`, `onSuccess`, and `onSettled` callbacks that map directly to the optimistic update pattern. See the React Query documentation on optimistic updates for the canonical implementation
- The `AutoSaveIndicator` component should use `useEffect` with a timer to auto-hide the "Saved" message after 3 seconds, returning to an idle state
- MSW (Mock Service Worker) intercepts fetch/XHR requests at the network level, making it ideal for testing hooks that make real API calls. Define handlers for `PATCH /api/characters/:id/` that return success or error responses
- Consider using React Query's `queryClient.setQueryData()` in `onMutate` for the optimistic cache update and `queryClient.setQueryData()` with the snapshot in `onError` for rollback
