# Phase 4: Session Play Features — Overview

> **Duration:** Weeks 7-8
> **Goal:** Transform the character sheet from a static record into a living play tool.

## Phase Summary

Phase 4 delivers the real-time play interaction layer on top of the Phase 3 character sheet. This includes an integrated dice roller with animations and roll history, an interactive HP tracker with damage/healing, spell slot tracking with expend/recover, a full conditions tracker (all 14 standard conditions plus exhaustion levels), short rest and long rest automation that recovers the correct resources per 5e rules, and a complete level-up flow that handles HP increases, new class features, ASI/feat selection, subclass choices, and spellcasting progression for all 12 classes across levels 1-20.

## Epics Table

| Epic | Name | Stories | Estimated Tasks | Key Focus |
|------|------|---------|-----------------|-----------|
| 26 | Dice Roller | 5 (26.1-26.5) | ~27 | Dice panel, animation, advantage/disadvantage, roll history, sheet integration |
| 27 | HP Tracker | 3 (27.1-27.3) | ~14 | Damage/healing input, temp HP, compact widget |
| 28 | Spell Slot Tracker | 3 (28.1-28.3) | ~13 | Expend/recover UI, Warlock Pact Magic, Wizard Arcane Recovery |
| 29 | Conditions Tracker | 3 (29.1-29.3) | ~19 | Active conditions display, add/remove, mechanical effects on sheet |
| 30 | Rest Automation | 3 (30.1-30.3) | ~21 | Short rest flow, long rest flow, class feature usage tracking |
| 31 | Level Up Flow | 7 (31.1-31.7) | ~30 | Entry/overview, HP increase, class features, subclass, ASI/feat, spell progression, review/apply |
| 32 | Session Compact View | 2 (32.1-32.2) | ~9 | Mobile-optimized session mode, pinned skills customization |
| **Total** | | **26 stories** | **~130 tasks** | **~30 new components** |

## Key Deliverables

- ~130 tasks across 26 stories in 7 epics
- ~30+ new components
- 7 dice animation states (one per die type)
- 15 conditions tracked (14 standard + exhaustion with 6 levels)
- ~25 distinct class feature recovery rules mapped
- 6 level-up decision points per level (HP, features, subclass, ASI/feat, spells, review)
- 240 unique level-up scenarios (12 classes x 20 levels)

## Pre-Phase Audit Notes

### Gap P1 -- Class Features with Limited Uses Have Varied Recovery Rules
The short rest / long rest buttons must know which resources recover on which rest type. Each class feature has its own recovery rule, and some have partial recovery. The app must track "uses remaining" per feature and reset the correct ones on each rest type.

Key recovery rules:
- **Short Rest recovery:** Channel Divinity (Cleric), Wild Shape (Druid), Second Wind (Fighter), Action Surge (Fighter), Ki Points (Monk), Warlock Spell Slots
- **Long Rest recovery:** Rage (Barbarian), Bardic Inspiration (Bard; Short Rest at Lv 5+), Lay on Hands (Paladin), Sorcery Points (Sorcerer), Arcane Recovery (Wizard)
- **Partial recovery:** Hit Dice (Long Rest: up to half total, min 1), Exhaustion (Long Rest: -1 level if fed/watered), Death Saves (Long Rest: reset to 0/0)

### Gap P2 -- Level-Up Is Not Uniform Across Classes
Every class has a unique level progression: different subclass selection levels, different ASI levels (Fighter gets 7 ASIs, Rogue gets 6, most get 5), different Extra Attack progressions.

### Gap P3 -- Spellcasting Progression Is Per-Class and Non-Linear
Known casters (Bard, Sorcerer, Warlock, Ranger) may swap one known spell on level-up. Prepared casters (Cleric, Druid, Paladin) get updated preparation limits. Wizard adds 2 spells to spellbook per level.

### Gap P4 -- Dice Roller Must Support Complex Roll Expressions
Common expressions: `1d20 + 5`, `2d20kh1 + 5` (advantage), `4d6kh3` (ability score roll), `8d6` (fireball), `1d12 + 1d6 + 5` (mixed damage).

### Gap P5 -- HP Tracker Must Correctly Apply 5e Damage Rules
Temp HP first, then current HP, no negative HP, massive damage instant death, healing caps at max, healing from 0 stabilizes, resistance halves/vulnerability doubles.

### Gap P6 -- Conditions Have Mechanical Effects on the Sheet
Active conditions should visibly modify the character sheet with disadvantage/advantage flags on affected rolls, speed modifications, and prominent banners for severe conditions.

### Gap P7 -- Cantrip Damage Scaling
Cantrip damage scales at character levels 5, 11, and 17 (not class levels). The level-up flow must update cantrip damage dice at these thresholds.

## Dependencies on Phases 1-3

- **Phase 1:** Types, SRD data (conditions, class features, spells), calculation engine, database (Dexie.js/IndexedDB), state stores (Zustand), dice engine
- **Phase 2:** Character creation wizard (reused: FeatPicker, SubclassSelector, spell browser)
- **Phase 3:** Full 3-page character sheet (view + edit modes), character gallery, auto-save/recalculation system, undo/snapshot system

Phase 4 adds the real-time play interaction layer on top of the Phase 3 sheet and the level-up progression system.

## Recommended Build Order

1. **Week 7, Day 1-2:** Epic 26 (Dice Roller) -- independent, enables all other sheet interactions
2. **Week 7, Day 3-4:** Epic 27 (HP Tracker) + Epic 28 (Spell Slot Tracker) -- parallelizable
3. **Week 7, Day 5 to Week 8, Day 1:** Epic 29 (Conditions) + Epic 30 (Rest Automation) -- rest depends on feature tracking
4. **Week 8, Day 2-4:** Epic 31 (Level Up) -- the most complex epic, needs focused time
5. **Week 8, Day 5:** Epic 32 (Session Compact View) -- integrates everything

## Dependency Graph

```
Epic 26 (Dice Roller) <-- independent, can be built first
  |
  +-- Story 26.5 (Sheet Integration) <-- depends on Phase 3 character sheet
  |
Epic 27 (HP Tracker) <-- depends on dice roller for healing rolls
  |
Epic 28 (Spell Slot Tracker) <-- independent of dice, depends on Phase 3 spell page
  |
Epic 29 (Conditions Tracker) <-- depends on Phase 1 conditions data
  |    +-- Story 29.3 (Sheet Effects) <-- depends on sheet display components
  |
Epic 30 (Short/Long Rest) <-- depends on HP tracker, spell slots, feature tracking
  |    +-- Story 30.1 (Short Rest) <-- uses dice roller for hit dice
  |    +-- Story 30.2 (Long Rest) <-- resets HP, slots, features, exhaustion
  |    +-- Story 30.3 (Feature Tracking) <-- foundation for rest recovery
  |
Epic 31 (Level Up) <-- complex, depends on most other systems
  |    +-- Story 31.2 (HP) <-- uses dice roller
  |    +-- Story 31.5 (ASI/Feat) <-- uses feat picker from Phase 2
  |    +-- Story 31.6 (Spells) <-- uses spell browser from Phase 2
  |    +-- Story 31.7 (Review) <-- uses calculation engine
  |
Epic 32 (Session Compact View) <-- depends on all above being functional
       +-- integrates: dice, HP tracker, spell slots, conditions, features
```

## Open Questions

1. **Three.js vs CSS Dice:** Recommend CSS 3D transforms for Phase 4, Three.js upgrade as Phase 6 polish.
2. **Multiclass Level Up:** Stub with "Multiclass support coming soon" and manual override.
3. **Level-Up Undo:** Take explicit named snapshot before level-up.
4. **Spell Slot Tracking Between Sessions:** No auto-prompt; persistent slots with prominent Long Rest button.
5. **Condition Duration Tracking:** No real-time timer in Phase 4; manual removal by DM/player.
