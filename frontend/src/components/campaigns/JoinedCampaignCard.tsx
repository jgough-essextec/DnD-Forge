import { useNavigate } from 'react-router-dom'
import { Users, Calendar } from 'lucide-react'
import type { Campaign } from '@/types/campaign'
import { truncateDescription, formatCampaignDate } from '@/utils/campaign'

interface JoinedCampaignCardProps {
  campaign: Campaign
}

export function JoinedCampaignCard({ campaign }: JoinedCampaignCardProps) {
  const navigate = useNavigate()

  const handleClick = () => {
    navigate(`/campaign/${campaign.id}`)
  }

  const playerCount =
    campaign.characterIds?.length ?? campaign.characterCount ?? 0

  return (
    <div
      className="relative rounded-lg border-2 border-parchment/20 bg-bg-secondary cursor-pointer transition-all hover:border-accent-gold/40 hover:shadow-lg hover:shadow-accent-gold/5"
      onClick={handleClick}
      role="button"
      tabIndex={0}
      aria-label={`Joined campaign: ${campaign.name}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter') handleClick()
      }}
      data-testid={`joined-campaign-card-${campaign.id}`}
    >
      <div className="p-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider bg-spell-blue/15 text-spell-blue border border-spell-blue/25">
            Player
          </span>
        </div>

        <h3 className="font-heading text-lg text-accent-gold pr-8 mb-1">
          {campaign.name}
        </h3>

        {campaign.description && (
          <p className="text-sm text-parchment/70 mb-3">
            {truncateDescription(campaign.description)}
          </p>
        )}

        <div className="flex items-center gap-4 text-xs text-parchment/50">
          <span className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            {playerCount} character{playerCount !== 1 ? 's' : ''}
          </span>
          {campaign.updatedAt && (
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {formatCampaignDate(campaign.updatedAt)}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
