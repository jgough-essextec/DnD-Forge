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

## Dependencies

- Phase 1 dice engine (roll expression parsing and evaluation)
- Phase 3 character sheet layout (the panel overlays/accompanies the sheet)

## Notes

- The dice tray animation area (zone 1) is populated by Story 26.2 (Dice Animation)
- The roll history log (zone 3) is populated by Story 26.4 (Roll History Log)
- This panel serves as the foundation for all dice-related interactions in the app
