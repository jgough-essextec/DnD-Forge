/**
 * PersonalityEditor -- Personality characteristics editor.
 *
 * Four sections for personality traits (choose 2), ideal (choose 1),
 * bond (choose 1), and flaw (choose 1). Each section supports table
 * selection, random roll, and custom text entry.
 */

import { useState, useCallback } from 'react'
import { Dices, Pen, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Background, PersonalityTrait } from '@/types/background'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PersonalityState {
  traits: [string, string]
  ideal: string
  bond: string
  flaw: string
}

interface PersonalityEditorProps {
  background: Background
  personality: PersonalityState
  onChange: (personality: PersonalityState) => void
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Pick a random entry from an array */
function randomEntry<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

/** Format alignment tag for display */
function formatAlignmentTag(text: string): { mainText: string; tag: string | null } {
  // Extract alignment tag from ideal text like "Charity. I help those in need. (Good)"
  // Look for alignment indicators in parentheses at the end
  const tagMatch = text.match(/\((Good|Evil|Lawful|Chaotic|Neutral|Any)\)\s*$/i)
  if (tagMatch) {
    return {
      mainText: text.slice(0, tagMatch.index).trim(),
      tag: tagMatch[1],
    }
  }
  return { mainText: text, tag: null }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function PersonalityEditor({
  background,
  personality,
  onChange,
}: PersonalityEditorProps) {
  const handleRandomizeAll = useCallback(() => {
    const traits = background.personalityTraits
    const ideals = background.ideals
    const bonds = background.bonds
    const flaws = background.flaws

    // Pick 2 unique random traits
    const traitTexts = traits.map((t) => t.text)
    const trait1 = randomEntry(traitTexts)
    let trait2 = randomEntry(traitTexts)
    let attempts = 0
    while (trait2 === trait1 && traitTexts.length > 1 && attempts < 20) {
      trait2 = randomEntry(traitTexts)
      attempts++
    }

    onChange({
      traits: [trait1, trait2],
      ideal: randomEntry(ideals).text,
      bond: randomEntry(bonds).text,
      flaw: randomEntry(flaws).text,
    })
  }, [background, onChange])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-heading text-lg font-semibold text-parchment">
          Personality Characteristics
        </h3>
        <button
          onClick={handleRandomizeAll}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium',
            'bg-accent-gold/10 text-accent-gold border border-accent-gold/30',
            'hover:bg-accent-gold/20 transition-colors',
          )}
          aria-label="Randomize all personality characteristics"
        >
          <Sparkles className="h-3.5 w-3.5" />
          Randomize All
        </button>
      </div>

      <p className="text-xs text-parchment/60">
        Personality characteristics for{' '}
        <span className="text-accent-gold font-medium">{background.name}</span>.
        Choose from the tables below or write your own.
      </p>

      {/* Personality Traits (choose 2) */}
      <PersonalitySection
        title="Personality Traits"
        subtitle="Choose 2 traits that describe your character"
        entries={background.personalityTraits}
        selectedValues={personality.traits.filter(Boolean)}
        maxSelections={2}
        onSelectionChange={(selected) => {
          const newTraits: [string, string] = [
            selected[0] ?? '',
            selected[1] ?? '',
          ]
          onChange({ ...personality, traits: newTraits })
        }}
        showAlignmentTags={false}
      />

      {/* Ideal (choose 1) */}
      <PersonalitySection
        title="Ideal"
        subtitle="Choose 1 ideal that drives your character"
        entries={background.ideals}
        selectedValues={personality.ideal ? [personality.ideal] : []}
        maxSelections={1}
        onSelectionChange={(selected) => {
          onChange({ ...personality, ideal: selected[0] ?? '' })
        }}
        showAlignmentTags={true}
      />

      {/* Bond (choose 1) */}
      <PersonalitySection
        title="Bond"
        subtitle="Choose 1 bond -- a connection that motivates your character"
        entries={background.bonds}
        selectedValues={personality.bond ? [personality.bond] : []}
        maxSelections={1}
        onSelectionChange={(selected) => {
          onChange({ ...personality, bond: selected[0] ?? '' })
        }}
        showAlignmentTags={false}
      />

      {/* Flaw (choose 1) */}
      <PersonalitySection
        title="Flaw"
        subtitle="Choose 1 flaw -- a weakness or vice"
        entries={background.flaws}
        selectedValues={personality.flaw ? [personality.flaw] : []}
        maxSelections={1}
        onSelectionChange={(selected) => {
          onChange({ ...personality, flaw: selected[0] ?? '' })
        }}
        showAlignmentTags={false}
      />
    </div>
  )
}

// ---------------------------------------------------------------------------
// PersonalitySection -- Reusable section for each personality category
// ---------------------------------------------------------------------------

interface PersonalitySectionProps {
  title: string
  subtitle: string
  entries: PersonalityTrait[]
  selectedValues: string[]
  maxSelections: number
  onSelectionChange: (selected: string[]) => void
  showAlignmentTags: boolean
}

function PersonalitySection({
  title,
  subtitle,
  entries,
  selectedValues,
  maxSelections,
  onSelectionChange,
  showAlignmentTags,
}: PersonalitySectionProps) {
  const [customMode, setCustomMode] = useState(false)
  const [customText, setCustomText] = useState('')

  const handleTableSelect = useCallback(
    (text: string) => {
      const isAlreadySelected = selectedValues.includes(text)
      if (isAlreadySelected) {
        // Deselect
        onSelectionChange(selectedValues.filter((v) => v !== text))
      } else if (selectedValues.length < maxSelections) {
        // Add selection
        onSelectionChange([...selectedValues, text])
      } else if (maxSelections === 1) {
        // Replace selection for single-select
        onSelectionChange([text])
      } else {
        // Replace the oldest selection for multi-select at max
        onSelectionChange([...selectedValues.slice(1), text])
      }
    },
    [selectedValues, maxSelections, onSelectionChange],
  )

  const handleRandom = useCallback(() => {
    if (maxSelections === 1) {
      const entry = randomEntry(entries)
      onSelectionChange([entry.text])
    } else {
      // For traits (max 2), pick 2 unique random
      const shuffled = [...entries].sort(() => Math.random() - 0.5)
      const picks = shuffled.slice(0, maxSelections).map((e) => e.text)
      onSelectionChange(picks)
    }
  }, [entries, maxSelections, onSelectionChange])

  const handleCustomAdd = useCallback(() => {
    if (!customText.trim()) return
    if (selectedValues.length < maxSelections) {
      onSelectionChange([...selectedValues, customText.trim()])
    } else if (maxSelections === 1) {
      onSelectionChange([customText.trim()])
    } else {
      onSelectionChange([...selectedValues.slice(1), customText.trim()])
    }
    setCustomText('')
  }, [customText, selectedValues, maxSelections, onSelectionChange])

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-semibold text-parchment">{title}</h4>
          <p className="text-xs text-parchment/50">{subtitle}</p>
        </div>
        <div className="flex gap-1.5">
          <button
            onClick={handleRandom}
            className={cn(
              'flex items-center gap-1 px-2 py-1 rounded text-xs',
              'text-parchment/60 hover:text-accent-gold hover:bg-accent-gold/10',
              'transition-colors',
            )}
            aria-label={`Roll random ${title.toLowerCase()}`}
          >
            <Dices className="h-3.5 w-3.5" />
            Roll
          </button>
          <button
            onClick={() => setCustomMode(!customMode)}
            className={cn(
              'flex items-center gap-1 px-2 py-1 rounded text-xs',
              'transition-colors',
              customMode
                ? 'text-accent-gold bg-accent-gold/10'
                : 'text-parchment/60 hover:text-accent-gold hover:bg-accent-gold/10',
            )}
            aria-label={`Write custom ${title.toLowerCase()}`}
          >
            <Pen className="h-3.5 w-3.5" />
            Custom
          </button>
        </div>
      </div>

      {/* Selected values display */}
      {selectedValues.filter(Boolean).length > 0 && (
        <div className="space-y-1">
          {selectedValues.filter(Boolean).map((val, i) => (
            <div
              key={i}
              className="flex items-start gap-2 rounded-lg bg-accent-gold/5 border border-accent-gold/20 p-2"
            >
              <span className="text-xs text-parchment/80 flex-1">{val}</span>
              <button
                onClick={() =>
                  onSelectionChange(selectedValues.filter((_, idx) => idx !== i))
                }
                className="text-xs text-parchment/40 hover:text-red-400 transition-colors flex-shrink-0"
                aria-label="Remove selection"
              >
                x
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Custom text input */}
      {customMode && (
        <div className="flex gap-2">
          <input
            type="text"
            value={customText}
            onChange={(e) => setCustomText(e.target.value.slice(0, 200))}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleCustomAdd()
              }
            }}
            placeholder={`Write a custom ${title.toLowerCase().replace(/s$/, '')}...`}
            maxLength={200}
            className={cn(
              'flex-1 rounded-lg border border-parchment/20 bg-bg-secondary px-3 py-2',
              'text-sm text-parchment placeholder:text-parchment/40',
              'focus:outline-none focus:border-accent-gold/50 focus:ring-1 focus:ring-accent-gold/30',
            )}
            aria-label={`Custom ${title.toLowerCase()} text`}
          />
          <button
            onClick={handleCustomAdd}
            disabled={!customText.trim()}
            className={cn(
              'px-3 py-2 rounded-lg text-xs font-medium transition-colors',
              customText.trim()
                ? 'bg-accent-gold text-bg-primary hover:bg-accent-gold/90'
                : 'bg-parchment/10 text-parchment/30 cursor-not-allowed',
            )}
          >
            Add
          </button>
        </div>
      )}

      {/* Table entries */}
      {!customMode && (
        <div className="space-y-1.5">
          {entries.map((entry, index) => {
            const isSelected = selectedValues.includes(entry.text)
            const { mainText, tag } = showAlignmentTags
              ? formatAlignmentTag(entry.text)
              : { mainText: entry.text, tag: null }

            return (
              <button
                key={entry.id}
                onClick={() => handleTableSelect(entry.text)}
                className={cn(
                  'w-full text-left rounded-lg border p-2.5 text-xs transition-all',
                  'focus:outline-none focus:ring-1 focus:ring-accent-gold/50',
                  isSelected
                    ? 'border-accent-gold bg-accent-gold/10 text-parchment'
                    : 'border-parchment/15 text-parchment/70 hover:border-parchment/30 hover:bg-parchment/5',
                )}
                aria-pressed={isSelected}
              >
                <span className="flex items-start gap-2">
                  <span className="text-parchment/40 font-mono flex-shrink-0 w-4">
                    {index + 1}.
                  </span>
                  <span className="flex-1">
                    {mainText}
                    {tag && (
                      <span className="ml-1 inline-block px-1.5 py-0.5 rounded text-[10px] bg-accent-gold/10 text-accent-gold font-medium">
                        {tag}
                      </span>
                    )}
                  </span>
                </span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
