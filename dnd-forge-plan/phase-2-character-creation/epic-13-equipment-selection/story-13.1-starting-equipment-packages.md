# Story 13.1 — Starting Equipment Packages

> **Epic 13: Equipment Selection Step** | **Phase 2: Character Creation Wizard** (Weeks 3-4)

## Description

As a player, I need to make the starting equipment choices offered by my class, with clear descriptions of what each option includes. This story builds the starting equipment selector that renders class equipment choice groups with nested item pickers for generic items (e.g., "a martial weapon"), weapon and armor picker components, background equipment display, and an inventory summary panel.

## Technical Context

- **App**: D&D Character Forge — full-stack Django + React web application for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, React Query (server state), Zustand (UI state), Django REST Framework, PostgreSQL, React Router
- **Architecture**: Django REST API backend, React SPA frontend, PostgreSQL persistence, Django session auth
- **Phase 1 Foundation Available**: Type system, SRD game data (races, classes, spells, equipment, backgrounds, feats as static JSON), calculation engine, React Query API layer, Zustand stores (UI state), dice engine
- **Starting Equipment Structure (Gap W5)**: Equipment options are nested choice groups, not flat lists. Example (Fighter):
  - (a) chain mail OR (b) leather armor, longbow, and 20 arrows
  - (a) a martial weapon and a shield OR (b) two martial weapons
  - (a) a light crossbow and 20 bolts OR (b) two handaxes
  - A dungeoneer's pack OR an explorer's pack
  - Each "martial weapon" or "simple weapon" choice requires drilling down into the weapon catalog to pick a specific item
- **Weapon Picker**: Searchable, filterable list/grid of weapons from SRD data. Shows: name, damage dice + type, properties (finesse, versatile, light, heavy, two-handed, thrown, etc.), weight, cost. Filter by category (simple/martial, melee/ranged)
- **Armor Picker**: Shows: name, category (light/medium/heavy), base AC, DEX modifier cap, stealth disadvantage, weight, STR requirement. Includes a "Your AC with this armor" computed column using the player's DEX modifier
- **Background Equipment**: Displayed as a separate read-only section — always granted, not a choice
- **Inventory Summary**: Running panel showing all selected equipment, total weight, computed AC, primary weapon damage

## Tasks

- [ ] **T13.1.1** — Create `components/wizard/EquipmentStep.tsx` as the Step 5 container. Top section has a toggle: "Choose Starting Equipment" (default) vs. "Roll for Gold and Buy"
- [ ] **T13.1.2** — Create `components/wizard/equipment/StartingEquipmentSelector.tsx` — renders the class's starting equipment choice groups. Each choice group is displayed as a labeled section ("Choose one:") with radio-button options
- [ ] **T13.1.3** — For choices involving generic items (e.g., "a martial weapon"), render a nested item picker that opens the weapon/gear catalog filtered to the relevant category. The player must drill down to select a specific item (e.g., choose "Longsword" from martial weapons)
- [ ] **T13.1.4** — Create `components/wizard/equipment/WeaponPicker.tsx` — a searchable, filterable list/grid of weapons from the SRD data. Each weapon shows: name, damage dice + type, properties (finesse, versatile, etc.), weight, and cost. Sort by name, damage, or weight. Filter by category (simple/martial, melee/ranged)
- [ ] **T13.1.5** — Create `components/wizard/equipment/ArmorPicker.tsx` — similar to weapon picker but for armor. Shows: name, category (light/medium/heavy), base AC, DEX cap, stealth penalty, weight, and STR requirement. Include a "Your AC with this armor" computed column based on the player's DEX
- [ ] **T13.1.6** — Display background starting equipment as a separate read-only section below class equipment: "From your [Background] background, you receive: [item list]"
- [ ] **T13.1.7** — Show a running "Inventory Summary" panel on the right (desktop) or bottom (mobile): lists all selected equipment with total weight, currently computed AC (based on armor + shield selections), and primary weapon damage

## Acceptance Criteria

- Class starting equipment choice groups are rendered as labeled sections with radio-button options
- Generic item choices (e.g., "a martial weapon") open a nested picker filtered to the relevant category
- Weapon picker shows name, damage, properties, weight, cost with search/filter/sort capabilities
- Armor picker shows name, category, AC, DEX cap, stealth penalty, weight, STR requirement, and computed AC
- Background equipment is displayed as a read-only section
- Inventory Summary panel shows all selected items, total weight, computed AC, and primary weapon damage
- All choice groups must have selections before proceeding (including drill-down for generic items)

## Testing Requirements

### Unit Tests (Vitest)
_For pure functions, calculations, data transforms, utilities, type guards, validators_

- `should compute AC correctly for light armor (base + full DEX mod)`
- `should compute AC correctly for medium armor (base + DEX mod, max 2)`
- `should compute AC correctly for heavy armor (flat AC, no DEX)`
- `should add +2 AC for shield selection`
- `should parse nested equipment choice groups from class data`

### Functional Tests (React Testing Library)
_For component rendering, user interactions, state changes, prop variations_

- `should render class starting equipment choice groups as labeled sections with radio-button options`
- `should open nested item picker filtered to relevant category when generic item choice (e.g., "a martial weapon") is selected`
- `should display weapons with name, damage dice + type, properties, weight, and cost in WeaponPicker`
- `should display armor with name, category, AC, DEX cap, stealth penalty, weight, STR requirement, and computed AC in ArmorPicker`
- `should show background equipment as a separate read-only section`
- `should show running Inventory Summary panel with total weight, computed AC, and primary weapon damage`
- `should require all choice groups to have selections (including drill-down) before proceeding`
- `should support search, filter, and sort in WeaponPicker and ArmorPicker`

### E2E Tests (Playwright)
_For critical user journeys, multi-step flows, full-page interactions_

- `should complete Fighter starting equipment selection with chain mail, martial weapon drill-down, and pack choice`
- `should see computed AC update in real-time as armor/shield selections change`

### Test Dependencies
- Mock SRD equipment data (weapons, armor, packs with contents)
- Mock class starting equipment choice groups for Fighter, Wizard, Rogue
- Mock wizard store with DEX/STR ability scores for AC/carrying capacity computation
- Mock background equipment data

## Identified Gaps

- **Error Handling**: No specification for handling missing or incomplete equipment data for a class
- **Loading/Empty States**: No loading state for equipment catalog loading
- **Accessibility**: No ARIA labels for radio-button equipment choices, weapon/armor picker tables, or nested drill-down navigation
- **Mobile/Responsive**: Inventory Summary panel placement (right on desktop, bottom on mobile) mentioned but no detail on mobile interaction

## Dependencies

- **Depends on:** Story 8.1 (Wizard Shell — this is Step 5), Epic 10 Story 10.6 (class determines starting equipment options), Epic 11 Story 11.6 (DEX for armor AC computation, STR for carrying capacity), Epic 12 Story 12.4 (background equipment), Epic 16 Story 16.1 (ChoiceGroup for radio selections), Phase 1 SRD equipment data, Phase 1 calculation engine
- **Blocks:** Story 13.3 (validation checks all choice groups), Epic 15 (review shows equipment and computed AC)

## Notes

- **Equipment Choice Complexity**: Some choices are straightforward (pack A vs. pack B), while others require multi-level drilling:
  1. Choose (a) or (b) at the top level
  2. If the option includes "a martial weapon", open the weapon picker filtered to martial weapons
  3. Player selects specific weapon (e.g., Longsword)
  4. Selection is resolved to the specific item in the inventory
- **Armor AC Computation**:
  - Light armor: base AC + full DEX mod (leather=11, studded leather=12)
  - Medium armor: base AC + DEX mod (max 2) (hide=12, chain shirt=13, scale mail=14, breastplate=14, half plate=15)
  - Heavy armor: flat AC, no DEX (ring mail=14, chain mail=16, splint=17, plate=18), may have STR requirement
  - Shield: +2 AC (stacks with armor)
- The "explorer's pack" and "dungeoneer's pack" are bundles of items — consider showing their contents in a tooltip or expansion panel
- Weapon properties tooltips: Finesse (use STR or DEX), Versatile (one or two hands for different damage), Light (suitable for two-weapon fighting), Heavy (Small creatures have disadvantage), etc.
