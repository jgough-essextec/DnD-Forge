/**
 * RaceStep -- Main wizard step component for race selection.
 *
 * Provides:
 * - Race browsing via SelectableCardGrid with search/filter
 * - Race detail slide panel with full info
 * - Subrace selection for races with subraces
 * - Racial choice pickers (Half-Elf, Variant Human, High Elf, Dragonborn)
 * - Validation: reports to wizard shell via onValidationChange
 * - State persistence via wizardStore
 */

import { useState, useEffect, useCallback, useMemo } from 'react'
import { SelectableCardGrid } from '@/components/shared/SelectableCardGrid'
import { SearchFilterBar } from '@/components/shared/SearchFilterBar'
import { DetailSlidePanel } from '@/components/shared/DetailSlidePanel'
import { RaceCard } from './RaceCard'
import { RaceDetailPanel } from './RaceDetailPanel'
import type { RacialChoiceState } from './RaceDetailPanel'
import { useWizardStore } from '@/stores/wizardStore'
import { races } from '@/data/races'
import type { Race, RaceSelection, AbilityBonus } from '@/types/race'
import type { AbilityName, Language, SkillName } from '@/types/core'
import type { WizardStepProps } from '@/components/wizard/types'
import type { FilterDef } from '@/components/shared/SearchFilterBar'

// =============================================================================
// Filter Definitions
// =============================================================================

const SIZE_OPTIONS = [
  { value: 'small', label: 'Small' },
  { value: 'medium', label: 'Medium' },
]

const ABILITY_OPTIONS: { value: string; label: string }[] = [
  { value: 'strength', label: 'STR' },
  { value: 'dexterity', label: 'DEX' },
  { value: 'constitution', label: 'CON' },
  { value: 'intelligence', label: 'INT' },
  { value: 'wisdom', label: 'WIS' },
  { value: 'charisma', label: 'CHA' },
]

const FILTERS: FilterDef[] = [
  {
    id: 'size',
    label: 'Size',
    type: 'chip',
    options: SIZE_OPTIONS,
  },
  {
    id: 'ability',
    label: 'Primary Ability',
    type: 'dropdown',
    options: ABILITY_OPTIONS,
  },
  {
    id: 'darkvision',
    label: 'Darkvision',
    type: 'toggle',
  },
]

// =============================================================================
// Validation
// =============================================================================

interface ValidationContext {
  race: Race | null
  choices: RacialChoiceState
}

export function validateRaceStep(ctx: ValidationContext): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []
  const { race, choices } = ctx

  if (!race) {
    return { valid: false, errors: ['Please select a race'] }
  }

  // Subrace required for races with subraces
  if (race.subraces.length > 0 && !choices.subraceId) {
    errors.push(`Please select a subrace for your ${race.name}`)
  }

  // Dragonborn ancestry
  if (race.id === 'dragonborn' && !choices.dragonbornAncestry) {
    errors.push('Please choose a draconic ancestry')
  }

  // Half-Elf: ability bonuses + skills
  if (race.id === 'half-elf') {
    if (choices.chosenAbilityBonuses.length < 2) {
      errors.push('Please choose 2 ability score bonuses for your Half-Elf')
    }
    if (choices.chosenSkills.length < 2) {
      errors.push('Please choose 2 skill proficiencies for your Half-Elf')
    }
  }

  // High Elf: cantrip + language
  const selectedSubrace = race.subraces.find((s) => s.id === choices.subraceId)
  if (selectedSubrace?.id === 'high-elf') {
    if (!choices.chosenCantrip) {
      errors.push('Please choose a wizard cantrip for your High Elf')
    }
    if (choices.chosenLanguages.length < 1) {
      errors.push('Please choose an extra language for your High Elf')
    }
  }

  // Variant Human: ability bonuses + skill + feat
  if (race.id === 'human' && choices.subraceId === 'variant-human') {
    if (choices.chosenAbilityBonuses.length < 2) {
      errors.push('Please choose 2 ability score bonuses for your Variant Human')
    }
    if (choices.chosenSkills.length < 1) {
      errors.push('Please choose a skill proficiency for your Variant Human')
    }
    if (!choices.chosenFeat) {
      errors.push('Please choose a feat for your Variant Human')
    }
  }

  // Language choices for races that have them (e.g., standard Human)
  const languageChoiceCount = race.languageChoices ?? 0
  if (
    languageChoiceCount > 0 &&
    race.id !== 'half-elf' && // Half-Elf language handled above
    selectedSubrace?.id !== 'high-elf' // High Elf language handled above
  ) {
    if (choices.chosenLanguages.length < languageChoiceCount) {
      errors.push(`Please choose ${languageChoiceCount} extra language(s)`)
    }
  }

  return { valid: errors.length === 0, errors }
}

// =============================================================================
// RaceStep Component
// =============================================================================

/** Default empty choices state */
function defaultChoices(): RacialChoiceState {
  return {
    subraceId: null,
    chosenAbilityBonuses: [],
    chosenSkills: [],
    chosenLanguages: [],
    chosenCantrip: null,
    chosenFeat: null,
    dragonbornAncestry: null,
  }
}

/** Build RacialChoiceState from a stored RaceSelection */
function choicesFromSelection(selection: RaceSelection): RacialChoiceState {
  return {
    subraceId: selection.subraceId ?? null,
    chosenAbilityBonuses: selection.chosenAbilityBonuses ?? [],
    chosenSkills: selection.chosenSkills ?? [],
    chosenLanguages: selection.chosenLanguages ?? [],
    chosenCantrip: selection.chosenCantrip ?? null,
    chosenFeat: selection.chosenFeat ?? null,
    dragonbornAncestry: null, // will be derived from store if needed
  }
}

export function RaceStep({ onValidationChange }: WizardStepProps) {
  const raceSelection = useWizardStore((s) => s.raceSelection)
  const setRace = useWizardStore((s) => s.setRace)

  // Selected race
  const [selectedRaceId, setSelectedRaceId] = useState<string | null>(
    raceSelection?.raceId ?? null,
  )
  const selectedRace = useMemo(
    () => races.find((r) => r.id === selectedRaceId) ?? null,
    [selectedRaceId],
  )

  // Detail panel open state
  const [isPanelOpen, setIsPanelOpen] = useState(false)

  // Racial choices
  const [choices, setChoices] = useState<RacialChoiceState>(() =>
    raceSelection ? choicesFromSelection(raceSelection) : defaultChoices(),
  )

  // Search and filter state
  const [searchValue, setSearchValue] = useState('')
  const [filterValues, setFilterValues] = useState<
    Record<string, string | boolean>
  >({
    size: '',
    ability: '',
    darkvision: false,
  })

  // Filter races
  const filteredRaces = useMemo(() => {
    let result = [...races] as Race[]

    // Search by name
    if (searchValue.trim()) {
      const query = searchValue.toLowerCase().trim()
      result = result.filter((r) => r.name.toLowerCase().includes(query))
    }

    // Filter by size
    const sizeFilter = filterValues.size as string
    if (sizeFilter) {
      result = result.filter((r) => r.size === sizeFilter)
    }

    // Filter by primary ability bonus
    const abilityFilter = filterValues.ability as string
    if (abilityFilter) {
      result = result.filter((r) => {
        const bonus =
          r.abilityScoreIncrease[abilityFilter as AbilityName]
        return bonus !== undefined && bonus > 0
      })
    }

    // Filter by darkvision
    if (filterValues.darkvision) {
      result = result.filter((r) =>
        r.senses.some((s) => s.type === 'darkvision'),
      )
    }

    return result
  }, [searchValue, filterValues])

  // Handle race selection
  const handleSelectRace = useCallback(
    (race: Race) => {
      if (selectedRaceId === race.id) {
        // Clicking same race opens the panel
        setIsPanelOpen(true)
        return
      }

      // New race selected; clear choices
      setSelectedRaceId(race.id)
      setChoices(defaultChoices())
      setIsPanelOpen(true)
    },
    [selectedRaceId],
  )

  // Handle choices change
  const handleChoicesChange = useCallback(
    (partial: Partial<RacialChoiceState>) => {
      setChoices((prev) => ({ ...prev, ...partial }))
    },
    [],
  )

  // Handle filter change
  const handleFilterChange = useCallback(
    (filterId: string, value: string | boolean) => {
      setFilterValues((prev) => ({ ...prev, [filterId]: value }))
    },
    [],
  )

  // Persist to wizard store whenever selection/choices change
  useEffect(() => {
    if (!selectedRace) {
      setRace(null)
      return
    }

    const selection: RaceSelection = {
      raceId: selectedRace.id,
      subraceId: choices.subraceId ?? undefined,
      chosenAbilityBonuses:
        choices.chosenAbilityBonuses.length > 0
          ? choices.chosenAbilityBonuses
          : undefined,
      chosenSkills:
        choices.chosenSkills.length > 0 ? choices.chosenSkills : undefined,
      chosenLanguages:
        choices.chosenLanguages.length > 0
          ? choices.chosenLanguages
          : undefined,
      chosenCantrip: choices.chosenCantrip ?? undefined,
      chosenFeat: choices.chosenFeat ?? undefined,
    }

    setRace(selection)
  }, [selectedRace, choices, setRace])

  // Report validation to wizard shell
  useEffect(() => {
    const result = validateRaceStep({ race: selectedRace, choices })
    onValidationChange?.(result)
  }, [selectedRace, choices, onValidationChange])

  // Close panel
  const handleClosePanel = useCallback(() => {
    setIsPanelOpen(false)
  }, [])

  // Selected items for the card grid (single-select)
  const selectedItems = selectedRace ? [selectedRace] : []

  return (
    <div className="p-4 md:p-6 space-y-4" data-testid="race-step">
      {/* Step header */}
      <div>
        <h2 className="text-xl font-heading font-semibold text-parchment">
          Choose Your Race
        </h2>
        <p className="text-sm text-parchment/60 mt-1">
          Your race determines your physical traits, abilities, and cultural background.
        </p>
      </div>

      {/* Search and filter */}
      <SearchFilterBar
        searchPlaceholder="Search races..."
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        filters={FILTERS}
        filterValues={filterValues}
        onFilterChange={handleFilterChange}
      />

      {/* Empty state */}
      {filteredRaces.length === 0 && (
        <div className="text-center py-12" data-testid="empty-state">
          <p className="text-parchment/60">No races match your filters.</p>
          <button
            onClick={() => {
              setSearchValue('')
              setFilterValues({ size: '', ability: '', darkvision: false })
            }}
            className="mt-2 text-sm text-accent-gold hover:text-accent-gold/80 transition-colors"
          >
            Clear filters
          </button>
        </div>
      )}

      {/* Race grid */}
      {filteredRaces.length > 0 && (
        <SelectableCardGrid
          items={filteredRaces}
          selectedItems={selectedItems}
          onSelect={handleSelectRace}
          getKey={(race: Race) => race.id}
          renderCard={(race: Race, isSelected: boolean) => (
            <RaceCard race={race} isSelected={isSelected} />
          )}
          columns={{ sm: 2, md: 3, lg: 3 }}
        />
      )}

      {/* Detail slide panel */}
      {selectedRace && (
        <DetailSlidePanel
          isOpen={isPanelOpen}
          onClose={handleClosePanel}
          title={selectedRace.name}
        >
          <RaceDetailPanel
            race={selectedRace}
            choices={choices}
            onChoicesChange={handleChoicesChange}
          />
        </DetailSlidePanel>
      )}
    </div>
  )
}
