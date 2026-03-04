/**
 * SubraceSelector -- Subrace picker for races with subraces.
 *
 * Uses ChoiceGroup to display subrace options with additional ability
 * bonuses and unique traits.
 */

import { ChoiceGroup } from '@/components/shared/ChoiceGroup'
import type { Race, Subrace } from '@/types/race'
import type { AbilityName } from '@/types/core'

interface SubraceSelectorProps {
  race: Race
  selectedSubraceId: string | null
  onSelectSubrace: (subraceId: string) => void
}

const ABILITY_SHORT: Record<AbilityName, string> = {
  strength: 'STR',
  dexterity: 'DEX',
  constitution: 'CON',
  intelligence: 'INT',
  wisdom: 'WIS',
  charisma: 'CHA',
}

/** Format subrace ability bonuses into a readable string */
function formatSubraceBonuses(subrace: Subrace): string {
  const bonuses = Object.entries(subrace.abilityScoreIncrease)
    .filter(([, val]) => val && val !== 0)
    .map(([ability, val]) => `+${val} ${ABILITY_SHORT[ability as AbilityName]}`)
    .join(', ')

  const traitNames = subrace.traits.map((t) => t.name).join(', ')

  const parts: string[] = []
  if (bonuses) parts.push(bonuses)
  if (traitNames) parts.push(traitNames)

  return parts.join(' -- ')
}

export function SubraceSelector({
  race,
  selectedSubraceId,
  onSelectSubrace,
}: SubraceSelectorProps) {
  if (race.subraces.length === 0) {
    return null
  }

  const options = race.subraces.map((subrace) => ({
    value: subrace.id,
    label: subrace.name,
    description: formatSubraceBonuses(subrace),
  }))

  return (
    <div data-testid="subrace-selector">
      <h4 className="text-sm font-semibold text-parchment mb-2">
        Choose a Subrace
      </h4>
      <ChoiceGroup
        options={options}
        selectedValue={selectedSubraceId}
        onSelect={onSelectSubrace}
        label={`Choose a subrace for ${race.name}`}
      />
    </div>
  )
}
