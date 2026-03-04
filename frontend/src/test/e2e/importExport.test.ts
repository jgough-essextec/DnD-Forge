/**
 * E2E Integration Test: Import/Export Flow (Epic 45, Story 45.2)
 *
 * Tests the character import/export pipeline:
 * - Export character as JSON via API
 * - Verify export data structure and required fields
 * - Import character from JSON via API
 * - Verify imported character has correct data
 * - Error handling for invalid imports
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { setMockUser, resetMockUser } from '@/mocks/handlers'

const BASE_URL = 'http://localhost:8000/api'

// ---------------------------------------------------------------------------
// Setup: Authenticated user for import/export
// ---------------------------------------------------------------------------

beforeEach(() => {
  setMockUser({
    id: '550e8400-e29b-41d4-a716-446655440000',
    username: 'testuser',
    email: 'test@example.com',
    display_name: 'Test User',
  })
})

// ---------------------------------------------------------------------------
// Export Character
// ---------------------------------------------------------------------------

describe('Import/Export: Export Character JSON', () => {
  it('exports a character as JSON with correct structure', async () => {
    const response = await fetch(`${BASE_URL}/characters/char-001/export/`)
    expect(response.ok).toBe(true)

    const data = await response.json()
    expect(data).toHaveProperty('formatVersion')
    expect(data).toHaveProperty('appVersion')
    expect(data).toHaveProperty('exportedAt')
    expect(data).toHaveProperty('character')
  })

  it('exported character has required fields', async () => {
    const response = await fetch(`${BASE_URL}/characters/char-001/export/`)
    const data = await response.json()
    const char = data.character

    expect(char.name).toBe('Thorn Ironforge')
    expect(char.race).toBe('Dwarf')
    expect(char.class_name).toBe('Fighter')
    expect(char.level).toBe(5)
    expect(char.ability_scores).toBeDefined()
    expect(char.ability_scores.strength).toBe(16)
    expect(char.ability_scores.dexterity).toBe(12)
    expect(char.ability_scores.constitution).toBe(16)
  })

  it('export includes correct metadata', async () => {
    const response = await fetch(`${BASE_URL}/characters/char-001/export/`)
    const data = await response.json()

    expect(data.formatVersion).toBe('1.0')
    expect(data.appVersion).toBe('1.0.0')
    expect(typeof data.exportedAt).toBe('string')
    // Verify it is a valid ISO date
    expect(new Date(data.exportedAt).toISOString()).toBe(data.exportedAt)
  })

  it('export has Content-Disposition header for download', async () => {
    const response = await fetch(`${BASE_URL}/characters/char-001/export/`)
    const disposition = response.headers.get('Content-Disposition')
    expect(disposition).toContain('attachment')
    expect(disposition).toContain('filename=')
    expect(disposition).toContain('Thorn-Ironforge')
  })

  it('returns 404 for non-existent character export', async () => {
    const response = await fetch(`${BASE_URL}/characters/nonexistent/export/`)
    expect(response.status).toBe(404)
  })
})

// ---------------------------------------------------------------------------
// Import Character
// ---------------------------------------------------------------------------

describe('Import/Export: Import Character JSON', () => {
  it('imports a character from JSON body', async () => {
    const importData = {
      character: {
        name: 'Thorn Ironforge',
        race: 'Dwarf',
        class_name: 'Fighter',
        level: 5,
        ability_scores: {
          strength: 16,
          dexterity: 12,
          constitution: 16,
          intelligence: 10,
          wisdom: 14,
          charisma: 8,
        },
        skills: [],
        equipment: [],
        spells: [],
        background: 'Soldier',
        hp: 52,
        character_data: {},
        is_archived: false,
      },
    }

    const response = await fetch(`${BASE_URL}/characters/import/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(importData),
    })

    expect(response.status).toBe(201)
    const result = await response.json()
    expect(result.character).toBeDefined()
    expect(result.character.name).toBe('Thorn Ironforge')
    expect(result.character.id).toBe('char-imported-001')
    expect(result.warnings).toEqual([])
  })

  it('imported character preserves ability scores', async () => {
    const importData = {
      character: {
        name: 'Imported Hero',
        race: 'Elf',
        class_name: 'Wizard',
        level: 3,
        ability_scores: {
          strength: 8,
          dexterity: 14,
          constitution: 14,
          intelligence: 16,
          wisdom: 12,
          charisma: 10,
        },
        skills: ['arcana', 'investigation'],
        equipment: [{ id: 'staff', name: 'Staff' }],
        spells: ['magic-missile', 'shield'],
        background: 'Sage',
        hp: 20,
      },
    }

    const response = await fetch(`${BASE_URL}/characters/import/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(importData),
    })

    const result = await response.json()
    expect(result.character.ability_scores.intelligence).toBe(16)
    expect(result.character.level).toBe(3)
    expect(result.character.race).toBe('Elf')
  })

  it('rejects import with missing required fields', async () => {
    const invalidData = {
      character: {
        name: 'Incomplete',
        // missing race and class_name
      },
    }

    const response = await fetch(`${BASE_URL}/characters/import/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(invalidData),
    })

    expect(response.status).toBe(400)
  })

  it('requires authentication for import', async () => {
    resetMockUser()

    const response = await fetch(`${BASE_URL}/characters/import/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        character: {
          name: 'Test',
          race: 'Human',
          class_name: 'Fighter',
        },
      }),
    })

    expect(response.status).toBe(403)
  })
})

// ---------------------------------------------------------------------------
// Round-Trip: Export then Import
// ---------------------------------------------------------------------------

describe('Import/Export: Round-Trip Data Integrity', () => {
  it('exports and re-imports with data preservation', async () => {
    // Step 1: Export
    const exportResponse = await fetch(`${BASE_URL}/characters/char-001/export/`)
    const exportData = await exportResponse.json()

    // Step 2: Import the exported data
    const importResponse = await fetch(`${BASE_URL}/characters/import/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(exportData),
    })

    expect(importResponse.status).toBe(201)
    const importResult = await importResponse.json()

    // Step 3: Verify key fields match
    const original = exportData.character
    const imported = importResult.character

    expect(imported.name).toBe(original.name)
    expect(imported.race).toBe(original.race)
    expect(imported.class_name).toBe(original.class_name)
    expect(imported.level).toBe(original.level)
    expect(imported.hp).toBe(original.hp)
  })

  it('exported data format version is present for forward compatibility', async () => {
    const response = await fetch(`${BASE_URL}/characters/char-001/export/`)
    const data = await response.json()
    expect(data.formatVersion).toBeDefined()
    expect(typeof data.formatVersion).toBe('string')
  })
})
