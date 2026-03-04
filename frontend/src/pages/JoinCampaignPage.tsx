import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { LogIn, ChevronDown } from 'lucide-react'
import { useJoinCampaign } from '@/hooks/useCampaigns'
import { useCharacters } from '@/hooks/useCharacters'
import { useUIStore } from '@/stores/uiStore'

export default function JoinCampaignPage() {
  const { code } = useParams<{ code: string }>()
  const navigate = useNavigate()
  const { data: characters, isLoading: loadingChars } = useCharacters()
  const joinCampaign = useJoinCampaign()
  const addToast = useUIStore((s) => s.addToast)

  const [joinCode, setJoinCode] = useState(code ?? '')
  const [campaignId, setCampaignId] = useState('')
  const [selectedCharacterId, setSelectedCharacterId] = useState('')

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault()
    if (!joinCode.trim() || !selectedCharacterId || !campaignId.trim()) return

    joinCampaign.mutate(
      {
        campaignId: campaignId.trim(),
        joinCode: joinCode.trim().toUpperCase(),
        characterId: selectedCharacterId,
      },
      {
        onSuccess: () => {
          addToast({ message: 'Successfully joined the campaign!', type: 'success' })
          navigate(`/campaign/${campaignId}`)
        },
        onError: () => {
          addToast({ message: 'Failed to join campaign. Check the code and try again.', type: 'error' })
        },
      }
    )
  }

  // Filter out characters that are already in a campaign
  const availableCharacters = (characters ?? []).filter(
    (c) => !('campaignId' in c)
  )

  return (
    <div className="p-8 max-w-md mx-auto">
      <h1 className="font-heading text-3xl text-accent-gold mb-2">
        Join Campaign
      </h1>
      <p className="text-parchment/70 mb-8">
        Enter the campaign ID and join code provided by your Dungeon Master.
      </p>

      <form onSubmit={handleJoin} className="space-y-6">
        <div>
          <label
            htmlFor="campaign-id"
            className="block text-sm font-medium text-parchment mb-1"
          >
            Campaign ID
          </label>
          <input
            id="campaign-id"
            type="text"
            value={campaignId}
            onChange={(e) => setCampaignId(e.target.value)}
            placeholder="Campaign UUID"
            className="w-full px-3 py-2 rounded-lg bg-bg-primary border border-parchment/20 text-parchment placeholder:text-parchment/40 focus:outline-none focus:border-accent-gold"
            required
          />
        </div>

        <div>
          <label
            htmlFor="join-code"
            className="block text-sm font-medium text-parchment mb-1"
          >
            Join Code
          </label>
          <input
            id="join-code"
            type="text"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            placeholder="ABC123"
            maxLength={6}
            className="w-full px-3 py-2 rounded-lg bg-bg-primary border border-parchment/20 text-parchment placeholder:text-parchment/40 focus:outline-none focus:border-accent-gold font-mono text-lg tracking-widest text-center uppercase"
            required
          />
        </div>

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
            >
              <option value="">
                {loadingChars ? 'Loading characters...' : 'Select a character'}
              </option>
              {availableCharacters.map((char) => (
                <option key={char.id} value={char.id}>
                  {char.name} (Lv{char.level} {char.race} {char.class})
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-parchment/40 pointer-events-none" />
          </div>
        </div>

        <button
          type="submit"
          disabled={!joinCode.trim() || !selectedCharacterId || !campaignId.trim() || joinCampaign.isPending}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-accent-gold text-bg-primary font-semibold hover:bg-accent-gold/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <LogIn className="w-5 h-5" />
          {joinCampaign.isPending ? 'Joining...' : 'Join Campaign'}
        </button>
      </form>
    </div>
  )
}
