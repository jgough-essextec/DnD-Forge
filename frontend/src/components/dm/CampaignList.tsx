import { useState } from 'react'
import { Scroll, SortAsc } from 'lucide-react'
import { CampaignCard } from './CampaignCard'
import type { Campaign } from '@/types/campaign'
import {
  sortCampaigns,
  filterCampaignsByArchived,
  searchCampaigns,
  type CampaignSortKey,
} from '@/utils/campaign'

interface CampaignListProps {
  campaigns: Campaign[]
  onEdit: (campaign: Campaign) => void
  onArchive: (campaign: Campaign) => void
  onDelete: (campaign: Campaign) => void
  onCopyCode: (campaign: Campaign) => void
}

const SORT_OPTIONS: { value: CampaignSortKey; label: string }[] = [
  { value: 'updatedAt', label: 'Last Updated' },
  { value: 'name', label: 'Name A-Z' },
  { value: 'createdAt', label: 'Date Created' },
]

export function CampaignList({
  campaigns,
  onEdit,
  onArchive,
  onDelete,
  onCopyCode,
}: CampaignListProps) {
  const [sortKey, setSortKey] = useState<CampaignSortKey>('updatedAt')
  const [showArchived, setShowArchived] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const filtered = filterCampaignsByArchived(campaigns, showArchived)
  const searched = searchCampaigns(filtered, searchQuery)
  const sorted = sortCampaigns(searched, sortKey)

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search campaigns..."
          className="w-full sm:w-64 px-3 py-2 rounded-lg bg-bg-primary border border-parchment/20 text-parchment placeholder:text-parchment/40 focus:outline-none focus:border-accent-gold text-sm"
        />

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-parchment/70 cursor-pointer">
            <input
              type="checkbox"
              checked={showArchived}
              onChange={(e) => setShowArchived(e.target.checked)}
              className="w-4 h-4 rounded border-parchment/20 accent-accent-gold"
            />
            Show Archived
          </label>

          <div className="flex items-center gap-1">
            <SortAsc className="w-4 h-4 text-parchment/50" />
            <select
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value as CampaignSortKey)}
              className="px-2 py-1 rounded bg-bg-primary border border-parchment/20 text-parchment text-sm focus:outline-none focus:border-accent-gold"
              aria-label="Sort campaigns"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Campaign Grid */}
      {sorted.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sorted.map((campaign) => (
            <CampaignCard
              key={campaign.id}
              campaign={campaign}
              onEdit={onEdit}
              onArchive={onArchive}
              onDelete={onDelete}
              onCopyCode={onCopyCode}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <Scroll className="w-12 h-12 text-parchment/20 mx-auto mb-4" />
          {searchQuery ? (
            <p className="text-parchment/60">
              No campaigns match your search.
            </p>
          ) : (
            <p className="text-parchment/60">
              No campaigns yet. Create your first campaign!
            </p>
          )}
        </div>
      )}
    </div>
  )
}
