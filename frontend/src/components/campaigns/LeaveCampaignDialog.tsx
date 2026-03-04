import { AlertTriangle, X } from 'lucide-react'

interface LeaveCampaignDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  campaignName: string
  isLeaving?: boolean
}

export function LeaveCampaignDialog({
  isOpen,
  onClose,
  onConfirm,
  campaignName,
  isLeaving = false,
}: LeaveCampaignDialogProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div
        className="bg-bg-secondary rounded-lg border-2 border-amber-500/30 w-full max-w-md"
        role="alertdialog"
        aria-modal="true"
        aria-label="Leave Campaign"
      >
        <div className="flex items-center justify-between p-4 border-b border-parchment/10">
          <h2 className="font-heading text-xl text-amber-400 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Leave Campaign
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
            Are you sure you want to leave{' '}
            <span className="font-semibold text-accent-gold">
              {campaignName}
            </span>
            ?
          </p>

          <div className="p-3 rounded-lg bg-amber-900/20 border border-amber-500/30">
            <p className="text-sm text-amber-200">
              Your character will be removed from this campaign. You can rejoin
              later using the campaign's join code.
            </p>
          </div>

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
              disabled={isLeaving}
              className="px-4 py-2 rounded-lg bg-amber-600 text-white font-semibold hover:bg-amber-700 disabled:opacity-50 transition-colors"
            >
              {isLeaving ? 'Leaving...' : 'Leave Campaign'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
