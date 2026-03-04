/**
 * Combat Tracker Utility Functions (Epic 35)
 *
 * Pure functions for initiative sorting, turn management, XP calculation,
 * combatant creation, and encounter state management.
 */

import type { Combatant } from '@/types/campaign'

// ---------------------------------------------------------------------------
// Extended Combat Types
// ---------------------------------------------------------------------------

/**
 * Extended combatant with additional fields for the combat tracker.
 * Extends the base Combatant from campaign types with combat-specific fields.
 */
export interface CombatCombatant extends Combatant {
  /** Combatant type: player, npc, monster, or lair (for lair actions) */
  type: 'player' | 'npc' | 'monster' | 'lair'
  /** The initiative modifier (DEX mod + bonuses) */
  initiativeModifier: number
  /** Temporary hit points */
  tempHp: number
  /** Challenge rating (for monsters, used in XP calculation) */
  cr?: number
  /** Whether the combatant has been defeated */
  isDefeated: boolean
  /** Whether the combatant is concentrating on a spell */
  isConcentrating: boolean
  /** Whether the combatant's turn has been skipped */
  isSkipped: boolean
  /** Whether the combatant has readied an action */
  isReadied: boolean
  /** Optional notes for this combatant */
  notes: string
  /** Group ID for grouped identical monsters */
  groupId?: string
  /** Original add order for tie-breaking */
  addOrder: number
  /** Death save tracking for PCs at 0 HP */
  deathSaves: { successes: number; failures: number }
  /** XP value logged when removed mid-combat */
  loggedXp?: number
}

/**
 * Full encounter state managed by the combat tracker.
 */
export interface EncounterState {
  id: string
  campaignId: string
  name: string
  combatants: CombatCombatant[]
  currentTurnIndex: number
  round: number
  phase: 'setup' | 'initiative' | 'combat' | 'ended'
  defeatedMonsterXp: number
}

// ---------------------------------------------------------------------------
// CR to XP Mapping (SRD)
// ---------------------------------------------------------------------------

/** Standard D&D 5e Challenge Rating to XP mapping */
export const CR_TO_XP: Record<string, number> = {
  '0': 10,
  '1/8': 25,
  '0.125': 25,
  '1/4': 50,
  '0.25': 50,
  '1/2': 100,
  '0.5': 100,
  '1': 200,
  '2': 450,
  '3': 700,
  '4': 1100,
  '5': 1800,
  '6': 2300,
  '7': 2900,
  '8': 3900,
  '9': 5000,
  '10': 5900,
  '11': 7200,
  '12': 8400,
  '13': 10000,
  '14': 11500,
  '15': 13000,
  '16': 15000,
  '17': 18000,
  '18': 20000,
  '19': 22000,
  '20': 25000,
  '21': 33000,
  '22': 41000,
  '23': 50000,
  '24': 62000,
  '25': 75000,
  '26': 90000,
  '27': 105000,
  '28': 120000,
  '29': 135000,
  '30': 155000,
}

// ---------------------------------------------------------------------------
// Combatant Creation
// ---------------------------------------------------------------------------

let combatantIdCounter = 0

/**
 * Generate a unique combatant ID.
 */
export function generateCombatantId(): string {
  return `combatant-${++combatantIdCounter}-${Date.now()}`
}

/**
 * Reset the combatant ID counter (useful for testing).
 */
export function resetCombatantIdCounter(): void {
  combatantIdCounter = 0
}

/**
 * Create a player combatant from character data.
 */
export function createPlayerCombatant(
  characterId: string,
  name: string,
  ac: number,
  hp: number,
  maxHp: number,
  initiativeModifier: number,
  conditions: string[],
  addOrder: number,
): CombatCombatant {
  return {
    id: generateCombatantId(),
    name,
    initiative: 0,
    hp,
    maxHp,
    ac,
    isPlayerCharacter: true,
    characterId,
    conditions,
    type: 'player',
    initiativeModifier,
    tempHp: 0,
    isDefeated: false,
    isConcentrating: false,
    isSkipped: false,
    isReadied: false,
    notes: '',
    addOrder,
    deathSaves: { successes: 0, failures: 0 },
  }
}

/**
 * Create a monster/NPC combatant from manual input.
 */
export function createMonsterCombatant(
  name: string,
  ac: number,
  maxHp: number,
  initiativeModifier: number,
  addOrder: number,
  cr?: number,
  type: 'monster' | 'npc' = 'monster',
  groupId?: string,
): CombatCombatant {
  return {
    id: generateCombatantId(),
    name,
    initiative: 0,
    hp: maxHp,
    maxHp,
    ac,
    isPlayerCharacter: false,
    conditions: [],
    type,
    initiativeModifier,
    tempHp: 0,
    cr,
    isDefeated: false,
    isConcentrating: false,
    isSkipped: false,
    isReadied: false,
    notes: '',
    groupId,
    addOrder,
    deathSaves: { successes: 0, failures: 0 },
  }
}

/**
 * Create a lair action combatant.
 */
export function createLairAction(
  name: string,
  initiativeCount: number,
  addOrder: number,
): CombatCombatant {
  return {
    id: generateCombatantId(),
    name,
    initiative: initiativeCount,
    hp: 999,
    maxHp: 999,
    ac: 0,
    isPlayerCharacter: false,
    conditions: [],
    type: 'lair',
    initiativeModifier: 0,
    tempHp: 0,
    isDefeated: false,
    isConcentrating: false,
    isSkipped: false,
    isReadied: false,
    notes: 'Lair Action',
    addOrder,
    deathSaves: { successes: 0, failures: 0 },
  }
}

/**
 * Duplicate a combatant with an incremented name suffix.
 * "Goblin" -> "Goblin 2", "Goblin 2" -> "Goblin 3", etc.
 */
export function duplicateCombatant(
  combatant: CombatCombatant,
  existingNames: string[],
  addOrder: number,
): CombatCombatant {
  const newName = getNextIncrementedName(combatant.name, existingNames)
  return {
    ...combatant,
    id: generateCombatantId(),
    name: newName,
    hp: combatant.maxHp,
    initiative: 0,
    conditions: [],
    isDefeated: false,
    isSkipped: false,
    isReadied: false,
    addOrder,
    deathSaves: { successes: 0, failures: 0 },
  }
}

/**
 * Get the next incremented name for a duplicated combatant.
 * "Goblin" with existing ["Goblin"] -> "Goblin 2"
 * "Goblin" with existing ["Goblin", "Goblin 2"] -> "Goblin 3"
 */
export function getNextIncrementedName(baseName: string, existingNames: string[]): string {
  // Strip any existing number suffix to get the base
  const baseMatch = baseName.match(/^(.+?)\s*(\d+)?$/)
  const root = baseMatch ? baseMatch[1].trim() : baseName

  // Find the highest existing number for this root
  let maxNum = 0
  for (const name of existingNames) {
    const match = name.match(new RegExp(`^${escapeRegExp(root)}\\s*(\\d+)?$`))
    if (match) {
      const num = match[1] ? parseInt(match[1], 10) : 1
      maxNum = Math.max(maxNum, num)
    }
  }

  return `${root} ${maxNum + 1}`
}

/** Escape special regex characters in a string */
function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Create multiple copies of a monster combatant.
 */
export function createMultipleCombatants(
  name: string,
  ac: number,
  maxHp: number,
  initiativeModifier: number,
  count: number,
  startAddOrder: number,
  cr?: number,
  groupId?: string,
): CombatCombatant[] {
  const combatants: CombatCombatant[] = []
  for (let i = 0; i < count; i++) {
    combatants.push(
      createMonsterCombatant(
        `${name} ${i + 1}`,
        ac,
        maxHp,
        initiativeModifier,
        startAddOrder + i,
        cr,
        'monster',
        groupId,
      ),
    )
  }
  return combatants
}

// ---------------------------------------------------------------------------
// Initiative Sorting
// ---------------------------------------------------------------------------

/**
 * Sort combatants by initiative (highest first).
 * Tie-breaking: higher initiative modifier first, then original add order.
 */
export function sortByInitiative(combatants: CombatCombatant[]): CombatCombatant[] {
  return [...combatants].sort((a, b) => {
    // Primary: initiative total (descending)
    if (b.initiative !== a.initiative) {
      return b.initiative - a.initiative
    }
    // Secondary: initiative modifier (descending)
    if (b.initiativeModifier !== a.initiativeModifier) {
      return b.initiativeModifier - a.initiativeModifier
    }
    // Tertiary: add order (ascending - earlier added goes first)
    return a.addOrder - b.addOrder
  })
}

/**
 * Check if two combatants are tied on initiative.
 */
export function areTied(a: CombatCombatant, b: CombatCombatant): boolean {
  return a.initiative === b.initiative && a.initiative > 0
}

/**
 * Find all groups of tied combatants.
 */
export function findTiedGroups(combatants: CombatCombatant[]): CombatCombatant[][] {
  const sorted = sortByInitiative(combatants)
  const groups: CombatCombatant[][] = []
  let currentGroup: CombatCombatant[] = []

  for (const combatant of sorted) {
    if (combatant.initiative === 0) continue // not yet rolled
    if (currentGroup.length === 0) {
      currentGroup.push(combatant)
    } else if (currentGroup[0].initiative === combatant.initiative) {
      currentGroup.push(combatant)
    } else {
      if (currentGroup.length > 1) {
        groups.push(currentGroup)
      }
      currentGroup = [combatant]
    }
  }
  if (currentGroup.length > 1) {
    groups.push(currentGroup)
  }

  return groups
}

// ---------------------------------------------------------------------------
// Turn Management
// ---------------------------------------------------------------------------

/**
 * Advance to the next turn. Returns the new turn index and round number.
 * Skips defeated and skipped combatants.
 */
export function nextTurn(
  combatants: CombatCombatant[],
  currentTurnIndex: number,
  currentRound: number,
): { turnIndex: number; round: number } {
  const activeCombatants = combatants.filter((c) => !c.isDefeated)
  if (activeCombatants.length === 0) {
    return { turnIndex: currentTurnIndex, round: currentRound }
  }

  let nextIndex = currentTurnIndex + 1
  let round = currentRound

  if (nextIndex >= combatants.length) {
    nextIndex = 0
    round += 1
  }

  // Skip defeated combatants
  let attempts = 0
  while (combatants[nextIndex]?.isDefeated && attempts < combatants.length) {
    nextIndex += 1
    if (nextIndex >= combatants.length) {
      nextIndex = 0
      round = round === currentRound ? round + 1 : round
    }
    attempts++
  }

  return { turnIndex: nextIndex, round }
}

/**
 * Go back to the previous turn. Returns the new turn index and round number.
 */
export function previousTurn(
  combatants: CombatCombatant[],
  currentTurnIndex: number,
  currentRound: number,
): { turnIndex: number; round: number } {
  if (currentTurnIndex === 0 && currentRound <= 1) {
    return { turnIndex: 0, round: 1 }
  }

  let prevIndex = currentTurnIndex - 1
  let round = currentRound

  if (prevIndex < 0) {
    prevIndex = combatants.length - 1
    round = Math.max(1, round - 1)
  }

  // Skip defeated combatants going backwards
  let attempts = 0
  while (combatants[prevIndex]?.isDefeated && attempts < combatants.length) {
    prevIndex -= 1
    if (prevIndex < 0) {
      prevIndex = combatants.length - 1
      round = Math.max(1, round - 1)
    }
    attempts++
  }

  return { turnIndex: prevIndex, round }
}

/**
 * Remove a combatant from the list, adjusting the current turn index.
 */
export function removeCombatant(
  combatants: CombatCombatant[],
  combatantId: string,
  currentTurnIndex: number,
): { combatants: CombatCombatant[]; turnIndex: number } {
  const removeIndex = combatants.findIndex((c) => c.id === combatantId)
  if (removeIndex === -1) {
    return { combatants, turnIndex: currentTurnIndex }
  }

  const newCombatants = combatants.filter((c) => c.id !== combatantId)
  let newTurnIndex = currentTurnIndex

  if (removeIndex < currentTurnIndex) {
    newTurnIndex = Math.max(0, currentTurnIndex - 1)
  } else if (removeIndex === currentTurnIndex) {
    // Current combatant removed, keep same index but cap at list length
    newTurnIndex = Math.min(currentTurnIndex, newCombatants.length - 1)
  }

  // Ensure index is valid
  newTurnIndex = Math.max(0, Math.min(newTurnIndex, newCombatants.length - 1))

  return { combatants: newCombatants, turnIndex: newTurnIndex }
}

/**
 * Insert a new combatant into the initiative order at the correct position.
 * Returns whether the combatant acts this round.
 */
export function insertCombatant(
  combatants: CombatCombatant[],
  newCombatant: CombatCombatant,
  currentTurnIndex: number,
): { combatants: CombatCombatant[]; actsThisRound: boolean } {
  // Find the correct insertion point based on initiative
  let insertIndex = combatants.length
  for (let i = 0; i < combatants.length; i++) {
    if (newCombatant.initiative > combatants[i].initiative) {
      insertIndex = i
      break
    }
    if (
      newCombatant.initiative === combatants[i].initiative &&
      newCombatant.initiativeModifier > combatants[i].initiativeModifier
    ) {
      insertIndex = i
      break
    }
  }

  const newCombatants = [
    ...combatants.slice(0, insertIndex),
    newCombatant,
    ...combatants.slice(insertIndex),
  ]

  // The combatant acts this round if their position is after the current turn
  const actsThisRound = insertIndex > currentTurnIndex

  return { combatants: newCombatants, actsThisRound }
}

// ---------------------------------------------------------------------------
// HP & Damage in Combat Context
// ---------------------------------------------------------------------------

/**
 * Apply damage to a combatant (temp HP absorbs first).
 * Returns updated combatant.
 */
export function applyCombatDamage(
  combatant: CombatCombatant,
  amount: number,
): CombatCombatant {
  if (amount <= 0) return combatant

  let remaining = amount
  let newTempHp = combatant.tempHp
  let newHp = combatant.hp

  // Temp HP absorbs first
  if (newTempHp > 0) {
    if (remaining >= newTempHp) {
      remaining -= newTempHp
      newTempHp = 0
    } else {
      newTempHp -= remaining
      remaining = 0
    }
  }

  // Remaining applies to regular HP
  newHp = Math.max(0, newHp - remaining)

  const isDefeated = newHp === 0 && combatant.type !== 'player'
  const conditions = [...combatant.conditions]

  // Auto-apply unconscious to defeated monsters
  if (isDefeated && !conditions.includes('unconscious')) {
    conditions.push('unconscious')
  }

  return {
    ...combatant,
    hp: newHp,
    tempHp: newTempHp,
    isDefeated,
    conditions,
  }
}

/**
 * Apply healing to a combatant.
 */
export function applyCombatHealing(
  combatant: CombatCombatant,
  amount: number,
): CombatCombatant {
  if (amount <= 0) return combatant

  const newHp = Math.min(combatant.maxHp, combatant.hp + amount)
  const wasDefeated = combatant.isDefeated

  // Remove unconscious condition if healed from 0
  let conditions = [...combatant.conditions]
  if (combatant.hp === 0 && newHp > 0) {
    conditions = conditions.filter((c) => c !== 'unconscious')
  }

  return {
    ...combatant,
    hp: newHp,
    isDefeated: wasDefeated && newHp === 0,
    conditions,
    // Reset death saves if healed from 0
    deathSaves:
      combatant.hp === 0 && newHp > 0
        ? { successes: 0, failures: 0 }
        : combatant.deathSaves,
  }
}

/**
 * Calculate the concentration check DC for a given damage amount.
 * DC = max(10, floor(damage / 2))
 */
export function getConcentrationDC(damage: number): number {
  return Math.max(10, Math.floor(damage / 2))
}

// ---------------------------------------------------------------------------
// XP Calculations
// ---------------------------------------------------------------------------

/**
 * Get the XP value for a given CR.
 */
export function getXPForCR(cr: number | string): number {
  const key = String(cr)
  return CR_TO_XP[key] ?? 0
}

/**
 * Calculate total XP from defeated monsters.
 */
export function calculateTotalXP(
  defeatedMonsters: Array<{ cr?: number; loggedXp?: number }>,
): number {
  return defeatedMonsters.reduce((total, monster) => {
    if (monster.loggedXp !== undefined) {
      return total + monster.loggedXp
    }
    if (monster.cr !== undefined) {
      return total + getXPForCR(monster.cr)
    }
    return total
  }, 0)
}

/**
 * Calculate XP per character (evenly distributed).
 */
export function calculateXPPerCharacter(
  totalXP: number,
  characterCount: number,
): number {
  if (characterCount <= 0) return 0
  return Math.floor(totalXP / characterCount)
}

/**
 * Check if a character would level up with the given XP addition.
 */
export function wouldLevelUp(
  currentXP: number,
  xpToAdd: number,
  currentLevel: number,
): boolean {
  // XP thresholds from the SRD
  const XP_THRESHOLDS = [
    0, 300, 900, 2700, 6500, 14000, 23000, 34000, 48000, 64000,
    85000, 100000, 120000, 140000, 165000, 195000, 225000, 265000, 305000, 355000,
  ]
  if (currentLevel >= 20) return false
  const newXP = currentXP + xpToAdd
  return newXP >= XP_THRESHOLDS[currentLevel]
}

/**
 * Get the level for a given XP total.
 */
export function getLevelForXP(xp: number): number {
  const XP_THRESHOLDS = [
    0, 300, 900, 2700, 6500, 14000, 23000, 34000, 48000, 64000,
    85000, 100000, 120000, 140000, 165000, 195000, 225000, 265000, 305000, 355000,
  ]
  for (let i = XP_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= XP_THRESHOLDS[i]) {
      return i + 1
    }
  }
  return 1
}

// ---------------------------------------------------------------------------
// HP Color Helpers
// ---------------------------------------------------------------------------

/**
 * Get the HP color class based on current/max HP percentage.
 */
export function getHPColor(current: number, max: number): string {
  if (max === 0) return 'bg-gray-500'
  const pct = current / max
  if (pct > 0.5) return 'bg-green-500'
  if (pct > 0.25) return 'bg-yellow-500'
  return 'bg-red-500'
}

/**
 * Get the HP bar width as a percentage.
 */
export function getHPPercentage(current: number, max: number): number {
  if (max === 0) return 0
  return Math.max(0, Math.min(100, (current / max) * 100))
}

// ---------------------------------------------------------------------------
// Encounter State Factory
// ---------------------------------------------------------------------------

/**
 * Create a new encounter state.
 */
export function createEncounterState(
  id: string,
  campaignId: string,
  name: string,
): EncounterState {
  return {
    id,
    campaignId,
    name,
    combatants: [],
    currentTurnIndex: 0,
    round: 1,
    phase: 'setup',
    defeatedMonsterXp: 0,
  }
}
