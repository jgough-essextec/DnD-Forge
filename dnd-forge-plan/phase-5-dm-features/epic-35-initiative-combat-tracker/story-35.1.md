# Story 35.1 — Encounter Setup

> **Epic 35: Initiative & Combat Tracker** | **Phase 5: DM Features** (Weeks 9-10)

## Description

As a DM, I need to create an encounter by adding all combatants — party members auto-populate and I can add monsters/NPCs manually.

## Technical Context

- **App**: D&D Character Forge — local-first React PWA for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, Zustand (state), Dexie.js (IndexedDB), React Router
- **Architecture**: No backend, pure client-side, offline-capable PWA, IndexedDB for persistence. DM role is local (no authentication), campaigns are local data with join codes as local import mechanism.
- **Prior Phases Available**: Phase 1-4 (full character creation, sheet display, session play features including dice roller, HP tracker, spell slots, conditions, rest, level up)

This story creates the encounter setup screen — the first step in the combat tracker flow. It is opened via the "Start Encounter" button on the campaign dashboard.

**Encounter data model:**
```typescript
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

**Combatant data model:**
```typescript
interface Combatant {
  id: string;
  name: string;
  type: 'player' | 'npc' | 'monster';
  characterId?: string;           // Links to Character if player type
  initiativeRoll?: number;
  initiativeModifier: number;     // DEX mod or custom
  armorClass: number;
  hitPointMax: number;
  hitPointCurrent: number;
  tempHitPoints: number;
  conditions: string[];
  notes: string;
  isVisible: boolean;
  groupId?: string;               // For grouping identical monsters
}
```

**Auto-populate party:** All characters in the campaign are added as player-type combatants with stats pulled from character data (AC, HP current/max, initiative modifier from DEX mod + bonuses, conditions from active conditions).

**Add Monster/NPC:** Form with Name (required), AC, Max HP, Initiative Modifier. "Quick Add" with just name + AC + HP.

**SRD Monster Quick Search:** Search input queries SRD monsters data (from Phase 1 data layer). Selecting a monster auto-fills name, AC, HP (from hit dice average), initiative modifier, and shows a collapsible stat block preview. Includes monster CR for XP calculation.

**Duplicate monster:** "Add Another" copies last monster with incremented suffix ("Goblin 1", "Goblin 2"). Quantity field: "Add 4 Goblins" creates 4 entries with individual HP.

**Monster grouping:** Identical monsters can be grouped for simultaneous initiative rolling. Group shares one initiative but tracks HP and conditions individually.

## Tasks

- [ ] **T35.1.1** — Create `components/dm/combat/EncounterSetup.tsx` — opened via "Start Encounter" button on the campaign dashboard. Two-panel layout: left panel is the combatant list, right panel is the "Add Combatant" interface
- [ ] **T35.1.2** — **Auto-populate party:** all characters in the campaign are added as player-type combatants automatically with their stats pulled from the character data (AC, HP current/max, initiative modifier from DEX mod + bonuses, conditions from active conditions)
- [ ] **T35.1.3** — **Add Monster/NPC:** a form with fields: Name (required), AC, Max HP, Initiative Modifier (DEX mod), optional notes. "Quick Add" button adds with just name + AC + HP (initiative mod defaults to 0)
- [ ] **T35.1.4** — **SRD Monster Quick Search:** a search input that queries the SRD monsters data (from Phase 1 data layer). Selecting a monster auto-fills: name, AC, HP (from hit dice formula — show "average" and let DM adjust), initiative modifier, and a collapsible stat block preview. Include monster CR for XP calculation
- [ ] **T35.1.5** — **Duplicate monster:** "Add Another" button that copies the last added monster with an incremented name suffix: "Goblin 1", "Goblin 2", etc. Or a quantity field: "Add 4 Goblins" creates 4 combatant entries with individual HP (rolled or average per DM preference)
- [ ] **T35.1.6** — **Monster grouping:** identical monsters can be grouped for simultaneous initiative rolling. Group shares one initiative but tracks HP and conditions individually
- [ ] **T35.1.7** — Combatant list shows all added combatants with: drag handle (reorder), name, type icon (player/monster/NPC), AC, HP, initiative modifier. Remove button (X) on each
- [ ] **T35.1.8** — "Roll Initiative & Start" button: proceeds to the combat tracker

## Acceptance Criteria

- Encounter setup opens from "Start Encounter" button on campaign dashboard
- Two-panel layout: combatant list on left, add interface on right
- All campaign characters auto-populate as player combatants with correct stats
- Monster/NPC form allows adding with required name + AC + HP fields
- SRD monster search auto-fills stats from the SRD data
- "Add Another" duplicates monsters with incremented names
- Quantity field creates multiple entries with individual HP
- Monster grouping allows shared initiative with individual HP/conditions
- Combatant list is reorderable via drag handles with remove buttons
- "Roll Initiative & Start" button proceeds to the initiative rolling screen

## Dependencies

- Epic 33 Story 33.1 — Campaign and Encounter data models, Zustand store
- Epic 33 Story 33.5 — Characters must be assigned to the campaign
- Epic 34 Story 34.1 — Campaign dashboard ("Start Encounter" button)
- Phase 1 — SRD monster data (name, CR, AC, HP, initiative modifier, XP value)

## Notes

- The SRD contains approximately 300+ monsters. For Phase 5, include a lightweight monsters index (name, CR, AC, HP, initiative mod, type, XP value), not full stat blocks. Full stat blocks are a Phase 6 enhancement.
- Phase 5 supports only one active encounter per campaign at a time. Multiple simultaneous encounters are a Phase 6+ feature.
- The encounter is saved to IndexedDB as a standalone record (not embedded in the campaign) because encounters can be large and are queried independently.
