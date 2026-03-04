# Story 19.4 — Domain/Subclass Spells

> **Epic 19: Character Sheet — Page 3 (Spellcasting)** | **Phase 3: Character Sheet & Management** (Weeks 5-6)

## Description
As a Cleric, Druid, or other subclass with bonus spells, I need to see my always-prepared domain/subclass spells separately marked.

## Technical Context
- **App**: D&D Character Forge — local-first React PWA for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, Zustand (state), Dexie.js (IndexedDB), React Router
- **Architecture**: No backend, pure client-side, offline-capable PWA, IndexedDB for persistence
- **Prior Phases Available**: Phase 1 (types, SRD data, calculation engine, database, state stores, dice engine), Phase 2 (character creation wizard — guided and freeform modes)
- **Domain/Subclass Spells**: Some subclasses grant bonus spells that are always prepared and don't count against the prepared spell limit. Examples:
  - Cleric Life Domain: Bless and Cure Wounds always prepared at level 1
  - Cleric Light Domain: Burning Hands and Faerie Fire always prepared at level 1
  - Paladin Oath subclasses: specific oath spells always prepared
  - Land Druid: circle spells always prepared
- **Visual Treatment**: "Always Prepared" badge, different background tint, grouped at the top of their respective level section
- **Cannot Be Unprepared**: Domain spells are always prepared and cannot be toggled off in edit mode

## Tasks
- [ ] **T19.4.1** — For classes with subclass-granted spells (e.g., Cleric Life Domain gets Bless and Cure Wounds always prepared), display these with a special "Always Prepared" badge and a different background tint. These don't count against the prepared spell limit
- [ ] **T19.4.2** — Group subclass spells at the top of their respective level section with a "Domain Spells" or "Subclass Spells" sub-header
- [ ] **T19.4.3** — Prevent the user from unpreparing domain spells in edit mode — they're always prepared and can't be toggled off

## Acceptance Criteria
- Domain/subclass spells display with an "Always Prepared" badge
- Domain/subclass spells have a different background tint for visual distinction
- Domain/subclass spells don't count against the prepared spell limit
- Domain/subclass spells are grouped at the top of their respective level section
- A "Domain Spells" or "Subclass Spells" sub-header labels the group
- Domain/subclass spells cannot be unprepared in edit mode (toggle is disabled)
- The correct domain/subclass spells display based on the character's subclass choice

## Dependencies
- Story 19.3 (Spell Slots & Spell Lists) — domain spells appear within spell level sections
- Phase 1 SRD data for subclass spell lists
- Phase 2 character data (subclass selection from creation wizard)
- Epic 20 view/edit mode toggle system

## Notes
- Domain/subclass spells are a key benefit of choosing a subclass — they should be prominently displayed
- At level 1, only some subclasses grant bonus spells (primarily Cleric domains and some Paladin oaths)
- As characters level up, they gain additional domain/subclass spells at levels 3, 5, 7, and 9
- The SRD contains the Life Domain for Cleric — other domains may need homebrew/custom support
- These spells are "free" prepared spells: they expand the caster's daily capacity without taking up a prepared slot
