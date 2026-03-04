// =============================================================================
// Story 29.1 -- Condition Definitions
// All 15 D&D 5e conditions with display metadata, severity, descriptions,
// and mechanical effects for the conditions tracker system.
// =============================================================================

import type { Condition } from '@/types/core'

// ---------------------------------------------------------------------------
// Severity Type
// ---------------------------------------------------------------------------

export type ConditionSeverity = 'debilitating' | 'moderate' | 'mild' | 'beneficial'

// ---------------------------------------------------------------------------
// Condition Definition
// ---------------------------------------------------------------------------

export interface ConditionDefinition {
  id: Condition
  name: string
  icon: string
  color: string
  severity: ConditionSeverity
  description: string
  effects: string[]
}

// ---------------------------------------------------------------------------
// Condition Definitions Map
// ---------------------------------------------------------------------------

export const CONDITION_DEFINITIONS: Record<Condition, ConditionDefinition> = {
  blinded: {
    id: 'blinded',
    name: 'Blinded',
    icon: 'EyeOff',
    color: 'text-red-500 bg-red-500/15 border-red-500/30',
    severity: 'debilitating',
    description:
      'A blinded creature can\'t see and automatically fails any ability check that requires sight.',
    effects: [
      'Can\'t see and automatically fails ability checks requiring sight',
      'Attack rolls against the creature have advantage',
      'The creature\'s attack rolls have disadvantage',
    ],
  },
  charmed: {
    id: 'charmed',
    name: 'Charmed',
    icon: 'Heart',
    color: 'text-yellow-500 bg-yellow-500/15 border-yellow-500/30',
    severity: 'mild',
    description:
      'A charmed creature can\'t attack the charmer or target it with harmful abilities or magical effects.',
    effects: [
      'Can\'t attack the charmer or target it with harmful abilities or spells',
      'The charmer has advantage on ability checks to interact socially with the creature',
    ],
  },
  deafened: {
    id: 'deafened',
    name: 'Deafened',
    icon: 'EarOff',
    color: 'text-yellow-500 bg-yellow-500/15 border-yellow-500/30',
    severity: 'mild',
    description:
      'A deafened creature can\'t hear and automatically fails any ability check that requires hearing.',
    effects: [
      'Can\'t hear and automatically fails ability checks requiring hearing',
    ],
  },
  frightened: {
    id: 'frightened',
    name: 'Frightened',
    icon: 'Ghost',
    color: 'text-orange-500 bg-orange-500/15 border-orange-500/30',
    severity: 'moderate',
    description:
      'A frightened creature has disadvantage on ability checks and attack rolls while the source of fear is within line of sight.',
    effects: [
      'Disadvantage on ability checks while source of fear is in line of sight',
      'Disadvantage on attack rolls while source of fear is in line of sight',
      'Can\'t willingly move closer to the source of fear',
    ],
  },
  grappled: {
    id: 'grappled',
    name: 'Grappled',
    icon: 'Grip',
    color: 'text-yellow-500 bg-yellow-500/15 border-yellow-500/30',
    severity: 'mild',
    description:
      'A grappled creature\'s speed becomes 0, and it can\'t benefit from any bonus to its speed.',
    effects: [
      'Speed becomes 0 and can\'t benefit from speed bonuses',
      'Ends if the grappler is incapacitated',
      'Ends if the creature is removed from the grappler\'s reach',
    ],
  },
  incapacitated: {
    id: 'incapacitated',
    name: 'Incapacitated',
    icon: 'Ban',
    color: 'text-red-500 bg-red-500/15 border-red-500/30',
    severity: 'debilitating',
    description:
      'An incapacitated creature can\'t take actions or reactions.',
    effects: [
      'Can\'t take actions or reactions',
    ],
  },
  invisible: {
    id: 'invisible',
    name: 'Invisible',
    icon: 'Eye',
    color: 'text-green-500 bg-green-500/15 border-green-500/30',
    severity: 'beneficial',
    description:
      'An invisible creature is impossible to see without the aid of magic or a special sense.',
    effects: [
      'Impossible to see without magic or special sense',
      'Considered heavily obscured for hiding (can attempt to hide)',
      'Attack rolls against the creature have disadvantage',
      'The creature\'s attack rolls have advantage',
    ],
  },
  paralyzed: {
    id: 'paralyzed',
    name: 'Paralyzed',
    icon: 'Zap',
    color: 'text-red-500 bg-red-500/15 border-red-500/30',
    severity: 'debilitating',
    description:
      'A paralyzed creature is incapacitated and can\'t move or speak.',
    effects: [
      'Incapacitated (can\'t take actions or reactions)',
      'Can\'t move or speak',
      'Automatically fails Strength and Dexterity saving throws',
      'Attack rolls against the creature have advantage',
      'Melee attacks within 5 feet are automatic critical hits',
    ],
  },
  petrified: {
    id: 'petrified',
    name: 'Petrified',
    icon: 'Mountain',
    color: 'text-red-500 bg-red-500/15 border-red-500/30',
    severity: 'debilitating',
    description:
      'A petrified creature is transformed into a solid inanimate substance. It is incapacitated, can\'t move or speak, and is unaware of its surroundings.',
    effects: [
      'Transformed into solid inanimate substance',
      'Incapacitated (can\'t take actions or reactions)',
      'Can\'t move or speak and is unaware of surroundings',
      'Attack rolls against the creature have advantage',
      'Automatically fails Strength and Dexterity saving throws',
      'Resistance to all damage',
      'Immune to poison and disease',
    ],
  },
  poisoned: {
    id: 'poisoned',
    name: 'Poisoned',
    icon: 'Skull',
    color: 'text-orange-500 bg-orange-500/15 border-orange-500/30',
    severity: 'moderate',
    description:
      'A poisoned creature has disadvantage on attack rolls and ability checks.',
    effects: [
      'Disadvantage on attack rolls',
      'Disadvantage on ability checks',
    ],
  },
  prone: {
    id: 'prone',
    name: 'Prone',
    icon: 'ArrowDown',
    color: 'text-yellow-500 bg-yellow-500/15 border-yellow-500/30',
    severity: 'mild',
    description:
      'A prone creature\'s only movement option is to crawl. The creature has disadvantage on attack rolls.',
    effects: [
      'Only movement option is to crawl (costs extra movement)',
      'Disadvantage on attack rolls',
      'Melee attacks within 5 feet have advantage against the creature',
      'Ranged attacks beyond 5 feet have disadvantage against the creature',
    ],
  },
  restrained: {
    id: 'restrained',
    name: 'Restrained',
    icon: 'Lock',
    color: 'text-orange-500 bg-orange-500/15 border-orange-500/30',
    severity: 'moderate',
    description:
      'A restrained creature\'s speed becomes 0, and it can\'t benefit from any bonus to its speed.',
    effects: [
      'Speed becomes 0 and can\'t benefit from speed bonuses',
      'Attack rolls against the creature have advantage',
      'The creature\'s attack rolls have disadvantage',
      'Disadvantage on Dexterity saving throws',
    ],
  },
  stunned: {
    id: 'stunned',
    name: 'Stunned',
    icon: 'Stars',
    color: 'text-red-500 bg-red-500/15 border-red-500/30',
    severity: 'debilitating',
    description:
      'A stunned creature is incapacitated, can\'t move, and can speak only falteringly.',
    effects: [
      'Incapacitated (can\'t take actions or reactions)',
      'Can\'t move and can speak only falteringly',
      'Automatically fails Strength and Dexterity saving throws',
      'Attack rolls against the creature have advantage',
    ],
  },
  unconscious: {
    id: 'unconscious',
    name: 'Unconscious',
    icon: 'Moon',
    color: 'text-red-500 bg-red-500/15 border-red-500/30',
    severity: 'debilitating',
    description:
      'An unconscious creature is incapacitated, can\'t move or speak, and is unaware of its surroundings.',
    effects: [
      'Incapacitated (can\'t take actions or reactions)',
      'Can\'t move or speak and is unaware of surroundings',
      'Drops whatever it\'s holding and falls prone',
      'Automatically fails Strength and Dexterity saving throws',
      'Attack rolls against the creature have advantage',
      'Melee attacks within 5 feet are automatic critical hits',
    ],
  },
  exhaustion: {
    id: 'exhaustion',
    name: 'Exhaustion',
    icon: 'Battery',
    color: 'text-orange-500 bg-orange-500/15 border-orange-500/30',
    severity: 'moderate',
    description:
      'Exhaustion is measured in six levels. An effect can give a creature one or more levels of exhaustion. Effects are cumulative.',
    effects: [
      'Level 1: Disadvantage on ability checks',
      'Level 2: Speed halved',
      'Level 3: Disadvantage on attack rolls and saving throws',
      'Level 4: Hit point maximum halved',
      'Level 5: Speed reduced to 0',
      'Level 6: Death',
    ],
  },
}

// ---------------------------------------------------------------------------
// Exhaustion Level Effects (for ExhaustionTracker component)
// ---------------------------------------------------------------------------

export const EXHAUSTION_LEVEL_EFFECTS: string[] = [
  'Disadvantage on ability checks',
  'Speed halved',
  'Disadvantage on attack rolls and saving throws',
  'Hit point maximum halved',
  'Speed reduced to 0',
  'Death',
]

// ---------------------------------------------------------------------------
// Short Descriptions (for AddConditionModal search/display)
// ---------------------------------------------------------------------------

export const CONDITION_SHORT_DESCRIPTIONS: Record<Condition, string> = {
  blinded: 'Can\'t see; attacks have disadvantage',
  charmed: 'Can\'t attack the charmer; social disadvantage',
  deafened: 'Can\'t hear; fails hearing checks',
  frightened: 'Disadvantage on checks and attacks near source of fear',
  grappled: 'Speed becomes 0',
  incapacitated: 'Can\'t take actions or reactions',
  invisible: 'Can\'t be seen; attacks have advantage',
  paralyzed: 'Incapacitated; can\'t move or speak; auto-fail STR/DEX saves',
  petrified: 'Turned to stone; incapacitated; resistant to all damage',
  poisoned: 'Disadvantage on attacks and ability checks',
  prone: 'Crawling only; disadvantage on attacks',
  restrained: 'Speed 0; disadvantage on attacks and DEX saves',
  stunned: 'Incapacitated; can\'t move; auto-fail STR/DEX saves',
  unconscious: 'Incapacitated; can\'t move or speak; auto-fail STR/DEX saves',
  exhaustion: 'Cumulative penalties at each of 6 levels',
}

// ---------------------------------------------------------------------------
// Common Conditions (for quick-add strip)
// ---------------------------------------------------------------------------

export const COMMON_CONDITIONS: Condition[] = [
  'frightened',
  'poisoned',
  'prone',
  'grappled',
  'restrained',
  'stunned',
]

// ---------------------------------------------------------------------------
// Severity Badge Classes
// ---------------------------------------------------------------------------

const SEVERITY_BADGE_MAP: Record<ConditionSeverity, string> = {
  debilitating: 'text-red-500 bg-red-500/15 border-red-500/30',
  moderate: 'text-orange-500 bg-orange-500/15 border-orange-500/30',
  mild: 'text-yellow-500 bg-yellow-500/15 border-yellow-500/30',
  beneficial: 'text-green-500 bg-green-500/15 border-green-500/30',
}

// ---------------------------------------------------------------------------
// Color Classes (for ConditionCard popover borders/text)
// ---------------------------------------------------------------------------

export type ConditionColor = 'red' | 'orange' | 'yellow' | 'green'

export const CONDITION_COLOR_CLASSES: Record<ConditionColor, { text: string; border: string; bg: string }> = {
  red: { text: 'text-red-500', border: 'border-red-500/30', bg: 'bg-red-500/15' },
  orange: { text: 'text-orange-500', border: 'border-orange-500/30', bg: 'bg-orange-500/15' },
  yellow: { text: 'text-yellow-500', border: 'border-yellow-500/30', bg: 'bg-yellow-500/15' },
  green: { text: 'text-green-500', border: 'border-green-500/30', bg: 'bg-green-500/15' },
}

const SEVERITY_TO_COLOR: Record<ConditionSeverity, ConditionColor> = {
  debilitating: 'red',
  moderate: 'orange',
  mild: 'yellow',
  beneficial: 'green',
}

/**
 * Get the color identifier for a condition based on its severity.
 */
export function getConditionColor(condition: Condition): ConditionColor {
  const severity = CONDITION_DEFINITIONS[condition].severity
  return SEVERITY_TO_COLOR[severity]
}

// ---------------------------------------------------------------------------
// Helper Functions
// ---------------------------------------------------------------------------

/**
 * Get the display name for a condition (title-cased).
 */
export function getConditionDisplayName(condition: Condition): string {
  return CONDITION_DEFINITIONS[condition].name
}

/**
 * Get the severity of a condition.
 */
export function getConditionSeverity(condition: Condition): ConditionSeverity {
  return CONDITION_DEFINITIONS[condition].severity
}

/**
 * Get Tailwind badge classes for a condition based on its severity.
 */
export function getConditionBadgeClasses(condition: Condition): string {
  const severity = CONDITION_DEFINITIONS[condition].severity
  return SEVERITY_BADGE_MAP[severity]
}

/**
 * Get the full condition definition.
 */
export function getConditionDefinition(condition: Condition): ConditionDefinition {
  return CONDITION_DEFINITIONS[condition]
}

/**
 * Get all conditions grouped by severity.
 */
export function getConditionsBySeverity(): Record<ConditionSeverity, ConditionDefinition[]> {
  const grouped: Record<ConditionSeverity, ConditionDefinition[]> = {
    debilitating: [],
    moderate: [],
    mild: [],
    beneficial: [],
  }

  for (const def of Object.values(CONDITION_DEFINITIONS)) {
    grouped[def.severity].push(def)
  }

  return grouped
}
