# Epic 41: Accessibility Audit & Remediation

> **Phase 6: Polish & Export** | Weeks 11-12

## Goal

Achieve WCAG 2.1 AA compliance across the entire application. Every interactive element must be keyboard navigable, all content must meet color contrast requirements, screen readers must be able to navigate the full character sheet, and all animations must respect reduced motion preferences.

## Stories

| Story | Title | Tasks | Focus |
|-------|-------|-------|-------|
| 41.1 | Keyboard Navigation Audit | 6 | Tab order, focus trapping, keyboard shortcuts, interactive elements, drag-and-drop alternatives, focus indicators |
| 41.2 | Screen Reader Compatibility | 10 | ARIA labels, ability scores, skills, dice rolls, spell slots, death saves, gallery cards, combat tracker, modals, tables |
| 41.3 | Color Contrast & Visual Accessibility | 5 | Contrast audit, color-blind safe indicators, HP bar, dice results, high contrast mode |
| 41.4 | Reduced Motion & Animation Preferences | 4 | Animation audit, prefers-reduced-motion, in-app toggle, loading states |
| 41.5 | Form Accessibility | 5 | Error messages, required fields, wizard progress, search inputs, touch targets |

## Technical Approach

- **WCAG 2.1 AA Standard:** 4.5:1 contrast ratio for normal text, 3:1 for large text
- **Keyboard Navigation:** Full tab order audit, focus trapping in modals, 9 keyboard shortcuts
- **Screen Reader Support:** ARIA labels on all form controls, meaningful announcements for game elements
- **Color-Blind Safe:** Shape distinctions (not just color) for proficiency, spell slots, conditions
- **Reduced Motion:** Respect `prefers-reduced-motion` media query plus in-app toggle
- **Touch Targets:** Minimum 44x44px for all interactive elements (WCAG 2.5.5)

## Dependencies

- All Phase 1-5 features complete (accessibility audit spans the entire app)
- All 5 stories can be worked in parallel

## Key Deliverables

- Full keyboard navigation across entire app with 9 keyboard shortcuts
- Screen reader compatibility for all character sheet elements, dice rolls, combat tracker
- Color contrast compliance with high contrast mode toggle
- Reduced motion support with system preference detection and in-app toggle
- Form accessibility with proper error messaging, required field indicators, combobox patterns

## Testing Summary

| Story | Unit | Functional | E2E | Total |
|-------|------|-----------|-----|-------|
| 41.1 — Keyboard Navigation Audit | 2 | 7 | 5 | 14 |
| 41.2 — Screen Reader Compatibility | 0 | 11 | 3 | 14 |
| 41.3 — Color Contrast & Visual Accessibility | 3 | 8 | 3 | 14 |
| 41.4 — Reduced Motion & Animation Preferences | 3 | 7 | 3 | 13 |
| 41.5 — Form Accessibility | 0 | 8 | 4 | 12 |
| **Totals** | **8** | **41** | **18** | **67** |

### Key Gaps Found
- No specification for skip navigation links or landmark regions (main, nav, aside)
- Actual screen reader testing (VoiceOver, NVDA, TalkBack) not part of automated test plan -- only ARIA attributes verified
- Windows High Contrast Mode (forced-colors media query) support not specified
- Combobox library choice (downshift vs. Radix UI) not resolved
- Error summary at top of forms for screen reader users not specified
- Conflict resolution between system reduced motion preference and in-app toggle not fully clarified
