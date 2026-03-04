// =============================================================================
// Data validation tests for Condition Definitions (Epic 29)
// =============================================================================

import { describe, it, expect } from 'vitest'
import { CONDITIONS } from '@/types/core'
import {
  CONDITION_DEFINITIONS,
  EXHAUSTION_LEVEL_EFFECTS,
  CONDITION_SHORT_DESCRIPTIONS,
  COMMON_CONDITIONS,
  CONDITION_COLOR_CLASSES,
  getConditionDisplayName,
  getConditionSeverity,
  getConditionBadgeClasses,
  getConditionColor,
  getConditionsBySeverity,
  type ConditionSeverity,
} from '@/data/conditions'

describe('Condition Definitions Data', () => {
  it('should define all 15 conditions', () => {
    expect(Object.keys(CONDITION_DEFINITIONS)).toHaveLength(15)
    for (const condition of CONDITIONS) {
      expect(CONDITION_DEFINITIONS[condition]).toBeDefined()
    }
  })

  it('should have all required fields for every condition', () => {
    for (const condition of CONDITIONS) {
      const def = CONDITION_DEFINITIONS[condition]
      expect(def.id).toBe(condition)
      expect(def.name).toBeTruthy()
      expect(def.icon).toBeTruthy()
      expect(def.color).toBeTruthy()
      expect(def.severity).toBeTruthy()
      expect(def.description).toBeTruthy()
      expect(def.effects.length).toBeGreaterThan(0)
    }
  })

  it('should assign correct severity categories', () => {
    // Debilitating (red)
    expect(CONDITION_DEFINITIONS.blinded.severity).toBe('debilitating')
    expect(CONDITION_DEFINITIONS.paralyzed.severity).toBe('debilitating')
    expect(CONDITION_DEFINITIONS.stunned.severity).toBe('debilitating')
    expect(CONDITION_DEFINITIONS.unconscious.severity).toBe('debilitating')
    expect(CONDITION_DEFINITIONS.petrified.severity).toBe('debilitating')
    expect(CONDITION_DEFINITIONS.incapacitated.severity).toBe('debilitating')

    // Moderate (orange)
    expect(CONDITION_DEFINITIONS.frightened.severity).toBe('moderate')
    expect(CONDITION_DEFINITIONS.poisoned.severity).toBe('moderate')
    expect(CONDITION_DEFINITIONS.restrained.severity).toBe('moderate')
    expect(CONDITION_DEFINITIONS.exhaustion.severity).toBe('moderate')

    // Mild (yellow)
    expect(CONDITION_DEFINITIONS.charmed.severity).toBe('mild')
    expect(CONDITION_DEFINITIONS.deafened.severity).toBe('mild')
    expect(CONDITION_DEFINITIONS.grappled.severity).toBe('mild')
    expect(CONDITION_DEFINITIONS.prone.severity).toBe('mild')

    // Beneficial (green)
    expect(CONDITION_DEFINITIONS.invisible.severity).toBe('beneficial')
  })

  it('should have short descriptions for all 15 conditions', () => {
    expect(Object.keys(CONDITION_SHORT_DESCRIPTIONS)).toHaveLength(15)
    for (const condition of CONDITIONS) {
      expect(CONDITION_SHORT_DESCRIPTIONS[condition]).toBeTruthy()
    }
  })

  it('should have exactly 6 exhaustion level effects', () => {
    expect(EXHAUSTION_LEVEL_EFFECTS).toHaveLength(6)
    expect(EXHAUSTION_LEVEL_EFFECTS[0]).toContain('Disadvantage on ability checks')
    expect(EXHAUSTION_LEVEL_EFFECTS[5]).toBe('Death')
  })
})

describe('Condition Helper Functions', () => {
  it('getConditionDisplayName returns title-cased name', () => {
    expect(getConditionDisplayName('blinded')).toBe('Blinded')
    expect(getConditionDisplayName('unconscious')).toBe('Unconscious')
    expect(getConditionDisplayName('exhaustion')).toBe('Exhaustion')
  })

  it('getConditionSeverity returns correct severity', () => {
    expect(getConditionSeverity('blinded')).toBe('debilitating')
    expect(getConditionSeverity('invisible')).toBe('beneficial')
    expect(getConditionSeverity('poisoned')).toBe('moderate')
    expect(getConditionSeverity('charmed')).toBe('mild')
  })

  it('getConditionBadgeClasses returns severity-appropriate classes', () => {
    const redClasses = getConditionBadgeClasses('blinded')
    expect(redClasses).toContain('red-500')

    const greenClasses = getConditionBadgeClasses('invisible')
    expect(greenClasses).toContain('green-500')

    const orangeClasses = getConditionBadgeClasses('poisoned')
    expect(orangeClasses).toContain('orange-500')

    const yellowClasses = getConditionBadgeClasses('charmed')
    expect(yellowClasses).toContain('yellow-500')
  })

  it('getConditionColor returns correct color identifier', () => {
    expect(getConditionColor('blinded')).toBe('red')
    expect(getConditionColor('invisible')).toBe('green')
    expect(getConditionColor('poisoned')).toBe('orange')
    expect(getConditionColor('charmed')).toBe('yellow')
  })

  it('CONDITION_COLOR_CLASSES has all four color entries with correct structure', () => {
    expect(CONDITION_COLOR_CLASSES.red).toBeDefined()
    expect(CONDITION_COLOR_CLASSES.orange).toBeDefined()
    expect(CONDITION_COLOR_CLASSES.yellow).toBeDefined()
    expect(CONDITION_COLOR_CLASSES.green).toBeDefined()

    for (const color of ['red', 'orange', 'yellow', 'green'] as const) {
      expect(CONDITION_COLOR_CLASSES[color].text).toBeTruthy()
      expect(CONDITION_COLOR_CLASSES[color].border).toBeTruthy()
      expect(CONDITION_COLOR_CLASSES[color].bg).toBeTruthy()
    }
  })

  it('getConditionsBySeverity groups conditions correctly', () => {
    const grouped = getConditionsBySeverity()

    const severities: ConditionSeverity[] = ['debilitating', 'moderate', 'mild', 'beneficial']
    for (const severity of severities) {
      expect(grouped[severity].length).toBeGreaterThan(0)
      for (const def of grouped[severity]) {
        expect(def.severity).toBe(severity)
      }
    }

    // Beneficial should have exactly 1 (invisible)
    expect(grouped.beneficial).toHaveLength(1)
    expect(grouped.beneficial[0].id).toBe('invisible')
  })

  it('COMMON_CONDITIONS contains valid conditions', () => {
    expect(COMMON_CONDITIONS.length).toBeGreaterThan(0)
    for (const condition of COMMON_CONDITIONS) {
      expect(CONDITION_DEFINITIONS[condition]).toBeDefined()
    }
  })
})
