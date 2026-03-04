# Story 48.4 — Permission-Based Ownership

> **Epic 48: Authentication & Authorization** | **Phase 1: Foundation** (Weeks 1-2)

## Description
As a user, I should only be able to see and modify my own characters and campaigns so that my data is private and other users cannot access or alter it.

## Technical Context
- **App**: D&D Character Forge — full-stack Django + React web application for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, React Query (server state), Zustand (UI state), Django REST Framework, PostgreSQL, React Router
- **Architecture**: Django REST API backend, React SPA frontend, PostgreSQL persistence, Django session auth
- **Domain**: D&D 5th Edition SRD — 9 races (with subraces), 12 classes (with subclasses), ability scores, skills, spells, equipment, backgrounds, feats
- **Ownership model**: Every Character and Campaign record has an `owner` ForeignKey to the User model. DRF ViewSets filter querysets by `request.user` so users only see their own data. A custom `IsOwner` permission class ensures object-level access control on detail/update/delete actions. The `owner` field is set automatically from `request.user` on creation — it is not exposed in API request bodies.
- **Affected models**: Character, Campaign, and any future user-owned models

## Tasks
- [ ] **T48.4.1** — Add `owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='...')` to Character model in `backend/characters/models.py`
- [ ] **T48.4.2** — Add `owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='...')` to Campaign model in `backend/campaigns/models.py`
- [ ] **T48.4.3** — Create database migration for owner FK fields on Character and Campaign
- [ ] **T48.4.4** — Create `IsOwner` permission class in `backend/core/permissions.py` — checks `obj.owner == request.user` for object-level permissions
- [ ] **T48.4.5** — Update Character ViewSet to filter `get_queryset()` by `self.request.user` and add `IsOwner` to `permission_classes`
- [ ] **T48.4.6** — Update Campaign ViewSet to filter `get_queryset()` by `self.request.user` and add `IsOwner` to `permission_classes`
- [ ] **T48.4.7** — Update Character and Campaign serializers to make `owner` field read-only (excluded from input, included in output)
- [ ] **T48.4.8** — Override `perform_create()` in ViewSets to set `serializer.save(owner=self.request.user)` automatically
- [ ] **T48.4.9** — Update frontend API error handling to display 403 Forbidden responses appropriately
- [ ] **T48.4.10** — Write tests: queryset filtering, cross-user access denial, automatic owner assignment, permission class behavior

## Acceptance Criteria
- Character and Campaign models have a non-nullable `owner` ForeignKey to User
- List endpoints (`GET /api/characters/`, `GET /api/campaigns/`) return only records owned by the authenticated user
- Detail endpoints return 404 (not 403) when accessing another user's record (queryset filtering hides existence)
- Create endpoints automatically assign `owner` from `request.user` — no owner field in request body
- Update and delete endpoints return 403 if the authenticated user is not the owner
- Unauthenticated requests to character/campaign endpoints return 401
- The `owner` field is included in API responses (read-only) but not accepted in request bodies
- Database migration runs cleanly with a default value strategy for existing records

## Testing Requirements

### Unit Tests (pytest)
_Backend model and permission tests_

- `should create Character with owner FK set`
- `should create Campaign with owner FK set`
- `IsOwner should return True when request.user matches obj.owner`
- `IsOwner should return False when request.user does not match obj.owner`
- `should cascade delete characters when user is deleted`
- `should cascade delete campaigns when user is deleted`

### API Tests (pytest + DRF APITestCase)
_Endpoint access control tests_

- `GET /api/characters/ should return only characters owned by authenticated user`
- `GET /api/characters/ should return empty list for user with no characters`
- `GET /api/characters/:id/ should return 404 for character owned by another user`
- `POST /api/characters/ should set owner to request.user automatically`
- `PUT /api/characters/:id/ should return 403 for character owned by another user`
- `DELETE /api/characters/:id/ should return 403 for character owned by another user`
- `GET /api/campaigns/ should return only campaigns owned by authenticated user`
- `POST /api/campaigns/ should set owner to request.user automatically`
- `all character/campaign endpoints should return 401 when not authenticated`

### Frontend Tests (Vitest + MSW)
_React error handling tests_

- `should display appropriate message when API returns 403 Forbidden`
- `should display appropriate message when API returns 401 Unauthorized`
- `should only show characters belonging to the current user in gallery`

### E2E Tests (Playwright)
_Multi-user ownership flow_

- `should show only own characters after login`
- `should not be able to navigate to another user's character detail page`

### Test Dependencies
- pytest, pytest-django, factory_boy (backend)
- Vitest, MSW, @testing-library/react (frontend)
- Playwright (E2E)

## Identified Gaps
- **Data Migration**: Strategy for existing records without an owner (if any exist before this story) needs a default user or data migration
- **Sharing**: No sharing or collaborative access model defined (future enhancement)
- **Admin**: Superuser/admin access to all records not specified (Django admin should bypass ownership)
- **Edge Cases**: Behavior when a user is soft-deleted but their characters remain is not defined

## Dependencies
- **Depends on:** Story 48.1 (User model), Story 5.1 (Character/Campaign models), Story 5.2/5.3 (Character/Campaign CRUD endpoints)
- **Blocks:** All stories requiring user-scoped data access (Epics 5, 6, 22, 33-38)

## Notes
- Returning 404 instead of 403 for another user's records is a security best practice — it prevents enumeration of other users' resources
- The `IsOwner` permission class should be reusable for any model with an `owner` FK
- Django admin should not be restricted by `IsOwner` — admin users can see all records via the admin interface
- Consider adding an `IsOwnerOrAdmin` variant permission class for future admin API access
- The migration for adding `owner` FK should handle existing data: either set a default user or require the migration to run on an empty database
- `on_delete=models.CASCADE` means deleting a user deletes all their characters and campaigns — this is intentional but should be documented
