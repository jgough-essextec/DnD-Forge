import { useState, useCallback, useEffect } from 'react'
import {
  Sun,
  Moon,
  Dice5,
  Save,
  UserCircle,
  Trash2,
  Download,
  Info,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { usePreferences, useUpdatePreferences } from '@/hooks/usePreferences'
import { useUIStore } from '@/stores/uiStore'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type DiceSpeed = 'fast' | 'normal' | 'dramatic'
type AutoSaveInterval = '500' | '1000' | '2000' | 'manual'
type AbilityScoreMethod = 'standard' | 'pointBuy' | 'rolled'
type GallerySort = 'name' | 'level' | 'updated' | 'created'

interface LocalSettings {
  // Display
  reducedMotion: boolean
  // Dice
  diceAnimationSpeed: DiceSpeed
  showDiceResultsInline: boolean
  // Auto-Save
  autoSaveEnabled: boolean
  autoSaveInterval: AutoSaveInterval
  // Defaults
  defaultPlayerName: string
  defaultAbilityScoreMethod: AbilityScoreMethod
  galleryDefaultSort: GallerySort
}

const DEFAULT_SETTINGS: LocalSettings = {
  reducedMotion: false,
  diceAnimationSpeed: 'normal',
  showDiceResultsInline: true,
  autoSaveEnabled: true,
  autoSaveInterval: '1000',
  defaultPlayerName: '',
  defaultAbilityScoreMethod: 'standard',
  galleryDefaultSort: 'updated',
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function SectionHeading({
  icon: Icon,
  title,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
}) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <Icon className="h-5 w-5 text-accent-gold" />
      <h2 className="font-heading text-lg text-accent-gold">{title}</h2>
    </div>
  )
}

function ToggleSwitch({
  label,
  description,
  checked,
  onChange,
  id,
}: {
  label: string
  description?: string
  checked: boolean
  onChange: (checked: boolean) => void
  id: string
}) {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex-1">
        <label htmlFor={id} className="text-sm font-medium text-parchment cursor-pointer">
          {label}
        </label>
        {description && (
          <p className="text-xs text-parchment/50 mt-0.5">{description}</p>
        )}
      </div>
      <button
        id={id}
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors',
          checked ? 'bg-accent-gold' : 'bg-parchment/20'
        )}
      >
        <span
          className={cn(
            'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform mt-0.5',
            checked ? 'translate-x-5 ml-0.5' : 'translate-x-0.5'
          )}
        />
      </button>
    </div>
  )
}

function SelectField<T extends string>({
  label,
  description,
  value,
  onChange,
  options,
  id,
}: {
  label: string
  description?: string
  value: T
  onChange: (value: T) => void
  options: { value: T; label: string }[]
  id: string
}) {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex-1">
        <label htmlFor={id} className="text-sm font-medium text-parchment">
          {label}
        </label>
        {description && (
          <p className="text-xs text-parchment/50 mt-0.5">{description}</p>
        )}
      </div>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="rounded-lg border border-parchment/20 bg-bg-primary px-3 py-1.5 text-sm text-parchment"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )
}

function TextInputField({
  label,
  description,
  value,
  onChange,
  placeholder,
  id,
}: {
  label: string
  description?: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  id: string
}) {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex-1 mr-4">
        <label htmlFor={id} className="text-sm font-medium text-parchment">
          {label}
        </label>
        {description && (
          <p className="text-xs text-parchment/50 mt-0.5">{description}</p>
        )}
      </div>
      <input
        id={id}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-48 rounded-lg border border-parchment/20 bg-bg-primary px-3 py-1.5 text-sm text-parchment placeholder:text-parchment/30"
      />
    </div>
  )
}

function SectionCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-parchment/10 bg-bg-secondary p-6 mb-6">
      {children}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main SettingsPage component
// ---------------------------------------------------------------------------

export default function SettingsPage() {
  const { data: preferences, isLoading: prefsLoading } = usePreferences()
  const updatePrefs = useUpdatePreferences()
  const { theme, setTheme } = useUIStore()

  const [settings, setSettings] = useState<LocalSettings>(DEFAULT_SETTINGS)
  const [clearConfirmation, setClearConfirmation] = useState('')
  const [showClearDialog, setShowClearDialog] = useState(false)

  // Sync settings from API preferences on load
  useEffect(() => {
    if (preferences) {
      setSettings((prev) => ({
        ...prev,
        autoSaveEnabled: preferences.autoSaveEnabled ?? prev.autoSaveEnabled,
      }))
    }
  }, [preferences])

  /**
   * Persist a single setting change to the API.
   */
  const persistSetting = useCallback(
    (key: string, value: unknown) => {
      // Only persist keys that the API knows about
      const apiKeys = ['theme', 'autoSaveEnabled', 'lastActiveCharacterId']
      if (apiKeys.includes(key)) {
        updatePrefs.mutate({ [key]: value } as Record<string, unknown>)
      }
    },
    [updatePrefs]
  )

  /**
   * Update a local setting and trigger API persistence if applicable.
   */
  const updateSetting = useCallback(
    <K extends keyof LocalSettings>(key: K, value: LocalSettings[K]) => {
      setSettings((prev) => ({ ...prev, [key]: value }))
      persistSetting(key, value)
    },
    [persistSetting]
  )

  /**
   * Handle theme toggle — updates both Zustand store and API.
   */
  const handleThemeToggle = useCallback(() => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
    persistSetting('theme', newTheme)
  }, [theme, setTheme, persistSetting])

  /**
   * Handle Export All Data — triggers a JSON download.
   */
  const handleExportData = useCallback(() => {
    const exportData = {
      exportedAt: new Date().toISOString(),
      preferences,
      settings,
    }
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `dnd-forge-export-${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [preferences, settings])

  /**
   * Handle Clear All Data with DELETE confirmation.
   */
  const handleClearData = useCallback(() => {
    if (clearConfirmation === 'DELETE') {
      // In a real app, this would call DELETE /api/user-data/
      setShowClearDialog(false)
      setClearConfirmation('')
    }
  }, [clearConfirmation])

  if (prefsLoading) {
    return (
      <div
        className="flex min-h-[60vh] items-center justify-center"
        role="status"
        aria-label="Loading settings"
      >
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent-gold border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl p-4 sm:p-8">
      <h1 className="font-heading text-3xl text-accent-gold mb-8">Settings</h1>

      {/* ---- Display Section ---- */}
      <SectionCard>
        <SectionHeading icon={Sun} title="Display" />
        <div className="divide-y divide-parchment/5">
          {/* Theme toggle */}
          <div className="flex items-center justify-between py-3">
            <div className="flex-1">
              <label className="text-sm font-medium text-parchment">Theme</label>
              <p className="text-xs text-parchment/50 mt-0.5">
                Switch between dark and light mode
              </p>
            </div>
            <button
              onClick={handleThemeToggle}
              className={cn(
                'flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors',
                'border border-parchment/20 hover:border-accent-gold/30'
              )}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
              data-testid="theme-toggle"
            >
              {theme === 'dark' ? (
                <>
                  <Moon className="h-4 w-4 text-accent-gold" />
                  <span className="text-parchment">Dark</span>
                </>
              ) : (
                <>
                  <Sun className="h-4 w-4 text-accent-gold" />
                  <span className="text-parchment">Light</span>
                </>
              )}
            </button>
          </div>

          <ToggleSwitch
            id="reduced-motion"
            label="Reduced Motion"
            description="Disable all animations for accessibility"
            checked={settings.reducedMotion}
            onChange={(val) => updateSetting('reducedMotion', val)}
          />
        </div>
      </SectionCard>

      {/* ---- Dice Section ---- */}
      <SectionCard>
        <SectionHeading icon={Dice5} title="Dice" />
        <div className="divide-y divide-parchment/5">
          <SelectField<DiceSpeed>
            id="dice-animation-speed"
            label="Dice Animation Speed"
            value={settings.diceAnimationSpeed}
            onChange={(val) => updateSetting('diceAnimationSpeed', val)}
            options={[
              { value: 'fast', label: 'Fast' },
              { value: 'normal', label: 'Normal' },
              { value: 'dramatic', label: 'Dramatic' },
            ]}
          />
          <ToggleSwitch
            id="show-dice-inline"
            label="Show Dice Roll Results Inline"
            description="Display dice results directly in the character sheet"
            checked={settings.showDiceResultsInline}
            onChange={(val) => updateSetting('showDiceResultsInline', val)}
          />
        </div>
      </SectionCard>

      {/* ---- Auto-Save Section ---- */}
      <SectionCard>
        <SectionHeading icon={Save} title="Auto-Save" />
        <div className="divide-y divide-parchment/5">
          <ToggleSwitch
            id="auto-save-enabled"
            label="Auto-Save Enabled"
            description="Automatically save changes while editing"
            checked={settings.autoSaveEnabled}
            onChange={(val) => updateSetting('autoSaveEnabled', val)}
          />
          <SelectField<AutoSaveInterval>
            id="auto-save-interval"
            label="Auto-Save Interval"
            description="How often to save changes"
            value={settings.autoSaveInterval}
            onChange={(val) => updateSetting('autoSaveInterval', val)}
            options={[
              { value: '500', label: '500ms' },
              { value: '1000', label: '1 second' },
              { value: '2000', label: '2 seconds' },
              { value: 'manual', label: 'Manual only' },
            ]}
          />
        </div>
      </SectionCard>

      {/* ---- Defaults Section ---- */}
      <SectionCard>
        <SectionHeading icon={UserCircle} title="Defaults" />
        <div className="divide-y divide-parchment/5">
          <TextInputField
            id="default-player-name"
            label="Default Player Name"
            description="Pre-fills the player name in the creation wizard"
            value={settings.defaultPlayerName}
            onChange={(val) => updateSetting('defaultPlayerName', val)}
            placeholder="Enter player name"
          />
          <SelectField<AbilityScoreMethod>
            id="default-ability-method"
            label="Default Ability Score Method"
            value={settings.defaultAbilityScoreMethod}
            onChange={(val) => updateSetting('defaultAbilityScoreMethod', val)}
            options={[
              { value: 'standard', label: 'Standard Array' },
              { value: 'pointBuy', label: 'Point Buy' },
              { value: 'rolled', label: 'Rolling' },
            ]}
          />
          <SelectField<GallerySort>
            id="gallery-default-sort"
            label="Gallery Default Sort"
            description="Default sort order for the character gallery"
            value={settings.galleryDefaultSort}
            onChange={(val) => updateSetting('galleryDefaultSort', val)}
            options={[
              { value: 'name', label: 'Name' },
              { value: 'level', label: 'Level' },
              { value: 'updated', label: 'Last Updated' },
              { value: 'created', label: 'Date Created' },
            ]}
          />
        </div>
      </SectionCard>

      {/* ---- Data Management Section ---- */}
      <SectionCard>
        <SectionHeading icon={Download} title="Data Management" />
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-parchment">Export All Data</p>
              <p className="text-xs text-parchment/50 mt-0.5">
                Download all your characters and settings as JSON
              </p>
            </div>
            <button
              onClick={handleExportData}
              className="flex items-center gap-2 rounded-lg border border-parchment/20 px-4 py-2 text-sm text-parchment transition-colors hover:border-accent-gold/30 hover:text-accent-gold"
              data-testid="export-data-btn"
            >
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>

          <div className="border-t border-parchment/10 pt-4">
            <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Trash2 className="h-4 w-4 text-red-400" />
                <p className="text-sm font-medium text-red-400">Danger Zone</p>
              </div>
              <p className="text-xs text-parchment/60 mb-3">
                Delete all characters, campaigns, and preferences. This cannot
                be undone.
              </p>
              {!showClearDialog ? (
                <button
                  onClick={() => setShowClearDialog(true)}
                  className="rounded-lg border border-red-500/30 px-4 py-2 text-sm text-red-400 transition-colors hover:bg-red-500/10"
                  data-testid="clear-data-btn"
                >
                  Clear All Data
                </button>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-parchment/80">
                    Type <strong className="text-red-400">DELETE</strong> to
                    confirm:
                  </p>
                  <input
                    type="text"
                    value={clearConfirmation}
                    onChange={(e) => setClearConfirmation(e.target.value)}
                    placeholder="Type DELETE"
                    className="w-full rounded-lg border border-red-500/30 bg-bg-primary px-3 py-2 text-sm text-parchment placeholder:text-parchment/30"
                    data-testid="clear-confirmation-input"
                    aria-label="Type DELETE to confirm"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleClearData}
                      disabled={clearConfirmation !== 'DELETE'}
                      className={cn(
                        'rounded-lg px-4 py-2 text-sm font-medium transition-colors',
                        clearConfirmation === 'DELETE'
                          ? 'bg-red-500 text-white hover:bg-red-600'
                          : 'bg-red-500/20 text-red-400/50 cursor-not-allowed'
                      )}
                      data-testid="confirm-clear-btn"
                    >
                      Confirm Delete
                    </button>
                    <button
                      onClick={() => {
                        setShowClearDialog(false)
                        setClearConfirmation('')
                      }}
                      className="rounded-lg border border-parchment/20 px-4 py-2 text-sm text-parchment/60 transition-colors hover:text-parchment"
                      data-testid="cancel-clear-btn"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </SectionCard>

      {/* ---- About Section ---- */}
      <SectionCard>
        <SectionHeading icon={Info} title="About" />
        <div className="space-y-3 text-sm text-parchment/70">
          <div className="flex items-center justify-between">
            <span>Version</span>
            <span className="text-parchment" data-testid="app-version">0.1.0</span>
          </div>
          <div className="border-t border-parchment/5 pt-3">
            <p className="mb-2 font-medium text-parchment">Acknowledgments</p>
            <p className="text-xs text-parchment/50 leading-relaxed">
              This application uses content from the{' '}
              <a
                href="https://dnd.wizards.com/resources/systems-reference-document"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent-gold underline hover:text-accent-gold/80"
              >
                System Reference Document 5.1 (SRD)
              </a>{' '}
              by Wizards of the Coast, available under the{' '}
              <a
                href="https://dnd.wizards.com/resources/systems-reference-document"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent-gold underline hover:text-accent-gold/80"
              >
                Open Game License (OGL)
              </a>
              . D&D and Dungeons & Dragons are trademarks of Wizards of the
              Coast LLC.
            </p>
          </div>
        </div>
      </SectionCard>

      {/* Spacer for mobile bottom nav */}
      <div className="h-8 sm:hidden" />
    </div>
  )
}
