# Story 11.5 — Ability Score Summary & Recommendations

> **Epic 11: Ability Score Step** | **Phase 2: Character Creation Wizard** (Weeks 3-4)

## Description

As a player, I need to see a clear summary of my final ability scores with modifiers and understand how they affect my character. This story builds the ability score summary table with base scores, racial bonuses, totals, and modifiers, plus a "What This Means" helper panel with gameplay implications, class primary ability recommendations, and a derived combat stats preview.

## Technical Context

- **App**: D&D Character Forge — local-first React PWA for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, Zustand (state), Dexie.js (IndexedDB), React Router
- **Architecture**: No backend, pure client-side, offline-capable PWA, IndexedDB for persistence
- **Phase 1 Foundation Available**: Type system, SRD game data (races, classes, spells, equipment, backgrounds, feats as static JSON), calculation engine, Dexie.js database layer, Zustand stores, dice engine
- **Summary Table Columns**: Ability Name | Base Score | Racial Bonus | Total | Modifier
- **Modifier Calculation**: modifier = Math.floor((total - 10) / 2). Display format: "+3" for positive, "+0" for zero, "-1" for negative
- **Gameplay Implications**: For notably high (15+) or low (8-9) scores, show brief impact descriptions:
  - High STR: "Strong — great for Athletics and melee attacks"
  - Low STR: "Weak — struggle with Athletics and carrying heavy gear"
  - High DEX: "Agile — good AC, initiative, and ranged attacks"
  - High INT: "Brilliant — excellent for Arcana, Investigation, and Wizard spellcasting"
  - (etc.)
- **Class Primary Ability Warning**: If the selected class has a primary ability and the player's score in that ability is below 13, show a warning: "As a Wizard, Intelligence is your most important ability."
- **Derived Combat Stats Preview**: Estimated AC (based on likely armor from class), estimated HP (hit die max + CON mod), initiative modifier (DEX mod). Uses the Phase 1 calculation engine
- **Shared Components**: Uses AbilityScoreDisplay from Epic 16 Story 16.3, ModifierBadge from Epic 16 Story 16.3

## Tasks

- [ ] **T11.5.1** — Create `components/wizard/ability/AbilityScoreSummary.tsx` — rendered below the method-specific interface. Shows a 6-column table: Ability Name | Base Score | Racial Bonus | Total | Modifier. The modifier is highlighted in a large, prominent font (e.g., "+3" in accent-gold)
- [ ] **T11.5.2** — Show a "What This Means" helper panel: for each ability with a notably high (15+) or low (8-9) score, display a brief gameplay implication (e.g., "With 15 DEX (+2): You'll be agile in combat with good AC and initiative" or "With 8 STR (-1): You'll struggle with Athletics and carrying heavy gear")
- [ ] **T11.5.3** — If the selected class has a primary ability, highlight it with a recommendation: "As a Wizard, Intelligence is your most important ability." Show a warning if the primary ability score is below 13
- [ ] **T11.5.4** — Display derived combat stats preview: estimated AC (based on likely armor from class), estimated HP (hit die max + CON mod), initiative modifier — giving the player a peek at how their scores translate to gameplay

## Acceptance Criteria

- Summary table shows all 6 abilities with Base Score, Racial Bonus, Total, and Modifier columns
- Modifier is highlighted prominently in accent-gold with large font
- "What This Means" panel shows gameplay implications for notably high (15+) or low (8-9) scores
- Class primary ability is highlighted with a recommendation message
- A warning appears if the primary ability score is below 13
- Derived combat stats preview shows estimated AC, HP, and initiative modifier
- The summary updates dynamically as ability scores change (e.g., during drag-and-drop assignment)

## Dependencies

- **Depends on:** Stories 11.2-11.4 (ability scores must be assigned by one of the methods), Epic 9 Story 9.5 (racial bonuses), Epic 10 (class for primary ability and hit die), Phase 1 calculation engine, Epic 16 Story 16.3 (AbilityScoreDisplay, ModifierBadge)
- **Blocks:** Story 11.6 (validation depends on summary being accurate)

## Notes

- The summary should be live-updating — as the player drags values in Standard Array or adjusts Point Buy, the summary table, helper panel, and derived stats all update in real-time
- Derived combat stats are estimates at this point since armor hasn't been selected yet. Use the class's most common armor:
  - Heavy armor classes (Fighter, Paladin): chain mail (AC 16)
  - Medium armor classes (Barbarian, Ranger, Druid, Cleric): scale mail (AC 14 + DEX mod, max 2)
  - Light armor classes (Rogue, Bard, Warlock): leather (AC 11 + DEX mod)
  - No armor (Monk, Barbarian unarmored): 10 + DEX mod + CON/WIS mod
  - Mage (Wizard, Sorcerer): mage armor assumed (AC 13 + DEX mod)
- HP at level 1 = hit die maximum + CON modifier (e.g., Fighter d10: HP = 10 + CON mod)
- The primary ability warning (below 13) is a soft recommendation, not a validation error — some players intentionally play against type
