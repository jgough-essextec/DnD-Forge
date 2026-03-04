import { describe, it, expect, vi } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/test/utils/renderWithProviders'
import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
  motion: {
    div: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
  },
}))

/**
 * Lazy-load pages the same way App.tsx does, to verify route resolution.
 */
const CampaignsPage = lazy(() => import('@/pages/CampaignsPage'))
const CampaignDashboardPage = lazy(
  () => import('@/pages/CampaignDashboardPage')
)
const EncounterPage = lazy(() => import('@/pages/EncounterPage'))
const SessionNotePage = lazy(() => import('@/pages/SessionNotePage'))
const JoinCampaignPage = lazy(() => import('@/pages/JoinCampaignPage'))

function renderCampaignRoutes(route: string) {
  return renderWithProviders(
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        <Route path="/campaigns" element={<CampaignsPage />} />
        <Route path="/campaign/:id" element={<CampaignDashboardPage />} />
        <Route
          path="/campaign/:id/encounter/:eid"
          element={<EncounterPage />}
        />
        <Route
          path="/campaign/:id/session/:sessionId"
          element={<SessionNotePage />}
        />
        <Route path="/join/:code" element={<JoinCampaignPage />} />
        <Route path="*" element={<div>Not Found</div>} />
      </Routes>
    </Suspense>,
    { route }
  )
}

describe('Campaign route resolution', () => {
  it('should resolve /campaigns to CampaignsPage', async () => {
    renderCampaignRoutes('/campaigns')

    // CampaignsPage now shows the heading "Campaigns" and a "Create New Campaign" button
    expect(
      await screen.findByText('Campaigns')
    ).toBeInTheDocument()
  })

  it('should resolve /campaign/:id to CampaignDashboardPage', async () => {
    renderCampaignRoutes('/campaign/camp-001')

    // CampaignDashboardPage shows the campaign name from the mock
    expect(
      await screen.findByText('Lost Mine of Phandelver')
    ).toBeInTheDocument()
  })

  it('should resolve /campaign/:id/encounter/:eid to EncounterPage', async () => {
    renderCampaignRoutes('/campaign/camp-001/encounter/enc-001')

    expect(
      await screen.findByText('Combat tracker coming soon.')
    ).toBeInTheDocument()
  })

  it('should resolve /campaign/:id/session/:sessionId to SessionNotePage', async () => {
    renderCampaignRoutes('/campaign/camp-001/session/5')

    // SessionNotePage now shows full session detail view; if no session matches, shows "Session not found."
    expect(
      await screen.findByText('Session not found.')
    ).toBeInTheDocument()
  })

  it('should resolve /join/:code to JoinCampaignPage', async () => {
    renderCampaignRoutes('/join/ABC123')

    // JoinCampaignPage now shows the descriptive text
    expect(
      await screen.findByText('Enter the campaign ID and join code provided by your Dungeon Master.')
    ).toBeInTheDocument()
  })
})
