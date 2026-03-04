# Story 11.3 — Point Buy Interface

> **Epic 11: Ability Score Step** | **Phase 2: Character Creation Wizard** (Weeks 3-4)

## Description

As a player using Point Buy, I need an interactive interface to allocate 27 points across my six abilities with live cost tracking. This story builds the Point Buy allocator with increment/decrement controls, real-time point tracking, cost table display, guardrails, racial bonus preview, and quick presets for common builds.

## Technical Context

- **App**: D&D Character Forge — full-stack Django + React web application for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, React Query (server state), Zustand (UI state), Django REST Framework, PostgreSQL, React Router
- **Architecture**: Django REST API backend, React SPA frontend, PostgreSQL persistence, Django session auth
- **Phase 1 Foundation Available**: Type system, SRD game data (races, classes, spells, equipment, backgrounds, feats as static JSON), calculation engine, React Query API layer, Zustand stores (UI state), dice engine
- **Point Buy Rules**:
  - 27 total points to spend
  - All abilities start at 8
  - Minimum score: 8, Maximum score: 15 (before racial bonuses)
  - Cost table (cumulative):
    | Score | Total Cost | Marginal Cost |
    |-------|-----------|---------------|
    | 8 | 0 | - |
    | 9 | 1 | 1 |
    | 10 | 2 | 1 |
    | 11 | 3 | 1 |
    | 12 | 4 | 1 |
    | 13 | 5 | 1 |
    | 14 | 7 | 2 |
    | 15 | 9 | 2 |
- **Racial Bonuses**: Displayed as a separate "+N" column alongside the base (purchased) score. Final total and modifier are clearly distinguished from the base
- **Quick Presets**:
  - "Balanced": 13, 13, 13, 12, 12, 12 (27 pts)
  - "Min-Max Caster": 8, 14, 14, 15, 8, 8 (27 pts, customized to class primary)
  - "MAD Build": 15, 14, 13, 10, 10, 8 (balanced for multi-ability-dependent classes)

## Tasks

- [ ] **T11.3.1** — Create `components/wizard/ability/PointBuyAllocator.tsx` — displays all six abilities in a column, each with a current score value, increment (+) and decrement (-) buttons, the ability modifier, and the racial bonus preview
- [ ] **T11.3.2** — Implement point cost tracking: display "Points Remaining: N / 27" prominently at the top. As the user adjusts scores, the counter updates in real-time. Color-code: green when points remain, gold at exactly 0, red if negative (should not be reachable)
- [ ] **T11.3.3** — Enforce guardrails: minimum score 8 (decrement button disabled at 8), maximum score 15 (increment button disabled at 15), and insufficient points disables the increment button for scores that would exceed remaining points
- [ ] **T11.3.4** — Show the point cost for each score level next to the slider/counter. Use the cost table: 8=0, 9=1, 10=2, 11=3, 12=4, 13=5, 14=7, 15=9. Highlight the marginal cost of the next increment (e.g., "Going from 13 to 14 costs 2 points")
- [ ] **T11.3.5** — Show racial bonuses as a separate "+N" column with the final total and modifier clearly distinguished from the base (purchased) score
- [ ] **T11.3.6** — Add "Quick Presets" dropdown for common builds: "Balanced" (13, 13, 13, 12, 12, 12 — 27 pts), "Min-Max Caster" (8, 14, 14, 15, 8, 8 — 27 pts customized to class), "MAD Build" (15, 14, 13, 10, 10, 8 — balanced for multi-ability classes)
- [ ] **T11.3.7** — Validate: all 27 points must be spent (or allow saving with fewer points spent and a warning)

## Acceptance Criteria

- All six abilities are displayed with current score, increment/decrement buttons, modifier, and racial bonus
- "Points Remaining: N / 27" counter updates in real-time with color coding (green/gold/red)
- Decrement button is disabled when score is 8; increment button is disabled when score is 15 or insufficient points
- Point cost table is visible next to each ability with marginal cost highlighted
- Racial bonuses appear as a separate "+N" column with final total and modifier clearly separated from base score
- Quick Presets dropdown auto-fills all six scores with preset values
- Validation warns if all 27 points are not spent but allows saving with a warning

## Testing Requirements

### Unit Tests (Vitest)
_For pure functions, calculations, data transforms, utilities, type guards, validators_

- `should compute correct point cost for each score level (8=0, 9=1, 10=2, 11=3, 12=4, 13=5, 14=7, 15=9)`
- `should compute total points spent from a set of 6 ability scores`
- `should validate that Balanced preset (13,13,13,12,12,12) totals exactly 27 points`
- `should validate that Min-Max Caster preset (8,14,14,15,8,8) totals exactly 27 points`
- `should validate that MAD Build preset (15,14,13,10,10,8) totals exactly 27 points`

### Functional Tests (React Testing Library)
_For component rendering, user interactions, state changes, prop variations_

- `should display all six abilities with current score, increment/decrement buttons, modifier, and racial bonus`
- `should update Points Remaining counter in real-time with color coding (green/gold/red)`
- `should disable decrement button when score is 8`
- `should disable increment button when score is 15 or insufficient points remain`
- `should show point cost table with marginal cost highlighted next to each ability`
- `should display racial bonuses as separate +N column with final total and modifier`
- `should auto-fill all six scores when Quick Preset is selected`
- `should warn if all 27 points are not spent but allow proceeding`

### E2E Tests (Playwright)
_For critical user journeys, multi-step flows, full-page interactions_

- `should allocate all 27 points across 6 abilities using increment/decrement buttons and see correct totals`
- `should apply Min-Max Caster preset for Wizard and see 15 assigned to INT`

### Test Dependencies
- Mock racial bonuses from wizard store
- Mock class data for preset customization
- Point buy cost table fixture

## Identified Gaps

- **Error Handling**: No specification for recovering from an impossible state (negative remaining points, though UI prevents it)
- **Accessibility**: No ARIA labels for increment/decrement buttons or points remaining counter
- **Performance**: No render performance criteria for real-time point tracking updates

## Dependencies

- **Depends on:** Story 11.1 (Method Selection — this renders when Point Buy is selected), Epic 9 Story 9.5 (racial ability bonuses), Epic 10 (class for preset customization)
- **Blocks:** Story 11.5 (summary uses allocated values), Story 11.6 (validation checks point spend)

## Notes

- The increment/decrement buttons should have a satisfying feel — consider subtle animation on value change
- The marginal cost display is important: going from 13 to 14 costs 2 points (not 1), and going from 14 to 15 also costs 2 points. This is a common source of confusion for new players
- Quick Presets should ideally be smart about class: "Min-Max Caster" should put 15 in the class's primary ability (INT for Wizard, WIS for Cleric, CHA for Sorcerer/Warlock/Bard)
- Consider showing a visual "spending bar" or chart showing how points are distributed across abilities
- The cost table is non-linear: scores 8-13 cost 1 point each (5 points for +5), but 14-15 cost 2 points each (4 points for +2). This creates an interesting decision: broad vs. focused investment
