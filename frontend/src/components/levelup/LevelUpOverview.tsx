/**
 * LevelUpOverview (Story 31.1)
 *
 * Displays a summary of everything gained at the next level:
 * HP increase, new features, subclass choice, ASI/feat, new spells/slots,
 * and an XP badge.
 */

import {
  ArrowUp,
  Heart,
  Star,
  Sparkles,
  BookOpen,
  Shield,
  Swords,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { LevelUpChanges } from '@/utils/levelup'
import { getXPInfo } from '@/utils/levelup'
import type { Character } from '@/types/character'

interface LevelUpOverviewProps {
  character: Character
  changes: LevelUpChanges
}

export function LevelUpOverview({ character, changes }: LevelUpOverviewProps) {
  const xpInfo = getXPInfo(character)

  return (
    <div className="space-y-6" data-testid="level-up-overview">
      {/* Level badge */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-accent-gold/10 border border-accent-gold/30 px-4 py-2">
          <ArrowUp className="h-5 w-5 text-accent-gold" />
          <span className="text-lg font-heading font-bold text-accent-gold">
            Level {character.level}
          </span>
          <span className="text-parchment/60 mx-1">&rarr;</span>
          <span className="text-lg font-heading font-bold text-accent-gold">
            Level {changes.newLevel}
          </span>
        </div>
      </div>

      {/* XP badge */}
      {character.experiencePoints > 0 && (
        <div
          className="rounded-lg border border-parchment/15 bg-parchment/5 p-4"
          data-testid="xp-badge"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-parchment/70">
              Experience Points
            </span>
            <span className="text-sm font-bold text-accent-gold">
              {xpInfo.currentXP.toLocaleString()} / {xpInfo.nextLevelXP.toLocaleString()} XP
            </span>
          </div>
          <div className="h-2 rounded-full bg-primary-dark overflow-hidden">
            <div
              className="h-full rounded-full bg-accent-gold transition-all"
              style={{ width: `${Math.round(xpInfo.progress * 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Gains summary */}
      <div className="space-y-3">
        <h3 className="text-sm font-heading font-semibold text-parchment/80 uppercase tracking-wider">
          What You Gain
        </h3>

        {/* HP */}
        <GainItem
          icon={<Heart className="h-4 w-4 text-healing-green" />}
          label="Hit Points"
          detail={`d${changes.hitDieType} + CON modifier (or average: ${changes.averageHP})`}
          testId="gain-hp"
        />

        {/* Features */}
        {changes.newFeatures.length > 0 && (
          <GainItem
            icon={<Star className="h-4 w-4 text-accent-gold" />}
            label="New Features"
            detail={changes.newFeatures.map((f) => f.name).join(', ')}
            testId="gain-features"
          />
        )}

        {/* Proficiency bonus */}
        {changes.proficiencyBonusChange && (
          <GainItem
            icon={<Shield className="h-4 w-4 text-accent-gold" />}
            label="Proficiency Bonus"
            detail={`+${changes.proficiencyBonusChange.from} \u2192 +${changes.proficiencyBonusChange.to}`}
            testId="gain-proficiency"
          />
        )}

        {/* Subclass */}
        {changes.isSubclassLevel && (
          <GainItem
            icon={<Swords className="h-4 w-4 text-accent-gold" />}
            label="Subclass Choice"
            detail="Choose your specialization path"
            testId="gain-subclass"
          />
        )}

        {/* ASI/Feat */}
        {changes.isASILevel && (
          <GainItem
            icon={<ArrowUp className="h-4 w-4 text-accent-gold" />}
            label="Ability Score Improvement"
            detail="+2 to one ability, +1/+1 to two, or choose a feat"
            testId="gain-asi"
          />
        )}

        {/* Spell slots */}
        {changes.newSpellSlots && (
          <GainItem
            icon={<Sparkles className="h-4 w-4 text-accent-gold" />}
            label="New Spell Slots"
            detail={formatSpellSlots(changes.newSpellSlots)}
            testId="gain-spell-slots"
          />
        )}

        {/* Spells known */}
        {changes.newSpellsKnown && changes.newSpellsKnown > 0 && (
          <GainItem
            icon={<BookOpen className="h-4 w-4 text-accent-gold" />}
            label="Spells"
            detail={`Learn ${changes.newSpellsKnown} new spell${changes.newSpellsKnown > 1 ? 's' : ''}`}
            testId="gain-spells-known"
          />
        )}

        {/* Cantrips */}
        {changes.newCantripsKnown && changes.newCantripsKnown > 0 && (
          <GainItem
            icon={<Sparkles className="h-4 w-4 text-accent-gold" />}
            label="Cantrips"
            detail={`Learn ${changes.newCantripsKnown} new cantrip${changes.newCantripsKnown > 1 ? 's' : ''}`}
            testId="gain-cantrips"
          />
        )}

        {/* Pact magic */}
        {changes.pactMagicChanges && (
          <GainItem
            icon={<Sparkles className="h-4 w-4 text-accent-gold" />}
            label="Pact Magic"
            detail={`${changes.pactMagicChanges.totalSlots} slot${changes.pactMagicChanges.totalSlots > 1 ? 's' : ''} at level ${changes.pactMagicChanges.slotLevel}`}
            testId="gain-pact-magic"
          />
        )}
      </div>
    </div>
  )
}

// -- Gain Item ----------------------------------------------------------------

interface GainItemProps {
  icon: React.ReactNode
  label: string
  detail: string
  testId: string
}

function GainItem({ icon, label, detail, testId }: GainItemProps) {
  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-lg border border-parchment/10',
        'bg-parchment/5 p-3',
      )}
      data-testid={testId}
    >
      <span className="mt-0.5 flex-shrink-0">{icon}</span>
      <div className="min-w-0">
        <span className="text-sm font-semibold text-parchment">{label}</span>
        <p className="text-xs text-parchment/60 mt-0.5">{detail}</p>
      </div>
    </div>
  )
}

// -- Helpers ------------------------------------------------------------------

function formatSpellSlots(slots: Record<number, number>): string {
  const parts: string[] = []
  for (const [level, count] of Object.entries(slots)) {
    if (count > 0) {
      parts.push(`+${count} level ${level}`)
    }
  }
  return parts.length > 0 ? parts.join(', ') : 'No new slots'
}
