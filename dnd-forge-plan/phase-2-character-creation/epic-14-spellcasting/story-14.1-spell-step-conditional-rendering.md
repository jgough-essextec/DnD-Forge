# Story 14.1 — Spell Step Conditional Rendering

> **Epic 14: Spellcasting Step (Conditional)** | **Phase 2: Character Creation Wizard** (Weeks 3-4)

## Description

As a developer, I need the Spell Step to only appear when the character's class has spellcasting at level 1. This story implements the conditional logic that determines whether the Spellcasting step is shown or skipped, updates the wizard progress bar accordingly, and handles Sorcerer ancestry-specific notes.

## Technical Context

- **App**: D&D Character Forge — local-first React PWA for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, Zustand (state), Dexie.js (IndexedDB), React Router
- **Architecture**: No backend, pure client-side, offline-capable PWA, IndexedDB for persistence
- **Phase 1 Foundation Available**: Type system, SRD game data (races, classes, spells, equipment, backgrounds, feats as static JSON), calculation engine, Dexie.js database layer, Zustand stores, dice engine
- **Spellcasting at Level 1 (Gap W6)**:
  | Class | Cantrips (Lv 1) | Spells (Lv 1) | System |
  |-------|----------------|---------------|--------|
  | Bard | 2 | 4 known | Known caster |
  | Cleric | 3 | WIS mod + 1 prepared | Prepared caster |
  | Druid | 2 | WIS mod + 1 prepared | Prepared caster |
  | Sorcerer | 4 | 2 known | Known caster |
  | Warlock | 2 | 2 known | Known caster (Pact) |
  | Wizard | 3 | 6 spellbook, INT mod + 1 prepared | Prepared (spellbook) |
  | Paladin | 0 | No spells at Lv 1 | Starts at Lv 2 |
  | Ranger | 0 | No spells at Lv 1 | Starts at Lv 2 |
  | Fighter | 0 | No spells at Lv 1 | Eldritch Knight at Lv 3 |
  | Rogue | 0 | No spells at Lv 1 | Arcane Trickster at Lv 3 |
  | Barbarian | 0 | No spells | Non-caster |
  | Monk | 0 | No spells | Non-caster |
- **Skip Logic**: If the selected class has `spellcasting.type === 'none'` OR the class doesn't get spells at level 1 (Paladin, Ranger, Fighter, Rogue), skip Step 6 entirely and advance from Step 5 (Equipment) to Step 7 (Review)
- **Progress Bar Update**: When Step 6 is skipped, it shows as "N/A -- No spells at level 1" in the progress bar (dimmed, not clickable)

## Tasks

- [ ] **T14.1.1** — In the wizard step registry, implement conditional logic: check if the selected class has `spellcasting.type !== 'none'` AND the class gets spells at level 1 (Paladin and Ranger do NOT at level 1). If no spells, skip this step entirely and advance to Review
- [ ] **T14.1.2** — Update the wizard progress bar to show the Spellcasting step as "N/A -- No spells at level 1" for non-casters (dimmed, not clickable)
- [ ] **T14.1.3** — For Sorcerer (Draconic Bloodline), display a note about the ancestry-specific spell if applicable

## Acceptance Criteria

- The Spellcasting step is shown for Bard, Cleric, Druid, Sorcerer, Warlock, and Wizard
- The Spellcasting step is skipped for Barbarian, Fighter, Monk, Paladin, Ranger, and Rogue
- When skipped, the wizard advances directly from Equipment (Step 5) to Review (Step 7)
- The progress bar shows "N/A -- No spells at level 1" for skipped Spellcasting step (dimmed, not clickable)
- Sorcerer (Draconic Bloodline) shows an ancestry-specific note if applicable
- Changing class from a caster to a non-caster (or vice versa) correctly updates the step skip logic and progress bar

## Testing Requirements

### Unit Tests (Vitest)
_For pure functions, calculations, data transforms, utilities, type guards, validators_

- `should identify caster classes that get spells at level 1 (Bard, Cleric, Druid, Sorcerer, Warlock, Wizard)`
- `should identify non-caster classes that skip spellcasting step (Barbarian, Fighter, Monk, Paladin, Ranger, Rogue)`
- `should correctly handle Paladin and Ranger as having spellcasting feature but no spells at level 1`

### Functional Tests (React Testing Library)
_For component rendering, user interactions, state changes, prop variations_

- `should show the Spellcasting step for Bard, Cleric, Druid, Sorcerer, Warlock, and Wizard`
- `should skip the Spellcasting step for Barbarian, Fighter, Monk, Paladin, Ranger, and Rogue`
- `should advance directly from Equipment (Step 5) to Review (Step 7) when step is skipped`
- `should show progress bar with "N/A -- No spells at level 1" for skipped step (dimmed, not clickable)`
- `should display Sorcerer Draconic Bloodline ancestry-specific note when applicable`
- `should dynamically update step skip logic when class changes from caster to non-caster or vice versa`

### Test Dependencies
- Mock SRD class data with spellcasting type and level for all 12 classes
- Mock wizard store with class selection state
- Test fixtures for caster and non-caster class configurations

## Identified Gaps

- **Edge Cases**: Changing class from caster to non-caster while on the Spellcasting step itself is not specified (should it auto-navigate away?)
- **Accessibility**: No ARIA attributes for the "N/A" progress bar indicator to communicate skip reason to screen readers

## Dependencies

- **Depends on:** Story 8.1 (Wizard Shell — conditional step skip logic is implemented here or in the step registry), Epic 10 Story 10.6 (class selection determines spellcasting status), Phase 1 SRD class data (spellcasting type and level)
- **Blocks:** Stories 14.2-14.5 (the remaining spellcasting stories only render when this step is active)

## Notes

- The step skip logic should be dynamic — if the player goes back and changes their class from Fighter to Wizard, the Spellcasting step should become active; if they change from Wizard to Fighter, it should be skipped
- Paladin and Ranger are special cases: they HAVE spellcasting in their class data, but they don't get spells until level 2. The check must verify spells at level 1 specifically, not just whether the class has a spellcasting feature
- The "N/A" label in the progress bar should be clear enough that the player understands why the step is skipped, without cluttering the progress bar for classes that have full spellcasting
- Sorcerer Draconic Bloodline ancestry note: this relates to the dragon type chosen in the subclass selection (Epic 10 Story 10.4). The elemental affinity spell bonus doesn't apply until level 6, but a note can preview the connection
