import { describe, it, expect } from 'vitest'
import { transformWizardToPayload } from '@/utils/transformWizardToPayload'
import type { WizardState } from '@/stores/wizardStore'

const emptyState: WizardState = {
  currentStep: 0,
  characterName: '',
  raceSelection: null,
  classSelection: null,
  abilityScores: null,
  abilityScoreMethod: null,
  backgroundSelection: null,
  equipmentSelections: [],
  spellSelections: [],
  isComplete: false,
}

describe('transformWizardToPayload', () => {
  it('transforms empty wizard state with sensible defaults', () => {
    const result = transformWizardToPayload(emptyState)

    expect(result.name).toBe('')
    expect(result.alignment).toBe('true-neutral')
    expect(result.experiencePoints).toBe(0)
    expect(result.hpMax).toBe(0)
    expect(result.tempHp).toBe(0)
    expect(result.spellcasting).toBeNull()
    expect(result.conditions).toEqual([])
    expect(result.inspiration).toBe(false)
    expect(result.campaignId).toBeNull()
    expect(result.isArchived).toBe(false)
  })

  it('uses character name from wizard state', () => {
    const state: WizardState = {
      ...emptyState,
      characterName: 'Gandalf the Grey',
    }
    const result = transformWizardToPayload(state)
    expect(result.name).toBe('Gandalf the Grey')
    expect(result.description.name).toBe('Gandalf the Grey')
  })

  it('includes race selection when provided', () => {
    const state: WizardState = {
      ...emptyState,
      raceSelection: { raceId: 'elf', subraceId: 'high-elf' },
    }
    const result = transformWizardToPayload(state)
    expect(result.race).toEqual({ raceId: 'elf', subraceId: 'high-elf' })
  })

  it('provides default race when none selected', () => {
    const result = transformWizardToPayload(emptyState)
    expect(result.race).toEqual({ raceId: '' })
  })

  it('includes class as single-element array', () => {
    const cls = {
      classId: 'wizard',
      level: 1,
      subclassId: null,
      hitDie: 6,
      skillProficiencies: [],
    }
    const state: WizardState = {
      ...emptyState,
      classSelection: cls as never,
    }
    const result = transformWizardToPayload(state)
    expect(result.classes).toEqual([cls])
  })

  it('returns empty classes array when none selected', () => {
    const result = transformWizardToPayload(emptyState)
    expect(result.classes).toEqual([])
  })

  it('uses ability scores and method from wizard state', () => {
    const scores = {
      strength: 16,
      dexterity: 14,
      constitution: 13,
      intelligence: 12,
      wisdom: 10,
      charisma: 8,
    }
    const state: WizardState = {
      ...emptyState,
      abilityScores: scores,
      abilityScoreMethod: 'pointBuy',
    }
    const result = transformWizardToPayload(state)
    expect(result.baseAbilityScores).toEqual(scores)
    expect(result.abilityScoreMethod).toBe('pointBuy')
  })

  it('provides default ability scores when none set', () => {
    const result = transformWizardToPayload(emptyState)
    expect(result.baseAbilityScores).toEqual({
      strength: 10,
      dexterity: 10,
      constitution: 10,
      intelligence: 10,
      wisdom: 10,
      charisma: 10,
    })
    expect(result.abilityScoreMethod).toBe('standard')
  })

  it('includes background selection when provided', () => {
    const bg = {
      backgroundId: 'acolyte',
      characterIdentity: { name: 'Test' },
      characterPersonality: {
        personalityTraits: ['Brave', 'Kind'] as [string, string],
        ideal: 'Faith',
        bond: 'My temple',
        flaw: 'Judgmental',
      },
    }
    const state: WizardState = {
      ...emptyState,
      backgroundSelection: bg,
    }
    const result = transformWizardToPayload(state)
    expect(result.background).toEqual(bg)
    expect(result.personality).toEqual(bg.characterPersonality)
  })

  it('creates spellcasting data when spells are selected', () => {
    const state: WizardState = {
      ...emptyState,
      spellSelections: ['magic-missile', 'shield'],
    }
    const result = transformWizardToPayload(state)
    expect(result.spellcasting).not.toBeNull()
    expect(result.spellcasting!.knownSpells).toEqual(['magic-missile', 'shield'])
    expect(result.spellcasting!.type).toBe('known')
    expect(result.spellcasting!.ritualCasting).toBe(false)
  })

  it('sets spellcasting to null when no spells selected', () => {
    const result = transformWizardToPayload(emptyState)
    expect(result.spellcasting).toBeNull()
  })

  it('includes equipment selections', () => {
    const items = [
      {
        id: 'item-1',
        equipmentId: 'longsword',
        name: 'Longsword',
        category: 'weapon',
        quantity: 1,
        weight: 3,
        isEquipped: true,
        isAttuned: false,
        requiresAttunement: false,
      },
    ]
    const state: WizardState = {
      ...emptyState,
      equipmentSelections: items as never[],
    }
    const result = transformWizardToPayload(state)
    expect(result.inventory).toEqual(items)
  })

  it('provides default currency', () => {
    const result = transformWizardToPayload(emptyState)
    expect(result.currency).toEqual({ cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 })
  })

  it('default proficiencies include common language', () => {
    const result = transformWizardToPayload(emptyState)
    expect(result.proficiencies.languages).toContain('common')
  })
})
