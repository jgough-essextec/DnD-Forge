/**
 * TempHPManager (Story 27.2)
 *
 * Temporary HP management component with shield icon, blue accent styling,
 * non-stacking rule enforcement, and visual overlay display.
 */

import { useState, useCallback } from 'react'
import { Shield } from 'lucide-react'
import { cn } from '@/lib/utils'
import { setTempHP } from '@/utils/hp-tracker'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface TempHPManagerProps {
  tempHp: number
  hpCurrent: number
  hpMax: number
  onSetTempHP: (value: number) => void
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function TempHPManager({
  tempHp,
  hpCurrent,
  hpMax,
  onSetTempHP,
}: TempHPManagerProps) {
  const [inputValue, setInputValue] = useState('')
  const [showInput, setShowInput] = useState(false)
  const [showTooltip, setShowTooltip] = useState(false)

  const hpPercentage = hpMax > 0 ? (hpCurrent / hpMax) * 100 : 0
  const tempPercentage = hpMax > 0 ? (tempHp / hpMax) * 100 : 0

  const getBarColor = (percentage: number) => {
    if (percentage === 0) return 'bg-gray-800'
    if (percentage <= 24) return 'bg-damage-red'
    if (percentage <= 74) return 'bg-yellow-500'
    return 'bg-healing-green'
  }

  const handleSetTemp = useCallback(() => {
    const newValue = parseInt(inputValue) || 0
    if (newValue <= 0) {
      setShowInput(false)
      setInputValue('')
      return
    }

    const result = setTempHP(tempHp, newValue)

    // Show tooltip if the new value didn't replace (kept higher)
    if (result === tempHp && tempHp > 0 && newValue <= tempHp) {
      setShowTooltip(true)
      setTimeout(() => setShowTooltip(false), 3000)
    }

    onSetTempHP(result)
    setInputValue('')
    setShowInput(false)
  }, [inputValue, tempHp, onSetTempHP])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSetTemp()
    } else if (e.key === 'Escape') {
      setShowInput(false)
      setInputValue('')
    }
  }

  return (
    <div data-testid="temp-hp-manager">
      {/* HP Bar with Temp HP overlay */}
      <div
        className="relative h-4 bg-bg-primary/50 rounded-full overflow-hidden"
        data-testid="hp-bar-with-temp"
      >
        {/* Regular HP bar */}
        <div
          className={cn('h-full transition-all duration-300', getBarColor(hpPercentage))}
          style={{ width: `${Math.min(hpPercentage, 100)}%` }}
          data-testid="hp-bar-regular"
        />
        {/* Temp HP overlay (blue shield segment) */}
        {tempHp > 0 && (
          <div
            className="absolute top-0 h-full bg-blue-500/60 border-r-2 border-blue-300 transition-all duration-300"
            style={{
              left: `${Math.min(hpPercentage, 100)}%`,
              width: `${Math.min(tempPercentage, 100 - Math.min(hpPercentage, 100))}%`,
            }}
            data-testid="temp-hp-bar-overlay"
          />
        )}
      </div>

      {/* Temp HP Display / Input */}
      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-1.5">
          <Shield
            className={cn(
              'w-4 h-4',
              tempHp > 0 ? 'text-blue-400' : 'text-parchment/40',
            )}
          />
          <span className="text-xs text-parchment/60 uppercase tracking-wider">
            Temp HP
          </span>
        </div>

        {showInput ? (
          <div className="flex items-center gap-1">
            <input
              type="number"
              min="0"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleSetTemp}
              placeholder={String(tempHp)}
              className="w-16 bg-blue-500/10 border border-blue-400/30 rounded px-2 py-1 text-blue-300 text-sm text-right focus:outline-none focus:border-blue-400"
              aria-label="Set temporary hit points"
              data-testid="temp-hp-input"
              autoFocus
              inputMode="numeric"
            />
          </div>
        ) : (
          <button
            onClick={() => setShowInput(true)}
            className={cn(
              'px-2 py-0.5 rounded text-sm transition-colors',
              tempHp > 0
                ? 'bg-blue-500/10 border border-blue-400/30 text-blue-300 hover:bg-blue-500/20'
                : 'text-parchment/40 hover:text-parchment/60 hover:bg-bg-primary/50',
            )}
            aria-label="Edit temporary hit points"
            data-testid="temp-hp-display"
            type="button"
          >
            {tempHp > 0 ? tempHp : 'Set'}
          </button>
        )}
      </div>

      {/* Non-stacking tooltip */}
      {showTooltip && (
        <div
          className="mt-1 text-xs text-blue-300 bg-blue-500/10 rounded px-2 py-1 text-center"
          data-testid="temp-hp-tooltip"
        >
          Temp HP don&apos;t stack. Kept the higher value.
        </div>
      )}

      {/* Active temp HP indicator */}
      {tempHp > 0 && !showTooltip && (
        <div className="mt-1 flex items-center justify-center gap-1.5 text-xs text-blue-300 bg-blue-500/10 rounded px-2 py-1">
          <Shield className="w-3 h-3" />
          <span>{tempHp} temporary HP active</span>
        </div>
      )}
    </div>
  )
}
