# Story 40.3 — Cross-Browser Print Testing

> **Epic 40: Print Stylesheet Optimization** | **Phase 6: Polish & Export** (Weeks 11-12)

## Description

As a player using any modern browser, I need consistent print output. This story covers testing and fixing print output across Chrome, Firefox, Safari, and Edge, verifying paper-size accuracy and margin handling, and ensuring mobile print (Chrome Android, iOS Safari) works via OS share sheet or native print.

## Technical Context

- **App**: D&D Character Forge — local-first React PWA for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, Zustand (state), Dexie.js (IndexedDB), React Router, jsPDF (PDF export), Playwright (E2E testing)
- **Architecture**: No backend, pure client-side, offline-capable PWA, IndexedDB for persistence
- **Prior Phases Available**: Phases 1-5 (complete character creation, sheet display, session play, DM/campaign features)
- **Performance Targets**: Bundle <500KB, FCP <1.5s, TTI <3s, Lighthouse >90
- **Accessibility Target**: WCAG 2.1 AA compliance
- **Target Browsers**: Chrome 90+ (primary), Firefox 90+, Safari 15+, Edge 90+
- **Mobile Browsers**: Chrome Android, iOS Safari — print may use OS share sheet for "Print" or "Save as PDF"
- **Known Browser Differences**: Safari handles `break-inside` differently from Chrome. Firefox handles page breaks differently from Chromium browsers
- **Paper Sizes**: US Letter (default) and A4 must render correctly without clipping

## Tasks

- [ ] **T40.3.1** — Test and fix print output in Chrome (primary), Firefox, Safari, and Edge. Document known discrepancies (e.g., Safari handles `break-inside` differently)
- [ ] **T40.3.2** — Test print preview vs. actual printed output for paper-size accuracy. Verify margins don't clip content
- [ ] **T40.3.3** — Mobile print: verify "Print" action works from mobile browsers (Chrome Android, iOS Safari). On mobile, "Print" may use the OS share sheet for "Print" or "Save as PDF"

## Acceptance Criteria

- Print output tested and verified in Chrome, Firefox, Safari, and Edge
- Known discrepancies between browsers are documented with workarounds where possible
- Print preview matches actual printed output in all tested browsers
- Margins do not clip any content in either US Letter or A4 paper sizes
- Mobile print works from Chrome Android using the system print dialog
- Mobile print works from iOS Safari using the share sheet "Print" option
- All character sheet pages (Stats, Backstory, Spells) render correctly in all browsers

## Dependencies

- Stories 40.1 and 40.2 (print styles and layouts must be complete before cross-browser testing)

## Notes

- Safari is the most likely browser to have print CSS differences — prioritize testing there
- Firefox's handling of `page-break-*` vs. `break-*` properties may differ — use both for maximum compatibility
- Mobile print testing requires actual devices or reliable emulators
- Document all browser-specific issues and workarounds in a testing report for future reference
