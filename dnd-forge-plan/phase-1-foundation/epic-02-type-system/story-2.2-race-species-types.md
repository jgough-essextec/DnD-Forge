# Story 2.2 — Race & Species Types

> **Epic 2: Complete Type System** | **Phase 1: Foundation** (Weeks 1-2)

## Description
As a developer, I need complete type definitions for races so the data layer and wizard can present race options with full trait information.

## Technical Context
- **App**: D&D Character Forge — full-stack Django + React web application for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, React Query (server state), Zustand (UI state), Django REST Framework, PostgreSQL, React Router
- **Architecture**: Django REST API backend, React SPA frontend, PostgreSQL persistence, Django session auth
- **Domain**: D&D 5th Edition SRD — 9 races (with subraces), 12 classes (with subclasses), ability scores, skills, spells, equipment, backgrounds, feats
- **D&D 5e Races**: There are 9 core races, each with ability score increases, traits, senses, languages, and some with subraces:
  - Dwarf (Hill, Mountain), Elf (High, Wood, Dark/Drow), Halfling (Lightfoot, Stout), Human (standard, Variant), Dragonborn (10 ancestry types), Gnome (Forest, Rock), Half-Elf, Half-Orc, Tiefling
- **Size categories**: Creatures can be Tiny, Small, Medium, or Large. Most PC races are Medium; Halfling and Gnome are Small
- **Damage types**: 13 types used throughout the game: Acid, Bludgeoning, Cold, Fire, Force, Lightning, Necrotic, Piercing, Poison, Psychic, Radiant, Slashing, Thunder. Races can grant resistance (half damage), immunity (no damage), or vulnerability (double damage) to specific types
- **Senses**: Darkvision (most common, 60ft for most races), Blindsight, Tremorsense, Truesight — each with a range in feet
- **Racial traits**: Each race has unique traits with mechanical effects. Examples: Dwarven Resilience (poison resistance), Fey Ancestry (advantage vs charm), Lucky (reroll natural 1s), Breath Weapon (Dragonborn)
- **Race choices**: Some races require player choices during character creation: Half-Elf gets +1 to two abilities and 2 skill proficiencies of choice; High Elf gets a wizard cantrip; Variant Human gets a feat
- **MechanicalEffect**: A union type (defined in Story 2.3) that represents calculable game effects like AC bonuses, extra damage, advantage/disadvantage, proficiency modifications

## Tasks
- [ ] **T2.2.1** — Define `Size` type: `'Tiny' | 'Small' | 'Medium' | 'Large'`
- [ ] **T2.2.2** — Define `DamageType` enum for all 13 damage types (Acid, Bludgeoning, Cold, Fire, Force, Lightning, Necrotic, Piercing, Poison, Psychic, Radiant, Slashing, Thunder)
- [ ] **T2.2.3** — Define `Resistance` interface: `{ damageType: DamageType; type: 'resistance' | 'immunity' | 'vulnerability' }`
- [ ] **T2.2.4** — Define `Sense` interface: `{ type: 'darkvision' | 'blindsight' | 'tremorsense' | 'truesight'; range: number }`
- [ ] **T2.2.5** — Define `RacialTrait` interface: `{ id: string; name: string; description: string; mechanicalEffect?: MechanicalEffect }`
- [ ] **T2.2.6** — Define `Subrace` interface: `{ id: string; name: string; abilityScoreIncrease: Partial<AbilityScores>; traits: RacialTrait[]; additionalLanguages?: string[] }`
- [ ] **T2.2.7** — Define `Race` interface with all fields: `id, name, description, abilityScoreIncrease, age, size, speed, senses, traits, languages, subraces, proficiencies, resistances, innateSpellcasting?`
- [ ] **T2.2.8** — Define `RaceSelection` interface (what gets saved on the character): `{ raceId: string; subraceId?: string; chosenLanguages?: string[]; chosenCantrip?: string; chosenSkills?: string[] }` — accounting for races with choices (e.g., High Elf gets a wizard cantrip, Half-Elf gets 2 skills)

## Acceptance Criteria
- All types compile with zero TypeScript errors under strict mode
- `DamageType` includes all 13 damage types
- `Resistance` can represent resistance, immunity, and vulnerability
- `Race` interface can fully represent all 9 SRD races including their subraces and traits
- `RaceSelection` captures all player choices made during race selection (ability score allocation for Half-Elf, cantrip for High Elf, skills for Half-Elf, feat for Variant Human)
- `Subrace` carries its own ability score increases and traits separate from the parent race

## Testing Requirements

### Unit Tests (Vitest)
_For pure functions, calculations, data transforms, utilities, type guards, validators_

- `should define DamageType enum with all 13 damage types`
- `should define Size type with Tiny, Small, Medium, and Large values`
- `should define Resistance interface with damageType, and resistance/immunity/vulnerability type`
- `should define Sense interface supporting darkvision, blindsight, tremorsense, truesight with range`
- `should define Race interface with all required fields (id, name, abilityScoreIncrease, size, speed, traits, subraces)`
- `should define RaceSelection capturing raceId, subraceId, chosenLanguages, chosenCantrip, chosenSkills`
- `should define Subrace interface with own abilityScoreIncrease and traits`
- `should allow RacialTrait to have optional mechanicalEffect`

### Test Dependencies
- No mock data needed — these are type compilation tests
- Depends on AbilityScores and SkillName types from Story 2.1

## Identified Gaps

- **Edge Cases**: No specification for how to represent Dragonborn's 10 draconic ancestry types within the Subrace model (may need a variant or ancestry array)
- **Dependency Issues**: MechanicalEffect type is referenced but defined in Story 2.3; circular dependency risk if not placed in shared types file

## Dependencies
- **Depends on:** Story 2.1 (uses AbilityScores, SkillName types)
- **Blocks:** Story 2.8 (Character master type includes RaceSelection), Story 3.1 (Race data files must conform to Race type)

## Notes
- The `MechanicalEffect` type is defined in Story 2.3 (Class types) since it is used most heavily for class features. Race types should reference it but it may need to be defined in a shared types file
- Dragonborn is unique in having 10 draconic ancestry options, each granting a different damage type for Breath Weapon and a corresponding damage resistance. This could be modeled as sub-variants within the race
- Variant Human is modeled as a subrace of Human, where the standard Human gets +1 to all abilities and the variant gets +1 to two + a feat + a skill
- Innate spellcasting (e.g., Tiefling's Infernal Legacy) should be typed as optional because not all races have it, and it may include level-gated spells (e.g., hellish rebuke at level 3)
