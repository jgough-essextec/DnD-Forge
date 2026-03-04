# Story 46.2 — Empty States

> **Epic 46: Final Polish & UX Refinements** | **Phase 6: Polish & Export** (Weeks 11-12)

## Description

As a new user or a DM with a fresh campaign, I need helpful empty states that guide me on what to do next. This story covers auditing and implementing empty states across the entire app — each with an illustrative icon or graphic, a descriptive message, and a primary action call-to-action.

## Technical Context

- **App**: D&D Character Forge — local-first React PWA for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, Zustand (state), Dexie.js (IndexedDB), React Router, jsPDF (PDF export), Playwright (E2E testing)
- **Architecture**: No backend, pure client-side, offline-capable PWA, IndexedDB for persistence
- **Prior Phases Available**: Phases 1-5 (complete character creation, sheet display, session play, DM/campaign features)
- **Performance Targets**: Bundle <500KB, FCP <1.5s, TTI <3s, Lighthouse >90
- **Accessibility Target**: WCAG 2.1 AA compliance
- **Empty State Design Pattern**: Each empty state has three components:
  1. An illustrative icon or graphic (from lucide-react icon set or custom SVG)
  2. A descriptive message explaining the current state
  3. A primary action CTA button that guides the user to the next step
- **10+ Empty States to Cover**:
  - Gallery: No characters
  - Campaign list: No campaigns
  - Campaign party: No characters in campaign
  - Session log: No sessions
  - NPC tracker: No NPCs
  - Loot tracker: No loot
  - Roll history: No rolls
  - Encounter list: No encounters
  - Spell page (non-caster): No spellcasting
  - DM notes: No notes

## Tasks

- [ ] **T46.2.1** — Audit all empty states across the app and ensure each has: an illustrative icon or graphic, a descriptive message, and a primary action CTA. States to cover:
  - Gallery: "No characters yet" -> "Create Your First Character"
  - Campaign list: "No campaigns yet" -> "Create Your First Campaign"
  - Campaign party: "No characters in this campaign" -> "Add Characters"
  - Session log: "No sessions recorded" -> "Add Your First Session"
  - NPC tracker: "No NPCs tracked" -> "Add an NPC"
  - Loot tracker: "No loot recorded" -> "Add Loot"
  - Roll history: "No rolls yet" -> "Roll some dice!"
  - Encounter list: "No encounters yet" -> "Start an Encounter"
  - Spell page (non-caster): "This character doesn't cast spells" -> (no action)
  - DM notes: "No DM notes for this character" -> "Add Notes"

## Acceptance Criteria

- All 10+ zero-content views in the app have an empty state design
- Each empty state includes an illustrative icon or graphic
- Each empty state includes a descriptive message explaining the zero-content state
- Each empty state includes a primary action CTA button (where an action is available)
- Gallery empty state shows "No characters yet" with "Create Your First Character" button that navigates to the creation wizard
- Campaign list empty state shows "No campaigns yet" with "Create Your First Campaign" button
- Campaign party empty state shows "No characters in this campaign" with "Add Characters" button
- Session log empty state shows "No sessions recorded" with "Add Your First Session" button
- NPC tracker empty state shows "No NPCs tracked" with "Add an NPC" button
- Loot tracker empty state shows "No loot recorded" with "Add Loot" button
- Roll history empty state shows "No rolls yet" with "Roll some dice!" button that opens the dice roller
- Encounter list empty state shows "No encounters yet" with "Start an Encounter" button
- Spell page for non-casters shows "This character doesn't cast spells" (no action button)
- DM notes empty state shows "No DM notes for this character" with "Add Notes" button
- Empty states are visually consistent across the app (same icon style, typography, spacing)
- CTA buttons navigate to or trigger the appropriate action

## Testing Requirements

### Functional Tests (React Testing Library)
_For component rendering, user interactions, state changes, prop variations_

- `should render gallery empty state with icon, "No characters yet" message, and "Create Your First Character" CTA`
- `should render campaign list empty state with icon, "No campaigns yet" message, and "Create Your First Campaign" CTA`
- `should render campaign party empty state with "No characters in this campaign" and "Add Characters" CTA`
- `should render session log empty state with "No sessions recorded" and "Add Your First Session" CTA`
- `should render NPC tracker empty state with "No NPCs tracked" and "Add an NPC" CTA`
- `should render loot tracker empty state with "No loot recorded" and "Add Loot" CTA`
- `should render roll history empty state with "No rolls yet" and "Roll some dice!" CTA that opens dice roller`
- `should render encounter list empty state with "No encounters yet" and "Start an Encounter" CTA`
- `should render spell page empty state as "This character doesn't cast spells" with no action button`
- `should render DM notes empty state with "No DM notes for this character" and "Add Notes" CTA`
- `should navigate to correct action when CTA button is clicked in each empty state`

### E2E Tests (Playwright)
_For critical user journeys, multi-step flows, full-page interactions_

- `should display gallery empty state for a new user with no characters and navigate to wizard on CTA click`
- `should display consistent empty state styling (icon, typography, spacing) across all zero-content views`

### Test Dependencies
- Empty IndexedDB state for all zero-content views
- Non-caster character fixture for spell page empty state
- Empty campaign fixture for campaign-related empty states
- Navigation verification for CTA button actions

## Identified Gaps

- **Accessibility**: Empty state CTA buttons need proper ARIA labels and focus management — not specified
- **Mobile/Responsive**: Empty state layout on mobile (360px) not specified — centering and spacing may need adjustment
- **Edge Cases**: Empty state briefly showing before data loads (race condition with skeleton screens) not addressed

## Dependencies

- All Phase 1-5 features complete (empty states span the entire app)

## Notes

- Use lucide-react icons for the illustrative graphics — they're already in the project and lightweight
- Suggested icons: Sword (gallery), Shield (campaign), Users (party), BookOpen (session), UserCircle (NPC), Gem (loot), Dice (roll history), Swords (encounter), Wand (spells), StickyNote (DM notes)
- The spell page empty state is unique — it's not a "nothing here yet" state but a "this feature doesn't apply" state. It should look informational rather than actionable
- Empty states should be centered vertically and horizontally in their container
- Consider adding a subtle background illustration or watermark behind the empty state message for visual interest
