# Epic 32: Session Play Compact View

> **Phase 4: Session Play Features** | Weeks 7-8

## Goal

A mobile-optimized compact character view designed specifically for at-the-table play, showing only the most frequently referenced information with large touch targets and quick-access actions.

## Stories

| Story | Title | Tasks | Summary |
|-------|-------|-------|---------|
| 32.1 | Compact Session Mode | 5 | Single-screen mobile layout with HP bar, quick actions, attacks, spell slots, key abilities, conditions, features; all values interactive; full sheet toggle |
| 32.2 | Pinned Skills & Customization | 4 | Customize Session View settings modal, per-character pinned skills (max 8), pin star icon on full sheet, grouped display by ability score |

## Key Technical Notes

### Session View Layout (top to bottom)
1. **Top strip:** Character name, level, class. AC and Speed badges
2. **HP bar:** Large, full width. Current HP / Max HP with color gradient. Temp HP overlay. Tap to open damage/heal modal
3. **Quick Actions row:** Four large icon buttons -- Roll d20, Short Rest, Long Rest, Conditions
4. **Attacks section:** Card per weapon/cantrip showing name, attack bonus, and damage. Tap to roll attack + damage
5. **Spell Slots strip:** Compact horizontal display of all slot levels. Tap a slot to expend
6. **Key abilities:** Pinned skills and saves (customizable, default: class primary + Perception + Stealth + Athletics)
7. **Conditions strip:** Active condition badges
8. **Features with uses:** Compact limited-use feature counters

### Auto-activation
- Session view auto-activates when viewport is <=640px and in view mode
- Manual toggle via "Session Mode" button in character sheet header

### Pinned Skills Defaults
- Class-primary skills + Perception + Stealth + Athletics + Investigation
- Limit: 8 pinned items per character

## Dependencies

- **Phase 4 Epics:** Dice Roller (Epic 26), HP Tracker (Epic 27), Spell Slot Tracker (Epic 28), Conditions Tracker (Epic 29), Rest Automation (Epic 30), Feature Usage Tracking (Story 30.3)
- **Phase 3:** Character sheet components (skills, saves, attacks)

## Components Created

- `components/session/SessionView.tsx`
- Session view customization modal

## Testing Summary

| Story | Unit | Functional | E2E | Total |
|-------|------|-----------|-----|-------|
| 32.1 — Compact Session Mode | 3 | 13 | 5 | 21 |
| 32.2 — Pinned Skills & Customization | 4 | 9 | 4 | 17 |
| **Totals** | **7** | **22** | **9** | **38** |

### Key Gaps Found
- Accessibility gaps: missing ARIA labels for quick action buttons, interactive elements, pin star icon; no keyboard alternative for long-press tooltip; grouped display needs ARIA group roles; checkboxes in modal need labels
- Edge cases: fitting all 8 sections on single screen for characters with many attacks/features; non-caster characters with empty spell slot section; class change affecting default pinned skills; 640px auto-activation may not cover all tablets
- Performance: session view initialization render time; layout jank with all 8 sections rendering simultaneously; interaction with dice roller FAB positioning
- Loading/empty states: initial render during data load; empty sections for characters without attacks, spell slots, or conditions
