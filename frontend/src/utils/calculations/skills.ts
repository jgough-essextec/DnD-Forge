// =============================================================================
// Story 4.2 -- Skill & Proficiency Calculations
// Pure functions for computing skill modifiers, passive scores, proficiency
// bonuses, and checking skill proficiency from multiple sources.
// =============================================================================

import type {
  AbilityScores,
  SkillName,
  SkillProficiency,
} from '@/types';

import {
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
