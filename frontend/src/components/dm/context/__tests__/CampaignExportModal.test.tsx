import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import { renderWithProviders } from '@/test/utils/renderWithProviders'
import { CampaignExportModal } from '../CampaignExportModal'
import type { Campaign } from '@/types/campaign'
import type { Character } from '@/types/character'
import { DEFAULT_HOUSE_RULES } from '@/utils/campaign'

// Mock the download utility
vi.mock('@/utils/campaign-export', async () => {
  const actual = await vi.importActual('@/utils/campaign-export')
  return {
    ...actual,
    downloadCampaignExport: vi.fn(),
  }
})

import { downloadCampaignExport } from '@/utils/campaign-export'

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

function makeCampaign(): Campaign {
  return {
    id: 'camp-1',
    name: 'Test Campaign',
    description: 'A test.',
    dmId: 'user-1',
    playerIds: [],
    characterIds: ['char-1'],
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
  }
}

function makeCharacter(): Character {
  return {
    id: 'char-1',
    name: 'Thorn Ironforge',
    level: 5,
  } as Character
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('CampaignExportModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    campaign: makeCampaign(),
    characters: [makeCharacter()],
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render when open', () => {
    renderWithProviders(<CampaignExportModal {...defaultProps} />)

    expect(screen.getByTestId('campaign-export-modal')).toBeInTheDocument()
    expect(screen.getByText('Export Campaign')).toBeInTheDocument()
  })

  it('should not render when closed', () => {
    renderWithProviders(
      <CampaignExportModal {...defaultProps} isOpen={false} />
    )

    expect(
      screen.queryByTestId('campaign-export-modal')
    ).not.toBeInTheDocument()
  })

  it('should trigger full export from Full Export button', () => {
    renderWithProviders(<CampaignExportModal {...defaultProps} />)

    fireEvent.click(screen.getByTestId('full-export-button'))

    expect(downloadCampaignExport).toHaveBeenCalledTimes(1)
    const callArgs = vi.mocked(downloadCampaignExport).mock.calls[0]
    expect(callArgs[0].exportType).toBe('full')
    expect(defaultProps.onClose).toHaveBeenCalled()
  })

  it('should trigger player-safe export from Player-Safe Export button', () => {
    renderWithProviders(<CampaignExportModal {...defaultProps} />)

    fireEvent.click(screen.getByTestId('player-safe-export-button'))

    expect(downloadCampaignExport).toHaveBeenCalledTimes(1)
    const callArgs = vi.mocked(downloadCampaignExport).mock.calls[0]
    expect(callArgs[0].exportType).toBe('player-safe')
    expect(defaultProps.onClose).toHaveBeenCalled()
  })

  it('should show campaign name in description', () => {
    renderWithProviders(<CampaignExportModal {...defaultProps} />)

    // The campaign name appears within the description paragraph
    const descParagraph = screen.getByText(/choose an export format for/i)
    expect(descParagraph).toBeInTheDocument()
    expect(descParagraph.textContent).toContain('Test Campaign')
  })

  it('should close when cancel is clicked', () => {
    renderWithProviders(<CampaignExportModal {...defaultProps} />)

    fireEvent.click(screen.getByText('Cancel'))
    expect(defaultProps.onClose).toHaveBeenCalled()
  })

  it('should display both export options with descriptions', () => {
    renderWithProviders(<CampaignExportModal {...defaultProps} />)

    expect(screen.getByText('Full Export (DM)')).toBeInTheDocument()
    expect(screen.getByText('Player-Safe Export')).toBeInTheDocument()
    expect(
      screen.getByText(/all campaign data including dm notes/i)
    ).toBeInTheDocument()
    expect(
      screen.getByText(/campaign metadata and characters only/i)
    ).toBeInTheDocument()
  })
})
