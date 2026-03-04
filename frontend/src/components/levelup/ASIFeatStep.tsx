/**
 * ASIFeatStep (Story 31.5)
 *
 * Conditional step at ASI levels. Two modes:
 * - ASI: +2 to one ability or +1/+1 to two. Capped at 20.
 * - Feat: pick a feat with prerequisite checking.
 * Shows cascade stat recalculation preview.
 */

import { useState, useMemo } from 'react'
import { ArrowUp, BookOpen, ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { ABILITY_NAMES, type AbilityName } from '@/types/core'
import type { Feat, FeatPrerequisite } from '@/types/background'
import { FEATS } from '@/data/feats'
import { getAbilityModifier } from '@/data/reference'
import type { LevelUpChanges } from '@/utils/levelup'
import type { Character } from '@/types/character'

type ASIMode = 'asi' | 'feat'
type ASIDistribution = 'single' | 'split'

interface ASIFeatStepProps {
  character: Character
  changes: LevelUpChanges
  onASIChange: (
    mode: ASIMode,
    asiChoices?: { ability: AbilityName; amount: number }[],
    featSelection?: { featId: string; chosenAbility?: AbilityName },
  ) => void
}

export function ASIFeatStep({
  character,
  changes,
  onASIChange,
}: ASIFeatStepProps) {
  const [mode, setMode] = useState<ASIMode>('asi')
  const [distribution, setDistribution] = useState<ASIDistribution>('single')
  const [singleAbility, setSingleAbility] = useState<AbilityName | null>(null)
  const [splitFirst, setSplitFirst] = useState<AbilityName | null>(null)
  const [splitSecond, setSplitSecond] = useState<AbilityName | null>(null)
  const [selectedFeatId, setSelectedFeatId] = useState<string | null>(null)
  const [expandedFeat, setExpandedFeat] = useState<string | null>(null)

  // Check feat prerequisites
  const availableFeats = useMemo(() => {
    return (FEATS as readonly Feat[]).filter((feat) => {
      if (!feat.prerequisite) return true
      return checkPrerequisite(feat.prerequisite, character)
    })
  }, [character])

  // Handle mode change
  const handleModeChange = (newMode: ASIMode) => {
    setMode(newMode)
    // Reset selections
    setSingleAbility(null)
    setSplitFirst(null)
    setSplitSecond(null)
    setSelectedFeatId(null)
    // Notify parent of cleared state
    if (newMode === 'asi') {
      onASIChange('asi', [])
    } else {
      onASIChange('feat')
    }
  }

  // Handle ASI selection
  const handleASISingle = (ability: AbilityName) => {
    setSingleAbility(ability)
    onASIChange('asi', [{ ability, amount: 2 }])
  }

  const handleASISplitFirst = (ability: AbilityName) => {
    setSplitFirst(ability)
    if (splitSecond && splitSecond !== ability) {
      onASIChange('asi', [
        { ability, amount: 1 },
        { ability: splitSecond, amount: 1 },
      ])
    }
  }

  const handleASISplitSecond = (ability: AbilityName) => {
    setSplitSecond(ability)
    if (splitFirst && splitFirst !== ability) {
      onASIChange('asi', [
        { ability: splitFirst, amount: 1 },
        { ability, amount: 1 },
      ])
    }
  }

  const handleFeatSelect = (featId: string) => {
    setSelectedFeatId(featId)
    onASIChange('feat', undefined, { featId })
  }

  return (
    <div className="space-y-6" data-testid="asi-feat-step">
      <div className="text-center">
        <ArrowUp className="h-8 w-8 text-accent-gold mx-auto mb-2" />
        <h3 className="text-lg font-heading font-bold text-parchment">
          Ability Score Improvement
        </h3>
        <p className="text-sm text-parchment/60 mt-1">
          Increase your abilities or choose a feat.
        </p>
      </div>

      {/* Mode toggle */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => handleModeChange('asi')}
          className={cn(
            'flex flex-col items-center gap-2 rounded-lg border-2 p-3 transition-all',
            'focus:outline-none focus:ring-2 focus:ring-accent-gold/50',
            mode === 'asi'
              ? 'border-accent-gold bg-accent-gold/5'
              : 'border-parchment/20 hover:border-parchment/40',
          )}
          data-testid="asi-mode-button"
          aria-pressed={mode === 'asi'}
        >
          <ArrowUp className="h-5 w-5 text-accent-gold" />
          <span className="text-sm font-semibold text-parchment">
            Ability Scores
          </span>
        </button>
        <button
          type="button"
          onClick={() => handleModeChange('feat')}
          className={cn(
            'flex flex-col items-center gap-2 rounded-lg border-2 p-3 transition-all',
            'focus:outline-none focus:ring-2 focus:ring-accent-gold/50',
            mode === 'feat'
              ? 'border-accent-gold bg-accent-gold/5'
              : 'border-parchment/20 hover:border-parchment/40',
          )}
          data-testid="feat-mode-button"
          aria-pressed={mode === 'feat'}
        >
          <BookOpen className="h-5 w-5 text-accent-gold" />
          <span className="text-sm font-semibold text-parchment">Feat</span>
        </button>
      </div>

      <AnimatePresence mode="wait">
        {mode === 'asi' ? (
          <motion.div
            key="asi"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-4"
          >
            {/* Distribution choice */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setDistribution('single')
                  setSplitFirst(null)
                  setSplitSecond(null)
                }}
                className={cn(
                  'flex-1 text-sm rounded-lg border p-2 transition-all',
                  'focus:outline-none focus:ring-2 focus:ring-accent-gold/50',
                  distribution === 'single'
                    ? 'border-accent-gold bg-accent-gold/10 text-parchment'
                    : 'border-parchment/20 text-parchment/60 hover:border-parchment/40',
                )}
                data-testid="asi-single-button"
              >
                +2 to One
              </button>
              <button
                type="button"
                onClick={() => {
                  setDistribution('split')
                  setSingleAbility(null)
                }}
                className={cn(
                  'flex-1 text-sm rounded-lg border p-2 transition-all',
                  'focus:outline-none focus:ring-2 focus:ring-accent-gold/50',
                  distribution === 'split'
                    ? 'border-accent-gold bg-accent-gold/10 text-parchment'
                    : 'border-parchment/20 text-parchment/60 hover:border-parchment/40',
                )}
                data-testid="asi-split-button"
              >
                +1 / +1
              </button>
            </div>

            {/* Ability score grid */}
            {distribution === 'single' ? (
              <AbilityScoreGrid
                scores={character.abilityScores}
                selected={singleAbility ? [singleAbility] : []}
                onSelect={handleASISingle}
                boost={2}
                maxSelections={1}
              />
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-parchment/50">
                  Select two different abilities:
                </p>
                <AbilityScoreGrid
                  scores={character.abilityScores}
                  selected={[splitFirst, splitSecond].filter(Boolean) as AbilityName[]}
                  onSelect={(ability) => {
                    if (!splitFirst || (splitFirst && splitSecond)) {
                      setSplitSecond(null)
                      handleASISplitFirst(ability)
                    } else if (ability !== splitFirst) {
                      handleASISplitSecond(ability)
                    }
                  }}
                  boost={1}
                  maxSelections={2}
                />
              </div>
            )}

            {/* Preview */}
            {(singleAbility || (splitFirst && splitSecond)) && (
              <ASIPreview
                character={character}
                changes={changes}
                singleAbility={distribution === 'single' ? singleAbility : null}
                splitFirst={distribution === 'split' ? splitFirst : null}
                splitSecond={distribution === 'split' ? splitSecond : null}
              />
            )}
          </motion.div>
        ) : (
          <motion.div
            key="feat"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-3"
            data-testid="feat-list"
          >
            {availableFeats.map((feat) => (
              <div
                key={feat.id}
                className={cn(
                  'rounded-lg border-2 transition-all cursor-pointer',
                  selectedFeatId === feat.id
                    ? 'border-accent-gold bg-accent-gold/5'
                    : 'border-parchment/15 hover:border-parchment/30',
                )}
                data-testid={`feat-option-${feat.id}`}
                role="button"
                tabIndex={0}
                aria-pressed={selectedFeatId === feat.id}
                onClick={() => handleFeatSelect(feat.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    handleFeatSelect(feat.id)
                  }
                }}
              >
                <div className="p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-parchment">
                      {feat.name}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        setExpandedFeat(
                          expandedFeat === feat.id ? null : feat.id,
                        )
                      }}
                      className="p-1 rounded hover:bg-parchment/10"
                      aria-label={`${expandedFeat === feat.id ? 'Collapse' : 'Expand'} ${feat.name} details`}
                    >
                      <ChevronDown
                        className={cn(
                          'h-4 w-4 text-parchment/40 transition-transform',
                          expandedFeat === feat.id && 'rotate-180',
                        )}
                      />
                    </button>
                  </div>
                  {feat.prerequisite && (
                    <p className="text-[10px] text-parchment/40 mt-0.5">
                      Prerequisite: {formatPrerequisite(feat.prerequisite)}
                    </p>
                  )}
                </div>
                <AnimatePresence>
                  {expandedFeat === feat.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-3 pb-3 border-t border-parchment/10 pt-2">
                        <p className="text-xs text-parchment/60 leading-relaxed">
                          {feat.description}
                        </p>
                        <ul className="mt-2 space-y-1">
                          {feat.mechanicalEffects.map((effect, i) => (
                            <li
                              key={i}
                              className="text-xs text-parchment/50 flex items-start gap-1"
                            >
                              <span className="text-accent-gold mt-0.5">
                                &bull;
                              </span>
                              {effect}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// -- AbilityScoreGrid ---------------------------------------------------------

interface AbilityScoreGridProps {
  scores: Record<AbilityName, number>
  selected: AbilityName[]
  onSelect: (ability: AbilityName) => void
  boost: number
  maxSelections: number
}

function AbilityScoreGrid({
  scores,
  selected,
  onSelect,
  boost,
  maxSelections,
}: AbilityScoreGridProps) {
  return (
    <div
      className="grid grid-cols-3 gap-2"
      role="group"
      aria-label="Ability score selection"
      data-testid="ability-score-grid"
    >
      {ABILITY_NAMES.map((ability) => {
        const currentScore = scores[ability]
        const isSelected = selected.includes(ability)
        const wouldExceedCap = currentScore + boost > 20
        const isMaxed = currentScore >= 20
        const isDisabled =
          isMaxed ||
          (wouldExceedCap && !isSelected) ||
          (!isSelected && selected.length >= maxSelections)

        const newScore = isSelected
          ? Math.min(20, currentScore + boost)
          : currentScore
        const newMod = getAbilityModifier(newScore)
        const currentMod = getAbilityModifier(currentScore)

        return (
          <button
            key={ability}
            type="button"
            onClick={() => !isDisabled && onSelect(ability)}
            disabled={isDisabled}
            className={cn(
              'rounded-lg border-2 p-2 text-center transition-all',
              'focus:outline-none focus:ring-2 focus:ring-accent-gold/50',
              isSelected
                ? 'border-accent-gold bg-accent-gold/10'
                : isDisabled
                  ? 'border-parchment/10 opacity-40 cursor-not-allowed'
                  : 'border-parchment/20 hover:border-parchment/40 cursor-pointer',
            )}
            data-testid={`ability-${ability}`}
            aria-pressed={isSelected}
          >
            <span className="text-[10px] uppercase tracking-wider text-parchment/50 block">
              {ability.slice(0, 3)}
            </span>
            <span
              className={cn(
                'text-lg font-bold block',
                isSelected ? 'text-accent-gold' : 'text-parchment',
              )}
            >
              {currentScore}
              {isSelected && (
                <span className="text-healing-green text-sm ml-1">
                  +{boost}
                </span>
              )}
            </span>
            <span className="text-[10px] text-parchment/40 block">
              mod: {currentMod >= 0 ? '+' : ''}
              {currentMod}
              {isSelected && newMod !== currentMod && (
                <span className="text-healing-green">
                  {' \u2192 '}
                  {newMod >= 0 ? '+' : ''}
                  {newMod}
                </span>
              )}
            </span>
          </button>
        )
      })}
    </div>
  )
}

// -- ASI Preview --------------------------------------------------------------

interface ASIPreviewProps {
  character: Character
  changes: LevelUpChanges
  singleAbility: AbilityName | null
  splitFirst: AbilityName | null
  splitSecond: AbilityName | null
}

function ASIPreview({
  character,
  changes,
  singleAbility,
  splitFirst,
  splitSecond,
}: ASIPreviewProps) {
  const previews: { ability: AbilityName; from: number; to: number }[] = []

  if (singleAbility) {
    const from = character.abilityScores[singleAbility]
    previews.push({ ability: singleAbility, from, to: Math.min(20, from + 2) })
  }
  if (splitFirst) {
    const from = character.abilityScores[splitFirst]
    previews.push({ ability: splitFirst, from, to: Math.min(20, from + 1) })
  }
  if (splitSecond) {
    const from = character.abilityScores[splitSecond]
    previews.push({ ability: splitSecond, from, to: Math.min(20, from + 1) })
  }

  // Check if CON is being boosted
  const conBoosted = previews.some((p) => p.ability === 'constitution')

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-lg border border-parchment/15 bg-parchment/5 p-3 space-y-2"
      data-testid="asi-preview"
    >
      <span className="text-xs font-semibold text-parchment/60 uppercase tracking-wider">
        Preview
      </span>
      {previews.map((p) => (
        <div key={p.ability} className="flex items-center justify-between text-sm">
          <span className="text-parchment/70 capitalize">{p.ability}</span>
          <span className="text-parchment">
            {p.from} &rarr;{' '}
            <span className="text-healing-green font-bold">{p.to}</span>
            <span className="text-parchment/40 ml-1 text-xs">
              (mod: {getAbilityModifier(p.from) >= 0 ? '+' : ''}
              {getAbilityModifier(p.from)} &rarr;{' '}
              {getAbilityModifier(p.to) >= 0 ? '+' : ''}
              {getAbilityModifier(p.to)})
            </span>
          </span>
        </div>
      ))}
      {conBoosted && (
        <p className="text-xs text-healing-green/80 italic">
          CON increase: HP will be retroactively adjusted for all{' '}
          {changes.newLevel} levels.
        </p>
      )}
    </motion.div>
  )
}

// -- Helpers ------------------------------------------------------------------

function checkPrerequisite(
  prereq: FeatPrerequisite,
  character: Character,
): boolean {
  if (prereq.minAbilityScore) {
    for (const [ability, min] of Object.entries(prereq.minAbilityScore)) {
      const score = character.abilityScores[ability as AbilityName]
      if (score < (min ?? 0)) return false
    }
  }
  if (prereq.spellcasting) {
    if (!character.spellcasting) return false
  }
  if (prereq.armorProficiency) {
    if (character.proficiencies.armor.length === 0) return false
  }
  return true
}

function formatPrerequisite(prereq: FeatPrerequisite): string {
  const parts: string[] = []
  if (prereq.minAbilityScore) {
    for (const [ability, min] of Object.entries(prereq.minAbilityScore)) {
      parts.push(`${ability.charAt(0).toUpperCase() + ability.slice(1)} ${min}+`)
    }
  }
  if (prereq.spellcasting) parts.push('Spellcasting ability')
  if (prereq.armorProficiency) parts.push('Armor proficiency')
  return parts.join(', ')
}
