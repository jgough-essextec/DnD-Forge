/**
 * SkillsList (Story 17.4)
 *
 * Displays all 18 skills with proficiency/expertise indicators and computed modifiers.
 * Includes passive scores (Perception, Investigation, Insight) at the bottom.
 */

import { useCharacterSheet } from '@/components/character/CharacterSheetProvider'
import { ProficiencyDot } from '@/components/shared/ProficiencyDot'
import { ModifierBadge } from '@/components/shared/ModifierBadge'
import { SKILL_NAMES, SKILL_ABILITY_MAP } from '@/types/core'
import type { SkillName } from '@/types/core'
import { useState } from 'react'
import { cn } from '@/lib/utils'

const SKILL_LABELS: Record<SkillName, string> = {
  'acrobatics': 'Acrobatics',
  'animal-handling': 'Animal Handling',
  'arcana': 'Arcana',
  'athletics': 'Athletics',
  'deception': 'Deception',
  'history': 'History',
  'insight': 'Insight',
  'intimidation': 'Intimidation',
  'investigation': 'Investigation',
  'medicine': 'Medicine',
  'nature': 'Nature',
  'perception': 'Perception',
  'performance': 'Performance',
  'persuasion': 'Persuasion',
  'religion': 'Religion',
  'sleight-of-hand': 'Sleight of Hand',
  'stealth': 'Stealth',
  'survival': 'Survival',
}

export function SkillsList() {
  const { character, editableCharacter, updateField, editMode, derivedStats } =
    useCharacterSheet()
  const [rollResults, setRollResults] = useState<Record<string, number | null>>({})

  const displayCharacter = character ? { ...character, ...editableCharacter } : null

  if (!displayCharacter) {
    return null
  }

  const handleSkillRoll = (skill: SkillName) => {
    if (editMode.isEditing) return

    const modifier = derivedStats.skillModifiers[skill]
    const roll = Math.floor(Math.random() * 20) + 1
    const total = roll + modifier

    setRollResults((prev) => ({ ...prev, [skill]: total }))
    setTimeout(() => {
      setRollResults((prev) => ({ ...prev, [skill]: null }))
    }, 3000)
  }

  const handleCycleProficiency = (skill: SkillName) => {
    const skills = displayCharacter.proficiencies.skills
    const current = skills.find((s) => s.skill === skill)

    let updated = skills.filter((s) => s.skill !== skill)

    if (!current || !current.proficient) {
      // none -> proficient
      updated.push({ skill, proficient: true, expertise: false })
    } else if (current.proficient && !current.expertise) {
      // proficient -> expertise
      updated.push({ skill, proficient: true, expertise: true })
    }
    // expertise -> none (already filtered out)

    updateField('proficiencies', {
      ...displayCharacter.proficiencies,
      skills: updated,
    })
  }

  const getProficiencyLevel = (skill: SkillName) => {
    const prof = displayCharacter.proficiencies.skills.find((s) => s.skill === skill)
    if (!prof || !prof.proficient) return 'none'
    if (prof.expertise) return 'expertise'
    return 'proficient'
  }

  return (
    <div className="space-y-2" data-testid="skills-list">
      <h3 className="text-xs uppercase tracking-wider text-parchment/60 font-semibold mb-3">
        Skills
      </h3>
      {SKILL_NAMES.map((skill) => {
        const modifier = derivedStats.skillModifiers[skill]
        const ability = SKILL_ABILITY_MAP[skill]
        const profLevel = getProficiencyLevel(skill)
        const rollResult = rollResults[skill]

        return (
          <div
            key={skill}
            className={cn(
              'flex items-center gap-2 py-1 px-2 rounded transition-colors',
              !editMode.isEditing &&
                'cursor-pointer hover:bg-bg-secondary/50',
              rollResult && 'bg-accent-gold/10'
            )}
            onClick={() => handleSkillRoll(skill)}
            role={!editMode.isEditing ? 'button' : undefined}
            tabIndex={!editMode.isEditing ? 0 : undefined}
            onKeyDown={
              !editMode.isEditing
                ? (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      handleSkillRoll(skill)
                    }
                  }
                : undefined
            }
            data-testid={`skill-${skill}`}
          >
            {editMode.isEditing ? (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleCycleProficiency(skill)
                }}
                className="flex-shrink-0"
                aria-label={`Cycle ${skill} proficiency`}
              >
                <ProficiencyDot level={profLevel as any} />
              </button>
            ) : (
              <div className="flex-shrink-0">
                <ProficiencyDot level={profLevel as any} />
              </div>
            )}
            <ModifierBadge value={modifier} size="sm" />
            <span className="text-sm text-parchment flex-1">
              {SKILL_LABELS[skill]}
            </span>
            <span className="text-xs text-parchment/50 uppercase">
              {ability.slice(0, 3)}
            </span>
            {rollResult !== null && (
              <span className="text-xs font-bold text-accent-gold ml-2">
                {rollResult}
              </span>
            )}
          </div>
        )
      })}

      {/* Passive Scores */}
      <div className="mt-4 pt-3 border-t border-parchment/20 space-y-1">
        <div className="flex items-center justify-between text-sm">
          <span className="text-parchment/70">Passive Perception</span>
          <span className="text-parchment font-semibold">
            {derivedStats.passivePerception}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-parchment/70">Passive Investigation</span>
          <span className="text-parchment font-semibold">
            {derivedStats.passiveInvestigation}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-parchment/70">Passive Insight</span>
          <span className="text-parchment font-semibold">
            {derivedStats.passiveInsight}
          </span>
        </div>
      </div>
    </div>
  )
}
