/**
 * BackstorySection Component (Story 18.2)
 *
 * Displays character backstory narrative with markdown-lite formatting support
 * and additional features section.
 *
 * Features:
 * - Backstory text with markdown-lite rendering (bold, italic, headers)
 * - Character count display in edit mode with soft warning at 5,000 characters
 * - Additional features section for overflow features from Page 1
 *
 * In edit mode: rich textarea with formatting toolbar
 */

import { useMemo } from 'react'
import { cn } from '@/lib/utils'
import { useCharacterSheet } from '@/components/character/CharacterSheetProvider'
import type { CharacterDescription } from '@/types/background'

export interface BackstorySectionProps {
  className?: string
}

const SOFT_WARNING_THRESHOLD = 5000

/**
 * Simple markdown-lite parser for backstory text.
 * Supports: bold (**text**), italic (*text*), headers (# Header)
 */
function parseMarkdownLite(text: string): string {
  if (!text) return ''

  // Replace headers (# Header)
  let parsed = text.replace(/^# (.+)$/gm, '<h3 class="text-lg font-bold text-accent-gold mt-3 mb-1">$1</h3>')
  parsed = parsed.replace(/^## (.+)$/gm, '<h4 class="text-base font-semibold text-accent-gold mt-2 mb-1">$1</h4>')

  // Replace bold (**text**)
  parsed = parsed.replace(/\*\*(.+?)\*\*/g, '<strong class="font-bold text-accent-gold">$1</strong>')

  // Replace italic (*text*)
  parsed = parsed.replace(/\*(.+?)\*/g, '<em class="italic">$1</em>')

  // Convert line breaks to <br>
  parsed = parsed.replace(/\n/g, '<br>')

  return parsed
}

export function BackstorySection({ className }: BackstorySectionProps) {
  const { character, editableCharacter, updateField, editMode } = useCharacterSheet()

  const currentDescription = (editableCharacter.description ?? character?.description) as CharacterDescription | undefined
  const backstoryText = currentDescription?.backstory ?? ''

  const characterCount = backstoryText.length
  const showWarning = characterCount > SOFT_WARNING_THRESHOLD

  const handleBackstoryChange = (value: string) => {
    const updatedDescription: CharacterDescription = {
      name: currentDescription?.name ?? character?.name ?? '',
      age: currentDescription?.age ?? '',
      height: currentDescription?.height ?? '',
      weight: currentDescription?.weight ?? '',
      eyes: currentDescription?.eyes ?? '',
      skin: currentDescription?.skin ?? '',
      hair: currentDescription?.hair ?? '',
      appearance: currentDescription?.appearance ?? '',
      backstory: value,
      alliesAndOrgs: currentDescription?.alliesAndOrgs ?? '',
      treasure: currentDescription?.treasure ?? '',
    }
    updateField('description', updatedDescription)
  }

  const renderedBackstory = useMemo(() => parseMarkdownLite(backstoryText), [backstoryText])

  const currentFeatures = editableCharacter.features ?? character?.features ?? []

  return (
    <div
      className={cn(
        'flex flex-col gap-4 p-4 rounded-lg bg-secondary border border-accent-gold/20',
        className
      )}
      data-testid="backstory-section"
      aria-label="Character Backstory"
    >
      {/* Backstory Block */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label
            htmlFor="backstory-text"
            className="text-lg font-bold text-accent-gold"
          >
            Backstory
          </label>
          {editMode.isEditing && (
            <div className="flex items-center gap-2 text-xs">
              <span
                className={cn(
                  'font-mono',
                  showWarning ? 'text-damage-red' : 'text-parchment/60'
                )}
                data-testid="backstory-character-count"
              >
                {characterCount.toLocaleString()} characters
              </span>
              {showWarning && (
                <span className="text-damage-red">
                  (over 5,000)
                </span>
              )}
            </div>
          )}
        </div>

        {editMode.isEditing ? (
          <div className="flex flex-col gap-2">
            {/* Simple formatting toolbar */}
            <div className="flex items-center gap-2 p-2 bg-primary/50 rounded border border-accent-gold/20">
              <span className="text-xs text-parchment/60">
                Formatting: **bold** *italic* # Heading
              </span>
            </div>

            <textarea
              id="backstory-text"
              value={backstoryText}
              onChange={(e) => handleBackstoryChange(e.target.value)}
              className="px-3 py-2 min-h-[200px] text-sm bg-primary border border-accent-gold/30 rounded focus:border-accent-gold outline-none text-parchment resize-y font-mono"
              placeholder="Write your character's backstory here... Use **bold**, *italic*, or # Heading for formatting"
              aria-label="Backstory"
              data-testid="backstory-input"
            />
          </div>
        ) : (
          <div
            className="px-3 py-2 min-h-[200px] text-sm text-parchment"
            dangerouslySetInnerHTML={{ __html: renderedBackstory }}
            data-testid="backstory-display"
          />
        )}

        {!backstoryText && !editMode.isEditing && (
          <div className="px-3 py-2 text-sm text-parchment/40 italic">
            No backstory written yet. Click Edit to add your character's story.
          </div>
        )}
      </div>

      {/* Additional Features Section */}
      <div className="flex flex-col gap-2 pt-3 border-t border-accent-gold/20">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-accent-gold">
            Additional Features
          </h3>
          <span className="text-xs text-parchment/60">
            {currentFeatures.length} feature{currentFeatures.length !== 1 ? 's' : ''}
          </span>
        </div>

        {currentFeatures.length > 0 ? (
          <div className="flex flex-col gap-2" data-testid="additional-features-list">
            {currentFeatures.map((featureId, index) => (
              <div
                key={`${featureId}-${index}`}
                className="px-3 py-2 bg-primary/30 rounded border border-accent-gold/10"
                data-testid={`feature-item-${index}`}
              >
                <div className="font-semibold text-accent-gold text-sm">
                  {featureId}
                </div>
                {/* TODO: Feature descriptions will be populated from SRD data */}
              </div>
            ))}
          </div>
        ) : (
          <div className="px-3 py-2 text-sm text-parchment/40 italic">
            No additional features yet
          </div>
        )}
      </div>
    </div>
  )
}
