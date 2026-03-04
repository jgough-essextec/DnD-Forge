/**
 * AppearanceSection Component (Story 18.1)
 *
 * Displays character appearance details including:
 * - Character name (duplicate from Page 1)
 * - Physical detail fields (age, height, weight, eyes, skin, hair)
 * - Character portrait with appearance notes
 * - Allies & Organizations text block
 *
 * In edit mode: inline editing of all fields
 */

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { useCharacterSheet } from '@/components/character/CharacterSheetProvider'
import { CharacterAvatar } from '@/components/shared/CharacterAvatar'
import type { CharacterDescription } from '@/types/background'

export interface AppearanceSectionProps {
  className?: string
}

const PHYSICAL_DETAIL_FIELDS = [
  { key: 'age' as const, label: 'Age' },
  { key: 'height' as const, label: 'Height' },
  { key: 'weight' as const, label: 'Weight' },
  { key: 'eyes' as const, label: 'Eyes' },
  { key: 'skin' as const, label: 'Skin' },
  { key: 'hair' as const, label: 'Hair' },
] as const

export function AppearanceSection({ className }: AppearanceSectionProps) {
  const { character, editableCharacter, updateField, editMode } = useCharacterSheet()

  const currentDescription = (editableCharacter.description ?? character?.description) as CharacterDescription | undefined
  const currentName = editableCharacter.name ?? character?.name ?? ''
  const currentAvatarUrl = editableCharacter.avatarUrl ?? character?.avatarUrl ?? null

  const [uploadingAvatar, setUploadingAvatar] = useState(false)

  const handleDescriptionFieldChange = (field: keyof CharacterDescription, value: string) => {
    const updatedDescription: CharacterDescription = {
      ...currentDescription,
      name: currentName,
      age: currentDescription?.age ?? '',
      height: currentDescription?.height ?? '',
      weight: currentDescription?.weight ?? '',
      eyes: currentDescription?.eyes ?? '',
      skin: currentDescription?.skin ?? '',
      hair: currentDescription?.hair ?? '',
      appearance: currentDescription?.appearance ?? '',
      backstory: currentDescription?.backstory ?? '',
      alliesAndOrgs: currentDescription?.alliesAndOrgs ?? '',
      treasure: currentDescription?.treasure ?? '',
      [field]: value,
    }
    updateField('description', updatedDescription)
  }

  const handleAvatarUpload = async (file: File) => {
    setUploadingAvatar(true)
    try {
      // TODO: Implement actual avatar upload when Epic 23 is available
      // For now, create a local object URL
      const objectUrl = URL.createObjectURL(file)
      updateField('avatarUrl', objectUrl)
    } finally {
      setUploadingAvatar(false)
    }
  }

  return (
    <div
      className={cn(
        'flex flex-col gap-4 p-4 rounded-lg bg-secondary border border-accent-gold/20',
        className
      )}
      data-testid="appearance-section"
      aria-label="Character Appearance"
    >
      {/* Character Name Banner */}
      <div className="pb-3 border-b border-accent-gold/30">
        {editMode.isEditing ? (
          <input
            type="text"
            value={currentName}
            onChange={(e) => updateField('name', e.target.value)}
            className="w-full text-2xl font-bold bg-transparent border-b border-accent-gold/50 focus:border-accent-gold outline-none text-accent-gold"
            placeholder="Character Name"
            aria-label="Character Name"
            data-testid="appearance-name-input"
          />
        ) : (
          <h2 className="text-2xl font-bold text-accent-gold" data-testid="appearance-name-display">
            {currentName || 'Unnamed Character'}
          </h2>
        )}
      </div>

      {/* Character Portrait */}
      <div className="flex flex-col items-center gap-3">
        <div className="relative group">
          <CharacterAvatar
            name={currentName}
            avatarUrl={currentAvatarUrl}
            size={200}
            className="ring-2 ring-accent-gold/30"
          />
          {editMode.isEditing && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
              <label
                htmlFor="avatar-upload"
                className="px-4 py-2 bg-accent-gold text-primary font-semibold rounded cursor-pointer hover:bg-accent-gold/90 transition-colors"
              >
                {uploadingAvatar ? 'Uploading...' : 'Upload Image'}
              </label>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleAvatarUpload(file)
                }}
                disabled={uploadingAvatar}
                data-testid="avatar-upload-input"
              />
            </div>
          )}
        </div>
      </div>

      {/* Physical Detail Fields - Horizontal Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {PHYSICAL_DETAIL_FIELDS.map(({ key, label }) => {
          const value = currentDescription?.[key] ?? ''
          return (
            <div key={key} className="flex flex-col gap-1">
              <label
                htmlFor={`appearance-${key}`}
                className="text-xs font-semibold text-accent-gold uppercase tracking-wide"
              >
                {label}
              </label>
              {editMode.isEditing ? (
                <input
                  id={`appearance-${key}`}
                  type="text"
                  value={value}
                  onChange={(e) => handleDescriptionFieldChange(key, e.target.value)}
                  className="px-2 py-1 text-sm bg-primary border border-accent-gold/30 rounded focus:border-accent-gold outline-none text-parchment"
                  placeholder={`Enter ${label.toLowerCase()}`}
                  aria-label={label}
                  data-testid={`appearance-${key}-input`}
                />
              ) : (
                <div
                  className="px-2 py-1 text-sm text-parchment min-h-[1.75rem]"
                  data-testid={`appearance-${key}-display`}
                >
                  {value || <span className="text-parchment/40 italic">—</span>}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Appearance Notes */}
      <div className="flex flex-col gap-2">
        <label
          htmlFor="appearance-notes"
          className="text-sm font-semibold text-accent-gold"
        >
          Appearance Notes
        </label>
        {editMode.isEditing ? (
          <textarea
            id="appearance-notes"
            value={currentDescription?.appearance ?? ''}
            onChange={(e) => handleDescriptionFieldChange('appearance', e.target.value)}
            className="px-3 py-2 min-h-[80px] text-sm bg-primary border border-accent-gold/30 rounded focus:border-accent-gold outline-none text-parchment resize-y"
            placeholder="Distinguishing features, scars, tattoos, clothing style..."
            aria-label="Appearance Notes"
            data-testid="appearance-notes-input"
          />
        ) : (
          <div
            className="px-3 py-2 min-h-[80px] text-sm text-parchment whitespace-pre-wrap"
            data-testid="appearance-notes-display"
          >
            {currentDescription?.appearance || (
              <span className="text-parchment/40 italic">
                No appearance notes yet
              </span>
            )}
          </div>
        )}
      </div>

      {/* Allies & Organizations */}
      <div className="flex flex-col gap-2">
        <label
          htmlFor="allies-orgs"
          className="text-sm font-semibold text-accent-gold"
        >
          Allies & Organizations
        </label>
        {editMode.isEditing ? (
          <textarea
            id="allies-orgs"
            value={currentDescription?.alliesAndOrgs ?? ''}
            onChange={(e) => handleDescriptionFieldChange('alliesAndOrgs', e.target.value)}
            className="px-3 py-2 min-h-[80px] text-sm bg-primary border border-accent-gold/30 rounded focus:border-accent-gold outline-none text-parchment resize-y"
            placeholder="Factions, allies, contacts, organizations..."
            aria-label="Allies and Organizations"
            data-testid="allies-orgs-input"
          />
        ) : (
          <div
            className="px-3 py-2 min-h-[80px] text-sm text-parchment whitespace-pre-wrap"
            data-testid="allies-orgs-display"
          >
            {currentDescription?.alliesAndOrgs || (
              <span className="text-parchment/40 italic">
                No allies or organizations yet
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
