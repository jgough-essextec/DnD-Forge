# Epic 13: Equipment Selection Step
> **Phase 2: Character Creation Wizard** (Weeks 3-4)

## Summary

A two-mode equipment selection experience -- choosing from class/background starting equipment packages, or rolling gold and buying gear from the equipment catalog -- that properly populates the character's inventory, weapons, and armor. Handles nested equipment choices (e.g., "a martial weapon" requiring drill-down into weapon list), equipment pack expansion, AC computation from armor selection, and carrying capacity tracking.

## Stories

| # | Story | Tasks | Description |
|---|-------|-------|-------------|
| 13.1 | Starting Equipment Packages | 7 | Class starting equipment choice groups with nested item pickers (weapon/armor drill-down), background equipment display, inventory summary panel |
| 13.2 | Gold Buy Mode | 7 | Roll starting gold, full equipment catalog browser (tabbed by category), shopping cart with quantity/cost tracking, equipment pack expansion, gold limit enforcement |
| 13.3 | Equipment Step Validation & State | 4 | Validation of equipment selections, persistence of inventory, carrying capacity computation, AC determination from armor |

## Technical Scope

- **EquipmentStep.tsx** — Step 5 container with mode toggle (Starting Equipment vs. Gold Buy)
- **StartingEquipmentSelector.tsx** — Renders class equipment choice groups with radio options
- **WeaponPicker.tsx** — Searchable/filterable weapon catalog with damage, properties, weight
- **ArmorPicker.tsx** — Armor catalog with AC computation based on player's DEX
- **GoldBuyMode.tsx** — Two-panel layout: equipment catalog + shopping cart
- Equipment catalog with tabbed categories (Weapons, Armor, Gear, Tools, Packs)
- Shopping cart with quantity adjusters, running cost/weight totals
- Dice engine for starting gold rolls
- Calculation engine for AC computation from equipped armor + shield
- Carrying capacity computation (STR x 15)
- SRD equipment data (static JSON from Phase 1)

## Dependencies

- **Depends on:** Epic 8 (Wizard Shell), Epic 10 (class determines starting equipment options and gold formula), Epic 11 (DEX for AC computation, STR for carrying capacity), Epic 12 (background equipment), Phase 1 SRD equipment data, Phase 1 dice engine, Phase 1 calculation engine
- **Blocks:** Epic 15 (review displays equipment, computes AC, shows inventory weight)
