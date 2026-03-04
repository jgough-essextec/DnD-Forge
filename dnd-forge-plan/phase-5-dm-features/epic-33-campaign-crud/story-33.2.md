# Story 33.2 — Create Campaign Flow

> **Epic 33: Campaign CRUD & Data Model** | **Phase 5: DM Features** (Weeks 9-10)

## Description

As a DM, I need to create a new campaign with a name, description, house rules, and optional starting parameters so my players know what to expect.

## Technical Context

- **App**: D&D Character Forge — full-stack Django + React web application for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, React Query (server state), Zustand (UI state), Django REST Framework, PostgreSQL, React Router
- **Architecture**: Django REST API backend, React SPA frontend, PostgreSQL persistence, Django session auth. DM role authenticated via Django User model, campaigns have owner FK with join codes for player association.
- **Prior Phases Available**: Phase 1-4 (full character creation, sheet display, session play features including dice roller, HP tracker, spell slots, conditions, rest, level up)

This story creates a multi-step modal for campaign creation with three steps: Basic Info, House Rules, and Invite Setup.

**HouseRules fields** (all configured in Step 2):
- `allowedSources`: multi-select from SRD, PHB, XGE, TCE, Custom
- `abilityScoreMethod`: standard_array, point_buy, rolling, or any
- `startingLevel`: number 1-20, default 1
- `startingGold`: optional override
- `hpMethod`: roll, average, max_first_level, or any
- `allowFeats`: boolean, default true
- `allowMulticlass`: boolean, default true
- `encumbranceRule`: none, standard, or variant
- `criticalHitRule`: double_dice, max_plus_roll, or standard
- `customNotes`: freeform text

**Join Code generation** (Step 3): 6-character alphanumeric code (uppercase, no ambiguous chars like 0/O, 1/I/L). Join codes are server-validated — the backend resolves codes against the campaign database. The shareable URL format is `/join/[code]`.

**Campaign data** is persisted via POST /api/campaigns/ using a React Query mutation from Story 33.1. The `dmId` is set to the authenticated Django user.

## Tasks

- [ ] **T33.2.1** — Create `components/dm/CreateCampaignModal.tsx` — a multi-step modal (3 steps): (1) Basic Info, (2) House Rules, (3) Invite Setup
- [ ] **T33.2.2** — **Step 1 — Basic Info:** Campaign name (required, max 100 chars), description (optional, markdown-lite, max 2000 chars), campaign setting/theme tag (optional: "Forgotten Realms", "Homebrew", "Eberron", or custom text)
- [ ] **T33.2.3** — **Step 2 — House Rules:** Form with all HouseRules fields: allowed sources (multi-select checkboxes), ability score method (radio group), starting level (number 1-20, default 1), HP method (radio group), allow feats (toggle, default true), allow multiclass (toggle, default true), encumbrance rule (dropdown), critical hit rule (dropdown), custom notes (textarea)
- [ ] **T33.2.4** — **Step 3 — Invite Setup:** auto-generate a 6-character alphanumeric join code (uppercase, no ambiguous chars like 0/O, 1/I/L). Display prominently with "Copy Code" button. Also generate a shareable URL: `/join/[code]`. Show: "Share this code with your players so they can join the campaign"
- [ ] **T33.2.5** — "Create Campaign" button: validates all fields, submits via POST /api/campaigns/ React Query mutation, navigates to the new campaign's dashboard. Success toast: "Campaign '[name]' created!"
- [ ] **T33.2.6** — Pre-populate defaults for a quick-start: house rules all set to standard 5e defaults. "Use Standard Rules" button fills all defaults instantly

## Acceptance Criteria

- Multi-step modal guides the DM through campaign creation in 3 clear steps
- Campaign name is required and validated (max 100 chars)
- All HouseRules fields are configurable with sensible defaults
- A 6-character join code is generated automatically (no ambiguous characters)
- "Use Standard Rules" button pre-fills all house rules with 5e defaults
- Campaign is persisted via API and appears in the campaign list
- After creation, user is navigated to the new campaign's dashboard
- Success toast confirms campaign creation

## Testing Requirements

### Unit Tests (Vitest)
_For pure functions, calculations, data transforms, utilities, type guards, validators_

- `should generate a 6-character alphanumeric join code with no ambiguous characters (0, O, 1, I, L)`
- `should validate campaign name is required and max 100 characters`
- `should validate description max length of 2000 characters`
- `should populate standard 5e defaults when "Use Standard Rules" is invoked`

### Functional Tests (React Testing Library)
_For component rendering, user interactions, state changes, prop variations_

- `should render a 3-step modal with step indicators (Basic Info, House Rules, Invite Setup)`
- `should prevent advancing from Step 1 when campaign name is empty`
- `should display all HouseRules fields in Step 2 with correct defaults`
- `should render the auto-generated join code and "Copy Code" button in Step 3`
- `should fill all house rules with 5e defaults when "Use Standard Rules" button is clicked`
- `should call createCampaign store action with correct data on "Create Campaign" click`
- `should show success toast "Campaign '[name]' created!" after successful creation`

### E2E Tests (Playwright)
_For critical user journeys, multi-step flows, full-page interactions_

- `should complete full campaign creation flow from opening modal to navigating to dashboard`
- `should persist created campaign via API and display it in campaign list`

### Test Dependencies
- MSW (Mock Service Worker) API mocking for campaign creation endpoint
- Mock React Router navigation (useNavigate)
- Toast notification mock
- shadcn/ui modal and form component stubs

## Identified Gaps

- **Error Handling**: No specification for duplicate campaign name handling or joinCode collision detection
- **Loading/Empty States**: No loading indicator specified during campaign save via API
- **Accessibility**: No keyboard navigation spec for multi-step modal (Tab order, Enter to advance, Escape to close)
- **Mobile/Responsive**: No mobile layout specified for the multi-step modal
- **Edge Cases**: Behavior when user navigates away mid-creation (data loss warning not specified)

## Dependencies

- Story 33.1 — Campaign data model, API endpoints, and React Query hooks must be in place
- Phase 3 — Toast notification pattern and modal component patterns

## Notes

- The join code is generated server-side and stored on the campaign. The backend validates join codes and resolves them to the correct campaign.
- The "Use Standard Rules" button is important for DMs who want to quickly create a campaign without configuring every setting.
- Consider step validation: don't allow proceeding to Step 2 if Step 1 has validation errors.
