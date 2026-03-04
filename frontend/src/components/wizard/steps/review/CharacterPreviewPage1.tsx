/**
 * CharacterPreviewPage1 - Core Stats page of the character sheet preview.
 *
 * Displays: character header, ability scores, saving throws, skills,
 * AC, HP, initiative, speed, hit dice, attacks, spellcasting summary,
 * personality traits, and features list.
 */
import { ABILITY_NAMES, SKILL_NAMES, SKILL_ABILITY_MAP } from '@/types/core'
import type { AbilityName, SkillName } from '@/types/core'
import { AbilityScoreDisplay } from '@/components/shared/AbilityScoreDisplay'
import { ProficiencyDot } from '@/components/shared/ProficiencyDot'
import { ModifierBadge } from '@/components/shared/ModifierBadge'
import type { ReviewData } from './useReviewData'
import { EditableSection } from './EditableSection'

interface CharacterPreviewPage1Props {
  data: ReviewData
  onEditSection?: (stepId: number) => void
}

function formatModifier(mod: number): string {
  return mod >= 0 ? `+${mod}` : `${mod}`
}

const ABILITY_LABELS: Record<AbilityName, string> = {
  strength: 'STR',
  dexterity: 'DEX',
  constitution: 'CON',
  intelligence: 'INT',
  wisdom: 'WIS',
  charisma: 'CHA',
}

const SKILL_LABELS: Record<SkillName, string> = {
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

export function CharacterPreviewPage1({ data, onEditSection }: CharacterPreviewPage1Props) {
  const {
    characterName,
    raceName,
    subraceName,
    className,
    subclassName,
    backgroundName,
    alignment,
    level,
    effectiveAbilityScores,
    abilityModifiers,
    racialBonuses,
    proficiencyBonus,
    armorClass,
    initiative,
    speed,
    hpMax,
    hitDie,
    savingThrowProficiencies,
    savingThrowModifiers,
    skillProficiencies,
    skillModifiers,
    passivePerception,
    personalityTraits,
    ideal,
    bond,
    flaw,
    features,
    attacks,
    isCaster,
    spellcastingAbility,
    spellSaveDC,
    spellAttackBonus,
  } = data

  return (
    <div className="space-y-4" data-testid="preview-page-1">
      {/* Character Header Banner */}
      <div
        className="bg-gradient-to-r from-bg-secondary via-bg-secondary/90 to-bg-secondary rounded-lg border border-parchment/20 p-4"
        data-testid="character-header"
      >
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <h2 className="font-heading text-2xl text-accent-gold">{characterName}</h2>
          <span className="text-parchment/70 text-sm">
            Level {level} {subclassName ? `${subclassName} ` : ''}{className}
          </span>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-parchment/60">
          <span>{subraceName ? `${subraceName} ${raceName}` : raceName}</span>
          <span>{backgroundName}</span>
          <span>{alignment}</span>
          <span>XP: 0</span>
        </div>
      </div>

      {/* Three-column layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* LEFT COLUMN: Ability Scores, Saving Throws, Skills */}
        <div className="space-y-4">
          {/* Ability Scores */}
          <EditableSection stepId={3} label="Ability Scores" onEdit={onEditSection}>
            <div className="grid grid-cols-2 gap-2" data-testid="ability-scores-section">
              {ABILITY_NAMES.map((ability) => (
                <AbilityScoreDisplay
                  key={ability}
                  ability={ABILITY_LABELS[ability]}
                  score={effectiveAbilityScores[ability]}
                  modifier={abilityModifiers[ability]}
                  racialBonus={racialBonuses[ability]}
                  size="sm"
                />
              ))}
            </div>
          </EditableSection>

          {/* Saving Throws */}
          <div className="bg-bg-secondary rounded-lg border border-parchment/20 p-3">
            <h3 className="font-heading text-sm text-accent-gold/80 uppercase tracking-wider mb-2">
              Saving Throws
            </h3>
            <div className="space-y-1" data-testid="saving-throws-section">
              {ABILITY_NAMES.map((ability) => {
                const isProficient = savingThrowProficiencies.includes(ability)
                return (
                  <div key={ability} className="flex items-center gap-2 text-sm">
                    <ProficiencyDot level={isProficient ? 'proficient' : 'none'} size="sm" />
                    <ModifierBadge value={savingThrowModifiers[ability]} size="sm" />
                    <span className="text-parchment/70 capitalize">{ability}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Skills */}
          <div className="bg-bg-secondary rounded-lg border border-parchment/20 p-3">
            <h3 className="font-heading text-sm text-accent-gold/80 uppercase tracking-wider mb-2">
              Skills
            </h3>
            <div className="space-y-0.5" data-testid="skills-section">
              {SKILL_NAMES.map((skill) => {
                const isProficient = skillProficiencies.includes(skill)
                return (
                  <div key={skill} className="flex items-center gap-2 text-xs">
                    <ProficiencyDot level={isProficient ? 'proficient' : 'none'} size="sm" />
                    <ModifierBadge value={skillModifiers[skill]} size="sm" />
                    <span className="text-parchment/70">
                      {SKILL_LABELS[skill]}
                    </span>
                    <span className="text-parchment/40 text-[10px] ml-auto uppercase">
                      {SKILL_ABILITY_MAP[skill].slice(0, 3)}
                    </span>
                  </div>
                )
              })}
            </div>
            <div className="mt-2 pt-2 border-t border-parchment/10 text-sm flex items-center gap-2">
              <span className="text-parchment/50">Passive Perception</span>
              <span className="text-parchment font-semibold ml-auto">{passivePerception}</span>
            </div>
          </div>

          {/* Proficiency Bonus */}
          <div className="bg-bg-secondary rounded-lg border border-parchment/20 p-3 flex items-center gap-3">
            <span className="text-xl font-heading font-bold text-accent-gold">+{proficiencyBonus}</span>
            <span className="text-sm text-parchment/60">Proficiency Bonus</span>
          </div>
        </div>

        {/* CENTER COLUMN: Combat Stats, Attacks, Spellcasting Summary */}
        <div className="space-y-4">
          {/* Combat Stats Row */}
          <EditableSection stepId={5} label="Combat Stats" onEdit={onEditSection}>
            <div className="grid grid-cols-3 gap-2" data-testid="combat-stats-section">
              {/* AC */}
              <div className="bg-bg-secondary rounded-lg border border-parchment/20 p-3 text-center">
                <div className="text-2xl font-heading font-bold text-parchment" data-testid="ac-value">
                  {armorClass}
                </div>
                <div className="text-xs text-parchment/50 uppercase tracking-wider">Armor Class</div>
              </div>

              {/* Initiative */}
              <div className="bg-bg-secondary rounded-lg border border-parchment/20 p-3 text-center">
                <div className="text-2xl font-heading font-bold text-parchment" data-testid="initiative-value">
                  {formatModifier(initiative)}
                </div>
                <div className="text-xs text-parchment/50 uppercase tracking-wider">Initiative</div>
              </div>

              {/* Speed */}
              <div className="bg-bg-secondary rounded-lg border border-parchment/20 p-3 text-center">
                <div className="text-2xl font-heading font-bold text-parchment" data-testid="speed-value">
                  {speed}
                </div>
                <div className="text-xs text-parchment/50 uppercase tracking-wider">Speed (ft)</div>
              </div>
            </div>
          </EditableSection>

          {/* Hit Points */}
          <div className="bg-bg-secondary rounded-lg border border-parchment/20 p-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-heading text-sm text-accent-gold/80 uppercase tracking-wider">Hit Points</h3>
            </div>
            <div className="text-center" data-testid="hp-section">
              <div className="text-3xl font-heading font-bold text-healing-green" data-testid="hp-value">
                {hpMax}
              </div>
              <div className="text-xs text-parchment/50">Maximum</div>
            </div>
            <div className="mt-2 pt-2 border-t border-parchment/10 flex items-center justify-between text-sm">
              <span className="text-parchment/50">Hit Dice</span>
              <span className="text-parchment font-mono">{hitDie}</span>
            </div>
          </div>

          {/* Attacks */}
          <EditableSection stepId={5} label="Attacks" onEdit={onEditSection}>
            <div className="bg-bg-secondary rounded-lg border border-parchment/20 p-3">
              <h3 className="font-heading text-sm text-accent-gold/80 uppercase tracking-wider mb-2">
                Attacks
              </h3>
              <div className="space-y-2" data-testid="attacks-section">
                {attacks.length === 0 ? (
                  <p className="text-parchment/40 text-sm italic">No weapons equipped</p>
                ) : (
                  attacks.map((attack, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span className="text-parchment font-medium">{attack.name}</span>
                      <span className="text-parchment/70">
                        {formatModifier(attack.attackBonus)} to hit, {attack.damage} {attack.damageType}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </EditableSection>

          {/* Spellcasting Summary (if caster) */}
          {isCaster && (
            <EditableSection stepId={6} label="Spellcasting" onEdit={onEditSection}>
              <div className="bg-bg-secondary rounded-lg border border-parchment/20 p-3">
                <h3 className="font-heading text-sm text-accent-gold/80 uppercase tracking-wider mb-2">
                  Spellcasting
                </h3>
                <div className="space-y-1 text-sm" data-testid="spellcasting-summary">
                  <div className="flex justify-between">
                    <span className="text-parchment/50">Spellcasting Ability</span>
                    <span className="text-parchment capitalize">{spellcastingAbility}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-parchment/50">Spell Save DC</span>
                    <span className="text-parchment font-semibold" data-testid="spell-save-dc">{spellSaveDC}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-parchment/50">Spell Attack Bonus</span>
                    <span className="text-parchment font-semibold" data-testid="spell-attack-bonus">
                      {formatModifier(spellAttackBonus)}
                    </span>
                  </div>
                </div>
              </div>
            </EditableSection>
          )}
        </div>

        {/* RIGHT COLUMN: Personality, Features */}
        <div className="space-y-4">
          {/* Personality */}
          <EditableSection stepId={4} label="Personality" onEdit={onEditSection}>
            <div className="bg-bg-secondary rounded-lg border border-parchment/20 p-3">
              <h3 className="font-heading text-sm text-accent-gold/80 uppercase tracking-wider mb-2">
                Personality
              </h3>
              <div className="space-y-3 text-sm" data-testid="personality-section">
                <div>
                  <span className="text-parchment/50 text-xs uppercase tracking-wider">Personality Traits</span>
                  <p className="text-parchment/80 mt-0.5">
                    {personalityTraits[0] || <span className="italic text-parchment/30">Not set</span>}
                  </p>
                  {personalityTraits[1] && (
                    <p className="text-parchment/80 mt-0.5">{personalityTraits[1]}</p>
                  )}
                </div>
                <div>
                  <span className="text-parchment/50 text-xs uppercase tracking-wider">Ideals</span>
                  <p className="text-parchment/80 mt-0.5">
                    {ideal || <span className="italic text-parchment/30">Not set</span>}
                  </p>
                </div>
                <div>
                  <span className="text-parchment/50 text-xs uppercase tracking-wider">Bonds</span>
                  <p className="text-parchment/80 mt-0.5">
                    {bond || <span className="italic text-parchment/30">Not set</span>}
                  </p>
                </div>
                <div>
                  <span className="text-parchment/50 text-xs uppercase tracking-wider">Flaws</span>
                  <p className="text-parchment/80 mt-0.5">
                    {flaw || <span className="italic text-parchment/30">Not set</span>}
                  </p>
                </div>
              </div>
            </div>
          </EditableSection>

          {/* Features & Traits */}
          <EditableSection stepId={1} label="Features & Traits" onEdit={onEditSection}>
            <div className="bg-bg-secondary rounded-lg border border-parchment/20 p-3">
              <h3 className="font-heading text-sm text-accent-gold/80 uppercase tracking-wider mb-2">
                Features & Traits
              </h3>
              <div className="space-y-2 max-h-64 overflow-y-auto" data-testid="features-section">
                {features.length === 0 ? (
                  <p className="text-parchment/40 text-sm italic">No features</p>
                ) : (
                  features.map((feature, i) => (
                    <div key={i} className="text-sm">
                      <div className="flex items-baseline gap-2">
                        <span className="text-parchment font-medium">{feature.name}</span>
                        <span className="text-parchment/30 text-xs">({feature.source})</span>
                      </div>
                      <p className="text-parchment/60 text-xs mt-0.5 line-clamp-2">
                        {feature.description}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </EditableSection>
        </div>
      </div>
    </div>
  )
}
