# Story 37.1 — XP Award System

> **Epic 37: XP & Milestone Management** | **Phase 5: DM Features** (Weeks 9-10)

## Description

As a DM, I need to award XP to individual characters or the whole party for encounters, roleplay, and quest completion.

## Technical Context

- **App**: D&D Character Forge — local-first React PWA for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, Zustand (state), Dexie.js (IndexedDB), React Router
- **Architecture**: No backend, pure client-side, offline-capable PWA, IndexedDB for persistence. DM role is local (no authentication), campaigns are local data with join codes as local import mechanism.
- **Prior Phases Available**: Phase 1-4 (full character creation, sheet display, session play features including dice roller, HP tracker, spell slots, conditions, rest, level up)

This story creates the XP award system — accessible from the campaign dashboard header ("Award XP" button) and from within the session log.

**Two award modes:**
1. **"Award to All"** — gives the same XP to every character in the campaign
2. **"Award Individually"** — lets the DM set a different amount per character

**XP input fields:**
- Numeric XP amount
- Optional reason/source (e.g., "Goblin encounter", "Rescued the merchant", "Brilliant roleplay") — logged in session record

**Pre-award preview** for each character shows:
- Current XP
- XP to add
- New total
- Whether the character levels up (highlight: "[Name] will advance to Level [N]!")

**XP threshold table (SRD):**
| Level | XP Required | Level | XP Required |
|-------|-------------|-------|-------------|
| 1 | 0 | 11 | 85,000 |
| 2 | 300 | 12 | 100,000 |
| 3 | 900 | 13 | 120,000 |
| 4 | 2,700 | 14 | 140,000 |
| 5 | 6,500 | 15 | 165,000 |
| 6 | 14,000 | 16 | 195,000 |
| 7 | 23,000 | 17 | 225,000 |
| 8 | 34,000 | 18 | 265,000 |
| 9 | 48,000 | 19 | 305,000 |
| 10 | 64,000 | 20 | 355,000 |

**"Apply" button:**
- Adds XP to each character's `experiencePoints` field in IndexedDB
- For characters crossing a level threshold, shows "Level Up Available!" notification on their card
- Links to Phase 4 Epic 31 level-up flow

The XP threshold table is available inline or as a tooltip reference for the DM.

## Tasks

- [ ] **T37.1.1** — Create `components/dm/XPAward.tsx` — accessible from the campaign dashboard header ("Award XP" button) and from within the session log
- [ ] **T37.1.2** — Two modes: "Award to All" and "Award Individually." "Award to All" gives the same XP to every character in the campaign. "Award Individually" lets the DM set a different amount per character
- [ ] **T37.1.3** — XP input: numeric field. Optional reason/source (e.g., "Goblin encounter", "Rescued the merchant", "Brilliant roleplay"). These notes are logged in the session record
- [ ] **T37.1.4** — Pre-award preview: for each character, show current XP, XP to add, new total, and whether the character levels up. Highlight any character crossing a level threshold: "[Name] will advance to Level [N]!"
- [ ] **T37.1.5** — "Apply" button: adds XP to each character's `experiencePoints` field, saves to IndexedDB. For characters that crossed a level threshold, show a "Level Up Available!" notification on their card with a link to trigger the level-up flow (Phase 4 Epic 31)
- [ ] **T37.1.6** — XP threshold table reference (from the SRD): display inline or as a tooltip so the DM can see how much XP is needed for each level

## Acceptance Criteria

- XP Award component is accessible from campaign dashboard and session log
- "Award to All" mode applies the same XP to every character
- "Award Individually" mode allows per-character XP amounts
- Optional reason/source field logs the XP source
- Pre-award preview shows current XP, added XP, new total, and level-up status for each character
- Level threshold crossings are highlighted prominently
- "Apply" persists XP to each character's `experiencePoints` in IndexedDB
- Characters crossing level thresholds receive "Level Up Available!" notifications
- Level-up notification links to the Phase 4 level-up flow
- XP threshold table is accessible as a reference for the DM

## Dependencies

- Epic 33 Story 33.1 — Campaign data model, character XP fields
- Epic 34 Story 34.1 — Campaign dashboard header ("Award XP" button)
- Epic 36 Story 36.2 — Session log (XP award from within session context)
- Phase 4 Epic 31 — Level-up flow (triggered when XP crosses threshold)
- Phase 1 — SRD XP threshold data

## Notes

- The XP award system is used both for encounter XP (from Story 35.6 End Encounter) and for non-combat XP (roleplay, quests, exploration). The reason field helps the DM track the source.
- The pre-award preview is critical — it prevents accidental over-awarding and lets the DM see the impact before committing.
- When a campaign uses "Milestone" progression mode (from Story 37.2), the "Award XP" button should be replaced by "Milestone Level Up" in the dashboard header.
