# Story 38.3 — Join Campaign Flow

> **Epic 38: Campaign Routing & Navigation** | **Phase 5: DM Features** (Weeks 9-10)

## Description

As a player receiving a join code, I need to add my character to a campaign.

## Technical Context

- **App**: D&D Character Forge — local-first React PWA for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, Zustand (state), Dexie.js (IndexedDB), React Router
- **Architecture**: No backend, pure client-side, offline-capable PWA, IndexedDB for persistence. DM role is local (no authentication), campaigns are local data with join codes as local import mechanism.
- **Prior Phases Available**: Phase 1-4 (full character creation, sheet display, session play features including dice roller, HP tracker, spell slots, conditions, rest, level up)

This story implements the join campaign flow. In Phase 5 (local-only), join codes resolve against local campaigns only. For cross-device sharing, JSON export/import is the transport mechanism.

**Join code mechanics (Phase 5 local-only):**
- Join codes are 6-character alphanumeric strings (uppercase, no ambiguous chars)
- They resolve only against campaigns in the local IndexedDB
- If no match is found locally, the user is prompted to import the campaign JSON file from the DM
- This scaffolding pattern matches the future backend-enabled flow

**Join flow:**
1. Navigate to `/join/:code` or access from "Join Campaign" button in navigation
2. Enter or paste the 6-character join code
3. **If code matches a local campaign:** Show campaign name and description. Proceed to character selection.
4. **If no match:** Show "Campaign not found locally. Ask your DM for the campaign JSON file to import."
5. **Import option:** "Import Campaign" button accepts a campaign JSON export. Importing creates the campaign in the local DB with the player as a participant (not DM).
6. **Character selection:** After joining, pick an existing character to add or create a new one (respecting campaign house rules).
7. **Success:** "You've joined [Campaign Name]! Your character [Name] is part of the party." with link to campaign view.

**Campaign data model** relevant fields:
- `joinCode: string` — 6-char alphanumeric code on Campaign
- `characterIds: string[]` — characters in the campaign
- `dmId: string` — the user who created the campaign

## Tasks

- [ ] **T38.3.1** — Create `pages/JoinCampaign.tsx` — route: `/join/:code` or accessed from a "Join Campaign" button in the navigation
- [ ] **T38.3.2** — Join flow: (1) Enter or paste the join code (6-char field). (2) If the code matches a local campaign (DM's device), show the campaign name and description. If no match, show: "Campaign not found locally. Ask your DM for the campaign JSON file to import."
- [ ] **T38.3.3** — For local-only Phase 5: "Import Campaign" button that accepts a campaign JSON export. Importing creates the campaign in the local DB with the player as a participant (not DM)
- [ ] **T38.3.4** — Character selection: after joining, pick an existing character to add to the campaign or create a new one (respecting campaign house rules)
- [ ] **T38.3.5** — Success state: "You've joined [Campaign Name]! Your character [Name] is part of the party." with a link to the campaign view

## Acceptance Criteria

- Join campaign page renders at `/join/:code` and via "Join Campaign" button
- 6-character join code input field validates format (uppercase alphanumeric)
- Matching local campaign shows name and description
- Non-matching code shows helpful message about importing from DM
- "Import Campaign" accepts campaign JSON file and creates local campaign
- Imported campaign marks the user as participant (not DM)
- Character selection allows picking existing character or creating new one
- New character creation respects campaign house rules
- Success state shows confirmation message with link to campaign view
- Character is properly linked to the campaign after joining

## Dependencies

- Epic 33 Story 33.1 — Campaign data model (joinCode field, character assignment)
- Epic 33 Story 33.5 — Character-campaign assignment logic
- Story 38.1 — Route structure (`/join/:code`)
- Story 38.4 — Campaign export/import (import validation)
- Phase 2 — Character creation wizard (for "Create New Character")

## Notes

- The join flow is intentionally scaffolded to match the future backend experience. The UI flow (enter code -> see campaign -> select character -> success) is identical to what it would look like with real-time sync. Only the transport layer differs (local JSON vs. server API).
- On the DM's own device, the join code always resolves locally. The "not found" scenario happens when a player tries to use the code on their own device without importing the campaign data.
- Consider auto-filling the join code from the URL parameter (`/join/ABC123`) so users following a shared link don't need to type it.
- The participant vs DM distinction is important: a player who imports a campaign should see a limited view (no DM notes, no NPC tracker) compared to the DM who created it. This is handled by Story 38.2 (DM vs Player Context).
