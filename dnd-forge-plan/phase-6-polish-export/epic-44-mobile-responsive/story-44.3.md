# Story 44.3 — Touch Interaction Polish

> **Epic 44: Mobile Responsive Final Polish** | **Phase 6: Polish & Export** (Weeks 11-12)

## Description

As a player using a touchscreen, I need all interactions to feel native and responsive. This story covers a final audit of touch target sizes (44x44px minimum), swipe gesture polish, long-press behavior documentation and testing, scroll behavior within nested areas, and proper input handling for numeric and text inputs on mobile.

## Technical Context

- **App**: D&D Character Forge — full-stack Django + React web application for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, React Query (server state), Zustand (UI state), Django REST Framework, PostgreSQL, React Router, WeasyPrint (server-side PDF), Playwright (E2E testing)
- **Architecture**: Django REST API backend, React SPA frontend, PostgreSQL persistence, Django session auth
- **Prior Phases Available**: Phases 1-5 (complete character creation, sheet display, session play, DM/campaign features)
- **Performance Targets**: Bundle <500KB, FCP <1.5s, TTI <3s, Lighthouse >90
- **Accessibility Target**: WCAG 2.1 AA compliance
- **Touch Target Minimum**: 44x44px (WCAG 2.5.5)
- **Known Small Targets**: Proficiency circles (~24px), spell slot circles (~20px), death save circles, condition badge X buttons, skill matrix cells — expand with transparent padding
- **Swipe Gestures**: Bottom-sheet swipe-to-dismiss (dice roller, HP widget on mobile), must not conflict with iOS Safari swipe-to-go-back
- **Long-Press Behaviors**: Die quantity selector, re-roll from history, stat breakdown tooltip — 300ms delay, optional haptic feedback via `navigator.vibrate`
- **Scroll Behavior**: No scroll-jacking, clear scroll boundaries for nested scrollable areas (spell list, roll history)
- **Input Modes**: `inputmode="numeric"` for HP damage/XP/gold inputs, `inputmode="text"` with autocomplete for dice expressions

## Tasks

- [ ] **T44.3.1** — **Touch targets:** final audit of all interactive elements for the 44x44px minimum. Known small targets: proficiency circles (~24px), spell slot circles (~20px), death save circles, condition badge X buttons, skill matrix cells. Expand touch areas with transparent padding
- [ ] **T44.3.2** — **Swipe gestures:** verify bottom-sheet swipe-to-dismiss works smoothly (dice roller on mobile, HP widget). No conflict with browser's swipe-to-go-back gesture on iOS Safari
- [ ] **T44.3.3** — **Long-press behaviors:** document and test all long-press interactions (die quantity selector, re-roll from history, stat breakdown tooltip). Ensure they don't conflict with the OS context menu. Use a 300ms delay and haptic feedback (where supported via `navigator.vibrate`)
- [ ] **T44.3.4** — **Scroll behavior:** no scroll-jacking. Content scrolls naturally. Nested scrollable areas (spell list within a page, roll history within the dice panel) have clear scroll boundaries and don't leak scroll events to the parent
- [ ] **T44.3.5** — **Input handling:** numeric inputs (HP damage, XP amount, gold) use `inputmode="numeric"` to trigger the numeric keyboard on mobile. Dice expression input uses `inputmode="text"` with autocomplete suggestions

## Acceptance Criteria

- All interactive elements meet the 44x44px minimum touch target
- Proficiency circles, spell slot circles, death save circles, condition badge X buttons, and skill matrix cells have expanded touch areas via transparent padding
- Bottom-sheet swipe-to-dismiss works smoothly for dice roller and HP widget on mobile
- Swipe gestures don't conflict with iOS Safari's swipe-to-go-back
- Long-press interactions (die quantity, re-roll, stat tooltip) work with 300ms delay
- Long-press doesn't trigger the OS context menu
- Haptic feedback fires on supported devices for long-press
- Content scrolls naturally with no scroll-jacking
- Nested scroll areas (spell list, roll history) have clear boundaries and don't leak scroll to parent
- Numeric inputs (HP, XP, gold) trigger the numeric keyboard on mobile
- Dice expression input triggers the text keyboard with autocomplete support

## Testing Requirements

### Functional Tests (React Testing Library)
_For component rendering, user interactions, state changes, prop variations_

- `should render proficiency circles with expanded touch area meeting 44x44px minimum via transparent padding`
- `should render spell slot circles with expanded touch area meeting 44x44px minimum`
- `should render death save circles with expanded touch area meeting 44x44px minimum`
- `should set inputmode="numeric" on HP damage, XP amount, and gold inputs`
- `should set inputmode="text" on dice expression input with autocomplete support`

### E2E Tests (Playwright)
_For critical user journeys, multi-step flows, full-page interactions_

- `should verify all interactive elements meet 44x44px minimum touch target`
- `should swipe-to-dismiss bottom sheet (dice roller on mobile) without conflicting with iOS Safari swipe-to-go-back`
- `should trigger long-press interactions (die quantity, re-roll, stat tooltip) with 300ms delay`
- `should not trigger OS context menu on long-press of app elements`
- `should scroll nested areas (spell list, roll history) with clear boundaries without leaking scroll to parent`
- `should trigger numeric keyboard on mobile for HP/XP/gold inputs`

### Test Dependencies
- Touch event simulation for Playwright tests
- Mobile device emulation with touch support
- All interactive elements (proficiency circles, spell slots, death saves, condition badges, skill matrix)
- Bottom sheet components (dice roller, HP widget on mobile)
- Long-press event handlers with 300ms delay

## Identified Gaps

- **Edge Cases**: navigator.vibrate not supported on iOS — progressive enhancement mentioned but no fallback behavior specified
- **Edge Cases**: Scroll behavior with overscroll-behavior: contain not tested across all browsers
- **Mobile/Responsive**: Conflict between horizontal swipe gestures and iOS Safari swipe-to-go-back not fully mitigated
- **Accessibility**: Touch target expansion may affect visual spacing on very small screens (360px)

## Dependencies

- All Phase 1-5 features complete (touch interaction audit spans entire app)
- Story 41.5 (touch targets overlap with accessibility requirements)

## Notes

- The 44x44px minimum can be achieved without changing the visual size — use `padding` or an invisible overlay to expand the touch area
- iOS Safari's swipe-to-go-back can conflict with horizontal swipe gestures — avoid horizontal swipe interactions near the left edge of the screen
- `navigator.vibrate` is not supported on iOS — use it as a progressive enhancement
- `overscroll-behavior: contain` on nested scrollable areas prevents scroll leaking to the parent
- Test on actual mobile devices (not just emulators) for accurate touch interaction behavior
