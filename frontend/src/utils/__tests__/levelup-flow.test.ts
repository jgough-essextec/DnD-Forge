/**
 * Level Up Flow Utility Tests (Epic 31)
 *
 * Unit tests for level-up orchestration functions including
 * getLevelUpChanges, getRequiredSteps, getASILevels, getSubclassLevel,
 * canLevelUp, applyLevelUp, and XP helpers.
 */

import { describe, it, expect } from 'vitest'
import {
  getLevelUpChanges,
  getRequiredSteps,
  getASILevels,
  getSubclassLevel,
  canLevelUp,
  applyLevelUp,
  getXPInfo,
  type LevelUpChanges,
} from '../levelup'
import type { Character } from '@/types/character'

// ---------------------------------------------------------------------------
// Test character factory
// ---------------------------------------------------------------------------

function makeCharacter(overrides: Partial<Character> = {}): Character {
  return {
    id: 'test-1',
    name: 'Test Hero',
    playerName: 'Tester',
    avatarUrl: null,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
    version: 1,
    race: {
      raceId: 'human',
      chosenAbilityBonuses: [],
      chosenLanguages: [],
    },
    classes: [
      {
        classId: 'fighter',
        level: 1,
        chosenSkills: ['athletics', 'perception'],
        hpRolls: [],
      },
    ],
    background: {
      backgroundId: 'soldier',
      characterIdentity: { name: 'Test Hero' },
      characterPersonality: {
        personalityTraits: ['Brave', 'Loyal'],
        ideal: 'Honor',
        bond: 'Comrades',
        flaw: 'Reckless',
      },
    },
    alignment: 'lawful-good',
    baseAbilityScores: {
      strength: 16,
      dexterity: 14,
      constitution: 14,
      intelligence: 10,
      wisdom: 12,
      charisma: 8,
    },
    abilityScores: {
      strength: 16,
      dexterity: 14,
      constitution: 14,
      intelligence: 10,
      wisdom: 12,
      charisma: 8,
    },
    abilityScoreMethod: 'standard',
    level: 1,
    experiencePoints: 300,
    hpMax: 12,
    hpCurrent: 12,
    tempHp: 0,
    hitDiceTotal: [1],
    hitDiceUsed: [0],
    speed: { walk: 30 },
    deathSaves: { successes: 0, failures: 0, stable: false },
    combatStats: {
      armorClass: { base: 10, dexModifier: 2, shieldBonus: 0, otherBonuses: [], formula: '10 + DEX' },
      initiative: 2,
      speed: { walk: 30 },
      hitPoints: {
        maximum: 12,
        current: 12,
        temporary: 0,
        hitDice: { total: [{ count: 1, die: 'd10' }], used: [0] },
      },
      attacks: [],
      savingThrows: { strength: 4, constitution: 4 },
    },
    proficiencies: {
      armor: ['light', 'medium', 'heavy', 'shields'],
      weapons: ['simple melee', 'martial melee'],
      tools: [],
      languages: ['common'],
      skills: [
        { skill: 'athletics', proficient: true, expertise: false },
        { skill: 'perception', proficient: true, expertise: false },
      ],
      savingThrows: ['strength', 'constitution'],
    },
    inventory: [],
    currency: { cp: 0, sp: 0, ep: 0, gp: 10, pp: 0 },
    attunedItems: [],
    spellcasting: null,
    features: ['fighting-style-fighter', 'second-wind'],
    feats: [],
    description: {
      name: 'Test Hero',
      age: '25',
      height: '6\'0"',
      weight: '180 lbs',
      eyes: 'Brown',
      skin: 'Tan',
      hair: 'Black',
      appearance: 'Muscular',
      backstory: '',
      alliesAndOrgs: '',
      treasure: '',
    },
    personality: {
      personalityTraits: ['Brave', 'Loyal'],
      ideal: 'Honor',
      bond: 'Comrades',
      flaw: 'Reckless',
    },
    conditions: [],
    inspiration: false,
    campaignId: null,
    isArchived: false,
    ...overrides,
  } as Character
}

// =============================================================================
// getSubclassLevel
// =============================================================================

describe('getSubclassLevel', () => {
  it('returns 3 for Barbarian', () => {
    expect(getSubclassLevel('barbarian')).toBe(3)
  })

  it('returns 3 for Bard', () => {
    expect(getSubclassLevel('bard')).toBe(3)
  })

  it('returns 1 for Cleric', () => {
    expect(getSubclassLevel('cleric')).toBe(1)
  })

  it('returns 2 for Druid', () => {
    expect(getSubclassLevel('druid')).toBe(2)
  })

  it('returns 3 for Fighter', () => {
    expect(getSubclassLevel('fighter')).toBe(3)
  })

  it('returns 3 for Monk', () => {
    expect(getSubclassLevel('monk')).toBe(3)
  })

  it('returns 3 for Paladin', () => {
    expect(getSubclassLevel('paladin')).toBe(3)
  })

  it('returns 3 for Ranger', () => {
    expect(getSubclassLevel('ranger')).toBe(3)
  })

  it('returns 3 for Rogue', () => {
    expect(getSubclassLevel('rogue')).toBe(3)
  })

  it('returns 1 for Sorcerer', () => {
    expect(getSubclassLevel('sorcerer')).toBe(1)
  })

  it('returns 1 for Warlock', () => {
    expect(getSubclassLevel('warlock')).toBe(1)
  })

  it('returns 2 for Wizard', () => {
    expect(getSubclassLevel('wizard')).toBe(2)
  })
})

// =============================================================================
// getASILevels
// =============================================================================

describe('getASILevels', () => {
  it('returns standard ASI levels for Barbarian [4,8,12,16,19]', () => {
    expect(getASILevels('barbarian')).toEqual([4, 8, 12, 16, 19])
  })

  it('returns standard ASI levels for Bard', () => {
    expect(getASILevels('bard')).toEqual([4, 8, 12, 16, 19])
  })

  it('returns standard ASI levels for Cleric', () => {
    expect(getASILevels('cleric')).toEqual([4, 8, 12, 16, 19])
  })

  it('returns extra ASI levels for Fighter [4,6,8,12,14,16,19]', () => {
    expect(getASILevels('fighter')).toEqual([4, 6, 8, 12, 14, 16, 19])
  })

  it('returns extra ASI level for Rogue [4,8,10,12,16,19]', () => {
    expect(getASILevels('rogue')).toEqual([4, 8, 10, 12, 16, 19])
  })

  it('returns standard ASI levels for Wizard', () => {
    expect(getASILevels('wizard')).toEqual([4, 8, 12, 16, 19])
  })

  it('returns standard ASI levels for Paladin', () => {
    expect(getASILevels('paladin')).toEqual([4, 8, 12, 16, 19])
  })

  it('returns standard ASI levels for Ranger', () => {
    expect(getASILevels('ranger')).toEqual([4, 8, 12, 16, 19])
  })

  it('returns standard ASI levels for Monk', () => {
    expect(getASILevels('monk')).toEqual([4, 8, 12, 16, 19])
  })

  it('returns standard ASI levels for Sorcerer', () => {
    expect(getASILevels('sorcerer')).toEqual([4, 8, 12, 16, 19])
  })

  it('returns standard ASI levels for Warlock', () => {
    expect(getASILevels('warlock')).toEqual([4, 8, 12, 16, 19])
  })

  it('returns standard ASI levels for Druid', () => {
    expect(getASILevels('druid')).toEqual([4, 8, 12, 16, 19])
  })
})

// =============================================================================
// canLevelUp
// =============================================================================

describe('canLevelUp', () => {
  it('returns true when XP is sufficient for next level', () => {
    const char = makeCharacter({ level: 1, experiencePoints: 300 })
    expect(canLevelUp(char)).toBe(true)
  })

  it('returns false when at level 20', () => {
    const char = makeCharacter({ level: 20, experiencePoints: 999999 })
    expect(canLevelUp(char)).toBe(false)
  })

  it('returns true for milestone mode (0 XP)', () => {
    const char = makeCharacter({ level: 5, experiencePoints: 0 })
    expect(canLevelUp(char)).toBe(true)
  })

  it('returns false when XP is insufficient for next level', () => {
    const char = makeCharacter({ level: 1, experiencePoints: 100 })
    expect(canLevelUp(char)).toBe(false)
  })
})

// =============================================================================
// getLevelUpChanges
// =============================================================================

describe('getLevelUpChanges', () => {
  it('computes correct changes for Fighter L1 -> L2', () => {
    const char = makeCharacter()
    const changes = getLevelUpChanges(char, 2)

    expect(changes.newLevel).toBe(2)
    expect(changes.hitDieType).toBe(10)
    expect(changes.averageHP).toBe(6) // floor(10/2) + 1
    expect(changes.isSubclassLevel).toBe(false)
    expect(changes.isASILevel).toBe(false)
    expect(changes.classId).toBe('fighter')
    expect(changes.newClassLevel).toBe(2)
  })

  it('detects subclass level for Fighter at L3', () => {
    const char = makeCharacter({
      level: 2,
      classes: [{ classId: 'fighter', level: 2, chosenSkills: ['athletics', 'perception'], hpRolls: [6] }],
    })
    const changes = getLevelUpChanges(char, 3)

    expect(changes.isSubclassLevel).toBe(true)
    expect(changes.newFeatures.some((f) => f.name === 'Martial Archetype')).toBe(true)
  })

  it('detects ASI level for Fighter at L4', () => {
    const char = makeCharacter({
      level: 3,
      classes: [{ classId: 'fighter', level: 3, chosenSkills: ['athletics', 'perception'], hpRolls: [6, 5] }],
    })
    const changes = getLevelUpChanges(char, 4)

    expect(changes.isASILevel).toBe(true)
  })

  it('detects proficiency bonus change at level 5', () => {
    const char = makeCharacter({
      level: 4,
      classes: [{ classId: 'fighter', level: 4, chosenSkills: ['athletics', 'perception'], hpRolls: [6, 5, 7] }],
    })
    const changes = getLevelUpChanges(char, 5)

    expect(changes.proficiencyBonusChange).toEqual({ from: 2, to: 3 })
  })

  it('returns new spell slots for Wizard leveling', () => {
    const char = makeCharacter({
      level: 2,
      classes: [{ classId: 'wizard', level: 2, chosenSkills: ['arcana', 'history'], hpRolls: [4] }],
      spellcasting: {
        type: 'prepared',
        ability: 'intelligence',
        cantrips: ['fire-bolt'],
        knownSpells: [],
        preparedSpells: [],
        spellSlots: { 1: 3 },
        usedSpellSlots: {},
        ritualCasting: true,
      },
    })
    const changes = getLevelUpChanges(char, 3)

    expect(changes.newSpellSlots).toBeDefined()
  })

  it('skips subclass step for Cleric at L2 (already chose at L1)', () => {
    const char = makeCharacter({
      level: 1,
      classes: [{ classId: 'cleric', subclassId: 'life-domain', level: 1, chosenSkills: ['insight', 'medicine'], hpRolls: [] }],
    })
    const changes = getLevelUpChanges(char, 2)

    expect(changes.isSubclassLevel).toBe(false)
  })

  it('detects pact magic changes for Warlock leveling', () => {
    const char = makeCharacter({
      level: 1,
      classes: [{ classId: 'warlock', subclassId: 'the-fiend', level: 1, chosenSkills: ['arcana', 'deception'], hpRolls: [] }],
      spellcasting: {
        type: 'pact-magic',
        ability: 'charisma',
        cantrips: ['eldritch-blast'],
        knownSpells: ['hex'],
        preparedSpells: [],
        spellSlots: {},
        usedSpellSlots: {},
        ritualCasting: false,
      },
    })
    const changes = getLevelUpChanges(char, 2)

    expect(changes.pactMagicChanges).toBeDefined()
    expect(changes.pactMagicChanges?.totalSlots).toBe(2)
    expect(changes.pactMagicChanges?.slotLevel).toBe(1)
  })
})

// =============================================================================
// getRequiredSteps
// =============================================================================

describe('getRequiredSteps', () => {
  it('includes overview, hp, features, and review for basic Fighter L2', () => {
    const char = makeCharacter()
    const steps = getRequiredSteps(char, 2)

    expect(steps).toContain('overview')
    expect(steps).toContain('hp')
    expect(steps).toContain('features')
    expect(steps).toContain('review')
    expect(steps).not.toContain('subclass')
    expect(steps).not.toContain('asi-feat')
    expect(steps).not.toContain('spells')
  })

  it('includes subclass step for Fighter at L3', () => {
    const char = makeCharacter({
      level: 2,
      classes: [{ classId: 'fighter', level: 2, chosenSkills: ['athletics', 'perception'], hpRolls: [6] }],
    })
    const steps = getRequiredSteps(char, 3)

    expect(steps).toContain('subclass')
  })

  it('includes asi-feat step for Fighter at L4', () => {
    const char = makeCharacter({
      level: 3,
      classes: [{ classId: 'fighter', level: 3, chosenSkills: ['athletics', 'perception'], hpRolls: [6, 5] }],
    })
    const steps = getRequiredSteps(char, 4)

    expect(steps).toContain('asi-feat')
  })

  it('includes spells step for Wizard leveling', () => {
    const char = makeCharacter({
      level: 1,
      classes: [{ classId: 'wizard', level: 1, chosenSkills: ['arcana', 'history'], hpRolls: [] }],
      spellcasting: {
        type: 'prepared',
        ability: 'intelligence',
        cantrips: ['fire-bolt'],
        knownSpells: [],
        preparedSpells: [],
        spellSlots: { 1: 2 },
        usedSpellSlots: {},
        ritualCasting: true,
      },
    })
    const steps = getRequiredSteps(char, 2)

    expect(steps).toContain('spells')
  })

  it('does not include spells step for non-caster Fighter', () => {
    const char = makeCharacter()
    const steps = getRequiredSteps(char, 2)

    expect(steps).not.toContain('spells')
  })

  it('includes both asi-feat and subclass for Fighter at correct levels', () => {
    // Fighter at L5 gets proficiency bonus change but not subclass or ASI
    const char = makeCharacter({
      level: 5,
      experiencePoints: 6500,
      classes: [{ classId: 'fighter', level: 5, chosenSkills: ['athletics', 'perception'], hpRolls: [6, 5, 7, 6] }],
    })
    const steps = getRequiredSteps(char, 6)

    // Fighter gets extra ASI at L6
    expect(steps).toContain('asi-feat')
  })
})

// =============================================================================
// applyLevelUp
// =============================================================================

describe('applyLevelUp', () => {
  it('increases character level', () => {
    const char = makeCharacter()
    const changes: LevelUpChanges = {
      ...getLevelUpChanges(char, 2),
      hpIncrease: 8,
    }

    const result = applyLevelUp(char, changes)
    expect(result.level).toBe(2)
    expect(result.classes[0].level).toBe(2)
  })

  it('increases HP by the correct amount', () => {
    const char = makeCharacter()
    const changes: LevelUpChanges = {
      ...getLevelUpChanges(char, 2),
      hpIncrease: 8,
    }

    const result = applyLevelUp(char, changes)
    expect(result.hpMax).toBe(20) // 12 + 8
    expect(result.hpCurrent).toBe(20)
  })

  it('adds new features to the character', () => {
    const char = makeCharacter()
    const changes: LevelUpChanges = {
      ...getLevelUpChanges(char, 2),
      hpIncrease: 8,
    }

    const result = applyLevelUp(char, changes)
    expect(result.features).toContain('action-surge')
  })

  it('applies ASI choices correctly', () => {
    const char = makeCharacter({
      level: 3,
      classes: [{ classId: 'fighter', level: 3, chosenSkills: ['athletics', 'perception'], hpRolls: [6, 5] }],
    })
    const changes: LevelUpChanges = {
      ...getLevelUpChanges(char, 4),
      hpIncrease: 8,
      asiMode: 'asi',
      asiChoices: [{ ability: 'strength', amount: 2 }],
    }

    const result = applyLevelUp(char, changes)
    expect(result.abilityScores.strength).toBe(18)
  })

  it('caps ability scores at 20 during ASI', () => {
    const char = makeCharacter({
      level: 3,
      abilityScores: { ...makeCharacter().abilityScores, strength: 19 },
      baseAbilityScores: { ...makeCharacter().baseAbilityScores, strength: 19 },
      classes: [{ classId: 'fighter', level: 3, chosenSkills: ['athletics', 'perception'], hpRolls: [6, 5] }],
    })
    const changes: LevelUpChanges = {
      ...getLevelUpChanges(char, 4),
      hpIncrease: 8,
      asiMode: 'asi',
      asiChoices: [{ ability: 'strength', amount: 2 }],
    }

    const result = applyLevelUp(char, changes)
    expect(result.abilityScores.strength).toBe(20)
  })

  it('applies feat selection', () => {
    const char = makeCharacter({
      level: 3,
      classes: [{ classId: 'fighter', level: 3, chosenSkills: ['athletics', 'perception'], hpRolls: [6, 5] }],
    })
    const changes: LevelUpChanges = {
      ...getLevelUpChanges(char, 4),
      hpIncrease: 8,
      asiMode: 'feat',
      selectedFeat: { featId: 'great-weapon-master' },
    }

    const result = applyLevelUp(char, changes)
    expect(result.feats).toContainEqual({ featId: 'great-weapon-master' })
  })

  it('applies subclass selection', () => {
    const char = makeCharacter({
      level: 2,
      classes: [{ classId: 'fighter', level: 2, chosenSkills: ['athletics', 'perception'], hpRolls: [6] }],
    })
    const changes: LevelUpChanges = {
      ...getLevelUpChanges(char, 3),
      hpIncrease: 8,
      selectedSubclassId: 'champion',
    }

    const result = applyLevelUp(char, changes)
    expect(result.classes[0].subclassId).toBe('champion')
  })

  it('increments version number', () => {
    const char = makeCharacter()
    const changes: LevelUpChanges = {
      ...getLevelUpChanges(char, 2),
      hpIncrease: 8,
    }

    const result = applyLevelUp(char, changes)
    expect(result.version).toBe(2)
  })

  it('retroactively adjusts HP when CON is increased via ASI', () => {
    // Character at L3 with CON 13 (mod +1). Increase CON by 2 to 15 (mod +2).
    // That's +1 mod per level for 4 levels = +4 retroactive HP.
    const char = makeCharacter({
      level: 3,
      abilityScores: { ...makeCharacter().abilityScores, constitution: 13 },
      baseAbilityScores: { ...makeCharacter().baseAbilityScores, constitution: 13 },
      classes: [{ classId: 'fighter', level: 3, chosenSkills: ['athletics', 'perception'], hpRolls: [6, 5] }],
      hpMax: 24,
      hpCurrent: 24,
    })
    const changes: LevelUpChanges = {
      ...getLevelUpChanges(char, 4),
      hpIncrease: 8,
      asiMode: 'asi',
      asiChoices: [{ ability: 'constitution', amount: 2 }],
    }

    const result = applyLevelUp(char, changes)
    // HP: 24 + 8 (level up HP) + 4 (retroactive CON, +1 mod * 4 levels) = 36
    expect(result.hpMax).toBe(36)
  })
})

// =============================================================================
// getXPInfo
// =============================================================================

describe('getXPInfo', () => {
  it('computes XP progress correctly', () => {
    const char = makeCharacter({ level: 1, experiencePoints: 150 })
    const info = getXPInfo(char)

    expect(info.currentXP).toBe(150)
    expect(info.currentLevel).toBe(1)
    expect(info.nextLevelXP).toBe(300) // XP threshold for level 2
    expect(info.xpToNextLevel).toBe(150)
    expect(info.progress).toBeCloseTo(0.5, 1)
  })

  it('returns full progress at level 20', () => {
    const char = makeCharacter({ level: 20, experiencePoints: 999999 })
    const info = getXPInfo(char)

    expect(info.progress).toBe(1)
  })
})
