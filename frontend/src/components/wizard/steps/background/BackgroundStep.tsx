/**
 * BackgroundStep -- Main step component for Background & Personality (Step 4).
 *
 * Composes BackgroundSelector, PersonalityEditor, and CharacterDescription.
 * Manages local state and syncs to the wizard store via setBackground().
 *
 * Validation:
 * - A background must be selected
 * - At least 1 personality trait must be chosen
 * - Skill overlaps must have replacement skills selected
 */

import { useState, useEffect, useCallback, useMemo } from 'react'
import { cn } from '@/lib/utils'
import { BACKGROUNDS } from '@/data/backgrounds'
import { useWizardStore } from '@/stores/wizardStore'
import { StepHelp } from '@/components/shared/StepHelp'
import type { WizardStepProps, StepValidation } from '@/components/wizard/types'
import type { Background, BackgroundSelection } from '@/types/background'
import type { SkillName } from '@/types/core'
import { BackgroundSelector, detectSkillOverlaps } from './BackgroundSelector'
import { PersonalityEditor } from './PersonalityEditor'
import type { PersonalityState } from './PersonalityEditor'
import { CharacterDescription } from './CharacterDescription'
import type { DescriptionState } from './CharacterDescription'

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function BackgroundStep({ onValidationChange }: WizardStepProps) {
  const {
    backgroundSelection,
    setBackground,
    classSelection,
    characterName,
  } = useWizardStore()

  // ----- Local state -----

  const [selectedBackground, setSelectedBackground] = useState<Background | null>(() => {
    if (backgroundSelection?.backgroundId) {
      return (
        (BACKGROUNDS as Background[]).find(
          (bg) => bg.id === backgroundSelection.backgroundId,
        ) ?? null
      )
    }
    return null
  })

  const [skillReplacements, setSkillReplacements] = useState<
    Record<string, SkillName | null>
  >(() => {
    if (backgroundSelection?.chosenSkillProficiencies && selectedBackground) {
      // Reconstruct replacements from stored selection
      const overlaps = detectSkillOverlaps(
        selectedBackground.skillProficiencies,
        classSelection?.chosenSkills ?? [],
      )
      const replacements: Record<string, SkillName | null> = {}
      overlaps.forEach((skill, i) => {
        const chosen = backgroundSelection.chosenSkillProficiencies?.[i]
        if (chosen && chosen !== skill) {
          replacements[skill] = chosen
        }
      })
      return replacements
    }
    return {}
  })

  const [personality, setPersonality] = useState<PersonalityState>(() => ({
    traits: backgroundSelection?.characterPersonality?.personalityTraits ?? ['', ''],
    ideal: backgroundSelection?.characterPersonality?.ideal ?? '',
    bond: backgroundSelection?.characterPersonality?.bond ?? '',
    flaw: backgroundSelection?.characterPersonality?.flaw ?? '',
  }))

  const [description, setDescription] = useState<DescriptionState>(() => ({
    alignment: null,
    identity: {
      name: backgroundSelection?.characterIdentity?.name ?? characterName ?? '',
      age: backgroundSelection?.characterIdentity?.age ?? '',
      height: backgroundSelection?.characterIdentity?.height ?? '',
      weight: backgroundSelection?.characterIdentity?.weight ?? '',
      eyes: backgroundSelection?.characterIdentity?.eyes ?? '',
      hair: backgroundSelection?.characterIdentity?.hair ?? '',
      skin: backgroundSelection?.characterIdentity?.skin ?? '',
      appearance: backgroundSelection?.characterIdentity?.appearance ?? '',
    },
    backstory: '',
    faith: '',
  }))

  // ----- Derived state -----

  const classSkills = useMemo(
    () => classSelection?.chosenSkills ?? [],
    [classSelection],
  )

  const overlappingSkills = useMemo(() => {
    if (!selectedBackground) return []
    return detectSkillOverlaps(selectedBackground.skillProficiencies, classSkills)
  }, [selectedBackground, classSkills])

  // ----- Validation -----

  const validation = useMemo<StepValidation>(() => {
    const errors: string[] = []

    if (!selectedBackground) {
      errors.push('Please select a background')
    }

    const hasTraits =
      personality.traits.filter(Boolean).length >= 1
    if (!hasTraits) {
      errors.push('Please choose at least one personality trait')
    }

    // Check skill overlap replacements
    if (overlappingSkills.length > 0) {
      const unresolvedOverlaps = overlappingSkills.filter(
        (skill) => !skillReplacements[skill],
      )
      if (unresolvedOverlaps.length > 0) {
        errors.push('Please choose replacement skills for all skill overlaps')
      }
    }

    return { valid: errors.length === 0, errors }
  }, [selectedBackground, personality, overlappingSkills, skillReplacements])

  // Report validation changes to parent
  useEffect(() => {
    onValidationChange?.(validation)
  }, [validation, onValidationChange])

  // ----- Sync to wizard store -----

  useEffect(() => {
    if (!selectedBackground) {
      setBackground(null)
      return
    }

    // Build the final skill proficiencies (replacing overlaps)
    const finalSkills = selectedBackground.skillProficiencies.map((skill) => {
      if (overlappingSkills.includes(skill) && skillReplacements[skill]) {
        return skillReplacements[skill]!
      }
      return skill
    })

    const selection: BackgroundSelection = {
      backgroundId: selectedBackground.id,
      chosenSkillProficiencies: finalSkills,
      characterIdentity: {
        ...description.identity,
      },
      characterPersonality: {
        personalityTraits: personality.traits,
        ideal: personality.ideal,
        bond: personality.bond,
        flaw: personality.flaw,
      },
    }

    setBackground(selection)
  }, [
    selectedBackground,
    skillReplacements,
    personality,
    description,
    overlappingSkills,
    setBackground,
  ])

  // ----- Handlers -----

  const handleBackgroundSelect = useCallback(
    (bg: Background) => {
      setSelectedBackground(bg)
      // Reset skill replacements when changing background
      setSkillReplacements({})
      // Reset personality when changing background
      setPersonality({
        traits: ['', ''],
        ideal: '',
        bond: '',
        flaw: '',
      })
    },
    [],
  )

  const handleSkillReplacementChange = useCallback(
    (overlappingSkill: string, replacement: SkillName | null) => {
      setSkillReplacements((prev) => ({
        ...prev,
        [overlappingSkill]: replacement,
      }))
    },
    [],
  )

  // ----- Render -----

  return (
    <div className="space-y-8">
      <StepHelp
        stepName="background"
        helpText="Choose a background that gives your character a history and additional proficiencies. Then define your character's personality and physical description."
        tips={[
          'Your background grants skill proficiencies, tool proficiencies, languages, and equipment.',
          'If a background skill overlaps with a class skill, you can choose any replacement skill.',
          'Personality traits, ideals, bonds, and flaws help bring your character to life.',
          'Use the Randomize All button for quick personality generation.',
        ]}
      />

      {/* Section 1: Background Selection */}
      <section aria-label="Background Selection">
        <h2 className="font-heading text-xl font-semibold text-accent-gold mb-4">
          Choose Your Background
        </h2>
        <BackgroundSelector
          selectedBackground={selectedBackground}
          onSelect={handleBackgroundSelect}
          classSkills={classSkills}
          skillReplacements={skillReplacements}
          onSkillReplacementChange={handleSkillReplacementChange}
        />
      </section>

      {/* Section 2: Personality & Description (only shown after background selected) */}
      {selectedBackground && (
        <>
          <div className="border-t border-parchment/10" />

          <section aria-label="Personality Characteristics">
            <PersonalityEditor
              background={selectedBackground}
              personality={personality}
              onChange={setPersonality}
            />
          </section>

          <div className="border-t border-parchment/10" />

          <section aria-label="Character Description">
            <CharacterDescription
              description={description}
              onChange={setDescription}
            />
          </section>
        </>
      )}

      {/* Validation errors */}
      {validation.errors.length > 0 && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-3">
          <ul className="space-y-1">
            {validation.errors.map((error, i) => (
              <li key={i} className="text-xs text-red-400">
                {error}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
