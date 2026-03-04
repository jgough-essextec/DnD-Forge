# Story 5.1 — Database Schema & Initialization

> **Epic 5: Database Layer (Django ORM + PostgreSQL)** | **Phase 1: Foundation** (Weeks 1-2)

## Description
As a developer, I need Django models defined with proper PostgreSQL schema and migrations so the backend has a reliable, well-indexed relational data layer for characters, campaigns, and user preferences.

## Technical Context
- **App**: D&D Character Forge — full-stack Django + React web application for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, React Query (server state), Zustand (UI state), Django REST Framework, PostgreSQL, React Router
- **Architecture**: Django REST API backend, React SPA frontend, PostgreSQL persistence, Django session auth
- **Domain**: D&D 5th Edition SRD — 9 races (with subraces), 12 classes (with subclasses), ability scores, skills, spells, equipment, backgrounds, feats
- **Django ORM with PostgreSQL backend**: All persistence is handled server-side through Django models backed by PostgreSQL. The ORM provides model definitions, field validation, migration generation, and query building
- **Models**:
  - `Character` — stores full character data. UUID primary key via `models.UUIDField(default=uuid.uuid4, primary_key=True)`. Foreign keys to `Campaign` (nullable) and `User` (owner). Database indexes on `name`, `campaign`, `is_archived`, `updated_at`
  - `Campaign` — stores campaign data. UUID primary key. Foreign key to `User` (owner). Unique index on `join_code`
  - `UserPreferences` — stores per-user application preferences. UUID primary key. OneToOneField to `User`
- **Django migrations**: Schema changes are managed via `python manage.py makemigrations` and `python manage.py migrate`. Each model change produces a migration file that can be applied forward or rolled back
- **UUID primary keys**: All models use `models.UUIDField(default=uuid.uuid4, primary_key=True)` instead of auto-incrementing integers, providing globally unique identifiers suitable for distributed systems and client-side ID generation
- **Foreign keys**: `Character.campaign` (FK to Campaign, nullable), `Character.owner` (FK to User), `Campaign.owner` (FK to User), `UserPreferences.user` (OneToOne to User)
- **JSONField for complex nested data**: Fields like `ability_scores`, `skills`, `equipment`, and `spells` on Character use `models.JSONField()` to store structured nested data that does not require its own relational tables
- **Model Meta classes**: Each model defines `class Meta` with `ordering`, `indexes`, and `verbose_name` for proper database behavior and admin integration

## Tasks
- [ ] **T5.1.1** — Create `backend/characters/models.py` with the `Character` model. Fields: `id` (UUIDField, primary_key, default=uuid.uuid4), `name` (CharField, max_length=100), `race` (CharField, max_length=50), `class_name` (CharField, max_length=50), `level` (PositiveIntegerField, default=1), `ability_scores` (JSONField, default=dict), `skills` (JSONField, default=list), `equipment` (JSONField, default=list), `spells` (JSONField, default=list), `background` (CharField, max_length=100, blank=True), `hp` (PositiveIntegerField, default=0), `campaign` (ForeignKey to Campaign, null=True, blank=True, on_delete=SET_NULL), `owner` (ForeignKey to User, on_delete=CASCADE, related_name='characters'), `is_archived` (BooleanField, default=False), `created_at` (DateTimeField, auto_now_add=True), `updated_at` (DateTimeField, auto_now=True). Define `Meta` class with indexes on `name`, `campaign`, `is_archived`, `updated_at`, and `owner`
- [ ] **T5.1.2** — Create `backend/campaigns/models.py` with the `Campaign` model. Fields: `id` (UUIDField, primary_key, default=uuid.uuid4), `name` (CharField, max_length=200), `description` (TextField, blank=True), `join_code` (CharField, max_length=6, unique=True), `owner` (ForeignKey to User, on_delete=CASCADE, related_name='campaigns'), `settings` (JSONField, default=dict), `created_at` (DateTimeField, auto_now_add=True), `updated_at` (DateTimeField, auto_now=True). Define `Meta` class with indexes on `name` and ordering by `-updated_at`
- [ ] **T5.1.3** — Create `backend/users/models.py` with the `UserPreferences` model. Fields: `id` (UUIDField, primary_key, default=uuid.uuid4), `user` (OneToOneField to User, on_delete=CASCADE, related_name='preferences'), `theme` (CharField, max_length=10, choices=['light','dark'], default='dark'), `auto_save_enabled` (BooleanField, default=True), `last_active_character` (ForeignKey to Character, null=True, blank=True, on_delete=SET_NULL). Define `Meta` class with verbose_name and verbose_name_plural
- [ ] **T5.1.4** — Run `python manage.py makemigrations characters campaigns users` and verify that migration files are generated correctly. Run `python manage.py migrate` against a test PostgreSQL database and confirm all tables are created with the expected columns, indexes, and constraints
- [ ] **T5.1.5** — Write model unit tests verifying: all fields exist with correct types, UUID primary keys are auto-generated, FK constraints enforce referential integrity (deleting a User cascades to Characters/Campaigns, deleting a Campaign sets Character.campaign to NULL), unique constraint on Campaign.join_code, default values are applied, `__str__` methods return meaningful representations

## Acceptance Criteria
- All three models (`Character`, `Campaign`, `UserPreferences`) are defined in their respective Django apps
- Migrations generate cleanly with `makemigrations` and apply without errors via `migrate`
- UUID primary keys are auto-generated on object creation
- Database indexes exist on `Character.name`, `Character.campaign`, `Character.is_archived`, `Character.updated_at`, and `Character.owner`
- Database indexes exist on `Campaign.name` and `Campaign.join_code` (unique)
- Foreign key constraints are enforced: deleting a User cascades to their Characters and Campaigns, deleting a Campaign sets `Character.campaign` to NULL
- `UserPreferences` has a OneToOne relationship to User ensuring one preferences record per user
- JSONField columns accept and return structured Python dicts/lists
- All model unit tests pass

## Testing Requirements

### Unit Tests (pytest + Django TestCase)
_For model definitions, field validation, constraints, defaults, and relationships_

- `should create a Character with auto-generated UUID primary key`
- `should create a Character with correct default values (level=1, is_archived=False, hp=0)`
- `should enforce CharField max_length constraints on Character.name and Character.race`
- `should store and retrieve nested data in Character.ability_scores JSONField`
- `should store and retrieve list data in Character.skills JSONField`
- `should cascade delete Characters when owner User is deleted`
- `should set Character.campaign to NULL when Campaign is deleted (SET_NULL)`
- `should create a Campaign with auto-generated UUID primary key`
- `should enforce unique constraint on Campaign.join_code`
- `should cascade delete Campaigns when owner User is deleted`
- `should create UserPreferences with OneToOne link to User`
- `should enforce OneToOne constraint (only one preferences per user)`
- `should apply default theme='dark' and auto_save_enabled=True on UserPreferences`
- `should set last_active_character to NULL when referenced Character is deleted`
- `should verify database indexes exist via Django connection introspection`

### Test Dependencies
- `pytest` and `pytest-django` for test execution
- `django.test.TestCase` for transactional test isolation
- `factory_boy` with `DjangoModelFactory` for creating test fixtures (User, Character, Campaign, UserPreferences)
- `django.contrib.auth.models.User` for owner/user FK references

## Identified Gaps

- **Error Handling**: No specification for handling migration conflicts when multiple developers modify models concurrently (merge migrations)
- **Edge Cases**: No specification for JSONField schema validation (e.g., ensuring ability_scores has the expected keys). Consider adding model-level `clean()` validation in a future story
- **Performance**: No specification for database connection pooling settings or query optimization guidelines. Consider adding `django-db-connection-pool` or pgBouncer configuration

## Dependencies
- **Depends on:** Story 1.3 (Django and DRF installed, PostgreSQL configured), Story 2.8 (Character type informs model fields), Story 2.9 (Campaign type informs model fields), Story 2.10 (UserPreferences type informs model fields)
- **Blocks:** Story 5.2 (Character CRUD API), Story 5.3 (Campaign CRUD API), Story 5.4 (Auto-save & Preferences API)

## Notes
- Django's `auto_now_add=True` and `auto_now=True` on DateTimeField handle `created_at` and `updated_at` timestamps automatically. These fields are not editable via forms or serializers by default
- `JSONField` uses PostgreSQL's native `jsonb` column type, which supports indexing and querying into JSON structures via Django ORM lookups like `ability_scores__strength__gt=10`
- The `related_name` on ForeignKey fields enables reverse lookups: `user.characters.all()`, `user.campaigns.all()`, `campaign.characters.all()`
- Consider adding a custom model manager for Character that filters out archived characters by default (e.g., `Character.active.all()` vs `Character.objects.all()`)
- UUID primary keys avoid sequential ID enumeration attacks and simplify potential future multi-database or data migration scenarios
- The `on_delete` behavior is critical: CASCADE for ownership (User deletes take everything), SET_NULL for optional associations (Campaign deletion does not destroy characters)
