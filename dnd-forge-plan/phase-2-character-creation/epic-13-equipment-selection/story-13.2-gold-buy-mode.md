# Story 13.2 — Gold Buy Mode

> **Epic 13: Equipment Selection Step** | **Phase 2: Character Creation Wizard** (Weeks 3-4)

## Description

As a player who prefers to buy equipment with gold, I need to roll starting gold and shop from the full equipment catalog. This story builds the gold buy mode with starting gold dice roll, a full tabbed equipment catalog, a shopping cart with quantity/cost/weight tracking, equipment pack expansion, gold limit enforcement, and quick-buy shortcuts.

## Technical Context

- **App**: D&D Character Forge — local-first React PWA for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, Zustand (state), Dexie.js (IndexedDB), React Router
- **Architecture**: No backend, pure client-side, offline-capable PWA, IndexedDB for persistence
- **Phase 1 Foundation Available**: Type system, SRD game data (races, classes, spells, equipment, backgrounds, feats as static JSON), calculation engine, Dexie.js database layer, Zustand stores, dice engine
- **Starting Gold by Class**:
  | Class | Starting Gold Dice |
  |-------|--------------------|
  | Barbarian | 2d4 x 10 gp |
  | Bard | 5d4 x 10 gp |
  | Cleric | 5d4 x 10 gp |
  | Druid | 2d4 x 10 gp |
  | Fighter | 5d4 x 10 gp |
  | Monk | 5d4 gp |
  | Paladin | 5d4 x 10 gp |
  | Ranger | 5d4 x 10 gp |
  | Rogue | 4d4 x 10 gp |
  | Sorcerer | 3d4 x 10 gp |
  | Warlock | 4d4 x 10 gp |
  | Wizard | 4d4 x 10 gp |
- **Equipment Catalog Categories**: Weapons, Armor & Shields, Adventuring Gear, Tools, Equipment Packs
- **Shopping Cart**: Items with quantity adjusters (+/-), individual cost, running total, total weight, "Remove" button. Shows "Remaining Gold: X GP" at top, color-coded (green positive, red negative)
- **Equipment Packs**: Bundles like Dungeoneer's Pack (12 GP), Explorer's Pack (10 GP), etc. Clicking a pack adds all individual items to the cart
- **Gold Limit**: Prevent exceeding available gold (disable "Add" buttons or show warning)
- **Quick-Buy**: "Essentials Kit" button adds common adventuring gear (backpack, bedroll, rations, rope, torch, waterskin)

## Tasks

- [ ] **T13.2.1** — Create `components/wizard/equipment/GoldBuyMode.tsx` — when toggled, replaces the starting equipment chooser with a two-panel layout: equipment catalog on the left, shopping cart on the right
- [ ] **T13.2.2** — Display the class's starting gold dice formula (e.g., "Fighter: 5d4 x 10 gp") with a "Roll Gold" button. Animate the dice roll and display the result prominently. Allow manual entry as an alternative (for DMs who set fixed starting gold)
- [ ] **T13.2.3** — Equipment catalog: tabbed interface with categories (Weapons, Armor & Shields, Adventuring Gear, Tools, Equipment Packs). Each tab shows a searchable, sortable table of items with name, cost, weight, and key properties
- [ ] **T13.2.4** — Shopping cart: list of selected items with quantity adjusters (+/-), individual and running total cost in GP, total weight, and a "Remove" button per item. Show "Remaining Gold: X GP" at the top, color-coded (green if positive, red if negative)
- [ ] **T13.2.5** — Implement equipment pack expansion: clicking a pack (e.g., "Dungeoneer's Pack -- 12 GP") shows its contents and adds all items individually to the cart
- [ ] **T13.2.6** — Prevent exceeding available gold (disable "Add" buttons or show warning when insufficient funds)
- [ ] **T13.2.7** — Add quick-buy shortcuts for essential items: "Essentials Kit" button that adds the most common adventuring gear (backpack, bedroll, rations, rope, torch, waterskin) to the cart

## Acceptance Criteria

- Gold buy mode shows a two-panel layout: equipment catalog and shopping cart
- Starting gold dice formula is displayed with a "Roll Gold" button and animated dice roll
- Manual gold entry is available as an alternative to rolling
- Equipment catalog has tabbed categories with searchable, sortable tables
- Shopping cart shows items with quantity adjusters, costs, total weight, and remaining gold
- Remaining gold is color-coded (green positive, red negative/zero)
- Equipment packs expand to show individual items and are added to cart as individual entries
- "Add" buttons are disabled or warn when insufficient gold remains
- "Essentials Kit" quick-buy adds common adventuring gear to the cart

## Dependencies

- **Depends on:** Story 13.1 (EquipmentStep container with mode toggle, WeaponPicker and ArmorPicker components), Epic 10 Story 10.6 (class determines starting gold dice), Phase 1 dice engine (for gold rolls), Phase 1 SRD equipment data
- **Blocks:** Story 13.3 (validation checks gold spend), Epic 15 (review shows equipment and remaining currency)

## Notes

- **Equipment Pack Contents** (examples):
  - Dungeoneer's Pack (12 GP): backpack, crowbar, hammer, 10 pitons, 10 torches, tinderbox, 10 days rations, waterskin, 50 ft hempen rope
  - Explorer's Pack (10 GP): backpack, bedroll, mess kit, tinderbox, 10 torches, 10 days rations, waterskin, 50 ft hempen rope
  - Priest's Pack (19 GP): backpack, blanket, 10 candles, tinderbox, alms box, 2 blocks incense, censer, vestments, 2 days rations, waterskin
- The manual gold entry option is important for DMs who use fixed starting gold or have house rules
- Currency in D&D: 1 GP = 10 SP = 100 CP. For simplicity, display everything in GP (with decimal for partial GP items). Consider supporting PP, GP, SP, CP columns if items cost less than 1 GP
- The shopping cart should persist to the wizard store so the player doesn't lose their selections when switching between catalog tabs
- Consider showing an "Adventurer Essentials" recommendation section at the top of the Adventuring Gear tab highlighting items every adventurer should consider (light source, rations, rope, backpack)
