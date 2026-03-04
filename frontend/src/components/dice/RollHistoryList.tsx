/**
 * RollHistoryList (Story 26.4)
 *
 * Scrollable history list showing the last 50 rolls.
 * Includes a clear history button and collapsible section header.
 */

import { useState, useCallback } from 'react'
import { ChevronDown, ChevronUp, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { RollHistoryEntry } from '@/components/dice/RollHistoryEntry'
import type { DiceRoll } from '@/stores/diceStore'

interface RollHistoryListProps {
  rolls: DiceRoll[]
  onReroll: (roll: DiceRoll) => void
  onClear: () => void
}

export function RollHistoryList({ rolls, onReroll, onClear }: RollHistoryListProps) {
  const [collapsed, setCollapsed] = useState(false)

  const toggleCollapsed = useCallback(() => {
    setCollapsed((prev) => !prev)
  }, [])

  return (
    <div className="flex flex-col min-h-0" data-testid="roll-history">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-t border-parchment/10">
        <button
          onClick={toggleCollapsed}
          className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-parchment/60 hover:text-parchment/80 transition-colors"
          aria-label={collapsed ? 'Expand roll history' : 'Collapse roll history'}
          data-testid="history-toggle"
        >
          {collapsed ? (
            <ChevronUp className="h-3.5 w-3.5" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5" />
          )}
          <span>History</span>
          <span className="text-parchment/40" data-testid="history-count">
            ({rolls.length})
          </span>
        </button>

        {rolls.length > 0 && (
          <button
            onClick={onClear}
            aria-label="Clear roll history"
            data-testid="clear-history-btn"
            className="flex items-center gap-1 text-xs text-parchment/40 hover:text-damage-red transition-colors"
          >
            <Trash2 className="h-3 w-3" />
            Clear
          </button>
        )}
      </div>

      {/* Content */}
      {!collapsed && (
        <div
          className={cn(
            'flex-1 overflow-y-auto px-2 pb-2 space-y-1',
            'scrollbar-thin scrollbar-thumb-parchment/10 scrollbar-track-transparent',
          )}
          data-testid="history-list"
        >
          {rolls.length === 0 ? (
            <div className="text-center text-xs text-parchment/30 py-4" data-testid="history-empty">
              No rolls yet
            </div>
          ) : (
            rolls.map((roll) => (
              <RollHistoryEntry
                key={roll.id}
                roll={roll}
                onReroll={onReroll}
              />
            ))
          )}
        </div>
      )}
    </div>
  )
}
