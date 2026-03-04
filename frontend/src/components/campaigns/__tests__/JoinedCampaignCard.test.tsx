import { describe, it, expect, vi } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import { renderWithProviders } from '@/test/utils/renderWithProviders'
import { JoinedCampaignCard } from '../JoinedCampaignCard'
import type { Campaign } from '@/types/campaign'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

function makeCampaign(overrides: Partial<Campaign> = {}): Campaign {
  return {
    id: 'camp-002',
    name: 'Curse of Strahd',
    description: 'A gothic horror adventure in Barovia.',
    dmId: 'user-001',
    playerIds: ['user-002'],
    characterIds: ['char-003'],
    joinCode: 'DEF456',
    settings: {
      xpTracking: 'milestone',
      houseRules: {
        allowedSources: ['PHB'],
        abilityScoreMethod: 'any',
        startingLevel: 1,
        allowMulticlass: true,
        allowFeats: true,
        encumbranceVariant: false,
      },
    },
    sessions: [],
    npcs: [],
    isArchived: false,
    characterCount: 1,
    createdAt: '2024-06-01T10:00:00Z',
    updatedAt: '2024-07-01T10:00:00Z',
    ...overrides,
  }
}

describe('JoinedCampaignCard', () => {
  beforeEach(() => {
    mockNavigate.mockClear()
  })

  it('renders campaign name', () => {
    renderWithProviders(<JoinedCampaignCard campaign={makeCampaign()} />)
    expect(screen.getByText('Curse of Strahd')).toBeInTheDocument()
  })

  it('shows "Player" badge', () => {
    renderWithProviders(<JoinedCampaignCard campaign={makeCampaign()} />)
    expect(screen.getByText('Player')).toBeInTheDocument()
  })

  it('shows character count', () => {
    renderWithProviders(
      <JoinedCampaignCard campaign={makeCampaign({ characterIds: ['c1', 'c2', 'c3'] })} />
    )
    expect(screen.getByText('3 characters')).toBeInTheDocument()
  })

  it('shows singular character count', () => {
    renderWithProviders(
      <JoinedCampaignCard campaign={makeCampaign({ characterIds: ['c1'] })} />
    )
    expect(screen.getByText('1 character')).toBeInTheDocument()
  })

  it('navigates to campaign dashboard on click', () => {
    renderWithProviders(<JoinedCampaignCard campaign={makeCampaign()} />)
    fireEvent.click(screen.getByRole('button', { name: /joined campaign/i }))
    expect(mockNavigate).toHaveBeenCalledWith('/campaign/camp-002')
  })

  it('navigates on Enter key press', () => {
    renderWithProviders(<JoinedCampaignCard campaign={makeCampaign()} />)
    fireEvent.keyDown(screen.getByRole('button', { name: /joined campaign/i }), {
      key: 'Enter',
    })
    expect(mockNavigate).toHaveBeenCalledWith('/campaign/camp-002')
  })

  it('shows description when present', () => {
    renderWithProviders(<JoinedCampaignCard campaign={makeCampaign()} />)
    expect(screen.getByText(/gothic horror/i)).toBeInTheDocument()
  })

  it('does not show description when absent', () => {
    renderWithProviders(
      <JoinedCampaignCard campaign={makeCampaign({ description: '' })} />
    )
    expect(screen.queryByText(/gothic horror/i)).not.toBeInTheDocument()
  })
})
