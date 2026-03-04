# Story 18.4 — Currency Section

> **Epic 18: Character Sheet — Page 2 (Backstory & Details)** | **Phase 3: Character Sheet & Management** (Weeks 5-6)

## Description
As a player, I need to track my currency across all five denominations with auto-conversion.

## Technical Context
- **App**: D&D Character Forge — full-stack Django + React web application for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, React Query (server state), Zustand (UI state), Django REST Framework, PostgreSQL, React Router
- **Architecture**: Django REST API backend, React SPA frontend, PostgreSQL persistence, Django session auth
- **Prior Phases Available**: Phase 1 (types, SRD data, calculation engine, database, state stores, dice engine), Phase 2 (character creation wizard — guided and freeform modes)
- **Currency Denominations (D&D 5e)**: CP (Copper Pieces), SP (Silver Pieces), EP (Electrum Pieces), GP (Gold Pieces), PP (Platinum Pieces)
- **Conversion Rates**: 1 PP = 10 GP = 20 EP = 100 SP = 1000 CP
- **Always Editable**: Currency changes frequently during gameplay — the fields should be editable even in view mode (like current HP)
- **Starting Currency**: From the character creation wizard's equipment selection; typically a small amount of gold

## Tasks
- [ ] **T18.4.1** — Create `components/character/page2/CurrencyTracker.tsx` — five currency fields arranged horizontally: CP, SP, EP, GP, PP. Each shows the denomination icon/abbreviation and current amount
- [ ] **T18.4.2** — Always editable (even in view mode since currency changes frequently). +/- buttons for quick adjustment. Direct numeric input for larger changes
- [ ] **T18.4.3** — "Auto-Convert" toggle: when enabled, converts currency up automatically (e.g., 10 SP -> 1 GP). Show the conversion rates in a tooltip: "1 PP = 10 GP = 20 EP = 100 SP = 1000 CP"
- [ ] **T18.4.4** — Display total wealth in GP equivalent at the bottom: "Total: X.XX GP equivalent"

## Acceptance Criteria
- Five currency fields (CP, SP, EP, GP, PP) display horizontally with denomination labels
- All currency fields are always editable, even in view mode
- +/- buttons provide quick adjustment for each denomination
- Direct numeric input works for larger changes
- "Auto-Convert" toggle converts currency up automatically when enabled
- Conversion rates tooltip displays the full conversion table
- Total wealth in GP equivalent displays at the bottom
- Currency values persist via the API auto-save

## Testing Requirements

### Unit Tests (Vitest)
_For pure functions, calculations, data transforms, utilities, type guards, validators_

- `should compute total wealth in GP equivalent: (CP/100) + (SP/10) + (EP/5) + GP + (PP*10)`
- `should auto-convert currency up when enabled (10 SP -> 1 GP)`
- `should apply conversion rates correctly: 1 PP = 10 GP = 20 EP = 100 SP = 1000 CP`

### Functional Tests (React Testing Library)
_For component rendering, user interactions, state changes, prop variations_

- `should render five currency fields (CP, SP, EP, GP, PP) horizontally with denomination labels`
- `should always allow currency editing even in view mode`
- `should provide +/- buttons for quick adjustment on each denomination`
- `should allow direct numeric input for larger changes`
- `should toggle auto-convert on/off and convert currency up when enabled`
- `should display conversion rates tooltip on hover`
- `should display total wealth in GP equivalent at the bottom`
- `should persist currency changes via the API via auto-save`

### Test Dependencies
- Mock character data with starting currency
- Mock character data with zero currency (empty state)
- Mock auto-save system from Epic 20
- Mock view/edit mode context

## Identified Gaps

- **Error Handling**: No specification for negative currency values or non-numeric input
- **Edge Cases**: No specification for auto-convert behavior with Electrum (EP has awkward conversion: 2 EP = 1 GP)
- **Accessibility**: No ARIA labels for currency fields, no keyboard increment/decrement support

## Dependencies
- Phase 2 character data (starting currency from equipment selection)
- Epic 20 auto-save system for persisting currency changes

## Notes
- Electrum Pieces (EP) are often omitted by DMs but should still be available
- Currency is always editable because it changes constantly during gameplay (looting, shopping, quest rewards)
- The auto-convert feature is optional — some players prefer to track exact denominations
- Total wealth calculation: (CP/100) + (SP/10) + (EP/5) + GP + (PP*10)
