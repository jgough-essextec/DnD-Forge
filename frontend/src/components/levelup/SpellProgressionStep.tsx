/**
 * SpellProgressionStep (Story 31.6)
 *
 * Conditional step for spellcasting classes. Shows new spell slots,
 * handles known-caster spell selection, prepared-caster limit updates,
 * wizard spellbook additions, warlock Pact Magic, and cantrip scaling.
 */

import { useMemo } from 'react'
import { Sparkles, BookOpen, Wand2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { getClassById } from '@/data/classes'
import { getAbilityModifier } from '@/data/reference'
import type { LevelUpChanges } from '@/utils/levelup'
import type { Character } from '@/types/character'

/** Cantrip damage scaling levels */
const CANTRIP_SCALING_LEVELS = [5, 11, 17]

/** Known casters: select specific spells */
const KNOWN_CASTER_IDS = new Set(['bard', 'sorcerer', 'warlock', 'ranger'])

/** Wizard: add spells to spellbook */
const WIZARD_ID = 'wizard'

interface SpellProgressionStepProps {
  character: Character
  changes: LevelUpChanges
  selectedSpells: string[]
  onSpellsChange: (spells: string[]) => void
}

export function SpellProgressionStep({
  character,
  changes,
  selectedSpells,
  onSpellsChange: _onSpellsChange,
}: SpellProgressionStepProps) {
  // _onSpellsChange will be used when the full spell selector is integrated.
  // For now it is kept as a prop to maintain the public API contract.
  void _onSpellsChange
  const classData = getClassById(changes.classId)
  const spellcasting = classData?.spellcasting
  const isKnownCaster = KNOWN_CASTER_IDS.has(changes.classId)
  const isWizard = changes.classId === WIZARD_ID
  const isPreparedCaster =
    spellcasting?.spellsKnownOrPrepared === 'prepared' && !isWizard
  const isCantripScalingLevel = CANTRIP_SCALING_LEVELS.includes(
    changes.newLevel,
  )

  // Calculate preparation limit for prepared casters
  const prepLimit = useMemo(() => {
    if (!spellcasting || !isPreparedCaster) return null
    const abilityMod = getAbilityModifier(
      character.abilityScores[spellcasting.ability],
    )
    return Math.max(1, abilityMod + changes.newClassLevel)
  }, [spellcasting, isPreparedCaster, character.abilityScores, changes.newClassLevel])

  // Calculate wizard spellbook additions
  const wizardNewSpells = isWizard ? 2 : 0

  // Calculate how many new spells to select for known casters
  const newSpellCount = changes.newSpellsKnown ?? 0

  return (
    <div className="space-y-6" data-testid="spell-progression-step">
      <div className="text-center">
        <Sparkles className="h-8 w-8 text-accent-gold mx-auto mb-2" />
        <h3 className="text-lg font-heading font-bold text-parchment">
          Spell Progression
        </h3>
        <p className="text-sm text-parchment/60 mt-1">
          Your magical abilities grow at level {changes.newLevel}.
        </p>
      </div>

      {/* New spell slots */}
      {changes.newSpellSlots && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            'rounded-lg border border-accent-gold/20 bg-accent-gold/5 p-4',
          )}
          data-testid="new-spell-slots"
        >
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-4 w-4 text-accent-gold" />
            <span className="text-sm font-semibold text-parchment">
              New Spell Slots
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {Object.entries(changes.newSpellSlots)
              .filter(([, count]) => count > 0)
              .map(([level, count]) => (
                <div
                  key={level}
                  className="rounded border border-parchment/15 bg-primary p-2 text-center"
                  data-testid={`spell-slot-level-${level}`}
                >
                  <span className="text-[10px] text-parchment/50 block">
                    Level {level}
                  </span>
                  <span className="text-sm font-bold text-accent-gold">
                    +{count}
                  </span>
                </div>
              ))}
          </div>
        </motion.div>
      )}

      {/* Pact Magic changes (Warlock) */}
      {changes.pactMagicChanges && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            'rounded-lg border border-accent-gold/20 bg-accent-gold/5 p-4',
          )}
          data-testid="pact-magic-changes"
        >
          <div className="flex items-center gap-2 mb-2">
            <Wand2 className="h-4 w-4 text-accent-gold" />
            <span className="text-sm font-semibold text-parchment">
              Pact Magic
            </span>
          </div>
          <p className="text-xs text-parchment/60">
            {changes.pactMagicChanges.totalSlots} spell slot
            {changes.pactMagicChanges.totalSlots > 1 ? 's' : ''} at level{' '}
            {changes.pactMagicChanges.slotLevel}
          </p>
          {changes.newLevel >= 11 && changes.newLevel <= 17 && (
            <p className="text-xs text-accent-gold/70 mt-1 italic">
              Mystic Arcanum: Choose a spell of the appropriate level that you
              can cast once per long rest.
            </p>
          )}
        </motion.div>
      )}

      {/* New cantrips */}
      {changes.newCantripsKnown && changes.newCantripsKnown > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            'rounded-lg border border-parchment/15 bg-parchment/5 p-4',
          )}
          data-testid="new-cantrips"
        >
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-4 w-4 text-accent-gold" />
            <span className="text-sm font-semibold text-parchment">
              New Cantrips
            </span>
          </div>
          <p className="text-xs text-parchment/60">
            You learn {changes.newCantripsKnown} new cantrip
            {changes.newCantripsKnown > 1 ? 's' : ''}.
          </p>
        </motion.div>
      )}

      {/* Cantrip damage scaling */}
      {isCantripScalingLevel && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            'rounded-lg border border-damage-red/20 bg-damage-red/5 p-3',
            'text-center',
          )}
          data-testid="cantrip-scaling"
        >
          <p className="text-sm font-semibold text-parchment">
            Cantrip Damage Scaling
          </p>
          <p className="text-xs text-parchment/60 mt-1">
            Your damage cantrips now deal additional dice of damage at level{' '}
            {changes.newLevel}!
          </p>
        </motion.div>
      )}

      {/* Known casters: spell selection */}
      {isKnownCaster && newSpellCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            'rounded-lg border border-parchment/15 bg-parchment/5 p-4',
          )}
          data-testid="known-caster-spells"
        >
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="h-4 w-4 text-accent-gold" />
            <span className="text-sm font-semibold text-parchment">
              Learn New Spells
            </span>
          </div>
          <p className="text-xs text-parchment/60 mb-3">
            Choose {newSpellCount} new spell{newSpellCount > 1 ? 's' : ''} to
            add to your known spells. You may also swap one known spell for
            another.
          </p>
          <p className="text-xs text-parchment/40 italic">
            Selected: {selectedSpells.length} / {newSpellCount}
          </p>
          {/* Placeholder for full spell selector integration */}
          <div className="mt-2 rounded border border-parchment/10 p-3 text-center">
            <p className="text-xs text-parchment/30">
              Spell selection available from the spell database.
            </p>
          </div>
        </motion.div>
      )}

      {/* Prepared casters: show updated limit */}
      {isPreparedCaster && prepLimit !== null && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            'rounded-lg border border-parchment/15 bg-parchment/5 p-4',
          )}
          data-testid="prepared-caster-limit"
        >
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="h-4 w-4 text-accent-gold" />
            <span className="text-sm font-semibold text-parchment">
              Spell Preparation
            </span>
          </div>
          <p className="text-xs text-parchment/60">
            You can prepare up to{' '}
            <span className="font-bold text-accent-gold">{prepLimit}</span>{' '}
            spells per day ({spellcasting?.ability} modifier +{' '}
            {changes.classId} level).
          </p>
        </motion.div>
      )}

      {/* Wizard: spellbook additions */}
      {isWizard && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            'rounded-lg border border-parchment/15 bg-parchment/5 p-4',
          )}
          data-testid="wizard-spellbook"
        >
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="h-4 w-4 text-accent-gold" />
            <span className="text-sm font-semibold text-parchment">
              Spellbook
            </span>
          </div>
          <p className="text-xs text-parchment/60">
            Add <span className="font-bold text-accent-gold">{wizardNewSpells}</span>{' '}
            wizard spells to your spellbook for free.
          </p>
          {prepLimit !== null && (
            <p className="text-xs text-parchment/40 mt-1">
              Preparation limit: {prepLimit} spells per day.
            </p>
          )}
          {/* Placeholder for spell selection integration */}
          <div className="mt-2 rounded border border-parchment/10 p-3 text-center">
            <p className="text-xs text-parchment/30">
              Spell selection available from the spell database.
            </p>
          </div>
        </motion.div>
      )}
    </div>
  )
}
