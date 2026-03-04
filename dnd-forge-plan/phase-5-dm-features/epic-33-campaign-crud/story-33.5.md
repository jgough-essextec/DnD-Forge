# Story 33.5 — Character-Campaign Assignment

> **Epic 33: Campaign CRUD & Data Model** | **Phase 5: DM Features** (Weeks 9-10)

## Description

As a DM, I need to add and remove characters from a campaign, whether they're characters I created or characters imported from players.

## Technical Context

- **App**: D&D Character Forge — full-stack Django + React web application for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, React Query (server state), Zustand (UI state), Django REST Framework, PostgreSQL, React Router
- **Architecture**: Django REST API backend, React SPA frontend, PostgreSQL persistence, Django session auth. DM role authenticated via Django User model, campaigns have owner FK with join codes for player association.
- **Prior Phases Available**: Phase 1-4 (full character creation, sheet display, session play features including dice roller, HP tracker, spell slots, conditions, rest, level up)

This story manages the campaign-character relationship. Key data model constraints:

- **One campaign per character**: A character can be in zero or one campaign at a time (not multiple). The character has an optional `campaignId` field; the campaign has a `characterIds: string[]` array.
- **Unlinking vs deleting**: Removing a character from a campaign sets `campaignId` to null and removes from `characterIds` but does NOT delete the character. The character remains in the gallery.
- **Campaign deletion**: When a campaign is deleted, ALL linked characters are unlinked (set `campaignId` to null), then the campaign record is removed. Session notes and encounters are permanently deleted with the campaign.

**Character addition** has three paths:
1. **Pick from gallery**: Shows local characters not currently in another campaign
2. **Import player character**: Uses the Phase 3 JSON import flow; imported character is auto-assigned
3. **Create new character**: Opens the Phase 2 creation wizard with campaign house rules pre-applied (starting level, ability score method)

**Soft cap**: 8 characters maximum, with a warning at 7+ but no hard block. The party dashboard and initiative tracker must remain usable at 8+ characters.

## Tasks

- [ ] **T33.5.1** — "Add Character" button on the campaign dashboard. Opens a picker showing all local characters not currently in another campaign. Each character card shows: name, race, class, level. Multi-select enabled
- [ ] **T33.5.2** — "Import Player Character" option in the picker: opens the JSON import flow (from Phase 3 Epic 22). Imported character is auto-assigned to the campaign
- [ ] **T33.5.3** — "Create New Character" option in the picker: opens the character creation wizard (Phase 2) with campaign house rules pre-applied (e.g., starting level, ability score method). On completion, auto-assigns to campaign
- [ ] **T33.5.4** — Remove character from campaign: context menu on any character in the party list. "Remove from Campaign" unlinks (sets `campaignId` to null) but does not delete the character. Confirmation: "Remove [name] from [campaign]? The character will still exist in your gallery."
- [ ] **T33.5.5** — Maximum party size: soft cap of 8 characters (show warning at 7+, but don't block). The party dashboard table and initiative tracker should remain usable at 8+ characters
- [ ] **T33.5.6** — When a campaign is deleted: unlink all characters (set `campaignId` to null), then remove the campaign record. Confirmation dialog: "Delete '[name]'? All session notes and encounters will be permanently removed. Characters will be kept in your gallery."

## Acceptance Criteria

- "Add Character" button shows a picker with gallery characters not in another campaign
- Characters can be multi-selected and added to the campaign
- "Import Player Character" triggers the Phase 3 JSON import flow with auto-assignment
- "Create New Character" opens the creation wizard with campaign house rules pre-applied
- Removing a character from a campaign unlinks it (does not delete) with a confirmation dialog
- A warning is shown when the party reaches 7+ characters (soft cap of 8)
- Campaign deletion unlinks all characters and removes all campaign data with confirmation
- The campaign's `characterIds` array and each character's `campaignId` field stay in sync

## Testing Requirements

### Unit Tests (Vitest)
_For pure functions, calculations, data transforms, utilities, type guards, validators_

- `should filter gallery characters to exclude those already in another campaign`
- `should keep campaign.characterIds and character.campaignId in sync on add/remove`
- `should unlink all characters (set campaignId to null) when campaign is deleted`
- `should enforce soft cap warning at 7+ characters`

### Functional Tests (React Testing Library)
_For component rendering, user interactions, state changes, prop variations_

- `should render character picker showing only characters not in another campaign`
- `should grey out characters in another campaign with that campaign's name shown`
- `should support multi-select in the character picker`
- `should open JSON import flow when "Import Player Character" is selected`
- `should open character creation wizard with house rules pre-applied when "Create New Character" is selected`
- `should show confirmation dialog when removing a character from campaign`
- `should show warning badge when party reaches 7+ characters`
- `should show delete confirmation dialog with correct messaging about data loss`

### E2E Tests (Playwright)
_For critical user journeys, multi-step flows, full-page interactions_

- `should add a character from gallery to campaign and verify it appears in party stats grid`
- `should remove a character from campaign and verify it still exists in the gallery`
- `should delete a campaign and verify all characters are unlinked but preserved`

### Test Dependencies
- MSW (Mock Service Worker) API mocking for campaign and character endpoints
- Sample character fixtures (free characters, characters in other campaigns)
- Mock Phase 2 character creation wizard
- Mock Phase 3 JSON import flow
- Confirmation dialog mock

## Identified Gaps

- **Error Handling**: No specification for handling import failures or invalid character JSON
- **Edge Cases**: Behavior when creating a new character and wizard is cancelled (partial assignment state); behavior when character is in an encounter and removed from campaign
- **Accessibility**: No keyboard navigation spec for multi-select character picker
- **Mobile/Responsive**: No mobile layout specified for the character picker modal

## Dependencies

- Story 33.1 — Campaign data model and store (character assignment actions)
- Story 33.2 — Create campaign modal (campaign must exist)
- Phase 2 — Character creation wizard (for "Create New Character" path)
- Phase 3 — JSON import flow (for "Import Player Character" path)

## Notes

- The character picker should clearly show which characters are already in another campaign (greyed out with the campaign name shown). Characters in the current campaign should not appear in the picker.
- When house rules specify a starting level, new characters created for this campaign should start at that level, not level 1.
- The soft cap of 8 is a UX guideline, not a hard limit. Some DMs run large parties. The UI should accommodate this gracefully.
