/**
 * Data Barrel Export
 *
 * Re-exports all SRD game data files for convenient single-location imports:
 *   import { WEAPONS, ARMOR, BACKGROUNDS, FEATS, CONDITIONS_DATA } from '@/data';
 */

export {
  // Equipment (Story 3.4)
  WEAPONS,
  ARMOR,
  EQUIPMENT_PACKS,
  STARTING_GOLD,
  getWeaponById,
  getArmorById,
  getEquipmentPackById,
  getWeaponsByCategory,
  getArmorByCategory,
} from './equipment';

export type { StartingGoldFormula } from './equipment';

export {
  // Backgrounds (Story 3.5)
  BACKGROUNDS,
  getBackgroundById,
} from './backgrounds';

export {
  // Feats (Story 3.6)
  FEATS,
  getFeatById,
  getFeatsWithNoPrerequisites,
  getFeatsWithASI,
} from './feats';

export {
  // Reference data (Story 3.7)
  CONDITIONS_DATA,
  SKILLS_DATA,
  LANGUAGES_DATA,
  PROFICIENCY_BONUS_BY_LEVEL,
  XP_THRESHOLDS,
  ABILITY_SCORE_MODIFIERS,
  POINT_BUY_COSTS,
  POINT_BUY_BUDGET,
  POINT_BUY_MIN,
  POINT_BUY_MAX,
  STANDARD_ARRAY,
  CARRY_CAPACITY_MULTIPLIER,
  PUSH_DRAG_LIFT_MULTIPLIER,
  ENCUMBERED_MULTIPLIER,
  HEAVILY_ENCUMBERED_MULTIPLIER,
  CURRENCY_RATES,
  FULL_CASTER_SPELL_SLOTS,
  HALF_CASTER_SPELL_SLOTS,
  THIRD_CASTER_SPELL_SLOTS,
  PACT_MAGIC_SLOTS,
  STARTING_GOLD_BY_CLASS,
  getProficiencyBonus,
  getLevelForXP,
  getAbilityModifier,
  getConditionById,
  getSkillById,
  getLanguageById,
  getStandardLanguages,
  getExoticLanguages,
} from './reference';

export type {
  ConditionData,
  SkillData,
  LanguageData,
} from './reference';

export {
  // Races (Story 3.1)
  races,
} from './races';

export {
  // Classes (Story 3.2)
  CLASSES,
  getClassById,
  getClassIds,
} from './classes';

export {
  // Spells (Story 3.3)
  SPELLS,
  getSpellById,
  getSpellsByLevel,
  getSpellsByClass,
  getCantrips,
} from './spells';
