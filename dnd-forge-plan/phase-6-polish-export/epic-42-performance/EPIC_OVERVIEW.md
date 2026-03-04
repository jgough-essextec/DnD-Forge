# Epic 42: Performance Optimization

> **Phase 6: Polish & Export** | Weeks 11-12

## Goal

Meet all non-functional performance requirements — FCP <1.5s, TTI <3s, Lighthouse >90, bundle <500KB gzipped, SRD data lazy-loaded <2MB — through code splitting, lazy loading, memoization, virtual scrolling, and build optimization.

## Stories

| Story | Title | Tasks | Focus |
|-------|-------|-------|-------|
| 42.1 | Bundle Size Analysis & Reduction | 5 | Bundle visualization, code splitting, tree-shaking, font optimization, image optimization |
| 42.2 | SRD Data Lazy Loading | 4 | Data splitting into tiers, DataLoader utility, preloading hints, payload measurement |
| 42.3 | Rendering Performance | 6 | Gallery virtualization, memoization audit, calculation caching, IndexedDB optimization, debouncing, image lazy loading |
| 42.4 | Core Web Vitals & Lighthouse | 7 | Lighthouse audit, FCP, LCP, CLS, INP optimization, best practices, SEO |
| 42.5 | Stress Testing | 5 | 100+ characters, large campaigns, long combats, memory leak detection, IndexedDB limits |

## Technical Approach

- **Code Splitting:** Route-based chunks using React.lazy() and Suspense (Gallery, Sheet, Wizard, DM, Dice, PDF)
- **SRD Data Tiers:** Tier 1 (~50KB always loaded), Tier 2 (~200KB on demand), Tier 3 (~500KB spells on demand), Tier 4 (~300KB monsters on demand)
- **Virtual Scrolling:** react-window or @tanstack/virtual for galleries with 50+ characters
- **Memoization:** React.memo on all card/row components, useMemo for derived calculations, calculation engine caching
- **Font Optimization:** Subset Cinzel to uppercase + digits (~30KB instead of ~100KB), font-display: swap

## Performance Targets

| Metric | Target |
|--------|--------|
| First Contentful Paint | < 1.5s |
| Time to Interactive | < 3s |
| Lighthouse Score | > 90 (all categories) |
| Bundle Size (gzipped) | < 500KB (excluding SRD data) |
| SRD Data Total | < 2MB (lazy-loaded) |
| Gallery Scroll (100+ chars) | 60fps |
| Interaction to Next Paint | < 200ms |
| CLS | < 0.1 |

## Dependencies

- Should follow feature work (Epics 39-41) to measure accurately
- Story 42.1 (Bundle) should be done first as it affects all load times
- Stories 42.4 and 42.5 should be done after optimizations

## Key Deliverables

- Production bundle under 500KB gzipped with route-based code splitting
- SRD data lazy-loaded in 4 tiers, total under 2MB
- Virtual scrolling for large galleries
- Memoized calculation engine
- Lighthouse scores >90 in all categories
- Stress test results for 100+ characters, large campaigns, long combats
