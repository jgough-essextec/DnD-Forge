# Story 16.1 — Shared Selection Components

> **Epic 16: Shared Wizard Components & Utilities** | **Phase 2: Character Creation Wizard** (Weeks 3-4)

## Description

As a developer, I need reusable components for common selection patterns across wizard steps. This story builds five generic shared components: SelectableCardGrid, SearchFilterBar, DetailSlidePanel, CountSelector, and ChoiceGroup — all consumed by multiple wizard steps to ensure visual consistency and reduce code duplication.

## Technical Context

- **App**: D&D Character Forge — local-first React PWA for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, Zustand (state), Dexie.js (IndexedDB), React Router
- **Architecture**: No backend, pure client-side, offline-capable PWA, IndexedDB for persistence
- **Phase 1 Foundation Available**: Type system, SRD game data (races, classes, spells, equipment, backgrounds, feats as static JSON), calculation engine, Dexie.js database layer, Zustand stores, dice engine
- **Component Usage Map**:
  - **SelectableCardGrid**: Race cards (9.1), Class cards (10.1), Background cards (12.1), Spell cards (14.2, 14.3)
  - **SearchFilterBar**: Race search/filter (9.1), Class search/filter (10.1), Equipment catalog search (13.1, 13.2), Spell filter (14.4)
  - **DetailSlidePanel**: Race detail panel (9.2), Class detail panel (10.2), Spell detail pane (14.4)
  - **CountSelector**: Skill selection (9.4, 10.3, 12.1), Language selection (9.4), Spell selection (14.2, 14.3)
  - **ChoiceGroup**: Equipment choices (13.1), Fighting style (10.5), Alignment (12.3)
- **Design Principles**: Generic props-driven API, TypeScript generics for type safety, responsive (mobile/tablet/desktop), accessible (keyboard navigable, ARIA labels), consistent with the app's dark fantasy visual theme

## Tasks

- [ ] **T16.1.1** — Create `components/shared/SelectableCardGrid.tsx` — a generic responsive grid of selectable cards. Props: items array, selected item(s), onSelect callback, single vs. multi select mode, card render function. Used by race cards, class cards, background cards, spell cards
- [ ] **T16.1.2** — Create `components/shared/SearchFilterBar.tsx` — a generic search + filter bar. Props: search placeholder, filter definitions (dropdown, toggle, chip), onSearch callback, onFilter callback. Used across race, class, equipment, and spell steps
- [ ] **T16.1.3** — Create `components/shared/DetailSlidePanel.tsx` — a generic slide-in side panel (right on desktop, bottom sheet on mobile) with animated open/close. Props: isOpen, onClose, title, children. Used for race details, class details, spell details
- [ ] **T16.1.4** — Create `components/shared/CountSelector.tsx` — a "choose N from this list" component with checkboxes. Props: items, maxSelections, selectedItems, onSelectionChange, labels. Used for skill selection, language selection, spell selection
- [ ] **T16.1.5** — Create `components/shared/ChoiceGroup.tsx` — a radio-button group for "pick one of these options." Props: options (with labels and descriptions), selectedOption, onSelect. Used for equipment choices, fighting style, alignment

## Acceptance Criteria

- SelectableCardGrid renders a responsive grid of cards with single or multi-select support
- SearchFilterBar provides text search and configurable filter controls (dropdowns, toggles, chips)
- DetailSlidePanel slides in from the right on desktop and from the bottom on mobile with framer-motion animation
- CountSelector enforces a maximum selection count with checkboxes and shows "N of M selected" counter
- ChoiceGroup renders radio-button options with labels and descriptions, single selection only
- All components accept generic TypeScript types for type safety
- All components are responsive across mobile, tablet, and desktop breakpoints
- All components support keyboard navigation and include ARIA accessibility attributes
- All components use the app's dark fantasy visual theme (Tailwind CSS, shadcn/ui)

## Testing Requirements

### Unit Tests (Vitest)
_For pure functions, calculations, data transforms, utilities, type guards, validators_

- `should enforce maxSelections in CountSelector and prevent additional selections`
- `should compute filter results correctly in SearchFilterBar with dropdown, toggle, and chip filters`

### Functional Tests (React Testing Library)
_For component rendering, user interactions, state changes, prop variations_

- `should render SelectableCardGrid with responsive grid layout and single-select mode`
- `should render SelectableCardGrid with multi-select mode and correct selection state`
- `should render SearchFilterBar with text search, dropdown filters, toggle filters, and chip filters`
- `should invoke onSearch and onFilter callbacks when search/filter controls are used`
- `should render DetailSlidePanel sliding in from right on desktop and from bottom on mobile with framer-motion animation`
- `should close DetailSlidePanel when clicking outside or pressing close button`
- `should render CountSelector with checkboxes enforcing maximum selection count and showing "N of M selected"`
- `should disable remaining items in CountSelector once maxSelections is reached`
- `should render ChoiceGroup with radio-button options (labels and descriptions) allowing single selection only`
- `should accept TypeScript generics for type safety in all components`
- `should support keyboard navigation and ARIA accessibility attributes in all components`

### E2E Tests (Playwright)
_For critical user journeys, multi-step flows, full-page interactions_

- `should render SelectableCardGrid at different viewport sizes and verify responsive column counts`

### Test Dependencies
- Mock framer-motion for animation assertions
- Test fixtures for generic item arrays with various configurations
- Mock filter definitions for SearchFilterBar testing

## Identified Gaps

- **Accessibility**: ARIA labels are mentioned in acceptance criteria but no specific ARIA roles or patterns (e.g., role="listbox", role="radiogroup") are specified
- **Mobile/Responsive**: DetailSlidePanel swipe-down-to-close on mobile is mentioned in notes but not in acceptance criteria
- **Performance**: No render performance criteria for large item lists in SelectableCardGrid or CountSelector

## Dependencies

- **Depends on:** Phase 1 project scaffolding (React, TypeScript, Tailwind CSS, shadcn/ui, framer-motion installed)
- **Blocks:** Epics 9-15 (all wizard steps consume these shared components)

## Notes

- **SelectableCardGrid**: Consider supporting both a card render prop (for full customization) and a default card layout (for quick use). The grid should use CSS Grid for responsive column count
- **SearchFilterBar**: Filter definitions should be declarative — pass an array of filter configs like `{ type: 'dropdown', label: 'Size', options: ['Small', 'Medium'] }` or `{ type: 'toggle', label: 'Darkvision' }`. This makes the component reusable without modification
- **DetailSlidePanel**: Use framer-motion AnimatePresence for enter/exit animations. The panel should have a backdrop overlay that closes the panel on click. On mobile, implement swipe-down to close
- **CountSelector**: Show disabled state on remaining items once maxSelections is reached. Include a "Clear All" button for resetting selections
- **ChoiceGroup**: Each option should support an optional description below the label for context (e.g., fighting style descriptions, equipment option details)
- All shared components should have clear TypeScript interfaces for their props, making them easy to consume with full IntelliSense support
- Consider creating a Storybook or similar component documentation for these shared components
