import { useState } from 'react'
import { Plus, Scroll } from 'lucide-react'
import { CampaignList } from '@/components/dm/CampaignList'
import { CreateCampaignModal } from '@/components/dm/CreateCampaignModal'
import { EditCampaignModal } from '@/components/dm/EditCampaignModal'
import { DeleteCampaignDialog } from '@/components/dm/DeleteCampaignDialog'
import { JoinedCampaignCard } from '@/components/campaigns/JoinedCampaignCard'
import {
  useCampaigns,
  useJoinedCampaigns,
  useArchiveCampaign,
  useDeleteCampaign,
} from '@/hooks/useCampaigns'
import { useUIStore } from '@/stores/uiStore'
import type { Campaign } from '@/types/campaign'

export default function CampaignsPage() {
  const { data: campaigns, isLoading, error } = useCampaigns()
  const { data: joinedCampaigns, isLoading: joinedLoading } = useJoinedCampaigns()
  const archiveCampaign = useArchiveCampaign()
  const deleteCampaign = useDeleteCampaign()
  const addToast = useUIStore((s) => s.addToast)

  const [showCreate, setShowCreate] = useState(false)
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null)
  const [deletingCampaign, setDeletingCampaign] = useState<Campaign | null>(
    null
  )

  const handleArchive = (campaign: Campaign) => {
    archiveCampaign.mutate(campaign.id, {
      onSuccess: () => {
        const action = campaign.isArchived ? 'unarchived' : 'archived'
        addToast({
          message: `Campaign "${campaign.name}" ${action}.`,
          type: 'success',
        })
      },
      onError: () => {
        addToast({ message: 'Failed to archive campaign.', type: 'error' })
      },
    })
  }

  const handleDelete = () => {
    if (!deletingCampaign) return
    deleteCampaign.mutate(deletingCampaign.id, {
      onSuccess: () => {
        addToast({
          message: `Campaign "${deletingCampaign.name}" deleted.`,
          type: 'success',
        })
        setDeletingCampaign(null)
      },
      onError: () => {
        addToast({ message: 'Failed to delete campaign.', type: 'error' })
      },
    })
  }

  const handleCopyCode = async (campaign: Campaign) => {
    try {
      await navigator.clipboard.writeText(campaign.joinCode)
      addToast({ message: 'Join code copied!', type: 'success' })
    } catch {
      addToast({ message: 'Failed to copy join code.', type: 'error' })
    }
  }

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-parchment/10 rounded w-48" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-32 bg-parchment/5 rounded-lg border border-parchment/10"
              />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8">
        <p className="text-red-400">
          Failed to load campaigns. Please try again later.
        </p>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-3xl text-accent-gold">Campaigns</h1>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent-gold text-bg-primary font-semibold hover:bg-accent-gold/90 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Create New Campaign
        </button>
      </div>

      <CampaignList
        campaigns={campaigns ?? []}
        onEdit={setEditingCampaign}
        onArchive={handleArchive}
        onDelete={setDeletingCampaign}
        onCopyCode={handleCopyCode}
      />

      {/* Joined Campaigns Section */}
      {(joinedLoading || (joinedCampaigns && joinedCampaigns.length > 0)) && (
        <div className="mt-10">
          <h2 className="font-heading text-2xl text-parchment mb-4">
            Joined Campaigns
          </h2>
          {joinedLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2].map((n) => (
                <div
                  key={n}
                  className="h-32 bg-parchment/5 rounded-lg border border-parchment/10 animate-pulse"
                />
              ))}
            </div>
          ) : joinedCampaigns && joinedCampaigns.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {joinedCampaigns.map((campaign) => (
                <JoinedCampaignCard key={campaign.id} campaign={campaign} />
              ))}
            </div>
          ) : null}
        </div>
      )}

      <CreateCampaignModal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
      />

      {editingCampaign && (
        <EditCampaignModal
          isOpen={true}
          onClose={() => setEditingCampaign(null)}
          campaign={editingCampaign}
        />
      )}

      {deletingCampaign && (
        <DeleteCampaignDialog
          isOpen={true}
          onClose={() => setDeletingCampaign(null)}
          onConfirm={handleDelete}
          campaign={deletingCampaign}
          isDeleting={deleteCampaign.isPending}
        />
      )}
    </div>
  )
}
