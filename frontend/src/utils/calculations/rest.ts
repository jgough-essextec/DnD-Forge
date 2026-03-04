/**
 * Rest Mechanics Calculation Functions (Story 4.7)
 *
 * Pure functions for computing the effects of short and long rests
 * in D&D 5e. These functions return partial diffs that can be spread
 * onto the character state -- they do NOT mutate the character directly.
 */

import type { Character } from '@/types/character';
import type { DeathSaves } from '@/types/combat';
import type { ClassFeature } from '@/types/class';
import type { DieType } from '@/types/core';
import { getClassById } from '@/data/classes';
import { getAbilityModifier, PACT_MAGIC_SLOTS } from '@/data/reference';
import { rollDie } from '@/utils/dice';

// ---------------------------------------------------------------------------
// Short Rest Recovery
// ---------------------------------------------------------------------------

/**
 * Compute the changes from a short rest.
 *
 * Short rest effects:
 * - HP recovered from spending hit dice (roll + CON mod each, min 0 per die)
 * - Warlock pact magic slots recovered
 * - Short-rest class features reset (currentUses restored to usesPerRecharge)
 *
 * @param character The current character state
 * @param hitDiceToSpend Array of hit die sizes to spend (e.g. [10, 10] for a Fighter
 *   spending 2 d10 hit dice). Each value is the die size (4, 6, 8, 10, or 12).
 * @param randomSource Optional injectable random source for testing
 * @returns A partial Character diff describing the changes to apply
 */
export function getShortRestRecovery(
  character: Character,
  hitDiceToSpend: number[],
  randomSource?: () => number,
): Partial<Character> {
  const conMod = getAbilityModifier(character.abilityScores.constitution);

  // Roll hit dice and sum HP recovered
  let hpRecovered = 0;
  const newHitDiceUsed = [...character.hitDiceUsed];

  for (const dieSize of hitDiceToSpend) {
    // Find the class index that matches this die size and has available dice
    const classIndex = findAvailableHitDieIndex(character, dieSize, newHitDiceUsed);
    if (classIndex === -1) continue; // No available dice of this size

    const dieType = `d${dieSize}` as DieType;
    const roll = rollDie(dieType, randomSource);
    const hpGain = Math.max(0, roll + conMod);
    hpRecovered += hpGain;
    newHitDiceUsed[classIndex] += 1;
  }

  // Clamp HP to max
  const newHpCurrent = Math.min(character.hpCurrent + hpRecovered, character.hpMax);

  // Reset short-rest features
  const resetFeatureIds = getResetFeatureIds(character, 'shortRest');

  // Warlock pact magic recovery
  const spellcastingUpdate = recoverPactMagic(character);

  const result: Partial<Character> = {
    hpCurrent: newHpCurrent,
    hitDiceUsed: newHitDiceUsed,
  };

  if (spellcastingUpdate) {
    result.spellcasting = spellcastingUpdate;
  }

  // If there are features to reset, we note the feature IDs but the actual
  // reset happens at the application layer. We include resetFeatureIds in
  // the result so callers know which features were restored.
  if (resetFeatureIds.length > 0) {
    // Attach as extra metadata -- callers can read this to update feature uses
    (result as Record<string, unknown>)['_resetFeatureIds'] = resetFeatureIds;
  }

  return result;
}

// ---------------------------------------------------------------------------
// Long Rest Recovery
// ---------------------------------------------------------------------------

/**
 * Compute the changes from a long rest.
 *
 * Long rest effects:
 * - HP restored to maximum
 * - Recover half of total hit dice (minimum 1), rounded down
 * - All spell slots restored
 * - All features reset (both short-rest and long-rest)
 * - Death saves reset
 * - Exhaustion reduced by 1 level (if any)
 *
 * @param character The current character state
 * @returns A partial Character diff describing the changes to apply
 */
export function getLongRestRecovery(
  character: Character,
): Partial<Character> {
  // HP to max
  const newHpCurrent = character.hpMax;

  // Recover half of total hit dice (min 1)
  const totalHitDice = character.hitDiceTotal.reduce((sum, d) => sum + d, 0);
  const diceToRecover = Math.max(1, Math.floor(totalHitDice / 2));
  const newHitDiceUsed = recoverHitDice(character, diceToRecover);

  // Reset death saves
  const newDeathSaves: DeathSaves = {
    successes: 0,
    failures: 0,
    stable: false,
  };

  // All spell slots restored
  const spellcastingUpdate = restoreAllSpellSlots(character);

  // Reduce exhaustion by 1, removing it if it drops to 0
  const newConditions: ConditionInstance[] = [];
  for (const c of character.conditions) {
    if (c.condition === 'exhaustion') {
      const currentLevel = c.exhaustionLevel ?? 1;
      if (currentLevel <= 1) {
        // Level 1 -> 0 means exhaustion is removed entirely
        continue;
      }
      // Reduce by 1
      newConditions.push({
        ...c,
        exhaustionLevel: (currentLevel - 1) as 1 | 2 | 3 | 4 | 5 | 6,
      });
    } else {
      newConditions.push(c);
    }
  }

  // Get all feature IDs to reset (both short and long rest)
  const resetFeatureIds = [
    ...getResetFeatureIds(character, 'shortRest'),
    ...getResetFeatureIds(character, 'longRest'),
  ];

  const result: Partial<Character> = {
    hpCurrent: newHpCurrent,
    tempHp: 0,
    hitDiceUsed: newHitDiceUsed,
    deathSaves: newDeathSaves,
    conditions: newConditions,
  };

  if (spellcastingUpdate) {
    result.spellcasting = spellcastingUpdate;
  }

  if (resetFeatureIds.length > 0) {
    (result as Record<string, unknown>)['_resetFeatureIds'] = resetFeatureIds;
  }

  return result;
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Find the index of a class in the character's classes array that uses
 * the given hit die size and still has available dice to spend.
 */
function findAvailableHitDieIndex(
  character: Character,
  dieSize: number,
  currentUsed: number[],
): number {
  for (let i = 0; i < character.classes.length; i++) {
    const classData = getClassById(character.classes[i].classId);
    if (!classData) continue;
    if (classData.hitDie === dieSize) {
      const total = character.hitDiceTotal[i] ?? 0;
      const used = currentUsed[i] ?? 0;
      if (used < total) {
        return i;
      }
    }
  }
  return -1;
}

/**
 * Get IDs of class features that recharge on the given rest type.
 */
function getResetFeatureIds(
  character: Character,
  rechargeType: 'shortRest' | 'longRest',
): string[] {
  const featureIds: string[] = [];

  for (const classSel of character.classes) {
    const classData = getClassById(classSel.classId);
    if (!classData) continue;

    for (const [, features] of Object.entries(classData.features)) {
      for (const feature of features as ClassFeature[]) {
        if (feature.recharge === rechargeType) {
          featureIds.push(feature.id);
        }
      }
    }
  }

  return featureIds;
}

/**
 * Recover hit dice proportionally across classes.
 * Recovers up to `diceToRecover` total dice, prioritizing classes with
 * the most used dice first.
 */
function recoverHitDice(
  character: Character,
  diceToRecover: number,
): number[] {
  const newUsed = [...character.hitDiceUsed];
  let remaining = diceToRecover;

  // Create indices sorted by most used dice first
  const indices = newUsed
    .map((used, i) => ({ i, used }))
    .sort((a, b) => b.used - a.used);

  for (const { i } of indices) {
    if (remaining <= 0) break;
    const canRecover = Math.min(newUsed[i], remaining);
    newUsed[i] -= canRecover;
    remaining -= canRecover;
  }

  return newUsed;
}

/**
 * Restore Warlock pact magic slots on short rest.
 */
function recoverPactMagic(
  character: Character,
): Character['spellcasting'] | null {
  if (!character.spellcasting) return null;
  if (!character.spellcasting.pactMagic) return null;

  return {
    ...character.spellcasting,
    pactMagic: {
      ...character.spellcasting.pactMagic,
      usedSlots: 0,
    },
  };
}

/**
 * Restore all spell slots (standard + pact) on long rest.
 */
function restoreAllSpellSlots(
  character: Character,
): Character['spellcasting'] | null {
  if (!character.spellcasting) return null;

  const resetUsedSlots: Record<number, number> = {};
  for (const key of Object.keys(character.spellcasting.usedSpellSlots)) {
    resetUsedSlots[Number(key)] = 0;
  }

  const updated: Character['spellcasting'] = {
    ...character.spellcasting,
    usedSpellSlots: resetUsedSlots,
    activeConcentration: undefined,
  };

  // Also reset pact magic if present
  if (character.spellcasting.pactMagic) {
    return {
      ...updated,
      pactMagic: {
        ...character.spellcasting.pactMagic,
        usedSlots: 0,
        mysticArcanum: Object.fromEntries(
          Object.entries(character.spellcasting.pactMagic.mysticArcanum).map(
            ([level, data]) => [level, { ...data, used: false }],
          ),
        ),
      },
    };
  }

  return updated;
}
