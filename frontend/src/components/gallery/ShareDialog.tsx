import { useEffect, useState } from 'react'
import { shareCharacter } from '@/api/characters'
import { useUIStore } from '@/stores/uiStore'

interface ShareDialogProps {
  characterId: string
  characterName?: string
  open: boolean
  onClose: () => void
}

export function ShareDialog({
  characterId,
  characterName,
  open,
  onClose,
}: ShareDialogProps) {
  const [shareUrl, setShareUrl] = useState<string | null>(null)
  const [expiresAt, setExpiresAt] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const addToast = useUIStore((s) => s.addToast)

  useEffect(() => {
    if (!open) {
      // Reset state when dialog closes
      setShareUrl(null)
      setExpiresAt(null)
      setError(null)
      setCopied(false)
      return
    }

    async function fetchShareLink() {
      setIsLoading(true)
      setError(null)
      try {
        const result = await shareCharacter(characterId)
        const fullUrl = `${window.location.origin}/shared/${result.token}`
        setShareUrl(fullUrl)
        setExpiresAt(result.expires_at)
      } catch {
        setError('Failed to generate share link.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchShareLink()
  }, [open, characterId])

  async function handleCopy() {
    if (!shareUrl) return
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      addToast({ message: 'Link copied to clipboard.', type: 'success' })
      setTimeout(() => setCopied(false), 2000)
    } catch {
      addToast({ message: 'Failed to copy link.', type: 'error' })
    }
  }

  if (!open) return null

  const formattedExpiry = expiresAt
    ? new Date(expiresAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={onClose}
      role="dialog"
      aria-label={`Share ${characterName ?? 'character'}`}
      aria-modal="true"
    >
      <div
        className="w-full max-w-md rounded-xl bg-surface-800 p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-4 text-lg font-semibold text-text-primary">
          Share {characterName ?? 'Character'}
        </h2>

        {isLoading && (
          <p className="text-sm text-text-secondary">Generating share link...</p>
        )}

        {error && (
          <p className="text-sm text-red-400" role="alert">{error}</p>
        )}

        {shareUrl && (
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm text-text-secondary">
                Share Link
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={shareUrl}
                  className="flex-1 rounded-lg border border-surface-600 bg-surface-900 px-3 py-2 text-sm text-text-primary"
                  data-testid="share-url-input"
                />
                <button
                  type="button"
                  onClick={handleCopy}
                  className="rounded-lg bg-accent-gold px-4 py-2 text-sm font-medium text-surface-900 hover:bg-accent-gold/90"
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>

            {formattedExpiry && (
              <p className="text-xs text-text-secondary">
                This link expires on {formattedExpiry}.
              </p>
            )}
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-surface-600 px-4 py-2 text-sm text-text-secondary hover:bg-surface-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
