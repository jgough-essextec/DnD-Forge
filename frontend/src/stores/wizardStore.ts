import { create } from 'zustand'
import type { RaceSelection } from '@/types/race'
import type { ClassSelection } from '@/types/class'
import type { AbilityScores } from '@/types/core'
import type { AbilityScoreMethod } from '@/types/character'
import type { BackgroundSelection } from '@/types/background'
import type { InventoryItem } from '@/types/equipment'

/**
 * Wizard store state for character creation flow.
 */
export interface WizardState {
  currentStep: number
  characterName: string
  raceSelection: RaceSelection | null
  classSelection: ClassSelection | null
  abilityScores: AbilityScores | null
  abilityScoreMethod: AbilityScoreMethod | null
  backgroundSelection: BackgroundSelection | null
  equipmentSelections: InventoryItem[]
  spellSelections: string[]
  isComplete: boolean
}

export interface WizardActions {
  setStep: (step: number) => void
  setCharacterName: (name: string) => void
  setRace: (race: RaceSelection | null) => void
  setClass: (cls: ClassSelection | null) => void
  setAbilityScores: (scores: AbilityScores, method: AbilityScoreMethod) => void
  setBackground: (background: BackgroundSelection | null) => void
  setEquipment: (equipment: InventoryItem[]) => void
  setSpells: (spells: string[]) => void
  reset: () => void
}

const initialState: WizardState = {
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

export const useWizardStore = create<WizardState & WizardActions>()((set) => ({
  ...initialState,

  setStep: (step) => set({ currentStep: step }),

  setCharacterName: (name) => set({ characterName: name }),

  setRace: (race) => set({ raceSelection: race }),

  setClass: (cls) => set({ classSelection: cls }),

  setAbilityScores: (scores, method) =>
    set({ abilityScores: scores, abilityScoreMethod: method }),

  setBackground: (background) => set({ backgroundSelection: background }),

  setEquipment: (equipment) => set({ equipmentSelections: equipment }),

  setSpells: (spells) => set({ spellSelections: spells }),

  reset: () => set(initialState),
}))
