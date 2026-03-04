/**
 * Session View Utility Tests (Epic 32 - Story 32.2)
 *
 * Tests for session view configuration, default pinned skills,
 * localStorage persistence, and the max 8 pinned skills enforcement.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  getDefaultPinnedSkills,
  getSessionViewConfig,
  saveSessionViewConfig,
  formatSkillName,
  getPinnableOptions,
  DEFAULT_PINNED_SKILLS,
  MAX_PINNED_SKILLS,
} from '../session-view'
import type { Character } from '@/types/character'

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

function createMockCharacter(overrides: Partial<Character> = {}): Character {
  return {
    id: 'test-char-1',
    name: 'Test Hero',
    playerName: 'Player 1',
    avatarUrl: null,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    version: 1,
    race: { raceId: 'human', name: 'Human' } as unknown as Character['race'],
    classes: [
      {
        classId: 'fighter',
        level: 5,
        chosenSkills: ['athletics', 'perception'],
        hpRolls: [7, 6, 8, 5],
      },
    ],
    background: {
      backgroundId: 'soldier',
      characterIdentity: { name: 'Test Hero' },
      characterPersonality: { personalityTraits: ['trait1', 'trait2'], ideal: 'ideal', bond: 'bond', flaw: 'flaw' },
    } as Character['background'],
    alignment: 'neutral-good',
    baseAbilityScores: { strength: 16, dexterity: 14, constitution: 14, intelligence: 10, wisdom: 12, charisma: 8 },
    abilityScores: { strength: 16, dexterity: 14, constitution: 14, intelligence: 10, wisdom: 12, charisma: 8 },
    abilityScoreMethod: 'standard',
    level: 5,
    experiencePoints: 6500,
    hpMax: 44,
    hpCurrent: 30,
    tempHp: 0,
    hitDiceTotal: [5],
    hitDiceUsed: [0],
    speed: { walk: 30 },
    deathSaves: { successes: 0, failures: 0, stable: false },
    combatStats: {
      armorClass: { base: 16, dexModifier: 2, shieldBonus: 0, otherBonuses: [], formula: '14 + 2' },
      initiative: 2,
      speed: { walk: 30 },
      hitPoints: { maximum: 44, current: 30, temporary: 0, hitDice: { total: [{ count: 5, die: 'd10' }], used: [0] } },
      attacks: [],
      savingThrows: { strength: 6, constitution: 5 },
    },
    proficiencies: {
      armor: ['light', 'medium', 'heavy', 'shields'],
      weapons: ['simple melee', 'simple ranged', 'martial melee', 'martial ranged'],
      tools: [],
      languages: ['common'],
      skills: [
        { skill: 'athletics', proficient: true, expertise: false },
        { skill: 'perception', proficient: true, expertise: false },
      ],
      savingThrows: ['strength', 'constitution'],
    },
    inventory: [],
    currency: { cp: 0, sp: 0, ep: 0, gp: 50, pp: 0 },
    attunedItems: [],
    spellcasting: null,
    features: ['rage'],
    feats: [],
    description: { name: '', age: '', height: '', weight: '', eyes: '', skin: '', hair: '', appearance: '', backstory: '', alliesAndOrgs: '', treasure: '' },
    personality: { personalityTraits: ['trait1', 'trait2'] as [string, string], ideal: 'ideal', bond: 'bond', flaw: 'flaw' },
    conditions: [],
    inspiration: false,
    campaignId: null,
    isArchived: false,
    ...overrides,
  } as Character
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('session-view utils', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  // -- getDefaultPinnedSkills ------------------------------------------------

  describe('getDefaultPinnedSkills', () => {
    it('returns default skills including perception, athletics, stealth, investigation', () => {
      const char = createMockCharacter()
      const pinned = getDefaultPinnedSkills(char)

      expect(pinned).toContain('perception')
      expect(pinned).toContain('athletics')
      expect(pinned).toContain('stealth')
      expect(pinned).toContain('investigation')
    })

    it('includes class-primary-ability skills for a Fighter (STR/DEX)', () => {
      const char = createMockCharacter()
      const pinned = getDefaultPinnedSkills(char)

      // Fighter primaryAbility: ['strength', 'dexterity']
      // STR skills: athletics
      // DEX skills: acrobatics, sleight-of-hand, stealth
      expect(pinned).toContain('athletics')
      expect(pinned).toContain('acrobatics')
      expect(pinned).toContain('stealth')
    })

    it('includes class-primary-ability skills for a Wizard (INT)', () => {
      const char = createMockCharacter({
        classes: [{ classId: 'wizard', level: 5, chosenSkills: ['arcana', 'investigation'], hpRolls: [4, 3, 5, 4] }],
      })
      const pinned = getDefaultPinnedSkills(char)

      // Wizard primaryAbility: ['intelligence']
      // INT skills: arcana, history, investigation, nature, religion
      expect(pinned).toContain('arcana')
      expect(pinned).toContain('investigation')
    })

    it('includes class-primary-ability skills for a Cleric (WIS)', () => {
      const char = createMockCharacter({
        classes: [{ classId: 'cleric', level: 5, chosenSkills: ['insight', 'medicine'], hpRolls: [6, 5, 7, 6] }],
      })
      const pinned = getDefaultPinnedSkills(char)

      // Cleric primaryAbility: ['wisdom']
      // WIS skills: animal-handling, insight, medicine, perception, survival
      expect(pinned).toContain('perception')
      expect(pinned).toContain('insight')
    })

    it('returns at most MAX_PINNED_SKILLS (8) skills', () => {
      const char = createMockCharacter()
      const pinned = getDefaultPinnedSkills(char)
      expect(pinned.length).toBeLessThanOrEqual(MAX_PINNED_SKILLS)
    })

    it('has no duplicate entries', () => {
      const char = createMockCharacter()
      const pinned = getDefaultPinnedSkills(char)
      const unique = new Set(pinned)
      expect(unique.size).toBe(pinned.length)
    })
  })

  // -- getSessionViewConfig / saveSessionViewConfig --------------------------

  describe('getSessionViewConfig', () => {
    it('returns default config when nothing is stored', () => {
      const config = getSessionViewConfig('char-1')
      expect(config.pinnedSkills).toEqual(DEFAULT_PINNED_SKILLS)
      expect(config.showSpellSlots).toBe(true)
      expect(config.showConditions).toBe(true)
      expect(config.showFeatureUses).toBe(true)
    })

    it('loads saved config from localStorage', () => {
      const savedConfig = {
        pinnedSkills: ['arcana', 'stealth', 'perception'],
        showSpellSlots: false,
        showConditions: true,
        showFeatureUses: false,
      }
      localStorage.setItem(
        'dnd-forge-session-config-char-2',
        JSON.stringify(savedConfig),
      )

      const config = getSessionViewConfig('char-2')
      expect(config.pinnedSkills).toEqual(['arcana', 'stealth', 'perception'])
      expect(config.showSpellSlots).toBe(false)
      expect(config.showFeatureUses).toBe(false)
    })

    it('returns default config on corrupted localStorage data', () => {
      localStorage.setItem('dnd-forge-session-config-char-3', 'NOT_JSON')
      const config = getSessionViewConfig('char-3')
      expect(config.pinnedSkills).toEqual(DEFAULT_PINNED_SKILLS)
    })
  })

  describe('saveSessionViewConfig', () => {
    it('saves config to localStorage', () => {
      const config = {
        pinnedSkills: ['arcana', 'stealth'],
        showSpellSlots: true,
        showConditions: false,
        showFeatureUses: true,
      }
      saveSessionViewConfig('char-4', config)

      const stored = JSON.parse(
        localStorage.getItem('dnd-forge-session-config-char-4')!,
      )
      expect(stored.pinnedSkills).toEqual(['arcana', 'stealth'])
      expect(stored.showConditions).toBe(false)
    })

    it('enforces max 8 pinned skills when saving', () => {
      const config = {
        pinnedSkills: [
          'arcana', 'athletics', 'stealth', 'perception',
          'insight', 'deception', 'persuasion', 'investigation',
          'history', 'nature',
        ],
        showSpellSlots: true,
        showConditions: true,
        showFeatureUses: true,
      }
      saveSessionViewConfig('char-5', config)

      const stored = JSON.parse(
        localStorage.getItem('dnd-forge-session-config-char-5')!,
      )
      expect(stored.pinnedSkills.length).toBeLessThanOrEqual(MAX_PINNED_SKILLS)
    })
  })

  // -- formatSkillName -------------------------------------------------------

  describe('formatSkillName', () => {
    it('formats hyphenated skill names', () => {
      expect(formatSkillName('sleight-of-hand')).toBe('Sleight of Hand')
      expect(formatSkillName('animal-handling')).toBe('Animal Handling')
    })

    it('formats simple skill names', () => {
      expect(formatSkillName('stealth')).toBe('Stealth')
      expect(formatSkillName('perception')).toBe('Perception')
    })
  })

  // -- getPinnableOptions ----------------------------------------------------

  describe('getPinnableOptions', () => {
    it('returns 6 groups (one per ability)', () => {
      const groups = getPinnableOptions()
      expect(groups).toHaveLength(6)
      expect(groups.map((g) => g.ability)).toEqual([
        'strength', 'dexterity', 'constitution',
        'intelligence', 'wisdom', 'charisma',
      ])
    })

    it('includes both skills and a save in each group', () => {
      const groups = getPinnableOptions()
      for (const group of groups) {
        const hasSave = group.options.some((o) => o.type === 'save')
        expect(hasSave).toBe(true)
      }
    })

    it('has 24 total options (18 skills + 6 saves)', () => {
      const groups = getPinnableOptions()
      const total = groups.reduce((sum, g) => sum + g.options.length, 0)
      expect(total).toBe(24)
    })
  })
})
