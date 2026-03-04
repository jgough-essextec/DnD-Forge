/**
 * EncounterPage (Epic 35)
 *
 * Full combat tracker page that orchestrates:
 * - Encounter Setup (Story 35.1)
 * - Initiative Rolling (Story 35.2)
 * - Combat Tracker (Story 35.3)
 * - HP & Condition Management (Story 35.4)
 * - Mid-Combat Additions (Story 35.5)
 * - End Encounter & XP Distribution (Story 35.6)
 *
 * Route: /campaign/:id/encounter/:eid
 */

import { useState, useCallback, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Swords } from 'lucide-react'
import { useCampaign } from '@/hooks/useCampaigns'
import { useCharacters } from '@/hooks/useCharacters'
import { useUIStore } from '@/stores/uiStore'
import { createEncounterState, sortByInitiative } from '@/utils/combat'
import type { EncounterState } from '@/utils/combat'
import EncounterSetup from '@/components/dm/combat/EncounterSetup'
import InitiativeRoller from '@/components/dm/combat/InitiativeRoller'
import CombatTracker from '@/components/dm/combat/CombatTracker'
import EndEncounterModal from '@/components/dm/combat/EndEncounterModal'

export default function EncounterPage() {
  const { id: campaignId, eid: encounterId } = useParams<{
    id: string
    eid: string
  }>()
  const navigate = useNavigate()
  const addToast = useUIStore((s) => s.addToast)

  const { data: campaign } = useCampaign(campaignId ?? null)
  const { data: allCharacters } = useCharacters()

  const [encounter, setEncounter] = useState<EncounterState>(() =>
    createEncounterState(
      encounterId ?? `enc-${Date.now()}`,
      campaignId ?? '',
      'Combat Encounter',
    ),
  )
  const [showEndModal, setShowEndModal] = useState(false)

  // Build character data for the encounter setup
  // CharacterSummary has: id, name, race, class, level, hp: {current,max}, ac
  const campaignCharacters = useMemo(() => {
    if (!campaign || !allCharacters) return []
    return allCharacters
      .filter((c) => campaign.characterIds.includes(c.id))
      .map((c) => ({
        id: c.id,
        name: c.name,
        ac: c.ac,
        hp: c.hp.current,
        maxHp: c.hp.max,
        dexterity: 10, // Default; full character fetch would provide actual DEX
        conditions: [] as string[],
      }))
  }, [campaign, allCharacters])

  // Party members for XP distribution
  const partyMembers = useMemo(() => {
    if (!allCharacters || !campaign) return []
    return allCharacters
      .filter((c) => campaign.characterIds.includes(c.id))
      .map((c) => ({
        id: c.id,
        name: c.name,
        currentXP: 0, // XP not available on summary; would need full character fetch
        level: c.level,
      }))
  }, [allCharacters, campaign])

  const handleUpdateEncounter = useCallback((updated: EncounterState) => {
    setEncounter(updated)
  }, [])

  const handleStartInitiative = useCallback(() => {
    setEncounter((prev) => ({
      ...prev,
      phase: 'initiative',
    }))
  }, [])

  const handleConfirmOrder = useCallback(() => {
    setEncounter((prev) => {
      const sorted = sortByInitiative(prev.combatants)
      return {
        ...prev,
        combatants: sorted,
        phase: 'combat',
        currentTurnIndex: 0,
        round: 1,
      }
    })
  }, [])

  const handleBackToSetup = useCallback(() => {
    setEncounter((prev) => ({
      ...prev,
      phase: 'setup',
    }))
  }, [])

  const handleEndEncounter = useCallback(() => {
    setShowEndModal(true)
  }, [])

  const handleApplyXP = useCallback(
    (_xpPerCharacter: Record<string, number>, isMilestone: boolean) => {
      setEncounter((prev) => ({
        ...prev,
        phase: 'ended',
      }))
      setShowEndModal(false)

      addToast({
        message: isMilestone
          ? 'Milestone level up applied!'
          : 'XP distributed to party members.',
        type: 'success',
      })

      // Navigate back to campaign after a brief delay
      setTimeout(() => {
        if (campaignId) {
          navigate(`/campaigns/${campaignId}`)
        }
      }, 1500)
    },
    [addToast, campaignId, navigate],
  )

  return (
    <div className="min-h-screen bg-primary p-4 lg:p-6">
      {/* Navigation header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => {
            if (campaignId) navigate(`/campaigns/${campaignId}`)
          }}
          className="flex items-center gap-1.5 text-sm text-parchment/50 hover:text-parchment/70 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Campaign
        </button>
        <div className="flex items-center gap-2 text-parchment/30">
          <Swords className="w-4 h-4" />
          <span className="text-sm">{campaign?.name ?? 'Campaign'}</span>
        </div>
      </div>

      {/* Phase content */}
      {encounter.phase === 'setup' && (
        <EncounterSetup
          encounter={encounter}
          characters={campaignCharacters}
          onUpdateEncounter={handleUpdateEncounter}
          onStartInitiative={handleStartInitiative}
        />
      )}

      {encounter.phase === 'initiative' && (
        <InitiativeRoller
          encounter={encounter}
          onUpdateEncounter={handleUpdateEncounter}
          onConfirmOrder={handleConfirmOrder}
          onBack={handleBackToSetup}
        />
      )}

      {encounter.phase === 'combat' && (
        <CombatTracker
          encounter={encounter}
          onUpdateEncounter={handleUpdateEncounter}
          onEndEncounter={handleEndEncounter}
        />
      )}

      {encounter.phase === 'ended' && (
        <div className="text-center py-16">
          <Swords className="w-12 h-12 text-accent-gold mx-auto mb-4" />
          <h2 className="text-2xl font-heading text-accent-gold mb-2">
            Encounter Complete
          </h2>
          <p className="text-parchment/60">
            Returning to campaign dashboard...
          </p>
        </div>
      )}

      {/* End encounter modal */}
      {showEndModal && (
        <EndEncounterModal
          encounter={encounter}
          partyMembers={partyMembers}
          onApply={handleApplyXP}
          onClose={() => setShowEndModal(false)}
        />
      )}
    </div>
  )
}
