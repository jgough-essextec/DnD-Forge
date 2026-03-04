# Story 11.2 — Standard Array Assignment

> **Epic 11: Ability Score Step** | **Phase 2: Character Creation Wizard** (Weeks 3-4)

## Description

As a player using Standard Array, I need a drag-and-drop interface to assign each of the six values to an ability. This story builds the Standard Array assignment UI with draggable value chips, droppable ability slots, click-to-assign alternative, suggested assignment based on class, racial bonus display, and completion tracking.

## Technical Context

- **App**: D&D Character Forge — local-first React PWA for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, Zustand (state), Dexie.js (IndexedDB), React Router
- **Architecture**: No backend, pure client-side, offline-capable PWA, IndexedDB for persistence
- **Phase 1 Foundation Available**: Type system, SRD game data (races, classes, spells, equipment, backgrounds, feats as static JSON), calculation engine, Dexie.js database layer, Zustand stores, dice engine
- **Standard Array Values**: [15, 14, 13, 12, 10, 8] — six fixed values to assign to the six abilities (STR, DEX, CON, INT, WIS, CHA)
- **Drag-and-Drop Library**: @dnd-kit/core and @dnd-kit/sortable for drag-and-drop interactions
- **Assignment Mechanics**: Each value chip is draggable. Each ability slot is a drop target. Dropping a value on an occupied slot swaps the values. A "Reset" button clears all assignments
- **Accessibility Alternative**: Click-to-assign for accessibility and mobile — clicking an unassigned value highlights it, then clicking an ability slot assigns it
- **Suggested Assignment**: Based on class primary ability recommendations:
  - Wizard: INT highest, then DEX/CON
  - Fighter: STR highest (or DEX for DEX-based), then CON
  - Rogue: DEX highest, then CON/CHA
  - Cleric: WIS highest, then STR/CON or DEX/CON
  - (etc. for all 12 classes)
- **Racial Bonuses**: Displayed as "+N" badge next to each ability slot. Final total (base + racial) and resulting modifier shown
- **Modifier Calculation**: modifier = Math.floor((total - 10) / 2)

## Tasks

- [ ] **T11.2.1** — Create `components/wizard/ability/StandardArrayAssigner.tsx` — displays the six unassigned values [15, 14, 13, 12, 10, 8] as draggable chips at the top, and six ability score slots below (STR, DEX, CON, INT, WIS, CHA)
- [ ] **T11.2.2** — Implement drag-and-drop using `@dnd-kit/core` and `@dnd-kit/sortable`: each value chip is draggable; each ability slot is a drop target. Dropping a value on a slot assigns it. If the slot already has a value, the values swap
- [ ] **T11.2.3** — Alternative assignment method (for accessibility and mobile): clicking an unassigned value highlights it, then clicking an ability slot assigns it. A "Reset" button clears all assignments
- [ ] **T11.2.4** — Show a "Suggested Assignment" button that auto-assigns values optimally based on the selected class's primary abilities (e.g., Wizard: highest to INT, second to DEX or CON)
- [ ] **T11.2.5** — Display the racial bonus next to each ability slot as a "+N" badge (e.g., Elf gets +2 DEX). Show the final total (base + racial) and the resulting modifier
- [ ] **T11.2.6** — All six values must be assigned before proceeding. Show a completion indicator ("4 of 6 assigned")

## Acceptance Criteria

- Six Standard Array values [15, 14, 13, 12, 10, 8] are displayed as draggable chips
- Six ability slots (STR, DEX, CON, INT, WIS, CHA) accept dropped value chips
- Dropping a value on an occupied slot swaps the two values
- Click-to-assign works as an alternative: click a value, then click a slot to assign
- "Reset" button clears all assignments and returns all values to the unassigned pool
- "Suggested Assignment" auto-assigns values optimally for the selected class
- Racial bonuses appear as "+N" badges next to each slot
- Final total (base + racial) and modifier are displayed for each assigned ability
- A completion indicator shows how many of 6 values have been assigned
- Cannot proceed until all 6 values are assigned

## Testing Requirements

### Unit Tests (Vitest)
_For pure functions, calculations, data transforms, utilities, type guards, validators_

- `should compute optimal suggested assignment for each of the 12 classes (e.g., Wizard: 15 to INT)`
- `should calculate modifier correctly as Math.floor((total - 10) / 2) for all score values`
- `should verify Standard Array values are exactly [15, 14, 13, 12, 10, 8]`

### Functional Tests (React Testing Library)
_For component rendering, user interactions, state changes, prop variations_

- `should display six Standard Array values [15, 14, 13, 12, 10, 8] as draggable chips`
- `should render six ability slots (STR, DEX, CON, INT, WIS, CHA) as drop targets`
- `should assign a value when dragging a chip to an ability slot`
- `should swap values when dropping a chip on an already-occupied slot`
- `should support click-to-assign as an alternative: click value then click slot`
- `should clear all assignments and return values to pool when Reset is clicked`
- `should auto-assign values optimally for selected class when Suggested Assignment is clicked`
- `should display racial bonus as +N badge next to each ability slot`
- `should show final total (base + racial) and resulting modifier for each assigned ability`
- `should show completion indicator (e.g., "4 of 6 assigned") and prevent proceeding until all 6 assigned`

### E2E Tests (Playwright)
_For critical user journeys, multi-step flows, full-page interactions_

- `should drag-and-drop all 6 values to ability slots and see correct totals with racial bonuses`
- `should use click-to-assign on mobile to assign all values`
- `should use Suggested Assignment for Wizard and verify INT gets highest value`

### Test Dependencies
- Mock @dnd-kit/core and @dnd-kit/sortable for drag-and-drop testing
- Mock racial bonuses from wizard store (e.g., Elf +2 DEX)
- Mock class data for suggested assignment computation
- Test fixtures for each class's optimal assignment

## Identified Gaps

- **Accessibility**: Click-to-assign is mentioned as accessibility alternative but no screen reader announcements for drag-drop outcomes
- **Mobile/Responsive**: Drag-and-drop on mobile noted as potentially less intuitive, but no fallback UX or minimum touch target sizes specified
- **Edge Cases**: What happens if user tries to assign the same value to two slots simultaneously via rapid clicking

## Dependencies

- **Depends on:** Story 11.1 (Method Selection — this renders when Standard Array is selected), Epic 9 Story 9.5 (racial ability bonuses from race selection), Epic 10 (class for suggested assignment), @dnd-kit/core and @dnd-kit/sortable packages
- **Blocks:** Story 11.5 (summary uses assigned values), Story 11.6 (validation checks all values assigned)

## Notes

- @dnd-kit provides accessible drag-and-drop with keyboard support out of the box, which is important for accessibility compliance
- The swap behavior when dropping on an occupied slot is crucial — without it, the user would have to clear the slot first, which is tedious
- The "Suggested Assignment" should be clearly labeled as a suggestion, not a requirement. Consider a note: "This is our suggestion based on your class, but feel free to customize!"
- Modifier display format: "+3" for positive, "+0" for zero, "-1" for negative. Use color coding from ModifierBadge (Epic 16)
- On mobile, drag-and-drop may be less intuitive — ensure the click-to-assign method is equally discoverable
- The racial bonus badge should use a different visual style (e.g., smaller, lighter color) to distinguish it from the base score
