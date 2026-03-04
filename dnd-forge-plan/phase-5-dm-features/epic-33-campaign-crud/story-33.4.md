# Story 33.4 — Edit Campaign & House Rules

> **Epic 33: Campaign CRUD & Data Model** | **Phase 5: DM Features** (Weeks 9-10)

## Description

As a DM, I need to edit campaign details and house rules after creation, including mid-campaign adjustments.

## Technical Context

- **App**: D&D Character Forge — full-stack Django + React web application for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, React Query (server state), Zustand (UI state), Django REST Framework, PostgreSQL, React Router
- **Architecture**: Django REST API backend, React SPA frontend, PostgreSQL persistence, Django session auth. DM role authenticated via Django User model, campaigns have owner FK with join codes for player association.
- **Prior Phases Available**: Phase 1-4 (full character creation, sheet display, session play features including dice roller, HP tracker, spell slots, conditions, rest, level up)

This story provides the edit campaign modal, which reuses the same form layout as the create modal but pre-populated with current values. It includes tabs for "Details", "House Rules", and "Invite".

**HouseRules fields** (editable mid-campaign):
- `allowedSources`: ('SRD' | 'PHB' | 'XGE' | 'TCE' | 'Custom')[]
- `abilityScoreMethod`: 'standard_array' | 'point_buy' | 'rolling' | 'any'
- `startingLevel`: number 1-20
- `startingGold`: optional number
- `hpMethod`: 'roll' | 'average' | 'max_first_level' | 'any'
- `allowFeats`: boolean
- `allowMulticlass`: boolean
- `encumbranceRule`: 'none' | 'standard' | 'variant'
- `criticalHitRule`: 'double_dice' | 'max_plus_roll' | 'standard'
- `customNotes`: string

Editing house rules mid-campaign shows an informational banner noting that changes will not retroactively modify existing characters. This is a DM workflow concern, not a technical limitation.

Auto-save follows the same debounce pattern used in Phase 3 character editing (save on field blur with debounce).

**Join code regeneration**: The DM can generate a new join code, which invalidates the old one. The backend invalidates the old code and generates a new server-validated code.

## Tasks

- [ ] **T33.4.1** — Create `components/dm/EditCampaignModal.tsx` — reuses the same form layout as CreateCampaignModal, pre-populated with current values. Tabs: "Details", "House Rules", "Invite"
- [ ] **T33.4.2** — Editing house rules mid-campaign shows an informational banner: "Changing house rules won't retroactively modify existing characters. Discuss changes with your players."
- [ ] **T33.4.3** — Regenerate join code option: "Generate New Code" button with confirmation ("This will invalidate the old code")
- [ ] **T33.4.4** — Auto-save on field blur (same debounce pattern as Phase 3 character edit)

## Acceptance Criteria

- Edit modal opens pre-populated with the campaign's current values
- Tabs provide organized access to Details, House Rules, and Invite settings
- Mid-campaign house rule changes show an informational banner
- Join code can be regenerated with a confirmation step
- Auto-save persists changes via API mutation on field blur with debounce
- All edits are reflected immediately in the campaign list and dashboard

## Testing Requirements

### Unit Tests (Vitest)
_For pure functions, calculations, data transforms, utilities, type guards, validators_

- `should debounce auto-save calls at the correct interval matching Phase 3 pattern`
- `should generate a new 6-character join code with no ambiguous characters on regeneration`

### Functional Tests (React Testing Library)
_For component rendering, user interactions, state changes, prop variations_

- `should render edit modal pre-populated with the campaign's current values`
- `should display three tabs: Details, House Rules, and Invite`
- `should show informational banner when editing house rules mid-campaign`
- `should show confirmation dialog when "Generate New Code" button is clicked`
- `should auto-save changes on field blur with debounce`
- `should reflect edits immediately in the campaign list and dashboard`

### E2E Tests (Playwright)
_For critical user journeys, multi-step flows, full-page interactions_

- `should open edit modal from campaign dashboard, modify house rules, and verify changes persist after page refresh`
- `should regenerate join code and verify old code no longer appears`

### Test Dependencies
- MSW (Mock Service Worker) API mocking pre-loaded with an existing campaign
- Mock debounce timer for auto-save testing
- Confirmation dialog mock
- Phase 3 auto-save pattern reference for debounce timing

## Identified Gaps

- **Error Handling**: No specification for auto-save failure handling (network/storage errors)
- **Loading/Empty States**: No saving indicator (e.g., "Saving..." or checkmark) specified during auto-save
- **Accessibility**: No keyboard navigation spec for tab switching or form fields within tabs
- **Mobile/Responsive**: No mobile layout specified for the tabbed edit modal
- **Edge Cases**: Behavior when two rapid edits conflict during debounce not specified

## Dependencies

- Story 33.1 — Campaign data model and Zustand store
- Story 33.2 — Create campaign modal (form layout is reused)
- Phase 3 — Auto-save debounce pattern

## Notes

- Consider extracting the campaign form fields into a shared component used by both CreateCampaignModal and EditCampaignModal to avoid duplication.
- The informational banner about mid-campaign house rule changes is a UX best practice — it sets DM expectations and encourages player communication.
- Join code regeneration is handled via a PUT /api/campaigns/:id/regenerate-code/ endpoint that invalidates the old code and returns the new one.
