import { http, HttpResponse } from 'msw'

const BASE_URL = 'http://localhost:8000/api'

// Simulated session state for test mocking
let currentUser: Record<string, unknown> | null = null

export const handlers = [
  // Auth endpoints
  http.get(`${BASE_URL}/auth/me/`, () => {
    if (currentUser) {
      return HttpResponse.json(currentUser)
    }
    return HttpResponse.json(
      { detail: 'Authentication credentials were not provided.' },
      { status: 403 }
    )
  }),

  http.post(`${BASE_URL}/auth/login/`, async ({ request }) => {
    const body = (await request.json()) as Record<string, string>
    if (body.username === 'testuser' && body.password === 'SecurePass123!') {
      currentUser = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        username: 'testuser',
        email: 'test@example.com',
        display_name: 'Test User',
        avatar_url: '',
        date_joined: '2024-01-01T00:00:00Z',
      }
      return HttpResponse.json(currentUser)
    }
    return HttpResponse.json(
      { non_field_errors: ['Invalid username or password.'] },
      { status: 400 }
    )
  }),

  http.post(`${BASE_URL}/auth/logout/`, () => {
    currentUser = null
    return HttpResponse.json({ detail: 'Successfully logged out.' })
  }),

  http.post(`${BASE_URL}/auth/register/`, async ({ request }) => {
    const body = (await request.json()) as Record<string, string>
    if (body.username === 'existinguser') {
      return HttpResponse.json(
        { username: ['A user with that username already exists.'] },
        { status: 400 }
      )
    }
    currentUser = {
      id: '660e8400-e29b-41d4-a716-446655440001',
      username: body.username,
      email: body.email,
      display_name: '',
      avatar_url: '',
      date_joined: '2024-01-01T00:00:00Z',
    }
    return HttpResponse.json(currentUser, { status: 201 })
  }),

  http.patch(`${BASE_URL}/auth/me/`, async ({ request }) => {
    if (!currentUser) {
      return HttpResponse.json(
        { detail: 'Authentication credentials were not provided.' },
        { status: 403 }
      )
    }
    const body = (await request.json()) as Record<string, unknown>
    currentUser = { ...currentUser, ...body }
    return HttpResponse.json(currentUser)
  }),

  http.get(`${BASE_URL}/auth/csrf/`, () => {
    return HttpResponse.json({ csrfToken: 'test-csrf-token' })
  }),

  // Existing endpoints
  http.get(`${BASE_URL}/characters/`, () => {
    return HttpResponse.json([])
  }),
  http.get(`${BASE_URL}/races/`, () => {
    return HttpResponse.json([])
  }),
  http.get(`${BASE_URL}/classes/`, () => {
    return HttpResponse.json([])
  }),
]

/**
 * Helper to set the mock user state for tests.
 */
export function setMockUser(user: Record<string, unknown> | null) {
  currentUser = user
}

/**
 * Helper to reset the mock user state.
 */
export function resetMockUser() {
  currentUser = null
}
