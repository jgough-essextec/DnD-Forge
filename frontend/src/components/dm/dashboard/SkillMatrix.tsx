/**
 * SkillMatrix (Story 34.3)
 *
 * 18-skill x N-character grid showing skill modifiers and proficiency status.
 * - Rows grouped by ability score
 * - Highest modifier per skill highlighted with gold background
 * - Filter/search and "Show only proficient" toggle
 */

import { useState, useMemo } from 'react'
import { Search } from 'lucide-react'
import type { Character } from '@/types/character'
import type { SkillName } from '@/types/core'
import {
  SKILL_GROUPS,
  getSkillMod,
  isCharacterProficient,
  hasExpertise,
  findBestInParty,
  filterSkills,
  formatSkillName,
  getClassDisplay,
} from '@/utils/party-analysis'

interface SkillMatrixProps {
  characters: Character[]
}

function formatModifier(mod: number): string {
  return mod >= 0 ? `+${mod}` : `${mod}`
}

export function SkillMatrix({ characters }: SkillMatrixProps) {
  const [searchText, setSearchText] = useState('')
  const [showOnlyProficient, setShowOnlyProficient] = useState(false)

  const filteredSkills = useMemo(() => filterSkills(searchText), [searchText])

  return (
    <div data-testid="skill-matrix">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-parchment/40" />
          <input
            type="text"
            placeholder="Filter skills..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-bg-primary border border-parchment/20 text-parchment text-sm placeholder:text-parchment/30 focus:outline-none focus:border-accent-gold/50"
            aria-label="Filter skills"
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-parchment/70 whitespace-nowrap">
          <input
            type="checkbox"
            checked={showOnlyProficient}
            onChange={(e) => setShowOnlyProficient(e.target.checked)}
            className="rounded border-parchment/30"
          />
          Show only proficient
        </label>
      </div>

      {/* Matrix table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm rounded-lg border-2 border-parchment/20 bg-bg-secondary">
          <thead>
            <tr className="border-b border-parchment/10">
              <th className="p-2 text-left text-parchment/80 font-medium sticky left-0 bg-bg-secondary z-10">
                Skill
              </th>
              {characters.map((character) => (
                <th
                  key={character.id}
                  className="p-2 text-center min-w-[80px]"
                >
                  <div
                    className="text-parchment/80 font-medium text-xs truncate max-w-[80px]"
                    title={character.name}
                    style={{ writingMode: 'horizontal-tb' }}
                  >
                    {character.name}
                  </div>
                  <div className="text-parchment/40 text-[10px] truncate">
                    {getClassDisplay(character)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SKILL_GROUPS.map((group) => {
              const groupSkills = group.skills.filter((s) =>
                filteredSkills.includes(s)
              )
              if (groupSkills.length === 0) return null

              return (
                <SkillGroupRows
                  key={group.ability}
                  group={group}
                  skills={groupSkills}
                  characters={characters}
                  showOnlyProficient={showOnlyProficient}
                />
              )
            })}
          </tbody>
        </table>
      </div>

      {filteredSkills.length === 0 && (
        <p className="text-center text-parchment/40 text-sm mt-4">
          No skills match your filter.
        </p>
      )}
    </div>
  )
}

interface SkillGroupRowsProps {
  group: (typeof SKILL_GROUPS)[number]
  skills: SkillName[]
  characters: Character[]
  showOnlyProficient: boolean
}

function SkillGroupRows({
  group,
  skills,
  characters,
  showOnlyProficient,
}: SkillGroupRowsProps) {
  return (
    <>
      {/* Group header */}
      <tr>
        <td
          colSpan={1 + characters.length}
          className="px-2 pt-3 pb-1 text-xs font-medium text-parchment/40 uppercase tracking-wider bg-bg-secondary"
          data-testid={`skill-group-${group.ability}`}
        >
          {group.abilityLabel}
        </td>
      </tr>
      {skills.map((skill) => (
        <SkillRow
          key={skill}
          skill={skill}
          characters={characters}
          showOnlyProficient={showOnlyProficient}
        />
      ))}
    </>
  )
}

interface SkillRowProps {
  skill: SkillName
  characters: Character[]
  showOnlyProficient: boolean
}

function SkillRow({ skill, characters, showOnlyProficient }: SkillRowProps) {
  const bestIndices = useMemo(
    () => findBestInParty(characters, skill),
    [characters, skill]
  )

  return (
    <tr className="border-b border-parchment/5 hover:bg-parchment/5" data-testid={`skill-row-${skill}`}>
      <td className="p-2 text-parchment/70 sticky left-0 bg-bg-secondary whitespace-nowrap">
        {formatSkillName(skill)}
      </td>
      {characters.map((character, charIndex) => {
        const mod = getSkillMod(character, skill)
        const proficient = isCharacterProficient(character, skill)
        const expertise = hasExpertise(character, skill)
        const isBest = bestIndices.includes(charIndex)

        if (showOnlyProficient && !proficient && !expertise) {
          return (
            <td key={character.id} className="p-2 text-center" data-testid={`skill-cell-${skill}-${character.id}`}>
              <span className="text-parchment/15">--</span>
            </td>
          )
        }

        return (
          <td
            key={character.id}
            className={`p-2 text-center ${isBest ? 'bg-accent-gold/20' : ''}`}
            data-testid={`skill-cell-${skill}-${character.id}`}
          >
            <div className="flex items-center justify-center gap-1">
              <ProficiencyDot proficient={proficient} expertise={expertise} />
              <span
                className={`font-mono text-xs ${
                  isBest ? 'text-accent-gold font-bold' : 'text-parchment/70'
                }`}
              >
                {formatModifier(mod)}
              </span>
            </div>
          </td>
        )
      })}
    </tr>
  )
}

function ProficiencyDot({
  proficient,
  expertise,
}: {
  proficient: boolean
  expertise: boolean
}) {
  if (expertise) {
    return (
      <span
        className="inline-block w-2.5 h-2.5 rounded-full bg-accent-gold border border-accent-gold"
        title="Expertise"
        aria-label="Expertise"
      />
    )
  }
  if (proficient) {
    return (
      <span
        className="inline-block w-2.5 h-2.5 rounded-full bg-accent-gold/50 border border-accent-gold/70"
        title="Proficient"
        aria-label="Proficient"
      />
    )
  }
  return (
    <span
      className="inline-block w-2.5 h-2.5 rounded-full border border-parchment/20"
      title="Not proficient"
      aria-label="Not proficient"
    />
  )
}
