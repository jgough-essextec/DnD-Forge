/**
 * ExportPDFButton (Story 39.6)
 *
 * Button that calls the server-side PDF generation endpoint,
 * receives a PDF blob, and triggers a browser download.
 * Shows loading state while generating and error toast on failure.
 */

import { useState, useCallback } from 'react'
import { Download, Loader2 } from 'lucide-react'
import { extractPDFFilename } from '@/api/characters'
import { api } from '@/lib/api'

export interface ExportPDFButtonProps {
  characterId: string
  characterName?: string
}

export function ExportPDFButton({ characterId }: ExportPDFButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleExport = useCallback(async () => {
    if (isLoading) return

    setIsLoading(true)
    setError(null)

    try {
      // Make the API call with blob response type to get both blob and headers
      const response = await api.get(`/characters/${characterId}/pdf/`, {
        responseType: 'blob',
      })

      const blob = new Blob([response.data as BlobPart], { type: 'application/pdf' })

      // Extract filename from Content-Disposition header
      const disposition = response.headers['content-disposition'] as string | undefined
      const filename = extractPDFFilename(disposition)

      // Create a temporary object URL and trigger download
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      link.style.display = 'none'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (err) {
      const message = 'Failed to generate PDF. Please try again.'
      setError(message)
      // Clear error after 5 seconds
      setTimeout(() => setError(null), 5000)
    } finally {
      setIsLoading(false)
    }
  }, [characterId, isLoading])

  return (
    <div className="relative inline-block">
      <button
        onClick={handleExport}
        disabled={isLoading}
        className="flex items-center gap-2 rounded-lg border border-parchment/20 px-3 py-2 text-sm text-parchment/70 transition-colors hover:border-accent-gold/30 hover:text-parchment min-h-[44px] touch-manipulation print:hidden disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label={isLoading ? 'Generating PDF...' : 'Export PDF'}
        data-testid="export-pdf-button"
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" data-testid="export-pdf-spinner" />
        ) : (
          <Download className="h-4 w-4" />
        )}
        <span className="hidden sm:inline">
          {isLoading ? 'Generating PDF...' : 'Export PDF'}
        </span>
      </button>

      {/* Error toast */}
      {error && (
        <div
          className="absolute top-full mt-2 right-0 z-50 rounded-lg border border-red-500/30 bg-red-900/90 px-3 py-2 text-sm text-red-200 whitespace-nowrap shadow-lg"
          role="alert"
          data-testid="export-pdf-error"
        >
          {error}
        </div>
      )}
    </div>
  )
}
