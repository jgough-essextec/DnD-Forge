/**
 * AttacksSection (Story 17.8)
 *
 * Displays equipped weapons with computed attack bonuses and damage.
 * Supports click-to-roll for combined attack + damage rolls.
 */

import { useCharacterSheet } from '@/components/character/CharacterSheetProvider'
import { Swords, Wand2 } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

interface AttackRollResult {
  attackRoll: number
  attackTotal: number
  damageRoll: number
  damageTotal: number
}

export function AttacksSection() {
  const { character, editableCharacter, editMode, derivedStats } =
    useCharacterSheet()
  const [rollResults, setRollResults] = useState<Record<string, AttackRollResult | null>>({})

  const displayCharacter = character ? { ...character, ...editableCharacter } : null

  if (!displayCharacter) {
    return null
  }

  // Generate attacks from equipped weapons
  const equippedWeapons = displayCharacter.inventory.filter(
    (item) => item.isEquipped && item.category === 'weapon'
  )

  const handleAttackRoll = (weaponName: string, attackBonus: number, damageDice: string) => {
    if (editMode.isEditing) return

    const attackRoll = Math.floor(Math.random() * 20) + 1
    const attackTotal = attackRoll + attackBonus

    // Parse damage dice (e.g., "1d8+3")
    const diceMatch = damageDice.match(/(\d+)d(\d+)/)
    const bonusMatch = damageDice.match(/[+-](\d+)/)

    if (diceMatch) {
      const numDice = parseInt(diceMatch[1])
      const dieSize = parseInt(diceMatch[2])
      const bonus = bonusMatch ? parseInt(bonusMatch[1]) : 0

      let damageRoll = 0
      for (let i = 0; i < numDice; i++) {
        damageRoll += Math.floor(Math.random() * dieSize) + 1
      }

      const damageTotal = damageRoll + bonus

      setRollResults((prev) => ({
        ...prev,
        [weaponName]: { attackRoll, attackTotal, damageRoll, damageTotal },
      }))

      setTimeout(() => {
        setRollResults((prev) => ({ ...prev, [weaponName]: null }))
      }, 4000)
    }
  }

  // For now, create basic attacks from weapons
  // Note: weapon properties and damage should be looked up from weapon data
  const attacks = equippedWeapons.map((weapon) => {
    // For MVP, assume melee weapons use STR
    let attackBonus = derivedStats.proficiencyBonus
    let damageBonus = 0

    attackBonus += derivedStats.abilityModifiers.strength
    damageBonus = derivedStats.abilityModifiers.strength

    // Default damage for MVP display
    const damageDice = '1d8'
    const damageType = 'slashing'
    const damageDisplay = `${damageDice}${damageBonus >= 0 ? '+' : ''}${damageBonus} ${damageType}`

    return {
      name: weapon.name,
      attackBonus,
      damage: damageDisplay,
      properties: [] as string[],
    }
  })

  return (
    <div
      className="rounded-lg border-2 border-parchment/20 bg-bg-secondary p-4"
      data-testid="attacks-section"
    >
      <div className="flex items-center gap-2 mb-3">
        <Swords className="w-5 h-5 text-accent-gold" />
        <span className="text-xs uppercase tracking-wider text-parchment/60 font-semibold">
          Attacks & Spellcasting
        </span>
      </div>

      {attacks.length === 0 ? (
        <div className="text-center py-6 text-parchment/50 text-sm">
          No equipped weapons
        </div>
      ) : (
        <div className="space-y-2">
          {attacks.map((attack) => {
            const rollResult = rollResults[attack.name]

            return (
              <div
                key={attack.name}
                className={cn(
                  'flex items-center gap-3 py-2 px-3 rounded border border-parchment/20 transition-colors',
                  !editMode.isEditing && 'cursor-pointer hover:bg-bg-primary/30 hover:border-accent-gold/30',
                  rollResult && 'bg-accent-gold/10 border-accent-gold/50'
                )}
                onClick={() =>
                  handleAttackRoll(attack.name, attack.attackBonus, attack.damage)
                }
                role={!editMode.isEditing ? 'button' : undefined}
                tabIndex={!editMode.isEditing ? 0 : undefined}
                onKeyDown={
                  !editMode.isEditing
                    ? (e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          handleAttackRoll(attack.name, attack.attackBonus, attack.damage)
                        }
                      }
                    : undefined
                }
                data-testid={`attack-${attack.name}`}
              >
                <div className="flex-1">
                  <div className="font-semibold text-parchment text-sm">
                    {attack.name}
                  </div>
                  <div className="text-xs text-parchment/60">
                    {attack.properties.join(', ')}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-accent-gold font-semibold">
                    {attack.attackBonus >= 0 ? '+' : ''}
                    {attack.attackBonus} to hit
                  </div>
                  <div className="text-xs text-parchment/70">{attack.damage}</div>
                </div>
                {rollResult && (
                  <div className="text-right pl-3 border-l border-accent-gold/30">
                    <div className="text-xs text-parchment/60">Attack:</div>
                    <div className="text-sm font-bold text-accent-gold">
                      {rollResult.attackTotal}
                    </div>
                    <div className="text-xs text-parchment/60 mt-1">Damage:</div>
                    <div className="text-sm font-bold text-damage-red">
                      {rollResult.damageTotal}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Spellcasting Summary */}
      {displayCharacter.spellcasting && (
        <div className="mt-4 pt-3 border-t border-parchment/20">
          <div className="flex items-center gap-2 mb-2">
            <Wand2 className="w-4 h-4 text-accent-gold" />
            <span className="text-xs uppercase tracking-wider text-parchment/60">
              Spellcasting
            </span>
          </div>
          <div className="text-sm text-parchment/70 space-y-1">
            {derivedStats.spellSaveDC !== null && (
              <div>
                Spell Save DC:{' '}
                <span className="font-semibold text-parchment">
                  {derivedStats.spellSaveDC}
                </span>
              </div>
            )}
            {derivedStats.spellAttackBonus !== null && (
              <div>
                Spell Attack:{' '}
                <span className="font-semibold text-accent-gold">
                  {derivedStats.spellAttackBonus >= 0 ? '+' : ''}
                  {derivedStats.spellAttackBonus}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
