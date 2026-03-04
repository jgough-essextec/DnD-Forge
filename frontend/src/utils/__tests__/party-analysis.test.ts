/**
 * Tests for party-analysis.ts utility functions (Epic 34)
 */

import { describe, it, expect } from 'vitest'
import type { Character } from '@/types/character'
import type { SkillName, AbilityName, Language } from '@/types/core'
import {
  getHpBarColor,
  getHpPercentage,
  getClassDisplay,
  getRaceDisplay,
  getCharacterSpellSaveDC,
  getCharacterInitiativeModifier,
  getCharacterAC,
  sortCharacters,
  SKILL_GROUPS,
  getSkillMod,
  isCharacterProficient,
  hasExpertise,
  findBestInParty,
  filterSkills,
  formatSkillName,
  formatAbilityName,
  getLanguageCoverage,
  getCoverageByCategory,
  getLanguageGaps,
  getToolCoverage,
  formatLanguageName,
  analyzePartyComposition,
  getPartyCallouts,
  CLASS_ROLE_MAP,
  COMMON_LANGUAGES,
  EXOTIC_LANGUAGES,
  getPrimaryClassId,
} from '@/utils/party-analysis'

// ---------------------------------------------------------------------------
// Test Character Factory
// ---------------------------------------------------------------------------

function makeCharacter(overrides: Partial<Character> = {}): Character {
  return {
    id: 'char-test-001',
    name: 'Test Hero',
    playerName: 'Player One',
    avatarUrl: null,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    version: 1,
    race: { raceId: 'human' },
    classes: [{ classId: 'fighter', level: 5, chosenSkills: ['athletics', 'perception'], hpRolls: [] }],
    background: { backgroundId: 'soldier' } as Character['background'],
    alignment: 'lawful-good',
    baseAbilityScores: { strength: 16, dexterity: 14, constitution: 14, intelligence: 10, wisdom: 12, charisma: 8 },
    abilityScores: { strength: 16, dexterity: 14, constitution: 14, intelligence: 10, wisdom: 12, charisma: 8 },
    abilityScoreMethod: 'standard',
    level: 5,
    experiencePoints: 6500,
    hpMax: 52,
    hpCurrent: 44,
    tempHp: 0,
    hitDiceTotal: [5],
    hitDiceUsed: [0],
    speed: { walk: 30 },
    deathSaves: { successes: 0, failures: 0, stable: false },
    combatStats: {
      armorClass: { base: 18, dexModifier: 2, shieldBonus: 2, otherBonuses: [], formula: '16 + 2' },
      initiative: 2,
      speed: { walk: 30 },
      hitPoints: { maximum: 52, current: 44, temporary: 0, hitDice: { total: [{ count: 5, die: 'd10' }], used: [0] } },
      attacks: [],
      savingThrows: { strength: 6, constitution: 5 },
    },
    proficiencies: {
      armor: ['light', 'medium', 'heavy', 'shields'],
      weapons: ['simple melee', 'martial melee'],
      tools: [],
      languages: ['common', 'dwarvish'] as Language[],
      skills: [
        { skill: 'athletics' as SkillName, proficient: true, expertise: false },
        { skill: 'perception' as SkillName, proficient: true, expertise: false },
      ],
      savingThrows: ['strength', 'constitution'] as AbilityName[],
    },
    inventory: [],
    currency: { cp: 0, sp: 0, ep: 0, gp: 50, pp: 0 },
    attunedItems: [],
    spellcasting: null,
    features: [],
    feats: [],
    description: { name: 'Test Hero' } as Character['description'],
    personality: { personalityTraits: [], ideal: '', bond: '', flaw: '' },
    conditions: [],
    inspiration: false,
    campaignId: null,
    isArchived: false,
    ...overrides,
  } as Character
}

function makeWizard(overrides: Partial<Character> = {}): Character {
  return makeCharacter({
    id: 'char-wizard-001',
    name: 'Test Wizard',
    classes: [{ classId: 'wizard', level: 5, chosenSkills: ['arcana', 'investigation'], hpRolls: [] }],
    abilityScores: { strength: 8, dexterity: 14, constitution: 12, intelligence: 18, wisdom: 12, charisma: 10 },
    hpMax: 28,
    hpCurrent: 28,
    speed: { walk: 30 },
    spellcasting: {
      maxPrepared: 9,
      spellSlots: { 1: 4, 2: 3, 3: 2 },
      slotsUsed: { 1: 0, 2: 0, 3: 0 },
      preparedSpellIds: [],
      knownCantrips: [],
    } as unknown as Character['spellcasting'],
    proficiencies: {
      armor: [],
      weapons: [],
      tools: [],
      languages: ['common', 'elvish', 'draconic'] as Language[],
      skills: [
        { skill: 'arcana' as SkillName, proficient: true, expertise: false },
        { skill: 'investigation' as SkillName, proficient: true, expertise: false },
        { skill: 'history' as SkillName, proficient: true, expertise: false },
      ],
      savingThrows: ['intelligence', 'wisdom'] as AbilityName[],
    },
    ...overrides,
  })
}

function makeRogue(overrides: Partial<Character> = {}): Character {
  return makeCharacter({
    id: 'char-rogue-001',
    name: 'Test Rogue',
    classes: [{ classId: 'rogue', level: 5, chosenSkills: ['stealth', 'acrobatics'], chosenExpertise: ['stealth', 'perception'], hpRolls: [] }],
    abilityScores: { strength: 10, dexterity: 18, constitution: 12, intelligence: 14, wisdom: 10, charisma: 14 },
    hpMax: 33,
    hpCurrent: 33,
    speed: { walk: 30 },
    proficiencies: {
      armor: ['light'],
      weapons: [],
      tools: ["thieves' tools"],
      languages: ['common', 'goblin'] as Language[],
      skills: [
        { skill: 'stealth' as SkillName, proficient: true, expertise: true },
        { skill: 'acrobatics' as SkillName, proficient: true, expertise: false },
        { skill: 'perception' as SkillName, proficient: true, expertise: true },
        { skill: 'deception' as SkillName, proficient: true, expertise: false },
        { skill: 'sleight-of-hand' as SkillName, proficient: true, expertise: false },
      ],
      savingThrows: ['dexterity', 'intelligence'] as AbilityName[],
    },
    ...overrides,
  })
}

function makeCleric(overrides: Partial<Character> = {}): Character {
  return makeCharacter({
    id: 'char-cleric-001',
    name: 'Test Cleric',
    classes: [{ classId: 'cleric', level: 5, chosenSkills: ['medicine', 'insight'], hpRolls: [] }],
    abilityScores: { strength: 14, dexterity: 10, constitution: 14, intelligence: 10, wisdom: 18, charisma: 12 },
    hpMax: 38,
    hpCurrent: 38,
    speed: { walk: 30 },
    spellcasting: {
      maxPrepared: 9,
      spellSlots: { 1: 4, 2: 3, 3: 2 },
      slotsUsed: { 1: 0, 2: 0, 3: 0 },
      preparedSpellIds: [],
      knownCantrips: [],
    } as unknown as Character['spellcasting'],
    proficiencies: {
      armor: ['light', 'medium', 'shields'],
      weapons: ['simple melee'],
      tools: [],
      languages: ['common', 'celestial'] as Language[],
      skills: [
        { skill: 'medicine' as SkillName, proficient: true, expertise: false },
        { skill: 'insight' as SkillName, proficient: true, expertise: false },
      ],
      savingThrows: ['wisdom', 'charisma'] as AbilityName[],
    },
    ...overrides,
  })
}

// ===========================================================================
// HP Bar Color Tests
// ===========================================================================

describe('getHpBarColor', () => {
  it('should return green when HP is above 50%', () => {
    expect(getHpBarColor(30, 50)).toBe('green')
    expect(getHpBarColor(50, 50)).toBe('green')
    expect(getHpBarColor(26, 50)).toBe('green')
  })

  it('should return yellow when HP is 25-50%', () => {
    expect(getHpBarColor(25, 50)).toBe('yellow')
    expect(getHpBarColor(13, 50)).toBe('yellow')
  })

  it('should return red when HP is below 25%', () => {
    expect(getHpBarColor(12, 50)).toBe('red')
    expect(getHpBarColor(0, 50)).toBe('red')
    expect(getHpBarColor(1, 50)).toBe('red')
  })

  it('should return red when max is 0', () => {
    expect(getHpBarColor(0, 0)).toBe('red')
  })
})

describe('getHpPercentage', () => {
  it('should calculate correct percentage', () => {
    expect(getHpPercentage(25, 50)).toBe(50)
    expect(getHpPercentage(50, 50)).toBe(100)
    expect(getHpPercentage(0, 50)).toBe(0)
  })

  it('should clamp to 0-100', () => {
    expect(getHpPercentage(-10, 50)).toBe(0)
    expect(getHpPercentage(0, 0)).toBe(0)
  })
})

// ===========================================================================
// Character Display Tests
// ===========================================================================

describe('getClassDisplay', () => {
  it('should display single class name', () => {
    const char = makeCharacter()
    expect(getClassDisplay(char)).toBe('Fighter')
  })

  it('should display multiclass names', () => {
    const char = makeCharacter({
      classes: [
        { classId: 'fighter', level: 3, chosenSkills: [], hpRolls: [] },
        { classId: 'wizard', level: 2, chosenSkills: [], hpRolls: [] },
      ],
    })
    expect(getClassDisplay(char)).toBe('Fighter 3 / Wizard 2')
  })

  it('should return Unknown for no classes', () => {
    const char = makeCharacter({ classes: [] })
    expect(getClassDisplay(char)).toBe('Unknown')
  })
})

describe('getRaceDisplay', () => {
  it('should display race name for known races', () => {
    const char = makeCharacter({ race: { raceId: 'dwarf' } })
    expect(getRaceDisplay(char)).toBe('Dwarf')
  })

  it('should display subrace name when available', () => {
    const char = makeCharacter({ race: { raceId: 'dwarf', subraceId: 'hill-dwarf' } })
    expect(getRaceDisplay(char)).toBe('Hill Dwarf')
  })

  it('should fall back to raceId for unknown races', () => {
    const char = makeCharacter({ race: { raceId: 'custom-race' } })
    expect(getRaceDisplay(char)).toBe('custom-race')
  })
})

describe('getPrimaryClassId', () => {
  it('should return the class with highest level', () => {
    const char = makeCharacter({
      classes: [
        { classId: 'fighter', level: 3, chosenSkills: [], hpRolls: [] },
        { classId: 'wizard', level: 5, chosenSkills: [], hpRolls: [] },
      ],
    })
    expect(getPrimaryClassId(char)).toBe('wizard')
  })

  it('should return empty string for no classes', () => {
    const char = makeCharacter({ classes: [] })
    expect(getPrimaryClassId(char)).toBe('')
  })
})

describe('getCharacterSpellSaveDC', () => {
  it('should return null for non-casters', () => {
    const fighter = makeCharacter()
    expect(getCharacterSpellSaveDC(fighter)).toBeNull()
  })

  it('should calculate spell save DC for casters', () => {
    const wizard = makeWizard()
    // DC = 8 + proficiency (3 at level 5) + INT mod (4 for 18) = 15
    expect(getCharacterSpellSaveDC(wizard)).toBe(15)
  })
})

describe('getCharacterInitiativeModifier', () => {
  it('should return DEX modifier', () => {
    const char = makeCharacter()
    // DEX 14 = +2
    expect(getCharacterInitiativeModifier(char)).toBe(2)
  })

  it('should include initiative bonus if present', () => {
    const char = makeCharacter({ initiativeBonus: 5 })
    // DEX 14 = +2 + 5 bonus = +7
    expect(getCharacterInitiativeModifier(char)).toBe(7)
  })
})

describe('getCharacterAC', () => {
  it('should return AC from combat stats', () => {
    const char = makeCharacter()
    expect(getCharacterAC(char)).toBe(18)
  })

  it('should return override if set', () => {
    const char = makeCharacter({ armorClassOverride: 20 })
    expect(getCharacterAC(char)).toBe(20)
  })
})

// ===========================================================================
// Sorting Tests
// ===========================================================================

describe('sortCharacters', () => {
  const chars = [
    makeCharacter({ id: '1', name: 'Beta', level: 3, hpCurrent: 10 }),
    makeCharacter({ id: '2', name: 'Alpha', level: 5, hpCurrent: 40 }),
    makeCharacter({ id: '3', name: 'Gamma', level: 1, hpCurrent: 25 }),
  ]

  it('should sort alphabetically by name ascending', () => {
    const sorted = sortCharacters(chars, 'name', 'asc')
    expect(sorted.map((c) => c.name)).toEqual(['Alpha', 'Beta', 'Gamma'])
  })

  it('should sort alphabetically by name descending', () => {
    const sorted = sortCharacters(chars, 'name', 'desc')
    expect(sorted.map((c) => c.name)).toEqual(['Gamma', 'Beta', 'Alpha'])
  })

  it('should sort by level ascending', () => {
    const sorted = sortCharacters(chars, 'level', 'asc')
    expect(sorted.map((c) => c.level)).toEqual([1, 3, 5])
  })

  it('should sort by level descending', () => {
    const sorted = sortCharacters(chars, 'level', 'desc')
    expect(sorted.map((c) => c.level)).toEqual([5, 3, 1])
  })

  it('should sort by HP ascending', () => {
    const sorted = sortCharacters(chars, 'hp', 'asc')
    expect(sorted.map((c) => c.hpCurrent)).toEqual([10, 25, 40])
  })

  it('should not mutate the original array', () => {
    const original = [...chars]
    sortCharacters(chars, 'name', 'asc')
    expect(chars).toEqual(original)
  })
})

// ===========================================================================
// Skill Matrix Tests
// ===========================================================================

describe('SKILL_GROUPS', () => {
  it('should cover all 18 skills', () => {
    const allSkills = SKILL_GROUPS.flatMap((g) => g.skills)
    expect(allSkills).toHaveLength(18)
  })

  it('should have correct ability groupings', () => {
    const strGroup = SKILL_GROUPS.find((g) => g.ability === 'strength')
    expect(strGroup?.skills).toEqual(['athletics'])

    const dexGroup = SKILL_GROUPS.find((g) => g.ability === 'dexterity')
    expect(dexGroup?.skills).toContain('stealth')
    expect(dexGroup?.skills).toContain('acrobatics')

    const intGroup = SKILL_GROUPS.find((g) => g.ability === 'intelligence')
    expect(intGroup?.skills).toContain('arcana')
    expect(intGroup?.skills).toHaveLength(5)
  })
})

describe('getSkillMod', () => {
  it('should calculate correct modifier for proficient skill', () => {
    const char = makeCharacter()
    // Athletics: STR 16 (mod +3) + prof bonus 3 (level 5) = +6
    expect(getSkillMod(char, 'athletics')).toBe(6)
  })

  it('should calculate correct modifier for non-proficient skill', () => {
    const char = makeCharacter()
    // Arcana: INT 10 (mod +0), not proficient = +0
    expect(getSkillMod(char, 'arcana')).toBe(0)
  })
})

describe('isCharacterProficient', () => {
  it('should return true for proficient skills', () => {
    const char = makeCharacter()
    expect(isCharacterProficient(char, 'athletics')).toBe(true)
  })

  it('should return false for non-proficient skills', () => {
    const char = makeCharacter()
    expect(isCharacterProficient(char, 'arcana')).toBe(false)
  })
})

describe('hasExpertise', () => {
  it('should return true for expertise skills', () => {
    const rogue = makeRogue()
    expect(hasExpertise(rogue, 'stealth')).toBe(true)
  })

  it('should return false for proficient-only skills', () => {
    const rogue = makeRogue()
    expect(hasExpertise(rogue, 'acrobatics')).toBe(false)
  })

  it('should return false for non-proficient skills', () => {
    const char = makeCharacter()
    expect(hasExpertise(char, 'arcana')).toBe(false)
  })
})

describe('findBestInParty', () => {
  it('should find the character with the highest modifier', () => {
    const party = [makeCharacter(), makeWizard()]
    // Arcana: Fighter has INT 10 (mod 0), Wizard has INT 18 (mod +4) + prof 3 = +7
    const best = findBestInParty(party, 'arcana')
    expect(best).toEqual([1]) // wizard is index 1
  })

  it('should highlight all characters when tied', () => {
    const char1 = makeCharacter({ id: '1', abilityScores: { strength: 14, dexterity: 14, constitution: 14, intelligence: 14, wisdom: 14, charisma: 14 } })
    const char2 = makeCharacter({ id: '2', abilityScores: { strength: 14, dexterity: 14, constitution: 14, intelligence: 14, wisdom: 14, charisma: 14 } })
    // Both have same stats and no proficiency in history = same modifier
    const best = findBestInParty([char1, char2], 'history')
    expect(best).toEqual([0, 1])
  })

  it('should return empty array for no characters', () => {
    expect(findBestInParty([], 'athletics')).toEqual([])
  })
})

describe('filterSkills', () => {
  it('should return all 18 skills when search is empty', () => {
    expect(filterSkills('')).toHaveLength(18)
  })

  it('should filter skills by name', () => {
    const result = filterSkills('stealth')
    expect(result).toContain('stealth')
    expect(result).toHaveLength(1)
  })

  it('should be case-insensitive', () => {
    const result = filterSkills('ATHLETICS')
    expect(result).toContain('athletics')
  })

  it('should match partial names', () => {
    const result = filterSkills('per')
    expect(result).toContain('perception')
    expect(result).toContain('performance')
    expect(result).toContain('persuasion')
  })
})

describe('formatSkillName', () => {
  it('should format simple skill names', () => {
    expect(formatSkillName('athletics')).toBe('Athletics')
    expect(formatSkillName('stealth')).toBe('Stealth')
  })

  it('should format hyphenated skill names', () => {
    expect(formatSkillName('sleight-of-hand')).toBe('Sleight of Hand')
    expect(formatSkillName('animal-handling')).toBe('Animal Handling')
  })
})

describe('formatAbilityName', () => {
  it('should capitalize ability names', () => {
    expect(formatAbilityName('strength')).toBe('Strength')
    expect(formatAbilityName('dexterity')).toBe('Dexterity')
  })
})

// ===========================================================================
// Language Coverage Tests
// ===========================================================================

describe('getLanguageCoverage', () => {
  it('should aggregate languages across party', () => {
    const party = [makeCharacter(), makeWizard()]
    const coverage = getLanguageCoverage(party)
    const common = coverage.find((c) => c.language === 'common')
    expect(common?.count).toBe(2)
    expect(common?.speakers).toContain('Test Hero')
    expect(common?.speakers).toContain('Test Wizard')
  })

  it('should include all SRD languages with 0 count for uncovered', () => {
    const party = [makeCharacter()]
    const coverage = getLanguageCoverage(party)
    // 16 SRD languages total
    expect(coverage).toHaveLength(16)
    const abyssal = coverage.find((c) => c.language === 'abyssal')
    expect(abyssal?.count).toBe(0)
  })

  it('should return empty speakers for languages no one speaks', () => {
    const party = [makeCharacter()]
    const coverage = getLanguageCoverage(party)
    const sylvan = coverage.find((c) => c.language === 'sylvan')
    expect(sylvan?.speakers).toEqual([])
  })
})

describe('getCoverageByCategory', () => {
  it('should return only common languages', () => {
    const party = [makeCharacter()]
    const coverage = getLanguageCoverage(party)
    const common = getCoverageByCategory(coverage, 'common')
    expect(common).toHaveLength(8)
    expect(common.every((c) => COMMON_LANGUAGES.includes(c.language))).toBe(true)
  })

  it('should return only exotic languages', () => {
    const party = [makeCharacter()]
    const coverage = getLanguageCoverage(party)
    const exotic = getCoverageByCategory(coverage, 'exotic')
    expect(exotic).toHaveLength(8)
    expect(exotic.every((c) => EXOTIC_LANGUAGES.includes(c.language))).toBe(true)
  })
})

describe('getLanguageGaps', () => {
  it('should identify languages with 0 speakers', () => {
    const party = [makeCharacter()] // only speaks common, dwarvish
    const coverage = getLanguageCoverage(party)
    const gaps = getLanguageGaps(coverage)
    // 16 total - 2 known = 14 gaps
    expect(gaps).toHaveLength(14)
    expect(gaps.every((g) => g.count === 0)).toBe(true)
  })
})

describe('formatLanguageName', () => {
  it('should format simple language names', () => {
    expect(formatLanguageName('common')).toBe('Common')
    expect(formatLanguageName('elvish')).toBe('Elvish')
  })

  it('should format hyphenated language names', () => {
    expect(formatLanguageName('deep-speech')).toBe('Deep Speech')
  })
})

describe('getToolCoverage', () => {
  it('should aggregate tool proficiencies', () => {
    const party = [makeRogue()]
    const tools = getToolCoverage(party)
    expect(tools).toHaveLength(1)
    expect(tools[0].tool).toBe("thieves' tools")
    expect(tools[0].users).toContain('Test Rogue')
  })

  it('should return empty for party with no tools', () => {
    const party = [makeCharacter()]
    const tools = getToolCoverage(party)
    expect(tools).toHaveLength(0)
  })

  it('should aggregate same tool across multiple characters', () => {
    const rogue1 = makeRogue({ id: '1', name: 'Rogue A' })
    const rogue2 = makeRogue({ id: '2', name: 'Rogue B' })
    const tools = getToolCoverage([rogue1, rogue2])
    const thieves = tools.find((t) => t.tool === "thieves' tools")
    expect(thieves?.count).toBe(2)
    expect(thieves?.users).toContain('Rogue A')
    expect(thieves?.users).toContain('Rogue B')
  })
})

// ===========================================================================
// Party Composition Tests
// ===========================================================================

describe('CLASS_ROLE_MAP', () => {
  it('should have entries for all standard classes', () => {
    const standardClasses = ['barbarian', 'bard', 'cleric', 'druid', 'fighter', 'monk', 'paladin', 'ranger', 'rogue', 'sorcerer', 'warlock', 'wizard']
    for (const cls of standardClasses) {
      expect(CLASS_ROLE_MAP[cls]).toBeDefined()
    }
  })
})

describe('analyzePartyComposition', () => {
  it('should return all 7 roles', () => {
    const roles = analyzePartyComposition([])
    expect(roles).toHaveLength(7)
  })

  it('should map fighter to Tank/Defender and Melee Striker as primary', () => {
    const party = [makeCharacter()]
    const roles = analyzePartyComposition(party)
    const tank = roles.find((r) => r.role === 'Tank/Defender')
    expect(tank?.primaryCharacters).toContain('Test Hero')
    expect(tank?.coverage).toBe('primary')
  })

  it('should detect uncovered roles', () => {
    const party = [makeCharacter()] // fighter only
    const roles = analyzePartyComposition(party)
    const healer = roles.find((r) => r.role === 'Healer/Support')
    expect(healer?.coverage).toBe('none')
    expect(healer?.primaryCharacters).toHaveLength(0)
  })

  it('should detect secondary role coverage', () => {
    const party = [makeCharacter()] // fighter has secondary: Ranged Striker
    const roles = analyzePartyComposition(party)
    const ranged = roles.find((r) => r.role === 'Ranged Striker')
    expect(ranged?.coverage).toBe('secondary')
    expect(ranged?.secondaryCharacters).toContain('Test Hero')
  })

  it('should handle multiclass characters mapping to multiple roles', () => {
    const multiclass = makeCharacter({
      name: 'Multi',
      classes: [
        { classId: 'fighter', level: 3, chosenSkills: [], hpRolls: [] },
        { classId: 'wizard', level: 2, chosenSkills: [], hpRolls: [] },
      ],
    })
    const roles = analyzePartyComposition([multiclass])
    const tank = roles.find((r) => r.role === 'Tank/Defender')
    const controller = roles.find((r) => r.role === 'Controller')
    expect(tank?.primaryCharacters).toContain('Multi')
    expect(controller?.primaryCharacters).toContain('Multi')
  })

  it('should add high-CHA characters to Face role as secondary', () => {
    const highCha = makeCharacter({
      name: 'Smooth Talker',
      classes: [{ classId: 'fighter', level: 5, chosenSkills: [], hpRolls: [] }],
      abilityScores: { strength: 16, dexterity: 14, constitution: 14, intelligence: 10, wisdom: 12, charisma: 16 },
    })
    const roles = analyzePartyComposition([highCha])
    const face = roles.find((r) => r.role === 'Face (Social)')
    expect(face?.secondaryCharacters).toContain('Smooth Talker')
  })

  it('should return correct coverage indicator', () => {
    const party = [makeCharacter(), makeCleric()]
    const roles = analyzePartyComposition(party)
    const tank = roles.find((r) => r.role === 'Tank/Defender')
    const healer = roles.find((r) => r.role === 'Healer/Support')
    expect(tank?.coverage).toBe('primary')
    expect(healer?.coverage).toBe('primary')
  })
})

// ===========================================================================
// Party Callouts Tests
// ===========================================================================

describe('getPartyCallouts', () => {
  it('should return empty for empty party', () => {
    expect(getPartyCallouts([])).toEqual([])
  })

  it('should detect when no one has healing magic', () => {
    const party = [makeCharacter(), makeRogue()]
    const callouts = getPartyCallouts(party)
    const noHealer = callouts.find((c) => c.message === 'No one has healing magic')
    expect(noHealer).toBeDefined()
    expect(noHealer?.type).toBe('warning')
  })

  it('should not flag "no healer" when cleric is present', () => {
    const party = [makeCharacter(), makeCleric()]
    const callouts = getPartyCallouts(party)
    const noHealer = callouts.find((c) => c.message === 'No one has healing magic')
    expect(noHealer).toBeUndefined()
  })

  it('should detect all darkvision', () => {
    // Dwarf and Elf both have darkvision
    const dwarf = makeCharacter({ race: { raceId: 'dwarf' } })
    const elf = makeCharacter({ id: '2', name: 'Elf', race: { raceId: 'elf', subraceId: 'high-elf' } })
    const callouts = getPartyCallouts([dwarf, elf])
    const allDark = callouts.find((c) => c.message === 'All party members have darkvision')
    expect(allDark).toBeDefined()
    expect(allDark?.type).toBe('strength')
  })

  it('should not flag darkvision when not all have it', () => {
    const dwarf = makeCharacter({ race: { raceId: 'dwarf' } })
    const human = makeCharacter({ id: '2', name: 'Human', race: { raceId: 'human' } })
    const callouts = getPartyCallouts([dwarf, human])
    const allDark = callouts.find((c) => c.message === 'All party members have darkvision')
    expect(allDark).toBeUndefined()
  })

  it('should report low passive perception', () => {
    // Character with WIS 8 = -1 mod, not proficient in perception
    const lowWis = makeCharacter({
      abilityScores: { strength: 10, dexterity: 10, constitution: 10, intelligence: 10, wisdom: 8, charisma: 10 },
      proficiencies: {
        armor: [],
        weapons: [],
        tools: [],
        languages: ['common'] as Language[],
        skills: [],
        savingThrows: [],
      },
    })
    const callouts = getPartyCallouts([lowWis])
    const lowPerception = callouts.find((c) => c.message.includes('passive Perception'))
    expect(lowPerception).toBeDefined()
    expect(lowPerception?.type).toBe('info')
  })
})
