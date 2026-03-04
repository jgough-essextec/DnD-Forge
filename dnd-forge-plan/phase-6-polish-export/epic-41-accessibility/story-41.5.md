# Story 41.5 — Form Accessibility

> **Epic 41: Accessibility Audit & Remediation** | **Phase 6: Polish & Export** (Weeks 11-12)

## Description

As a player filling out forms (creation wizard, edit mode, campaign creation), I need clear labels, error messages, and required field indicators. This story covers associating error messages with inputs, marking required fields, announcing wizard step progress, implementing proper combobox patterns for search inputs, and ensuring all touch targets meet the 44x44px minimum.

## Technical Context

- **App**: D&D Character Forge — local-first React PWA for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, Zustand (state), Dexie.js (IndexedDB), React Router, jsPDF (PDF export), Playwright (E2E testing)
- **Architecture**: No backend, pure client-side, offline-capable PWA, IndexedDB for persistence
- **Prior Phases Available**: Phases 1-5 (complete character creation, sheet display, session play, DM/campaign features)
- **Performance Targets**: Bundle <500KB, FCP <1.5s, TTI <3s, Lighthouse >90
- **Accessibility Target**: WCAG 2.1 AA compliance
- **WCAG Form Requirements**: Error identification (3.3.1), labels or instructions (3.3.2), error suggestion (3.3.3), input purpose (1.3.5)
- **Touch Target Requirement**: WCAG 2.5.5 — minimum 44x44px for all interactive elements
- **Forms in the App**: Creation wizard (7 steps), character sheet edit mode, campaign creation, rest dialogs, level-up dialog, PDF export options, settings
- **Search Inputs**: Skill matrix search, SRD monster search, spell browser search, NPC autocomplete — all need `role="combobox"` pattern
- **Known Small Targets**: Proficiency circles (~24px), spell slot circles (~20px), death save circles, condition badge X buttons, skill matrix cells

## Tasks

- [ ] **T41.5.1** — **Error messages:** all form validation errors must be associated with their input via `aria-describedby`. Error text must be visible (not just a red border). Screen reader announcement: when an error appears, use `aria-live="polite"` on the error container
- [ ] **T41.5.2** — **Required fields:** mark required fields with both a visual indicator (asterisk) and `aria-required="true"`. Group related required fields with `<fieldset>` and `<legend>` where appropriate
- [ ] **T41.5.3** — **Wizard step progress:** the creation wizard's step sidebar must announce current step: "Step 3 of 7: Ability Scores." Use `aria-current="step"` on the active step
- [ ] **T41.5.4** — **Auto-complete and search inputs:** the skill matrix search, SRD monster search, spell browser search, and NPC autocomplete must use `role="combobox"` with proper `aria-expanded`, `aria-activedescendant`, and `aria-controls` attributes
- [ ] **T41.5.5** — **Touch targets:** verify all interactive elements have a minimum tap target of 44x44px (WCAG 2.5.5). Proficiency circles, spell slot circles, and condition badges are the most likely violators — increase hit areas with padding or invisible touch-target expansions

## Acceptance Criteria

- All form validation errors are associated with their input via `aria-describedby`
- Error text is visible (not just a red border) and announced by screen readers via `aria-live="polite"`
- Required fields display a visual asterisk indicator and have `aria-required="true"`
- Related required fields are grouped with `<fieldset>` and `<legend>`
- Creation wizard announces current step as "Step N of 7: [Step Name]" using `aria-current="step"`
- All search/autocomplete inputs use `role="combobox"` with proper `aria-expanded`, `aria-activedescendant`, and `aria-controls`
- All interactive elements have a minimum tap target of 44x44px
- Proficiency circles, spell slot circles, death save circles, and condition badge X buttons meet the 44x44px minimum (via padding or invisible touch-target expansion)
- Skill matrix cells meet the minimum touch target size

## Dependencies

- All Phase 1-5 features complete (form audit spans entire app)
- Phase 2 creation wizard (step progress)
- Phase 4 session play elements (spell slots, conditions, proficiency circles)
- Phase 5 search inputs (monster search, NPC autocomplete)

## Notes

- Small interactive elements (proficiency circles at ~24px, spell slot circles at ~20px) can meet the 44x44px target by adding transparent padding around the visible element — the touch area expands without changing the visual layout
- The combobox pattern is complex — consider using a library like downshift or Radix UI's combobox if the implementation is difficult
- Error messages should be specific and actionable (e.g., "Character name is required" not just "Required")
- Test with both keyboard and touch to verify touch target sizes work for both input methods
