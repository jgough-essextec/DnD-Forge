import { describe, it, expect } from 'vitest'
import {
  WIZARD_STEPS,
  NON_CASTER_CLASSES,
  shouldSkipSpellcasting,
  getVisibleSteps,
  getNextStep,
  getPrevStep,
} from '@/components/wizard/wizardSteps'

describe('WIZARD_STEPS registry', () => {
  it('has 8 steps in the correct order', () => {
    expect(WIZARD_STEPS).toHaveLength(8)
    expect(WIZARD_STEPS.map((s) => s.id)).toEqual([0, 1, 2, 3, 4, 5, 6, 7])
  })

  it('has correct step names in order', () => {
    expect(WIZARD_STEPS.map((s) => s.name)).toEqual([
      'intro',
      'race',
      'class',
      'abilities',
      'background',
      'equipment',
      'spells',
      'review',
    ])
  })

  it('marks spells step as conditional', () => {
    const spellsStep = WIZARD_STEPS.find((s) => s.name === 'spells')
    expect(spellsStep?.isConditional).toBe(true)
  })

  it('does not mark non-spell steps as conditional', () => {
    const nonConditional = WIZARD_STEPS.filter((s) => s.name !== 'spells')
    nonConditional.forEach((step) => {
      expect(step.isConditional).toBeFalsy()
    })
  })
})

describe('shouldSkipSpellcasting', () => {
  it('returns true for non-caster classes', () => {
    for (const classId of NON_CASTER_CLASSES) {
      expect(shouldSkipSpellcasting(classId)).toBe(true)
    }
  })

  it('returns true for delayed caster classes (paladin, ranger)', () => {
    expect(shouldSkipSpellcasting('paladin')).toBe(true)
    expect(shouldSkipSpellcasting('ranger')).toBe(true)
  })

  it('returns false for full caster classes', () => {
    expect(shouldSkipSpellcasting('wizard')).toBe(false)
    expect(shouldSkipSpellcasting('cleric')).toBe(false)
    expect(shouldSkipSpellcasting('bard')).toBe(false)
    expect(shouldSkipSpellcasting('sorcerer')).toBe(false)
    expect(shouldSkipSpellcasting('warlock')).toBe(false)
    expect(shouldSkipSpellcasting('druid')).toBe(false)
  })

  it('returns false when classId is null', () => {
    expect(shouldSkipSpellcasting(null)).toBe(false)
  })
})

describe('getVisibleSteps', () => {
  it('returns all 8 steps for caster classes', () => {
    const steps = getVisibleSteps('wizard')
    expect(steps).toHaveLength(8)
  })

  it('filters out spells step for non-caster classes', () => {
    const steps = getVisibleSteps('fighter')
    expect(steps).toHaveLength(7)
    expect(steps.find((s) => s.name === 'spells')).toBeUndefined()
  })

  it('returns all 8 steps when classId is null', () => {
    const steps = getVisibleSteps(null)
    expect(steps).toHaveLength(8)
  })
})

describe('getNextStep', () => {
  it('advances to the next step for caster classes', () => {
    expect(getNextStep(5, 'wizard')).toBe(6) // equipment -> spells
    expect(getNextStep(6, 'wizard')).toBe(7) // spells -> review
  })

  it('skips spells step for non-caster classes', () => {
    expect(getNextStep(5, 'fighter')).toBe(7) // equipment -> review (skip spells)
  })

  it('does not go past the last step', () => {
    expect(getNextStep(7, 'wizard')).toBe(7)
  })

  it('advances normally for steps before spells', () => {
    expect(getNextStep(2, 'fighter')).toBe(3) // class -> abilities
    expect(getNextStep(2, 'wizard')).toBe(3) // class -> abilities
  })
})

describe('getPrevStep', () => {
  it('goes back to the previous step for caster classes', () => {
    expect(getPrevStep(7, 'wizard')).toBe(6) // review -> spells
    expect(getPrevStep(6, 'wizard')).toBe(5) // spells -> equipment
  })

  it('skips spells step for non-caster classes', () => {
    expect(getPrevStep(7, 'fighter')).toBe(5) // review -> equipment (skip spells)
  })

  it('does not go below step 0', () => {
    expect(getPrevStep(0, 'wizard')).toBe(0)
  })

  it('goes back normally for steps after spells', () => {
    expect(getPrevStep(3, 'fighter')).toBe(2) // abilities -> class
    expect(getPrevStep(3, 'wizard')).toBe(2) // abilities -> class
  })
})
