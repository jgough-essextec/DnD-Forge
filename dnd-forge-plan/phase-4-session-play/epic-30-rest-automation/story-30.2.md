# Story 30.2 — Long Rest Flow

> **Epic 30: Short Rest & Long Rest Automation** | **Phase 4: Session Play Features** (Weeks 7-8)

## Description

As a player, I need a "Long Rest" button that fully recovers my HP, restores spell slots, recovers class features, regains half my hit dice, and reduces exhaustion. The long rest flow is a summary modal showing all automatic recovery effects with a before/after comparison, condition clearing options, and guards against invalid usage.

## Technical Context

- **App**: D&D Character Forge — local-first React PWA for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, Zustand (state), Dexie.js (IndexedDB), React Router
- **Architecture**: No backend, pure client-side, offline-capable PWA, IndexedDB for persistence
- **Prior Phases Available**: Phase 1 (types, SRD data, calculation engine, database, state stores, dice engine), Phase 2 (character creation wizard), Phase 3 (character sheet 3-page display, gallery, import/export, view/edit mode with auto-save)

### D&D 5e Long Rest Rules (Complete)

**Duration:** A long rest is a period of extended downtime, at least 8 hours long, during which a character sleeps or performs light activity: reading, talking, eating, or standing watch for no more than 2 hours.

**Frequency:** A character can't benefit from more than one long rest in a 24-hour period, and a character must have at least 1 hit point at the start of the rest to gain its benefits.

**Automatic Recovery (no choices needed):**

1. **Hit Points:** Current HP is restored to maximum HP (full recovery)
2. **Spell Slots:** All expended spell slots of all levels are restored to full
   - Standard caster slots: all restored
   - Warlock Pact Magic slots: all restored (they also recover on short rest)
3. **Class Features (Long Rest):** All long-rest-recovery features are restored:
   - Rage (Barbarian): restored to max uses (2 at Lv1, 3 at Lv3, 4 at Lv6, 5 at Lv12, 6 at Lv17, unlimited at Lv20)
   - Bardic Inspiration (Bard, Lv<5): restored to CHA mod (min 1)
   - Lay on Hands (Paladin): restored to full pool (5 x Paladin level)
   - Sorcery Points (Sorcerer): restored to Sorcerer level
   - Arcane Recovery daily use (Wizard): reset to available
4. **Class Features (Short Rest):** All short-rest features are also restored (since a long rest includes the benefit of a short rest):
   - Second Wind, Action Surge, Channel Divinity, Wild Shape, Ki Points, Warlock Slots
   - Bardic Inspiration (Bard, Lv5+)
5. **Death Saves:** Reset to 0 successes / 0 failures
6. **Temporary HP:** Persist (temp HP are NOT removed by resting)

**Hit Dice Recovery:**
- A character regains spent hit dice at the end of a long rest, up to a number equal to **half the character's total number of hit dice (minimum 1)**
- Round down for the maximum recovery
- Example: A level 8 character who spent 5 hit dice regains up to 4 (half of 8). They now have 7/8 hit dice
- If fewer than half were spent, they recover all spent dice
- Example: A level 8 character who spent 2 hit dice regains 2 (since 2 < 4). They now have 8/8

**Exhaustion Recovery:**
- If the character has any exhaustion levels and has had food and water, exhaustion is reduced by **1 level** (not full removal)
- Example: Exhaustion Level 3 -> Level 2 after a long rest

**Conditions:**
- Most combat conditions end when the effect that caused them ends, not specifically on rest
- However, it's common practice to clear transient conditions after a long rest
- The app should present a checklist letting the player confirm which conditions to clear

### What is NOT Recovered on Long Rest
- Conditions (DM discretion, checklist provided)
- Temporary HP (persist through rests)
- Used consumable items (potions, scrolls)
- Expended material spell components (worth gold)

## Tasks

- [ ] **T30.2.1** — Create `components/session/LongRestModal.tsx` — triggered from the "Long Rest" button. Opens a summary modal showing all recovery effects
- [ ] **T30.2.2** — **Automatic recovery (no choices needed):**
  - Current HP -> Max HP (full recovery)
  - All spell slots -> fully restored (display: "Spell Slots: All recovered")
  - All long-rest class features -> restored (list each: "Rage (2/2), Bardic Inspiration (3/3), Lay on Hands (10/10)")
  - Death saves -> reset to 0 successes / 0 failures
  - Temp HP -> remains (temp HP persist through rests)
- [ ] **T30.2.3** — **Hit Dice recovery:** recover spent hit dice up to half your total (minimum 1, round down). Show: "Hit Dice: Recovered 2 of 4 spent (now 6/8 total)." If fewer than half were spent, recover all spent dice
- [ ] **T30.2.4** — **Exhaustion reduction:** if the character has any exhaustion levels, reduce by 1. Show: "Exhaustion: Level 3 -> Level 2." Note: "Requires food and water during the rest"
- [ ] **T30.2.5** — **Conditions that end:** auto-remove conditions that typically end on long rest (DM discretion, but suggest clearing transient combat conditions). Show a checklist letting the player confirm which conditions to clear
- [ ] **T30.2.6** — **Summary panel:** show complete before/after comparison: HP, spell slots per level, hit dice, exhaustion level, features recovered. "Finish Long Rest" button applies all changes and saves
- [ ] **T30.2.7** — Duration note: "A long rest takes at least 8 hours, with no more than 2 hours of light activity"
- [ ] **T30.2.8** — Guard: "You can only benefit from one long rest per 24-hour period." Track last long rest timestamp. If a second long rest is attempted within 24 hours (in-game time), show a warning (not blocking, since the app doesn't track in-game time precisely)

## Acceptance Criteria

1. "Long Rest" button is accessible from the character sheet's quick-action bar
2. Current HP is restored to maximum
3. All spell slots are fully restored
4. All class features (both short-rest and long-rest recovery) are restored
5. Death saves are reset to 0/0
6. Temporary HP persist (not removed)
7. Spent hit dice recover up to half total (minimum 1, round down)
8. Hit dice recovery shows clear before/after numbers
9. Exhaustion reduces by 1 level (with food/water note)
10. Conditions checklist allows player to select which conditions to clear
11. Summary panel shows complete before/after comparison for all resources
12. "Finish Long Rest" applies all changes and saves
13. Duration note is displayed
14. 24-hour guard tracks last long rest and shows a warning for repeat attempts

## Dependencies

- Story 27.1 (HP Tracker) for HP restoration
- Story 28.1 (Spell Slot Tracker) for slot restoration
- Story 28.2 (Warlock Pact Magic) for Pact Magic slot restoration
- Story 28.3 (Arcane Recovery) for resetting daily use flag
- Story 29.2 (Conditions) for condition clearing and exhaustion reduction
- Story 30.3 (Class Feature Usage Tracking) for feature restoration data

## Notes

- The long rest flow should be simpler than the short rest flow since most recovery is automatic (no choices needed except conditions)
- The 24-hour guard is a soft warning, not a hard block, since the app doesn't track in-game time
- For the summary, consider a visual "before/after" card layout showing each resource category
- The long rest includes the benefits of a short rest -- all short-rest features also recover
