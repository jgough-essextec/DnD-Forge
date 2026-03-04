# Story 41.4 — Reduced Motion & Animation Preferences

> **Epic 41: Accessibility Audit & Remediation** | **Phase 6: Polish & Export** (Weeks 11-12)

## Description

As a player sensitive to motion, I need all animations to respect my system preference or an in-app toggle. This story covers auditing all animations in the app, wrapping them in `prefers-reduced-motion` checks, providing an in-app toggle that overrides the system preference, and replacing animated loading states with static alternatives.

## Technical Context

- **App**: D&D Character Forge — full-stack Django + React web application for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, React Query (server state), Zustand (UI state), Django REST Framework, PostgreSQL, React Router, WeasyPrint (server-side PDF), Playwright (E2E testing)
- **Architecture**: Django REST API backend, React SPA frontend, PostgreSQL persistence, Django session auth
- **Prior Phases Available**: Phases 1-5 (complete character creation, sheet display, session play, DM/campaign features)
- **Performance Targets**: Bundle <500KB, FCP <1.5s, TTI <3s, Lighthouse >90
- **Accessibility Target**: WCAG 2.1 AA compliance
- **WCAG Motion Requirements**: Animation from interactions can be disabled (WCAG 2.3.3), motion not essential (WCAG 2.3.1)
- **Animations in the App**: Dice tumble animation, page transitions (framer-motion), hover effects, loading spinners, toast notifications, modal open/close, condition badge pulse, level-up celebration, HP bar changes, death save fills
- **Reduced Motion Behavior**: Dice show results instantly (no tumble), page transitions are instant (no slide), modals appear/disappear without animation, HP changes instant (no animated counting), toasts appear without slide-in
- **In-App Toggle**: "Reduce Motion" in settings (Phase 3 Story 25.3), overrides system preference, stored in preferences, applied via CSS class and React context value
- **System Detection**: `prefers-reduced-motion` CSS media query and `window.matchMedia('(prefers-reduced-motion: reduce)')` in JS

## Tasks

- [ ] **T41.4.1** — Audit all animations in the app: dice tumble animation, page transitions (framer-motion), hover effects, loading spinners, toast notifications, modal open/close, condition badge pulse, level-up celebration, HP bar changes, death save fills
- [ ] **T41.4.2** — Wrap all animations in a `prefers-reduced-motion` media query check. When reduced motion is preferred: dice show results instantly (no tumble), page transitions are instant (no slide), modals appear/disappear without animation, HP changes are instant (no animated counting), toasts appear without slide-in
- [ ] **T41.4.3** — In-app "Reduce Motion" toggle in settings (Phase 3 Story 25.3). This overrides the system preference for users who want reduced motion only in this app. Store in preferences, apply via a CSS class and a React context value that animation components check
- [ ] **T41.4.4** — Loading states: replace spinning loaders with static "Loading..." text or a simple progress bar when reduced motion is active

## Acceptance Criteria

- All animations in the app are identified and documented
- When `prefers-reduced-motion: reduce` is set (system level), all animations are disabled or replaced with instant transitions
- Dice results appear instantly without tumble animation when reduced motion is active
- Page transitions (framer-motion) are instant with no slide/fade when reduced motion is active
- Modals appear and disappear without open/close animation when reduced motion is active
- HP bar changes are instant (no animated counting) when reduced motion is active
- Toast notifications appear without slide-in animation when reduced motion is active
- In-app "Reduce Motion" toggle exists in settings and overrides system preference
- Reduced motion preference persists across sessions (stored in the database)
- Loading spinners are replaced with static "Loading..." text or simple progress bar when reduced motion is active
- No vestibular triggers remain when reduced motion is enabled

## Testing Requirements

### Unit Tests (Vitest)
_For pure functions, calculations, data transforms, utilities, type guards, validators_

- `should detect system prefers-reduced-motion preference via window.matchMedia`
- `should provide useReducedMotion() hook returning correct value based on system and in-app preferences`
- `should allow in-app toggle to override system reduced motion preference`

### Functional Tests (React Testing Library)
_For component rendering, user interactions, state changes, prop variations_

- `should show dice results instantly (no tumble animation) when reduced motion is active`
- `should apply instant page transitions (no slide/fade) when reduced motion is active`
- `should show modals without open/close animation when reduced motion is active`
- `should apply instant HP bar changes (no animated counting) when reduced motion is active`
- `should show toast notifications without slide-in animation when reduced motion is active`
- `should replace spinning loaders with static "Loading..." text when reduced motion is active`
- `should persist reduced motion toggle preference in the database across sessions`

### E2E Tests (Playwright)
_For critical user journeys, multi-step flows, full-page interactions_

- `should respect system prefers-reduced-motion and disable all animations app-wide`
- `should toggle in-app reduced motion setting and verify all animations are disabled`
- `should load the app with no vestibular triggers when reduced motion is enabled`

### Test Dependencies
- System `prefers-reduced-motion` media query mock
- useReducedMotion() React context
- All animated components (dice roller, framer-motion pages, modals, HP bar, toasts, loaders)
- MSW preferences API mock for toggle persistence

## Identified Gaps

- **Edge Cases**: Behavior when system preference and in-app toggle conflict not explicitly specified (in-app overrides, but what if system is "reduce" and in-app is "normal"?)
- **Error Handling**: No fallback if `window.matchMedia` is unsupported
- **Performance**: No specification for how instant transitions affect perceived performance vs. animated ones

## Dependencies

- All Phase 1-5 features complete (animation audit spans entire app)
- Phase 3 preferences/settings system (for in-app toggle storage)
- framer-motion library (page transitions)

## Notes

- The in-app toggle should use a React context (e.g., `useReducedMotion()`) that animation components can check
- CSS animations can be disabled globally with `.reduce-motion * { animation-duration: 0s !important; transition-duration: 0s !important; }`
- framer-motion respects `prefers-reduced-motion` natively but may need additional configuration for the in-app toggle
- The condition badge pulse animation and level-up celebration are likely the most jarring animations for motion-sensitive users
