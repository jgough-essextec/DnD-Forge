// =============================================================================
// Story 10.1-10.6 -- ClassStep
// Main step component for class selection in the character creation wizard.
// Accepts WizardStepProps and orchestrates:
//   - Class browsing grid with SearchFilterBar
//   - Detail panel via DetailSlidePanel
//   - Skill proficiency selection (ClassSkillSelector)
//   - L1 subclass selection for Cleric/Sorcerer/Warlock (SubclassSelector)
//   - Fighting style selection for Fighter/Paladin/Ranger (FightingStyleSelector)
//   - Validation and state persistence via wizardStore
// =============================================================================

import { useState, useCallback, useEffect, useMemo } from 'react'
import { CLASSES } from '@/data/classes'
import { useWizardStore } from '@/stores/wizardStore'
import { SelectableCardGrid } from '@/components/shared/SelectableCardGrid'
import { SearchFilterBar } from '@/components/shared/SearchFilterBar'
import { DetailSlidePanel } from '@/components/shared/DetailSlidePanel'
import { ClassCard, CLASS_ROLE_TAGS } from './ClassCard'
import { ClassDetailPanel } from './ClassDetailPanel'
import { ClassSkillSelector } from './ClassSkillSelector'
import { SubclassSelector } from './SubclassSelector'
import { FightingStyleSelector, FIGHTING_STYLE_CLASSES } from './FightingStyleSelector'
import type { WizardStepProps, StepValidation } from '@/components/wizard/types'
import type { CharacterClass, FightingStyle, ClassSelection } from '@/types/class'
import type { SkillName } from '@/types/core'
import type { FilterDef } from '@/components/shared/SearchFilterBar'

// -- Filter definitions -------------------------------------------------------

const ROLE_FILTER_OPTIONS = [
  { value: 'Striker', label: 'Striker' },
  { value: 'Tank', label: 'Tank' },
  { value: 'Healer', label: 'Healer' },
  { value: 'Spellcaster', label: 'Spellcaster' },
  { value: 'Support', label: 'Support' },
  { value: 'Utility', label: 'Utility' },
]

const ABILITY_FILTER_OPTIONS = [
  { value: 'strength', label: 'Strength' },
  { value: 'dexterity', label: 'Dexterity' },
  { value: 'constitution', label: 'Constitution' },
  { value: 'intelligence', label: 'Intelligence' },
  { value: 'wisdom', label: 'Wisdom' },
  { value: 'charisma', label: 'Charisma' },
]

const CLASS_FILTERS: FilterDef[] = [
  {
    id: 'role',
    label: 'Role',
    type: 'dropdown',
    options: ROLE_FILTER_OPTIONS,
  },
  {
    id: 'ability',
    label: 'Primary Ability',
    type: 'dropdown',
    options: ABILITY_FILTER_OPTIONS,
  },
  {
    id: 'spellcasting',
    label: 'Has Spellcasting',
    type: 'toggle',
  },
]

// -- Validation ---------------------------------------------------------------

export function validateClassStep(
  selectedClass: CharacterClass | null,
  chosenSkills: SkillName[],
  chosenSubclassId: string | null,
  chosenFightingStyle: FightingStyle | null,
): StepValidation {
  const errors: string[] = []

  if (!selectedClass) {
    errors.push('Please select a class')
    return { valid: false, errors }
  }

  // Skill count validation
  const requiredSkills = selectedClass.proficiencies.skillChoices.choose
  if (chosenSkills.length !== requiredSkills) {
    errors.push(
      `Select exactly ${requiredSkills} skill${requiredSkills !== 1 ? 's' : ''} (${chosenSkills.length} selected)`,
    )
  }

  // L1 subclass validation
  if (selectedClass.subclassLevel === 1 && !chosenSubclassId) {
    errors.push(`Please select a ${selectedClass.subclassName}`)
  }

  // Fighting style validation
  if (FIGHTING_STYLE_CLASSES.includes(selectedClass.id) && !chosenFightingStyle) {
    errors.push('Please select a Fighting Style')
  }

  return { valid: errors.length === 0, errors }
}

// -- Main Component -----------------------------------------------------------

export function ClassStep({ onValidationChange }: WizardStepProps) {
  const classSelection = useWizardStore((s) => s.classSelection)
  const setClass = useWizardStore((s) => s.setClass)

  // State
  const [selectedClass, setSelectedClass] = useState<CharacterClass | null>(() => {
    if (classSelection) {
      return (CLASSES as readonly CharacterClass[]).find((c) => c.id === classSelection.classId) ?? null
    }
    return null
  })
  const [detailClass, setDetailClass] = useState<CharacterClass | null>(null)
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [chosenSkills, setChosenSkills] = useState<SkillName[]>(
    () => classSelection?.chosenSkills ?? [],
  )
  const [chosenSubclassId, setChosenSubclassId] = useState<string | null>(
    () => classSelection?.subclassId ?? null,
  )
  const [chosenFightingStyle, setChosenFightingStyle] = useState<FightingStyle | null>(
    () => classSelection?.chosenFightingStyle ?? null,
  )

  // Search/filter state
  const [searchValue, setSearchValue] = useState('')
  const [filterValues, setFilterValues] = useState<Record<string, string | boolean>>({
    role: '',
    ability: '',
    spellcasting: false,
  })

  // Filter classes
  const filteredClasses = useMemo(() => {
    let result = [...CLASSES] as CharacterClass[]

    // Text search
    if (searchValue.trim()) {
      const q = searchValue.trim().toLowerCase()
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q),
      )
    }

    // Role filter
    const roleFilter = filterValues.role as string
    if (roleFilter) {
      result = result.filter((c) => {
        const roles = CLASS_ROLE_TAGS[c.id] ?? []
        return roles.includes(roleFilter as typeof roles[number])
      })
    }

    // Primary ability filter
    const abilityFilter = filterValues.ability as string
    if (abilityFilter) {
      result = result.filter((c) =>
        c.primaryAbility.includes(abilityFilter as typeof c.primaryAbility[number]),
      )
    }

    // Spellcasting toggle
    if (filterValues.spellcasting) {
      result = result.filter(
        (c) => c.spellcasting && c.spellcasting.type !== 'none',
      )
    }

    return result
  }, [searchValue, filterValues])

  // Handle class selection
  const handleClassSelect = useCallback(
    (cls: CharacterClass) => {
      if (selectedClass?.id === cls.id) {
        // Same class clicked: open detail panel
        setDetailClass(cls)
        setIsPanelOpen(true)
        return
      }

      // Different class: reset choices
      setSelectedClass(cls)
      setChosenSkills([])
      setChosenSubclassId(null)
      setChosenFightingStyle(null)

      // Open detail panel
      setDetailClass(cls)
      setIsPanelOpen(true)
    },
    [selectedClass],
  )

  const handleFilterChange = useCallback(
    (filterId: string, value: string | boolean) => {
      setFilterValues((prev) => ({ ...prev, [filterId]: value }))
    },
    [],
  )

  const handleClosePanel = useCallback(() => {
    setIsPanelOpen(false)
  }, [])

  // Validate and report to wizard
  useEffect(() => {
    const validation = validateClassStep(
      selectedClass,
      chosenSkills,
      chosenSubclassId,
      chosenFightingStyle,
    )
    onValidationChange?.(validation)

    // Persist to store when valid
    if (selectedClass) {
      const selection: ClassSelection = {
        classId: selectedClass.id,
        level: 1,
        chosenSkills,
        hpRolls: [],
        ...(chosenSubclassId ? { subclassId: chosenSubclassId } : {}),
        ...(chosenFightingStyle ? { chosenFightingStyle } : {}),
      }
      setClass(selection)
    } else {
      setClass(null)
    }
  }, [selectedClass, chosenSkills, chosenSubclassId, chosenFightingStyle, onValidationChange, setClass])

  // Needs subclass?
  const needsSubclass = selectedClass?.subclassLevel === 1
  // Needs fighting style?
  const needsFightingStyle = selectedClass
    ? FIGHTING_STYLE_CLASSES.includes(selectedClass.id)
    : false

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-heading font-bold text-parchment">Choose Your Class</h2>
        <p className="text-sm text-parchment/60 mt-1">
          Your class determines your abilities, skills, and role in the party.
        </p>
      </div>

      {/* Search and Filter */}
      <SearchFilterBar
        searchPlaceholder="Search classes..."
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        filters={CLASS_FILTERS}
        filterValues={filterValues}
        onFilterChange={handleFilterChange}
      />

      {/* No results */}
      {filteredClasses.length === 0 && (
        <div className="text-center py-8 text-parchment/50">
          <p>No classes match your search criteria.</p>
          <button
            onClick={() => {
              setSearchValue('')
              setFilterValues({ role: '', ability: '', spellcasting: false })
            }}
            className="mt-2 text-sm text-accent-gold hover:text-accent-gold/80 transition-colors"
          >
            Clear filters
          </button>
        </div>
      )}

      {/* Class Grid */}
      <SelectableCardGrid
        items={filteredClasses}
        selectedItems={selectedClass ? [selectedClass] : []}
        onSelect={handleClassSelect}
        getKey={(c) => c.id}
        renderCard={(c, isSelected) => (
          <ClassCard characterClass={c} isSelected={isSelected} />
        )}
        columns={{ sm: 2, md: 3, lg: 4 }}
      />

      {/* Detail Panel */}
      <DetailSlidePanel
        isOpen={isPanelOpen}
        onClose={handleClosePanel}
        title={detailClass?.name ?? 'Class Details'}
      >
        {detailClass && <ClassDetailPanel characterClass={detailClass} />}
      </DetailSlidePanel>

      {/* Class Choices Section (shown after a class is selected) */}
      {selectedClass && (
        <div className="space-y-6 border-t border-parchment/10 pt-6">
          <h3 className="text-lg font-heading font-semibold text-parchment">
            {selectedClass.name} Choices
          </h3>

          {/* Skill Proficiency Selection */}
          <ClassSkillSelector
            characterClass={selectedClass}
            selectedSkills={chosenSkills}
            onSkillsChange={setChosenSkills}
          />

          {/* L1 Subclass Selection (Cleric, Sorcerer, Warlock) */}
          {needsSubclass && (
            <SubclassSelector
              characterClass={selectedClass}
              selectedSubclassId={chosenSubclassId}
              onSubclassChange={setChosenSubclassId}
            />
          )}

          {/* Fighting Style Selection (Fighter, Paladin, Ranger) */}
          {needsFightingStyle && (
            <FightingStyleSelector
              characterClass={selectedClass}
              selectedStyle={chosenFightingStyle}
              onStyleChange={setChosenFightingStyle}
            />
          )}

          {/* Subclass info for non-L1 subclass classes */}
          {!needsSubclass && (
            <div className="rounded-lg border border-parchment/15 bg-parchment/5 p-4">
              <p className="text-sm text-parchment/60">
                You will choose your{' '}
                <span className="font-semibold text-parchment/80">
                  {selectedClass.subclassName}
                </span>{' '}
                at level {selectedClass.subclassLevel}.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
