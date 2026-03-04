# Story 26.4 — Roll History Log

> **Epic 26: Dice Roller** | **Phase 4: Session Play Features** (Weeks 7-8)

## Description

As a player, I need to see my recent roll history so I can reference past results and resolve disputes. The roll history is a scrollable log in the dice panel that tracks all rolls made during the session, with color-coding for critical results, re-roll capability, and clipboard support.

## Technical Context

- **App**: D&D Character Forge — full-stack Django + React web application for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, React Query (server state), Zustand (UI state), Django REST Framework, PostgreSQL, React Router
- **Architecture**: Django REST API backend, React SPA frontend, PostgreSQL persistence, Django session auth
- **Prior Phases Available**: Phase 1 (types, SRD data, calculation engine, database, state stores, dice engine), Phase 2 (character creation wizard), Phase 3 (character sheet 3-page display, gallery, import/export, view/edit mode with auto-save)

### Roll History Entry Data Structure
Each roll history entry should contain:
- **timestamp**: When the roll was made
- **expression**: The dice notation used (e.g., "1d20 + 5")
- **individualResults**: Array of each die's result (e.g., [14] or [6, 3, 5])
- **total**: Final computed result including modifiers
- **sourceLabel**: Context label (e.g., "Perception Check", "Longsword Attack", "Fireball Damage")
- **rollType**: normal | advantage | disadvantage
- **isCritical**: Whether a natural 20 was rolled on d20
- **isFumble**: Whether a natural 1 was rolled on d20
- **isMaxDamage**: Whether all damage dice rolled maximum

### Storage
- Stored in Zustand dice store (in-memory)
- Session-scoped: last 50 rolls per session
- Cleared on page reload (intentional -- this is session data, not persistent character data)
- "Clear History" button available for manual clearing

### Color Coding
- **Green border**: Natural 20 on d20
- **Red border**: Natural 1 on d20
- **Gold border**: Maximum possible damage (all dice rolled max)
- **Default border**: Normal rolls

## Tasks

- [ ] **T26.4.1** — Create `components/dice/RollHistory.tsx` — a scrollable list in the bottom section of the dice panel. Each entry shows: timestamp, roll expression (e.g., "1d20 + 5"), individual die results, total, source label (e.g., "Perception Check", "Longsword Attack")
- [ ] **T26.4.2** — Store roll history in the dice store (Zustand). Persist the last 50 rolls per session. Clear on page reload (session-scoped) or offer a "Clear History" button
- [ ] **T26.4.3** — Color-code entries: green border for natural 20, red border for natural 1, gold for max possible damage, default border for normal rolls
- [ ] **T26.4.4** — Clicking a history entry re-rolls the same expression (quick re-roll). Long-press copies the result text to clipboard
- [ ] **T26.4.5** — Collapsible history section with a "N rolls" counter in the header. Mobile: swipe up to expand history, swipe down to collapse

## Acceptance Criteria

1. Roll history displays in the bottom section of the dice panel as a scrollable list
2. Each entry shows timestamp, expression, individual die results, total, and source label
3. History stores up to 50 rolls per session in the Zustand dice store
4. History is session-scoped (cleared on page reload)
5. "Clear History" button available for manual clearing
6. Entries are color-coded: green for nat 20, red for nat 1, gold for max damage
7. Clicking a history entry re-rolls the same expression
8. Long-pressing a history entry copies the result text to clipboard
9. History section is collapsible with an "N rolls" counter header
10. Mobile: swipe gestures expand/collapse the history section

## Testing Requirements

### Unit Tests (Vitest)
_For pure functions, calculations, data transforms, utilities, type guards, validators_

- `should create a roll history entry with correct timestamp, expression, results, total, and sourceLabel`
- `should enforce 50-roll limit by evicting oldest entry when capacity is exceeded`
- `should determine correct color coding: green for nat 20, red for nat 1, gold for max damage`
- `should detect maximum possible damage roll (all dice rolled maximum value)`
- `should format result text for clipboard copy`

### Functional Tests (React Testing Library)
_For component rendering, user interactions, state changes, prop variations_

- `should render a scrollable list of roll history entries in the dice panel`
- `should display timestamp, expression, individual die results, total, and source label per entry`
- `should color-code entries with green border for natural 20`
- `should color-code entries with red border for natural 1`
- `should color-code entries with gold border for max damage`
- `should show "N rolls" counter in the collapsible section header`
- `should re-roll the same expression when a history entry is clicked`
- `should clear all history when "Clear History" button is clicked`
- `should collapse and expand the history section`

### E2E Tests (Playwright)
_For critical user journeys, multi-step flows, full-page interactions_

- `should make multiple rolls, see them appear in history in reverse chronological order, and re-roll by clicking an entry`
- `should clear history with the Clear History button and see empty state`
- `should verify history is cleared on page reload (session-scoped)`
- `should long-press a history entry and verify clipboard copy on mobile`

### Test Dependencies
- Mock Zustand dice store with pre-populated roll history entries
- Mock clipboard API for long-press copy testing
- Mock timer/date for consistent timestamps
- Roll history entry factory for generating test data

## Identified Gaps

- **Error Handling**: No specification for clipboard copy failure handling (e.g., permissions denied)
- **Loading/Empty States**: No specification for what the history section shows when empty (zero rolls made)
- **Edge Cases**: Behavior when exactly 50 rolls exist and a 51st is added; scroll position behavior when new entries are added
- **Accessibility**: No ARIA labels for history entries; no keyboard navigation within history list; screen reader support for color-coded entries
- **Mobile/Responsive**: Swipe gesture direction (up/down) for expand/collapse may conflict with scroll behavior; minimum touch target for re-roll click vs long-press copy

## Dependencies

- Story 26.1 (Dice Roller Panel) provides the container (bottom ~30% of panel)
- Story 26.5 (Character Sheet Roll Integration) provides source labels for sheet-triggered rolls

## Notes

- Roll history is intentionally session-scoped (not persisted via the API) since it's ephemeral play data
- The 50-roll limit prevents memory bloat during long sessions
- Re-roll on click provides a fast way to repeat common rolls (e.g., damage for multiple attacks)
