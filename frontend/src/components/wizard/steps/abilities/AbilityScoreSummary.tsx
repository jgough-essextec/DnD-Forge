// =============================================================================
// Story 11.5 -- AbilityScoreSummary
// Summary panel showing base scores + racial bonuses = final scores with
// modifiers, gameplay implications, and derived combat stats preview.
// =============================================================================

import { useMemo } from 'react'
import type { AbilityScores, AbilityName } from '@/types/core'
import { ABILITY_NAMES } from '@/types/core'
import { getModifier } from '@/utils/calculations/ability'
import { ModifierBadge } from '@/components/shared/ModifierBadge'
import { cn } from '@/lib/utils'

interface AbilityScoreSummaryProps {
  baseScores: AbilityScores
  racialBonuses: Partial<AbilityScores>
  finalScores: AbilityScores
}

const ABILITY_FULL_NAMES: Record<AbilityName, string> = {
  strength: 'Strength',
  dexterity: 'Dexterity',
  constitution: 'Constitution',
  intelligence: 'Intelligence',
  wisdom: 'Wisdom',
  charisma: 'Charisma',
}

const ABILITY_ABBREVS: Record<AbilityName, string> = {
  strength: 'STR',
  dexterity: 'DEX',
  constitution: 'CON',
  intelligence: 'INT',
  wisdom: 'WIS',
  charisma: 'CHA',
}

/** Gameplay implications for high/low scores. */
function getImplication(ability: AbilityName, total: number): string | null {
  if (total >= 15) {
    switch (ability) {
      case 'strength':
        return 'Strong -- great for Athletics and melee attacks'
      case 'dexterity':
        return 'Agile -- good AC, initiative, and ranged attacks'
      case 'constitution':
        return 'Hardy -- more hit points and endurance'
      case 'intelligence':
        return 'Brilliant -- excellent for Arcana, Investigation, and Wizard spellcasting'
      case 'wisdom':
        return 'Perceptive -- great for Perception, Insight, and Cleric/Druid spellcasting'
      case 'charisma':
        return 'Magnetic -- powerful for Persuasion, Deception, and Bard/Sorcerer/Warlock spellcasting'
    }
  }
  if (total <= 9) {
    switch (ability) {
      case 'strength':
        return 'Weak -- struggle with Athletics and carrying heavy gear'
      case 'dexterity':
        return 'Clumsy -- lower AC, initiative, and finesse'
      case 'constitution':
        return 'Frail -- fewer hit points, harder to maintain concentration'
      case 'intelligence':
        return 'Dim -- struggle with knowledge and investigation checks'
      case 'wisdom':
        return 'Oblivious -- weak Perception and vulnerable to mind effects'
      case 'charisma':
        return 'Awkward -- struggle with social interactions'
    }
  }
  return null
}

export function AbilityScoreSummary({
  baseScores,
  racialBonuses,
  finalScores,
}: AbilityScoreSummaryProps) {
  const implications = useMemo(() => {
    const result: Array<{ ability: AbilityName; text: string; isGood: boolean }> = []
    for (const ability of ABILITY_NAMES) {
      const total = finalScores[ability]
      const text = getImplication(ability, total)
      if (text) {
        result.push({ ability, text, isGood: total >= 15 })
      }
    }
    return result
  }, [finalScores])

  return (
    <div className="space-y-4" data-testid="ability-score-summary">
      <h4 className="text-sm font-semibold text-parchment/70 uppercase tracking-wider">
        Ability Score Summary
      </h4>

      {/* Summary Table */}
      <div className="rounded-lg border border-parchment/15 overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-5 gap-2 px-4 py-2 bg-bg-secondary/80 border-b border-parchment/10">
          <span className="text-xs text-parchment/50 font-medium">Ability</span>
          <span className="text-xs text-parchment/50 font-medium text-center">Base</span>
          <span className="text-xs text-parchment/50 font-medium text-center">Racial</span>
          <span className="text-xs text-parchment/50 font-medium text-center">Total</span>
          <span className="text-xs text-parchment/50 font-medium text-center">Mod</span>
        </div>

        {/* Rows */}
        {ABILITY_NAMES.map((ability) => {
          const base = baseScores[ability]
          const racial = racialBonuses[ability] ?? 0
          const total = finalScores[ability]
          const modifier = getModifier(total)

          return (
            <div
              key={ability}
              className="grid grid-cols-5 gap-2 px-4 py-2.5 border-b border-parchment/5 last:border-b-0"
              data-testid={`summary-row-${ability}`}
            >
              <span className="text-sm font-medium text-parchment">
                {ABILITY_ABBREVS[ability]}
              </span>
              <span className="text-sm text-parchment/70 text-center" data-testid={`base-score-${ability}`}>
                {base}
              </span>
              <span
                className={cn(
                  'text-sm text-center',
                  racial > 0 ? 'text-accent-gold' : 'text-parchment/30',
                )}
                data-testid={`racial-bonus-${ability}`}
              >
                {racial > 0 ? `+${racial}` : racial < 0 ? `${racial}` : '--'}
              </span>
              <span className="text-sm font-bold text-parchment text-center" data-testid={`total-score-${ability}`}>
                {total}
              </span>
              <div className="flex justify-center">
                <ModifierBadge value={modifier} size="sm" />
              </div>
            </div>
          )
        })}
      </div>

      {/* Gameplay Implications */}
      {implications.length > 0 && (
        <div
          className="rounded-lg border border-parchment/15 bg-bg-secondary/50 p-4"
          data-testid="gameplay-implications"
        >
          <p className="text-xs font-semibold text-parchment/60 mb-2 uppercase tracking-wider">
            What This Means
          </p>
          <div className="space-y-1.5">
            {implications.map(({ ability, text, isGood }) => (
              <div key={ability} className="flex items-start gap-2 text-xs">
                <span
                  className={cn(
                    'mt-0.5 flex-shrink-0',
                    isGood ? 'text-emerald-400' : 'text-amber-400',
                  )}
                >
                  {isGood ? '+' : '-'}
                </span>
                <span className="text-parchment/60">
                  <strong className="text-parchment/80">
                    {ABILITY_FULL_NAMES[ability]} {finalScores[ability]}:
                  </strong>{' '}
                  {text}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
