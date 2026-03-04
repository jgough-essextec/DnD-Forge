# Epic 1: Project Scaffolding & Developer Toolchain
> **Phase 1: Foundation** (Weeks 1-2)

## Summary
A clean, running project with all dependencies installed, configured, and verified. A developer can run `npm run dev` and see a blank app shell with routing.

## Stories
| # | Story | Tasks | Description |
|---|-------|-------|-------------|
| 1.1 | Initialize Project with Vite + React + TypeScript | 5 | Properly configured React TypeScript project with strict mode, path aliases, directory structure, and formatting rules |
| 1.2 | Install and Configure Tailwind CSS + shadcn/ui | 7 | Styling framework with dark fantasy theme, custom color palette, Google Fonts, and shadcn/ui component library |
| 1.3 | Install Runtime Dependencies | 9 | All non-UI runtime dependencies installed and import-verified (Zustand, @tanstack/react-query, axios, React Router, utilities, drag-and-drop, animation, icons) plus backend requirements.txt (Django, DRF, WeasyPrint, psycopg2, etc.) |
| 1.4 | Install and Configure Testing Framework | 6 | Vitest test runner with Testing Library, jsdom environment, coverage reporting, and smoke tests; pytest + Django TestCase + DRF APITestCase for backend |
| 1.5 | Set Up Routing Shell | 6 | React Router with lazy-loaded placeholder pages, responsive navigation layout, and error boundary |

## Technical Scope
- **Build tool:** Vite with React + TypeScript template
- **Styling:** Tailwind CSS v3 with custom dark fantasy theme, shadcn/ui component library
- **Routing:** React Router v6 with lazy-loaded routes
- **Testing:** Vitest + Testing Library + jsdom (frontend); pytest + Django TestCase + DRF APITestCase (backend)
- **Key dependencies (frontend):** Zustand, @tanstack/react-query, axios, framer-motion, dnd-kit, lucide-react
- **Key dependencies (backend):** Django, Django REST Framework, WeasyPrint, psycopg2, django-cors-headers
- **Fonts:** Cinzel (headings), Inter (body), JetBrains Mono (monospace)

## Testing Summary

| Story | Unit | Functional | E2E | Total |
|-------|------|-----------|-----|-------|
| 1.1 — Initialize Project | 3 | 0 | 3 | 6 |
| 1.2 — Tailwind/shadcn | 3 | 6 | 3 | 12 |
| 1.3 — Runtime Dependencies | 9 | 0 | 1 | 10 |
| 1.4 — Testing Framework | 9 | 0 | 6 | 15 |
| 1.5 — Routing Shell | 3 | 7 | 8 | 18 |
| **Totals** | **27** | **13** | **21** | **61** |

### Key Gaps Found
- Accessibility: No contrast ratios for dark fantasy palette, no keyboard nav specs for navigation, no ARIA labels
- Mobile/Responsive: Tablet viewport behavior (640px-1024px) undefined, font loading fallback behavior not specified
- Performance: No build time targets, no HMR speed targets, no bundle size targets
- Infrastructure: Playwright browser installation dependencies not specified, Node.js version requirement missing
- Error Handling: Nested error boundaries not specified, coverage threshold enforcement unclear

## Dependencies
- **Depends on:** Nothing — this is the first epic
- **Blocks:** All subsequent epics (2-7) depend on the project scaffolding being complete
