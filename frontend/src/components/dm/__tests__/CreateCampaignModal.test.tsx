import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import { renderWithProviders } from '@/test/utils/renderWithProviders'
import { CreateCampaignModal } from '../CreateCampaignModal'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

const mockMutate = vi.fn()
const mockMutateState = {
  mutate: mockMutate,
  isPending: false,
}

vi.mock('@/hooks/useCampaigns', () => ({
  useCreateCampaign: () => mockMutateState,
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

describe('CreateCampaignModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders when open', () => {
    renderWithProviders(<CreateCampaignModal {...defaultProps} />)
    expect(screen.getByText('Create Campaign')).toBeInTheDocument()
  })

  it('does not render when closed', () => {
    renderWithProviders(
      <CreateCampaignModal isOpen={false} onClose={vi.fn()} />
    )
    expect(screen.queryByText('Create Campaign')).not.toBeInTheDocument()
  })

  it('shows step indicator with 3 steps', () => {
    renderWithProviders(<CreateCampaignModal {...defaultProps} />)
    expect(screen.getByText('Basic Info')).toBeInTheDocument()
    expect(screen.getByText('House Rules')).toBeInTheDocument()
    expect(screen.getByText('Invite Players')).toBeInTheDocument()
  })

  it('starts on Basic Info step', () => {
    renderWithProviders(<CreateCampaignModal {...defaultProps} />)
    expect(screen.getByLabelText('Campaign Name *')).toBeInTheDocument()
  })

  it('has campaign name input', () => {
    renderWithProviders(<CreateCampaignModal {...defaultProps} />)
    const nameInput = screen.getByLabelText('Campaign Name *')
    expect(nameInput).toBeInTheDocument()
    fireEvent.change(nameInput, { target: { value: 'My Campaign' } })
    expect(nameInput).toHaveValue('My Campaign')
  })

  it('has description textarea', () => {
    renderWithProviders(<CreateCampaignModal {...defaultProps} />)
    const descInput = screen.getByLabelText('Description')
    expect(descInput).toBeInTheDocument()
  })

  it('has Next: House Rules button', () => {
    renderWithProviders(<CreateCampaignModal {...defaultProps} />)
    expect(
      screen.getByRole('button', { name: /Next: House Rules/i })
    ).toBeInTheDocument()
  })

  it('advances to House Rules step when name is filled and Next is clicked', async () => {
    renderWithProviders(<CreateCampaignModal {...defaultProps} />)
    fireEvent.change(screen.getByLabelText('Campaign Name *'), {
      target: { value: 'Test Campaign' },
    })
    fireEvent.click(
      screen.getByRole('button', { name: /Next: House Rules/i })
    )
    await waitFor(() => {
      // On house rules step, the form shows "Allowed Source Books" and "Use Standard Rules"
      expect(screen.getByText('Allowed Source Books')).toBeInTheDocument()
    })
  })

  it('closes when close button is clicked', () => {
    renderWithProviders(<CreateCampaignModal {...defaultProps} />)
    fireEvent.click(screen.getByLabelText('Close'))
    expect(defaultProps.onClose).toHaveBeenCalled()
  })

  it('has correct dialog role', () => {
    renderWithProviders(<CreateCampaignModal {...defaultProps} />)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })
})
