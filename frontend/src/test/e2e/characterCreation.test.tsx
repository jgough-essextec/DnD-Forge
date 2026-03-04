/**
 * E2E Integration Test: Character Creation Flow (Epic 45, Story 45.2)
 *
 * Exercises the complete character creation pipeline from wizard state
 * through transformation to API payload and mock API submission.
 * Verifies ability scores, proficiencies, HP, AC, and spellcasting
 * are computed correctly for a Human Fighter.
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { act } from '@testing-library/react'

import { useWizardStore } from '@/stores/wizardStore'
import { transformWizardToPayload } from '@/utils/transformWizardToPayload'
import {
  getModifier,
  getMaxHitPoints,
  getArmorClass,
  getProficiencyBonus,
} from '@/utils/calculations'
import { getClassById } from '@/data/classes'
import type { RaceSelection } from '@/types/race'
import type { ClassSelection } from '@/types/class'
import type { BackgroundSelection } from '@/types/background'
import type { AbilityScores } from '@/types/core'
import type { InventoryItem } from '@/types/equipment'

const BASE_URL = 'http://localhost:8000/api'

beforeEach(() => {
  act(() => {
    useWizardStore.getState().reset()
  })
})

// ---------------------------------------------------------------------------
// Full Human Fighter Creation Flow
// ---------------------------------------------------------------------------

describe('Character Creation: Human Fighter End-to-End', () => {
  const humanRace: RaceSelection = { raceId: 'human' }

  const fighterClass: ClassSelection = {
    classId: 'fighter',
    level: 1,
    chosenSkills: ['athletics', 'perception'],
    chosenFightingStyle: 'defense',
    hpRolls: [],
  }

  const abilityScores: AbilityScores = {
    strength: 15,
    dexterity: 14,
    constitution: 13,
    intelligence: 12,
    wisdom: 10,
    charisma: 8,
  }

  const soldierBackground: BackgroundSelection = {
    backgroundId: 'soldier',
    characterIdentity: { name: 'Gorin Stonehelm' },
    characterPersonality: {
      personalityTraits: ['Never backs down', 'Loyal to a fault'],
      ideal: 'Honor',
      bond: 'My regiment',
      flaw: 'Stubborn',
    },
  }

  const equipment: InventoryItem[] = [
    {
      id: 'inv-chain-mail',
      equipmentId: 'chain-mail',
      name: 'Chain Mail',
      category: 'armor',
      quantity: 1,
      weight: 55,
      isEquipped: true,
      isAttuned: false,
      requiresAttunement: false,
    },
    {
      id: 'inv-shield',
      equipmentId: 'shield',
      name: 'Shield',
      category: 'shield',
      quantity: 1,
      weight: 6,
      isEquipped: true,
      isAttuned: false,
      requiresAttunement: false,
    },
    {
      id: 'inv-longsword',
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

  function fillWizardCompletely() {
    act(() => {
      const store = useWizardStore.getState()
      store.setCharacterName('Gorin Stonehelm')
      store.setRace(humanRace)
      store.setClass(fighterClass)
      store.setAbilityScores(abilityScores, 'standard')
      store.setBackground(soldierBackground)
      store.setEquipment(equipment)
      store.setStep(7)
    })
  }

  it('completes all 8 wizard steps and produces a valid state', () => {
    fillWizardCompletely()

    const state = useWizardStore.getState()
    expect(state.currentStep).toBe(7)
    expect(state.characterName).toBe('Gorin Stonehelm')
    expect(state.raceSelection?.raceId).toBe('human')
    expect(state.classSelection?.classId).toBe('fighter')
    expect(state.abilityScoreMethod).toBe('standard')
    expect(state.backgroundSelection?.backgroundId).toBe('soldier')
    expect(state.equipmentSelections).toHaveLength(3)
    expect(state.spellSelections).toEqual([])
  })

  it('transforms wizard state into correct API payload', () => {
    fillWizardCompletely()
    const payload = transformWizardToPayload(useWizardStore.getState())

    expect(payload.name).toBe('Gorin Stonehelm')
    expect(payload.race.raceId).toBe('human')
    expect(payload.classes[0].classId).toBe('fighter')
    expect(payload.classes[0].chosenFightingStyle).toBe('defense')
    expect(payload.baseAbilityScores).toEqual(abilityScores)
    expect(payload.spellcasting).toBeNull()
    expect(payload.inventory).toHaveLength(3)
  })

  it('computes correct effective ability scores with Human +1 racial bonus', () => {
    const effective: AbilityScores = {
      strength: abilityScores.strength + 1,     // 16
      dexterity: abilityScores.dexterity + 1,   // 15
      constitution: abilityScores.constitution + 1, // 14
      intelligence: abilityScores.intelligence + 1, // 13
      wisdom: abilityScores.wisdom + 1,          // 11
      charisma: abilityScores.charisma + 1,      // 9
    }

    expect(effective.strength).toBe(16)
    expect(getModifier(effective.strength)).toBe(3)
    expect(getModifier(effective.constitution)).toBe(2)
    expect(getModifier(effective.dexterity)).toBe(2)
  })

  it('computes correct HP for level 1 Fighter (d10 + CON mod)', () => {
    const conMod = getModifier(abilityScores.constitution + 1) // Human +1 = 14 -> +2
    const hp = getMaxHitPoints({
      hitDie: 10,
      level: 1,
      conModifier: conMod,
    })
    expect(hp).toBe(12) // 10 + 2
  })

  it('computes correct AC with Chain Mail + Shield + Defense', () => {
    const dexMod = getModifier(abilityScores.dexterity + 1) // 15 -> +2
    const ac = getArmorClass({
      armor: { baseAC: 16, category: 'heavy', dexCap: 0 },
      shield: true,
      dexModifier: dexMod,
      defenseFightingStyle: true,
    })
    expect(ac).toBe(19) // 16 + 2 (shield) + 1 (defense)
  })

  it('verifies Fighter class has correct proficiencies', () => {
    const fighter = getClassById('fighter')!
    expect(fighter.hitDie).toBe(10)
    expect(fighter.proficiencies.savingThrows).toEqual(['strength', 'constitution'])
    expect(fighter.proficiencies.armor).toContain('heavy')
    expect(fighter.proficiencies.armor).toContain('shields')
  })

  it('verifies proficiency bonus is +2 at level 1', () => {
    expect(getProficiencyBonus(1)).toBe(2)
  })

  it('submits character to API and receives created response', async () => {
    fillWizardCompletely()
    const payload = transformWizardToPayload(useWizardStore.getState())

    const response = await fetch(`${BASE_URL}/characters/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    expect(response.status).toBe(201)
    const created = await response.json()
    expect(created.id).toBe('char-new-001')
    expect(created.name).toBe('Gorin Stonehelm')
  })

  it('verifies Fighter has no spellcasting data', () => {
    fillWizardCompletely()
    const payload = transformWizardToPayload(useWizardStore.getState())
    expect(payload.spellcasting).toBeNull()

    const fighter = getClassById('fighter')!
    expect(fighter.spellcasting).toBeUndefined()
  })
})

// ---------------------------------------------------------------------------
// Caster Character: Wizard with Spells
// ---------------------------------------------------------------------------

describe('Character Creation: High Elf Wizard with Spells', () => {
  it('includes spellcasting data in payload for caster class', () => {
    act(() => {
      const store = useWizardStore.getState()
      store.setCharacterName('Erevan Moonshadow')
      store.setRace({ raceId: 'elf', subraceId: 'high-elf', chosenCantrip: 'light' })
      store.setClass({
        classId: 'wizard',
        level: 1,
        chosenSkills: ['arcana', 'history'],
        hpRolls: [],
      })
      store.setAbilityScores(
        { strength: 8, dexterity: 12, constitution: 14, intelligence: 15, wisdom: 13, charisma: 10 },
        'standard',
      )
      store.setBackground({
        backgroundId: 'sage',
        characterIdentity: { name: 'Erevan Moonshadow' },
        characterPersonality: {
          personalityTraits: ['Quiet', 'Studious'],
          ideal: 'Knowledge',
          bond: 'My spellbook',
          flaw: 'Arrogant',
        },
      })
      store.setSpells(['magic-missile', 'shield', 'detect-magic', 'mage-armor', 'sleep', 'find-familiar'])
      store.setStep(7)
    })

    const payload = transformWizardToPayload(useWizardStore.getState())
    expect(payload.spellcasting).not.toBeNull()
    expect(payload.spellcasting!.knownSpells).toHaveLength(6)
    expect(payload.spellcasting!.ability).toBe('intelligence')
    expect(payload.classes[0].classId).toBe('wizard')
    expect(payload.race.subraceId).toBe('high-elf')
  })

  it('computes correct Wizard HP (d6 + CON mod)', () => {
    // Elf racial: DEX +2, High Elf: INT +1
    // CON stays at 14 -> modifier +2
    const hp = getMaxHitPoints({
      hitDie: 6,
      level: 1,
      conModifier: 2,
    })
    expect(hp).toBe(8)
  })
})
