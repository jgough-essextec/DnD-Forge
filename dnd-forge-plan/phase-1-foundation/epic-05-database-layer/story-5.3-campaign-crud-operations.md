# Story 5.3 — Campaign CRUD Operations

> **Epic 5: Database Layer (Django ORM + PostgreSQL)** | **Phase 1: Foundation** (Weeks 1-2)

## Description
As a developer, I need Django REST Framework API endpoints for Campaign CRUD operations with join code support so users can create and manage campaigns and other players can join via a shareable code.

## Technical Context
- **App**: D&D Character Forge — full-stack Django + React web application for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, React Query (server state), Zustand (UI state), Django REST Framework, PostgreSQL, React Router
- **Architecture**: Django REST API backend, React SPA frontend, PostgreSQL persistence, Django session auth
- **Domain**: D&D 5th Edition SRD — 9 races (with subraces), 12 classes (with subclasses), ability scores, skills, spells, equipment, backgrounds, feats
- **DRF ViewSet pattern**: `CampaignViewSet` extends `ModelViewSet` for standard CRUD. A custom `@action` provides the join-by-code flow. Routes are registered via `DefaultRouter`
- **Join code**: A unique 6-character alphanumeric code (uppercase letters and digits, `[A-Z0-9]`) auto-generated when a campaign is created. The `generate_join_code()` model method generates a random code and retries if it collides with an existing one. The `join_code` field has a `unique=True` database constraint
- **Campaign ownership**: The campaign `owner` (FK to User) is the DM. The owner has full CRUD access. Other users interact via the join endpoint
- **Join flow**: `POST /api/campaigns/:id/join/` accepts a `join_code` in the request body, validates it matches the campaign, and adds the requesting user's character to the campaign by setting `Character.campaign = campaign`
- **Character-Campaign association**: Characters are linked to campaigns via the `Character.campaign` ForeignKey. Querying a campaign's characters uses the reverse relation `campaign.characters.all()`
- **API endpoints**:
  - `GET /api/campaigns/` — list authenticated user's campaigns (owned by user)
  - `POST /api/campaigns/` — create a new campaign (join_code auto-generated)
  - `GET /api/campaigns/:id/` — retrieve a campaign by UUID
  - `PUT /api/campaigns/:id/` — full update (owner only)
  - `PATCH /api/campaigns/:id/` — partial update (owner only)
  - `DELETE /api/campaigns/:id/` — delete campaign (owner only, sets associated characters' campaign FK to NULL)
  - `POST /api/campaigns/:id/join/` — join a campaign by providing the correct join_code

## Tasks
- [ ] **T5.3.1** — Create `backend/campaigns/serializers.py` with `CampaignSerializer` using `ModelSerializer`. Include all Campaign model fields. Set `id`, `join_code`, `created_at`, `updated_at`, and `owner` as read-only fields. The `join_code` is auto-generated and should never be set by the client. Add a nested read-only `characters` field that returns a summary list of characters in the campaign
- [ ] **T5.3.2** — Create `backend/campaigns/views.py` with `CampaignViewSet` extending `ModelViewSet`. Override `get_queryset()` to filter by `owner=request.user`. Override `perform_create()` to set `owner=request.user` and call `generate_join_code()`. Apply `IsAuthenticated` and `IsOwner` permissions
- [ ] **T5.3.3** — Add `generate_join_code()` method to the Campaign model in `backend/campaigns/models.py`. Generate a random 6-character uppercase alphanumeric string from `[A-Z0-9]`. Query the database for uniqueness and retry (up to 10 attempts) if a collision is found. Call this method in the model's `save()` on creation (when `join_code` is empty)
- [ ] **T5.3.4** — Add a `join` custom action to `CampaignViewSet` using `@action(detail=True, methods=['post'])`. Accept `{"join_code": "ABC123", "character_id": "<uuid>"}` in the request body. Validate the join_code matches the campaign. Validate the character exists and is owned by the requesting user. Set `character.campaign = campaign` and save. Return 200 on success, 400 on invalid code or character
- [ ] **T5.3.5** — Register URL routes in `backend/campaigns/urls.py` using `DefaultRouter`. Register the `CampaignViewSet` at the `campaigns` prefix. Include in the project's root `urls.py` under `/api/`. Write API tests in `backend/campaigns/tests/test_api.py` covering all CRUD operations, join code generation uniqueness, join flow (success and failure), and permission checks

## Acceptance Criteria
- `CampaignSerializer` serializes all Campaign fields with `join_code` as read-only (auto-generated on creation)
- `POST /api/campaigns/` creates a campaign with a unique 6-character alphanumeric join code and sets `owner` to the authenticated user
- `GET /api/campaigns/` returns only campaigns owned by the authenticated user
- `GET /api/campaigns/:id/` returns campaign details including a summary of associated characters
- `PUT /api/campaigns/:id/` and `PATCH /api/campaigns/:id/` update campaign fields (owner only), `join_code` cannot be changed
- `DELETE /api/campaigns/:id/` deletes the campaign (owner only), associated characters' `campaign` FK is set to NULL (via model's `on_delete=SET_NULL`)
- `POST /api/campaigns/:id/join/` validates the join code, validates the character belongs to the requesting user, sets the character's campaign FK, and returns 200
- `POST /api/campaigns/:id/join/` returns 400 if the join code does not match or the character is invalid
- Join codes are unique across all campaigns (enforced by database unique constraint)
- Generated join codes are exactly 6 characters, uppercase alphanumeric
- All API tests pass

## Testing Requirements

### API Tests (pytest + DRF APITestCase)
_For HTTP endpoint behavior, serialization, permissions, join code logic, and validation_

- `should return 200 with list of user's campaigns on GET /api/campaigns/`
- `should return only campaigns owned by the authenticated user`
- `should return 201 with created campaign including auto-generated join_code on POST /api/campaigns/`
- `should generate a 6-character uppercase alphanumeric join_code on campaign creation`
- `should generate unique join codes across multiple campaign creations`
- `should set owner to authenticated user on POST /api/campaigns/`
- `should return 200 with campaign details on GET /api/campaigns/:id/ for owner`
- `should return 404 on GET /api/campaigns/:id/ for non-owner`
- `should return 200 with updated campaign on PUT /api/campaigns/:id/ for owner`
- `should not allow changing join_code via PUT or PATCH`
- `should return 204 on DELETE /api/campaigns/:id/ for owner`
- `should set associated characters' campaign to NULL on campaign deletion`
- `should return 200 on POST /api/campaigns/:id/join/ with correct join_code and valid character`
- `should set character.campaign to the campaign on successful join`
- `should return 400 on POST /api/campaigns/:id/join/ with incorrect join_code`
- `should return 400 on POST /api/campaigns/:id/join/ with character not owned by requesting user`
- `should return 401 or 403 for unauthenticated requests to all endpoints`

### Test Dependencies
- `pytest` and `pytest-django` for test execution
- `rest_framework.test.APITestCase` and `rest_framework.test.APIClient` for HTTP-level testing
- `factory_boy` with `DjangoModelFactory` for creating User, Character, and Campaign test fixtures
- `django.contrib.auth.models.User` for creating authenticated test users

## Identified Gaps

- **Error Handling**: No specification for what happens when a character already belongs to a different campaign and attempts to join a new one (move or reject?). Consider requiring the character to leave the current campaign first
- **Error Handling**: No specification for campaign membership tracking beyond the Character FK. A future ManyToMany `members` field on Campaign could track which users have joined
- **Edge Cases**: Join code collision handling is addressed by retry logic, but 10 retries may not be sufficient if the code space becomes crowded. This is extremely unlikely with 36^6 combinations but should log a warning

## Dependencies
- **Depends on:** Story 5.1 (Campaign and Character models defined and migrated), Story 5.2 (Character API for character ownership validation), Story 1.3 (Django/DRF installed and configured)
- **Blocks:** Epic 6 (React Query hooks for campaign API), Phase 4+ (Campaign management UI)

## Notes
- Join code generation uses Python's `random.choices(string.ascii_uppercase + string.digits, k=6)` to produce a random 6-character string. The `unique=True` database constraint is the ultimate guarantee of uniqueness; the retry loop in `generate_join_code()` handles the application-level collision check
- The `@action(detail=True, methods=['post'])` decorator on the `join` method generates the URL pattern `/api/campaigns/<pk>/join/` automatically via the router
- Campaign deletion uses the model's `on_delete=SET_NULL` on `Character.campaign`, so PostgreSQL automatically nullifies the FK on associated characters when a campaign is deleted. No manual cleanup is needed
- The join flow intentionally requires both the `join_code` and `character_id` so the system knows which of the user's characters to associate with the campaign
- Consider adding a `leave` action (`POST /api/campaigns/:id/leave/`) in a future story that sets `character.campaign = None`
- The `settings` JSONField on Campaign can store house rules, allowed sources, and other campaign-specific configuration. Validation of the settings structure can be added via a custom serializer field or model `clean()` method
