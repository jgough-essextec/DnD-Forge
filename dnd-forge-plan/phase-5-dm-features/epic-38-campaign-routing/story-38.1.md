# Story 38.1 — DM Route Structure

> **Epic 38: Campaign Routing & Navigation** | **Phase 5: DM Features** (Weeks 9-10)

## Description

As a developer, I need clean routes for all DM features that integrate with the existing Phase 3 routing.

## Technical Context

- **App**: D&D Character Forge — local-first React PWA for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, Zustand (state), Dexie.js (IndexedDB), React Router
- **Architecture**: No backend, pure client-side, offline-capable PWA, IndexedDB for persistence. DM role is local (no authentication), campaigns are local data with join codes as local import mechanism.
- **Prior Phases Available**: Phase 1-4 (full character creation, sheet display, session play features including dice roller, HP tracker, spell slots, conditions, rest, level up)

This story defines and implements all new routes for DM features, integrating them with the existing React Router setup from Phase 3.

**New routes:**
| Route | Page/Component | Purpose |
|-------|---------------|---------|
| `/campaigns` | CampaignList | Campaign list (gallery) |
| `/campaign/:id` | CampaignDashboard | Campaign dashboard (Party tab default) |
| `/campaign/:id/encounter/:encounterId` | CombatTracker | Active combat tracker |
| `/campaign/:id/session/:sessionId` | SessionNoteDetail | Session note detail view |
| `/join/:code` | JoinCampaign | Join campaign landing page |

**Navigation updates:**
- Add "Campaigns" to the top navigation bar alongside the existing "Characters" section
- Active section is highlighted
- Mobile: both sections accessible from hamburger menu

**Breadcrumbs:**
- "Campaigns" -> "[Campaign Name]" -> "Encounter: [Name]" or "Session [N]"

**Page transitions:** Consistent with Phase 3 patterns (slide animations, framer-motion).

**Deep linking:** Navigating directly to `/campaign/:id` loads the campaign and its characters from IndexedDB. Missing campaign or characters show appropriate error states.

## Tasks

- [ ] **T38.1.1** — Define new routes:
  - `/campaigns` — Campaign list
  - `/campaign/:id` — Campaign dashboard (Party tab default)
  - `/campaign/:id/encounter/:encounterId` — Active combat tracker
  - `/campaign/:id/session/:sessionId` — Session note detail view
  - `/join/:code` — Join campaign landing page
- [ ] **T38.1.2** — Breadcrumb updates: "Campaigns" -> "[Campaign Name]" -> "Encounter: [Name]" or "Session [N]"
- [ ] **T38.1.3** — Navigation: add "Campaigns" to the top navigation bar alongside the existing "Characters" section. Active section is highlighted. On mobile, both are accessible from the hamburger menu
- [ ] **T38.1.4** — Page transitions: consistent with Phase 3 (slide animations, framer-motion)
- [ ] **T38.1.5** — Deep linking: navigating directly to `/campaign/:id` loads the campaign and its characters from IndexedDB. If the campaign or characters are missing, show appropriate error states

## Acceptance Criteria

- All 5 new routes are registered in React Router and resolve correctly
- `/campaigns` renders the campaign list
- `/campaign/:id` renders the campaign dashboard with Party tab as default
- `/campaign/:id/encounter/:encounterId` renders the combat tracker
- `/campaign/:id/session/:sessionId` renders the session note detail view
- `/join/:code` renders the join campaign page
- Breadcrumbs display correct hierarchy for each route
- "Campaigns" section appears in top navigation alongside "Characters"
- Active navigation section is visually highlighted
- Mobile hamburger menu includes both "Characters" and "Campaigns"
- Page transitions match Phase 3 animation patterns
- Direct URL navigation loads data from IndexedDB with error states for missing data

## Dependencies

- Phase 3 — Existing React Router setup, navigation components, page transition patterns
- Epic 33 — Campaign CRUD (provides campaign data for routes)
- Epic 34 — Campaign dashboard (primary campaign route destination)
- Epic 35 — Combat tracker (encounter route destination)
- Epic 36 — Session log (session route destination)

## Notes

- This story should be scaffolded early (Week 9, Day 1) alongside Epic 33, as routes need to exist for other stories to navigate to them. Initially, routes can render placeholder components that are filled in as other stories are completed.
- Deep linking is critical for bookmarking and sharing. A DM should be able to bookmark their campaign dashboard and navigate directly to it.
- The error states for missing campaigns should be helpful: "Campaign not found" with a "Go to Campaigns" button, not a generic 404.
- Consider route guards that prevent navigating to encounter routes when no active encounter exists.
