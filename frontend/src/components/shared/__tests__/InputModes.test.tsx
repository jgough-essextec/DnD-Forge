/**
 * Input Mode Tests (Story 44.3)
 *
 * Verifies that numeric inputs use inputmode="numeric" and
 * dice expression inputs use inputmode="text".
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import CombatantHPEditor from '@/components/dm/combat/CombatantHPEditor'
import { ExpressionInput } from '@/components/dice/ExpressionInput'

describe('Input Modes (Story 44.3)', () => {
  describe('HP Amount Input', () => {
    it('has inputmode="numeric" on the HP amount input', () => {
      render(
        <CombatantHPEditor
          currentHp={20}
          maxHp={30}
          tempHp={0}
          isCurrentTurn={true}
          onDamage={vi.fn()}
          onHeal={vi.fn()}
          onSetTempHp={vi.fn()}
          onClose={vi.fn()}
        />,
      )

      const input = screen.getByTestId('hp-amount-input')
      expect(input).toHaveAttribute('inputmode', 'numeric')
    })
  })

  describe('Dice Expression Input', () => {
    it('has inputmode="text" on the dice expression input', () => {
      render(
        <ExpressionInput
          onRoll={vi.fn()}
          recentExpressions={[]}
        />,
      )

      const input = screen.getByTestId('expression-field')
      expect(input).toHaveAttribute('inputmode', 'text')
    })

    it('has autocomplete="off" on the dice expression input', () => {
      render(
        <ExpressionInput
          onRoll={vi.fn()}
          recentExpressions={[]}
        />,
      )

      const input = screen.getByTestId('expression-field')
      expect(input).toHaveAttribute('autocomplete', 'off')
    })
  })
})
