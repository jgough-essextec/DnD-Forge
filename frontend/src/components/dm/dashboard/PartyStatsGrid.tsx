/**
 * PartyStatsGrid (Story 34.2)
 *
 * Sortable data table showing all party characters with key combat stats.
 * Columns: Name, Race, Class/Level, AC, HP, Speed, Passive Perception,
 * Spell Save DC, Initiative, Conditions.
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronDown,
  ChevronRight,
  Skull,
} from 'lucide-react'
import type { Character } from '@/types/character'
import type { SortColumn, SortDirection } from '@/utils/party-analysis'
import {
  sortCharacters,
  getHpBarColor,
  getHpPercentage,
  getClassDisplay,
  getRaceDisplay,
  getCharacterSpellSaveDC,
  getCharacterInitiativeModifier,
  getCharacterAC,
  formatSkillName,
  isCharacterProficient,
} from '@/utils/party-analysis'
import { getCharacterPassiveScore } from '@/utils/calculations/skills'
import { CONDITION_DEFINITIONS } from '@/data/conditions'
import { SKILL_NAMES, ABILITY_NAMES } from '@/types/core'
import { getModifier } from '@/utils/calculations/ability'

interface PartyStatsGridProps {
  characters: Character[]
}

interface ColumnDef {
  id: SortColumn
  label: string
  sortable: boolean
}

const COLUMNS: ColumnDef[] = [
  { id: 'name', label: 'Name', sortable: true },
  { id: 'race', label: 'Race', sortable: true },
  { id: 'class', label: 'Class / Level', sortable: true },
  { id: 'ac', label: 'AC', sortable: true },
  { id: 'hp', label: 'HP', sortable: true },
  { id: 'speed', label: 'Speed', sortable: true },
  { id: 'passivePerception', label: 'Passive Perception', sortable: true },
  { id: 'spellSaveDC', label: 'Spell Save DC', sortable: true },
  { id: 'initiative', label: 'Initiative', sortable: true },
]

function formatModifier(mod: number): string {
  return mod >= 0 ? `+${mod}` : `${mod}`
}

export function PartyStatsGrid({ characters }: PartyStatsGridProps) {
  const navigate = useNavigate()
  const [sortColumn, setSortColumn] = useState<SortColumn>('name')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
  }

  const toggleRow = (charId: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev)
      if (next.has(charId)) {
        next.delete(charId)
      } else {
        next.add(charId)
      }
      return next
    })
  }

  const sorted = sortCharacters(characters, sortColumn, sortDirection)

  const renderSortIcon = (column: SortColumn) => {
    if (sortColumn !== column) {
      return <ArrowUpDown className="w-3 h-3 text-parchment/30" />
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="w-3 h-3 text-accent-gold" aria-label="Sorted ascending" />
    ) : (
      <ArrowDown className="w-3 h-3 text-accent-gold" aria-label="Sorted descending" />
    )
  }

  return (
    <div className="overflow-x-auto" data-testid="party-stats-grid">
      <table className="w-full text-sm rounded-lg border-2 border-parchment/20 bg-bg-secondary">
        <thead>
          <tr className="border-b border-parchment/10">
            {/* Expand column */}
            <th className="p-2 w-8" />
            {COLUMNS.map((col) => (
              <th
                key={col.id}
                className={`p-2 text-left text-parchment/80 font-medium ${
                  col.sortable ? 'cursor-pointer select-none hover:text-accent-gold' : ''
                }`}
                onClick={() => col.sortable && handleSort(col.id)}
                aria-sort={
                  sortColumn === col.id
                    ? sortDirection === 'asc'
                      ? 'ascending'
                      : 'descending'
                    : 'none'
                }
              >
                <div className="flex items-center gap-1">
                  {col.label}
                  {col.sortable && renderSortIcon(col.id)}
                </div>
              </th>
            ))}
            {/* Conditions column */}
            <th className="p-2 text-left text-parchment/80 font-medium">
              Conditions
            </th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((character) => {
            const isExpanded = expandedRows.has(character.id)
            const hpPercent = getHpPercentage(
              character.hpCurrent,
              character.hpMax
            )
            const hpColor = getHpBarColor(
              character.hpCurrent,
              character.hpMax
            )
            const spellDC = getCharacterSpellSaveDC(character)
            const initiative = getCharacterInitiativeModifier(character)
            const ac = getCharacterAC(character)
            const passivePerception = getCharacterPassiveScore(
              character,
              'perception'
            )

            const hpColorClass =
              hpColor === 'green'
                ? 'bg-green-500'
                : hpColor === 'yellow'
                  ? 'bg-yellow-500'
                  : 'bg-red-500'

            return (
              <RowGroup key={character.id}>
                <tr
                  className="border-b border-parchment/5 hover:bg-parchment/5 transition-colors"
                  data-testid={`party-row-${character.id}`}
                >
                  {/* Expand toggle */}
                  <td className="p-2">
                    <button
                      onClick={() => toggleRow(character.id)}
                      className="p-0.5 rounded hover:bg-parchment/10"
                      aria-label={
                        isExpanded
                          ? `Collapse details for ${character.name}`
                          : `Expand details for ${character.name}`
                      }
                      aria-expanded={isExpanded}
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-parchment/50" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-parchment/50" />
                      )}
                    </button>
                  </td>

                  {/* Name */}
                  <td className="p-2">
                    <button
                      onClick={() => navigate(`/character/${character.id}`)}
                      className="text-accent-gold hover:text-accent-gold/80 hover:underline font-medium text-left"
                    >
                      {character.name}
                    </button>
                  </td>

                  {/* Race */}
                  <td className="p-2 text-parchment/80">
                    {getRaceDisplay(character)}
                  </td>

                  {/* Class / Level */}
                  <td className="p-2 text-parchment/80">
                    <span>{getClassDisplay(character)}</span>
                    <span className="ml-1 text-parchment/50">
                      Lv.{character.level}
                    </span>
                  </td>

                  {/* AC */}
                  <td className="p-2 text-parchment font-mono">{ac}</td>

                  {/* HP */}
                  <td className="p-2" data-testid={`hp-cell-${character.id}`}>
                    <div className="flex items-center gap-2">
                      {character.hpCurrent === 0 ? (
                        <Skull
                          className="w-4 h-4 text-red-500"
                          aria-label="0 HP"
                        />
                      ) : null}
                      <div className="flex flex-col min-w-[80px]">
                        <span className="text-parchment font-mono text-xs">
                          {character.hpCurrent}/{character.hpMax}
                        </span>
                        <div
                          className="h-1.5 w-full rounded-full bg-parchment/10 mt-0.5"
                          role="progressbar"
                          aria-valuenow={character.hpCurrent}
                          aria-valuemin={0}
                          aria-valuemax={character.hpMax}
                          aria-label={`HP: ${character.hpCurrent}/${character.hpMax}`}
                        >
                          <div
                            className={`h-full rounded-full transition-all ${hpColorClass}`}
                            style={{ width: `${hpPercent}%` }}
                          />
                        </div>
                      </div>
                      {character.tempHp > 0 && (
                        <span
                          className="text-xs px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 font-mono"
                          title="Temporary HP"
                        >
                          +{character.tempHp}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Speed */}
                  <td className="p-2 text-parchment/80 font-mono">
                    {character.speed?.walk ?? 30} ft
                  </td>

                  {/* Passive Perception */}
                  <td className="p-2 text-parchment/80 font-mono">
                    {passivePerception}
                  </td>

                  {/* Spell Save DC */}
                  <td className="p-2 text-parchment/80 font-mono">
                    {spellDC !== null ? spellDC : '---'}
                  </td>

                  {/* Initiative */}
                  <td className="p-2 text-parchment/80 font-mono">
                    {formatModifier(initiative)}
                  </td>

                  {/* Conditions */}
                  <td className="p-2">
                    <div className="flex flex-wrap gap-1">
                      {character.conditions.length === 0 ? (
                        <span className="text-parchment/30 text-xs">None</span>
                      ) : (
                        character.conditions.map((ci) => {
                          const def = CONDITION_DEFINITIONS[ci.condition]
                          return (
                            <span
                              key={ci.condition}
                              className={`text-xs px-1.5 py-0.5 rounded border ${def.color}`}
                              title={def.description}
                            >
                              {def.name}
                              {ci.condition === 'exhaustion' && ci.exhaustionLevel
                                ? ` ${ci.exhaustionLevel}`
                                : ''}
                            </span>
                          )
                        })
                      )}
                    </div>
                  </td>
                </tr>

                {/* Expanded detail row */}
                {isExpanded && (
                  <tr className="bg-parchment/5" data-testid={`expanded-row-${character.id}`}>
                    <td colSpan={11} className="p-4">
                      <ExpandedDetails character={character} />
                    </td>
                  </tr>
                )}
              </RowGroup>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

/** Fragment wrapper to avoid React key warnings with multiple rows per entry */
function RowGroup({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

/** Expanded row detail panel showing ability scores, proficient skills, languages */
function ExpandedDetails({ character }: { character: Character }) {
  const proficientSkills = SKILL_NAMES.filter((s) =>
    isCharacterProficient(character, s)
  )

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Ability Scores */}
      <div>
        <h4 className="text-xs font-medium text-parchment/50 uppercase tracking-wider mb-2">
          Ability Scores
        </h4>
        <div className="grid grid-cols-3 gap-2">
          {ABILITY_NAMES.map((ability) => {
            const score = character.abilityScores[ability]
            const mod = getModifier(score)
            return (
              <div
                key={ability}
                className="text-center px-2 py-1 rounded bg-bg-primary border border-parchment/10"
              >
                <div className="text-[10px] text-parchment/40 uppercase">
                  {ability.slice(0, 3)}
                </div>
                <div className="text-parchment font-mono text-sm">
                  {score}
                </div>
                <div className="text-parchment/60 text-xs font-mono">
                  {formatModifier(mod)}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Proficient Skills */}
      <div>
        <h4 className="text-xs font-medium text-parchment/50 uppercase tracking-wider mb-2">
          Proficient Skills
        </h4>
        {proficientSkills.length === 0 ? (
          <p className="text-parchment/30 text-xs">No skill proficiencies</p>
        ) : (
          <div className="flex flex-wrap gap-1">
            {proficientSkills.map((skill) => (
              <span
                key={skill}
                className="text-xs px-1.5 py-0.5 rounded bg-accent-gold/10 text-accent-gold border border-accent-gold/20"
              >
                {formatSkillName(skill)}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Languages */}
      <div>
        <h4 className="text-xs font-medium text-parchment/50 uppercase tracking-wider mb-2">
          Languages
        </h4>
        {character.proficiencies.languages.length === 0 ? (
          <p className="text-parchment/30 text-xs">No languages</p>
        ) : (
          <div className="flex flex-wrap gap-1">
            {character.proficiencies.languages.map((lang) => (
              <span
                key={lang}
                className="text-xs px-1.5 py-0.5 rounded bg-parchment/10 text-parchment/70 border border-parchment/10"
              >
                {lang.charAt(0).toUpperCase() + lang.slice(1)}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
