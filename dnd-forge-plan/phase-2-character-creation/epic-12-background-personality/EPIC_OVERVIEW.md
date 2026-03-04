# Epic 12: Background & Personality Step
> **Phase 2: Character Creation Wizard** (Weeks 3-4)

## Summary

A combined step for selecting a background (with proficiencies and equipment), defining personality characteristics, entering physical description details, choosing alignment, and optionally writing a backstory. Handles skill overlap detection when a background grants a skill the character already has from class or race, prompting the player to choose a replacement from any skill.

## Stories

| # | Story | Tasks | Description |
|---|-------|-------|-------------|
| 12.1 | Background Selection | 6 | Background card/list selector with proficiency display, skill overlap detection and replacement picker, language/tool choices |
| 12.2 | Personality Characteristics | 6 | Personality traits (2), ideal (1), bond (1), flaw (1) selection from background tables or custom entry, random roll support |
| 12.3 | Character Description & Identity | 8 | Character name, alignment grid, physical appearance fields, appearance notes, backstory, allies/organizations |
| 12.4 | Background Step Validation & State | 3 | Validation of background selection and skill replacements, persistence of all background/personality/description data |

## Technical Scope

- **BackgroundStep.tsx** — Step 4 container with background selector and personality/description sections
- **BackgroundSelector.tsx** — Card/list grid of SRD backgrounds with proficiency details
- **PersonalityEditor.tsx** — Four-section editor for traits, ideals, bonds, flaws with table selection and custom entry
- **CharacterDescription.tsx** — Form for name, alignment, physical appearance, backstory
- Skill overlap detection comparing background skills against class + race skills
- Language picker reuse from Epic 9 (LanguagePicker component)
- Skill chooser reuse from Epic 9 (SkillChooser component)
- Dice engine for random personality roll feature
- Race-appropriate name generation (static name tables per race)
- Alignment 3x3 grid selector (Lawful/Neutral/Chaotic x Good/Neutral/Evil)

## Dependencies

- **Depends on:** Epic 8 (Wizard Shell), Epic 9 (race skills and language picker for overlap/reuse), Epic 10 (class skills for overlap detection), Phase 1 SRD background data, Phase 1 dice engine
- **Blocks:** Epic 15 (review displays background, personality, and description data)
