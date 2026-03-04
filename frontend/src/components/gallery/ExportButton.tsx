import { useState } from 'react'
import { exportCharacter } from '@/api/characters'
import { useUIStore } from '@/stores/uiStore'

interface ExportButtonProps {
  characterId: string
  characterName?: string
  /** Render as a menu item instead of a standalone button. */
  variant?: 'button' | 'menu-item'
}

export function ExportButton({
  characterId,
  characterName,
  variant = 'button',
}: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false)
  const addToast = useUIStore((s) => s.addToast)

  async function handleExport() {
    setIsExporting(true)
    try {
      await exportCharacter(characterId)
      addToast({
        message: `Exported ${characterName ?? 'character'} successfully.`,
        type: 'success',
      })
    } catch {
      addToast({
        message: 'Failed to export character. Please try again.',
        type: 'error',
      })
    } finally {
      setIsExporting(false)
    }
  }

  if (variant === 'menu-item') {
    return (
      <button
        type="button"
        role="menuitem"
        onClick={handleExport}
        disabled={isExporting}
        className="w-full text-left px-4 py-2 text-sm hover:bg-surface-700 disabled:opacity-50"
      >
        {isExporting ? 'Exporting...' : 'Export as JSON'}
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={isExporting}
      className="inline-flex items-center gap-2 rounded-lg border border-surface-600 px-3 py-2 text-sm font-medium text-text-secondary hover:bg-surface-700 disabled:opacity-50"
    >
      {isExporting ? 'Exporting...' : 'Export JSON'}
    </button>
  )
}
