/**
 * PartyComposition (Story 34.5)
 *
 * Visual panel showing archetypal party roles and which characters fill them.
 * Informational tone: "Party Strengths & Potential Gaps".
 */

import {
  Shield,
  Sword,
  Target,
  Heart,
  Sparkles,
  Wrench,
  MessageCircle,
  Info,
  AlertTriangle,
  Check,
} from 'lucide-react'
import type { Character } from '@/types/character'
import type { PartyRole, RoleCoverage, PartyCallout } from '@/utils/party-analysis'
import { analyzePartyComposition, getPartyCallouts } from '@/utils/party-analysis'

interface PartyCompositionProps {
  characters: Character[]
}

const ROLE_ICONS: Record<PartyRole, React.ReactNode> = {
  'Tank/Defender': <Shield className="w-5 h-5" />,
  'Melee Striker': <Sword className="w-5 h-5" />,
  'Ranged Striker': <Target className="w-5 h-5" />,
  'Healer/Support': <Heart className="w-5 h-5" />,
  'Controller': <Sparkles className="w-5 h-5" />,
  'Utility/Skill Monkey': <Wrench className="w-5 h-5" />,
  'Face (Social)': <MessageCircle className="w-5 h-5" />,
}

export function PartyComposition({ characters }: PartyCompositionProps) {
  const roles = analyzePartyComposition(characters)
  const callouts = getPartyCallouts(characters)

  return (
    <div data-testid="party-composition">
      <h3 className="font-heading text-lg text-parchment mb-4">
        Party Strengths & Potential Gaps
      </h3>

      {/* Role Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 mb-6">
        {roles.map((role) => (
          <RoleCard
            key={role.role}
            role={role.role}
            description={role.description}
            primaryCharacters={role.primaryCharacters}
            secondaryCharacters={role.secondaryCharacters}
            coverage={role.coverage}
          />
        ))}
      </div>

      {/* Callout Badges */}
      {callouts.length > 0 && (
        <div className="space-y-2" data-testid="party-callouts">
          {callouts.map((callout, index) => (
            <CalloutBadge key={index} callout={callout} />
          ))}
        </div>
      )}
    </div>
  )
}

interface RoleCardProps {
  role: PartyRole
  description: string
  primaryCharacters: string[]
  secondaryCharacters: string[]
  coverage: RoleCoverage
}

function RoleCard({
  role,
  description,
  primaryCharacters,
  secondaryCharacters,
  coverage,
}: RoleCardProps) {
  const bgClass =
    coverage === 'none'
      ? 'bg-amber-900/10 border-amber-500/20'
      : 'bg-bg-primary border-parchment/10'

  return (
    <div
      className={`rounded-lg border p-3 ${bgClass}`}
      data-testid={`role-card-${role}`}
    >
      <div className="flex items-start gap-2 mb-2">
        <span
          className={`
            mt-0.5
            ${
              coverage === 'primary'
                ? 'text-green-400'
                : coverage === 'secondary'
                  ? 'text-amber-400'
                  : 'text-red-400/50'
            }
          `}
        >
          {ROLE_ICONS[role]}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-medium text-parchment truncate">
              {role}
            </h4>
            <CoverageIndicator coverage={coverage} />
          </div>
          <p className="text-[11px] text-parchment/40 mt-0.5" title={description}>
            {description}
          </p>
        </div>
      </div>

      {/* Character assignments */}
      <div className="mt-2 space-y-1">
        {primaryCharacters.map((name) => (
          <div key={name} className="flex items-center gap-1.5 text-xs">
            <span className="w-2 h-2 rounded-full bg-green-400" title="Primary" />
            <span className="text-parchment/70">{name}</span>
          </div>
        ))}
        {secondaryCharacters.map((name) => (
          <div key={name} className="flex items-center gap-1.5 text-xs">
            <span className="w-2 h-2 rounded-full bg-amber-400/60" title="Secondary" />
            <span className="text-parchment/50">{name}</span>
          </div>
        ))}
        {primaryCharacters.length === 0 && secondaryCharacters.length === 0 && (
          <p className="text-xs text-parchment/25 italic">No coverage</p>
        )}
      </div>
    </div>
  )
}

function CoverageIndicator({ coverage }: { coverage: RoleCoverage }) {
  if (coverage === 'primary') {
    return (
      <span
        className="inline-flex w-3.5 h-3.5 rounded-full bg-green-500 items-center justify-center"
        title="Covered (primary)"
        aria-label="Covered by primary class"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-white" />
      </span>
    )
  }
  if (coverage === 'secondary') {
    return (
      <span
        className="inline-flex w-3.5 h-3.5 rounded-full border-2 border-amber-400 items-center justify-center"
        title="Partially covered (secondary)"
        aria-label="Partially covered by secondary class"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
      </span>
    )
  }
  return (
    <span
      className="inline-flex w-3.5 h-3.5 rounded-full border-2 border-parchment/20"
      title="Not covered"
      aria-label="Not covered"
    />
  )
}

function CalloutBadge({ callout }: { callout: PartyCallout }) {
  const config = {
    strength: {
      icon: <Check className="w-4 h-4" />,
      color: 'text-green-400 bg-green-500/10 border-green-500/20',
    },
    warning: {
      icon: <AlertTriangle className="w-4 h-4" />,
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    },
    info: {
      icon: <Info className="w-4 h-4" />,
      color: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    },
  }[callout.type]

  return (
    <div
      className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm ${config.color}`}
      data-testid={`callout-${callout.type}`}
    >
      {config.icon}
      {callout.message}
    </div>
  )
}
