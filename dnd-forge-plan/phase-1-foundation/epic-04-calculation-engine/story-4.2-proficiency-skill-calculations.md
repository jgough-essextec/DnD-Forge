# Story 4.2 — Proficiency & Skill Calculations

> **Epic 4: Calculation Engine** | **Phase 1: Foundation** (Weeks 1-2)

## Description
As a developer, I need functions for proficiency bonus, skill modifiers, saving throws, and passive scores.

## Technical Context
- **App**: D&D Character Forge — local-first React PWA for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, Zustand (state), Dexie.js (IndexedDB), React Router
- **Architecture**: No backend, pure client-side, offline-capable PWA, IndexedDB for persistence
- **Domain**: D&D 5th Edition SRD — 9 races (with subraces), 12 classes (with subclasses), ability scores, skills, spells, equipment, backgrounds, feats
- **Proficiency bonus formula**: `Math.ceil(level / 4) + 1`. Produces: levels 1-4 = +2, 5-8 = +3, 9-12 = +4, 13-16 = +5, 17-20 = +6
- **Skill modifier calculation**: Base = ability modifier (from the skill's governing ability). Add proficiency bonus if proficient. Double proficiency if expertise. Special cases:
  - **Jack of All Trades** (Bard level 2+): Add half proficiency bonus (rounded down) to ability checks that don't already include proficiency. This applies to skills, initiative, and Counterspell/Dispel Magic checks
  - **Remarkable Athlete** (Champion Fighter level 7+): Add half proficiency bonus (rounded down) to STR, DEX, and CON checks that don't already include proficiency. This is narrower than Jack of All Trades
  - **Reliable Talent** (Rogue level 11+): For proficient skills, treat any d20 roll below 10 as 10. This doesn't affect the modifier but affects minimum roll outcomes
  - **Expertise** (Bard level 3/10, Rogue level 1/6): Double the proficiency bonus for chosen skills
- **Skill-to-ability mapping** (all 18 skills): Acrobatics->DEX, Animal Handling->WIS, Arcana->INT, Athletics->STR, Deception->CHA, History->INT, Insight->WIS, Intimidation->CHA, Investigation->INT, Medicine->WIS, Nature->INT, Perception->WIS, Performance->CHA, Persuasion->CHA, Religion->INT, Sleight of Hand->DEX, Stealth->DEX, Survival->WIS
- **Saving throw modifier**: Ability modifier + proficiency bonus if proficient. Each class grants proficiency in exactly 2 saving throws
- **Passive score formula**: 10 + skill modifier. Advantage on a passive check adds +5, disadvantage subtracts -5. Primary passive scores: Perception, Insight, Investigation (but the system should support any skill)

## Tasks
- [ ] **T4.2.1** — Implement `getProficiencyBonus(level: number): number` — `Math.ceil(level / 4) + 1`
- [ ] **T4.2.2** — Implement `getSkillModifier(character: Character, skill: SkillName): number` — handles proficiency, expertise, Jack of All Trades (Bard), and Remarkable Athlete (Champion Fighter)
- [ ] **T4.2.3** — Implement `getSavingThrowModifier(character: Character, ability: AbilityName): number` — ability mod + proficiency if proficient
- [ ] **T4.2.4** — Implement `getPassiveScore(character: Character, skill: SkillName): number` — `10 + getSkillModifier(...)`, accounting for advantage/disadvantage (+5/-5)
- [ ] **T4.2.5** — Implement `getAllSkillModifiers(character: Character): Record<SkillName, number>` — bulk calculation for sheet display
- [ ] **T4.2.6** — Implement `getAllSavingThrows(character: Character): Record<AbilityName, number>` — bulk calculation
- [ ] **T4.2.7** — Write unit tests: proficiency bonus at every level (1->+2, 5->+3, 9->+4, 13->+5, 17->+6), skill with no proficiency, with proficiency, with expertise, Jack of All Trades interaction, passive perception with proficiency

## Acceptance Criteria
- `getProficiencyBonus()` returns correct values for all levels 1-20
- `getSkillModifier()` correctly handles: non-proficient (just ability mod), proficient (ability mod + proficiency), expertise (ability mod + 2x proficiency), Jack of All Trades (ability mod + half proficiency for non-proficient skills on a Bard), Remarkable Athlete (ability mod + half proficiency for STR/DEX/CON non-proficient checks on a Champion Fighter)
- `getSavingThrowModifier()` correctly adds proficiency for proficient saves
- `getPassiveScore()` returns 10 + skill modifier, with +5/-5 for advantage/disadvantage
- `getAllSkillModifiers()` returns correct modifiers for all 18 skills
- `getAllSavingThrows()` returns correct modifiers for all 6 saving throws
- Unit tests cover all modifier permutations and edge cases

## Testing Requirements

### Unit Tests (Vitest)
_For pure functions, calculations, data transforms, utilities, type guards, validators_

- `should return proficiency bonus +2 for level 1 via getProficiencyBonus`
- `should return proficiency bonus +3 for level 5 via getProficiencyBonus`
- `should return proficiency bonus +6 for level 17 via getProficiencyBonus`
- `should return ability modifier only for non-proficient skill via getSkillModifier`
- `should return ability modifier + proficiency for proficient skill via getSkillModifier`
- `should return ability modifier + double proficiency for expertise skill via getSkillModifier`
- `should add half proficiency for non-proficient skills on Bard level 2+ (Jack of All Trades) via getSkillModifier`
- `should add half proficiency for STR/DEX/CON non-proficient checks on Champion Fighter level 7+ (Remarkable Athlete) via getSkillModifier`
- `should return ability modifier + proficiency for proficient saving throw via getSavingThrowModifier`
- `should return 10 + skill modifier for passive score via getPassiveScore`
- `should add +5 to passive score with advantage via getPassiveScore`
- `should subtract -5 from passive score with disadvantage via getPassiveScore`
- `should return correct modifiers for all 18 skills via getAllSkillModifiers`
- `should return correct modifiers for all 6 saving throws via getAllSavingThrows`

### Test Dependencies
- Character type fixtures with Bard (Jack of All Trades), Champion Fighter (Remarkable Athlete), and Rogue (Expertise) configurations
- getModifier and getEffectiveAbilityScores from Story 4.1

## Identified Gaps

- **Edge Cases**: Jack of All Trades adds half proficiency to initiative (DEX check) but this interaction is only mentioned in notes, not acceptance criteria
- **Edge Cases**: Reliable Talent (Rogue 11+) affects minimum roll outcome but is not modeled in getSkillModifier return value
- **Dependency Issues**: Saving throw proficiency from multiclass (only first class grants saves) requires checking class order in Character.classes array

## Dependencies
- **Depends on:** Story 2.1 (AbilityName, SkillName, SKILL_ABILITY_MAP), Story 2.8 (Character type), Story 4.1 (getModifier, getEffectiveAbilityScores)
- **Blocks:** Story 4.3 (combat calculations use skill/proficiency), Story 4.4 (spell calculations use proficiency bonus), Story 4.8 (validation checks proficiency counts)

## Notes
- Jack of All Trades and Remarkable Athlete do NOT stack. If a character has both (unlikely but possible via multiclass), only Jack of All Trades applies since it is broader
- Jack of All Trades adds half proficiency to initiative checks (since initiative is a DEX ability check). This is a commonly missed rule
- Reliable Talent affects the minimum die roll, not the modifier. The `getSkillModifier` function returns the modifier; Reliable Talent would be applied at roll time. However, it could be useful to flag it for the UI
- The `getSkillModifier` function must look up the character's class features to determine if Jack of All Trades, Remarkable Athlete, or Expertise applies. This means it needs to check: (1) is the character a Bard level 2+? (2) is the character a Champion Fighter level 7+? (3) does the character have expertise in this skill?
- Saving throw proficiency comes from the character's class (each class grants 2 saving throw proficiencies). In multiclass, only the first class grants saving throw proficiencies
