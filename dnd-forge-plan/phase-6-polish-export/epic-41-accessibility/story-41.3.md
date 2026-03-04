# Story 41.3 — Color Contrast & Visual Accessibility

> **Epic 41: Accessibility Audit & Remediation** | **Phase 6: Polish & Export** (Weeks 11-12)

## Description

As a player with low vision or color blindness, I need the app to have sufficient contrast and not rely solely on color to convey information. This story covers a full contrast audit of the dark fantasy theme, adding shape-based indicators alongside color for proficiency/spell slots/conditions, ensuring HP bar and dice results don't rely on color alone, and implementing a high contrast mode toggle.

## Technical Context

- **App**: D&D Character Forge — local-first React PWA for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, Zustand (state), Dexie.js (IndexedDB), React Router, jsPDF (PDF export), Playwright (E2E testing)
- **Architecture**: No backend, pure client-side, offline-capable PWA, IndexedDB for persistence
- **Prior Phases Available**: Phases 1-5 (complete character creation, sheet display, session play, DM/campaign features)
- **Performance Targets**: Bundle <500KB, FCP <1.5s, TTI <3s, Lighthouse >90
- **Accessibility Target**: WCAG 2.1 AA compliance
- **WCAG Contrast Requirements**: 4.5:1 for normal text, 3:1 for large text (WCAG 1.4.3), use of color not sole means of conveying info (WCAG 1.4.1)
- **Dark Fantasy Theme Color Audit**:
  - `text-primary (#eee8d5) on bg-primary (#1a1a2e)` = ~11.2:1 (passes)
  - `text-secondary (#93a1a1) on bg-primary (#1a1a2e)` = ~5.8:1 (passes)
  - `text-muted (#657b83) on bg-primary (#1a1a2e)` = ~3.5:1 (FAILS — needs to be lightened to ~#7d9199 for 4.5:1)
  - `accent-gold (#e8b430) on bg-primary (#1a1a2e)` = ~7.1:1 (passes for large text, verify for small text)
  - Condition badge colors (red, orange, yellow, green) on their backgrounds need audit
- **Color-Blind Safe Indicators**: Shape distinctions required — filled circle (proficient), empty circle (not proficient), double-ring (expertise). Text labels alongside color badges
- **High Contrast Mode**: User preference toggle stored in IndexedDB, applied via CSS class on root element

## Tasks

- [ ] **T41.3.1** — **Contrast audit:** test every text/background combination against WCAG 2.1 AA requirements (4.5:1 for normal text, 3:1 for large text). The dark fantasy theme poses specific challenges:
  - `text-primary (#eee8d5) on bg-primary (#1a1a2e)` = ~11.2:1 (passes)
  - `text-secondary (#93a1a1) on bg-primary (#1a1a2e)` = ~5.8:1 (passes)
  - `text-muted (#657b83) on bg-primary (#1a1a2e)` = ~3.5:1 (FAILS) — needs to be lightened to ~#7d9199 for 4.5:1
  - `accent-gold (#e8b430) on bg-primary (#1a1a2e)` = ~7.1:1 (passes for large text, verify for small text)
  - Audit all condition badge colors (red, orange, yellow, green) on their backgrounds
- [ ] **T41.3.2** — **Color-blind safe indicators:** proficiency circles, spell slot circles, and condition badges must not rely solely on color. Add shape distinctions: filled circle (proficient), empty circle (not proficient), double-ring (expertise). Condition badges include text labels alongside colors
- [ ] **T41.3.3** — **HP bar accessibility:** the green/yellow/red HP gradient must include a text overlay showing the numeric value. Don't rely on color alone to communicate HP status
- [ ] **T41.3.4** — **Dice result indicators:** critical hit (nat 20) and fumble (nat 1) use gold/red highlights. Add text labels: "CRITICAL!" and "FUMBLE!" in addition to the color change
- [ ] **T41.3.5** — **High contrast mode:** a user preference toggle that increases all border weights, text contrast, and reduces transparency/overlay effects. Stored in preferences, applied via a CSS class on the root element

## Acceptance Criteria

- All text/background combinations meet WCAG 2.1 AA contrast requirements (4.5:1 normal, 3:1 large)
- `text-muted` color is lightened from #657b83 to ~#7d9199 (or equivalent) to achieve 4.5:1 ratio
- All condition badge colors meet contrast requirements on their backgrounds
- Proficiency is indicated by shape (filled/empty/double-ring) not just color
- Spell slot circles use shape distinctions (not just color) to indicate filled/empty
- Condition badges include text labels alongside color coding
- HP bar displays numeric value as text overlay (not just color gradient)
- Critical hit and fumble dice results show text labels ("CRITICAL!" / "FUMBLE!") alongside color highlights
- High contrast mode toggle is available in settings/preferences
- High contrast mode increases border weights, text contrast, and reduces transparency effects
- High contrast preference persists across sessions (stored in IndexedDB)

## Dependencies

- All Phase 1-5 features complete (contrast audit spans entire app)
- Phase 3 preferences system (for high contrast mode storage)

## Notes

- Use a contrast checking tool (e.g., WebAIM Contrast Checker) to verify all color combinations
- The text-muted color fix (#657b83 to ~#7d9199) will affect muted text throughout the app — verify it still looks good visually
- Condition badges already have text in Phase 4, but verify the text is visible alongside the color coding
- High contrast mode should be a CSS class (`.high-contrast`) on the root element that can override specific styles
