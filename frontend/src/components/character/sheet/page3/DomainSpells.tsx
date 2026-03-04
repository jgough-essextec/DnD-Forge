/**
 * DomainSpells Component (Story 19.4 - Epic 19)
 *
 * Displays always-prepared domain/subclass spells for classes like:
 * - Cleric (Life Domain, Light Domain, etc.)
 * - Paladin (Oath spells)
 * - Land Druid (Circle spells)
 *
 * These spells are marked with "Always Prepared" badge and cannot be unprepared.
 */

import { useCharacterSheet } from '@/components/character/CharacterSheetProvider'
import { getSpellById } from '@/data/spells'
import { getClassById } from '@/data/classes'
import { cn } from '@/lib/utils'
import type { Spell, SpellSchool } from '@/types/spell'

// School icons (shared)
const SCHOOL_CONFIG: Record<SpellSchool, { icon: string; color: string }> = {
  abjuration: { icon: '🛡️', color: 'text-blue-400' },
  conjuration: { icon: '✨', color: 'text-purple-400' },
  divination: { icon: '👁️', color: 'text-cyan-400' },
  enchantment: { icon: '💫', color: 'text-pink-400' },
  evocation: { icon: '⚡', color: 'text-red-400' },
  illusion: { icon: '🌀', color: 'text-purple-300' },
  necromancy: { icon: '💀', color: 'text-green-400' },
  transmutation: { icon: '🔄', color: 'text-yellow-400' },
}

// Domain spell lists (based on SRD - currently only Life Domain is fully available)
const DOMAIN_SPELLS: Record<string, Record<number, string[]>> = {
  'life-domain': {
    1: ['bless', 'cure-wounds'],
    3: ['lesser-restoration', 'spiritual-weapon'],
    5: ['beacon-of-hope', 'revivify'],
    7: ['death-ward', 'guardian-of-faith'],
    9: ['mass-cure-wounds', 'raise-dead'],
  },
  // Future: other domains can be added here
}

export function DomainSpells() {
  const { character, editableCharacter } = useCharacterSheet()

  const activeCharacter = character
    ? { ...character, ...editableCharacter }
    : null

  if (!activeCharacter?.spellcasting) return null

  // Find subclass-granted spells
  const domainSpells = getDomainSpells(activeCharacter)

  if (domainSpells.length === 0) return null

  return (
    <section className="space-y-3" data-testid="domain-spells-section">
      <h2 className="text-xl font-serif text-accent-gold">
        Domain Spells
        <span className="ml-2 text-xs text-parchment/60 font-sans italic">
          Always Prepared
        </span>
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {domainSpells.map(spell => (
          <DomainSpellCard key={spell.id} spell={spell} />
        ))}
      </div>
    </section>
  )
}

/**
 * Get domain/subclass spells for a character
 */
function getDomainSpells(character: any): Spell[] {
  const spells: Spell[] = []

  // Check each class for domain/subclass spells
  for (const cls of character.classes) {
    const classData = getClassById(cls.classId)
    if (!classData) continue

    // Only Cleric domains in SRD for now
    if (classData.id === 'cleric' && cls.subclassId) {
      const domainId = cls.subclassId
      const domainSpellList = DOMAIN_SPELLS[domainId]

      if (domainSpellList) {
        // Get spells up to current class level
        for (const [levelThreshold, spellIds] of Object.entries(domainSpellList)) {
          if (cls.level >= Number(levelThreshold)) {
            for (const spellId of spellIds) {
              const spell = getSpellById(spellId)
              if (spell && !spells.find(s => s.id === spell.id)) {
                spells.push(spell)
              }
            }
          }
        }
      }
    }

    // Future: Paladin oath spells, Land Druid circle spells, etc.
  }

  // Sort by level
  return spells.sort((a, b) => a.level - b.level)
}

/**
 * DomainSpellCard
 * Individual domain spell display with "Always Prepared" badge
 */
interface DomainSpellCardProps {
  spell: Spell
}

function DomainSpellCard({ spell }: DomainSpellCardProps) {
  const schoolConfig = SCHOOL_CONFIG[spell.school]
  const levelText = spell.level === 0 ? 'Cantrip' : `${spell.level}${getOrdinalSuffix(spell.level)} level`

  return (
    <div
      className={cn(
        'border rounded-lg p-3',
        'bg-accent-gold/5 border-accent-gold/40',
        'hover:border-accent-gold/60 transition-colors'
      )}
      data-testid={`domain-spell-${spell.id}`}
    >
      <div className="flex items-start gap-2">
        {/* School icon */}
        <span className="text-lg" aria-label={`${spell.school} school`}>
          {schoolConfig.icon}
        </span>

        {/* Spell info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-sm font-semibold text-parchment">
              {spell.name}
            </h3>
            <span
              className="text-xs px-2 py-0.5 rounded bg-accent-gold/20 text-accent-gold flex-shrink-0"
              data-testid={`always-prepared-badge-${spell.id}`}
            >
              Always Prepared
            </span>
          </div>

          <div className="flex flex-wrap gap-2 mt-1 text-xs text-parchment/60">
            <span className={schoolConfig.color}>
              {spell.school.charAt(0).toUpperCase() + spell.school.slice(1)}
            </span>
            <span>•</span>
            <span>{levelText}</span>
            {spell.concentration && (
              <>
                <span>•</span>
                <span className="text-cyan-400">Concentration</span>
              </>
            )}
            {spell.ritual && (
              <>
                <span>•</span>
                <span className="text-purple-400">Ritual</span>
              </>
            )}
          </div>

          <p className="text-xs text-parchment/70 mt-2 leading-relaxed line-clamp-2">
            {spell.description}
          </p>
        </div>
      </div>
    </div>
  )
}

/**
 * Get ordinal suffix for spell level
 */
function getOrdinalSuffix(n: number): string {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return s[(v - 20) % 10] || s[v] || s[0]
}
