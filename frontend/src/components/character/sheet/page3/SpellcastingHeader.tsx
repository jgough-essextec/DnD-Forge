/**
 * SpellcastingHeader Component (Story 19.1 - Epic 19)
 *
 * Displays spellcasting stats at the top of Page 3:
 * - Spellcasting Class
 * - Spellcasting Ability
 * - Spell Save DC (with tooltip breakdown)
 * - Spell Attack Bonus (with tooltip breakdown)
 */

import { useCharacterSheet } from '@/components/character/CharacterSheetProvider'
import { ModifierBadge } from '@/components/shared/ModifierBadge'
import { GameTermTooltip } from '@/components/shared/GameTermTooltip'
import { getClassById } from '@/data/classes'
import { cn } from '@/lib/utils'

export function SpellcastingHeader() {
  const { character, editableCharacter, derivedStats } = useCharacterSheet()

  const activeCharacter = character
    ? { ...character, ...editableCharacter }
    : null

  if (!activeCharacter?.spellcasting) return null

  const spellcastingData = activeCharacter.spellcasting
  const profBonus = derivedStats.proficiencyBonus
  const abilityMod = derivedStats.abilityModifiers[spellcastingData.ability]
  const spellSaveDC = derivedStats.spellSaveDC ?? 0
  const spellAttackBonus = derivedStats.spellAttackBonus ?? 0

  // Get primary spellcasting class
  const spellcastingClass = activeCharacter.classes.find(
    (cls) => {
      const classData = getClassById(cls.classId)
      return classData?.spellcasting !== undefined
    }
  )

  const spellcastingClassName = spellcastingClass
    ? getClassById(spellcastingClass.classId)?.name ?? 'Unknown'
    : 'Unknown'

  const abilityName = spellcastingData.ability.charAt(0).toUpperCase() + spellcastingData.ability.slice(1)

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4" data-testid="spellcasting-header">
      {/* Spellcasting Class */}
      <StatBox
        label="Spellcasting Class"
        value={spellcastingClassName}
        testId="spellcasting-class"
      />

      {/* Spellcasting Ability */}
      <StatBox
        label="Spellcasting Ability"
        value={abilityName}
        testId="spellcasting-ability"
        tooltip={
          <GameTermTooltip termId="spellcasting-ability">
            <span>Spellcasting Ability</span>
          </GameTermTooltip>
        }
      />

      {/* Spell Save DC */}
      <StatBox
        label="Spell Save DC"
        value={spellSaveDC}
        testId="spell-save-dc"
        tooltip={
          <SpellSaveDCTooltip
            profBonus={profBonus}
            abilityMod={abilityMod}
            abilityName={spellcastingData.ability.toUpperCase().slice(0, 3)}
            total={spellSaveDC}
          />
        }
      />

      {/* Spell Attack Bonus */}
      <StatBox
        label="Spell Attack Bonus"
        value={<ModifierBadge value={spellAttackBonus} size="lg" />}
        testId="spell-attack-bonus"
        tooltip={
          <SpellAttackTooltip
            profBonus={profBonus}
            abilityMod={abilityMod}
            abilityName={spellcastingData.ability.toUpperCase().slice(0, 3)}
            total={spellAttackBonus}
          />
        }
      />
    </div>
  )
}

/**
 * StatBox
 * Displays a single stat with label and optional tooltip
 */
interface StatBoxProps {
  label: string
  value: React.ReactNode
  testId: string
  tooltip?: React.ReactNode
}

function StatBox({ label, value, testId, tooltip }: StatBoxProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center',
        'p-4 rounded-lg border',
        'bg-bg-secondary border-parchment/20',
        'hover:border-parchment/40 transition-colors'
      )}
      data-testid={testId}
    >
      <div className="text-xs text-parchment/60 mb-2 text-center">
        {tooltip ?? label}
      </div>
      <div className="text-2xl font-serif text-parchment font-semibold">
        {value}
      </div>
    </div>
  )
}

/**
 * SpellSaveDCTooltip
 * Shows the computation breakdown: 8 + proficiency + ability mod = DC
 */
interface TooltipProps {
  profBonus: number
  abilityMod: number
  abilityName: string
  total: number
}

function SpellSaveDCTooltip({ profBonus, abilityMod, abilityName, total }: TooltipProps) {
  return (
    <div
      className="text-xs text-parchment/80 cursor-help border-b border-dotted border-accent-gold/60"
      title={`8 + Proficiency Bonus (+${profBonus}) + ${abilityName} Modifier (${abilityMod >= 0 ? '+' : ''}${abilityMod}) = ${total}`}
    >
      Spell Save DC
    </div>
  )
}

/**
 * SpellAttackTooltip
 * Shows the computation breakdown: proficiency + ability mod = attack bonus
 */
function SpellAttackTooltip({ profBonus, abilityMod, abilityName, total }: TooltipProps) {
  return (
    <div
      className="text-xs text-parchment/80 cursor-help border-b border-dotted border-accent-gold/60"
      title={`Proficiency Bonus (+${profBonus}) + ${abilityName} Modifier (${abilityMod >= 0 ? '+' : ''}${abilityMod}) = ${total >= 0 ? '+' : ''}${total}`}
    >
      Spell Attack Bonus
    </div>
  )
}
