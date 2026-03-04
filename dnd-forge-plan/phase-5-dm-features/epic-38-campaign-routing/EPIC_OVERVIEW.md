# Epic 38: Campaign Routing & Navigation

> **Phase 5: DM Features** | Weeks 9-10

## Goal

Integrate all DM features into the app's routing and navigation structure, with clear separation between player and DM contexts.

## Stories

| Story | Title | Tasks | Focus |
|-------|-------|-------|-------|
| 38.1 | DM Route Structure | 5 | New routes, breadcrumbs, navigation bar, page transitions, deep linking |
| 38.2 | DM vs Player Context | 4 | Context-aware character view, DM badge, DM notes visibility, shared data |
| 38.3 | Join Campaign Flow | 5 | Join page, code entry, local import, character selection, success state |
| 38.4 | Campaign Export & Import | 5 | Full export, player-safe export, import validation, merge handling |

## Route Structure

| Route | Description |
|-------|-------------|
| `/campaigns` | Campaign list |
| `/campaign/:id` | Campaign dashboard (Party tab default) |
| `/campaign/:id/encounter/:encounterId` | Active combat tracker |
| `/campaign/:id/session/:sessionId` | Session note detail view |
| `/join/:code` | Join campaign landing page |

## Key Design Decisions

- **DM vs Player Context:** The same character data is shared; edits in either context save to the same IndexedDB record. The difference is purely UI/access (which panels are shown).
- **Join Codes (Local Phase 5):** Join codes resolve against local campaigns only. For cross-device sharing, JSON export/import is the transport layer. This scaffolds the future backend-enabled flow.
- **Campaign Export:** Two modes — full export (includes DM notes, NPC tracker, session notes) and player-safe export (excludes DM-only content).
- **Navigation:** "Campaigns" section added alongside existing "Characters" section in top nav bar.

## Dependencies

- **Epic 33** — Campaign CRUD (all routes serve campaign data)
- **Epic 34** — Campaign dashboard (primary campaign route destination)
- **Epic 35** — Combat tracker (encounter route)
- **Epic 36** — Session log (session route)
- **Phase 3:** Existing routing (React Router), JSON export/import system

## New Components

- `pages/JoinCampaign.tsx`
- Campaign export/import utilities
- Breadcrumb and navigation updates

## Testing Summary

| Story | Unit | Functional | E2E | Total |
|-------|------|-----------|-----|-------|
| 38.1 — DM Route Structure | 3 | 6 | 4 | 13 |
| 38.2 — DM vs Player Context | 3 | 7 | 3 | 13 |
| 38.3 — Join Campaign Flow | 4 | 7 | 3 | 14 |
| 38.4 — Campaign Export & Import | 6 | 5 | 3 | 14 |
| **Totals** | **16** | **25** | **13** | **54** |

### Key Gaps Found
- **Accessibility** consistently missing: no ARIA labels for breadcrumbs, navigation sections, context badges, or join code inputs; no skip-to-content links
- **Error Handling** gaps in route guards for archived campaigns, corrupted JSON imports, and partial import failures
- **Edge Cases** around browser back/forward navigation between DM and player contexts, campaign deletion while in DM view, and Date serialization in JSON export/import
- **Mobile/Responsive** layouts not specified for join campaign page or context-specific views
- **Dependency Issues**: Export format versioning recommended but not defined as a required field; DM vs participant distinction on import needs clearer specification
