# Story 1.2 — Install and Configure Tailwind CSS + shadcn/ui

> **Epic 1: Project Scaffolding & Developer Toolchain** | **Phase 1: Foundation** (Weeks 1-2)

## Description
As a developer, I need the styling framework configured so all components can use utility-first CSS and pre-built accessible UI components.

## Technical Context
- **App**: D&D Character Forge — full-stack Django + React web application for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, React Query (server state), Zustand (UI state), Django REST Framework, PostgreSQL, React Router
- **Architecture**: Django REST API backend, React SPA frontend, PostgreSQL persistence, Django session auth
- **Domain**: D&D 5th Edition SRD — 9 races (with subraces), 12 classes (with subclasses), ability scores, skills, spells, equipment, backgrounds, feats
- **Styling approach**: Tailwind CSS v3 for utility-first styling with a custom dark fantasy theme. shadcn/ui provides accessible, composable component primitives built on Radix UI
- **Color palette**: Dark fantasy theme with `bg-primary: #1a1a2e`, `accent-gold: #e8b430`, and related colors defined in the design spec
- **Typography**: Cinzel for headings (D&D-inspired serif), Inter for body text (clean sans-serif), JetBrains Mono for monospace/code elements
- **Component library**: shadcn/ui components are copied into the project (not installed as a dependency), allowing full customization. Initial set includes the most commonly needed UI primitives

## Tasks
- [ ] **T1.2.1** — Install Tailwind CSS v3 and configure `tailwind.config.ts` with custom theme tokens (colors, fonts, spacing from Section 6.1 of the spec)
- [ ] **T1.2.2** — Configure the dark fantasy color palette as Tailwind custom colors (`bg-primary: #1a1a2e`, `accent-gold: #e8b430`, etc.)
- [ ] **T1.2.3** — Add Google Fonts: Cinzel (headings), Inter (body), JetBrains Mono (monospace) via `@import` in the global CSS
- [ ] **T1.2.4** — Initialize shadcn/ui with `npx shadcn-ui@latest init` and configure the dark theme variant
- [ ] **T1.2.5** — Install initial shadcn/ui component set: Button, Card, Dialog, Input, Select, Tabs, Tooltip, Badge, Separator, ScrollArea, Sheet, DropdownMenu, Table
- [ ] **T1.2.6** — Create a `ThemeProvider` wrapper component that applies the dark fantasy theme globally
- [ ] **T1.2.7** — Build a quick visual test page (`/dev/kitchen-sink`) rendering every installed shadcn component to verify styling

## Acceptance Criteria
- Tailwind CSS utility classes work throughout the application
- Custom dark fantasy color palette is accessible via Tailwind classes (e.g., `bg-primary`, `text-accent-gold`)
- All three Google Fonts load and render correctly (Cinzel for headings, Inter for body, JetBrains Mono for mono)
- shadcn/ui components render with the dark fantasy theme applied
- The kitchen sink page at `/dev/kitchen-sink` shows all installed components with correct styling
- The `ThemeProvider` wraps the app and provides consistent theming

## Testing Requirements

### Unit Tests (Vitest)
_For pure functions, calculations, data transforms, utilities, type guards, validators_

- `should export ThemeProvider component that renders children`
- `should apply dark fantasy theme CSS custom properties`
- `should have correct color values for bg-primary (#1a1a2e) and accent-gold (#e8b430)`

### Functional Tests (React Testing Library)
_For component rendering, user interactions, state changes, prop variations_

- `should render ThemeProvider wrapping child components`
- `should render kitchen sink page with all shadcn components visible`
- `should apply Cinzel font-family to heading elements`
- `should apply Inter font-family to body text elements`
- `should render Button component with dark fantasy styling`
- `should render Card component with correct border and background`

### E2E Tests (Playwright)
_For critical user journeys, multi-step flows, full-page interactions_

- `should load /dev/kitchen-sink page and display all shadcn components`
- `should apply correct Google Fonts (Cinzel, Inter, JetBrains Mono)`
- `should display dark fantasy color palette across all components`

### Test Dependencies
- ThemeProvider wrapper for rendering themed components in tests
- Kitchen sink route must be accessible in test environment

## Identified Gaps

- **Loading/Empty States**: No specification for font loading fallback behavior (FOUT/FOIT)
- **Accessibility**: No contrast ratio requirements specified for dark fantasy color palette
- **Mobile/Responsive**: No specification for how the kitchen sink page renders on mobile viewports
- **Performance**: No font loading performance targets (time to first render with custom fonts)

## Dependencies
- **Depends on:** Story 1.1 (project must be initialized with Vite + React + TypeScript)
- **Blocks:** All UI work in Phases 2-6 depends on the styling framework being configured

## Notes
- shadcn/ui requires a `components.json` configuration file that specifies the style, RSC flag, Tailwind config path, and component directory
- The kitchen sink page is a development-only tool and should be excluded from production builds or gated behind a dev flag
- Tailwind's `content` configuration must include all TypeScript/TSX file paths to ensure class purging works correctly in production
