# Story 42.4 — Core Web Vitals & Lighthouse

> **Epic 42: Performance Optimization** | **Phase 6: Polish & Export** (Weeks 11-12)

## Description

As a developer, I need Lighthouse scores above 90 in all categories. This story covers running baseline Lighthouse audits, optimizing FCP, LCP, CLS, and INP metrics, implementing best practices, and adding SEO meta tags.

## Technical Context

- **App**: D&D Character Forge — full-stack Django + React web application for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, React Query (server state), Zustand (UI state), Django REST Framework, PostgreSQL, React Router, WeasyPrint (server-side PDF), Playwright (E2E testing)
- **Architecture**: Django REST API backend, React SPA frontend, PostgreSQL persistence, Django session auth
- **Prior Phases Available**: Phases 1-5 (complete character creation, sheet display, session play, DM/campaign features)
- **Performance Targets**: Bundle <500KB, FCP <1.5s, TTI <3s, Lighthouse >90 all categories
- **Accessibility Target**: WCAG 2.1 AA compliance
- **Core Web Vitals Targets**:
  - FCP (First Contentful Paint): < 1.5s — critical CSS inlined, font-display: swap, no render-blocking scripts
  - LCP (Largest Contentful Paint): < 2.5s — preload hero fonts and critical images
  - CLS (Cumulative Layout Shift): < 0.1 — explicit dimensions on images, skeleton placeholders, font-display: swap with fallback dimensions
  - INP (Interaction to Next Paint): < 200ms — dice rolls, button clicks, form inputs respond within 200ms
- **Lighthouse Categories**: Performance, Accessibility, Best Practices, SEO
- **Pages to Audit**: Home page (gallery), character sheet, creation wizard, campaign dashboard
- **Best Practices**: HTTPS, no console errors in production, no deprecated APIs, CSP headers, proper cache headers
- **SEO**: Meta tags per page, Open Graph tags, robots.txt, sitemap.xml, WebApplication schema

## Tasks

- [ ] **T42.4.1** — Run Lighthouse audit (Performance, Accessibility, Best Practices, SEO) on the production build. Establish baseline scores for: home page (gallery), character sheet, creation wizard, campaign dashboard
- [ ] **T42.4.2** — **FCP optimization (<1.5s):** ensure critical CSS is inlined or loaded synchronously. Fonts use `font-display: swap`. No render-blocking scripts. Use Vite's `build.cssCodeSplit` for per-route CSS
- [ ] **T42.4.3** — **LCP optimization:** identify the Largest Contentful Paint element on each page (likely the gallery grid or character sheet header). Ensure it renders in <2.5s. Preload hero fonts and critical images
- [ ] **T42.4.4** — **CLS optimization (<0.1):** prevent layout shifts from: font loading (use `font-display: swap` with fallback dimensions), image loading (set explicit width/height on avatar images), dynamic content injection (reserve space for lazy-loaded components with skeleton placeholders)
- [ ] **T42.4.5** — **INP optimization (<200ms):** profile interaction responsiveness. Dice rolls, button clicks, and form inputs must respond within 200ms. Heavy operations (PDF generation, bulk import) use Web Workers or show a blocking modal with progress indicator
- [ ] **T42.4.6** — **Best Practices:** ensure HTTPS (handled by deployment), no console errors in production, no deprecated APIs, Content-Security-Policy headers, proper cache headers for static assets
- [ ] **T42.4.7** — **SEO (if applicable):** proper `<meta>` tags, `<title>` per page, Open Graph tags for share links, robots.txt, sitemap.xml. Add structured data for the app (WebApplication schema)

## Acceptance Criteria

- Lighthouse baseline scores established for gallery, character sheet, creation wizard, and campaign dashboard
- Lighthouse Performance score >90 on all audited pages
- Lighthouse Accessibility score >90 on all audited pages
- Lighthouse Best Practices score >90 on all audited pages
- Lighthouse SEO score >90 on all audited pages
- FCP <1.5s with critical CSS inlined and fonts using `font-display: swap`
- LCP <2.5s with hero fonts and critical images preloaded
- CLS <0.1 with explicit dimensions on all images and skeleton placeholders for lazy content
- INP <200ms for dice rolls, button clicks, and form inputs
- No console errors in production build
- No deprecated APIs used
- Proper `<meta>` tags and `<title>` on each page
- Open Graph tags present for share link previews

## Testing Requirements

### E2E Tests (Playwright)
_For critical user journeys, multi-step flows, full-page interactions_

- `should achieve Lighthouse Performance score >90 on gallery page`
- `should achieve Lighthouse Performance score >90 on character sheet page`
- `should achieve Lighthouse Accessibility score >90 on all audited pages`
- `should achieve Lighthouse Best Practices score >90 on all audited pages`
- `should achieve Lighthouse SEO score >90 on all audited pages`
- `should achieve FCP <1.5s with critical CSS inlined and font-display: swap`
- `should achieve LCP <2.5s with hero fonts and critical images preloaded`
- `should achieve CLS <0.1 with explicit dimensions on all images and skeleton placeholders`
- `should achieve INP <200ms for dice rolls, button clicks, and form inputs`
- `should have no console errors in production build`

### Test Dependencies
- Lighthouse CI integration for automated scoring
- Production build deployed to test environment
- Performance measurement on gallery, character sheet, creation wizard, and campaign dashboard pages
- Multiple Lighthouse runs for median score calculation (3 runs per page)

## Identified Gaps

- **Performance**: No specification for Lighthouse score targets per individual page (just >90 overall)
- **Edge Cases**: Lighthouse scores can vary significantly between runs — no tolerance or retry strategy specified
- **Error Handling**: No specification for what to do if Lighthouse scores are below target after all optimizations
- **Dependency Issues**: SEO meta tags and Open Graph tags are relevant since the app is a server-deployed web application with public URLs

## Dependencies

- Stories 42.1-42.3 (bundle splitting, SRD lazy loading, rendering optimization — measure AFTER optimizations)
- Epic 41 (accessibility audit contributes to Lighthouse Accessibility score)

## Notes

- Run Lighthouse in incognito mode with no extensions for accurate measurements
- Lighthouse scores can vary between runs — take the median of 3 runs for each page
- FCP is heavily influenced by bundle size (Story 42.1) and SRD lazy loading (Story 42.2)
- CLS issues are often caused by web fonts loading late — `font-display: swap` with properly sized fallback fonts helps
- Consider using `@font-face` `size-adjust` and `ascent-override` for minimal CLS during font swap
