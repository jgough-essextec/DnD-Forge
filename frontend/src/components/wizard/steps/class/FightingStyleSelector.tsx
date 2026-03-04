// =============================================================================
// Story 10.5 -- FightingStyleSelector
// Fighting style picker for Fighter, Paladin, and Ranger.
// Uses ChoiceGroup with style options and descriptions.
// =============================================================================

import { useMemo } from 'react'
import { ChoiceGroup } from '@/components/shared/ChoiceGroup'
import type { CharacterClass, FightingStyle } from '@/types/class'

// -- Fighting Style data (SRD) ------------------------------------------------

interface FightingStyleOption {
  id: FightingStyle
  name: string
  description: string
}

const ALL_FIGHTING_STYLES: FightingStyleOption[] = [
  {
    id: 'archery',
    name: 'Archery',
    description: 'You gain a +2 bonus to attack rolls you make with ranged weapons.',
  },
  {
    id: 'defense',
    name: 'Defense',
    description: 'While you are wearing armor, you gain a +1 bonus to AC.',
  },
  {
    id: 'dueling',
    name: 'Dueling',
    description:
      'When you are wielding a melee weapon in one hand and no other weapons, you gain a +2 bonus to damage rolls with that weapon.',
  },
  {
    id: 'great-weapon-fighting',
    name: 'Great Weapon Fighting',
    description:
      'When you roll a 1 or 2 on a damage die for an attack you make with a melee weapon that you are wielding with two hands, you can reroll the die and must use the new roll. The weapon must have the two-handed or versatile property.',
  },
  {
    id: 'protection',
    name: 'Protection',
    description:
      'When a creature you can see attacks a target other than you that is within 5 feet of you, you can use your reaction to impose disadvantage on the attack roll. You must be wielding a shield.',
  },
  {
    id: 'two-weapon-fighting',
    name: 'Two-Weapon Fighting',
    description:
      'When you engage in two-weapon fighting, you can add your ability modifier to the damage of the second attack.',
  },
]

// Which fighting styles each class can pick
const CLASS_FIGHTING_STYLES: Record<string, FightingStyle[]> = {
  fighter: ['archery', 'defense', 'dueling', 'great-weapon-fighting', 'protection', 'two-weapon-fighting'],
  paladin: ['defense', 'dueling', 'great-weapon-fighting', 'protection'],
  ranger: ['archery', 'defense', 'dueling', 'two-weapon-fighting'],
}

// Classes that get fighting style at level 1
export const FIGHTING_STYLE_CLASSES = ['fighter', 'paladin', 'ranger']

// -- Component ----------------------------------------------------------------

interface FightingStyleSelectorProps {
  characterClass: CharacterClass
  selectedStyle: FightingStyle | null
  onStyleChange: (style: FightingStyle | null) => void
}

export function FightingStyleSelector({
  characterClass,
  selectedStyle,
  onStyleChange,
}: FightingStyleSelectorProps) {
  const availableStyleIds = CLASS_FIGHTING_STYLES[characterClass.id] ?? []

  const choiceOptions = useMemo(
    () =>
      ALL_FIGHTING_STYLES
        .filter((s) => availableStyleIds.includes(s.id))
        .map((s) => ({
          value: s.id as FightingStyle,
          label: s.name,
          description: s.description,
        })),
    [availableStyleIds],
  )

  if (!FIGHTING_STYLE_CLASSES.includes(characterClass.id)) {
    return null
  }

  return (
    <div>
      <h3 className="text-sm font-heading font-semibold text-parchment mb-1">
        Fighting Style
      </h3>
      <p className="text-xs text-parchment/50 mb-3">
        Choose a fighting style. Each grants a specific combat benefit.
      </p>

      <ChoiceGroup
        options={choiceOptions}
        selectedValue={selectedStyle}
        onSelect={(value) => onStyleChange(value)}
        label="Select Fighting Style"
      />
    </div>
  )
}
