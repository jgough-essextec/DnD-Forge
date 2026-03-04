# Story 2.10 — UI State & Store Types

> **Epic 2: Complete Type System** | **Phase 1: Foundation** (Weeks 1-2)

## Description
As a developer, I need types for all application-level state management.

## Technical Context
- **App**: D&D Character Forge — local-first React PWA for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, Zustand (state), Dexie.js (IndexedDB), React Router
- **Architecture**: No backend, pure client-side, offline-capable PWA, IndexedDB for persistence
- **Domain**: D&D 5th Edition SRD — 9 races (with subraces), 12 classes (with subclasses), ability scores, skills, spells, equipment, backgrounds, feats
- **Wizard state**: The character creation wizard is a multi-step form that must persist state across page navigation. Uses Zustand with sessionStorage persist middleware. Steps include: race selection, class selection, ability score assignment, background selection, equipment selection, spell selection
- **UI state**: Transient application state for modal management, sidebar visibility, edit mode toggling, mobile navigation, and dice roller panel. This state does not persist across sessions
- **Die types**: The 7 standard D&D dice: d4, d6, d8, d10, d12, d20, d100 (percentile). Used throughout the app for rolls, damage, hit points, etc.
- **Dice rolls**: Each roll records the dice used, individual results, modifier, total, optional label (e.g., "Attack Roll"), advantage/disadvantage mode, and timestamp. Roll history is maintained in the dice store with a configurable maximum
- **User preferences**: Persistent settings for dice animations, auto-calculate toggle, theme selection (dark/light), default ability score method, and tooltip visibility

## Tasks
- [ ] **T2.10.1** — Define `WizardState` interface: `{ currentStep: number; raceSelection?: RaceSelection; classSelection?: ClassSelection; abilityScores?: AbilityScores; abilityScoreMethod?: string; backgroundSelection?: BackgroundSelection; equipmentSelections?: any[]; spellSelections?: string[]; isComplete: boolean }`
- [ ] **T2.10.2** — Define `UIState` interface: `{ activeModal: string | null; sidebarOpen: boolean; editMode: boolean; mobileNavOpen: boolean; diceRollerOpen: boolean }`
- [ ] **T2.10.3** — Define `DieType` type: `'d4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20' | 'd100'`
- [ ] **T2.10.4** — Define `DiceRoll` interface: `{ id: string; dice: { type: DieType; count: number }[]; results: number[]; modifier: number; total: number; label?: string; advantage?: boolean; disadvantage?: boolean; timestamp: Date }`
- [ ] **T2.10.5** — Define `UserPreferences` interface: `{ diceAnimations: boolean; autoCalculate: boolean; theme: 'dark' | 'light'; defaultAbilityScoreMethod: string; showTooltips: boolean }`
- [ ] **T2.10.6** — Create a barrel export file `types/index.ts` that re-exports every type for clean imports

## Acceptance Criteria
- All types compile with zero TypeScript errors under strict mode
- `WizardState` includes fields for every step of the character creation wizard
- `UIState` covers all transient UI state needed by the application
- `DieType` includes all 7 standard D&D dice
- `DiceRoll` captures complete roll data including advantage/disadvantage and timestamp
- `UserPreferences` covers all user-configurable settings
- The barrel export file at `types/index.ts` re-exports all types from all Story 2.x files, enabling `import { Character, Spell, Race } from '@/types'`

## Testing Requirements

### Unit Tests (Vitest)
_For pure functions, calculations, data transforms, utilities, type guards, validators_

- `should define DieType with all 7 D&D dice (d4, d6, d8, d10, d12, d20, d100)`
- `should define DiceRoll with dice array, results, modifier, total, and timestamp`
- `should define DiceRoll with optional advantage and disadvantage boolean flags`
- `should define WizardState with currentStep and isComplete fields`
- `should define UIState with activeModal, sidebarOpen, editMode, mobileNavOpen, diceRollerOpen`
- `should define UserPreferences with diceAnimations, autoCalculate, theme, showTooltips`
- `should export barrel file types/index.ts re-exporting all types from Stories 2.1-2.10`
- `should import Character, Spell, Race from @/types barrel export`

### Test Dependencies
- No mock data needed — these are type compilation and barrel export verification tests
- Depends on types from Stories 2.1, 2.2, 2.3, 2.6

## Identified Gaps

- **Edge Cases**: WizardState.equipmentSelections is typed as `any[]` which bypasses type safety; should be refined
- **Edge Cases**: UserPreferences.defaultAbilityScoreMethod is a string rather than a union type
- **Edge Cases**: WizardState does not include characterName field (noted in story notes but not in the type definition)

## Dependencies
- **Depends on:** Story 2.1 (AbilityScores), Story 2.2 (RaceSelection), Story 2.3 (ClassSelection), Story 2.6 (BackgroundSelection)
- **Blocks:** Epic 6 (Zustand stores use these types), Epic 7 (Dice engine uses DieType)

## Notes
- `DieType` is a foundational type used by the dice engine (Epic 7), damage calculations (Epic 4), and equipment types (Story 2.4). It should be defined here or in a shared types location
- The barrel export file (`types/index.ts`) is critical for developer experience — it allows importing any type from a single location rather than remembering which file each type lives in
- `WizardState.equipmentSelections` is typed as `any[]` initially because the exact structure depends on how equipment choice groups are presented in the UI. This should be refined in Phase 2 when the wizard UI is built
- `UserPreferences.defaultAbilityScoreMethod` is a string rather than a union type to accommodate potential future methods or house rule methods
- Consider adding `WizardState.characterName` as a separate field since it is entered early in the wizard but not part of any selection type
