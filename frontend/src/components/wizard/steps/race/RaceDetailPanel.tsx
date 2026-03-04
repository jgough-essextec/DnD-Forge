/**
 * RaceDetailPanel -- Full race detail content shown inside DetailSlidePanel.
 *
 * Displays all race information organized into sections:
 * - Header with name, size, speed, description
 * - Ability score bonuses
 * - Racial traits
 * - Languages and proficiencies
 * - Subrace selector (if applicable)
 * - Racial choice pickers (if applicable)
 */

import { ModifierBadge } from '@/components/shared/ModifierBadge'
import { SubraceSelector } from './SubraceSelector'
import {
  HalfElfBonusPicker,
  VariantHumanPicker,
  HighElfCantripPicker,
  DragonbornAncestryPicker,
  LanguagePicker,
  SkillPicker,
} from './RacialChoicePickers'
import type { Race, Subrace, AbilityBonus } from '@/types/race'
import type { AbilityName, Language, SkillName } from '@/types/core'

// State for all racial choices managed by parent (RaceStep)
export interface RacialChoiceState {
  subraceId: string | null
  chosenAbilityBonuses: AbilityBonus[]
  chosenSkills: SkillName[]
  chosenLanguages: Language[]
  chosenCantrip: string | null
  chosenFeat: string | null
  dragonbornAncestry: string | null
}

interface RaceDetailPanelProps {
  race: Race
  choices: RacialChoiceState
  onChoicesChange: (choices: Partial<RacialChoiceState>) => void
}

const ABILITY_DISPLAY: Record<AbilityName, string> = {
  strength: 'Strength',
  dexterity: 'Dexterity',
  constitution: 'Constitution',
  intelligence: 'Intelligence',
  wisdom: 'Wisdom',
  charisma: 'Charisma',
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function formatLanguage(lang: Language): string {
  return lang
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

export function RaceDetailPanel({
  race,
  choices,
  onChoicesChange,
}: RaceDetailPanelProps) {
  const selectedSubrace: Subrace | undefined = race.subraces.find(
    (s) => s.id === choices.subraceId,
  )

  // Determine what racial choices are needed
  const isHalfElf = race.id === 'half-elf'
  const isDragonborn = race.id === 'dragonborn'
  const isHuman = race.id === 'human'
  const isVariantHuman = isHuman && choices.subraceId === 'variant-human'
  const isHighElf = selectedSubrace?.id === 'high-elf'
  const hasLanguageChoices =
    (race.languageChoices ?? 0) > 0 ||
    (isHighElf && (selectedSubrace?.additionalLanguages !== undefined))

  // Get the number of extra language choices
  const languageChoiceCount = isHighElf
    ? 1
    : (race.languageChoices ?? 0)

  // Known languages (race base + subrace if applicable)
  const knownLanguages: Language[] = [...race.languages]
  if (selectedSubrace?.additionalLanguages) {
    knownLanguages.push(...selectedSubrace.additionalLanguages)
  }

  // Combine race + subrace traits
  const raceTraits = race.traits
  const subraceTraits = selectedSubrace?.traits ?? []

  // Combined ability score increases
  const raceAbilityBonuses = Object.entries(race.abilityScoreIncrease)
    .filter(([, val]) => val && val !== 0)
    .map(([ability, val]) => ({
      ability: ability as AbilityName,
      value: val as number,
      source: race.name,
    }))

  const subraceAbilityBonuses = selectedSubrace
    ? Object.entries(selectedSubrace.abilityScoreIncrease)
        .filter(([, val]) => val && val !== 0)
        .map(([ability, val]) => ({
          ability: ability as AbilityName,
          value: val as number,
          source: selectedSubrace.name,
        }))
    : []

  // For variant human, the base human +1 all is replaced by subrace choices
  const showBaseAbilityBonuses = !isVariantHuman
  const allAbilityBonuses = showBaseAbilityBonuses
    ? [...raceAbilityBonuses, ...subraceAbilityBonuses]
    : []

  return (
    <div className="space-y-6" data-testid="race-detail-panel">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs rounded-full px-2 py-0.5 bg-parchment/10 text-parchment/70 border border-parchment/15">
            {capitalize(race.size)}
          </span>
          <span className="text-xs rounded-full px-2 py-0.5 bg-parchment/10 text-parchment/70 border border-parchment/15">
            {race.speed} ft
          </span>
          {race.senses.some((s) => s.type === 'darkvision') && (
            <span className="text-xs rounded-full px-2 py-0.5 bg-parchment/10 text-parchment/70 border border-parchment/15">
              Darkvision {race.senses.find((s) => s.type === 'darkvision')?.range}ft
            </span>
          )}
        </div>
        <p className="text-sm text-parchment/70">{race.description}</p>
      </div>

      {/* Ability Score Bonuses */}
      {allAbilityBonuses.length > 0 && (
        <Section title="Ability Score Bonuses">
          <div className="space-y-1.5">
            {allAbilityBonuses.map((bonus) => (
              <div key={`${bonus.ability}-${bonus.source}`} className="flex items-center gap-2">
                <ModifierBadge value={bonus.value} size="sm" />
                <span className="text-sm text-parchment">
                  {ABILITY_DISPLAY[bonus.ability]}
                </span>
                {selectedSubrace && (
                  <span className="text-xs text-parchment/40">({bonus.source})</span>
                )}
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Choice bonuses info for Half-Elf */}
      {isHalfElf && race.abilityBonusChoices && (
        <Section title="Ability Score Bonuses">
          <div className="flex items-center gap-2 mb-3">
            <ModifierBadge value={2} size="sm" />
            <span className="text-sm text-parchment">Charisma (fixed)</span>
          </div>
          <HalfElfBonusPicker
            selectedBonuses={choices.chosenAbilityBonuses}
            onBonusChange={(bonuses) =>
              onChoicesChange({ chosenAbilityBonuses: bonuses })
            }
          />
        </Section>
      )}

      {/* Subrace selector */}
      {race.subraces.length > 0 && (
        <Section title="Subrace">
          <SubraceSelector
            race={race}
            selectedSubraceId={choices.subraceId}
            onSelectSubrace={(subraceId) =>
              onChoicesChange({
                subraceId,
                // Clear subrace-specific choices when switching
                chosenCantrip: null,
                chosenLanguages: [],
              })
            }
          />
        </Section>
      )}

      {/* Racial Traits */}
      {(raceTraits.length > 0 || subraceTraits.length > 0) && (
        <Section title="Racial Traits">
          {raceTraits.length > 0 && (
            <div className="space-y-3">
              {selectedSubrace && (
                <p className="text-xs text-parchment/40 uppercase tracking-wide font-semibold">
                  Base Race
                </p>
              )}
              {raceTraits.map((trait) => (
                <TraitItem key={trait.id} name={trait.name} description={trait.description} />
              ))}
            </div>
          )}
          {subraceTraits.length > 0 && (
            <div className="space-y-3 mt-3">
              <p className="text-xs text-parchment/40 uppercase tracking-wide font-semibold">
                {selectedSubrace?.name}
              </p>
              {subraceTraits.map((trait) => (
                <TraitItem key={trait.id} name={trait.name} description={trait.description} />
              ))}
            </div>
          )}
        </Section>
      )}

      {/* Languages */}
      <Section title="Languages">
        <div className="flex flex-wrap gap-1.5">
          {knownLanguages.map((lang) => (
            <span
              key={lang}
              className="text-xs rounded-full px-2 py-0.5 bg-parchment/10 text-parchment/70 border border-parchment/15"
            >
              {formatLanguage(lang)}
            </span>
          ))}
        </div>
      </Section>

      {/* Language Picker (if race has language choices) */}
      {hasLanguageChoices && languageChoiceCount > 0 && (
        <LanguagePicker
          knownLanguages={knownLanguages}
          selectedLanguages={choices.chosenLanguages}
          onLanguageChange={(langs) =>
            onChoicesChange({ chosenLanguages: langs })
          }
          maxSelections={languageChoiceCount}
        />
      )}

      {/* Proficiencies */}
      {race.proficiencies && race.proficiencies.length > 0 && (
        <Section title="Proficiencies">
          <div className="flex flex-wrap gap-1.5">
            {race.proficiencies.map((prof) => (
              <span
                key={prof}
                className="text-xs rounded-full px-2 py-0.5 bg-parchment/10 text-parchment/70 border border-parchment/15"
              >
                {capitalize(prof)}
              </span>
            ))}
          </div>
        </Section>
      )}

      {/* Racial Choice Pickers */}

      {/* Half-Elf: skill picker (2 skills) */}
      {isHalfElf && (
        <SkillPicker
          selectedSkills={choices.chosenSkills}
          onSkillChange={(skills) =>
            onChoicesChange({ chosenSkills: skills })
          }
          maxSelections={2}
        />
      )}

      {/* Variant Human picker */}
      {isVariantHuman && (
        <VariantHumanPicker
          selectedBonuses={choices.chosenAbilityBonuses}
          onBonusChange={(bonuses) =>
            onChoicesChange({ chosenAbilityBonuses: bonuses })
          }
          selectedSkill={choices.chosenSkills[0] ?? null}
          onSkillChange={(skill) =>
            onChoicesChange({ chosenSkills: skill ? [skill] : [] })
          }
          selectedFeat={choices.chosenFeat}
          onFeatChange={(feat) =>
            onChoicesChange({ chosenFeat: feat })
          }
        />
      )}

      {/* High Elf: cantrip picker */}
      {isHighElf && (
        <HighElfCantripPicker
          selectedCantrip={choices.chosenCantrip}
          onCantripChange={(cantrip) =>
            onChoicesChange({ chosenCantrip: cantrip })
          }
        />
      )}

      {/* Dragonborn: ancestry picker */}
      {isDragonborn && (
        <DragonbornAncestryPicker
          selectedAncestry={choices.dragonbornAncestry}
          onAncestryChange={(ancestry) =>
            onChoicesChange({ dragonbornAncestry: ancestry })
          }
        />
      )}
    </div>
  )
}

// -- Internal Components -------------------------------------------------------

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div>
      <h4 className="text-sm font-semibold text-accent-gold mb-2 uppercase tracking-wide">
        {title}
      </h4>
      {children}
    </div>
  )
}

function TraitItem({
  name,
  description,
}: {
  name: string
  description: string
}) {
  return (
    <div>
      <p className="text-sm font-medium text-parchment">{name}</p>
      <p className="text-xs text-parchment/60 mt-0.5">{description}</p>
    </div>
  )
}
