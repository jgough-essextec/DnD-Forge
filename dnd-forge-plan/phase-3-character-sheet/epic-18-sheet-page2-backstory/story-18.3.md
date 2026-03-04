# Story 18.3 — Equipment & Inventory

> **Epic 18: Character Sheet — Page 2 (Backstory & Details)** | **Phase 3: Character Sheet & Management** (Weeks 5-6)

## Description
As a player, I need to see my full equipment list with quantities, weights, and the ability to add, remove, and equip/unequip items.

## Technical Context
- **App**: D&D Character Forge — local-first React PWA for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, Zustand (state), Dexie.js (IndexedDB), React Router
- **Architecture**: No backend, pure client-side, offline-capable PWA, IndexedDB for persistence
- **Prior Phases Available**: Phase 1 (types, SRD data, calculation engine, database, state stores, dice engine), Phase 2 (character creation wizard — guided and freeform modes)
- **Equipment Section**: Spans full width at the bottom of Page 2. Scrollable table with equipped checkbox, name, quantity, weight, total weight, notes/properties
- **Equip/Unequip Effects**: Toggling armor equip recalculates AC. Toggling weapon equip adds/removes from Attacks section on Page 1. Only one armor and one shield can be equipped at a time
- **Carrying Capacity**: STR x 15 lbs. Variant encumbrance: > STR x 5 = encumbered (-10 speed), > STR x 10 = heavily encumbered (-20 speed + disadvantage)
- **Attunement**: Magic items requiring attunement tracked separately. Maximum 3 attunement slots per D&D 5e rules
- **SRD Equipment Data**: Phase 1 provides the SRD equipment catalog; Phase 2's equipment picker provides the search interface
- **Starting Equipment**: Pre-populated from the character creation wizard's equipment selection

## Tasks
- [ ] **T18.3.1** — Create `components/character/page2/EquipmentList.tsx` — a scrollable table of all equipment items. Columns: Equipped (checkbox), Name, Quantity, Weight (per unit), Total Weight, Notes/Properties
- [ ] **T18.3.2** — Items from the starting equipment (wizard) are pre-populated. Each item shows its SRD properties on hover (e.g., weapon damage, armor AC, tool description)
- [ ] **T18.3.3** — "Equipped" checkbox column: toggling equip state for armor recalculates AC. Toggling equip for a weapon adds/removes it from the Attacks section on Page 1. Only one armor and one shield can be equipped at a time — enforce with a warning if the user tries to equip a second
- [ ] **T18.3.4** — **Edit mode:** add "Add Item" button at the bottom that opens a modal with two tabs: "From SRD" (searchable equipment catalog from Phase 2's equipment picker) and "Custom" (freeform name, weight, notes). "Remove" button on each row with confirmation
- [ ] **T18.3.5** — Quantity column: +/- buttons for consumables (arrows, rations, etc.). Adjusting quantity updates total weight
- [ ] **T18.3.6** — Footer row showing: Total Inventory Weight, Carrying Capacity (STR x 15), and an encumbrance indicator. If using variant encumbrance rules: weight > STR x 5 = encumbered (-10 speed), > STR x 10 = heavily encumbered (-20 speed + disadvantage). Color-code: green (normal), yellow (encumbered), red (over capacity)
- [ ] **T18.3.7** — **Attunement tracking:** items that require attunement show an attunement badge. A separate "Attuned Items" counter at the top shows "N / 3 attunement slots used." Toggling attunement on a 4th item shows an error: "You can only attune to 3 magic items at a time"

## Acceptance Criteria
- Equipment table displays with all columns: Equipped, Name, Quantity, Weight, Total Weight, Notes/Properties
- Starting equipment from the creation wizard is pre-populated
- SRD item properties show on hover
- Toggling armor equip recalculates AC; toggling weapon equip updates Attacks section
- Only one armor and one shield can be equipped at a time (enforced with warning)
- Edit mode provides "Add Item" button with SRD search and custom item tabs
- Remove button on each row with confirmation dialog
- Quantity +/- buttons work for consumables and update total weight
- Footer shows Total Inventory Weight, Carrying Capacity, and color-coded encumbrance indicator
- Attunement badges display on eligible items with a counter showing "N / 3 slots used"
- Attempting to attune a 4th item shows an error

## Dependencies
- Story 17.5 (Combat Stats) — equipment equip state affects AC computation
- Story 17.8 (Attacks) — equipped weapons generate attack rows
- Phase 1 SRD equipment data and calculation engine (carrying capacity)
- Phase 2 equipment picker component for the "From SRD" tab
- Epic 20 view/edit mode toggle system

## Notes
- Equipment management is one of the most interactive sections during gameplay — items are constantly added, removed, and equipped/unequipped
- The equip checkbox should be interactive even in view mode for quick toggling (similar to how current HP is always editable)
- Carrying capacity and encumbrance are computed values that depend on STR score — they update when STR changes
- Attunement is a D&D 5e rule for magic items: a character can only be attuned to 3 items at once
