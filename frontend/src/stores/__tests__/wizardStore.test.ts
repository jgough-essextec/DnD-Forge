import { describe, it, expect, beforeEach } from 'vitest'
import { useWizardStore } from '@/stores/wizardStore'
import type { RaceSelection } from '@/types/race'
import type { ClassSelection } from '@/types/class'
import type { AbilityScores } from '@/types/core'
import type { BackgroundSelection } from '@/types/background'

describe('wizardStore', () => {
  beforeEach(() => {
    useWizardStore.getState().reset()
  })

  it('has correct initial state', () => {
    const state = useWizardStore.getState()
    expect(state.currentStep).toBe(0)
    expect(state.characterName).toBe('')
    expect(state.raceSelection).toBeNull()
    expect(state.classSelection).toBeNull()
    expect(state.abilityScores).toBeNull()
    expect(state.abilityScoreMethod).toBeNull()
    expect(state.backgroundSelection).toBeNull()
    expect(state.equipmentSelections).toEqual([])
    expect(state.spellSelections).toEqual([])
    expect(state.isComplete).toBe(false)
  })

  it('setStep updates current step', () => {
    useWizardStore.getState().setStep(3)
    expect(useWizardStore.getState().currentStep).toBe(3)
  })

  it('setCharacterName updates character name', () => {
    useWizardStore.getState().setCharacterName('Gandalf')
    expect(useWizardStore.getState().characterName).toBe('Gandalf')
  })

  it('setRace updates race selection', () => {
    const race: RaceSelection = { raceId: 'elf', subraceId: 'high-elf' }
    useWizardStore.getState().setRace(race)
    expect(useWizardStore.getState().raceSelection).toEqual(race)
  })

  it('setRace can be set to null', () => {
    useWizardStore.getState().setRace({ raceId: 'elf' })
    useWizardStore.getState().setRace(null)
    expect(useWizardStore.getState().raceSelection).toBeNull()
  })

  it('setClass updates class selection', () => {
    const cls = {
      classId: 'wizard',
      level: 1,
      subclassId: null,
      hitDie: 6,
      skillProficiencies: ['arcana', 'history'],
    } as unknown as ClassSelection
    useWizardStore.getState().setClass(cls)
    expect(useWizardStore.getState().classSelection).toEqual(cls)
  })

  it('setAbilityScores updates both scores and method', () => {
    const scores: AbilityScores = {
      strength: 15,
      dexterity: 14,
      constitution: 13,
      intelligence: 12,
      wisdom: 10,
      charisma: 8,
    }
    useWizardStore.getState().setAbilityScores(scores, 'standard')
    expect(useWizardStore.getState().abilityScores).toEqual(scores)
    expect(useWizardStore.getState().abilityScoreMethod).toBe('standard')
  })

  it('setBackground updates background selection', () => {
    const bg: BackgroundSelection = {
      backgroundId: 'acolyte',
      characterIdentity: { name: 'Thorn' },
      characterPersonality: {
        personalityTraits: ['Brave', 'Honest'],
        ideal: 'Justice',
        bond: 'My temple',
        flaw: 'Too trusting',
      },
    }
    useWizardStore.getState().setBackground(bg)
    expect(useWizardStore.getState().backgroundSelection).toEqual(bg)
  })

  it('setEquipment updates equipment selections', () => {
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
    useWizardStore.getState().setEquipment(items as never[])
    expect(useWizardStore.getState().equipmentSelections).toEqual(items)
  })

  it('setSpells updates spell selections', () => {
    const spells = ['magic-missile', 'shield', 'mage-armor']
    useWizardStore.getState().setSpells(spells)
    expect(useWizardStore.getState().spellSelections).toEqual(spells)
  })

  it('reset restores initial state', () => {
    useWizardStore.getState().setStep(5)
    useWizardStore.getState().setCharacterName('Gandalf')
    useWizardStore.getState().setSpells(['fireball'])

    useWizardStore.getState().reset()

    const state = useWizardStore.getState()
    expect(state.currentStep).toBe(0)
    expect(state.characterName).toBe('')
    expect(state.spellSelections).toEqual([])
  })
})
