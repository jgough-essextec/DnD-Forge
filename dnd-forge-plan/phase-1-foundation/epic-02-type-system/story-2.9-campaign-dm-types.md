# Story 2.9 — Campaign & DM Types

> **Epic 2: Complete Type System** | **Phase 1: Foundation** (Weeks 1-2)

## Description
As a developer, I need campaign, session, and DM note types.

## Technical Context
- **App**: D&D Character Forge — local-first React PWA for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, Zustand (state), Dexie.js (IndexedDB), React Router
- **Architecture**: No backend, pure client-side, offline-capable PWA, IndexedDB for persistence
- **Domain**: D&D 5th Edition SRD — 9 races (with subraces), 12 classes (with subclasses), ability scores, skills, spells, equipment, backgrounds, feats
- **Campaign**: A campaign groups characters and sessions together. It is managed by a DM and includes house rules that can override default game options. The join code is a 6-character alphanumeric code for sharing (in a local-first app, this serves as an identifier for potential future sync features)
- **House rules**: Campaign-level settings that the DM configures — which ability score methods are allowed, starting level, starting gold overrides, whether multiclassing and feats are allowed, whether to use the encumbrance variant rule, and which source books are permitted
- **Session notes**: DM notes for each session including date, title, content, XP awarded, and loot distributed to characters. Loot distribution maps character IDs to item lists
- **NPCs**: Non-player characters tracked by the DM with basic info, location, relationship to players, optional partial character stats, and DM-only notes
- **Ability score methods**: Standard Array (assign [15, 14, 13, 12, 10, 8]), Point Buy (27 points, scores 8-15), Rolled (4d6 drop lowest), or Any (DM allows any method)

## Tasks
- [ ] **T2.9.1** — Define `HouseRules` interface: `{ allowedSources: string[]; abilityScoreMethod: 'standard' | 'pointBuy' | 'rolled' | 'any'; startingLevel: number; startingGold?: number; allowMulticlass: boolean; allowFeats: boolean; encumbranceVariant: boolean }`
- [ ] **T2.9.2** — Define `SessionNote` interface: `{ id, date, title, content, xpAwarded?, lootDistributed?: { characterId: string; items: string[] }[] }`
- [ ] **T2.9.3** — Define `Campaign` interface: `{ id, name, description, dmId, playerIds: string[], characterIds: string[], joinCode, houseRules, sessions: SessionNote[], npcs?: NPC[], createdAt, updatedAt }`
- [ ] **T2.9.4** — Define `NPC` interface: `{ id, name, description, location?, relationship?: string, stats?: Partial<Character>, dmNotes?: string }`

## Acceptance Criteria
- All types compile with zero TypeScript errors under strict mode
- `Campaign` includes all fields for managing a group of players and their characters
- `HouseRules` captures all DM-configurable game options
- `SessionNote` supports XP tracking and loot distribution per character
- `NPC` supports optional partial character stats for DM reference
- `Campaign.joinCode` is typed as a string (6-char alphanumeric, enforced at runtime)

## Dependencies
- **Depends on:** Story 2.8 (NPC uses Partial<Character>)
- **Blocks:** Epic 5 Story 5.3 (Campaign CRUD operations), Phase 4+ DM features

## Notes
- `NPC.stats` uses `Partial<Character>` because NPCs may only need a subset of character stats (e.g., just AC, HP, and a couple of attacks) rather than a fully fleshed-out character sheet
- `HouseRules.abilityScoreMethod` set to 'any' means the DM allows players to choose their preferred method
- `lootDistributed` in `SessionNote` maps characters to items they received in that session — useful for campaign tracking and dispute resolution
- The `dmId` and `playerIds` fields anticipate future multi-device sync features. In the current local-first architecture, these serve as metadata
