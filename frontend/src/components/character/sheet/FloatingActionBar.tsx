/**
 * FloatingActionBar (Story 24.3)
 *
 * Fixed bottom bar on mobile with quick-action buttons:
 * - Roll d20
 * - HP +/-
 * - Spell Slots
 * - Edit toggle
 *
 * Only visible on mobile (<640px). Hidden in print.
 */

import { useState } from 'react'
import { Dices, HeartPulse, Sparkles, Pencil, Eye, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCharacterSheet } from '@/components/character/CharacterSheetProvider'

export function FloatingActionBar() {
  const { editMode, character, editableCharacter, updateField } = useCharacterSheet()
  const [d20Result, setD20Result] = useState<number | null>(null)
  const [showHpModal, setShowHpModal] = useState(false)
  const [hpDelta, setHpDelta] = useState('')

  const displayCharacter = character ? { ...character, ...editableCharacter } : null

  const handleRollD20 = () => {
    const roll = Math.floor(Math.random() * 20) + 1
    setD20Result(roll)
    setTimeout(() => setD20Result(null), 3000)
  }

  const handleHpChange = (mode: 'damage' | 'heal') => {
    if (!displayCharacter) return
    const amount = parseInt(hpDelta) || 0
    if (amount <= 0) return

    if (mode === 'damage') {
      let remaining = amount
      let newTempHp = displayCharacter.tempHp
      if (newTempHp > 0) {
        if (remaining >= newTempHp) {
          remaining -= newTempHp
          newTempHp = 0
        } else {
          newTempHp -= remaining
          remaining = 0
        }
        updateField('tempHp', newTempHp)
      }
      if (remaining > 0) {
        updateField('hpCurrent', Math.max(0, displayCharacter.hpCurrent - remaining))
      }
    } else {
      const hpMax = displayCharacter.hpMax
      updateField('hpCurrent', Math.min(hpMax, displayCharacter.hpCurrent + amount))
    }

    setHpDelta('')
    setShowHpModal(false)
  }

  return (
    <>
      {/* Floating bar - mobile only */}
      <div
        className="fixed bottom-0 left-0 right-0 z-40 sm:hidden print:hidden pb-[env(safe-area-inset-bottom)]"
        data-testid="floating-action-bar"
      >
        <div className="flex items-stretch border-t border-parchment/20 bg-bg-primary/95 backdrop-blur-sm">
          {/* Roll d20 */}
          <button
            onClick={handleRollD20}
            className="flex flex-1 flex-col items-center justify-center gap-1 py-3 min-h-[56px] touch-manipulation text-parchment/70 hover:text-accent-gold transition-colors relative"
            aria-label="Roll d20"
          >
            <Dices className="h-5 w-5" />
            <span className="text-[10px]">Roll d20</span>
            {d20Result !== null && (
              <span className="absolute -top-2 right-1/4 rounded-full bg-accent-gold px-2 py-0.5 text-xs font-bold text-bg-primary">
                {d20Result}
              </span>
            )}
          </button>

          {/* HP +/- */}
          <button
            onClick={() => setShowHpModal(true)}
            className="flex flex-1 flex-col items-center justify-center gap-1 py-3 min-h-[56px] touch-manipulation text-parchment/70 hover:text-damage-red transition-colors"
            aria-label="Adjust hit points"
          >
            <HeartPulse className="h-5 w-5" />
            <span className="text-[10px]">HP +/-</span>
          </button>

          {/* Spell Slots placeholder */}
          <button
            className="flex flex-1 flex-col items-center justify-center gap-1 py-3 min-h-[56px] touch-manipulation text-parchment/70 hover:text-spell-blue transition-colors"
            aria-label="Spell slots"
          >
            <Sparkles className="h-5 w-5" />
            <span className="text-[10px]">Spells</span>
          </button>

          {/* Edit toggle */}
          <button
            onClick={() => {
              if (editMode.isEditing) {
                editMode.exitEditMode()
              } else {
                editMode.enterEditMode()
              }
            }}
            className={cn(
              'flex flex-1 flex-col items-center justify-center gap-1 py-3 min-h-[56px] touch-manipulation transition-colors',
              editMode.isEditing
                ? 'text-accent-gold'
                : 'text-parchment/70 hover:text-parchment'
            )}
            aria-label={editMode.isEditing ? 'Switch to view mode' : 'Switch to edit mode'}
          >
            {editMode.isEditing ? (
              <Eye className="h-5 w-5" />
            ) : (
              <Pencil className="h-5 w-5" />
            )}
            <span className="text-[10px]">{editMode.isEditing ? 'View' : 'Edit'}</span>
          </button>
        </div>
      </div>

      {/* HP adjustment modal */}
      {showHpModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 print:hidden">
          <div className="w-full max-w-sm rounded-t-xl sm:rounded-xl border border-parchment/20 bg-bg-secondary p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-heading text-parchment">Adjust HP</h3>
              <button
                onClick={() => {
                  setShowHpModal(false)
                  setHpDelta('')
                }}
                className="p-1 rounded text-parchment/60 hover:text-parchment min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <input
              type="number"
              inputMode="numeric"
              value={hpDelta}
              onChange={(e) => setHpDelta(e.target.value)}
              placeholder="Amount"
              className="w-full rounded border border-parchment/30 bg-bg-primary px-3 py-2.5 text-parchment focus:border-accent-gold focus:outline-none min-h-[44px]"
              autoFocus
              data-testid="hp-delta-input"
            />
            <div className="flex gap-2">
              <button
                onClick={() => handleHpChange('damage')}
                className="flex-1 rounded bg-damage-red py-2.5 text-white font-medium hover:bg-damage-red/80 transition-colors min-h-[44px]"
              >
                Damage
              </button>
              <button
                onClick={() => handleHpChange('heal')}
                className="flex-1 rounded bg-healing-green py-2.5 text-white font-medium hover:bg-healing-green/80 transition-colors min-h-[44px]"
              >
                Heal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom padding to prevent content from being hidden behind the floating bar on mobile */}
      <div className="h-16 sm:hidden print:hidden" />
    </>
  )
}
