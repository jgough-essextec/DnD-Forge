import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import { renderWithProviders } from '@/test/utils/renderWithProviders'
import { DMContextProvider } from '../DMContextProvider'
import { DMContextActions } from '../DMContextActions'

// Mock the UI store
const mockSetActiveModal = vi.fn()
vi.mock('@/stores/uiStore', () => ({
  useUIStore: (selector: (state: { setActiveModal: typeof mockSetActiveModal }) => unknown) =>
    selector({ setActiveModal: mockSetActiveModal }),
}))

describe('DMContextActions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should show "Award XP" and "Add to Encounter" actions in DM context only', () => {
    renderWithProviders(
      <DMContextProvider
        initialDMView={true}
        initialCampaignId="camp-1"
        initialCampaignName="Test Campaign"
      >
        <DMContextActions characterId="char-1" />
      </DMContextProvider>
    )

    expect(screen.getByTestId('dm-context-actions')).toBeInTheDocument()
    expect(screen.getByTestId('award-xp-button')).toBeInTheDocument()
    expect(screen.getByTestId('add-to-encounter-button')).toBeInTheDocument()
    expect(screen.getByText('Award XP')).toBeInTheDocument()
    expect(screen.getByText('Add to Encounter')).toBeInTheDocument()
  })

  it('should NOT render actions in player context', () => {
    renderWithProviders(
      <DMContextProvider initialDMView={false}>
        <DMContextActions characterId="char-1" />
      </DMContextProvider>
    )

    expect(screen.queryByTestId('dm-context-actions')).not.toBeInTheDocument()
    expect(screen.queryByText('Award XP')).not.toBeInTheDocument()
    expect(screen.queryByText('Add to Encounter')).not.toBeInTheDocument()
  })

  it('should display campaign context badge with campaign name', () => {
    renderWithProviders(
      <DMContextProvider
        initialDMView={true}
        initialCampaignId="camp-1"
        initialCampaignName="Dragon Lair"
      >
        <DMContextActions characterId="char-1" />
      </DMContextProvider>
    )

    const badge = screen.getByTestId('campaign-context-badge')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveTextContent('Dragon Lair')
    expect(badge).toHaveAttribute('href', '/campaign/camp-1')
  })

  it('should open Award XP modal when clicked', () => {
    renderWithProviders(
      <DMContextProvider
        initialDMView={true}
        initialCampaignId="camp-1"
        initialCampaignName="Test Campaign"
      >
        <DMContextActions characterId="char-1" />
      </DMContextProvider>
    )

    fireEvent.click(screen.getByTestId('award-xp-button'))
    expect(mockSetActiveModal).toHaveBeenCalledWith('awardXP', {
      campaignId: 'camp-1',
    })
  })

  it('should open Add to Encounter modal when clicked', () => {
    renderWithProviders(
      <DMContextProvider
        initialDMView={true}
        initialCampaignId="camp-1"
        initialCampaignName="Test Campaign"
      >
        <DMContextActions characterId="char-1" />
      </DMContextProvider>
    )

    fireEvent.click(screen.getByTestId('add-to-encounter-button'))
    expect(mockSetActiveModal).toHaveBeenCalledWith('addToEncounter', {
      campaignId: 'camp-1',
    })
  })

  it('should have accessible toolbar role and labels', () => {
    renderWithProviders(
      <DMContextProvider
        initialDMView={true}
        initialCampaignId="camp-1"
        initialCampaignName="Test Campaign"
      >
        <DMContextActions characterId="char-1" />
      </DMContextProvider>
    )

    expect(screen.getByRole('toolbar')).toHaveAttribute(
      'aria-label',
      'DM Actions'
    )
    expect(
      screen.getByRole('button', { name: 'Award XP' })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Add to Encounter' })
    ).toBeInTheDocument()
  })
})
