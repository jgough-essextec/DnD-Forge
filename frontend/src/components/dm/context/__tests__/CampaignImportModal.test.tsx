import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, fireEvent, waitFor, act } from '@testing-library/react'
import { renderWithProviders } from '@/test/utils/renderWithProviders'
import { CampaignImportModal } from '../CampaignImportModal'
import type { Character } from '@/types/character'
import { DEFAULT_HOUSE_RULES } from '@/utils/campaign'
import type { CampaignImportResult } from '@/utils/campaign-export'

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

function makeExistingCharacter(): Character {
  return {
    id: 'char-existing-1',
    name: 'Thorn Ironforge',
    level: 5,
    race: { raceId: 'dwarf' },
    classes: [{ classId: 'fighter', level: 5 }],
  } as unknown as Character
}

function makeValidExportJson(options: { hasDuplicates?: boolean } = {}): string {
  return JSON.stringify({
    formatVersion: '1.0.0',
    exportType: 'full',
    exportedAt: '2024-06-15T10:00:00Z',
    campaign: {
      id: 'camp-imp',
      name: 'Imported Campaign',
      description: 'An imported campaign.',
      joinCode: 'IMP123',
      settings: {
        xpTracking: 'milestone',
        houseRules: { ...DEFAULT_HOUSE_RULES },
      },
      isArchived: false,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-06-15T10:00:00Z',
    },
    characters: [
      {
        id: 'char-imp-1',
        name: options.hasDuplicates ? 'Thorn Ironforge' : 'Unique Character',
        race: { raceId: options.hasDuplicates ? 'dwarf' : 'elf' },
        classes: [
          {
            classId: options.hasDuplicates ? 'fighter' : 'wizard',
            level: options.hasDuplicates ? 5 : 3,
          },
        ],
        level: options.hasDuplicates ? 5 : 3,
        background: { backgroundId: 'soldier' },
        abilityScores: {
          strength: 16,
          dexterity: 12,
          constitution: 14,
          intelligence: 10,
          wisdom: 13,
          charisma: 8,
        },
        hpMax: 52,
        hpCurrent: 44,
        inventory: [],
        spellcasting: null,
      },
    ],
    sessions: [],
    npcs: [],
  })
}

/**
 * Helper: upload file by creating a File-like object with a working text() method
 * and triggering the change event. jsdom's File doesn't support text() natively.
 */
async function uploadFile(content: string, filename: string) {
  // Create a mock file-like object with a working text() method
  const file = {
    name: filename,
    type: 'application/json',
    size: content.length,
    text: () => Promise.resolve(content),
  }

  const fileInput = screen.getByTestId('file-input') as HTMLInputElement

  await act(async () => {
    Object.defineProperty(fileInput, 'files', {
      value: [file],
      writable: false,
      configurable: true,
    })
    fireEvent.change(fileInput)
    // Give time for the async file.text() to resolve and state updates
    await new Promise((r) => setTimeout(r, 50))
  })
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('CampaignImportModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    existingCharacters: [] as Character[],
    onImportComplete: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render when open', () => {
    renderWithProviders(<CampaignImportModal {...defaultProps} />)

    expect(screen.getByTestId('campaign-import-modal')).toBeInTheDocument()
    expect(screen.getByText('Import Campaign')).toBeInTheDocument()
  })

  it('should not render when closed', () => {
    renderWithProviders(
      <CampaignImportModal {...defaultProps} isOpen={false} />
    )

    expect(
      screen.queryByTestId('campaign-import-modal')
    ).not.toBeInTheDocument()
  })

  it('should display file drop zone initially', () => {
    renderWithProviders(<CampaignImportModal {...defaultProps} />)

    expect(screen.getByTestId('file-drop-zone')).toBeInTheDocument()
    expect(
      screen.getByText('Click to select a JSON file')
    ).toBeInTheDocument()
  })

  it('should validate and reject invalid JSON on import with error message', async () => {
    renderWithProviders(<CampaignImportModal {...defaultProps} />)

    await uploadFile('not valid json {{{', 'invalid.json')

    await waitFor(() => {
      expect(screen.getByTestId('validation-errors')).toBeInTheDocument()
    })

    // Should show Syntax validation failure
    expect(screen.getByText('Syntax')).toBeInTheDocument()
    expect(screen.getByText('Try Another File')).toBeInTheDocument()
  })

  it('should proceed to summary for valid file with no duplicates', async () => {
    renderWithProviders(<CampaignImportModal {...defaultProps} />)

    await uploadFile(makeValidExportJson(), 'campaign.json')

    await waitFor(() => {
      expect(screen.getByTestId('import-summary')).toBeInTheDocument()
    })

    expect(screen.getByText('Ready to Import')).toBeInTheDocument()
    expect(screen.getByText('Imported Campaign')).toBeInTheDocument()
  })

  it('should offer "Merge" and "Import as new copy" for duplicate characters', async () => {
    renderWithProviders(
      <CampaignImportModal
        {...defaultProps}
        existingCharacters={[makeExistingCharacter()]}
      />
    )

    await uploadFile(
      makeValidExportJson({ hasDuplicates: true }),
      'campaign.json'
    )

    await waitFor(() => {
      expect(screen.getByTestId('merge-choice')).toBeInTheDocument()
    })

    expect(
      screen.getByText('Duplicate Characters Detected')
    ).toBeInTheDocument()
    expect(screen.getByTestId('merge-option')).toBeInTheDocument()
    expect(screen.getByTestId('new-copy-option')).toBeInTheDocument()
    expect(screen.getByText('Merge (update existing)')).toBeInTheDocument()
    expect(screen.getByText('Import as new copy')).toBeInTheDocument()
  })

  it('should proceed to summary after merge choice', async () => {
    renderWithProviders(
      <CampaignImportModal
        {...defaultProps}
        existingCharacters={[makeExistingCharacter()]}
      />
    )

    await uploadFile(
      makeValidExportJson({ hasDuplicates: true }),
      'campaign.json'
    )

    await waitFor(() => {
      expect(screen.getByTestId('merge-choice')).toBeInTheDocument()
    })

    await act(async () => {
      fireEvent.click(screen.getByTestId('new-copy-option'))
    })

    await waitFor(() => {
      expect(screen.getByTestId('import-summary')).toBeInTheDocument()
    })

    expect(screen.getByText('Ready to Import')).toBeInTheDocument()
  })

  it('should create a campaign from imported data when confirmed', async () => {
    renderWithProviders(<CampaignImportModal {...defaultProps} />)

    await uploadFile(makeValidExportJson(), 'campaign.json')

    await waitFor(() => {
      expect(screen.getByTestId('import-summary')).toBeInTheDocument()
    })

    await act(async () => {
      fireEvent.click(screen.getByTestId('confirm-import-button'))
    })

    expect(defaultProps.onImportComplete).toHaveBeenCalledTimes(1)
    const result = defaultProps.onImportComplete.mock.calls[0][0] as CampaignImportResult
    expect(result.campaign.name).toBe('Imported Campaign')
    expect(result.characters).toHaveLength(1)
    expect(result.newCampaignId).toBeTruthy()
  })

  it('should allow trying another file after validation error', async () => {
    renderWithProviders(<CampaignImportModal {...defaultProps} />)

    await uploadFile('not valid json', 'invalid.json')

    await waitFor(() => {
      expect(screen.getByTestId('validation-errors')).toBeInTheDocument()
    })

    await act(async () => {
      fireEvent.click(screen.getByText('Try Another File'))
    })

    // Should be back to upload step
    expect(screen.getByTestId('file-drop-zone')).toBeInTheDocument()
  })
})
