import { describe, it, expect } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { server } from '@/mocks/server'
import { setMockUser } from '@/mocks/handlers'
import { renderWithProviders } from '@/test/utils/renderWithProviders'
import CampaignsPage from '@/pages/CampaignsPage'
import { Route, Routes } from 'react-router-dom'

const BASE_URL = 'http://localhost:8000/api'

function renderCampaignsPage() {
  return renderWithProviders(
    <Routes>
      <Route path="/campaigns" element={<CampaignsPage />} />
    </Routes>,
    { route: '/campaigns' }
  )
}

describe('CampaignsPage', () => {
  it('renders "Campaigns" heading', async () => {
    renderCampaignsPage()

    await waitFor(() => {
      expect(screen.getByText('Campaigns')).toBeInTheDocument()
    })
  })

  it('shows campaign list from API', async () => {
    renderCampaignsPage()

    await waitFor(() => {
      expect(screen.getByText('Lost Mine of Phandelver')).toBeInTheDocument()
    })
  })

  it('shows "Create New Campaign" button', async () => {
    renderCampaignsPage()

    await waitFor(() => {
      expect(screen.getByText('Campaigns')).toBeInTheDocument()
    })

    expect(
      screen.getByRole('button', { name: /create new campaign/i })
    ).toBeInTheDocument()
  })

  it('shows "Joined Campaigns" section when joined campaigns exist', async () => {
    // Set user so the joined endpoint returns results
    setMockUser({
      id: '550e8400-e29b-41d4-a716-446655440000',
      username: 'testuser',
      email: 'test@example.com',
      display_name: 'Test User',
      avatar_url: '',
      date_joined: '2024-01-01T00:00:00Z',
    })

    renderCampaignsPage()

    await waitFor(() => {
      expect(screen.getByText('Joined Campaigns')).toBeInTheDocument()
    })
  })

  it('shows JoinedCampaignCard for joined campaigns', async () => {
    setMockUser({
      id: '550e8400-e29b-41d4-a716-446655440000',
      username: 'testuser',
      email: 'test@example.com',
      display_name: 'Test User',
      avatar_url: '',
      date_joined: '2024-01-01T00:00:00Z',
    })

    renderCampaignsPage()

    await waitFor(() => {
      expect(screen.getByText('Joined Campaigns')).toBeInTheDocument()
    })

    // The JoinedCampaignCard has a data-testid and shows a "Player" badge
    expect(screen.getByTestId('joined-campaign-card-camp-002')).toBeInTheDocument()
    expect(screen.getByText('Player')).toBeInTheDocument()
  })

  it('shows error state when API fails', async () => {
    server.use(
      http.get(`${BASE_URL}/campaigns/`, () => {
        return HttpResponse.json({ detail: 'Server error' }, { status: 500 })
      })
    )

    renderCampaignsPage()

    await waitFor(() => {
      expect(screen.getByText(/failed to load campaigns/i)).toBeInTheDocument()
    })
  })
})
