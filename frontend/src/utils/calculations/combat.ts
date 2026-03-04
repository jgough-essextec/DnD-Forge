/**
 * Combat Stat Calculations (Story 4.3)
 *
 * Pure calculation functions for armor class, initiative, speed, hit points,
 * attack bonuses, damage bonuses, and proficiency bonus. All functions are
 * deterministic and side-effect free.
 */

import { PROFICIENCY_BONUS_BY_LEVEL } from '@/data/reference';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Armor descriptor used for AC calculation */
export interface ArmorParams {
  /** Base armor class of the armor (e.g. 11 for leather, 16 for chain mail) */
  baseAC: number;
  /** Armor weight category: 'light' | 'medium' | 'heavy' | 'shield' */
  category: string;
  /**
   * Maximum DEX modifier that can be added.
   * null = uncapped (light armor), 0 = no DEX contribution (heavy armor),
   * positive number = cap (medium armor, typically 2).
   */
  dexCap?: number | null;
}

/** Special AC formula identifiers for class features and spells */
export type SpecialACFormula =
  | 'barbarian-unarmored'
  | 'monk-unarmored'
  | 'mage-armor'
  | 'natural-armor'
  | 'draconic-resilience';

/** Parameters for the getArmorClass function */
export interface ArmorClassParams {
  /** Equipped armor (undefined if unarmored) */
  armor?: ArmorParams;
  /** Whether a shield is equipped */
  shield?: boolean;
  /** Character's DEX modifier */
  dexModifier: number;
  /** Sum of miscellaneous AC bonuses (magic items, etc.) */
  otherModifiers?: number;
  /** Special AC formula from class features or spells */
  specialFormula?: SpecialACFormula;
  /** Character's CON modifier (used by Barbarian Unarmored Defense) */
  conModifier?: number;
  /** Character's WIS modifier (used by Monk Unarmored Defense) */
  wisModifier?: number;
  /** Whether the character has the Defense fighting style */
  defenseFightingStyle?: boolean;
  /** DEX cap override for Medium Armor Master feat (+3 instead of +2) */
  mediumArmorMasterFeat?: boolean;
}

/** Parameters for the getMaxHitPoints function */
export interface MaxHitPointsParams {
  /** Size of the hit die (6 for d6, 8 for d8, 10 for d10, 12 for d12) */
  hitDie: number;
  /** Character (class) level */
  level: number;
  /** Character's CON modifier */
  conModifier: number;
  /** Rolled HP values for levels 2+. If empty or shorter than needed, use average. */
  hpRolls?: number[];
  /** Whether the character has the Tough feat (+2 HP per level) */
  toughFeat?: boolean;
}

// ---------------------------------------------------------------------------
// Proficiency Bonus
// ---------------------------------------------------------------------------

/**
 * Get the proficiency bonus for a given character level.
 *
 * @param level - Character level (1-20)
 * @returns Proficiency bonus (+2 to +6)
 */
export function getProficiencyBonus(level: number): number {
  if (level < 1) return 2;
  if (level > 20) return 6;
  return PROFICIENCY_BONUS_BY_LEVEL[level - 1];
}

// ---------------------------------------------------------------------------
// Armor Class
// ---------------------------------------------------------------------------

/**
 * Calculate the base AC from a special formula (unarmored defense, mage armor, etc.).
 * These formulas only apply when the character is NOT wearing armor.
 */
function getSpecialFormulaAC(
  formula: SpecialACFormula,
  dexModifier: number,
  conModifier: number,
  wisModifier: number,
): number {
  switch (formula) {
    case 'barbarian-unarmored':
      return 10 + dexModifier + conModifier;
    case 'monk-unarmored':
      return 10 + dexModifier + wisModifier;
    case 'mage-armor':
      return 13 + dexModifier;
    case 'natural-armor':
      return 13 + dexModifier;
    case 'draconic-resilience':
      return 13 + dexModifier;
    default:
      return 10 + dexModifier;
  }
}

/**
 * Calculate the base AC from equipped armor using the standard armor formulas.
 *
 * - Light armor: baseAC + full DEX modifier (uncapped)
 * - Medium armor: baseAC + DEX modifier capped at +2 (or +3 with Medium Armor Master)
 * - Heavy armor: flat baseAC, no DEX contribution
 */
function getArmorBaseAC(
  armor: ArmorParams,
  dexModifier: number,
  mediumArmorMaster: boolean,
): number {
  const { baseAC, category, dexCap } = armor;

  if (category === 'heavy' || dexCap === 0) {
    // Heavy armor: flat AC, no DEX
    return baseAC;
  }

  if (dexCap === null || dexCap === undefined) {
    // Light armor: uncapped DEX
    return baseAC + dexModifier;
  }

  // Medium armor: DEX capped at dexCap (typically 2, or 3 with feat)
  const effectiveCap = mediumArmorMaster ? Math.max(dexCap, 3) : dexCap;
  const cappedDex = Math.min(dexModifier, effectiveCap);
  return baseAC + cappedDex;
}

/**
 * Calculate a character's Armor Class (AC).
 *
 * Handles all standard AC formulas:
 * - Unarmored: 10 + DEX modifier
 * - Light armor: base + full DEX
 * - Medium armor: base + DEX (capped at +2, or +3 with Medium Armor Master)
 * - Heavy armor: flat base AC
 * - Shield: +2 on top of any formula
 * - Defense fighting style: +1 when wearing armor
 * - Special formulas: Barbarian/Monk unarmored, Mage Armor, Natural Armor, Draconic Resilience
 *
 * When a character has both armor and a special formula, the higher base AC is used
 * (multiple base formulas do NOT stack).
 *
 * @param params - All parameters affecting AC calculation
 * @returns The final calculated AC
 */
export function getArmorClass(params: ArmorClassParams): number {
  const {
    armor,
    shield = false,
    dexModifier,
    otherModifiers = 0,
    specialFormula,
    conModifier = 0,
    wisModifier = 0,
    defenseFightingStyle = false,
    mediumArmorMasterFeat = false,
  } = params;

  // Calculate base AC from all applicable formulas and take the highest
  let baseAC: number;
  let isWearingArmor = false;

  if (armor && armor.category !== 'shield') {
    isWearingArmor = true;
    const armorAC = getArmorBaseAC(armor, dexModifier, mediumArmorMasterFeat);

    if (specialFormula) {
      // Character has both armor and a special formula: take the higher
      const specialAC = getSpecialFormulaAC(specialFormula, dexModifier, conModifier, wisModifier);
      if (specialAC > armorAC) {
        baseAC = specialAC;
        // Using special formula means not using armor
        isWearingArmor = false;
      } else {
        baseAC = armorAC;
      }
    } else {
      baseAC = armorAC;
    }
  } else if (specialFormula) {
    // No armor, but has a special AC formula
    baseAC = getSpecialFormulaAC(specialFormula, dexModifier, conModifier, wisModifier);
  } else {
    // Standard unarmored: 10 + DEX
    baseAC = 10 + dexModifier;
  }

  // Add shield bonus (+2)
  if (shield) {
    baseAC += 2;
  }

  // Defense fighting style: +1 only when wearing armor (not unarmored)
  if (defenseFightingStyle && isWearingArmor) {
    baseAC += 1;
  }

  // Add other miscellaneous modifiers
  baseAC += otherModifiers;

  return baseAC;
}

// ---------------------------------------------------------------------------
// Initiative
// ---------------------------------------------------------------------------

/**
 * Calculate the initiative modifier.
 *
 * @param dexModifier - Character's DEX modifier
 * @param bonus - Additional initiative bonuses (Alert feat +5, Jack of All Trades, etc.)
 * @returns The total initiative modifier
 */
export function getInitiativeModifier(dexModifier: number, bonus: number = 0): number {
  return dexModifier + bonus;
}

// ---------------------------------------------------------------------------
// Speed
// ---------------------------------------------------------------------------

/**
 * Calculate movement speed from a base speed plus an array of modifiers.
 *
 * @param baseSpeed - Base walking speed from race (typically 25-35 ft)
 * @param modifiers - Array of speed modifiers (positive or negative)
 * @returns Total speed (minimum 0)
 */
export function getSpeed(baseSpeed: number, modifiers: number[] = []): number {
  const total = modifiers.reduce((sum, mod) => sum + mod, baseSpeed);
  return Math.max(0, total);
}

// ---------------------------------------------------------------------------
// Hit Points
// ---------------------------------------------------------------------------

/**
 * Calculate the average HP roll for a given hit die.
 * The average formula is: floor(die / 2) + 1
 *
 * @param hitDie - The hit die value (6, 8, 10, or 12)
 * @returns The average HP per level
 */
export function getAverageHPRoll(hitDie: number): number {
  return Math.floor(hitDie / 2) + 1;
}

/**
 * Calculate maximum hit points for a character.
 *
 * Level 1: max hit die + CON modifier (minimum 1)
 * Levels 2+: rolled value (or average if not provided) + CON modifier (minimum 1 per level)
 *
 * @param params - Hit point calculation parameters
 * @returns Maximum hit points
 */
export function getMaxHitPoints(params: MaxHitPointsParams): number {
  const {
    hitDie,
    level,
    conModifier,
    hpRolls = [],
    toughFeat = false,
  } = params;

  if (level < 1) return 1;

  const toughBonus = toughFeat ? 2 : 0;

  // Level 1: max hit die + CON modifier
  let totalHP = Math.max(1, hitDie + conModifier + toughBonus);

  // Levels 2+
  for (let i = 1; i < level; i++) {
    const rollIndex = i - 1; // hpRolls[0] is for level 2
    const roll = hpRolls[rollIndex] !== undefined
      ? hpRolls[rollIndex]
      : getAverageHPRoll(hitDie);

    // Minimum 1 HP per level
    totalHP += Math.max(1, roll + conModifier + toughBonus);
  }

  return totalHP;
}

// ---------------------------------------------------------------------------
// Attack & Damage
// ---------------------------------------------------------------------------

/**
 * Calculate the attack bonus for a weapon attack.
 *
 * @param abilityModifier - The relevant ability modifier (STR for melee, DEX for ranged/finesse)
 * @param proficiencyBonus - The character's proficiency bonus (0 if not proficient)
 * @param bonus - Additional bonuses (magic weapons, fighting style, etc.)
 * @returns The total attack bonus
 */
export function getAttackBonus(
  abilityModifier: number,
  proficiencyBonus: number,
  bonus: number = 0,
): number {
  return abilityModifier + proficiencyBonus + bonus;
}

/**
 * Calculate the damage bonus for a weapon attack.
 *
 * @param abilityModifier - The relevant ability modifier
 * @param bonus - Additional bonuses (magic weapons, Dueling fighting style, etc.)
 * @returns The total damage bonus
 */
export function getDamageBonus(
  abilityModifier: number,
  bonus: number = 0,
): number {
  return abilityModifier + bonus;
}
