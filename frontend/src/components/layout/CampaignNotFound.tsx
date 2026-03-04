import { Link } from 'react-router-dom'
import { Map } from 'lucide-react'

/**
 * Reusable error state component displayed when a campaign cannot be found.
 * Shows a themed message with a link to navigate back to the campaigns list.
 */
export function CampaignNotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-8 text-center">
      <Map className="h-16 w-16 text-parchment/30 mb-6" aria-hidden="true" />
      <h1 className="font-heading text-3xl text-damage-red mb-4">
        Campaign Not Found
      </h1>
      <p className="text-parchment/60 mb-8 max-w-md">
        This campaign may have been deleted, or you may not have permission to
        view it. Check the URL and try again.
      </p>
      <Link
        to="/campaigns"
        className="rounded-lg bg-accent-gold px-6 py-2 font-semibold text-bg-primary transition-colors hover:bg-accent-gold/80"
      >
        Go to Campaigns
      </Link>
    </div>
  )
}
