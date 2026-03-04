# Story 29.3 — Condition Effects on Sheet Display

> **Epic 29: Conditions Tracker** | **Phase 4: Session Play Features** (Weeks 7-8)

## Description

As a player, I need to see how active conditions modify my rolls and stats directly on the character sheet. Active conditions don't just appear as badges -- they visibly flag affected rolls with disadvantage/advantage icons, override speed values, and show prominent banners for severe incapacitating conditions. A utility function computes all active modifiers from conditions for the display layer to consume.

## Technical Context

- **App**: D&D Character Forge — local-first React PWA for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, Zustand (state), Dexie.js (IndexedDB), React Router
- **Architecture**: No backend, pure client-side, offline-capable PWA, IndexedDB for persistence
- **Prior Phases Available**: Phase 1 (types, SRD data, calculation engine, database, state stores, dice engine), Phase 2 (character creation wizard), Phase 3 (character sheet 3-page display, gallery, import/export, view/edit mode with auto-save)

### Complete Condition Mechanical Effects on the Character Sheet

**Blinded:**
- Attack rolls: show disadvantage icon with "(Disadvantage -- Blinded)"
- Relevant skill modifiers: show "(Auto-fail sight-based checks)" on Perception (sight-based), Investigation (sight-based)
- Note: Attacks against this character have advantage (informational, not a roll modifier for the player)

**Charmed:**
- No direct mechanical display on the player's sheet (effects are social/behavioral)
- Informational badge only

**Deafened:**
- Relevant skill modifiers: "(Auto-fail hearing-based checks)" on Perception (hearing-based)

**Frightened:**
- Ability checks: all flagged with disadvantage icon "(Disadvantage -- Frightened)"
- Attack rolls: all flagged with disadvantage icon "(Disadvantage -- Frightened)"

**Grappled:**
- Speed: display as "0 ft" (overridden) with "(Grappled)" annotation

**Incapacitated:**
- Banner: "Cannot take actions or reactions"

**Invisible:**
- Attack rolls: show advantage icon with "(Advantage -- Invisible)"
- Note: "Attacks against you have disadvantage"

**Paralyzed:**
- Full-width banner: "PARALYZED -- Cannot move, speak, or take actions. Auto-fail STR/DEX saves."
- STR saves: "(Auto-fail -- Paralyzed)"
- DEX saves: "(Auto-fail -- Paralyzed)"
- Note: "Attacks against you have advantage. Melee hits are critical hits."

**Petrified:**
- Full-width banner: "PETRIFIED -- Transformed to stone. Cannot move, speak, or perceive."
- STR saves: "(Auto-fail -- Petrified)"
- DEX saves: "(Auto-fail -- Petrified)"
- Note: "Resistance to all damage. Immune to poison and disease."

**Poisoned:**
- Attack rolls: show disadvantage icon with "(Disadvantage -- Poisoned)"
- All ability check modifiers: show "(Disadvantage -- Poisoned)"

**Prone:**
- Attack rolls: show disadvantage icon with "(Disadvantage -- Prone)"
- Combat stats note: "Attackers within 5ft have advantage; ranged attackers have disadvantage"

**Restrained:**
- Speed: display as "0 ft" (overridden) with "(Restrained)" annotation
- DEX saves: show disadvantage icon with "(Disadvantage -- Restrained)"
- Attack rolls: show disadvantage icon with "(Disadvantage -- Restrained)"
- Note: "Attacks against you have advantage"

**Stunned:**
- Full-width banner: "STUNNED -- Cannot move or take actions. Auto-fail STR/DEX saves."
- STR saves: "(Auto-fail -- Stunned)"
- DEX saves: "(Auto-fail -- Stunned)"

**Unconscious:**
- Full-width banner: "UNCONSCIOUS -- Cannot move, speak, or perceive. Auto-fail STR/DEX saves."
- STR saves: "(Auto-fail -- Unconscious)"
- DEX saves: "(Auto-fail -- Unconscious)"
- Note: "Attacks against you have advantage. Melee hits are critical hits."

**Exhaustion (Cumulative by Level):**
- Level 1: All ability checks flagged with disadvantage
- Level 2: Speed displayed as halved (e.g., "15 ft (halved)" instead of "30 ft")
- Level 3: Attack rolls and saving throws flagged with disadvantage
- Level 4: HP max displayed as halved (e.g., "Max HP: 20 (halved from 40)")
- Level 5: Speed displayed as "0 ft"
- Level 6: Full-width death banner

### Utility Function
`getConditionModifiers(conditions: Condition[])` returns a structured object describing all active modifiers:
- `disadvantageOn`: array of roll types (attacks, ability_checks, dex_saves, etc.)
- `advantageOn`: array of roll types
- `autoFailOn`: array of save types
- `speedOverride`: number or null
- `hpMaxModifier`: multiplier (e.g., 0.5 for exhaustion level 4)
- `banners`: array of banner messages with severity

## Tasks

- [ ] **T29.3.1** — When **Poisoned** is active: show a subtle poison icon next to all attack roll values and ability check modifiers. Tooltip on these values adds: "(Disadvantage from Poisoned)"
- [ ] **T29.3.2** — When **Blinded** is active: flag attack rolls with disadvantage icon. Show "(Auto-fail sight-based checks)" on relevant skill modifiers
- [ ] **T29.3.3** — When **Prone** is active: flag attack rolls with disadvantage. Show a note on the combat stats: "Attackers within 5ft have advantage"
- [ ] **T29.3.4** — When **Restrained** is active: speed shows as "0 ft" (overridden). DEX saves flagged with disadvantage. Attack rolls flagged with disadvantage
- [ ] **T29.3.5** — When **Frightened** is active: ability checks and attack rolls flagged with disadvantage
- [ ] **T29.3.6** — When **Paralyzed/Stunned/Unconscious** is active: show a prominent full-width banner on the character sheet: "PARALYZED -- Cannot move, speak, or take actions. Auto-fail STR/DEX saves." with the condition's color
- [ ] **T29.3.7** — When **Exhaustion** is active: Level 1: flag ability checks with disadvantage. Level 2: show speed as halved. Level 3: flag attack rolls and saves with disadvantage. Level 4: show HP max as halved. Level 5: show speed as 0. Display all cumulative effects
- [ ] **T29.3.8** — When **Invisible** is active: show a green badge on attack rolls ("Advantage -- Invisible") and note that attacks against the character have disadvantage
- [ ] **T29.3.9** — Implement a `getConditionModifiers(conditions: Condition[])` utility function that returns all active modifiers from conditions. The character sheet display layer reads these modifiers and applies appropriate visual indicators

## Acceptance Criteria

1. Poisoned: disadvantage icons on attack rolls and ability checks with tooltip
2. Blinded: disadvantage icon on attacks; auto-fail on sight-based checks
3. Prone: disadvantage on attacks; combat stats note about melee advantage
4. Restrained: speed overridden to 0; disadvantage on DEX saves and attacks
5. Frightened: disadvantage on ability checks and attacks
6. Paralyzed/Stunned/Unconscious: prominent full-width banner with condition-specific text and color
7. Exhaustion: all 5 active levels display correct cumulative effects on the sheet
8. Invisible: advantage badge on attacks; note about attacker disadvantage
9. `getConditionModifiers()` utility function returns structured modifier data for all active conditions
10. Multiple simultaneous conditions show all their effects correctly (effects compound)

## Dependencies

- Story 29.1 (Active Conditions Display) for condition badge data
- Story 29.2 (Add/Remove Conditions) for active condition state
- Phase 3 character sheet display components (skills, saves, attacks, combat stats, HP display)

## Notes

- The utility function `getConditionModifiers()` is the key architectural piece -- it decouples condition logic from display logic
- Multiple conditions can be active simultaneously and their effects stack (e.g., blinded + poisoned = disadvantage on attacks from both sources, though mechanically still just disadvantage)
- The full-width banners for severe conditions (paralyzed, stunned, unconscious) should be prominent enough to be impossible to miss
- Speed overrides from conditions (grappled, restrained, exhaustion) should clearly show the original value and the override reason
