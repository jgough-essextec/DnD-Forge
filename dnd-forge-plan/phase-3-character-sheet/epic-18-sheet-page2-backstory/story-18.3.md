# Story 18.3 — Equipment & Inventory

> **Epic 18: Character Sheet — Page 2 (Backstory & Details)** | **Phase 3: Character Sheet & Management** (Weeks 5-6)

## Description
As a player, I need to see my full equipment list with quantities, weights, and the ability to add, remove, and equip/unequip items.

## Technical Context
- **App**: D&D Character Forge — full-stack Django + React web application for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, React Query (server state), Zustand (UI state), Django REST Framework, PostgreSQL, React Router
- **Architecture**: Django REST API backend, React SPA frontend, PostgreSQL persistence, Django session auth
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

## Testing Requirements

### Unit Tests (Vitest)
_For pure functions, calculations, data transforms, utilities, type guards, validators_

- `should compute total weight as sum of (quantity * weight per unit) for all items`
- `should compute carrying capacity as STR * 15 lbs`
- `should determine encumbrance state: normal (< STR*5), encumbered (>= STR*5), heavily encumbered (>= STR*10)`
- `should compute total wealth in GP equivalent from currency and item values`
- `should enforce single armor and single shield equip constraint`
- `should track attunement count against maximum of 3`

### Functional Tests (React Testing Library)
_For component rendering, user interactions, state changes, prop variations_

- `should render equipment table with columns: Equipped, Name, Quantity, Weight, Total Weight, Notes/Properties`
- `should pre-populate starting equipment from the creation wizard`
- `should show SRD item properties on hover tooltip`
- `should recalculate AC when toggling armor equip checkbox`
- `should update Attacks section when toggling weapon equip checkbox`
- `should enforce single armor/shield equip constraint with warning`
- `should provide "Add Item" button with SRD search and custom item tabs in edit mode`
- `should show remove button on each row with confirmation dialog in edit mode`
- `should adjust quantity with +/- buttons and update total weight`
- `should display footer with Total Inventory Weight, Carrying Capacity, and color-coded encumbrance indicator`
- `should display attunement badge on eligible items with "N / 3 slots used" counter`
- `should show error when attempting to attune a 4th item`

### E2E Tests (Playwright)
_For critical user journeys, multi-step flows, full-page interactions_

- `should add an item from SRD catalog, equip it, and verify AC or attacks update accordingly`
- `should toggle equip on weapons and armor, verifying cross-page updates on Page 1`

### Test Dependencies
- Mock character data with starting equipment (armor, weapons, items)
- Mock SRD equipment data catalog
- Mock equipment picker component from Phase 2
- Mock calculation engine for carrying capacity and AC
- Mock view/edit mode context

## Identified Gaps

- **Error Handling**: No specification for what happens when API request fails during item operations
- **Loading/Empty States**: No specification for empty equipment list display (character with no starting equipment)
- **Accessibility**: No keyboard navigation for equipment table, no ARIA labels for equip checkboxes, no screen reader support for attunement counter
- **Performance**: No specification for performance with large equipment lists (50+ items)

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
