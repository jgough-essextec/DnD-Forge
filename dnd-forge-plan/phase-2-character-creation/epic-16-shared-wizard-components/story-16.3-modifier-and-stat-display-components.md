# Story 16.3 — Modifier & Stat Display Components

> **Epic 16: Shared Wizard Components & Utilities** | **Phase 2: Character Creation Wizard** (Weeks 3-4)

## Description

As a developer, I need consistent visual components for displaying ability scores, modifiers, and other recurring stat patterns. This story builds four display components: the classic D&D ability score block, proficiency dot indicator, dice notation renderer with click-to-roll, and color-coded modifier badge.

## Technical Context

- **App**: D&D Character Forge — full-stack Django + React web application for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, React Query (server state), Zustand (UI state), Django REST Framework, PostgreSQL, React Router
- **Architecture**: Django REST API backend, React SPA frontend, PostgreSQL persistence, Django session auth
- **Phase 1 Foundation Available**: Type system, SRD game data (races, classes, spells, equipment, backgrounds, feats as static JSON), calculation engine, React Query API layer, Zustand stores (UI state), dice engine
- **Component Usage Map**:
  - **AbilityScoreDisplay**: Ability Score Step (11.2, 11.3, 11.4, 11.5), Review Step (15.1), Freeform Mode (8.3)
  - **ProficiencyDot**: Skill list (15.1 — review), Saving throws (15.1 — review), Character sheet
  - **DiceNotation**: Hit die display, damage rolls, dice rolling interface (11.4), Equipment weapon damage (13.1)
  - **ModifierBadge**: Ability modifiers (11.5), Skill modifiers (15.1), Saving throw modifiers (15.1), Progress sidebar (11.6)
- **Design Pattern**: The classic D&D character sheet uses a specific visual language: hexagonal or rounded-square ability score blocks, filled/empty circles for proficiency, dice notation like "2d6 + 3", and +N/-N modifier badges. These components codify that visual language for consistent reuse

## Tasks

- [ ] **T16.3.1** — Create `components/shared/AbilityScoreDisplay.tsx` — the classic D&D ability score block: large modifier number on top (+3), smaller score below (16), ability abbreviation label (STR). Variant with racial bonus indicator
- [ ] **T16.3.2** — Create `components/shared/ProficiencyDot.tsx` — a small filled/empty circle indicating proficiency. Filled = proficient, double-filled = expertise, half-filled = half proficiency (Jack of All Trades)
- [ ] **T16.3.3** — Create `components/shared/DiceNotation.tsx` — renders dice notation (e.g., "2d6 + 3") with styled dice icons. Clicking the notation triggers a dice roll via the dice engine (wired to the dice store)
- [ ] **T16.3.4** — Create `components/shared/ModifierBadge.tsx` — displays a +N or -N modifier in a styled badge. Positive = green tint, zero = neutral, negative = red tint

## Acceptance Criteria

- AbilityScoreDisplay shows the modifier prominently (+3), score below (16), and ability label (STR) in a classic D&D block layout
- AbilityScoreDisplay variant shows racial bonus indicator when applicable
- ProficiencyDot renders as filled (proficient), double-filled (expertise), half-filled (half proficiency), or empty (not proficient)
- DiceNotation renders dice notation with styled dice icons and triggers a dice roll on click
- ModifierBadge displays +N/-N with color coding: green for positive, neutral for zero, red for negative
- All components are responsive and accessible
- All components use the app's dark fantasy visual theme

## Testing Requirements

### Unit Tests (Vitest)
_For pure functions, calculations, data transforms, utilities, type guards, validators_

- `should format modifier display correctly (+3 for positive, +0 for zero, -1 for negative)`
- `should map modifier values to correct color coding (positive=green, zero=neutral, negative=red)`
- `should parse dice notation strings (e.g., "2d6 + 3") for rendering`

### Functional Tests (React Testing Library)
_For component rendering, user interactions, state changes, prop variations_

- `should render AbilityScoreDisplay with modifier prominently (+3), score below (16), ability label (STR)`
- `should render AbilityScoreDisplay variant with racial bonus indicator when applicable`
- `should render ProficiencyDot as filled (proficient), double-filled (expertise), half-filled (Jack of All Trades), or empty`
- `should render DiceNotation with styled dice icons for notation like "2d6 + 3"`
- `should trigger dice roll via dice engine and display result in popup when DiceNotation is clicked`
- `should render ModifierBadge with +N/-N and correct color coding (green/neutral/red)`

### E2E Tests (Playwright)
_For critical user journeys, multi-step flows, full-page interactions_

- `should click DiceNotation "2d6+3", see animated roll result, and verify result stored in dice history`

### Test Dependencies
- Mock Phase 1 dice engine for click-to-roll testing
- Mock Phase 1 dice store for roll result storage
- Test fixtures for various modifier values, proficiency states, and dice notation strings

## Identified Gaps

- **Accessibility**: No ARIA labels for AbilityScoreDisplay block, ProficiencyDot states, or DiceNotation interactive element
- **Mobile/Responsive**: AbilityScoreDisplay block sizing on mobile not specified; DiceNotation click-to-roll popup positioning not defined
- **Performance**: DiceNotation click-to-roll popup should appear quickly but no latency target specified

## Dependencies

- **Depends on:** Phase 1 project scaffolding (React, TypeScript, Tailwind CSS), Phase 1 dice engine (for DiceNotation click-to-roll), Phase 1 dice store (for storing roll results)
- **Blocks:** Epics 11, 15 (ability score and review steps use these components heavily), Epic 8 Story 8.3 (freeform mode computed stats sidebar)

## Notes

- **AbilityScoreDisplay Layout**:
  ```
  ┌─────────┐
  │   +3    │  <- modifier (large, prominent)
  │  ─────  │
  │   16    │  <- total score (smaller)
  │   STR   │  <- ability abbreviation
  │  (+2)   │  <- racial bonus (if variant)
  └─────────┘
  ```
  The block should feel like a classic D&D character sheet element — consider a hexagonal or rounded border shape

- **ProficiencyDot Visual States**:
  - Empty circle: not proficient
  - Filled circle: proficient (+proficiency bonus)
  - Double circle (concentric): expertise (+2x proficiency bonus, Rogue/Bard feature)
  - Half-filled: half proficiency (Bard's Jack of All Trades — +half proficiency to non-proficient checks)

- **DiceNotation Click-to-Roll**: When clicked, the notation "2d6 + 3" should:
  1. Call the Phase 1 dice engine to roll the dice
  2. Display the result in a brief popup or toast (e.g., "Rolled 2d6+3: [4, 2] + 3 = 9")
  3. Store the result in the dice store for history

- **ModifierBadge Color Scale**: Consider a gradient: -3 or worse = deep red, -2 to -1 = light red, 0 = gray, +1 to +2 = light green, +3 or more = gold/bright green

- These components are foundational to the app's visual identity and will be used extensively in Phase 3 (character management) and beyond
