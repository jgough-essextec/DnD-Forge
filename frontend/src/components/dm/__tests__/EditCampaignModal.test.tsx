import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import { renderWithProviders } from '@/test/utils/renderWithProviders'
import { EditCampaignModal } from '../EditCampaignModal'
import type { Campaign } from '@/types/campaign'
import { DEFAULT_HOUSE_RULES } from '@/utils/campaign'

const mockUpdateMutate = vi.fn()
const mockRegenerateMutate = vi.fn()

vi.mock('@/hooks/useCampaigns', () => ({
  useUpdateCampaign: () => ({
    mutate: mockUpdateMutate,
    isPending: false,
  }),
  useRegenerateCode: () => ({
    mutate: mockRegenerateMutate,
    isPending: false,
  }),
}))

vi.mock('@/stores/uiStore', () => ({
  useUIStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({
      addToast: vi.fn(),
      activeModal: null,
      sidebarOpen: true,
      editMode: false,
      mobileNavOpen: false,
      diceRollerOpen: false,
      theme: 'dark',
      toasts: [],
      modalState: {},
    }),
}))

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

describe('EditCampaignModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    campaign: makeCampaign(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders when open', () => {
    renderWithProviders(<EditCampaignModal {...defaultProps} />)
    expect(screen.getByText('Edit Campaign')).toBeInTheDocument()
  })

  it('does not render when closed', () => {
    renderWithProviders(
      <EditCampaignModal {...defaultProps} isOpen={false} />
    )
    expect(screen.queryByText('Edit Campaign')).not.toBeInTheDocument()
  })

  it('shows three tabs', () => {
    renderWithProviders(<EditCampaignModal {...defaultProps} />)
    expect(screen.getByText('Details')).toBeInTheDocument()
    expect(screen.getByText('House Rules')).toBeInTheDocument()
    expect(screen.getByText('Invite')).toBeInTheDocument()
  })

  it('starts on Details tab', () => {
    renderWithProviders(<EditCampaignModal {...defaultProps} />)
    expect(screen.getByLabelText('Campaign Name *')).toBeInTheDocument()
  })

  it('pre-populates campaign name', () => {
    renderWithProviders(<EditCampaignModal {...defaultProps} />)
    expect(screen.getByLabelText('Campaign Name *')).toHaveValue(
      'Test Campaign'
    )
  })

  it('switches to House Rules tab', () => {
    renderWithProviders(<EditCampaignModal {...defaultProps} />)
    fireEvent.click(screen.getByText('House Rules'))
    expect(screen.getByText('Allowed Source Books')).toBeInTheDocument()
  })

  it('shows mid-campaign warning on House Rules tab', () => {
    renderWithProviders(<EditCampaignModal {...defaultProps} />)
    fireEvent.click(screen.getByText('House Rules'))
    expect(
      screen.getByText(/Changing house rules mid-campaign/)
    ).toBeInTheDocument()
  })

  it('switches to Invite tab and shows join code', () => {
    renderWithProviders(<EditCampaignModal {...defaultProps} />)
    fireEvent.click(screen.getByText('Invite'))
    expect(screen.getByText('ABC123')).toBeInTheDocument()
  })

  it('shows Generate New Code button on Invite tab', () => {
    renderWithProviders(<EditCampaignModal {...defaultProps} />)
    fireEvent.click(screen.getByText('Invite'))
    expect(screen.getByText('Generate New Code')).toBeInTheDocument()
  })

  it('shows confirmation before regenerating code', () => {
    renderWithProviders(<EditCampaignModal {...defaultProps} />)
    fireEvent.click(screen.getByText('Invite'))
    fireEvent.click(screen.getByText('Generate New Code'))
    expect(
      screen.getByText(/This will invalidate the current join code/)
    ).toBeInTheDocument()
    expect(screen.getByText('Confirm Regenerate')).toBeInTheDocument()
  })

  it('closes when close button is clicked', () => {
    renderWithProviders(<EditCampaignModal {...defaultProps} />)
    fireEvent.click(screen.getByLabelText('Close'))
    expect(defaultProps.onClose).toHaveBeenCalled()
  })

  it('has correct dialog role', () => {
    renderWithProviders(<EditCampaignModal {...defaultProps} />)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })
})
