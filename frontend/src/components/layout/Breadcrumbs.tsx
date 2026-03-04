import { Link, useLocation, useParams } from 'react-router-dom'
import { ChevronRight, Home } from 'lucide-react'
import { useCharacter } from '@/hooks/useCharacters'
import { useCampaign } from '@/hooks/useCampaigns'
import { cn } from '@/lib/utils'

export interface BreadcrumbItem {
  label: string
  to?: string
}

/**
 * Extracts a campaign ID from a pathname that starts with /campaign/:id.
 * Returns undefined if the path does not match a campaign route.
 */
export function extractCampaignId(pathname: string): string | undefined {
  const match = pathname.match(/^\/campaign\/([^/]+)/)
  return match?.[1]
}

/**
 * Builds breadcrumb items based on the current route pathname.
 * Character name and campaign name are resolved asynchronously via hooks.
 */
export function buildBreadcrumbs(
  pathname: string,
  characterId: string | undefined,
  characterName: string | undefined,
  campaignId: string | undefined,
  campaignName: string | undefined,
  sessionId: string | undefined
): BreadcrumbItem[] {
  const crumbs: BreadcrumbItem[] = [{ label: 'Characters', to: '/' }]

  if (pathname === '/' || pathname === '') {
    return crumbs
  }

  if (pathname === '/character/new') {
    crumbs.push({ label: 'New Character' })
    return crumbs
  }

  if (characterId && pathname.startsWith(`/character/${characterId}`)) {
    const name = characterName ?? 'Loading...'
    const isEdit = pathname.endsWith('/edit')
    const isLevelUp = pathname.endsWith('/levelup')

    crumbs.push({
      label: name,
      to: isEdit || isLevelUp ? `/character/${characterId}` : undefined,
    })

    if (isEdit) {
      crumbs.push({ label: 'Editing' })
    }

    if (isLevelUp) {
      crumbs.push({ label: 'Level Up' })
    }

    return crumbs
  }

  // --- Campaign routes ---

  if (pathname === '/campaigns') {
    crumbs.length = 0
    crumbs.push({ label: 'Campaigns' })
    return crumbs
  }

  if (pathname.startsWith('/join/')) {
    crumbs.length = 0
    crumbs.push({ label: 'Join Campaign' })
    return crumbs
  }

  if (campaignId && pathname.startsWith(`/campaign/${campaignId}`)) {
    crumbs.length = 0
    const name = campaignName ?? 'Loading...'

    // /campaign/:id (dashboard)
    if (pathname === `/campaign/${campaignId}`) {
      crumbs.push({ label: 'Campaigns', to: '/campaigns' })
      crumbs.push({ label: name })
      return crumbs
    }

    // /campaign/:id/encounter/:eid
    if (pathname.match(/^\/campaign\/[^/]+\/encounter\/[^/]+$/)) {
      crumbs.push({ label: 'Campaigns', to: '/campaigns' })
      crumbs.push({ label: name, to: `/campaign/${campaignId}` })
      crumbs.push({ label: 'Encounter' })
      return crumbs
    }

    // /campaign/:id/session/:sessionId
    if (pathname.match(/^\/campaign\/[^/]+\/session\/[^/]+$/)) {
      crumbs.push({ label: 'Campaigns', to: '/campaigns' })
      crumbs.push({ label: name, to: `/campaign/${campaignId}` })
      const sessionLabel = sessionId ? `Session ${sessionId}` : 'Session'
      crumbs.push({ label: sessionLabel })
      return crumbs
    }

    // Fallback for any other /campaign/:id/* sub-route
    crumbs.push({ label: 'Campaigns', to: '/campaigns' })
    crumbs.push({ label: name })
    return crumbs
  }

  // --- Other routes ---

  if (pathname === '/dice') {
    crumbs.length = 0
    crumbs.push({ label: 'Dice Roller' })
    return crumbs
  }

  if (pathname === '/settings') {
    crumbs.length = 0
    crumbs.push({ label: 'Settings' })
    return crumbs
  }

  return crumbs
}

/**
 * Breadcrumbs component that renders a navigable breadcrumb trail
 * based on the current route. Automatically resolves character names
 * and campaign names when on the corresponding routes.
 */
export function Breadcrumbs() {
  const location = useLocation()
  const { id: characterId, sessionId } = useParams<{
    id: string
    sessionId: string
  }>()

  // Only fetch character data when on a character route
  const isCharacterRoute =
    !!characterId && location.pathname.startsWith(`/character/${characterId}`)
  const { data: character } = useCharacter(
    isCharacterRoute ? characterId : null
  )

  // Only fetch campaign data when on a campaign route
  const campaignId = extractCampaignId(location.pathname)
  const { data: campaign } = useCampaign(campaignId ?? null)

  const crumbs = buildBreadcrumbs(
    location.pathname,
    characterId,
    character?.name,
    campaignId,
    campaign?.name,
    sessionId
  )

  if (crumbs.length === 0) {
    return null
  }

  return (
    <nav aria-label="Breadcrumb" className="flex items-center">
      <ol className="flex items-center gap-1 text-sm">
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1

          return (
            <li key={`${crumb.label}-${index}`} className="flex items-center gap-1">
              {index > 0 && (
                <ChevronRight className="h-3.5 w-3.5 text-parchment/30" aria-hidden="true" />
              )}
              {index === 0 && crumb.to === '/' && (
                <Home className="mr-1 h-3.5 w-3.5" aria-hidden="true" />
              )}
              {crumb.to && !isLast ? (
                <Link
                  to={crumb.to}
                  className={cn(
                    'transition-colors hover:text-accent-gold',
                    'text-parchment/60'
                  )}
                >
                  {crumb.label}
                </Link>
              ) : (
                <span
                  className={cn(
                    isLast ? 'text-parchment font-medium' : 'text-parchment/60'
                  )}
                  aria-current={isLast ? 'page' : undefined}
                >
                  {crumb.label}
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
