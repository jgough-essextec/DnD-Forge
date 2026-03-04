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

## Dependencies

- Story 35.3 — Combat tracker main view (host component)
- Epic 33 Story 33.1 — Combatant data model
- Phase 4 — HP tracker logic, conditions system, death saves, dice roller

## Notes

- HP changes to player combatants must sync back to the actual Character record in IndexedDB. When combat ends, the character's HP should reflect what happened during combat.
- Monster HP only exists within the encounter — it is not persisted beyond the encounter lifecycle.
- The concentration check reminder is one of the most commonly forgotten rules in D&D 5e. Automating the reminder is a high-value DM feature.
- Quick damage buttons save significant time during combat when the DM knows the damage and just needs to apply it quickly.
