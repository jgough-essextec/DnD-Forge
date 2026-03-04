/**
 * Tests for useFieldOverride hook (Story 46.5)
 */

import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useFieldOverride, OVERRIDE_FIELD_KEYS } from '@/hooks/useFieldOverride'

describe('useFieldOverride', () => {
  // -----------------------------------------------------------------------
  // Basic operations
  // -----------------------------------------------------------------------

  it('should initialize with empty overrides', () => {
    const { result } = renderHook(() => useFieldOverride())
    expect(Object.keys(result.current.overrides).length).toBe(0)
  })

  it('should initialize with provided overrides', () => {
    const initial = { ac: { override: 20, computed: 18 } }
    const { result } = renderHook(() => useFieldOverride(initial))
    expect(result.current.overrides.ac).toEqual({ override: 20, computed: 18 })
  })

  it('should store both override value and computed value', () => {
    const { result } = renderHook(() => useFieldOverride())
    act(() => {
      result.current.setOverride('ac', 20, 18)
    })
    expect(result.current.overrides.ac).toEqual({ override: 20, computed: 18 })
  })

  // -----------------------------------------------------------------------
  // getDisplayValue
  // -----------------------------------------------------------------------

  it('should return override value when present', () => {
    const { result } = renderHook(() => useFieldOverride())
    act(() => {
      result.current.setOverride('ac', 20, 18)
    })
    expect(result.current.getDisplayValue('ac', 18)).toBe(20)
  })

  it('should return computed value when no override exists', () => {
    const { result } = renderHook(() => useFieldOverride())
    expect(result.current.getDisplayValue('ac', 18)).toBe(18)
  })

  // -----------------------------------------------------------------------
  // hasOverride
  // -----------------------------------------------------------------------

  it('should return true when field has override', () => {
    const { result } = renderHook(() => useFieldOverride())
    act(() => {
      result.current.setOverride('ac', 20, 18)
    })
    expect(result.current.hasOverride('ac')).toBe(true)
  })

  it('should return false when field has no override', () => {
    const { result } = renderHook(() => useFieldOverride())
    expect(result.current.hasOverride('ac')).toBe(false)
  })

  // -----------------------------------------------------------------------
  // getComputedValue
  // -----------------------------------------------------------------------

  it('should return computed value for overridden field', () => {
    const { result } = renderHook(() => useFieldOverride())
    act(() => {
      result.current.setOverride('ac', 20, 18)
    })
    expect(result.current.getComputedValue('ac')).toBe(18)
  })

  it('should return null when field has no override', () => {
    const { result } = renderHook(() => useFieldOverride())
    expect(result.current.getComputedValue('ac')).toBeNull()
  })

  // -----------------------------------------------------------------------
  // resetToComputed
  // -----------------------------------------------------------------------

  it('should remove override and restore computed value on reset', () => {
    const { result } = renderHook(() => useFieldOverride())
    act(() => {
      result.current.setOverride('ac', 20, 18)
    })
    expect(result.current.hasOverride('ac')).toBe(true)

    act(() => {
      result.current.resetToComputed('ac')
    })
    expect(result.current.hasOverride('ac')).toBe(false)
    expect(result.current.getDisplayValue('ac', 18)).toBe(18)
  })

  // -----------------------------------------------------------------------
  // resetAll
  // -----------------------------------------------------------------------

  it('should remove all overrides', () => {
    const { result } = renderHook(() => useFieldOverride())
    act(() => {
      result.current.setOverride('ac', 20, 18)
      result.current.setOverride('initiative', 5, 3)
    })
    expect(Object.keys(result.current.overrides).length).toBe(2)

    act(() => {
      result.current.resetAll()
    })
    expect(Object.keys(result.current.overrides).length).toBe(0)
  })

  // -----------------------------------------------------------------------
  // updateComputed
  // -----------------------------------------------------------------------

  it('should update computed value without changing override', () => {
    const { result } = renderHook(() => useFieldOverride())
    act(() => {
      result.current.setOverride('ac', 20, 18)
    })
    act(() => {
      result.current.updateComputed('ac', 19)
    })
    expect(result.current.overrides.ac.override).toBe(20)
    expect(result.current.overrides.ac.computed).toBe(19)
  })

  it('should not create a new entry if field is not overridden', () => {
    const { result } = renderHook(() => useFieldOverride())
    act(() => {
      result.current.updateComputed('ac', 19)
    })
    expect(result.current.hasOverride('ac')).toBe(false)
  })

  // -----------------------------------------------------------------------
  // detectComputedChanges
  // -----------------------------------------------------------------------

  it('should detect when computed value changes for overridden fields', () => {
    const { result } = renderHook(() => useFieldOverride())
    act(() => {
      result.current.setOverride('ac', 20, 18)
      result.current.setOverride('initiative', 5, 3)
    })

    const changes = result.current.detectComputedChanges(
      { ac: 19, initiative: 3 },
      { ac: 'AC', initiative: 'Initiative' },
    )
    expect(changes.length).toBe(1)
    expect(changes[0].fieldKey).toBe('ac')
    expect(changes[0].fieldLabel).toBe('AC')
    expect(changes[0].overrideValue).toBe(20)
    expect(changes[0].oldComputed).toBe(18)
    expect(changes[0].newComputed).toBe(19)
  })

  it('should return empty array when no computed values changed', () => {
    const { result } = renderHook(() => useFieldOverride())
    act(() => {
      result.current.setOverride('ac', 20, 18)
    })

    const changes = result.current.detectComputedChanges(
      { ac: 18 },
      { ac: 'AC' },
    )
    expect(changes.length).toBe(0)
  })

  it('should use field key as label when label not provided', () => {
    const { result } = renderHook(() => useFieldOverride())
    act(() => {
      result.current.setOverride('ac', 20, 18)
    })

    const changes = result.current.detectComputedChanges({ ac: 19 }, {})
    expect(changes[0].fieldLabel).toBe('ac')
  })

  // -----------------------------------------------------------------------
  // OVERRIDE_FIELD_KEYS
  // -----------------------------------------------------------------------

  it('should use consistent naming convention for override field keys', () => {
    expect(OVERRIDE_FIELD_KEYS.ac).toBe('ac')
    expect(OVERRIDE_FIELD_KEYS.initiative).toBe('initiative')
    expect(OVERRIDE_FIELD_KEYS.speed).toBe('speed')
    expect(OVERRIDE_FIELD_KEYS.hpMax).toBe('hpMax')
    expect(OVERRIDE_FIELD_KEYS.spellSaveDC).toBe('spellSaveDC')
    expect(OVERRIDE_FIELD_KEYS.spellAttackBonus).toBe('spellAttackBonus')
  })

  // -----------------------------------------------------------------------
  // Multiple overrides
  // -----------------------------------------------------------------------

  it('should support multiple simultaneous overrides', () => {
    const { result } = renderHook(() => useFieldOverride())
    act(() => {
      result.current.setOverride('ac', 20, 18)
      result.current.setOverride('initiative', 5, 3)
      result.current.setOverride('speed', 35, 30)
      result.current.setOverride('skill.athletics', 8, 6)
      result.current.setOverride('save.strength', 7, 5)
    })
    expect(Object.keys(result.current.overrides).length).toBe(5)
    expect(result.current.getDisplayValue('skill.athletics', 6)).toBe(8)
    expect(result.current.getDisplayValue('save.strength', 5)).toBe(7)
  })
})
