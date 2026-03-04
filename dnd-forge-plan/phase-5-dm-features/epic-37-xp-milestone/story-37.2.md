# Story 37.2 — Milestone Level-Up

> **Epic 37: XP & Milestone Management** | **Phase 5: DM Features** (Weeks 9-10)

## Description

As a DM using milestone progression, I need to directly level up one or all characters without tracking XP.

## Technical Context

- **App**: D&D Character Forge — full-stack Django + React web application for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, React Query (server state), Zustand (UI state), Django REST Framework, PostgreSQL, React Router
- **Architecture**: Django REST API backend, React SPA frontend, PostgreSQL persistence, Django session auth. DM role authenticated via Django User model, campaigns have owner FK with join codes for player association.
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
- Level-up changes persist via API mutation

## Testing Requirements

### Unit Tests (Vitest)
_For pure functions, calculations, data transforms, utilities, type guards, validators_

- `should prevent leveling a character beyond level 20`
- `should toggle campaign progression mode between "XP Tracking" and "Milestone"`
- `should generate batch level-up summary with HP changes and new features per character`

### Functional Tests (React Testing Library)
_For component rendering, user interactions, state changes, prop variations_

- `should render "Milestone Level Up" button on campaign dashboard`
- `should show "Level Up All" and "Level Up Selected" options`
- `should display confirmation dialog "Level up all [N] characters to their next level?" for Level Up All`
- `should render checkboxes next to each character for "Level Up Selected" mode`
- `should display batch summary: "[Name]: Level 4 -> 5 (HP +8, new feat: Extra Attack)" per character`
- `should replace "Award XP" with "Milestone Level Up" when campaign is in Milestone mode`
- `should show "Milestone" instead of XP numbers on character sheets in Milestone mode`

### E2E Tests (Playwright)
_For critical user journeys, multi-step flows, full-page interactions_

- `should level up all characters via milestone and verify level changes persist`
- `should select specific characters for level-up and verify only selected are leveled`
- `should toggle campaign to Milestone mode and verify UI changes across dashboard`

### Test Dependencies
- Mock campaign with 4 characters at various levels
- Mock Phase 4 level-up flow (batched)
- MSW (Mock Service Worker) API mocking for campaign house rules endpoints
- Character fixtures including one at level 20 (for cap testing)

## Identified Gaps

- **Error Handling**: No specification for handling level-up flow failure mid-batch (partial level-ups)
- **Loading/Empty States**: No loading indicator during batch level-up processing
- **Accessibility**: No keyboard navigation for character selection checkboxes; no screen reader support for batch summary
- **Edge Cases**: Behavior when switching from Milestone to XP mid-campaign (should XP fields populate?); behavior with multiclass level-up choice not addressed in batch flow

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
