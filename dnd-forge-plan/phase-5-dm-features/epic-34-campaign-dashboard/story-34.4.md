# Story 34.4 — Language Coverage

> **Epic 34: Campaign Dashboard & Party Overview** | **Phase 5: DM Features** (Weeks 9-10)

## Description

As a DM, I need to see which languages the party collectively speaks for planning encounters with non-Common-speaking NPCs.

## Technical Context

- **App**: D&D Character Forge — local-first React PWA for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, Zustand (state), Dexie.js (IndexedDB), React Router
- **Architecture**: No backend, pure client-side, offline-capable PWA, IndexedDB for persistence. DM role is local (no authentication), campaigns are local data with join codes as local import mechanism.
- **Prior Phases Available**: Phase 1-4 (full character creation, sheet display, session play features including dice roller, HP tracker, spell slots, conditions, rest, level up)

This story creates a compact language coverage panel showing all unique languages across the party, categorized into Common and Exotic, with gap identification.

**SRD Language Categories:**
- **Common languages:** Common, Dwarvish, Elvish, Giant, Gnomish, Goblin, Halfling, Orc
- **Exotic languages:** Abyssal, Celestial, Deep Speech, Draconic, Infernal, Primordial, Sylvan, Undercommon

Each language is shown as a badge with the count of speakers: "Common (4)", "Elvish (2)", "Draconic (0)". Languages with 0 speakers are SRD languages known in the world but not spoken by any party member — shown in a "Gaps" section.

Clicking a language badge reveals which characters speak it.

A separate "Tools" subsection shows tool proficiencies with the same format (aggregated from all party characters).

## Tasks

- [ ] **T34.4.1** — Create `components/dm/LanguageCoverage.tsx` — a compact panel showing all unique languages across the party. Each language is a badge with the count of speakers: "Common (4)", "Elvish (2)", "Dwarvish (1)", "Draconic (0)" — where 0 means "known in the world but no one in the party speaks it"
- [ ] **T34.4.2** — Categorize languages: Common languages (Common, Dwarvish, Elvish, Giant, Gnomish, Goblin, Halfling, Orc) and Exotic languages (Abyssal, Celestial, Deep Speech, Draconic, Infernal, Primordial, Sylvan, Undercommon). Show SRD languages not covered by any party member as a "Gaps" section
- [ ] **T34.4.3** — Clicking a language badge shows which characters speak it
- [ ] **T34.4.4** — Include tool proficiencies in a separate "Tools" subsection with the same format

## Acceptance Criteria

- Language coverage panel displays all unique languages across the party as badges with speaker counts
- Languages are categorized into Common and Exotic sections
- SRD languages not spoken by any party member appear in a "Gaps" section with a count of 0
- Clicking a language badge reveals which characters speak it
- Tool proficiencies are shown in a separate "Tools" subsection with the same badge format
- Panel is compact and readable as part of the Party tab

## Dependencies

- Story 34.1 — Campaign dashboard layout (Party tab host)
- Epic 33 Story 33.1 — Campaign data model with character resolution
- Phase 1-3 — Character language and tool proficiency data

## Notes

- This panel helps DMs plan encounters and social interactions. Knowing the party's language coverage is essential for NPC encounters, puzzles with inscriptions, and overheard conversations.
- The "Gaps" section is particularly useful — it shows what the party cannot communicate in, which creates interesting gameplay opportunities.
- Tool proficiencies follow the same pattern and are included because DMs frequently need to know "Does anyone have thieves' tools?" or "Who has proficiency in herbalism kit?"
