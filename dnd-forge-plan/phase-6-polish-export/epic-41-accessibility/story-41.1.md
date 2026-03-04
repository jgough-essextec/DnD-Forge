# Story 41.1 — Keyboard Navigation Audit

> **Epic 41: Accessibility Audit & Remediation** | **Phase 6: Polish & Export** (Weeks 11-12)

## Description

As a player who uses a keyboard, I need to navigate the entire app without a mouse. This story covers a full tab order audit, focus trapping in modals, keyboard shortcuts for core actions, ensuring all interactive elements are keyboard-activatable, providing keyboard alternatives for drag-and-drop, and verifying visible focus indicators throughout the app.

## Technical Context

- **App**: D&D Character Forge — local-first React PWA for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, Zustand (state), Dexie.js (IndexedDB), React Router, jsPDF (PDF export), Playwright (E2E testing)
- **Architecture**: No backend, pure client-side, offline-capable PWA, IndexedDB for persistence
- **Prior Phases Available**: Phases 1-5 (complete character creation, sheet display, session play, DM/campaign features)
- **Performance Targets**: Bundle <500KB, FCP <1.5s, TTI <3s, Lighthouse >90
- **Accessibility Target**: WCAG 2.1 AA compliance
- **WCAG Keyboard Requirements**: All functionality available via keyboard (2.1.1), no keyboard traps (2.1.2), visible focus indicators (2.4.7)
- **Modals Requiring Focus Trap**: Creation wizard, level-up, rest, dice roller, PDF export, campaign management
- **Drag-and-Drop**: @dnd-kit used for ability score assignment (Phase 2) and initiative reordering (Phase 5) — needs keyboard alternatives
- **Focus Indicator Style**: Gold or white outline, 2px minimum, high contrast against dark theme. Never `outline: none` without a replacement
- **Keyboard Shortcuts**: 9 shortcuts for common actions, shown in a help dialog triggered by `?`

## Tasks

- [ ] **T41.1.1** — **Tab order audit:** verify that Tab key navigation follows a logical reading order on every page. Fix any elements that break the tab sequence (e.g., floating panels, modals that don't trap focus, absolutely positioned elements)
- [ ] **T41.1.2** — **Focus trap for modals:** all modals (creation wizard, level-up, rest, dice roller, PDF export, campaign management) must trap focus within the modal while open. Esc closes the modal. Focus returns to the triggering element on close
- [ ] **T41.1.3** — **Keyboard shortcuts:** document and implement keyboard shortcuts for core actions:
  - `D` — Open dice roller
  - `R` — Quick roll d20
  - `E` — Toggle edit mode (on character sheet)
  - `S` — Short rest
  - `L` — Long rest
  - `N` — Next turn (in combat tracker)
  - `/` — Focus search input (gallery, skill matrix)
  - `Esc` — Close modal/panel
  - `?` — Show keyboard shortcuts help dialog
- [ ] **T41.1.4** — **Interactive elements:** verify all clickable elements (proficiency circles, spell slot circles, condition badges, roll buttons, gallery cards, stat blocks) are reachable and activatable via keyboard (Enter or Space)
- [ ] **T41.1.5** — **Drag-and-drop alternatives:** the creation wizard's ability score assignment and initiative reordering use drag-and-drop (@dnd-kit). Provide keyboard alternatives: arrow keys to reorder, or a "Move Up/Move Down" button pair
- [ ] **T41.1.6** — **Focus visible indicators:** verify that every focusable element has a clearly visible focus outline. The dark theme requires high-contrast focus rings (gold or white outline, 2px minimum). Never use `outline: none` without a replacement

## Acceptance Criteria

- Tab key navigates through every page in logical reading order with no skipped or out-of-order elements
- All modals trap focus while open, close on Esc, and return focus to the trigger element on close
- All 9 keyboard shortcuts are implemented and functional
- Keyboard shortcuts help dialog appears on `?` key press showing all available shortcuts
- All interactive elements (proficiency circles, spell slots, condition badges, roll buttons, gallery cards, stat blocks) are reachable and activatable via keyboard
- Drag-and-drop interactions have keyboard alternatives (arrow keys or Move Up/Move Down buttons)
- Every focusable element has a visible focus indicator (gold or white outline, 2px minimum)
- No instances of `outline: none` without a replacement focus style

## Testing Requirements

### Unit Tests (Vitest)
_For pure functions, calculations, data transforms, utilities, type guards, validators_

- `should define all 9 keyboard shortcuts with correct key bindings and descriptions`
- `should prevent keyboard shortcuts from firing when an input or textarea is focused`

### Functional Tests (React Testing Library)
_For component rendering, user interactions, state changes, prop variations_

- `should trap focus within modal when creation wizard modal is open`
- `should return focus to the triggering element when a modal is closed`
- `should close modal when Esc key is pressed`
- `should show keyboard shortcuts help dialog when ? key is pressed`
- `should activate proficiency circles, spell slot circles, and condition badges via Enter or Space key`
- `should provide Move Up/Move Down keyboard alternatives for drag-and-drop ability score assignment`
- `should display visible focus indicator (gold or white, 2px minimum) on every focusable element`

### E2E Tests (Playwright)
_For critical user journeys, multi-step flows, full-page interactions_

- `should navigate through the entire gallery page in logical reading order using Tab key`
- `should navigate through the full character sheet using Tab key without skipping elements`
- `should open dice roller with D key, roll d20 with R key, and close with Esc`
- `should toggle edit mode with E key on character sheet`
- `should reorder ability scores using arrow keys in creation wizard`

### Test Dependencies
- Full app rendered with all Phase 1-5 features for tab order testing
- Modal components (creation wizard, dice roller, PDF export, rest, level-up, campaign management)
- @dnd-kit keyboard accessibility API
- Focus indicator style verification utility

## Identified Gaps

- **Edge Cases**: Behavior when multiple keyboard shortcuts conflict (e.g., D in a text field vs. dice roller shortcut)
- **Accessibility**: No specification for skip navigation links (skip to main content)
- **Accessibility**: No specification for landmark regions (main, nav, aside) for screen reader navigation
- **Mobile/Responsive**: Keyboard shortcuts relevance on mobile not discussed (external keyboards on tablets)

## Dependencies

- All Phase 1-5 features complete (audit spans the entire app)
- @dnd-kit keyboard accessibility API for drag-and-drop alternatives

## Notes

- Keyboard shortcuts should only fire when no input/textarea is focused (to avoid conflicts with typing)
- Focus trap implementation can use a library like `focus-trap-react` or be custom-built
- The keyboard shortcuts help dialog should be styled consistently with other modals in the app
- Test with actual keyboard navigation, not just programmatic focus management
