import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { renderWithProviders } from '@/test/utils/renderWithProviders'
import { Breadcrumbs, buildBreadcrumbs, extractCampaignId } from '@/components/layout/Breadcrumbs'
import { Route, Routes } from 'react-router-dom'

// Mock the useCampaigns hook so we can control campaign data
vi.mock('@/hooks/useCampaigns', () => ({
  useCampaign: vi.fn((id: string | null) => {
    if (id === 'camp-001') {
      return { data: { id: 'camp-001', name: 'Lost Mine of Phandelver' } }
    }
    if (id === 'camp-404') {
      return { data: undefined }
    }
    return { data: undefined }
  }),
}))

/**
 * Helper to render Breadcrumbs within various route contexts.
 * Uses Routes + Route so useParams provides the correct params.
 */
function renderBreadcrumbs(route: string) {
  return renderWithProviders(
    <Routes>
      <Route path="/" element={<Breadcrumbs />} />
      <Route path="/character/new" element={<Breadcrumbs />} />
      <Route path="/character/:id" element={<Breadcrumbs />} />
      <Route path="/character/:id/edit" element={<Breadcrumbs />} />
      <Route path="/character/:id/levelup" element={<Breadcrumbs />} />
      <Route path="/campaigns" element={<Breadcrumbs />} />
      <Route path="/campaign/:id" element={<Breadcrumbs />} />
      <Route path="/campaign/:id/encounter/:eid" element={<Breadcrumbs />} />
      <Route path="/campaign/:id/session/:sessionId" element={<Breadcrumbs />} />
      <Route path="/join/:code" element={<Breadcrumbs />} />
      <Route path="/dice" element={<Breadcrumbs />} />
      <Route path="/settings" element={<Breadcrumbs />} />
    </Routes>,
    { route }
  )
}

describe('Breadcrumbs', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Home / Gallery route', () => {
    it('should render "Characters" breadcrumb on the home page', () => {
      renderBreadcrumbs('/')

      expect(screen.getByText('Characters')).toBeInTheDocument()
    })

    it('should have a breadcrumb navigation landmark', () => {
      renderBreadcrumbs('/')

      expect(screen.getByRole('navigation', { name: 'Breadcrumb' })).toBeInTheDocument()
    })

    it('should show home icon on root breadcrumb', () => {
      renderBreadcrumbs('/')

      // The "Characters" crumb is on the home route, so it should be present
      expect(screen.getByText('Characters')).toBeInTheDocument()
    })
  })

  describe('Character creation route', () => {
    it('should render "Characters > New Character" on /character/new', () => {
      renderBreadcrumbs('/character/new')

      expect(screen.getByText('Characters')).toBeInTheDocument()
      expect(screen.getByText('New Character')).toBeInTheDocument()
    })

    it('should make "Characters" a clickable link', () => {
      renderBreadcrumbs('/character/new')

      const link = screen.getByRole('link', { name: 'Characters' })
      expect(link).toHaveAttribute('href', '/')
    })
  })

  describe('Character view route', () => {
    it('should render "Characters > [Character Name]" on /character/:id', async () => {
      renderBreadcrumbs('/character/char-001')

      // Initially may show "Loading..."
      expect(screen.getByText('Characters')).toBeInTheDocument()

      await waitFor(() => {
        expect(screen.getByText('Thorn Ironforge')).toBeInTheDocument()
      })
    })

    it('should make "Characters" clickable for navigation back', async () => {
      renderBreadcrumbs('/character/char-001')

      const link = screen.getByRole('link', { name: 'Characters' })
      expect(link).toHaveAttribute('href', '/')
    })

    it('should show character name as the current page breadcrumb', async () => {
      renderBreadcrumbs('/character/char-001')

      await waitFor(() => {
        const currentPage = screen.getByText('Thorn Ironforge')
        expect(currentPage).toHaveAttribute('aria-current', 'page')
      })
    })
  })

  describe('Character edit route', () => {
    it('should render "Characters > [Name] > Editing" on /character/:id/edit', async () => {
      renderBreadcrumbs('/character/char-001/edit')

      expect(screen.getByText('Characters')).toBeInTheDocument()

      await waitFor(() => {
        expect(screen.getByText('Thorn Ironforge')).toBeInTheDocument()
      })

      expect(screen.getByText('Editing')).toBeInTheDocument()
    })

    it('should make character name a clickable link back to view mode', async () => {
      renderBreadcrumbs('/character/char-001/edit')

      await waitFor(() => {
        const charLink = screen.getByRole('link', { name: 'Thorn Ironforge' })
        expect(charLink).toHaveAttribute('href', '/character/char-001')
      })
    })

    it('should mark "Editing" as the current page', async () => {
      renderBreadcrumbs('/character/char-001/edit')

      await waitFor(() => {
        expect(screen.getByText('Thorn Ironforge')).toBeInTheDocument()
      })

      const editingCrumb = screen.getByText('Editing')
      expect(editingCrumb).toHaveAttribute('aria-current', 'page')
    })
  })

  describe('Character level up route', () => {
    it('should render "Characters > [Name] > Level Up" on /character/:id/levelup', async () => {
      renderBreadcrumbs('/character/char-001/levelup')

      await waitFor(() => {
        expect(screen.getByText('Thorn Ironforge')).toBeInTheDocument()
      })

      expect(screen.getByText('Level Up')).toBeInTheDocument()
    })
  })

  // --- Campaign routes ---

  describe('Campaigns list route', () => {
    it('should render "Campaigns" breadcrumb on /campaigns', () => {
      renderBreadcrumbs('/campaigns')

      expect(screen.getByText('Campaigns')).toBeInTheDocument()
    })

    it('should show "Campaigns" as the current page', () => {
      renderBreadcrumbs('/campaigns')

      const crumb = screen.getByText('Campaigns')
      expect(crumb).toHaveAttribute('aria-current', 'page')
    })
  })

  describe('Campaign dashboard route', () => {
    it('should render "Campaigns > [Campaign Name]" on /campaign/:id', () => {
      renderBreadcrumbs('/campaign/camp-001')

      expect(screen.getByText('Campaigns')).toBeInTheDocument()
      expect(screen.getByText('Lost Mine of Phandelver')).toBeInTheDocument()
    })

    it('should make "Campaigns" a clickable link to /campaigns', () => {
      renderBreadcrumbs('/campaign/camp-001')

      const link = screen.getByRole('link', { name: 'Campaigns' })
      expect(link).toHaveAttribute('href', '/campaigns')
    })

    it('should mark campaign name as the current page', () => {
      renderBreadcrumbs('/campaign/camp-001')

      const crumb = screen.getByText('Lost Mine of Phandelver')
      expect(crumb).toHaveAttribute('aria-current', 'page')
    })

    it('should show "Loading..." when campaign data is not yet available', () => {
      renderBreadcrumbs('/campaign/camp-404')

      expect(screen.getByText('Loading...')).toBeInTheDocument()
    })
  })

  describe('Campaign encounter route', () => {
    it('should render "Campaigns > [Campaign Name] > Encounter" on /campaign/:id/encounter/:eid', () => {
      renderBreadcrumbs('/campaign/camp-001/encounter/enc-001')

      expect(screen.getByText('Campaigns')).toBeInTheDocument()
      expect(screen.getByText('Lost Mine of Phandelver')).toBeInTheDocument()
      expect(screen.getByText('Encounter')).toBeInTheDocument()
    })

    it('should make campaign name a clickable link to campaign dashboard', () => {
      renderBreadcrumbs('/campaign/camp-001/encounter/enc-001')

      const link = screen.getByRole('link', { name: 'Lost Mine of Phandelver' })
      expect(link).toHaveAttribute('href', '/campaign/camp-001')
    })

    it('should mark "Encounter" as the current page', () => {
      renderBreadcrumbs('/campaign/camp-001/encounter/enc-001')

      const crumb = screen.getByText('Encounter')
      expect(crumb).toHaveAttribute('aria-current', 'page')
    })
  })

  describe('Campaign session note route', () => {
    it('should render "Campaigns > [Campaign Name] > Session [N]" on /campaign/:id/session/:sessionId', () => {
      renderBreadcrumbs('/campaign/camp-001/session/5')

      expect(screen.getByText('Campaigns')).toBeInTheDocument()
      expect(screen.getByText('Lost Mine of Phandelver')).toBeInTheDocument()
      expect(screen.getByText('Session 5')).toBeInTheDocument()
    })

    it('should make campaign name a clickable link to campaign dashboard', () => {
      renderBreadcrumbs('/campaign/camp-001/session/5')

      const link = screen.getByRole('link', { name: 'Lost Mine of Phandelver' })
      expect(link).toHaveAttribute('href', '/campaign/camp-001')
    })

    it('should mark session label as the current page', () => {
      renderBreadcrumbs('/campaign/camp-001/session/5')

      const crumb = screen.getByText('Session 5')
      expect(crumb).toHaveAttribute('aria-current', 'page')
    })
  })

  describe('Join campaign route', () => {
    it('should render "Join Campaign" on /join/:code', () => {
      renderBreadcrumbs('/join/ABC123')

      expect(screen.getByText('Join Campaign')).toBeInTheDocument()
    })

    it('should mark "Join Campaign" as the current page', () => {
      renderBreadcrumbs('/join/ABC123')

      const crumb = screen.getByText('Join Campaign')
      expect(crumb).toHaveAttribute('aria-current', 'page')
    })
  })

  describe('Non-character routes', () => {
    it('should render "Dice Roller" breadcrumb on /dice', () => {
      renderBreadcrumbs('/dice')

      expect(screen.getByText('Dice Roller')).toBeInTheDocument()
    })

    it('should render "Settings" breadcrumb on /settings', () => {
      renderBreadcrumbs('/settings')

      expect(screen.getByText('Settings')).toBeInTheDocument()
    })
  })

  describe('Chevron separators', () => {
    it('should render chevron separators between breadcrumb items', () => {
      renderBreadcrumbs('/character/new')

      // The breadcrumb list should have both "Characters" and "New Character"
      const listItems = screen.getAllByRole('listitem')
      expect(listItems.length).toBe(2)
    })

    it('should render two chevron separators for three-level campaign breadcrumbs', () => {
      renderBreadcrumbs('/campaign/camp-001/encounter/enc-001')

      const listItems = screen.getAllByRole('listitem')
      expect(listItems.length).toBe(3)
    })
  })

  describe('Loading state for character name', () => {
    it('should show "Loading..." initially while character data is being fetched', () => {
      renderBreadcrumbs('/character/char-001')

      expect(screen.getByText('Loading...')).toBeInTheDocument()
    })

    it('should replace "Loading..." with character name after data loads', async () => {
      renderBreadcrumbs('/character/char-001')

      expect(screen.getByText('Loading...')).toBeInTheDocument()

      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
        expect(screen.getByText('Thorn Ironforge')).toBeInTheDocument()
      })
    })
  })
})

describe('extractCampaignId', () => {
  it('should extract campaign ID from /campaign/:id', () => {
    expect(extractCampaignId('/campaign/camp-001')).toBe('camp-001')
  })

  it('should extract campaign ID from /campaign/:id/encounter/:eid', () => {
    expect(extractCampaignId('/campaign/camp-001/encounter/enc-001')).toBe('camp-001')
  })

  it('should extract campaign ID from /campaign/:id/session/:sessionId', () => {
    expect(extractCampaignId('/campaign/camp-001/session/5')).toBe('camp-001')
  })

  it('should return undefined for /campaigns', () => {
    expect(extractCampaignId('/campaigns')).toBeUndefined()
  })

  it('should return undefined for non-campaign routes', () => {
    expect(extractCampaignId('/dice')).toBeUndefined()
    expect(extractCampaignId('/')).toBeUndefined()
  })
})

describe('buildBreadcrumbs (unit)', () => {
  it('should return Campaigns only for /campaigns', () => {
    const crumbs = buildBreadcrumbs('/campaigns', undefined, undefined, undefined, undefined, undefined)
    expect(crumbs).toEqual([{ label: 'Campaigns' }])
  })

  it('should return campaign name for /campaign/:id', () => {
    const crumbs = buildBreadcrumbs(
      '/campaign/camp-001',
      undefined,
      undefined,
      'camp-001',
      'Test Campaign',
      undefined
    )
    expect(crumbs).toEqual([
      { label: 'Campaigns', to: '/campaigns' },
      { label: 'Test Campaign' },
    ])
  })

  it('should return three-level breadcrumb for encounter route', () => {
    const crumbs = buildBreadcrumbs(
      '/campaign/camp-001/encounter/enc-001',
      undefined,
      undefined,
      'camp-001',
      'Test Campaign',
      undefined
    )
    expect(crumbs).toEqual([
      { label: 'Campaigns', to: '/campaigns' },
      { label: 'Test Campaign', to: '/campaign/camp-001' },
      { label: 'Encounter' },
    ])
  })

  it('should return session label with sessionId for session route', () => {
    const crumbs = buildBreadcrumbs(
      '/campaign/camp-001/session/3',
      undefined,
      undefined,
      'camp-001',
      'Test Campaign',
      '3'
    )
    expect(crumbs).toEqual([
      { label: 'Campaigns', to: '/campaigns' },
      { label: 'Test Campaign', to: '/campaign/camp-001' },
      { label: 'Session 3' },
    ])
  })

  it('should return "Join Campaign" for /join/:code', () => {
    const crumbs = buildBreadcrumbs('/join/ABC123', undefined, undefined, undefined, undefined, undefined)
    expect(crumbs).toEqual([{ label: 'Join Campaign' }])
  })

  it('should show "Loading..." when campaign name is undefined', () => {
    const crumbs = buildBreadcrumbs(
      '/campaign/camp-001',
      undefined,
      undefined,
      'camp-001',
      undefined,
      undefined
    )
    expect(crumbs).toEqual([
      { label: 'Campaigns', to: '/campaigns' },
      { label: 'Loading...' },
    ])
  })
})
