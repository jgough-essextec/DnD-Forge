import { AlertTriangle, X } from 'lucide-react'
import type { Campaign } from '@/types/campaign'

interface DeleteCampaignDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  campaign: Campaign
  isDeleting?: boolean
}

export function DeleteCampaignDialog({
  isOpen,
  onClose,
  onConfirm,
  campaign,
  isDeleting = false,
}: DeleteCampaignDialogProps) {
  if (!isOpen) return null

  const playerCount = campaign.characterIds?.length ?? campaign.characterCount ?? 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div
        className="bg-bg-secondary rounded-lg border-2 border-red-500/30 w-full max-w-md"
        role="alertdialog"
        aria-modal="true"
        aria-label="Delete Campaign"
      >
        <div className="flex items-center justify-between p-4 border-b border-parchment/10">
          <h2 className="font-heading text-xl text-red-400 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Delete Campaign
          </h2>
          <button
            onClick={onClose}
            className="text-parchment/60 hover:text-parchment transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <p className="text-parchment">
            Are you sure you want to delete{' '}
            <span className="font-semibold text-accent-gold">
              {campaign.name}
            </span>
            ?
          </p>

          {playerCount > 0 && (
            <div className="p-3 rounded-lg bg-amber-900/20 border border-amber-500/30">
              <p className="text-sm text-amber-200">
                This campaign has {playerCount} character{playerCount !== 1 ? 's' : ''} assigned.
                Characters will be unlinked from the campaign but not deleted.
              </p>
            </div>
          )}

          <p className="text-sm text-parchment/60">
            This action cannot be undone.
          </p>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-parchment/20 text-parchment hover:bg-parchment/10 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isDeleting}
              className="px-4 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 disabled:opacity-50 transition-colors"
            >
              {isDeleting ? 'Deleting...' : 'Delete Campaign'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
