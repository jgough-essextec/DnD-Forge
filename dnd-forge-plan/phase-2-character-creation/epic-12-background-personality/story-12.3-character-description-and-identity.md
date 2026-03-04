# Story 12.3 — Character Description & Identity

> **Epic 12: Background & Personality Step** | **Phase 2: Character Creation Wizard** (Weeks 3-4)

## Description

As a player, I need to enter my character's name, physical appearance, and alignment. This story builds the character description form with name (with random generation), alignment 3x3 grid selector, physical appearance fields with race-appropriate placeholders, appearance notes, backstory, and allies/organizations text areas.

## Technical Context

- **App**: D&D Character Forge — full-stack Django + React web application for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, React Query (server state), Zustand (UI state), Django REST Framework, PostgreSQL, React Router
- **Architecture**: Django REST API backend, React SPA frontend, PostgreSQL persistence, Django session auth
- **Phase 1 Foundation Available**: Type system, SRD game data (races, classes, spells, equipment, backgrounds, feats as static JSON), calculation engine, React Query API layer, Zustand stores (UI state), dice engine
- **Character Name**: Prominent text input. Pre-populated if name was entered in the Intro Step (Story 8.2). "Random Name" button generates a race-appropriate name from simple name tables per race (20-30 names per race)
- **Alignment**: A 3x3 clickable grid:
  |  | Lawful | Neutral | Chaotic |
  |--|--------|---------|---------|
  | Good | Lawful Good | Neutral Good | Chaotic Good |
  | Neutral | Lawful Neutral | True Neutral | Chaotic Neutral |
  | Evil | Lawful Evil | Neutral Evil | Chaotic Evil |
  Plus an "Unaligned" option below the grid. Each cell has a tooltip with a brief description
- **Physical Appearance Fields**: Age, Height, Weight, Eye Color, Hair Color, Skin Color — all freeform text inputs with race-typical ranges as placeholder text:
  - Elf: Age "100-750 years", Height "5'0\"-6'0\"", Weight "100-145 lbs"
  - Dwarf: Age "50-350 years", Height "4'0\"-5'0\"", Weight "130-170 lbs"
  - Human: Age "18-80 years", Height "5'0\"-6'2\"", Weight "125-250 lbs"
  - (etc. for all races)
- **All Description Fields Are Optional**: Not required for wizard validation — can be filled in later in edit mode. Some may generate warnings (no character name) but not blocking errors

## Tasks

- [ ] **T12.3.1** — Create `components/wizard/background/CharacterDescription.tsx` — a form section for personal details
- [ ] **T12.3.2** — "Character Name" field: prominent text input. If the player already entered a name in the Intro Step, pre-populate it. Add a "Random Name" button that generates a race-appropriate name (use simple name tables per race)
- [ ] **T12.3.3** — "Alignment" selector: a 3x3 clickable grid (Lawful/Neutral/Chaotic x Good/Neutral/Evil). Clicking a cell selects it with a highlight. Each cell shows a tooltip with a brief description of what that alignment means. Include an "Unaligned" option below the grid
- [ ] **T12.3.4** — Physical appearance fields: Age, Height, Weight, Eye Color, Hair Color, Skin Color — as text inputs (freeform, not enforced). Show race-typical ranges as placeholder text (e.g., Elf age placeholder: "100-750 years")
- [ ] **T12.3.5** — "Appearance Notes" textarea: freeform description of distinguishing features, clothing, scars, etc.
- [ ] **T12.3.6** — "Backstory" textarea: large text area for the character's backstory narrative. Include a helper prompt: "Where did your character grow up? What event set them on the path of adventure? What do they hope to achieve?"
- [ ] **T12.3.7** — "Allies & Organizations" textarea: freeform field for faction memberships, mentors, allies
- [ ] **T12.3.8** — All description fields are optional for wizard validation (can be filled in later in edit mode)

## Acceptance Criteria

- Character Name field is prominent with pre-populated value from Intro Step if available
- "Random Name" button generates a race-appropriate name from a name table
- Alignment selector is a 3x3 clickable grid with tooltips for each alignment, plus an "Unaligned" option
- Physical appearance fields show race-typical placeholder text
- Appearance Notes, Backstory, and Allies text areas are large freeform text inputs
- Backstory includes a helper prompt
- All description fields are optional — the step can be validated without them
- Missing character name generates a warning (not an error) during validation

## Testing Requirements

### Unit Tests (Vitest)
_For pure functions, calculations, data transforms, utilities, type guards, validators_

- `should generate race-appropriate random names from name tables for each of the 9 races`
- `should return race-typical physical ranges as placeholder text for each race`

### Functional Tests (React Testing Library)
_For component rendering, user interactions, state changes, prop variations_

- `should render Character Name field prominently with pre-populated value from Intro Step if available`
- `should generate a race-appropriate name when Random Name button is clicked`
- `should render alignment selector as a 3x3 clickable grid with tooltips for each alignment`
- `should include Unaligned option below the alignment grid`
- `should render physical appearance fields (Age, Height, Weight, Eye Color, Hair Color, Skin Color) with race-typical placeholders`
- `should render Appearance Notes, Backstory, and Allies text areas as large freeform inputs`
- `should include helper prompt in Backstory textarea`
- `should treat all description fields as optional and pass step validation without them`
- `should generate a warning (not error) for missing character name during validation`

### E2E Tests (Playwright)
_For critical user journeys, multi-step flows, full-page interactions_

- `should enter character name, select Chaotic Good alignment, fill physical appearance, write backstory, and advance`
- `should generate random name for an Elf character and see an Elvish name`

### Test Dependencies
- Mock wizard store with pre-populated character name from Intro Step
- Mock race data for name generation tables and physical range placeholders
- Race-specific name table fixtures (20-30 names per race)

## Identified Gaps

- **Error Handling**: No specification for handling empty name tables per race
- **Edge Cases**: Random name generation with no race selected is not addressed
- **Accessibility**: No ARIA labels for alignment grid cells, tooltip accessibility for alignment descriptions
- **Performance**: Auto-saving textarea content on blur/change mentioned in notes but no debounce or frequency specified

## Dependencies

- **Depends on:** Story 12.1 (Background Selection — this is part of the same step), Story 8.2 (character name from Intro Step), Epic 9 Story 9.5 (race data for name generation and appearance placeholders)
- **Blocks:** Story 12.4 (validation includes character name warning), Epic 15 Stories 15.1-15.2 (review displays all description data)

## Notes

- **Random Name Tables**: Simple static arrays of 20-30 names per race. Examples:
  - Elf: Adran, Aelar, Arannis, Berrian, Enna, Galinndan, Hadarai, Immeral, Leshanna, Lia, Meriele...
  - Dwarf: Adrik, Baern, Bardryn, Brottor, Dain, Eberk, Falkrunn, Gurdis, Harbek, Kildrak...
  - Human: Generic fantasy names from various cultural backgrounds
- Alignment tooltips should be concise:
  - Lawful Good: "Acts with compassion and honor. Respects authority and tradition."
  - Chaotic Good: "Acts as their conscience directs. Kind-hearted but independent."
  - True Neutral: "Acts naturally without prejudice or compulsion."
  - (etc.)
- Race-typical physical ranges come from the PHB racial descriptions and are purely informational placeholders
- The backstory helper prompt should be inspiring but not overwhelming — 1-2 guiding questions is enough
- Consider auto-saving textarea content to the wizard store on blur/change to prevent losing long backstory entries
