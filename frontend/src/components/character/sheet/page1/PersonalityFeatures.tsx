/**
 * PersonalityFeatures (Story 17.9)
 *
 * Displays personality traits, ideals, bonds, flaws, and features & traits.
 * Supports collapsible feature groups and editable text areas.
 */

import { useCharacterSheet } from '@/components/character/CharacterSheetProvider'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

export function PersonalityFeatures() {
  const { character, editableCharacter, updateField, editMode } =
    useCharacterSheet()
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    racial: true,
    class: true,
    background: true,
    feats: true,
  })

  const displayCharacter = character ? { ...character, ...editableCharacter } : null

  if (!displayCharacter) {
    return null
  }

  const toggleGroup = (group: string) => {
    setExpandedGroups((prev) => ({ ...prev, [group]: !prev[group] }))
  }

  const handlePersonalityUpdate = (field: keyof typeof displayCharacter.personality, value: string) => {
    updateField('personality', {
      ...displayCharacter.personality,
      [field]: value,
    })
  }

  // Group features by source
  const racialTraits = displayCharacter.race.traits || []
  const classFeatures = displayCharacter.classes.flatMap((cls) => cls.features || [])
  const backgroundFeature = displayCharacter.background.feature
    ? [displayCharacter.background.feature]
    : []
  const feats = displayCharacter.feats.map((feat) => feat.name)

  return (
    <div className="space-y-4" data-testid="personality-features">
      {/* Personality Traits */}
      <div className="rounded-lg border-2 border-parchment/20 bg-bg-secondary p-3">
        <h3 className="text-xs uppercase tracking-wider text-parchment/60 font-semibold mb-2">
          Personality Traits
        </h3>
        {editMode.isEditing ? (
          <textarea
            value={displayCharacter.personality.personalityTraits[0] || ''}
            onChange={(e) =>
              handlePersonalityUpdate('personalityTraits', [
                e.target.value,
                displayCharacter.personality.personalityTraits[1] || '',
              ] as any)
            }
            className="w-full bg-bg-primary/30 border border-parchment/30 rounded px-3 py-2 text-parchment text-sm focus:outline-none focus:border-accent-gold resize-none"
            rows={3}
            placeholder="Describe your character's personality..."
          />
        ) : (
          <div className="text-sm text-parchment/80 whitespace-pre-wrap">
            {displayCharacter.personality.personalityTraits[0] || 'None'}
          </div>
        )}
      </div>

      {/* Ideals */}
      <div className="rounded-lg border-2 border-parchment/20 bg-bg-secondary p-3">
        <h3 className="text-xs uppercase tracking-wider text-parchment/60 font-semibold mb-2">
          Ideals
        </h3>
        {editMode.isEditing ? (
          <textarea
            value={displayCharacter.personality.ideal}
            onChange={(e) => handlePersonalityUpdate('ideal', e.target.value)}
            className="w-full bg-bg-primary/30 border border-parchment/30 rounded px-3 py-2 text-parchment text-sm focus:outline-none focus:border-accent-gold resize-none"
            rows={2}
            placeholder="What drives your character?"
          />
        ) : (
          <div className="text-sm text-parchment/80 whitespace-pre-wrap">
            {displayCharacter.personality.ideal || 'None'}
          </div>
        )}
      </div>

      {/* Bonds */}
      <div className="rounded-lg border-2 border-parchment/20 bg-bg-secondary p-3">
        <h3 className="text-xs uppercase tracking-wider text-parchment/60 font-semibold mb-2">
          Bonds
        </h3>
        {editMode.isEditing ? (
          <textarea
            value={displayCharacter.personality.bond}
            onChange={(e) => handlePersonalityUpdate('bond', e.target.value)}
            className="w-full bg-bg-primary/30 border border-parchment/30 rounded px-3 py-2 text-parchment text-sm focus:outline-none focus:border-accent-gold resize-none"
            rows={2}
            placeholder="What ties your character to others?"
          />
        ) : (
          <div className="text-sm text-parchment/80 whitespace-pre-wrap">
            {displayCharacter.personality.bond || 'None'}
          </div>
        )}
      </div>

      {/* Flaws */}
      <div className="rounded-lg border-2 border-parchment/20 bg-bg-secondary p-3">
        <h3 className="text-xs uppercase tracking-wider text-parchment/60 font-semibold mb-2">
          Flaws
        </h3>
        {editMode.isEditing ? (
          <textarea
            value={displayCharacter.personality.flaw}
            onChange={(e) => handlePersonalityUpdate('flaw', e.target.value)}
            className="w-full bg-bg-primary/30 border border-parchment/30 rounded px-3 py-2 text-parchment text-sm focus:outline-none focus:border-accent-gold resize-none"
            rows={2}
            placeholder="What weakness does your character have?"
          />
        ) : (
          <div className="text-sm text-parchment/80 whitespace-pre-wrap">
            {displayCharacter.personality.flaw || 'None'}
          </div>
        )}
      </div>

      {/* Features & Traits */}
      <div className="rounded-lg border-2 border-parchment/20 bg-bg-secondary p-3">
        <h3 className="text-xs uppercase tracking-wider text-parchment/60 font-semibold mb-3">
          Features & Traits
        </h3>

        {/* Racial Traits */}
        {racialTraits.length > 0 && (
          <div className="mb-3">
            <button
              onClick={() => toggleGroup('racial')}
              className="flex items-center gap-2 w-full text-left text-sm font-semibold text-parchment/80 hover:text-parchment transition-colors"
            >
              {expandedGroups.racial ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
              Racial Traits ({racialTraits.length})
            </button>
            {expandedGroups.racial && (
              <div className="mt-2 ml-6 space-y-2">
                {racialTraits.map((trait, index) => (
                  <div key={index} className="text-sm">
                    <div className="font-semibold text-parchment">{trait}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Class Features */}
        {classFeatures.length > 0 && (
          <div className="mb-3">
            <button
              onClick={() => toggleGroup('class')}
              className="flex items-center gap-2 w-full text-left text-sm font-semibold text-parchment/80 hover:text-parchment transition-colors"
            >
              {expandedGroups.class ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
              Class Features ({classFeatures.length})
            </button>
            {expandedGroups.class && (
              <div className="mt-2 ml-6 space-y-2">
                {classFeatures.map((feature, index) => (
                  <div key={index} className="text-sm">
                    <div className="font-semibold text-parchment">{feature}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Background Feature */}
        {backgroundFeature.length > 0 && (
          <div className="mb-3">
            <button
              onClick={() => toggleGroup('background')}
              className="flex items-center gap-2 w-full text-left text-sm font-semibold text-parchment/80 hover:text-parchment transition-colors"
            >
              {expandedGroups.background ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
              Background Feature
            </button>
            {expandedGroups.background && (
              <div className="mt-2 ml-6 space-y-2">
                {backgroundFeature.map((feature, index) => (
                  <div key={index} className="text-sm">
                    <div className="font-semibold text-parchment">{feature}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Feats */}
        {feats.length > 0 && (
          <div>
            <button
              onClick={() => toggleGroup('feats')}
              className="flex items-center gap-2 w-full text-left text-sm font-semibold text-parchment/80 hover:text-parchment transition-colors"
            >
              {expandedGroups.feats ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
              Feats ({feats.length})
            </button>
            {expandedGroups.feats && (
              <div className="mt-2 ml-6 space-y-2">
                {feats.map((feat, index) => (
                  <div key={index} className="text-sm">
                    <div className="font-semibold text-parchment">{feat}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {racialTraits.length === 0 &&
          classFeatures.length === 0 &&
          backgroundFeature.length === 0 &&
          feats.length === 0 && (
            <div className="text-center py-4 text-parchment/50 text-sm">
              No features or traits
            </div>
          )}
      </div>
    </div>
  )
}
