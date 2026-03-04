# Story 4.6 — Currency & Inventory Calculations

> **Epic 4: Calculation Engine** | **Phase 1: Foundation** (Weeks 1-2)

## Description
As a developer, I need currency conversion and inventory weight tracking functions.

## Technical Context
- **App**: D&D Character Forge — full-stack Django + React web application for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, React Query (server state), Zustand (UI state), Django REST Framework, PostgreSQL, React Router
- **Architecture**: Django REST API backend, React SPA frontend, PostgreSQL persistence, Django session auth
- **Domain**: D&D 5th Edition SRD — 9 races (with subraces), 12 classes (with subclasses), ability scores, skills, spells, equipment, backgrounds, feats
- **Currency system**: 5 denominations — CP (copper), SP (silver), EP (electrum), GP (gold), PP (platinum)
  - Conversion rates (all in CP as base unit): PP = 1000 CP, GP = 100 CP, EP = 50 CP, SP = 10 CP, CP = 1
  - Direct conversions: 1 PP = 10 GP, 1 GP = 10 SP, 1 GP = 2 EP, 1 SP = 10 CP, 1 EP = 5 SP
  - Currency conversions should handle fractional results appropriately (e.g., 150 CP = 1 GP + 5 SP or 1 GP + 50 CP)
- **Total wealth**: Sum of all currency converted to GP equivalent for display purposes
- **Inventory weight**: Sum of (item weight x item quantity) for all equipment items. Weight is in pounds (lbs)
- **Starting gold**: Alternative to starting equipment packs. Each class has a dice formula:
  - Barbarian: 2d4 x 10 gp, Bard: 5d4 x 10 gp, Cleric: 5d4 x 10 gp, Druid: 2d4 x 10 gp
  - Fighter: 5d4 x 10 gp, Monk: 5d4 gp (no multiplier!), Paladin: 5d4 x 10 gp, Ranger: 5d4 x 10 gp
  - Rogue: 4d4 x 10 gp, Sorcerer: 3d4 x 10 gp, Warlock: 4d4 x 10 gp, Wizard: 4d4 x 10 gp
  - The `rollStartingGold()` function parses a dice formula string like "5d4x10" and rolls it using the dice engine

## Tasks
- [ ] **T4.6.1** — Implement `convertCurrency(amount: number, from: CurrencyUnit, to: CurrencyUnit): number`
- [ ] **T4.6.2** — Implement `getTotalWealth(currency: Currency): number` — convert everything to GP equivalent
- [ ] **T4.6.3** — Implement `getTotalInventoryWeight(equipment: EquipmentItem[]): number`
- [ ] **T4.6.4** — Implement `rollStartingGold(classId: string): number` — roll the class's starting gold dice formula
- [ ] **T4.6.5** — Write unit tests: convert 150 CP -> 1 GP + 5 SP, total wealth calculation, weight calculation for a sample inventory

## Acceptance Criteria
- `convertCurrency()` correctly converts between any two currency denominations
- `getTotalWealth()` returns the GP-equivalent sum of all currency types
- `getTotalInventoryWeight()` correctly sums weights for all equipment items, accounting for quantity
- `rollStartingGold()` correctly parses and rolls each class's formula, including Monk's special case (5d4 without multiplier)
- Unit tests verify conversions, wealth totals, weight calculations, and starting gold ranges

## Testing Requirements

### Unit Tests (Vitest)
_For pure functions, calculations, data transforms, utilities, type guards, validators_

- `should convert 100 CP to 1 GP via convertCurrency`
- `should convert 1 PP to 10 GP via convertCurrency`
- `should convert 50 CP to 1 EP via convertCurrency`
- `should return correct GP-equivalent total wealth via getTotalWealth`
- `should sum item weights accounting for quantity via getTotalInventoryWeight`
- `should multiply weight by quantity (20 arrows at 0.05 lbs = 1 lb) via getTotalInventoryWeight`
- `should return 0 weight for empty inventory via getTotalInventoryWeight`
- `should roll starting gold for Barbarian (2d4x10 = 20-80 GP range) via rollStartingGold`
- `should roll starting gold for Monk (5d4 = 5-20 GP, no multiplier) via rollStartingGold`
- `should parse dice formula with and without multiplier via rollStartingGold`

### Test Dependencies
- Currency, CurrencyAmount, EquipmentItem types from Story 2.4
- CURRENCY_CONVERSION_RATES from Story 2.4
- Starting gold data from Story 3.4
- Dice engine from Story 7.1

## Identified Gaps

- **Edge Cases**: convertCurrency with fractional results (e.g., 3 CP to GP = 0.03 GP) — rounding behavior not specified
- **Edge Cases**: EP (electrum) conversion has odd ratios (1 EP = 5 SP) that can produce awkward fractions

## Dependencies
- **Depends on:** Story 2.4 (Currency, CurrencyAmount, EquipmentItem, CURRENCY_CONVERSION_RATES types), Story 3.4 (starting gold data), Story 3.7 (currency conversion rates constant), Story 7.1 (dice engine for rolling starting gold)
- **Blocks:** Story 4.3 (encumbrance calculation uses inventory weight), Story 4.8 (validation checks equipment weight vs capacity)

## Notes
- The `convertCurrency` function should return a precise number. The calling code can decide how to round or split into denominations
- `getTotalWealth` converts everything to GP for a single-number display. Formula: (PP x 10) + GP + (EP x 0.5) + (SP x 0.1) + (CP x 0.01)
- Monk's starting gold formula is "5d4" (no x10 multiplier), producing 5-20 GP. This is intentionally very low compared to other classes
- Items with `quantity > 1` should have their weight multiplied by quantity (e.g., 20 arrows at 0.05 lbs each = 1 lb)
- Consider adding a utility to auto-convert a pile of mixed coins into the most efficient denomination (minimize total coins)
- EP (electrum pieces) are often ignored by players and DMs. The system should support them but they are rarely used in practice
