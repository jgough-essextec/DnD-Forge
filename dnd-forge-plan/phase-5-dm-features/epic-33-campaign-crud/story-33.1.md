# Story 33.1 — Campaign Data Model & Store

> **Epic 33: Campaign CRUD & Data Model** | **Phase 5: DM Features** (Weeks 9-10)

## Description

As a developer, I need the campaign data model, IndexedDB table, and Zustand store so that all DM features have a data foundation.

## Technical Context

- **App**: D&D Character Forge — local-first React PWA for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, Zustand (state), Dexie.js (IndexedDB), React Router
- **Architecture**: No backend, pure client-side, offline-capable PWA, IndexedDB for persistence. DM role is local (no authentication), campaigns are local data with join codes as local import mechanism.
- **Prior Phases Available**: Phase 1-4 (full character creation, sheet display, session play features including dice roller, HP tracker, spell slots, conditions, rest, level up)

This story establishes ALL data types needed for Phase 5 DM features. The following interfaces must be defined:

**Campaign** — core entity with `id`, `name`, `description`, `dmId`, `joinCode`, `houseRules`, `characterIds`, `sessions`, `isArchived`, `createdAt`, `updatedAt`.

**HouseRules:**
```typescript
interface HouseRules {
  allowedSources: ('SRD' | 'PHB' | 'XGE' | 'TCE' | 'Custom')[];
  abilityScoreMethod: 'standard_array' | 'point_buy' | 'rolling' | 'any';
  startingLevel: number;                // 1-20
  startingGold?: number;                // Override class starting gold
  hpMethod: 'roll' | 'average' | 'max_first_level' | 'any';
  allowFeats: boolean;
  allowMulticlass: boolean;
  encumbranceRule: 'none' | 'standard' | 'variant';
  criticalHitRule: 'double_dice' | 'max_plus_roll' | 'standard';
  customNotes: string;                  // Freeform DM notes on rules
}
```

**SessionNote:**
```typescript
interface SessionNote {
  id: string;
  sessionNumber: number;
  date: Date;
  title: string;
  summary: string;
  npcsEncountered: string[];
  locationsVisited: string[];
  lootAwarded: LootEntry[];
  xpAwarded?: number;
  milestoneLevel?: number;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}
```

**Encounter:**
```typescript
interface Encounter {
  id: string;
  campaignId: string;
  sessionId?: string;
  name: string;
  combatants: Combatant[];
  currentTurnIndex: number;
  roundNumber: number;
  isActive: boolean;
  xpBudget?: number;
  notes: string;
  createdAt: Date;
}
```

**Combatant:**
```typescript
interface Combatant {
  id: string;
  name: string;
  type: 'player' | 'npc' | 'monster';
  characterId?: string;
  initiativeRoll?: number;
  initiativeModifier: number;
  armorClass: number;
  hitPointMax: number;
  hitPointCurrent: number;
  tempHitPoints: number;
  conditions: string[];
  notes: string;
  isVisible: boolean;
  groupId?: string;
}
```

The `dmId` field uses a locally generated persistent user ID (UUID v4) stored in the preferences table. The user who creates a campaign is the DM by definition. There is no multi-user authentication.

Characters are linked to campaigns via `campaignId` on Character and `characterIds` on Campaign. A character can be in zero or one campaign at a time.

## Tasks

- [ ] **T33.1.1** — Define the full TypeScript interfaces: `Campaign`, `HouseRules`, `SessionNote`, `Encounter`, `Combatant`, `LootEntry`, `NPCEntry` in `types/campaign.ts`. Include all fields from Gap D3, D4, D5, D6 analysis
- [ ] **T33.1.2** — Extend the Dexie.js database schema (`db.ts`) with new tables: `campaigns` (indexed on `id, name, joinCode, isArchived`), `encounters` (indexed on `id, campaignId, isActive`). Bump DB version with migration
- [ ] **T33.1.3** — Create `stores/useCampaignStore.ts` (Zustand): state for `campaigns`, `activeCampaignId`, `activeEncounterId`. Actions: `createCampaign`, `updateCampaign`, `archiveCampaign`, `deleteCampaign`, `addCharacterToCampaign`, `removeCharacterFromCampaign`, `loadCampaigns`
- [ ] **T33.1.4** — Create `hooks/useCampaign.ts`: loads a single campaign by ID from IndexedDB, returns the campaign with its characters (resolved from `characterIds`), memoized with auto-refresh on changes
- [ ] **T33.1.5** — Generate a persistent local `userId` (UUID v4) on first app launch, stored in the preferences table. Used as `dmId` for campaigns created by this user

## Acceptance Criteria

- All TypeScript interfaces (`Campaign`, `HouseRules`, `SessionNote`, `Encounter`, `Combatant`, `LootEntry`, `NPCEntry`) are defined and exported from `types/campaign.ts`
- Dexie.js schema includes `campaigns` and `encounters` tables with proper indexes
- DB version is bumped with a working migration (no data loss for existing characters)
- Zustand store provides all CRUD actions for campaigns and loads from IndexedDB
- `useCampaign` hook resolves a campaign by ID with its linked characters
- A persistent local `userId` is generated on first launch and stored in preferences
- All types compile without errors and are importable by other Phase 5 stories

## Testing Requirements

### Unit Tests (Vitest)
_For pure functions, calculations, data transforms, utilities, type guards, validators_

- `should export all TypeScript interfaces (Campaign, HouseRules, SessionNote, Encounter, Combatant, LootEntry, NPCEntry) from types/campaign.ts`
- `should validate Campaign interface has all required fields (id, name, description, dmId, joinCode, houseRules, characterIds, sessions, isArchived, createdAt, updatedAt)`
- `should validate HouseRules defaults to standard 5e values (allowFeats: true, allowMulticlass: true, startingLevel: 1)`
- `should generate a valid UUID v4 for local userId on first launch`
- `should not regenerate userId if one already exists in preferences`
- `should enforce one-campaign-per-character constraint in store actions`
- `should correctly bump Dexie schema version with migration preserving existing character data`
- `should create campaign with auto-generated joinCode and dmId set to local userId`
- `should resolve campaign characterIds to full Character objects in useCampaign hook`
- `should return null/undefined from useCampaign when campaign ID does not exist`

### Functional Tests (React Testing Library)
_For component rendering, user interactions, state changes, prop variations_

- `should load campaigns from IndexedDB into Zustand store on initialization`
- `should add a character to a campaign and update both campaign.characterIds and character.campaignId`
- `should remove a character from a campaign without deleting the character`

### Test Dependencies
- Mock Dexie.js database with in-memory IndexedDB (fake-indexeddb)
- Mock Zustand store for campaign state
- Sample character fixtures from Phase 1-3 test data
- UUID generation mock for deterministic testing

## Identified Gaps

- **Error Handling**: No specification for handling Dexie schema migration failures or IndexedDB quota exceeded scenarios
- **Edge Cases**: Behavior undefined when characterIds references a deleted character; no validation for startingLevel range (1-20) at the type level
- **Performance**: No specification for maximum number of campaigns or characters per campaign at the data layer
- **Dependency Issues**: Preferences table for userId storage not explicitly defined in prior phases; may need to be created

## Dependencies

- Phase 1-3 Dexie.js database setup (`db.ts`)
- Phase 1-3 Character type definitions
- Existing Zustand store patterns from prior phases

## Notes

- This is the FOUNDATION story — every other Phase 5 story depends on it. Build and validate first.
- The `LootEntry` and `NPCEntry` interfaces should also be defined here even though they are primarily used in Epic 36, so all DM data types live in one file.
- The Campaign interface includes `sessions: SessionNote[]` as an embedded array (not a separate table), since session notes are always loaded with the campaign.
- Encounters get their own table because they can be large (many combatants) and are queried independently (active encounter lookup).
