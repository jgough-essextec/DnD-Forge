# Story 17.10 — Proficiency Bonus Display

> **Epic 17: Character Sheet — Page 1 (Core Stats)** | **Phase 3: Character Sheet & Management** (Weeks 5-6)

## Description
As a player, I need my proficiency bonus prominently shown and accurately computed from my level.

## Technical Context
- **App**: D&D Character Forge — full-stack Django + React web application for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, React Query (server state), Zustand (UI state), Django REST Framework, PostgreSQL, React Router
- **Architecture**: Django REST API backend, React SPA frontend, PostgreSQL persistence, Django session auth
- **Prior Phases Available**: Phase 1 (types, SRD data, calculation engine, database, state stores, dice engine), Phase 2 (character creation wizard — guided and freeform modes)
- **Proficiency Bonus Computation**: ceil(level / 4) + 1. Level 1-4: +2, Level 5-8: +3, Level 9-12: +4, Level 13-16: +5, Level 17-20: +6
- **Display Position**: In the left column, between the Inspiration toggle and the saving throws list
- **Impact**: Proficiency bonus is used in attack rolls, saving throws, skill checks (when proficient), spell save DC, and spell attack bonus. Changing level triggers recalculation of all proficiency-dependent values
- **Edit Mode**: Not directly editable (always computed from level). Manual override available with warning

## Tasks
- [ ] **T17.10.1** — Display the proficiency bonus in the left column between the Inspiration toggle and the saving throws list. Large "+N" in a circle badge. Computed from level: ceil(level/4)+1
- [ ] **T17.10.2** — Tooltip: "Proficiency Bonus: +N (Level N character). Added to attacks, saves, and skills you're proficient in."
- [ ] **T17.10.3** — **Edit mode:** not directly editable (always computed from level). If the user needs a custom value, they can use the manual override toggle which displays a warning

## Acceptance Criteria
- Proficiency bonus displays as a large "+N" in a circle badge in the left column
- Position is between the Inspiration toggle and saving throws list
- Value is correctly computed from character level using ceil(level/4)+1
- Tooltip explains what the proficiency bonus is and what it applies to
- Proficiency bonus is not directly editable in edit mode (computed from level)
- Manual override toggle is available with a visible warning indicator

## Testing Requirements

### Unit Tests (Vitest)
_For pure functions, calculations, data transforms, utilities, type guards, validators_

- `should compute proficiency bonus as +2 for levels 1-4`
- `should compute proficiency bonus as +3 for levels 5-8`
- `should compute proficiency bonus as +4 for levels 9-12`
- `should compute proficiency bonus as +5 for levels 13-16`
- `should compute proficiency bonus as +6 for levels 17-20`
- `should compute proficiency bonus using ceil(level/4)+1 formula`

### Functional Tests (React Testing Library)
_For component rendering, user interactions, state changes, prop variations_

- `should render proficiency bonus as large "+N" in a circle badge`
- `should position proficiency bonus between Inspiration toggle and saving throws list`
- `should display tooltip explaining proficiency bonus and what it applies to`
- `should not allow direct editing of proficiency bonus in edit mode`
- `should show manual override toggle with warning indicator in edit mode`

### Test Dependencies
- Mock character data at various levels (1, 5, 9, 13, 17)
- Mock calculation engine for proficiency bonus computation
- Mock view/edit mode context

## Identified Gaps

- **Accessibility**: No ARIA label for the proficiency bonus badge, no screen reader text for the tooltip content
- **Edge Cases**: No specification for level 0 or levels above 20 (boundary handling)

## Dependencies
- Phase 1 calculation engine for proficiency bonus computation
- Epic 20 view/edit mode toggle system

## Notes
- Proficiency bonus is one of the most important derived values — it appears in many calculations
- At level 1, proficiency bonus is always +2
- Manual override is for edge cases like homebrew rules; the warning ensures players know the value is overridden
- Changing character level (future feature) would cascade recalculation to all proficiency-dependent values
