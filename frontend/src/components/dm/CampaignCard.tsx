import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  MoreVertical,
  Edit,
  Archive,
  Trash2,
  Download,
  Copy,
  Users,
  Calendar,
} from 'lucide-react'
import type { Campaign } from '@/types/campaign'
import { truncateDescription, formatCampaignDate } from '@/utils/campaign'

interface CampaignCardProps {
  campaign: Campaign
  onEdit: (campaign: Campaign) => void
  onArchive: (campaign: Campaign) => void
  onDelete: (campaign: Campaign) => void
  onCopyCode: (campaign: Campaign) => void
}

export function CampaignCard({
  campaign,
  onEdit,
  onArchive,
  onDelete,
  onCopyCode,
}: CampaignCardProps) {
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [menuOpen])

  const handleCardClick = () => {
    navigate(`/campaign/${campaign.id}`)
  }

  const handleMenuAction = (
    action: (campaign: Campaign) => void,
    e: React.MouseEvent
  ) => {
    e.stopPropagation()
    setMenuOpen(false)
    action(campaign)
  }

  const playerCount = campaign.characterIds?.length ?? campaign.characterCount ?? 0

  return (
    <div
      className={`relative rounded-lg border-2 bg-bg-secondary cursor-pointer transition-all hover:border-accent-gold/40 hover:shadow-lg hover:shadow-accent-gold/5 ${
        campaign.isArchived
          ? 'border-parchment/10 opacity-60'
          : 'border-parchment/20'
      }`}
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      aria-label={`Campaign: ${campaign.name}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter') handleCardClick()
      }}
    >
      {/* Archived badge */}
      {campaign.isArchived && (
        <div className="absolute top-2 right-12 px-2 py-0.5 rounded text-xs bg-parchment/10 text-parchment/60">
          Archived
        </div>
      )}

      {/* Kebab menu */}
      <div ref={menuRef} className="absolute top-2 right-2">
        <button
          onClick={(e) => {
            e.stopPropagation()
            setMenuOpen(!menuOpen)
          }}
          className="p-1.5 rounded hover:bg-parchment/10 transition-colors"
          aria-label="Campaign actions"
        >
          <MoreVertical className="w-4 h-4 text-parchment/60" />
        </button>

        {menuOpen && (
          <div className="absolute right-0 mt-1 w-44 rounded-lg border border-parchment/20 bg-bg-secondary shadow-xl z-10">
            <button
              onClick={(e) => handleMenuAction(onEdit, e)}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-parchment hover:bg-parchment/10 transition-colors"
            >
              <Edit className="w-4 h-4" /> Edit
            </button>
            <button
              onClick={(e) => handleMenuAction(onArchive, e)}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-parchment hover:bg-parchment/10 transition-colors"
            >
              <Archive className="w-4 h-4" />
              {campaign.isArchived ? 'Unarchive' : 'Archive'}
            </button>
            <button
              onClick={(e) => handleMenuAction(onCopyCode, e)}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-parchment hover:bg-parchment/10 transition-colors"
            >
              <Copy className="w-4 h-4" /> Copy Join Code
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                setMenuOpen(false)
              }}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-parchment hover:bg-parchment/10 transition-colors"
            >
              <Download className="w-4 h-4" /> Export
            </button>
            <div className="border-t border-parchment/10" />
            <button
              onClick={(e) => handleMenuAction(onDelete, e)}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-400 hover:bg-red-400/10 transition-colors"
            >
              <Trash2 className="w-4 h-4" /> Delete
            </button>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-4">
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
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {formatCampaignDate(campaign.updatedAt)}
          </span>
        </div>
      </div>
    </div>
  )
}
