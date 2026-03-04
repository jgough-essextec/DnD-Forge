// =============================================================================
// Story 4.2 -- Skill & Proficiency Calculations
// Pure functions for computing skill modifiers, passive scores, proficiency
// bonuses, and checking skill proficiency from multiple sources.
// =============================================================================

import type {
  AbilityName,
  AbilityScores,
  Character,
  SkillName,
  SkillProficiency,
} from '@/types';

import {
  ABILITY_NAMES,
  SKILL_NAMES,
  SKILL_ABILITY_MAP,
} from '@/types';

import {
  PROFICIENCY_BONUS_BY_LEVEL,
} from '@/data/reference';

import { getModifier } from './ability';

// ---------------------------------------------------------------------------
// Proficiency Bonus
// ---------------------------------------------------------------------------

/**
 * Get the proficiency bonus for a given character level.
 *
 * Formula: Math.ceil(level / 4) + 1
 * Levels 1-4 = +2, 5-8 = +3, 9-12 = +4, 13-16 = +5, 17-20 = +6.
 *
 * @param level - Character level (1-20)
 * @returns The proficiency bonus
 * @throws RangeError if level is outside 1-20
 */
export function getProficiencyBonus(level: number): number {
  if (level < 1 || level > 20) {
    throw new RangeError(`Level must be between 1 and 20, got ${level}`);
  }
  return PROFICIENCY_BONUS_BY_LEVEL[level - 1];
}

// ---------------------------------------------------------------------------
// Skill Modifier
// ---------------------------------------------------------------------------

/**
 * Calculate the skill modifier for a single skill.
 *
 * The modifier is computed as:
 * - Base: ability modifier for the skill's governing ability
 * - If proficient: + proficiency bonus
 * - If expertise: + proficiency bonus again (double proficiency total)
 *
 * @param abilityScore - The relevant ability score for this skill
 * @param proficiency  - The character's proficiency status for this skill
 * @param level        - The character's level (for proficiency bonus lookup)
 * @returns The total skill modifier
 */
export function getSkillModifier(
  abilityScore: number,
  proficiency: SkillProficiency,
  level: number,
): number {
  const abilityMod = getModifier(abilityScore);
  const profBonus = PROFICIENCY_BONUS_BY_LEVEL[level - 1];

  if (proficiency.expertise) {
    // Expertise doubles the proficiency bonus
    return abilityMod + profBonus * 2;
  }

  if (proficiency.proficient) {
    return abilityMod + profBonus;
  }

  // Not proficient: just the ability modifier
  return abilityMod;
}

// ---------------------------------------------------------------------------
// All Skill Modifiers
// ---------------------------------------------------------------------------

/**
 * Calculate modifiers for all 18 skills.
 *
 * @param abilityScores  - The character's full ability scores
 * @param proficiencies  - Array of skill proficiency entries
 * @param level          - The character's level
 * @returns A Record mapping each SkillName to its modifier
 */
export function getAllSkillModifiers(
  abilityScores: AbilityScores,
  proficiencies: SkillProficiency[],
  level: number,
): Record<SkillName, number> {
  const profMap = new Map<SkillName, SkillProficiency>();
  for (const prof of proficiencies) {
    profMap.set(prof.skill, prof);
  }

  const result = {} as Record<SkillName, number>;

  for (const skill of SKILL_NAMES) {
    const ability = SKILL_ABILITY_MAP[skill];
    const abilityScore = abilityScores[ability];
    const proficiency = profMap.get(skill) ?? {
      skill,
      proficient: false,
      expertise: false,
    };
    result[skill] = getSkillModifier(abilityScore, proficiency, level);
  }

  return result;
}

// ---------------------------------------------------------------------------
// Passive Score
// ---------------------------------------------------------------------------

/**
 * Calculate a passive score for a skill.
 *
 * Formula: 10 + skill modifier + bonuses.
 * Advantage on passive checks adds +5, disadvantage subtracts -5.
 * These are passed in via the bonuses parameter.
 *
 * @param skillModifier - The pre-computed skill modifier
 * @param bonuses       - Additional bonuses (e.g., +5 for advantage, -5 for disadvantage)
 * @returns The passive score
 */
export function getPassiveScore(
  skillModifier: number,
  bonuses: number = 0,
): number {
  return 10 + skillModifier + bonuses;
}

// ---------------------------------------------------------------------------
// Skill Proficiency Check
// ---------------------------------------------------------------------------

/**
 * Check whether a character is proficient in a given skill by examining
 * all possible proficiency sources (class, race, background, feats).
 *
 * @param skill   - The skill to check
 * @param sources - An object containing arrays of skill proficiencies from each source
 * @returns true if the character is proficient in the skill from any source
 */
export function isSkillProficient(
  skill: SkillName,
  sources: {
    classSkills: SkillName[];
    raceSkills: SkillName[];
    backgroundSkills: SkillName[];
    featSkills: SkillName[];
  },
): boolean {
  return (
    sources.classSkills.includes(skill) ||
    sources.raceSkills.includes(skill) ||
    sources.backgroundSkills.includes(skill) ||
    sources.featSkills.includes(skill)
  );
}

// ---------------------------------------------------------------------------
// Jack of All Trades Detection
// ---------------------------------------------------------------------------

/**
 * Check if a character has the Jack of All Trades feature.
 * Bard class feature at level 2+: add half proficiency bonus (rounded down)
 * to any ability check that does not already include the proficiency bonus.
 *
 * @param character - The character to check
 * @returns true if the character is a Bard of level 2 or higher
 */
export function hasJackOfAllTrades(character: Character): boolean {
  return character.classes.some(
    (cls) => cls.classId === 'bard' && cls.level >= 2,
  );
}

// ---------------------------------------------------------------------------
// Remarkable Athlete Detection
// ---------------------------------------------------------------------------

/**
 * Check if a character has the Remarkable Athlete feature.
 * Champion Fighter subclass feature at level 7+: add half proficiency bonus
 * (rounded up) to STR, DEX, and CON ability checks you are not proficient in.
 * Also adds to running long jump distance.
 *
 * @param character - The character to check
 * @returns true if the character is a Champion Fighter of level 7 or higher
 */
export function hasRemarkableAthlete(character: Character): boolean {
  return character.classes.some(
    (cls) =>
      cls.classId === 'fighter' &&
      cls.subclassId === 'champion' &&
      cls.level >= 7,
  );
}

// ---------------------------------------------------------------------------
// Abilities covered by Remarkable Athlete
// ---------------------------------------------------------------------------

/**
 * The ability scores affected by the Remarkable Athlete feature.
 * Only STR, DEX, and CON checks qualify.
 */
const REMARKABLE_ATHLETE_ABILITIES: readonly AbilityName[] = [
  'strength',
  'dexterity',
  'constitution',
];

// ---------------------------------------------------------------------------
// Character-level Skill Modifier
// ---------------------------------------------------------------------------

/**
 * Calculate the skill modifier for a character and a specific skill.
 *
 * This is the Character-level version that automatically handles:
 * - Base ability modifier from the skill's governing ability
 * - Proficiency bonus if proficient
 * - Double proficiency (expertise) if applicable
 * - Jack of All Trades (Bard L2+): adds half proficiency bonus (floor)
 *   to non-proficient ability checks
 * - Remarkable Athlete (Champion Fighter L7+): adds half proficiency bonus
 *   (ceil) to non-proficient STR/DEX/CON checks (takes priority over JoAT
 *   for those abilities, but they do not stack)
 *
 * @param character - The full character object
 * @param skill     - The skill to calculate the modifier for
 * @returns The total skill modifier
 */
export function getCharacterSkillModifier(
  character: Character,
  skill: SkillName,
): number {
  const ability = SKILL_ABILITY_MAP[skill];
  const abilityScore = character.abilityScores[ability];
  const abilityMod = getModifier(abilityScore);
  const profBonus = PROFICIENCY_BONUS_BY_LEVEL[character.level - 1];

  // Find the skill proficiency entry
  const profEntry = character.proficiencies.skills.find(
    (sp) => sp.skill === skill,
  );

  // Expertise: double proficiency bonus
  if (profEntry?.expertise) {
    return abilityMod + profBonus * 2;
  }

  // Proficient: single proficiency bonus
  if (profEntry?.proficient) {
    return abilityMod + profBonus;
  }

  // Not proficient: check for class features that add partial proficiency
  const joat = hasJackOfAllTrades(character);
  const remarkableAthlete = hasRemarkableAthlete(character);

  // Remarkable Athlete: half prof (ceil) for STR/DEX/CON checks
  // Takes priority over Jack of All Trades for these abilities
  if (
    remarkableAthlete &&
    REMARKABLE_ATHLETE_ABILITIES.includes(ability)
  ) {
    return abilityMod + Math.ceil(profBonus / 2);
  }

  // Jack of All Trades: half prof (floor) for all checks
  if (joat) {
    return abilityMod + Math.floor(profBonus / 2);
  }

  return abilityMod;
}

// ---------------------------------------------------------------------------
// Character-level Saving Throw Modifier
// ---------------------------------------------------------------------------

/**
 * Calculate the saving throw modifier for a character and a specific ability.
 *
 * Formula: ability modifier + (proficiency bonus if proficient)
 *
 * @param character - The full character object
 * @param ability   - The ability to calculate the saving throw for
 * @returns The total saving throw modifier
 */
export function getSavingThrowModifier(
  character: Character,
  ability: AbilityName,
): number {
  const abilityScore = character.abilityScores[ability];
  const abilityMod = getModifier(abilityScore);
  const isProficient = character.proficiencies.savingThrows.includes(ability);

  if (!isProficient) {
    return abilityMod;
  }

  const profBonus = PROFICIENCY_BONUS_BY_LEVEL[character.level - 1];
  return abilityMod + profBonus;
}

// ---------------------------------------------------------------------------
// Character-level Passive Score
// ---------------------------------------------------------------------------

/**
 * Calculate the passive score for a character and a specific skill.
 *
 * Formula: 10 + skill modifier + advantage/disadvantage modifier
 *   - advantage adds +5
 *   - disadvantage subtracts -5
 *
 * @param character                - The full character object
 * @param skill                    - The skill to calculate the passive score for
 * @param advantageOrDisadvantage  - Optional advantage or disadvantage modifier
 * @returns The passive score
 */
export function getCharacterPassiveScore(
  character: Character,
  skill: SkillName,
  advantageOrDisadvantage?: 'advantage' | 'disadvantage',
): number {
  const skillMod = getCharacterSkillModifier(character, skill);
  let bonus = 0;

  if (advantageOrDisadvantage === 'advantage') {
    bonus = 5;
  } else if (advantageOrDisadvantage === 'disadvantage') {
    bonus = -5;
  }

  return 10 + skillMod + bonus;
}

// ---------------------------------------------------------------------------
// Character-level All Skill Modifiers
// ---------------------------------------------------------------------------

/**
 * Calculate modifiers for all 18 skills for a character, automatically
 * handling proficiency, expertise, Jack of All Trades, and Remarkable Athlete.
 *
 * @param character - The full character object
 * @returns A Record mapping each SkillName to its modifier
 */
export function getCharacterAllSkillModifiers(
  character: Character,
): Record<SkillName, number> {
  const result = {} as Record<SkillName, number>;

  for (const skill of SKILL_NAMES) {
    result[skill] = getCharacterSkillModifier(character, skill);
  }

  return result;
}

// ---------------------------------------------------------------------------
// Character-level All Saving Throws
// ---------------------------------------------------------------------------

/**
 * Calculate saving throw modifiers for all 6 abilities for a character.
 *
 * @param character - The full character object
 * @returns A Record mapping each AbilityName to its saving throw modifier
 */
export function getAllSavingThrows(
  character: Character,
): Record<AbilityName, number> {
  const result = {} as Record<AbilityName, number>;

  for (const ability of ABILITY_NAMES) {
    result[ability] = getSavingThrowModifier(character, ability);
  }

  return result;
}
