# Story 35.5 — Add Combatants Mid-Combat

> **Epic 35: Initiative & Combat Tracker** | **Phase 5: DM Features** (Weeks 9-10)

## Description

As a DM, I need to add new monsters or NPCs to an ongoing encounter when reinforcements arrive.

## Technical Context

- **App**: D&D Character Forge — full-stack Django + React web application for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, React Query (server state), Zustand (UI state), Django REST Framework, PostgreSQL, React Router
- **Architecture**: Django REST API backend, React SPA frontend, PostgreSQL persistence, Django session auth. DM role authenticated via Django User model, campaigns have owner FK with join codes for player association.
- **Prior Phases Available**: Phase 1-4 (full character creation, sheet display, session play features including dice roller, HP tracker, spell slots, conditions, rest, level up)

This story extends the combat tracker to allow adding new combatants during an active encounter. Reinforcements, ambushes, and environmental effects are common mid-combat events that the DM needs to handle seamlessly.

**Combatant data model:**
```typescript
interface Combatant {
  id: string;
  name: string;
  type: 'player' | 'npc' | 'monster';
  initiativeRoll?: number;
  initiativeModifier: number;
  armorClass: number;
  hitPointMax: number;
  hitPointCurrent: number;
  tempHitPoints: number;
  conditions: string[];
  notes: string;
  isVisible: boolean;
  groupId?: string;
}
```

**Mid-combat addition flow:**
1. "Add Combatant" button available during combat (same form as Story 35.1 encounter setup)
2. New combatant rolls initiative immediately upon addition
3. Inserted into the correct position in the initiative order based on roll
4. If new combatant's initiative is higher than the current turn, they act this round. If lower, they act next round. Display a note: "[Orc Warchief] joins at initiative 18 — acts this round!"

**Lair Actions:** A special combatant type that acts on initiative count 20 (or a custom count). Represents environmental or lair effects (e.g., "The ceiling drips acid" or "Magma erupts from fissures"). Shows with a distinct icon (castle/cave icon).

## Tasks

- [ ] **T35.5.1** — "Add Combatant" button accessible during combat (not just setup). Opens the same add combatant form from Story 35.1
- [ ] **T35.5.2** — New combatant rolls initiative immediately and is inserted into the correct position in the initiative order
- [ ] **T35.5.3** — If the new combatant's initiative is higher than the current turn, they act this round. If lower, they act next round. Show a note: "[Orc Warchief] joins at initiative 18 — acts this round!"
- [ ] **T35.5.4** — "Add Lair Action" option: a special combatant type that acts on initiative count 20 (or a custom count). Represents environmental or lair effects. Shows with a distinct icon (castle/cave icon)

## Acceptance Criteria

- "Add Combatant" button is accessible during active combat
- Adding a combatant uses the same form as encounter setup (including SRD search)
- New combatant rolls initiative immediately on addition
- New combatant is inserted at the correct position in the initiative order
- A message indicates whether the new combatant acts this round or next
- "Add Lair Action" creates a special combatant on initiative count 20 (or custom)
- Lair actions display with a distinct castle/cave icon
- Adding combatants mid-combat does not disrupt the current turn or round tracking

## Testing Requirements

### Unit Tests (Vitest)
_For pure functions, calculations, data transforms, utilities, type guards, validators_

- `should insert new combatant at correct position in initiative order based on roll`
- `should determine if new combatant acts this round or next based on initiative vs current turn`
- `should create lair action combatant on initiative count 20 by default`
- `should not disrupt current turn or round tracking when adding mid-combat`

### Functional Tests (React Testing Library)
_For component rendering, user interactions, state changes, prop variations_

- `should render "Add Combatant" button during active combat`
- `should open the same add combatant form from encounter setup (Story 35.1)`
- `should roll initiative immediately for newly added combatant`
- `should display message "[Name] joins at initiative [N] -- acts this round!" or "acts next round"`
- `should render "Add Lair Action" option with distinct castle/cave icon`
- `should insert lair action at initiative count 20 with custom count option`

### E2E Tests (Playwright)
_For critical user journeys, multi-step flows, full-page interactions_

- `should add a monster mid-combat, see it inserted in initiative order, and verify turn cycling remains correct`
- `should add a lair action and verify it acts on initiative count 20 each round`

### Test Dependencies
- Active encounter fixture mid-combat (Round 2, Turn 3)
- Mock dice roller for initiative roll
- SRD monster data for mid-combat search
- Lair action fixture data

## Identified Gaps

- **Error Handling**: No specification for what happens if the add combatant form is cancelled mid-combat (partial state)
- **Accessibility**: No keyboard navigation for the mid-combat add combatant form
- **Edge Cases**: Behavior when adding a combatant with initiative exactly matching the current turn combatant; DM manually setting initiative for new combatant (mentioned in notes but not in tasks)
- **Mobile/Responsive**: No mobile layout for the mid-combat add combatant panel

## Dependencies

- Story 35.1 — Encounter setup (add combatant form reused)
- Story 35.2 — Initiative rolling (for new combatant initiative)
- Story 35.3 — Combat tracker main view (host component)
- Phase 4 — Dice roller (for initiative roll)

## Notes

- This is a common gameplay scenario: "Four more goblins burst through the door!" The DM needs to add them quickly without interrupting combat flow.
- Lair actions are a D&D 5e mechanic used by powerful creatures in their domain. They represent the environment fighting alongside the creature. Initiative count 20 is the standard, but some homebrew lair actions use different counts.
- Consider allowing the DM to manually set initiative for new combatants instead of requiring a roll (useful for "they act right after the current creature" scenarios).
