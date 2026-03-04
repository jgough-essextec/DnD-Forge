/**
 * SessionAbilityRow (Epic 32 - Story 32.1)
 *
 * Row of pinned skill and saving throw values for the session view.
 * Each entry is a RollableValue -- tapping rolls 1d20 + modifier.
 * Shows skill/save name, modifier, and proficiency indicator.
 */

import { cn } from '@/lib/utils'
import { RollableValue } from '@/components/dice/RollableValue'
import { formatSkillName } from '@/utils/session-view'
import type { SkillName, AbilityName } from '@/types/core'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PinnedAbility {
  /** Skill name or 'save-{ability}' */
  id: string
  /** Display label */
  label: string
  /** Total modifier */
  modifier: number
  /** Whether proficient */
  proficient: boolean
  /** Type indicator */
  type: 'skill' | 'save'
}

interface SessionAbilityRowProps {
  /** Pinned skill/save IDs */
  pinnedSkills: string[]
  /** All 18 skill modifiers */
  skillModifiers: Record<SkillName, number>
  /** All 6 saving throw modifiers */
  savingThrows: Record<AbilityName, number>
  /** Skill proficiency data from character */
  proficientSkills: SkillName[]
  /** Saving throw proficiency data from character */
  proficientSaves: AbilityName[]
  className?: string
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const ABILITY_LABELS: Record<AbilityName, string> = {
  strength: 'STR Save',
  dexterity: 'DEX Save',
  constitution: 'CON Save',
  intelligence: 'INT Save',
  wisdom: 'WIS Save',
  charisma: 'CHA Save',
}

function formatModifier(value: number): string {
  return value >= 0 ? `+${value}` : `${value}`
}

function resolvePinnedAbility(
  id: string,
  skillModifiers: Record<SkillName, number>,
  savingThrows: Record<AbilityName, number>,
  proficientSkills: SkillName[],
  proficientSaves: AbilityName[],
): PinnedAbility | null {
  // Check if this is a saving throw
  if (id.startsWith('save-')) {
    const ability = id.replace('save-', '') as AbilityName
    const modifier = savingThrows[ability]
    if (modifier === undefined) return null
    return {
      id,
      label: ABILITY_LABELS[ability] ?? ability,
      modifier,
      proficient: proficientSaves.includes(ability),
      type: 'save',
    }
  }

  // Otherwise it's a skill
  const skill = id as SkillName
  const modifier = skillModifiers[skill]
  if (modifier === undefined) return null
  return {
    id,
    label: formatSkillName(skill),
    modifier,
    proficient: proficientSkills.includes(skill),
    type: 'skill',
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function SessionAbilityRow({
  pinnedSkills,
  skillModifiers,
  savingThrows,
  proficientSkills,
  proficientSaves,
  className,
}: SessionAbilityRowProps) {
  const abilities = pinnedSkills
    .map((id) =>
      resolvePinnedAbility(
        id,
        skillModifiers,
        savingThrows,
        proficientSkills,
        proficientSaves,
      ),
    )
    .filter((a): a is PinnedAbility => a !== null)

  return (
    <div
      className={cn('flex flex-wrap gap-2', className)}
      data-testid="session-ability-row"
      role="list"
      aria-label="Pinned skills and saves"
    >
      {abilities.map((ability) => (
        <div key={ability.id} role="listitem">
          <RollableValue
            modifier={ability.modifier}
            label={ability.label}
            className={cn(
              'flex flex-col items-center justify-center',
              'rounded-lg border border-parchment/20 bg-bg-secondary',
              'px-3 py-2 min-w-[72px] min-h-[44px]',
              'hover:border-accent-gold/40 transition-colors',
            )}
          >
            <span className="text-[10px] text-parchment/60 font-medium leading-tight truncate max-w-[80px]">
              {ability.label}
            </span>
            <span className="flex items-center gap-1 mt-0.5">
              {ability.proficient && (
                <span
                  className="w-1.5 h-1.5 rounded-full bg-accent-gold inline-block flex-shrink-0"
                  aria-label="Proficient"
                  data-testid={`proficiency-dot-${ability.id}`}
                />
              )}
              <span className="text-base font-bold text-parchment tabular-nums">
                {formatModifier(ability.modifier)}
              </span>
            </span>
          </RollableValue>
        </div>
      ))}
    </div>
  )
}
