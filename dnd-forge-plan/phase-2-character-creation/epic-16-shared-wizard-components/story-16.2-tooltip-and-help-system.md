# Story 16.2 — Tooltip & Help System

> **Epic 16: Shared Wizard Components & Utilities** | **Phase 2: Character Creation Wizard** (Weeks 3-4)

## Description

As a new player, I need tooltips and contextual help throughout the wizard so I can understand D&D game terms. This story builds a game term tooltip system with a centralized dictionary, step-specific help panels, and a first-time onboarding hints system that highlights interactive areas on first visit.

## Technical Context

- **App**: D&D Character Forge — local-first React PWA for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, Zustand (state), Dexie.js (IndexedDB), React Router
- **Architecture**: No backend, pure client-side, offline-capable PWA, IndexedDB for persistence
- **Phase 1 Foundation Available**: Type system, SRD game data (races, classes, spells, equipment, backgrounds, feats as static JSON), calculation engine, Dexie.js database layer, Zustand stores, dice engine
- **Game Term Dictionary**: ~50 common D&D terms with beginner-friendly definitions. Terms include: Proficiency Bonus, Saving Throw, Ability Check, Ability Modifier, Cantrip, Spell Slot, Hit Die, Hit Points, Armor Class, Initiative, Darkvision, Proficiency, Expertise, Advantage/Disadvantage, etc.
- **GameTermTooltip**: Wraps any D&D game term in the wizard UI with a hover/tap tooltip showing the plain-English definition. Works on both desktop (hover) and mobile (tap)
- **StepHelp**: A collapsible "Need Help?" panel at the top of each wizard step with step-specific guidance for new players. Different help text for each step
- **First-Time Hints**: On the first visit to each step, briefly highlight key interactive areas with a pulsing border and tooltip (onboarding tour). Dismissed after the first interaction. "Seen" flags stored in user preferences (localStorage)

## Tasks

- [ ] **T16.2.1** — Create `components/shared/GameTermTooltip.tsx` — wraps any D&D game term (e.g., "Darkvision", "Proficiency", "Saving Throw", "Cantrip") with a hover/tap tooltip showing a brief plain-English definition. Uses a centralized game terms dictionary
- [ ] **T16.2.2** — Create `data/game-terms.ts` — a dictionary of ~50 common D&D terms with beginner-friendly definitions. Examples: "Proficiency Bonus: A bonus added to rolls for things your character is trained in", "Cantrip: A spell you can cast at will without using a spell slot", "Hit Die: A die rolled to determine hit points gained per level"
- [ ] **T16.2.3** — Create `components/shared/StepHelp.tsx` — a collapsible "Need Help?" panel at the top of each wizard step that provides step-specific guidance for new players. Different help text for each step
- [ ] **T16.2.4** — Implement a "First-Time Hints" system: on the first visit to each step, briefly highlight key interactive areas with a pulsing border and tooltip (like an onboarding tour). Dismiss after the first interaction. Store "seen" flags in user preferences

## Acceptance Criteria

- GameTermTooltip wraps D&D terms with hover (desktop) / tap (mobile) tooltips showing plain-English definitions
- Game terms dictionary contains ~50 entries with beginner-friendly definitions
- StepHelp shows a collapsible "Need Help?" panel with step-specific guidance at the top of each wizard step
- First-Time Hints highlight key interactive areas with pulsing borders on first visit to each step
- Hints are dismissed after the first interaction and "seen" flags are persisted to user preferences
- All tooltip interactions are accessible (keyboard focusable, screen reader compatible)

## Testing Requirements

### Unit Tests (Vitest)
_For pure functions, calculations, data transforms, utilities, type guards, validators_

- `should contain approximately 50 game term entries in the dictionary`
- `should return correct definition for known terms (e.g., "Proficiency Bonus", "Cantrip", "Armor Class")`
- `should return undefined or fallback for unknown terms`

### Functional Tests (React Testing Library)
_For component rendering, user interactions, state changes, prop variations_

- `should render GameTermTooltip wrapping a D&D term with hover tooltip on desktop`
- `should render GameTermTooltip wrapping a D&D term with tap tooltip on mobile`
- `should display plain-English definition from the centralized dictionary in the tooltip`
- `should render StepHelp as a collapsible "Need Help?" panel with step-specific guidance`
- `should show different help text for each wizard step`
- `should highlight key interactive areas with pulsing borders on first visit to each step`
- `should dismiss First-Time Hints after the first interaction`
- `should persist "seen" flags to user preferences so hints don't reappear`
- `should make all tooltip interactions accessible (keyboard focusable, screen reader compatible)`

### E2E Tests (Playwright)
_For critical user journeys, multi-step flows, full-page interactions_

- `should visit Race Step for the first time, see pulsing hints, interact with a hint, and not see it again on return`

### Test Dependencies
- Mock user preferences store for First-Time Hints "seen" flag persistence
- Game terms dictionary fixture
- Step-specific help text fixtures

## Identified Gaps

- **Loading/Empty States**: No specification for what happens if game terms dictionary fails to load
- **Accessibility**: Tooltip keyboard focusability is mentioned but no specific keyboard shortcut (e.g., Escape to dismiss) is defined
- **Mobile/Responsive**: Tooltip positioning on mobile (tap) not specified; could overlap with other UI elements

## Dependencies

- **Depends on:** Phase 1 project scaffolding (React, TypeScript, Tailwind CSS, shadcn/ui)
- **Blocks:** Epics 9-15 (all wizard steps use GameTermTooltip for D&D terms, StepHelp for guidance, and First-Time Hints for onboarding)

## Notes

- **Game Terms Dictionary (sample entries)**:
  - **Proficiency Bonus**: A bonus added to d20 rolls for things your character is trained in. Starts at +2 and increases as you level up
  - **Saving Throw**: A d20 roll to resist or avoid an effect (spell, trap, poison, etc.). You add your ability modifier and proficiency bonus if proficient
  - **Ability Check**: A d20 roll using one of your six abilities to attempt a task. Skills are specialized forms of ability checks
  - **Ability Modifier**: A number derived from your ability score that modifies most d20 rolls. Calculated as (score - 10) / 2, rounded down
  - **Cantrip**: A spell you can cast at will, as many times as you want, without using a spell slot
  - **Spell Slot**: A resource used to cast leveled spells. You have a limited number per day, recovered after a long rest
  - **Hit Die**: A die used to determine hit points. Your class determines which die (d6, d8, d10, or d12)
  - **Armor Class (AC)**: A number representing how hard you are to hit. Higher is better
  - **Initiative**: Your position in the turn order during combat. Roll d20 + DEX modifier
  - **Darkvision**: The ability to see in dim light as if it were bright light, and darkness as dim light, typically within 60 feet
  - **Advantage**: Rolling two d20s and taking the higher result
  - **Disadvantage**: Rolling two d20s and taking the lower result
- StepHelp text should be concise but helpful — 2-3 sentences per step. Examples:
  - Race Step: "Your race determines your character's physical traits and some innate abilities. Each race has unique bonuses that can complement different playstyles."
  - Ability Scores: "Your six ability scores define what your character is good at. Higher scores mean better modifiers on rolls."
- First-Time Hints should be non-intrusive — pulsing borders that catch attention but don't block interaction. Auto-dismiss after the player interacts with the highlighted element
