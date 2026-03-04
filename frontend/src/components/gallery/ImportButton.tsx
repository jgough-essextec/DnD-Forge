import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { importCharacter } from '@/api/characters'
import { useUIStore } from '@/stores/uiStore'

interface ImportButtonProps {
  /** Render as a menu item instead of a standalone button. */
  variant?: 'button' | 'menu-item'
}

export function ImportButton({ variant = 'button' }: ImportButtonProps) {
  const [isImporting, setIsImporting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()
  const addToast = useUIStore((s) => s.addToast)

  function handleClick() {
    setError(null)
    fileInputRef.current?.click()
  }

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.name.endsWith('.json')) {
      setError('Please select a .json file.')
      return
    }

    // Validate file size (1MB)
    if (file.size > 1_048_576) {
      setError('File size exceeds 1MB limit.')
      return
    }

    setIsImporting(true)
    setError(null)

    try {
      const result = await importCharacter(file)
      const charId = result.character.id

      if (result.warnings.length > 0) {
        addToast({
          message: `Imported with warnings: ${result.warnings.join('; ')}`,
          type: 'warning',
        })
      } else {
        addToast({
          message: `Successfully imported "${result.character.name}".`,
          type: 'success',
        })
      }

      navigate(`/character/${charId}`)
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to import character.'
      setError(message)
      addToast({
        message: 'Failed to import character. Please check the file format.',
        type: 'error',
      })
    } finally {
      setIsImporting(false)
      // Reset the file input so the same file can be re-selected
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const hiddenInput = (
    <input
      ref={fileInputRef}
      type="file"
      accept=".json"
      onChange={handleFileChange}
      className="hidden"
      data-testid="import-file-input"
    />
  )

  if (variant === 'menu-item') {
    return (
      <>
        {hiddenInput}
        <button
          type="button"
          role="menuitem"
          onClick={handleClick}
          disabled={isImporting}
          className="w-full text-left px-4 py-2 text-sm hover:bg-surface-700 disabled:opacity-50"
        >
          {isImporting ? 'Importing...' : 'Import from JSON'}
        </button>
        {error && (
          <p className="px-4 py-1 text-xs text-red-400">{error}</p>
        )}
      </>
    )
  }

  return (
    <>
      {hiddenInput}
      <button
        type="button"
        onClick={handleClick}
        disabled={isImporting}
        className="inline-flex items-center gap-2 rounded-lg border border-surface-600 px-3 py-2 text-sm font-medium text-text-secondary hover:bg-surface-700 disabled:opacity-50"
      >
        {isImporting ? 'Importing...' : 'Import JSON'}
      </button>
      {error && (
        <p className="mt-1 text-xs text-red-400" role="alert">{error}</p>
      )}
    </>
  )
}
