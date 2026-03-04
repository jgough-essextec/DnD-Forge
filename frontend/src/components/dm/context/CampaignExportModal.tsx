/**
 * CampaignExportModal (Story 38.4)
 *
 * Modal with two export options:
 * - "Full Export (DM)" — includes all data, DM notes, NPCs, sessions
 * - "Player-Safe Export" — excludes DM-only content
 *
 * Triggers download with proper filename format.
 */

import { useState } from 'react'
import { Download, Shield, Users, X, FileJson } from 'lucide-react'
import type { Campaign } from '@/types/campaign'
import type { Character } from '@/types/character'
import {
  exportCampaign,
  exportCampaignPlayerSafe,
  generateExportFilename,
  downloadCampaignExport,
} from '@/utils/campaign-export'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface CampaignExportModalProps {
  isOpen: boolean
  onClose: () => void
  campaign: Campaign
  characters: Character[]
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function CampaignExportModal({
  isOpen,
  onClose,
  campaign,
  characters,
}: CampaignExportModalProps) {
  const [exporting, setExporting] = useState(false)

  if (!isOpen) return null

  const handleFullExport = () => {
    setExporting(true)
    try {
      const data = exportCampaign(campaign, characters)
      const filename = generateExportFilename(campaign.name)
      downloadCampaignExport(data, filename)
    } finally {
      setExporting(false)
      onClose()
    }
  }

  const handlePlayerSafeExport = () => {
    setExporting(true)
    try {
      const data = exportCampaignPlayerSafe(campaign, characters)
      const filename = generateExportFilename(campaign.name).replace(
        '_Campaign_Export_',
        '_Player_Export_'
      )
      downloadCampaignExport(data, filename)
    } finally {
      setExporting(false)
      onClose()
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="export-modal-title"
      data-testid="campaign-export-modal"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal content */}
      <div className="relative z-10 w-full max-w-md rounded-xl border border-parchment/20 bg-bg-secondary p-6 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FileJson className="w-5 h-5 text-accent-gold" />
            <h2
              id="export-modal-title"
              className="font-heading text-xl text-accent-gold"
            >
              Export Campaign
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-parchment/10 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-parchment/60" />
          </button>
        </div>

        <p className="text-parchment/60 text-sm mb-6">
          Choose an export format for &quot;{campaign.name}&quot;.
        </p>

        {/* Export options */}
        <div className="space-y-3">
          {/* Full Export */}
          <button
            onClick={handleFullExport}
            disabled={exporting}
            className="w-full flex items-start gap-3 p-4 rounded-lg border border-parchment/20 bg-bg-primary hover:border-accent-gold/30 hover:bg-accent-gold/5 transition-colors text-left disabled:opacity-50"
            data-testid="full-export-button"
          >
            <Shield className="w-5 h-5 text-accent-gold mt-0.5 flex-shrink-0" />
            <div>
              <span className="block font-semibold text-parchment">
                Full Export (DM)
              </span>
              <span className="block text-xs text-parchment/50 mt-0.5">
                All campaign data including DM notes, NPCs, and session notes.
                For backup and sharing with co-DMs.
              </span>
            </div>
            <Download className="w-4 h-4 text-parchment/40 mt-0.5 flex-shrink-0 ml-auto" />
          </button>

          {/* Player-Safe Export */}
          <button
            onClick={handlePlayerSafeExport}
            disabled={exporting}
            className="w-full flex items-start gap-3 p-4 rounded-lg border border-parchment/20 bg-bg-primary hover:border-accent-gold/30 hover:bg-accent-gold/5 transition-colors text-left disabled:opacity-50"
            data-testid="player-safe-export-button"
          >
            <Users className="w-5 h-5 text-accent-gold mt-0.5 flex-shrink-0" />
            <div>
              <span className="block font-semibold text-parchment">
                Player-Safe Export
              </span>
              <span className="block text-xs text-parchment/50 mt-0.5">
                Campaign metadata and characters only. Excludes DM notes, NPC
                data, and DM-only session notes. Safe to share with players.
              </span>
            </div>
            <Download className="w-4 h-4 text-parchment/40 mt-0.5 flex-shrink-0 ml-auto" />
          </button>
        </div>

        {/* Cancel */}
        <button
          onClick={onClose}
          className="mt-4 w-full px-4 py-2 rounded-lg border border-parchment/20 text-parchment/60 hover:bg-parchment/10 text-sm transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
