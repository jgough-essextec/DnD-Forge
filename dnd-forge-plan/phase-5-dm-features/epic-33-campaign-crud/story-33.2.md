# Story 33.2 — Create Campaign Flow

> **Epic 33: Campaign CRUD & Data Model** | **Phase 5: DM Features** (Weeks 9-10)

## Description

As a DM, I need to create a new campaign with a name, description, house rules, and optional starting parameters so my players know what to expect.

## Technical Context

- **App**: D&D Character Forge — local-first React PWA for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, Zustand (state), Dexie.js (IndexedDB), React Router
- **Architecture**: No backend, pure client-side, offline-capable PWA, IndexedDB for persistence. DM role is local (no authentication), campaigns are local data with join codes as local import mechanism.
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

**Join Code generation** (Step 3): 6-character alphanumeric code (uppercase, no ambiguous chars like 0/O, 1/I/L). Join codes are a local import mechanism — without a backend, the code resolves only against the local campaign database. The shareable URL format is `/join/[code]`.

**Campaign data** is saved to IndexedDB via the Zustand store from Story 33.1. The `dmId` is set to the local persistent userId.

## Tasks

- [ ] **T33.2.1** — Create `components/dm/CreateCampaignModal.tsx` — a multi-step modal (3 steps): (1) Basic Info, (2) House Rules, (3) Invite Setup
- [ ] **T33.2.2** — **Step 1 — Basic Info:** Campaign name (required, max 100 chars), description (optional, markdown-lite, max 2000 chars), campaign setting/theme tag (optional: "Forgotten Realms", "Homebrew", "Eberron", or custom text)
- [ ] **T33.2.3** — **Step 2 — House Rules:** Form with all HouseRules fields: allowed sources (multi-select checkboxes), ability score method (radio group), starting level (number 1-20, default 1), HP method (radio group), allow feats (toggle, default true), allow multiclass (toggle, default true), encumbrance rule (dropdown), critical hit rule (dropdown), custom notes (textarea)
- [ ] **T33.2.4** — **Step 3 — Invite Setup:** auto-generate a 6-character alphanumeric join code (uppercase, no ambiguous chars like 0/O, 1/I/L). Display prominently with "Copy Code" button. Also generate a shareable URL: `/join/[code]`. Show: "Share this code with your players so they can join the campaign"
- [ ] **T33.2.5** — "Create Campaign" button: validates all fields, saves to IndexedDB, navigates to the new campaign's dashboard. Success toast: "Campaign '[name]' created!"
- [ ] **T33.2.6** — Pre-populate defaults for a quick-start: house rules all set to standard 5e defaults. "Use Standard Rules" button fills all defaults instantly

## Acceptance Criteria

- Multi-step modal guides the DM through campaign creation in 3 clear steps
- Campaign name is required and validated (max 100 chars)
- All HouseRules fields are configurable with sensible defaults
- A 6-character join code is generated automatically (no ambiguous characters)
- "Use Standard Rules" button pre-fills all house rules with 5e defaults
- Campaign is saved to IndexedDB and appears in the campaign list
- After creation, user is navigated to the new campaign's dashboard
- Success toast confirms campaign creation

## Dependencies

- Story 33.1 — Campaign data model, Zustand store, and IndexedDB schema must be in place
- Phase 3 — Toast notification pattern and modal component patterns

## Notes

- The join code is generated locally and stored on the campaign. It has no backend resolution — it only matches campaigns in the same local IndexedDB. This scaffolds the future backend flow.
- The "Use Standard Rules" button is important for DMs who want to quickly create a campaign without configuring every setting.
- Consider step validation: don't allow proceeding to Step 2 if Step 1 has validation errors.
