# Story 38.3 — Join Campaign Flow

> **Epic 38: Campaign Routing & Navigation** | **Phase 5: DM Features** (Weeks 9-10)

## Description

As a player receiving a join code, I need to add my character to a campaign.

## Technical Context

- **App**: D&D Character Forge — full-stack Django + React web application for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, React Query (server state), Zustand (UI state), Django REST Framework, PostgreSQL, React Router
- **Architecture**: Django REST API backend, React SPA frontend, PostgreSQL persistence, Django session auth. DM role authenticated via Django User model, campaigns have owner FK with join codes for player association.
- **Prior Phases Available**: Phase 1-4 (full character creation, sheet display, session play features including dice roller, HP tracker, spell slots, conditions, rest, level up)

This story implements the join campaign flow. Join codes are server-validated and resolve against the backend campaign database.

**Join code mechanics:**
- Join codes are 6-character alphanumeric strings (uppercase, no ambiguous chars)
- They resolve against the backend via GET /api/campaigns/join/:code/
- If no match is found, the user sees an error message
- The authenticated user is associated with the campaign as a player

**Join flow:**
1. Navigate to `/join/:code` or access from "Join Campaign" button in navigation
2. Enter or paste the 6-character join code
3. **If code matches a campaign:** Show campaign name and description. Proceed to character selection.
4. **If no match:** Show "Campaign not found. Please check the code and try again."
5. **Character selection:** After joining, pick an existing character to add or create a new one (respecting campaign house rules).
6. **Success:** "You've joined [Campaign Name]! Your character [Name] is part of the party." with link to campaign view.

**Campaign data model** relevant fields:
- `joinCode: string` — 6-char alphanumeric code on Campaign
- `characterIds: string[]` — characters in the campaign
- `dmId: string` — the user who created the campaign

## Tasks

- [ ] **T38.3.1** — Create `pages/JoinCampaign.tsx` — route: `/join/:code` or accessed from a "Join Campaign" button in the navigation
- [ ] **T38.3.2** — Join flow: (1) Enter or paste the join code (6-char field). (2) Validate against backend via GET /api/campaigns/join/:code/. If match, show the campaign name and description. If no match, show: "Campaign not found. Please check the code and try again."
- [ ] **T38.3.3** — Character selection: after joining, pick an existing character to add to the campaign or create a new one (respecting campaign house rules)
- [ ] **T38.3.5** — Success state: "You've joined [Campaign Name]! Your character [Name] is part of the party." with a link to the campaign view

## Acceptance Criteria

- Join campaign page renders at `/join/:code` and via "Join Campaign" button
- 6-character join code input field validates format (uppercase alphanumeric)
- Matching campaign (via API) shows name and description
- Non-matching code shows helpful error message
- Character selection allows picking existing character or creating new one
- New character creation respects campaign house rules
- Success state shows confirmation message with link to campaign view
- Character is properly linked to the campaign after joining

## Testing Requirements

### Unit Tests (Vitest)
_For pure functions, calculations, data transforms, utilities, type guards, validators_

- `should validate join code format (6 uppercase alphanumeric characters, no ambiguous chars)`
- `should resolve join code against backend API`
- `should return "not found" when join code matches no campaign on server`

### Functional Tests (React Testing Library)
_For component rendering, user interactions, state changes, prop variations_

- `should render join campaign page at /join/:code with code input field`
- `should auto-fill join code from URL parameter`
- `should display campaign name and description when code matches a campaign via API`
- `should show "Campaign not found" error message when code does not match`
- `should display character selection after successful join (existing or create new)`
- `should show success state: "You've joined [Campaign Name]!" with link to campaign view`

### E2E Tests (Playwright)
_For critical user journeys, multi-step flows, full-page interactions_

- `should enter a valid join code, select a character, and successfully join a campaign`
- `should create a new character respecting house rules and auto-assign to campaign after joining`

### Test Dependencies
- MSW (Mock Service Worker) API mocking with known join code responses
- Character fixtures for selection
- Mock Phase 2 character creation wizard
- Mock file input for JSON import

## Identified Gaps

- **Error Handling**: No specification for handling invalid/corrupted campaign JSON import; no error state for partial import
- **Loading/Empty States**: No loading state while resolving join code against API
- **Accessibility**: No ARIA labels for join code input; no keyboard navigation for character selection
- **Mobile/Responsive**: No mobile layout specified for the join campaign page
- **Edge Cases**: Behavior when the join code input has trailing spaces; behavior when user has no characters to select

## Dependencies

- Epic 33 Story 33.1 — Campaign data model (joinCode field, character assignment)
- Epic 33 Story 33.5 — Character-campaign assignment logic
- Story 38.1 — Route structure (`/join/:code`)
- Story 38.4 — Campaign export/import (import validation)
- Phase 2 — Character creation wizard (for "Create New Character")

## Notes

- The join flow resolves codes against the backend API. The UI flow is: enter code -> see campaign -> select character -> success.
- Consider auto-filling the join code from the URL parameter (`/join/ABC123`) so users following a shared link don't need to type it.
- The participant vs DM distinction is enforced server-side: a player who joins a campaign sees a limited view (no DM notes, no NPC tracker) compared to the DM who created it. This is handled by Story 38.2 (DM vs Player Context).
