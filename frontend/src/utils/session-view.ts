/**
 * Session View Utilities (Epic 32 - Story 32.2)
 *
 * Configuration and persistence for the compact session play view.
 * Manages pinned skills per character (max 8), stored in localStorage.
 */

import type { Character } from '@/types/character'
import type { SkillName, AbilityName } from '@/types/core'
import { SKILL_ABILITY_MAP } from '@/types/core'
import { getClassById } from '@/data/classes'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SessionViewConfig {
  /** Skill/save IDs pinned to the session view (max 8) */
  pinnedSkills: string[]
  /** Whether to show spell slot strip */
  showSpellSlots: boolean
  /** Whether to show condition badges */
  showConditions: boolean
  /** Whether to show feature use counters */
  showFeatureUses: boolean
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STORAGE_KEY_PREFIX = 'dnd-forge-session-config-'
const MAX_PINNED_SKILLS = 8

export const DEFAULT_PINNED_SKILLS: string[] = [
  'perception',
  'athletics',
  'stealth',
  'investigation',
]

const DEFAULT_CONFIG: SessionViewConfig = {
  pinnedSkills: DEFAULT_PINNED_SKILLS,
  showSpellSlots: true,
  showConditions: true,
  showFeatureUses: true,
}

// ---------------------------------------------------------------------------
// Functions
// ---------------------------------------------------------------------------

/**
 * Returns default pinned skills for a character based on their class.
 * Prioritises class-primary-ability skills, then adds Perception, Athletics,
 * Stealth, Investigation up to 8 total.
 */
export function getDefaultPinnedSkills(character: Character): string[] {
  const pinned: string[] = []
  const seen = new Set<string>()

  const addSkill = (skill: string) => {
    if (!seen.has(skill) && pinned.length < MAX_PINNED_SKILLS) {
      seen.add(skill)
      pinned.push(skill)
    }
  }

  // Gather primary abilities from all classes
  const primaryAbilities = new Set<AbilityName>()
  if (character.classes) {
    for (const classSel of character.classes) {
      const classData = getClassById(classSel.classId)
      if (classData) {
        for (const ability of classData.primaryAbility) {
          primaryAbilities.add(ability)
        }
      }
    }
  }

  // Add skills that match primary abilities
  for (const [skill, ability] of Object.entries(SKILL_ABILITY_MAP)) {
    if (primaryAbilities.has(ability)) {
      addSkill(skill)
    }
  }

  // Always include these core defaults
  for (const skill of DEFAULT_PINNED_SKILLS) {
    addSkill(skill)
  }

  // If still under 8, add saving throws for primary abilities
  for (const ability of primaryAbilities) {
    addSkill(`save-${ability}`)
  }

  return pinned
}

/**
 * Load session view configuration from localStorage.
 * Returns default config if nothing is stored or if parsing fails.
 */
export function getSessionViewConfig(characterId: string): SessionViewConfig {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY_PREFIX}${characterId}`)
    if (!raw) return { ...DEFAULT_CONFIG }

    const parsed = JSON.parse(raw) as Partial<SessionViewConfig>

    return {
      pinnedSkills: Array.isArray(parsed.pinnedSkills)
        ? parsed.pinnedSkills.slice(0, MAX_PINNED_SKILLS)
        : DEFAULT_CONFIG.pinnedSkills,
      showSpellSlots:
        typeof parsed.showSpellSlots === 'boolean'
          ? parsed.showSpellSlots
          : DEFAULT_CONFIG.showSpellSlots,
      showConditions:
        typeof parsed.showConditions === 'boolean'
          ? parsed.showConditions
          : DEFAULT_CONFIG.showConditions,
      showFeatureUses:
        typeof parsed.showFeatureUses === 'boolean'
          ? parsed.showFeatureUses
          : DEFAULT_CONFIG.showFeatureUses,
    }
  } catch {
    return { ...DEFAULT_CONFIG }
  }
}

/**
 * Save session view configuration to localStorage.
 * Enforces the max 8 pinned skills limit.
 */
export function saveSessionViewConfig(
  characterId: string,
  config: SessionViewConfig,
): void {
  const sanitised: SessionViewConfig = {
    ...config,
    pinnedSkills: config.pinnedSkills.slice(0, MAX_PINNED_SKILLS),
  }
  localStorage.setItem(
    `${STORAGE_KEY_PREFIX}${characterId}`,
    JSON.stringify(sanitised),
  )
}

/**
 * All available pinnable options grouped by ability score.
 * Each entry includes the 18 skills + 6 saving throws (24 total).
 */
export function getPinnableOptions(): {
  ability: AbilityName
  label: string
  options: { id: string; label: string; type: 'skill' | 'save' }[]
}[] {
  const abilityLabels: Record<AbilityName, string> = {
    strength: 'Strength',
    dexterity: 'Dexterity',
    constitution: 'Constitution',
    intelligence: 'Intelligence',
    wisdom: 'Wisdom',
    charisma: 'Charisma',
  }

  const abilities: AbilityName[] = [
    'strength',
    'dexterity',
    'constitution',
    'intelligence',
    'wisdom',
    'charisma',
  ]

  return abilities.map((ability) => {
    const skills = Object.entries(SKILL_ABILITY_MAP)
      .filter(([, ab]) => ab === ability)
      .map(([skill]) => ({
        id: skill,
        label: formatSkillName(skill as SkillName),
        type: 'skill' as const,
      }))

    const save = {
      id: `save-${ability}`,
      label: `${abilityLabels[ability]} Save`,
      type: 'save' as const,
    }

    return {
      ability,
      label: abilityLabels[ability],
      options: [...skills, save],
    }
  })
}

/**
 * Format a skill name for display (e.g., 'sleight-of-hand' -> 'Sleight of Hand').
 */
export function formatSkillName(skill: SkillName | string): string {
  return skill
    .split('-')
    .map((word, i) => {
      if (i > 0 && ['of', 'the', 'in', 'on', 'at'].includes(word)) {
        return word
      }
      return word.charAt(0).toUpperCase() + word.slice(1)
    })
    .join(' ')
}

export { MAX_PINNED_SKILLS }
