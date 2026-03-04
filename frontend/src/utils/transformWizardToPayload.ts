import type { WizardState } from '@/stores/wizardStore'
import type { CreateCharacterData } from '@/types/character'

/**
 * Pure function that converts wizard store state into the
 * CreateCharacterData payload expected by the character creation API.
 *
 * Provides sensible defaults for fields the wizard does not directly collect.
 */
export function transformWizardToPayload(state: WizardState): CreateCharacterData {
  return {
    name: state.characterName,
    playerName: '',
    avatarUrl: null,

    race: state.raceSelection ?? { raceId: '' },
    classes: state.classSelection ? [state.classSelection] : [],
    background: state.backgroundSelection ?? {
      backgroundId: '',
      characterIdentity: {
        name: state.characterName,
      },
      characterPersonality: {
        personalityTraits: ['', ''],
        ideal: '',
        bond: '',
        flaw: '',
      },
    },
    alignment: 'true-neutral',

    baseAbilityScores: state.abilityScores ?? {
      strength: 10,
      dexterity: 10,
      constitution: 10,
      intelligence: 10,
      wisdom: 10,
      charisma: 10,
    },
    abilityScoreMethod: state.abilityScoreMethod ?? 'standard',

    experiencePoints: 0,

    hpMax: 0,
    hpCurrent: 0,
    tempHp: 0,
    hitDiceTotal: [],
    hitDiceUsed: [],
    speed: { walk: 30 },
    deathSaves: { successes: 0, failures: 0, stable: false },

    proficiencies: {
      armor: [],
      weapons: [],
      tools: [],
      languages: ['common'],
      skills: [],
      savingThrows: [],
    },

    inventory: state.equipmentSelections,
    currency: { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 },
    attunedItems: [],

    spellcasting: state.spellSelections.length > 0
      ? {
          type: 'known' as const,
          ability: 'intelligence' as const,
          cantrips: [],
          knownSpells: state.spellSelections,
          preparedSpells: [],
          spellSlots: {},
          usedSpellSlots: {},
          ritualCasting: false,
        }
      : null,

    features: [],
    feats: [],

    description: {
      name: state.characterName,
      age: '',
      height: '',
      weight: '',
      eyes: '',
      skin: '',
      hair: '',
      appearance: '',
      backstory: '',
      alliesAndOrgs: '',
      treasure: '',
    },
    personality: state.backgroundSelection?.characterPersonality ?? {
      personalityTraits: ['', ''],
      ideal: '',
      bond: '',
      flaw: '',
    },

    conditions: [],
    inspiration: false,
    campaignId: null,
    isArchived: false,
  }
}
