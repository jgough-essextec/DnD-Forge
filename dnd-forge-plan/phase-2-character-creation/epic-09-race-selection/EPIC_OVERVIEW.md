# Epic 9: Race Selection Step
> **Phase 2: Character Creation Wizard** (Weeks 3-4)

## Summary

A visually rich, informative race selection experience that presents all 9 SRD races with their subraces, traits, and required choices, helping players understand what each race offers mechanically and narratively. Handles the non-uniform nature of race choices: Dragonborn ancestry, Half-Elf ability bonuses and skill picks, High Elf cantrip and language, Variant Human feat selection, and standard subrace selection for Dwarves, Elves, Gnomes, and Halflings.

## Stories

| # | Story | Tasks | Description |
|---|-------|-------|-------------|
| 9.1 | Race Card Gallery | 6 | Responsive grid of selectable race cards with key traits, search/filter bar, class synergy badges, and trait tooltips |
| 9.2 | Race Detail Panel | 7 | Slide-in detail panel showing full race information: ability bonuses, traits, languages, proficiencies, speed/senses |
| 9.3 | Subrace Selection | 5 | Subrace selector for races with subraces, Variant Human special handling, Dragonborn ancestry chooser |
| 9.4 | Race-Specific Choice Panels | 6 | Dedicated UI components for Half-Elf ability/skill choices, Variant Human feat picker, High Elf cantrip/language, Dragonborn ancestry |
| 9.5 | Race Step Validation & State | 4 | Validation of all race selections, persistence to wizard store, back-navigation restore, progress sidebar summary |

## Technical Scope

- **RaceStep.tsx** — Step 1 container with responsive card grid and detail panel layout
- **RaceCard.tsx** — Selectable card with race name, trait badges, size/speed icons, tagline
- **RaceDetailPanel.tsx** — Slide-in panel (framer-motion) with full race details
- **SubraceSelector.tsx** — Tabs/mini-cards for subrace options within the detail panel
- **AbilityBonusChooser.tsx** — Reusable ability score picker for Half-Elf and Variant Human
- **SkillChooser.tsx** — Reusable "choose N from list" component for skill selection
- **FeatPicker.tsx** — Feat selection cards with prerequisite checking for Variant Human
- **CantripPicker.tsx** — Wizard cantrip selection for High Elf
- **LanguagePicker.tsx** — Language dropdown excluding already-known languages
- **DragonbornAncestryPicker.tsx** — 10-option ancestry table with damage types and breath weapons
- SRD race data (static JSON from Phase 1)

## Testing Summary

| Story | Unit | Functional | E2E | Total |
|-------|------|-----------|-----|-------|
| 9.1 — Race Card Gallery | 0 | 10 | 3 | 13 |
| 9.2 — Race Detail Panel | 0 | 9 | 2 | 11 |
| 9.3 — Subrace Selection | 0 | 8 | 3 | 11 |
| 9.4 — Race-Specific Choice Panels | 3 | 8 | 3 | 14 |
| 9.5 — Race Step Validation & State | 8 | 4 | 0 | 12 |

### Key Gaps Found
- Missing error handling for SRD race/feat/spell data loading failures
- No loading or empty states defined for race data or filter results
- ARIA labels not specified for race cards, filter controls, pickers, or tooltips
- Race-specific choice clearing on race switch mentioned in notes but not formalized in acceptance criteria
- No touch target sizes or minimum card dimensions specified for mobile

## Dependencies

- **Depends on:** Epic 8 (Wizard Shell — this step plugs into the wizard framework), Epic 16 (shared SelectableCardGrid, SearchFilterBar, DetailSlidePanel, CountSelector), Phase 1 SRD race data
- **Blocks:** Epic 10 (class synergy depends on race selection), Epic 11 (racial ability bonuses), Epic 12 (skill overlap detection), Epic 15 (review aggregates race data)
