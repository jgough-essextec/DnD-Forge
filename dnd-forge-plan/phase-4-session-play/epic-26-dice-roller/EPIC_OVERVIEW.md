# Epic 26: Dice Roller

> **Phase 4: Session Play Features** | Weeks 7-8

## Goal

A standalone, always-accessible dice roller with animated 3D dice, support for complex roll expressions, advantage/disadvantage, roll history, and deep integration with the character sheet so that clicking any rollable value on the sheet triggers the correct roll.

## Stories

| Story | Title | Tasks | Summary |
|-------|-------|-------|---------|
| 26.1 | Dice Roller Panel | 7 | Persistent toggleable panel with dice tray, quick-roll buttons, modifier input, custom expression, and roll history zones |
| 26.2 | Dice Animation | 8 | CSS 3D transform animations per die type, tumble/settle sequence, critical highlights, sound effects, reduced motion support |
| 26.3 | Advantage & Disadvantage Rolling | 4 | ADV/DIS toggle buttons, visual keep-highest/keep-lowest display, auto-reset and lock options |
| 26.4 | Roll History Log | 5 | Scrollable history list, session-scoped persistence (50 rolls), color-coded entries, re-roll on click |
| 26.5 | Character Sheet Roll Integration | 7 | Rollable icons on all skills/saves/attacks, auto-roll with correct modifier, attack-to-damage chaining, critical hit automation, death save rolling |

## Key Technical Notes

- The dice engine from Phase 1 handles the math; this epic builds the UI layer
- Complex roll expressions supported: `1d20 + 5`, `2d20kh1 + 5` (advantage), `4d6kh3`, `8d6`, `1d12 + 1d6 + 5`
- CSS 3D transforms recommended over Three.js for Phase 4 (lighter bundle, faster to build)
- Each die type has distinct shape and color: d4 (green pyramid), d6 (white cube), d8 (blue octahedron), d10 (purple), d12 (red), d20 (gold)
- Roll history stored in Zustand dice store, session-scoped (cleared on page reload)

## Dependencies

- **Phase 1:** Dice engine (roll parsing and evaluation)
- **Phase 3:** Character sheet (for Story 26.5 integration with skills, saves, attacks, initiative, death saves)

## Components Created

- `components/dice/DiceRollerPanel.tsx`
- `components/dice/DiceAnimation.tsx`
- `components/dice/RollHistory.tsx`
- Dice store additions (Zustand)

## Testing Summary

| Story | Unit | Functional | E2E | Total |
|-------|------|-----------|-----|-------|
| 26.1 — Dice Roller Panel | 4 | 10 | 4 | 18 |
| 26.2 — Dice Animation | 4 | 9 | 4 | 17 |
| 26.3 — Advantage & Disadvantage Rolling | 5 | 9 | 3 | 17 |
| 26.4 — Roll History Log | 5 | 9 | 4 | 18 |
| 26.5 — Character Sheet Roll Integration | 6 | 10 | 5 | 21 |
| **Totals** | **24** | **47** | **20** | **91** |

### Key Gaps Found
- Accessibility gaps across all stories: missing ARIA labels for die buttons, roll results, history entries, ADV/DIS toggles; no keyboard navigation within the dice panel; no screen reader announcements for roll outcomes
- Mobile/responsive gaps: exact breakpoint for panel desktop/mobile behavior unclear; swipe gestures in history may conflict with scroll; touch targets for ADV/DIS not specified
- Edge cases: behavior during active animation when new roll is triggered; very large roll expressions (100d100); clipboard permission failures for long-press copy
- Performance: no render time targets for panel open animation, dice animation frame rate, or roll execution
