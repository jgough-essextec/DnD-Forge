import { useState } from 'react'
import { Copy, Check, LogOut, Users } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useCampaignParty, useLeaveCampaign } from '@/hooks/useCampaigns'
import { useUIStore } from '@/stores/uiStore'
import { PartyMemberCard } from './PartyMemberCard'
import { LeaveCampaignDialog } from './LeaveCampaignDialog'
import type { Campaign } from '@/types/campaign'

interface PlayerCampaignViewProps {
  campaign: Campaign
}

export function PlayerCampaignView({ campaign }: PlayerCampaignViewProps) {
  const navigate = useNavigate()
  const { data: partyMembers, isLoading: partyLoading } = useCampaignParty(campaign.id)
  const leaveCampaign = useLeaveCampaign()
  const addToast = useUIStore((s) => s.addToast)

  const [copied, setCopied] = useState(false)
  const [showLeaveDialog, setShowLeaveDialog] = useState(false)

  const handleCopyCode = async () => {
    await navigator.clipboard.writeText(campaign.joinCode)
    setCopied(true)
    addToast({ message: 'Join code copied!', type: 'success' })
    setTimeout(() => setCopied(false), 2000)
  }

  const handleLeave = () => {
    leaveCampaign.mutate(campaign.id, {
      onSuccess: () => {
        addToast({
          message: `Left campaign "${campaign.name}".`,
          type: 'success',
        })
        navigate('/campaigns')
      },
      onError: () => {
        addToast({ message: 'Failed to leave campaign.', type: 'error' })
      },
    })
    setShowLeaveDialog(false)
  }

  return (
    <div className="space-y-8">
      {/* Campaign Info */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-bg-primary border border-parchment/10">
          <Users className="w-4 h-4 text-parchment/50" />
          <span className="text-sm text-parchment">
            {partyMembers?.length ?? 0} party member{(partyMembers?.length ?? 0) !== 1 ? 's' : ''}
          </span>
        </div>

        <button
          onClick={handleCopyCode}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-bg-primary border border-parchment/10 hover:border-accent-gold/40 transition-colors"
        >
          {copied ? (
            <Check className="w-4 h-4 text-green-400" />
          ) : (
            <Copy className="w-4 h-4 text-parchment/50" />
          )}
          <span className="text-sm text-parchment font-mono">
            {campaign.joinCode}
          </span>
        </button>
      </div>

      {/* Party Members Grid */}
      <section>
        <h3 className="font-heading text-lg text-parchment mb-3">
          Party Members
        </h3>

        {partyLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-40 bg-parchment/5 rounded-xl border border-parchment/10 animate-pulse"
              />
            ))}
          </div>
        ) : partyMembers && partyMembers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {partyMembers.map((member) => (
              <PartyMemberCard
                key={member.id}
                member={member}
                campaignId={campaign.id}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 rounded-lg border border-parchment/10 bg-bg-primary">
            <Users className="w-12 h-12 text-parchment/20 mx-auto mb-4" />
            <p className="text-parchment/60">
              No characters in this campaign yet.
            </p>
          </div>
        )}
      </section>

      {/* Leave Campaign */}
      <div className="pt-4 border-t border-parchment/10">
        <button
          onClick={() => setShowLeaveDialog(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors text-sm"
        >
          <LogOut className="w-4 h-4" />
          Leave Campaign
        </button>
      </div>

      <LeaveCampaignDialog
        isOpen={showLeaveDialog}
        onClose={() => setShowLeaveDialog(false)}
        onConfirm={handleLeave}
        campaignName={campaign.name}
        isLeaving={leaveCampaign.isPending}
      />
    </div>
  )
}
