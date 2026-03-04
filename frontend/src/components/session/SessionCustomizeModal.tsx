/**
 * SessionCustomizeModal (Epic 32 - Story 32.2)
 *
 * Modal for customizing the session view per character.
 * Allows pinning up to 8 skills/saves from 24 options (18 skills + 6 saves)
 * grouped by ability score. Shows pin count and enforces the limit.
 */

import { useState, useCallback } from 'react'
import { X, Star } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  getPinnableOptions,
  MAX_PINNED_SKILLS,
  type SessionViewConfig,
} from '@/utils/session-view'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface SessionCustomizeModalProps {
  isOpen: boolean
  onClose: () => void
  config: SessionViewConfig
  onSave: (config: SessionViewConfig) => void
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function SessionCustomizeModal({
  isOpen,
  onClose,
  config,
  onSave,
}: SessionCustomizeModalProps) {
  const [pinnedSkills, setPinnedSkills] = useState<string[]>(config.pinnedSkills)
  const [showSpellSlots, setShowSpellSlots] = useState(config.showSpellSlots)
  const [showConditions, setShowConditions] = useState(config.showConditions)
  const [showFeatureUses, setShowFeatureUses] = useState(config.showFeatureUses)

  const pinnableGroups = getPinnableOptions()

  const togglePin = useCallback((id: string) => {
    setPinnedSkills((prev) => {
      if (prev.includes(id)) {
        return prev.filter((s) => s !== id)
      }
      if (prev.length >= MAX_PINNED_SKILLS) {
        return prev
      }
      return [...prev, id]
    })
  }, [])

  const handleSave = useCallback(() => {
    onSave({
      pinnedSkills,
      showSpellSlots,
      showConditions,
      showFeatureUses,
    })
    onClose()
  }, [pinnedSkills, showSpellSlots, showConditions, showFeatureUses, onSave, onClose])

  if (!isOpen) return null

  const pinCount = pinnedSkills.length
  const atMax = pinCount >= MAX_PINNED_SKILLS

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
      data-testid="session-customize-modal"
      role="dialog"
      aria-modal="true"
      aria-label="Customize Session View"
    >
      <div className="bg-bg-secondary border border-parchment/20 rounded-xl shadow-2xl w-full max-w-md max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-parchment/10">
          <h2 className="text-lg font-heading font-bold text-parchment">
            Customize Session View
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded hover:bg-parchment/10 text-parchment/50 hover:text-parchment transition-colors"
            aria-label="Close"
            data-testid="close-customize-modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pin count */}
        <div className="px-4 py-2 bg-bg-primary/50 border-b border-parchment/10">
          <span
            className={cn(
              'text-sm font-medium',
              atMax ? 'text-damage-red' : 'text-parchment/70',
            )}
            data-testid="pin-count"
          >
            {pinCount}/{MAX_PINNED_SKILLS} pinned
          </span>
        </div>

        {/* Scrollable skill list */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
          {/* Pinned Skills Section */}
          <div>
            <h3 className="text-xs font-semibold text-parchment/50 uppercase tracking-wider mb-2">
              Pinned Skills & Saves
            </h3>

            {pinnableGroups.map((group) => (
              <div key={group.ability} className="mb-3">
                <h4
                  className="text-xs font-bold text-accent-gold/80 mb-1"
                  data-testid={`group-${group.ability}`}
                >
                  {group.label}
                </h4>
                <div className="space-y-0.5">
                  {group.options.map((option) => {
                    const isPinned = pinnedSkills.includes(option.id)
                    const isDisabled = !isPinned && atMax
                    return (
                      <label
                        key={option.id}
                        className={cn(
                          'flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer',
                          'hover:bg-parchment/5 transition-colors min-h-[36px]',
                          isDisabled && 'opacity-40 cursor-not-allowed',
                        )}
                        data-testid={`pin-option-${option.id}`}
                      >
                        <input
                          type="checkbox"
                          checked={isPinned}
                          onChange={() => togglePin(option.id)}
                          disabled={isDisabled}
                          className="sr-only"
                          aria-label={`Pin ${option.label}`}
                        />
                        <Star
                          className={cn(
                            'w-4 h-4 flex-shrink-0 transition-colors',
                            isPinned
                              ? 'text-accent-gold fill-accent-gold'
                              : 'text-parchment/30',
                          )}
                          aria-hidden="true"
                        />
                        <span
                          className={cn(
                            'text-sm',
                            isPinned ? 'text-parchment font-medium' : 'text-parchment/60',
                          )}
                        >
                          {option.label}
                        </span>
                        <span className="text-[10px] text-parchment/30 ml-auto">
                          {option.type}
                        </span>
                      </label>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Display toggles */}
          <div className="border-t border-parchment/10 pt-3">
            <h3 className="text-xs font-semibold text-parchment/50 uppercase tracking-wider mb-2">
              Display Options
            </h3>
            <div className="space-y-2">
              <label className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-parchment/5 cursor-pointer min-h-[36px]">
                <input
                  type="checkbox"
                  checked={showSpellSlots}
                  onChange={(e) => setShowSpellSlots(e.target.checked)}
                  className="rounded border-parchment/30 bg-bg-primary text-accent-gold focus:ring-accent-gold/50"
                  data-testid="toggle-spell-slots"
                />
                <span className="text-sm text-parchment/80">Show Spell Slots</span>
              </label>
              <label className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-parchment/5 cursor-pointer min-h-[36px]">
                <input
                  type="checkbox"
                  checked={showConditions}
                  onChange={(e) => setShowConditions(e.target.checked)}
                  className="rounded border-parchment/30 bg-bg-primary text-accent-gold focus:ring-accent-gold/50"
                  data-testid="toggle-conditions"
                />
                <span className="text-sm text-parchment/80">Show Conditions</span>
              </label>
              <label className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-parchment/5 cursor-pointer min-h-[36px]">
                <input
                  type="checkbox"
                  checked={showFeatureUses}
                  onChange={(e) => setShowFeatureUses(e.target.checked)}
                  className="rounded border-parchment/30 bg-bg-primary text-accent-gold focus:ring-accent-gold/50"
                  data-testid="toggle-feature-uses"
                />
                <span className="text-sm text-parchment/80">Show Feature Uses</span>
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-2 px-4 py-3 border-t border-parchment/10">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2 rounded-lg border border-parchment/20 text-parchment/60 text-sm hover:bg-parchment/5 transition-colors min-h-[44px]"
            data-testid="cancel-customize"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex-1 py-2 rounded-lg bg-accent-gold/20 border border-accent-gold/30 text-accent-gold text-sm font-semibold hover:bg-accent-gold/30 transition-colors min-h-[44px]"
            data-testid="save-customize"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}
