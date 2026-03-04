/**
 * RacialChoicePickers -- Components for special racial choices.
 *
 * Exports:
 * - HalfElfBonusPicker: choose 2 ability bonuses from non-CHA abilities
 * - VariantHumanPicker: choose feat, skill, and 2 ability bonuses
 * - HighElfCantripPicker: choose 1 wizard cantrip
 * - DragonbornAncestryPicker: choose draconic ancestry
 */

import { useMemo } from 'react'
import { cn } from '@/lib/utils'
import { CountSelector } from '@/components/shared/CountSelector'
import { ChoiceGroup } from '@/components/shared/ChoiceGroup'
import { ABILITY_NAMES, SKILL_NAMES, LANGUAGES } from '@/types/core'
import type { AbilityName, SkillName, Language } from '@/types/core'
import type { AbilityBonus } from '@/types/race'
import { FEATS } from '@/data/feats'
import { SPELLS } from '@/data/spells'

// =============================================================================
// Shared Helpers
// =============================================================================

const ABILITY_DISPLAY: Record<AbilityName, string> = {
  strength: 'Strength',
  dexterity: 'Dexterity',
  constitution: 'Constitution',
  intelligence: 'Intelligence',
  wisdom: 'Wisdom',
  charisma: 'Charisma',
}

const ABILITY_SHORT: Record<AbilityName, string> = {
  strength: 'STR',
  dexterity: 'DEX',
  constitution: 'CON',
  intelligence: 'INT',
  wisdom: 'WIS',
  charisma: 'CHA',
}

function formatLanguage(lang: Language): string {
  return lang
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

function formatSkillName(skill: SkillName): string {
  return skill
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

// =============================================================================
// HalfElfBonusPicker
// =============================================================================

interface HalfElfBonusPickerProps {
  selectedBonuses: AbilityBonus[]
  onBonusChange: (bonuses: AbilityBonus[]) => void
}

/**
 * Half-Elf gets +2 CHA (fixed) and +1 to two other abilities.
 * This component lets the user pick 2 from STR, DEX, CON, INT, WIS.
 */
export function HalfElfBonusPicker({
  selectedBonuses,
  onBonusChange,
}: HalfElfBonusPickerProps) {
  const availableAbilities: AbilityName[] = [
    'strength',
    'dexterity',
    'constitution',
    'intelligence',
    'wisdom',
  ]

  const handleToggle = (ability: AbilityName) => {
    const existing = selectedBonuses.find((b) => b.abilityName === ability)
    if (existing) {
      onBonusChange(selectedBonuses.filter((b) => b.abilityName !== ability))
    } else if (selectedBonuses.length < 2) {
      onBonusChange([...selectedBonuses, { abilityName: ability, bonus: 1 }])
    }
  }

  return (
    <div data-testid="half-elf-bonus-picker">
      <h4 className="text-sm font-semibold text-parchment mb-1">
        Ability Score Bonuses
      </h4>
      <p className="text-xs text-parchment/60 mb-3">
        Choose 2 abilities to increase by +1 (CHA +2 is fixed)
      </p>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-parchment/50">
          <span className="font-semibold text-parchment">{selectedBonuses.length}</span> of 2 selected
        </span>
      </div>
      <div className="grid grid-cols-5 gap-2">
        {availableAbilities.map((ability) => {
          const isSelected = selectedBonuses.some((b) => b.abilityName === ability)
          const isDisabled = selectedBonuses.length >= 2 && !isSelected

          return (
            <button
              key={ability}
              type="button"
              onClick={() => handleToggle(ability)}
              disabled={isDisabled}
              aria-pressed={isSelected}
              aria-label={`${ABILITY_DISPLAY[ability]} +1`}
              className={cn(
                'flex flex-col items-center gap-1 p-2 rounded-lg border-2 transition-all text-center',
                isSelected
                  ? 'border-accent-gold bg-accent-gold/10 text-accent-gold'
                  : isDisabled
                    ? 'border-parchment/10 text-parchment/30 cursor-not-allowed'
                    : 'border-parchment/20 text-parchment/70 hover:border-parchment/40 cursor-pointer',
              )}
            >
              <span className="text-xs font-bold">{ABILITY_SHORT[ability]}</span>
              <span className="text-xs">+1</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// =============================================================================
// VariantHumanPicker
// =============================================================================

interface VariantHumanPickerProps {
  selectedBonuses: AbilityBonus[]
  onBonusChange: (bonuses: AbilityBonus[]) => void
  selectedSkill: SkillName | null
  onSkillChange: (skill: SkillName | null) => void
  selectedFeat: string | null
  onFeatChange: (featId: string | null) => void
}

/**
 * Variant Human gets +1 to two different abilities, 1 skill, and 1 feat.
 */
export function VariantHumanPicker({
  selectedBonuses,
  onBonusChange,
  selectedSkill,
  onSkillChange,
  selectedFeat,
  onFeatChange,
}: VariantHumanPickerProps) {
  const handleToggleAbility = (ability: AbilityName) => {
    const existing = selectedBonuses.find((b) => b.abilityName === ability)
    if (existing) {
      onBonusChange(selectedBonuses.filter((b) => b.abilityName !== ability))
    } else if (selectedBonuses.length < 2) {
      onBonusChange([...selectedBonuses, { abilityName: ability, bonus: 1 }])
    }
  }

  return (
    <div className="space-y-4" data-testid="variant-human-picker">
      {/* Ability bonuses */}
      <div>
        <h4 className="text-sm font-semibold text-parchment mb-1">
          Ability Score Bonuses
        </h4>
        <p className="text-xs text-parchment/60 mb-3">
          Choose 2 different abilities to increase by +1
        </p>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-parchment/50">
            <span className="font-semibold text-parchment">{selectedBonuses.length}</span> of 2 selected
          </span>
        </div>
        <div className="grid grid-cols-6 gap-2">
          {ABILITY_NAMES.map((ability) => {
            const isSelected = selectedBonuses.some((b) => b.abilityName === ability)
            const isDisabled = selectedBonuses.length >= 2 && !isSelected

            return (
              <button
                key={ability}
                type="button"
                onClick={() => handleToggleAbility(ability)}
                disabled={isDisabled}
                aria-pressed={isSelected}
                aria-label={`${ABILITY_DISPLAY[ability]} +1`}
                className={cn(
                  'flex flex-col items-center gap-1 p-2 rounded-lg border-2 transition-all text-center',
                  isSelected
                    ? 'border-accent-gold bg-accent-gold/10 text-accent-gold'
                    : isDisabled
                      ? 'border-parchment/10 text-parchment/30 cursor-not-allowed'
                      : 'border-parchment/20 text-parchment/70 hover:border-parchment/40 cursor-pointer',
                )}
              >
                <span className="text-xs font-bold">{ABILITY_SHORT[ability]}</span>
                <span className="text-xs">+1</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Skill proficiency */}
      <div>
        <h4 className="text-sm font-semibold text-parchment mb-1">
          Skill Proficiency
        </h4>
        <p className="text-xs text-parchment/60 mb-2">
          Choose 1 skill proficiency
        </p>
        <select
          value={selectedSkill ?? ''}
          onChange={(e) =>
            onSkillChange(e.target.value ? (e.target.value as SkillName) : null)
          }
          aria-label="Choose a skill proficiency"
          className={cn(
            'w-full rounded-lg border border-parchment/20 bg-bg-secondary',
            'px-3 py-2 text-parchment text-sm',
            'focus:outline-none focus:border-accent-gold/50 focus:ring-1 focus:ring-accent-gold/30',
          )}
        >
          <option value="">Select a skill...</option>
          {SKILL_NAMES.map((skill) => (
            <option key={skill} value={skill}>
              {formatSkillName(skill)}
            </option>
          ))}
        </select>
      </div>

      {/* Feat selection */}
      <div>
        <h4 className="text-sm font-semibold text-parchment mb-1">Feat</h4>
        <p className="text-xs text-parchment/60 mb-2">Choose 1 feat</p>
        <select
          value={selectedFeat ?? ''}
          onChange={(e) =>
            onFeatChange(e.target.value || null)
          }
          aria-label="Choose a feat"
          className={cn(
            'w-full rounded-lg border border-parchment/20 bg-bg-secondary',
            'px-3 py-2 text-parchment text-sm',
            'focus:outline-none focus:border-accent-gold/50 focus:ring-1 focus:ring-accent-gold/30',
          )}
        >
          <option value="">Select a feat...</option>
          {FEATS.map((feat) => (
            <option key={feat.id} value={feat.id}>
              {feat.name}
            </option>
          ))}
        </select>
        {selectedFeat && (
          <FeatDescription featId={selectedFeat} />
        )}
      </div>
    </div>
  )
}

/** Displays feat description when selected */
function FeatDescription({ featId }: { featId: string }) {
  const feat = FEATS.find((f) => f.id === featId)
  if (!feat) return null

  return (
    <div className="mt-2 p-3 rounded-lg bg-parchment/5 border border-parchment/10" data-testid="feat-description">
      <p className="text-xs text-parchment/70">{feat.description}</p>
      {feat.mechanicalEffects.length > 0 && (
        <ul className="mt-2 space-y-1">
          {feat.mechanicalEffects.map((effect, i) => (
            <li key={i} className="text-xs text-parchment/60 flex items-start gap-1">
              <span className="text-accent-gold mt-0.5">*</span>
              {effect}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

// =============================================================================
// HighElfCantripPicker
// =============================================================================

interface HighElfCantripPickerProps {
  selectedCantrip: string | null
  onCantripChange: (cantripId: string | null) => void
}

/**
 * High Elf gets 1 wizard cantrip.
 * Filters from spell data where class includes Wizard and level = 0.
 */
export function HighElfCantripPicker({
  selectedCantrip,
  onCantripChange,
}: HighElfCantripPickerProps) {
  const wizardCantrips = useMemo(
    () =>
      SPELLS.filter(
        (spell) => spell.level === 0 && spell.classes.includes('wizard'),
      ),
    [],
  )

  return (
    <div data-testid="high-elf-cantrip-picker">
      <h4 className="text-sm font-semibold text-parchment mb-1">
        Wizard Cantrip
      </h4>
      <p className="text-xs text-parchment/60 mb-2">
        Choose 1 cantrip from the wizard spell list
      </p>
      <select
        value={selectedCantrip ?? ''}
        onChange={(e) =>
          onCantripChange(e.target.value || null)
        }
        aria-label="Choose a wizard cantrip"
        className={cn(
          'w-full rounded-lg border border-parchment/20 bg-bg-secondary',
          'px-3 py-2 text-parchment text-sm',
          'focus:outline-none focus:border-accent-gold/50 focus:ring-1 focus:ring-accent-gold/30',
        )}
      >
        <option value="">Select a cantrip...</option>
        {wizardCantrips.map((spell) => (
          <option key={spell.id} value={spell.id}>
            {spell.name} ({spell.school})
          </option>
        ))}
      </select>
      {selectedCantrip && (
        <CantripDescription cantripId={selectedCantrip} cantrips={wizardCantrips} />
      )}
    </div>
  )
}

function CantripDescription({
  cantripId,
  cantrips,
}: {
  cantripId: string
  cantrips: { id: string; name: string; description: string; school: string }[]
}) {
  const cantrip = cantrips.find((c) => c.id === cantripId)
  if (!cantrip) return null

  return (
    <div className="mt-2 p-3 rounded-lg bg-parchment/5 border border-parchment/10" data-testid="cantrip-description">
      <p className="text-xs font-medium text-parchment">{cantrip.name}</p>
      <p className="text-xs text-parchment/60 capitalize">{cantrip.school}</p>
      <p className="text-xs text-parchment/70 mt-1">{cantrip.description}</p>
    </div>
  )
}

// =============================================================================
// DragonbornAncestryPicker
// =============================================================================

interface DragonbornAncestryPickerProps {
  selectedAncestry: string | null
  onAncestryChange: (ancestry: string | null) => void
}

export interface DraconicAncestry {
  id: string
  dragon: string
  damageType: string
  breathWeapon: string
  saveType: string
}

export const DRACONIC_ANCESTRIES: DraconicAncestry[] = [
  { id: 'black', dragon: 'Black', damageType: 'Acid', breathWeapon: '5x30 ft line', saveType: 'DEX' },
  { id: 'blue', dragon: 'Blue', damageType: 'Lightning', breathWeapon: '5x30 ft line', saveType: 'DEX' },
  { id: 'brass', dragon: 'Brass', damageType: 'Fire', breathWeapon: '5x30 ft line', saveType: 'DEX' },
  { id: 'bronze', dragon: 'Bronze', damageType: 'Lightning', breathWeapon: '5x30 ft line', saveType: 'DEX' },
  { id: 'copper', dragon: 'Copper', damageType: 'Acid', breathWeapon: '5x30 ft line', saveType: 'DEX' },
  { id: 'gold', dragon: 'Gold', damageType: 'Fire', breathWeapon: '15 ft cone', saveType: 'DEX' },
  { id: 'green', dragon: 'Green', damageType: 'Poison', breathWeapon: '15 ft cone', saveType: 'CON' },
  { id: 'red', dragon: 'Red', damageType: 'Fire', breathWeapon: '15 ft cone', saveType: 'DEX' },
  { id: 'silver', dragon: 'Silver', damageType: 'Cold', breathWeapon: '15 ft cone', saveType: 'CON' },
  { id: 'white', dragon: 'White', damageType: 'Cold', breathWeapon: '15 ft cone', saveType: 'CON' },
]

/**
 * Dragonborn chooses 1 of 10 draconic ancestries.
 */
export function DragonbornAncestryPicker({
  selectedAncestry,
  onAncestryChange,
}: DragonbornAncestryPickerProps) {
  const options = DRACONIC_ANCESTRIES.map((a) => ({
    value: a.id,
    label: `${a.dragon} Dragon`,
    description: `${a.damageType} -- ${a.breathWeapon} (${a.saveType} save)`,
  }))

  return (
    <div data-testid="dragonborn-ancestry-picker">
      <h4 className="text-sm font-semibold text-parchment mb-1">
        Draconic Ancestry
      </h4>
      <p className="text-xs text-parchment/60 mb-2">
        Choose your draconic ancestry to determine breath weapon and damage resistance
      </p>
      <ChoiceGroup
        options={options}
        selectedValue={selectedAncestry}
        onSelect={(val) => onAncestryChange(val)}
        label="Choose a draconic ancestry"
      />
    </div>
  )
}

// =============================================================================
// LanguagePicker
// =============================================================================

interface LanguagePickerProps {
  knownLanguages: Language[]
  selectedLanguages: Language[]
  onLanguageChange: (languages: Language[]) => void
  maxSelections: number
}

/**
 * Generic language picker that excludes already-known languages.
 */
export function LanguagePicker({
  knownLanguages,
  selectedLanguages,
  onLanguageChange,
  maxSelections,
}: LanguagePickerProps) {
  const knownSet = new Set(knownLanguages)
  const availableLanguages = LANGUAGES.filter((lang) => !knownSet.has(lang))

  const items = availableLanguages.map((lang) => ({
    id: lang,
    label: formatLanguage(lang),
  }))

  const selectedItems = items.filter((item) =>
    selectedLanguages.includes(item.id as Language),
  )

  return (
    <div data-testid="language-picker">
      <h4 className="text-sm font-semibold text-parchment mb-1">
        Extra Language{maxSelections > 1 ? 's' : ''}
      </h4>
      <p className="text-xs text-parchment/60 mb-2">
        Choose {maxSelections} additional language{maxSelections > 1 ? 's' : ''}
      </p>
      {maxSelections === 1 ? (
        <select
          value={selectedLanguages[0] ?? ''}
          onChange={(e) =>
            onLanguageChange(
              e.target.value ? [e.target.value as Language] : [],
            )
          }
          aria-label="Choose an extra language"
          className={cn(
            'w-full rounded-lg border border-parchment/20 bg-bg-secondary',
            'px-3 py-2 text-parchment text-sm',
            'focus:outline-none focus:border-accent-gold/50 focus:ring-1 focus:ring-accent-gold/30',
          )}
        >
          <option value="">Select a language...</option>
          {items.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </select>
      ) : (
        <CountSelector
          items={items}
          selectedItems={selectedItems}
          onSelectionChange={(selected) =>
            onLanguageChange(selected.map((s) => s.id as Language))
          }
          getKey={(item) => item.id}
          getLabel={(item) => item.label}
          maxSelections={maxSelections}
        />
      )}
    </div>
  )
}

// =============================================================================
// SkillPicker
// =============================================================================

interface SkillPickerProps {
  selectedSkills: SkillName[]
  onSkillChange: (skills: SkillName[]) => void
  maxSelections: number
  excludeSkills?: SkillName[]
}

/**
 * Choose N skills from the full skill list.
 * Used by Half-Elf (2 skills) and can be reused by other components.
 */
export function SkillPicker({
  selectedSkills,
  onSkillChange,
  maxSelections,
  excludeSkills = [],
}: SkillPickerProps) {
  const excludeSet = new Set(excludeSkills)
  const availableSkills = SKILL_NAMES.filter((s) => !excludeSet.has(s))

  const items = availableSkills.map((skill) => ({
    id: skill,
    label: formatSkillName(skill),
  }))

  const selectedItems = items.filter((item) =>
    selectedSkills.includes(item.id as SkillName),
  )

  return (
    <div data-testid="skill-picker">
      <h4 className="text-sm font-semibold text-parchment mb-1">
        Skill Proficiencies
      </h4>
      <p className="text-xs text-parchment/60 mb-2">
        Choose {maxSelections} skill{maxSelections > 1 ? 's' : ''}
      </p>
      <CountSelector
        items={items}
        selectedItems={selectedItems}
        onSelectionChange={(selected) =>
          onSkillChange(selected.map((s) => s.id as SkillName))
        }
        getKey={(item) => item.id}
        getLabel={(item) => item.label}
        maxSelections={maxSelections}
      />
    </div>
  )
}
