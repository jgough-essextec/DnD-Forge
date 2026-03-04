# Epic 8: Wizard Framework & Navigation
> **Phase 2: Character Creation Wizard** (Weeks 3-4)

## Summary

A reusable, multi-step wizard component with progress tracking, validation gating, state persistence, and both guided and freeform creation modes. This is the container that all individual steps plug into. The wizard shell manages step navigation, animated transitions, keyboard shortcuts, conditional step skipping (e.g., spellcasting for non-casters), cascade warnings when prior selections are changed, and session recovery for in-progress characters.

## Stories

| # | Story | Tasks | Description |
|---|-------|-------|-------------|
| 8.1 | Wizard Shell & Step Management | 9 | Top-level wizard controller with step registry, progress bar, navigation buttons, validation gating, back navigation with cascade warnings, state persistence, conditional step skipping, and keyboard navigation |
| 8.2 | Intro Screen & Mode Selection | 6 | Initial wizard screen with mode selection (guided vs. freeform), character/player name entry, and session resume detection |
| 8.3 | Freeform Creation Mode | 7 | Full editable character sheet as a single scrollable form with collapsible sections, real-time derived stat calculation, non-blocking validation, and quick-fill presets |

## Technical Scope

- **CreationWizard.tsx** — Top-level wizard controller reading `currentStep` from Zustand wizard store
- **WizardProgress.tsx** — Responsive sidebar (desktop) / top bar (mobile) with step indicators
- **WizardNavigation.tsx** — Fixed bottom bar with Back/Next/Save buttons and validation gating
- **IntroStep.tsx** — Mode selection entry point with guided and freeform cards
- **FreeformCreation.tsx** — Single-page editable character sheet with accordion sections
- **Zustand wizard store** with sessionStorage persist middleware for state recovery
- **framer-motion** for animated step transitions (slide left/right)
- **Step validation interface** — Each step exposes `validate(): { valid: boolean; errors: string[] }`
- **Conditional step logic** — Skip spellcasting step for non-casters at level 1
- **Keyboard navigation** — Enter/Tab to advance, Escape to go back, number keys to jump

## Testing Summary

| Story | Unit | Functional | E2E | Total |
|-------|------|-----------|-----|-------|
| 8.1 — Wizard Shell & Step Management | 4 | 10 | 4 | 18 |
| 8.2 — Intro Screen & Mode Selection | 0 | 10 | 3 | 13 |
| 8.3 — Freeform Creation Mode | 0 | 10 | 3 | 13 |

### Key Gaps Found
- No specification for corrupted/invalid wizard store data on resume
- Missing loading states for session state restoration
- Keyboard navigation specified but ARIA live region announcements for step changes not defined
- Mobile touch/swipe gestures for step navigation not detailed
- No render time criteria for step transitions or initial wizard load
- Browser back/forward button integration mentioned but not in acceptance criteria

## Dependencies

- **Depends on:** Phase 1 foundation (Zustand stores with persist middleware, type system, calculation engine, React Router)
- **Blocks:** All step Epics (9-15) plug into this wizard shell; Epic 16 shared components are used within the framework
