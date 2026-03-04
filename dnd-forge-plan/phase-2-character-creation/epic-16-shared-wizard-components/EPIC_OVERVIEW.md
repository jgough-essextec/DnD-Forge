# Epic 16: Shared Wizard Components & Utilities
> **Phase 2: Character Creation Wizard** (Weeks 3-4)

## Summary

Reusable components that multiple wizard steps share -- search/filter bars, card grids, tooltip system, and data display patterns. These components are built alongside or just ahead of the individual step Epics to ensure consistency and reduce duplication. Includes a game term tooltip system for new players, step-specific help panels, first-time onboarding hints, and standardized stat display components.

## Stories

| # | Story | Tasks | Description |
|---|-------|-------|-------------|
| 16.1 | Shared Selection Components | 5 | SelectableCardGrid, SearchFilterBar, DetailSlidePanel, CountSelector, ChoiceGroup -- generic reusable components used across all wizard steps |
| 16.2 | Tooltip & Help System | 4 | GameTermTooltip with D&D terms dictionary, StepHelp collapsible guidance panels, first-time onboarding hints system |
| 16.3 | Modifier & Stat Display Components | 4 | AbilityScoreDisplay block, ProficiencyDot indicator, DiceNotation renderer with click-to-roll, ModifierBadge with color coding |

## Technical Scope

- **SelectableCardGrid.tsx** — Generic responsive card grid (single/multi select) used by race, class, background, spell steps
- **SearchFilterBar.tsx** — Generic search + filter bar with dropdown/toggle/chip filters
- **DetailSlidePanel.tsx** — Animated slide-in panel (right on desktop, bottom sheet on mobile)
- **CountSelector.tsx** — "Choose N from this list" checkbox component for skills, languages, spells
- **ChoiceGroup.tsx** — Radio-button group for equipment choices, fighting style, alignment
- **GameTermTooltip.tsx** — Hover/tap tooltip for D&D game terms with centralized dictionary
- **game-terms.ts** — Dictionary of ~50 common D&D terms with beginner-friendly definitions
- **StepHelp.tsx** — Collapsible "Need Help?" panel with step-specific guidance
- **AbilityScoreDisplay.tsx** — Classic D&D ability score block (modifier + score + label)
- **ProficiencyDot.tsx** — Filled/empty/double/half circle for proficiency indicators
- **DiceNotation.tsx** — Styled dice notation renderer with click-to-roll integration
- **ModifierBadge.tsx** — Color-coded +N/-N modifier badge (green/neutral/red)
- First-time hints system with pulsing borders and dismiss tracking via user preferences

## Dependencies

- **Depends on:** Phase 1 foundation (type system for component prop types, dice engine for DiceNotation click-to-roll)
- **Blocks:** Epics 9-15 (all wizard steps consume these shared components)
