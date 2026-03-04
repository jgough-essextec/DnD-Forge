/**
 * ConditionsPanel (Stories 29.1, 29.2, 29.3)
 *
 * Orchestrator component for all condition management:
 * - Condition badges display
 * - Add condition modal
 * - Exhaustion tracker
 * - Condition history log
 *
 * Can be used standalone with props or integrated with CharacterSheetProvider.
 */

import { useState, useCallback, useRef } from 'react'
import type { Condition } from '@/types/core'
import type { ConditionInstance } from '@/types/combat'
import { ConditionBadges } from './ConditionBadges'
import { AddConditionModal } from './AddConditionModal'
import { ExhaustionTracker } from './ExhaustionTracker'
import {
  addCondition,
  removeCondition,
  getExhaustionLevel,
  setExhaustionLevel,
} from '@/utils/conditions'
import { getConditionDisplayName } from '@/data/conditions'

// ---------------------------------------------------------------------------
// Condition History Entry
// ---------------------------------------------------------------------------

export interface ConditionHistoryEntry {
  timestamp: Date
  action: 'added' | 'removed' | 'exhaustion_changed'
  condition: Condition
  detail?: string
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface ConditionsPanelProps {
  conditions: ConditionInstance[]
  onConditionsChange: (conditions: ConditionInstance[]) => void
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ConditionsPanel({
  conditions,
  onConditionsChange,
}: ConditionsPanelProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const historyRef = useRef<ConditionHistoryEntry[]>([])

  const addHistoryEntry = useCallback(
    (action: ConditionHistoryEntry['action'], condition: Condition, detail?: string) => {
      historyRef.current = [
        {
          timestamp: new Date(),
          action,
          condition,
          detail,
        },
        ...historyRef.current.slice(0, 49), // Keep last 50 entries
      ]
    },
    [],
  )

  const handleAdd = useCallback(
    (instance: ConditionInstance) => {
      const newConditions = addCondition(conditions, instance)
      if (newConditions !== conditions) {
        onConditionsChange(newConditions)
        addHistoryEntry('added', instance.condition, instance.source)
      }
    },
    [conditions, onConditionsChange, addHistoryEntry],
  )

  const handleRemove = useCallback(
    (condition: Condition) => {
      const newConditions = removeCondition(conditions, condition)
      if (newConditions !== conditions) {
        onConditionsChange(newConditions)
        if (condition === 'exhaustion') {
          addHistoryEntry(
            'exhaustion_changed',
            condition,
            `Decremented to level ${getExhaustionLevel(newConditions)}`,
          )
        } else {
          addHistoryEntry('removed', condition)
        }
      }
    },
    [conditions, onConditionsChange, addHistoryEntry],
  )

  const handleSetExhaustion = useCallback(
    (level: number) => {
      const newConditions = setExhaustionLevel(conditions, level)
      onConditionsChange(newConditions)
      addHistoryEntry(
        'exhaustion_changed',
        'exhaustion',
        `Set to level ${Math.max(0, Math.min(6, level))}`,
      )
    },
    [conditions, onConditionsChange, addHistoryEntry],
  )

  const exhaustionLevel = getExhaustionLevel(conditions)

  return (
    <div className="space-y-4" data-testid="conditions-panel">
      {/* Condition badges strip */}
      <ConditionBadges
        conditions={conditions}
        onRemove={handleRemove}
        onAddClick={() => setIsModalOpen(true)}
      />

      {/* Exhaustion tracker (shown when exhaustion is active) */}
      {exhaustionLevel > 0 && (
        <ExhaustionTracker
          level={exhaustionLevel}
          onSetLevel={handleSetExhaustion}
        />
      )}

      {/* Condition history toggle */}
      {historyRef.current.length > 0 && (
        <div>
          <button
            type="button"
            className="text-xs text-parchment/40 hover:text-parchment/60 transition-colors"
            onClick={() => setShowHistory(!showHistory)}
            data-testid="toggle-history"
          >
            {showHistory ? 'Hide' : 'Show'} condition history ({historyRef.current.length})
          </button>

          {showHistory && (
            <div
              className="mt-2 max-h-40 overflow-y-auto space-y-1"
              data-testid="condition-history"
            >
              {historyRef.current.map((entry, i) => (
                <div
                  key={i}
                  className="text-xs text-parchment/50 flex items-center gap-2"
                >
                  <span className="text-parchment/30 font-mono">
                    {entry.timestamp.toLocaleTimeString()}
                  </span>
                  <span>
                    {entry.action === 'added' && (
                      <span className="text-emerald-400">+ Added</span>
                    )}
                    {entry.action === 'removed' && (
                      <span className="text-red-400">- Removed</span>
                    )}
                    {entry.action === 'exhaustion_changed' && (
                      <span className="text-orange-400">~ Exhaustion</span>
                    )}
                  </span>
                  <span>{getConditionDisplayName(entry.condition)}</span>
                  {entry.detail && (
                    <span className="text-parchment/30">({entry.detail})</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add condition modal */}
      <AddConditionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        activeConditions={conditions}
        onAdd={handleAdd}
        onRemove={handleRemove}
        onSetExhaustion={handleSetExhaustion}
      />
    </div>
  )
}
