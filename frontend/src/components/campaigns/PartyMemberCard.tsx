import { useNavigate } from 'react-router-dom'
import { Heart, Shield } from 'lucide-react'
import type { PartyMember } from '@/types/campaign'

interface PartyMemberCardProps {
  member: PartyMember
  campaignId?: string
  isCurrentUser?: boolean
}

export function PartyMemberCard({ member, campaignId, isCurrentUser = false }: PartyMemberCardProps) {
  const navigate = useNavigate()

  const handleClick = () => {
    const url = campaignId
      ? `/character/${member.id}?from=${campaignId}`
      : `/character/${member.id}`
    navigate(url)
  }

  const hpPercent = member.hp.max > 0
    ? Math.round((member.hp.current / member.hp.max) * 100)
    : 0

  const hpColor =
    hpPercent > 50
      ? 'bg-healing-green'
      : hpPercent > 25
        ? 'bg-amber-500'
        : 'bg-damage-red'

  return (
    <div
      className={`relative group rounded-xl border-2 p-4 cursor-pointer transition-all duration-200 bg-bg-secondary/80 backdrop-blur-sm hover:shadow-lg hover:shadow-accent-gold/10 hover:-translate-y-1 hover:border-accent-gold/40 focus:outline-none focus:ring-2 focus:ring-accent-gold/50 ${
        isCurrentUser
          ? 'border-accent-gold/40 shadow-[0_0_12px_rgba(232,180,48,0.15)]'
          : 'border-parchment/15'
      }`}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      aria-label={`${member.name}, Level ${member.level} ${member.race} ${member.class}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleClick()
        }
      }}
      data-testid={`party-member-card-${member.id}`}
    >
      {isCurrentUser && (
        <span className="absolute top-2 right-2 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider bg-accent-gold/15 text-accent-gold border border-accent-gold/25">
          You
        </span>
      )}

      {/* Character name */}
      <h3
        className="font-heading text-lg text-accent-gold text-center truncate mb-1"
        title={member.name}
      >
        {member.name}
      </h3>

      {/* Subtitle: Level N Race Class */}
      <p className="text-sm text-parchment/60 text-center mb-3 truncate">
        Level {member.level} {member.race} {member.class}
      </p>

      {/* HP Bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-xs text-parchment/60 mb-1">
          <div className="flex items-center gap-1">
            <Heart size={12} className="text-damage-red" />
            <span>HP</span>
          </div>
          <span className="font-mono">
            {member.hp.current}/{member.hp.max}
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-parchment/10 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${hpColor}`}
            style={{ width: `${Math.min(hpPercent, 100)}%` }}
          />
        </div>
      </div>

      {/* AC Badge */}
      <div className="flex items-center justify-center">
        <div
          className="flex items-center gap-1 text-parchment/70"
          title="Armor Class"
          aria-label={`AC: ${member.ac}`}
        >
          <Shield size={14} className="text-spell-blue" />
          <span className="font-mono font-semibold text-sm">{member.ac}</span>
          <span className="text-xs text-parchment/50">AC</span>
        </div>
      </div>
    </div>
  )
}
