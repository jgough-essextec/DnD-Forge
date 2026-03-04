# Epic 46: Final Polish & UX Refinements

> **Phase 6: Polish & Export** | Weeks 11-12

## Goal

Address all the small UX improvements deferred from earlier phases. This is the "make it feel great" epic — micro-interactions, loading states, empty states, error states, and delightful details.

## Stories

| Story | Title | Tasks | Focus |
|-------|-------|-------|-------|
| 46.1 | Loading States & Skeleton Screens | 5 | Gallery skeleton, sheet skeleton, campaign skeleton, SRD loading, PDF generation loading |
| 46.2 | Empty States | 1 (10 states) | Audit and implement helpful empty states with icons, messages, and CTAs for all zero-content views |
| 46.3 | Error States & Recovery | 4 | Global error boundary, IndexedDB errors, import errors, network errors (future-proofing) |
| 46.4 | Micro-Interactions & Delight | 7 | Button feedback, toasts, HP animation, level-up celebration, nat-20, card hover, transition polish |
| 46.5 | Manual Override System | 4 | Override indicator, override storage, reset to computed, override persistence across level-ups |
| 46.6 | Settings & Preferences Polish | 3 | Settings page audit, preference persistence, first-run welcome experience |

## Technical Approach

- **Skeleton Screens:** Grey pulsing rectangle placeholders matching actual layouts, fade to real content
- **Empty States:** Illustrative icon + descriptive message + primary action CTA for 10+ zero-content views
- **Error Boundaries:** React error boundary with friendly UI, emergency data export, categorized error handling
- **Micro-Interactions:** 60fps animations using transform/opacity only, respecting reduced motion
- **Manual Overrides:** Dual storage (override + computed), visual indicator (broken chain icon), reset action
- **Settings:** All preferences in IndexedDB, immediate application, survive restarts

## Dependencies

- Addresses deferred items from Phases 3-5 (manual overrides, detailed gallery cards, section edit toggles)
- Should be done last as it addresses remaining rough edges
- Stories can be worked in parallel

## Key Deliverables

- Skeleton loading screens for gallery, character sheet, campaign dashboard, SRD data, PDF generation
- 10+ empty state designs with helpful CTAs
- Global error boundary with emergency data export
- Polished micro-interactions (button press, HP change, level-up, nat-20, card hover)
- Manual override system for computed character values
- Complete settings page with first-run welcome experience
