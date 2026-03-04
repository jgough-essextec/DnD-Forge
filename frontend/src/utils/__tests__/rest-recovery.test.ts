/**
 * Tests for rest-recovery.ts (Story 30.3)
 *
 * Covers feature usage extraction, max uses scaling, recovery type detection,
 * short rest UI results, long rest UI results, hit dice recovery math,
 * and feature recovery filtering.
 */

import { describe, it, expect } from 'vitest'
import type { Character } from '@/types/character'
import type { AbilityScores } from '@/types/core'
import {
  getCharacterFeatureUsages,
  getFeatureMaxUses,
  getFeatureRecoveryType,
  applyShortRestUI,
  applyLongRestUI,
} from '@/utils/rest-recovery'

// ---------------------------------------------------------------------------
// Test Helpers
// ---------------------------------------------------------------------------

const BASE_ABILITY_SCORES: AbilityScores = {
  strength: 10,
  dexterity: 14,
  constitution: 14,
  intelligence: 10,
  wisdom: 10,
  charisma: 10,
}

function makeCharacter(overrides: Partial<Character> = {}): Character {
  return {
    id: 'test-char',
    name: 'Test Character',
    playerName: 'Tester',
    avatarUrl: null,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    version: 1,
    race: { raceId: 'human' },
    classes: [{ classId: 'fighter', level: 5, chosenSkills: [], hpRolls: [] }],
    background: { backgroundId: 'soldier' },
    alignment: 'true-neutral',
    baseAbilityScores: BASE_ABILITY_SCORES,
    abilityScores: BASE_ABILITY_SCORES,
    abilityScoreMethod: 'standard',
    level: 5,
    experiencePoints: 6500,
    hpMax: 44,
    hpCurrent: 30,
    tempHp: 0,
    hitDiceTotal: [5],
    hitDiceUsed: [2],
    deathSaves: { successes: 0, failures: 0, stable: false },
    combatStats: {
      armorClass: { base: 10, dexModifier: 2, shieldBonus: 0, otherBonuses: [], formula: '10 + DEX' },
      initiative: 2,
      speed: { walk: 30 },
      hitPoints: { maximum: 44, current: 30, temporary: 0, hitDice: { total: [{ count: 5, die: 'd10' }], used: [2] } },
      attacks: [],
      savingThrows: {},
    },
    speed: { walk: 30 },
    proficiencies: { armor: [], weapons: [], tools: [], languages: ['common'], skills: [], savingThrows: [] },
    inventory: [],
    currency: { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 },
    attunedItems: [],
    spellcasting: null,
    features: [],
    feats: [],
    description: { age: '', height: '', weight: '', eyes: '', skin: '', hair: '', appearance: '' },
    personality: { personalityTraits: '', ideals: '', bonds: '', flaws: '' },
    conditions: [],
    inspiration: false,
    campaignId: null,
    isArchived: false,
    armorClassOverride: undefined,
    initiativeBonus: undefined,
    dmNotes: undefined,
    abilityScoreRolls: undefined,
    ...overrides,
  } as unknown as Character
}

// ---------------------------------------------------------------------------
// Feature Usage Extraction Tests
// ---------------------------------------------------------------------------

describe('getCharacterFeatureUsages', () => {
  it('extracts Fighter short rest features (Second Wind, Action Surge)', () => {
    const char = makeCharacter({
      classes: [{ classId: 'fighter', level: 5, chosenSkills: [], hpRolls: [] }],
    })

    const usages = getCharacterFeatureUsages(char)
    const featureIds = usages.map((u) => u.featureId)

    expect(featureIds).toContain('second-wind')
    expect(featureIds).toContain('action-surge')
  })

  it('extracts Barbarian long rest features (Rage)', () => {
    const char = makeCharacter({
      classes: [{ classId: 'barbarian', level: 3, chosenSkills: [], hpRolls: [] }],
    })

    const usages = getCharacterFeatureUsages(char)
    const rage = usages.find((u) => u.featureId === 'rage')

    expect(rage).toBeDefined()
    expect(rage!.recoversOn).toBe('long_rest')
    expect(rage!.maxUses).toBe(3) // Level 3 = 3 rages
  })

  it('extracts Cleric Channel Divinity (short rest)', () => {
    const char = makeCharacter({
      classes: [{ classId: 'cleric', level: 2, chosenSkills: [], hpRolls: [] }],
    })

    const usages = getCharacterFeatureUsages(char)
    const cd = usages.find((u) => u.featureId === 'channel-divinity')

    expect(cd).toBeDefined()
    expect(cd!.recoversOn).toBe('short_rest')
    expect(cd!.maxUses).toBe(1)
  })

  it('extracts Druid Wild Shape (short rest)', () => {
    const char = makeCharacter({
      classes: [{ classId: 'druid', level: 2, chosenSkills: [], hpRolls: [] }],
    })

    const usages = getCharacterFeatureUsages(char)
    const ws = usages.find((u) => u.featureId === 'wild-shape')

    expect(ws).toBeDefined()
    expect(ws!.recoversOn).toBe('short_rest')
    expect(ws!.maxUses).toBe(2)
  })

  it('extracts Monk Ki points (short rest, = level)', () => {
    const char = makeCharacter({
      classes: [{ classId: 'monk', level: 7, chosenSkills: [], hpRolls: [] }],
    })

    const usages = getCharacterFeatureUsages(char)
    const ki = usages.find((u) => u.featureId === 'ki')

    expect(ki).toBeDefined()
    expect(ki!.recoversOn).toBe('short_rest')
    expect(ki!.maxUses).toBe(7)
  })

  it('extracts Bard features (Bardic Inspiration)', () => {
    const char = makeCharacter({
      classes: [{ classId: 'bard', level: 3, chosenSkills: [], hpRolls: [] }],
      abilityScores: { ...BASE_ABILITY_SCORES, charisma: 16 }, // CHA mod +3
    })

    const usages = getCharacterFeatureUsages(char)
    const bi = usages.find((u) => u.featureId === 'bardic-inspiration')

    expect(bi).toBeDefined()
    expect(bi!.recoversOn).toBe('long_rest') // Below level 5
    expect(bi!.maxUses).toBe(3) // CHA mod = +3
  })

  it('does not extract features without recharge type', () => {
    const char = makeCharacter({
      classes: [{ classId: 'fighter', level: 1, chosenSkills: [], hpRolls: [] }],
    })

    const usages = getCharacterFeatureUsages(char)
    const fightingStyle = usages.find((u) => u.featureId === 'fighting-style-fighter')

    expect(fightingStyle).toBeUndefined()
  })

  it('only includes features at or below the class level', () => {
    const char = makeCharacter({
      classes: [{ classId: 'fighter', level: 1, chosenSkills: [], hpRolls: [] }],
    })

    const usages = getCharacterFeatureUsages(char)
    const actionSurge = usages.find((u) => u.featureId === 'action-surge')

    // Action Surge is level 2, but character is level 1
    expect(actionSurge).toBeUndefined()
  })
})

// ---------------------------------------------------------------------------
// Max Uses Scaling Tests
// ---------------------------------------------------------------------------

describe('getFeatureMaxUses', () => {
  it('returns correct Rage uses at various levels', () => {
    expect(getFeatureMaxUses('rage', 'barbarian', 1, BASE_ABILITY_SCORES)).toBe(2)
    expect(getFeatureMaxUses('rage', 'barbarian', 3, BASE_ABILITY_SCORES)).toBe(3)
    expect(getFeatureMaxUses('rage', 'barbarian', 6, BASE_ABILITY_SCORES)).toBe(4)
    expect(getFeatureMaxUses('rage', 'barbarian', 12, BASE_ABILITY_SCORES)).toBe(5)
    expect(getFeatureMaxUses('rage', 'barbarian', 17, BASE_ABILITY_SCORES)).toBe(6)
    expect(getFeatureMaxUses('rage', 'barbarian', 20, BASE_ABILITY_SCORES)).toBeNull() // Unlimited
  })

  it('returns Ki Points = monk level', () => {
    expect(getFeatureMaxUses('ki', 'monk', 2, BASE_ABILITY_SCORES)).toBe(2)
    expect(getFeatureMaxUses('ki', 'monk', 10, BASE_ABILITY_SCORES)).toBe(10)
    expect(getFeatureMaxUses('ki', 'monk', 20, BASE_ABILITY_SCORES)).toBe(20)
  })

  it('returns Channel Divinity uses scaling at correct levels', () => {
    expect(getFeatureMaxUses('channel-divinity', 'cleric', 2, BASE_ABILITY_SCORES)).toBe(1)
    expect(getFeatureMaxUses('channel-divinity', 'cleric', 6, BASE_ABILITY_SCORES)).toBe(2)
    expect(getFeatureMaxUses('channel-divinity', 'cleric', 18, BASE_ABILITY_SCORES)).toBe(3)
  })

  it('returns Action Surge 1 normally, 2 at level 17+', () => {
    expect(getFeatureMaxUses('action-surge', 'fighter', 2, BASE_ABILITY_SCORES)).toBe(1)
    expect(getFeatureMaxUses('action-surge', 'fighter', 16, BASE_ABILITY_SCORES)).toBe(1)
    expect(getFeatureMaxUses('action-surge', 'fighter', 17, BASE_ABILITY_SCORES)).toBe(2)
  })

  it('returns Lay on Hands pool = 5 x paladin level', () => {
    expect(getFeatureMaxUses('lay-on-hands', 'paladin', 1, BASE_ABILITY_SCORES)).toBe(5)
    expect(getFeatureMaxUses('lay-on-hands', 'paladin', 10, BASE_ABILITY_SCORES)).toBe(50)
  })

  it('returns Sorcery Points = sorcerer level', () => {
    expect(getFeatureMaxUses('font-of-magic', 'sorcerer', 2, BASE_ABILITY_SCORES)).toBe(2)
    expect(getFeatureMaxUses('font-of-magic', 'sorcerer', 15, BASE_ABILITY_SCORES)).toBe(15)
  })

  it('returns Bardic Inspiration = CHA mod (min 1)', () => {
    const highCHA = { ...BASE_ABILITY_SCORES, charisma: 18 } // +4
    expect(getFeatureMaxUses('bardic-inspiration', 'bard', 1, highCHA)).toBe(4)

    const lowCHA = { ...BASE_ABILITY_SCORES, charisma: 8 } // -1, but min 1
    expect(getFeatureMaxUses('bardic-inspiration', 'bard', 1, lowCHA)).toBe(1)
  })

  it('returns null for unknown features', () => {
    expect(getFeatureMaxUses('unknown-feature', 'fighter', 5, BASE_ABILITY_SCORES)).toBeNull()
  })
})

// ---------------------------------------------------------------------------
// Recovery Type Tests
// ---------------------------------------------------------------------------

describe('getFeatureRecoveryType', () => {
  it('returns short_rest for Second Wind', () => {
    expect(getFeatureRecoveryType('second-wind', 'fighter', 1)).toBe('short_rest')
  })

  it('returns short_rest for Action Surge', () => {
    expect(getFeatureRecoveryType('action-surge', 'fighter', 2)).toBe('short_rest')
  })

  it('returns short_rest for Ki', () => {
    expect(getFeatureRecoveryType('ki', 'monk', 2)).toBe('short_rest')
  })

  it('returns long_rest for Rage', () => {
    expect(getFeatureRecoveryType('rage', 'barbarian', 1)).toBe('long_rest')
  })

  it('Bardic Inspiration switches from long_rest to short_rest at Bard 5', () => {
    expect(getFeatureRecoveryType('bardic-inspiration', 'bard', 4)).toBe('long_rest')
    expect(getFeatureRecoveryType('bardic-inspiration', 'bard', 5)).toBe('short_rest')
    expect(getFeatureRecoveryType('bardic-inspiration', 'bard', 10)).toBe('short_rest')
  })

  it('returns long_rest for Arcane Recovery', () => {
    expect(getFeatureRecoveryType('arcane-recovery', 'wizard', 1)).toBe('long_rest')
  })

  it('returns null for unknown features', () => {
    expect(getFeatureRecoveryType('unknown-feature', 'fighter', 5)).toBeNull()
  })
})

// ---------------------------------------------------------------------------
// Short Rest UI Results
// ---------------------------------------------------------------------------

describe('applyShortRestUI', () => {
  it('calculates HP recovery from hit dice spending', () => {
    const char = makeCharacter({
      hpCurrent: 20,
      hpMax: 44,
    })

    const result = applyShortRestUI(char, [
      { classIndex: 0, rolled: 8 },
      { classIndex: 0, rolled: 6 },
    ])

    expect(result.hpBefore).toBe(20)
    expect(result.hpAfter).toBe(34) // 20 + 8 + 6
    expect(result.hitDiceSpent).toBe(2)
  })

  it('caps HP at max', () => {
    const char = makeCharacter({
      hpCurrent: 40,
      hpMax: 44,
    })

    const result = applyShortRestUI(char, [
      { classIndex: 0, rolled: 10 },
    ])

    expect(result.hpAfter).toBe(44)
  })

  it('returns correct features recovered for Fighter', () => {
    const char = makeCharacter({
      classes: [{ classId: 'fighter', level: 5, chosenSkills: [], hpRolls: [] }],
    })

    const result = applyShortRestUI(char, [])
    const recoveredIds = result.featuresRecovered.map((f) => f.featureId)

    expect(recoveredIds).toContain('second-wind')
    expect(recoveredIds).toContain('action-surge')
  })

  it('does not recover long rest features', () => {
    const char = makeCharacter({
      classes: [{ classId: 'barbarian', level: 3, chosenSkills: [], hpRolls: [] }],
    })

    const result = applyShortRestUI(char, [])
    const recoveredIds = result.featuresRecovered.map((f) => f.featureId)

    expect(recoveredIds).not.toContain('rage')
  })

  it('reports slotsRecovered=true when character has pact magic', () => {
    const char = makeCharacter({
      spellcasting: {
        type: 'pact-magic',
        ability: 'charisma',
        cantrips: [],
        knownSpells: [],
        preparedSpells: [],
        spellSlots: {},
        usedSpellSlots: {},
        pactMagic: { slotLevel: 3, totalSlots: 2, usedSlots: 1, mysticArcanum: {} },
        ritualCasting: false,
      },
    })

    const result = applyShortRestUI(char, [])
    expect(result.slotsRecovered).toBe(true)
  })

  it('reports slotsRecovered=false when character has no pact magic', () => {
    const char = makeCharacter()
    const result = applyShortRestUI(char, [])
    expect(result.slotsRecovered).toBe(false)
  })

  it('does not modify exhaustion or death saves', () => {
    const char = makeCharacter({
      conditions: [{ condition: 'exhaustion', exhaustionLevel: 2 }],
      deathSaves: { successes: 1, failures: 1, stable: false },
    })

    const result = applyShortRestUI(char, [])

    expect(result.exhaustionBefore).toBe(2)
    expect(result.exhaustionAfter).toBe(2)
    expect(result.deathSavesReset).toBe(false)
  })

  it('does not recover hit dice', () => {
    const char = makeCharacter()
    const result = applyShortRestUI(char, [])
    expect(result.hitDiceRecovered).toBe(0)
  })
})

// ---------------------------------------------------------------------------
// Long Rest UI Results
// ---------------------------------------------------------------------------

describe('applyLongRestUI', () => {
  it('restores HP to max', () => {
    const char = makeCharacter({ hpCurrent: 10, hpMax: 44 })
    const result = applyLongRestUI(char, [])

    expect(result.hpBefore).toBe(10)
    expect(result.hpAfter).toBe(44)
  })

  it('calculates hit dice recovery (half total, min 1)', () => {
    const char = makeCharacter({
      hitDiceTotal: [8],
      hitDiceUsed: [4],
    })

    const result = applyLongRestUI(char, [])

    // Total = 8, half = 4. Used = 4, so recover 4.
    expect(result.hitDiceRecovered).toBe(4)
  })

  it('recovers minimum 1 hit die even with 1 total', () => {
    const char = makeCharacter({
      hitDiceTotal: [1],
      hitDiceUsed: [1],
    })

    const result = applyLongRestUI(char, [])
    expect(result.hitDiceRecovered).toBe(1) // min 1
  })

  it('does not recover more hit dice than used', () => {
    const char = makeCharacter({
      hitDiceTotal: [10],
      hitDiceUsed: [1],
    })

    const result = applyLongRestUI(char, [])
    expect(result.hitDiceRecovered).toBe(1) // Only 1 was used
  })

  it('reduces exhaustion by 1 level', () => {
    const char = makeCharacter({
      conditions: [{ condition: 'exhaustion', exhaustionLevel: 3 }],
    })

    const result = applyLongRestUI(char, [])

    expect(result.exhaustionBefore).toBe(3)
    expect(result.exhaustionAfter).toBe(2)
  })

  it('removes exhaustion when at level 1', () => {
    const char = makeCharacter({
      conditions: [{ condition: 'exhaustion', exhaustionLevel: 1 }],
    })

    const result = applyLongRestUI(char, [])

    expect(result.exhaustionBefore).toBe(1)
    expect(result.exhaustionAfter).toBe(0)
  })

  it('resets death saves', () => {
    const char = makeCharacter()
    const result = applyLongRestUI(char, [])
    expect(result.deathSavesReset).toBe(true)
  })

  it('recovers both short rest and long rest features', () => {
    const char = makeCharacter({
      classes: [{ classId: 'fighter', level: 5, chosenSkills: [], hpRolls: [] }],
    })

    const result = applyLongRestUI(char, [])
    const recoveredIds = result.featuresRecovered.map((f) => f.featureId)

    expect(recoveredIds).toContain('second-wind') // short rest feature
    expect(recoveredIds).toContain('action-surge') // short rest feature
  })

  it('reports slotsRecovered=true when character has spellcasting', () => {
    const char = makeCharacter({
      spellcasting: {
        type: 'prepared',
        ability: 'wisdom',
        cantrips: [],
        knownSpells: [],
        preparedSpells: [],
        spellSlots: { 1: 4, 2: 3 },
        usedSpellSlots: { 1: 2, 2: 1 },
        ritualCasting: true,
      },
    })

    const result = applyLongRestUI(char, [])
    expect(result.slotsRecovered).toBe(true)
  })

  it('passes through conditionsCleared from input', () => {
    const char = makeCharacter({
      conditions: [
        { condition: 'poisoned' },
        { condition: 'frightened' },
      ],
    })

    const result = applyLongRestUI(char, ['poisoned'])
    expect(result.conditionsCleared).toEqual(['poisoned'])
  })

  it('handles multiclass hit dice recovery', () => {
    const char = makeCharacter({
      classes: [
        { classId: 'fighter', level: 3, chosenSkills: [], hpRolls: [] },
        { classId: 'wizard', level: 2, chosenSkills: [], hpRolls: [] },
      ],
      hitDiceTotal: [3, 2],
      hitDiceUsed: [2, 1],
    })

    const result = applyLongRestUI(char, [])

    // Total = 5, half = 2. Used = 3. Recover min(2, 3) = 2.
    expect(result.hitDiceRecovered).toBe(2)
  })
})
