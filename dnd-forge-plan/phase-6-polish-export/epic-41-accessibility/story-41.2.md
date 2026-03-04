# Story 41.2 — Screen Reader Compatibility

> **Epic 41: Accessibility Audit & Remediation** | **Phase 6: Polish & Export** (Weeks 11-12)

## Description

As a player using a screen reader, I need the character sheet and all interactive elements to be properly announced. This story covers ARIA labeling for all form controls, meaningful announcements for game-specific elements (ability scores, skills, dice rolls, spell slots, death saves), semantic structure for gallery cards, combat tracker, modals, and data tables.

## Technical Context

- **App**: D&D Character Forge — local-first React PWA for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, Zustand (state), Dexie.js (IndexedDB), React Router, jsPDF (PDF export), Playwright (E2E testing)
- **Architecture**: No backend, pure client-side, offline-capable PWA, IndexedDB for persistence
- **Prior Phases Available**: Phases 1-5 (complete character creation, sheet display, session play, DM/campaign features)
- **Performance Targets**: Bundle <500KB, FCP <1.5s, TTI <3s, Lighthouse >90
- **Accessibility Target**: WCAG 2.1 AA compliance
- **WCAG Screen Reader Requirements**: Name, role, value for all UI components (4.1.2), status messages (4.1.3), info and relationships (1.3.1)
- **Key ARIA Patterns**:
  - `aria-label` / `aria-labelledby` on all form controls and interactive elements
  - `aria-live="assertive"` for dice roll results
  - `aria-live="polite"` for combat turn announcements and error messages
  - `role="dialog"` with `aria-modal="true"` for modals
  - `role="group"` with `aria-label` for spell slot and death save groups
  - Semantic `<article>` for gallery cards
  - Proper `<th>` headers with `scope` for data tables

## Tasks

- [ ] **T41.2.1** — **ARIA labels on all form controls:** audit every input, select, checkbox, toggle, and button. Each must have an accessible label via `aria-label`, `aria-labelledby`, or a visible `<label>` element. No unlabeled inputs
- [ ] **T41.2.2** — **Ability score blocks:** announce as "Strength: Score 16, Modifier +3" not just "16" and "+3" as separate elements. Use `aria-label` on the block container
- [ ] **T41.2.3** — **Skills list:** each skill row should announce: "[skill name], modifier [value], [proficient/not proficient/expertise]". The proficiency circle alone conveys no meaning to a screen reader — add `aria-label="Proficient"` or `aria-label="Not proficient"`
- [ ] **T41.2.4** — **Dice roll announcements:** use `aria-live="assertive"` on the roll result area. When a die is rolled, announce: "Rolled [expression]: [result]. [Context: e.g., 'Athletics check']". Critical hits/fumbles get enhanced announcements
- [ ] **T41.2.5** — **Spell slot circles:** announce as "Level 1 spell slots: 2 of 4 remaining" not as a series of unlabeled circles. Use `role="group"` with `aria-label` on the slot row
- [ ] **T41.2.6** — **Death save circles:** announce as "Death saves: 1 success, 2 failures" on the group. Individual circles announce "Success 1 of 3, filled" or "Failure 2 of 3, empty"
- [ ] **T41.2.7** — **Gallery cards:** each card is a semantic `<article>` with `aria-label="[Character name], Level [N] [Race] [Class]"`. Sort and filter controls have descriptive labels
- [ ] **T41.2.8** — **Combat tracker:** current turn combatant announced via `aria-live="polite"` when turn advances: "Current turn: [Name], [Type]". Initiative order is a list with semantic `role="list"`
- [ ] **T41.2.9** — **Modals and dialogs:** use `role="dialog"` with `aria-labelledby` pointing to the modal title. `aria-modal="true"` to indicate the rest of the page is inert
- [ ] **T41.2.10** — **Tables:** data tables (party stats grid, skill matrix, attacks table) use proper `<th>` headers with `scope="col"` or `scope="row"`. Complex tables use `aria-describedby` for context

## Acceptance Criteria

- Every form control (input, select, checkbox, toggle, button) has an accessible label
- Ability score blocks announce score, modifier, and ability name as a single meaningful unit
- Skill rows announce skill name, modifier, and proficiency status
- Dice roll results are announced via `aria-live="assertive"` with expression, result, and context
- Critical hits announce "CRITICAL!" and fumbles announce "FUMBLE!" in addition to the result
- Spell slot groups announce as "Level N spell slots: X of Y remaining"
- Death save groups announce as "Death saves: X successes, Y failures"
- Gallery cards are `<article>` elements with descriptive `aria-label`
- Combat tracker announces current turn via `aria-live="polite"` on turn advance
- All modals use `role="dialog"`, `aria-labelledby`, and `aria-modal="true"`
- Data tables have proper `<th>` headers with `scope` attributes

## Dependencies

- All Phase 1-5 features complete (screen reader audit spans entire app)

## Notes

- Test with VoiceOver (macOS), NVDA (Windows), and TalkBack (Android) for comprehensive coverage
- The D&D-specific terminology (proficiency, spell slots, death saves) should be used in ARIA labels for clarity to players
- Avoid over-labeling — too many ARIA attributes can make the experience worse for screen reader users
- Gallery card sort/filter controls should announce the current sort order when changed
