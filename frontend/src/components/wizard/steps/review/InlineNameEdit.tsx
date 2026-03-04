/**
 * InlineNameEdit - Click-to-edit character name in the review header.
 *
 * Click on the name to turn it into a text input.
 * Press Enter or blur to save. Updates wizardStore.setCharacterName().
 */

import { useState, useRef, useCallback, useEffect } from 'react'
import { useWizardStore } from '@/stores/wizardStore'
import { cn } from '@/lib/utils'

export function InlineNameEdit() {
  const characterName = useWizardStore((s) => s.characterName)
  const setCharacterName = useWizardStore((s) => s.setCharacterName)

  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(characterName)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  const handleStartEdit = useCallback(() => {
    setEditValue(characterName)
    setIsEditing(true)
  }, [characterName])

  const handleSave = useCallback(() => {
    setCharacterName(editValue.trim())
    setIsEditing(false)
  }, [editValue, setCharacterName])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleSave()
      } else if (e.key === 'Escape') {
        setIsEditing(false)
      }
    },
    [handleSave],
  )

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type="text"
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        className={cn(
          'font-heading text-2xl text-accent-gold bg-transparent border-b-2 border-accent-gold/50',
          'outline-none px-0 py-0 w-full max-w-md',
        )}
        aria-label="Character name"
        data-testid="inline-name-input"
      />
    )
  }

  return (
    <button
      onClick={handleStartEdit}
      className={cn(
        'font-heading text-2xl text-accent-gold cursor-pointer',
        'hover:text-accent-gold/80 transition-colors',
        'border-b-2 border-transparent hover:border-accent-gold/30',
      )}
      aria-label="Click to edit character name"
      data-testid="inline-name-display"
    >
      {characterName || 'Unnamed Adventurer'}
    </button>
  )
}
