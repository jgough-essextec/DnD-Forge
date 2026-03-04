# Story 35.3 — Combat Tracker Main View

> **Epic 35: Initiative & Combat Tracker** | **Phase 5: DM Features** (Weeks 9-10)

## Description

As a DM running combat, I need to see the initiative order, track whose turn it is, cycle through turns, and manage the encounter round by round.

## Technical Context

- **App**: D&D Character Forge — local-first React PWA for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, Zustand (state), Dexie.js (IndexedDB), React Router
- **Architecture**: No backend, pure client-side, offline-capable PWA, IndexedDB for persistence. DM role is local (no authentication), campaigns are local data with join codes as local import mechanism.
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
- Encounter state persists to IndexedDB (survives page refresh)

## Dependencies

- Story 35.1 — Encounter setup (creates the encounter)
- Story 35.2 — Initiative rolling (provides sorted initiative order)
- Epic 33 Story 33.1 — Encounter data model and store
- Epic 38 Story 38.1 — Route structure (`/campaign/:id/encounter/:encounterId`)

## Notes

- The combat tracker is the most complex and time-sensitive DM tool. Performance and responsiveness are critical — every interaction should feel instant.
- Persisting encounter state to IndexedDB is essential. If the DM accidentally refreshes the page, combat should resume exactly where it left off.
- The "Remove & Log XP" action feeds into Story 35.6 (End Encounter & XP Distribution).
- Consider a combat log panel (append-only log of actions) as mentioned in Open Question 5 of the source spec.
