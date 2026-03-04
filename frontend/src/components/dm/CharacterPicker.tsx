import { useState } from 'react'
import { X, UserPlus, Plus, Check, AlertTriangle } from 'lucide-react'
import type { CharacterSummary } from '@/types/character'
import { CHARACTER_WARNING_THRESHOLD, CHARACTER_SOFT_CAP } from '@/utils/campaign'

interface CharacterPickerProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (characterIds: string[]) => void
  characters: CharacterSummary[]
  currentCharacterCount: number
  isSubmitting?: boolean
}

export function CharacterPicker({
  isOpen,
  onClose,
  onSelect,
  characters,
  currentCharacterCount,
  isSubmitting = false,
}: CharacterPickerProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const toggleCharacter = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const handleSubmit = () => {
    onSelect(Array.from(selectedIds))
    setSelectedIds(new Set())
  }

  const totalAfterAdd = currentCharacterCount + selectedIds.size
  const showWarning = totalAfterAdd >= CHARACTER_WARNING_THRESHOLD
  const overCap = totalAfterAdd > CHARACTER_SOFT_CAP

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div
        className="bg-bg-secondary rounded-lg border-2 border-parchment/20 w-full max-w-md max-h-[80vh] flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-label="Add Characters"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-parchment/10">
          <h2 className="font-heading text-xl text-accent-gold flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Add Characters
          </h2>
          <button
            onClick={onClose}
            className="text-parchment/60 hover:text-parchment transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Warning */}
        {showWarning && (
          <div className="mx-4 mt-3 p-3 rounded-lg bg-amber-900/20 border border-amber-500/30 flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-200">
              {overCap
                ? `Adding these characters would exceed the recommended limit of ${CHARACTER_SOFT_CAP} characters per campaign.`
                : `Your campaign is approaching the recommended limit of ${CHARACTER_SOFT_CAP} characters.`}
            </p>
          </div>
        )}

        {/* Character List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {characters.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-parchment/60 mb-4">
                No available characters to add.
              </p>
              <button
                type="button"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-accent-gold/40 text-accent-gold text-sm hover:bg-accent-gold/10 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Create New Character
              </button>
            </div>
          ) : (
            characters.map((character) => {
              const isSelected = selectedIds.has(character.id)
              return (
                <button
                  key={character.id}
                  onClick={() => toggleCharacter(character.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-colors text-left ${
                    isSelected
                      ? 'border-accent-gold bg-accent-gold/10'
                      : 'border-parchment/10 hover:border-parchment/30 bg-bg-primary'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded border flex items-center justify-center ${
                      isSelected
                        ? 'bg-accent-gold border-accent-gold'
                        : 'border-parchment/30'
                    }`}
                  >
                    {isSelected && (
                      <Check className="w-3.5 h-3.5 text-bg-primary" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-parchment truncate">
                      {character.name}
                    </p>
                    <p className="text-xs text-parchment/60">
                      Level {character.level} {character.race} {character.class}
                    </p>
                  </div>
                </button>
              )
            })
          )}
        </div>

        {/* Footer */}
        {characters.length > 0 && (
          <div className="flex items-center justify-between p-4 border-t border-parchment/10">
            <span className="text-sm text-parchment/60">
              {selectedIds.size} selected
            </span>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg border border-parchment/20 text-sm text-parchment hover:bg-parchment/10 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={selectedIds.size === 0 || isSubmitting}
                className="px-4 py-2 rounded-lg bg-accent-gold text-bg-primary text-sm font-semibold hover:bg-accent-gold/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? 'Adding...' : 'Add to Campaign'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
