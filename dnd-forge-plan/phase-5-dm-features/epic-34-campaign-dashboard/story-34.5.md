# Story 34.5 — Party Composition Analysis

> **Epic 34: Campaign Dashboard & Party Overview** | **Phase 5: DM Features** (Weeks 9-10)

## Description

As a DM, I need to see what roles the party covers and where gaps exist to help balance encounters and story challenges.

## Technical Context

- **App**: D&D Character Forge — local-first React PWA for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, Zustand (state), Dexie.js (IndexedDB), React Router
- **Architecture**: No backend, pure client-side, offline-capable PWA, IndexedDB for persistence. DM role is local (no authentication), campaigns are local data with join codes as local import mechanism.
- **Prior Phases Available**: Phase 1-4 (full character creation, sheet display, session play features including dice roller, HP tracker, spell slots, conditions, rest, level up)

This story creates a party composition analysis panel that maps each character's class (and subclass) to archetypal party roles and shows coverage.

**7 Archetypal Roles:**
1. **Tank/Defender** — Primary: Barbarian, Fighter, Paladin. Secondary: Moon Druid, Cleric (heavy armor)
2. **Melee Striker** — Primary: Fighter, Barbarian, Monk, Paladin, Ranger. Secondary: Rogue (melee), Hexblade Warlock
3. **Ranged Striker** — Primary: Ranger, Fighter (ranged), Warlock. Secondary: Rogue (ranged), Sorcerer
4. **Healer/Support** — Primary: Cleric, Druid, Bard. Secondary: Paladin, Divine Soul Sorcerer, Celestial Warlock
5. **Controller** — Primary: Wizard, Druid, Sorcerer. Secondary: Bard, Warlock
6. **Utility/Skill Monkey** — Primary: Rogue, Bard, Ranger. Secondary: Artificer, Wizard, Knowledge Cleric
7. **Face (Social)** — Primary: Bard, Warlock, Sorcerer, Paladin. Secondary: Any high-CHA build

**Role coverage indicators:**
- Filled circle: primary class covers this role
- Half-filled: secondary/subclass covers it
- Empty: no one covers it
- Roles with no coverage highlighted with subtle amber background

**Informational tone:** Header text "Party Strengths & Potential Gaps" rather than "Missing Roles." Tooltips explain each role. The analysis is informational, not prescriptive — avoid suggesting the party "must" have certain roles.

**Special callout badges** detect specific party strengths like "All party members have darkvision" or "No one has healing magic."

## Tasks

- [ ] **T34.5.1** — Create `components/dm/PartyComposition.tsx` — a visual panel showing archetypal party roles and which characters fill them. Roles: Tank/Defender, Melee Striker, Ranged Striker, Healer/Support, Controller, Utility/Skill Monkey, Face (Social)
- [ ] **T34.5.2** — Map each class (and known subclass) to one or two primary roles and one or two secondary roles using the mapping from Gap D7. Show each role as a card with the character names/avatars that fill it
- [ ] **T34.5.3** — Role coverage indicator: filled circle (primary class covers this role), half-filled (secondary/subclass covers it), empty (no one covers it). Roles with no coverage are highlighted with a subtle amber background
- [ ] **T34.5.4** — Informational tone: header text "Party Strengths & Potential Gaps" rather than "Missing Roles." Tooltip on each role explains what it means: "Tank/Defender: Characters with high AC and HP who can absorb damage and protect allies"
- [ ] **T34.5.5** — Special notes: detect specific party strengths like "All party members have darkvision" or "No one has healing magic" as callout badges

## Acceptance Criteria

- Party composition panel displays all 7 archetypal roles with character assignments
- Each class is mapped to primary and secondary roles based on the defined mapping
- Role coverage uses visual indicators: filled (primary), half-filled (secondary), empty (uncovered)
- Uncovered roles are highlighted with amber background
- Header uses informational tone ("Party Strengths & Potential Gaps")
- Tooltips explain what each role means in D&D context
- Special callout badges detect notable party characteristics (e.g., all darkvision, no healer)
- Analysis is informational and not prescriptive

## Dependencies

- Story 34.1 — Campaign dashboard layout (Party tab host)
- Epic 33 Story 33.1 — Campaign data model with character resolution
- Phase 1-3 — Character class, subclass, and racial trait data

## Notes

- The class-to-role mapping should be maintained as a data file (not hardcoded in the component) so it can be updated as more subclasses are added.
- D&D 5e roles are not officially codified — the community-standard categories used here are a reasonable consensus but some players may disagree. The informational tone helps manage this.
- Special callout badges add significant value: "No one has healing magic" is a critical DM planning concern. Consider also checking: party average AC, party average HP, any characters with flight, party stealth capability (lowest stealth modifier).
