/**
 * CharacterPreviewPage2 - Backstory & Details page of the character sheet preview.
 *
 * Displays: appearance fields (age, height, weight, eyes, skin, hair),
 * backstory text, allies & organizations, equipment inventory with weight
 * totals, and currency.
 */

import type { ReviewData } from './useReviewData'
import { EditableSection } from './EditableSection'

interface CharacterPreviewPage2Props {
  data: ReviewData
  onEditSection?: (stepId: number) => void
}

export function CharacterPreviewPage2({ data, onEditSection }: CharacterPreviewPage2Props) {
  const {
    description,
    equipment,
    currency,
    totalWeight,
    languages,
    armorProficiencies,
    weaponProficiencies,
    toolProficiencies,
  } = data

  return (
    <div className="space-y-4" data-testid="preview-page-2">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left Column: Appearance & Backstory */}
        <div className="space-y-4">
          {/* Appearance */}
          <EditableSection stepId={4} label="Appearance" onEdit={onEditSection}>
            <div className="bg-bg-secondary rounded-lg border border-parchment/20 p-4">
              <h3 className="font-heading text-sm text-accent-gold/80 uppercase tracking-wider mb-3">
                Character Appearance
              </h3>
              <div className="grid grid-cols-3 gap-3" data-testid="appearance-section">
                <AppearanceField label="Age" value={description.age} />
                <AppearanceField label="Height" value={description.height} />
                <AppearanceField label="Weight" value={description.weight} />
                <AppearanceField label="Eyes" value={description.eyes} />
                <AppearanceField label="Skin" value={description.skin} />
                <AppearanceField label="Hair" value={description.hair} />
              </div>
              {description.appearance && (
                <div className="mt-3 pt-3 border-t border-parchment/10">
                  <span className="text-parchment/50 text-xs uppercase tracking-wider">Appearance Notes</span>
                  <p className="text-parchment/80 text-sm mt-1">{description.appearance}</p>
                </div>
              )}
            </div>
          </EditableSection>

          {/* Backstory */}
          <EditableSection stepId={4} label="Backstory" onEdit={onEditSection}>
            <div className="bg-bg-secondary rounded-lg border border-parchment/20 p-4">
              <h3 className="font-heading text-sm text-accent-gold/80 uppercase tracking-wider mb-2">
                Backstory
              </h3>
              <div data-testid="backstory-section">
                {description.backstory ? (
                  <p className="text-parchment/80 text-sm whitespace-pre-wrap">{description.backstory}</p>
                ) : (
                  <p className="text-parchment/30 text-sm italic">No backstory written yet.</p>
                )}
              </div>
            </div>
          </EditableSection>

          {/* Allies & Organizations */}
          <div className="bg-bg-secondary rounded-lg border border-parchment/20 p-4">
            <h3 className="font-heading text-sm text-accent-gold/80 uppercase tracking-wider mb-2">
              Allies & Organizations
            </h3>
            <div data-testid="allies-section">
              {description.alliesAndOrgs ? (
                <p className="text-parchment/80 text-sm whitespace-pre-wrap">{description.alliesAndOrgs}</p>
              ) : (
                <p className="text-parchment/30 text-sm italic">None specified.</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Equipment, Currency, Proficiencies */}
        <div className="space-y-4">
          {/* Equipment Inventory */}
          <EditableSection stepId={5} label="Equipment" onEdit={onEditSection}>
            <div className="bg-bg-secondary rounded-lg border border-parchment/20 p-4">
              <h3 className="font-heading text-sm text-accent-gold/80 uppercase tracking-wider mb-3">
                Equipment
              </h3>
              <div data-testid="equipment-section">
                {equipment.length === 0 ? (
                  <p className="text-parchment/30 text-sm italic">No equipment selected.</p>
                ) : (
                  <div className="space-y-1">
                    {equipment.map((item, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between text-sm py-0.5"
                      >
                        <div className="flex items-center gap-2">
                          {item.isEquipped && (
                            <span
                              className="w-1.5 h-1.5 rounded-full bg-accent-gold/70"
                              title="Equipped"
                            />
                          )}
                          <span className="text-parchment/80">
                            {item.name}
                            {item.quantity > 1 && (
                              <span className="text-parchment/40"> x{item.quantity}</span>
                            )}
                          </span>
                        </div>
                        <span className="text-parchment/40 text-xs">
                          {(item.weight * item.quantity).toFixed(1)} lb
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                <div className="mt-3 pt-2 border-t border-parchment/10 flex justify-between text-sm">
                  <span className="text-parchment/50">Total Weight</span>
                  <span className="text-parchment font-semibold" data-testid="total-weight">
                    {totalWeight.toFixed(1)} lb
                  </span>
                </div>
              </div>
            </div>
          </EditableSection>

          {/* Currency / Treasure */}
          <div className="bg-bg-secondary rounded-lg border border-parchment/20 p-4">
            <h3 className="font-heading text-sm text-accent-gold/80 uppercase tracking-wider mb-3">
              Treasure
            </h3>
            <div className="grid grid-cols-5 gap-2 text-center" data-testid="currency-section">
              <CurrencyDisplay label="CP" value={currency.cp} />
              <CurrencyDisplay label="SP" value={currency.sp} />
              <CurrencyDisplay label="EP" value={currency.ep} />
              <CurrencyDisplay label="GP" value={currency.gp} />
              <CurrencyDisplay label="PP" value={currency.pp} />
            </div>
          </div>

          {/* Proficiencies & Languages */}
          <div className="bg-bg-secondary rounded-lg border border-parchment/20 p-4">
            <h3 className="font-heading text-sm text-accent-gold/80 uppercase tracking-wider mb-3">
              Other Proficiencies & Languages
            </h3>
            <div className="space-y-3 text-sm" data-testid="proficiencies-section">
              {armorProficiencies.length > 0 && (
                <div>
                  <span className="text-parchment/50 text-xs uppercase tracking-wider">Armor</span>
                  <p className="text-parchment/80 mt-0.5 capitalize">
                    {armorProficiencies.join(', ')}
                  </p>
                </div>
              )}
              {weaponProficiencies.length > 0 && (
                <div>
                  <span className="text-parchment/50 text-xs uppercase tracking-wider">Weapons</span>
                  <p className="text-parchment/80 mt-0.5 capitalize">
                    {weaponProficiencies.join(', ')}
                  </p>
                </div>
              )}
              {toolProficiencies.length > 0 && (
                <div>
                  <span className="text-parchment/50 text-xs uppercase tracking-wider">Tools</span>
                  <p className="text-parchment/80 mt-0.5 capitalize">
                    {toolProficiencies.join(', ')}
                  </p>
                </div>
              )}
              {languages.length > 0 && (
                <div>
                  <span className="text-parchment/50 text-xs uppercase tracking-wider">Languages</span>
                  <p className="text-parchment/80 mt-0.5 capitalize">
                    {languages.join(', ')}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Helper sub-components

function AppearanceField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-parchment/50 text-xs uppercase tracking-wider">{label}</span>
      <p className="text-parchment/80 text-sm mt-0.5">
        {value || <span className="italic text-parchment/30">--</span>}
      </p>
    </div>
  )
}

function CurrencyDisplay({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-bg-primary/50 rounded p-2">
      <div className="text-lg font-heading font-bold text-accent-gold/80">{value}</div>
      <div className="text-xs text-parchment/40 uppercase">{label}</div>
    </div>
  )
}
