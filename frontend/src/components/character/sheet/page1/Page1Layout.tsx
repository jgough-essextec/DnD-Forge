/**
 * Page1Layout (Story 17.1)
 *
 * Top-level layout for character sheet Page 1 (Core Stats).
 * Includes identity banner at top and 3-column responsive grid below.
 */

import { useCharacterSheet } from '@/components/character/CharacterSheetProvider'
import { CharacterAvatar } from '@/components/shared/CharacterAvatar'
import { cn } from '@/lib/utils'
import { Sparkles } from 'lucide-react'

interface Page1LayoutProps {
  children?: React.ReactNode
}

export function Page1Layout({ children }: Page1LayoutProps) {
  const { character, editableCharacter, updateField, editMode } =
    useCharacterSheet()

  const displayCharacter = character ? { ...character, ...editableCharacter } : null

  if (!displayCharacter) {
    return null
  }

  // Calculate XP needed for next level
  const xpThresholds = [
    0, 300, 900, 2700, 6500, 14000, 23000, 34000, 48000, 64000, 85000, 100000,
    120000, 140000, 165000, 195000, 225000, 265000, 305000, 355000,
  ]
  const nextLevelXP = xpThresholds[displayCharacter.level] ?? 0
  const xpProgress =
    nextLevelXP > 0
      ? ((displayCharacter.experiencePoints ?? 0) / nextLevelXP) * 100
      : 0

  // Format class display: "Level N [Subclass] [Class]"
  const classDisplay = displayCharacter.classes
    .map((cls) => {
      // Capitalize classId for display
      const className = cls.classId.charAt(0).toUpperCase() + cls.classId.slice(1)
      const subclassText = cls.subclassId ? `${cls.subclassId} ` : ''
      return `Level ${cls.level} ${subclassText}${className}`
    })
    .join(' / ')

  return (
    <div className="space-y-6" data-testid="page1-layout">
      {/* Top Banner */}
      <div className="rounded-lg border-2 border-parchment/20 bg-bg-secondary p-4 shadow-lg">
        <div className="flex gap-4">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <CharacterAvatar
              characterName={displayCharacter.name}
              avatarUrl={displayCharacter.avatarUrl}
              raceId={displayCharacter.race.raceId}
              classId={displayCharacter.classes[0]?.classId}
              size="lg"
              editable={editMode.isEditing}
            />
          </div>

          {/* Name and Identity Grid */}
          <div className="flex-1 min-w-0">
            {/* Character Name */}
            <div className="mb-3">
              {editMode.isEditing ? (
                <input
                  type="text"
                  value={displayCharacter.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  className="w-full bg-bg-primary border border-parchment/30 rounded px-3 py-2 text-2xl font-heading text-parchment focus:outline-none focus:border-accent-gold"
                  aria-label="Character name"
                />
              ) : (
                <h1
                  className="text-3xl font-heading text-parchment font-bold tracking-wide"
                  data-testid="character-name"
                >
                  {displayCharacter.name}
                </h1>
              )}
            </div>

            {/* Identity Grid: 2 rows x 3 columns */}
            <div className="grid grid-cols-3 gap-3 text-sm">
              {/* Class & Level */}
              <div>
                <div className="text-parchment/60 text-xs uppercase tracking-wider mb-1">
                  Class & Level
                </div>
                {editMode.isEditing ? (
                  <div className="text-parchment text-sm">{classDisplay}</div>
                ) : (
                  <div
                    className="text-parchment font-medium"
                    data-testid="class-level-display"
                  >
                    {classDisplay}
                  </div>
                )}
              </div>

              {/* Background */}
              <div>
                <div className="text-parchment/60 text-xs uppercase tracking-wider mb-1">
                  Background
                </div>
                {editMode.isEditing ? (
                  <input
                    type="text"
                    value={displayCharacter.background.backgroundId}
                    className="w-full bg-bg-primary border border-parchment/30 rounded px-2 py-1 text-parchment text-sm focus:outline-none focus:border-accent-gold"
                    aria-label="Background"
                    readOnly
                  />
                ) : (
                  <div className="text-parchment font-medium capitalize">
                    {displayCharacter.background.backgroundId.replace(/-/g, ' ')}
                  </div>
                )}
              </div>

              {/* Player Name */}
              <div>
                <div className="text-parchment/60 text-xs uppercase tracking-wider mb-1">
                  Player Name
                </div>
                {editMode.isEditing ? (
                  <input
                    type="text"
                    value={displayCharacter.playerName}
                    onChange={(e) => updateField('playerName', e.target.value)}
                    className="w-full bg-bg-primary border border-parchment/30 rounded px-2 py-1 text-parchment text-sm focus:outline-none focus:border-accent-gold"
                    aria-label="Player name"
                  />
                ) : (
                  <div className="text-parchment font-medium">
                    {displayCharacter.playerName}
                  </div>
                )}
              </div>

              {/* Race */}
              <div>
                <div className="text-parchment/60 text-xs uppercase tracking-wider mb-1">
                  Race
                </div>
                <div className="text-parchment font-medium capitalize">
                  {displayCharacter.race.subraceId
                    ? `${displayCharacter.race.subraceId.replace(/-/g, ' ')} ${displayCharacter.race.raceId.replace(/-/g, ' ')}`
                    : displayCharacter.race.raceId.replace(/-/g, ' ')}
                </div>
              </div>

              {/* Alignment */}
              <div>
                <div className="text-parchment/60 text-xs uppercase tracking-wider mb-1">
                  Alignment
                </div>
                {editMode.isEditing ? (
                  <select
                    value={displayCharacter.alignment}
                    onChange={(e) =>
                      updateField('alignment', e.target.value as any)
                    }
                    className="w-full bg-bg-primary border border-parchment/30 rounded px-2 py-1 text-parchment text-sm focus:outline-none focus:border-accent-gold"
                    aria-label="Alignment"
                  >
                    <option value="lawful-good">Lawful Good</option>
                    <option value="neutral-good">Neutral Good</option>
                    <option value="chaotic-good">Chaotic Good</option>
                    <option value="lawful-neutral">Lawful Neutral</option>
                    <option value="true-neutral">True Neutral</option>
                    <option value="chaotic-neutral">Chaotic Neutral</option>
                    <option value="lawful-evil">Lawful Evil</option>
                    <option value="neutral-evil">Neutral Evil</option>
                    <option value="chaotic-evil">Chaotic Evil</option>
                    <option value="unaligned">Unaligned</option>
                  </select>
                ) : (
                  <div className="text-parchment font-medium capitalize">
                    {displayCharacter.alignment.replace(/-/g, ' ')}
                  </div>
                )}
              </div>

              {/* Experience Points */}
              <div>
                <div className="text-parchment/60 text-xs uppercase tracking-wider mb-1">
                  Experience Points
                </div>
                {editMode.isEditing ? (
                  <input
                    type="number"
                    value={displayCharacter.experiencePoints}
                    onChange={(e) =>
                      updateField('experiencePoints', parseInt(e.target.value) || 0)
                    }
                    className="w-full bg-bg-primary border border-parchment/30 rounded px-2 py-1 text-parchment text-sm focus:outline-none focus:border-accent-gold"
                    aria-label="Experience points"
                  />
                ) : (
                  <div className="text-parchment font-medium">
                    {displayCharacter.experiencePoints} / {nextLevelXP}
                  </div>
                )}
                {/* XP Progress Bar */}
                <div className="mt-1 h-1 bg-bg-primary/50 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-accent-gold transition-all duration-300"
                    style={{ width: `${Math.min(xpProgress, 100)}%` }}
                    aria-label={`${xpProgress.toFixed(0)}% progress to next level`}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Inspiration Toggle */}
          <div className="flex-shrink-0">
            <button
              onClick={() => updateField('inspiration', !displayCharacter.inspiration)}
              className={cn(
                'w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all',
                displayCharacter.inspiration
                  ? 'bg-accent-gold/20 border-accent-gold text-accent-gold'
                  : 'bg-transparent border-parchment/30 text-parchment/40 hover:border-accent-gold/50'
              )}
              aria-label="Inspiration"
              title="Inspiration: Reroll one ability check, saving throw, or attack roll"
              data-testid="inspiration-toggle"
            >
              <Sparkles className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* 3-Column Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" data-testid="page1-grid">
        {children}
      </div>
    </div>
  )
}
