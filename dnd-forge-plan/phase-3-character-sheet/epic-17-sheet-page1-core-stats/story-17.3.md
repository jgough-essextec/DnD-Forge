# Story 17.3 — Saving Throws List

> **Epic 17: Character Sheet — Page 1 (Core Stats)** | **Phase 3: Character Sheet & Management** (Weeks 5-6)

## Description
As a player, I need to see all 6 saving throws with proficiency indicators and computed modifiers.

## Technical Context
- **App**: D&D Character Forge — full-stack Django + React web application for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, React Query (server state), Zustand (UI state), Django REST Framework, PostgreSQL, React Router
- **Architecture**: Django REST API backend, React SPA frontend, PostgreSQL persistence, Django session auth
- **Prior Phases Available**: Phase 1 (types, SRD data, calculation engine, database, state stores, dice engine), Phase 2 (character creation wizard — guided and freeform modes)
- **Left Column Layout**: Saving throws render below the ability score blocks in the left column (~30% width)
- **Saving Throw Computation**: modifier = ability modifier + proficiency bonus (if proficient). Proficiency is granted by class (e.g., Fighter is proficient in STR and CON saves)
- **Dice Engine**: Phase 1 dice engine available for click-to-roll functionality. Roll 1d20 + modifier and display the result inline
- **Edit Mode**: Proficiency dots become toggleable checkboxes. Custom bonuses can be added for features like Paladin's Aura of Protection (adds CHA mod to all saves)

## Tasks
- [ ] **T17.3.1** — Create `components/character/page1/SavingThrowsList.tsx` — rendered below the ability score blocks. Lists all 6 saving throws as a compact vertical list: proficiency dot, modifier value, and ability name
- [ ] **T17.3.2** — Proficiency dot: filled circle if proficient (class-granted), empty circle if not. The modifier is: ability modifier + proficiency bonus (if proficient). Display the modifier as a signed number (e.g., "+5", "-1")
- [ ] **T17.3.3** — **Edit mode:** proficiency dots become toggleable checkboxes. Toggling proficiency immediately recalculates the modifier. Add a small "+ Custom" button for features that add bonuses to specific saves (e.g., Paladin's Aura of Protection adds CHA mod to all saves)
- [ ] **T17.3.4** — Tooltip on each saving throw shows the computation breakdown: "DEX Save: DEX Mod (+3) + Proficiency (+2) = +5"
- [ ] **T17.3.5** — In view mode, clicking a saving throw triggers a dice roll (hooks into the dice engine from Phase 1): roll 1d20 + modifier, display the result inline briefly

## Acceptance Criteria
- All 6 saving throws (STR, DEX, CON, INT, WIS, CHA) display in a compact vertical list
- Proficiency dots correctly indicate which saves are proficient (filled) vs. not proficient (empty)
- Modifiers are correctly computed: ability modifier + proficiency bonus (if proficient)
- Modifiers display as signed numbers (e.g., "+5", "-1")
- Tooltips show the full computation breakdown
- In view mode, clicking a saving throw rolls 1d20 + modifier and shows the result inline
- In edit mode, proficiency dots are toggleable and modifier recalculates immediately
- Custom bonus button is available in edit mode for special features

## Testing Requirements

### Unit Tests (Vitest)
_For pure functions, calculations, data transforms, utilities, type guards, validators_

- `should compute saving throw modifier as ability modifier + proficiency bonus when proficient`
- `should compute saving throw modifier as ability modifier only when not proficient`
- `should format saving throw modifier as signed number ("+5", "-1")`
- `should generate tooltip breakdown string "DEX Save: DEX Mod (+3) + Proficiency (+2) = +5"`

### Functional Tests (React Testing Library)
_For component rendering, user interactions, state changes, prop variations_

- `should render all 6 saving throws in a compact vertical list`
- `should display filled proficiency dot for proficient saves and empty dot for non-proficient`
- `should display correctly computed modifiers as signed numbers`
- `should show computation breakdown tooltip on hover`
- `should trigger dice roll (1d20 + modifier) and display result when clicking a save in view mode`
- `should render proficiency dots as toggleable checkboxes in edit mode`
- `should recalculate modifier immediately when toggling proficiency in edit mode`
- `should show "+ Custom" button in edit mode for special save bonuses`

### E2E Tests (Playwright)
_For critical user journeys, multi-step flows, full-page interactions_

- `should click a saving throw in view mode, see dice roll animation, and display the result inline`

### Test Dependencies
- Mock character data with known proficiencies (e.g., Fighter: STR, CON proficient)
- Mock dice engine for controlled roll results
- Mock calculation engine for save modifier computation
- Mock view/edit mode context

## Identified Gaps

- **Error Handling**: No specification for handling custom bonus input validation (non-numeric, negative values)
- **Accessibility**: No keyboard navigation for saving throw list, no ARIA labels for proficiency dots, no screen reader support for dice roll results
- **Edge Cases**: No specification for how custom bonuses interact with proficiency (additive? displayed separately?)

## Dependencies
- Story 17.2 (Ability Score Blocks) — saves depend on ability modifiers
- Story 17.10 (Proficiency Bonus) — saves use proficiency bonus when proficient
- Phase 1 dice engine for click-to-roll functionality
- Phase 1 calculation engine for save modifier computation
- Epic 20 view/edit mode toggle system

## Notes
- Some class features add unique bonuses to saving throws: Paladin's Aura of Protection adds CHA modifier to all saves within 10 feet, Monk's Diamond Soul grants proficiency in all saves at level 14
- The "+ Custom" button in edit mode accommodates these and other situational bonuses
