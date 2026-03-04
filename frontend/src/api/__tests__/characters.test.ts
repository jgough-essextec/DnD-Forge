import { describe, it, expect } from 'vitest'
import {
  getCharacters,
  getCharacter,
  createCharacter,
  updateCharacter,
  deleteCharacter,
} from '@/api/characters'
import type { CreateCharacterData } from '@/types/character'

describe('Characters API', () => {
  it('getCharacters returns a list of character summaries', async () => {
    const result = await getCharacters()
    expect(result).toBeInstanceOf(Array)
    expect(result.length).toBeGreaterThan(0)
    expect(result[0]).toHaveProperty('id')
    expect(result[0]).toHaveProperty('name')
    expect(result[0]).toHaveProperty('level')
    expect(result[0]).toHaveProperty('ac')
    expect(result[0]).toHaveProperty('hp')
  })

  it('getCharacter returns a full character by ID', async () => {
    const result = await getCharacter('char-001')
    expect(result).toHaveProperty('id', 'char-001')
    expect(result).toHaveProperty('name', 'Thorn Ironforge')
    expect(result).toHaveProperty('version')
    expect(result).toHaveProperty('race')
    expect(result).toHaveProperty('classes')
  })

  it('getCharacter returns 404 for unknown ID', async () => {
    await expect(getCharacter('nonexistent')).rejects.toThrow()
  })

  it('createCharacter sends data and returns the created character', async () => {
    const payload = {
      name: 'New Hero',
      playerName: 'Tester',
    } as CreateCharacterData

    const result = await createCharacter(payload)
    expect(result).toHaveProperty('id', 'char-new-001')
    expect(result).toHaveProperty('name', 'New Hero')
    expect(result).toHaveProperty('version', 1)
  })

  it('updateCharacter sends partial data and returns updated character', async () => {
    const result = await updateCharacter('char-001', { name: 'Thorn the Bold' })
    expect(result).toHaveProperty('name', 'Thorn the Bold')
    expect(result.version).toBeGreaterThan(3)
  })

  it('deleteCharacter deletes a character by ID', async () => {
    await expect(deleteCharacter('char-001')).resolves.toBeUndefined()
  })

  it('deleteCharacter returns 404 for unknown ID', async () => {
    await expect(deleteCharacter('nonexistent')).rejects.toThrow()
  })
})
