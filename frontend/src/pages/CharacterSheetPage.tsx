/**
 * CharacterSheetPage
 *
 * Route page that extracts the character ID from URL params
 * and renders the full CharacterSheet component with responsive layouts.
 *
 * When viewing a party member's character (not owned by current user),
 * the sheet is rendered in read-only mode.
 */

import { Link, useParams, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { CharacterSheet } from '@/components/character/sheet/CharacterSheet'
import { useCurrentUser } from '@/hooks/useAuth'
import { useCharacter } from '@/hooks/useCharacters'

export default function CharacterSheetPage() {
  const { id } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const { data: currentUser } = useCurrentUser()
  const { data: character } = useCharacter(id ?? null)

  // Determine if this is a read-only view (party member's character).
  // The backend injects `owner` (user ID) into the character response.
  const characterOwner = character ? (character as Record<string, unknown>).owner : undefined
  const isOwner = currentUser && characterOwner && String(characterOwner) === String(currentUser.id)
  const readOnly = character ? !isOwner : false

  // If coming from a campaign, show "Back to Campaign" link
  const fromCampaign = searchParams.get('from')

  if (!id) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-8 text-center">
        <h1 className="font-heading text-5xl text-accent-gold mb-4">404</h1>
        <p className="text-parchment/80 mb-2">Character not found.</p>
        <p className="text-parchment/50 mb-6 text-sm">
          It may have been deleted or the link is invalid.
        </p>
        <div className="flex gap-4">
          <Link
            to="/"
            className="rounded-lg bg-accent-gold px-6 py-2 font-semibold text-bg-primary transition-colors hover:bg-accent-gold/80"
          >
            Go Home
          </Link>
          <Link
            to="/character/new"
            className="rounded-lg border border-accent-gold/30 px-6 py-2 font-semibold text-accent-gold transition-colors hover:bg-accent-gold/10"
          >
            Create New Character
          </Link>
        </div>
      </div>
    )
  }

  const backTo = fromCampaign ? `/campaign/${fromCampaign}` : '/'
  const backLabel = fromCampaign ? 'Back to Campaign' : 'Back'

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      className="p-4 sm:p-8"
    >
      {/* Back link */}
      <div className="mb-4 print:hidden flex items-center gap-3">
        <Link
          to={backTo}
          className="inline-flex items-center gap-2 rounded-lg p-2 text-parchment/60 transition-colors hover:bg-parchment/10 hover:text-parchment"
          aria-label={backLabel}
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="text-sm">{backLabel}</span>
        </Link>

        {readOnly && (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-parchment/10 text-parchment/60 border border-parchment/20">
            Read Only
          </span>
        )}
      </div>

      <CharacterSheet characterId={id} readOnly={readOnly} />
    </motion.div>
  )
}
