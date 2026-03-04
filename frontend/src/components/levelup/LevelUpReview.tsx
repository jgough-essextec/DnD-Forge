/**
 * LevelUpReview (Story 31.7)
 *
 * Final review step showing a complete summary of all changes,
 * before/after comparison, and Apply/Cancel buttons.
 */

import {
  CheckCircle2,
  Heart,
  Star,
  ArrowUp,
  Sparkles,
  Swords,
  BookOpen,
  Shield,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { getAbilityModifier } from '@/data/reference'
import { getClassById } from '@/data/classes'
import { getFeatById } from '@/data/feats'
import type { LevelUpChanges } from '@/utils/levelup'
import type { Character } from '@/types/character'

interface LevelUpReviewProps {
  character: Character
  changes: LevelUpChanges
  onApply: () => void
  onCancel: () => void
  isApplying: boolean
}

export function LevelUpReview({
  character,
  changes,
  onApply,
  onCancel,
  isApplying,
}: LevelUpReviewProps) {
  const classData = getClassById(changes.classId)
  const className = classData?.name ?? changes.classId

  return (
    <div className="space-y-6" data-testid="level-up-review">
      <div className="text-center">
        <CheckCircle2 className="h-8 w-8 text-healing-green mx-auto mb-2" />
        <h3 className="text-lg font-heading font-bold text-parchment">
          Review Level Up
        </h3>
        <p className="text-sm text-parchment/60 mt-1">
          {character.name} &mdash; {className} {changes.newClassLevel}
        </p>
      </div>

      {/* Change summary */}
      <div className="space-y-3">
        {/* Level */}
        <ReviewItem
          icon={<ArrowUp className="h-4 w-4 text-accent-gold" />}
          label="Level"
          before={String(character.level)}
          after={String(changes.newLevel)}
          testId="review-level"
        />

        {/* HP */}
        {changes.hpIncrease > 0 && (
          <ReviewItem
            icon={<Heart className="h-4 w-4 text-healing-green" />}
            label="Max HP"
            before={String(character.hpMax)}
            after={String(character.hpMax + changes.hpIncrease)}
            detail={`+${changes.hpIncrease} HP`}
            testId="review-hp"
          />
        )}

        {/* Proficiency Bonus */}
        {changes.proficiencyBonusChange && (
          <ReviewItem
            icon={<Shield className="h-4 w-4 text-accent-gold" />}
            label="Proficiency Bonus"
            before={`+${changes.proficiencyBonusChange.from}`}
            after={`+${changes.proficiencyBonusChange.to}`}
            testId="review-proficiency"
          />
        )}

        {/* Features */}
        {changes.newFeatures.length > 0 && (
          <ReviewSection
            icon={<Star className="h-4 w-4 text-accent-gold" />}
            label="New Features"
            testId="review-features"
          >
            <ul className="mt-1 space-y-1">
              {changes.newFeatures.map((f) => (
                <li
                  key={f.id}
                  className="text-xs text-parchment/60 flex items-start gap-1"
                >
                  <span className="text-accent-gold mt-0.5">&bull;</span>
                  {f.name}
                </li>
              ))}
            </ul>
          </ReviewSection>
        )}

        {/* Subclass */}
        {changes.selectedSubclassId && (
          <ReviewItem
            icon={<Swords className="h-4 w-4 text-accent-gold" />}
            label="Subclass"
            before="None"
            after={changes.selectedSubclassId}
            testId="review-subclass"
          />
        )}

        {/* ASI */}
        {changes.asiMode === 'asi' && changes.asiChoices && changes.asiChoices.length > 0 && (
          <ReviewSection
            icon={<ArrowUp className="h-4 w-4 text-accent-gold" />}
            label="Ability Score Improvement"
            testId="review-asi"
          >
            <div className="mt-1 space-y-1">
              {changes.asiChoices.map((choice) => {
                const oldScore = character.abilityScores[choice.ability]
                const newScore = Math.min(20, oldScore + choice.amount)
                return (
                  <div
                    key={choice.ability}
                    className="text-xs text-parchment/60 flex items-center gap-1"
                  >
                    <span className="capitalize">{choice.ability}:</span>
                    <span>
                      {oldScore} &rarr;{' '}
                      <span className="text-healing-green font-bold">
                        {newScore}
                      </span>
                    </span>
                    <span className="text-parchment/40">
                      (mod: {getAbilityModifier(oldScore) >= 0 ? '+' : ''}
                      {getAbilityModifier(oldScore)} &rarr;{' '}
                      {getAbilityModifier(newScore) >= 0 ? '+' : ''}
                      {getAbilityModifier(newScore)})
                    </span>
                  </div>
                )
              })}
            </div>
          </ReviewSection>
        )}

        {/* Feat */}
        {changes.asiMode === 'feat' && changes.selectedFeat && (
          <ReviewItem
            icon={<BookOpen className="h-4 w-4 text-accent-gold" />}
            label="Feat"
            before="--"
            after={getFeatById(changes.selectedFeat.featId)?.name ?? changes.selectedFeat.featId}
            testId="review-feat"
          />
        )}

        {/* Spell slots */}
        {changes.newSpellSlots && (
          <ReviewSection
            icon={<Sparkles className="h-4 w-4 text-accent-gold" />}
            label="New Spell Slots"
            testId="review-spell-slots"
          >
            <div className="mt-1 flex gap-2 flex-wrap">
              {Object.entries(changes.newSpellSlots)
                .filter(([, count]) => count > 0)
                .map(([level, count]) => (
                  <span
                    key={level}
                    className="text-xs bg-accent-gold/10 text-accent-gold px-2 py-0.5 rounded"
                  >
                    +{count} Lv{level}
                  </span>
                ))}
            </div>
          </ReviewSection>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={isApplying}
          className={cn(
            'flex-1 rounded-lg border border-parchment/20 px-4 py-2.5',
            'text-sm font-medium text-parchment/70 transition-colors',
            'hover:border-parchment/40 hover:text-parchment',
            'focus:outline-none focus:ring-2 focus:ring-accent-gold/50',
            'disabled:opacity-50 disabled:cursor-not-allowed',
          )}
          data-testid="review-cancel-button"
        >
          Cancel
        </button>
        <motion.button
          type="button"
          onClick={onApply}
          disabled={isApplying || changes.hpIncrease === 0}
          whileTap={{ scale: 0.97 }}
          className={cn(
            'flex-1 rounded-lg px-4 py-2.5',
            'text-sm font-bold transition-colors',
            'bg-accent-gold text-primary',
            'hover:bg-accent-gold/90',
            'focus:outline-none focus:ring-2 focus:ring-accent-gold/50',
            'disabled:opacity-50 disabled:cursor-not-allowed',
          )}
          data-testid="review-apply-button"
          aria-label="Apply level up changes"
        >
          {isApplying ? 'Applying...' : 'Apply Level Up'}
        </motion.button>
      </div>
    </div>
  )
}

// -- ReviewItem ---------------------------------------------------------------

interface ReviewItemProps {
  icon: React.ReactNode
  label: string
  before: string
  after: string
  detail?: string
  testId: string
}

function ReviewItem({ icon, label, before, after, detail, testId }: ReviewItemProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-between rounded-lg border border-parchment/10',
        'bg-parchment/5 px-3 py-2',
      )}
      data-testid={testId}
    >
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-sm text-parchment/70">{label}</span>
      </div>
      <div className="text-sm text-right">
        <span className="text-parchment/40">{before}</span>
        <span className="text-parchment/40 mx-1">&rarr;</span>
        <span className="font-bold text-healing-green">{after}</span>
        {detail && (
          <span className="text-xs text-parchment/40 ml-1">({detail})</span>
        )}
      </div>
    </div>
  )
}

// -- ReviewSection ------------------------------------------------------------

interface ReviewSectionProps {
  icon: React.ReactNode
  label: string
  testId: string
  children: React.ReactNode
}

function ReviewSection({ icon, label, testId, children }: ReviewSectionProps) {
  return (
    <div
      className={cn(
        'rounded-lg border border-parchment/10 bg-parchment/5 p-3',
      )}
      data-testid={testId}
    >
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-sm font-semibold text-parchment/70">{label}</span>
      </div>
      {children}
    </div>
  )
}
