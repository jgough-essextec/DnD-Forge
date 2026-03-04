// =============================================================================
// Tests for condition-modifiers.ts (Story 29.3)
//
// Tests the boolean-based ConditionModifiers interface and the
// getConditionEffectsDescription function used for rendering.
// =============================================================================

import { describe, it, expect } from 'vitest'
import type { ConditionInstance } from '@/types/combat'
import {
  getConditionModifiers,
  getConditionEffectsDescription,
  EMPTY_CONDITION_MODIFIERS,
} from '@/utils/condition-modifiers'

// ---------------------------------------------------------------------------
// getConditionModifiers (boolean interface)
// ---------------------------------------------------------------------------

describe('getConditionModifiers (boolean interface)', () => {
  it('should return all-false modifiers for empty conditions', () => {
    const mods = getConditionModifiers([])
    expect(mods).toEqual(EMPTY_CONDITION_MODIFIERS)
    expect(mods.disadvantageOnAttacks).toBe(false)
    expect(mods.isDead).toBe(false)
  })

  it('should set disadvantageOnAttacks for Blinded', () => {
    const mods = getConditionModifiers([{ condition: 'blinded' }])
    expect(mods.disadvantageOnAttacks).toBe(true)
    expect(mods.attacksAgainstHaveAdvantage).toBe(true)
  })

  it('should set disadvantageOnAttacks and disadvantageOnAbilityChecks for Frightened', () => {
    const mods = getConditionModifiers([{ condition: 'frightened' }])
    expect(mods.disadvantageOnAttacks).toBe(true)
    expect(mods.disadvantageOnAbilityChecks).toBe(true)
  })

  it('should set disadvantageOnAttacks and disadvantageOnAbilityChecks for Poisoned', () => {
    const mods = getConditionModifiers([{ condition: 'poisoned' }])
    expect(mods.disadvantageOnAttacks).toBe(true)
    expect(mods.disadvantageOnAbilityChecks).toBe(true)
  })

  it('should set advantageOnAttacks for Invisible', () => {
    const mods = getConditionModifiers([{ condition: 'invisible' }])
    expect(mods.advantageOnAttacks).toBe(true)
    expect(mods.attacksAgainstHaveDisadvantage).toBe(true)
  })

  it('should set autoFailStrDexSaves and incapacitated for Paralyzed', () => {
    const mods = getConditionModifiers([{ condition: 'paralyzed' }])
    expect(mods.autoFailStrDexSaves).toBe(true)
    expect(mods.incapacitated).toBe(true)
    expect(mods.cantSpeak).toBe(true)
    expect(mods.speedZero).toBe(true)
    expect(mods.attacksAgainstHaveAdvantage).toBe(true)
  })

  it('should set autoFailStrDexSaves and incapacitated for Stunned', () => {
    const mods = getConditionModifiers([{ condition: 'stunned' }])
    expect(mods.autoFailStrDexSaves).toBe(true)
    expect(mods.incapacitated).toBe(true)
    expect(mods.attacksAgainstHaveAdvantage).toBe(true)
  })

  it('should set speedZero for Grappled', () => {
    const mods = getConditionModifiers([{ condition: 'grappled' }])
    expect(mods.speedZero).toBe(true)
  })

  it('should set speedZero and disadvantageOnAttacks for Restrained', () => {
    const mods = getConditionModifiers([{ condition: 'restrained' }])
    expect(mods.speedZero).toBe(true)
    expect(mods.disadvantageOnAttacks).toBe(true)
    expect(mods.attacksAgainstHaveAdvantage).toBe(true)
  })

  it('should handle cumulative exhaustion effects', () => {
    // Level 1
    const mods1 = getConditionModifiers([
      { condition: 'exhaustion', exhaustionLevel: 1 },
    ])
    expect(mods1.disadvantageOnAbilityChecks).toBe(true)
    expect(mods1.speedHalved).toBe(false)

    // Level 2
    const mods2 = getConditionModifiers([
      { condition: 'exhaustion', exhaustionLevel: 2 },
    ])
    expect(mods2.disadvantageOnAbilityChecks).toBe(true)
    expect(mods2.speedHalved).toBe(true)

    // Level 3
    const mods3 = getConditionModifiers([
      { condition: 'exhaustion', exhaustionLevel: 3 },
    ])
    expect(mods3.disadvantageOnAttacks).toBe(true)
    expect(mods3.disadvantageOnSavingThrows).toBe(true)

    // Level 4
    const mods4 = getConditionModifiers([
      { condition: 'exhaustion', exhaustionLevel: 4 },
    ])
    expect(mods4.hpMaxHalved).toBe(true)

    // Level 5
    const mods5 = getConditionModifiers([
      { condition: 'exhaustion', exhaustionLevel: 5 },
    ])
    expect(mods5.speedZero).toBe(true)

    // Level 6
    const mods6 = getConditionModifiers([
      { condition: 'exhaustion', exhaustionLevel: 6 },
    ])
    expect(mods6.isDead).toBe(true)
  })

  it('should compound modifiers from multiple conditions', () => {
    const conditions: ConditionInstance[] = [
      { condition: 'blinded' },
      { condition: 'poisoned' },
    ]
    const mods = getConditionModifiers(conditions)
    expect(mods.disadvantageOnAttacks).toBe(true)
    expect(mods.disadvantageOnAbilityChecks).toBe(true)
    expect(mods.attacksAgainstHaveAdvantage).toBe(true)
  })

  it('should handle Unconscious: incapacitated, cantSpeak, autoFail, speedZero', () => {
    const mods = getConditionModifiers([{ condition: 'unconscious' }])
    expect(mods.incapacitated).toBe(true)
    expect(mods.cantSpeak).toBe(true)
    expect(mods.autoFailStrDexSaves).toBe(true)
    expect(mods.attacksAgainstHaveAdvantage).toBe(true)
    expect(mods.speedZero).toBe(true)
  })

  it('should handle Petrified: incapacitated, cantSpeak, autoFail', () => {
    const mods = getConditionModifiers([{ condition: 'petrified' }])
    expect(mods.incapacitated).toBe(true)
    expect(mods.cantSpeak).toBe(true)
    expect(mods.autoFailStrDexSaves).toBe(true)
    expect(mods.speedZero).toBe(true)
  })

  it('should set incapacitated for Incapacitated', () => {
    const mods = getConditionModifiers([{ condition: 'incapacitated' }])
    expect(mods.incapacitated).toBe(true)
    expect(mods.disadvantageOnAttacks).toBe(false)
  })

  it('should set disadvantageOnAttacks for Prone', () => {
    const mods = getConditionModifiers([{ condition: 'prone' }])
    expect(mods.disadvantageOnAttacks).toBe(true)
    expect(mods.speedZero).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// getConditionEffectsDescription
// ---------------------------------------------------------------------------

describe('getConditionEffectsDescription', () => {
  it('should return effect descriptions for Poisoned', () => {
    const effects = getConditionEffectsDescription('poisoned')
    expect(effects).toContain('Disadvantage on attack rolls')
    expect(effects).toContain('Disadvantage on ability checks')
  })

  it('should return effect descriptions for Invisible', () => {
    const effects = getConditionEffectsDescription('invisible')
    expect(effects).toContain('Advantage on attack rolls')
    expect(effects).toContain('Attacks against you have disadvantage')
  })

  it('should return effect descriptions for Paralyzed', () => {
    const effects = getConditionEffectsDescription('paralyzed')
    expect(effects).toContain('Incapacitated (can\'t take actions or reactions)')
    expect(effects).toContain('Automatically fail Strength and Dexterity saving throws')
    expect(effects).toContain('Speed reduced to 0')
    expect(effects).toContain('Can\'t speak')
  })

  it('should return cumulative exhaustion effects', () => {
    const effects = getConditionEffectsDescription('exhaustion', 3)
    expect(effects).toHaveLength(3)
    expect(effects[0]).toContain('Level 1')
    expect(effects[1]).toContain('Level 2')
    expect(effects[2]).toContain('Level 3')
  })

  it('should return all 6 effects for exhaustion level 6', () => {
    const effects = getConditionEffectsDescription('exhaustion', 6)
    expect(effects).toHaveLength(6)
    expect(effects[5]).toContain('Death')
  })

  it('should return empty array for Charmed (no mechanical modifiers)', () => {
    const effects = getConditionEffectsDescription('charmed')
    expect(effects).toEqual([])
  })

  it('should return speed-related effects for Grappled', () => {
    const effects = getConditionEffectsDescription('grappled')
    expect(effects).toContain('Speed reduced to 0')
  })
})
