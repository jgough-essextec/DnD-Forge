# Story 35.2 — Initiative Rolling & Sort

> **Epic 35: Initiative & Combat Tracker** | **Phase 5: DM Features** (Weeks 9-10)

## Description

As a DM, I need to roll initiative for all combatants (or input manually) and see them sorted in initiative order.

## Technical Context

- **App**: D&D Character Forge — local-first React PWA for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, Zustand (state), Dexie.js (IndexedDB), React Router
- **Architecture**: No backend, pure client-side, offline-capable PWA, IndexedDB for persistence. DM role is local (no authentication), campaigns are local data with join codes as local import mechanism.
- **Prior Phases Available**: Phase 1-4 (full character creation, sheet display, session play features including dice roller, HP tracker, spell slots, conditions, rest, level up)

This story creates the initiative rolling screen — the transitional step between encounter setup and active combat.

**Combatant data model** (relevant fields):
```typescript
interface Combatant {
  id: string;
  name: string;
  type: 'player' | 'npc' | 'monster';
  initiativeRoll?: number;        // Rolled initiative value
  initiativeModifier: number;     // DEX mod or custom
  groupId?: string;               // For grouped monsters
}
```

**Rolling methods:**
- **"Roll All" button:** Rolls 1d20 + initiative modifier for every combatant simultaneously. Staggered animation (100ms per combatant) for each result appearing.
- **Roll individually:** Click the d20 icon next to a specific combatant to roll just their initiative.
- **Manual override:** DM can type any number directly into the initiative field (for players who roll physical dice at the table).
- **Auto-roll for monsters, manual for players:** Toggle option where monster initiatives auto-roll but player slots remain blank for DM to enter declared rolls.

**Tie-breaking rules:**
- Same initiative total: sort by initiative modifier (higher goes first)
- Still tied: maintain the order they were added (or let DM drag to reorder)
- Show a "Tie" indicator on tied combatants

**Sort preview:** Shows the sorted initiative order in real-time as rolls are made. "Confirm Order" button locks the order and starts combat.

Initiative rolls use the same dice rolling system from Phase 4 (1d20 + modifier).

## Tasks

- [ ] **T35.2.1** — Create `components/dm/combat/InitiativeRoller.tsx` — a transitional screen shown after encounter setup. Lists all combatants with an initiative input field next to each
- [ ] **T35.2.2** — **"Roll All" button:** rolls 1d20 + initiative modifier for every combatant simultaneously. Animate each roll result appearing with a staggered effect (100ms per combatant). Results populate the initiative fields
- [ ] **T35.2.3** — **Roll individually:** clicking the d20 icon next to a specific combatant rolls just their initiative. Manual override: DM can type any number directly into the initiative field (for players who roll their own dice at the table)
- [ ] **T35.2.4** — **Auto-roll for monsters, manual for players:** a toggle option. When enabled, monster initiatives are auto-rolled but player slots remain blank for the DM to enter their players' declared rolls
- [ ] **T35.2.5** — **Tie-breaking:** when two combatants have the same initiative, sort by initiative modifier (higher goes first). If still tied, maintain the order they were added (or let DM drag to reorder). Show a "Tie" indicator on tied combatants
- [ ] **T35.2.6** — **Sort preview:** show the sorted initiative order in real-time as rolls are made. "Confirm Order" button locks the order and starts combat

## Acceptance Criteria

- Initiative roller screen shows all combatants with editable initiative fields
- "Roll All" rolls 1d20 + modifier for every combatant with staggered animation
- Individual rolling works via d20 icon per combatant
- Manual override allows typing initiative values directly
- "Auto-roll monsters, manual for players" toggle works correctly
- Tie-breaking sorts by modifier, then by original order
- Tied combatants show a "Tie" visual indicator
- Sort preview updates in real-time as rolls are made
- "Confirm Order" locks initiative order and starts active combat

## Dependencies

- Story 35.1 — Encounter setup (provides the combatant list)
- Epic 33 Story 33.1 — Encounter and Combatant data models
- Phase 4 — Dice roller system (1d20 rolling logic)

## Notes

- The "auto-roll monsters, manual for players" mode is the most common DM workflow at physical tables where players roll their own dice but the DM uses the app for monster management.
- The staggered animation for "Roll All" adds drama and helps the DM track which combatant got which result. Consider a brief highlight effect on each roll.
- Grouped monsters (from Story 35.1) should share a single initiative roll — rolling for one applies to all in the group.
- The sort preview is critical for the DM to verify the order before combat starts.
