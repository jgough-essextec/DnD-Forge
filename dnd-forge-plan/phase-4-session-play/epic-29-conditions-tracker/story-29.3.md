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

## Testing Requirements

### Unit Tests (Vitest)
_For pure functions, calculations, data transforms, utilities, type guards, validators_

- `should return disadvantageOn: ['attack_rolls', 'ability_checks'] for Poisoned condition`
- `should return disadvantageOn: ['attack_rolls'] and autoFailOn: ['sight_checks'] for Blinded condition`
- `should return speedOverride: 0 for Grappled and Restrained conditions`
- `should return hpMaxModifier: 0.5 for Exhaustion Level 4`
- `should return banners with severity for Paralyzed, Stunned, and Unconscious conditions`
- `should combine modifiers from multiple simultaneous conditions correctly`
- `should return cumulative exhaustion effects (Level 3 = Level 1 + Level 2 + Level 3 effects)`
- `should return advantageOn: ['attack_rolls'] for Invisible condition`
- `should return speedOverride for Exhaustion Level 2 (halved) and Level 5 (0)`

### Functional Tests (React Testing Library)
_For component rendering, user interactions, state changes, prop variations_

- `should display disadvantage icon next to attack rolls when Poisoned is active`
- `should show "(Disadvantage -- Poisoned)" tooltip on ability check modifiers`
- `should display "(Auto-fail sight-based checks)" on Perception when Blinded is active`
- `should show speed as "0 ft" with "(Restrained)" annotation when Restrained`
- `should render full-width banner "PARALYZED -- Cannot move, speak, or take actions" when Paralyzed`
- `should display "Advantage -- Invisible" green badge on attack rolls when Invisible`
- `should show speed as halved at Exhaustion Level 2 (e.g., "15 ft (halved)" instead of "30 ft")`
- `should show HP max as halved at Exhaustion Level 4`
- `should render death banner at Exhaustion Level 6`
- `should display effects from multiple simultaneous conditions correctly`

### E2E Tests (Playwright)
_For critical user journeys, multi-step flows, full-page interactions_

- `should add Poisoned condition and verify disadvantage icons appear on all attack rolls and ability checks on the character sheet`
- `should add Paralyzed condition and verify full-width banner, auto-fail on STR/DEX saves`
- `should add Exhaustion to Level 3 and verify cumulative effects: disadvantage on checks, speed halved, disadvantage on attacks/saves`
- `should add Blinded + Poisoned simultaneously and verify all combined effects display correctly`

### Test Dependencies
- Mock character data with skills, saves, attacks, combat stats, speed, HP
- Mock active conditions state (single conditions, multiple simultaneous, exhaustion levels)
- Phase 3 character sheet display component stubs for verifying visual indicators
- `getConditionModifiers()` function fixture data for all 14 conditions + all 6 exhaustion levels

## Identified Gaps

- **Error Handling**: No specification for what `getConditionModifiers()` returns when passed an empty or null conditions array
- **Edge Cases**: Interaction between Grappled (speed 0) and Exhaustion Level 2 (speed halved) -- which takes precedence; Prone disadvantage on attacks from attackers depends on distance (within 5ft = advantage, ranged = disadvantage) which may not be trackable
- **Accessibility**: Disadvantage/advantage icons need alt text; banners should be ARIA live regions for screen reader announcement; color alone should not be the only indicator of condition effects
- **Performance**: Recalculation of condition modifiers on every condition add/remove -- should be memoized; no specification for render time when many conditions are active simultaneously

## Dependencies

- Story 29.1 (Active Conditions Display) for condition badge data
- Story 29.2 (Add/Remove Conditions) for active condition state
- Phase 3 character sheet display components (skills, saves, attacks, combat stats, HP display)

## Notes

- The utility function `getConditionModifiers()` is the key architectural piece -- it decouples condition logic from display logic
- Multiple conditions can be active simultaneously and their effects stack (e.g., blinded + poisoned = disadvantage on attacks from both sources, though mechanically still just disadvantage)
- The full-width banners for severe conditions (paralyzed, stunned, unconscious) should be prominent enough to be impossible to miss
- Speed overrides from conditions (grappled, restrained, exhaustion) should clearly show the original value and the override reason
