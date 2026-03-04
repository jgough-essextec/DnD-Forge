# Epic 40: Print Stylesheet Optimization

> **Phase 6: Polish & Export** | Weeks 11-12

## Goal

Perfect the `@media print` CSS so that printing directly from the browser produces a clean, professional character sheet without needing the server-side PDF export — as a fast alternative for players who just want a quick printout.

## Stories

| Story | Title | Tasks | Focus |
|-------|-------|-------|-------|
| 40.1 | Print Layout Refinement | 6 | Hide UI chrome, force print colors, page breaks, typography, table printing, ink-saving |
| 40.2 | Print-Specific Layouts | 5 | Page 1/2/3 print layouts, gallery print, campaign dashboard print |
| 40.3 | Cross-Browser Print Testing | 3 | Chrome/Firefox/Safari/Edge testing, paper-size accuracy, mobile print |

## Technical Approach

- **@media print CSS:** Override the dark fantasy theme with white background/dark text for printing
- **Page Break Control:** Each character sheet page starts on a new printed page
- **Print-Optimized Typography:** pt-based font sizes (10pt body, 14pt headings, 8pt labels)
- **Ink-Saving Mode:** Optional class that reduces borders, removes decorations, uses lighter grays
- **Cross-Browser:** Tested in Chrome, Firefox, Safari, and Edge with documented discrepancies

## Dependencies

- Phase 3 character sheet layout (print CSS foundation: `styles/character-sheet-print.css`)
- Epic 39 (shares layout knowledge for consistent PDF/print output)

## Key Deliverables

- Refined `styles/character-sheet-print.css`
- Print-specific layouts for all three character sheet pages
- Gallery and campaign dashboard print layouts
- Cross-browser print compatibility

## Testing Summary

| Story | Unit | Functional | E2E | Total |
|-------|------|-----------|-----|-------|
| 40.1 — Print Layout Refinement | 2 | 4 | 4 | 10 |
| 40.2 — Print-Specific Layouts | 0 | 5 | 3 | 8 |
| 40.3 — Cross-Browser Print Testing | 0 | 0 | 7 | 7 |
| **Totals** | **2** | **9** | **14** | **25** |

### Key Gaps Found
- iOS Safari print testing via share sheet difficult to automate with Playwright
- Print color contrast requirements (WCAG for printed output) not specified
- Minimum margin values to avoid clipping across browsers not defined
- Partial page gallery print layout (fewer than 3 characters) not addressed
- Samsung Internet not included in print testing scope
