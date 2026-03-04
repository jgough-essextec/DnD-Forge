# Story 35.3 — Combat Tracker Main View

> **Epic 35: Initiative & Combat Tracker** | **Phase 5: DM Features** (Weeks 9-10)

## Description

As a DM running combat, I need to see the initiative order, track whose turn it is, cycle through turns, and manage the encounter round by round.

## Technical Context

- **App**: D&D Character Forge — full-stack Django + React web application for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, React Query (server state), Zustand (UI state), Django REST Framework, PostgreSQL, React Router
- **Architecture**: Django REST API backend, React SPA frontend, PostgreSQL persistence, Django session auth. DM role authenticated via Django User model, campaigns have owner FK with join codes for player association.
- **Prior Phases Available**: Phase 1-4 (full character creation, sheet display, session play features including dice roller, HP tracker, spell slots, conditions, rest, level up)

This story creates the main combat tracker view — the core DM tool for running combat encounters.

**Encounter data model** (relevant state fields):
```typescript
interface Encounter {
  id: string;
  campaignId: string;
  combatants: Combatant[];
  currentTurnIndex: number;       // Index in sorted initiative
  roundNumber: number;            // Current combat round
  isActive: boolean;
}
```

**Route:** `/campaign/:id/encounter/:encounterId` — full-screen overlay or dedicated page.

**Initiative order list:** Vertical list of all combatants sorted by initiative (highest first). Current turn combatant has prominent gold border and "CURRENT TURN" indicator. Previous turns dimmed, upcoming turns normal.

**Each combatant row shows:**
- Initiative number
- Name (bold for current turn)
- Type icon (sword for player, skull for monster, mask for NPC)
- AC badge
- HP bar (current/max with color gradient)
- Condition badges
- Notes preview

**Turn management:**
- **"Next Turn" button (primary action):** Advances to next combatant. If last combatant just went, starts a new round (increments round counter). Round number displayed prominently: "Round 3"
- **"Previous Turn" button:** Goes back one step for corrections
- **"Skip turn":** Right-click or long-press to skip (useful for incapacitated combatants). Shows strikethrough
- **"Delay/Ready action":** Move a combatant's position mid-combat. "Delay" pushes to just before next combatant. "Ready" marks as acting on a trigger (visual badge)
- **"Remove combatant":** For defeated monsters or fleeing NPCs. Option to "Remove & Log XP" which adds monster's XP to encounter total

**Round tracker:** "Round [N]" at the top. Useful for tracking spell durations (1 minute = 10 rounds).

## Tasks

- [ ] **T35.3.1** — Create `components/dm/combat/CombatTracker.tsx` — the main combat view. Route: `/campaign/:id/encounter/:encounterId`. Full-screen overlay or dedicated page
- [ ] **T35.3.2** — **Initiative order list:** a vertical list of all combatants sorted by initiative (highest first). Current turn combatant is highlighted with a prominent gold border and "CURRENT TURN" indicator. Previous turns are dimmed, upcoming turns are normal
- [ ] **T35.3.3** — Each combatant row shows: initiative number, name (bold for current turn), type icon (sword for player, skull for monster, mask for NPC), AC badge, HP bar (current/max with color gradient), condition badges, notes preview
- [ ] **T35.3.4** — **"Next Turn" button (primary action):** advances to the next combatant. If the last combatant just went, start a new round (increment round counter). Show round number prominently: "Round 3"
- [ ] **T35.3.5** — **"Previous Turn" button:** goes back one step for corrections. DMs frequently need to undo an accidental advance
- [ ] **T35.3.6** — **Round tracker:** "Round [N]" displayed at the top. Useful for tracking spell durations (e.g., "lasts 1 minute = 10 rounds")
- [ ] **T35.3.7** — **Skip turn:** right-click or long-press on a combatant to "Skip" their turn (useful for incapacitated or fleeing combatants). Skipped combatants show with a strikethrough
- [ ] **T35.3.8** — **Delay/Ready action:** option to move a combatant's position in the initiative order mid-combat. "Delay" pushes them to just before the next combatant. "Ready" marks them as acting on a trigger (visual badge)
- [ ] **T35.3.9** — **Remove combatant mid-combat:** "Remove" option for defeated monsters (or fleeing NPCs). Removed combatants disappear from the order. Option to "Remove & Log XP" which adds that monster's XP to the encounter total

## Acceptance Criteria

- Combat tracker displays at `/campaign/:id/encounter/:encounterId` as full-screen or dedicated page
- Combatants are shown in a vertical list sorted by initiative (highest first)
- Current turn combatant is highlighted with gold border and "CURRENT TURN" label
- Previous turns are dimmed, upcoming turns have normal styling
- Each row shows initiative, name, type icon, AC, HP bar, conditions, and notes
- "Next Turn" advances turn and increments round at end of initiative order
- "Previous Turn" allows going back for corrections
- Round tracker shows current round number prominently
- Skip turn shows strikethrough on skipped combatants
- Delay/Ready action allows repositioning in initiative order
- Removing a combatant removes from order with optional XP logging
- Encounter state persists via the API (survives page refresh)

## Testing Requirements

### Unit Tests (Vitest)
_For pure functions, calculations, data transforms, utilities, type guards, validators_

- `should advance currentTurnIndex to next combatant on "Next Turn"`
- `should increment roundNumber when currentTurnIndex wraps past the last combatant`
- `should decrement currentTurnIndex on "Previous Turn" without going below 0`
- `should move a delayed combatant to just before the next combatant in initiative order`
- `should remove a combatant from the initiative order and adjust currentTurnIndex`
- `should log XP when removing a combatant with "Remove & Log XP" option`

### Functional Tests (React Testing Library)
_For component rendering, user interactions, state changes, prop variations_

- `should render vertical combatant list sorted by initiative (highest first)`
- `should highlight current turn combatant with gold border and "CURRENT TURN" indicator`
- `should dim previous turns and display upcoming turns with normal styling`
- `should show each combatant row with initiative number, name, type icon, AC, HP bar, conditions, and notes`
- `should advance turn and show updated round number on "Next Turn" click`
- `should go back one turn on "Previous Turn" click`
- `should display round tracker showing "Round [N]" prominently`
- `should apply strikethrough styling on skipped combatants`
- `should mark readied combatants with a visual "Ready" badge`

### E2E Tests (Playwright)
_For critical user journeys, multi-step flows, full-page interactions_

- `should run through a full combat round cycling through all combatants and advancing to Round 2`
- `should skip a combatant, remove a defeated monster, and verify turn order updates correctly`
- `should persist encounter state via the API and survive a page refresh`
- `should navigate to combat tracker at /campaign/:id/encounter/:encounterId`

### Test Dependencies
- Mock encounter with 5+ combatants sorted by initiative
- Mock Zustand encounter store with persistence via the API
- Combatant fixtures with varied types (player, monster, NPC)
- Mock React Router for route parameter testing

## Identified Gaps

- **Error Handling**: No specification for handling corrupted encounter state on page refresh; no undo for accidental combatant removal
- **Accessibility**: No keyboard shortcuts for Next/Previous Turn; no screen reader announcements for turn changes
- **Mobile/Responsive**: Full-screen overlay vs dedicated page decision not finalized for mobile
- **Performance**: No specification for maximum combatant count or render performance requirements for the tracker
- **Edge Cases**: Behavior when all combatants are removed mid-combat; behavior when "Previous Turn" is pressed at Round 1, Turn 1

## Dependencies

- Story 35.1 — Encounter setup (creates the encounter)
- Story 35.2 — Initiative rolling (provides sorted initiative order)
- Epic 33 Story 33.1 — Encounter data model and store
- Epic 38 Story 38.1 — Route structure (`/campaign/:id/encounter/:encounterId`)

## Notes

- The combat tracker is the most complex and time-sensitive DM tool. Performance and responsiveness are critical — every interaction should feel instant.
- Persisting encounter state via the API is essential. If the DM accidentally refreshes the page, combat should resume exactly where it left off.
- The "Remove & Log XP" action feeds into Story 35.6 (End Encounter & XP Distribution).
- Consider a combat log panel (append-only log of actions) as mentioned in Open Question 5 of the source spec.
