# Story 15.1 — Character Sheet Preview

> **Epic 15: Review & Finalize Step** | **Phase 2: Character Creation Wizard** (Weeks 3-4)

## Description

As a player, I need to see a full preview of my finished character with all derived stats computed before I save. This story builds a comprehensive 3-page character sheet preview using the calculation engine to compute all derived stats, rendered in the dark fantasy styling of the app.

## Technical Context

- **App**: D&D Character Forge — full-stack Django + React web application for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, React Query (server state), Zustand (UI state), Django REST Framework, PostgreSQL, React Router
- **Architecture**: Django REST API backend, React SPA frontend, PostgreSQL persistence, Django session auth
- **Phase 1 Foundation Available**: Type system, SRD game data (races, classes, spells, equipment, backgrounds, feats as static JSON), calculation engine, React Query API layer, Zustand stores (UI state), dice engine
- **Calculation Engine**: Computes all derived stats from the wizard state: ability modifiers, proficiency bonus (+2 at level 1), saving throw modifiers (with proficiency), skill modifiers (with proficiency), AC (from armor + DEX), HP (hit die max + CON mod + any subclass bonuses), initiative (DEX mod), speed, passive Perception, attack bonuses, damage rolls, spell save DC, spell attack bonus
- **3-Page Character Sheet Layout**:
  - **Page 1 (Core Stats)**: The main character sheet with abilities, combat stats, skills, personality, features
  - **Page 2 (Backstory & Details)**: Physical description, backstory, allies, equipment, treasure
  - **Page 3 (Spellcasting)**: Only for spellcasters — spellcasting class, ability, DC, attack bonus, cantrips, spell slots, spell list
- **Styling**: Dark fantasy theme with parchment textures, Cinzel headings, consistent with the app's visual identity

## Tasks

- [ ] **T15.1.1** — Create `components/wizard/ReviewStep.tsx` as the Step 7 container. Uses the calculation engine to compute ALL derived stats from the wizard state
- [ ] **T15.1.2** — Create `components/wizard/review/CharacterPreview.tsx` — renders a read-only character sheet matching the 3-page layout described in the spec. This is a preview of what the saved character will look like
- [ ] **T15.1.3** — **Page 1 Preview (Core Stats):**
  - Top banner: character name, "Level 1 [Class]", background, player name, race, alignment, XP (0)
  - Left column: all 6 ability scores with modifiers, saving throws (with proficiency dots), all 18 skills (with proficiency dots and modifiers), passive Perception
  - Center column: AC, initiative, speed, HP max, hit dice, death saves (empty), attacks section (showing equipped weapons with computed attack bonus and damage), spellcasting summary (if applicable)
  - Right column: personality traits, ideals, bonds, flaws, features & traits list (racial + class + background)
- [ ] **T15.1.4** — **Page 2 Preview (Backstory & Details):**
  - Character appearance fields (age, height, weight, eyes, skin, hair)
  - Backstory text
  - Allies & organizations
  - Equipment/inventory with weight totals
  - Treasure/currency
- [ ] **T15.1.5** — **Page 3 Preview (Spellcasting — if applicable):**
  - Spellcasting class, ability, spell save DC, spell attack bonus
  - Cantrips listed
  - Level 1 spell slots (count)
  - Known/prepared spells listed with school and brief description
- [ ] **T15.1.6** — Use the dark fantasy styling (parchment textures, Cinzel headings) for the preview to match the app's theme

## Acceptance Criteria

- The Review Step computes all derived stats using the calculation engine
- Page 1 shows character header, ability scores, saving throws, skills, AC, HP, initiative, attacks, personality, features
- Page 2 shows appearance, backstory, allies, equipment inventory, and treasure
- Page 3 shows spellcasting details (only for spellcasters)
- All values are correctly computed: ability modifiers, proficiency-marked saving throws and skills, AC from armor, HP from hit die + CON mod, attack bonuses, spell save DC
- The preview is read-only and styled with the dark fantasy theme (parchment textures, Cinzel headings)
- Non-spellcasters do not see Page 3

## Testing Requirements

### Unit Tests (Vitest)
_For pure functions, calculations, data transforms, utilities, type guards, validators_

- `should compute all derived stats correctly: ability modifiers, saving throws with proficiency, skill modifiers with proficiency`
- `should compute AC correctly based on equipped armor type, DEX modifier, shield, and class features`
- `should compute HP as hit die max + CON modifier + subclass bonuses (Draconic Resilience, Hill Dwarf Toughness)`
- `should compute initiative as DEX modifier`
- `should compute passive Perception as 10 + Perception skill modifier`
- `should compute attack bonuses (melee STR + prof, ranged DEX + prof, finesse best of STR/DEX + prof)`
- `should compute spell save DC as 8 + proficiency + spellcasting ability modifier`

### Functional Tests (React Testing Library)
_For component rendering, user interactions, state changes, prop variations_

- `should render Page 1 with character header, ability scores, saving throws, skills, AC, HP, initiative, attacks, personality, features`
- `should render Page 2 with appearance, backstory, allies, equipment inventory, and treasure`
- `should render Page 3 with spellcasting details only for spellcasters`
- `should not render Page 3 for non-spellcasters`
- `should display all values correctly computed by the calculation engine`
- `should style the preview with dark fantasy theme (parchment textures, Cinzel headings)`

### E2E Tests (Playwright)
_For critical user journeys, multi-step flows, full-page interactions_

- `should display a complete character sheet preview for a High Elf Wizard with all 3 pages`
- `should display a complete character sheet preview for a Human Fighter with only 2 pages (no spellcasting)`
- `should show correct attack strings (e.g., "Longsword: +5 to hit, 1d8+3 slashing")`

### Test Dependencies
- Mock complete wizard state for a fully-built character (all steps completed)
- Mock Phase 1 calculation engine for all derived stat computations
- Mock Epic 16 display components (AbilityScoreDisplay, ProficiencyDot, ModifierBadge, DiceNotation)
- Test fixtures for caster and non-caster complete characters

## Identified Gaps

- **Error Handling**: No specification for what happens if wizard state is incomplete when reaching review (e.g., skipped optional fields)
- **Loading/Empty States**: No loading state while calculation engine computes all derived stats
- **Performance**: Computing all derived stats from full wizard state could be expensive; no render time target specified
- **Mobile/Responsive**: 3-page layout navigation (tabs vs. scroll) is mentioned but not formalized in acceptance criteria

## Dependencies

- **Depends on:** ALL previous Epics (8-14, 16) — all wizard state must be available to assemble the complete character preview; Phase 1 calculation engine for all derived stats; Epic 16 Story 16.3 (AbilityScoreDisplay, ProficiencyDot, ModifierBadge, DiceNotation)
- **Blocks:** Story 15.2 (validation summary appears alongside or above the preview), Story 15.3 (save assembles the same data), Story 15.4 (quick edit modifies sections of the preview)

## Notes

- **Derived Stat Computations for Level 1**:
  - Proficiency bonus: +2 (always at level 1)
  - Saving throw modifier: ability modifier + proficiency bonus (if proficient)
  - Skill modifier: ability modifier + proficiency bonus (if proficient)
  - AC: depends on armor type and class features — no armor: 10+DEX; light armor: base+DEX; medium armor: base+DEX(max 2); heavy armor: base only; special: Barbarian Unarmored Defense (10+DEX+CON), Monk (10+DEX+WIS), Draconic Resilience (13+DEX); shield adds +2
  - HP: hit die maximum + CON modifier (+ subclass bonuses like Sorcerer Draconic Resilience +1, Dwarf Hill Dwarf Toughness +1)
  - Initiative: DEX modifier
  - Passive Perception: 10 + Perception skill modifier
  - Melee attack bonus: STR modifier + proficiency bonus (or DEX for finesse weapons)
  - Ranged attack bonus: DEX modifier + proficiency bonus
  - Spell save DC: 8 + proficiency bonus + spellcasting ability modifier
  - Spell attack bonus: proficiency bonus + spellcasting ability modifier
- The attack section should show each equipped weapon with its full attack string (e.g., "Longsword: +5 to hit, 1d8+3 slashing")
- Features & traits list should be comprehensive: all racial traits + class level 1 features + subclass features + background feature + feat (Variant Human)
- The preview should be visually impressive — this is the "payoff" moment where the player sees their complete character for the first time
- Consider making the preview scrollable or paginated (tabs for Page 1/2/3) rather than one very long scroll
