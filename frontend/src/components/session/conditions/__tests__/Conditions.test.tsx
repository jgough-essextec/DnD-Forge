/**
 * Component tests for Conditions Tracker (Epic 29)
 *
 * Tests ConditionBadges, ConditionCard, AddConditionModal,
 * ExhaustionTracker, and ConditionsPanel components.
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ConditionInstance } from '@/types/combat'
import { ConditionBadges } from '../ConditionBadges'
import { ConditionCard } from '../ConditionCard'
import { AddConditionModal } from '../AddConditionModal'
import { ExhaustionTracker } from '../ExhaustionTracker'
import { ConditionsPanel } from '../ConditionsPanel'

// ---------------------------------------------------------------------------
// ConditionBadges
// ---------------------------------------------------------------------------

describe('ConditionBadges', () => {
  it('should show "No conditions" placeholder when no conditions are active', () => {
    render(<ConditionBadges conditions={[]} />)
    expect(screen.getByTestId('no-conditions-placeholder')).toBeInTheDocument()
    expect(screen.getByText('No conditions')).toBeInTheDocument()
  })

  it('should render condition badges as a horizontal strip', () => {
    const conditions: ConditionInstance[] = [
      { condition: 'blinded' },
      { condition: 'poisoned' },
    ]
    render(<ConditionBadges conditions={conditions} />)
    const strip = screen.getByTestId('condition-badges')
    expect(strip).toBeInTheDocument()
    expect(strip.querySelectorAll('[role="listitem"]')).toHaveLength(2)
  })

  it('should render the add condition button when onAddClick is provided', () => {
    const onAddClick = vi.fn()
    render(<ConditionBadges conditions={[]} onAddClick={onAddClick} />)
    expect(screen.getByTestId('add-condition-button')).toBeInTheDocument()
  })

  it('should call onAddClick when add button is clicked', async () => {
    const user = userEvent.setup()
    const onAddClick = vi.fn()
    render(<ConditionBadges conditions={[]} onAddClick={onAddClick} />)
    await user.click(screen.getByTestId('add-condition-button'))
    expect(onAddClick).toHaveBeenCalledOnce()
  })

  it('should display red badges for debilitating conditions', () => {
    const conditions: ConditionInstance[] = [
      { condition: 'blinded' },
      { condition: 'paralyzed' },
      { condition: 'stunned' },
      { condition: 'unconscious' },
      { condition: 'petrified' },
    ]
    render(<ConditionBadges conditions={conditions} />)
    expect(screen.getByTestId('condition-card-blinded')).toBeInTheDocument()
    expect(screen.getByTestId('condition-card-paralyzed')).toBeInTheDocument()
    expect(screen.getByTestId('condition-card-stunned')).toBeInTheDocument()
    expect(screen.getByTestId('condition-card-unconscious')).toBeInTheDocument()
    expect(screen.getByTestId('condition-card-petrified')).toBeInTheDocument()
  })

  it('should display green badge for Invisible (beneficial)', () => {
    const conditions: ConditionInstance[] = [{ condition: 'invisible' }]
    render(<ConditionBadges conditions={conditions} />)
    expect(screen.getByTestId('condition-card-invisible')).toBeInTheDocument()
  })

  it('should wrap badges to multiple rows when many conditions active', () => {
    const conditions: ConditionInstance[] = [
      { condition: 'blinded' },
      { condition: 'charmed' },
      { condition: 'deafened' },
      { condition: 'frightened' },
      { condition: 'grappled' },
      { condition: 'poisoned' },
      { condition: 'prone' },
      { condition: 'restrained' },
    ]
    render(<ConditionBadges conditions={conditions} />)
    const strip = screen.getByTestId('condition-badges')
    // flex-wrap class enables wrapping
    expect(strip.className).toContain('flex-wrap')
  })
})

// ---------------------------------------------------------------------------
// ConditionCard
// ---------------------------------------------------------------------------

describe('ConditionCard', () => {
  it('should render a condition badge with icon and name', () => {
    render(<ConditionCard instance={{ condition: 'poisoned' }} />)
    expect(screen.getByText('Poisoned')).toBeInTheDocument()
  })

  it('should display "Exhaustion N" with level number for exhaustion', () => {
    render(
      <ConditionCard instance={{ condition: 'exhaustion', exhaustionLevel: 3 }} />,
    )
    expect(screen.getByText('Exhaustion 3')).toBeInTheDocument()
  })

  it('should show popover with effects text and Remove button when clicked', async () => {
    const user = userEvent.setup()
    const onRemove = vi.fn()
    render(
      <ConditionCard
        instance={{ condition: 'poisoned' }}
        onRemove={onRemove}
      />,
    )
    await user.click(screen.getByLabelText('Poisoned condition'))
    expect(screen.getByTestId('condition-popover-poisoned')).toBeInTheDocument()
    expect(screen.getByTestId('remove-condition-poisoned')).toBeInTheDocument()
  })

  it('should call onRemove when Remove button is clicked', async () => {
    const user = userEvent.setup()
    const onRemove = vi.fn()
    render(
      <ConditionCard
        instance={{ condition: 'blinded' }}
        onRemove={onRemove}
      />,
    )
    await user.click(screen.getByLabelText('Blinded condition'))
    await user.click(screen.getByTestId('remove-condition-blinded'))
    expect(onRemove).toHaveBeenCalledWith('blinded')
  })

  it('should show source and duration in popover', async () => {
    const user = userEvent.setup()
    render(
      <ConditionCard
        instance={{
          condition: 'frightened',
          source: 'Dragon Fear',
          duration: '1 minute',
        }}
      />,
    )
    await user.click(screen.getByLabelText('Frightened condition'))
    expect(screen.getByText('Source: Dragon Fear')).toBeInTheDocument()
    expect(screen.getByText('Duration: 1 minute')).toBeInTheDocument()
  })

  it('should show cumulative exhaustion effects in popover', async () => {
    const user = userEvent.setup()
    render(
      <ConditionCard
        instance={{ condition: 'exhaustion', exhaustionLevel: 3 }}
      />,
    )
    await user.click(screen.getByLabelText('Exhaustion 3 condition'))
    const popover = screen.getByTestId('condition-popover-exhaustion')
    expect(within(popover).getByText(/Disadvantage on ability checks/)).toBeInTheDocument()
    expect(within(popover).getByText(/Speed halved/)).toBeInTheDocument()
  })

  it('should display death warning for Exhaustion Level 6', async () => {
    const user = userEvent.setup()
    render(
      <ConditionCard
        instance={{ condition: 'exhaustion', exhaustionLevel: 6 }}
      />,
    )
    await user.click(screen.getByLabelText('Exhaustion 6 condition'))
    expect(screen.getByTestId('exhaustion-death-warning')).toBeInTheDocument()
  })

  it('should close popover when close button is clicked', async () => {
    const user = userEvent.setup()
    render(<ConditionCard instance={{ condition: 'poisoned' }} />)
    await user.click(screen.getByLabelText('Poisoned condition'))
    expect(screen.getByTestId('condition-popover-poisoned')).toBeInTheDocument()
    await user.click(screen.getByLabelText('Close popover'))
    expect(screen.queryByTestId('condition-popover-poisoned')).not.toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// AddConditionModal
// ---------------------------------------------------------------------------

describe('AddConditionModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    activeConditions: [] as ConditionInstance[],
    onAdd: vi.fn(),
    onRemove: vi.fn(),
    onSetExhaustion: vi.fn(),
  }

  it('should not render when isOpen is false', () => {
    render(<AddConditionModal {...defaultProps} isOpen={false} />)
    expect(screen.queryByTestId('add-condition-modal')).not.toBeInTheDocument()
  })

  it('should render modal with all 15 conditions when open', () => {
    render(<AddConditionModal {...defaultProps} />)
    expect(screen.getByTestId('add-condition-modal')).toBeInTheDocument()
    expect(screen.getByTestId('condition-option-blinded')).toBeInTheDocument()
    expect(screen.getByTestId('condition-option-exhaustion')).toBeInTheDocument()
  })

  it('should filter conditions by search query', async () => {
    const user = userEvent.setup()
    render(<AddConditionModal {...defaultProps} />)
    await user.type(screen.getByTestId('condition-search-input'), 'poison')
    expect(screen.getByTestId('condition-option-poisoned')).toBeInTheDocument()
    expect(screen.queryByTestId('condition-option-blinded')).not.toBeInTheDocument()
  })

  it('should call onAdd when a condition is selected', async () => {
    const user = userEvent.setup()
    const onAdd = vi.fn()
    render(<AddConditionModal {...defaultProps} onAdd={onAdd} />)
    await user.click(screen.getByTestId('condition-option-poisoned'))
    expect(onAdd).toHaveBeenCalledWith(
      expect.objectContaining({ condition: 'poisoned' }),
    )
  })

  it('should show "Already active" note for active conditions', () => {
    render(
      <AddConditionModal
        {...defaultProps}
        activeConditions={[{ condition: 'poisoned' }]}
      />,
    )
    expect(screen.getByTestId('already-active-poisoned')).toBeInTheDocument()
    expect(screen.getByText('Already active')).toBeInTheDocument()
  })

  it('should display exhaustion +/- stepper', () => {
    render(<AddConditionModal {...defaultProps} />)
    expect(screen.getByTestId('exhaustion-increment')).toBeInTheDocument()
    expect(screen.getByTestId('exhaustion-decrement')).toBeInTheDocument()
    expect(screen.getByTestId('exhaustion-level-display')).toBeInTheDocument()
  })

  it('should call onSetExhaustion when incrementing exhaustion', async () => {
    const user = userEvent.setup()
    const onSetExhaustion = vi.fn()
    render(
      <AddConditionModal {...defaultProps} onSetExhaustion={onSetExhaustion} />,
    )
    await user.click(screen.getByTestId('exhaustion-increment'))
    expect(onSetExhaustion).toHaveBeenCalledWith(1)
  })

  it('should show exhaustion death warning at level 6', () => {
    render(
      <AddConditionModal
        {...defaultProps}
        activeConditions={[{ condition: 'exhaustion', exhaustionLevel: 6 }]}
      />,
    )
    expect(screen.getByTestId('exhaustion-death-warning-modal')).toBeInTheDocument()
  })

  it('should toggle condition off via clicking active non-exhaustion condition', async () => {
    const user = userEvent.setup()
    const onRemove = vi.fn()
    render(
      <AddConditionModal
        {...defaultProps}
        activeConditions={[{ condition: 'poisoned' }]}
        onRemove={onRemove}
      />,
    )
    await user.click(screen.getByTestId('condition-option-poisoned'))
    expect(onRemove).toHaveBeenCalledWith('poisoned')
  })

  it('should close when clicking outside the modal', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(<AddConditionModal {...defaultProps} onClose={onClose} />)
    await user.click(screen.getByTestId('add-condition-modal'))
    expect(onClose).toHaveBeenCalledOnce()
  })
})

// ---------------------------------------------------------------------------
// ExhaustionTracker
// ---------------------------------------------------------------------------

describe('ExhaustionTracker', () => {
  it('should render the exhaustion tracker', () => {
    render(<ExhaustionTracker level={0} onSetLevel={vi.fn()} />)
    expect(screen.getByTestId('exhaustion-tracker')).toBeInTheDocument()
  })

  it('should display the current exhaustion level', () => {
    render(<ExhaustionTracker level={3} onSetLevel={vi.fn()} />)
    expect(screen.getByTestId('exhaustion-level')).toHaveTextContent('3')
  })

  it('should show no-exhaustion placeholder at level 0', () => {
    render(<ExhaustionTracker level={0} onSetLevel={vi.fn()} />)
    expect(screen.getByTestId('no-exhaustion-placeholder')).toBeInTheDocument()
  })

  it('should show all 6 exhaustion level effects when active', () => {
    render(<ExhaustionTracker level={3} onSetLevel={vi.fn()} />)
    expect(screen.getByTestId('exhaustion-effect-1')).toBeInTheDocument()
    expect(screen.getByTestId('exhaustion-effect-2')).toBeInTheDocument()
    expect(screen.getByTestId('exhaustion-effect-3')).toBeInTheDocument()
  })

  it('should call onSetLevel with level-1 when decrease is clicked', async () => {
    const user = userEvent.setup()
    const onSetLevel = vi.fn()
    render(<ExhaustionTracker level={3} onSetLevel={onSetLevel} />)
    await user.click(screen.getByTestId('exhaustion-decrease'))
    expect(onSetLevel).toHaveBeenCalledWith(2)
  })

  it('should call onSetLevel with level+1 when increase is clicked', async () => {
    const user = userEvent.setup()
    const onSetLevel = vi.fn()
    render(<ExhaustionTracker level={3} onSetLevel={onSetLevel} />)
    await user.click(screen.getByTestId('exhaustion-increase'))
    expect(onSetLevel).toHaveBeenCalledWith(4)
  })

  it('should disable decrease button at level 0', () => {
    render(<ExhaustionTracker level={0} onSetLevel={vi.fn()} />)
    expect(screen.getByTestId('exhaustion-decrease')).toBeDisabled()
  })

  it('should disable increase button at level 6', () => {
    render(<ExhaustionTracker level={6} onSetLevel={vi.fn()} />)
    expect(screen.getByTestId('exhaustion-increase')).toBeDisabled()
  })

  it('should show warning icon at dangerous levels (4+)', () => {
    render(<ExhaustionTracker level={4} onSetLevel={vi.fn()} />)
    expect(screen.getByTestId('exhaustion-warning-icon')).toBeInTheDocument()
  })

  it('should show death banner at level 6', () => {
    render(<ExhaustionTracker level={6} onSetLevel={vi.fn()} />)
    expect(screen.getByTestId('exhaustion-death-banner')).toBeInTheDocument()
    expect(screen.getByText('Your character dies from exhaustion!')).toBeInTheDocument()
  })

  it('should render 6 level bars', () => {
    render(<ExhaustionTracker level={3} onSetLevel={vi.fn()} />)
    const bars = screen.getByTestId('exhaustion-bars')
    expect(bars.children).toHaveLength(6)
  })

  it('should show death icon instead of warning icon at level 6', () => {
    render(<ExhaustionTracker level={6} onSetLevel={vi.fn()} />)
    expect(screen.getByTestId('exhaustion-death-icon')).toBeInTheDocument()
    expect(screen.queryByTestId('exhaustion-warning-icon')).not.toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// ConditionsPanel (integration)
// ---------------------------------------------------------------------------

describe('ConditionsPanel', () => {
  it('should render the conditions panel with badges', () => {
    render(
      <ConditionsPanel
        conditions={[{ condition: 'blinded' }]}
        onConditionsChange={vi.fn()}
      />,
    )
    expect(screen.getByTestId('conditions-panel')).toBeInTheDocument()
    expect(screen.getByTestId('condition-card-blinded')).toBeInTheDocument()
  })

  it('should show no-conditions placeholder when empty', () => {
    render(
      <ConditionsPanel conditions={[]} onConditionsChange={vi.fn()} />,
    )
    expect(screen.getByTestId('no-conditions-placeholder')).toBeInTheDocument()
  })

  it('should open the add condition modal when add button is clicked', async () => {
    const user = userEvent.setup()
    render(
      <ConditionsPanel conditions={[]} onConditionsChange={vi.fn()} />,
    )
    await user.click(screen.getByTestId('add-condition-button'))
    expect(screen.getByTestId('add-condition-modal')).toBeInTheDocument()
  })

  it('should show exhaustion tracker when exhaustion is active', () => {
    render(
      <ConditionsPanel
        conditions={[{ condition: 'exhaustion', exhaustionLevel: 2 }]}
        onConditionsChange={vi.fn()}
      />,
    )
    expect(screen.getByTestId('exhaustion-tracker')).toBeInTheDocument()
  })

  it('should not show exhaustion tracker when exhaustion is not active', () => {
    render(
      <ConditionsPanel
        conditions={[{ condition: 'blinded' }]}
        onConditionsChange={vi.fn()}
      />,
    )
    expect(screen.queryByTestId('exhaustion-tracker')).not.toBeInTheDocument()
  })

  it('should call onConditionsChange when removing a condition via badge', async () => {
    const user = userEvent.setup()
    const onConditionsChange = vi.fn()
    render(
      <ConditionsPanel
        conditions={[{ condition: 'poisoned' }]}
        onConditionsChange={onConditionsChange}
      />,
    )
    // Click the badge to open popover
    await user.click(screen.getByLabelText('Poisoned condition'))
    // Click remove
    await user.click(screen.getByTestId('remove-condition-poisoned'))
    expect(onConditionsChange).toHaveBeenCalledWith([])
  })
})
