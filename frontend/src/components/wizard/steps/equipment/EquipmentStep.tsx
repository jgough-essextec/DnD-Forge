/**
 * EquipmentStep (Story 13.1, 13.2, 13.3)
 *
 * Main Step 5 component for the character creation wizard.
 * Provides two modes:
 *   1. Starting Equipment (default) - Choose from class starting equipment options
 *   2. Gold Buy - Roll starting gold and buy equipment from the catalog
 *
 * Includes equipment summary panel showing AC preview, weight/encumbrance,
 * and weapons list. Validates selections and persists to wizard store.
 */

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Swords, Coins } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useWizardStore } from '@/stores/wizardStore'
import { getClassById } from '@/data/classes'
import { StepHelp } from '@/components/shared/StepHelp'
import type { WizardStepProps, StepValidation } from '@/components/wizard/types'
import type { InventoryItem } from '@/types/equipment'
import {
  StartingEquipmentSelector,
  resolveStartingEquipment,
} from './StartingEquipmentSelector'
import type { ChoiceSelections } from './StartingEquipmentSelector'
import { GoldBuyMode, getCartTotal, cartToInventoryItems } from './GoldBuyMode'
import type { GoldBuyState } from './GoldBuyMode'
import { EquipmentSummary } from './EquipmentSummary'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type EquipmentMode = 'starting-equipment' | 'gold-buy'

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

/** Validate the equipment step selections */
export function validateEquipmentStep(
  mode: EquipmentMode,
  startingSelections: ChoiceSelections,
  goldBuyState: GoldBuyState,
  classId: string | null,
): StepValidation {
  const errors: string[] = []

  if (!classId) {
    return { valid: false, errors: ['No class selected. Please choose a class first.'] }
  }

  if (mode === 'starting-equipment') {
    const cls = getClassById(classId)
    if (!cls) {
      return { valid: false, errors: ['Invalid class selection.'] }
    }

    // Check each choice group has a selection
    cls.startingEquipment.forEach((choice, index) => {
      if (choice.options.length > 1 && startingSelections.choices[index] === undefined) {
        errors.push(`${choice.description}: Please make a selection.`)
      }

      // Check generic picks are resolved
      if (startingSelections.choices[index] !== undefined) {
        const selectedOption = choice.options[startingSelections.choices[index]]
        if (selectedOption) {
          selectedOption.forEach((item) => {
            const qtyMatch = item.match(/^(\d+)\s+(.+)$/)
            const nameText = qtyMatch ? qtyMatch[2] : item
            if (nameText.toLowerCase().startsWith('any ')) {
              const key = `${index}-${nameText}`
              if (!startingSelections.specificItems[key]) {
                errors.push(`${choice.description}: Please choose a specific item for "${nameText}".`)
              }
            }
          })
        }
      }
    })
  } else {
    // Gold buy mode
    if (goldBuyState.gold === null) {
      errors.push('Please roll or enter your starting gold.')
    } else if (goldBuyState.cart.length === 0) {
      errors.push('Please purchase at least one item.')
    } else {
      const total = getCartTotal(goldBuyState.cart)
      if (total > goldBuyState.gold) {
        errors.push(`Total cost (${total.toFixed(0)} gp) exceeds available gold (${goldBuyState.gold} gp).`)
      }
    }
  }

  return { valid: errors.length === 0, errors }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Get the DEX modifier from ability scores */
function getAbilityModifier(score: number): number {
  return Math.floor((score - 10) / 2)
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function EquipmentStep({ onValidationChange }: WizardStepProps) {
  const classSelection = useWizardStore((s) => s.classSelection)
  const abilityScores = useWizardStore((s) => s.abilityScores)
  const setEquipment = useWizardStore((s) => s.setEquipment)

  const classId = classSelection?.classId ?? null
  const dexModifier = abilityScores ? getAbilityModifier(abilityScores.dexterity) : 0
  const strScore = abilityScores?.strength ?? 10

  const [mode, setMode] = useState<EquipmentMode>('starting-equipment')
  const [startingSelections, setStartingSelections] = useState<ChoiceSelections>({
    choices: {},
    specificItems: {},
  })
  const [goldBuyState, setGoldBuyState] = useState<GoldBuyState>({
    gold: null,
    goldSource: null,
    cart: [],
  })

  // Auto-select single-option choices for starting equipment
  useEffect(() => {
    if (!classId) return
    const cls = getClassById(classId)
    if (!cls) return

    const autoChoices: Record<number, number> = {}
    cls.startingEquipment.forEach((choice, index) => {
      if (choice.options.length === 1) {
        autoChoices[index] = 0
      }
    })

    if (Object.keys(autoChoices).length > 0) {
      setStartingSelections((prev) => ({
        ...prev,
        choices: { ...autoChoices, ...prev.choices },
      }))
    }
  }, [classId])

  // Resolve equipment and save to store
  const resolvedEquipment: InventoryItem[] = useMemo(() => {
    if (mode === 'starting-equipment' && classId) {
      return resolveStartingEquipment(classId, startingSelections)
    }
    if (mode === 'gold-buy') {
      return cartToInventoryItems(goldBuyState.cart)
    }
    return []
  }, [mode, classId, startingSelections, goldBuyState.cart])

  // Persist to store whenever equipment changes
  useEffect(() => {
    setEquipment(resolvedEquipment)
  }, [resolvedEquipment, setEquipment])

  // Validate and report
  const validation = useMemo(
    () => validateEquipmentStep(mode, startingSelections, goldBuyState, classId),
    [mode, startingSelections, goldBuyState, classId],
  )

  useEffect(() => {
    onValidationChange?.(validation)
  }, [validation, onValidationChange])

  const handleModeSwitch = useCallback((newMode: EquipmentMode) => {
    setMode(newMode)
  }, [])

  const remainingGold = useMemo(() => {
    if (mode !== 'gold-buy' || goldBuyState.gold === null) return null
    return goldBuyState.gold - getCartTotal(goldBuyState.cart)
  }, [mode, goldBuyState])

  return (
    <div className="space-y-6" data-testid="equipment-step">
      {/* Step Help */}
      <StepHelp
        stepName="equipment"
        helpText="Choose the equipment your character starts with. You can either pick from your class's starting equipment packages or roll for gold and buy items individually."
        tips={[
          'Starting equipment is the quickest option -- just pick from pre-set choices.',
          'Gold buy mode lets you customize exactly what you carry.',
          'Pay attention to weight -- heavy armor is great for AC but weighs a lot.',
          'Equipment packs bundle useful adventuring gear at a slight discount.',
        ]}
      />

      {/* Mode Toggle */}
      <div className="flex gap-2 p-1 rounded-lg bg-parchment/5 border border-parchment/10" role="tablist" aria-label="Equipment selection mode">
        <button
          role="tab"
          aria-selected={mode === 'starting-equipment'}
          onClick={() => handleModeSwitch('starting-equipment')}
          className={cn(
            'flex items-center gap-2 flex-1 px-4 py-2.5 rounded-md text-sm font-medium transition-all',
            mode === 'starting-equipment'
              ? 'bg-accent-gold/15 text-accent-gold shadow-sm'
              : 'text-parchment/50 hover:text-parchment/70',
          )}
        >
          <Swords className="h-4 w-4" />
          Starting Equipment
        </button>
        <button
          role="tab"
          aria-selected={mode === 'gold-buy'}
          onClick={() => handleModeSwitch('gold-buy')}
          className={cn(
            'flex items-center gap-2 flex-1 px-4 py-2.5 rounded-md text-sm font-medium transition-all',
            mode === 'gold-buy'
              ? 'bg-accent-gold/15 text-accent-gold shadow-sm'
              : 'text-parchment/50 hover:text-parchment/70',
          )}
        >
          <Coins className="h-4 w-4" />
          Roll for Gold
        </button>
      </div>

      {/* Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content (left 2 cols) */}
        <div className="lg:col-span-2">
          {mode === 'starting-equipment' ? (
            classId ? (
              <StartingEquipmentSelector
                classId={classId}
                selections={startingSelections}
                onSelectionsChange={setStartingSelections}
              />
            ) : (
              <div className="text-center py-12 text-parchment/50">
                <Swords className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Please select a class first to see starting equipment options.</p>
              </div>
            )
          ) : (
            classId ? (
              <GoldBuyMode
                classId={classId}
                state={goldBuyState}
                onStateChange={setGoldBuyState}
              />
            ) : (
              <div className="text-center py-12 text-parchment/50">
                <Coins className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Please select a class first to roll starting gold.</p>
              </div>
            )
          )}
        </div>

        {/* Equipment Summary (right col) */}
        <div className="lg:col-span-1">
          <EquipmentSummary
            equipment={resolvedEquipment}
            dexModifier={dexModifier}
            strScore={strScore}
            remainingGold={remainingGold}
            mode={mode}
          />
        </div>
      </div>

      {/* Validation Errors */}
      {validation.errors.length > 0 && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-3 space-y-1" role="alert">
          {validation.errors.map((error, index) => (
            <p key={index} className="text-xs text-red-400">
              {error}
            </p>
          ))}
        </div>
      )}
    </div>
  )
}
