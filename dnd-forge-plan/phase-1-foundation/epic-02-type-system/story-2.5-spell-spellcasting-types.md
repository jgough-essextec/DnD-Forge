# Story 2.5 — Spell & Spellcasting Types

> **Epic 2: Complete Type System** | **Phase 1: Foundation** (Weeks 1-2)

## Description
As a developer, I need types covering the three spellcasting systems (prepared, known, pact magic), spell properties, concentration tracking, and ritual casting.

## Technical Context
- **App**: D&D Character Forge — local-first React PWA for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, Zustand (state), Dexie.js (IndexedDB), React Router
- **Architecture**: No backend, pure client-side, offline-capable PWA, IndexedDB for persistence
- **Domain**: D&D 5th Edition SRD — 9 races (with subraces), 12 classes (with subclasses), ability scores, skills, spells, equipment, backgrounds, feats
- **Spell schools** (8 total): Abjuration, Conjuration, Divination, Enchantment, Evocation, Illusion, Necromancy, Transmutation
- **Spell levels**: 0 (cantrip) through 9. Cantrips can be cast at will. Leveled spells consume spell slots
- **Casting time**: Action, bonus action, reaction (with trigger), or ritual time (minutes/hours)
- **Spell range**: Self, touch, ranged (with distance), sight, unlimited. Area spells also have shape (cone, cube, cylinder, line, sphere) and area size
- **Spell components**: Verbal (V), Somatic (S), Material (M). Material components may have a gold cost and may be consumed on casting
- **Spell duration**: Instantaneous, concentration (requires active focus), timed (rounds/minutes/hours/days), until dispelled
- **Concentration**: Only one concentration spell active at a time. Taking damage requires CON save (DC = max(10, damage/2)) to maintain. Character needs `activeConcentrationSpell` tracker
- **Ritual casting**: Spells with the ritual tag can be cast without expending a slot by adding 10 minutes to casting time. Available to Bard, Cleric, Druid, Wizard (Wizard can ritual cast from spellbook even if not prepared)
- **Three spellcasting systems**:
  1. **Prepared Casters** (Cleric, Druid, Paladin, Wizard): Know full class spell list; prepare a subset each long rest. Number prepared = ability modifier + class level (minimum 1). Wizard must have spells in spellbook
  2. **Known Casters** (Bard, Ranger, Sorcerer): Know a fixed number of spells (per class table); can swap one spell on level-up
  3. **Pact Magic** (Warlock): Few spell slots (1-4) always cast at highest available level, recharge on short rest. Plus Mystic Arcanum at higher levels (one spell of levels 6-9, each usable 1/long rest)
- **Multiclass spell slot table**: When multiclassing, spell slots are calculated by summing partial caster levels: full casters contribute full level, half casters half (rounded down), third casters one-third (rounded down). Warlock Pact Magic does NOT contribute — it is tracked completely separately

## Tasks
- [ ] **T2.5.1** — Define `SpellSchool` enum: all 8 schools (Abjuration through Transmutation)
- [ ] **T2.5.2** — Define `SpellLevel` type: `0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9` (0 = cantrip)
- [ ] **T2.5.3** — Define `CastingTime` type: `{ value: number; unit: 'action' | 'bonus action' | 'reaction' | 'minute' | 'hour'; reactionTrigger?: string }`
- [ ] **T2.5.4** — Define `SpellRange` type: `{ type: 'self' | 'touch' | 'ranged' | 'sight' | 'unlimited'; distance?: number; unit?: 'feet' | 'miles'; shape?: 'cone' | 'cube' | 'cylinder' | 'line' | 'sphere'; areaSize?: number }`
- [ ] **T2.5.5** — Define `SpellComponents` interface: `{ verbal: boolean; somatic: boolean; material: boolean; materialDescription?: string; materialCost?: CurrencyAmount; materialConsumed?: boolean }`
- [ ] **T2.5.6** — Define `SpellDuration` type: `{ type: 'instantaneous' | 'concentration' | 'timed' | 'until-dispelled'; value?: number; unit?: 'round' | 'minute' | 'hour' | 'day' }`
- [ ] **T2.5.7** — Define `Spell` interface: `{ id, name, level: SpellLevel, school: SpellSchool, castingTime, range, components, duration, description, higherLevelDescription?, ritual: boolean, concentration: boolean, classes: string[], damage?: DamageDice, savingThrow?: AbilityName, attackType?: 'melee' | 'ranged' }`
- [ ] **T2.5.8** — Define `SpellSlots` interface: `{ [key: number]: number }` for slots 1-9, and `UsedSpellSlots` mirror type
- [ ] **T2.5.9** — Define `PactMagic` interface: `{ slotLevel: number; totalSlots: number; usedSlots: number; mysticArcanum: { [level: number]: { spellId: string; used: boolean } } }`
- [ ] **T2.5.10** — Define `SpellcastingData` interface: `{ type: SpellcastingType; ability: AbilityName; cantrips: string[]; knownSpells: string[]; preparedSpells: string[]; spellSlots: SpellSlots; usedSpellSlots: SpellSlots; pactMagic?: PactMagic; activeConcentration?: string; ritualCasting: boolean }`
- [ ] **T2.5.11** — Define `MULTICLASS_SPELL_SLOT_TABLE` constant: a 20-row table mapping combined spellcaster level to spell slots per level

## Acceptance Criteria
- All types compile with zero TypeScript errors under strict mode
- `Spell` interface can represent any SRD spell including cantrips, ritual spells, concentration spells, and at-higher-levels scaling
- `SpellcastingData` supports all three spellcasting systems (prepared, known, pact magic)
- `PactMagic` separately tracks Warlock's unique slot system and Mystic Arcanum
- `SpellComponents` captures material component costs and consumption
- `MULTICLASS_SPELL_SLOT_TABLE` provides the correct spell slots for combined caster levels 1-20
- `activeConcentration` field on `SpellcastingData` tracks the currently concentrated-on spell

## Testing Requirements

### Unit Tests (Vitest)
_For pure functions, calculations, data transforms, utilities, type guards, validators_

- `should define SpellSchool enum with all 8 schools (Abjuration through Transmutation)`
- `should define SpellLevel type with values 0-9 where 0 is cantrip`
- `should define Spell interface with concentration and ritual boolean flags`
- `should define SpellComponents with materialCost using CurrencyAmount and materialConsumed flag`
- `should define PactMagic interface with slotLevel, totalSlots, usedSlots, and mysticArcanum`
- `should define SpellcastingData supporting all three spellcasting systems (prepared, known, pact)`
- `should define SpellcastingData.activeConcentration as optional string for tracking concentrated spell`
- `should define MULTICLASS_SPELL_SLOT_TABLE as 20-row lookup table`
- `should define CastingTime supporting action, bonus action, reaction with trigger, and minute/hour`
- `should define SpellRange with self, touch, ranged, sight, unlimited and optional area shape`

### Test Dependencies
- No mock data needed — these are type compilation and constant verification tests
- Depends on AbilityName, DamageType, SpellcastingType, CurrencyAmount from earlier stories

## Identified Gaps

- **Edge Cases**: SpellDuration does not distinguish between rounds in combat vs rounds out of combat
- **Edge Cases**: MULTICLASS_SPELL_SLOT_TABLE must handle edge case of combined caster level 0 (no spellcasting classes contribute)

## Dependencies
- **Depends on:** Story 2.1 (uses AbilityName), Story 2.2 (uses DamageType via DamageDice), Story 2.3 (uses SpellcastingType), Story 2.4 (uses CurrencyAmount, DamageDice)
- **Blocks:** Story 2.8 (Character master type includes SpellcastingData), Story 3.3 (Spell database), Story 4.4 (Spellcasting calculations)

## Notes
- The `MULTICLASS_SPELL_SLOT_TABLE` is a 20-row lookup table. Row index is the combined spellcaster level (1-20). Each row contains the number of spell slots per level (1st through 9th). This table is separate from individual class spell slot progressions
- Warlock's Pact Magic must be tracked entirely separately from standard spell slots, even in a multiclass scenario. A Warlock/Wizard multiclass has two independent spell slot pools
- The `higherLevelDescription` on `Spell` describes what changes when the spell is cast at a higher level (e.g., "deals an extra 1d6 damage for each slot level above 1st")
- The `SpellDuration.type` of 'concentration' implies concentration is required. The `Spell.concentration` boolean is the quick-access flag for the same information
- Consider that some spells have non-standard casting times like "1 minute" or "1 hour" — the `CastingTime` type must handle these gracefully
