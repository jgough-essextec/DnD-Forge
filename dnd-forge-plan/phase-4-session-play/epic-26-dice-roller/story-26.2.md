# Story 26.2 — Dice Animation

> **Epic 26: Dice Roller** | **Phase 4: Session Play Features** (Weeks 7-8)

## Description

As a player, I want satisfying dice rolling animations that build excitement and clearly show the result. The animation system renders 3D dice using CSS 3D transforms, with each die type having a distinct shape and color scheme, tumble/settle animation sequences, critical hit/fumble highlights, and configurable sound effects.

## Technical Context

- **App**: D&D Character Forge — full-stack Django + React web application for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, React Query (server state), Zustand (UI state), Django REST Framework, PostgreSQL, React Router
- **Architecture**: Django REST API backend, React SPA frontend, PostgreSQL persistence, Django session auth
- **Prior Phases Available**: Phase 1 (types, SRD data, calculation engine, database, state stores, dice engine), Phase 2 (character creation wizard), Phase 3 (character sheet 3-page display, gallery, import/export, view/edit mode with auto-save)

### Die Visual Design
Each die type has a distinct shape and color scheme:
- **d4**: Green pyramid (tetrahedron)
- **d6**: White cube (hexahedron)
- **d8**: Blue octahedron
- **d10**: Purple decahedron
- **d12**: Red dodecahedron
- **d20**: Gold icosahedron

### Animation Sequence
1. Dice "tumble" with random 3D rotations for a configurable duration
2. Tumble uses CSS `@keyframes` with random rotation values per axis (X, Y, Z)
3. Dice settle to show the result face clearly
4. Multiple dice stagger their animations (50-100ms offset) and scatter within the tray

### Critical Results (d20 Only)
- **Natural 20:** Gold glow flash + success chime
- **Natural 1:** Red glow flash + failure sound

### Animation Speed Settings
- **Fast:** 0.5 seconds
- **Normal:** 1.2 seconds (default)
- **Dramatic:** 2.5 seconds

### Accessibility
- CSS 3D transforms are used instead of Three.js for lighter bundle size (~150KB savings)
- "Reduced Motion" user preference skips tumble animation and shows results with a simple fade-in
- Sound effects are toggled via user preference (default: enabled, from Phase 3 settings)

## Tasks

- [ ] **T26.2.1** — Create `components/dice/DiceAnimation.tsx` — a dice tray component that renders animated dice using CSS 3D transforms. Each die type has a distinct shape and color scheme: d4 (green pyramid), d6 (white cube), d8 (blue octahedron), d10 (purple), d12 (red), d20 (gold)
- [ ] **T26.2.2** — Implement the animation sequence: dice "tumble" with random 3D rotations for 1-2 seconds, then settle to show the result face. The tumble uses CSS `@keyframes` with random rotation values per axis. Final position shows the result clearly
- [ ] **T26.2.3** — Multiple dice: when rolling N dice simultaneously, stagger their animations slightly (50-100ms offset) and position them in a scattered arrangement within the tray
- [ ] **T26.2.4** — Critical hit highlight: when a d20 shows 20, flash the die with a gold glow and play a success chime. When it shows 1, flash with a red glow and play a failure sound
- [ ] **T26.2.5** — Result display: after animation completes, show the total prominently above the dice tray in large font. If there's a modifier, show "Roll: [sum] + [mod] = [total]". If advantage/disadvantage, show both d20 values with the kept one highlighted
- [ ] **T26.2.6** — Sound effects: dice clatter sound during tumble, distinct "landing" sound on settle. Sounds controlled by user preference toggle (from Phase 3 settings). Default: enabled
- [ ] **T26.2.7** — Respect "Reduced Motion" preference: if enabled, skip the tumble animation and instantly show results with a simple fade-in
- [ ] **T26.2.8** — Animation speed: three settings (Fast: 0.5s, Normal: 1.2s, Dramatic: 2.5s) configurable in settings

## Acceptance Criteria

1. Each of the 7 die types renders with its distinct shape and color scheme using CSS 3D transforms
2. Dice tumble with random 3D rotations before settling to show the result face
3. Multiple dice animate with staggered timing and scattered positioning
4. Natural 20 on d20 triggers gold glow and success chime
5. Natural 1 on d20 triggers red glow and failure sound
6. Result total displays prominently after animation, with modifier breakdown
7. Sound effects are toggleable via user settings (default on)
8. Reduced Motion preference skips tumble animation and uses fade-in
9. Animation speed is configurable (Fast 0.5s, Normal 1.2s, Dramatic 2.5s)

## Testing Requirements

### Unit Tests (Vitest)
_For pure functions, calculations, data transforms, utilities, type guards, validators_

- `should generate random 3D rotation keyframes for tumble animation`
- `should calculate stagger offset timing for multiple dice (50-100ms per die)`
- `should return correct shape/color config for each die type (d4=green pyramid, d6=white cube, etc.)`
- `should determine animation duration based on speed setting (Fast=0.5s, Normal=1.2s, Dramatic=2.5s)`

### Functional Tests (React Testing Library)
_For component rendering, user interactions, state changes, prop variations_

- `should render distinct 3D shapes for each of the 7 die types using CSS transforms`
- `should display result total prominently after animation completes`
- `should show "Roll: [sum] + [mod] = [total]" format when modifier is present`
- `should highlight d20 with gold glow when natural 20 is rolled`
- `should highlight d20 with red glow when natural 1 is rolled`
- `should skip tumble animation and use fade-in when reduced motion is enabled`
- `should not play sound effects when sound is toggled off in settings`
- `should render multiple dice with scattered positioning within the tray`
- `should show both d20 values with kept one highlighted for advantage/disadvantage rolls`

### E2E Tests (Playwright)
_For critical user journeys, multi-step flows, full-page interactions_

- `should animate a d20 roll through tumble sequence and settle to show result`
- `should display critical hit gold glow and play chime on natural 20`
- `should respect reduced motion OS preference and skip tumble animation`
- `should change animation speed through settings and verify timing`

### Test Dependencies
- Mock Phase 1 dice engine to return predetermined roll results (e.g., natural 20, natural 1)
- Mock Audio API for sound effect testing
- Mock `prefers-reduced-motion` media query
- CSS animation testing utilities
- Mock settings store for sound/speed preferences

## Identified Gaps

- **Error Handling**: No specification for what happens if CSS 3D transforms are not supported by the browser
- **Loading/Empty States**: No specification for dice tray appearance between rolls (after animation completes, before next roll)
- **Edge Cases**: Behavior when rolling large numbers of dice (e.g., 8d6 fireball) not fully defined for tray layout/scatter; d100 percentile die visual design not specified
- **Accessibility**: No ARIA live region for announcing roll results to screen readers; no specification for result announcement timing
- **Performance**: No frame rate target for CSS 3D animations; no maximum concurrent dice animation count

## Dependencies

- Story 26.1 (Dice Roller Panel) provides the dice tray container
- Phase 1 dice engine provides the actual roll results
- Phase 3 settings for sound toggle and reduced motion preference

## Notes

- CSS 3D transforms chosen over Three.js for Phase 4 (lighter bundle). Three.js upgrade possible as Phase 6 polish
- Sound assets need to be small WAV/MP3 files bundled with the app (offline-capable)
- The result display format changes for advantage/disadvantage rolls (shows both d20 values side by side, with the kept roll highlighted and the discarded roll in strikethrough)
