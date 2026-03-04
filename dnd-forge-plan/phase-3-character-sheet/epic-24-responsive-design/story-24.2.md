# Story 24.2 — Tablet Layout (640-1024px)

> **Epic 24: Character Sheet Responsive Design** | **Phase 3: Character Sheet & Management** (Weeks 5-6)

## Description
As a player on a tablet, I need a readable sheet that balances information density with touch-friendly targets.

## Technical Context
- **App**: D&D Character Forge — full-stack Django + React web application for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, React Query (server state), Zustand (UI state), Django REST Framework, PostgreSQL, React Router
- **Architecture**: Django REST API backend, React SPA frontend, PostgreSQL persistence, Django session auth
- **Prior Phases Available**: Phase 1 (types, SRD data, calculation engine, database, state stores, dice engine), Phase 2 (character creation wizard — guided and freeform modes)
- **Tablet Breakpoint**: 640-1024px width
- **Page 1 Tablet Layout**: Two-column — left column (~40%) for ability scores, saves, skills; right column (~60%) for combat stats, HP, attacks, personality, features. Skills use more compact format
- **Page 2 Tablet Layout**: Single column, sections stacked vertically. Portrait reduced to thumbnail
- **Page 3 Tablet Layout**: Single column, spell levels stacked vertically. Spell slot trackers above spell lists
- **Touch Targets**: Minimum 44x44px for all interactive elements (proficiency dots, spell slot circles, edit fields) per WCAG guidelines

## Tasks
- [ ] **T24.2.1** — Page 1 tablet: two-column layout. Left column (ability scores + saves + skills) ~40%. Right column (combat stats + HP + attacks + personality + features) ~60%. Skills list uses a more compact format (abbreviations)
- [ ] **T24.2.2** — Page 2 tablet: single column, sections stacked vertically. Portrait area reduced to thumbnail
- [ ] **T24.2.3** — Page 3 tablet: single column, spell levels stacked vertically. Spell slot trackers above spell lists
- [ ] **T24.2.4** — Touch targets: all interactive elements (proficiency dots, spell slot circles, edit fields) minimum 44x44px for comfortable tapping

## Acceptance Criteria
- Page 1 renders a two-column layout at 640-1024px with correct width ratios (40/60)
- Skills list uses a more compact format on tablet
- Page 2 stacks all sections in a single column with reduced portrait size
- Page 3 stacks spell levels vertically with slot trackers above spell lists
- All interactive elements meet the 44x44px minimum touch target size
- Layout transitions smoothly from desktop (3-column) to tablet (2-column)
- Content remains readable and usable on tablet-sized screens

## Testing Requirements

### Functional Tests (React Testing Library)
_For component rendering, user interactions, state changes, prop variations_

- `should render Page 1 in two-column layout at 640-1024px with correct width ratios (40/60)`
- `should render skills list in compact format with abbreviations on tablet`
- `should render Page 2 in single column with sections stacked vertically`
- `should reduce portrait area to thumbnail size (~80px) on tablet`
- `should render Page 3 in single column with spell levels stacked vertically`
- `should render spell slot trackers above spell lists on tablet`
- `should ensure all interactive elements meet 44x44px minimum touch target`

### E2E Tests (Playwright)
_For critical user journeys, multi-step flows, full-page interactions_

- `should render two-column Page 1 layout at 768px viewport width with touch-friendly targets`

### Test Dependencies
- Mock character data with full content
- Viewport size mocking (640px, 768px, 1024px)
- Touch target size measurement utilities

## Identified Gaps

- **Accessibility**: No specification for touch target size verification tooling, no ARIA labels adapted for tablet
- **Edge Cases**: No specification for transition behavior at exact 640px and 1024px boundaries
- **Performance**: No specification for layout reflow performance during viewport resize

## Dependencies
- Story 24.1 (Desktop Layout) — tablet layout adapts from desktop
- Epic 17-19 (Sheet components) — layout targets
- Tailwind CSS responsive utilities (md: breakpoint)

## Notes
- The two-column tablet layout for Page 1 combines the desktop center and right columns into a single right column
- Skills abbreviations on tablet: show "Ath +3" instead of "Athletics (STR) +3" to save space
- The 44x44px touch target requirement is from WCAG accessibility guidelines — it's critical for usability on touch devices
- Portrait thumbnail on Page 2 should be ~80px instead of ~200px to save vertical space
- Tablet layout is commonly used during actual D&D sessions (iPad on the table)
