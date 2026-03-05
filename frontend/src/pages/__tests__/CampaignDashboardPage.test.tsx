import { describe, it, expect, beforeEach } from 'vitest'
import { screen, waitFor, fireEvent } from '@testing-library/react'
import { setMockUser, resetMockUser } from '@/mocks/handlers'
import { renderWithProviders } from '@/test/utils/renderWithProviders'
import CampaignDashboardPage from '@/pages/CampaignDashboardPage'
import { Route, Routes } from 'react-router-dom'

function renderDashboard(route: string) {
  return renderWithProviders(
    <Routes>
      <Route path="/campaign/:id" element={<CampaignDashboardPage />} />
      <Route path="/campaign/:id/encounter/:eid" element={<div data-testid="encounter-page">Encounter</div>} />
      <Route path="/campaigns" element={<div>Campaigns List</div>} />
    </Routes>,
    { route }
  )
}

const DM_USER = {
  id: 'user-001',
  username: 'dmuser',
  email: 'dm@example.com',
  display_name: 'DM User',
  avatar_url: '',
  date_joined: '2024-01-01T00:00:00Z',
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
      setMockUser(DM_USER)
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

    it('shows party tab by default', async () => {
      renderDashboard('/campaign/camp-001')

      await waitFor(() => {
        expect(screen.getByText('Lost Mine of Phandelver')).toBeInTheDocument()
      })

      // Party tab is active by default — sessions tab region should not be present
      expect(screen.queryByTestId('sessions-tab')).not.toBeInTheDocument()
    })

    it('clicking Sessions tab renders SessionLog', async () => {
      renderDashboard('/campaign/camp-001')

      await waitFor(() => {
        expect(screen.getByText('Lost Mine of Phandelver')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByRole('tab', { name: /sessions/i }))

      await waitFor(() => {
        expect(screen.getByTestId('session-log')).toBeInTheDocument()
      })
    })

    it('sessions tab shows seed session card', async () => {
      renderDashboard('/campaign/camp-001')

      await waitFor(() => {
        expect(screen.getByText('Lost Mine of Phandelver')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByRole('tab', { name: /sessions/i }))

      await waitFor(() => {
        expect(screen.getByText('The Adventure Begins')).toBeInTheDocument()
      })
    })

    it('sessions tab shows Add Session button', async () => {
      renderDashboard('/campaign/camp-001')

      await waitFor(() => {
        expect(screen.getByText('Lost Mine of Phandelver')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByRole('tab', { name: /sessions/i }))

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /add new session/i })).toBeInTheDocument()
      })
    })

    it('clicking Encounters tab shows Start Encounter button', async () => {
      renderDashboard('/campaign/camp-001')

      await waitFor(() => {
        expect(screen.getByText('Lost Mine of Phandelver')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByRole('tab', { name: /encounters/i }))

      await waitFor(() => {
        expect(screen.getByTestId('start-encounter-button')).toBeInTheDocument()
      })
    })

    it('Start Encounter button navigates to encounter route', async () => {
      renderDashboard('/campaign/camp-001')

      await waitFor(() => {
        expect(screen.getByText('Lost Mine of Phandelver')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByRole('tab', { name: /encounters/i }))

      await waitFor(() => {
        expect(screen.getByTestId('start-encounter-button')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByTestId('start-encounter-button'))

      await waitFor(() => {
        expect(screen.getByTestId('encounter-page')).toBeInTheDocument()
      })
    })

    it('clicking Notes tab renders DMNotesPanel', async () => {
      renderDashboard('/campaign/camp-001')

      await waitFor(() => {
        expect(screen.getByText('Lost Mine of Phandelver')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByRole('tab', { name: /notes/i }))

      await waitFor(() => {
        expect(screen.getByTestId('dm-notes-panel')).toBeInTheDocument()
      })
    })

    it('Notes tab renders NPCTracker', async () => {
      renderDashboard('/campaign/camp-001')

      await waitFor(() => {
        expect(screen.getByText('Lost Mine of Phandelver')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByRole('tab', { name: /notes/i }))

      await waitFor(() => {
        expect(screen.getByTestId('npc-tracker')).toBeInTheDocument()
      })
    })

    it('Notes tab shows seed NPC name', async () => {
      renderDashboard('/campaign/camp-001')

      await waitFor(() => {
        expect(screen.getByText('Lost Mine of Phandelver')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByRole('tab', { name: /notes/i }))

      await waitFor(() => {
        expect(screen.getByText('Gundren Rockseeker')).toBeInTheDocument()
      })
    })

    it('Notes tab renders LootTracker', async () => {
      renderDashboard('/campaign/camp-001')

      await waitFor(() => {
        expect(screen.getByText('Lost Mine of Phandelver')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByRole('tab', { name: /notes/i }))

      await waitFor(() => {
        expect(screen.getByTestId('loot-tracker')).toBeInTheDocument()
      })
    })

    it('only one tab panel is visible at a time', async () => {
      renderDashboard('/campaign/camp-001')

      await waitFor(() => {
        expect(screen.getByText('Lost Mine of Phandelver')).toBeInTheDocument()
      })

      // Sessions tab
      fireEvent.click(screen.getByRole('tab', { name: /sessions/i }))
      await waitFor(() => expect(screen.getByTestId('sessions-tab')).toBeInTheDocument())
      expect(screen.queryByTestId('encounters-tab')).not.toBeInTheDocument()
      expect(screen.queryByTestId('notes-tab')).not.toBeInTheDocument()

      // Notes tab
      fireEvent.click(screen.getByRole('tab', { name: /notes/i }))
      await waitFor(() => expect(screen.getByTestId('notes-tab')).toBeInTheDocument())
      expect(screen.queryByTestId('sessions-tab')).not.toBeInTheDocument()
      expect(screen.queryByTestId('encounters-tab')).not.toBeInTheDocument()
    })
  })

  describe('Player view', () => {
    beforeEach(() => {
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

      await waitFor(() => {
        expect(screen.getByText('Party Members')).toBeInTheDocument()
      })
      expect(
        screen.getByRole('button', { name: /leave campaign/i })
      ).toBeInTheDocument()

      expect(
        screen.queryByRole('button', { name: /edit campaign settings/i })
      ).not.toBeInTheDocument()
    })

    it('does not show DM notes panel in player view', async () => {
      renderDashboard('/campaign/camp-001')

      await waitFor(() => {
        expect(screen.getByText('Lost Mine of Phandelver')).toBeInTheDocument()
      })

      // No Notes tab in player view
      expect(screen.queryByRole('tab', { name: /notes/i })).not.toBeInTheDocument()
      expect(screen.queryByTestId('dm-notes-panel')).not.toBeInTheDocument()
    })
  })

  it('shows not found for invalid campaign ID', async () => {
    renderDashboard('/campaign/nonexistent')

    await waitFor(() => {
      expect(screen.getByText('Campaign not found.')).toBeInTheDocument()
    })
  })
})
