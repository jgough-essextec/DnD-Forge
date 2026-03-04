# Story 35.4 — Combatant HP & Condition Management

> **Epic 35: Initiative & Combat Tracker** | **Phase 5: DM Features** (Weeks 9-10)

## Description

As a DM, I need to quickly apply damage, healing, and conditions to any combatant during their turn or as reactions occur.

## Technical Context

- **App**: D&D Character Forge — local-first React PWA for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, Zustand (state), Dexie.js (IndexedDB), React Router
- **Architecture**: No backend, pure client-side, offline-capable PWA, IndexedDB for persistence. DM role is local (no authentication), campaigns are local data with join codes as local import mechanism.
- **Prior Phases Available**: Phase 1-4 (full character creation, sheet display, session play features including dice roller, HP tracker, spell slots, conditions, rest, level up)

This story adds HP and condition management to the combat tracker. It reuses the same HP logic and conditions system from Phase 4 but applies them to all combatants (players, monsters, NPCs) in the combat tracker context.

**Combatant HP fields:**
```typescript
interface Combatant {
  hitPointMax: number;
  hitPointCurrent: number;
  tempHitPoints: number;
  conditions: string[];
}
```

**HP management:**
- **Inline HP editing:** Click HP bar to open compact damage/heal input (same UI pattern as Phase 4 HP tracker). Enter number, click Damage or Heal.
- **Quick damage buttons:** On current turn combatant: "-5", "-10", "-15", "Custom" presets.
- **Damage logic:** Same as Phase 4 — temp HP absorbs first, overflow to 0, massive damage check.
- **Temp HP:** Editable field per combatant. Damage applies to temp HP first.

**Death handling:**
- **Monster at 0 HP:** Auto-apply "Unconscious" condition, show "Defeated" overlay, fade to grey. Option to remove from tracker or keep (for resurrection).
- **Player at 0 HP:** Show death saves tracker inline on combatant row. "Roll Death Save" button rolls 1d20 with Phase 4 death save logic. Alert: "Player [Name] is making death saves!"

**Conditions:**
- "Add Condition" button on each combatant row opens the condition picker (same as Phase 4).
- Active conditions display as colored badges. Remove by clicking.

**Concentration tracking:**
- Spellcaster combatants show a "Concentrating" badge.
- When a concentrating combatant takes damage, show reminder: "Concentration check! DC = max(10, [damage/2])" with a "Roll" button.

## Tasks

- [ ] **T35.4.1** — **Inline HP editing:** clicking the HP bar on any combatant opens a compact damage/heal input (same UI pattern as Phase 4 HP tracker). Enter a number, click Damage or Heal. HP updates in real-time with the color gradient
- [ ] **T35.4.2** — **Quick damage buttons:** preset quick-damage buttons on the current turn combatant: "-5", "-10", "-15", "Custom". These are the most common damage amounts DMs apply
- [ ] **T35.4.3** — **Monster death:** when a monster reaches 0 HP, auto-apply "Unconscious" condition and show a "Defeated" overlay. Option to remove from tracker or keep for resurrection scenarios. Show a brief death animation (fade to grey)
- [ ] **T35.4.4** — **Player at 0 HP:** when a player character reaches 0 HP, show the death saves tracker inline on their combatant row. "Roll Death Save" button rolls 1d20 and auto-fills the result (same Phase 4 logic). Alert: "Player [Name] is making death saves!"
- [ ] **T35.4.5** — **Conditions:** "Add Condition" button on each combatant row. Opens the condition picker (same as Phase 4). Active conditions display as colored badges. Removing conditions works the same way
- [ ] **T35.4.6** — **Temp HP in combat:** editable temp HP field on each combatant. Damage applies to temp HP first (same Phase 4 logic)
- [ ] **T35.4.7** — **Concentration tracking:** for spellcaster combatants, a "Concentrating" badge. When the concentrating combatant takes damage, show a reminder: "Concentration check! DC = max(10, [damage/2])" with a "Roll" button

## Acceptance Criteria

- Clicking HP bar opens inline damage/heal input with same Phase 4 UI pattern
- HP updates in real-time with color gradient (green/yellow/red)
- Quick damage buttons ("-5", "-10", "-15", "Custom") appear on current turn combatant
- Monsters at 0 HP auto-receive "Unconscious" condition with "Defeated" overlay and fade animation
- Defeated monsters can be removed from tracker or kept
- Players at 0 HP show inline death saves tracker with "Roll Death Save" button
- Death save alert displays prominently: "Player [Name] is making death saves!"
- Conditions can be added/removed via the Phase 4 condition picker
- Temp HP is editable and absorbs damage before regular HP
- Concentration badge appears on concentrating spellcasters
- Concentration check reminder fires when a concentrating combatant takes damage with correct DC
- All HP changes for player combatants sync back to the character's IndexedDB record

## Testing Requirements

### Unit Tests (Vitest)
_For pure functions, calculations, data transforms, utilities, type guards, validators_

- `should apply damage to temp HP first, then regular HP (Phase 4 logic)`
- `should clamp HP at 0 (no negative HP) and trigger death handling`
- `should calculate concentration check DC as max(10, damage/2)`
- `should auto-apply "Unconscious" condition when monster reaches 0 HP`
- `should correctly track death save successes and failures for player characters`

### Functional Tests (React Testing Library)
_For component rendering, user interactions, state changes, prop variations_

- `should open inline damage/heal input when HP bar is clicked`
- `should render quick damage buttons ("-5", "-10", "-15", "Custom") on current turn combatant`
- `should update HP bar color gradient in real-time after damage/heal`
- `should show "Defeated" overlay with fade-to-grey animation on monster at 0 HP`
- `should display inline death saves tracker on player character at 0 HP`
- `should show alert "Player [Name] is making death saves!" when player reaches 0 HP`
- `should add/remove conditions via Phase 4 condition picker`
- `should display "Concentrating" badge on spellcaster combatants`
- `should show concentration check reminder with correct DC when concentrating combatant takes damage`
- `should render editable temp HP field per combatant`

### E2E Tests (Playwright)
_For critical user journeys, multi-step flows, full-page interactions_

- `should apply damage to a monster, reduce to 0 HP, and see "Defeated" overlay`
- `should apply damage to a player, trigger death saves, and roll a death save`
- `should add a condition to a combatant and see it persist across turns`
- `should sync player HP changes back to character's IndexedDB record after combat`

### Test Dependencies
- Mock Phase 4 HP tracker logic, conditions system, death save logic, and dice roller
- Combatant fixtures at various HP levels (full, half, 0, with temp HP)
- Spellcaster combatant fixture with concentration state
- Mock IndexedDB for player character HP sync verification

## Identified Gaps

- **Error Handling**: No specification for handling massive damage (instant death when damage exceeds max HP + current HP)
- **Loading/Empty States**: No loading state for inline damage/heal input
- **Accessibility**: No keyboard-accessible alternative to clicking HP bar; no screen reader announcements for HP changes or death save results
- **Edge Cases**: Behavior when healing a "Defeated" monster (should it remove Unconscious?); behavior when temp HP is applied to a character at 0 HP

## Dependencies

- Story 35.3 — Combat tracker main view (host component)
- Epic 33 Story 33.1 — Combatant data model
- Phase 4 — HP tracker logic, conditions system, death saves, dice roller

## Notes

- HP changes to player combatants must sync back to the actual Character record in IndexedDB. When combat ends, the character's HP should reflect what happened during combat.
- Monster HP only exists within the encounter — it is not persisted beyond the encounter lifecycle.
- The concentration check reminder is one of the most commonly forgotten rules in D&D 5e. Automating the reminder is a high-value DM feature.
- Quick damage buttons save significant time during combat when the DM knows the damage and just needs to apply it quickly.
