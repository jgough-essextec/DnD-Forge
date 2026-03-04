# Story 37.3 — Level Progress Tracking

> **Epic 37: XP & Milestone Management** | **Phase 5: DM Features** (Weeks 9-10)

## Description

As a DM, I need to see how close each character is to their next level.

## Technical Context

- **App**: D&D Character Forge — local-first React PWA for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, Zustand (state), Dexie.js (IndexedDB), React Router
- **Architecture**: No backend, pure client-side, offline-capable PWA, IndexedDB for persistence. DM role is local (no authentication), campaigns are local data with join codes as local import mechanism.
- **Prior Phases Available**: Phase 1-4 (full character creation, sheet display, session play features including dice roller, HP tracker, spell slots, conditions, rest, level up)

This story adds level progress tracking to the party stats grid and character views. It shows how close each character is to their next level, adapting based on the campaign's progression mode (XP tracking vs milestone).

**XP threshold table (SRD):**
| Level | XP | Level | XP |
|-------|-----|-------|----|
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

**XP Tracking mode display:**
- Mini progress bar showing XP progress toward next level on the party stats grid
- Tooltip: "[current XP] / [threshold XP] ([percent]%)"
- Level 20 characters show "MAX LEVEL" instead of a progress bar
- XP progress visible on gallery cards and character sheets when in an XP-tracking campaign

**Milestone mode display:**
- Show "Level [N] — Milestone" instead of XP progress
- No progress bar (leveling is at DM discretion, not tied to a number)

**DM quick reference:** The full XP thresholds table accessible from the campaign dashboard as a collapsible reference card.

## Tasks

- [ ] **T37.3.1** — On the party stats grid, add a "Level Progress" column: a mini progress bar showing XP progress toward the next level. Tooltip: "[current XP] / [threshold XP] ([percent]%)"
- [ ] **T37.3.2** — Characters at level 20 show "MAX LEVEL" instead of a progress bar
- [ ] **T37.3.3** — On each character's gallery card and sheet, show the XP progress prominently when in an XP-tracking campaign. When in a milestone campaign, show "Level [N] — Milestone" instead
- [ ] **T37.3.4** — DM quick reference: the XP thresholds table (Level 1: 0, Level 2: 300, Level 3: 900, ... Level 20: 355,000) accessible from the campaign dashboard as a collapsible reference card

## Acceptance Criteria

- Party stats grid includes a "Level Progress" column with mini progress bars
- Progress bar tooltip shows "[current XP] / [threshold XP] ([percent]%)"
- Level 20 characters display "MAX LEVEL" instead of a progress bar
- Character gallery cards show XP progress when in an XP-tracking campaign
- Character sheets show XP progress when in an XP-tracking campaign
- Milestone campaigns show "Level [N] — Milestone" instead of XP numbers
- XP thresholds table is accessible from the campaign dashboard as a collapsible reference
- Progress bars accurately reflect current XP relative to the next level threshold

## Testing Requirements

### Unit Tests (Vitest)
_For pure functions, calculations, data transforms, utilities, type guards, validators_

- `should calculate XP progress percentage toward next level threshold correctly`
- `should return "MAX LEVEL" for level 20 characters`
- `should display "Level [N] -- Milestone" for characters in milestone campaigns`
- `should format tooltip as "[current XP] / [threshold XP] ([percent]%)"`
- `should apply gold color when within 20% of next level threshold`

### Functional Tests (React Testing Library)
_For component rendering, user interactions, state changes, prop variations_

- `should render "Level Progress" column in the party stats grid with mini progress bars`
- `should display tooltip with XP progress details on hover`
- `should show "MAX LEVEL" badge for level 20 characters instead of progress bar`
- `should display XP progress on character gallery cards when in XP-tracking campaign`
- `should show "Level [N] -- Milestone" on gallery cards and sheets in milestone campaigns`
- `should render collapsible XP threshold reference card on campaign dashboard`

### E2E Tests (Playwright)
_For critical user journeys, multi-step flows, full-page interactions_

- `should display level progress bars for all characters in a campaign and verify accuracy`
- `should switch to milestone mode and verify progress bars change to "Milestone" labels`

### Test Dependencies
- SRD XP threshold table data
- Character fixtures at various XP levels (0%, 50%, 80%, 100%, max level)
- Mock campaign in both XP Tracking and Milestone modes
- Gallery card and character sheet component stubs

## Identified Gaps

- **Accessibility**: No ARIA label for progress bar or tooltip; no screen reader alternative for visual progress indicator
- **Mobile/Responsive**: No mobile-specific styling for the progress column or gallery card progress display
- **Edge Cases**: Behavior when character XP exceeds the threshold but has not leveled up yet (should show "Level Up Available!" glow)

## Dependencies

- Epic 34 Story 34.2 — Party stats grid (new column)
- Epic 33 Story 33.1 — Campaign data model (progression mode)
- Story 37.2 — Milestone level-up (progression mode toggle)
- Phase 1-3 — Character XP and level data, gallery cards, character sheets

## Notes

- The level progress display adapts to the campaign's progression mode. This means the same character can show XP progress in one campaign and "Milestone" in another (though Phase 5 limits characters to one campaign).
- The progress bar color should match the app's existing color patterns: green when far from threshold, gold when close (within 20%), with a glow effect when the character has enough XP to level up.
- The collapsible XP reference card is a convenience feature — DMs frequently need to look up "How much XP for level 10?" when planning encounters or awarding XP.
