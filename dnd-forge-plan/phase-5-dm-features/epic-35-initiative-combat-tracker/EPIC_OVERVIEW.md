# Epic 35: Initiative & Combat Tracker

> **Phase 5: DM Features** | Weeks 9-10

## Goal

A full-featured combat management tool where the DM can roll initiative for all combatants, add monsters/NPCs on the fly, sort by initiative order, cycle through turns tracking rounds, manage HP and conditions per combatant, and distribute XP when the encounter ends.

## Stories

| Story | Title | Tasks | Focus |
|-------|-------|-------|-------|
| 35.1 | Encounter Setup | 8 | Auto-populate party, add monsters/NPCs, SRD search, duplicates, grouping |
| 35.2 | Initiative Rolling & Sort | 6 | Roll all/individual, manual input, auto-roll monsters, tie-breaking, sort preview |
| 35.3 | Combat Tracker Main View | 9 | Initiative order, turn cycling, round tracker, skip/delay/ready, remove combatants |
| 35.4 | Combatant HP & Condition Management | 7 | Inline HP editing, quick damage, death handling, conditions, temp HP, concentration |
| 35.5 | Add Combatants Mid-Combat | 4 | Add during combat, auto-insert in initiative, lair actions |
| 35.6 | End Encounter & XP Distribution | 6 | Summary modal, XP calc from CR, XP split, milestone option, encounter log |

## Combat Tracker Flow

1. **Setup** (Story 35.1) — Party auto-populates, DM adds monsters/NPCs
2. **Initiative Rolling** (Story 35.2) — Roll all or individually, sort by result
3. **Active Combat** (Stories 35.3-35.5) — Turn cycling, HP/condition management, mid-combat additions
4. **End Encounter** (Story 35.6) — XP distribution, encounter logging

## Key Data Models

```typescript
interface Combatant {
  id: string;
  name: string;
  type: 'player' | 'npc' | 'monster';
  characterId?: string;
  initiativeRoll?: number;
  initiativeModifier: number;
  armorClass: number;
  hitPointMax: number;
  hitPointCurrent: number;
  tempHitPoints: number;
  conditions: string[];
  notes: string;
  isVisible: boolean;
  groupId?: string;
}

interface Encounter {
  id: string;
  campaignId: string;
  sessionId?: string;
  name: string;
  combatants: Combatant[];
  currentTurnIndex: number;
  roundNumber: number;
  isActive: boolean;
  xpBudget?: number;
  notes: string;
  createdAt: Date;
}
```

## Dependencies

- **Epic 33 Story 33.1** — Campaign and Encounter data models
- **Epic 33 Story 33.5** — Character-campaign assignment (for auto-populating party)
- **Phase 4:** Dice roller (initiative rolls), HP tracker logic (damage/healing), conditions tracker, death saves
- **Phase 1:** SRD monster data (for quick-search monster addition)

## New Components

- `components/dm/combat/EncounterSetup.tsx`
- `components/dm/combat/InitiativeRoller.tsx`
- `components/dm/combat/CombatTracker.tsx`

## Testing Summary

| Story | Unit | Functional | E2E | Total |
|-------|------|-----------|-----|-------|
| 35.1 — Encounter Setup | 5 | 8 | 3 | 16 |
| 35.2 — Initiative Rolling & Sort | 5 | 8 | 3 | 16 |
| 35.3 — Combat Tracker Main View | 6 | 9 | 4 | 19 |
| 35.4 — Combatant HP & Condition Management | 5 | 10 | 4 | 19 |
| 35.5 — Add Combatants Mid-Combat | 4 | 6 | 2 | 12 |
| 35.6 — End Encounter & XP Distribution | 6 | 8 | 3 | 17 |
| **Totals** | **31** | **49** | **19** | **99** |

### Key Gaps Found
- **Accessibility** is critical for the combat tracker: no keyboard shortcuts for Next/Previous Turn, no screen reader announcements for turn changes or HP updates, no keyboard-accessible alternatives to drag-and-drop or click interactions
- **Error Handling** gaps in corrupted encounter state recovery, partial XP application failures, and accidental combatant removal (no undo)
- **Mobile/Responsive** layout behavior not defined for two-panel encounter setup, initiative roller, or combat tracker overlay
- **Performance** requirements missing for combat tracker responsiveness (most time-sensitive DM tool)
- **Edge Cases** around all combatants removed mid-combat, 0-XP encounters, massive damage instant death, and healing defeated monsters not fully addressed
- **Dependency Issues**: Shared XP application logic between Story 35.6 and Story 37.1 not defined as a shared utility
