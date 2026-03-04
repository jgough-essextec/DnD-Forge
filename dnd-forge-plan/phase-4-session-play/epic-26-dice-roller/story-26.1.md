# Story 26.1 — Dice Roller Panel

> **Epic 26: Dice Roller** | **Phase 4: Session Play Features** (Weeks 7-8)

## Description

As a player during a session, I need a dice roller I can access from anywhere in the app to roll any combination of dice quickly. The dice roller panel is a persistent, toggleable UI element that provides quick-roll buttons for all standard D&D dice types, a modifier input, custom expression input, and a dice tray animation area. It must be accessible from any page in the app without navigating away from the current view.

## Technical Context

- **App**: D&D Character Forge — local-first React PWA for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, Zustand (state), Dexie.js (IndexedDB), React Router
- **Architecture**: No backend, pure client-side, offline-capable PWA, IndexedDB for persistence
- **Prior Phases Available**: Phase 1 (types, SRD data, calculation engine, database, state stores, dice engine), Phase 2 (character creation wizard), Phase 3 (character sheet 3-page display, gallery, import/export, view/edit mode with auto-save)

### D&D 5e Dice Context
The standard D&D dice set includes: d4, d6, d8, d10, d12, d20, and d100 (percentile). Players commonly need to roll:
- **d20** for attack rolls, ability checks, saving throws, initiative
- **d4/d6/d8/d10/d12** for damage, healing, hit dice
- **d100** for percentile-based tables (wild magic, treasure)

Complex roll expressions the parser must handle:
- `1d20 + 5` (skill check with modifier)
- `2d20kh1 + 5` (advantage: roll 2d20, keep highest)
- `2d20kl1 + 5` (disadvantage: roll 2d20, keep lowest)
- `4d6kh3` (ability score roll: 4d6 keep highest 3)
- `2d6 + 3` (damage roll)
- `8d6` (fireball damage)
- `1d12 + 1d6 + 5` (mixed weapon + feature damage)

The Phase 1 dice engine handles the math/parsing; this story builds the interactive UI layer.

### Panel Behavior
- **Desktop:** Slide-out right panel (~320px wide)
- **Mobile:** Bottom sheet overlay
- **Toggle:** d20 floating action button (FAB) always visible in bottom-right corner
- **State Persistence:** Open/closed state stored in Zustand UI store

## Tasks

- [ ] **T26.1.1** — Create `components/dice/DiceRollerPanel.tsx` — a persistent, toggleable panel. On desktop: slide-out right panel (~320px wide). On mobile: bottom sheet overlay. Toggled via a d20 floating action button (FAB) that's always visible in the bottom-right corner
- [ ] **T26.1.2** — Panel layout: three zones stacked vertically — dice tray (animation area, ~40% height), quick-roll buttons (dice selection, ~30% height), and roll history log (~30% height)
- [ ] **T26.1.3** — Quick-roll buttons: one button per die type (d4, d6, d8, d10, d12, d20, d100/percentile). Each button shows the die icon and type. Single tap rolls 1 of that die. Long press or number badge lets the user set quantity (e.g., "Roll 3d8")
- [ ] **T26.1.4** — Modifier input: a compact "+" / "-" adjuster next to the dice buttons. Set a modifier (+5, -2, etc.) that's added to the next roll total. Pre-populated from the last used modifier. Reset to 0 after each roll
- [ ] **T26.1.5** — "Roll" button (accent-gold): commits the current dice selection + modifier and triggers the roll animation. Keyboard shortcut: Enter
- [ ] **T26.1.6** — Custom expression input: a text field that accepts standard dice notation (e.g., "2d6 + 1d4 + 3"). Parse with the Phase 1 dice engine. Show a validation error for invalid expressions. History of recently typed expressions as suggestions
- [ ] **T26.1.7** — Panel remembers its open/closed state in the UI store. Opening the panel on mobile doesn't navigate away from the current page

## Acceptance Criteria

1. Dice roller panel can be toggled open/closed from anywhere in the app via the FAB
2. Desktop: panel slides out from the right (~320px). Mobile: bottom sheet overlay
3. All 7 die types (d4, d6, d8, d10, d12, d20, d100) have individual quick-roll buttons
4. Tapping a die button rolls 1 of that die. Long-press allows quantity selection
5. Modifier input allows +/- values and is applied to the roll total
6. Custom expression input accepts standard dice notation and validates with the Phase 1 dice engine
7. Panel open/closed state persists in the UI store
8. Mobile: opening the panel does not navigate away from the current page

## Testing Requirements

### Unit Tests (Vitest)
_For pure functions, calculations, data transforms, utilities, type guards, validators_

- `should parse standard dice notation expressions correctly (e.g., "2d6 + 1d4 + 3")`
- `should validate dice expressions and reject malformed input (e.g., "2d", "abc")`
- `should store and retrieve panel open/closed state from UI store`
- `should maintain modifier value state and reset to 0 after each roll`

### Functional Tests (React Testing Library)
_For component rendering, user interactions, state changes, prop variations_

- `should render the DiceRollerPanel with all three layout zones (tray, buttons, history)`
- `should display all 7 die type quick-roll buttons (d4, d6, d8, d10, d12, d20, d100)`
- `should toggle panel open/closed when FAB is clicked`
- `should render as a right slide-out panel on desktop viewport`
- `should render as a bottom sheet overlay on mobile viewport`
- `should update modifier input with +/- adjustments`
- `should trigger a roll when the "Roll" button is clicked`
- `should accept custom dice expression in the text input field`
- `should show validation error for invalid custom expressions`
- `should display recently typed expressions as suggestions`

### E2E Tests (Playwright)
_For critical user journeys, multi-step flows, full-page interactions_

- `should open dice panel via FAB, select d20, set modifier to +5, and execute a roll`
- `should type a custom expression "2d6 + 3", roll, and see result in dice tray`
- `should persist panel open state across page navigation`
- `should not navigate away from current page when opening panel on mobile`

### Test Dependencies
- Mock Zustand UI store for panel state
- Mock Phase 1 dice engine for roll parsing/evaluation
- Viewport mocking for mobile/desktop layout tests
- Mock keyboard events for Enter shortcut

## Identified Gaps

- **Loading/Empty States**: No specification for what the dice tray shows before any roll is made
- **Edge Cases**: Maximum modifier value not specified; behavior for extremely large custom expressions (e.g., "100d100") not defined
- **Accessibility**: No ARIA labels specified for die buttons, FAB, or modifier controls; no keyboard navigation between die buttons
- **Mobile/Responsive**: Exact breakpoint for desktop vs mobile layout not specified; bottom sheet height/drag behavior undefined
- **Performance**: No render time target for panel open animation; no limit on expression suggestion history count

## Dependencies

- Phase 1 dice engine (roll expression parsing and evaluation)
- Phase 3 character sheet layout (the panel overlays/accompanies the sheet)

## Notes

- The dice tray animation area (zone 1) is populated by Story 26.2 (Dice Animation)
- The roll history log (zone 3) is populated by Story 26.4 (Roll History Log)
- This panel serves as the foundation for all dice-related interactions in the app
