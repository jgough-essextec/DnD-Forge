# Story 2.3 — Class & Subclass Types

> **Epic 2: Complete Type System** | **Phase 1: Foundation** (Weeks 1-2)

## Description
As a developer, I need class types that capture the full complexity of class features, proficiencies, spell progression, and level-by-level advancement.

## Technical Context
- **App**: D&D Character Forge — local-first React PWA for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, Zustand (state), Dexie.js (IndexedDB), React Router
- **Architecture**: No backend, pure client-side, offline-capable PWA, IndexedDB for persistence
- **Domain**: D&D 5th Edition SRD — 9 races (with subraces), 12 classes (with subclasses), ability scores, skills, spells, equipment, backgrounds, feats
- **D&D 5e Classes**: 12 core classes, each with unique hit dice, proficiencies, features at specific levels, and subclass selection:
  - Barbarian (d12, Primal Path at 3), Bard (d8, College at 3), Cleric (d8, Domain at 1), Druid (d8, Circle at 2), Fighter (d10, Archetype at 3), Monk (d8, Tradition at 3), Paladin (d10, Oath at 3), Ranger (d10, Archetype at 3), Rogue (d8, Archetype at 3), Sorcerer (d6, Origin at 1), Warlock (d8, Patron at 1), Wizard (d6, School at 2)
- **Hit Dice**: d4, d6, d8, d10, d12 — determines HP per level and short rest healing
- **Proficiencies**: Each class grants armor, weapon, tool, and saving throw proficiencies, plus skill choices from a defined list
- **Class features**: Gained at specific levels (e.g., Barbarian Rage at 1, Extra Attack at 5). Some features recharge on short rest, some on long rest, some have limited uses per recharge
- **MechanicalEffect**: A discriminated union type representing calculable game effects:
  - `{ type: 'acCalculation'; formula: string }` — Unarmored Defense, etc.
  - `{ type: 'bonusDamage'; dice: string; damageType: DamageType }` — Rage damage, Sneak Attack, etc.
  - `{ type: 'proficiencyModifier'; modifier: 'half' | 'double' }` — Jack of All Trades, Expertise
  - `{ type: 'fightingStyle'; style: FightingStyle }` — Fighting style bonuses
  - Additional variants for other mechanical effects
- **Fighting Styles**: Archery (+2 ranged attack), Defense (+1 AC in armor), Dueling (+2 damage one-handed), Great Weapon Fighting (reroll 1s and 2s on damage), Protection (impose disadvantage), Two-Weapon Fighting (add ability mod to off-hand damage)
- **Spellcasting types**: Full casters (Bard, Cleric, Druid, Sorcerer, Wizard), Half casters (Paladin, Ranger), Third casters (Arcane Trickster, Eldritch Knight), Pact Magic (Warlock), Non-casters (Barbarian, Fighter, Monk, Rogue base)
- **Spell progression**: Prepared casters (Cleric, Druid, Paladin, Wizard) know their full list and prepare a subset. Known casters (Bard, Ranger, Sorcerer) know a fixed number. Warlock uses Pact Magic (few slots, always max level, short rest recharge)
- **ASI levels**: Most classes get ASI at 4, 8, 12, 16, 19. Fighter gets extra at 6, 14. Rogue gets extra at 10. ASIs can be traded for feats
- **Multiclass requirements**: Each class has minimum ability score requirements to multiclass into it

## Tasks
- [ ] **T2.3.1** — Define `HitDie` type: `4 | 6 | 8 | 10 | 12`
- [ ] **T2.3.2** — Define `ArmorCategory` type: `'light' | 'medium' | 'heavy' | 'shields'`
- [ ] **T2.3.3** — Define `WeaponCategory` type: `'simple melee' | 'simple ranged' | 'martial melee' | 'martial ranged'` plus specific weapon names
- [ ] **T2.3.4** — Define `ClassProficiencies` interface: `{ armor: ArmorCategory[]; weapons: (WeaponCategory | string)[]; tools: string[]; savingThrows: [AbilityName, AbilityName]; skillChoices: { choose: number; from: SkillName[] } }`
- [ ] **T2.3.5** — Define `Feature` interface: `{ id: string; name: string; description: string; level: number; recharge?: 'shortRest' | 'longRest' | 'none'; usesPerRecharge?: number; currentUses?: number; mechanicalEffect?: MechanicalEffect }`
- [ ] **T2.3.6** — Define `MechanicalEffect` union type to represent calculable effects: AC bonuses, extra damage, advantage/disadvantage, etc. Include `{ type: 'acCalculation'; formula: string }`, `{ type: 'bonusDamage'; dice: string; damageType: DamageType }`, `{ type: 'proficiencyModifier'; modifier: 'half' | 'double' }`, `{ type: 'fightingStyle'; style: FightingStyle }`, etc.
- [ ] **T2.3.7** — Define `FightingStyle` union type: `'archery' | 'defense' | 'dueling' | 'great-weapon-fighting' | 'protection' | 'two-weapon-fighting'`
- [ ] **T2.3.8** — Define `SpellcastingType` enum: `'full' | 'half' | 'third' | 'pact' | 'none'`
- [ ] **T2.3.9** — Define `ClassSpellcasting` interface: `{ type: SpellcastingType; ability: AbilityName; cantripsKnown: number[]; spellsKnownOrPrepared: 'known' | 'prepared'; spellsKnownByLevel?: number[]; ritualCasting: boolean; spellListId: string; focusType?: string }`
- [ ] **T2.3.10** — Define `SpellSlotProgression` type: a 20-element array of `SpellSlots` objects (one per level) — `SpellSlots = { [level: 1-9]: number }`
- [ ] **T2.3.11** — Define `ASILevel` array type: which levels the class gets Ability Score Improvements (most classes: 4, 8, 12, 16, 19; Fighter: 4, 6, 8, 12, 14, 16, 19; Rogue: 4, 8, 10, 12, 16, 19)
- [ ] **T2.3.12** — Define `Subclass` interface: `{ id: string; name: string; classId: string; description: string; features: Record<number, Feature[]>; spellList?: string[] }`
- [ ] **T2.3.13** — Define `Class` interface: `{ id, name, description, hitDie, primaryAbility, proficiencies, features: Record<number, Feature[]>, subclassLevel, subclassName, subclasses, spellcasting?, asiLevels, startingEquipment, startingGoldDice, multiclassRequirements? }`
- [ ] **T2.3.14** — Define `ClassSelection` interface (saved on character): `{ classId: string; subclassId?: string; level: number; chosenSkills: SkillName[]; chosenFightingStyle?: FightingStyle; chosenExpertise?: SkillName[]; hpRolls: number[] }`

## Acceptance Criteria
- All types compile with zero TypeScript errors under strict mode
- `Class` interface can represent all 12 SRD classes with their full feature progression
- `ClassSpellcasting` supports all four spellcasting systems (full, half, third, pact, none)
- `MechanicalEffect` is a discriminated union with `type` field for runtime discrimination
- `Feature` supports recharge tracking (short rest vs long rest vs none) and usage counting
- `ClassSelection` captures all player choices made during class selection
- `ASILevel` correctly represents the different ASI schedules for Fighter, Rogue, and standard classes

## Dependencies
- **Depends on:** Story 2.1 (uses AbilityName, SkillName, AbilityScores types)
- **Blocks:** Story 2.4 (Equipment types use WeaponCategory, ArmorCategory), Story 2.5 (Spell types use SpellcastingType), Story 2.8 (Character master type), Story 3.2 (Class data files), Story 4.3 (Combat calculations)

## Notes
- The `features: Record<number, Feature[]>` pattern maps level numbers to arrays of features gained at that level. This enables `features[3]` to return all level-3 features
- `ClassSpellcasting.cantripsKnown` is a 20-element array where index 0 is level 1. For non-cantrip classes, this would be all zeros
- `hpRolls` in `ClassSelection` stores the actual HP roll for each level after first (first level always takes max). Index 0 = level 2 roll, index 1 = level 3 roll, etc. This enables recalculation if CON changes
- The `MechanicalEffect` union will likely grow over time as more class features need to be computationally modeled. Design it to be extensible
