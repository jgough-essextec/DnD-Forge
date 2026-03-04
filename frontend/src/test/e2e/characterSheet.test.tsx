/**
 * E2E Integration Test: Character Sheet Flow (Epic 45, Story 45.2)
 *
 * Tests loading a character from the mock API, verifying the data
 * structure, testing edit mode calculations (ability score cascade),
 * and verifying auto-save via PATCH endpoint.
 */

import { describe, it, expect } from 'vitest'
import {
  getModifier,
  getMaxHitPoints,
  getProficiencyBonus,
  getSkillModifier,
  getInitiativeModifier,
} from '@/utils/calculations'

const BASE_URL = 'http://localhost:8000/api'

// ---------------------------------------------------------------------------
// Load Character and Verify Data
// ---------------------------------------------------------------------------

describe('Character Sheet: Load and Verify', () => {
  it('loads character detail from API with full data structure', async () => {
    const response = await fetch(`${BASE_URL}/characters/char-001/`)
    expect(response.ok).toBe(true)

    const character = await response.json()
    expect(character.id).toBe('char-001')
    expect(character.name).toBe('Thorn Ironforge')
    expect(character.level).toBe(5)
  })

  it('character has all three page sections of data', async () => {
    const response = await fetch(`${BASE_URL}/characters/char-001/`)
    const character = await response.json()

    // Page 1: Core stats
    expect(character.abilityScores).toBeDefined()
    expect(character.combatStats).toBeDefined()
    expect(character.proficiencies).toBeDefined()

    // Page 2: Description/backstory
    expect(character.description).toBeDefined()
    expect(character.description.name).toBe('Thorn Ironforge')
    expect(character.personality).toBeDefined()

    // Page 3: Equipment/spells
    expect(character.inventory).toBeDefined()
    expect(character.currency).toBeDefined()
    expect(character.features).toBeDefined()
  })

  it('character has correct ability scores and modifiers', async () => {
    const response = await fetch(`${BASE_URL}/characters/char-001/`)
    const character = await response.json()

    expect(character.abilityScores.strength).toBe(16)
    expect(getModifier(character.abilityScores.strength)).toBe(3)
    expect(character.abilityScores.dexterity).toBe(12)
    expect(getModifier(character.abilityScores.dexterity)).toBe(1)
    expect(character.abilityScores.constitution).toBe(16)
    expect(getModifier(character.abilityScores.constitution)).toBe(3)
  })

  it('character combat stats match expected values', async () => {
    const response = await fetch(`${BASE_URL}/characters/char-001/`)
    const character = await response.json()

    expect(character.combatStats.armorClass.base).toBe(18)
    expect(character.combatStats.initiative).toBe(1)
    expect(character.hpMax).toBe(52)
    expect(character.hpCurrent).toBe(44)
  })

  it('returns 404 for non-existent character', async () => {
    const response = await fetch(`${BASE_URL}/characters/nonexistent/`)
    expect(response.status).toBe(404)
  })
})

// ---------------------------------------------------------------------------
// Edit Mode: Ability Score Cascade
// ---------------------------------------------------------------------------

describe('Character Sheet: Edit Mode Cascade Recalculation', () => {
  it('changing STR from 16 to 18 increases STR modifier from +3 to +4', () => {
    const oldStr = 16
    const newStr = 18
    expect(getModifier(oldStr)).toBe(3)
    expect(getModifier(newStr)).toBe(4)
  })

  it('changing CON affects max HP', () => {
    const level = 5
    const hitDie = 10 // Fighter

    const hpOldCon = getMaxHitPoints({ hitDie, level, conModifier: 3 }) // CON 16
    const hpNewCon = getMaxHitPoints({ hitDie, level, conModifier: 4 }) // CON 18

    // HP increases by 1 per level when CON mod goes up by 1
    expect(hpNewCon - hpOldCon).toBe(5) // +1 per level for +1 CON mod change
  })

  it('changing DEX affects initiative', () => {
    const oldDex = 12
    const newDex = 14
    expect(getInitiativeModifier(getModifier(oldDex))).toBe(1)
    expect(getInitiativeModifier(getModifier(newDex))).toBe(2)
  })

  it('proficiency bonus scales with level', () => {
    expect(getProficiencyBonus(1)).toBe(2)
    expect(getProficiencyBonus(5)).toBe(3)
    expect(getProficiencyBonus(9)).toBe(4)
    expect(getProficiencyBonus(13)).toBe(5)
    expect(getProficiencyBonus(17)).toBe(6)
  })

  it('skill modifier combines ability mod and proficiency', () => {
    // Proficient Athletics (STR-based) at level 5
    const strScore = 16 // modifier +3
    const prof = getProficiencyBonus(5) // +3
    const skillMod = getSkillModifier(
      strScore,
      { skill: 'athletics', proficient: true, expertise: false },
      5,
    )
    expect(skillMod).toBe(getModifier(strScore) + prof)
  })
})

// ---------------------------------------------------------------------------
// Auto-Save via PATCH
// ---------------------------------------------------------------------------

describe('Character Sheet: Auto-Save', () => {
  it('PATCHes character updates and receives updated version', async () => {
    const response = await fetch(`${BASE_URL}/characters/char-001/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hpCurrent: 50 }),
    })

    expect(response.ok).toBe(true)
    const updated = await response.json()
    expect(updated.hpCurrent).toBe(50)
    expect(updated.version).toBe(4) // incremented from 3
  })

  it('PATCH returns 404 for non-existent character', async () => {
    const response = await fetch(`${BASE_URL}/characters/nonexistent/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hpCurrent: 10 }),
    })

    expect(response.status).toBe(404)
  })

  it('PATCH preserves unmodified fields', async () => {
    const response = await fetch(`${BASE_URL}/characters/char-001/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ inspiration: true }),
    })

    const updated = await response.json()
    expect(updated.name).toBe('Thorn Ironforge') // unchanged
    expect(updated.level).toBe(5) // unchanged
    expect(updated.inspiration).toBe(true) // changed
  })
})
