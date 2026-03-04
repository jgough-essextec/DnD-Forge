/**
 * EndEncounterModal (Story 35.6)
 *
 * Summary modal shown when ending an encounter.
 * Displays rounds elapsed, defeated monsters, XP calculation,
 * and distribution among party members.
 */

import { useState, useMemo } from 'react'
import {
  Trophy,
  Skull,
  Users,
  ArrowUp,
  X,
  Star,
} from 'lucide-react'
import type { EncounterState } from '@/utils/combat'
import {
  getXPForCR,
  calculateXPPerCharacter,
  wouldLevelUp,
} from '@/utils/combat'

interface PartyMember {
  id: string
  name: string
  currentXP: number
  level: number
}

interface EndEncounterModalProps {
  encounter: EncounterState
  partyMembers: PartyMember[]
  onApply: (xpPerCharacter: Record<string, number>, isMilestone: boolean) => void
  onClose: () => void
}

export default function EndEncounterModal({
  encounter,
  partyMembers,
  onApply,
  onClose,
}: EndEncounterModalProps) {
  const [isMilestone, setIsMilestone] = useState(false)
  const [xpAdjustment, setXpAdjustment] = useState(0)
  const [excludedIds, setExcludedIds] = useState<Set<string>>(new Set())

  // Find all defeated monsters
  const defeatedMonsters = useMemo(() => {
    return encounter.combatants.filter(
      (c) => (c.type === 'monster' || c.type === 'npc') && (c.isDefeated || c.loggedXp !== undefined),
    )
  }, [encounter.combatants])

  // Calculate XP from defeated monsters
  const monsterXpBreakdown = useMemo(() => {
    return defeatedMonsters.map((m) => ({
      name: m.name,
      cr: m.cr,
      xp: m.loggedXp ?? (m.cr !== undefined ? getXPForCR(m.cr) : 0),
    }))
  }, [defeatedMonsters])

  const baseXp = monsterXpBreakdown.reduce((sum, m) => sum + m.xp, 0)
  const totalXp = Math.max(0, baseXp + xpAdjustment + encounter.defeatedMonsterXp)

  // Filter eligible party members
  const eligibleMembers = partyMembers.filter((m) => !excludedIds.has(m.id))
  const xpPerMember = calculateXPPerCharacter(totalXp, eligibleMembers.length)

  const toggleExclude = (id: string) => {
    setExcludedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const handleApply = () => {
    const xpDistribution: Record<string, number> = {}
    for (const member of eligibleMembers) {
      xpDistribution[member.id] = isMilestone ? 0 : xpPerMember
    }
    onApply(xpDistribution, isMilestone)
  }

  // Surviving PCs
  const survivingPCs = encounter.combatants.filter(
    (c) => c.type === 'player' && !c.isDefeated,
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-primary border border-parchment/20 rounded-xl shadow-2xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-parchment/10">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-accent-gold" />
            <h2 className="text-lg font-heading text-accent-gold">Encounter Complete</h2>
          </div>
          <button
            onClick={onClose}
            className="text-parchment/40 hover:text-parchment/70 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Summary stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 bg-primary-light/10 rounded-lg">
              <div className="text-2xl font-bold text-accent-gold">{encounter.round}</div>
              <div className="text-xs text-parchment/50">Rounds</div>
            </div>
            <div className="text-center p-3 bg-primary-light/10 rounded-lg">
              <div className="text-2xl font-bold text-red-400">{defeatedMonsters.length}</div>
              <div className="text-xs text-parchment/50">Defeated</div>
            </div>
            <div className="text-center p-3 bg-primary-light/10 rounded-lg">
              <div className="text-2xl font-bold text-blue-400">{survivingPCs.length}</div>
              <div className="text-xs text-parchment/50">Surviving PCs</div>
            </div>
          </div>

          {/* Defeated monsters */}
          {(monsterXpBreakdown.length > 0 || encounter.defeatedMonsterXp > 0) && (
            <div>
              <h3 className="text-sm font-heading text-parchment/70 mb-2 flex items-center gap-1.5">
                <Skull className="w-4 h-4" />
                Defeated Monsters
              </h3>
              <div className="space-y-1">
                {monsterXpBreakdown.map((m, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between text-sm px-3 py-1.5 bg-red-900/10 rounded"
                  >
                    <span className="text-parchment/80">{m.name}</span>
                    <div className="flex items-center gap-2">
                      {m.cr !== undefined && (
                        <span className="text-xs text-parchment/40">
                          CR {m.cr}
                        </span>
                      )}
                      <span className="text-accent-gold font-mono text-xs">
                        {m.xp.toLocaleString()} XP
                      </span>
                    </div>
                  </div>
                ))}
                {encounter.defeatedMonsterXp > 0 && (
                  <div className="flex items-center justify-between text-sm px-3 py-1.5 bg-red-900/10 rounded">
                    <span className="text-parchment/80 italic">Previously logged</span>
                    <span className="text-accent-gold font-mono text-xs">
                      {encounter.defeatedMonsterXp.toLocaleString()} XP
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Milestone toggle */}
          <div className="flex items-center gap-3 p-3 bg-primary-light/10 rounded-lg">
            <label className="flex items-center gap-2 text-sm text-parchment/70 cursor-pointer flex-1">
              <input
                type="checkbox"
                checked={isMilestone}
                onChange={(e) => setIsMilestone(e.target.checked)}
                className="rounded border-parchment/30 bg-primary-light/30 text-accent-gold focus:ring-accent-gold"
              />
              <Star className="w-4 h-4 text-accent-gold" />
              Award Milestone Level Instead
            </label>
          </div>

          {/* XP Distribution */}
          {!isMilestone && (
            <div>
              <h3 className="text-sm font-heading text-parchment/70 mb-2 flex items-center gap-1.5">
                <Users className="w-4 h-4" />
                XP Distribution
              </h3>

              {/* XP adjustment */}
              <div className="flex items-center gap-2 mb-3">
                <label className="text-xs text-parchment/50">Total XP:</label>
                <span className="font-mono text-accent-gold">{totalXp.toLocaleString()}</span>
                <label htmlFor="xp-adjust" className="text-xs text-parchment/50 ml-2">Adjust:</label>
                <input
                  id="xp-adjust"
                  type="number"
                  value={xpAdjustment}
                  onChange={(e) => setXpAdjustment(parseInt(e.target.value) || 0)}
                  className="w-20 px-2 py-1 bg-primary-light/30 border border-parchment/20 rounded text-xs text-parchment text-center focus:border-accent-gold focus:outline-none"
                />
              </div>

              {/* Per-character breakdown */}
              <div className="space-y-1.5">
                {partyMembers.map((member) => {
                  const isExcluded = excludedIds.has(member.id)
                  const willLevelUp = !isExcluded && wouldLevelUp(member.currentXP, xpPerMember, member.level)

                  return (
                    <div
                      key={member.id}
                      className={`flex items-center gap-3 px-3 py-2 rounded ${
                        isExcluded ? 'bg-primary-light/5 opacity-50' : 'bg-blue-900/10'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={!isExcluded}
                        onChange={() => toggleExclude(member.id)}
                        className="rounded border-parchment/30 bg-primary-light/30 text-accent-gold focus:ring-accent-gold"
                        aria-label={`Include ${member.name} in XP split`}
                      />
                      <span className={`flex-1 text-sm ${isExcluded ? 'text-parchment/40 line-through' : 'text-parchment/80'}`}>
                        {member.name}
                      </span>
                      {!isExcluded && (
                        <div className="text-right">
                          <span className="text-xs font-mono text-accent-gold">
                            +{xpPerMember.toLocaleString()} XP
                          </span>
                          {willLevelUp && (
                            <div className="flex items-center gap-0.5 text-[10px] text-green-400 font-medium">
                              <ArrowUp className="w-3 h-3" />
                              Level {member.level + 1}!
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              <div className="mt-2 text-right text-xs text-parchment/40">
                {xpPerMember.toLocaleString()} XP each ({eligibleMembers.length} member{eligibleMembers.length !== 1 ? 's' : ''})
              </div>
            </div>
          )}

          {/* Milestone info */}
          {isMilestone && (
            <div className="p-3 bg-accent-gold/10 border border-accent-gold/20 rounded-lg">
              <p className="text-sm text-accent-gold">
                All eligible party members will advance one level.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-5 border-t border-parchment/10">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-sm text-parchment/60 bg-primary-light/20 rounded-lg hover:bg-primary-light/30 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            className="flex-1 px-4 py-2 text-sm bg-accent-gold text-primary font-bold rounded-lg hover:bg-accent-gold/90 transition-colors"
          >
            {isMilestone ? 'Apply Milestone' : 'Apply & Save'}
          </button>
        </div>
      </div>
    </div>
  )
}
