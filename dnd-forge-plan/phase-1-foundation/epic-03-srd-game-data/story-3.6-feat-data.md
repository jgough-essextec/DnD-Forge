# Story 3.6 — Feat Data

> **Epic 3: SRD Game Data Layer** | **Phase 1: Foundation** (Weeks 1-2)

## Description
As a developer, I need all SRD feats with prerequisites and mechanical effects.

## Technical Context
- **App**: D&D Character Forge — local-first React PWA for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, Zustand (state), Dexie.js (IndexedDB), React Router
- **Architecture**: No backend, pure client-side, offline-capable PWA, IndexedDB for persistence
- **Domain**: D&D 5th Edition SRD — 9 races (with subraces), 12 classes (with subclasses), ability scores, skills, spells, equipment, backgrounds, feats
- **D&D 5e Feats**: Feats are optional abilities chosen instead of an Ability Score Improvement (ASI) at ASI levels. The DM must allow feats (house rule). Each feat has a name, description, potential prerequisites, and mechanical effects
- **Prerequisites**: Some feats require minimum ability scores (e.g., Heavy Armor Master requires STR 13), specific race (e.g., some racial feats), specific proficiency (e.g., Medium Armor Master requires medium armor proficiency), or other conditions. Many feats have no prerequisites
- **Feat effects**: Can include: +1 to an ability score, new proficiencies, special abilities, modified combat mechanics, spell-like abilities, etc.
- **Feats with ASI**: Several feats include a +1 to an ability score as part of their benefit (e.g., Resilient, Actor, Keen Mind). This is important because taking a feat instead of an ASI usually means losing +2 to an ability score, but feats with +1 partially offset this
- **SRD feats** (the SRD includes a limited set): Alert, Athlete, Actor, Charger, Crossbow Expert, Defensive Duelist, Dual Wielder, Dungeon Delver, Durable, Elemental Adept, Grappler, Great Weapon Master, Healer, Heavily Armored, Heavy Armor Master, Inspiring Leader, Keen Mind, Lightly Armored, Linguist, Lucky, Mage Slayer, Magic Initiate, Martial Adept, Medium Armor Master, Mobile, Moderately Armored, Mounted Combatant, Observant, Polearm Master, Resilient, Ritual Caster, Savage Attacker, Sentinel, Sharpshooter, Shield Master, Skilled, Skulker, Spell Sniper, Tavern Brawler, Tough, War Caster, Weapon Master
- **Variant Human interaction**: Variant Humans get a feat at level 1. The `getAvailableFeats()` function must filter by prerequisites so only valid feats are offered
- **Availability filter**: The utility function `getAvailableFeats(character: Character): Feat[]` checks each feat's prerequisites against the character's current state (ability scores, race, proficiencies, etc.) and returns only the feats the character qualifies for

## Tasks
- [ ] **T3.6.1** — Create `data/feats.ts` with all SRD feats. Each feat must include: id, name, description, prerequisites (ability score minimums, race requirements, proficiency requirements, or none), mechanical effects (ability score increases, new proficiencies, special abilities)
- [ ] **T3.6.2** — Flag which feats include a +1 ability score increase (relevant for ASI/feat choice)
- [ ] **T3.6.3** — Create utility function `getAvailableFeats(character: Character): Feat[]` that filters by prerequisites

## Acceptance Criteria
- All SRD feats are present with complete data
- Prerequisites are correctly specified for feats that have them
- Feats with +1 ability score increases are flagged
- `getAvailableFeats()` correctly filters out feats whose prerequisites the character doesn't meet
- Every feat entry passes TypeScript type checking
- Feats with no prerequisites are available to all characters

## Testing Requirements

### Unit Tests (Vitest)
_For pure functions, calculations, data transforms, utilities, type guards, validators_

- `should export feats array with all SRD feats`
- `should have Heavy Armor Master with prerequisite STR 13`
- `should have feats with +1 ability score increase flagged correctly`
- `should have Alert feat with no prerequisites`
- `should return all feats for a character meeting all prerequisites via getAvailableFeats`
- `should filter out Heavy Armor Master for character with STR 12 via getAvailableFeats`
- `should return feats with no prerequisites for any character via getAvailableFeats`
- `should have every feat pass TypeScript type checking`
- `should flag repeatable feats (e.g., Elemental Adept)`

### Test Dependencies
- Feature, MechanicalEffect types from Story 2.3
- Character type from Story 2.8 for getAvailableFeats testing
- Mock character data with varying ability scores for prerequisite filtering

## Identified Gaps

- **Edge Cases**: Some feats can be taken multiple times but repeatability is not explicitly modeled in the type
- **Edge Cases**: Feats granting spells (Magic Initiate, Ritual Caster) interact with the spellcasting system but this interaction is not specified
- **Dependency Issues**: Full PHB feat list exceeds SRD coverage; unclear which feats to include

## Dependencies
- **Depends on:** Story 2.3 (Feature type, MechanicalEffect), Story 2.8 (Character type for the availability filter)
- **Blocks:** Story 4.1 (Ability score calculations account for feat bonuses), Story 4.3 (Combat calculations use feat effects like Alert +5 initiative), Story 3.1 (Variant Human race selection needs feats)

## Notes
- The SRD technically only includes one feat (Grappler) as fully open content. However, the application should support the full PHB feat list since feats are commonly used. The data should be structured to accommodate the full list
- `getAvailableFeats()` needs access to the full character state to check prerequisites. Examples: Heavy Armor Master requires STR 13, Medium Armor Master requires medium armor proficiency, Defensive Duelist requires finesse weapon proficiency
- Some feats can be taken multiple times (e.g., Elemental Adept can be taken once per damage type). The data should indicate if a feat is repeatable
- Feats that grant spells (e.g., Magic Initiate, Ritual Caster) add complexity because they interact with the spellcasting system
- The feat prerequisite checking function should return feats the character qualifies for at their current state, not accounting for future level-ups
