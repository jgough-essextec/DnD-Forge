import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import { renderWithProviders } from '@/test/utils/renderWithProviders'
import { CampaignCard } from '../CampaignCard'
import type { Campaign } from '@/types/campaign'
import { DEFAULT_HOUSE_RULES } from '@/utils/campaign'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

function makeCampaign(overrides: Partial<Campaign> = {}): Campaign {
  return {
    id: 'camp-1',
    name: 'Test Campaign',
    description: 'A test campaign description that is fairly short.',
    dmId: 'user-1',
    playerIds: [],
    characterIds: ['char-1', 'char-2'],
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

describe('CampaignCard', () => {
  const defaultProps = {
    onEdit: vi.fn(),
    onArchive: vi.fn(),
    onDelete: vi.fn(),
    onCopyCode: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the campaign name', () => {
    renderWithProviders(
      <CampaignCard campaign={makeCampaign()} {...defaultProps} />
    )
    expect(screen.getByText('Test Campaign')).toBeInTheDocument()
  })

  it('renders the campaign description', () => {
    renderWithProviders(
      <CampaignCard campaign={makeCampaign()} {...defaultProps} />
    )
    expect(
      screen.getByText('A test campaign description that is fairly short.')
    ).toBeInTheDocument()
  })

  it('shows character count', () => {
    renderWithProviders(
      <CampaignCard campaign={makeCampaign()} {...defaultProps} />
    )
    expect(screen.getByText('2 characters')).toBeInTheDocument()
  })

  it('shows singular character count', () => {
    renderWithProviders(
      <CampaignCard
        campaign={makeCampaign({ characterIds: ['char-1'] })}
        {...defaultProps}
      />
    )
    expect(screen.getByText('1 character')).toBeInTheDocument()
  })

  it('navigates to campaign dashboard on click', () => {
    renderWithProviders(
      <CampaignCard campaign={makeCampaign()} {...defaultProps} />
    )
    fireEvent.click(
      screen.getByRole('button', { name: /Campaign: Test Campaign/i })
    )
    expect(mockNavigate).toHaveBeenCalledWith('/campaign/camp-1')
  })

  it('shows archived badge when campaign is archived', () => {
    renderWithProviders(
      <CampaignCard
        campaign={makeCampaign({ isArchived: true })}
        {...defaultProps}
      />
    )
    expect(screen.getByText('Archived')).toBeInTheDocument()
  })

  it('does not show archived badge for active campaigns', () => {
    renderWithProviders(
      <CampaignCard campaign={makeCampaign()} {...defaultProps} />
    )
    expect(screen.queryByText('Archived')).not.toBeInTheDocument()
  })

  it('opens kebab menu on click', () => {
    renderWithProviders(
      <CampaignCard campaign={makeCampaign()} {...defaultProps} />
    )
    fireEvent.click(screen.getByLabelText('Campaign actions'))
    expect(screen.getByText('Edit')).toBeInTheDocument()
    expect(screen.getByText('Archive')).toBeInTheDocument()
    expect(screen.getByText('Delete')).toBeInTheDocument()
    expect(screen.getByText('Copy Join Code')).toBeInTheDocument()
  })

  it('calls onEdit when Edit is clicked', () => {
    renderWithProviders(
      <CampaignCard campaign={makeCampaign()} {...defaultProps} />
    )
    fireEvent.click(screen.getByLabelText('Campaign actions'))
    fireEvent.click(screen.getByText('Edit'))
    expect(defaultProps.onEdit).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'camp-1' })
    )
  })

  it('calls onArchive when Archive is clicked', () => {
    renderWithProviders(
      <CampaignCard campaign={makeCampaign()} {...defaultProps} />
    )
    fireEvent.click(screen.getByLabelText('Campaign actions'))
    fireEvent.click(screen.getByText('Archive'))
    expect(defaultProps.onArchive).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'camp-1' })
    )
  })

  it('shows Unarchive option for archived campaigns', () => {
    renderWithProviders(
      <CampaignCard
        campaign={makeCampaign({ isArchived: true })}
        {...defaultProps}
      />
    )
    fireEvent.click(screen.getByLabelText('Campaign actions'))
    expect(screen.getByText('Unarchive')).toBeInTheDocument()
  })

  it('calls onDelete when Delete is clicked', () => {
    renderWithProviders(
      <CampaignCard campaign={makeCampaign()} {...defaultProps} />
    )
    fireEvent.click(screen.getByLabelText('Campaign actions'))
    fireEvent.click(screen.getByText('Delete'))
    expect(defaultProps.onDelete).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'camp-1' })
    )
  })

  it('calls onCopyCode when Copy Join Code is clicked', () => {
    renderWithProviders(
      <CampaignCard campaign={makeCampaign()} {...defaultProps} />
    )
    fireEvent.click(screen.getByLabelText('Campaign actions'))
    fireEvent.click(screen.getByText('Copy Join Code'))
    expect(defaultProps.onCopyCode).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'camp-1' })
    )
  })

  it('displays formatted date', () => {
    renderWithProviders(
      <CampaignCard campaign={makeCampaign()} {...defaultProps} />
    )
    expect(screen.getByText(/Jun 15, 2024/)).toBeInTheDocument()
  })
})
