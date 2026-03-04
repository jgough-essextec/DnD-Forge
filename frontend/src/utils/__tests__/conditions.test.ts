/**
 * Unit tests for conditions utility functions (Epic 29)
 *
 * Tests pure functions: addCondition, removeCondition, hasCondition,
 * getExhaustionLevel, setExhaustionLevel, incrementExhaustion,
 * decrementExhaustion, getConditionEffects, getExhaustionEffects,
 * getConditionModifiers.
 */

import { describe, it, expect } from 'vitest'
import type { ConditionInstance } from '@/types/combat'
import {
  addCondition,
  removeCondition,
  hasCondition,
  getExhaustionLevel,
  setExhaustionLevel,
  incrementExhaustion,
  decrementExhaustion,
  getConditionEffects,
  getExhaustionEffects,
  getConditionModifiers,
} from '@/utils/conditions'

// ---------------------------------------------------------------------------
// addCondition
// ---------------------------------------------------------------------------

describe('addCondition', () => {
  it('should add a new condition to an empty list', () => {
    const result = addCondition([], { condition: 'poisoned' })
    expect(result).toHaveLength(1)
    expect(result[0].condition).toBe('poisoned')
  })

  it('should add a new condition to an existing list', () => {
    const existing: ConditionInstance[] = [{ condition: 'blinded' }]
    const result = addCondition(existing, { condition: 'poisoned' })
    expect(result).toHaveLength(2)
    expect(result.map((c) => c.condition)).toContain('poisoned')
    expect(result.map((c) => c.condition)).toContain('blinded')
  })

  it('should prevent duplicate conditions (no stacking except exhaustion)', () => {
    const existing: ConditionInstance[] = [{ condition: 'poisoned' }]
    const result = addCondition(existing, { condition: 'poisoned' })
    expect(result).toHaveLength(1)
    // Should return the same reference since nothing changed
    expect(result).toBe(existing)
  })

  it('should preserve source and duration on new conditions', () => {
    const result = addCondition([], {
      condition: 'frightened',
      source: 'Dragon Fear',
      duration: '1 minute',
    })
    expect(result[0].source).toBe('Dragon Fear')
    expect(result[0].duration).toBe('1 minute')
  })

  it('should increment exhaustion level by 1 when exhaustion already active', () => {
    const existing: ConditionInstance[] = [
      { condition: 'exhaustion', exhaustionLevel: 2 },
    ]
    const result = addCondition(existing, { condition: 'exhaustion' })
    expect(result).toHaveLength(1)
    expect(result[0].exhaustionLevel).toBe(3)
  })

  it('should not increment exhaustion beyond level 6', () => {
    const existing: ConditionInstance[] = [
      { condition: 'exhaustion', exhaustionLevel: 6 },
    ]
    const result = addCondition(existing, { condition: 'exhaustion' })
    expect(result[0].exhaustionLevel).toBe(6)
    // Should return same reference
    expect(result).toBe(existing)
  })

  it('should add exhaustion at level 1 when not previously present', () => {
    const result = addCondition([], { condition: 'exhaustion' })
    expect(result).toHaveLength(1)
    expect(result[0].condition).toBe('exhaustion')
    expect(result[0].exhaustionLevel).toBe(1)
  })
})

// ---------------------------------------------------------------------------
// removeCondition
// ---------------------------------------------------------------------------

describe('removeCondition', () => {
  it('should remove a condition from the list', () => {
    const existing: ConditionInstance[] = [
      { condition: 'blinded' },
      { condition: 'poisoned' },
    ]
    const result = removeCondition(existing, 'poisoned')
    expect(result).toHaveLength(1)
    expect(result[0].condition).toBe('blinded')
  })

  it('should return unchanged list when condition not present', () => {
    const existing: ConditionInstance[] = [{ condition: 'blinded' }]
    const result = removeCondition(existing, 'poisoned')
    expect(result).toHaveLength(1)
  })

  it('should decrement exhaustion by 1 level (not full removal)', () => {
    const existing: ConditionInstance[] = [
      { condition: 'exhaustion', exhaustionLevel: 3 },
    ]
    const result = removeCondition(existing, 'exhaustion')
    expect(result).toHaveLength(1)
    expect(result[0].exhaustionLevel).toBe(2)
  })

  it('should remove exhaustion entirely when at level 1', () => {
    const existing: ConditionInstance[] = [
      { condition: 'exhaustion', exhaustionLevel: 1 },
    ]
    const result = removeCondition(existing, 'exhaustion')
    expect(result).toHaveLength(0)
  })

  it('should handle removing from empty list', () => {
    const result = removeCondition([], 'blinded')
    expect(result).toHaveLength(0)
  })
})

// ---------------------------------------------------------------------------
// hasCondition
// ---------------------------------------------------------------------------

describe('hasCondition', () => {
  it('should return true when condition is present', () => {
    const conditions: ConditionInstance[] = [{ condition: 'blinded' }]
    expect(hasCondition(conditions, 'blinded')).toBe(true)
  })

  it('should return false when condition is not present', () => {
    const conditions: ConditionInstance[] = [{ condition: 'blinded' }]
    expect(hasCondition(conditions, 'poisoned')).toBe(false)
  })

  it('should return false for empty conditions list', () => {
    expect(hasCondition([], 'blinded')).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// getExhaustionLevel
// ---------------------------------------------------------------------------

describe('getExhaustionLevel', () => {
  it('should return 0 when no exhaustion is present', () => {
    expect(getExhaustionLevel([])).toBe(0)
    expect(getExhaustionLevel([{ condition: 'blinded' }])).toBe(0)
  })

  it('should return the current exhaustion level', () => {
    const conditions: ConditionInstance[] = [
      { condition: 'exhaustion', exhaustionLevel: 4 },
    ]
    expect(getExhaustionLevel(conditions)).toBe(4)
  })

  it('should default to 1 if exhaustionLevel is undefined', () => {
    const conditions: ConditionInstance[] = [{ condition: 'exhaustion' }]
    expect(getExhaustionLevel(conditions)).toBe(1)
  })
})

// ---------------------------------------------------------------------------
// setExhaustionLevel
// ---------------------------------------------------------------------------

describe('setExhaustionLevel', () => {
  it('should set exhaustion to a specific level', () => {
    const result = setExhaustionLevel([], 3)
    expect(result).toHaveLength(1)
    expect(result[0].exhaustionLevel).toBe(3)
  })

  it('should remove exhaustion when set to 0', () => {
    const existing: ConditionInstance[] = [
      { condition: 'exhaustion', exhaustionLevel: 3 },
    ]
    const result = setExhaustionLevel(existing, 0)
    expect(result).toHaveLength(0)
  })

  it('should clamp level to 1-6 range', () => {
    const result = setExhaustionLevel([], 10)
    expect(result[0].exhaustionLevel).toBe(6)
  })

  it('should update existing exhaustion level', () => {
    const existing: ConditionInstance[] = [
      { condition: 'blinded' },
      { condition: 'exhaustion', exhaustionLevel: 2 },
    ]
    const result = setExhaustionLevel(existing, 5)
    expect(result).toHaveLength(2)
    const exhaustion = result.find((c) => c.condition === 'exhaustion')
    expect(exhaustion?.exhaustionLevel).toBe(5)
  })
})

// ---------------------------------------------------------------------------
// incrementExhaustion / decrementExhaustion
// ---------------------------------------------------------------------------

describe('incrementExhaustion', () => {
  it('should add exhaustion at level 1 when not present', () => {
    const result = incrementExhaustion([])
    expect(getExhaustionLevel(result)).toBe(1)
  })

  it('should increment from level 2 to 3', () => {
    const existing: ConditionInstance[] = [
      { condition: 'exhaustion', exhaustionLevel: 2 },
    ]
    const result = incrementExhaustion(existing)
    expect(getExhaustionLevel(result)).toBe(3)
  })

  it('should not increment past level 6', () => {
    const existing: ConditionInstance[] = [
      { condition: 'exhaustion', exhaustionLevel: 6 },
    ]
    const result = incrementExhaustion(existing)
    expect(getExhaustionLevel(result)).toBe(6)
    expect(result).toBe(existing)
  })
})

describe('decrementExhaustion', () => {
  it('should decrement from level 3 to 2', () => {
    const existing: ConditionInstance[] = [
      { condition: 'exhaustion', exhaustionLevel: 3 },
    ]
    const result = decrementExhaustion(existing)
    expect(getExhaustionLevel(result)).toBe(2)
  })

  it('should remove exhaustion when decrementing from level 1', () => {
    const existing: ConditionInstance[] = [
      { condition: 'exhaustion', exhaustionLevel: 1 },
    ]
    const result = decrementExhaustion(existing)
    expect(getExhaustionLevel(result)).toBe(0)
    expect(hasCondition(result, 'exhaustion')).toBe(false)
  })

  it('should return unchanged list when no exhaustion present', () => {
    const existing: ConditionInstance[] = [{ condition: 'blinded' }]
    const result = decrementExhaustion(existing)
    expect(result).toBe(existing)
  })
})

// ---------------------------------------------------------------------------
// getConditionEffects
// ---------------------------------------------------------------------------

describe('getConditionEffects', () => {
  it('should return mechanical effects text for Poisoned', () => {
    const effects = getConditionEffects('poisoned')
    expect(effects).toContain('Disadvantage on attack rolls')
    expect(effects).toContain('Disadvantage on ability checks')
  })

  it('should return mechanical effects text for Blinded', () => {
    const effects = getConditionEffects('blinded')
    expect(effects).toContain('Cannot see')
    expect(effects).toContain('disadvantage')
  })

  it('should return mechanical effects for all 14 standard conditions', () => {
    const standardConditions = [
      'blinded', 'charmed', 'deafened', 'frightened', 'grappled',
      'incapacitated', 'invisible', 'paralyzed', 'petrified', 'poisoned',
      'prone', 'restrained', 'stunned', 'unconscious',
    ] as const
    for (const condition of standardConditions) {
      const effects = getConditionEffects(condition)
      expect(effects.length).toBeGreaterThan(0)
    }
  })

  it('should return empty string for an unknown condition', () => {
    const effects = getConditionEffects('nonexistent' as never)
    expect(effects).toBe('')
  })
})

// ---------------------------------------------------------------------------
// getExhaustionEffects
// ---------------------------------------------------------------------------

describe('getExhaustionEffects', () => {
  it('should return empty array for level 0', () => {
    expect(getExhaustionEffects(0)).toEqual([])
  })

  it('should return 1 effect for level 1', () => {
    const effects = getExhaustionEffects(1)
    expect(effects).toHaveLength(1)
    expect(effects[0]).toContain('Disadvantage on ability checks')
  })

  it('should return cumulative effects for level 3', () => {
    const effects = getExhaustionEffects(3)
    expect(effects).toHaveLength(3)
    expect(effects[0]).toContain('Disadvantage on ability checks')
    expect(effects[1]).toContain('Speed halved')
    expect(effects[2]).toContain('Disadvantage on attack rolls and saving throws')
  })

  it('should return all 6 effects for level 6', () => {
    const effects = getExhaustionEffects(6)
    expect(effects).toHaveLength(6)
    expect(effects[5]).toContain('Death')
  })

  it('should clamp to max level 6', () => {
    const effects = getExhaustionEffects(10)
    expect(effects).toHaveLength(6)
  })

  it('should return empty array for negative level', () => {
    expect(getExhaustionEffects(-1)).toEqual([])
  })
})

// ---------------------------------------------------------------------------
// getConditionModifiers (Story 29.3)
// ---------------------------------------------------------------------------

describe('getConditionModifiers', () => {
  it('should return empty modifiers for empty conditions', () => {
    const mods = getConditionModifiers([])
    expect(mods.disadvantageOn).toEqual([])
    expect(mods.advantageOn).toEqual([])
    expect(mods.autoFailOn).toEqual([])
    expect(mods.speedOverride).toBeNull()
    expect(mods.hpMaxModifier).toBe(1)
    expect(mods.banners).toEqual([])
  })

  it('should return disadvantageOn attack_rolls and ability_checks for Poisoned', () => {
    const mods = getConditionModifiers([{ condition: 'poisoned' }])
    expect(mods.disadvantageOn).toContain('attack_rolls')
    expect(mods.disadvantageOn).toContain('ability_checks')
  })

  it('should return disadvantageOn attack_rolls and autoFailOn sight_checks for Blinded', () => {
    const mods = getConditionModifiers([{ condition: 'blinded' }])
    expect(mods.disadvantageOn).toContain('attack_rolls')
    expect(mods.autoFailOn).toContain('sight_checks')
  })

  it('should return speedOverride 0 for Grappled and Restrained', () => {
    const grappled = getConditionModifiers([{ condition: 'grappled' }])
    expect(grappled.speedOverride).toBe(0)

    const restrained = getConditionModifiers([{ condition: 'restrained' }])
    expect(restrained.speedOverride).toBe(0)
  })

  it('should return hpMaxModifier 0.5 for Exhaustion Level 4', () => {
    const mods = getConditionModifiers([
      { condition: 'exhaustion', exhaustionLevel: 4 },
    ])
    expect(mods.hpMaxModifier).toBe(0.5)
  })

  it('should return banners for Paralyzed, Stunned, and Unconscious', () => {
    const paralyzed = getConditionModifiers([{ condition: 'paralyzed' }])
    expect(paralyzed.banners).toHaveLength(1)
    expect(paralyzed.banners[0].severity).toBe('critical')
    expect(paralyzed.banners[0].text).toContain('PARALYZED')

    const stunned = getConditionModifiers([{ condition: 'stunned' }])
    expect(stunned.banners).toHaveLength(1)
    expect(stunned.banners[0].text).toContain('STUNNED')

    const unconscious = getConditionModifiers([{ condition: 'unconscious' }])
    expect(unconscious.banners).toHaveLength(1)
    expect(unconscious.banners[0].text).toContain('UNCONSCIOUS')
  })

  it('should combine modifiers from multiple simultaneous conditions', () => {
    const mods = getConditionModifiers([
      { condition: 'blinded' },
      { condition: 'poisoned' },
    ])
    expect(mods.disadvantageOn).toContain('attack_rolls')
    expect(mods.disadvantageOn).toContain('ability_checks')
    expect(mods.autoFailOn).toContain('sight_checks')
  })

  it('should return cumulative exhaustion effects (Level 3)', () => {
    const mods = getConditionModifiers([
      { condition: 'exhaustion', exhaustionLevel: 3 },
    ])
    expect(mods.disadvantageOn).toContain('ability_checks')
    expect(mods.disadvantageOn).toContain('attack_rolls')
    expect(mods.disadvantageOn).toContain('saving_throws')
    // Speed halved sentinel
    expect(mods.speedOverride).toBe(-1)
  })

  it('should return advantageOn attack_rolls for Invisible', () => {
    const mods = getConditionModifiers([{ condition: 'invisible' }])
    expect(mods.advantageOn).toContain('attack_rolls')
  })

  it('should return speedOverride 0 for Exhaustion Level 5', () => {
    const mods = getConditionModifiers([
      { condition: 'exhaustion', exhaustionLevel: 5 },
    ])
    expect(mods.speedOverride).toBe(0)
  })

  it('should return death banner for Exhaustion Level 6', () => {
    const mods = getConditionModifiers([
      { condition: 'exhaustion', exhaustionLevel: 6 },
    ])
    expect(mods.banners.some((b) => b.text.includes('dies from exhaustion'))).toBe(true)
    expect(mods.banners.some((b) => b.severity === 'critical')).toBe(true)
  })

  it('should return autoFailOn hearing_checks for Deafened', () => {
    const mods = getConditionModifiers([{ condition: 'deafened' }])
    expect(mods.autoFailOn).toContain('hearing_checks')
  })

  it('should handle Frightened: disadvantage on ability_checks and attack_rolls', () => {
    const mods = getConditionModifiers([{ condition: 'frightened' }])
    expect(mods.disadvantageOn).toContain('ability_checks')
    expect(mods.disadvantageOn).toContain('attack_rolls')
  })

  it('should handle Restrained: speed 0, disadvantage on DEX saves and attacks', () => {
    const mods = getConditionModifiers([{ condition: 'restrained' }])
    expect(mods.speedOverride).toBe(0)
    expect(mods.disadvantageOn).toContain('dexterity_saves')
    expect(mods.disadvantageOn).toContain('attack_rolls')
  })

  it('should handle Incapacitated: banner about actions/reactions', () => {
    const mods = getConditionModifiers([{ condition: 'incapacitated' }])
    expect(mods.banners).toHaveLength(1)
    expect(mods.banners[0].text).toContain('Cannot take actions or reactions')
  })

  it('should handle null/undefined conditions array', () => {
    const mods = getConditionModifiers(null as unknown as ConditionInstance[])
    expect(mods.disadvantageOn).toEqual([])
    expect(mods.hpMaxModifier).toBe(1)
  })
})
