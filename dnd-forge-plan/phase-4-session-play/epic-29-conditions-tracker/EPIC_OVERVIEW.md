# Epic 29: Conditions Tracker

> **Phase 4: Session Play Features** | Weeks 7-8

## Goal

A visual conditions management system showing all 14 standard 5e conditions plus exhaustion levels, with mechanical effect descriptions and visual indicators on the character sheet.

## Stories

| Story | Title | Tasks | Summary |
|-------|-------|-------|---------|
| 29.1 | Active Conditions Display | 4 | Horizontal badge strip on Page 1, color-coded badges with icons, click for tooltip with full mechanical effects, exhaustion level display (1-6) |
| 29.2 | Add / Remove Conditions | 6 | Add Condition dropdown/modal, toggle behavior, exhaustion increment/decrement stepper, contextual auto-suggestions (e.g., unconscious at 0 HP), persistence with auto-save |
| 29.3 | Condition Effects on Sheet Display | 9 | Disadvantage/advantage flags on affected rolls for all conditions, speed overrides, prominent banners for severe conditions, `getConditionModifiers()` utility function |

## Key Technical Notes

### All 14 Standard 5e Conditions + Exhaustion
- **Debilitating (red):** Blinded, Paralyzed, Stunned, Unconscious, Petrified
- **Moderate (orange):** Frightened, Poisoned, Restrained, Exhaustion
- **Mild (yellow):** Charmed, Deafened, Grappled, Prone
- **Beneficial (green):** Invisible

### Exhaustion Levels (cumulative)
1. Disadvantage on ability checks
2. Speed halved
3. Disadvantage on attack rolls and saving throws
4. Hit point maximum halved
5. Speed reduced to 0
6. Death

### Mechanical Effects on Sheet
- **Blinded:** Disadvantage on attack rolls, auto-fail sight-based checks
- **Frightened:** Disadvantage on ability checks and attack rolls
- **Poisoned:** Disadvantage on attack rolls and ability checks
- **Prone:** Disadvantage on attack rolls; attackers within 5ft have advantage
- **Restrained:** Speed 0, disadvantage on DEX saves and attack rolls
- **Paralyzed/Stunned/Unconscious:** Full-width banner, auto-fail STR/DEX saves
- **Invisible:** Advantage on attack rolls, attacks against have disadvantage

## Dependencies

- **Phase 1:** SRD conditions data
- **Phase 3:** Character sheet Page 1 layout, combat stats row

## Components Created

- `components/character/ConditionsTracker.tsx`
- `utils/conditionModifiers.ts` (getConditionModifiers utility)

## Testing Summary

| Story | Unit | Functional | E2E | Total |
|-------|------|-----------|-----|-------|
| 29.1 — Active Conditions Display | 3 | 10 | 3 | 16 |
| 29.2 — Add / Remove Conditions | 6 | 10 | 4 | 20 |
| 29.3 — Condition Effects on Sheet Display | 9 | 10 | 4 | 23 |
| **Totals** | **18** | **30** | **11** | **59** |

### Key Gaps Found
- Accessibility gaps: missing ARIA labels for condition badges, Add Condition dropdown, exhaustion stepper; badges need keyboard navigation; popover and banners should be keyboard-dismissible and screen-reader accessible; color alone used for severity (needs additional indicators)
- Edge cases: Incapacitated condition (condition #6) present in data but categorization uncertain; Prone condition attacker distance dependency (melee vs ranged) cannot be tracked; interaction between Grappled (speed 0) and Exhaustion Level 2 (speed halved) precedence
- Performance: `getConditionModifiers()` recalculation should be memoized; no render time target for many simultaneous conditions
- Error handling: missing/corrupted SRD data scenarios; no undo for accidental condition removal
