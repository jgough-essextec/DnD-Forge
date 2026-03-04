/**
 * useReviewData - Hook that reads wizard store state and computes
 * all derived stats needed for the review step.
 *
 * This centralises the computation so CharacterPreviewPage1/2/3,
 * ValidationSummary, and SaveActions can all share the same data.
 */

import { useMemo } from 'react'
import { useWizardStore } from '@/stores/wizardStore'
import type { AbilityScores, AbilityName, SkillName } from '@/types/core'
import type { Race } from '@/types/race'
import type { CharacterClass } from '@/types/class'
import type { Background } from '@/types/background'
import type { Spell } from '@/types/spell'
import { ABILITY_NAMES, SKILL_NAMES, SKILL_ABILITY_MAP } from '@/types/core'
import { races } from '@/data/races'
import { getClassById } from '@/data/classes'
import { getBackgroundById } from '@/data/backgrounds'
import { getSpellById } from '@/data/spells'
import { getModifier } from '@/utils/calculations/ability'
import { getProficiencyBonus as getCombatProficiencyBonus, getArmorClass, getInitiativeModifier } from '@/utils/calculations/combat'
import { getSpellSaveDC, getSpellAttackBonus, getSpellSlots } from '@/utils/calculations/spellcasting'
import { shouldSkipSpellcasting } from '@/components/wizard/wizardSteps'

/** All derived data the review step needs. */
export interface ReviewData {
  // Identity
  characterName: string
  raceName: string
  subraceName: string | null
  className: string
  subclassName: string | null
  backgroundName: string
  alignment: string
  level: number

  // Raw data objects
  raceData: Race | null
  classData: CharacterClass | null
  backgroundData: Background | null

  // Ability scores
  baseAbilityScores: AbilityScores | null
  effectiveAbilityScores: AbilityScores
  abilityModifiers: Record<AbilityName, number>
  racialBonuses: Partial<AbilityScores>

  // Combat
  proficiencyBonus: number
  armorClass: number
  initiative: number
  speed: number
  hpMax: number
  hitDie: string

  // Proficiencies
  savingThrowProficiencies: AbilityName[]
  savingThrowModifiers: Record<AbilityName, number>
  skillProficiencies: SkillName[]
  skillModifiers: Record<SkillName, number>
  passivePerception: number
  armorProficiencies: string[]
  weaponProficiencies: string[]
  toolProficiencies: string[]
  languages: string[]

  // Personality
  personalityTraits: [string, string]
  ideal: string
  bond: string
  flaw: string

  // Description
  description: {
    age: string
    height: string
    weight: string
    eyes: string
    skin: string
    hair: string
    appearance: string
    backstory: string
    alliesAndOrgs: string
  }

  // Equipment
  equipment: Array<{ name: string; quantity: number; weight: number; isEquipped: boolean }>
  currency: { cp: number; sp: number; ep: number; gp: number; pp: number }
  totalWeight: number

  // Spellcasting
  isCaster: boolean
  spellcastingAbility: AbilityName | null
  spellSaveDC: number
  spellAttackBonus: number
  spellSlots: Record<number, number>
  selectedSpells: Spell[]
  cantrips: Spell[]
  levelSpells: Spell[]

  // Features
  features: Array<{ name: string; description: string; source: string }>

  // Attacks
  attacks: Array<{
    name: string
    attackBonus: number
    damage: string
    damageType: string
  }>
}

export function useReviewData(): ReviewData {
  const characterName = useWizardStore((s) => s.characterName)
  const raceSelection = useWizardStore((s) => s.raceSelection)
  const classSelection = useWizardStore((s) => s.classSelection)
  const abilityScores = useWizardStore((s) => s.abilityScores)
  const backgroundSelection = useWizardStore((s) => s.backgroundSelection)
  const equipmentSelections = useWizardStore((s) => s.equipmentSelections)
  const spellSelections = useWizardStore((s) => s.spellSelections)

  return useMemo(() => {
    // Resolve data objects
    const raceData = raceSelection
      ? races.find((r) => r.id === raceSelection.raceId) ?? null
      : null
    const classData = classSelection
      ? getClassById(classSelection.classId) ?? null
      : null
    const backgroundData = backgroundSelection
      ? getBackgroundById(backgroundSelection.backgroundId) ?? null
      : null

    // Subrace
    const subraceData = raceData && raceSelection?.subraceId
      ? raceData.subraces.find((s) => s.id === raceSelection.subraceId) ?? null
      : null

    const level = classSelection?.level ?? 1
    const proficiencyBonus = getCombatProficiencyBonus(level)

    // Ability scores
    const base: AbilityScores = abilityScores ?? {
      strength: 10, dexterity: 10, constitution: 10,
      intelligence: 10, wisdom: 10, charisma: 10,
    }

    // Compute racial bonuses
    const racialBonuses: Partial<AbilityScores> = {}
    if (raceData && raceSelection) {
      for (const ability of ABILITY_NAMES) {
        const raceBonus = raceData.abilityScoreIncrease[ability] ?? 0
        const subraceBonus = subraceData?.abilityScoreIncrease[ability] ?? 0
        const total = raceBonus + subraceBonus
        if (total !== 0) racialBonuses[ability] = total
      }
      // Add chosen ability bonuses
      if (raceSelection.chosenAbilityBonuses) {
        for (const { abilityName, bonus } of raceSelection.chosenAbilityBonuses) {
          racialBonuses[abilityName] = (racialBonuses[abilityName] ?? 0) + bonus
        }
      }
    }

    // Effective scores = base + racial bonuses (capped at 20)
    const effective: AbilityScores = { ...base }
    for (const ability of ABILITY_NAMES) {
      effective[ability] = Math.min(20, base[ability] + (racialBonuses[ability] ?? 0))
    }

    // Modifiers
    const abilityModifiers = {} as Record<AbilityName, number>
    for (const ability of ABILITY_NAMES) {
      abilityModifiers[ability] = getModifier(effective[ability])
    }

    // Saving throws
    const savingThrowProficiencies: AbilityName[] = classData
      ? classData.proficiencies.savingThrows
      : []
    const savingThrowModifiers = {} as Record<AbilityName, number>
    for (const ability of ABILITY_NAMES) {
      const mod = abilityModifiers[ability]
      const isProficient = savingThrowProficiencies.includes(ability)
      savingThrowModifiers[ability] = isProficient ? mod + proficiencyBonus : mod
    }

    // Skills
    const skillProficiencies: SkillName[] = [
      ...(classSelection?.chosenSkills ?? []),
      ...(backgroundData?.skillProficiencies ?? []),
      ...(raceSelection?.chosenSkills ?? []),
    ]
    // Deduplicate
    const uniqueSkillProficiencies = [...new Set(skillProficiencies)]

    const skillModifiers = {} as Record<SkillName, number>
    for (const skill of SKILL_NAMES) {
      const ability = SKILL_ABILITY_MAP[skill]
      const mod = abilityModifiers[ability]
      const isProficient = uniqueSkillProficiencies.includes(skill)
      skillModifiers[skill] = isProficient ? mod + proficiencyBonus : mod
    }

    const passivePerception = 10 + skillModifiers['perception']

    // Speed
    const speed = raceData?.speed ?? 30

    // HP
    const hitDie = classData?.hitDie ?? 8
    const conMod = abilityModifiers.constitution
    const hpMax = hitDie + conMod

    // AC - use getArmorClass with available info
    const dexMod = abilityModifiers.dexterity
    const hasShield = equipmentSelections.some(
      (item) => item.category === 'shield' && item.isEquipped,
    )
    // Compute AC using the calculation engine (unarmored for now;
    // full armor resolution would need the Armor data model lookup)
    const armorClass = getArmorClass({
      dexModifier: dexMod,
      shield: hasShield,
    })

    const initiative = getInitiativeModifier(dexMod)

    // Spellcasting
    const isCaster = classSelection ? !shouldSkipSpellcasting(classSelection.classId) : false
    const spellcastingAbility = classData?.spellcasting?.ability ?? null
    const spellcastingMod = spellcastingAbility ? abilityModifiers[spellcastingAbility] : 0
    const spellSaveDC = isCaster ? getSpellSaveDC(spellcastingMod, proficiencyBonus) : 0
    const spellAttackBonus = isCaster ? getSpellAttackBonus(spellcastingMod, proficiencyBonus) : 0

    // Spell slots
    let spellSlotRecord: Record<number, number> = {}
    if (isCaster && classData?.spellcasting) {
      const casterType = classData.spellcasting.type as 'full' | 'half' | 'third' | 'pact'
      spellSlotRecord = getSpellSlots(casterType, level)
    }

    // Resolve selected spells
    const resolvedSpells = spellSelections
      .map((id) => getSpellById(id))
      .filter((s): s is Spell => s !== undefined)
    const cantrips = resolvedSpells.filter((s) => s.level === 0)
    const levelSpells = resolvedSpells.filter((s) => s.level > 0)

    // Features
    const features: Array<{ name: string; description: string; source: string }> = []

    // Racial traits
    if (raceData) {
      for (const trait of raceData.traits) {
        features.push({ name: trait.name, description: trait.description, source: raceData.name })
      }
    }
    if (subraceData) {
      for (const trait of subraceData.traits) {
        features.push({ name: trait.name, description: trait.description, source: subraceData.name })
      }
    }

    // Class features at level
    if (classData) {
      for (let l = 1; l <= level; l++) {
        const feats = classData.features[l]
        if (feats) {
          for (const feat of feats) {
            features.push({ name: feat.name, description: feat.description, source: classData.name })
          }
        }
      }
      // Subclass features
      if (classSelection?.subclassId) {
        const subclass = classData.subclasses.find((sc) => sc.id === classSelection.subclassId)
        if (subclass) {
          for (let l = 1; l <= level; l++) {
            const feats = subclass.features[l]
            if (feats) {
              for (const feat of feats) {
                features.push({ name: feat.name, description: feat.description, source: subclass.name })
              }
            }
          }
        }
      }
    }

    // Background feature
    if (backgroundData?.feature) {
      features.push({
        name: backgroundData.feature.name,
        description: backgroundData.feature.description,
        source: backgroundData.name,
      })
    }

    // Attacks - build from equipped weapons
    const strMod = abilityModifiers.strength
    const attacks: ReviewData['attacks'] = []
    for (const item of equipmentSelections) {
      if (item.category === 'weapon' && item.isEquipped) {
        // Simple attack bonus calculation: STR + proficiency for melee
        const attackBonus = strMod + proficiencyBonus
        attacks.push({
          name: item.name,
          attackBonus,
          damage: `1d8+${strMod}`,
          damageType: 'slashing',
        })
      }
    }

    // Proficiencies
    const armorProficiencies = classData?.proficiencies.armor ?? []
    const weaponProficiencies = classData?.proficiencies.weapons ?? []
    const toolProficiencies = [
      ...(classData?.proficiencies.tools ?? []),
      ...(backgroundData?.toolProficiencies ?? []),
    ]
    const langList: string[] = [
      ...(raceData?.languages ?? []),
      ...(raceSelection?.chosenLanguages ?? []),
    ]
    if (backgroundData?.languages) {
      if (Array.isArray(backgroundData.languages)) {
        langList.push(...backgroundData.languages)
      }
    }
    if (backgroundSelection?.chosenLanguages) {
      langList.push(...backgroundSelection.chosenLanguages)
    }

    // Equipment for display
    const equipment = equipmentSelections.map((item) => ({
      name: item.name,
      quantity: item.quantity,
      weight: item.weight,
      isEquipped: item.isEquipped,
    }))
    const totalWeight = equipmentSelections.reduce(
      (sum, item) => sum + item.weight * item.quantity,
      0,
    )

    // Description
    const identity = backgroundSelection?.characterIdentity
    const description = {
      age: identity?.age ?? '',
      height: identity?.height ?? '',
      weight: identity?.weight ?? '',
      eyes: identity?.eyes ?? '',
      skin: identity?.skin ?? '',
      hair: identity?.hair ?? '',
      appearance: identity?.appearance ?? '',
      backstory: '',
      alliesAndOrgs: '',
    }

    // Personality
    const personality = backgroundSelection?.characterPersonality
    const personalityTraits: [string, string] = personality?.personalityTraits ?? ['', '']
    const ideal = personality?.ideal ?? ''
    const bond = personality?.bond ?? ''
    const flaw = personality?.flaw ?? ''

    // Currency defaults
    const currency = { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 }

    return {
      characterName: characterName || 'Unnamed Adventurer',
      raceName: raceData?.name ?? 'Unknown Race',
      subraceName: subraceData?.name ?? null,
      className: classData?.name ?? 'Unknown Class',
      subclassName: classSelection?.subclassId
        ? classData?.subclasses.find((sc) => sc.id === classSelection.subclassId)?.name ?? null
        : null,
      backgroundName: backgroundData?.name ?? 'Unknown Background',
      alignment: 'True Neutral',
      level,
      raceData,
      classData,
      backgroundData,
      baseAbilityScores: abilityScores,
      effectiveAbilityScores: effective,
      abilityModifiers,
      racialBonuses,
      proficiencyBonus,
      armorClass,
      initiative,
      speed,
      hpMax,
      hitDie: `1d${hitDie}`,
      savingThrowProficiencies,
      savingThrowModifiers,
      skillProficiencies: uniqueSkillProficiencies,
      skillModifiers,
      passivePerception,
      armorProficiencies: armorProficiencies.map(String),
      weaponProficiencies: weaponProficiencies.map(String),
      toolProficiencies,
      languages: [...new Set(langList)],
      personalityTraits,
      ideal,
      bond,
      flaw,
      description,
      equipment,
      currency,
      totalWeight,
      isCaster,
      spellcastingAbility,
      spellSaveDC,
      spellAttackBonus,
      spellSlots: spellSlotRecord,
      selectedSpells: resolvedSpells,
      cantrips,
      levelSpells,
      features,
      attacks,
    }
  }, [
    characterName,
    raceSelection,
    classSelection,
    abilityScores,
    backgroundSelection,
    equipmentSelections,
    spellSelections,
  ])
}
