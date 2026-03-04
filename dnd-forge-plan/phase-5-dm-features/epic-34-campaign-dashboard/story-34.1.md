# Story 34.1 — Campaign Dashboard Layout

> **Epic 34: Campaign Dashboard & Party Overview** | **Phase 5: DM Features** (Weeks 9-10)

## Description

As a DM, I need a single dashboard screen that shows everything about my campaign and party at a glance.

## Technical Context

- **App**: D&D Character Forge — local-first React PWA for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, Zustand (state), Dexie.js (IndexedDB), React Router
- **Architecture**: No backend, pure client-side, offline-capable PWA, IndexedDB for persistence. DM role is local (no authentication), campaigns are local data with join codes as local import mechanism.
- **Prior Phases Available**: Phase 1-4 (full character creation, sheet display, session play features including dice roller, HP tracker, spell slots, conditions, rest, level up)

This story creates the campaign dashboard page — the DM's command center. It is the primary destination for the `/campaign/:id` route.

**Layout (desktop):**
- **Header bar**: campaign name (Cinzel font), setting tag, player count, "Edit Campaign" gear icon
- **Description**: collapsible subtitle under the campaign name
- **Action buttons**: join code badge with copy button, "Start Encounter" (accent-red), "Award XP", "Long Rest All"
- **Tab navigation**: four tabs — "Party" (default), "Sessions", "Encounters", "Notes"

**Layout (mobile):**
- Tabs become a horizontal scrollable strip
- Header collapses to name + essential action buttons
- Content stacks vertically

The dashboard loads the campaign and all linked characters from IndexedDB via the `useCampaign` hook (Story 33.1). If the campaign is not found, display a 404 with "Campaign not found" and a "Go to Campaigns" button.

The "Party" tab is the default view and hosts the Party Stats Grid (Story 34.2), Skill Matrix (Story 34.3), Language Coverage (Story 34.4), and Party Composition (Story 34.5). The other tabs host features from Epics 35 and 36.

## Tasks

- [ ] **T34.1.1** — Create `pages/CampaignDashboard.tsx` — route: `/campaign/:id`. Load campaign + all linked characters. If campaign not found: 404 with "Campaign not found" + "Go to Campaigns" button
- [ ] **T34.1.2** — Dashboard layout (desktop): header bar (campaign name, setting tag, player count, "Edit Campaign" gear icon), below: tab navigation with four tabs: "Party" (default), "Sessions", "Encounters", "Notes"
- [ ] **T34.1.3** — Campaign header: campaign name in Cinzel font, description as a collapsible subtitle, join code badge with copy button, "Start Encounter" action button (accent-red), "Award XP" button, "Long Rest All" button
- [ ] **T34.1.4** — Mobile layout: tabs become a horizontal scrollable strip. Header collapses to name + essential action buttons. Content stacks vertically
- [ ] **T34.1.5** — Empty party state: "No characters in this campaign yet. Add characters to get started!" with "Add Character" CTA button

## Acceptance Criteria

- Dashboard page loads at `/campaign/:id` and displays the campaign with all linked characters
- 404 page shown with navigation option when campaign ID is invalid
- Desktop layout includes header bar with campaign name, tags, player count, and gear icon
- Four tabs (Party, Sessions, Encounters, Notes) with Party as default
- Campaign header displays name (Cinzel font), collapsible description, join code with copy, and action buttons
- Mobile layout uses horizontal scrollable tabs and collapsed header
- Empty party state shows helpful message with "Add Character" CTA
- All action buttons are wired to their respective features (Start Encounter, Award XP, Long Rest All)

## Dependencies

- Epic 33 Story 33.1 — Campaign data model and `useCampaign` hook
- Epic 33 Story 33.5 — Character-campaign assignment (for populated party)
- Epic 38 Story 38.1 — Route structure (`/campaign/:id`)

## Notes

- The dashboard is the shell that hosts all other Party tab components (Stories 34.2-34.5). Build the shell first, then populate with child components.
- "Start Encounter" navigates to the encounter setup (Epic 35). "Award XP" opens the XP award modal (Epic 37). "Long Rest All" triggers rest automation for all party characters (Phase 4 rest logic applied to each character).
- Tab content areas should be lazy-loaded to keep initial page load fast.
