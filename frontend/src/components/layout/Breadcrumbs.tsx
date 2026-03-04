import { Link, useLocation, useParams } from 'react-router-dom'
import { ChevronRight, Home } from 'lucide-react'
import { useCharacter } from '@/hooks/useCharacters'
import { cn } from '@/lib/utils'

interface BreadcrumbItem {
  label: string
  to?: string
}

/**
 * Builds breadcrumb items based on the current route pathname.
 * Character name is resolved asynchronously via the characterName param.
 */
function buildBreadcrumbs(
  pathname: string,
  characterId: string | undefined,
  characterName: string | undefined
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

  if (pathname === '/campaigns') {
    crumbs.length = 0
    crumbs.push({ label: 'Campaigns' })
    return crumbs
  }

  if (pathname.startsWith('/campaign/')) {
    crumbs.length = 0
    crumbs.push({ label: 'Campaigns', to: '/campaigns' })
    crumbs.push({ label: 'Campaign' })
    return crumbs
  }

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
 * when on character-related routes.
 */
export function Breadcrumbs() {
  const location = useLocation()
  const { id: characterId } = useParams<{ id: string }>()

  // Only fetch character data when on a character route
  const isCharacterRoute =
    !!characterId && location.pathname.startsWith(`/character/${characterId}`)
  const { data: character } = useCharacter(
    isCharacterRoute ? characterId : null
  )

  const crumbs = buildBreadcrumbs(
    location.pathname,
    characterId,
    character?.name
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
