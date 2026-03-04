// =============================================================================
// Story 10.3 -- ClassSkillSelector
// Skill proficiency picker using CountSelector with class-specific skill
// choices and variable counts (2 for most, 3 for Bard/Ranger, 4 for Rogue).
// =============================================================================

import { useMemo } from 'react'
import { CountSelector } from '@/components/shared/CountSelector'
import type { CharacterClass } from '@/types/class'
import type { SkillName } from '@/types/core'
import { SKILL_ABILITY_MAP } from '@/types/core'

const ABILITY_ABBREV: Record<string, string> = {
  strength: 'STR',
  dexterity: 'DEX',
  constitution: 'CON',
  intelligence: 'INT',
  wisdom: 'WIS',
  charisma: 'CHA',
}

// Human-readable skill names
const SKILL_DISPLAY_NAMES: Record<SkillName, string> = {
  'acrobatics': 'Acrobatics',
  'animal-handling': 'Animal Handling',
  'arcana': 'Arcana',
  'athletics': 'Athletics',
  'deception': 'Deception',
  'history': 'History',
  'insight': 'Insight',
  'intimidation': 'Intimidation',
  'investigation': 'Investigation',
  'medicine': 'Medicine',
  'nature': 'Nature',
  'perception': 'Perception',
  'performance': 'Performance',
  'persuasion': 'Persuasion',
  'religion': 'Religion',
  'sleight-of-hand': 'Sleight of Hand',
  'stealth': 'Stealth',
  'survival': 'Survival',
}

interface ClassSkillSelectorProps {
  characterClass: CharacterClass
  selectedSkills: SkillName[]
  onSkillsChange: (skills: SkillName[]) => void
}

export function ClassSkillSelector({
  characterClass,
  selectedSkills,
  onSkillsChange,
}: ClassSkillSelectorProps) {
  const { choose, from: skillPool } = characterClass.proficiencies.skillChoices

  // Build skill items with ability info
  const skillItems = useMemo(() => {
    return skillPool.map((skill) => ({
      id: skill,
      name: SKILL_DISPLAY_NAMES[skill] ?? skill,
      ability: ABILITY_ABBREV[SKILL_ABILITY_MAP[skill]] ?? '',
    }))
  }, [skillPool])

  // Map selected SkillName[] to skill item objects
  const selectedItems = useMemo(() => {
    return skillItems.filter((item) => selectedSkills.includes(item.id as SkillName))
  }, [skillItems, selectedSkills])

  const handleSelectionChange = (items: typeof skillItems[number][]) => {
    onSkillsChange(items.map((item) => item.id as SkillName))
  }

  return (
    <div>
      <h3 className="text-sm font-heading font-semibold text-parchment mb-1">
        Skill Proficiencies
      </h3>
      <p className="text-xs text-parchment/50 mb-3">
        Choose {choose} skill{choose !== 1 ? 's' : ''} from the list below.
        Higher ability modifiers make these skills more effective.
      </p>

      <CountSelector
        items={skillItems}
        selectedItems={selectedItems}
        onSelectionChange={handleSelectionChange}
        getKey={(item) => item.id}
        getLabel={(item) => `${item.name} (${item.ability})`}
        getDescription={(item) =>
          `Governed by ${item.ability}`
        }
        maxSelections={choose}
      />
    </div>
  )
}
