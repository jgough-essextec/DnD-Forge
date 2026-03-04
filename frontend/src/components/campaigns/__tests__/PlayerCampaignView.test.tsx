import { describe, it, expect, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { renderWithProviders } from '@/test/utils/renderWithProviders'
import { PlayerCampaignView } from '../PlayerCampaignView'
import { http, HttpResponse } from 'msw'
import { server } from '@/mocks/server'
import type { Campaign } from '@/types/campaign'
import { Route, Routes } from 'react-router-dom'

const BASE_URL = 'http://localhost:8000/api'

// Mock clipboard API
Object.assign(navigator, {
  clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
})

function makeCampaign(overrides: Partial<Campaign> = {}): Campaign {
  return {
    id: 'camp-001',
    name: 'Lost Mine of Phandelver',
    description: 'A classic introductory adventure.',
    dmId: 'user-001',
    playerIds: ['user-002', 'user-003'],
    characterIds: ['char-001', 'char-002'],
    joinCode: 'ABC123',
    settings: {
      xpTracking: 'milestone',
      houseRules: {
        allowedSources: ['PHB', 'DMG'],
        abilityScoreMethod: 'any',
        startingLevel: 1,
        allowMulticlass: true,
        allowFeats: true,
        encumbranceVariant: false,
      },
    },
    sessions: [],
    npcs: [],
    isArchived: false,
    characterCount: 2,
    createdAt: '2024-05-01T10:00:00Z',
    updatedAt: '2024-06-15T10:00:00Z',
    ...overrides,
  }
}

function renderPlayerView(campaign: Campaign) {
  return renderWithProviders(
    <Routes>
      <Route
        path="/*"
        element={<PlayerCampaignView campaign={campaign} />}
      />
    </Routes>
  )
}

describe('PlayerCampaignView', () => {
  it('renders "Party Members" heading', async () => {
    renderPlayerView(makeCampaign())

    await waitFor(() => {
      expect(screen.getByText('Party Members')).toBeInTheDocument()
    })
  })

  it('shows party member cards when loaded', async () => {
    renderPlayerView(makeCampaign())

    await waitFor(() => {
      expect(screen.getByText('Thorn Ironforge')).toBeInTheDocument()
    })
    expect(screen.getByText('Elara Nightwhisper')).toBeInTheDocument()
  })

  it('shows loading skeleton while party loads', () => {
    // Use a delayed handler to keep loading state
    server.use(
      http.get(`${BASE_URL}/campaigns/:id/party/`, async () => {
        await new Promise(() => {}) // Never resolves
      })
    )

    renderPlayerView(makeCampaign())

    // Should show skeleton animation elements (pulsing divs)
    const container = document.querySelector('.animate-pulse')
    expect(container).toBeInTheDocument()
  })

  it('shows empty state when no party members', async () => {
    server.use(
      http.get(`${BASE_URL}/campaigns/:id/party/`, () => {
        return HttpResponse.json([])
      })
    )

    renderPlayerView(makeCampaign())

    await waitFor(() => {
      expect(
        screen.getByText('No characters in this campaign yet.')
      ).toBeInTheDocument()
    })
  })

  it('shows join code', async () => {
    renderPlayerView(makeCampaign())

    await waitFor(() => {
      expect(screen.getByText('ABC123')).toBeInTheDocument()
    })
  })

  it('shows "Leave Campaign" button', async () => {
    renderPlayerView(makeCampaign())

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /leave campaign/i })
      ).toBeInTheDocument()
    })
  })
})
