import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getSharedCharacter, importCharacter } from '@/api/characters'
import type { SharedCharacterData } from '@/api/characters'
import { useAuth } from '@/hooks/AuthContext'
import { useUIStore } from '@/stores/uiStore'

export default function SharedCharacterPage() {
  const { token } = useParams<{ token: string }>()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const addToast = useUIStore((s) => s.addToast)

  const [data, setData] = useState<SharedCharacterData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isImporting, setIsImporting] = useState(false)

  useEffect(() => {
    if (!token) return

    async function fetchShared() {
      setIsLoading(true)
      setError(null)
      try {
        const result = await getSharedCharacter(token!)
        setData(result)
      } catch (err: unknown) {
        if (isAxiosErrorWithStatus(err, 410)) {
          setError('This share link has expired.')
        } else if (isAxiosErrorWithStatus(err, 404)) {
          setError('Shared character not found.')
        } else {
          setError('Failed to load shared character.')
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchShared()
  }, [token])

  async function handleImport() {
    if (!data) return
    setIsImporting(true)
    try {
      // Create a JSON blob from the character data and import it
      const jsonStr = JSON.stringify({ character: data.character })
      const file = new File([jsonStr], 'shared-character.json', {
        type: 'application/json',
      })
      const result = await importCharacter(file)
      addToast({
        message: `Successfully imported "${result.character.name}" to your characters.`,
        type: 'success',
      })
      navigate(`/character/${result.character.id}`)
    } catch {
      addToast({
        message: 'Failed to import character.',
        type: 'error',
      })
    } finally {
      setIsImporting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent-gold border-t-transparent" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 text-center">
        <h1 className="mb-4 text-2xl font-bold text-text-primary">
          Shared Character
        </h1>
        <p className="text-text-secondary" role="alert">{error}</p>
      </div>
    )
  }

  if (!data) return null

  const char = data.character

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      {/* Shared banner */}
      <div className="mb-6 rounded-lg bg-accent-gold/10 border border-accent-gold/30 px-4 py-3 text-sm text-accent-gold">
        Shared Character — This is a read-only view of a shared character.
      </div>

      <div className="rounded-xl bg-surface-800 p-6 shadow-lg">
        <h1 className="mb-2 text-2xl font-bold text-text-primary">
          {String(char.name ?? 'Unnamed Character')}
        </h1>
        <p className="mb-4 text-text-secondary">
          Level {String(char.level ?? '?')}{' '}
          {String(char.race ?? '')}{' '}
          {String(char.class_name ?? '')}
        </p>

        {Boolean(char.background) && (
          <div className="mb-4">
            <span className="text-sm font-medium text-text-secondary">Background: </span>
            <span className="text-sm text-text-primary">{String(char.background)}</span>
          </div>
        )}

        {char.hp != null && (
          <div className="mb-4">
            <span className="text-sm font-medium text-text-secondary">HP: </span>
            <span className="text-sm text-text-primary">{String(char.hp)}</span>
          </div>
        )}

        {typeof char.ability_scores === 'object' && char.ability_scores !== null && (
          <div className="mb-4">
            <h2 className="mb-2 text-sm font-semibold text-text-secondary">
              Ability Scores
            </h2>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
              {Object.entries(char.ability_scores as Record<string, unknown>).map(
                ([key, value]) => (
                  <div
                    key={key}
                    className="rounded-lg bg-surface-700 p-2 text-center"
                  >
                    <div className="text-xs uppercase text-text-secondary">
                      {key}
                    </div>
                    <div className="text-lg font-bold text-text-primary">
                      {String(value)}
                    </div>
                  </div>
                ),
              )}
            </div>
          </div>
        )}

        {Array.isArray(char.skills) && (char.skills as string[]).length > 0 && (
          <div className="mb-4">
            <h2 className="mb-1 text-sm font-semibold text-text-secondary">Skills</h2>
            <p className="text-sm text-text-primary">
              {(char.skills as string[]).join(', ')}
            </p>
          </div>
        )}

        {Array.isArray(char.equipment) && (char.equipment as string[]).length > 0 && (
          <div className="mb-4">
            <h2 className="mb-1 text-sm font-semibold text-text-secondary">Equipment</h2>
            <p className="text-sm text-text-primary">
              {(char.equipment as string[]).join(', ')}
            </p>
          </div>
        )}

        {Array.isArray(char.spells) && (char.spells as string[]).length > 0 && (
          <div className="mb-4">
            <h2 className="mb-1 text-sm font-semibold text-text-secondary">Spells</h2>
            <p className="text-sm text-text-primary">
              {(char.spells as string[]).join(', ')}
            </p>
          </div>
        )}
      </div>

      {/* Import button for authenticated users */}
      {isAuthenticated && (
        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={handleImport}
            disabled={isImporting}
            className="rounded-lg bg-accent-gold px-6 py-3 text-sm font-medium text-surface-900 hover:bg-accent-gold/90 disabled:opacity-50"
          >
            {isImporting ? 'Importing...' : 'Import to My Characters'}
          </button>
        </div>
      )}

      <div className="mt-4 text-center text-xs text-text-secondary">
        Format version {data.formatVersion} | Exported {new Date(data.exportedAt).toLocaleDateString()}
      </div>
    </div>
  )
}

/**
 * Type guard for Axios-style errors with a response status.
 */
function isAxiosErrorWithStatus(err: unknown, expectedStatus: number): boolean {
  if (
    typeof err === 'object' &&
    err !== null &&
    'response' in err
  ) {
    const response = (err as { response?: { status?: number } }).response
    return response?.status === expectedStatus
  }
  return false
}
