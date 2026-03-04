// =============================================================================
// Story 10.2 -- ClassDetailPanel
// Detail panel content showing full class description, hit die, saving throws,
// proficiencies, L1 features, spellcasting info, and subclass info.
// =============================================================================

import { useState } from 'react'
import { ChevronDown, ChevronUp, Shield, Sword, Wrench, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { CharacterClass, ClassFeature } from '@/types/class'

const ABILITY_LABELS: Record<string, string> = {
  strength: 'Strength',
  dexterity: 'Dexterity',
  constitution: 'Constitution',
  intelligence: 'Intelligence',
  wisdom: 'Wisdom',
  charisma: 'Charisma',
}

const SPELLCASTING_TYPE_LABELS: Record<string, string> = {
  full: 'Full Caster',
  half: 'Half Caster',
  third: 'Third Caster',
  pact: 'Pact Magic',
  none: 'None',
}

interface ClassDetailPanelProps {
  characterClass: CharacterClass
}

export function ClassDetailPanel({ characterClass }: ClassDetailPanelProps) {
  return (
    <div className="space-y-6">
      {/* Overview Section */}
      <OverviewSection characterClass={characterClass} />

      {/* Proficiencies Section */}
      <ProficienciesSection characterClass={characterClass} />

      {/* Level 1 Features Section */}
      <FeaturesSection characterClass={characterClass} />

      {/* Spellcasting Preview (casters only) */}
      {characterClass.spellcasting && characterClass.spellcasting.type !== 'none' && (
        <SpellcastingSection characterClass={characterClass} />
      )}

      {/* Starting Equipment Preview */}
      <EquipmentPreviewSection characterClass={characterClass} />

      {/* Subclass Info */}
      <SubclassInfoSection characterClass={characterClass} />
    </div>
  )
}

// -- Overview -----------------------------------------------------------------

function OverviewSection({ characterClass }: { characterClass: CharacterClass }) {
  const primaryAbilities = characterClass.primaryAbility
    .map((a) => ABILITY_LABELS[a] ?? a)
    .join(', ')
  const savingThrows = characterClass.proficiencies.savingThrows
    .map((a) => ABILITY_LABELS[a] ?? a)
    .join(', ')

  return (
    <section aria-label="Overview">
      <h3 className="text-sm font-heading font-semibold text-accent-gold mb-2">Overview</h3>
      <p className="text-sm text-parchment/70 mb-3">{characterClass.description}</p>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <span className="text-parchment/50">Hit Die</span>
          <p className="font-semibold text-parchment">d{characterClass.hitDie}</p>
        </div>
        <div>
          <span className="text-parchment/50">HP at Level 1</span>
          <p className="font-semibold text-parchment">{characterClass.hitDie} + CON mod</p>
        </div>
        <div>
          <span className="text-parchment/50">Primary Ability</span>
          <p className="font-semibold text-parchment">{primaryAbilities}</p>
        </div>
        <div>
          <span className="text-parchment/50">Saving Throws</span>
          <p className="font-semibold text-parchment">{savingThrows}</p>
        </div>
      </div>
    </section>
  )
}

// -- Proficiencies ------------------------------------------------------------

function ProficienciesSection({ characterClass }: { characterClass: CharacterClass }) {
  const { proficiencies } = characterClass

  return (
    <section aria-label="Proficiencies">
      <h3 className="text-sm font-heading font-semibold text-accent-gold mb-2">Proficiencies</h3>
      <div className="space-y-2 text-sm">
        <ProficiencyRow
          icon={<Shield className="h-4 w-4" />}
          label="Armor"
          items={proficiencies.armor.length > 0 ? proficiencies.armor : ['None']}
        />
        <ProficiencyRow
          icon={<Sword className="h-4 w-4" />}
          label="Weapons"
          items={proficiencies.weapons.length > 0 ? proficiencies.weapons : ['None']}
        />
        {proficiencies.tools.length > 0 && (
          <ProficiencyRow
            icon={<Wrench className="h-4 w-4" />}
            label="Tools"
            items={proficiencies.tools}
          />
        )}
        <div className="text-xs text-parchment/50 mt-1">
          Skills: Choose {proficiencies.skillChoices.choose} from{' '}
          {proficiencies.skillChoices.from.length} options
        </div>
      </div>
    </section>
  )
}

function ProficiencyRow({
  icon,
  label,
  items,
}: {
  icon: React.ReactNode
  label: string
  items: string[]
}) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-parchment/50 mt-0.5">{icon}</span>
      <div>
        <span className="font-medium text-parchment/70">{label}: </span>
        <span className="text-parchment capitalize">{items.join(', ')}</span>
      </div>
    </div>
  )
}

// -- Level 1 Features ---------------------------------------------------------

function FeaturesSection({ characterClass }: { characterClass: CharacterClass }) {
  const features = characterClass.features[1] ?? []

  return (
    <section aria-label="Level 1 Features">
      <h3 className="text-sm font-heading font-semibold text-accent-gold mb-2">
        Level 1 Features
      </h3>
      <div className="space-y-2">
        {features.map((feature) => (
          <FeatureCard key={feature.id} feature={feature} />
        ))}
      </div>
    </section>
  )
}

function FeatureCard({ feature }: { feature: ClassFeature }) {
  const [expanded, setExpanded] = useState(false)
  const isLong = feature.description.length > 100

  return (
    <div className="rounded-lg border border-parchment/15 bg-parchment/5 p-3">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between w-full text-left"
        aria-expanded={expanded}
      >
        <span className="text-sm font-medium text-parchment">{feature.name}</span>
        {isLong && (
          <span className="text-parchment/40 ml-2">
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </span>
        )}
      </button>
      <p
        className={cn(
          'text-xs text-parchment/60 mt-1',
          !expanded && isLong && 'line-clamp-2',
        )}
      >
        {feature.description}
      </p>
      {feature.recharge && (
        <span className="inline-block mt-1 text-[10px] text-accent-gold/70 bg-accent-gold/10 rounded px-1.5 py-0.5">
          {feature.recharge === 'shortRest' ? 'Short Rest' : 'Long Rest'}
          {feature.usesPerRecharge ? ` (${feature.usesPerRecharge}/rest)` : ''}
        </span>
      )}
    </div>
  )
}

// -- Spellcasting Preview -----------------------------------------------------

function SpellcastingSection({ characterClass }: { characterClass: CharacterClass }) {
  const sc = characterClass.spellcasting
  if (!sc || sc.type === 'none') return null

  const cantripsAtL1 = sc.cantripsKnown[0] ?? 0
  const spellsAtL1 = sc.spellsKnownByLevel?.[0] ?? null
  const abilityLabel = ABILITY_LABELS[sc.ability] ?? sc.ability

  return (
    <section aria-label="Spellcasting">
      <h3 className="text-sm font-heading font-semibold text-accent-gold mb-2 flex items-center gap-1.5">
        <Sparkles className="h-4 w-4" />
        Spellcasting
      </h3>
      <div className="space-y-1 text-sm">
        <div className="flex justify-between">
          <span className="text-parchment/50">Type</span>
          <span className="text-parchment">{SPELLCASTING_TYPE_LABELS[sc.type]}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-parchment/50">Ability</span>
          <span className="text-parchment">{abilityLabel}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-parchment/50">Spells</span>
          <span className="text-parchment">
            {sc.spellsKnownOrPrepared === 'known' ? 'Known' : 'Prepared'}
          </span>
        </div>
        {cantripsAtL1 > 0 && (
          <div className="flex justify-between">
            <span className="text-parchment/50">Cantrips at Level 1</span>
            <span className="text-parchment">{cantripsAtL1}</span>
          </div>
        )}
        {spellsAtL1 !== null && spellsAtL1 > 0 && (
          <div className="flex justify-between">
            <span className="text-parchment/50">Spells Known at Level 1</span>
            <span className="text-parchment">{spellsAtL1}</span>
          </div>
        )}
        {sc.ritualCasting && (
          <div className="flex justify-between">
            <span className="text-parchment/50">Ritual Casting</span>
            <span className="text-parchment">Yes</span>
          </div>
        )}
        {sc.focusType && (
          <div className="flex justify-between">
            <span className="text-parchment/50">Focus</span>
            <span className="text-parchment">{sc.focusType}</span>
          </div>
        )}
      </div>
      <p className="text-xs text-parchment/40 mt-2 italic">
        Spell selection happens in a later step.
      </p>
    </section>
  )
}

// -- Equipment Preview --------------------------------------------------------

function EquipmentPreviewSection({ characterClass }: { characterClass: CharacterClass }) {
  return (
    <section aria-label="Starting Equipment">
      <h3 className="text-sm font-heading font-semibold text-accent-gold mb-2">
        Starting Equipment Preview
      </h3>
      <div className="space-y-1 text-sm">
        {characterClass.startingEquipment.map((choice, i) => (
          <div key={i} className="text-xs text-parchment/60">
            <span className="text-parchment/80">{choice.description}: </span>
            {choice.options.map((opt, j) => (
              <span key={j}>
                {j > 0 && <span className="text-parchment/40"> OR </span>}
                {opt.join(', ')}
              </span>
            ))}
          </div>
        ))}
      </div>
      <p className="text-xs text-parchment/40 mt-2 italic">
        Equipment selection happens in a later step.
      </p>
    </section>
  )
}

// -- Subclass Info ------------------------------------------------------------

function SubclassInfoSection({ characterClass }: { characterClass: CharacterClass }) {
  return (
    <section aria-label="Subclass">
      <h3 className="text-sm font-heading font-semibold text-accent-gold mb-2">
        {characterClass.subclassName}
      </h3>
      {characterClass.subclassLevel === 1 ? (
        <p className="text-sm text-parchment/70">
          You choose your {characterClass.subclassName} at level 1. Select it below after choosing this class.
        </p>
      ) : (
        <p className="text-sm text-parchment/50">
          You will choose your {characterClass.subclassName} at level {characterClass.subclassLevel}.
        </p>
      )}
    </section>
  )
}
