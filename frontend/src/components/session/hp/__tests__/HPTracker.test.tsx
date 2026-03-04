/**
 * HP Tracker Component Tests (Epic 27)
 *
 * Functional tests for DamageHealModal, TempHPManager, DeathSaveTracker,
 * DamageTypeSelector, and HPSessionTracker components.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DamageHealModal } from '../DamageHealModal'
import { TempHPManager } from '../TempHPManager'
import { DeathSaveTracker } from '../DeathSaveTracker'
import { DamageTypeSelector } from '../DamageTypeSelector'
import { HPSessionTracker } from '../HPSessionTracker'

// Mock the dice store
vi.mock('@/stores/diceStore', () => ({
  useDiceStore: () => ({
    roll: vi.fn().mockReturnValue({
      id: '1',
      dice: [{ type: 'd20', count: 1 }],
      results: [14],
      modifier: 0,
      total: 14,
      label: 'Death Save',
      timestamp: new Date(),
    }),
    rolls: [],
    maxHistory: 50,
    clearHistory: vi.fn(),
    removeRoll: vi.fn(),
  }),
}))

// =============================================================================
// DamageTypeSelector
// =============================================================================

describe('DamageTypeSelector', () => {
  it('should render all 13 D&D damage types', () => {
    render(
      <DamageTypeSelector
        selected={null}
        onSelect={vi.fn()}
      />,
    )
    expect(screen.getByTestId('damage-type-fire')).toBeInTheDocument()
    expect(screen.getByTestId('damage-type-cold')).toBeInTheDocument()
    expect(screen.getByTestId('damage-type-lightning')).toBeInTheDocument()
    expect(screen.getByTestId('damage-type-acid')).toBeInTheDocument()
    expect(screen.getByTestId('damage-type-bludgeoning')).toBeInTheDocument()
    expect(screen.getByTestId('damage-type-force')).toBeInTheDocument()
    expect(screen.getByTestId('damage-type-necrotic')).toBeInTheDocument()
    expect(screen.getByTestId('damage-type-piercing')).toBeInTheDocument()
    expect(screen.getByTestId('damage-type-poison')).toBeInTheDocument()
    expect(screen.getByTestId('damage-type-psychic')).toBeInTheDocument()
    expect(screen.getByTestId('damage-type-radiant')).toBeInTheDocument()
    expect(screen.getByTestId('damage-type-slashing')).toBeInTheDocument()
    expect(screen.getByTestId('damage-type-thunder')).toBeInTheDocument()
  })

  it('should call onSelect when a damage type is clicked', async () => {
    const onSelect = vi.fn()
    render(
      <DamageTypeSelector
        selected={null}
        onSelect={onSelect}
      />,
    )
    await userEvent.click(screen.getByTestId('damage-type-fire'))
    expect(onSelect).toHaveBeenCalledWith('fire')
  })

  it('should deselect when clicking already selected type', async () => {
    const onSelect = vi.fn()
    render(
      <DamageTypeSelector
        selected="fire"
        onSelect={onSelect}
      />,
    )
    await userEvent.click(screen.getByTestId('damage-type-fire'))
    expect(onSelect).toHaveBeenCalledWith(null)
  })

  it('should show RES badge for resistance damage types', () => {
    render(
      <DamageTypeSelector
        selected={null}
        onSelect={vi.fn()}
        resistances={['fire']}
      />,
    )
    const fireButton = screen.getByTestId('damage-type-fire')
    expect(fireButton).toHaveTextContent('RES')
  })

  it('should show VUL badge for vulnerability damage types', () => {
    render(
      <DamageTypeSelector
        selected={null}
        onSelect={vi.fn()}
        vulnerabilities={['cold']}
      />,
    )
    const coldButton = screen.getByTestId('damage-type-cold')
    expect(coldButton).toHaveTextContent('VUL')
  })

  it('should show IMM badge for immunity damage types', () => {
    render(
      <DamageTypeSelector
        selected={null}
        onSelect={vi.fn()}
        immunities={['poison']}
      />,
    )
    const poisonButton = screen.getByTestId('damage-type-poison')
    expect(poisonButton).toHaveTextContent('IMM')
  })
})

// =============================================================================
// DamageHealModal
// =============================================================================

describe('DamageHealModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    hpCurrent: 25,
    hpMax: 35,
    tempHp: 0,
    onApplyDamage: vi.fn(),
    onApplyHealing: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render Take Damage and Heal tabs', () => {
    render(<DamageHealModal {...defaultProps} />)
    expect(screen.getByTestId('tab-damage')).toBeInTheDocument()
    expect(screen.getByTestId('tab-heal')).toBeInTheDocument()
  })

  it('should render damage tab content by default', () => {
    render(<DamageHealModal {...defaultProps} />)
    expect(screen.getByText('Damage Amount')).toBeInTheDocument()
    expect(screen.getByTestId('damage-type-selector')).toBeInTheDocument()
  })

  it('should switch to heal tab when clicked', async () => {
    render(<DamageHealModal {...defaultProps} />)
    await userEvent.click(screen.getByTestId('tab-heal'))
    expect(screen.getByText('Healing Amount')).toBeInTheDocument()
  })

  it('should show real-time damage preview', async () => {
    render(<DamageHealModal {...defaultProps} />)
    const input = screen.getByTestId('hp-amount-input')
    await userEvent.clear(input)
    await userEvent.type(input, '7')
    expect(screen.getByTestId('damage-preview')).toBeInTheDocument()
    expect(screen.getByTestId('damage-preview')).toHaveTextContent('25')
    expect(screen.getByTestId('damage-preview')).toHaveTextContent('18')
  })

  it('should show instant death warning for massive damage', async () => {
    render(<DamageHealModal {...defaultProps} hpCurrent={10} hpMax={20} />)
    const input = screen.getByTestId('hp-amount-input')
    await userEvent.clear(input)
    await userEvent.type(input, '30')
    expect(screen.getByTestId('instant-death-warning')).toBeInTheDocument()
    expect(screen.getByTestId('instant-death-warning')).toHaveTextContent('Massive Damage')
  })

  it('should show unconscious warning when damage drops to 0', async () => {
    render(<DamageHealModal {...defaultProps} hpCurrent={10} hpMax={35} />)
    const input = screen.getByTestId('hp-amount-input')
    await userEvent.clear(input)
    await userEvent.type(input, '12')
    expect(screen.getByTestId('unconscious-warning')).toBeInTheDocument()
  })

  it('should show resistance text when damage type matches resistance', async () => {
    render(
      <DamageHealModal
        {...defaultProps}
        resistances={['fire']}
      />,
    )
    const input = screen.getByTestId('hp-amount-input')
    await userEvent.clear(input)
    await userEvent.type(input, '10')
    await userEvent.click(screen.getByTestId('damage-type-fire'))
    expect(screen.getByTestId('damage-relation-text')).toHaveTextContent('Resisted: half damage')
  })

  it('should show healing preview with correct values', async () => {
    render(<DamageHealModal {...defaultProps} initialTab="heal" />)
    const input = screen.getByTestId('hp-amount-input')
    await userEvent.clear(input)
    await userEvent.type(input, '8')
    expect(screen.getByTestId('healing-preview')).toBeInTheDocument()
  })

  it('should show stabilized message when healing from 0 HP', async () => {
    render(
      <DamageHealModal
        {...defaultProps}
        hpCurrent={0}
        initialTab="heal"
      />,
    )
    const input = screen.getByTestId('hp-amount-input')
    await userEvent.clear(input)
    await userEvent.type(input, '5')
    expect(screen.getByTestId('stabilized-message')).toBeInTheDocument()
    expect(screen.getByTestId('stabilized-message')).toHaveTextContent('Stabilized')
  })

  it('should call onApplyDamage when Apply button is clicked', async () => {
    const onApplyDamage = vi.fn()
    render(
      <DamageHealModal
        {...defaultProps}
        onApplyDamage={onApplyDamage}
      />,
    )
    const input = screen.getByTestId('hp-amount-input')
    await userEvent.clear(input)
    await userEvent.type(input, '10')
    await userEvent.click(screen.getByTestId('apply-button'))
    expect(onApplyDamage).toHaveBeenCalled()
  })

  it('should call onApplyHealing when Apply button is clicked on heal tab', async () => {
    const onApplyHealing = vi.fn()
    render(
      <DamageHealModal
        {...defaultProps}
        initialTab="heal"
        onApplyHealing={onApplyHealing}
      />,
    )
    const input = screen.getByTestId('hp-amount-input')
    await userEvent.clear(input)
    await userEvent.type(input, '8')
    await userEvent.click(screen.getByTestId('apply-button'))
    expect(onApplyHealing).toHaveBeenCalled()
  })

  it('should not render when isOpen is false', () => {
    render(<DamageHealModal {...defaultProps} isOpen={false} />)
    expect(screen.queryByTestId('damage-heal-modal')).not.toBeInTheDocument()
  })

  it('should disable Apply button when amount is 0', () => {
    render(<DamageHealModal {...defaultProps} />)
    expect(screen.getByTestId('apply-button')).toBeDisabled()
  })
})

// =============================================================================
// TempHPManager
// =============================================================================

describe('TempHPManager', () => {
  const defaultProps = {
    tempHp: 0,
    hpCurrent: 25,
    hpMax: 35,
    onSetTempHP: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render temp HP manager', () => {
    render(<TempHPManager {...defaultProps} />)
    expect(screen.getByTestId('temp-hp-manager')).toBeInTheDocument()
  })

  it('should display "Set" button when temp HP is 0', () => {
    render(<TempHPManager {...defaultProps} />)
    expect(screen.getByTestId('temp-hp-display')).toHaveTextContent('Set')
  })

  it('should display temp HP value when > 0', () => {
    render(<TempHPManager {...defaultProps} tempHp={10} />)
    expect(screen.getByTestId('temp-hp-display')).toHaveTextContent('10')
  })

  it('should show blue overlay on HP bar when temp HP is present', () => {
    render(<TempHPManager {...defaultProps} tempHp={5} />)
    expect(screen.getByTestId('temp-hp-bar-overlay')).toBeInTheDocument()
  })

  it('should not show blue overlay when temp HP is 0', () => {
    render(<TempHPManager {...defaultProps} tempHp={0} />)
    expect(screen.queryByTestId('temp-hp-bar-overlay')).not.toBeInTheDocument()
  })

  it('should show input field when Set/display is clicked', async () => {
    render(<TempHPManager {...defaultProps} />)
    await userEvent.click(screen.getByTestId('temp-hp-display'))
    expect(screen.getByTestId('temp-hp-input')).toBeInTheDocument()
  })

  it('should show active temp HP indicator', () => {
    render(<TempHPManager {...defaultProps} tempHp={8} />)
    expect(screen.getByText('8 temporary HP active')).toBeInTheDocument()
  })

  it('should render two-segment HP bar with temp HP', () => {
    render(<TempHPManager {...defaultProps} tempHp={5} hpCurrent={25} hpMax={35} />)
    expect(screen.getByTestId('hp-bar-regular')).toBeInTheDocument()
    expect(screen.getByTestId('temp-hp-bar-overlay')).toBeInTheDocument()
  })
})

// =============================================================================
// DeathSaveTracker
// =============================================================================

describe('DeathSaveTracker', () => {
  const defaultProps = {
    deathSaves: { successes: 0 as 0 | 1 | 2 | 3, failures: 0 as 0 | 1 | 2 | 3, stable: false },
    hpCurrent: 0,
    onUpdateDeathSaves: vi.fn(),
    onRegainHP: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render death save tracker when at 0 HP', () => {
    render(<DeathSaveTracker {...defaultProps} />)
    expect(screen.getByTestId('death-save-tracker')).toBeInTheDocument()
  })

  it('should not render when HP > 0 and no death save progress', () => {
    render(<DeathSaveTracker {...defaultProps} hpCurrent={10} />)
    expect(screen.queryByTestId('death-save-tracker')).not.toBeInTheDocument()
  })

  it('should render success and failure circles', () => {
    render(<DeathSaveTracker {...defaultProps} />)
    expect(screen.getByTestId('death-save-success-0')).toBeInTheDocument()
    expect(screen.getByTestId('death-save-success-1')).toBeInTheDocument()
    expect(screen.getByTestId('death-save-success-2')).toBeInTheDocument()
    expect(screen.getByTestId('death-save-failure-0')).toBeInTheDocument()
    expect(screen.getByTestId('death-save-failure-1')).toBeInTheDocument()
    expect(screen.getByTestId('death-save-failure-2')).toBeInTheDocument()
  })

  it('should show Roll Death Save button when at 0 HP', () => {
    render(<DeathSaveTracker {...defaultProps} />)
    expect(screen.getByTestId('roll-death-save')).toBeInTheDocument()
  })

  it('should show Stabilize button when at 0 HP', () => {
    render(<DeathSaveTracker {...defaultProps} />)
    expect(screen.getByTestId('stabilize-button')).toBeInTheDocument()
  })

  it('should call onUpdateDeathSaves when stabilize is clicked', async () => {
    const onUpdate = vi.fn()
    render(
      <DeathSaveTracker
        {...defaultProps}
        onUpdateDeathSaves={onUpdate}
      />,
    )
    await userEvent.click(screen.getByTestId('stabilize-button'))
    expect(onUpdate).toHaveBeenCalledWith({
      successes: 3,
      failures: 0,
      stable: true,
    })
  })

  it('should show Stabilized status when successes >= 3', () => {
    render(
      <DeathSaveTracker
        {...defaultProps}
        deathSaves={{ successes: 3, failures: 1, stable: true }}
      />,
    )
    expect(screen.getByTestId('stabilized-status')).toBeInTheDocument()
  })

  it('should show Dead status when failures >= 3', () => {
    render(
      <DeathSaveTracker
        {...defaultProps}
        deathSaves={{ successes: 1, failures: 3, stable: false }}
      />,
    )
    expect(screen.getByTestId('dead-status')).toBeInTheDocument()
  })

  it('should add failure when damage-at-zero is clicked', async () => {
    const onUpdate = vi.fn()
    render(
      <DeathSaveTracker
        {...defaultProps}
        onUpdateDeathSaves={onUpdate}
      />,
    )
    await userEvent.click(screen.getByTestId('damage-at-zero'))
    expect(onUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ failures: 1 }),
    )
  })

  it('should add 2 failures when critical-at-zero is clicked', async () => {
    const onUpdate = vi.fn()
    render(
      <DeathSaveTracker
        {...defaultProps}
        onUpdateDeathSaves={onUpdate}
      />,
    )
    await userEvent.click(screen.getByTestId('critical-at-zero'))
    expect(onUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ failures: 2 }),
    )
  })

  it('should toggle success circles manually', async () => {
    const onUpdate = vi.fn()
    render(
      <DeathSaveTracker
        {...defaultProps}
        onUpdateDeathSaves={onUpdate}
      />,
    )
    await userEvent.click(screen.getByTestId('death-save-success-0'))
    expect(onUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ successes: 1 }),
    )
  })

  it('should show reset button when death saves have progress', () => {
    render(
      <DeathSaveTracker
        {...defaultProps}
        deathSaves={{ successes: 1, failures: 1, stable: false }}
      />,
    )
    expect(screen.getByTestId('reset-death-saves')).toBeInTheDocument()
  })

  it('should reset death saves when reset is clicked', async () => {
    const onUpdate = vi.fn()
    render(
      <DeathSaveTracker
        {...defaultProps}
        deathSaves={{ successes: 1, failures: 1, stable: false }}
        onUpdateDeathSaves={onUpdate}
      />,
    )
    await userEvent.click(screen.getByTestId('reset-death-saves'))
    expect(onUpdate).toHaveBeenCalledWith({
      successes: 0,
      failures: 0,
      stable: false,
    })
  })

  it('should call roll on dice store when Roll Death Save is clicked', async () => {
    const onUpdate = vi.fn()
    render(
      <DeathSaveTracker
        {...defaultProps}
        onUpdateDeathSaves={onUpdate}
      />,
    )
    await userEvent.click(screen.getByTestId('roll-death-save'))
    expect(onUpdate).toHaveBeenCalled()
  })
})

// =============================================================================
// HPSessionTracker
// =============================================================================

describe('HPSessionTracker', () => {
  const defaultProps = {
    hpCurrent: 25,
    hpMax: 35,
    tempHp: 0,
    deathSaves: { successes: 0 as 0 | 1 | 2 | 3, failures: 0 as 0 | 1 | 2 | 3, stable: false },
    onUpdateHP: vi.fn(),
    onUpdateTempHP: vi.fn(),
    onUpdateDeathSaves: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render HP session tracker', () => {
    render(<HPSessionTracker {...defaultProps} />)
    expect(screen.getByTestId('hp-session-tracker')).toBeInTheDocument()
  })

  it('should display current HP and max HP', () => {
    render(<HPSessionTracker {...defaultProps} />)
    expect(screen.getByText('25')).toBeInTheDocument()
    expect(screen.getByText(/35/)).toBeInTheDocument()
  })

  it('should open damage modal when minus button is clicked', async () => {
    render(<HPSessionTracker {...defaultProps} />)
    await userEvent.click(screen.getByTestId('open-damage-modal'))
    expect(screen.getByTestId('damage-heal-modal')).toBeInTheDocument()
    expect(screen.getByText('Damage Amount')).toBeInTheDocument()
  })

  it('should open heal modal when plus button is clicked', async () => {
    render(<HPSessionTracker {...defaultProps} />)
    await userEvent.click(screen.getByTestId('open-heal-modal'))
    expect(screen.getByTestId('damage-heal-modal')).toBeInTheDocument()
    expect(screen.getByText('Healing Amount')).toBeInTheDocument()
  })

  it('should include temp HP manager', () => {
    render(<HPSessionTracker {...defaultProps} />)
    expect(screen.getByTestId('temp-hp-manager')).toBeInTheDocument()
  })

  it('should not show death save tracker when HP > 0', () => {
    render(<HPSessionTracker {...defaultProps} />)
    expect(screen.queryByTestId('death-save-tracker')).not.toBeInTheDocument()
  })

  it('should show death save tracker when HP is 0', () => {
    render(<HPSessionTracker {...defaultProps} hpCurrent={0} />)
    expect(screen.getByTestId('death-save-tracker')).toBeInTheDocument()
  })

  it('should show event history after applying damage', async () => {
    const user = userEvent.setup()
    render(<HPSessionTracker {...defaultProps} />)

    // Open damage modal
    await user.click(screen.getByTestId('open-damage-modal'))
    const input = screen.getByTestId('hp-amount-input')
    await user.clear(input)
    await user.type(input, '5')
    await user.click(screen.getByTestId('apply-button'))

    expect(screen.getByTestId('hp-event-history')).toBeInTheDocument()
    expect(screen.getByTestId('hp-event')).toBeInTheDocument()
  })

  it('should open modal when HP display is clicked', async () => {
    render(<HPSessionTracker {...defaultProps} />)
    await userEvent.click(screen.getByTestId('hp-display'))
    expect(screen.getByTestId('damage-heal-modal')).toBeInTheDocument()
  })
})
