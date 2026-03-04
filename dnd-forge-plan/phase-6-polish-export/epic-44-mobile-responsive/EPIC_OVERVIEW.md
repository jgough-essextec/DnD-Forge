# Epic 44: Mobile Responsive Final Polish

> **Phase 6: Polish & Export** | Weeks 11-12

## Goal

Final pass on every screen at every breakpoint (mobile <640px, tablet 640-1024px, desktop 1024-1440px, wide >1440px) resolving all layout issues, touch target sizes, scrolling behaviors, and mobile-specific UX patterns.

## Stories

| Story | Title | Tasks | Focus |
|-------|-------|-------|-------|
| 44.1 | Mobile Layout Audit & Fixes | 5 | Systematic audit at 360/390/428px, gallery, wizard, sheet, combat tracker mobile layouts |
| 44.2 | Tablet Layout Audit & Fixes | 4 | Audit at 768/810/1024px, campaign dashboard, combat tracker, dice roller tablet layouts |
| 44.3 | Touch Interaction Polish | 5 | Touch targets 44x44px, swipe gestures, long-press, scroll behavior, input handling |
| 44.4 | Landscape Mode | 3 | Landscape mobile, landscape tablet, orientation change resilience |

## Technical Approach

- **Breakpoints Tested:** 360px, 390px, 428px, 640px, 768px, 810px, 1024px, 1440px
- **Touch Targets:** Minimum 44x44px (WCAG 2.5.5) with transparent padding expansion where needed
- **Input Modes:** `inputmode="numeric"` for number inputs, `inputmode="text"` with autocomplete for dice expressions
- **Scroll Behavior:** No scroll-jacking, clear scroll boundaries for nested areas
- **Orientation:** Support both portrait and landscape, no state loss on orientation change

## Dependencies

- All Phase 1-5 features complete (audit spans entire app)
- Can be done in parallel with other Phase 6 epics

## Key Deliverables

- All screens verified at 7 breakpoints with no horizontal scrolling or overlapping elements
- Touch targets expanded to 44x44px minimum
- Swipe gestures tested for conflicts with OS gestures
- Numeric keyboards triggered for number inputs
- Landscape mode support for mobile and tablet

## Testing Summary

| Story | Unit | Functional | E2E | Total |
|-------|------|-----------|-----|-------|
| 44.1 — Mobile Layout Audit & Fixes | 0 | 0 | 10 | 10 |
| 44.2 — Tablet Layout Audit & Fixes | 0 | 0 | 9 | 9 |
| 44.3 — Touch Interaction Polish | 0 | 5 | 6 | 11 |
| 44.4 — Landscape Mode | 0 | 0 | 8 | 8 |
| **Totals** | **0** | **5** | **33** | **38** |

### Key Gaps Found
- Safe area inset handling for devices with bottom notches/gesture bars mentioned but not in acceptance criteria
- Mobile rendering performance targets not specified (slower devices)
- CSS container queries support decision not finalized
- Tablet layout changes may affect tab order -- not explicitly addressed
- navigator.vibrate not supported on iOS -- progressive enhancement with no fallback behavior specified
- Chrome DevTools rotation simulation doesn't replicate real device behavior -- actual device testing needed
