import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import { render } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { isValidJoinCode } from '@/pages/JoinCampaignPage'
import { http, HttpResponse } from 'msw'
import { server } from '@/mocks/server'

import JoinCampaignPage from '@/pages/JoinCampaignPage'

const BASE_URL = 'http://localhost:8000/api'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

/**
 * Render JoinCampaignPage with proper route params.
 */
function renderJoinPage(route = '/join') {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[route]}>
        <Routes>
          <Route path="/join/:code" element={<JoinCampaignPage />} />
          <Route path="/join" element={<JoinCampaignPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  )
}

describe('isValidJoinCode', () => {
  it('should validate join code format (6 uppercase alphanumeric characters)', () => {
    expect(isValidJoinCode('ABC123')).toBe(true)
    expect(isValidJoinCode('ZYXWVU')).toBe(true)
    expect(isValidJoinCode('999999')).toBe(true)
  })

  it('should reject invalid join codes', () => {
    expect(isValidJoinCode('')).toBe(false)
    expect(isValidJoinCode('abc123')).toBe(false) // lowercase
    expect(isValidJoinCode('ABC12')).toBe(false) // too short
    expect(isValidJoinCode('ABC1234')).toBe(false) // too long
    expect(isValidJoinCode('ABC 12')).toBe(false) // spaces
    expect(isValidJoinCode('ABC-12')).toBe(false) // special chars
  })
})

describe('JoinCampaignPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render join campaign page with code input field', () => {
    renderJoinPage('/join')

    expect(screen.getByText('Join Campaign')).toBeInTheDocument()
    expect(screen.getByLabelText('6-character join code')).toBeInTheDocument()
  })

  it('should auto-fill join code from URL parameter', () => {
    renderJoinPage('/join/ABC123')

    const input = screen.getByLabelText('6-character join code') as HTMLInputElement
    expect(input.value).toBe('ABC123')
  })

  it('should display campaign name and description when code matches a campaign via API', async () => {
    // The default MSW handler returns camp-001 for join code ABC123
    server.use(
      http.get(`${BASE_URL}/campaigns/join/:code/`, ({ params }) => {
        const { code } = params
        if (code === 'ABC123') {
          return HttpResponse.json({
            id: 'camp-001',
            name: 'Lost Mine of Phandelver',
            description: 'A classic introductory adventure.',
            characterIds: ['char-001'],
            joinCode: 'ABC123',
            settings: {
              xpTracking: 'milestone',
              houseRules: {
                allowedSources: ['PHB'],
                abilityScoreMethod: 'any',
                startingLevel: 1,
                allowMulticlass: true,
                allowFeats: true,
                encumbranceVariant: false,
              },
            },
          })
        }
        return HttpResponse.json({ detail: 'Not found.' }, { status: 404 })
      })
    )

    renderJoinPage('/join')

    // Enter code and trigger lookup
    const input = screen.getByLabelText('6-character join code')
    fireEvent.change(input, { target: { value: 'ABC123' } })
    fireEvent.click(screen.getByLabelText('Look up campaign'))

    // Wait for campaign match to appear
    await waitFor(() => {
      expect(screen.getByTestId('campaign-match')).toBeInTheDocument()
    })

    expect(screen.getByText('Lost Mine of Phandelver')).toBeInTheDocument()
    expect(
      screen.getByText('A classic introductory adventure.')
    ).toBeInTheDocument()
  })

  it('should show "Campaign not found" error message when code does not match', async () => {
    server.use(
      http.get(`${BASE_URL}/campaigns/join/:code/`, () => {
        return HttpResponse.json(
          { detail: 'Campaign not found.' },
          { status: 404 }
        )
      })
    )

    renderJoinPage('/join')

    const input = screen.getByLabelText('6-character join code')
    fireEvent.change(input, { target: { value: 'ZZZZZ9' } })
    fireEvent.click(screen.getByLabelText('Look up campaign'))

    await waitFor(() => {
      expect(screen.getByTestId('lookup-error')).toBeInTheDocument()
    })

    expect(
      screen.getByText(
        'Campaign not found. Please check the code and try again.'
      )
    ).toBeInTheDocument()
  })

  it('should display character selection after clicking Continue to Join', async () => {
    server.use(
      http.get(`${BASE_URL}/campaigns/join/:code/`, () => {
        return HttpResponse.json({
          id: 'camp-001',
          name: 'Test Campaign',
          description: 'A test.',
          characterIds: [],
          joinCode: 'XYZ789',
          settings: {
            xpTracking: 'milestone',
            houseRules: {
              allowedSources: ['PHB'],
              abilityScoreMethod: 'any',
              startingLevel: 1,
              allowMulticlass: true,
              allowFeats: true,
              encumbranceVariant: false,
            },
          },
        })
      })
    )

    renderJoinPage('/join')

    const input = screen.getByLabelText('6-character join code')
    fireEvent.change(input, { target: { value: 'XYZ789' } })
    fireEvent.click(screen.getByLabelText('Look up campaign'))

    await waitFor(() => {
      expect(screen.getByTestId('campaign-match')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('Continue to Join'))

    await waitFor(() => {
      expect(screen.getByTestId('character-select-step')).toBeInTheDocument()
    })

    expect(
      screen.getByLabelText('Select a character to join the campaign')
    ).toBeInTheDocument()
  })

  it('should show success state after joining a campaign', async () => {
    server.use(
      http.get(`${BASE_URL}/campaigns/join/:code/`, () => {
        return HttpResponse.json({
          id: 'camp-001',
          name: 'Dragon Hoard',
          description: 'A dragon adventure.',
          characterIds: [],
          joinCode: 'DRG001',
          settings: {
            xpTracking: 'milestone',
            houseRules: {
              allowedSources: ['PHB'],
              abilityScoreMethod: 'any',
              startingLevel: 1,
              allowMulticlass: true,
              allowFeats: true,
              encumbranceVariant: false,
            },
          },
        })
      }),
      http.post(`${BASE_URL}/campaigns/:id/join/`, () => {
        return HttpResponse.json({ detail: 'Joined successfully.' })
      })
    )

    renderJoinPage('/join')

    // Enter code and lookup
    const input = screen.getByLabelText('6-character join code')
    fireEvent.change(input, { target: { value: 'DRG001' } })
    fireEvent.click(screen.getByLabelText('Look up campaign'))

    await waitFor(() => {
      expect(screen.getByTestId('campaign-match')).toBeInTheDocument()
    })

    // Continue to character selection
    fireEvent.click(screen.getByText('Continue to Join'))

    await waitFor(() => {
      expect(screen.getByTestId('character-select-step')).toBeInTheDocument()
    })

    // Wait for characters to load and select one
    await waitFor(() => {
      const select = screen.getByLabelText(
        'Select a character to join the campaign'
      ) as HTMLSelectElement
      expect(select.options.length).toBeGreaterThan(1)
    })

    const select = screen.getByLabelText(
      'Select a character to join the campaign'
    ) as HTMLSelectElement
    fireEvent.change(select, { target: { value: 'char-001' } })

    // Submit
    fireEvent.click(screen.getByText('Join Campaign'))

    // Wait for success state
    await waitFor(() => {
      expect(screen.getByTestId('join-success')).toBeInTheDocument()
    })

    expect(screen.getByText('Welcome to the Party!')).toBeInTheDocument()
    expect(screen.getByText('Dragon Hoard')).toBeInTheDocument()
    expect(screen.getByText('View Campaign')).toBeInTheDocument()
  })
})
