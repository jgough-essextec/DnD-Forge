# Story 33.3 — Campaign List & Selection

> **Epic 33: Campaign CRUD & Data Model** | **Phase 5: DM Features** (Weeks 9-10)

## Description

As a DM, I need to see all my campaigns and select one to manage.

## Technical Context

- **App**: D&D Character Forge — local-first React PWA for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, Zustand (state), Dexie.js (IndexedDB), React Router
- **Architecture**: No backend, pure client-side, offline-capable PWA, IndexedDB for persistence. DM role is local (no authentication), campaigns are local data with join codes as local import mechanism.
- **Prior Phases Available**: Phase 1-4 (full character creation, sheet display, session play features including dice roller, HP tracker, spell slots, conditions, rest, level up)

This story creates the campaign list view, accessible from main navigation as a "Campaigns" section alongside the character gallery. Campaigns display as cards in a responsive grid (1-3 columns).

**Campaign card** displays: campaign name (Cinzel font), description preview (2 lines truncated), player count badge, last session date, setting tag badge, status indicator (active/archived).

**Card actions** via kebab menu: Edit, Archive, Delete, Export, Copy Join Code.

The campaign list uses the same visual patterns as the character gallery (responsive grid, cards, FAB for creation) to maintain UI consistency.

## Tasks

- [ ] **T33.3.1** — Create `components/dm/CampaignList.tsx` — accessible from the main navigation (new "Campaigns" tab/section alongside the character gallery). Shows all non-archived campaigns as cards in a grid (responsive: 1-3 columns)
- [ ] **T33.3.2** — Campaign card: campaign name (Cinzel font), description preview (2 lines truncated), player count badge ("4 characters"), last session date, setting tag badge, status indicator (active/archived)
- [ ] **T33.3.3** — Card click: navigates to `/campaign/:id` (the campaign dashboard)
- [ ] **T33.3.4** — Card context menu (kebab icon): Edit, Archive, Delete, Export, Copy Join Code
- [ ] **T33.3.5** — "Create New Campaign" button (accent-gold FAB, same style as "Create Character" on gallery). Empty state: "No campaigns yet. Create your first campaign to start managing your party!"
- [ ] **T33.3.6** — "Show Archived" toggle to display archived campaigns with muted styling and "Unarchive" action
- [ ] **T33.3.7** — Sort dropdown: Last Updated, Name A-Z, Date Created

## Acceptance Criteria

- Campaign list is accessible from main navigation alongside the character gallery
- All non-archived campaigns display as cards in a responsive grid
- Campaign cards show name, description preview, player count, last session date, setting tag, and status
- Clicking a card navigates to the campaign dashboard (`/campaign/:id`)
- Kebab menu provides Edit, Archive, Delete, Export, and Copy Join Code actions
- "Create New Campaign" FAB opens the create campaign modal
- Empty state message displays when no campaigns exist
- "Show Archived" toggle reveals archived campaigns with muted styling
- Sort dropdown provides Last Updated, Name A-Z, and Date Created options

## Dependencies

- Story 33.1 — Campaign data model and Zustand store
- Story 33.2 — Create campaign modal (opened by FAB)
- Epic 38 Story 38.1 — Route structure (campaigns route)

## Notes

- The visual pattern mirrors the character gallery for consistency — responsive card grid, same font treatment, same FAB style.
- Archive is a soft delete (sets `isArchived: true`). Archived campaigns can be restored.
- Delete is permanent with a confirmation dialog (handled in Story 33.5 which covers unlinking characters on delete).
- Export action triggers the campaign export from Story 38.4.
