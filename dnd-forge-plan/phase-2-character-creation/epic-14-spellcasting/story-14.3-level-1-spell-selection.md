# Story 14.3 — Level 1 Spell Selection

> **Epic 14: Spellcasting Step (Conditional)** | **Phase 2: Character Creation Wizard** (Weeks 3-4)

## Description

As a spellcasting player, I need to select my known or prepared spells from my class's level 1 spell list. This story builds the spell selection interface that handles three distinct spellcasting systems: known casters (Bard, Sorcerer, Warlock), prepared casters (Cleric, Druid), and spellbook casters (Wizard), including prepared spell count computation and Warlock Pact Magic special handling.

## Technical Context

- **App**: D&D Character Forge — local-first React PWA for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, Zustand (state), Dexie.js (IndexedDB), React Router
- **Architecture**: No backend, pure client-side, offline-capable PWA, IndexedDB for persistence
- **Phase 1 Foundation Available**: Type system, SRD game data (races, classes, spells, equipment, backgrounds, feats as static JSON), calculation engine, Dexie.js database layer, Zustand stores, dice engine
- **Three Spellcasting Systems (Gap W6)**:
  1. **Known Casters (Bard, Sorcerer, Warlock)**: Choose a fixed number of spells to learn permanently (until level-up). At level 1:
     - Bard: 4 known spells
     - Sorcerer: 2 known spells
     - Warlock: 2 known spells
  2. **Prepared Casters (Cleric, Druid)**: Have access to their entire class spell list. Each day they prepare a subset: [ability modifier + class level] spells (minimum 1). At level 1:
     - Cleric: WIS mod + 1 prepared from full Cleric spell list
     - Druid: WIS mod + 1 prepared from full Druid spell list
     - Note: Cleric domain spells (from subclass) are always prepared and don't count against the limit
  3. **Spellbook Casters (Wizard)**: Start with 6 level 1 spells in spellbook (choose 6). Then prepare [INT mod + 1] spells each day from the spellbook
- **Prepared Spell Count Computation**: [Spellcasting ability modifier] + [class level] (minimum 1). At level 1 with a +3 modifier: 3 + 1 = 4 prepared spells
- **Warlock Pact Magic**: Different from normal spellcasting — spell slots recharge on short rest (not long rest), and at level 1, Warlock has only 1 spell slot which is always cast at its highest available level (1st)
- **Layout**: Spell list on the left, detail pane on the right

## Tasks

- [ ] **T14.3.1** — Create `components/wizard/spells/SpellSelector.tsx` — a browsable, searchable, filterable spell list for level 1 spells available to the class. Layout: spell list on the left, detail pane on the right
- [ ] **T14.3.2** — For **known casters** (Bard, Sorcerer, Warlock): display "Choose N spells to learn" and enforce the exact count. These spells are permanent choices until level-up
- [ ] **T14.3.3** — For **prepared casters** (Cleric, Druid): display the full level 1 spell list as a read-only reference, explain that they can prepare [Ability mod + 1] spells each day, and let them select their initial prepared list. Note: "You can change your prepared spells after each long rest"
- [ ] **T14.3.4** — For **Wizard**: explain the spellbook mechanic — "You start with 6 level 1 spells in your spellbook. Choose 6 spells." Then separately, "You can prepare [INT mod + 1] of these spells each day. Select your initial prepared list."
- [ ] **T14.3.5** — Display the computed "Spells Prepared" count based on ability modifier + class level (minimum 1). Show: "[Ability] modifier ([N]) + Level (1) = [M] prepared spells"
- [ ] **T14.3.6** — Handle Warlock's Pact Magic differently: explain that Warlock spell slots recharge on short rest (not long rest), and that they have only 1 slot at level 1 which is always cast at its highest available level

## Acceptance Criteria

- Known casters (Bard, Sorcerer, Warlock) see "Choose N spells to learn" with enforced count
- Prepared casters (Cleric, Druid) see the full class spell list and select their initial prepared list
- Wizard sees a two-step selection: choose 6 spellbook spells, then choose prepared spells from the spellbook
- Prepared spell count is computed and displayed: "[Ability] modifier + Level = N prepared spells"
- Cleric domain spells are shown as always-prepared and don't count against the prepared limit
- Warlock Pact Magic explanation is shown (short rest recharge, 1 slot at level 1)
- Spell list is browsable, searchable, and filterable with a detail pane for selected spells
- The correct number of spells must be selected per the class's system before proceeding

## Testing Requirements

### Unit Tests (Vitest)
_For pure functions, calculations, data transforms, utilities, type guards, validators_

- `should compute prepared spell count as ability modifier + class level (minimum 1)`
- `should correctly return known spell counts for Bard (4), Sorcerer (2), Warlock (2)`
- `should identify Cleric domain spells as always-prepared and exclude from prepared limit`
- `should return 6 as Wizard spellbook spell count at level 1`

### Functional Tests (React Testing Library)
_For component rendering, user interactions, state changes, prop variations_

- `should display "Choose N spells to learn" and enforce exact count for known casters (Bard, Sorcerer, Warlock)`
- `should display full class spell list as reference for prepared casters (Cleric, Druid) with preparation explanation`
- `should display two-step Wizard flow: choose 6 spellbook spells, then choose prepared spells from spellbook`
- `should display computed Spells Prepared count with formula breakdown`
- `should show Cleric domain spells as always-prepared with Domain Spell label (non-deselectable)`
- `should explain Warlock Pact Magic (short rest recharge, 1 slot at level 1)`
- `should render browsable, searchable, filterable spell list with detail pane`

### E2E Tests (Playwright)
_For critical user journeys, multi-step flows, full-page interactions_

- `should select 4 known spells for Bard and advance`
- `should select 6 spellbook spells for Wizard, then select prepared spells from the spellbook`
- `should see Cleric Life Domain spells (Bless, Cure Wounds) auto-prepared and select additional prepared spells`

### Test Dependencies
- Mock SRD spell data (level 1 spells per class list)
- Mock ability modifier for prepared spell count computation
- Mock Cleric domain spell data from subclass selection
- Test fixtures for each spellcasting system (known, prepared, spellbook)

## Identified Gaps

- **Edge Cases**: Wizard prepared spell count with very low INT modifier (e.g., -1) should enforce minimum of 1 but this edge is not tested
- **Accessibility**: No ARIA labels for spell list browser, detail pane, or search/filter controls
- **Loading/Empty States**: No loading state for spell list filtering

## Dependencies

- **Depends on:** Story 14.2 (SpellStep container and spellcasting summary), Epic 10 Story 10.4 (Cleric domain spells from subclass), Epic 11 Story 11.6 (spellcasting ability modifier for prepared count), Phase 1 SRD spell data
- **Blocks:** Story 14.5 (validation checks spell counts per system)

## Notes

- **Key Difference Between Systems**:
  - Known casters choose spells once and they're locked until level-up. This is a more permanent decision
  - Prepared casters have flexibility — they can change their prepared spells daily. Initial selection is just a starting point
  - Wizard has the most complex system: a spellbook (permanent collection) from which a subset is prepared daily
- **Cleric Domain Spells at Level 1**: Life Domain auto-prepares Bless and Cure Wounds. These should appear in the prepared list with a "Domain Spell" label and cannot be deselected
- **Wizard Spellbook vs. Prepared**: The UI must clearly distinguish between "Choose 6 spells for your spellbook" (permanent) and "Choose N prepared spells from your spellbook" (daily). Consider a two-step flow within the spell selector
- The prepared spell count formula display helps new players understand the mechanic and see how their ability scores affect spellcasting
- At level 1 with a typical modifier of +3, most prepared casters can prepare 4 spells. With modifier +0, the minimum of 1 applies
