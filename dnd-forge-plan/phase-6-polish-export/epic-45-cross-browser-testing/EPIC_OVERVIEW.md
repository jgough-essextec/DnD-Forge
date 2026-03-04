# Epic 45: Cross-Browser Testing & Bug Fixes

> **Phase 6: Polish & Export** | Weeks 11-12

## Goal

Verify the app works correctly on all supported browsers (Chrome 90+, Firefox 90+, Safari 15+, Edge 90+, iOS Safari, Chrome Android) and fix any browser-specific bugs. Establish an automated E2E test suite covering 10 critical user flows.

## Stories

| Story | Title | Tasks | Focus |
|-------|-------|-------|-------|
| 45.1 | Cross-Browser Functional Testing | 6 | Test matrix across 6 browsers, Safari/Firefox/Edge-specific issues, mobile browsers, CSS compatibility |
| 45.2 | E2E Test Suite | 10 | Playwright setup, character creation, sheet rendering, dice rolling, session play, level-up, PDF export, campaign flow, import/export, offline |

## Technical Approach

- **Target Browsers:** Chrome 90+, Firefox 90+, Safari 15+, Edge 90+, iOS Safari, Chrome Android
- **Known Risk Areas:** Safari IndexedDB reliability, Firefox @media print, CSS feature support (container queries, :has(), @layer)
- **E2E Framework:** Playwright with pre-created fixtures (Level 5 Fighter, Level 3 Wizard, campaign with 4 characters)
- **CSS Compatibility:** PostCSS autoprefixer in Vite build for vendor prefixes
- **10 Critical E2E Flows:** Character creation (all 12 classes), sheet rendering, dice rolling, session play, level-up, PDF export, campaign flow, import/export, offline operation

## Dependencies

- Should be done after all other Phase 6 changes are complete
- Story 45.1 (manual testing) before Story 45.2 (automated E2E)

## Key Deliverables

- Cross-browser test results for 6 browsers with documented discrepancies
- Playwright E2E test suite with 10 critical flow tests
- Browser-specific bug fixes
- PostCSS autoprefixer configuration

## Testing Summary

| Story | Unit | Functional | E2E | Total |
|-------|------|-----------|-----|-------|
| 45.1 — Cross-Browser Functional Testing | 0 | 0 | 10 | 10 |
| 45.2 — E2E Test Suite | 0 | 0 | 10 | 10 |
| **Totals** | **0** | **0** | **20** | **20** |

### Key Gaps Found
- Samsung Internet testing mentioned as worthwhile but not required
- Virtual keyboard handling on mobile difficult to test with Playwright alone
- Story 40.3 print testing scope overlap with 45.1 cross-browser testing not resolved
- Flaky test detection and retry strategy not specified
- Test isolation with shared IndexedDB state between tests needs clarification
- Character creation tests for all 12 classes parallelization strategy not defined
