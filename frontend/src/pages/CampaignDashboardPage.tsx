import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Settings,
  Users,
  Copy,
  Check,
  UserMinus,
  UserPlus,
  AlertTriangle,
} from 'lucide-react'
import { useCampaign, useRemoveCharacter } from '@/hooks/useCampaigns'
import { useCharacters } from '@/hooks/useCharacters'
import { EditCampaignModal } from '@/components/dm/EditCampaignModal'
import { CharacterPicker } from '@/components/dm/CharacterPicker'
import { useUIStore } from '@/stores/uiStore'
import { useJoinCampaign } from '@/hooks/useCampaigns'
import { formatCampaignDate, CHARACTER_SOFT_CAP } from '@/utils/campaign'

export default function CampaignDashboardPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: campaign, isLoading, error } = useCampaign(id ?? null)
  const { data: allCharacters } = useCharacters()
  const removeCharacter = useRemoveCharacter()
  const joinCampaign = useJoinCampaign()
  const addToast = useUIStore((s) => s.addToast)

  const [showEdit, setShowEdit] = useState(false)
  const [showCharacterPicker, setShowCharacterPicker] = useState(false)
  const [copied, setCopied] = useState(false)
  const [removingCharacterId, setRemovingCharacterId] = useState<string | null>(null)

  const handleCopyCode = async () => {
    if (!campaign) return
    await navigator.clipboard.writeText(campaign.joinCode)
    setCopied(true)
    addToast({ message: 'Join code copied!', type: 'success' })
    setTimeout(() => setCopied(false), 2000)
  }

  const handleRemoveCharacter = (characterId: string) => {
    if (!campaign) return
    removeCharacter.mutate(
      { campaignId: campaign.id, characterId },
      {
        onSuccess: () => {
          addToast({ message: 'Character removed from campaign.', type: 'success' })
          setRemovingCharacterId(null)
        },
        onError: () => {
          addToast({ message: 'Failed to remove character.', type: 'error' })
        },
      }
    )
  }

  const handleAddCharacters = (characterIds: string[]) => {
    if (!campaign) return
    // Use the join action for each character
    const promises = characterIds.map((charId) =>
      joinCampaign.mutateAsync({
        campaignId: campaign.id,
        joinCode: campaign.joinCode,
        characterId: charId,
      })
    )
    Promise.all(promises)
      .then(() => {
        addToast({
          message: `${characterIds.length} character${characterIds.length !== 1 ? 's' : ''} added to campaign!`,
          type: 'success',
        })
        setShowCharacterPicker(false)
      })
      .catch(() => {
        addToast({ message: 'Failed to add some characters.', type: 'error' })
      })
  }

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-parchment/10 rounded w-64" />
          <div className="h-32 bg-parchment/5 rounded-lg" />
        </div>
      </div>
    )
  }

  if (error || !campaign) {
    return (
      <div className="p-8">
        <p className="text-red-400">Campaign not found.</p>
        <button
          onClick={() => navigate('/campaigns')}
          className="mt-4 text-accent-gold hover:text-accent-gold/80"
        >
          Back to Campaigns
        </button>
      </div>
    )
  }

  // Characters available to add: not already in any campaign
  const availableCharacters = (allCharacters ?? []).filter(
    (c) => !campaign.characterIds?.includes(c.id)
  )

  const campaignCharacters = campaign.characterIds ?? []
  const isAtCap = campaignCharacters.length >= CHARACTER_SOFT_CAP

  // Type helper for rendering character data from the campaign
  const characterEntries = campaignCharacters.map((charId) => {
    const char = allCharacters?.find((c) => c.id === charId)
    return { id: charId, name: char?.name ?? 'Unknown', race: char?.race ?? '', className: char?.class ?? '', level: char?.level ?? 0 }
  })

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <button
          onClick={() => navigate('/campaigns')}
          className="p-1 rounded hover:bg-parchment/10 transition-colors"
          aria-label="Back to campaigns"
        >
          <ArrowLeft className="w-5 h-5 text-parchment/60" />
        </button>
        <h1 className="font-heading text-3xl text-accent-gold flex-1">
          {campaign.name}
        </h1>
        <button
          onClick={() => setShowEdit(true)}
          className="p-2 rounded-lg border border-parchment/20 hover:bg-parchment/10 transition-colors"
          aria-label="Edit campaign settings"
        >
          <Settings className="w-5 h-5 text-parchment/60" />
        </button>
      </div>

      {campaign.description && (
        <p className="text-parchment/70 mb-6 ml-9">{campaign.description}</p>
      )}

      {/* Campaign Info Bar */}
      <div className="flex flex-wrap gap-4 mb-8 ml-9">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-bg-primary border border-parchment/10">
          <Users className="w-4 h-4 text-parchment/50" />
          <span className="text-sm text-parchment">
            {campaignCharacters.length} character{campaignCharacters.length !== 1 ? 's' : ''}
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
      </div>

      {/* Characters Section */}
      <div className="ml-9">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading text-xl text-parchment flex items-center gap-2">
            <Users className="w-5 h-5" />
            Characters
          </h2>
          <button
            onClick={() => setShowCharacterPicker(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-accent-gold/10 border border-accent-gold/30 text-accent-gold text-sm hover:bg-accent-gold/20 transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            Add Character
          </button>
        </div>

        {isAtCap && (
          <div className="mb-4 p-3 rounded-lg bg-amber-900/20 border border-amber-500/30 flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-200">
              This campaign has {campaignCharacters.length} characters, which is at or above
              the recommended limit of {CHARACTER_SOFT_CAP}.
            </p>
          </div>
        )}

        {characterEntries.length === 0 ? (
          <div className="text-center py-8 rounded-lg border border-parchment/10 bg-bg-primary">
            <Users className="w-10 h-10 text-parchment/20 mx-auto mb-3" />
            <p className="text-parchment/60">
              No characters yet. Add characters to this campaign or share the
              join code.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {characterEntries.map((char) => (
              <div
                key={char.id}
                className="flex items-center justify-between p-3 rounded-lg bg-bg-primary border border-parchment/10"
              >
                <div>
                  <p className="text-sm font-medium text-parchment">
                    {char.name}
                  </p>
                  <p className="text-xs text-parchment/60">
                    {char.level > 0
                      ? `Level ${char.level} ${char.race} ${char.className}`
                      : 'Character details loading...'}
                  </p>
                </div>
                <div>
                  {removingCharacterId === char.id ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-amber-200">Remove?</span>
                      <button
                        onClick={() => handleRemoveCharacter(char.id)}
                        disabled={removeCharacter.isPending}
                        className="px-2 py-1 rounded text-xs bg-red-600 text-white hover:bg-red-700 transition-colors"
                      >
                        Yes
                      </button>
                      <button
                        onClick={() => setRemovingCharacterId(null)}
                        className="px-2 py-1 rounded text-xs border border-parchment/20 text-parchment hover:bg-parchment/10 transition-colors"
                      >
                        No
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setRemovingCharacterId(char.id)}
                      className="p-1.5 rounded hover:bg-red-400/10 transition-colors"
                      aria-label={`Remove ${char.name} from campaign`}
                    >
                      <UserMinus className="w-4 h-4 text-parchment/40 hover:text-red-400" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
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
        currentCharacterCount={campaignCharacters.length}
        isSubmitting={joinCampaign.isPending}
      />
    </div>
  )
}
