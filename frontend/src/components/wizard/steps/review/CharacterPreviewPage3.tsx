/**
 * CharacterPreviewPage3 - Spellcasting page of the character sheet preview.
 *
 * Only rendered for spellcasting classes. Displays: spellcasting class,
 * ability, spell save DC, spell attack bonus, cantrips, spell slot counts,
 * and known/prepared spells with school and brief description.
 */

import type { ReviewData } from './useReviewData'
import { EditableSection } from './EditableSection'

interface CharacterPreviewPage3Props {
  data: ReviewData
  onEditSection?: (stepId: number) => void
}

function formatModifier(mod: number): string {
  return mod >= 0 ? `+${mod}` : `${mod}`
}

const SCHOOL_COLORS: Record<string, string> = {
  abjuration: 'text-blue-400',
  conjuration: 'text-amber-400',
  divination: 'text-cyan-300',
  enchantment: 'text-pink-400',
  evocation: 'text-red-400',
  illusion: 'text-purple-400',
  necromancy: 'text-emerald-400',
  transmutation: 'text-orange-400',
}

export function CharacterPreviewPage3({ data, onEditSection }: CharacterPreviewPage3Props) {
  const {
    className,
    spellcastingAbility,
    spellSaveDC,
    spellAttackBonus,
    spellSlots,
    cantrips,
    levelSpells,
  } = data

  return (
    <div className="space-y-4" data-testid="preview-page-3">
      {/* Spellcasting Header */}
      <div className="bg-bg-secondary rounded-lg border border-parchment/20 p-4">
        <h3 className="font-heading text-lg text-accent-gold mb-3">Spellcasting</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4" data-testid="spellcasting-header">
          <div>
            <span className="text-parchment/50 text-xs uppercase tracking-wider block">
              Spellcasting Class
            </span>
            <span className="text-parchment font-medium" data-testid="spellcasting-class">
              {className}
            </span>
          </div>
          <div>
            <span className="text-parchment/50 text-xs uppercase tracking-wider block">
              Spellcasting Ability
            </span>
            <span className="text-parchment font-medium capitalize" data-testid="spellcasting-ability">
              {spellcastingAbility ?? '--'}
            </span>
          </div>
          <div>
            <span className="text-parchment/50 text-xs uppercase tracking-wider block">
              Spell Save DC
            </span>
            <span className="text-parchment text-xl font-heading font-bold" data-testid="spell-dc">
              {spellSaveDC}
            </span>
          </div>
          <div>
            <span className="text-parchment/50 text-xs uppercase tracking-wider block">
              Spell Attack Bonus
            </span>
            <span className="text-parchment text-xl font-heading font-bold" data-testid="spell-attack">
              {formatModifier(spellAttackBonus)}
            </span>
          </div>
        </div>
      </div>

      {/* Cantrips */}
      <EditableSection stepId={6} label="Cantrips" onEdit={onEditSection}>
        <div className="bg-bg-secondary rounded-lg border border-parchment/20 p-4">
          <h3 className="font-heading text-sm text-accent-gold/80 uppercase tracking-wider mb-3">
            Cantrips
          </h3>
          <div data-testid="cantrips-section">
            {cantrips.length === 0 ? (
              <p className="text-parchment/30 text-sm italic">No cantrips selected.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {cantrips.map((spell) => (
                  <SpellCard key={spell.id} spell={spell} />
                ))}
              </div>
            )}
          </div>
        </div>
      </EditableSection>

      {/* Spell Slots */}
      <div className="bg-bg-secondary rounded-lg border border-parchment/20 p-4">
        <h3 className="font-heading text-sm text-accent-gold/80 uppercase tracking-wider mb-3">
          Spell Slots
        </h3>
        <div className="flex gap-3 flex-wrap" data-testid="spell-slots-section">
          {Object.entries(spellSlots).length === 0 ? (
            <p className="text-parchment/30 text-sm italic">No spell slots at this level.</p>
          ) : (
            Object.entries(spellSlots).map(([level, count]) => (
              <div
                key={level}
                className="bg-bg-primary/50 rounded-lg border border-parchment/10 px-4 py-2 text-center"
              >
                <div className="text-lg font-heading font-bold text-parchment">{count}</div>
                <div className="text-xs text-parchment/40">
                  {level === '1' ? '1st' : level === '2' ? '2nd' : level === '3' ? '3rd' : `${level}th`} Level
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Known/Prepared Spells */}
      <EditableSection stepId={6} label="Spells" onEdit={onEditSection}>
        <div className="bg-bg-secondary rounded-lg border border-parchment/20 p-4">
          <h3 className="font-heading text-sm text-accent-gold/80 uppercase tracking-wider mb-3">
            Known Spells
          </h3>
          <div data-testid="level-spells-section">
            {levelSpells.length === 0 ? (
              <p className="text-parchment/30 text-sm italic">No spells selected.</p>
            ) : (
              <div className="space-y-2">
                {levelSpells.map((spell) => (
                  <SpellCard key={spell.id} spell={spell} showLevel />
                ))}
              </div>
            )}
          </div>
        </div>
      </EditableSection>
    </div>
  )
}

function SpellCard({
  spell,
  showLevel,
}: {
  spell: { id: string; name: string; school: string; level: number; description: string; concentration: boolean; ritual: boolean }
  showLevel?: boolean
}) {
  const schoolColor = SCHOOL_COLORS[spell.school] ?? 'text-parchment/60'

  return (
    <div className="bg-bg-primary/30 rounded border border-parchment/10 p-2">
      <div className="flex items-baseline gap-2">
        <span className="text-parchment font-medium text-sm">{spell.name}</span>
        {showLevel && (
          <span className="text-parchment/40 text-xs">
            ({spell.level === 0 ? 'Cantrip' : `Level ${spell.level}`})
          </span>
        )}
        {spell.concentration && (
          <span className="text-amber-400/70 text-[10px] uppercase">C</span>
        )}
        {spell.ritual && (
          <span className="text-blue-400/70 text-[10px] uppercase">R</span>
        )}
      </div>
      <div className="flex items-center gap-1.5 mt-0.5">
        <span className={`text-[10px] uppercase tracking-wider ${schoolColor}`}>
          {spell.school}
        </span>
      </div>
      <p className="text-parchment/50 text-xs mt-1 line-clamp-2">{spell.description}</p>
    </div>
  )
}
