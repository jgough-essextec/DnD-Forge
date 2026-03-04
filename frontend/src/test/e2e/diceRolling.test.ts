/**
 * E2E Integration Test: Dice Rolling Flow (Epic 45, Story 45.2)
 *
 * Tests the complete dice engine flow: single d20 roll (result in [1,20]),
 * advantage/disadvantage (two dice, keep higher/lower), skill check with
 * modifier application, attack rolls, damage rolls, and initiative.
 * Uses injectable random sources for deterministic verification.
 */

import { describe, it, expect } from 'vitest'
import {
  rollDie,
  rollDice,
  rollWithAdvantage,
  rollWithDisadvantage,
  rollCheck,
  rollAttack,
  rollDamage,
  rollInitiative,
  rollExpression,
  rollAbilityScore,
  rollAbilityScores,
  rollHitPoints,
  parseDiceNotation,
} from '@/utils/dice'

// ---------------------------------------------------------------------------
// d20 Roll: Result in [1, 20]
// ---------------------------------------------------------------------------

describe('Dice Rolling: Basic d20', () => {
  it('rolls a d20 with result in [1, 20]', () => {
    for (let i = 0; i < 50; i++) {
      const result = rollDie('d20')
      expect(result).toBeGreaterThanOrEqual(1)
      expect(result).toBeLessThanOrEqual(20)
    }
  })

  it('rolls a d6 with result in [1, 6]', () => {
    for (let i = 0; i < 50; i++) {
      const result = rollDie('d6')
      expect(result).toBeGreaterThanOrEqual(1)
      expect(result).toBeLessThanOrEqual(6)
    }
  })

  it('rolls multiple dice and returns correct count', () => {
    const results = rollDice(4, 'd6')
    expect(results).toHaveLength(4)
    for (const r of results) {
      expect(r).toBeGreaterThanOrEqual(1)
      expect(r).toBeLessThanOrEqual(6)
    }
  })

  it('uses injectable random source for deterministic rolls', () => {
    // Source that always returns 0.5 -> d20 should give 11
    const result = rollDie('d20', () => 0.5)
    expect(result).toBe(11) // min + floor(0.5 * 20) = 1 + 10 = 11
  })
})

// ---------------------------------------------------------------------------
// Advantage / Disadvantage
// ---------------------------------------------------------------------------

describe('Dice Rolling: Advantage and Disadvantage', () => {
  it('advantage rolls two d20s and keeps the higher', () => {
    // Inject: first roll low (0.1 -> 3), second roll high (0.9 -> 19)
    let callCount = 0
    const source = () => {
      callCount++
      return callCount === 1 ? 0.1 : 0.9
    }

    const result = rollWithAdvantage(source)
    expect(result.rolls).toHaveLength(2)
    expect(result.rolls[0]).toBe(3)  // floor(0.1 * 20) + 1 = 3
    expect(result.rolls[1]).toBe(19) // floor(0.9 * 20) + 1 = 19
    expect(result.result).toBe(19)   // higher kept
  })

  it('disadvantage rolls two d20s and keeps the lower', () => {
    let callCount = 0
    const source = () => {
      callCount++
      return callCount === 1 ? 0.1 : 0.9
    }

    const result = rollWithDisadvantage(source)
    expect(result.rolls).toHaveLength(2)
    expect(result.result).toBe(3) // lower kept
  })

  it('advantage with same rolls returns that value', () => {
    const result = rollWithAdvantage(() => 0.5)
    expect(result.rolls[0]).toBe(result.rolls[1])
    expect(result.result).toBe(result.rolls[0])
  })
})

// ---------------------------------------------------------------------------
// Skill Check with Modifier
// ---------------------------------------------------------------------------

describe('Dice Rolling: Skill Check with Modifier', () => {
  it('applies modifier to the roll total', () => {
    // Roll 11, modifier +5 -> total 16
    const result = rollCheck(5, false, false, () => 0.5)
    expect(result.naturalRoll).toBe(11)
    expect(result.modifier).toBe(5)
    expect(result.total).toBe(16)
  })

  it('applies negative modifier correctly', () => {
    const result = rollCheck(-2, false, false, () => 0.5)
    expect(result.naturalRoll).toBe(11)
    expect(result.total).toBe(9)
  })

  it('detects natural 20 (critical)', () => {
    // 0.95 * 20 = 19, floor + 1 = 20
    const result = rollCheck(0, false, false, () => 0.95)
    expect(result.naturalRoll).toBe(20)
    expect(result.isCritical).toBe(true)
    expect(result.isCriticalFail).toBe(false)
  })

  it('detects natural 1 (critical fail)', () => {
    // 0.0 * 20 = 0, floor + 1 = 1
    const result = rollCheck(0, false, false, () => 0.0)
    expect(result.naturalRoll).toBe(1)
    expect(result.isCritical).toBe(false)
    expect(result.isCriticalFail).toBe(true)
  })

  it('advantage and disadvantage cancel out to normal roll', () => {
    const result = rollCheck(3, true, true, () => 0.5)
    expect(result.naturalRoll).toBe(11)
    expect(result.total).toBe(14)
  })

  it('check with advantage uses higher of two rolls', () => {
    let callCount = 0
    const source = () => {
      callCount++
      return callCount === 1 ? 0.1 : 0.9
    }

    const result = rollCheck(2, true, false, source)
    expect(result.naturalRoll).toBe(19) // advantage keeps higher
    expect(result.total).toBe(21)
  })
})

// ---------------------------------------------------------------------------
// Attack Rolls
// ---------------------------------------------------------------------------

describe('Dice Rolling: Attack Rolls', () => {
  it('attack roll applies attack bonus', () => {
    const result = rollAttack(7, false, false, () => 0.5)
    expect(result.roll).toBe(11)
    expect(result.attackBonus).toBe(7)
    expect(result.total).toBe(18)
  })

  it('critical attack on natural 20', () => {
    const result = rollAttack(5, false, false, () => 0.95)
    expect(result.isCritical).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// Damage Rolls
// ---------------------------------------------------------------------------

describe('Dice Rolling: Damage Rolls', () => {
  it('rolls damage with multiple dice groups', () => {
    const result = rollDamage(
      [{ count: 2, die: 'd6' }, { count: 1, die: 'd8' }],
      3,
      () => 0.5,
    )

    expect(result.rolls).toHaveLength(2)
    expect(result.rolls[0].die).toBe('d6')
    expect(result.rolls[0].results).toHaveLength(2)
    expect(result.rolls[1].die).toBe('d8')
    expect(result.rolls[1].results).toHaveLength(1)
    expect(result.bonus).toBe(3)
    // 2*4 + 5 + 3 = 16
    expect(result.total).toBe(16)
  })

  it('damage with no bonus', () => {
    const result = rollDamage([{ count: 1, die: 'd8' }], undefined, () => 0.5)
    expect(result.bonus).toBe(0)
    expect(result.total).toBe(5)
  })
})

// ---------------------------------------------------------------------------
// Initiative
// ---------------------------------------------------------------------------

describe('Dice Rolling: Initiative', () => {
  it('rolls initiative with DEX modifier', () => {
    const result = rollInitiative(3, 0, () => 0.5)
    expect(result.roll).toBe(11)
    expect(result.modifier).toBe(3)
    expect(result.total).toBe(14)
  })

  it('rolls initiative with DEX modifier and bonus', () => {
    const result = rollInitiative(2, 5, () => 0.5)
    expect(result.modifier).toBe(7)
    expect(result.total).toBe(18)
  })
})

// ---------------------------------------------------------------------------
// Dice Notation Parsing
// ---------------------------------------------------------------------------

describe('Dice Rolling: Notation Parsing', () => {
  it('parses simple notation "1d20"', () => {
    const parsed = parseDiceNotation('1d20')
    expect(parsed.count).toBe(1)
    expect(parsed.sides).toBe(20)
    expect(parsed.modifier).toBe(0)
  })

  it('parses "2d6+3"', () => {
    const parsed = parseDiceNotation('2d6+3')
    expect(parsed.count).toBe(2)
    expect(parsed.sides).toBe(6)
    expect(parsed.modifier).toBe(3)
  })

  it('parses "4d6kh3" (keep highest 3)', () => {
    const parsed = parseDiceNotation('4d6kh3')
    expect(parsed.count).toBe(4)
    expect(parsed.sides).toBe(6)
    expect(parsed.keepHighest).toBe(3)
  })

  it('rollExpression evaluates "2d6+3" correctly', () => {
    const result = rollExpression('2d6+3', () => 0.5)
    expect(result.rolls).toHaveLength(2)
    expect(result.modifier).toBe(3)
    // Each d6 at 0.5 = 4, so 4+4+3 = 11
    expect(result.total).toBe(11)
  })

  it('throws on invalid notation', () => {
    expect(() => parseDiceNotation('invalid')).toThrow()
  })
})

// ---------------------------------------------------------------------------
// Ability Score Rolling
// ---------------------------------------------------------------------------

describe('Dice Rolling: Ability Score Generation', () => {
  it('rolls a single ability score with 4d6 drop lowest', () => {
    const result = rollAbilityScore(() => 0.5)
    expect(result.rolls).toHaveLength(4)
    expect(result.total).toBeGreaterThanOrEqual(3)
    expect(result.total).toBeLessThanOrEqual(18)
  })

  it('rolls a full set of 6 ability scores', () => {
    const scores = rollAbilityScores()
    expect(scores).toHaveLength(6)
    for (const score of scores) {
      expect(score.total).toBeGreaterThanOrEqual(3)
      expect(score.total).toBeLessThanOrEqual(18)
    }
  })
})

// ---------------------------------------------------------------------------
// Hit Point Rolling on Level Up
// ---------------------------------------------------------------------------

describe('Dice Rolling: Level Up HP', () => {
  it('rolls hit points with minimum of 1', () => {
    // CON modifier -2, roll at 0.0 = 1 on d10 -> 1 + (-2) = -1 -> clamped to 1
    const hp = rollHitPoints(10, -2, () => 0.0)
    expect(hp).toBe(1)
  })

  it('adds CON modifier to HP roll', () => {
    // roll 0.5 on d10 = 6, CON +3 = 9
    const hp = rollHitPoints(10, 3, () => 0.5)
    expect(hp).toBe(9)
  })
})
