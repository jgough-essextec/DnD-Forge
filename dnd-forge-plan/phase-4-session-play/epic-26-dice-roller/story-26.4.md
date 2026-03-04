# Story 26.4 — Roll History Log

> **Epic 26: Dice Roller** | **Phase 4: Session Play Features** (Weeks 7-8)

## Description

As a player, I need to see my recent roll history so I can reference past results and resolve disputes. The roll history is a scrollable log in the dice panel that tracks all rolls made during the session, with color-coding for critical results, re-roll capability, and clipboard support.

## Technical Context

- **App**: D&D Character Forge — local-first React PWA for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, Zustand (state), Dexie.js (IndexedDB), React Router
- **Architecture**: No backend, pure client-side, offline-capable PWA, IndexedDB for persistence
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

## Dependencies

- Story 26.1 (Dice Roller Panel) provides the container (bottom ~30% of panel)
- Story 26.5 (Character Sheet Roll Integration) provides source labels for sheet-triggered rolls

## Notes

- Roll history is intentionally session-scoped (not persisted to IndexedDB) since it's ephemeral play data
- The 50-roll limit prevents memory bloat during long sessions
- Re-roll on click provides a fast way to repeat common rolls (e.g., damage for multiple attacks)
