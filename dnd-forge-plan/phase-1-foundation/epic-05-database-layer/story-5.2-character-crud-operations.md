# Story 5.2 — Character CRUD Operations

> **Epic 5: Database Layer (Django ORM + PostgreSQL)** | **Phase 1: Foundation** (Weeks 1-2)

## Description
As a developer, I need Django REST Framework API endpoints for Character CRUD operations so the React frontend can create, read, update, and delete characters through a RESTful API with proper ownership-based access control.

## Technical Context
- **App**: D&D Character Forge — full-stack Django + React web application for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, React Query (server state), Zustand (UI state), Django REST Framework, PostgreSQL, React Router
- **Architecture**: Django REST API backend, React SPA frontend, PostgreSQL persistence, Django session auth
- **Domain**: D&D 5th Edition SRD — 9 races (with subraces), 12 classes (with subclasses), ability scores, skills, spells, equipment, backgrounds, feats
- **DRF ViewSet pattern**: Django REST Framework provides `ModelViewSet` which automatically maps HTTP methods to CRUD actions: `GET /` (list), `POST /` (create), `GET /:id/` (retrieve), `PUT /:id/` (update), `DELETE /:id/` (destroy). Routes are registered via `DefaultRouter`
- **Serializer**: `CharacterSerializer` handles validation, field selection, and JSON serialization/deserialization of the Character model. Nested JSONField data (ability_scores, skills, equipment, spells) is passed through as-is
- **Ownership permission**: An `IsOwner` custom permission class ensures users can only access their own characters. The queryset is filtered by `owner=request.user` to prevent enumeration of other users' data
- **Automatic owner assignment**: On `perform_create`, the viewset sets `owner=request.user` so the authenticated user is automatically assigned as the character's owner
- **API endpoints**:
  - `GET /api/characters/` — list authenticated user's characters (excludes archived by default, supports `?include_archived=true` query param)
  - `POST /api/characters/` — create a new character owned by the authenticated user
  - `GET /api/characters/:id/` — retrieve a single character by UUID (owner only)
  - `PUT /api/characters/:id/` — full update of a character (owner only)
  - `PATCH /api/characters/:id/` — partial update of a character (owner only)
  - `DELETE /api/characters/:id/` — permanently delete a character (owner only)

## Tasks
- [ ] **T5.2.1** — Create `backend/characters/serializers.py` with `CharacterSerializer` using `ModelSerializer`. Include all Character model fields. Set `id`, `created_at`, `updated_at`, and `owner` as read-only fields. Validate that `level` is between 1 and 20, `name` is non-empty, and `class_name` is non-empty
- [ ] **T5.2.2** — Create `backend/characters/views.py` with `CharacterViewSet` extending `ModelViewSet`. Override `get_queryset()` to filter by `owner=request.user` and exclude archived characters by default. Override `perform_create()` to set `owner=request.user`. Add `?include_archived=true` query parameter support
- [ ] **T5.2.3** — Register URL routes in `backend/characters/urls.py` using `DefaultRouter`. Register the `CharacterViewSet` at the `characters` prefix. Include in the project's root `urls.py` under `/api/`. Final routes: `GET/POST /api/characters/`, `GET/PUT/PATCH/DELETE /api/characters/<uuid:pk>/`
- [ ] **T5.2.4** — Create `backend/characters/permissions.py` with `IsOwner` permission class. Implement `has_object_permission()` to check `obj.owner == request.user`. Apply this permission to the `CharacterViewSet` alongside `IsAuthenticated`
- [ ] **T5.2.5** — Write API tests in `backend/characters/tests/test_api.py` using DRF's `APITestCase` and `APIClient`. Test all CRUD operations, permission checks (cannot access another user's characters), validation errors (missing name, invalid level), and filtering behavior (archived characters excluded by default)

## Acceptance Criteria
- `CharacterSerializer` serializes all Character model fields and enforces validation (level 1-20, non-empty name)
- `GET /api/characters/` returns only characters owned by the authenticated user, excluding archived characters by default
- `POST /api/characters/` creates a character with `owner` automatically set to the authenticated user
- `GET /api/characters/:id/` returns 200 for the owner, 404 for other users (not 403, to prevent ID enumeration)
- `PUT /api/characters/:id/` and `PATCH /api/characters/:id/` update character fields and automatically update `updated_at`
- `DELETE /api/characters/:id/` permanently removes the character and returns 204
- Unauthenticated requests to all endpoints return 401 or 403
- A user cannot list, retrieve, update, or delete another user's characters
- Validation errors return 400 with descriptive error messages
- All API tests pass

## Testing Requirements

### API Tests (pytest + DRF APITestCase)
_For HTTP endpoint behavior, serialization, permissions, and validation_

- `should return 200 with list of user's characters on GET /api/characters/`
- `should return only characters owned by the authenticated user (not other users' characters)`
- `should exclude archived characters by default on GET /api/characters/`
- `should include archived characters when ?include_archived=true on GET /api/characters/`
- `should return 201 with created character on POST /api/characters/ with valid data`
- `should automatically set owner to authenticated user on POST /api/characters/`
- `should return 400 with validation errors on POST /api/characters/ with invalid data (missing name, level > 20)`
- `should return 200 with character data on GET /api/characters/:id/ for owner`
- `should return 404 on GET /api/characters/:id/ for non-owner (prevents ID enumeration)`
- `should return 404 on GET /api/characters/:id/ for non-existent UUID`
- `should return 200 with updated character on PUT /api/characters/:id/ for owner`
- `should return 200 with partially updated character on PATCH /api/characters/:id/ for owner`
- `should return 204 on DELETE /api/characters/:id/ for owner`
- `should return 404 on DELETE /api/characters/:id/ for non-owner`
- `should return 401 or 403 for unauthenticated requests to all endpoints`

### Test Dependencies
- `pytest` and `pytest-django` for test execution
- `rest_framework.test.APITestCase` and `rest_framework.test.APIClient` for HTTP-level testing
- `factory_boy` with `DjangoModelFactory` for creating User, Character, and Campaign test fixtures
- `django.contrib.auth.models.User` for creating authenticated test users

## Identified Gaps

- **Error Handling**: No specification for handling concurrent updates (two users PUTting the same character). Consider adding `updated_at`-based optimistic locking in a future story
- **Error Handling**: No specification for bulk operations (delete multiple characters at once)
- **Edge Cases**: No specification for pagination — `GET /api/characters/` could return large result sets. Consider adding DRF pagination (e.g., `PageNumberPagination`) in a future story
- **Edge Cases**: No specification for character search/filtering beyond archive status (e.g., filter by campaign, search by name)

## Dependencies
- **Depends on:** Story 5.1 (Character model defined and migrated), Story 1.3 (Django/DRF installed and configured)
- **Blocks:** Story 5.4 (auto-save uses character update endpoint), Epic 6 Story 6.1 (React Query hooks call these API endpoints)

## Notes
- DRF's `ModelViewSet` provides all CRUD actions out of the box via router registration. The `DefaultRouter` generates URL patterns including a browsable API root
- Filtering the queryset by `owner=request.user` in `get_queryset()` is the DRF-recommended approach for ownership scoping. It returns 404 instead of 403 for non-owned objects, which prevents attackers from enumerating valid UUIDs
- `perform_create()` is the DRF hook for modifying the object before saving. Setting `serializer.save(owner=self.request.user)` ensures the owner is always the authenticated user regardless of what the client sends
- The `IsOwner` permission class provides an additional layer of defense beyond queryset filtering. Both mechanisms should be in place for defense-in-depth
- Consider adding `@action(detail=True, methods=['post'])` custom actions for archive/unarchive and duplicate operations in a future story, rather than requiring the client to PATCH `is_archived` directly
- Django's `auto_now=True` on `updated_at` means the timestamp is updated on every `.save()` call, so PUT/PATCH operations automatically get fresh timestamps
