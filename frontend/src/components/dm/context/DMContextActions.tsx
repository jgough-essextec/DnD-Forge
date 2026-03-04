/**
 * DMContextActions (Story 38.2)
 *
 * Additional actions shown only in DM context on the character sheet.
 * Provides "Award XP" and "Add to Encounter" buttons, plus a campaign
 * context badge with the campaign name.
 *
 * Hidden entirely in player context.
 */

import { Link } from 'react-router-dom'
import { Award, Swords, Shield } from 'lucide-react'
import { useDMContext } from './DMContextProvider'
import { useUIStore } from '@/stores/uiStore'

interface DMContextActionsProps {
  /** The character ID these actions apply to */
  characterId: string
}

export function DMContextActions({ characterId: _characterId }: DMContextActionsProps) {
  const { isDMView, campaignId, campaignName } = useDMContext()
  const setActiveModal = useUIStore((s) => s.setActiveModal)

  if (!isDMView || !campaignId) {
    return null
  }

  const handleAwardXP = () => {
    setActiveModal('awardXP', { campaignId })
  }

  const handleAddToEncounter = () => {
    setActiveModal('addToEncounter', { campaignId })
  }

  return (
    <div
      className="flex flex-wrap items-center gap-2"
      data-testid="dm-context-actions"
      role="toolbar"
      aria-label="DM Actions"
    >
      {/* Campaign context badge */}
      <Link
        to={`/campaign/${campaignId}`}
        className="inline-flex items-center gap-1.5 rounded-lg border border-accent-gold/20 bg-accent-gold/5 px-2.5 py-1 text-xs text-parchment/70 hover:bg-accent-gold/10 hover:text-accent-gold transition-colors"
        data-testid="campaign-context-badge"
      >
        <Shield className="h-3.5 w-3.5 text-accent-gold" aria-hidden="true" />
        {campaignName}
      </Link>

      {/* Award XP button */}
      <button
        onClick={handleAwardXP}
        className="inline-flex items-center gap-1.5 rounded-lg border border-accent-gold/30 bg-accent-gold/10 px-3 py-1.5 text-sm text-accent-gold hover:bg-accent-gold/20 transition-colors"
        data-testid="award-xp-button"
        aria-label="Award XP"
      >
        <Award className="h-4 w-4" aria-hidden="true" />
        Award XP
      </button>

      {/* Add to Encounter button */}
      <button
        onClick={handleAddToEncounter}
        className="inline-flex items-center gap-1.5 rounded-lg border border-accent-gold/30 bg-accent-gold/10 px-3 py-1.5 text-sm text-accent-gold hover:bg-accent-gold/20 transition-colors"
        data-testid="add-to-encounter-button"
        aria-label="Add to Encounter"
      >
        <Swords className="h-4 w-4" aria-hidden="true" />
        Add to Encounter
      </button>
    </div>
  )
}
