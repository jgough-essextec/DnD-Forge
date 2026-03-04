# Story 17.8 — Attacks & Spellcasting Section

> **Epic 17: Character Sheet — Page 1 (Core Stats)** | **Phase 3: Character Sheet & Management** (Weeks 5-6)

## Description
As a player, I need to see my equipped weapons with computed attack bonuses and damage, plus a summary of spellcasting attacks.

## Technical Context
- **App**: D&D Character Forge — full-stack Django + React web application for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, React Query (server state), Zustand (UI state), Django REST Framework, PostgreSQL, React Router
- **Architecture**: Django REST API backend, React SPA frontend, PostgreSQL persistence, Django session auth
- **Prior Phases Available**: Phase 1 (types, SRD data, calculation engine, database, state stores, dice engine), Phase 2 (character creation wizard — guided and freeform modes)
- **Attacks Section Computation (Gap S7)**: Each equipped weapon generates an attack row:
  - Name: weapon name from equipment
  - Attack Bonus: proficiency bonus + STR mod (melee) or DEX mod (ranged). Finesse weapons: higher of STR/DEX. Monk weapons: use DEX if higher
  - Damage: weapon damage dice + STR mod (melee) or DEX mod (ranged). Two-handed versatile weapons show both dice
  - Type: Slashing/Piercing/Bludgeoning from weapon data
  - Properties: Range, thrown, finesse, etc. as compact badges
- **Spellcaster Attack Cantrips**: Attack cantrips (e.g., Fire Bolt) also appear here with spell attack bonus and damage
- **Dice Engine**: Phase 1 dice engine for combined attack + damage rolls

## Tasks
- [ ] **T17.8.1** — Create `components/character/page1/AttacksSection.tsx` — a table with columns: Attack Name, Attack Bonus, Damage/Type. Pre-populated from the character's equipped weapons
- [ ] **T17.8.2** — Auto-populate weapon attacks from equipped weapons: for each weapon in the character's equipment marked as equipped, generate a row with:
  - Name: weapon name
  - Attack Bonus: proficiency bonus + ability modifier (STR for melee, DEX for ranged, higher of STR/DEX for finesse)
  - Damage: weapon damage dice + ability modifier + damage type (e.g., "1d8 + 3 slashing")
- [ ] **T17.8.3** — Handle weapon properties in the display: versatile weapons show both damage values (e.g., "1d8/1d10 + 3"), thrown weapons show melee and ranged attack bonuses, ammunition weapons show range
- [ ] **T17.8.4** — For spellcasters, add a row for attack cantrips (e.g., "Fire Bolt: +5 to hit, 1d10 fire, range 120ft") below the weapon rows
- [ ] **T17.8.5** — **Edit mode:** allow adding/removing attack rows manually (for homebrew or special abilities). Each field is editable. Add an "Add Attack" button that opens a picker: choose from equipped weapons, known attack spells, or enter a custom attack
- [ ] **T17.8.6** — In view mode, clicking an attack row triggers a combined roll: attack roll (1d20 + attack bonus) and damage roll (damage dice + modifier). Display both results inline
- [ ] **T17.8.7** — Below the attack rows, include a freeform "Notes" area for spellcasting summary text (e.g., "Spell Save DC 15, Spell Attack +7") or special attack notes

## Acceptance Criteria
- Attacks table displays with columns: Attack Name, Attack Bonus, Damage/Type
- Equipped weapons auto-populate attack rows with correctly computed bonuses
- Attack bonus correctly uses STR for melee, DEX for ranged, higher of STR/DEX for finesse
- Damage shows dice + modifier + damage type
- Versatile weapons show both one-handed and two-handed damage
- Thrown weapons show both melee and ranged attack bonuses
- Spellcaster attack cantrips appear below weapon rows
- Clicking an attack in view mode rolls both attack (1d20 + bonus) and damage
- Edit mode allows adding/removing/editing attack rows
- "Add Attack" picker offers equipped weapons, attack spells, and custom entries
- Freeform notes area displays below the attack rows

## Testing Requirements

### Unit Tests (Vitest)
_For pure functions, calculations, data transforms, utilities, type guards, validators_

- `should compute melee attack bonus as proficiency + STR modifier`
- `should compute ranged attack bonus as proficiency + DEX modifier`
- `should compute finesse attack bonus as proficiency + higher of STR/DEX`
- `should compute weapon damage as damage dice + ability modifier + damage type`
- `should format versatile weapon damage showing both one-handed and two-handed values`
- `should generate attack rows from equipped weapons list`
- `should generate cantrip attack rows for spellcasters with spell attack bonus`

### Functional Tests (React Testing Library)
_For component rendering, user interactions, state changes, prop variations_

- `should render attacks table with columns: Attack Name, Attack Bonus, Damage/Type`
- `should auto-populate attack rows from equipped weapons`
- `should display correct attack bonus for melee, ranged, and finesse weapons`
- `should display damage with dice, modifier, and type (e.g., "1d8 + 3 slashing")`
- `should show versatile weapon damage for both one-handed and two-handed`
- `should display spellcaster attack cantrips below weapon rows`
- `should roll attack (1d20 + bonus) and damage when clicking an attack row in view mode`
- `should allow adding/removing/editing attack rows in edit mode`
- `should show "Add Attack" picker with equipped weapons, attack spells, and custom entries`
- `should render freeform notes area below attack rows`

### E2E Tests (Playwright)
_For critical user journeys, multi-step flows, full-page interactions_

- `should click an attack row, see combined attack roll and damage roll results displayed inline`
- `should add a custom attack in edit mode and see it appear in the attacks table`

### Test Dependencies
- Mock character data with equipped weapons (melee, ranged, finesse, versatile)
- Mock character data for spellcaster with attack cantrips
- Mock SRD weapon data for properties and damage dice
- Mock dice engine for controlled attack and damage rolls
- Mock view/edit mode context

## Identified Gaps

- **Error Handling**: No specification for what happens when no weapons are equipped (empty attacks table display)
- **Edge Cases**: No specification for Monk weapon handling (DEX instead of STR) beyond a note
- **Accessibility**: No ARIA labels for the attacks table, no keyboard interaction for attack rolls, no screen reader support for roll results
- **Loading/Empty States**: No visual treatment for empty attacks section (no equipped weapons, no spells)

## Dependencies
- Story 17.2 (Ability Score Blocks) — attack bonuses depend on STR/DEX modifiers
- Story 17.10 (Proficiency Bonus) — attack bonus includes proficiency
- Story 18.3 (Equipment) — attacks are generated from equipped weapons
- Phase 1 SRD weapon data for properties, damage dice, and types
- Phase 1 dice engine for combined attack + damage rolls
- Phase 1 spell data for attack cantrips
- Epic 20 view/edit mode toggle system

## Notes
- The Attacks section is one of the most complex display areas on the sheet (Gap S7) because every value is computed, not just stored
- Monk weapons are a special case: they can use DEX instead of STR for attack and damage
- The notes area commonly contains the spellcasting summary for casters (Spell Save DC, Spell Attack Bonus)
- Attack rows should update automatically when equipment changes (equip/unequip weapons on Page 2)
