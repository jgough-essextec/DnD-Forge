/**
 * SessionView (Epic 32 - Story 32.1)
 *
 * Mobile-optimised single-screen compact character view for at-the-table play.
 * Layout (top to bottom):
 * 1. Top strip: character name, level, class, AC badge, Speed badge
 * 2. HP bar: full width, colour gradient, temp HP overlay, tap to open modal
 * 3. Quick actions row: Roll d20, Short Rest, Long Rest, Conditions
 * 4. Attacks section: card per equipped weapon / cantrip
 * 5. Spell slots strip: compact horizontal circles
 * 6. Key abilities: pinned skills and saves
 * 7. Conditions strip: active condition badges
 * 8. Features with uses: compact limited-use counters
 *
 * Auto-activates at viewport <=640px in view mode. Manual toggle via button.
 */

import { useState, useCallback, useEffect, useMemo } from 'react'
import {
  Dice5,
  Moon,
  Sun,
  AlertCircle,
  Settings,
  Shield,
  Footprints,
  Heart,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useDiceStore } from '@/stores/diceStore'
import { useUIStore } from '@/stores/uiStore'
import type { Character } from '@/types/character'
import type { DerivedStats } from '@/hooks/useCharacterCalculations'
import type { Attack } from '@/types/combat'
import type { Condition } from '@/types/core'
import type { SkillName, AbilityName } from '@/types/core'
import { getClassById } from '@/data/classes'
import type { ClassFeature } from '@/types/class'
import { SessionAttackCard } from './SessionAttackCard'
import { SessionAbilityRow } from './SessionAbilityRow'
import { SessionCustomizeModal } from './SessionCustomizeModal'
import { ConditionBadges } from './conditions/ConditionBadges'
import { SlotCircleRow } from './spells/SlotCircleRow'
import {
  getSessionViewConfig,
  saveSessionViewConfig,
  getDefaultPinnedSkills,
  type SessionViewConfig,
} from '@/utils/session-view'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface SessionViewProps {
  character: Character
  derivedStats: DerivedStats
  /** Callback when HP changes (damage/heal tap opens external modal) */
  onHPTap?: () => void
  /** Callback for applying rest */
  onShortRest?: () => void
  onLongRest?: () => void
  /** Callback for toggling conditions */
  onConditionsClick?: () => void
  /** Callback for removing a condition */
  onRemoveCondition?: (condition: Condition) => void
  /** Callback when spell slot is toggled */
  onSlotToggle?: (level: number, slotIndex: number) => void
  /** Callback when feature uses change */
  onFeatureUseChange?: (featureId: string, currentUses: number) => void
  className?: string
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getHPBarColor(percentage: number): string {
  if (percentage === 0) return 'bg-gray-800'
  if (percentage <= 24) return 'bg-damage-red'
  if (percentage <= 49) return 'bg-orange-500'
  if (percentage <= 74) return 'bg-yellow-500'
  return 'bg-healing-green'
}

function getHPTextColor(percentage: number): string {
  if (percentage === 0) return 'text-gray-500'
  if (percentage <= 24) return 'text-damage-red'
  if (percentage <= 49) return 'text-orange-500'
  if (percentage <= 74) return 'text-yellow-500'
  return 'text-healing-green'
}

function getClassName(character: Character): string {
  if (!character.classes || character.classes.length === 0) return 'Unknown'
  const primary = character.classes[0]
  const classData = getClassById(primary.classId)
  const name = classData?.name ?? primary.classId
  if (character.classes.length > 1) {
    return `${name} +${character.classes.length - 1}`
  }
  return name
}

function getCharacterAttacks(character: Character): Attack[] {
  return character.combatStats?.attacks ?? []
}

function getSpellSlotLevels(character: Character): number[] {
  if (!character.spellcasting) return []
  const slots = character.spellcasting.spellSlots
  return Object.keys(slots)
    .map(Number)
    .filter((level) => (slots[level] ?? 0) > 0)
    .sort((a, b) => a - b)
}

function getFeaturesWithUses(character: Character): ClassFeature[] {
  const features: ClassFeature[] = []
  if (!character.classes) return features

  for (const classSel of character.classes) {
    const classData = getClassById(classSel.classId)
    if (!classData) continue

    for (const levelFeatures of Object.values(classData.features)) {
      for (const feature of levelFeatures) {
        if (
          feature.usesPerRecharge &&
          feature.usesPerRecharge > 0 &&
          feature.level <= classSel.level
        ) {
          features.push(feature)
        }
      }
    }
  }

  return features
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function SessionView({
  character,
  derivedStats,
  onHPTap,
  onShortRest,
  onLongRest,
  onConditionsClick,
  onRemoveCondition,
  onSlotToggle,
  onFeatureUseChange,
  className,
}: SessionViewProps) {
  const roll = useDiceStore((s) => s.roll)
  const diceRollerOpen = useUIStore((s) => s.diceRollerOpen)
  const toggleDiceRoller = useUIStore((s) => s.toggleDiceRoller)

  // Session config
  const [config, setConfig] = useState<SessionViewConfig>(() =>
    getSessionViewConfig(character.id),
  )
  const [customizeOpen, setCustomizeOpen] = useState(false)

  // Reload config when character changes
  useEffect(() => {
    setConfig(getSessionViewConfig(character.id))
  }, [character.id])

  // If no pinned skills configured yet, compute defaults
  const pinnedSkills = useMemo(() => {
    if (config.pinnedSkills.length === 0) {
      return getDefaultPinnedSkills(character)
    }
    return config.pinnedSkills
  }, [config.pinnedSkills, character])

  const handleSaveConfig = useCallback(
    (newConfig: SessionViewConfig) => {
      setConfig(newConfig)
      saveSessionViewConfig(character.id, newConfig)
    },
    [character.id],
  )

  // Quick actions
  const handleRollD20 = useCallback(() => {
    if (!diceRollerOpen) toggleDiceRoller()
    roll([{ type: 'd20', count: 1 }], 0, 'Quick d20 Roll')
  }, [diceRollerOpen, toggleDiceRoller, roll])

  // Derived values
  const hpPercentage =
    character.hpMax > 0 ? (character.hpCurrent / character.hpMax) * 100 : 0
  const attacks = getCharacterAttacks(character)
  const spellSlotLevels = getSpellSlotLevels(character)
  const featuresWithUses = getFeaturesWithUses(character)

  // Proficiency data for skills
  const proficientSkills: SkillName[] = (character.proficiencies?.skills ?? [])
    .filter((sp) => sp.proficient)
    .map((sp) => sp.skill)

  const proficientSaves: AbilityName[] = character.proficiencies?.savingThrows ?? []

  return (
    <div
      className={cn(
        'flex flex-col gap-3 p-3 bg-bg-primary min-h-screen',
        className,
      )}
      data-testid="session-view"
    >
      {/* 1. Top Strip: Name, Level, Class, AC, Speed */}
      <div
        className="flex items-center gap-2 flex-wrap"
        data-testid="session-top-strip"
      >
        <div className="flex-1 min-w-0">
          <h1
            className="text-xl font-heading font-bold text-parchment truncate"
            data-testid="session-character-name"
          >
            {character.name}
          </h1>
          <p className="text-xs text-parchment/60">
            Level {character.level} {getClassName(character)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* AC Badge */}
          <div
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-bg-secondary border border-parchment/20"
            data-testid="session-ac-badge"
          >
            <Shield className="w-4 h-4 text-accent-gold" aria-hidden="true" />
            <span className="text-sm font-bold text-accent-gold">
              {derivedStats.armorClass}
            </span>
          </div>
          {/* Speed Badge */}
          <div
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-bg-secondary border border-parchment/20"
            data-testid="session-speed-badge"
          >
            <Footprints className="w-4 h-4 text-parchment/70" aria-hidden="true" />
            <span className="text-sm font-bold text-parchment/70">
              {character.speed.walk}ft
            </span>
          </div>
          {/* Settings */}
          <button
            type="button"
            onClick={() => setCustomizeOpen(true)}
            className="p-2 rounded-lg hover:bg-parchment/10 text-parchment/50 hover:text-parchment transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Customize session view"
            data-testid="session-customize-button"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 2. HP Bar */}
      <button
        type="button"
        onClick={onHPTap}
        className="w-full rounded-xl bg-bg-secondary border border-parchment/20 p-3 text-left min-h-[44px]"
        aria-label={`Hit points: ${character.hpCurrent} of ${character.hpMax}. Tap to adjust.`}
        data-testid="session-hp-bar"
      >
        <div className="flex items-center gap-2 mb-1.5">
          <Heart
            className={cn('w-5 h-5', getHPTextColor(hpPercentage))}
            aria-hidden="true"
          />
          <span
            className={cn(
              'text-2xl font-heading font-bold',
              getHPTextColor(hpPercentage),
            )}
            data-testid="session-hp-current"
          >
            {character.hpCurrent}
          </span>
          <span className="text-sm text-parchment/50">
            / {character.hpMax}
          </span>
          {character.tempHp > 0 && (
            <span
              className="text-xs text-blue-300 bg-blue-500/15 px-1.5 py-0.5 rounded"
              data-testid="session-temp-hp"
            >
              +{character.tempHp} temp
            </span>
          )}
        </div>
        <div className="relative h-3 bg-bg-primary/50 rounded-full overflow-hidden">
          <div
            className={cn(
              'h-full transition-all duration-300 rounded-full',
              getHPBarColor(hpPercentage),
            )}
            style={{ width: `${Math.min(hpPercentage, 100)}%` }}
            data-testid="session-hp-fill"
          />
          {character.tempHp > 0 && (
            <div
              className="absolute top-0 h-full bg-blue-500/60 rounded-full transition-all duration-300"
              style={{
                left: `${Math.min(hpPercentage, 100)}%`,
                width: `${Math.min(
                  (character.tempHp / character.hpMax) * 100,
                  100 - Math.min(hpPercentage, 100),
                )}%`,
              }}
              data-testid="session-temp-hp-overlay"
            />
          )}
        </div>
      </button>

      {/* 3. Quick Actions Row */}
      <div
        className="grid grid-cols-4 gap-2"
        data-testid="session-quick-actions"
      >
        <button
          type="button"
          onClick={handleRollD20}
          className={cn(
            'flex flex-col items-center justify-center gap-1 py-3 rounded-lg',
            'bg-bg-secondary border border-parchment/20',
            'hover:border-accent-gold/40 hover:bg-accent-gold/5 transition-colors',
            'min-h-[44px] cursor-pointer',
          )}
          aria-label="Roll d20"
          data-testid="quick-action-roll-d20"
        >
          <Dice5 className="w-5 h-5 text-accent-gold" aria-hidden="true" />
          <span className="text-[10px] text-parchment/60 font-medium">d20</span>
        </button>
        <button
          type="button"
          onClick={onShortRest}
          className={cn(
            'flex flex-col items-center justify-center gap-1 py-3 rounded-lg',
            'bg-bg-secondary border border-parchment/20',
            'hover:border-healing-green/40 hover:bg-healing-green/5 transition-colors',
            'min-h-[44px] cursor-pointer',
          )}
          aria-label="Short Rest"
          data-testid="quick-action-short-rest"
        >
          <Moon className="w-5 h-5 text-healing-green" aria-hidden="true" />
          <span className="text-[10px] text-parchment/60 font-medium">Short</span>
        </button>
        <button
          type="button"
          onClick={onLongRest}
          className={cn(
            'flex flex-col items-center justify-center gap-1 py-3 rounded-lg',
            'bg-bg-secondary border border-parchment/20',
            'hover:border-blue-400/40 hover:bg-blue-500/5 transition-colors',
            'min-h-[44px] cursor-pointer',
          )}
          aria-label="Long Rest"
          data-testid="quick-action-long-rest"
        >
          <Sun className="w-5 h-5 text-blue-400" aria-hidden="true" />
          <span className="text-[10px] text-parchment/60 font-medium">Long</span>
        </button>
        <button
          type="button"
          onClick={onConditionsClick}
          className={cn(
            'flex flex-col items-center justify-center gap-1 py-3 rounded-lg relative',
            'bg-bg-secondary border border-parchment/20',
            'hover:border-purple-400/40 hover:bg-purple-500/5 transition-colors',
            'min-h-[44px] cursor-pointer',
          )}
          aria-label="Conditions"
          data-testid="quick-action-conditions"
        >
          <AlertCircle className="w-5 h-5 text-purple-400" aria-hidden="true" />
          <span className="text-[10px] text-parchment/60 font-medium">Cond.</span>
          {character.conditions.length > 0 && (
            <span
              className="absolute top-1 right-1 w-4 h-4 rounded-full bg-purple-500 text-white text-[9px] flex items-center justify-center font-bold"
              data-testid="conditions-count-badge"
            >
              {character.conditions.length}
            </span>
          )}
        </button>
      </div>

      {/* 4. Attacks Section */}
      {attacks.length > 0 && (
        <section aria-label="Attacks" data-testid="session-attacks">
          <h2 className="text-xs font-semibold text-parchment/50 uppercase tracking-wider mb-2">
            Attacks
          </h2>
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
            {attacks.map((attack) => (
              <SessionAttackCard key={attack.name} attack={attack} />
            ))}
          </div>
        </section>
      )}

      {/* 5. Spell Slots Strip */}
      {config.showSpellSlots && spellSlotLevels.length > 0 && character.spellcasting && (
        <section aria-label="Spell Slots" data-testid="session-spell-slots">
          <h2 className="text-xs font-semibold text-parchment/50 uppercase tracking-wider mb-2">
            Spell Slots
          </h2>
          <div className="space-y-1.5 bg-bg-secondary rounded-lg border border-parchment/20 p-2">
            {spellSlotLevels.map((level) => (
              <SlotCircleRow
                key={level}
                level={level}
                total={character.spellcasting!.spellSlots[level] ?? 0}
                used={character.spellcasting!.usedSpellSlots[level] ?? 0}
                onToggle={(slotIndex) => onSlotToggle?.(level, slotIndex)}
                label={`${level}${level === 1 ? 'st' : level === 2 ? 'nd' : level === 3 ? 'rd' : 'th'}`}
              />
            ))}
          </div>
        </section>
      )}

      {/* 6. Key Abilities (Pinned Skills) */}
      <section aria-label="Key Abilities" data-testid="session-key-abilities">
        <h2 className="text-xs font-semibold text-parchment/50 uppercase tracking-wider mb-2">
          Key Abilities
        </h2>
        <SessionAbilityRow
          pinnedSkills={pinnedSkills}
          skillModifiers={derivedStats.skillModifiers}
          savingThrows={derivedStats.savingThrows}
          proficientSkills={proficientSkills}
          proficientSaves={proficientSaves}
        />
      </section>

      {/* 7. Conditions Strip */}
      {config.showConditions && (
        <section aria-label="Conditions" data-testid="session-conditions">
          <h2 className="text-xs font-semibold text-parchment/50 uppercase tracking-wider mb-2">
            Conditions
          </h2>
          <ConditionBadges
            conditions={character.conditions}
            onRemove={onRemoveCondition}
            onAddClick={onConditionsClick}
          />
        </section>
      )}

      {/* 8. Features with Uses */}
      {config.showFeatureUses && featuresWithUses.length > 0 && (
        <section aria-label="Features" data-testid="session-features">
          <h2 className="text-xs font-semibold text-parchment/50 uppercase tracking-wider mb-2">
            Features
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {featuresWithUses.map((feature) => {
              const maxUses = feature.usesPerRecharge ?? 0
              const currentUses = feature.currentUses ?? 0
              const remaining = maxUses - currentUses
              const rechargeLabel =
                feature.recharge === 'shortRest' ? 'SR' : 'LR'

              return (
                <button
                  key={feature.id}
                  type="button"
                  onClick={() =>
                    onFeatureUseChange?.(
                      feature.id,
                      currentUses < maxUses ? currentUses + 1 : 0,
                    )
                  }
                  className={cn(
                    'flex items-center justify-between gap-1 px-3 py-2 rounded-lg',
                    'bg-bg-secondary border border-parchment/20',
                    'hover:border-accent-gold/30 transition-colors',
                    'min-h-[44px] text-left cursor-pointer',
                  )}
                  aria-label={`${feature.name}: ${remaining} of ${maxUses} uses remaining`}
                  data-testid={`feature-counter-${feature.id}`}
                >
                  <span className="text-xs text-parchment/80 font-medium truncate flex-1">
                    {feature.name}
                  </span>
                  <span className="flex items-center gap-1 flex-shrink-0">
                    <span
                      className={cn(
                        'text-sm font-bold tabular-nums',
                        remaining === 0
                          ? 'text-parchment/30'
                          : 'text-accent-gold',
                      )}
                      data-testid={`feature-uses-${feature.id}`}
                    >
                      {remaining}/{maxUses}
                    </span>
                    <span className="text-[9px] text-parchment/40">
                      {rechargeLabel}
                    </span>
                  </span>
                </button>
              )
            })}
          </div>
        </section>
      )}

      {/* Customize Modal */}
      <SessionCustomizeModal
        isOpen={customizeOpen}
        onClose={() => setCustomizeOpen(false)}
        config={{ ...config, pinnedSkills }}
        onSave={handleSaveConfig}
      />
    </div>
  )
}
