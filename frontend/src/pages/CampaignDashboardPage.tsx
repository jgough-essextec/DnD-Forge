/**
 * CampaignDashboardPage (Story 34.1, 37.1-37.3)
 *
 * The DM's command center for a campaign. Displays campaign header with
 * tabbed navigation: Party (default), Sessions, Encounters, Notes.
 * The Party tab hosts PartyStatsGrid, SkillMatrix, LanguageCoverage, and PartyComposition.
 *
 * Includes XP Award / Milestone Level Up buttons in the header area
 * and XP Threshold reference below tabs (Story 37.1-37.3).
 */

import { useState, useMemo, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Settings,
  Users,
  Copy,
  Check,
  UserPlus,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Award,
  TrendingUp,
} from 'lucide-react'
import { useCampaign, useJoinCampaign } from '@/hooks/useCampaigns'
import { useCharacters } from '@/hooks/useCharacters'
import { useCampaignCharacters } from '@/hooks/useCampaignCharacters'
import { EditCampaignModal } from '@/components/dm/EditCampaignModal'
import { CharacterPicker } from '@/components/dm/CharacterPicker'
import { useUIStore } from '@/stores/uiStore'
import { formatCampaignDate, CHARACTER_SOFT_CAP } from '@/utils/campaign'
import { DashboardTabs } from '@/components/dm/dashboard/DashboardTabs'
import type { DashboardTab } from '@/components/dm/dashboard/DashboardTabs'
import { PartyStatsGrid } from '@/components/dm/dashboard/PartyStatsGrid'
import { SkillMatrix } from '@/components/dm/dashboard/SkillMatrix'
import { LanguageCoverage } from '@/components/dm/dashboard/LanguageCoverage'
import { PartyComposition } from '@/components/dm/dashboard/PartyComposition'
import { XPAward } from '@/components/dm/xp/XPAward'
import { MilestoneLevelUp } from '@/components/dm/xp/MilestoneLevelUp'
import { XPThresholdTable } from '@/components/dm/xp/XPThresholdTable'
import { updateCharacter } from '@/api/characters'
import { useQueryClient } from '@tanstack/react-query'
import { CHARACTERS_KEY, CHARACTER_KEY } from '@/hooks/useCharacters'
import type { Character } from '@/types/character'

export default function CampaignDashboardPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { data: campaign, isLoading, error } = useCampaign(id ?? null)
  const { data: allCharacters } = useCharacters()
  const joinCampaign = useJoinCampaign()
  const addToast = useUIStore((s) => s.addToast)

  const characterIds = useMemo(
    () => campaign?.characterIds ?? [],
    [campaign?.characterIds]
  )
  const { characters: campaignCharacters, isLoading: charsLoading } =
    useCampaignCharacters(characterIds)

  const [activeTab, setActiveTab] = useState<DashboardTab>('party')
  const [showEdit, setShowEdit] = useState(false)
  const [showCharacterPicker, setShowCharacterPicker] = useState(false)
  const [showXPAward, setShowXPAward] = useState(false)
  const [showMilestoneLevelUp, setShowMilestoneLevelUp] = useState(false)
  const [copied, setCopied] = useState(false)
  const [descriptionExpanded, setDescriptionExpanded] = useState(false)

  const xpTrackingMode = campaign?.settings?.xpTracking ?? 'xp'

  const handleCopyCode = async () => {
    if (!campaign) return
    await navigator.clipboard.writeText(campaign.joinCode)
    setCopied(true)
    addToast({ message: 'Join code copied!', type: 'success' })
    setTimeout(() => setCopied(false), 2000)
  }

  const handleAddCharacters = (selectedIds: string[]) => {
    if (!campaign) return
    const promises = selectedIds.map((charId) =>
      joinCampaign.mutateAsync({
        campaignId: campaign.id,
        joinCode: campaign.joinCode,
        characterId: charId,
      })
    )
    Promise.all(promises)
      .then(() => {
        addToast({
          message: `${selectedIds.length} character${selectedIds.length !== 1 ? 's' : ''} added to campaign!`,
          type: 'success',
        })
        setShowCharacterPicker(false)
      })
      .catch(() => {
        addToast({ message: 'Failed to add some characters.', type: 'error' })
      })
  }

  // Handle XP award application
  const handleApplyXP = useCallback(
    async (xpAmounts: Record<string, number>, reason: string) => {
      const updates = campaignCharacters
        .filter((c) => (xpAmounts[c.id] ?? 0) > 0)
        .map((c) => ({
          id: c.id,
          newXP: c.experiencePoints + (xpAmounts[c.id] ?? 0),
          version: c.version,
        }))

      await Promise.all(
        updates.map((u) =>
          updateCharacter(u.id, { experiencePoints: u.newXP, version: u.version })
        )
      )

      // Invalidate character queries to refresh data
      void queryClient.invalidateQueries({ queryKey: CHARACTERS_KEY })
      for (const u of updates) {
        void queryClient.invalidateQueries({ queryKey: CHARACTER_KEY(u.id) })
      }

      const reasonSuffix = reason ? ` (${reason})` : ''
      addToast({
        message: `XP awarded to ${updates.length} character${updates.length !== 1 ? 's' : ''}${reasonSuffix}`,
        type: 'success',
      })
    },
    [campaignCharacters, queryClient, addToast],
  )

  // Handle milestone level-up application
  const handleMilestoneLevelUp = useCallback(
    async (charIds: string[]) => {
      const targets = campaignCharacters.filter(
        (c) => charIds.includes(c.id) && c.level < 20,
      )

      await Promise.all(
        targets.map((c) =>
          updateCharacter(c.id, {
            level: c.level + 1,
            version: c.version,
          })
        )
      )

      // Invalidate character queries to refresh data
      void queryClient.invalidateQueries({ queryKey: CHARACTERS_KEY })
      for (const c of targets) {
        void queryClient.invalidateQueries({ queryKey: CHARACTER_KEY(c.id) })
      }

      addToast({
        message: `${targets.length} character${targets.length !== 1 ? 's' : ''} leveled up!`,
        type: 'success',
      })
    },
    [campaignCharacters, queryClient, addToast],
  )

  // Characters available to add (not already in campaign)
  const availableCharacters = useMemo(() => {
    if (!campaign || !allCharacters) return []
    return allCharacters.filter(
      (c) => !characterIds.includes(c.id)
    )
  }, [campaign, allCharacters, characterIds])

  // Loading state
  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-parchment/10 rounded w-64" />
          <div className="h-4 bg-parchment/5 rounded w-48" />
          <div className="h-10 bg-parchment/5 rounded-lg" />
          <div className="h-64 bg-parchment/5 rounded-lg" />
        </div>
      </div>
    )
  }

  // Error / not found state
  if (error || !campaign) {
    return (
      <div className="p-8 text-center" data-testid="campaign-not-found">
        <p className="text-red-400 text-lg mb-4">Campaign not found.</p>
        <button
          onClick={() => navigate('/campaigns')}
          className="px-4 py-2 rounded-lg bg-accent-gold/10 border border-accent-gold/30 text-accent-gold hover:bg-accent-gold/20 transition-colors"
        >
          Go to Campaigns
        </button>
      </div>
    )
  }

  const charCount = characterIds.length
  const isAtCap = charCount >= CHARACTER_SOFT_CAP

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <button
          onClick={() => navigate('/campaigns')}
          className="p-1 rounded hover:bg-parchment/10 transition-colors"
          aria-label="Back to campaigns"
        >
          <ArrowLeft className="w-5 h-5 text-parchment/60" />
        </button>
        <h1 className="font-heading text-2xl md:text-3xl text-accent-gold flex-1 truncate">
          {campaign.name}
        </h1>

        {/* XP Award / Milestone Level Up Button */}
        {charCount > 0 && (
          xpTrackingMode === 'xp' ? (
            <button
              onClick={() => setShowXPAward(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-accent-gold/10 border border-accent-gold/30 text-accent-gold hover:bg-accent-gold/20 transition-colors text-sm font-medium"
              aria-label="Award XP"
              data-testid="award-xp-button"
            >
              <Award className="w-4 h-4" />
              <span className="hidden sm:inline">Award XP</span>
            </button>
          ) : (
            <button
              onClick={() => setShowMilestoneLevelUp(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-accent-gold/10 border border-accent-gold/30 text-accent-gold hover:bg-accent-gold/20 transition-colors text-sm font-medium"
              aria-label="Milestone Level Up"
              data-testid="milestone-levelup-button"
            >
              <TrendingUp className="w-4 h-4" />
              <span className="hidden sm:inline">Milestone Level Up</span>
            </button>
          )
        )}

        <button
          onClick={() => setShowEdit(true)}
          className="p-2 rounded-lg border border-parchment/20 hover:bg-parchment/10 transition-colors"
          aria-label="Edit campaign settings"
        >
          <Settings className="w-5 h-5 text-parchment/60" />
        </button>
      </div>

      {/* Description (collapsible) */}
      {campaign.description && (
        <div className="ml-9 mb-4">
          <button
            onClick={() => setDescriptionExpanded(!descriptionExpanded)}
            className="flex items-center gap-1 text-parchment/50 hover:text-parchment/70 text-sm transition-colors"
          >
            {descriptionExpanded ? (
              <ChevronDown className="w-3.5 h-3.5" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5" />
            )}
            <span>Description</span>
          </button>
          {descriptionExpanded && (
            <p className="text-parchment/70 mt-1 text-sm">
              {campaign.description}
            </p>
          )}
        </div>
      )}

      {/* Campaign Info Bar */}
      <div className="flex flex-wrap items-center gap-3 mb-6 ml-9">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-bg-primary border border-parchment/10">
          <Users className="w-4 h-4 text-parchment/50" />
          <span className="text-sm text-parchment">
            {charCount} character{charCount !== 1 ? 's' : ''}
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

        <div className="text-sm text-parchment/50 flex items-center">
          Updated {formatCampaignDate(campaign.updatedAt)}
        </div>

        {isAtCap && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-900/20 border border-amber-500/30">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-xs text-amber-200">At character cap</span>
          </div>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="ml-0 md:ml-9">
        <DashboardTabs activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      {/* XP Threshold Reference (collapsible, below tabs) */}
      {xpTrackingMode === 'xp' && (
        <div className="mt-4 ml-0 md:ml-9">
          <XPThresholdTable />
        </div>
      )}

      {/* Tab Content */}
      <div
        className="mt-6 ml-0 md:ml-9"
        role="tabpanel"
        id={`tabpanel-${activeTab}`}
        aria-labelledby={`tab-${activeTab}`}
      >
        {activeTab === 'party' && (
          <PartyTabContent
            characters={campaignCharacters}
            isLoading={charsLoading}
            onAddCharacter={() => setShowCharacterPicker(true)}
            xpTrackingMode={xpTrackingMode}
          />
        )}
        {activeTab === 'sessions' && (
          <PlaceholderTab label="Sessions" description="Session logs and notes will appear here." />
        )}
        {activeTab === 'encounters' && (
          <PlaceholderTab label="Encounters" description="Combat encounters and initiative tracking will appear here." />
        )}
        {activeTab === 'notes' && (
          <PlaceholderTab label="Notes" description="DM notes and NPC tracking will appear here." />
        )}
      </div>

      {/* Modals */}
      {showEdit && (
        <EditCampaignModal
          isOpen={true}
          onClose={() => setShowEdit(false)}
          campaign={campaign}
        />
      )}

      <CharacterPicker
        isOpen={showCharacterPicker}
        onClose={() => setShowCharacterPicker(false)}
        onSelect={handleAddCharacters}
        characters={availableCharacters}
        currentCharacterCount={charCount}
        isSubmitting={joinCampaign.isPending}
      />

      <XPAward
        isOpen={showXPAward}
        onClose={() => setShowXPAward(false)}
        characters={campaignCharacters}
        onApply={handleApplyXP}
      />

      <MilestoneLevelUp
        isOpen={showMilestoneLevelUp}
        onClose={() => setShowMilestoneLevelUp(false)}
        characters={campaignCharacters}
        onApply={handleMilestoneLevelUp}
      />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Party Tab Content
// ---------------------------------------------------------------------------

interface PartyTabContentProps {
  characters: Character[]
  isLoading: boolean
  onAddCharacter: () => void
  xpTrackingMode: 'xp' | 'milestone'
}

function PartyTabContent({ characters, isLoading: _isLoading, onAddCharacter, xpTrackingMode }: PartyTabContentProps) {
  if (characters.length === 0) {
    return (
      <div
        className="text-center py-12 rounded-lg border border-parchment/10 bg-bg-primary"
        data-testid="empty-party-state"
      >
        <Users className="w-12 h-12 text-parchment/20 mx-auto mb-4" />
        <p className="text-parchment/60 mb-4">
          No characters in this campaign yet. Add characters to get started!
        </p>
        <button
          onClick={onAddCharacter}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent-gold/10 border border-accent-gold/30 text-accent-gold hover:bg-accent-gold/20 transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          Add Character
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Party Stats Grid */}
      <section>
        <h3 className="font-heading text-lg text-parchment mb-3">Party Overview</h3>
        <PartyStatsGrid characters={characters} xpTrackingMode={xpTrackingMode} />
      </section>

      {/* Party Composition */}
      <section>
        <PartyComposition characters={characters} />
      </section>

      {/* Skill Proficiency Matrix */}
      <section>
        <h3 className="font-heading text-lg text-parchment mb-3">
          Skill Proficiency Matrix
        </h3>
        <SkillMatrix characters={characters} />
      </section>

      {/* Language & Tool Coverage */}
      <section>
        <h3 className="font-heading text-lg text-parchment mb-3">
          Language & Tool Coverage
        </h3>
        <LanguageCoverage characters={characters} />
      </section>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Placeholder for tabs that will be filled by other agents
// ---------------------------------------------------------------------------

function PlaceholderTab({
  label,
  description,
}: {
  label: string
  description: string
}) {
  return (
    <div
      className="text-center py-12 rounded-lg border border-dashed border-parchment/10 bg-bg-primary"
      data-testid={`placeholder-${label.toLowerCase()}`}
    >
      <p className="text-parchment/40 text-sm">{description}</p>
    </div>
  )
}
