/**
 * useFieldOverride (Story 46.5)
 *
 * Hook for managing manual overrides on computed character fields.
 * Stores both the override value and the computed value, supports
 * reset-to-computed, and detects computed value changes for
 * notification purposes.
 */

import { useState, useCallback, useMemo } from 'react'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface FieldOverrideEntry {
  /** The manually set value */
  override: number
  /** The system-computed value */
  computed: number
}

/** Map of field key -> override entry */
export type OverrideMap = Record<string, FieldOverrideEntry>

export interface FieldOverrideChange {
  fieldKey: string
  fieldLabel: string
  overrideValue: number
  oldComputed: number
  newComputed: number
}

export interface UseFieldOverrideReturn {
  /** Current override map */
  overrides: OverrideMap

  /**
   * Get the display value for a field: returns override if present,
   * otherwise the computed value.
   */
  getDisplayValue: (fieldKey: string, computedValue: number) => number

  /** Whether a field has an active override */
  hasOverride: (fieldKey: string) => boolean

  /** Get the computed value for an overridden field (for tooltip) */
  getComputedValue: (fieldKey: string) => number | null

  /** Set an override for a field */
  setOverride: (fieldKey: string, overrideValue: number, computedValue: number) => void

  /** Remove the override and reset to computed */
  resetToComputed: (fieldKey: string) => void

  /** Remove all overrides */
  resetAll: () => void

  /**
   * Detect fields where the computed value has changed since the
   * override was set. Returns a list of changes for notification.
   */
  detectComputedChanges: (
    currentComputed: Record<string, number>,
    fieldLabels: Record<string, string>,
  ) => FieldOverrideChange[]

  /** Update the stored computed value without changing the override */
  updateComputed: (fieldKey: string, newComputed: number) => void
}

// ---------------------------------------------------------------------------
// Standard field keys
// ---------------------------------------------------------------------------

/** Conventional field key names for overridable character stats */
export const OVERRIDE_FIELD_KEYS = {
  ac: 'ac',
  initiative: 'initiative',
  speed: 'speed',
  hpMax: 'hpMax',
  spellSaveDC: 'spellSaveDC',
  spellAttackBonus: 'spellAttackBonus',
  // Skills: skill.<skillName>
  // Saves: save.<abilityName>
} as const

// ---------------------------------------------------------------------------
// Hook implementation
// ---------------------------------------------------------------------------

export function useFieldOverride(initialOverrides?: OverrideMap): UseFieldOverrideReturn {
  const [overrides, setOverrides] = useState<OverrideMap>(initialOverrides ?? {})

  const getDisplayValue = useCallback(
    (fieldKey: string, computedValue: number): number => {
      const entry = overrides[fieldKey]
      return entry !== undefined ? entry.override : computedValue
    },
    [overrides],
  )

  const hasOverride = useCallback(
    (fieldKey: string): boolean => {
      return fieldKey in overrides
    },
    [overrides],
  )

  const getComputedValue = useCallback(
    (fieldKey: string): number | null => {
      const entry = overrides[fieldKey]
      return entry !== undefined ? entry.computed : null
    },
    [overrides],
  )

  const setOverride = useCallback(
    (fieldKey: string, overrideValue: number, computedValue: number) => {
      setOverrides((prev) => ({
        ...prev,
        [fieldKey]: { override: overrideValue, computed: computedValue },
      }))
    },
    [],
  )

  const resetToComputed = useCallback((fieldKey: string) => {
    setOverrides((prev) => {
      const next = { ...prev }
      delete next[fieldKey]
      return next
    })
  }, [])

  const resetAll = useCallback(() => {
    setOverrides({})
  }, [])

  const updateComputed = useCallback(
    (fieldKey: string, newComputed: number) => {
      setOverrides((prev) => {
        if (!(fieldKey in prev)) return prev
        return {
          ...prev,
          [fieldKey]: { ...prev[fieldKey], computed: newComputed },
        }
      })
    },
    [],
  )

  const detectComputedChanges = useCallback(
    (
      currentComputed: Record<string, number>,
      fieldLabels: Record<string, string>,
    ): FieldOverrideChange[] => {
      const changes: FieldOverrideChange[] = []

      for (const [key, entry] of Object.entries(overrides)) {
        const newComputed = currentComputed[key]
        if (newComputed !== undefined && newComputed !== entry.computed) {
          changes.push({
            fieldKey: key,
            fieldLabel: fieldLabels[key] ?? key,
            overrideValue: entry.override,
            oldComputed: entry.computed,
            newComputed,
          })
        }
      }

      return changes
    },
    [overrides],
  )

  return useMemo(
    () => ({
      overrides,
      getDisplayValue,
      hasOverride,
      getComputedValue,
      setOverride,
      resetToComputed,
      resetAll,
      detectComputedChanges,
      updateComputed,
    }),
    [
      overrides,
      getDisplayValue,
      hasOverride,
      getComputedValue,
      setOverride,
      resetToComputed,
      resetAll,
      detectComputedChanges,
      updateComputed,
    ],
  )
}
