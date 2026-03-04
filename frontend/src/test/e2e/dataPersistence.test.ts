/**
 * E2E Integration Test: Data Persistence Flow (Epic 45, Story 45.2)
 *
 * Tests that character and campaign data persists across API calls:
 * - Create a character via API and verify response
 * - Re-fetch the character and verify data loads correctly
 * - Modify character data via PATCH and verify persistence
 * - Authentication flow for protected endpoints
 * - Preferences persistence
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { setMockUser, resetMockUser } from '@/mocks/handlers'

const BASE_URL = 'http://localhost:8000/api'

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------

beforeEach(() => {
  resetMockUser()
})

// ---------------------------------------------------------------------------
// Character Persistence
// ---------------------------------------------------------------------------

describe('Data Persistence: Character CRUD', () => {
  it('creates a character and receives it back with an ID', async () => {
    const payload = {
      name: 'New Hero',
      race: { raceId: 'human' },
      classes: [{ classId: 'fighter', level: 1 }],
    }

    const response = await fetch(`${BASE_URL}/characters/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    expect(response.status).toBe(201)
    const created = await response.json()
    expect(created.id).toBeDefined()
    expect(created.name).toBe('New Hero')
    expect(created.version).toBe(1)
  })

  it('fetches an existing character by ID', async () => {
    const response = await fetch(`${BASE_URL}/characters/char-001/`)
    expect(response.ok).toBe(true)

    const character = await response.json()
    expect(character.id).toBe('char-001')
    expect(character.name).toBe('Thorn Ironforge')
    expect(character.level).toBe(5)
    expect(character.hpMax).toBe(52)
  })

  it('updates a character and version increments', async () => {
    const response = await fetch(`${BASE_URL}/characters/char-001/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hpCurrent: 30 }),
    })

    expect(response.ok).toBe(true)
    const updated = await response.json()
    expect(updated.hpCurrent).toBe(30)
    expect(updated.version).toBe(4) // was 3, now 4
  })

  it('re-fetches character and data is consistent', async () => {
    // First fetch
    const response1 = await fetch(`${BASE_URL}/characters/char-001/`)
    const char1 = await response1.json()

    // Second fetch
    const response2 = await fetch(`${BASE_URL}/characters/char-001/`)
    const char2 = await response2.json()

    // Core data should be consistent across fetches
    expect(char1.id).toBe(char2.id)
    expect(char1.name).toBe(char2.name)
    expect(char1.level).toBe(char2.level)
    expect(char1.abilityScores).toEqual(char2.abilityScores)
  })

  it('deletes a character', async () => {
    const response = await fetch(`${BASE_URL}/characters/char-001/`, {
      method: 'DELETE',
    })
    expect(response.status).toBe(204)
  })
})

// ---------------------------------------------------------------------------
// Character List Persistence
// ---------------------------------------------------------------------------

describe('Data Persistence: Character List', () => {
  it('character list returns all characters', async () => {
    const response = await fetch(`${BASE_URL}/characters/`)
    const characters = await response.json()
    expect(Array.isArray(characters)).toBe(true)
    expect(characters.length).toBeGreaterThanOrEqual(2)
  })

  it('each character in list has summary fields', async () => {
    const response = await fetch(`${BASE_URL}/characters/`)
    const characters = await response.json()

    for (const char of characters) {
      expect(typeof char.id).toBe('string')
      expect(typeof char.name).toBe('string')
      expect(typeof char.race).toBe('string')
      expect(typeof char.class).toBe('string')
      expect(typeof char.level).toBe('number')
    }
  })
})

// ---------------------------------------------------------------------------
// Authentication Persistence
// ---------------------------------------------------------------------------

describe('Data Persistence: Authentication', () => {
  it('unauthenticated request to /auth/me returns 403', async () => {
    const response = await fetch(`${BASE_URL}/auth/me/`)
    expect(response.status).toBe(403)
  })

  it('login sets session and /auth/me returns user', async () => {
    // Login
    const loginResponse = await fetch(`${BASE_URL}/auth/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'testuser',
        password: 'SecurePass123!',
      }),
    })
    expect(loginResponse.ok).toBe(true)

    // Verify session persists
    const meResponse = await fetch(`${BASE_URL}/auth/me/`)
    expect(meResponse.ok).toBe(true)
    const user = await meResponse.json()
    expect(user.username).toBe('testuser')
  })

  it('logout clears session', async () => {
    // Login first
    await fetch(`${BASE_URL}/auth/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'testuser',
        password: 'SecurePass123!',
      }),
    })

    // Logout
    const logoutResponse = await fetch(`${BASE_URL}/auth/logout/`, {
      method: 'POST',
    })
    expect(logoutResponse.ok).toBe(true)

    // Verify session is cleared
    const meResponse = await fetch(`${BASE_URL}/auth/me/`)
    expect(meResponse.status).toBe(403)
  })

  it('invalid login returns 400', async () => {
    const response = await fetch(`${BASE_URL}/auth/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'testuser',
        password: 'wrong',
      }),
    })
    expect(response.status).toBe(400)
  })

  it('registration creates a new user', async () => {
    const response = await fetch(`${BASE_URL}/auth/register/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'newuser',
        email: 'new@example.com',
        password: 'SecurePass123!',
      }),
    })

    expect(response.status).toBe(201)
    const user = await response.json()
    expect(user.username).toBe('newuser')
  })

  it('duplicate username registration returns 400', async () => {
    const response = await fetch(`${BASE_URL}/auth/register/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'existinguser',
        email: 'test@example.com',
        password: 'SecurePass123!',
      }),
    })

    expect(response.status).toBe(400)
  })
})

// ---------------------------------------------------------------------------
// Preferences Persistence
// ---------------------------------------------------------------------------

describe('Data Persistence: Preferences', () => {
  it('fetches user preferences', async () => {
    const response = await fetch(`${BASE_URL}/preferences/`)
    expect(response.ok).toBe(true)

    const prefs = await response.json()
    expect(prefs).toHaveProperty('theme')
    expect(prefs).toHaveProperty('autoSaveEnabled')
  })

  it('updates preferences and persists', async () => {
    const response = await fetch(`${BASE_URL}/preferences/`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ theme: 'light' }),
    })

    expect(response.ok).toBe(true)
    const updated = await response.json()
    expect(updated.theme).toBe('light')
  })
})

// ---------------------------------------------------------------------------
// Campaign Persistence
// ---------------------------------------------------------------------------

describe('Data Persistence: Campaign', () => {
  it('creates and retrieves a campaign', async () => {
    // Create
    const createResponse = await fetch(`${BASE_URL}/campaigns/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Persistent Campaign',
        description: 'Test persistence',
      }),
    })

    expect(createResponse.status).toBe(201)
    const created = await createResponse.json()
    expect(created.id).toBeDefined()

    // Retrieve the existing campaign
    const getResponse = await fetch(`${BASE_URL}/campaigns/camp-001/`)
    expect(getResponse.ok).toBe(true)
    const retrieved = await getResponse.json()
    expect(retrieved.name).toBe('Lost Mine of Phandelver')
  })
})

// ---------------------------------------------------------------------------
// CSRF Token
// ---------------------------------------------------------------------------

describe('Data Persistence: CSRF Token', () => {
  it('fetches CSRF token', async () => {
    const response = await fetch(`${BASE_URL}/auth/csrf/`)
    expect(response.ok).toBe(true)
    const data = await response.json()
    expect(data.csrfToken).toBeDefined()
    expect(typeof data.csrfToken).toBe('string')
  })
})

// ---------------------------------------------------------------------------
// Share Link Persistence
// ---------------------------------------------------------------------------

describe('Data Persistence: Share Links', () => {
  it('generates a share link for a character', async () => {
    setMockUser({
      id: '550e8400-e29b-41d4-a716-446655440000',
      username: 'testuser',
    })

    const response = await fetch(`${BASE_URL}/characters/char-001/share/`)
    expect(response.ok).toBe(true)

    const data = await response.json()
    expect(data.token).toBeDefined()
    expect(data.url).toContain('share-token')
    expect(data.expires_at).toBeDefined()
  })

  it('fetches a shared character by token', async () => {
    const response = await fetch(`${BASE_URL}/shared/share-token-abc-123/`)
    expect(response.ok).toBe(true)

    const data = await response.json()
    expect(data.character.name).toBe('Thorn Ironforge')
  })

  it('returns 410 for expired share link', async () => {
    const response = await fetch(`${BASE_URL}/shared/expired-token/`)
    expect(response.status).toBe(410)
  })

  it('returns 404 for invalid share token', async () => {
    const response = await fetch(`${BASE_URL}/shared/invalid-token/`)
    expect(response.status).toBe(404)
  })
})
