# Story 34.3 — Skill Proficiency Matrix

> **Epic 34: Campaign Dashboard & Party Overview** | **Phase 5: DM Features** (Weeks 9-10)

## Description

As a DM, I need to see which characters are proficient in which skills so I can quickly answer "Who has proficiency in Stealth?"

## Technical Context

- **App**: D&D Character Forge — full-stack Django + React web application for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, React Query (server state), Zustand (UI state), Django REST Framework, PostgreSQL, React Router
- **Architecture**: Django REST API backend, React SPA frontend, PostgreSQL persistence, Django session auth. DM role authenticated via Django User model, campaigns have owner FK with join codes for player association.
- **Prior Phases Available**: Phase 1-4 (full character creation, sheet display, session play features including dice roller, HP tracker, spell slots, conditions, rest, level up)

This story creates a skill proficiency matrix — a grid with characters as columns and the 18 D&D 5e skills as rows. Each cell shows the modifier and a proficiency indicator (empty/filled/double for expertise).

**The 18 skills grouped by ability score:**
- **STR:** Athletics
- **DEX:** Acrobatics, Sleight of Hand, Stealth
- **CON:** (none)
- **INT:** Arcana, History, Investigation, Nature, Religion
- **WIS:** Animal Handling, Insight, Medicine, Perception, Survival
- **CHA:** Deception, Intimidation, Performance, Persuasion

**Matrix features:**
- Highlight the highest modifier in each skill row with gold background (highlight all if tied)
- Column headers: character name rotated 45 degrees for space efficiency (desktop) with class icon
- Filter/search: text input to filter skill rows, "Show only proficient" toggle
- Clicking a cell triggers a skill check roll (integrates with Phase 4 dice roller)

**Mobile layout:** Pivot the matrix (characters as rows, skills as horizontal scrollable header) or switch to "Who has X?" search mode — type a skill name and see a ranked list of characters with their modifiers.

## Tasks

- [ ] **T34.3.1** — Create `components/dm/SkillMatrix.tsx` — a matrix table with characters as columns and the 18 skills as rows. Each cell shows the modifier and a proficiency indicator (empty/filled/double for expertise)
- [ ] **T34.3.2** — Highlight the highest modifier in each skill row with a gold background. If multiple characters tie, highlight all of them
- [ ] **T34.3.3** — Skill rows grouped by ability score with a subtle section header (STR skills, DEX skills, etc.)
- [ ] **T34.3.4** — Filter/search: text input above the matrix to filter skill rows. Also a toggle: "Show only proficient" that hides cells where the character has no proficiency
- [ ] **T34.3.5** — Column header: character name (rotated 45 degrees for space efficiency on desktop) with class icon
- [ ] **T34.3.6** — Mobile: pivot the matrix — characters as rows, skills as a horizontal scrollable header. Or switch to a "Who has X?" search mode: type a skill name and see a ranked list of characters with their modifiers
- [ ] **T34.3.7** — Clicking a cell triggers a skill check roll for that character (integrates with the Phase 4 dice roller)

## Acceptance Criteria

- Skill matrix displays 18 skills as rows and party characters as columns
- Each cell shows the skill modifier and proficiency indicator (none/proficient/expertise)
- Highest modifier per skill is highlighted with gold background (ties highlighted equally)
- Skills are grouped by ability score with section headers
- Filter/search input filters skill rows by name
- "Show only proficient" toggle hides non-proficient cells
- Column headers show character names rotated 45 degrees with class icons (desktop)
- Mobile layout pivots or provides "Who has X?" search mode
- Clicking a cell triggers a skill check roll via the Phase 4 dice roller

## Testing Requirements

### Unit Tests (Vitest)
_For pure functions, calculations, data transforms, utilities, type guards, validators_

- `should calculate correct skill modifiers based on ability scores and proficiency bonus`
- `should identify the highest modifier per skill row for gold highlighting (including ties)`
- `should group 18 skills correctly by ability score (STR, DEX, INT, WIS, CHA)`
- `should distinguish between no proficiency, proficiency, and expertise indicators`
- `should filter skill rows by search text input`

### Functional Tests (React Testing Library)
_For component rendering, user interactions, state changes, prop variations_

- `should render 18 skill rows and N character columns in the matrix`
- `should highlight highest modifier per skill with gold background, highlighting all ties`
- `should display skill rows grouped by ability score with section headers`
- `should filter skill rows when text is entered in search input`
- `should toggle "Show only proficient" to hide non-proficient cells`
- `should render column headers with rotated character names and class icons (desktop)`
- `should trigger skill check roll via dice roller when a cell is clicked`

### E2E Tests (Playwright)
_For critical user journeys, multi-step flows, full-page interactions_

- `should display the full skill matrix for a party and verify gold highlights on highest modifiers`
- `should use "Who has X?" search mode on mobile to find characters with highest Perception`
- `should click a skill cell and see a dice roll result from the Phase 4 dice roller`

### Test Dependencies
- Mock campaign with 3-5 characters with varied skill proficiencies and expertise
- Mock Phase 4 dice roller for skill check integration
- Character fixtures with known ability scores for deterministic modifier calculation

## Identified Gaps

- **Accessibility**: No ARIA grid roles or keyboard navigation for the matrix; no screen reader support for proficiency indicators
- **Mobile/Responsive**: Pivot layout vs "Who has X?" mode decision not finalized; breakpoint not defined
- **Performance**: No render time target for 144+ cells (8 characters x 18 skills); lazy rendering recommendation not confirmed
- **Edge Cases**: Behavior with 0 characters in campaign not specified for the matrix view

## Dependencies

- Story 34.1 — Campaign dashboard layout (Party tab host)
- Epic 33 Story 33.1 — Campaign data model with character resolution
- Phase 1-3 — Character skill proficiencies and ability scores
- Phase 4 — Dice roller (for skill check integration)

## Notes

- The skill matrix is one of the most valuable DM tools for quick reference during gameplay. "Who has the best Perception?" is a question asked constantly.
- The "Who has X?" mobile mode is particularly useful — it answers the DM's most common question pattern.
- Consider lazy rendering for the matrix cells if performance is an issue with 8+ characters (144+ cells).
- Expertise (double proficiency) should be visually distinct from regular proficiency (e.g., double-filled circle vs single-filled).
