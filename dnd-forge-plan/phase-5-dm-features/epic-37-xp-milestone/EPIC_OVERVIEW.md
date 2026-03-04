# Epic 37: XP & Milestone Management

> **Phase 5: DM Features** | Weeks 9-10

## Goal

Tools for the DM to award experience points to individual characters or the whole party, trigger milestone level-ups, and track progression toward the next level.

## Stories

| Story | Title | Tasks | Focus |
|-------|-------|-------|-------|
| 37.1 | XP Award System | 6 | Award to all or individually, reason field, level-up preview, threshold reference |
| 37.2 | Milestone Level-Up | 5 | Level up all or selected, batch summary, campaign progression mode toggle |
| 37.3 | Level Progress Tracking | 4 | Progress bar on stats grid, XP/threshold display, milestone mode label |

## Key Concepts

- **XP Tracking Mode:** Characters earn XP from encounters, roleplay, and quests. XP is tracked numerically and level thresholds are checked automatically.
- **Milestone Mode:** DM directly levels characters without XP tracking. XP fields show "Milestone" instead of numbers.
- **Campaign Progression Mode:** A house rules toggle between "XP Tracking" and "Milestone" that affects the entire campaign's UI.
- **XP Threshold Table (SRD):** Level 1: 0, Level 2: 300, Level 3: 900, ... Level 20: 355,000

## Dependencies

- **Epic 33 Story 33.1** — Campaign data model with character XP fields
- **Epic 33 Story 33.4** — House rules (progression mode toggle)
- **Epic 34 Story 34.2** — Party stats grid (level progress column)
- **Phase 4 Epic 31** — Level-up flow (triggered by milestone and XP threshold crossing)
- **Phase 1:** SRD XP threshold data (CR-to-XP mapping for encounters)

## New Components

- `components/dm/XPAward.tsx`
- Milestone Level-Up UI (within XPAward or standalone)
- Level Progress column in PartyStatsGrid
