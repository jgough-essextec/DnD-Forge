/**
 * JoinCampaignPage (Story 38.3)
 *
 * Enhanced join campaign flow with:
 * - Auto-fill join code from URL parameter /join/:code
 * - Format validation (6 uppercase alphanumeric)
 * - API validation against backend (campaign lookup by code)
 * - Campaign name + description display on match
 * - Character selection (filtered to characters not in a campaign)
 * - Success state with link to campaign view
 * - Loading states and error handling
 */

import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  LogIn,
  ChevronDown,
  Search,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Scroll,
  Users,
} from 'lucide-react'
import { useJoinCampaign, useLookupCampaignByCode } from '@/hooks/useCampaigns'
import { useCharacters } from '@/hooks/useCharacters'
import { useUIStore } from '@/stores/uiStore'

// ---------------------------------------------------------------------------
// Join Code Validation
// ---------------------------------------------------------------------------

/** Validate that a join code is 6 uppercase alphanumeric characters */
export function isValidJoinCode(code: string): boolean {
  return /^[A-Z0-9]{6}$/.test(code)
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

type JoinStep = 'enter-code' | 'select-character' | 'success'

export default function JoinCampaignPage() {
  const { code } = useParams<{ code: string }>()
  const navigate = useNavigate()
  const { data: characters, isLoading: loadingChars } = useCharacters()
  const joinCampaign = useJoinCampaign()
  const addToast = useUIStore((s) => s.addToast)

  const [joinCode, setJoinCode] = useState(code?.toUpperCase() ?? '')
  const [selectedCharacterId, setSelectedCharacterId] = useState('')
  const [step, setStep] = useState<JoinStep>('enter-code')
  const [joinedCampaignName, setJoinedCampaignName] = useState('')
  const [joinedCharacterName, setJoinedCharacterName] = useState('')
  const [joinedCampaignId, setJoinedCampaignId] = useState('')
  const [lookupCode, setLookupCode] = useState<string | null>(null)

  // API lookup for campaign by join code
  const {
    data: matchedCampaign,
    isLoading: lookingUp,
    error: lookupError,
  } = useLookupCampaignByCode(lookupCode)

  // Auto-trigger lookup when join code from URL param is valid
  useEffect(() => {
    if (code && isValidJoinCode(code.toUpperCase())) {
      setLookupCode(code.toUpperCase())
    }
  }, [code])

  // Filter out characters that already belong to a campaign
  const availableCharacters = (characters ?? []).filter(
    (c) => !('campaignId' in c && c.campaignId)
  )

  const handleLookup = () => {
    const normalized = joinCode.trim().toUpperCase()
    if (!isValidJoinCode(normalized)) {
      addToast({
        message: 'Join code must be 6 uppercase alphanumeric characters.',
        type: 'error',
      })
      return
    }
    setLookupCode(normalized)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleLookup()
    }
  }

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault()
    if (!matchedCampaign || !selectedCharacterId) return

    joinCampaign.mutate(
      {
        campaignId: matchedCampaign.id,
        joinCode: joinCode.trim().toUpperCase(),
        characterId: selectedCharacterId,
      },
      {
        onSuccess: () => {
          const charName =
            availableCharacters.find((c) => c.id === selectedCharacterId)
              ?.name ?? 'Your character'

          setJoinedCampaignName(matchedCampaign.name)
          setJoinedCharacterName(charName)
          setJoinedCampaignId(matchedCampaign.id)
          setStep('success')
          addToast({
            message: `Successfully joined ${matchedCampaign.name}!`,
            type: 'success',
          })
        },
        onError: () => {
          addToast({
            message: 'Failed to join campaign. Check the code and try again.',
            type: 'error',
          })
        },
      }
    )
  }

  // Move to character selection once campaign is matched
  const handleProceedToCharacterSelect = () => {
    if (matchedCampaign) {
      setStep('select-character')
    }
  }

  // ---------------------------------------------------------------------------
  // Success state
  // ---------------------------------------------------------------------------

  if (step === 'success') {
    return (
      <div className="p-8 max-w-md mx-auto text-center" data-testid="join-success">
        <div className="mb-6">
          <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto mb-4" />
          <h1 className="font-heading text-3xl text-accent-gold mb-3">
            Welcome to the Party!
          </h1>
          <p className="text-parchment/80 text-lg">
            You&apos;ve joined{' '}
            <span className="font-semibold text-accent-gold">
              {joinedCampaignName}
            </span>
            ! Your character{' '}
            <span className="font-semibold text-parchment">
              {joinedCharacterName}
            </span>{' '}
            is part of the party.
          </p>
        </div>

        <div className="space-y-3">
          <Link
            to={`/campaign/${joinedCampaignId}`}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-accent-gold text-bg-primary font-semibold hover:bg-accent-gold/90 transition-colors"
          >
            <Users className="w-5 h-5" />
            View Campaign
          </Link>
          <button
            onClick={() => navigate('/')}
            className="w-full px-4 py-3 rounded-lg border border-parchment/20 text-parchment/70 hover:bg-parchment/10 transition-colors"
          >
            Back to Characters
          </button>
        </div>
      </div>
    )
  }

  // ---------------------------------------------------------------------------
  // Character selection step
  // ---------------------------------------------------------------------------

  if (step === 'select-character' && matchedCampaign) {
    return (
      <div className="p-8 max-w-md mx-auto" data-testid="character-select-step">
        <h1 className="font-heading text-3xl text-accent-gold mb-2">
          Join {matchedCampaign.name}
        </h1>
        <p className="text-parchment/70 mb-6">
          Select a character to add to this campaign.
        </p>

        {/* Campaign info card */}
        <div className="mb-6 rounded-lg border border-accent-gold/20 bg-accent-gold/5 p-4">
          <h2 className="font-heading text-lg text-accent-gold mb-1">
            {matchedCampaign.name}
          </h2>
          {matchedCampaign.description && (
            <p className="text-parchment/60 text-sm">
              {matchedCampaign.description}
            </p>
          )}
          {matchedCampaign.settings?.houseRules && (
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-bg-primary px-2.5 py-0.5 text-xs text-parchment/60 border border-parchment/10">
                <Scroll className="w-3 h-3" />
                Lv{matchedCampaign.settings.houseRules.startingLevel} start
              </span>
              {matchedCampaign.settings.houseRules.allowFeats && (
                <span className="rounded-full bg-bg-primary px-2.5 py-0.5 text-xs text-parchment/60 border border-parchment/10">
                  Feats allowed
                </span>
              )}
              {matchedCampaign.settings.houseRules.allowMulticlass && (
                <span className="rounded-full bg-bg-primary px-2.5 py-0.5 text-xs text-parchment/60 border border-parchment/10">
                  Multiclass allowed
                </span>
              )}
            </div>
          )}
        </div>

        <form onSubmit={handleJoin} className="space-y-6">
          <div>
            <label
              htmlFor="character-select"
              className="block text-sm font-medium text-parchment mb-1"
            >
              Character
            </label>
            <div className="relative">
              <select
                id="character-select"
                value={selectedCharacterId}
                onChange={(e) => setSelectedCharacterId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-bg-primary border border-parchment/20 text-parchment focus:outline-none focus:border-accent-gold appearance-none"
                required
                disabled={loadingChars}
                aria-label="Select a character to join the campaign"
              >
                <option value="">
                  {loadingChars
                    ? 'Loading characters...'
                    : 'Select a character'}
                </option>
                {availableCharacters.map((char) => (
                  <option key={char.id} value={char.id}>
                    {char.name} (Lv{char.level} {char.race} {char.class})
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-parchment/40 pointer-events-none" />
            </div>
            {availableCharacters.length === 0 && !loadingChars && (
              <p className="mt-2 text-sm text-parchment/50">
                No available characters. All your characters are already in a
                campaign, or you need to create a new one.
              </p>
            )}
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep('enter-code')}
              className="flex-1 px-4 py-3 rounded-lg border border-parchment/20 text-parchment/70 hover:bg-parchment/10 transition-colors"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={
                !selectedCharacterId || joinCampaign.isPending
              }
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-accent-gold text-bg-primary font-semibold hover:bg-accent-gold/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <LogIn className="w-5 h-5" />
              {joinCampaign.isPending ? 'Joining...' : 'Join Campaign'}
            </button>
          </div>
        </form>
      </div>
    )
  }

  // ---------------------------------------------------------------------------
  // Enter code step (default)
  // ---------------------------------------------------------------------------

  return (
    <div className="p-8 max-w-md mx-auto" data-testid="enter-code-step">
      <h1 className="font-heading text-3xl text-accent-gold mb-2">
        Join Campaign
      </h1>
      <p className="text-parchment/70 mb-8">
        Enter the 6-character join code provided by your Dungeon Master.
      </p>

      <div className="space-y-6">
        {/* Join Code Input */}
        <div>
          <label
            htmlFor="join-code"
            className="block text-sm font-medium text-parchment mb-1"
          >
            Join Code
          </label>
          <div className="flex gap-2">
            <input
              id="join-code"
              type="text"
              value={joinCode}
              onChange={(e) => {
                const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '')
                setJoinCode(val)
                // Clear previous lookup if code changes
                if (val !== lookupCode) {
                  setLookupCode(null)
                }
              }}
              onKeyDown={handleKeyDown}
              placeholder="ABC123"
              maxLength={6}
              className="flex-1 px-3 py-2 rounded-lg bg-bg-primary border border-parchment/20 text-parchment placeholder:text-parchment/40 focus:outline-none focus:border-accent-gold font-mono text-lg tracking-widest text-center uppercase"
              aria-label="6-character join code"
              aria-describedby="join-code-hint"
            />
            <button
              type="button"
              onClick={handleLookup}
              disabled={joinCode.length !== 6 || lookingUp}
              className="px-4 py-2 rounded-lg bg-accent-gold/10 border border-accent-gold/30 text-accent-gold hover:bg-accent-gold/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Look up campaign"
            >
              {lookingUp ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Search className="w-5 h-5" />
              )}
            </button>
          </div>
          <p
            id="join-code-hint"
            className="mt-1 text-xs text-parchment/40"
          >
            6 uppercase letters and numbers (e.g., ABC123)
          </p>
        </div>

        {/* Loading state */}
        {lookingUp && (
          <div className="flex items-center gap-2 text-parchment/60" data-testid="lookup-loading">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Looking up campaign...</span>
          </div>
        )}

        {/* Error state */}
        {lookupError && !lookingUp && (
          <div
            className="flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3"
            data-testid="lookup-error"
            role="alert"
          >
            <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-red-300">
              Campaign not found. Please check the code and try again.
            </p>
          </div>
        )}

        {/* Campaign found - show details */}
        {matchedCampaign && !lookingUp && (
          <div
            className="rounded-lg border border-accent-gold/30 bg-accent-gold/5 p-4"
            data-testid="campaign-match"
          >
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h2 className="font-heading text-lg text-accent-gold">
                  {matchedCampaign.name}
                </h2>
                {matchedCampaign.description && (
                  <p className="text-parchment/60 text-sm mt-1">
                    {matchedCampaign.description}
                  </p>
                )}
                {matchedCampaign.settings?.houseRules && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-bg-primary px-2.5 py-0.5 text-xs text-parchment/60 border border-parchment/10">
                      <Scroll className="w-3 h-3" />
                      Lv{matchedCampaign.settings.houseRules.startingLevel}{' '}
                      start
                    </span>
                    {matchedCampaign.characterIds && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-bg-primary px-2.5 py-0.5 text-xs text-parchment/60 border border-parchment/10">
                        <Users className="w-3 h-3" />
                        {matchedCampaign.characterIds.length} characters
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={handleProceedToCharacterSelect}
              className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-accent-gold text-bg-primary font-semibold hover:bg-accent-gold/90 transition-colors"
            >
              <LogIn className="w-5 h-5" />
              Continue to Join
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
