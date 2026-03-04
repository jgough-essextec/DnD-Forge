# Story 26.3 — Advantage & Disadvantage Rolling

> **Epic 26: Dice Roller** | **Phase 4: Session Play Features** (Weeks 7-8)

## Description

As a player, I need quick buttons for advantage (roll 2d20, keep highest) and disadvantage (roll 2d20, keep lowest) since these are among the most common D&D roll modifications. The system must provide clear visual feedback showing both dice results with the kept die highlighted and the dropped die dimmed.

## Technical Context

- **App**: D&D Character Forge — full-stack Django + React web application for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, React Query (server state), Zustand (UI state), Django REST Framework, PostgreSQL, React Router
- **Architecture**: Django REST API backend, React SPA frontend, PostgreSQL persistence, Django session auth
- **Prior Phases Available**: Phase 1 (types, SRD data, calculation engine, database, state stores, dice engine), Phase 2 (character creation wizard), Phase 3 (character sheet 3-page display, gallery, import/export, view/edit mode with auto-save)

### D&D 5e Advantage/Disadvantage Rules
- **Advantage:** Roll 2d20, use the higher result. Common sources: being invisible, ally using the Help action, attacking a prone target from within 5 feet, Reckless Attack (Barbarian)
- **Disadvantage:** Roll 2d20, use the lower result. Common sources: being blinded, frightened, poisoned, prone, restrained, attacking a target you can't see
- **Cancellation rule:** If you have both advantage and disadvantage simultaneously (from any number of sources), they cancel out and you roll normally (1d20)
- **Non-stacking:** Multiple sources of advantage don't grant extra dice -- still just 2d20 keep highest. Same for disadvantage
- Advantage/disadvantage only applies to d20 rolls (attack rolls, ability checks, saving throws), never to damage rolls

### Roll Expression Mapping
- Normal d20: `1d20 + modifier`
- Advantage: `2d20kh1 + modifier` (roll 2d20, keep highest 1)
- Disadvantage: `2d20kl1 + modifier` (roll 2d20, keep lowest 1)

### Result Display Format
- **Advantage:** "ADV: [high] / ~~[low]~~ + [mod] = [total]" with high value in gold, low value dimmed and struck through
- **Disadvantage:** "DIS: ~~[high]~~ / [low] + [mod] = [total]" with low value in red, high value dimmed and struck through

## Tasks

- [ ] **T26.3.1** — Add "ADV" and "DIS" toggle buttons above the d20 quick-roll button. When ADV is active, any d20 roll becomes 2d20-keep-highest. When DIS is active, it becomes 2d20-keep-lowest. Toggles are mutually exclusive (activating one deactivates the other)
- [ ] **T26.3.2** — Visual: both d20s animate and show results. The kept die is highlighted in gold (ADV) or red (DIS). The dropped die is dimmed. The result display shows: "ADV: [high] / ~~[low]~~ + [mod] = [total]"
- [ ] **T26.3.3** — ADV/DIS toggles auto-reset after each roll (one-shot behavior). Add a "Lock" option (pin icon) to keep advantage/disadvantage active for multiple consecutive rolls
- [ ] **T26.3.4** — When rolling from the character sheet (e.g., clicking a skill), show a pre-roll dialog asking: "Normal / Advantage / Disadvantage?" — or default to normal and let the user long-press for options

## Acceptance Criteria

1. ADV and DIS toggle buttons are visible above the d20 button in the dice panel
2. ADV and DIS are mutually exclusive -- activating one deactivates the other
3. When ADV is active, d20 rolls become 2d20-keep-highest
4. When DIS is active, d20 rolls become 2d20-keep-lowest
5. Both d20 results animate and display, with the kept die highlighted and dropped die dimmed
6. Result display clearly shows both values with the calculation breakdown
7. ADV/DIS toggles auto-reset after each roll by default
8. Lock (pin) option keeps ADV/DIS active for multiple consecutive rolls
9. Sheet-triggered rolls offer Normal/Advantage/Disadvantage choice

## Testing Requirements

### Unit Tests (Vitest)
_For pure functions, calculations, data transforms, utilities, type guards, validators_

- `should convert ADV toggle to 2d20kh1 roll expression with modifier`
- `should convert DIS toggle to 2d20kl1 roll expression with modifier`
- `should enforce mutual exclusivity (activating ADV deactivates DIS and vice versa)`
- `should reset ADV/DIS toggle state after a roll when lock is not enabled`
- `should maintain ADV/DIS toggle state after a roll when lock is enabled`

### Functional Tests (React Testing Library)
_For component rendering, user interactions, state changes, prop variations_

- `should render ADV and DIS toggle buttons above the d20 quick-roll button`
- `should highlight ADV button when active and dim DIS button`
- `should deactivate ADV when DIS is clicked (mutual exclusivity)`
- `should display both d20 results with kept die highlighted in gold for advantage`
- `should display both d20 results with kept die highlighted in red for disadvantage`
- `should show dropped die as dimmed with strikethrough text`
- `should display result format "ADV: [high] / ~~[low]~~ + [mod] = [total]"`
- `should show lock/pin icon and keep ADV/DIS active after roll when locked`
- `should auto-reset ADV/DIS after roll when lock is not engaged`

### E2E Tests (Playwright)
_For critical user journeys, multi-step flows, full-page interactions_

- `should toggle advantage, roll d20, see both results with correct highlighting, and verify auto-reset`
- `should lock disadvantage, make multiple rolls, and verify DIS persists across rolls`
- `should trigger a sheet roll and see Normal/Advantage/Disadvantage choice dialog`

### Test Dependencies
- Mock dice engine to return controlled d20 pairs (e.g., [18, 5] for advantage, [3, 17] for disadvantage)
- Mock Zustand dice store for toggle state
- Story 26.1 panel component for integration context

## Identified Gaps

- **Error Handling**: No specification for what happens if ADV/DIS is toggled during an active animation
- **Edge Cases**: Behavior when both d20s roll the same value (e.g., two 15s) not specified; interaction with critical hit/fumble when advantage/disadvantage is active (e.g., advantage rolls [20, 1])
- **Accessibility**: No keyboard shortcut for toggling ADV/DIS; no ARIA state for toggle buttons; screen reader announcement for which die was kept/dropped
- **Mobile/Responsive**: Touch target size for ADV/DIS buttons not specified; long-press vs tap behavior for sheet-triggered roll options on mobile

## Dependencies

- Story 26.1 (Dice Roller Panel) for button placement
- Story 26.2 (Dice Animation) for rendering both d20s simultaneously
- Story 26.5 (Character Sheet Roll Integration) for sheet-triggered rolls

## Notes

- Advantage/disadvantage only modifies d20 rolls, not damage or other die types
- The Phase 1 dice engine already supports `2d20kh1` and `2d20kl1` expressions
- The "Lock" feature is important for extended combat where a condition grants persistent advantage/disadvantage
