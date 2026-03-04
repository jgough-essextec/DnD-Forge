// =============================================================================
// Story 11.2 -- StandardArrayAssigner
// Drag-and-drop (plus click-to-assign fallback) for assigning Standard Array
// values [15, 14, 13, 12, 10, 8] to the six abilities.
// =============================================================================

import { useState, useCallback, useMemo } from 'react'
import {
  DndContext,
  DragOverlay,
  useDraggable,
  useDroppable,
  closestCenter,
  type DragEndEvent,
  type DragStartEvent,
  PointerSensor,
  KeyboardSensor,
  useSensors,
  useSensor,
} from '@dnd-kit/core'
import type { AbilityScores, AbilityName } from '@/types/core'
import { ABILITY_NAMES } from '@/types/core'
import { STANDARD_ARRAY } from '@/data/reference'
import { getModifier } from '@/utils/calculations/ability'
import { cn } from '@/lib/utils'

interface StandardArrayAssignerProps {
  scores: AbilityScores
  onScoresChange: (scores: AbilityScores) => void
  racialBonuses: Partial<AbilityScores>
}

const ABILITY_LABELS: Record<AbilityName, string> = {
  strength: 'STR',
  dexterity: 'DEX',
  constitution: 'CON',
  intelligence: 'INT',
  wisdom: 'WIS',
  charisma: 'CHA',
}

function formatModifier(mod: number): string {
  return mod >= 0 ? `+${mod}` : `${mod}`
}

// -- Draggable Score Chip --

function DraggableScoreChip({
  value,
  isSelected,
  onSelect,
  isDragging,
}: {
  value: number
  isSelected: boolean
  onSelect: () => void
  isDragging?: boolean
}) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: `score-${value}`,
    data: { value },
  })

  const style = transform
    ? { transform: `translate(${transform.x}px, ${transform.y}px)` }
    : undefined

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={style}
      onClick={(e) => {
        e.stopPropagation()
        onSelect()
      }}
      data-testid={`score-chip-${value}`}
      className={cn(
        'flex items-center justify-center w-14 h-14 rounded-lg',
        'text-xl font-bold font-heading cursor-grab active:cursor-grabbing',
        'border-2 transition-all select-none',
        isSelected
          ? 'border-accent-gold bg-accent-gold/20 text-accent-gold shadow-[0_0_12px_rgba(232,180,48,0.3)]'
          : 'border-parchment/30 bg-bg-secondary text-parchment hover:border-parchment/50',
        isDragging && 'opacity-50',
      )}
    >
      {value}
    </div>
  )
}

// -- Score Chip for DragOverlay --

function ScoreChipOverlay({ value }: { value: number }) {
  return (
    <div
      className={cn(
        'flex items-center justify-center w-14 h-14 rounded-lg',
        'text-xl font-bold font-heading',
        'border-2 border-accent-gold bg-accent-gold/20 text-accent-gold',
        'shadow-[0_0_16px_rgba(232,180,48,0.4)]',
      )}
    >
      {value}
    </div>
  )
}

// -- Droppable Ability Slot --

function AbilitySlot({
  ability,
  assignedScore,
  racialBonus,
  isHighlighted,
  onAssign,
  onClearSlot,
}: {
  ability: AbilityName
  assignedScore: number
  racialBonus: number
  isHighlighted: boolean
  onAssign: () => void
  onClearSlot: () => void
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `slot-${ability}`,
    data: { ability },
  })

  const totalScore = assignedScore + racialBonus
  const modifier = assignedScore > 0 ? getModifier(totalScore) : null

  return (
    <div
      ref={setNodeRef}
      onClick={onAssign}
      data-testid={`ability-slot-${ability}`}
      className={cn(
        'flex items-center justify-between p-3 rounded-lg border-2 transition-all min-h-[56px]',
        'cursor-pointer',
        isOver
          ? 'border-accent-gold bg-accent-gold/10'
          : isHighlighted
            ? 'border-accent-gold/50 bg-accent-gold/5'
            : assignedScore > 0
              ? 'border-parchment/30 bg-bg-secondary'
              : 'border-dashed border-parchment/20 bg-bg-secondary/50',
      )}
    >
      <div className="flex items-center gap-3">
        <span className="text-sm font-semibold text-parchment/60 uppercase tracking-wider w-8">
          {ABILITY_LABELS[ability]}
        </span>

        {assignedScore > 0 ? (
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-parchment">
              {assignedScore}
            </span>
            {racialBonus !== 0 && (
              <span className="text-xs text-accent-gold/80" data-testid={`racial-bonus-${ability}`}>
                {racialBonus > 0 ? '+' : ''}{racialBonus}
              </span>
            )}
            {racialBonus !== 0 && (
              <span className="text-sm text-parchment/50">= {totalScore}</span>
            )}
          </div>
        ) : (
          <span className="text-sm text-parchment/30 italic">Not assigned</span>
        )}
      </div>

      <div className="flex items-center gap-2">
        {modifier !== null && (
          <span
            className={cn(
              'text-sm font-mono font-semibold px-2 py-0.5 rounded',
              modifier >= 0 ? 'text-emerald-400 bg-emerald-400/10' : 'text-red-400 bg-red-400/10',
            )}
          >
            {formatModifier(modifier)}
          </span>
        )}
        {assignedScore > 0 && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onClearSlot()
            }}
            className="text-xs text-parchment/30 hover:text-parchment/60 transition-colors px-1"
            aria-label={`Clear ${ability} assignment`}
          >
            x
          </button>
        )}
      </div>
    </div>
  )
}

export function StandardArrayAssigner({
  scores,
  onScoresChange,
  racialBonuses,
}: StandardArrayAssignerProps) {
  const [selectedChip, setSelectedChip] = useState<number | null>(null)
  const [activeDragValue, setActiveDragValue] = useState<number | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(KeyboardSensor),
  )

  // Compute which standard array values are still in the pool (unassigned)
  const assignedValues = useMemo(() => {
    return ABILITY_NAMES.map((a) => scores[a]).filter((v) => v > 0)
  }, [scores])

  const poolValues = useMemo(() => {
    const used = [...assignedValues]
    return [...STANDARD_ARRAY].filter((v) => {
      const idx = used.indexOf(v)
      if (idx >= 0) {
        used.splice(idx, 1)
        return false
      }
      return true
    })
  }, [assignedValues])

  const assignedCount = ABILITY_NAMES.filter((a) => scores[a] > 0).length

  // Assign a value to an ability, with swap support
  const assignValue = useCallback(
    (ability: AbilityName, value: number) => {
      const newScores = { ...scores }

      // If this slot already has a value, put it back to the pool
      // If the value being assigned was in another slot, clear that slot
      const currentSlotValue = newScores[ability]

      // Find if the new value is in another slot
      const sourceSlot = ABILITY_NAMES.find(
        (a) => a !== ability && newScores[a] === value,
      )

      if (sourceSlot) {
        // Swap: put the current slot's value into the source slot
        newScores[sourceSlot] = currentSlotValue
      }

      newScores[ability] = value
      onScoresChange(newScores)
    },
    [scores, onScoresChange],
  )

  const clearSlot = useCallback(
    (ability: AbilityName) => {
      const newScores = { ...scores }
      newScores[ability] = 0
      onScoresChange(newScores)
    },
    [scores, onScoresChange],
  )

  const resetAll = useCallback(() => {
    onScoresChange({
      strength: 0,
      dexterity: 0,
      constitution: 0,
      intelligence: 0,
      wisdom: 0,
      charisma: 0,
    })
    setSelectedChip(null)
  }, [onScoresChange])

  // Click-to-assign: click a chip to select it, then click a slot to assign
  const handleChipSelect = useCallback(
    (value: number) => {
      setSelectedChip((prev) => (prev === value ? null : value))
    },
    [],
  )

  const handleSlotClick = useCallback(
    (ability: AbilityName) => {
      if (selectedChip !== null) {
        assignValue(ability, selectedChip)
        setSelectedChip(null)
      }
    },
    [selectedChip, assignValue],
  )

  // Drag-and-drop handlers
  const handleDragStart = useCallback((event: DragStartEvent) => {
    const value = event.active.data.current?.value as number | undefined
    if (value !== undefined) {
      setActiveDragValue(value)
    }
  }, [])

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveDragValue(null)
      const { active, over } = event

      if (!over) return

      const value = active.data.current?.value as number | undefined
      const ability = over.data.current?.ability as AbilityName | undefined

      if (value !== undefined && ability !== undefined) {
        assignValue(ability, value)
      }
    },
    [assignValue],
  )

  return (
    <div className="space-y-4" data-testid="standard-array-assigner">
      {/* Completion indicator */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-parchment/60" data-testid="completion-indicator">
          {assignedCount} of 6 assigned
        </span>
        <button
          onClick={resetAll}
          className={cn(
            'text-sm px-3 py-1 rounded-md',
            'text-parchment/50 hover:text-parchment',
            'border border-parchment/20 hover:border-parchment/40',
            'transition-colors',
          )}
          data-testid="reset-button"
        >
          Reset
        </button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        {/* Score Pool */}
        <div className="mb-4">
          <p className="text-xs text-parchment/50 mb-2 uppercase tracking-wider">
            Available Scores
          </p>
          <div className="flex flex-wrap gap-2" data-testid="score-pool">
            {poolValues.map((value, idx) => (
              <DraggableScoreChip
                key={`pool-${value}-${idx}`}
                value={value}
                isSelected={selectedChip === value}
                onSelect={() => handleChipSelect(value)}
                isDragging={activeDragValue === value}
              />
            ))}
            {poolValues.length === 0 && (
              <span className="text-sm text-parchment/30 italic py-4">
                All values assigned
              </span>
            )}
          </div>
        </div>

        {/* Ability Slots */}
        <div className="space-y-2" data-testid="ability-slots">
          {ABILITY_NAMES.map((ability) => (
            <AbilitySlot
              key={ability}
              ability={ability}
              assignedScore={scores[ability]}
              racialBonus={racialBonuses[ability] ?? 0}
              isHighlighted={selectedChip !== null && scores[ability] === 0}
              onAssign={() => handleSlotClick(ability)}
              onClearSlot={() => clearSlot(ability)}
            />
          ))}
        </div>

        {/* Drag Overlay */}
        <DragOverlay>
          {activeDragValue !== null && (
            <ScoreChipOverlay value={activeDragValue} />
          )}
        </DragOverlay>
      </DndContext>
    </div>
  )
}
