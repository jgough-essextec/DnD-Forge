# Phase 5: DM Features — Overview

> **Timeline:** Weeks 9-10 | **Epics:** 33-38 | **Stories:** 27 | **Tasks:** ~135 | **New Components:** ~35+

## Summary

Phase 5 delivers a complete Dungeon Master toolkit for D&D Character Forge. Campaign CRUD with house rules and invite codes, a party dashboard with at-a-glance stats grid and skill/language matrices, a full combat/initiative tracker with turn cycling and NPC/monster support, DM-only character notes, a campaign session log, an NPC tracker, a loot/reward tracker, and XP/milestone level-up distribution — all backed by the Django REST API and PostgreSQL database.

**Phase 4 Dependencies:** Phase 5 assumes all Phase 4 session play features are complete — dice roller, HP tracker, spell slot tracker, conditions tracker, rest automation, and level-up flow. The DM features build on these by orchestrating them across multiple characters simultaneously (party HP, group initiative, party-wide XP awards, etc.).

---

## Epics

| Epic | Name | Stories | Focus |
|------|------|---------|-------|
| 33 | Campaign CRUD & Data Model | 33.1 - 33.5 (5) | Campaign lifecycle: data model, create, list, edit, character assignment |
| 34 | Campaign Dashboard & Party Overview | 34.1 - 34.5 (5) | DM command center: stats grid, skill matrix, language coverage, composition analysis |
| 35 | Initiative & Combat Tracker | 35.1 - 35.6 (6) | Combat management: encounter setup, initiative, turn tracking, HP/conditions, mid-combat, XP |
| 36 | DM Notes System | 36.1 - 36.4 (4) | Note-taking: per-character DM notes, session log, NPC tracker, loot tracker |
| 37 | XP & Milestone Management | 37.1 - 37.3 (3) | Progression: XP awards, milestone level-up, level progress tracking |
| 38 | Campaign Routing & Navigation | 38.1 - 38.4 (4) | Integration: routes, DM vs player context, join flow, campaign export/import |

---

## Key Deliverables

- **~135 tasks** across 27 stories in 6 epics
- **~35+ new components** (campaign modals, dashboard panels, combat tracker views, note editors, etc.)
- **7 new data types:** Campaign, HouseRules, SessionNote, Encounter, Combatant, NPCEntry, LootEntry
- **5 new routes:** `/campaigns`, `/campaign/:id`, `/campaign/:id/encounter/:encounterId`, `/campaign/:id/session/:sessionId`, `/join/:code`
- **4 dashboard tabs:** Party, Sessions, Encounters, Notes
- **10+ party grid columns** for at-a-glance character stats
- **18 x N skill matrix** (18 skills by N characters)
- **3 combat tracker states:** Setup, Rolling, Active Combat, End
- **7 party roles analyzed** for composition
- **4 NPC statuses** and **6 NPC role tags**

---

## Pre-Phase Audit Notes

### Gap D1 — DM Role Model (Django Auth)

The app uses Django's authentication system. The user who creates a campaign is the DM by definition. Characters added to a campaign are fetched via the Django REST API. Players "join" by entering a server-validated join code. The `dmId` field is set to the authenticated user's ID from Django auth. DM role is enforced server-side via API permissions.

### Gap D2 — Campaign-Character Relationship

A character can be in zero or one campaign at a time. The same character cannot be in two campaigns simultaneously. Removing a character from a campaign unlinks but does not delete. Deleting a campaign unlinks all characters without deleting them.

### Gap D3 — HouseRules Interface

Defined for Phase 5 with fields: `allowedSources`, `abilityScoreMethod`, `startingLevel`, `startingGold`, `hpMethod`, `allowFeats`, `allowMulticlass`, `encumbranceRule`, `criticalHitRule`, `customNotes`.

### Gap D4 — SessionNote Interface

Defined for Phase 5 with fields: `id`, `sessionNumber`, `date`, `title`, `summary`, `npcsEncountered`, `locationsVisited`, `lootAwarded`, `xpAwarded`, `milestoneLevel`, `tags`, `createdAt`, `updatedAt`.

### Gap D5 — Combatant Model for Initiative Tracker

Lightweight combatant model: `id`, `name`, `type` (player/npc/monster), `characterId`, `initiativeRoll`, `initiativeModifier`, `armorClass`, `hitPointMax`, `hitPointCurrent`, `tempHitPoints`, `conditions`, `notes`, `isVisible`, `groupId`.

### Gap D6 — Encounter Data Model

Defined: `id`, `campaignId`, `sessionId`, `name`, `combatants`, `currentTurnIndex`, `roundNumber`, `isActive`, `xpBudget`, `notes`, `createdAt`.

### Gap D7 — Party Role Mapping

Class-to-role mapping for composition analysis. Roles: Tank/Defender, Melee Striker, Ranged Striker, Healer/Support, Controller, Utility/Skill Monkey, Face (Social). Analysis is informational, not prescriptive.

### Gap D8 — Join Codes as Server-Validated Mechanism

Join codes are server-validated: DM generates a 6-char code stored in PostgreSQL and tied to the campaign. Players enter the code via the join endpoint, which validates the code server-side and adds the player's character to the campaign. The Django REST API handles code generation, validation, and campaign membership.

---

## Dependencies

### External Phase Dependencies
- **Phase 1-3:** Full character creation, sheet display, Django REST API data layer, export/import
- **Phase 4:** Dice roller, HP tracker, spell slot tracker, conditions tracker, rest automation, level-up flow

### Internal Dependency Graph

```
Epic 33 (Campaign CRUD & Data Model) <- FOUNDATION - build first
  |
  +-- Story 33.1 (Data model) <- everything depends on this
  |
  +-- Epic 34 (Campaign Dashboard & Party Overview)
  |     +-- Story 34.1 (Dashboard layout) <- shell for all tabs
  |     +-- Story 34.2 (Stats grid) <- uses character data
  |     +-- Story 34.3 (Skill matrix) <- uses character skills
  |     +-- Story 34.4 (Languages) <- uses character languages
  |     +-- Story 34.5 (Composition) <- uses class/subclass data
  |
  +-- Epic 35 (Initiative & Combat Tracker)
  |     +-- Story 35.1 (Setup) <- uses campaign characters
  |     +-- Story 35.2 (Initiative) <- uses dice roller from Phase 4
  |     +-- Story 35.3 (Combat view) <- uses encounter data model
  |     +-- Story 35.4 (HP/Conditions) <- uses Phase 4 HP & conditions
  |     +-- Story 35.5 (Mid-combat add) <- extends setup
  |     +-- Story 35.6 (End encounter) <- uses XP system, session log
  |
  +-- Epic 36 (DM Notes System)
  |     +-- Story 36.1 (Character notes) <- uses dmNotes field
  |     +-- Story 36.2 (Session log) <- standalone, links to encounters
  |     +-- Story 36.3 (NPC tracker) <- cross-references session log
  |     +-- Story 36.4 (Loot tracker) <- links to characters + sessions
  |
  +-- Epic 37 (XP & Milestone)
  |     +-- Story 37.1 (XP awards) <- uses character XP field
  |     +-- Story 37.2 (Milestone) <- triggers Phase 4 level-up
  |     +-- Story 37.3 (Progress tracking) <- extends stats grid
  |
  +-- Epic 38 (Routing & Navigation)
        +-- Story 38.1 (Routes) <- scaffold early
        +-- Story 38.2 (DM vs Player context) <- applies across app
        +-- Story 38.3 (Join campaign) <- uses campaign import
        +-- Story 38.4 (Export/Import) <- extends Phase 3 JSON system
```

### Recommended Build Order

1. **Week 9, Day 1:** Epic 33 (Campaign data model, store, CRUD) + Epic 38 Story 38.1 (Route scaffolding)
2. **Week 9, Day 2-3:** Epic 34 (Campaign Dashboard + Party Overview)
3. **Week 9, Day 4-5:** Epic 35 Stories 35.1-35.3 (Encounter Setup + Initiative Rolling + Combat Main View)
4. **Week 10, Day 1:** Epic 35 Stories 35.4-35.6 (Combatant management + Mid-combat + End encounter)
5. **Week 10, Day 2-3:** Epic 36 (DM Notes — character notes, session log, NPC tracker, loot tracker)
6. **Week 10, Day 4:** Epic 37 (XP & Milestone management)
7. **Week 10, Day 5:** Epic 38 Stories 38.2-38.4 (DM context, join flow, campaign export/import)

## Testing Strategy Summary

| Epic | Unit | Functional | E2E | Total | Gaps Found |
|------|------|-----------|-----|-------|------------|
| 33 — Campaign CRUD & Data Model | 23 | 31 | 10 | 64 | 5 |
| 34 — Campaign Dashboard & Party Overview | 21 | 32 | 12 | 65 | 5 |
| 35 — Initiative & Combat Tracker | 31 | 49 | 19 | 99 | 6 |
| 36 — DM Notes System | 17 | 33 | 12 | 62 | 5 |
| 37 — XP & Milestone Management | 13 | 21 | 7 | 41 | 5 |
| 38 — Campaign Routing & Navigation | 16 | 25 | 13 | 54 | 5 |
| **Totals** | **121** | **191** | **73** | **385** | **31** |

**Test Distribution:** Unit 31% / Functional 50% / E2E 19% — aligns with Phase 5 target of Functional (50%) + E2E (40% of integration coverage)

### Testing Infrastructure Needed
- **Mock Database**: MSW (Mock Service Worker) for Django REST API testing; React Query test wrapper for hook tests
- **SRD Data Fixtures**: Monster index (subset: Goblin, Orc, Dragon), magic item data, CR-to-XP mapping table, XP threshold table, language reference (8 Common + 8 Exotic)
- **Campaign Fixtures**: Empty campaign, campaign with 4 characters, campaign with 8+ characters, archived campaign, campaign with full data (sessions, encounters, NPCs, loot)
- **Character Fixtures**: Characters at various levels and XP thresholds, casters and non-casters, characters with conditions/temp HP, characters near death, level 20 characters
- **Encounter Fixtures**: Active encounter mid-combat, encounter with grouped monsters, encounter with lair actions, completed encounter with XP summary
- **Mock Phase 4 Dependencies**: Dice roller (deterministic), HP tracker logic, conditions system, death save logic, spell slot tracker, rest automation, level-up flow
- **Mock UI Utilities**: Debounce timer mocks, drag-and-drop testing utilities, framer-motion animation mocks, file input mocks for JSON import
- **Context Providers**: DMContextProvider mock (isDMView flag), React Router mock with params, React Query client wrapper for campaign/encounter/character API hooks, Zustand store mocks for UI state
- **Shared Test Utilities**: XP calculation helpers (shared between Epic 35 and 37), campaign export/import validation helpers, join code generation/validation helpers
