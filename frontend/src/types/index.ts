/**
 * Barrel Export (Story 2.10 T2.10.6)
 *
 * Re-exports every type from all Story 2.x files so consumers can import
 * any type from a single location:
 *
 *   import { Character, Spell, Race } from '@/types';
 *
 * Several modules define types with the same name but different semantics
 * (e.g. class.ts and equipment.ts both define ArmorCategory with different
 * values). This barrel export resolves those conflicts by:
 *
 * 1. Exporting the equipment.ts / spell.ts / combat.ts versions under
 *    their original names (since they're the more detailed definitions).
 * 2. Exporting the class.ts versions under prefixed aliases
 *    (e.g. ClassArmorCategory, ClassWeaponCategory).
 * 3. Consumers who need both can import directly from the specific module.
 *
 * Conflicts resolved:
 * - ArmorCategory, ARMOR_CATEGORIES: class.ts vs equipment.ts
 * - WeaponCategory, WEAPON_CATEGORIES: class.ts vs equipment.ts
 * - StartingEquipmentChoice: class.ts vs equipment.ts
 * - SpellSlots: class.ts vs spell.ts
 * - SpellcastingType: class.ts vs spell.ts
 * - DIE_TYPES: core.ts vs combat.ts
 * - MechanicalEffect: race.ts re-exported from class.ts
 * - Currency: core.ts re-exported from equipment.ts
 */

// -- core.ts: export everything ---------------------------------------------
export * from './core';

// -- race.ts: export everything ---------------------------------------------
export * from './race';

// -- class.ts: export selectively, excluding names that conflict with
//    equipment.ts and spell.ts. Re-export conflicting names under aliases.
export type {
  HitDie,
  FightingStyle,
  SpellSlotProgression,
  SpellcastingInfo,
  RechargeType,
  ClassFeature,
  SubclassFeature,
  SkillChoice,
  ClassProficiencies,
  ASILevel,
  MulticlassRequirement,
  Subclass,
  CharacterClass,
  ClassSelection,
} from './class';

export {
  HIT_DIE_VALUES,
  FIGHTING_STYLES,
  SPELLCASTING_TYPES,
  STANDARD_ASI_LEVELS,
  FIGHTER_ASI_LEVELS,
  ROGUE_ASI_LEVELS,
  isHitDie,
  isFightingStyle,
  isSpellcastingType,
  isArmorCategory,
  isWeaponCategory,
  isClassSelection,
  isMechanicalEffectType,
  getBonusDamageDamageType,
} from './class';

// Re-export class.ts conflicting names under prefixed aliases
export type {
  ArmorCategory as ClassArmorCategory,
  WeaponCategory as ClassWeaponCategory,
  SpellSlots as ClassSpellSlots,
  SpellcastingType as ClassSpellcastingType,
  StartingEquipmentChoice as ClassStartingEquipmentChoice,
} from './class';

export {
  ARMOR_CATEGORIES as CLASS_ARMOR_CATEGORIES,
  WEAPON_CATEGORIES as CLASS_WEAPON_CATEGORIES,
} from './class';

// -- equipment.ts: export everything (canonical ArmorCategory, etc.) --------
export * from './equipment';

// -- spell.ts: export everything (canonical SpellSlots, SpellcastingType) ---
export * from './spell';

// -- background.ts: export everything ---------------------------------------
export * from './background';

// -- combat.ts: export selectively, excluding DIE_TYPES (already in core) ---
export type {
  ConditionInstance,
  DeathSaves,
  Speed,
  AttackType,
  DamageRoll,
  Attack,
  ArmorClassCalculation,
  HitDicePool,
  HitPoints,
  CombatStats,
  InitiativeRoll,
  InitiativeEntry,
  Encounter,
  RestType,
  RestResult,
  ActionType,
  ActionEconomy,
  CombatTurn,
} from './combat';

export {
  ATTACK_TYPES,
  REST_TYPES,
  ACTION_TYPES,
  EXHAUSTION_EFFECTS,
} from './combat';

// -- character.ts: export everything ----------------------------------------
export * from './character';

// -- campaign.ts: export everything -----------------------------------------
export * from './campaign';

// -- ui.ts: export everything -----------------------------------------------
export * from './ui';

// -- auth.ts: export everything ---------------------------------------------
export * from './auth';
