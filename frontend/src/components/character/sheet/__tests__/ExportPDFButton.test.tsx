/**
 * ExportPDFButton Tests (Story 39.6)
 *
 * Tests for the PDF export button component:
 * - Renders the button with correct label
 * - Shows loading state while API call is in progress
 * - Triggers blob download on success
 * - Shows error toast on failure
 * - Extracts filename from Content-Disposition header
 * - Falls back to default filename when header missing
 * - Revokes object URL after download
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ExportPDFButton } from '../ExportPDFButton'
import { extractPDFFilename } from '@/api/characters'

// ---------------------------------------------------------------------------
// Mock Axios (api module)
// ---------------------------------------------------------------------------

const mockGet = vi.fn()

vi.mock('@/lib/api', () => ({
  api: {
    get: (...args: unknown[]) => mockGet(...args),
  },
}))

// ---------------------------------------------------------------------------
// Mock URL.createObjectURL / revokeObjectURL
// ---------------------------------------------------------------------------

const mockCreateObjectURL = vi.fn(() => 'blob:http://localhost/fake-blob-url')
const mockRevokeObjectURL = vi.fn()

beforeEach(() => {
  vi.stubGlobal('URL', {
    ...URL,
    createObjectURL: mockCreateObjectURL,
    revokeObjectURL: mockRevokeObjectURL,
  })
})

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  mockGet.mockReset()
  mockCreateObjectURL.mockClear()
  mockRevokeObjectURL.mockClear()
})

// ---------------------------------------------------------------------------
// Helper: successful response mock
// ---------------------------------------------------------------------------

function mockSuccessfulPDFResponse() {
  const pdfBlob = new Blob(['%PDF-1.4 fake'], { type: 'application/pdf' })
  mockGet.mockResolvedValueOnce({
    data: pdfBlob,
    headers: {
      'content-disposition': 'attachment; filename="Thorin_Level5_Fighter.pdf"',
    },
  })
}

function mockFailedPDFResponse() {
  mockGet.mockRejectedValueOnce(new Error('Network Error'))
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('ExportPDFButton', () => {
  it('renders the export PDF button', () => {
    render(<ExportPDFButton characterId="char-001" />)
    expect(screen.getByTestId('export-pdf-button')).toBeInTheDocument()
  })

  it('has accessible label', () => {
    render(<ExportPDFButton characterId="char-001" />)
    expect(screen.getByLabelText('Export PDF')).toBeInTheDocument()
  })

  it('has print:hidden class', () => {
    render(<ExportPDFButton characterId="char-001" />)
    expect(screen.getByTestId('export-pdf-button').className).toContain('print:hidden')
  })

  it('calls API with responseType blob when clicked', async () => {
    mockSuccessfulPDFResponse()
    const user = userEvent.setup()
    render(<ExportPDFButton characterId="char-001" />)

    await user.click(screen.getByTestId('export-pdf-button'))

    await waitFor(() => {
      expect(mockGet).toHaveBeenCalledWith('/characters/char-001/pdf/', {
        responseType: 'blob',
      })
    })
  })

  it('creates an object URL from the blob response', async () => {
    mockSuccessfulPDFResponse()
    const user = userEvent.setup()
    render(<ExportPDFButton characterId="char-001" />)

    await user.click(screen.getByTestId('export-pdf-button'))

    await waitFor(() => {
      expect(mockCreateObjectURL).toHaveBeenCalled()
    })
  })

  it('revokes the object URL after triggering download', async () => {
    mockSuccessfulPDFResponse()
    const user = userEvent.setup()
    render(<ExportPDFButton characterId="char-001" />)

    await user.click(screen.getByTestId('export-pdf-button'))

    await waitFor(() => {
      expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:http://localhost/fake-blob-url')
    })
  })

  it('shows loading state while API call is in progress', async () => {
    // Create a promise we control to test loading state
    let resolvePromise!: (value: unknown) => void
    const pendingPromise = new Promise((resolve) => {
      resolvePromise = resolve
    })
    mockGet.mockReturnValueOnce(pendingPromise)

    const user = userEvent.setup()
    render(<ExportPDFButton characterId="char-001" />)

    await user.click(screen.getByTestId('export-pdf-button'))

    // Should be in loading state
    expect(screen.getByTestId('export-pdf-button')).toBeDisabled()
    expect(screen.getByLabelText('Generating PDF...')).toBeInTheDocument()
    expect(screen.getByTestId('export-pdf-spinner')).toBeInTheDocument()

    // Resolve the promise
    const pdfBlob = new Blob(['%PDF-1.4'], { type: 'application/pdf' })
    await act(async () => {
      resolvePromise({ data: pdfBlob, headers: {} })
    })

    // Should no longer be loading
    await waitFor(() => {
      expect(screen.getByTestId('export-pdf-button')).not.toBeDisabled()
    })
  })

  it('resets loading state after successful download', async () => {
    mockSuccessfulPDFResponse()
    const user = userEvent.setup()
    render(<ExportPDFButton characterId="char-001" />)

    await user.click(screen.getByTestId('export-pdf-button'))

    await waitFor(() => {
      expect(screen.getByTestId('export-pdf-button')).not.toBeDisabled()
      expect(screen.getByLabelText('Export PDF')).toBeInTheDocument()
    })
  })

  it('shows error toast when API call fails', async () => {
    mockFailedPDFResponse()
    const user = userEvent.setup()
    render(<ExportPDFButton characterId="char-001" />)

    await user.click(screen.getByTestId('export-pdf-button'))

    await waitFor(() => {
      expect(screen.getByTestId('export-pdf-error')).toBeInTheDocument()
      expect(screen.getByText('Failed to generate PDF. Please try again.')).toBeInTheDocument()
    })
  })

  it('resets button after failed request', async () => {
    mockFailedPDFResponse()
    const user = userEvent.setup()
    render(<ExportPDFButton characterId="char-001" />)

    await user.click(screen.getByTestId('export-pdf-button'))

    await waitFor(() => {
      expect(screen.getByTestId('export-pdf-button')).not.toBeDisabled()
    })
  })

  it('error toast has alert role for accessibility', async () => {
    mockFailedPDFResponse()
    const user = userEvent.setup()
    render(<ExportPDFButton characterId="char-001" />)

    await user.click(screen.getByTestId('export-pdf-button'))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument()
    })
  })
})

// ---------------------------------------------------------------------------
// extractPDFFilename utility tests
// ---------------------------------------------------------------------------

describe('extractPDFFilename', () => {
  it('extracts filename from standard Content-Disposition header', () => {
    const filename = extractPDFFilename('attachment; filename="Thorin_Level5_Fighter.pdf"')
    expect(filename).toBe('Thorin_Level5_Fighter.pdf')
  })

  it('extracts filename without quotes', () => {
    const filename = extractPDFFilename('attachment; filename=Thorin.pdf')
    expect(filename).toBe('Thorin.pdf')
  })

  it('falls back to default when header is undefined', () => {
    const filename = extractPDFFilename(undefined)
    expect(filename).toBe('character_sheet.pdf')
  })

  it('falls back to default when header has no filename', () => {
    const filename = extractPDFFilename('attachment')
    expect(filename).toBe('character_sheet.pdf')
  })
})
