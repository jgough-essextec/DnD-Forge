# Epic 5: Database Layer (Django ORM + PostgreSQL)
> **Phase 1: Foundation** (Weeks 1-2)

## Summary
A fully functional server-side persistence layer using Django models, DRF ViewSets, and PostgreSQL. Provides RESTful API endpoints for characters, campaigns, and preferences with CRUD operations, auto-save via React Query mutations, and import/export.

## Stories
| # | Story | Tasks | Description |
|---|-------|-------|-------------|
| 5.1 | Django Models & Migrations | 5 | Django models for characters/campaigns/preferences, PostgreSQL schema, indexes, migrations, model validation |
| 5.2 | Character API Endpoints | 10 | DRF ViewSets and serializers for all character data operations: create, read, update, archive, delete, duplicate, export, import |
| 5.3 | Campaign API Endpoints | 8 | DRF ViewSets and serializers for campaign management: create, read, update, add/remove characters, query by campaign |
| 5.4 | Auto-Save & Preferences API | 5 | React Query mutation hooks for debounced auto-save of character edits, user preference API endpoints with defaults |

## Technical Scope
- **Database:** PostgreSQL with Django ORM for server-side persistence
- **API:** Django REST Framework ViewSets, serializers, and routers
- **Models:** Character, Campaign, UserPreferences
- **Indexes:** characters on id/name/campaign/is_archived/updated_at; campaigns on id/name/join_code; preferences on user
- **Features:** CRUD operations via REST API, soft delete (archive), deep clone (duplicate), JSON export/import endpoints, debounced auto-save via React Query mutations, optimistic updates
- **Testing:** pytest + Django TestCase + DRF APITestCase covering full CRUD lifecycle, concurrent updates, export/import roundtrip; MSW (Mock Service Worker) for frontend integration tests

## Testing Summary

| Story | Unit | Functional | E2E | Total |
|-------|------|-----------|-----|-------|
| 5.1 — Django Models & Migrations | 8 | 0 | 0 | 8 |
| 5.2 — Character API Endpoints | 17 | 0 | 0 | 17 |
| 5.3 — Campaign API Endpoints | 11 | 0 | 0 | 11 |
| 5.4 — Auto-Save & Preferences API | 8 | 2 | 0 | 10 |
| **Totals** | **44** | **2** | **0** | **46** |

### Key Gaps Found
- Error handling for database failures (connection errors, constraint violations, transaction failures) not specified
- Import validation behavior for unrecognized formatVersion not specified
- Concurrent update error message format not specified
- Campaign deletion behavior for associated characters not explicit in acceptance criteria
- Auto-save failure retry mechanism described in notes but not in acceptance criteria
- No "save in progress" indicator specified

## Dependencies
- **Depends on:** Epic 2 (Type System) — stores Character, Campaign, and Preferences types; Epic 4 (Calculation Engine) — calculation results stored on Character; Epic 48 (Authentication) — API endpoints require authenticated users
- **Blocks:** Epic 6 (State Management) — React Query hooks consume the API layer
