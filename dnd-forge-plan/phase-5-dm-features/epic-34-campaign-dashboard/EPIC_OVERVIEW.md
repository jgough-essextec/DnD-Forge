# Epic 34: Campaign Dashboard & Party Overview

> **Phase 5: DM Features** | Weeks 9-10

## Goal

A DM's command center for a campaign showing the party at a glance — stats grid, skill proficiency matrix, language coverage, party composition analysis, and quick access to each character's sheet, all viewable from a single screen.

## Stories

| Story | Title | Tasks | Focus |
|-------|-------|-------|-------|
| 34.1 | Campaign Dashboard Layout | 5 | Dashboard page, header, tab navigation, mobile layout, empty state |
| 34.2 | Party Stats Grid | 7 | Sortable data table with HP bars, conditions, expandable rows, quick HP buttons |
| 34.3 | Skill Proficiency Matrix | 7 | 18-skill x N-character grid, proficiency indicators, highlight highest, mobile pivot |
| 34.4 | Language Coverage | 4 | Party languages panel, common/exotic categorization, gap identification, tools |
| 34.5 | Party Composition Analysis | 5 | Role mapping, coverage indicators, informational tone, special callout badges |

## Key Design Decisions

- Dashboard route: `/campaign/:id` with tab navigation (Party, Sessions, Encounters, Notes)
- Party Stats Grid is the default view showing 10+ columns of character data
- Skill matrix highlights the highest modifier per skill with gold background
- Party composition uses informational tone ("Strengths & Potential Gaps") not prescriptive
- Mobile layouts pivot tables and use horizontal scrollable strips

## Dependencies

- **Epic 33 Story 33.1** — Campaign data model and store (required)
- **Epic 33 Story 33.5** — Characters must be assignable to campaigns
- **Phase 1-3:** Character data (ability scores, skills, languages, class features)
- **Phase 4:** HP tracker, conditions tracker, dice roller (for skill check integration)

## New Components

- `pages/CampaignDashboard.tsx`
- `components/dm/PartyStatsGrid.tsx`
- `components/dm/SkillMatrix.tsx`
- `components/dm/LanguageCoverage.tsx`
- `components/dm/PartyComposition.tsx`

## Testing Summary

| Story | Unit | Functional | E2E | Total |
|-------|------|-----------|-----|-------|
| 34.1 — Campaign Dashboard Layout | 2 | 7 | 3 | 12 |
| 34.2 — Party Stats Grid | 5 | 7 | 4 | 16 |
| 34.3 — Skill Proficiency Matrix | 5 | 7 | 3 | 15 |
| 34.4 — Language Coverage | 4 | 5 | 0 | 9 |
| 34.5 — Party Composition Analysis | 5 | 6 | 2 | 13 |
| **Totals** | **21** | **32** | **12** | **65** |

### Key Gaps Found
- **Accessibility** is the most prevalent gap: no ARIA roles for tables, grids, or interactive badges; no screen reader support for HP bars, proficiency indicators, or role coverage icons
- **Mobile/Responsive** layouts lack specific breakpoint definitions for desktop vs mobile; side panel vs full page behavior undefined
- **Performance** targets missing for Party Stats Grid and Skill Matrix rendering with 8+ characters (144+ cells)
- **Loading/Empty States** missing skeleton/loading states while campaign and character data resolves
- **Edge Cases** around empty party (0 characters), corrupted character data, and non-SRD custom languages not addressed
