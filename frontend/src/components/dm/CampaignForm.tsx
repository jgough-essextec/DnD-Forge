import { useState } from 'react'
import { BookOpen, Shield, Swords, GraduationCap } from 'lucide-react'
import type { CampaignSettings, HouseRules } from '@/types/campaign'
import {
  DEFAULT_CAMPAIGN_SETTINGS,
} from '@/utils/campaign'
import type { CampaignAbilityScoreMethod } from '@/types/campaign'

export interface CampaignFormData {
  name: string
  description: string
  settings: CampaignSettings
}

interface CampaignFormProps {
  initialData?: Partial<CampaignFormData>
  onSubmit: (data: CampaignFormData) => void
  submitLabel?: string
  isSubmitting?: boolean
  showHouseRules?: boolean
}

const ABILITY_SCORE_OPTIONS: { value: CampaignAbilityScoreMethod; label: string }[] = [
  { value: 'any', label: 'Any Method' },
  { value: 'standard', label: 'Standard Array' },
  { value: 'pointBuy', label: 'Point Buy' },
  { value: 'rolled', label: 'Rolled (4d6 drop lowest)' },
]

const SOURCE_BOOKS = [
  'PHB',
  'DMG',
  'MM',
  'XGtE',
  'TCoE',
  'VGtM',
  'MToF',
  'FToD',
]

export function CampaignForm({
  initialData,
  onSubmit,
  submitLabel = 'Save',
  isSubmitting = false,
  showHouseRules = true,
}: CampaignFormProps) {
  const [name, setName] = useState(initialData?.name ?? '')
  const [description, setDescription] = useState(initialData?.description ?? '')
  const [settings, setSettings] = useState<CampaignSettings>(
    initialData?.settings ?? DEFAULT_CAMPAIGN_SETTINGS
  )

  const handleHouseRuleChange = <K extends keyof HouseRules>(
    key: K,
    value: HouseRules[K]
  ) => {
    setSettings((prev) => ({
      ...prev,
      houseRules: {
        ...prev.houseRules,
        [key]: value,
      },
    }))
  }

  const handleSourceToggle = (source: string) => {
    setSettings((prev) => {
      const current = prev.houseRules.allowedSources
      const next = current.includes(source)
        ? current.filter((s) => s !== source)
        : [...current, source]
      return {
        ...prev,
        houseRules: { ...prev.houseRules, allowedSources: next },
      }
    })
  }

  const handleUseStandardRules = () => {
    setSettings(DEFAULT_CAMPAIGN_SETTINGS)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    onSubmit({ name: name.trim(), description: description.trim(), settings })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Info */}
      <div className="space-y-4">
        <div>
          <label
            htmlFor="campaign-name"
            className="block text-sm font-medium text-parchment mb-1"
          >
            Campaign Name *
          </label>
          <input
            id="campaign-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Lost Mine of Phandelver"
            className="w-full px-3 py-2 rounded-lg bg-bg-primary border border-parchment/20 text-parchment placeholder:text-parchment/40 focus:outline-none focus:border-accent-gold"
            required
          />
        </div>

        <div>
          <label
            htmlFor="campaign-desc"
            className="block text-sm font-medium text-parchment mb-1"
          >
            Description
          </label>
          <textarea
            id="campaign-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="A brief description of your campaign..."
            rows={3}
            className="w-full px-3 py-2 rounded-lg bg-bg-primary border border-parchment/20 text-parchment placeholder:text-parchment/40 focus:outline-none focus:border-accent-gold resize-none"
          />
        </div>

        <div>
          <label
            htmlFor="xp-tracking"
            className="block text-sm font-medium text-parchment mb-1"
          >
            XP Tracking
          </label>
          <select
            id="xp-tracking"
            value={settings.xpTracking}
            onChange={(e) =>
              setSettings((prev) => ({
                ...prev,
                xpTracking: e.target.value as 'milestone' | 'xp',
              }))
            }
            className="w-full px-3 py-2 rounded-lg bg-bg-primary border border-parchment/20 text-parchment focus:outline-none focus:border-accent-gold"
          >
            <option value="milestone">Milestone</option>
            <option value="xp">Experience Points</option>
          </select>
        </div>
      </div>

      {/* House Rules */}
      {showHouseRules && (
        <div className="space-y-4 border-t border-parchment/10 pt-4">
          <div className="flex items-center justify-between">
            <h3 className="font-heading text-lg text-accent-gold flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              House Rules
            </h3>
            <button
              type="button"
              onClick={handleUseStandardRules}
              className="text-sm text-accent-gold hover:text-accent-gold/80 underline"
            >
              Use Standard Rules
            </button>
          </div>

          {/* Allowed Sources */}
          <div>
            <label className="block text-sm font-medium text-parchment mb-2">
              Allowed Source Books
            </label>
            <div className="flex flex-wrap gap-2">
              {SOURCE_BOOKS.map((book) => (
                <button
                  key={book}
                  type="button"
                  onClick={() => handleSourceToggle(book)}
                  className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                    settings.houseRules.allowedSources.includes(book)
                      ? 'bg-accent-gold/20 border-accent-gold text-accent-gold'
                      : 'border-parchment/20 text-parchment/60 hover:border-parchment/40'
                  }`}
                >
                  {book}
                </button>
              ))}
            </div>
          </div>

          {/* Ability Score Method */}
          <div>
            <label
              htmlFor="ability-method"
              className="block text-sm font-medium text-parchment mb-1 flex items-center gap-2"
            >
              <GraduationCap className="w-4 h-4" />
              Ability Score Method
            </label>
            <select
              id="ability-method"
              value={settings.houseRules.abilityScoreMethod}
              onChange={(e) =>
                handleHouseRuleChange(
                  'abilityScoreMethod',
                  e.target.value as CampaignAbilityScoreMethod
                )
              }
              className="w-full px-3 py-2 rounded-lg bg-bg-primary border border-parchment/20 text-parchment focus:outline-none focus:border-accent-gold"
            >
              {ABILITY_SCORE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Starting Level */}
          <div>
            <label
              htmlFor="starting-level"
              className="block text-sm font-medium text-parchment mb-1"
            >
              Starting Level
            </label>
            <input
              id="starting-level"
              type="number"
              min={1}
              max={20}
              value={settings.houseRules.startingLevel}
              onChange={(e) =>
                handleHouseRuleChange('startingLevel', Number(e.target.value))
              }
              className="w-full px-3 py-2 rounded-lg bg-bg-primary border border-parchment/20 text-parchment focus:outline-none focus:border-accent-gold"
            />
          </div>

          {/* Starting Gold (optional) */}
          <div>
            <label
              htmlFor="starting-gold"
              className="block text-sm font-medium text-parchment mb-1"
            >
              Starting Gold (optional)
            </label>
            <input
              id="starting-gold"
              type="number"
              min={0}
              value={settings.houseRules.startingGold ?? ''}
              onChange={(e) =>
                handleHouseRuleChange(
                  'startingGold',
                  e.target.value ? Number(e.target.value) : undefined
                )
              }
              placeholder="Use class default"
              className="w-full px-3 py-2 rounded-lg bg-bg-primary border border-parchment/20 text-parchment placeholder:text-parchment/40 focus:outline-none focus:border-accent-gold"
            />
          </div>

          {/* Toggle Options */}
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.houseRules.allowMulticlass}
                onChange={(e) =>
                  handleHouseRuleChange('allowMulticlass', e.target.checked)
                }
                className="w-4 h-4 rounded border-parchment/20 accent-accent-gold"
              />
              <span className="text-sm text-parchment flex items-center gap-2">
                <Swords className="w-4 h-4" />
                Allow Multiclassing
              </span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.houseRules.allowFeats}
                onChange={(e) =>
                  handleHouseRuleChange('allowFeats', e.target.checked)
                }
                className="w-4 h-4 rounded border-parchment/20 accent-accent-gold"
              />
              <span className="text-sm text-parchment flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Allow Feats
              </span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.houseRules.encumbranceVariant}
                onChange={(e) =>
                  handleHouseRuleChange('encumbranceVariant', e.target.checked)
                }
                className="w-4 h-4 rounded border-parchment/20 accent-accent-gold"
              />
              <span className="text-sm text-parchment">
                Variant Encumbrance
              </span>
            </label>
          </div>
        </div>
      )}

      {/* Submit */}
      <div className="flex justify-end pt-4">
        <button
          type="submit"
          disabled={!name.trim() || isSubmitting}
          className="px-6 py-2 rounded-lg bg-accent-gold text-bg-primary font-semibold hover:bg-accent-gold/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? 'Saving...' : submitLabel}
        </button>
      </div>
    </form>
  )
}

export { DEFAULT_HOUSE_RULES, DEFAULT_CAMPAIGN_SETTINGS } from '@/utils/campaign'
