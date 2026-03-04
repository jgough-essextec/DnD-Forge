# Story 37.2 — Milestone Level-Up

> **Epic 37: XP & Milestone Management** | **Phase 5: DM Features** (Weeks 9-10)

## Description

As a DM using milestone progression, I need to directly level up one or all characters without tracking XP.

## Technical Context

- **App**: D&D Character Forge — local-first React PWA for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, Zustand (state), Dexie.js (IndexedDB), React Router
- **Architecture**: No backend, pure client-side, offline-capable PWA, IndexedDB for persistence. DM role is local (no authentication), campaigns are local data with join codes as local import mechanism.
- **Prior Phases Available**: Phase 1-4 (full character creation, sheet display, session play features including dice roller, HP tracker, spell slots, conditions, rest, level up)

This story implements milestone-based leveling, where the DM directly advances characters without XP tracking. This is a common alternative to XP-based progression in D&D 5e.

**Campaign HouseRules** include a progression mode field that can be added:
```typescript
interface HouseRules {
  // ... existing fields ...
  // Progression mode is implied by whether XP tracking or milestone is selected
}
```

**Campaign progression mode** is a setting on the campaign (in house rules) that toggles between:
- **"XP Tracking"** — standard XP-based progression (default). Characters earn XP and level up when they cross thresholds.
- **"Milestone"** — DM-driven progression. XP fields show "Milestone" instead of a number. The "Award XP" button is replaced by "Milestone Level Up."

**Level up options:**
1. **"Level Up All"** — every character gains 1 level. Confirmation: "Level up all [N] characters to their next level?"
2. **"Level Up Selected"** — checkboxes next to each character name. DM selects which characters level up.

**Batch level-up:** After all characters have leveled, show a summary: "[Name]: Level 4 -> 5 (HP +8, new feat: Extra Attack)" for each character. The actual level-up uses the Phase 4 level-up flow (Epic 31) for each character sequentially or in a batch summary view.

## Tasks

- [ ] **T37.2.1** — "Milestone Level Up" button on the campaign dashboard. Two options: "Level Up All" and "Level Up Selected"
- [ ] **T37.2.2** — "Level Up All": every character in the campaign gains 1 level. Show a confirmation: "Level up all [N] characters to their next level?" After confirmation, trigger the level-up flow for each character sequentially (or in a batch summary view)
- [ ] **T37.2.3** — "Level Up Selected": checkboxes next to each character name. DM selects which characters level up and clicks "Apply." Useful when a new character joins at a higher level or one character earns an extra level
- [ ] **T37.2.4** — Batch level-up summary: after all characters have leveled, show a summary: "[Name]: Level 4 -> 5 (HP +8, new feat: Extra Attack)" for each character
- [ ] **T37.2.5** — Campaign progression mode: a setting on the campaign (in house rules) that toggles between "XP Tracking" and "Milestone." When set to Milestone, the XP fields on character sheets show "Milestone" instead of a number, and the "Award XP" button is replaced by "Milestone Level Up"

## Acceptance Criteria

- "Milestone Level Up" button is available on the campaign dashboard
- "Level Up All" levels every character with confirmation dialog
- "Level Up Selected" allows choosing specific characters via checkboxes
- Batch level-up triggers Phase 4 level-up flow for each selected character
- Batch summary shows results: "[Name]: Level X -> Y (HP changes, new features)"
- Campaign progression mode toggle exists in house rules (XP Tracking vs Milestone)
- In Milestone mode, XP fields show "Milestone" text instead of numbers
- In Milestone mode, "Award XP" button becomes "Milestone Level Up"
- Characters at level 20 cannot be leveled further
- Level-up changes persist to IndexedDB

## Dependencies

- Epic 33 Story 33.1 — Campaign data model and store
- Epic 33 Story 33.4 — House rules editing (progression mode toggle)
- Epic 34 Story 34.1 — Campaign dashboard header (button placement)
- Phase 4 Epic 31 — Level-up flow (core leveling logic)

## Notes

- Milestone is the most popular progression system among modern D&D DMs. It removes the bookkeeping of XP tracking and gives the DM direct control over pacing.
- The progression mode toggle should be easily accessible — some DMs switch mid-campaign (e.g., start with XP then switch to milestone after a few sessions).
- The batch summary view is a quality-of-life feature. Instead of walking through the full level-up flow for each character, show a summary of what changed and let the DM review.
- "Level Up Selected" is important for situations like: a new player joining mid-campaign at the party's level, or a character earning a bonus level through a story event.
