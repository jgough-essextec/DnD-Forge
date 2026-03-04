/**
 * LevelUpPage (Story 31.7)
 *
 * Page that renders the LevelUpWizard within character context.
 * Supports both standalone access and modal trigger from the character sheet.
 */

import { useState, useCallback } from 'react'
import { ArrowUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { LevelUpWizard } from '@/components/levelup/LevelUpWizard'
import { canLevelUp } from '@/utils/levelup'
import type { Character } from '@/types/character'

// -- Demo character for standalone page usage ---------------------------------
// In a real integration, this would come from useCharacterSheet() or route params.

const DEMO_CHARACTER: Character = {
  id: 'demo-1',
  name: 'Thalion',
  playerName: 'Player',
  avatarUrl: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  version: 1,
  race: {
    raceId: 'elf',
    subraceId: 'high-elf',
    chosenAbilityBonuses: [],
    chosenLanguages: [],
  },
  classes: [
    {
      classId: 'wizard',
      subclassId: 'arcane-tradition',
      level: 3,
      chosenSkills: ['arcana', 'history'],
      hpRolls: [4, 3],
    },
  ],
  background: {
    backgroundId: 'sage',
    characterIdentity: { name: 'Thalion' },
    characterPersonality: {
      personalityTraits: ['Curious', 'Bookish'],
      ideal: 'Knowledge',
      bond: 'Library',
      flaw: 'Absent-minded',
    },
  },
  alignment: 'neutral-good',
  baseAbilityScores: {
    strength: 8,
    dexterity: 14,
    constitution: 13,
    intelligence: 16,
    wisdom: 12,
    charisma: 10,
  },
  abilityScores: {
    strength: 8,
    dexterity: 14,
    constitution: 13,
    intelligence: 16,
    wisdom: 12,
    charisma: 10,
  },
  abilityScoreMethod: 'standard',
  level: 3,
  experiencePoints: 2700,
  hpMax: 18,
  hpCurrent: 18,
  tempHp: 0,
  hitDiceTotal: [3],
  hitDiceUsed: [0],
  speed: { walk: 30 },
  deathSaves: { successes: 0, failures: 0, stable: false },
  combatStats: {
    armorClass: { base: 10, dexModifier: 2, shieldBonus: 0, otherBonuses: [], formula: '10 + DEX' },
    initiative: 2,
    speed: { walk: 30 },
    hitPoints: {
      maximum: 18,
      current: 18,
      temporary: 0,
      hitDice: { total: [{ count: 3, die: 'd6' }], used: [0] },
    },
    attacks: [],
    savingThrows: { intelligence: 5, wisdom: 3 },
  },
  proficiencies: {
    armor: [],
    weapons: ['simple melee', 'simple ranged'],
    tools: [],
    languages: ['common', 'elvish'],
    skills: [
      { skill: 'arcana', proficient: true, expertise: false },
      { skill: 'history', proficient: true, expertise: false },
    ],
    savingThrows: ['intelligence', 'wisdom'],
  },
  inventory: [],
  currency: { cp: 0, sp: 0, ep: 0, gp: 50, pp: 0 },
  attunedItems: [],
  spellcasting: {
    type: 'prepared',
    ability: 'intelligence',
    cantrips: ['fire-bolt', 'mage-hand', 'prestidigitation'],
    knownSpells: [],
    preparedSpells: ['magic-missile', 'shield', 'detect-magic'],
    spellSlots: { 1: 4, 2: 2 },
    usedSpellSlots: { 1: 0, 2: 0 },
    ritualCasting: true,
  },
  features: [
    'spellcasting-wizard',
    'arcane-recovery',
    'arcane-tradition',
  ],
  feats: [],
  description: {
    name: 'Thalion',
    age: '120',
    height: "5'10\"",
    weight: '130 lbs',
    eyes: 'Blue',
    skin: 'Pale',
    hair: 'Silver',
    appearance: 'Slender elf with silver hair',
    backstory: '',
    alliesAndOrgs: '',
    treasure: '',
  },
  personality: {
    personalityTraits: ['Curious', 'Bookish'],
    ideal: 'Knowledge',
    bond: 'Library',
    flaw: 'Absent-minded',
  },
  conditions: [],
  inspiration: false,
  campaignId: null,
  isArchived: false,
}

export default function LevelUpPage() {
  const [character, setCharacter] = useState<Character>(DEMO_CHARACTER)
  const [showWizard, setShowWizard] = useState(false)

  const eligible = canLevelUp(character)

  const handleComplete = useCallback((updatedCharacter: Character) => {
    setCharacter(updatedCharacter)
    setShowWizard(false)
  }, [])

  const handleCancel = useCallback(() => {
    setShowWizard(false)
  }, [])

  return (
    <div className="p-8">
      <h1 className="font-heading text-3xl text-accent-gold mb-4">Level Up</h1>

      <div className="max-w-md space-y-4">
        <div className="rounded-lg border border-parchment/15 bg-parchment/5 p-4">
          <p className="text-parchment text-sm">
            <span className="font-bold">{character.name}</span> &mdash; Level{' '}
            {character.level}{' '}
            {character.classes[0]?.classId &&
              character.classes[0].classId.charAt(0).toUpperCase() +
                character.classes[0].classId.slice(1)}
          </p>
          <p className="text-parchment/60 text-xs mt-1">
            XP: {character.experiencePoints.toLocaleString()} | HP:{' '}
            {character.hpCurrent}/{character.hpMax}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowWizard(true)}
          disabled={!eligible}
          className={cn(
            'flex items-center gap-2 rounded-lg px-4 py-2.5',
            'text-sm font-bold transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-accent-gold/50',
            eligible
              ? 'bg-accent-gold text-primary hover:bg-accent-gold/90'
              : 'bg-parchment/10 text-parchment/30 cursor-not-allowed',
          )}
          data-testid="level-up-trigger-button"
          aria-label="Open level up wizard"
        >
          <ArrowUp className="h-4 w-4" />
          {eligible ? 'Level Up' : 'Cannot Level Up'}
        </button>

        {!eligible && character.level >= 20 && (
          <p className="text-xs text-parchment/40">
            Maximum level reached (20).
          </p>
        )}
      </div>

      {showWizard && (
        <LevelUpWizard
          character={character}
          onComplete={handleComplete}
          onCancel={handleCancel}
        />
      )}
    </div>
  )
}
