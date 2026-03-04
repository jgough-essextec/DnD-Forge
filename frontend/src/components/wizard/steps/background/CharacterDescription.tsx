/**
 * CharacterDescription -- Character identity and description fields.
 *
 * Alignment selector (3x3 grid), physical description fields,
 * backstory textarea, and appearance notes.
 */

import { useCallback } from 'react'
import { cn } from '@/lib/utils'
import type { Alignment } from '@/types/core'
import type { CharacterIdentity } from '@/types/background'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface DescriptionState {
  alignment: Alignment | null
  identity: CharacterIdentity
  backstory: string
  faith: string
}

interface CharacterDescriptionProps {
  description: DescriptionState
  onChange: (description: DescriptionState) => void
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Format an alignment value for display */
function formatAlignment(alignment: Alignment): string {
  if (alignment === 'true-neutral') return 'True Neutral'
  if (alignment === 'unaligned') return 'Unaligned'
  return alignment
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

/** Alignment grid layout (3x3 + unaligned) */
const ALIGNMENT_GRID: (Alignment | null)[][] = [
  ['lawful-good', 'neutral-good', 'chaotic-good'],
  ['lawful-neutral', 'true-neutral', 'chaotic-neutral'],
  ['lawful-evil', 'neutral-evil', 'chaotic-evil'],
]

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function CharacterDescription({
  description,
  onChange,
}: CharacterDescriptionProps) {
  const updateIdentity = useCallback(
    (field: keyof CharacterIdentity, value: string) => {
      onChange({
        ...description,
        identity: { ...description.identity, [field]: value },
      })
    },
    [description, onChange],
  )

  return (
    <div className="space-y-6">
      <h3 className="font-heading text-lg font-semibold text-parchment">
        Character Description
      </h3>

      {/* Alignment Selector */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-parchment">Alignment</label>
        <p className="text-xs text-parchment/50">
          Your character's moral and ethical outlook
        </p>
        <div
          className="grid grid-cols-3 gap-1.5 max-w-sm"
          role="radiogroup"
          aria-label="Alignment"
        >
          {ALIGNMENT_GRID.map((row, rowIndex) =>
            row.map((alignment) => {
              if (!alignment) return null
              const isSelected = description.alignment === alignment
              return (
                <button
                  key={alignment}
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() =>
                    onChange({
                      ...description,
                      alignment: isSelected ? null : alignment,
                    })
                  }
                  className={cn(
                    'px-2 py-2 rounded text-xs font-medium transition-all text-center',
                    'focus:outline-none focus:ring-1 focus:ring-accent-gold/50',
                    isSelected
                      ? 'bg-accent-gold/20 border-2 border-accent-gold text-accent-gold'
                      : 'bg-bg-secondary border-2 border-parchment/15 text-parchment/60 hover:border-parchment/30 hover:text-parchment/80',
                    // Color hints for the alignment axis
                    rowIndex === 0 && !isSelected && 'hover:bg-green-900/10',
                    rowIndex === 2 && !isSelected && 'hover:bg-red-900/10',
                  )}
                >
                  {formatAlignment(alignment)}
                </button>
              )
            }),
          )}
        </div>
        {/* Unaligned option */}
        <button
          role="radio"
          aria-checked={description.alignment === 'unaligned'}
          onClick={() =>
            onChange({
              ...description,
              alignment:
                description.alignment === 'unaligned' ? null : 'unaligned',
            })
          }
          className={cn(
            'px-3 py-1.5 rounded text-xs font-medium transition-all',
            'focus:outline-none focus:ring-1 focus:ring-accent-gold/50',
            description.alignment === 'unaligned'
              ? 'bg-accent-gold/20 border-2 border-accent-gold text-accent-gold'
              : 'bg-bg-secondary border-2 border-parchment/15 text-parchment/60 hover:border-parchment/30',
          )}
        >
          Unaligned
        </button>
      </div>

      {/* Physical Description Fields */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-parchment">Physical Description</h4>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <TextInputField
            label="Age"
            value={description.identity.age ?? ''}
            onChange={(v) => updateIdentity('age', v)}
            placeholder="e.g. 25, Young adult"
          />
          <TextInputField
            label="Height"
            value={description.identity.height ?? ''}
            onChange={(v) => updateIdentity('height', v)}
            placeholder={'e.g. 5\'10"'}
          />
          <TextInputField
            label="Weight"
            value={description.identity.weight ?? ''}
            onChange={(v) => updateIdentity('weight', v)}
            placeholder="e.g. 170 lbs"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <TextInputField
            label="Eyes"
            value={description.identity.eyes ?? ''}
            onChange={(v) => updateIdentity('eyes', v)}
            placeholder="e.g. Green"
          />
          <TextInputField
            label="Hair"
            value={description.identity.hair ?? ''}
            onChange={(v) => updateIdentity('hair', v)}
            placeholder="e.g. Brown, long"
          />
          <TextInputField
            label="Skin"
            value={description.identity.skin ?? ''}
            onChange={(v) => updateIdentity('skin', v)}
            placeholder="e.g. Fair"
          />
        </div>

        {/* Faith */}
        <TextInputField
          label="Faith / Deity (optional)"
          value={description.faith}
          onChange={(v) => onChange({ ...description, faith: v })}
          placeholder="e.g. Pelor, None"
        />
      </div>

      {/* Appearance Notes */}
      <div className="space-y-1.5">
        <label className="text-sm font-semibold text-parchment">
          Appearance Notes
        </label>
        <textarea
          value={description.identity.appearance ?? ''}
          onChange={(e) => updateIdentity('appearance', e.target.value)}
          placeholder="Describe your character's distinctive appearance, notable features, mannerisms..."
          rows={3}
          maxLength={1000}
          aria-label="Appearance notes"
          className={cn(
            'w-full rounded-lg border border-parchment/20 bg-bg-secondary px-3 py-2',
            'text-sm text-parchment placeholder:text-parchment/40 resize-y',
            'focus:outline-none focus:border-accent-gold/50 focus:ring-1 focus:ring-accent-gold/30',
          )}
        />
      </div>

      {/* Backstory */}
      <div className="space-y-1.5">
        <label className="text-sm font-semibold text-parchment">
          Backstory
        </label>
        <textarea
          value={description.backstory}
          onChange={(e) =>
            onChange({ ...description, backstory: e.target.value })
          }
          placeholder="Describe your character's background, history, and what drives them on their adventures..."
          rows={5}
          maxLength={2000}
          aria-label="Backstory"
          className={cn(
            'w-full rounded-lg border border-parchment/20 bg-bg-secondary px-3 py-2',
            'text-sm text-parchment placeholder:text-parchment/40 resize-y',
            'focus:outline-none focus:border-accent-gold/50 focus:ring-1 focus:ring-accent-gold/30',
          )}
        />
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// TextInputField -- Reusable labeled text input
// ---------------------------------------------------------------------------

function TextInputField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
}) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-parchment/70">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={label}
        className={cn(
          'w-full rounded-lg border border-parchment/20 bg-bg-secondary px-3 py-2',
          'text-sm text-parchment placeholder:text-parchment/40',
          'focus:outline-none focus:border-accent-gold/50 focus:ring-1 focus:ring-accent-gold/30',
        )}
      />
    </div>
  )
}
