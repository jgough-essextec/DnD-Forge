# Player Campaign View — Test Coverage

This document describes the frontend test coverage added for the Player Campaign View feature, which allows players to see their joined campaigns, view party members, and leave campaigns.

## Overview

| Metric | Value |
|--------|-------|
| New tests added | ~47 |
| New test files | 8 |
| Modified test files | 4 |
| New MSW handlers | 4 |
| Fixed existing tests | 2 (CharacterSheetPage back-link, JoinCampaignFlow lookup URL) |

## MSW Mock Handlers

**File:** `frontend/src/mocks/handlers.ts`

### New mock data

- **`camp-002`** (Curse of Strahd) — a second campaign owned by `user-001` with a player (`550e8400-...`) so the joined endpoint has data to return.
- **`mockPartyMembers`** — two party member objects matching the `PartyMember` type / `CharacterListSerializer` shape (Thorn Ironforge, Elara Nightwhisper).

### New handlers

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/campaigns/joined/` | GET | Returns campaigns where the current user is a player (not DM). Falls back to `camp-002` when no user is set. |
| `/campaigns/lookup/:code/` | GET | Looks up a campaign by join code (renamed from `/campaigns/join/:code/`). |
| `/campaigns/:id/party/` | GET | Returns party members for a campaign. Returns `mockPartyMembers` for `camp-001`, empty array otherwise. |
| `/campaigns/:id/leave/` | POST | Simulates leaving a campaign. Returns success message. |

### Handler ordering fix

The `/campaigns/joined/` and `/campaigns/lookup/:code/` handlers are placed **before** the generic `/campaigns/:id/` handler to prevent MSW from matching `joined` or `lookup` as a campaign ID parameter.

## Hook Tests

**File:** `frontend/src/hooks/__tests__/useCampaigns.test.tsx`

| Hook | Tests | What's covered |
|------|-------|----------------|
| `useJoinedCampaigns` | 1 | Fetches joined campaigns, returns array |
| `useCampaignParty` | 2 | Fetches party members with correct shape (name, race, class, hp, ac); disabled when id is null (`fetchStatus === 'idle'`) |
| `useLeaveCampaign` | 1 | Mutation succeeds, `isSuccess` is true |

## Component Tests

### JoinedCampaignCard

**File:** `frontend/src/components/campaigns/__tests__/JoinedCampaignCard.test.tsx` (8 tests)

- Renders campaign name
- Shows "Player" badge
- Shows correct character count (singular and plural)
- Navigates to `/campaign/{id}` on click
- Navigates on Enter key press
- Shows description when present
- Hides description when absent

### PartyMemberCard

**File:** `frontend/src/components/campaigns/__tests__/PartyMemberCard.test.tsx` (8 tests)

- Renders member name, race, class, and level
- Shows HP bar with correct current/max values
- Shows AC badge with aria-label
- Shows "You" badge when `isCurrentUser=true`
- Hides "You" badge by default
- Navigates to `/character/{id}` on click
- Appends `?from={campaignId}` query param when `campaignId` is provided
- Handles keyboard Enter navigation

### LeaveCampaignDialog

**File:** `frontend/src/components/campaigns/__tests__/LeaveCampaignDialog.test.tsx` (6 tests)

- Returns null when `isOpen=false`
- Renders campaign name in confirmation message
- Calls `onConfirm` when "Leave Campaign" button clicked
- Calls `onClose` when "Cancel" button clicked
- Shows "Leaving..." with disabled button when `isLeaving=true`
- Has `alertdialog` role for accessibility

### PlayerCampaignView

**File:** `frontend/src/components/campaigns/__tests__/PlayerCampaignView.test.tsx` (6 tests)

- Renders "Party Members" heading
- Shows party member cards when loaded (via MSW)
- Shows loading skeleton while party loads
- Shows empty state when no party members
- Displays the join code
- Shows "Leave Campaign" button

## Page Tests

### CharacterSheetPage (modified)

**File:** `frontend/src/pages/__tests__/CharacterSheetPage.test.tsx`

Fixed and added tests:

| Test | Type |
|------|------|
| Back link aria-label `"Back to characters"` → `"Back"` | Fix |
| Read-only mode: shows "Read Only" badge when viewing another user's character | New |
| Campaign back link: shows "Back to Campaign" link when `?from=camp-001` query param is present | New |

### CampaignsPage

**File:** `frontend/src/pages/__tests__/CampaignsPage.test.tsx` (6 tests)

- Renders "Campaigns" heading
- Shows campaign list from API
- Shows "Create New Campaign" button
- Shows "Joined Campaigns" section when joined campaigns exist
- Shows `JoinedCampaignCard` (by `data-testid`) for joined campaigns
- Shows error state when API fails

### CampaignDashboardPage

**File:** `frontend/src/pages/__tests__/CampaignDashboardPage.test.tsx` (5 tests)

- Shows campaign name in header
- Shows "Back to campaigns" button
- DM view: shows settings button
- Player view: shows `PlayerCampaignView` with party members and leave button, hides DM controls
- Shows "Campaign not found." for invalid campaign ID

## Integration Tests (E2E via MSW)

**File:** `frontend/src/test/e2e/campaign.test.ts`

### Fixed

- Campaign lookup URL: `/campaigns/join/ABC123/` → `/campaigns/lookup/ABC123/`

### New test blocks

| Block | Tests | What's covered |
|-------|-------|----------------|
| Campaign: Joined Campaigns | 1 | `GET /campaigns/joined/` returns array |
| Campaign: Party Members | 2 | `GET /campaigns/{id}/party/` returns character-list-shaped data; 404 for non-existent campaign |
| Campaign: Leave Campaign | 2 | `POST /campaigns/{id}/leave/` returns success; 404 for non-existent campaign |

## Playwright E2E

**File:** `frontend/e2e/player-campaign.spec.ts` (2 tests)

Smoke-level browser tests (require dev server + backend running):

- Campaigns page loads without errors, heading is visible
- Campaign dashboard loads and shows content

## Other Fixes

**File:** `frontend/src/components/dm/context/__tests__/JoinCampaignFlow.test.tsx`

- Updated 5 `server.use()` overrides from the old `/campaigns/join/:code/` URL to the new `/campaigns/lookup/:code/` URL to match the renamed API endpoint.

## Verification

```bash
# Frontend unit/component/integration tests (4885 pass, 4 pre-existing failures unrelated)
cd frontend && npx vitest run

# TypeScript — no errors
cd frontend && npx tsc --noEmit

# Backend — all 63 tests pass
cd backend && python manage.py test

# Playwright (requires running dev server)
cd frontend && npx playwright test
```
