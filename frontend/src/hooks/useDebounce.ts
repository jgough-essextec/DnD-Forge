/**
 * useDebounce Hook (Story 42.3)
 *
 * Debounces a value or callback by a specified delay.
 * Used for search inputs, filter operations, and other
 * expensive operations that should not fire on every keystroke.
 *
 * Default delay: 150ms (per performance requirements).
 */

import { useEffect, useMemo, useRef, useState } from 'react'

// ---------------------------------------------------------------------------
// useDebounce (value debouncing)
// ---------------------------------------------------------------------------

/**
 * Returns a debounced version of the provided value.
 * The debounced value only updates after the specified delay
 * has passed since the last change.
 *
 * @param value - The value to debounce
 * @param delayMs - Debounce delay in milliseconds (default: 150)
 * @returns The debounced value
 *
 * @example
 * const [search, setSearch] = useState('')
 * const debouncedSearch = useDebounce(search, 150)
 * // debouncedSearch updates 150ms after the last setSearch call
 */
export function useDebounce<T>(value: T, delayMs = 150): T {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delayMs)

    return () => {
      clearTimeout(timer)
    }
  }, [value, delayMs])

  return debouncedValue
}

// ---------------------------------------------------------------------------
// useDebouncedCallback (function debouncing)
// ---------------------------------------------------------------------------

/**
 * Returns a debounced version of the provided callback function.
 * The callback will only be invoked after the specified delay has
 * passed since the last call.
 *
 * @param callback - The function to debounce
 * @param delayMs - Debounce delay in milliseconds (default: 150)
 * @returns A debounced version of the callback, plus a cancel function
 *
 * @example
 * const { debouncedFn, cancel } = useDebouncedCallback((query: string) => {
 *   filterCharacters(query)
 * }, 150)
 */
export function useDebouncedCallback<Args extends unknown[]>(
  callback: (...args: Args) => void,
  delayMs = 150
): { debouncedFn: (...args: Args) => void; cancel: () => void } {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const callbackRef = useRef(callback)

  // Keep callback ref up to date
  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [])

  const cancel = useMemo(
    () => () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
    },
    []
  )

  const debouncedFn = useMemo(
    () =>
      (...args: Args) => {
        if (timerRef.current) {
          clearTimeout(timerRef.current)
        }
        timerRef.current = setTimeout(() => {
          callbackRef.current(...args)
          timerRef.current = null
        }, delayMs)
      },
    [delayMs]
  )

  return { debouncedFn, cancel }
}
