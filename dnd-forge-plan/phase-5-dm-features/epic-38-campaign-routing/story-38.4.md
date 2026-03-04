# Story 38.4 — Campaign Export & Import

> **Epic 38: Campaign Routing & Navigation** | **Phase 5: DM Features** (Weeks 9-10)

## Description

As a DM, I need to export my campaign data (including all characters) for backup or sharing with players.

## Technical Context

- **App**: D&D Character Forge — full-stack Django + React web application for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, React Query (server state), Zustand (UI state), Django REST Framework, PostgreSQL, React Router
- **Architecture**: Django REST API backend, React SPA frontend, PostgreSQL persistence, Django session auth. DM role authenticated via Django User model, campaigns have owner FK with join codes for player association.
- **Prior Phases Available**: Phase 1-4 (full character creation, sheet display, session play features including dice roller, HP tracker, spell slots, conditions, rest, level up)

This story implements campaign export and import, extending the Phase 3 JSON export/import system to handle full campaign data.

**Campaign data model** (exported fields):
```typescript
interface Campaign {
  id: string;
  name: string;
  description: string;
  dmId: string;
  joinCode: string;
  houseRules: HouseRules;
  characterIds: string[];
  sessions: SessionNote[];
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

**Export includes:** Campaign metadata, all linked characters (full Character objects), all session notes, all encounter history, all NPC entries, all loot entries.

**Two export modes:**
1. **Full export** — everything, including DM notes, NPC tracker entries, session notes. For DM backup and sharing with co-DMs.
2. **Player-safe export** — campaign metadata + characters but EXCLUDES DM notes, NPC tracker entries, and session notes marked as "DM Only." For sharing with players.

**Export filename:** `[CampaignName]_Campaign_Export_[date].json` (sanitized)

**Import validation** follows the Phase 3 pattern:
1. Syntax validation (valid JSON)
2. Schema validation (required fields present)
3. Type validation (field types correct)
4. Reference validation (character IDs, session links)
5. Business rules (campaign integrity)

**Merge handling:** If importing a campaign and some characters already exist locally (matched by name + race + class), offer:
- "Merge (update existing)" — updates existing characters with imported data
- "Import as new copy" — creates new character records with new IDs

New IDs are generated for the campaign and characters on import to prevent conflicts with existing local data.

## Tasks

- [ ] **T38.4.1** — "Export Campaign" action in the campaign context menu. Exports a JSON file containing: campaign metadata, all linked characters (full Character objects), all session notes, all encounter history, all NPC entries, all loot entries
- [ ] **T38.4.2** — Export filename: `[CampaignName]_Campaign_Export_[date].json` (sanitized)
- [ ] **T38.4.3** — "Export Campaign (Players Only)" option: exports campaign metadata + characters but excludes DM notes, NPC tracker entries, and session notes marked as "DM Only." Useful for sharing with players
- [ ] **T38.4.4** — Import campaign: validates structure similar to Phase 3 character import (syntax -> schema -> type -> reference -> business rules). Generates new IDs for campaign and characters to prevent conflicts
- [ ] **T38.4.5** — Merge handling: if importing a campaign and some characters already exist locally (matched by name + race + class), offer: "Merge (update existing)" or "Import as new copy"

## Acceptance Criteria

- "Export Campaign" generates a JSON file with all campaign data (metadata, characters, sessions, encounters, NPCs, loot)
- Export filename follows the pattern `[CampaignName]_Campaign_Export_[date].json`
- "Export Campaign (Players Only)" excludes DM notes, NPC entries, and DM-only session notes
- Import validates JSON structure using Phase 3 validation pipeline (syntax, schema, type, reference, business rules)
- New IDs are generated on import to prevent conflicts
- Merge handling detects existing characters and offers "Merge" or "Import as new copy"
- Imported campaigns are fully functional (all features work with imported data)
- Export/import round-trips preserve data integrity

## Testing Requirements

### Unit Tests (Vitest)
_For pure functions, calculations, data transforms, utilities, type guards, validators_

- `should export full campaign JSON with all data (metadata, characters, sessions, encounters, NPCs, loot)`
- `should generate sanitized filename: [CampaignName]_Campaign_Export_[date].json`
- `should exclude DM notes, NPC entries, and DM-only session notes in player-safe export`
- `should validate imported JSON through all 5 validation stages (syntax, schema, type, reference, business)`
- `should generate new IDs for campaign and characters on import to prevent conflicts`
- `should detect duplicate characters by name + race + class for merge handling`

### Functional Tests (React Testing Library)
_For component rendering, user interactions, state changes, prop variations_

- `should trigger full export from campaign context menu`
- `should trigger player-safe export from "Export Campaign (Players Only)" option`
- `should validate and reject invalid JSON on import with error message`
- `should offer "Merge (update existing)" and "Import as new copy" for duplicate characters`
- `should create a fully functional campaign from imported data`

### E2E Tests (Playwright)
_For critical user journeys, multi-step flows, full-page interactions_

- `should export a campaign, import it, and verify all data round-trips correctly`
- `should export player-safe version and verify DM notes and NPC entries are excluded`
- `should import a campaign with existing characters and successfully merge`

### Test Dependencies
- Mock campaign with full data (characters, sessions, encounters, NPCs, loot, DM notes)
- Campaign JSON fixtures (valid, invalid schema, missing fields, corrupted)
- Character fixtures with matching name + race + class for merge testing
- Phase 3 export/import utility mocks

## Identified Gaps

- **Error Handling**: No specification for handling export of very large campaigns (memory limits); no versioning for export schema compatibility
- **Loading/Empty States**: No progress indicator for large campaign import/export
- **Edge Cases**: Behavior when importing a campaign with characters that are in another campaign locally; merge handling with more than 2 matching characters; Date serialization/deserialization in JSON
- **Dependency Issues**: Export version field recommended in notes but not specified as a required field in the data model

## Dependencies

- Epic 33 Story 33.1 — Campaign data model (all types exported)
- Epic 33 Story 33.3 — Campaign list (export action in context menu)
- Story 38.3 — Join campaign flow (uses import for non-local campaigns)
- Phase 3 — JSON export/import system, validation pipeline

## Notes

- Campaign export/import is the primary sharing mechanism in Phase 5 (local-only). It bridges the gap until a backend sync system is built.
- The "Players Only" export is important for DM trust: DMs need confidence that sharing campaign data with players won't expose secrets, NPC plans, or upcoming plot points.
- The merge handling is critical for campaign continuity. If the DM exports a campaign, makes changes, and a player later imports an older version, the character data should be reconcilable.
- Consider adding a version field to the export format to handle future schema changes gracefully.
- Character matching for merge uses name + race + class as a heuristic. This is imperfect (two characters could share these attributes) but is a reasonable default. Allow the user to review and confirm matches.
