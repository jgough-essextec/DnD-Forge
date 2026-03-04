# Epic 1: Project Scaffolding & Developer Toolchain
> **Phase 1: Foundation** (Weeks 1-2)

## Summary
A clean, running project with all dependencies installed, configured, and verified. A developer can run `npm run dev` and see a blank app shell with routing.

## Stories
| # | Story | Tasks | Description |
|---|-------|-------|-------------|
| 1.1 | Initialize Project with Vite + React + TypeScript | 5 | Properly configured React TypeScript project with strict mode, path aliases, directory structure, and formatting rules |
| 1.2 | Install and Configure Tailwind CSS + shadcn/ui | 7 | Styling framework with dark fantasy theme, custom color palette, Google Fonts, and shadcn/ui component library |
| 1.3 | Install Runtime Dependencies | 9 | All non-UI runtime dependencies installed and import-verified (Zustand, Dexie, React Router, utilities, PDF, drag-and-drop, animation, icons) |
| 1.4 | Install and Configure Testing Framework | 6 | Vitest test runner with Testing Library, jsdom environment, coverage reporting, and smoke tests |
| 1.5 | Set Up Routing Shell | 6 | React Router with lazy-loaded placeholder pages, responsive navigation layout, and error boundary |

## Technical Scope
- **Build tool:** Vite with React + TypeScript template
- **Styling:** Tailwind CSS v3 with custom dark fantasy theme, shadcn/ui component library
- **Routing:** React Router v6 with lazy-loaded routes
- **Testing:** Vitest + Testing Library + jsdom
- **Key dependencies:** Zustand, Dexie, framer-motion, dnd-kit, jspdf, lucide-react
- **Fonts:** Cinzel (headings), Inter (body), JetBrains Mono (monospace)

## Dependencies
- **Depends on:** Nothing — this is the first epic
- **Blocks:** All subsequent epics (2-7) depend on the project scaffolding being complete
