/**
 * ExpressionInput (Story 26.1)
 *
 * Custom dice expression input field that accepts standard dice notation
 * (e.g., "2d6+3", "4d6kh3"). Validates with the Phase 1 dice engine.
 * Shows recent expressions as suggestions.
 */

import { useState, useCallback } from 'react'
import { parseDiceNotation } from '@/utils/dice'
import { cn } from '@/lib/utils'

interface ExpressionInputProps {
  onRoll: (expression: string) => void
  recentExpressions: string[]
}

export function ExpressionInput({ onRoll, recentExpressions }: ExpressionInputProps) {
  const [expression, setExpression] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [showSuggestions, setShowSuggestions] = useState(false)

  const validate = useCallback((value: string): boolean => {
    if (!value.trim()) return false
    try {
      parseDiceNotation(value.trim())
      return true
    } catch {
      return false
    }
  }, [])

  const handleSubmit = useCallback(() => {
    const trimmed = expression.trim()
    if (!trimmed) return

    if (validate(trimmed)) {
      setError(null)
      onRoll(trimmed)
      setExpression('')
      setShowSuggestions(false)
    } else {
      setError('Invalid dice expression')
    }
  }, [expression, validate, onRoll])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        handleSubmit()
      }
    },
    [handleSubmit],
  )

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      setExpression(value)
      if (error) setError(null)
    },
    [error],
  )

  const handleSuggestionClick = useCallback(
    (expr: string) => {
      setExpression(expr)
      setShowSuggestions(false)
      onRoll(expr)
    },
    [onRoll],
  )

  const filteredSuggestions = recentExpressions.filter(
    (e) => e.toLowerCase().includes(expression.toLowerCase()) && expression.length > 0,
  )

  return (
    <div className="relative" data-testid="expression-input">
      <div className="flex gap-2">
        <input
          type="text"
          value={expression}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => {
            // Delay to allow click on suggestion
            setTimeout(() => setShowSuggestions(false), 200)
          }}
          placeholder="e.g. 2d6+3"
          aria-label="Custom dice expression"
          data-testid="expression-field"
          className={cn(
            'flex-1 px-3 py-2 rounded-lg text-sm font-mono',
            'bg-bg-primary border transition-colors',
            'text-parchment placeholder:text-parchment/30',
            'focus:outline-none focus:ring-2 focus:ring-accent-gold/50',
            error
              ? 'border-damage-red/60'
              : 'border-parchment/20 focus:border-accent-gold/40',
          )}
        />
        <button
          onClick={handleSubmit}
          aria-label="Roll expression"
          data-testid="roll-expression-btn"
          className={cn(
            'px-4 py-2 rounded-lg text-sm font-bold',
            'bg-accent-gold/20 text-accent-gold border border-accent-gold/40',
            'hover:bg-accent-gold/30 transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-accent-gold/50',
          )}
        >
          Roll
        </button>
      </div>

      {error && (
        <p
          className="text-xs text-damage-red mt-1"
          data-testid="expression-error"
          role="alert"
        >
          {error}
        </p>
      )}

      {showSuggestions && filteredSuggestions.length > 0 && (
        <ul
          className="absolute z-10 left-0 right-12 mt-1 rounded-lg border border-parchment/20 bg-bg-secondary shadow-lg overflow-hidden"
          data-testid="expression-suggestions"
        >
          {filteredSuggestions.slice(0, 5).map((expr) => (
            <li key={expr}>
              <button
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleSuggestionClick(expr)}
                className="w-full text-left px-3 py-2 text-sm font-mono text-parchment/70 hover:bg-accent-gold/10 hover:text-parchment transition-colors"
              >
                {expr}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
