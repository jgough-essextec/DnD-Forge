# Story 3.2 — Class Data Files

> **Epic 3: SRD Game Data Layer** | **Phase 1: Foundation** (Weeks 1-2)

## Description
As a developer, I need complete class data for all 12 SRD classes with level-by-level feature progression, proficiencies, and spell slot tables.

## Technical Context
- **App**: D&D Character Forge — local-first React PWA for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, Zustand (state), Dexie.js (IndexedDB), React Router
- **Architecture**: No backend, pure client-side, offline-capable PWA, IndexedDB for persistence
- **Domain**: D&D 5th Edition SRD — 9 races (with subraces), 12 classes (with subclasses), ability scores, skills, spells, equipment, backgrounds, feats
- **12 SRD Classes**: Each class requires hit die, primary abilities, saving throw proficiencies, full proficiency lists (armor, weapons, tools, skill choices), level 1-20 feature progression, subclass selection level and name, ASI levels, starting equipment choices, and starting gold dice formula
  - **Barbarian**: d12, STR primary, STR/CON saves, light/medium armor + shields, simple/martial weapons, 2 skills from [Animal Handling, Athletics, Intimidation, Nature, Perception, Survival], Primal Path at 3, starting gold 2d4x10. Key features: Rage (1-6/day, +2-4 damage), Unarmored Defense (10+DEX+CON), Reckless Attack (2), Danger Sense (2), Extra Attack (5), Fast Movement (5, +10 speed unarmored), Feral Instinct (7), Brutal Critical (9,13,17), Relentless Rage (11), Persistent Rage (15), Indomitable Might (18), Primal Champion (20, STR/CON to 24)
  - **Bard**: d8, CHA primary, DEX/CHA saves, light armor, simple weapons + hand crossbow/longsword/rapier/shortsword, 3 musical instruments, any 3 skills, College at 3, starting gold 5d4x10. Key: Bardic Inspiration, Spellcasting (full, known, CHA), Jack of All Trades (2), Song of Rest (2), Expertise (3,10), Font of Inspiration (5), Countercharm (6), Magical Secrets (10,14,18), Superior Inspiration (20)
  - **Cleric**: d8, WIS primary, WIS/CHA saves, light/medium armor + shields, simple weapons, Domain at 1, starting gold 5d4x10. Key: Spellcasting (full, prepared, WIS), Divine Domain (1), Channel Divinity (2, 2/rest at 6, 3/rest at 18), Destroy Undead (5), Divine Intervention (10, auto at 20)
  - **Druid**: d8, WIS primary, INT/WIS saves, light/medium armor (nonmetal) + shields (nonmetal), clubs/daggers/darts/javelins/maces/quarterstaffs/scimitars/sickles/slings/spears, herbalism kit, Circle at 2, starting gold 2d4x10. Key: Spellcasting (full, prepared, WIS), Druidic language, Wild Shape (2), Timeless Body (18), Beast Spells (18), Archdruid (20)
  - **Fighter**: d10, STR/DEX primary, STR/CON saves, all armor + shields, simple/martial weapons, 2 skills from [Acrobatics, Animal Handling, Athletics, History, Insight, Intimidation, Perception, Survival], Martial Archetype at 3, starting gold 5d4x10. Key: Fighting Style (1), Second Wind (1), Action Surge (2, 2/rest at 17), Extra Attack (5, 3 at 11, 4 at 20), Indomitable (9, 2/day at 13, 3/day at 17). ASI at 4,6,8,12,14,16,19
  - **Monk**: d8, DEX/WIS primary, STR/DEX saves, simple weapons + shortswords, one artisan tool or musical instrument, 2 skills from [Acrobatics, Athletics, History, Insight, Religion, Stealth], Monastic Tradition at 3, starting gold 5d4. Key: Unarmored Defense (10+DEX+WIS), Martial Arts (1), Ki (2), Unarmored Movement (2, +10 to +30), Deflect Missiles (3), Slow Fall (4), Extra Attack (5), Stunning Strike (5), Ki-Empowered Strikes (6), Evasion (7), Stillness of Mind (7), Purity of Body (10), Tongue of Sun and Moon (13), Diamond Soul (14), Timeless Body (15), Empty Body (18), Perfect Self (20)
  - **Paladin**: d10, STR/CHA primary, WIS/CHA saves, all armor + shields, simple/martial weapons, 2 skills from [Athletics, Insight, Intimidation, Medicine, Persuasion, Religion], Sacred Oath at 3, starting gold 5d4x10. Key: Divine Sense (1), Lay on Hands (1, 5xLevel HP pool), Fighting Style (2), Spellcasting (half, prepared, CHA), Divine Smite (2), Divine Health (3), Extra Attack (5), Aura of Protection (6, +CHA to saves 10ft), Aura of Courage (10), Improved Divine Smite (11), Cleansing Touch (14), Aura improvements (18, 30ft)
  - **Ranger**: d10, DEX/WIS primary, STR/DEX saves, light/medium armor + shields, simple/martial weapons, 3 skills from [Animal Handling, Athletics, Insight, Investigation, Nature, Perception, Stealth, Survival], Ranger Archetype at 3, starting gold 5d4x10. Key: Favored Enemy (1,6,14), Natural Explorer (1,6,10), Fighting Style (2), Spellcasting (half, known, WIS), Primeval Awareness (3), Extra Attack (5), Land's Stride (8), Hide in Plain Sight (10), Vanish (14), Feral Senses (18), Foe Slayer (20)
  - **Rogue**: d8, DEX primary, DEX/INT saves, light armor, simple weapons + hand crossbow/longsword/rapier/shortsword, thieves' tools, 4 skills from [Acrobatics, Athletics, Deception, Insight, Intimidation, Investigation, Perception, Performance, Persuasion, Sleight of Hand, Stealth], Roguish Archetype at 3, starting gold 4d4x10. Key: Expertise (1,6), Sneak Attack (1, 1d6-10d6), Thieves' Cant (1), Cunning Action (2), Uncanny Dodge (5), Evasion (7), Reliable Talent (11), Blindsense (14), Slippery Mind (15, WIS save proficiency), Elusive (18), Stroke of Luck (20). ASI at 4,8,10,12,16,19
  - **Sorcerer**: d6, CHA primary, CON/CHA saves, daggers/darts/slings/quarterstaffs/light crossbows, 2 skills from [Arcana, Deception, Insight, Intimidation, Persuasion, Religion], Sorcerous Origin at 1, starting gold 3d4x10. Key: Spellcasting (full, known, CHA), Sorcerous Origin (1), Font of Magic/Sorcery Points (2), Metamagic (3, more at 10,17), Sorcerous Restoration (20)
  - **Warlock**: d8, CHA primary, WIS/CHA saves, light armor, simple weapons, 2 skills from [Arcana, Deception, History, Intimidation, Investigation, Nature, Religion], Otherworldly Patron at 1, starting gold 4d4x10. Key: Pact Magic (1, short rest recovery, 1-4 slots always at highest level), Otherworldly Patron (1), Eldritch Invocations (2), Pact Boon (3), Mystic Arcanum (11,13,15,17 — one spell each of 6th-9th level, 1/long rest)
  - **Wizard**: d6, INT primary, INT/WIS saves, daggers/darts/slings/quarterstaffs/light crossbows, 2 skills from [Arcana, History, Insight, Investigation, Medicine, Religion], Arcane Tradition at 2, starting gold 4d4x10. Key: Spellcasting (full, prepared from spellbook, INT), Arcane Recovery (1, recover spell slots on short rest), Arcane Tradition (2), Spell Mastery (18), Signature Spells (20)
- **SRD Subclasses** (one per class): Berserker, College of Lore, Life Domain, Circle of the Land, Champion, Way of the Open Hand, Oath of Devotion, Hunter, Thief, Draconic Bloodline, The Fiend, School of Evocation
- **Spell slot progressions**: Full caster (Bard, Cleric, Druid, Sorcerer, Wizard), Half caster (Paladin, Ranger — start casting at level 2), Third caster (Eldritch Knight, Arcane Trickster — start at level 3), Pact Magic (Warlock — unique table)
- **Multiclass spell slot table**: 20-row table mapping combined caster level to slots per spell level

## Tasks
- [ ] **T3.2.1** — Create `data/classes.ts` containing all 12 core classes with hit die, primary abilities, saving throw proficiencies, full proficiency lists, level 1-20 feature progression, subclass selection level and name, ASI levels, starting equipment choices, and starting gold dice formula
- [ ] **T3.2.2** — Create `data/subclasses.ts` with the SRD subclass for each class: Berserker, College of Lore, Life Domain, Circle of the Land, Champion, Way of the Open Hand, Oath of Devotion, Hunter, Thief, Draconic Bloodline, The Fiend, School of Evocation
- [ ] **T3.2.3** — Create `data/spell-slot-progression.ts` with the full 20-level spell slot table for each spellcasting type (full, half, third, pact magic)
- [ ] **T3.2.4** — Create `data/multiclass-spell-slots.ts` with the multiclass spellcaster table (20 rows mapping combined caster level to slots per level)
- [ ] **T3.2.5** — Create `data/class-features/` directory with individual feature descriptions for features that need long text (e.g., Rage, Wild Shape, Channel Divinity, Sneak Attack)
- [ ] **T3.2.6** — Validate all class data against SRD source for accuracy

## Acceptance Criteria
- All 12 classes are present with complete level 1-20 feature progression
- All 12 SRD subclasses are present with their feature progression
- Spell slot progression tables are accurate for all 4 spellcasting types
- Multiclass spell slot table matches SRD for all 20 combined caster levels
- Every class entry passes TypeScript type checking against the `Class` interface
- Feature descriptions for complex features (Rage, Wild Shape, etc.) are complete and accurate
- Starting equipment choices are structured as option groups matching SRD

## Testing Requirements

### Unit Tests (Vitest)
_For pure functions, calculations, data transforms, utilities, type guards, validators_

- `should export classes array with exactly 12 classes`
- `should have each class with correct hit die (Barbarian d12, Wizard d6, Fighter d10, etc.)`
- `should have Fighter with ASI levels at 4, 6, 8, 12, 14, 16, 19`
- `should have Rogue with ASI levels at 4, 8, 10, 12, 16, 19`
- `should have standard classes with ASI levels at 4, 8, 12, 16, 19`
- `should have all 12 SRD subclasses (Berserker, College of Lore, Life Domain, etc.)`
- `should have Warlock Pact Magic spell progression separate from standard progression`
- `should have spell slot progression tables accurate for full, half, third, and pact casters`
- `should have multiclass spell slot table with 20 rows matching SRD`
- `should have Monk starting gold as 5d4 (not 5d4x10)`

### Test Dependencies
- Class, Subclass, Feature type interfaces from Story 2.3
- Import via `@/data/classes` path alias

## Identified Gaps

- **Edge Cases**: Complex features like Wild Shape and Rage have long descriptions that may need separate files but the linking mechanism is not specified
- **Edge Cases**: Multiclass proficiency restrictions (limited proficiencies when multiclassing into a new class) not explicitly modeled in class data
- **Dependency Issues**: Class feature mechanicalEffect fields must be populated for the calculation engine but the complete set of needed effects is not enumerated

## Dependencies
- **Depends on:** Story 2.3 (Class, Subclass, Feature, ClassProficiencies, SpellcastingType, ClassSpellcasting, SpellSlotProgression types), Story 2.1 (AbilityName, SkillName)
- **Blocks:** Story 4.1 (Ability calculations use class data), Story 4.2 (Skill calculations use proficiencies), Story 4.3 (Combat calculations use hit dice, features), Story 4.4 (Spell calculations use spell slot progression), Story 4.5 (Level up uses feature progression)

## Notes
- Fighter and Rogue have non-standard ASI levels (Fighter: 4,6,8,12,14,16,19; Rogue: 4,8,10,12,16,19). All other classes use 4,8,12,16,19
- Monk's starting gold is 5d4 (not 5d4x10) — intentionally lower than other classes
- Warlock's Pact Magic spell slot progression is entirely separate from the standard spell slot tables and must be stored separately
- Druid has the restriction of not wearing metal armor or shields — this is a roleplay restriction, not a mechanical one, but should be noted in the data
- Class features with mechanical effects (Rage damage bonus, Unarmored Defense formulas, Extra Attack, etc.) must have their `mechanicalEffect` field populated for the calculation engine to use
