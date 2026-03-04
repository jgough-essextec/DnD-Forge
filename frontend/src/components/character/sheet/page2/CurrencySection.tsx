/**
 * CurrencySection Component (Story 18.4)
 *
 * Displays and manages currency across all 5 D&D 5e denominations:
 * - CP (Copper Pieces)
 * - SP (Silver Pieces)
 * - EP (Electrum Pieces)
 * - GP (Gold Pieces)
 * - PP (Platinum Pieces)
 *
 * Features:
 * - Always editable (even in view mode, like HP)
 * - +/- buttons for quick adjustment
 * - Direct numeric input
 * - Total wealth in GP equivalent
 * - Optional auto-convert toggle
 *
 * Conversion rates: 1 PP = 10 GP = 20 EP = 100 SP = 1000 CP
 */

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { useCharacterSheet } from '@/components/character/CharacterSheetProvider'
import type { Currency } from '@/types/core'

export interface CurrencySectionProps {
  className?: string
}

type CurrencyDenomination = 'cp' | 'sp' | 'ep' | 'gp' | 'pp'

const CURRENCY_DENOMINATIONS: Array<{
  key: CurrencyDenomination
  label: string
  fullName: string
  color: string
}> = [
  { key: 'cp', label: 'CP', fullName: 'Copper Pieces', color: 'text-orange-400' },
  { key: 'sp', label: 'SP', fullName: 'Silver Pieces', color: 'text-gray-300' },
  { key: 'ep', label: 'EP', fullName: 'Electrum Pieces', color: 'text-yellow-300' },
  { key: 'gp', label: 'GP', fullName: 'Gold Pieces', color: 'text-accent-gold' },
  { key: 'pp', label: 'PP', fullName: 'Platinum Pieces', color: 'text-blue-300' },
]

/**
 * Calculate total wealth in GP equivalent.
 * Conversion: (CP/100) + (SP/10) + (EP/5) + GP + (PP*10)
 */
function calculateTotalWealthGP(currency: Currency): number {
  return (
    currency.cp / 100 +
    currency.sp / 10 +
    currency.ep / 5 +
    currency.gp +
    currency.pp * 10
  )
}

/**
 * Auto-convert currency upwards.
 * Example: 10 SP -> 1 GP
 */
function autoConvertCurrency(currency: Currency): Currency {
  let { cp, sp, ep, gp, pp } = currency

  // CP to SP (100 CP = 1 SP)
  if (cp >= 100) {
    const spToAdd = Math.floor(cp / 100)
    sp += spToAdd
    cp = cp % 100
  }

  // SP to GP (10 SP = 1 GP)
  if (sp >= 10) {
    const gpToAdd = Math.floor(sp / 10)
    gp += gpToAdd
    sp = sp % 10
  }

  // EP to GP (5 EP = 1 GP) - awkward conversion
  if (ep >= 5) {
    const gpToAdd = Math.floor(ep / 5)
    gp += gpToAdd
    ep = ep % 5
  }

  // GP to PP (10 GP = 1 PP)
  if (gp >= 10) {
    const ppToAdd = Math.floor(gp / 10)
    pp += ppToAdd
    gp = gp % 10
  }

  return { cp, sp, ep, gp, pp }
}

export function CurrencySection({ className }: CurrencySectionProps) {
  const { character, editableCharacter, updateField } = useCharacterSheet()

  const currency = editableCharacter.currency ?? character?.currency ?? { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 }

  const [autoConvert, setAutoConvert] = useState(false)

  const totalWealthGP = calculateTotalWealthGP(currency)

  const handleCurrencyChange = (denomination: CurrencyDenomination, value: number) => {
    const newValue = Math.max(0, value)
    let updatedCurrency = { ...currency, [denomination]: newValue }

    if (autoConvert) {
      updatedCurrency = autoConvertCurrency(updatedCurrency)
    }

    updateField('currency', updatedCurrency)
  }

  const handleIncrement = (denomination: CurrencyDenomination) => {
    handleCurrencyChange(denomination, currency[denomination] + 1)
  }

  const handleDecrement = (denomination: CurrencyDenomination) => {
    handleCurrencyChange(denomination, currency[denomination] - 1)
  }

  const handleDirectInput = (denomination: CurrencyDenomination, valueStr: string) => {
    const value = parseInt(valueStr, 10)
    if (isNaN(value)) {
      handleCurrencyChange(denomination, 0)
    } else {
      handleCurrencyChange(denomination, value)
    }
  }

  return (
    <div
      className={cn(
        'flex flex-col gap-4 p-4 rounded-lg bg-secondary border border-accent-gold/20',
        className
      )}
      data-testid="currency-section"
      aria-label="Currency"
    >
      {/* Header with Auto-Convert Toggle */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-accent-gold">Currency</h2>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={autoConvert}
            onChange={(e) => setAutoConvert(e.target.checked)}
            className="w-4 h-4 accent-accent-gold cursor-pointer"
            data-testid="auto-convert-toggle"
          />
          <span className="text-parchment/80">Auto-Convert</span>
        </label>
      </div>

      {/* Currency Denominations */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        {CURRENCY_DENOMINATIONS.map(({ key, label, fullName, color }) => {
          const amount = currency[key]

          return (
            <div
              key={key}
              className="flex flex-col gap-2 p-3 bg-primary rounded border border-accent-gold/20"
              data-testid={`currency-${key}`}
            >
              {/* Denomination Label */}
              <div className="flex items-center justify-center gap-1">
                <span className={cn('text-lg font-bold', color)}>{label}</span>
                <span className="text-xs text-parchment/60 hidden sm:inline">
                  {fullName}
                </span>
              </div>

              {/* Amount Display/Input */}
              <div className="flex items-center justify-center">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => handleDirectInput(key, e.target.value)}
                  className="w-20 px-2 py-1 text-center text-lg font-semibold bg-primary border border-accent-gold/30 rounded focus:border-accent-gold outline-none text-parchment"
                  min="0"
                  aria-label={`${fullName} amount`}
                  data-testid={`currency-input-${key}`}
                />
              </div>

              {/* +/- Buttons */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleDecrement(key)}
                  className="flex-1 py-1 bg-primary border border-accent-gold/30 rounded hover:border-accent-gold text-parchment font-semibold transition-colors"
                  aria-label={`Decrease ${fullName}`}
                  data-testid={`currency-decrease-${key}`}
                >
                  -
                </button>
                <button
                  onClick={() => handleIncrement(key)}
                  className="flex-1 py-1 bg-primary border border-accent-gold/30 rounded hover:border-accent-gold text-parchment font-semibold transition-colors"
                  aria-label={`Increase ${fullName}`}
                  data-testid={`currency-increase-${key}`}
                >
                  +
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Total Wealth in GP Equivalent */}
      <div className="flex items-center justify-between pt-3 border-t border-accent-gold/30">
        <span className="text-sm text-parchment/60">Total Wealth:</span>
        <span className="text-lg font-bold text-accent-gold" data-testid="total-wealth-gp">
          {totalWealthGP.toFixed(2)} GP
        </span>
      </div>

      {/* Conversion Rates Tooltip */}
      <div className="text-xs text-parchment/40 text-center">
        Conversion: 1 PP = 10 GP = 20 EP = 100 SP = 1000 CP
      </div>
    </div>
  )
}
