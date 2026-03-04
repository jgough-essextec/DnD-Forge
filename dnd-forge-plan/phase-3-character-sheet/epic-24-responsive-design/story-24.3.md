# Story 24.3 — Mobile Layout (<640px)

> **Epic 24: Character Sheet Responsive Design** | **Phase 3: Character Sheet & Management** (Weeks 5-6)

## Description
As a player on a phone during a session, I need a usable character sheet that I can scroll through to find key information quickly.

## Technical Context
- **App**: D&D Character Forge — full-stack Django + React web application for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, React Query (server state), Zustand (UI state), Django REST Framework, PostgreSQL, React Router
- **Architecture**: Django REST API backend, React SPA frontend, PostgreSQL persistence, Django session auth
- **Prior Phases Available**: Phase 1 (types, SRD data, calculation engine, database, state stores, dice engine), Phase 2 (character creation wizard — guided and freeform modes)
- **Mobile Breakpoint**: <640px width
- **Mobile Design Philosophy**: Single column, sections stacked vertically. Combat-relevant info prioritized at top. Collapsible sections for less-frequent data. Floating action bar for common actions
- **Section Order (Optimized for Play)**: Combat stats (AC, HP, initiative, speed) at top, attacks, then ability scores/skills below. Personality and features collapse by default
- **Ability Scores Mobile**: Horizontal row of 6 compact blocks (2 rows of 3) instead of vertical column. Show modifier only; tap to expand
- **Skills Mobile**: Collapsible section. Default collapsed with header showing proficient skill count
- **Attacks Mobile**: Card-style layout instead of table
- **Floating Action Bar**: Bottom bar with 4 common actions: Roll d20, HP +/-, Spell Slots, Edit toggle
- **Spell Page Mobile**: Accordion sections per spell level, only relevant level expanded by default

## Tasks
- [ ] **T24.3.1** — Page 1 mobile: single column, sections stacked vertically. Section order optimized for play: combat stats (AC, HP, initiative, speed) at top, attacks, then ability scores/skills below. Personality and features collapse by default
- [ ] **T24.3.2** — Mobile navigation: swap tabs for a scrollable page with sticky section headers that act as jump links. Or keep tabs but stack all Page 1 content in one scrollable view
- [ ] **T24.3.3** — Ability scores mobile: horizontal row of 6 compact score blocks (2 rows of 3) rather than a vertical column. Show modifier only; tap to expand and see full score breakdown
- [ ] **T24.3.4** — Skills mobile: collapsible section. Default collapsed with a "Skills" header showing the count of proficient skills. Expand to see the full list
- [ ] **T24.3.5** — Attacks mobile: card-style layout for each weapon/attack rather than a table. Each attack card shows name, attack bonus, and damage prominently
- [ ] **T24.3.6** — Quick-access floating action bar at the bottom of mobile view with the 4 most common actions: Roll d20, HP +/-, Spell Slots, and Edit toggle
- [ ] **T24.3.7** — Spell page mobile: accordion sections per spell level. Only the level currently relevant (has unused slots) is expanded by default

## Acceptance Criteria
- Page 1 renders in single column on mobile (<640px) with combat stats at top
- Section order prioritizes combat-relevant information
- Personality and features sections are collapsed by default on mobile
- Mobile navigation uses sticky section headers or tab-based scrollable view
- Ability scores display as 2 rows of 3 compact blocks showing modifiers only
- Tapping an ability score expands to show full breakdown
- Skills section is collapsible with proficient count in the header
- Attacks display as cards instead of a table
- Floating action bar shows at the bottom with Roll d20, HP +/-, Spell Slots, and Edit toggle
- Spell page uses accordion sections with only the relevant level expanded
- All content is accessible via scrolling on mobile

## Testing Requirements

### Functional Tests (React Testing Library)
_For component rendering, user interactions, state changes, prop variations_

- `should render Page 1 in single column at <640px with combat stats at top`
- `should order sections for play: combat stats, attacks, ability scores, skills, personality (collapsed), features (collapsed)`
- `should render ability scores as 2 rows of 3 compact blocks showing modifiers only`
- `should expand ability score to show full breakdown on tap`
- `should render skills section collapsed by default with proficient count in header`
- `should render attacks as card-style layout instead of table`
- `should render floating action bar at bottom with Roll d20, HP +/-, Spell Slots, Edit toggle`
- `should render spell page with accordion sections per spell level`
- `should expand only the relevant spell level (has unused slots) by default`
- `should use sticky section headers as jump links for mobile navigation`

### E2E Tests (Playwright)
_For critical user journeys, multi-step flows, full-page interactions_

- `should render mobile layout at 375px viewport, scroll through combat-first sections, and use floating action bar`
- `should tap ability score on mobile to expand breakdown, then collapse it`

### Test Dependencies
- Mock character data with full content for all sections
- Viewport size mocking (375px, 414px, <640px)
- Touch event simulation for mobile interactions

## Identified Gaps

- **Accessibility**: No specification for floating action bar ARIA labels, no screen reader support for collapsible sections, no focus management on expand/collapse
- **Edge Cases**: No specification for landscape mobile orientation behavior
- **Performance**: No specification for scroll performance with all sections rendered in single column
- **Mobile/Responsive**: Swipe gestures for page navigation mentioned in notes but not in acceptance criteria

## Dependencies
- Story 24.1 (Desktop Layout) — mobile layout adapts from desktop
- Story 24.2 (Tablet Layout) — progressive adaptation
- Epic 17-19 (Sheet components) — layout targets
- Tailwind CSS responsive utilities (default/sm: breakpoints)

## Notes
- Mobile is the most constrained layout — every pixel counts
- The section reordering for mobile (combat stats first) is critical: during a D&D session, players most frequently check AC, HP, and attack bonuses
- The floating action bar should be fixed to the bottom of the viewport and not interfere with scrolling
- Collapsible sections save vertical space while keeping all information accessible
- The "Roll d20" button in the floating action bar should use the dice engine for a quick unmodified d20 roll
- Consider swipe gestures for navigating between character sheet pages on mobile
