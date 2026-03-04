# Story 14.4 — Spell Detail Cards & Browser

> **Epic 14: Spellcasting Step (Conditional)** | **Phase 2: Character Creation Wizard** (Weeks 3-4)

## Description

As a player browsing spells, I need to see full details — casting time, range, components, duration, description, and effects — so I can make informed choices. This story builds the comprehensive spell detail card, the spell filter bar, list virtualization for performance, recommended spells section, and a spell comparison feature.

## Technical Context

- **App**: D&D Character Forge — full-stack Django + React web application for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, React Query (server state), Zustand (UI state), Django REST Framework, PostgreSQL, React Router
- **Architecture**: Django REST API backend, React SPA frontend, PostgreSQL persistence, Django session auth
- **Phase 1 Foundation Available**: Type system, SRD game data (races, classes, spells, equipment, backgrounds, feats as static JSON), calculation engine, React Query API layer, Zustand stores (UI state), dice engine
- **Spell Detail Card Structure**:
  - Header: spell name, level badge (cantrip / 1st level), school of magic with icon
  - Properties row: casting time, range, duration, concentration badge (if applicable), ritual badge (if applicable)
  - Components row: V (Verbal), S (Somatic), M (Material) icons with material description if applicable
  - Description: full spell text from SRD data
  - "At Higher Levels" section (if applicable): how the spell scales
  - Damage/healing info (if applicable): dice, damage type, save type
  - Classes: list of all classes that can use this spell
- **Schools of Magic**: Abjuration, Conjuration, Divination, Enchantment, Evocation, Illusion, Necromancy, Transmutation — each with a distinct icon
- **Spell Filter Bar**: Search by name, filter by school of magic (multi-select), filter by casting time, toggle "Ritual only", toggle "Concentration only", sort by name/level/school
- **List Virtualization**: SRD spell list can have 100+ entries. Use windowed rendering to only render visible spell cards in the scroll viewport for performance
- **Recommended Spells**: Commonly-chosen spells for each class at level 1 highlighted at top of list
- **Spell Comparison**: Pin up to 3 spells side-by-side for easy comparison

## Tasks

- [ ] **T14.4.1** — Create `components/wizard/spells/SpellDetailCard.tsx` — a comprehensive spell information display. Structured layout:
  - Header: spell name, level badge, school of magic with icon
  - Properties row: casting time, range, duration, concentration badge (if applicable), ritual badge (if applicable)
  - Components row: V/S/M icons with material description if applicable
  - Description: full spell text
  - "At Higher Levels" section (if applicable)
  - Damage/healing info (if applicable): dice, damage type, save type
  - Classes: list of classes that can use this spell
- [ ] **T14.4.2** — Create `components/wizard/spells/SpellFilterBar.tsx` — filter controls: search by name (text input), filter by school of magic (multi-select), filter by casting time, toggle "Ritual only", toggle "Concentration only", sort by name/level/school
- [ ] **T14.4.3** — Implement spell list virtualization for performance: use windowed rendering to handle 100+ spells without lag. Only render the visible spell cards in the scroll viewport
- [ ] **T14.4.4** — Add "Recommended Spells" section at the top of the list highlighting commonly-chosen spells for the class at level 1 (e.g., Wizard: Shield, Magic Missile, Mage Armor, Find Familiar, Detect Magic)
- [ ] **T14.4.5** — Add a "Compare" feature: allow the player to pin up to 3 spells side-by-side for easy comparison before making their final selection

## Acceptance Criteria

- Spell detail cards show all spell information: header, properties, components, description, higher levels, damage/healing, classes
- School of magic icons are displayed with the correct icon for each of the 8 schools
- Concentration and ritual badges are shown when applicable
- Components row shows V/S/M icons with material descriptions
- Filter bar filters spells by name, school, casting time, ritual, and concentration
- Spell list uses virtualized rendering for smooth performance with 100+ spells
- "Recommended Spells" section appears at the top with class-appropriate suggestions
- "Compare" feature allows pinning up to 3 spells for side-by-side comparison

## Testing Requirements

### Unit Tests (Vitest)
_For pure functions, calculations, data transforms, utilities, type guards, validators_

- `should map each of the 8 schools of magic to the correct icon`
- `should filter spells by name, school, casting time, ritual, and concentration`
- `should sort spells by name, level, and school`

### Functional Tests (React Testing Library)
_For component rendering, user interactions, state changes, prop variations_

- `should display spell detail card with header (name, level badge, school icon), properties, components, description`
- `should show concentration and ritual badges when applicable`
- `should display V/S/M component icons with material descriptions`
- `should show At Higher Levels section when applicable`
- `should filter spells using filter bar by name, school, casting time, ritual, and concentration`
- `should render spell list with virtualized rendering for smooth performance with 100+ spells`
- `should show Recommended Spells section at top with class-appropriate suggestions`
- `should allow pinning up to 3 spells for side-by-side comparison`

### E2E Tests (Playwright)
_For critical user journeys, multi-step flows, full-page interactions_

- `should browse Wizard spell list, filter by Evocation school, and view spell detail card`
- `should pin 3 spells for comparison and see them side-by-side`

### Test Dependencies
- Mock SRD spell data (100+ spells with full detail: components, descriptions, schools)
- Mock recommended spell lists per class
- Virtualization library mock (react-window or @tanstack/react-virtual)
- School of magic icon mapping fixtures

## Identified Gaps

- **Performance**: List virtualization is specified but no frame rate or scroll performance targets defined
- **Accessibility**: No ARIA labels for spell detail cards, filter controls, comparison view, or virtualized list
- **Mobile/Responsive**: Spell comparison (3 side-by-side) likely doesn't fit on mobile; no responsive layout specified for comparison view
- **Edge Cases**: Spell descriptions longer than 500 words truncation behavior is in notes but not in acceptance criteria

## Dependencies

- **Depends on:** Stories 14.2-14.3 (spell selection UI that this detail/browser enhances), Phase 1 SRD spell data
- **Blocks:** Story 14.5 (validation depends on spell selection UI being complete)

## Notes

- **Recommended Spells by Class (Level 1)**:
  - Wizard: Shield, Magic Missile, Mage Armor, Find Familiar, Detect Magic, Sleep
  - Cleric: Healing Word, Bless, Cure Wounds, Guiding Bolt, Shield of Faith
  - Bard: Healing Word, Faerie Fire, Thunderwave, Dissonant Whispers
  - Druid: Healing Word, Entangle, Faerie Fire, Goodberry
  - Sorcerer: Shield, Magic Missile, Sleep, Chromatic Orb
  - Warlock: Hex, Eldritch Blast (cantrip), Hellish Rebuke, Charm Person
- **Virtualization Library Options**: react-window or @tanstack/react-virtual — either works for windowed rendering
- Some spell descriptions are very long (500+ words). In the list view, truncate to 2-3 lines with "Read more". Show full text only in the detail pane
- The spell comparison feature is a nice-to-have that helps players choose between similar spells (e.g., Cure Wounds vs. Healing Word, Sleep vs. Charm Person)
- School of magic icons could use the standard D&D color associations: Abjuration=blue, Conjuration=yellow, Divination=silver, Enchantment=pink, Evocation=red, Illusion=purple, Necromancy=green, Transmutation=orange
- Consider showing the spell's key stats (damage dice, save DC, healing) in the list view to help quick scanning without opening every detail card
