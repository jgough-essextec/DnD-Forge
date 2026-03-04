// =============================================================================
// Story 10.4 -- SubclassSelector
// L1 subclass picker for Cleric (Divine Domain), Sorcerer (Sorcerous Origin),
// and Warlock (Otherworldly Patron). Uses ChoiceGroup with subclass options
// and descriptions.
// =============================================================================

import { useMemo } from 'react'
import { ChoiceGroup } from '@/components/shared/ChoiceGroup'
import type { CharacterClass } from '@/types/class'

// -- SRD Subclass data (only 1 subclass per class in SRD) ---------------------
// The CLASSES data has empty subclasses arrays, so we define the SRD subclass
// data here for the three classes that choose subclass at level 1.

export interface SrdSubclassOption {
  id: string
  name: string
  description: string
  features: string
}

export const SRD_SUBCLASSES: Record<string, SrdSubclassOption[]> = {
  cleric: [
    {
      id: 'life-domain',
      name: 'Life Domain',
      description:
        'The Life domain focuses on the vibrant positive energy that sustains all life. Gods of life promote vitality and health through healing the sick and wounded.',
      features:
        'Bonus Proficiency (heavy armor), Disciple of Life (+2 + spell level to healing spells), Domain Spells (Bless, Cure Wounds)',
    },
  ],
  sorcerer: [
    {
      id: 'draconic-bloodline',
      name: 'Draconic Bloodline',
      description:
        'Your innate magic comes from draconic magic that was mingled with your blood or that of your ancestors. Choose a dragon ancestry type.',
      features:
        'Draconic Resilience (+1 HP per level, AC = 13 + DEX mod when unarmored), Dragon Ancestor (choose dragon type for elemental affinity)',
    },
  ],
  warlock: [
    {
      id: 'the-fiend',
      name: 'The Fiend',
      description:
        'You have made a pact with a fiend from the lower planes of existence. Such beings desire the corruption or destruction of all things.',
      features:
        "Dark One's Blessing (gain temporary HP equal to CHA mod + warlock level on killing a creature), Expanded Spell List",
    },
  ],
}

// -- Component ----------------------------------------------------------------

interface SubclassSelectorProps {
  characterClass: CharacterClass
  selectedSubclassId: string | null
  onSubclassChange: (subclassId: string | null) => void
}

export function SubclassSelector({
  characterClass,
  selectedSubclassId,
  onSubclassChange,
}: SubclassSelectorProps) {
  // Classes without L1 subclass show an informational note
  if (characterClass.subclassLevel !== 1) {
    return (
      <div className="rounded-lg border border-parchment/15 bg-parchment/5 p-4">
        <p className="text-sm text-parchment/60">
          You will choose your{' '}
          <span className="font-semibold text-parchment/80">
            {characterClass.subclassName}
          </span>{' '}
          at level {characterClass.subclassLevel}.
        </p>
      </div>
    )
  }

  const subclassOptions = SRD_SUBCLASSES[characterClass.id] ?? []

  const choiceOptions = useMemo(
    () =>
      subclassOptions.map((sub) => ({
        value: sub.id,
        label: sub.name,
        description: `${sub.description}\n\nKey Features: ${sub.features}`,
      })),
    [subclassOptions],
  )

  return (
    <div>
      <h3 className="text-sm font-heading font-semibold text-parchment mb-1">
        {characterClass.subclassName}
      </h3>
      <p className="text-xs text-parchment/50 mb-3">
        Choose your {characterClass.subclassName}. This choice grants additional
        features at level 1.
      </p>

      {subclassOptions.length > 0 ? (
        <ChoiceGroup
          options={choiceOptions}
          selectedValue={selectedSubclassId}
          onSelect={(value) => onSubclassChange(value)}
          label={`Select ${characterClass.subclassName}`}
        />
      ) : (
        <p className="text-sm text-parchment/50 italic">
          No subclass options available for this class in the SRD.
        </p>
      )}
    </div>
  )
}
