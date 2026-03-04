# Story 46.4 — Micro-Interactions & Delight

> **Epic 46: Final Polish & UX Refinements** | **Phase 6: Polish & Export** (Weeks 11-12)

## Description

As a player, I want the app to feel alive and responsive with satisfying micro-interactions. This story covers button press feedback, standardized toast notifications, HP change animations, level-up celebration effects, natural 20 celebration enhancements, gallery card hover effects, and a final transition polish pass for 60fps throughout.

## Technical Context

- **App**: D&D Character Forge — full-stack Django + React web application for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, React Query (server state), Zustand (UI state), Django REST Framework, PostgreSQL, React Router, WeasyPrint (server-side PDF), Playwright (E2E testing)
- **Architecture**: Django REST API backend, React SPA frontend, PostgreSQL persistence, Django session auth
- **Prior Phases Available**: Phases 1-5 (complete character creation, sheet display, session play, DM/campaign features)
- **Performance Targets**: Bundle <500KB, FCP <1.5s, TTI <3s, Lighthouse >90
- **Accessibility Target**: WCAG 2.1 AA compliance
- **Animation Performance Rule**: Only animate `transform` and `opacity` — never `width`, `height`, `top`, `left` (causes layout thrashing)
- **Reduced Motion**: All animations must respect `prefers-reduced-motion` and the in-app toggle (Story 41.4)
- **Toast Standardization**:
  - Success: green accent, 3 second duration, bottom-right (desktop) / bottom-center (mobile)
  - Error: red accent, persistent until dismissed
  - Info: blue accent, 5 seconds
- **Button Feedback**: scale(0.98) on mousedown, return on mouseup
- **HP Animation**: Green pulse for healing, red pulse for damage, smooth bar width transition
- **Level-Up**: Gold particle effect + "ding" sound (if sounds enabled) + "Welcome to Level [N]!" banner
- **Nat-20**: Gold glow (from Phase 4) + screen-edge flash + optional "Critical!" sound, under 1 second

## Tasks

- [ ] **T46.4.1** — **Button feedback:** all primary buttons have a subtle press animation (scale 0.98 on mousedown, return on mouseup). Disabled buttons are clearly dimmed with `cursor: not-allowed`
- [ ] **T46.4.2** — **Toast notifications:** standardize all toast messages across the app. Success: green accent, 3 second duration, bottom-right position (desktop), bottom-center (mobile). Error: red accent, persistent until dismissed. Info: blue accent, 5 seconds
- [ ] **T46.4.3** — **HP change animation:** when HP changes, the number briefly flashes: green pulse for healing, red pulse for damage. The HP bar smoothly animates from old to new width (unless reduced motion is on)
- [ ] **T46.4.4** — **Level-up celebration:** when a level-up is confirmed, show a brief gold particle effect around the character name and a satisfying "ding" sound (if sounds are enabled). Display: "Welcome to Level [N]!" in a prominent banner that auto-dismisses
- [ ] **T46.4.5** — **Natural 20 celebration:** beyond the gold glow from Phase 4, add a brief screen-edge flash effect and an optional "Critical!" sound. Keep it brief (under 1 second) to not slow down gameplay
- [ ] **T46.4.6** — **Character card hover:** on desktop, gallery cards have a subtle lift effect (translateY(-2px) + shadow increase) on hover. The avatar gently scales up. Click produces a satisfying press
- [ ] **T46.4.7** — **Transition polish:** audit all page transitions and modal animations for smoothness. Target 60fps on all animations. Remove any janky transitions (layout-triggering properties like `width`, `height`, `top` in transitions — use `transform` and `opacity` only)

## Acceptance Criteria

- All primary buttons have press animation (scale 0.98 on mousedown, return on mouseup)
- Disabled buttons are visually dimmed with `cursor: not-allowed`
- Toast notifications are standardized: success (green, 3s), error (red, persistent), info (blue, 5s)
- Toast position is bottom-right on desktop, bottom-center on mobile
- HP changes flash green (healing) or red (damage) with smooth bar width transition
- Level-up shows gold particle effect, "ding" sound (if enabled), and "Welcome to Level [N]!" banner
- Level-up banner auto-dismisses after a few seconds
- Natural 20 shows gold glow + screen-edge flash + optional "Critical!" sound, all under 1 second
- Gallery cards lift on hover (translateY(-2px) + shadow increase) with avatar scale-up
- Gallery card click produces a satisfying press effect
- All animations target 60fps with no jank
- No layout-triggering properties (`width`, `height`, `top`, `left`) used in transitions
- All animations only use `transform` and `opacity` for GPU-accelerated rendering
- All animations respect reduced motion preferences (instant or disabled when reduced motion is on)

## Testing Requirements

### Unit Tests (Vitest)
_For pure functions, calculations, data transforms, utilities, type guards, validators_

- `should define toast notification config: success (green, 3s), error (red, persistent), info (blue, 5s)`
- `should use only transform and opacity properties in all animation definitions (no layout-triggering properties)`

### Functional Tests (React Testing Library)
_For component rendering, user interactions, state changes, prop variations_

- `should apply scale(0.98) on mousedown and return to scale(1) on mouseup for primary buttons`
- `should render disabled buttons with visual dimming and cursor: not-allowed`
- `should position toasts at bottom-right on desktop and bottom-center on mobile`
- `should flash green on HP healing and red on HP damage`
- `should animate HP bar smoothly from old to new width`
- `should display "Welcome to Level [N]!" banner on level-up confirmation that auto-dismisses`
- `should disable all micro-interactions when reduced motion preference is active`
- `should apply translateY(-2px) and shadow increase on gallery card hover (desktop)`

### E2E Tests (Playwright)
_For critical user journeys, multi-step flows, full-page interactions_

- `should show gold particle effect and "Welcome to Level [N]!" banner on level-up`
- `should show gold glow and screen-edge flash on natural 20 dice roll (under 1 second total)`
- `should maintain 60fps on all page transitions and modal animations`
- `should show gallery card hover lift effect on desktop`

### Test Dependencies
- Level-up trigger mechanism for celebration testing
- Dice roll result mock (nat 20 and nat 1) for celebration effects
- Reduced motion preference mock
- Animation performance profiling (fps measurement)
- Sound effects toggle mock (for optional sound testing)
- Gallery card hover event simulation

## Identified Gaps

- **Error Handling**: No specification for behavior if sound effect files fail to load
- **Performance**: Sound effect file size limit (<10KB each) mentioned in notes but not in acceptance criteria
- **Edge Cases**: "Sound Effects" toggle mentioned as needed in settings but not included in acceptance criteria
- **Accessibility**: Screen-edge flash for nat-20 could be a vestibular trigger even under 1 second — not explicitly addressed for reduced motion

## Dependencies

- Story 41.4 (reduced motion — all animations must respect the preference)
- Phase 4 dice rolling (nat-20 gold glow enhancement)
- Phase 4 level-up flow (celebration trigger point)

## Notes

- Sound effects should be optional and off by default — add a "Sound Effects" toggle in settings
- Sound files should be tiny (<10KB each) — use short WAV or OGG clips
- The gold particle effect for level-up can be implemented with CSS animations on absolutely-positioned dot elements
- Screen-edge flash for nat-20 can be a full-viewport overlay that flashes gold and fades out in 300ms
- Test all animations on low-end devices to ensure they maintain 60fps
- Use Chrome DevTools Performance tab to profile animation frame rates
