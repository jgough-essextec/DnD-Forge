# Story 30.1 — Short Rest Flow

> **Epic 30: Short Rest & Long Rest Automation** | **Phase 4: Session Play Features** (Weeks 7-8)

## Description

As a player, I need a "Short Rest" button that walks me through spending hit dice to recover HP and resets short-rest features. The short rest flow is a multi-step modal that guides the player through hit dice spending (with roll or average options), automatically recovers short-rest class features, prompts for Wizard Arcane Recovery if applicable, and shows a complete summary of all recovery.

## Technical Context

- **App**: D&D Character Forge — local-first React PWA for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, Zustand (state), Dexie.js (IndexedDB), React Router
- **Architecture**: No backend, pure client-side, offline-capable PWA, IndexedDB for persistence
- **Prior Phases Available**: Phase 1 (types, SRD data, calculation engine, database, state stores, dice engine), Phase 2 (character creation wizard), Phase 3 (character sheet 3-page display, gallery, import/export, view/edit mode with auto-save)

### D&D 5e Short Rest Rules (Complete)

**Duration:** A short rest is a period of downtime, at least 1 hour long, during which a character does nothing more strenuous than eating, drinking, reading, and tending to wounds.

**Hit Dice Spending:**
- A character can spend one or more Hit Dice at the end of a short rest
- For each Hit Die spent: roll the die + CON modifier = HP recovered (minimum 0 HP recovered per die)
- HP recovered is added to current HP, capped at max HP
- Hit dice are a limited resource: each character has a number of Hit Dice equal to their level
- Spent hit dice are tracked separately; they recover on long rest (half total, minimum 1)

**Hit Die Type by Class:**
| Class | Hit Die |
|-------|---------|
| Barbarian | d12 |
| Bard | d8 |
| Cleric | d8 |
| Druid | d8 |
| Fighter | d10 |
| Monk | d8 |
| Paladin | d10 |
| Ranger | d10 |
| Rogue | d8 |
| Sorcerer | d6 |
| Warlock | d8 |
| Wizard | d6 |

**Multiclass Hit Dice:** A multiclass character has hit dice from each class. For example, a Fighter 5 / Wizard 3 has 5d10 (Fighter) + 3d6 (Wizard) = 8 total hit dice of two types. The player chooses which type to spend.

**Average Hit Die Values (common house rule):**
| Die | Average (ceil) |
|-----|---------------|
| d6 | 4 |
| d8 | 5 |
| d10 | 6 |
| d12 | 7 |
Average value for spending = ceil(die/2) + CON modifier

**Short Rest Feature Recovery:**
| Feature | Class | Recovery Details |
|---------|-------|-----------------|
| Second Wind | Fighter | 1 use restored |
| Action Surge | Fighter | 1 use restored |
| Channel Divinity | Cleric | All uses restored |
| Wild Shape | Druid | All uses restored |
| Ki Points | Monk | All points restored |
| Warlock Spell Slots | Warlock | All Pact Magic slots restored |
| Bardic Inspiration | Bard (Lv 5+) | All uses restored (Font of Inspiration) |

**Wizard Arcane Recovery:** If the Wizard hasn't used Arcane Recovery today, they may use it during this short rest to recover spell slots up to ceil(Wizard level / 2) total levels (no slot 6th or higher). The Arcane Recovery UI presents a slot selection modal where the Wizard picks which slots to recover, with a running total validated against the level budget. This is tracked with a daily boolean flag reset on long rest.

## Tasks

- [ ] **T30.1.1** — Create `components/session/ShortRestModal.tsx` — triggered from a "Short Rest" button on the character sheet's quick-action bar (bottom of sheet or floating menu). Opens a modal workflow
- [ ] **T30.1.2** — **Step 1: Hit Dice Spending.** Show available hit dice (total minus used). For each available die, show a "Spend" button. Clicking "Spend" rolls the hit die + CON modifier, adds the result to current HP (up to max), and marks that die as used. Show the roll result: "Spent 1d10 + 2 = 8 HP recovered (HP: 18 -> 26)." Allow spending multiple dice sequentially
- [ ] **T30.1.3** — For multiclass characters, show each class's hit dice separately with distinct die types. Let the player choose which die type to spend
- [ ] **T30.1.4** — "Take Average" toggle: instead of rolling, use the average value (ceil(die/2) + CON mod). E.g., d10 average = 6 + CON mod. This is a common house rule option
- [ ] **T30.1.5** — **Step 2: Feature Recovery.** Auto-recover all short-rest class features. Show a summary list: "Recovered: Second Wind (1/1), Channel Divinity (1/1), Warlock Spell Slots (2/2)." Each recovered feature shows its name and restored count
- [ ] **T30.1.6** — **Wizard Arcane Recovery prompt:** if the character is a Wizard and Arcane Recovery hasn't been used today, prompt: "Use Arcane Recovery to restore spell slots?" If yes, open the Arcane Recovery modal (from Epic 28)
- [ ] **T30.1.7** — **Step 3: Summary.** Show a complete rest summary: HP before/after, hit dice spent, features recovered. "Finish Short Rest" button closes the modal and saves all changes
- [ ] **T30.1.8** — Duration note at the top of the modal: "A short rest takes at least 1 hour of light activity"

## Acceptance Criteria

1. "Short Rest" button is accessible from the character sheet's quick-action bar
2. Hit dice spending shows available dice with "Spend" buttons
3. Spending a hit die rolls it + CON modifier and adds to HP (capped at max)
4. Roll result shows: expression, result, HP before/after
5. Multiple hit dice can be spent sequentially
6. Multiclass characters see each class's hit dice separately with distinct die types
7. "Take Average" toggle uses ceil(die/2) + CON mod instead of rolling
8. Short-rest class features auto-recover with a summary list
9. Wizard Arcane Recovery prompt appears if unused today
10. Summary shows complete before/after: HP, hit dice spent, features recovered
11. "Finish Short Rest" saves all changes
12. Duration note displays at the top of the modal

## Testing Requirements

### Unit Tests (Vitest)
_For pure functions, calculations, data transforms, utilities, type guards, validators_

- `should calculate hit die HP recovery as roll result + CON modifier (minimum 0 per die)`
- `should cap HP recovery at max HP`
- `should track available hit dice (total minus used) for each class in multiclass`
- `should calculate average hit die value as ceil(die/2) + CON modifier`
- `should recover all short-rest class features (Second Wind, Action Surge, Channel Divinity, Wild Shape, Ki Points, Warlock slots, Bardic Inspiration Lv5+)`
- `should generate complete rest summary with HP before/after, dice spent, features recovered`

### Functional Tests (React Testing Library)
_For component rendering, user interactions, state changes, prop variations_

- `should render ShortRestModal when "Short Rest" button is clicked`
- `should display available hit dice with "Spend" buttons`
- `should show roll result "Spent 1d10 + 2 = 8 HP recovered (HP: 18 -> 26)" after spending a die`
- `should allow spending multiple hit dice sequentially`
- `should show separate hit dice types for multiclass characters`
- `should toggle "Take Average" to use fixed value instead of rolling`
- `should display auto-recovered features in summary list`
- `should prompt "Use Arcane Recovery?" for Wizard who hasn't used it today`
- `should show complete rest summary with before/after comparison`
- `should display duration note "A short rest takes at least 1 hour"`

### E2E Tests (Playwright)
_For critical user journeys, multi-step flows, full-page interactions_

- `should complete full short rest flow: spend 2 hit dice, see features recover, review summary, and finish`
- `should take short rest as multiclass Fighter/Wizard, spend different die types, and use Arcane Recovery`
- `should verify "Take Average" mode calculates correct HP recovery without rolling`
- `should verify Warlock Pact Magic slots recover after short rest`

### Test Dependencies
- Mock character data for single-class and multiclass characters with hit dice, HP, class features
- Mock dice engine for hit die roll results
- Mock Arcane Recovery modal integration (Story 28.3)
- Mock Zustand character store for feature recovery state
- Feature recovery mapping data

## Identified Gaps

- **Error Handling**: No specification for what happens if the user has 0 available hit dice; no error state if the rest is interrupted
- **Loading/Empty States**: No specification for the summary when no hit dice were spent and no features needed recovery
- **Edge Cases**: "Quick Short Rest" option mentioned in notes but not in tasks or acceptance criteria; behavior when HP is already at max and no features need recovery (trivial rest); interaction between hit die spending and CON modifier changes
- **Accessibility**: No keyboard navigation for the multi-step modal flow; no ARIA labels for "Spend" buttons; screen reader should announce HP recovery results
- **Mobile/Responsive**: Modal sizing on mobile not specified; scroll behavior for long feature recovery lists

## Dependencies

- Epic 26 (Dice Roller) for hit dice rolling animation
- Story 27.1 (HP Tracker) for HP modification
- Story 28.2 (Warlock Pact Magic) for Pact Magic slot recovery
- Story 28.3 (Arcane Recovery) for Wizard Arcane Recovery modal
- Story 30.3 (Class Feature Usage Tracking) for feature recovery data

## Notes

- Hit dice spending is the primary healing mechanism during adventuring days between long rests
- The "Take Average" option is very popular at tables that don't enjoy random HP recovery
- The flow must feel quick -- many groups take short rests frequently and don't want to spend a long time on the UI
- Consider a "Quick Short Rest" option that auto-spends hit dice to reach full HP and skips the step-by-step flow
