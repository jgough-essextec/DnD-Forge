# Story 17.1 — Page 1 Layout Shell & Top Banner

> **Epic 17: Character Sheet — Page 1 (Core Stats)** | **Phase 3: Character Sheet & Management** (Weeks 5-6)

## Description
As a player viewing my character, I need to see the top banner with my character's name, class, level, race, background, alignment, XP, and player name — exactly where I'd expect them on a standard D&D sheet.

## Technical Context
- **App**: D&D Character Forge — full-stack Django + React web application for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, React Query (server state), Zustand (UI state), Django REST Framework, PostgreSQL, React Router
- **Architecture**: Django REST API backend, React SPA frontend, PostgreSQL persistence, Django session auth
- **Prior Phases Available**: Phase 1 (types, SRD data, calculation engine, database, state stores, dice engine), Phase 2 (character creation wizard — guided and freeform modes)
- **Page 1 Layout**: Top banner spans full width (40% name, 60% identity fields). Below: left column (~30% — ability scores, saves, skills), center column (~35% — combat stats, HP, attacks), right column (~35% — personality, features)
- **CharacterSheet.tsx** is the top-level controller that loads character data from the API, runs the calculation engine, and manages view/edit mode toggle. Renders three tab panels for the three sheet pages
- **SheetBanner.tsx** renders the identity fields in a specific 2-row x 3-column grid matching the official D&D 5e sheet layout
- **View mode**: clean text, no form controls. **Edit mode**: values become editable inputs/dropdowns
- **Font**: Cinzel for character name and headings (dark fantasy aesthetic)

## Tasks
- [ ] **T17.1.1** — Create `components/character/CharacterSheet.tsx` as the top-level character sheet controller. Accepts a `characterId` prop, loads the full character from the API via the `useCharacter` hook, runs the calculation engine to compute all derived values, and manages the view/edit mode toggle. Renders three tab panels: "Core Stats", "Backstory & Details", and "Spellcasting"
- [ ] **T17.1.2** — Create `components/character/page1/SheetBanner.tsx` — the top banner. **View mode:** character name in large Cinzel font (left-aligned, ~40% width), identity grid on the right (~60% width) with fields in a 2-row x 3-column layout: [Class & Level | Background | Player Name] / [Race | Alignment | Experience Points]. Each field has a muted label above the value. **Edit mode:** each value becomes an editable input or dropdown
- [ ] **T17.1.3** — Class & Level display: show "Level N [Subclass] [Class]" (e.g., "Level 1 Champion Fighter"). For multiclass (future), show each class/level. In edit mode, this opens the class/subclass/level editors
- [ ] **T17.1.4** — XP display: show current XP and next-level threshold in parentheses (e.g., "300 / 900"). In edit mode, XP is a numeric input. Show an XP progress bar subtly below the number
- [ ] **T17.1.5** — Add a character avatar/portrait thumbnail to the far left of the banner (circular, 64px). Clicking it in edit mode opens the avatar upload dialog. In view mode, it serves as visual identification

## Acceptance Criteria
- CharacterSheet loads character data from the API and renders the top banner with all identity fields
- The banner layout matches the official D&D 5e sheet: character name on the left, identity grid on the right
- Class & Level displays in the format "Level N [Subclass] [Class]"
- XP shows current/threshold with a progress bar
- Avatar thumbnail displays in the banner (circular, 64px)
- View mode shows clean text; edit mode shows editable inputs and dropdowns
- Three tab panels are available: Core Stats, Backstory & Details, Spellcasting

## Testing Requirements

### Unit Tests (Vitest)
_For pure functions, calculations, data transforms, utilities, type guards, validators_

- `should compute class display string as "Level N [Subclass] [Class]" from character data`
- `should compute XP progress percentage from current XP and level threshold`
- `should format XP display as "current / threshold" string`

### Functional Tests (React Testing Library)
_For component rendering, user interactions, state changes, prop variations_

- `should render CharacterSheet with three tab panels (Core Stats, Backstory & Details, Spellcasting)`
- `should load character data from the API and display banner fields (name, class, level, race, background, alignment, XP, player name)`
- `should render SheetBanner with character name on the left and identity grid on the right`
- `should display class and level in the format "Level N [Subclass] [Class]"`
- `should show XP with current/threshold and a progress bar`
- `should display avatar thumbnail as circular 64px image in the banner`
- `should render clean text in view mode with no form controls visible`
- `should render editable inputs and dropdowns in edit mode`
- `should switch between tab panels when tabs are clicked`
- `should handle empty XP gracefully (XP = 0 at level 1)`

### E2E Tests (Playwright)
_For critical user journeys, multi-step flows, full-page interactions_

- `should navigate to character sheet, display banner, and switch between all three tabs`
- `should toggle between view and edit mode and verify banner fields become editable`

### Test Dependencies
- Mock character data fixture with all identity fields populated
- Mock character data fixture with minimal/empty fields (empty XP, no subclass)
- Mock `useCharacter` hook returning character data from the API
- Mock calculation engine for derived values
- Mock view/edit mode context

## Identified Gaps

- **Error Handling**: No specification for what happens if character data fails to load from the API (loading error state)
- **Loading/Empty States**: No loading spinner or skeleton specified while character data is being fetched
- **Accessibility**: No ARIA labels specified for tab panels, banner fields, or avatar image alt text
- **Performance**: No render time targets for initial character sheet load

## Dependencies
- Phase 1 calculation engine for computing derived values
- Phase 2 character data stored in the database
- Epic 20 view/edit mode toggle system
- Epic 23 avatar system for the portrait thumbnail

## Notes
- The CharacterSheet component is the main entry point for displaying a character — it orchestrates all three pages
- The banner must handle empty states gracefully for fields that may not be filled yet (e.g., XP = 0 at level 1)
- The official 5e sheet has very specific spatial conventions players are trained to expect
