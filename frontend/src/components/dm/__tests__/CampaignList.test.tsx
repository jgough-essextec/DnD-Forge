import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import { renderWithProviders } from '@/test/utils/renderWithProviders'
import { CampaignList } from '../CampaignList'
import type { Campaign } from '@/types/campaign'
import { DEFAULT_HOUSE_RULES } from '@/utils/campaign'

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  }
})

function makeCampaign(overrides: Partial<Campaign> = {}): Campaign {
  return {
    id: 'camp-1',
    name: 'Test Campaign',
    description: 'A test campaign',
    dmId: 'user-1',
    playerIds: [],
    characterIds: [],
    joinCode: 'ABC123',
    settings: {
      xpTracking: 'milestone',
      houseRules: { ...DEFAULT_HOUSE_RULES },
    },
    sessions: [],
    npcs: [],
    isArchived: false,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-06-15T10:00:00Z',
    ...overrides,
  }
}

describe('CampaignList', () => {
  const defaultProps = {
    onEdit: vi.fn(),
    onArchive: vi.fn(),
    onDelete: vi.fn(),
    onCopyCode: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders campaign cards', () => {
    const campaigns = [
      makeCampaign({ id: '1', name: 'Campaign 1' }),
      makeCampaign({ id: '2', name: 'Campaign 2' }),
    ]
    renderWithProviders(
      <CampaignList campaigns={campaigns} {...defaultProps} />
    )
    expect(screen.getByText('Campaign 1')).toBeInTheDocument()
    expect(screen.getByText('Campaign 2')).toBeInTheDocument()
  })

  it('shows empty state when no campaigns', () => {
    renderWithProviders(
      <CampaignList campaigns={[]} {...defaultProps} />
    )
    expect(
      screen.getByText('No campaigns yet. Create your first campaign!')
    ).toBeInTheDocument()
  })

  it('hides archived campaigns by default', () => {
    const campaigns = [
      makeCampaign({ id: '1', name: 'Active Campaign', isArchived: false }),
      makeCampaign({ id: '2', name: 'Archived Campaign', isArchived: true }),
    ]
    renderWithProviders(
      <CampaignList campaigns={campaigns} {...defaultProps} />
    )
    expect(screen.getByText('Active Campaign')).toBeInTheDocument()
    expect(screen.queryByText('Archived Campaign')).not.toBeInTheDocument()
  })

  it('shows archived campaigns when toggled', () => {
    const campaigns = [
      makeCampaign({ id: '1', name: 'Active Campaign', isArchived: false }),
      makeCampaign({ id: '2', name: 'Archived Campaign', isArchived: true }),
    ]
    renderWithProviders(
      <CampaignList campaigns={campaigns} {...defaultProps} />
    )
    fireEvent.click(screen.getByLabelText('Show Archived'))
    expect(screen.getByText('Archived Campaign')).toBeInTheDocument()
  })

  it('filters campaigns by search', () => {
    const campaigns = [
      makeCampaign({ id: '1', name: 'Lost Mine' }),
      makeCampaign({ id: '2', name: 'Curse of Strahd' }),
    ]
    renderWithProviders(
      <CampaignList campaigns={campaigns} {...defaultProps} />
    )
    fireEvent.change(screen.getByPlaceholderText('Search campaigns...'), {
      target: { value: 'Lost' },
    })
    expect(screen.getByText('Lost Mine')).toBeInTheDocument()
    expect(screen.queryByText('Curse of Strahd')).not.toBeInTheDocument()
  })

  it('shows no results message when search has no matches', () => {
    const campaigns = [makeCampaign({ id: '1', name: 'Test' })]
    renderWithProviders(
      <CampaignList campaigns={campaigns} {...defaultProps} />
    )
    fireEvent.change(screen.getByPlaceholderText('Search campaigns...'), {
      target: { value: 'nonexistent' },
    })
    expect(
      screen.getByText('No campaigns match your search.')
    ).toBeInTheDocument()
  })

  it('has sort dropdown', () => {
    renderWithProviders(
      <CampaignList campaigns={[]} {...defaultProps} />
    )
    const select = screen.getByLabelText('Sort campaigns')
    expect(select).toBeInTheDocument()
  })

  it('has show archived checkbox', () => {
    renderWithProviders(
      <CampaignList campaigns={[]} {...defaultProps} />
    )
    expect(screen.getByText('Show Archived')).toBeInTheDocument()
  })
})
