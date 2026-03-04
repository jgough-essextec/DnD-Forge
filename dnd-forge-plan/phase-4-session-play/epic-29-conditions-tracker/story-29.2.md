# Story 29.2 — Add / Remove Conditions

> **Epic 29: Conditions Tracker** | **Phase 4: Session Play Features** (Weeks 7-8)

## Description

As a player, I need to easily add and remove conditions as they're applied during gameplay. The system must support all 14 standard conditions plus exhaustion with its 6-level increment/decrement system, provide contextual auto-suggestions based on game state, and persist active conditions in the character data.

## Technical Context

- **App**: D&D Character Forge — local-first React PWA for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, Zustand (state), Dexie.js (IndexedDB), React Router
- **Architecture**: No backend, pure client-side, offline-capable PWA, IndexedDB for persistence
- **Prior Phases Available**: Phase 1 (types, SRD data, calculation engine, database, state stores, dice engine), Phase 2 (character creation wizard), Phase 3 (character sheet 3-page display, gallery, import/export, view/edit mode with auto-save)

### All 14 Standard D&D 5e Conditions (for Add Dropdown)

1. **Blinded** — Can't see; auto-fail sight checks; attacks have disadvantage; attacks against have advantage
2. **Charmed** — Can't attack charmer; charmer has advantage on social checks
3. **Deafened** — Can't hear; auto-fail hearing checks
4. **Frightened** — Disadvantage on checks and attacks while source visible; can't approach source
5. **Grappled** — Speed becomes 0; no speed bonuses
6. **Incapacitated** — Can't take actions or reactions
7. **Invisible** — Attacks have advantage; attacks against have disadvantage
8. **Paralyzed** — Incapacitated; can't move/speak; auto-fail STR/DEX saves; attacks against have advantage; melee hits are crits
9. **Petrified** — Incapacitated; can't move/speak/perceive; auto-fail STR/DEX saves; resistance to all damage; immune to poison/disease
10. **Poisoned** — Disadvantage on attacks and ability checks
11. **Prone** — Disadvantage on attacks; melee attacks against have advantage, ranged have disadvantage
12. **Restrained** — Speed 0; disadvantage on DEX saves and attacks; attacks against have advantage
13. **Stunned** — Incapacitated; can't move; faltering speech; auto-fail STR/DEX saves; attacks against have advantage
14. **Unconscious** — Incapacitated; can't move/speak; unaware; drops items; falls prone; auto-fail STR/DEX saves; attacks against have advantage; melee hits are crits

**Exhaustion (special -- 6 levels, cumulative):**
| Level | Effect |
|-------|--------|
| 1 | Disadvantage on ability checks |
| 2 | Speed halved |
| 3 | Disadvantage on attack rolls and saving throws |
| 4 | Hit point maximum halved |
| 5 | Speed reduced to 0 |
| 6 | Death |

### Condition Behavior Rules
- **No stacking:** Conditions don't stack (except exhaustion). If a condition is already active, it cannot be added again
- **Exhaustion stacks:** Each application increments by 1 level (up to 6). Removal decrements by 1 level
- **Exhaustion level 6:** Triggers instant death
- **Long rest:** Reduces exhaustion by 1 level (if fed/watered); other conditions may end (DM discretion)

### Auto-Suggestions
- When HP reaches 0: auto-suggest adding "Unconscious"
- When a prone-causing effect is used: suggest "Prone"
- These are suggestions only -- the player confirms or dismisses

## Tasks

- [ ] **T29.2.1** — "Add Condition" button (+ icon) at the end of the conditions strip. Opens a dropdown/modal showing all 14 conditions + exhaustion as selectable options. Each shows name and a one-line summary
- [ ] **T29.2.2** — Selecting a condition adds it to the active list immediately. If the condition is already active, show a note: "Already active" (conditions don't stack except exhaustion)
- [ ] **T29.2.3** — For **Exhaustion**: selecting it increments the level by 1 (up to 6). Show the current level and a +/- stepper. Each increment shows the new cumulative effect. Reaching level 6 triggers a dramatic warning: "Your character dies from exhaustion!"
- [ ] **T29.2.4** — "Remove Condition" via the badge's remove button or by clicking the condition in the add dropdown (toggle behavior). Removing exhaustion decrements by 1 level (not full removal)
- [ ] **T29.2.5** — Quick-add shortcuts: conditions that commonly come from specific triggers show contextual suggestions. For example, when HP reaches 0, auto-suggest adding "Unconscious." When a prone-causing effect is used, suggest "Prone"
- [ ] **T29.2.6** — Persist active conditions in the character data (auto-save). Conditions survive page refresh. Long rest automation clears certain conditions automatically (exhaustion -1 level)

## Acceptance Criteria

1. "Add Condition" button is visible at the end of the conditions strip
2. Dropdown/modal shows all 14 conditions + exhaustion with name and one-line summary
3. Selecting a condition adds it to the active list immediately
4. Already-active conditions show "Already active" note and cannot be duplicated
5. Exhaustion uses a +/- stepper, incrementing/decrementing by 1 level
6. Each exhaustion increment shows the new cumulative effect
7. Exhaustion level 6 triggers a dramatic death warning
8. Conditions can be removed via the badge remove button or by toggling in the dropdown
9. Removing exhaustion decrements by 1 level (not full removal)
10. Contextual suggestions appear: "Unconscious" when HP reaches 0
11. Active conditions persist in character data and survive page refresh
12. Long rest automation reduces exhaustion by 1 level

## Dependencies

- Story 29.1 (Active Conditions Display) for the badge strip UI
- Phase 1 SRD conditions data
- Story 27.1 (Damage & Healing Input) for HP-reaches-0 trigger
- Epic 30, Story 30.2 (Long Rest Flow) for exhaustion reduction

## Notes

- The toggle behavior (click to add, click again to remove) provides the fastest workflow at the table
- Exhaustion is the most complex condition to manage due to its 6 levels and cumulative effects
- Auto-suggestions improve the gameplay flow but should never auto-apply -- always require player confirmation
- Condition data is stored in the character object and auto-saved via the Phase 3 persistence system
