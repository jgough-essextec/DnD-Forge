/**
 * AddConditionModal (Story 29.2)
 *
 * Modal to add conditions with search/filter, source, duration fields.
 * Shows all 14 standard conditions + exhaustion with descriptions.
 * Already-active conditions are marked and cannot be duplicated.
 * Exhaustion shows a +/- stepper instead of a toggle.
 */

import { useState, useMemo } from 'react'
import {
  EyeOff,
  Heart,
  EarOff,
  Ghost,
  Grip,
  Ban,
  Eye,
  Zap,
  Mountain,
  Skull,
  ArrowDown,
  Lock,
  Stars,
  Moon,
  Battery,
  Search,
  X,
  Plus,
  Minus,
} from 'lucide-react'
import type { Condition } from '@/types/core'
import { CONDITIONS } from '@/types/core'
import type { ConditionInstance } from '@/types/combat'
import { cn } from '@/lib/utils'
import {
  getConditionBadgeClasses,
  getConditionDisplayName,
  CONDITION_SHORT_DESCRIPTIONS,
  COMMON_CONDITIONS,
} from '@/data/conditions'
import { getExhaustionLevel, getExhaustionEffects } from '@/utils/conditions'

// ---------------------------------------------------------------------------
// Icon mapping
// ---------------------------------------------------------------------------

const ICON_COMPONENTS: Record<Condition, React.ComponentType<{ className?: string; size?: number }>> = {
  blinded: EyeOff,
  charmed: Heart,
  deafened: EarOff,
  frightened: Ghost,
  grappled: Grip,
  incapacitated: Ban,
  invisible: Eye,
  paralyzed: Zap,
  petrified: Mountain,
  poisoned: Skull,
  prone: ArrowDown,
  restrained: Lock,
  stunned: Stars,
  unconscious: Moon,
  exhaustion: Battery,
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface AddConditionModalProps {
  isOpen: boolean
  onClose: () => void
  activeConditions: ConditionInstance[]
  onAdd: (condition: ConditionInstance) => void
  onRemove: (condition: Condition) => void
  onSetExhaustion: (level: number) => void
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function AddConditionModal({
  isOpen,
  onClose,
  activeConditions,
  onAdd,
  onRemove,
  onSetExhaustion,
}: AddConditionModalProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSource, setSelectedSource] = useState('')
  const [selectedDuration, setSelectedDuration] = useState('')

  const exhaustionLevel = useMemo(
    () => getExhaustionLevel(activeConditions),
    [activeConditions],
  )

  const isActive = (condition: Condition): boolean =>
    activeConditions.some((c) => c.condition === condition)

  const filteredConditions = useMemo(() => {
    const query = searchQuery.toLowerCase().trim()
    if (!query) return [...CONDITIONS]
    return CONDITIONS.filter((c) =>
      getConditionDisplayName(c).toLowerCase().includes(query) ||
      CONDITION_SHORT_DESCRIPTIONS[c].toLowerCase().includes(query),
    )
  }, [searchQuery])

  const handleAddCondition = (condition: Condition) => {
    if (condition === 'exhaustion') {
      onSetExhaustion(exhaustionLevel + 1)
      return
    }
    if (isActive(condition)) return
    onAdd({
      condition,
      source: selectedSource || undefined,
      duration: selectedDuration || undefined,
    })
    setSelectedSource('')
    setSelectedDuration('')
  }

  const handleToggle = (condition: Condition) => {
    if (condition === 'exhaustion') return
    if (isActive(condition)) {
      onRemove(condition)
    } else {
      handleAddCondition(condition)
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
      data-testid="add-condition-modal"
      role="dialog"
      aria-label="Add condition"
      aria-modal="true"
    >
      <div className="bg-surface-dark border border-parchment/20 rounded-xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-parchment/10">
          <h2 className="text-lg font-semibold text-parchment">
            Add Condition
          </h2>
          <button
            type="button"
            className="text-parchment/50 hover:text-parchment transition-colors"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Search */}
        <div className="px-4 py-3 border-b border-parchment/10">
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-parchment/40"
            />
            <input
              type="text"
              placeholder="Search conditions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-surface-darker border border-parchment/20 rounded-lg text-sm text-parchment placeholder:text-parchment/40 focus:outline-none focus:border-parchment/40"
              data-testid="condition-search-input"
            />
          </div>
        </div>

        {/* Optional source/duration */}
        <div className="px-4 py-2 border-b border-parchment/10 flex gap-2">
          <input
            type="text"
            placeholder="Source (optional)"
            value={selectedSource}
            onChange={(e) => setSelectedSource(e.target.value)}
            className="flex-1 px-3 py-1.5 bg-surface-darker border border-parchment/20 rounded text-xs text-parchment placeholder:text-parchment/40 focus:outline-none focus:border-parchment/40"
            data-testid="condition-source-input"
          />
          <input
            type="text"
            placeholder="Duration (optional)"
            value={selectedDuration}
            onChange={(e) => setSelectedDuration(e.target.value)}
            className="flex-1 px-3 py-1.5 bg-surface-darker border border-parchment/20 rounded text-xs text-parchment placeholder:text-parchment/40 focus:outline-none focus:border-parchment/40"
            data-testid="condition-duration-input"
          />
        </div>

        {/* Quick-add */}
        {!searchQuery && (
          <div className="px-4 py-2 border-b border-parchment/10">
            <p className="text-xs text-parchment/50 mb-1.5">Quick add:</p>
            <div className="flex flex-wrap gap-1.5">
              {COMMON_CONDITIONS.map((condition) => {
                const active = isActive(condition)
                return (
                  <button
                    key={condition}
                    type="button"
                    className={cn(
                      'text-xs px-2 py-0.5 rounded-full border transition-colors',
                      active
                        ? 'opacity-50 cursor-default'
                        : 'cursor-pointer hover:opacity-80',
                      getConditionBadgeClasses(condition),
                    )}
                    onClick={() => handleToggle(condition)}
                    disabled={active}
                    data-testid={`quick-add-${condition}`}
                  >
                    {getConditionDisplayName(condition)}
                    {active && ' (active)'}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Condition list */}
        <div className="flex-1 overflow-y-auto px-4 py-2" role="list">
          {filteredConditions.map((condition) => {
            const Icon = ICON_COMPONENTS[condition]
            const active = isActive(condition)
            const isExhaustion = condition === 'exhaustion'

            return (
              <div
                key={condition}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1',
                  'transition-colors',
                  !isExhaustion && active
                    ? 'bg-parchment/5 opacity-60'
                    : 'hover:bg-parchment/5 cursor-pointer',
                )}
                role="listitem"
                data-testid={`condition-option-${condition}`}
                onClick={() => {
                  if (!isExhaustion) handleToggle(condition)
                }}
              >
                <div
                  className={cn(
                    'flex items-center justify-center w-8 h-8 rounded-full',
                    getConditionBadgeClasses(condition),
                  )}
                >
                  <Icon size={16} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-parchment">
                      {getConditionDisplayName(condition)}
                    </span>
                    {!isExhaustion && active && (
                      <span
                        className="text-xs text-parchment/40"
                        data-testid={`already-active-${condition}`}
                      >
                        Already active
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-parchment/60 truncate">
                    {CONDITION_SHORT_DESCRIPTIONS[condition]}
                  </p>
                </div>

                {isExhaustion ? (
                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      className="w-6 h-6 flex items-center justify-center rounded border border-parchment/30 text-parchment/60 hover:text-parchment hover:border-parchment/50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      onClick={() => onSetExhaustion(exhaustionLevel - 1)}
                      disabled={exhaustionLevel <= 0}
                      aria-label="Decrement exhaustion"
                      data-testid="exhaustion-decrement"
                    >
                      <Minus size={12} />
                    </button>
                    <span
                      className={cn(
                        'text-sm font-mono font-bold min-w-[1.25rem] text-center',
                        exhaustionLevel >= 4 ? 'text-red-400' : 'text-parchment',
                      )}
                      data-testid="exhaustion-level-display"
                    >
                      {exhaustionLevel}
                    </span>
                    <button
                      type="button"
                      className="w-6 h-6 flex items-center justify-center rounded border border-parchment/30 text-parchment/60 hover:text-parchment hover:border-parchment/50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      onClick={() => onSetExhaustion(exhaustionLevel + 1)}
                      disabled={exhaustionLevel >= 6}
                      aria-label="Increment exhaustion"
                      data-testid="exhaustion-increment"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                ) : (
                  !active && (
                    <button
                      type="button"
                      className="text-parchment/40 hover:text-parchment transition-colors"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleAddCondition(condition)
                      }}
                      aria-label={`Add ${getConditionDisplayName(condition)}`}
                    >
                      <Plus size={16} />
                    </button>
                  )
                )}
              </div>
            )
          })}

          {filteredConditions.length === 0 && (
            <p className="text-sm text-parchment/40 text-center py-8">
              No conditions match your search.
            </p>
          )}

          {/* Exhaustion cumulative effects */}
          {exhaustionLevel > 0 && (
            <div
              className="mt-3 px-3 py-2 rounded-lg bg-orange-500/5 border border-orange-500/20"
              data-testid="exhaustion-effects-summary"
            >
              <p className="text-xs font-medium text-orange-400 mb-1">
                Current Exhaustion Effects (Level {exhaustionLevel}):
              </p>
              <ul className="text-xs text-parchment/70 space-y-0.5">
                {getExhaustionEffects(exhaustionLevel).map((effect: string, i: number) => (
                  <li key={i}>
                    Level {i + 1}: {effect}
                  </li>
                ))}
              </ul>
              {exhaustionLevel >= 6 && (
                <p
                  className="mt-2 text-xs font-bold text-red-500"
                  data-testid="exhaustion-death-warning-modal"
                  role="alert"
                >
                  Your character dies from exhaustion!
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
