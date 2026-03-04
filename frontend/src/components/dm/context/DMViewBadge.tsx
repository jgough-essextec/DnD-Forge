/**
 * DMViewBadge (Story 38.2)
 *
 * Subtle badge displayed in the character sheet header when the character
 * is being viewed in DM context (from the campaign dashboard).
 * Shows a gold shield icon, "DM View" text, and campaign name with a
 * link back to the campaign dashboard.
 *
 * Hidden entirely in player context.
 */

import { Link } from 'react-router-dom'
import { Shield, ArrowLeft } from 'lucide-react'
import { useDMContext } from './DMContextProvider'

export function DMViewBadge() {
  const { isDMView, campaignId, campaignName } = useDMContext()

  if (!isDMView || !campaignId) {
    return null
  }

  return (
    <div
      className="inline-flex items-center gap-2 rounded-lg border border-accent-gold/30 bg-accent-gold/10 px-3 py-1.5"
      data-testid="dm-view-badge"
      role="status"
      aria-label={`DM View for campaign ${campaignName ?? 'Unknown'}`}
    >
      <Shield className="h-4 w-4 text-accent-gold" aria-hidden="true" />
      <span className="text-sm font-semibold text-accent-gold">DM View</span>
      {campaignName && (
        <>
          <span className="text-parchment/30">|</span>
          <Link
            to={`/campaign/${campaignId}`}
            className="inline-flex items-center gap-1 text-sm text-parchment/70 hover:text-accent-gold transition-colors"
            aria-label={`Back to ${campaignName} dashboard`}
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            {campaignName}
          </Link>
        </>
      )}
    </div>
  )
}
