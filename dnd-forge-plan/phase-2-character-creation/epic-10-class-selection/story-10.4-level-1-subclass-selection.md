# Story 10.4 — Level-1 Subclass Selection (Conditional)

> **Epic 10: Class Selection Step** | **Phase 2: Character Creation Wizard** (Weeks 3-4)

## Description

As a Cleric, Sorcerer, or Warlock player, I need to choose my subclass at level 1 since these classes require it before other classes do. This story builds the conditional subclass selector that appears within the Class Step for Cleric (Divine Domain), Sorcerer (Sorcerous Origin), and Warlock (Otherworldly Patron), and shows an informational note for classes where subclass is chosen later.

## Technical Context

- **App**: D&D Character Forge — full-stack Django + React web application for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, React Query (server state), Zustand (UI state), Django REST Framework, PostgreSQL, React Router
- **Architecture**: Django REST API backend, React SPA frontend, PostgreSQL persistence, Django session auth
- **Phase 1 Foundation Available**: Type system, SRD game data (races, classes, spells, equipment, backgrounds, feats as static JSON), calculation engine, React Query API layer, Zustand stores (UI state), dice engine
- **Level-1 Subclass Classes**:
  - **Cleric — Divine Domain (Level 1)**: SRD includes Life Domain. Grants: domain spells (auto-prepared at each spell level), bonus proficiency (heavy armor), Disciple of Life feature (+2 + spell level to healing spells)
  - **Sorcerer — Sorcerous Origin (Level 1)**: SRD includes Draconic Bloodline. Grants: dragon ancestry choice (dragon type for elemental affinity later), Draconic Resilience (HP bonus: +1 HP per level, natural AC = 13 + DEX when unarmored)
  - **Warlock — Otherworldly Patron (Level 1)**: SRD includes The Fiend. Grants: expanded spell list, Dark One's Blessing (gain temporary HP equal to CHA mod + warlock level on killing a creature)
- **Other Classes**: Subclass is chosen at higher levels. The subclass selector is hidden and replaced with an informational note:
  - Barbarian: Primal Path at level 3
  - Bard: Bard College at level 3
  - Druid: Druid Circle at level 2
  - Fighter: Martial Archetype at level 3
  - Monk: Monastic Tradition at level 3
  - Paladin: Sacred Oath at level 3
  - Ranger: Ranger Archetype at level 3
  - Rogue: Roguish Archetype at level 3
  - Wizard: Arcane Tradition at level 2
- **Subclass Mechanical Effects**: Some subclass features modify the character at level 1. These must be captured and applied: Cleric Life Domain grants heavy armor proficiency, Sorcerer Draconic Bloodline grants +1 HP per level and natural AC calculation

## Tasks

- [ ] **T10.4.1** — Create `components/wizard/class/SubclassSelector.tsx` — conditionally rendered within the Class Step when the selected class has `subclassLevel: 1`. Displays subclass options as cards with name, description, and key features
- [ ] **T10.4.2** — For Cleric (Divine Domain): show Life Domain (SRD) with domain spells, bonus proficiency (heavy armor), and Disciple of Life feature. If additional domains are in the data, show those too
- [ ] **T10.4.3** — For Sorcerer (Sorcerous Origin): show Draconic Bloodline (SRD) with draconic ancestry choice (dragon type), Draconic Resilience feature (HP bonus, natural AC)
- [ ] **T10.4.4** — For Warlock (Otherworldly Patron): show The Fiend (SRD) with expanded spell list and Dark One's Blessing feature
- [ ] **T10.4.5** — Subclass features that modify the character (e.g., Cleric Life Domain grants heavy armor proficiency, Sorcerer Draconic Bloodline grants +1 HP per level) must be captured and applied to the character data
- [ ] **T10.4.6** — For classes where subclass is chosen later (level 2 or 3), show an informational note: "You'll choose your [subclass name] at level [N]"

## Acceptance Criteria

- The subclass selector appears within the Class Step only for Cleric, Sorcerer, and Warlock
- Cleric shows Life Domain with domain spells, heavy armor proficiency, and Disciple of Life feature
- Sorcerer shows Draconic Bloodline with dragon ancestry choice, HP bonus, and natural AC feature
- Warlock shows The Fiend with expanded spell list and Dark One's Blessing feature
- Subclass features that modify the character (heavy armor proficiency, HP bonus, natural AC) are captured in the wizard store
- Classes with subclass at higher levels show an informational note (e.g., "You'll choose your Martial Archetype at level 3")
- The subclass must be selected for Cleric/Sorcerer/Warlock before the step can be validated

## Testing Requirements

### Functional Tests (React Testing Library)
_For component rendering, user interactions, state changes, prop variations_

- `should render subclass selector only for Cleric, Sorcerer, and Warlock`
- `should show Life Domain for Cleric with domain spells, heavy armor proficiency, and Disciple of Life feature`
- `should show Draconic Bloodline for Sorcerer with dragon ancestry choice, HP bonus, and natural AC feature`
- `should show The Fiend for Warlock with expanded spell list and Dark One's Blessing feature`
- `should capture subclass features that modify the character (heavy armor proficiency, HP bonus, natural AC) in wizard store`
- `should show informational note for classes with subclass at higher levels (e.g., "You'll choose your Martial Archetype at level 3")`
- `should require subclass selection for Cleric, Sorcerer, and Warlock before step validation passes`
- `should hide subclass selector entirely for classes without level-1 subclass`

### E2E Tests (Playwright)
_For critical user journeys, multi-step flows, full-page interactions_

- `should select Cleric, choose Life Domain, and see heavy armor proficiency added to character data`
- `should select Sorcerer, choose Draconic Bloodline with dragon ancestry, and see HP bonus and natural AC applied`
- `should select Fighter and see informational note about Martial Archetype at level 3`

### Test Dependencies
- Mock SRD class data with subclass data for Cleric, Sorcerer, and Warlock
- Mock wizard store for capturing subclass feature modifications
- Test fixtures for each level-1 subclass and their mechanical effects

## Identified Gaps

- **Edge Cases**: Sorcerer Draconic Bloodline dragon ancestry choice is different from Dragonborn ancestry; UI should clarify this distinction
- **Accessibility**: No keyboard navigation specified for subclass cards or dragon ancestry chooser
- **Dependency Issues**: Only SRD subclasses are available (1 per class); no specification for how to handle future homebrew or expanded subclass additions

## Dependencies

- **Depends on:** Story 10.1 (class must be selected to determine if subclass is needed), Story 10.2 (detail panel provides context for subclass choice), Phase 1 SRD class data with subclass data
- **Blocks:** Story 10.6 (validation checks subclass selection for applicable classes), Epic 14 (Cleric domain spells are auto-prepared, affects spell selection)

## Notes

- **Sorcerer Draconic Bloodline**: The dragon ancestry choice here is different from Dragonborn's draconic ancestry. Sorcerer picks a dragon type for elemental affinity at level 6 — at level 1, the mechanical effect is only Draconic Resilience (HP and AC)
- **Cleric Life Domain Spells**: Domain spells are always prepared and don't count against the prepared spell limit. At level 1: Bless, Cure Wounds. This affects Epic 14's spell selection UI
- **Warlock Expanded Spell List**: These spells are added to the Warlock spell list but still must be chosen as known spells. They're additional options, not auto-known
- Consider showing a "What if I pick something different?" note explaining that in the SRD, only one subclass per class is available, but homebrew support could be added later
- The subclass cards should be visually rich with feature descriptions to help new players understand the impact of their choice
