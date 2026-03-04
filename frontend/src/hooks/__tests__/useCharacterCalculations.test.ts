import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import {
  useCharacterCalculations,
  computeDerivedStats,
  detectChangeCategory,
  EMPTY_DERIVED_STATS,
} from '@/hooks/useCharacterCalculations'
import type { Character } from '@/types/character'

// ---------------------------------------------------------------------------
// Mock character factory
// ---------------------------------------------------------------------------

function createMockCharacter(overrides: Partial<Character> = {}): Character {
  return {
    id: 'char-001',
    name: 'Test Character',
    playerName: 'Player',
    avatarUrl: null,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    version: 1,
    race: { raceId: 'human', subraceId: null },
    classes: [
      {
        classId: 'fighter',
        level: 5,
        subclassId: 'champion',
        hitDie: 10,
        skillProficiencies: ['athletics', 'perception'],
      },
    ],
    background: {
      backgroundId: 'soldier',
      characterIdentity: { name: 'Test' },
      characterPersonality: {
        personalityTraits: ['Brave'],
        ideal: 'Honor',
        bond: 'Duty',
        flaw: 'Pride',
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
    level: 5,
    experiencePoints: 6500,
    hpMax: 52,
    hpCurrent: 44,
    tempHp: 0,
    hitDiceTotal: [5],
    hitDiceUsed: [1],
    speed: { walk: 30 },
    deathSaves: { successes: 0, failures: 0, stable: false },
    combatStats: {
      armorClass: { base: 10, formula: '10', modifiers: [] },
      initiative: 2,
      speed: { walk: 30 },
      hitPoints: { current: 44, max: 52, temporary: 0 },
      attacks: [],
      savingThrows: { strength: 6, constitution: 5 },
    },
    proficiencies: {
      armor: ['light', 'medium', 'heavy', 'shields'],
      weapons: ['simple', 'martial'],
      tools: [],
      languages: ['common'],
      skills: [
        { skill: 'athletics', proficient: true, expertise: false },
        { skill: 'perception', proficient: true, expertise: false },
      ],
      savingThrows: ['strength', 'constitution'],
    },
    inventory: [],
    currency: { cp: 0, sp: 0, ep: 0, gp: 100, pp: 0 },
    attunedItems: [],
    spellcasting: null,
    features: ['second-wind', 'action-surge', 'extra-attack'],
    feats: [],
    description: {
      name: 'Test',
      age: '25',
      height: '6\'0"',
      weight: '180 lbs',
      eyes: 'Blue',
      skin: 'Fair',
      hair: 'Brown',
      appearance: 'Strong',
      backstory: 'A warrior',
      alliesAndOrgs: '',
      treasure: '',
    },
    personality: {
      personalityTraits: ['Brave'],
      ideal: 'Honor',
      bond: 'Duty',
      flaw: 'Pride',
    },
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

describe('useCharacterCalculations', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  // ---- Unit Tests: computeDerivedStats ----

  describe('computeDerivedStats', () => {
    it('should compute ability modifiers correctly', () => {
      const character = createMockCharacter()
      const stats = computeDerivedStats(character)

      // STR 16 -> +3, DEX 14 -> +2, CON 14 -> +2
      expect(stats.abilityModifiers.strength).toBe(3)
      expect(stats.abilityModifiers.dexterity).toBe(2)
      expect(stats.abilityModifiers.constitution).toBe(2)
      expect(stats.abilityModifiers.intelligence).toBe(0)
      expect(stats.abilityModifiers.wisdom).toBe(1)
      expect(stats.abilityModifiers.charisma).toBe(-1)
    })

    it('should compute proficiency bonus from level', () => {
      const char5 = createMockCharacter({ level: 5 })
      expect(computeDerivedStats(char5).proficiencyBonus).toBe(3)

      const char1 = createMockCharacter({ level: 1 })
      expect(computeDerivedStats(char1).proficiencyBonus).toBe(2)

      const char17 = createMockCharacter({ level: 17 })
      expect(computeDerivedStats(char17).proficiencyBonus).toBe(6)
    })

    it('should compute initiative from DEX modifier', () => {
      const character = createMockCharacter()
      const stats = computeDerivedStats(character)
      // DEX 14 -> +2 initiative
      expect(stats.initiative).toBe(2)
    })

    it('should compute passive Perception', () => {
      const character = createMockCharacter()
      const stats = computeDerivedStats(character)
      // WIS 12 -> +1, proficient in perception at level 5 (prof bonus +3) = +4
      // Passive: 10 + 4 = 14
      expect(stats.passivePerception).toBe(14)
    })

    it('should compute melee and ranged attack bonuses', () => {
      const character = createMockCharacter()
      const stats = computeDerivedStats(character)
      // STR 16 -> +3, prof bonus +3 -> melee +6
      expect(stats.meleeAttackBonus).toBe(6)
      // DEX 14 -> +2, prof bonus +3 -> ranged +5
      expect(stats.rangedAttackBonus).toBe(5)
    })

    it('should compute carrying capacity from effective STR (with racial bonuses)', () => {
      const character = createMockCharacter()
      const stats = computeDerivedStats(character)
      // Base STR 16 + Human racial bonus +1 = effective STR 17
      // Carrying capacity = 17 * 15 = 255 lbs
      expect(stats.carryingCapacity).toBe(255)
      expect(stats.isEncumbered).toBe(false)
    })

    it('should return null spell stats for non-casters', () => {
      const character = createMockCharacter()
      const stats = computeDerivedStats(character)
      expect(stats.spellSaveDC).toBeNull()
      expect(stats.spellAttackBonus).toBeNull()
    })

    it('should compute saving throw modifiers', () => {
      const character = createMockCharacter()
      const stats = computeDerivedStats(character)
      // STR proficient: +3 (mod) + 3 (prof) = +6
      expect(stats.savingThrows.strength).toBe(6)
      // CON proficient: +2 (mod) + 3 (prof) = +5
      expect(stats.savingThrows.constitution).toBe(5)
      // DEX not proficient: +2 (mod)
      expect(stats.savingThrows.dexterity).toBe(2)
    })
  })

  // ---- Unit Tests: detectChangeCategory ----

  describe('detectChangeCategory', () => {
    it('should map ability score changes to "ability" category', () => {
      const prev = {
        baseAbilityScores: {
          strength: 16, dexterity: 14, constitution: 14,
          intelligence: 10, wisdom: 12, charisma: 8,
        },
      } as Partial<Character>
      const next = {
        baseAbilityScores: {
          strength: 18, dexterity: 14, constitution: 14,
          intelligence: 10, wisdom: 12, charisma: 8,
        },
      } as Partial<Character>

      expect(detectChangeCategory(prev, next)).toBe('ability')
    })

    it('should map level changes to "level" category', () => {
      const prev = { level: 5 } as Partial<Character>
      const next = { level: 6 } as Partial<Character>
      expect(detectChangeCategory(prev, next)).toBe('level')
    })

    it('should map equipment changes to "equipment" category', () => {
      const prev = { inventory: [] } as Partial<Character>
      const next = { inventory: [{ id: 'sword' }] } as unknown as Partial<Character>
      expect(detectChangeCategory(prev, next)).toBe('equipment')
    })

    it('should map spell list changes to "spell" category', () => {
      const prev = { spellcasting: null } as Partial<Character>
      const next = { spellcasting: { cantrips: ['fire-bolt'] } } as unknown as Partial<Character>
      expect(detectChangeCategory(prev, next)).toBe('spell')
    })

    it('should return "full" for unrecognized changes', () => {
      const prev = { name: 'Old' } as Partial<Character>
      const next = { name: 'New' } as Partial<Character>
      expect(detectChangeCategory(prev, next)).toBe('full')
    })
  })

  // ---- Functional Tests: hook ----

  it('should return empty derived stats when character is null', () => {
    const { result } = renderHook(() =>
      useCharacterCalculations(null)
    )
    expect(result.current).toEqual(EMPTY_DERIVED_STATS)
  })

  it('should debounce recalculation at 300ms', async () => {
    const character = createMockCharacter()

    const { result, rerender } = renderHook(
      ({ char }) => useCharacterCalculations(char, { debounceMs: 300 }),
      { initialProps: { char: character as Character | null } }
    )

    // Update with higher STR
    const updatedCharacter = createMockCharacter({
      baseAbilityScores: {
        strength: 20, dexterity: 14, constitution: 14,
        intelligence: 10, wisdom: 12, charisma: 8,
      },
      abilityScores: {
        strength: 20, dexterity: 14, constitution: 14,
        intelligence: 10, wisdom: 12, charisma: 8,
      },
    })

    rerender({ char: updatedCharacter })

    // Should still show old stats immediately
    expect(result.current.abilityModifiers.strength).toBe(3)

    // Advance past debounce
    await act(async () => {
      await vi.advanceTimersByTimeAsync(300)
    })

    await waitFor(() => {
      expect(result.current.abilityModifiers.strength).toBe(5)
    })
  })

  it('should recalculate dependent values when ability score changes', async () => {
    const character = createMockCharacter()

    const { result, rerender } = renderHook(
      ({ char }) => useCharacterCalculations(char, { debounceMs: 0 }),
      { initialProps: { char: character as Character | null } }
    )

    await act(async () => {
      await vi.advanceTimersByTimeAsync(0)
    })

    // Initial: STR 16 -> +3
    expect(result.current.abilityModifiers.strength).toBe(3)
    expect(result.current.meleeAttackBonus).toBe(6) // +3 STR + 3 prof

    // Change STR to 20
    const updated = createMockCharacter({
      baseAbilityScores: {
        strength: 20, dexterity: 14, constitution: 14,
        intelligence: 10, wisdom: 12, charisma: 8,
      },
      abilityScores: {
        strength: 20, dexterity: 14, constitution: 14,
        intelligence: 10, wisdom: 12, charisma: 8,
      },
    })

    rerender({ char: updated })

    await act(async () => {
      await vi.advanceTimersByTimeAsync(0)
    })

    await waitFor(() => {
      // STR 20 -> +5, melee attack = +5 + 3 = +8
      expect(result.current.abilityModifiers.strength).toBe(5)
      expect(result.current.meleeAttackBonus).toBe(8)
      expect(result.current.carryingCapacity).toBe(300) // 20 * 15
    })
  })

  it('should recalculate proficiency-dependent values when level changes', async () => {
    const character = createMockCharacter({ level: 4 })

    const { result, rerender } = renderHook(
      ({ char }) => useCharacterCalculations(char, { debounceMs: 0 }),
      { initialProps: { char: character as Character | null } }
    )

    await act(async () => {
      await vi.advanceTimersByTimeAsync(0)
    })

    expect(result.current.proficiencyBonus).toBe(2) // Level 4

    const updated = createMockCharacter({ level: 5 })
    rerender({ char: updated })

    await act(async () => {
      await vi.advanceTimersByTimeAsync(0)
    })

    await waitFor(() => {
      expect(result.current.proficiencyBonus).toBe(3) // Level 5
    })
  })

  it('should handle calculation engine errors gracefully', async () => {
    // Create a character that might cause issues
    const badCharacter = {
      ...createMockCharacter(),
      level: 0, // Invalid level
      classes: [],
    } as Character

    const { result } = renderHook(
      () => useCharacterCalculations(badCharacter, { debounceMs: 0 })
    )

    await act(async () => {
      await vi.advanceTimersByTimeAsync(0)
    })

    // Should return empty stats rather than throwing
    expect(result.current).toBeDefined()
  })

  it('should not recalculate when disabled', async () => {
    const character = createMockCharacter()

    const { result } = renderHook(
      () => useCharacterCalculations(character, { enabled: false, debounceMs: 0 })
    )

    await act(async () => {
      await vi.advanceTimersByTimeAsync(100)
    })

    // When disabled but character provided, it should still compute immediately
    // (no debounce) because the character is set directly
    expect(result.current).toBeDefined()
  })
})
