/**
 * Party Analysis Utilities (Epic 34)
 *
 * Pure functions for analyzing a party of D&D 5e characters:
 * - HP bar color calculations
 * - Skill modifier aggregation and best-in-party detection
 * - Language coverage with gap identification
 * - Tool proficiency aggregation
 * - Party role/composition analysis
 * - Special characteristic detection (darkvision, healing, etc.)
 */

import type { Character } from '@/types/character'
import type { SkillName, AbilityName, Language } from '@/types/core'
import { SKILL_NAMES, LANGUAGES } from '@/types/core'
import { getCharacterSkillModifier, getCharacterPassiveScore } from '@/utils/calculations/skills'
import { getModifier } from '@/utils/calculations/ability'
import { getProficiencyBonus, getSpellSaveDC } from '@/utils/calculations'
import { CLASSES } from '@/data/classes'
import { races } from '@/data/races'

// ---------------------------------------------------------------------------
// HP Bar Color
// ---------------------------------------------------------------------------

export type HpBarColor = 'green' | 'yellow' | 'red'

/**
 * Determine the HP bar color based on current/max ratio.
 * - Green: >50%
 * - Yellow: 25-50%
 * - Red: <25%
 */
export function getHpBarColor(current: number, max: number): HpBarColor {
  if (max <= 0) return 'red'
  const ratio = current / max
  if (ratio > 0.5) return 'green'
  if (ratio >= 0.25) return 'yellow'
  return 'red'
}

/**
 * Get the HP percentage (0-100).
 */
export function getHpPercentage(current: number, max: number): number {
  if (max <= 0) return 0
  return Math.max(0, Math.min(100, Math.round((current / max) * 100)))
}

// ---------------------------------------------------------------------------
// Character Display Helpers
// ---------------------------------------------------------------------------

/**
 * Get the display name for a character's class (handles multiclass).
 */
export function getClassDisplay(character: Character): string {
  if (character.classes.length === 0) return 'Unknown'
  if (character.classes.length === 1) {
    const cls = character.classes[0]
    const classData = CLASSES.find((c) => c.id === cls.classId)
    return classData?.name ?? cls.classId
  }
  return character.classes
    .map((cls) => {
      const classData = CLASSES.find((c) => c.id === cls.classId)
      return `${classData?.name ?? cls.classId} ${cls.level}`
    })
    .join(' / ')
}

/**
 * Get the display name for a character's race.
 */
export function getRaceDisplay(character: Character): string {
  const raceData = races.find((r) => r.id === character.race.raceId)
  if (!raceData) return character.race.raceId
  if (character.race.subraceId) {
    const subrace = raceData.subraces.find((s) => s.id === character.race.subraceId)
    if (subrace) return subrace.name
  }
  return raceData.name
}

/**
 * Get the primary class ID for a character.
 */
export function getPrimaryClassId(character: Character): string {
  if (character.classes.length === 0) return ''
  // Primary class is the one with highest level
  const sorted = [...character.classes].sort((a, b) => b.level - a.level)
  return sorted[0].classId
}

/**
 * Get spell save DC for a character, or null if not a caster.
 */
export function getCharacterSpellSaveDC(character: Character): number | null {
  if (!character.spellcasting) return null
  const castingClass = character.classes.find((cls) => {
    const classData = CLASSES.find((c) => c.id === cls.classId)
    return classData?.spellcasting && classData.spellcasting.type !== 'none'
  })
  if (!castingClass) return null
  const classData = CLASSES.find((c) => c.id === castingClass.classId)
  if (!classData?.spellcasting) return null
  const abilityMod = getModifier(character.abilityScores[classData.spellcasting.ability])
  const profBonus = getProficiencyBonus(character.level)
  return getSpellSaveDC(abilityMod, profBonus)
}

/**
 * Get initiative modifier for a character.
 */
export function getCharacterInitiativeModifier(character: Character): number {
  const dexMod = getModifier(character.abilityScores.dexterity)
  return dexMod + (character.initiativeBonus ?? 0)
}

/**
 * Get the armor class for a character from combatStats or override.
 */
export function getCharacterAC(character: Character): number {
  if (character.armorClassOverride !== undefined) return character.armorClassOverride
  return character.combatStats?.armorClass?.base ?? 10 + getModifier(character.abilityScores.dexterity)
}

// ---------------------------------------------------------------------------
// Sorting
// ---------------------------------------------------------------------------

export type SortColumn =
  | 'name'
  | 'race'
  | 'class'
  | 'level'
  | 'hp'
  | 'ac'
  | 'initiative'
  | 'speed'
  | 'passivePerception'
  | 'spellSaveDC'

export type SortDirection = 'asc' | 'desc'

/**
 * Sort characters by a given column.
 */
export function sortCharacters(
  characters: Character[],
  column: SortColumn,
  direction: SortDirection
): Character[] {
  return [...characters].sort((a, b) => {
    let comparison = 0
    switch (column) {
      case 'name':
        comparison = a.name.localeCompare(b.name)
        break
      case 'race':
        comparison = getRaceDisplay(a).localeCompare(getRaceDisplay(b))
        break
      case 'class':
        comparison = getClassDisplay(a).localeCompare(getClassDisplay(b))
        break
      case 'level':
        comparison = a.level - b.level
        break
      case 'hp':
        comparison = a.hpCurrent - b.hpCurrent
        break
      case 'ac':
        comparison = getCharacterAC(a) - getCharacterAC(b)
        break
      case 'initiative':
        comparison = getCharacterInitiativeModifier(a) - getCharacterInitiativeModifier(b)
        break
      case 'speed':
        comparison = (a.speed?.walk ?? 0) - (b.speed?.walk ?? 0)
        break
      case 'passivePerception':
        comparison =
          getCharacterPassiveScore(a, 'perception') -
          getCharacterPassiveScore(b, 'perception')
        break
      case 'spellSaveDC': {
        const dcA = getCharacterSpellSaveDC(a) ?? -1
        const dcB = getCharacterSpellSaveDC(b) ?? -1
        comparison = dcA - dcB
        break
      }
    }
    return direction === 'asc' ? comparison : -comparison
  })
}

// ---------------------------------------------------------------------------
// Skill Matrix
// ---------------------------------------------------------------------------

/** Skill grouped by ability score */
export interface SkillGroup {
  ability: AbilityName
  abilityLabel: string
  skills: SkillName[]
}

/** All 18 skills grouped by their governing ability */
export const SKILL_GROUPS: SkillGroup[] = [
  {
    ability: 'strength',
    abilityLabel: 'STR',
    skills: ['athletics'],
  },
  {
    ability: 'dexterity',
    abilityLabel: 'DEX',
    skills: ['acrobatics', 'sleight-of-hand', 'stealth'],
  },
  {
    ability: 'intelligence',
    abilityLabel: 'INT',
    skills: ['arcana', 'history', 'investigation', 'nature', 'religion'],
  },
  {
    ability: 'wisdom',
    abilityLabel: 'WIS',
    skills: ['animal-handling', 'insight', 'medicine', 'perception', 'survival'],
  },
  {
    ability: 'charisma',
    abilityLabel: 'CHA',
    skills: ['deception', 'intimidation', 'performance', 'persuasion'],
  },
]

/** Get the skill modifier for a character and skill */
export function getSkillMod(character: Character, skill: SkillName): number {
  return getCharacterSkillModifier(character, skill)
}

/** Check if a character is proficient in a skill */
export function isCharacterProficient(character: Character, skill: SkillName): boolean {
  const entry = character.proficiencies.skills.find((s) => s.skill === skill)
  return entry?.proficient ?? false
}

/** Check if a character has expertise in a skill */
export function hasExpertise(character: Character, skill: SkillName): boolean {
  const entry = character.proficiencies.skills.find((s) => s.skill === skill)
  return entry?.expertise ?? false
}

/**
 * Find the highest modifier(s) for a skill across a party.
 * Returns the indices of characters with the highest modifier.
 */
export function findBestInParty(
  characters: Character[],
  skill: SkillName
): number[] {
  if (characters.length === 0) return []
  const mods = characters.map((c) => getSkillMod(c, skill))
  const maxMod = Math.max(...mods)
  return mods.reduce<number[]>((indices, mod, i) => {
    if (mod === maxMod) indices.push(i)
    return indices
  }, [])
}

/**
 * Filter skills by search text.
 */
export function filterSkills(search: string): SkillName[] {
  if (!search.trim()) return [...SKILL_NAMES]
  const lower = search.toLowerCase()
  return SKILL_NAMES.filter((s) =>
    formatSkillName(s).toLowerCase().includes(lower)
  )
}

/**
 * Format a skill name for display (e.g., "sleight-of-hand" -> "Sleight of Hand").
 */
export function formatSkillName(skill: SkillName): string {
  return skill
    .split('-')
    .map((w, i) => {
      if (i > 0 && w === 'of') return 'of'
      return w.charAt(0).toUpperCase() + w.slice(1)
    })
    .join(' ')
}

/**
 * Format an ability name for display (e.g., "strength" -> "Strength").
 */
export function formatAbilityName(ability: AbilityName): string {
  return ability.charAt(0).toUpperCase() + ability.slice(1)
}

// ---------------------------------------------------------------------------
// Language Coverage
// ---------------------------------------------------------------------------

export const COMMON_LANGUAGES: Language[] = [
  'common',
  'dwarvish',
  'elvish',
  'giant',
  'gnomish',
  'goblin',
  'halfling',
  'orc',
]

export const EXOTIC_LANGUAGES: Language[] = [
  'abyssal',
  'celestial',
  'deep-speech',
  'draconic',
  'infernal',
  'primordial',
  'sylvan',
  'undercommon',
]

export interface LanguageCoverageEntry {
  language: Language
  speakers: string[] // character names
  count: number
}

/**
 * Aggregate language coverage across a party.
 */
export function getLanguageCoverage(
  characters: Character[]
): LanguageCoverageEntry[] {
  const map = new Map<Language, string[]>()

  for (const lang of LANGUAGES) {
    map.set(lang, [])
  }

  for (const character of characters) {
    for (const lang of character.proficiencies.languages) {
      const speakers = map.get(lang)
      if (speakers) {
        speakers.push(character.name)
      } else {
        map.set(lang, [character.name])
      }
    }
  }

  return Array.from(map.entries()).map(([language, speakers]) => ({
    language,
    speakers,
    count: speakers.length,
  }))
}

/**
 * Get language coverage entries for a specific category.
 */
export function getCoverageByCategory(
  coverage: LanguageCoverageEntry[],
  category: 'common' | 'exotic'
): LanguageCoverageEntry[] {
  const langs = category === 'common' ? COMMON_LANGUAGES : EXOTIC_LANGUAGES
  return coverage.filter((entry) => langs.includes(entry.language))
}

/**
 * Identify language gaps (SRD languages with 0 speakers).
 */
export function getLanguageGaps(
  coverage: LanguageCoverageEntry[]
): LanguageCoverageEntry[] {
  return coverage.filter((entry) => entry.count === 0)
}

/**
 * Format a language name for display (e.g., "deep-speech" -> "Deep Speech").
 */
export function formatLanguageName(language: Language): string {
  return language
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

/**
 * Aggregate tool proficiencies across a party.
 */
export interface ToolCoverageEntry {
  tool: string
  users: string[] // character names
  count: number
}

export function getToolCoverage(characters: Character[]): ToolCoverageEntry[] {
  const map = new Map<string, string[]>()

  for (const character of characters) {
    for (const tool of character.proficiencies.tools) {
      const users = map.get(tool)
      if (users) {
        users.push(character.name)
      } else {
        map.set(tool, [character.name])
      }
    }
  }

  return Array.from(map.entries())
    .map(([tool, users]) => ({ tool, users, count: users.length }))
    .sort((a, b) => a.tool.localeCompare(b.tool))
}

// ---------------------------------------------------------------------------
// Party Composition Analysis
// ---------------------------------------------------------------------------

export type PartyRole =
  | 'Tank/Defender'
  | 'Melee Striker'
  | 'Ranged Striker'
  | 'Healer/Support'
  | 'Controller'
  | 'Utility/Skill Monkey'
  | 'Face (Social)'

export type RoleCoverage = 'primary' | 'secondary' | 'none'

export interface RoleAssignment {
  role: PartyRole
  description: string
  primaryCharacters: string[]
  secondaryCharacters: string[]
  coverage: RoleCoverage
}

export const ROLE_DESCRIPTIONS: Record<PartyRole, string> = {
  'Tank/Defender':
    'Characters with high AC and HP who can absorb damage and protect allies.',
  'Melee Striker':
    'Characters who deal strong damage in close combat.',
  'Ranged Striker':
    'Characters who deal damage from a distance with weapons or spells.',
  'Healer/Support':
    'Characters who can restore hit points and provide magical support.',
  'Controller':
    'Characters who shape the battlefield with area-of-effect spells and crowd control.',
  'Utility/Skill Monkey':
    'Characters with many skill proficiencies and out-of-combat utility.',
  'Face (Social)':
    'Characters with high Charisma and social skills for negotiations and persuasion.',
}

/** Class to role mapping. Each class can fill primary and secondary roles. */
export const CLASS_ROLE_MAP: Record<string, { primary: PartyRole[]; secondary: PartyRole[] }> = {
  barbarian: {
    primary: ['Tank/Defender', 'Melee Striker'],
    secondary: [],
  },
  bard: {
    primary: ['Healer/Support', 'Utility/Skill Monkey', 'Face (Social)'],
    secondary: ['Controller'],
  },
  cleric: {
    primary: ['Healer/Support'],
    secondary: ['Tank/Defender', 'Controller'],
  },
  druid: {
    primary: ['Healer/Support', 'Controller'],
    secondary: ['Tank/Defender'],
  },
  fighter: {
    primary: ['Tank/Defender', 'Melee Striker'],
    secondary: ['Ranged Striker'],
  },
  monk: {
    primary: ['Melee Striker'],
    secondary: ['Utility/Skill Monkey'],
  },
  paladin: {
    primary: ['Tank/Defender', 'Melee Striker'],
    secondary: ['Healer/Support', 'Face (Social)'],
  },
  ranger: {
    primary: ['Ranged Striker', 'Utility/Skill Monkey'],
    secondary: ['Melee Striker'],
  },
  rogue: {
    primary: ['Utility/Skill Monkey'],
    secondary: ['Melee Striker', 'Ranged Striker'],
  },
  sorcerer: {
    primary: ['Ranged Striker', 'Controller'],
    secondary: ['Face (Social)'],
  },
  warlock: {
    primary: ['Ranged Striker'],
    secondary: ['Controller', 'Face (Social)'],
  },
  wizard: {
    primary: ['Controller'],
    secondary: ['Ranged Striker', 'Utility/Skill Monkey'],
  },
}

const ALL_ROLES: PartyRole[] = [
  'Tank/Defender',
  'Melee Striker',
  'Ranged Striker',
  'Healer/Support',
  'Controller',
  'Utility/Skill Monkey',
  'Face (Social)',
]

/**
 * Analyze party composition and return role assignments.
 */
export function analyzePartyComposition(characters: Character[]): RoleAssignment[] {
  const roleMap = new Map<
    PartyRole,
    { primary: Set<string>; secondary: Set<string> }
  >()

  for (const role of ALL_ROLES) {
    roleMap.set(role, { primary: new Set(), secondary: new Set() })
  }

  for (const character of characters) {
    for (const cls of character.classes) {
      const mapping = CLASS_ROLE_MAP[cls.classId]
      if (!mapping) continue

      for (const role of mapping.primary) {
        roleMap.get(role)!.primary.add(character.name)
      }
      for (const role of mapping.secondary) {
        roleMap.get(role)!.secondary.add(character.name)
      }
    }

    // Also check CHA for Face (Social) role — high CHA build
    if (character.abilityScores.charisma >= 16) {
      const faceRole = roleMap.get('Face (Social)')!
      if (!faceRole.primary.has(character.name)) {
        faceRole.secondary.add(character.name)
      }
    }
  }

  return ALL_ROLES.map((role) => {
    const data = roleMap.get(role)!
    const primaryCharacters = Array.from(data.primary)
    const secondaryCharacters = Array.from(data.secondary).filter(
      (name) => !data.primary.has(name)
    )
    let coverage: RoleCoverage = 'none'
    if (primaryCharacters.length > 0) coverage = 'primary'
    else if (secondaryCharacters.length > 0) coverage = 'secondary'

    return {
      role,
      description: ROLE_DESCRIPTIONS[role],
      primaryCharacters,
      secondaryCharacters,
      coverage,
    }
  })
}

// ---------------------------------------------------------------------------
// Special Callouts
// ---------------------------------------------------------------------------

export interface PartyCallout {
  type: 'strength' | 'warning' | 'info'
  message: string
}

const HEALER_CLASSES = new Set(['cleric', 'druid', 'bard', 'paladin'])

/**
 * Detect special party characteristics for callout badges.
 */
export function getPartyCallouts(characters: Character[]): PartyCallout[] {
  if (characters.length === 0) return []

  const callouts: PartyCallout[] = []

  // Check darkvision
  const allDarkvision = characters.every((c) => {
    const raceData = races.find((r) => r.id === c.race.raceId)
    if (!raceData) return false
    if (raceData.senses.some((s) => s.type === 'darkvision')) return true
    if (c.race.subraceId) {
      const subrace = raceData.subraces.find((sr) => sr.id === c.race.subraceId)
      return subrace?.senses?.some((s) => s.type === 'darkvision') ?? false
    }
    return false
  })
  if (allDarkvision) {
    callouts.push({
      type: 'strength',
      message: 'All party members have darkvision',
    })
  }

  // Check healing capability
  const hasHealer = characters.some((c) =>
    c.classes.some((cls) => HEALER_CLASSES.has(cls.classId))
  )
  if (!hasHealer) {
    callouts.push({
      type: 'warning',
      message: 'No one has healing magic',
    })
  }

  // Check for ranged damage
  const hasRanged = characters.some((c) =>
    c.classes.some((cls) =>
      ['ranger', 'warlock', 'sorcerer', 'wizard'].includes(cls.classId) ||
      (cls.classId === 'fighter' && c.classes.length === 1)
    )
  )
  if (!hasRanged) {
    callouts.push({
      type: 'warning',
      message: 'No dedicated ranged damage dealer',
    })
  }

  // Check passive perception
  const lowestPerception = Math.min(
    ...characters.map((c) => getCharacterPassiveScore(c, 'perception'))
  )
  if (lowestPerception <= 10) {
    callouts.push({
      type: 'info',
      message: `Lowest passive Perception in party: ${lowestPerception}`,
    })
  }

  // Party average AC
  const avgAC =
    characters.reduce((sum, c) => sum + getCharacterAC(c), 0) / characters.length
  if (avgAC < 14) {
    callouts.push({
      type: 'info',
      message: `Low average party AC: ${Math.round(avgAC)}`,
    })
  }

  return callouts
}
