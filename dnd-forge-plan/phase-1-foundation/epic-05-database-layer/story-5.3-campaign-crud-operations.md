# Story 5.3 — Campaign CRUD Operations

> **Epic 5: Database Layer (IndexedDB via Dexie.js)** | **Phase 1: Foundation** (Weeks 1-2)

## Description
As a developer, I need repository functions for campaign management.

## Technical Context
- **App**: D&D Character Forge — local-first React PWA for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, Zustand (state), Dexie.js (IndexedDB), React Router
- **Architecture**: No backend, pure client-side, offline-capable PWA, IndexedDB for persistence
- **Domain**: D&D 5th Edition SRD — 9 races (with subraces), 12 classes (with subclasses), ability scores, skills, spells, equipment, backgrounds, feats
- **Campaign storage**: The full `Campaign` object is stored in IndexedDB via Dexie.js. Each campaign has a UUID primary key, timestamps, and a unique 6-character alphanumeric join code
- **Campaign structure** (from Story 2.9): `{ id, name, description, dmId, playerIds: string[], characterIds: string[], joinCode, houseRules, sessions: SessionNote[], npcs?: NPC[], createdAt, updatedAt }`
- **Join code**: A 6-character alphanumeric code generated on campaign creation. Used as a human-readable identifier for sharing. In the current local-first architecture this is metadata; in a future sync feature it could be used for sharing
- **Character-Campaign association**: Characters are linked to campaigns via the `characterIds` array on the Campaign object and the `campaignId` field on the Character object. Adding/removing a character should update both sides
- **HouseRules** (from Story 2.9): `{ allowedSources, abilityScoreMethod, startingLevel, startingGold?, allowMulticlass, allowFeats, encumbranceVariant }` — configured by the DM when creating a campaign
- **Campaign queries**: Need to list all campaigns, get a specific campaign, and get all characters in a campaign

## Tasks
- [ ] **T5.3.1** — Implement `createCampaign(data: Partial<Campaign>): Promise<Campaign>` — generates UUID, join code (6-char alphanumeric)
- [ ] **T5.3.2** — Implement `getCampaign(id: string): Promise<Campaign | undefined>`
- [ ] **T5.3.3** — Implement `getAllCampaigns(): Promise<Campaign[]>`
- [ ] **T5.3.4** — Implement `updateCampaign(id: string, updates: Partial<Campaign>): Promise<Campaign>`
- [ ] **T5.3.5** — Implement `addCharacterToCampaign(campaignId: string, characterId: string): Promise<void>`
- [ ] **T5.3.6** — Implement `removeCharacterFromCampaign(campaignId: string, characterId: string): Promise<void>`
- [ ] **T5.3.7** — Implement `getCharactersByCampaign(campaignId: string): Promise<Character[]>`
- [ ] **T5.3.8** — Write integration tests: create campaign, add/remove characters, campaign deletion

## Acceptance Criteria
- `createCampaign()` generates a UUID, a unique 6-character alphanumeric join code, sets timestamps, and persists to IndexedDB
- `getCampaign()` retrieves a campaign by ID or returns undefined if not found
- `getAllCampaigns()` returns all campaigns sorted by most recently updated
- `updateCampaign()` updates the specified fields and the `updatedAt` timestamp
- `addCharacterToCampaign()` adds the character ID to the campaign's `characterIds` array AND sets `campaignId` on the character
- `removeCharacterFromCampaign()` removes the character ID from the campaign AND clears `campaignId` on the character
- `getCharactersByCampaign()` returns all Character objects associated with a campaign
- Join codes are unique across all campaigns
- Integration tests verify the full campaign lifecycle including character association

## Testing Requirements

### Unit Tests (Vitest)
_For pure functions, calculations, data transforms, utilities, type guards, validators_

- `should generate UUID and unique 6-char join code when creating a campaign via createCampaign`
- `should set timestamps on campaign creation via createCampaign`
- `should retrieve a campaign by ID via getCampaign`
- `should return undefined for non-existent campaign ID via getCampaign`
- `should return all campaigns sorted by most recently updated via getAllCampaigns`
- `should update specified fields and updatedAt timestamp via updateCampaign`
- `should add characterId to campaign and set campaignId on character via addCharacterToCampaign`
- `should remove characterId from campaign and clear campaignId on character via removeCharacterFromCampaign`
- `should return all characters associated with a campaign via getCharactersByCampaign`
- `should generate unique join codes across campaigns`
- `should apply default house rules when not specified`

### Test Dependencies
- `fake-indexeddb` for IndexedDB mocking
- Database singleton from Story 5.1
- Character CRUD functions from Story 5.2
- Campaign type from Story 2.9

## Identified Gaps

- **Error Handling**: No specification for what happens when adding a character that is already in a campaign (move or reject?)
- **Error Handling**: Campaign deletion behavior for associated characters (clear campaignId) should be explicit in acceptance criteria
- **Edge Cases**: Join code collision handling (extremely unlikely but should retry on uniqueness failure)

## Dependencies
- **Depends on:** Story 5.1 (database schema and singleton), Story 5.2 (Character CRUD for updating character's campaignId), Story 2.9 (Campaign, HouseRules, SessionNote, NPC types)
- **Blocks:** Epic 6 (Stores will bridge to campaign CRUD), Phase 4+ (Campaign management UI)

## Notes
- Join code generation: Generate a random 6-character string from `[A-Z0-9]` (36^6 = ~2.2 billion combinations). Check for uniqueness against existing campaigns before accepting
- `addCharacterToCampaign` and `removeCharacterFromCampaign` update both the Campaign and Character records in a single Dexie transaction to maintain consistency
- Campaign deletion should consider what happens to associated characters. Options: (1) clear their `campaignId` (preferred — characters survive independently), (2) cascade delete (too destructive). Implement option 1
- `getCharactersByCampaign` should use the `campaignId` index on the characters table for efficient querying rather than loading all characters and filtering
- HouseRules defaults should be sensible: `allowedSources: ['SRD']`, `abilityScoreMethod: 'any'`, `startingLevel: 1`, `allowMulticlass: true`, `allowFeats: true`, `encumbranceVariant: false`
