import { Link, useLocation, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useCharacter } from '@/hooks/useCharacters'
import { Shield, Sword, Heart, Star, ArrowLeft, Pencil, Eye } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * CharacterSheetPage — displays a character's full sheet in view or edit mode.
 *
 * Extracts character ID from URL params, fetches data via useCharacter hook,
 * and determines view/edit mode from the URL path.
 */
export default function CharacterSheetPage() {
  const { id } = useParams<{ id: string }>()
  const location = useLocation()
  const isEditMode = location.pathname.endsWith('/edit')

  const { data: character, isLoading, isError, error } = useCharacter(id ?? null)

  // Loading state
  if (isLoading) {
    return (
      <div
        className="flex min-h-[60vh] flex-col items-center justify-center p-8"
        role="status"
        aria-label="Loading character"
      >
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-accent-gold border-t-transparent" />
        <p className="mt-4 text-parchment/60">Loading character...</p>
      </div>
    )
  }

  // Error / not found state
  if (isError || !character) {
    const is404 =
      isError &&
      error &&
      typeof error === 'object' &&
      'response' in error &&
      (error as { response?: { status?: number } }).response?.status === 404

    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-8 text-center">
        <h1 className="font-heading text-5xl text-accent-gold mb-4">
          {is404 ? '404' : 'Error'}
        </h1>
        <p className="text-parchment/80 mb-2">
          {is404
            ? 'Character not found.'
            : 'Failed to load character.'}
        </p>
        <p className="text-parchment/50 mb-6 text-sm">
          {is404
            ? 'It may have been deleted or the link is invalid.'
            : 'Please try again later.'}
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

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      className="p-4 sm:p-8"
    >
      {/* Header with character name and mode toggle */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Link
            to="/"
            className="rounded-lg p-2 text-parchment/60 transition-colors hover:bg-parchment/10 hover:text-parchment"
            aria-label="Back to characters"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="font-heading text-2xl text-accent-gold sm:text-3xl">
              {character.name}
            </h1>
            <p className="text-sm text-parchment/60">
              Level {character.level}{' '}
              {character.classes?.map((c) => c.classId).join(' / ')}
            </p>
          </div>
        </div>

        {/* View / Edit toggle */}
        <div className="flex items-center gap-2">
          <Link
            to={`/character/${id}`}
            className={cn(
              'flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors',
              !isEditMode
                ? 'bg-accent-gold/10 text-accent-gold'
                : 'text-parchment/60 hover:text-parchment'
            )}
            aria-current={!isEditMode ? 'page' : undefined}
          >
            <Eye className="h-4 w-4" />
            View
          </Link>
          <Link
            to={`/character/${id}/edit`}
            className={cn(
              'flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors',
              isEditMode
                ? 'bg-accent-gold/10 text-accent-gold'
                : 'text-parchment/60 hover:text-parchment'
            )}
            aria-current={isEditMode ? 'page' : undefined}
          >
            <Pencil className="h-4 w-4" />
            Edit
          </Link>
        </div>
      </div>

      {/* Mode indicator */}
      {isEditMode && (
        <div className="mb-6 rounded-lg border border-accent-gold/20 bg-accent-gold/5 px-4 py-2">
          <p className="text-sm text-accent-gold">
            Editing mode — changes will be saved automatically.
          </p>
        </div>
      )}

      {/* Character sheet content placeholder */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Core Stats Card */}
        <div className="rounded-xl border border-parchment/10 bg-bg-secondary p-6">
          <div className="mb-4 flex items-center gap-2 text-accent-gold">
            <Shield className="h-5 w-5" />
            <h2 className="font-heading text-lg">Core Stats</h2>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-parchment">
                {character.combatStats?.armorClass?.base ?? '--'}
              </p>
              <p className="text-xs text-parchment/50">AC</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-parchment">
                {character.combatStats?.initiative ?? '--'}
              </p>
              <p className="text-xs text-parchment/50">Initiative</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-parchment">
                {character.speed?.walk ?? '--'}
              </p>
              <p className="text-xs text-parchment/50">Speed</p>
            </div>
          </div>
        </div>

        {/* Hit Points Card */}
        <div className="rounded-xl border border-parchment/10 bg-bg-secondary p-6">
          <div className="mb-4 flex items-center gap-2 text-accent-gold">
            <Heart className="h-5 w-5" />
            <h2 className="font-heading text-lg">Hit Points</h2>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-parchment">
              {character.hpCurrent}
              <span className="text-parchment/40"> / </span>
              {character.hpMax}
            </p>
            {character.tempHp > 0 && (
              <p className="text-sm text-accent-gold">
                +{character.tempHp} temp
              </p>
            )}
          </div>
        </div>

        {/* Combat Card */}
        <div className="rounded-xl border border-parchment/10 bg-bg-secondary p-6">
          <div className="mb-4 flex items-center gap-2 text-accent-gold">
            <Sword className="h-5 w-5" />
            <h2 className="font-heading text-lg">Combat</h2>
          </div>
          <p className="text-parchment/60 text-sm">
            Combat details coming soon.
          </p>
        </div>

        {/* Features Card */}
        <div className="rounded-xl border border-parchment/10 bg-bg-secondary p-6 md:col-span-2 lg:col-span-3">
          <div className="mb-4 flex items-center gap-2 text-accent-gold">
            <Star className="h-5 w-5" />
            <h2 className="font-heading text-lg">Features & Traits</h2>
          </div>
          {character.features && character.features.length > 0 ? (
            <ul className="list-disc pl-5 text-parchment/80">
              {character.features.map((f) => (
                <li key={f} className="mb-1 text-sm capitalize">
                  {f.replace(/-/g, ' ')}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-parchment/60 text-sm">No features yet.</p>
          )}
        </div>
      </div>
    </motion.div>
  )
}
