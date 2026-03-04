import { describe, it, expect, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { setMockUser, resetMockUser } from '@/mocks/handlers'
import { renderWithProviders } from '@/test/utils/renderWithProviders'
import CampaignDashboardPage from '@/pages/CampaignDashboardPage'
import { Route, Routes } from 'react-router-dom'

function renderDashboard(route: string) {
  return renderWithProviders(
    <Routes>
      <Route path="/campaign/:id" element={<CampaignDashboardPage />} />
      <Route path="/campaigns" element={<div>Campaigns List</div>} />
    </Routes>,
    { route }
  )
}

describe('CampaignDashboardPage', () => {
  beforeEach(() => {
    resetMockUser()
  })

  it('shows campaign name in header', async () => {
    renderDashboard('/campaign/camp-001')

    await waitFor(() => {
      expect(screen.getByText('Lost Mine of Phandelver')).toBeInTheDocument()
    })
  })

  it('shows "Back to campaigns" button', async () => {
    renderDashboard('/campaign/camp-001')

    await waitFor(() => {
      expect(screen.getByText('Lost Mine of Phandelver')).toBeInTheDocument()
    })

    expect(
      screen.getByRole('button', { name: /back to campaigns/i })
    ).toBeInTheDocument()
  })

  describe('DM view', () => {
    beforeEach(() => {
      // Set user to campaign DM
      setMockUser({
        id: 'user-001',
        username: 'dmuser',
        email: 'dm@example.com',
        display_name: 'DM User',
        avatar_url: '',
        date_joined: '2024-01-01T00:00:00Z',
      })
    })

    it('shows settings button for DM', async () => {
      renderDashboard('/campaign/camp-001')

      await waitFor(() => {
        expect(screen.getByText('Lost Mine of Phandelver')).toBeInTheDocument()
      })

      expect(
        screen.getByRole('button', { name: /edit campaign settings/i })
      ).toBeInTheDocument()
    })
  })

  describe('Player view', () => {
    beforeEach(() => {
      // Set user to a player (not the DM)
      setMockUser({
        id: 'user-player',
        username: 'playeruser',
        email: 'player@example.com',
        display_name: 'Player User',
        avatar_url: '',
        date_joined: '2024-01-01T00:00:00Z',
      })
    })

    it('shows PlayerCampaignView instead of DM controls', async () => {
      renderDashboard('/campaign/camp-001')

      await waitFor(() => {
        expect(screen.getByText('Lost Mine of Phandelver')).toBeInTheDocument()
      })

      // Player view shows Party Members heading and Leave Campaign button
      await waitFor(() => {
        expect(screen.getByText('Party Members')).toBeInTheDocument()
      })
      expect(
        screen.getByRole('button', { name: /leave campaign/i })
      ).toBeInTheDocument()

      // Should NOT show settings button
      expect(
        screen.queryByRole('button', { name: /edit campaign settings/i })
      ).not.toBeInTheDocument()
    })
  })

  it('shows not found for invalid campaign ID', async () => {
    renderDashboard('/campaign/nonexistent')

    await waitFor(() => {
      expect(screen.getByText('Campaign not found.')).toBeInTheDocument()
    })
  })
})
