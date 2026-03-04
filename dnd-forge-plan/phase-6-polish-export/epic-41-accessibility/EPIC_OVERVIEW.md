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
