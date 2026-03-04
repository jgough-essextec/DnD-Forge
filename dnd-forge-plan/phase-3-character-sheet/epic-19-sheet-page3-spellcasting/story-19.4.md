# Story 19.4 — Domain/Subclass Spells

> **Epic 19: Character Sheet — Page 3 (Spellcasting)** | **Phase 3: Character Sheet & Management** (Weeks 5-6)

## Description
As a Cleric, Druid, or other subclass with bonus spells, I need to see my always-prepared domain/subclass spells separately marked.

## Technical Context
- **App**: D&D Character Forge — full-stack Django + React web application for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, React Query (server state), Zustand (UI state), Django REST Framework, PostgreSQL, React Router
- **Architecture**: Django REST API backend, React SPA frontend, PostgreSQL persistence, Django session auth
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

## Testing Requirements

### Unit Tests (Vitest)
_For pure functions, calculations, data transforms, utilities, type guards, validators_

- `should retrieve correct domain/subclass spells for Cleric Life Domain at level 1 (Bless, Cure Wounds)`
- `should identify domain/subclass spells as always-prepared and non-countable against prepared limit`
- `should filter domain spells by character level threshold (levels 1, 3, 5, 7, 9)`

### Functional Tests (React Testing Library)
_For component rendering, user interactions, state changes, prop variations_

- `should display domain/subclass spells with "Always Prepared" badge`
- `should display domain/subclass spells with different background tint`
- `should not count domain/subclass spells against prepared spell limit`
- `should group domain/subclass spells at top of their respective level section`
- `should display "Domain Spells" or "Subclass Spells" sub-header`
- `should prevent unpreparing domain spells in edit mode (toggle disabled)`
- `should display correct domain spells based on character's subclass choice`

### Test Dependencies
- Mock character data for Cleric Life Domain with domain spells
- Mock character data for class without domain spells (Wizard)
- Mock SRD data for subclass spell lists
- Mock view/edit mode context

## Identified Gaps

- **Edge Cases**: No specification for subclasses not in the SRD (homebrew domain spells)
- **Accessibility**: No ARIA labels for "Always Prepared" badge, no screen reader distinction between domain and regular spells
- **Dependency Issues**: SRD only contains Life Domain for Cleric; other domains need homebrew/custom support as noted

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
