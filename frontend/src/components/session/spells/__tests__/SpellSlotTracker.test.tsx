/**
 * SpellSlotTracker Component Tests (Epic 28)
 *
 * Tests for the session spell slot management components:
 * - SlotCircleRow: interactive slot circles
 * - SlotSummary: availability summary with color coding
 * - CastSpellPrompt: cast-to-expend dialog
 * - PactMagicTracker: Warlock Pact Magic section
 * - ArcaneRecoveryModal: Wizard Arcane Recovery
 * - SpellSlotTracker: main orchestrator
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SlotCircleRow } from '../SlotCircleRow'
import { SlotSummary } from '../SlotSummary'
import { CastSpellPrompt } from '../CastSpellPrompt'
import { PactMagicTracker } from '../PactMagicTracker'
import { ArcaneRecoveryModal } from '../ArcaneRecoveryModal'
import { SpellSlotTracker } from '../SpellSlotTracker'
import type { Spell } from '@/types/spell'
import type { PactMagic } from '@/types/spell'

// ---------------------------------------------------------------------------
// Test data
// ---------------------------------------------------------------------------

const mockMagicMissile: Spell = {
  id: 'magic-missile',
  name: 'Magic Missile',
  level: 1,
  school: 'evocation',
  castingTime: { value: 1, unit: 'action' },
  range: { type: 'ranged', distance: 120, unit: 'feet' },
  components: { verbal: true, somatic: true, material: false },
  duration: { type: 'instantaneous' },
  description: 'You create three glowing darts.',
  concentration: false,
  ritual: false,
  classes: ['wizard', 'sorcerer'],
}

const mockDetectMagic: Spell = {
  id: 'detect-magic',
  name: 'Detect Magic',
  level: 1,
  school: 'divination',
  castingTime: { value: 1, unit: 'action' },
  range: { type: 'self' },
  components: { verbal: true, somatic: true, material: false },
  duration: { type: 'concentration', value: 10, unit: 'minute' },
  description: 'You sense the presence of magic within 30 feet.',
  concentration: true,
  ritual: true,
  classes: ['wizard', 'cleric'],
}

const mockFireball: Spell = {
  id: 'fireball',
  name: 'Fireball',
  level: 3,
  school: 'evocation',
  castingTime: { value: 1, unit: 'action' },
  range: { type: 'ranged', distance: 150, unit: 'feet' },
  components: { verbal: true, somatic: true, material: true, materialDescription: 'a tiny ball of bat guano and sulfur' },
  duration: { type: 'instantaneous' },
  description: 'A bright streak flashes and then blossoms with a low roar into an explosion of flame.',
  higherLevelDescription: 'When you cast this spell using a spell slot of 4th level or higher, the damage increases by 1d6.',
  concentration: false,
  ritual: false,
  classes: ['wizard', 'sorcerer'],
}

const defaultMaxSlots: Record<number, number> = { 1: 4, 2: 3, 3: 2 }
const defaultUsedSlots: Record<number, number> = { 1: 2, 2: 0, 3: 1 }

const defaultPactMagic: PactMagic = {
  slotLevel: 3,
  totalSlots: 2,
  usedSlots: 0,
  mysticArcanum: {},
}

// ===========================================================================
// SlotCircleRow
// ===========================================================================

describe('SlotCircleRow', () => {
  it('should render correct number of slot circles', () => {
    render(<SlotCircleRow level={1} total={4} used={0} onToggle={vi.fn()} />)
    const circles = screen.getAllByTestId(/^slot-circle-1-/)
    expect(circles).toHaveLength(4)
  })

  it('should render filled circles for available slots and empty for expended', () => {
    render(<SlotCircleRow level={1} total={4} used={2} onToggle={vi.fn()} />)
    // First 2 are used (expended), last 2 are available
    const circle0 = screen.getByTestId('slot-circle-1-0')
    const circle2 = screen.getByTestId('slot-circle-1-2')
    expect(circle0.getAttribute('aria-label')).toContain('expended')
    expect(circle2.getAttribute('aria-label')).toContain('available')
  })

  it('should call onToggle with slot index when clicked', async () => {
    const user = userEvent.setup()
    const onToggle = vi.fn()
    render(<SlotCircleRow level={1} total={4} used={2} onToggle={onToggle} />)
    await user.click(screen.getByTestId('slot-circle-1-3'))
    expect(onToggle).toHaveBeenCalledWith(3)
  })

  it('should display available/total count', () => {
    render(<SlotCircleRow level={2} total={3} used={1} onToggle={vi.fn()} />)
    expect(screen.getByText('2/3')).toBeDefined()
  })

  it('should be interactive (always clickable for session tracking)', async () => {
    const user = userEvent.setup()
    const onToggle = vi.fn()
    render(<SlotCircleRow level={1} total={2} used={0} onToggle={onToggle} />)
    await user.click(screen.getByTestId('slot-circle-1-0'))
    expect(onToggle).toHaveBeenCalledWith(0)
  })

  it('should display optional label', () => {
    render(<SlotCircleRow level={1} total={4} used={0} onToggle={vi.fn()} label="1st" />)
    expect(screen.getByText('1st')).toBeDefined()
  })
})

// ===========================================================================
// SlotSummary
// ===========================================================================

describe('SlotSummary', () => {
  it('should render summary for each level with slots', () => {
    render(<SlotSummary maxSlots={defaultMaxSlots} usedSlots={defaultUsedSlots} />)
    expect(screen.getByTestId('summary-level-1')).toBeDefined()
    expect(screen.getByTestId('summary-level-2')).toBeDefined()
    expect(screen.getByTestId('summary-level-3')).toBeDefined()
  })

  it('should show correct available/total per level', () => {
    render(<SlotSummary maxSlots={defaultMaxSlots} usedSlots={defaultUsedSlots} />)
    expect(screen.getByTestId('summary-level-1').textContent).toBe('2/4')
    expect(screen.getByTestId('summary-level-2').textContent).toBe('3/3')
    expect(screen.getByTestId('summary-level-3').textContent).toBe('1/2')
  })

  it('should apply green color for >50% available', () => {
    render(<SlotSummary maxSlots={{ 1: 4 }} usedSlots={{ 1: 1 }} />)
    const el = screen.getByTestId('summary-level-1')
    expect(el.className).toContain('emerald')
  })

  it('should apply red color for 0% available', () => {
    render(<SlotSummary maxSlots={{ 1: 4 }} usedSlots={{ 1: 4 }} />)
    const el = screen.getByTestId('summary-level-1')
    expect(el.className).toContain('red')
  })

  it('should apply yellow color for <=50% available', () => {
    render(<SlotSummary maxSlots={{ 1: 4 }} usedSlots={{ 1: 2 }} />)
    const el = screen.getByTestId('summary-level-1')
    expect(el.className).toContain('yellow')
  })

  it('should return null when no slot levels have slots', () => {
    const { container } = render(<SlotSummary maxSlots={{}} usedSlots={{}} />)
    expect(container.innerHTML).toBe('')
  })
})

// ===========================================================================
// CastSpellPrompt
// ===========================================================================

describe('CastSpellPrompt', () => {
  it('should show spell name and school', () => {
    render(
      <CastSpellPrompt
        spell={mockMagicMissile}
        maxSlots={defaultMaxSlots}
        usedSlots={defaultUsedSlots}
        onCastWithSlot={vi.fn()}
        onCastAsRitual={vi.fn()}
        onCancel={vi.fn()}
        onOverrideCast={vi.fn()}
      />,
    )
    expect(screen.getByText(/Cast Magic Missile/)).toBeDefined()
  })

  it('should show available slot levels for casting', () => {
    render(
      <CastSpellPrompt
        spell={mockMagicMissile}
        maxSlots={defaultMaxSlots}
        usedSlots={{ 1: 2, 2: 0, 3: 0 }}
        onCastWithSlot={vi.fn()}
        onCastAsRitual={vi.fn()}
        onCancel={vi.fn()}
        onOverrideCast={vi.fn()}
      />,
    )
    expect(screen.getByTestId('cast-at-level-1')).toBeDefined()
    expect(screen.getByTestId('cast-at-level-2')).toBeDefined()
    expect(screen.getByTestId('cast-at-level-3')).toBeDefined()
  })

  it('should mark upcast levels with "(upcast)" text', () => {
    render(
      <CastSpellPrompt
        spell={mockMagicMissile}
        maxSlots={defaultMaxSlots}
        usedSlots={{}}
        onCastWithSlot={vi.fn()}
        onCastAsRitual={vi.fn()}
        onCancel={vi.fn()}
        onOverrideCast={vi.fn()}
      />,
    )
    const level2Button = screen.getByTestId('cast-at-level-2')
    expect(level2Button.textContent).toContain('upcast')
  })

  it('should call onCastWithSlot when a level button is clicked', async () => {
    const user = userEvent.setup()
    const onCastWithSlot = vi.fn()
    render(
      <CastSpellPrompt
        spell={mockMagicMissile}
        maxSlots={defaultMaxSlots}
        usedSlots={{}}
        onCastWithSlot={onCastWithSlot}
        onCastAsRitual={vi.fn()}
        onCancel={vi.fn()}
        onOverrideCast={vi.fn()}
      />,
    )
    await user.click(screen.getByTestId('cast-at-level-1'))
    expect(onCastWithSlot).toHaveBeenCalledWith(1)
  })

  it('should show "No slots available" when all slots at required level are used', () => {
    render(
      <CastSpellPrompt
        spell={mockFireball}
        maxSlots={{ 1: 4, 2: 3, 3: 2 }}
        usedSlots={{ 1: 4, 2: 3, 3: 2 }}
        onCastWithSlot={vi.fn()}
        onCastAsRitual={vi.fn()}
        onCancel={vi.fn()}
        onOverrideCast={vi.fn()}
      />,
    )
    expect(screen.getByTestId('no-slots-warning')).toBeDefined()
  })

  it('should show override button when no slots available', async () => {
    const user = userEvent.setup()
    const onOverrideCast = vi.fn()
    render(
      <CastSpellPrompt
        spell={mockFireball}
        maxSlots={{ 1: 4, 2: 3, 3: 2 }}
        usedSlots={{ 1: 4, 2: 3, 3: 2 }}
        onCastWithSlot={vi.fn()}
        onCastAsRitual={vi.fn()}
        onCancel={vi.fn()}
        onOverrideCast={onOverrideCast}
      />,
    )
    await user.click(screen.getByTestId('override-cast-button'))
    expect(onOverrideCast).toHaveBeenCalled()
  })

  it('should show "Cast as Ritual" button for ritual spells', () => {
    render(
      <CastSpellPrompt
        spell={mockDetectMagic}
        maxSlots={defaultMaxSlots}
        usedSlots={{}}
        onCastWithSlot={vi.fn()}
        onCastAsRitual={vi.fn()}
        onCancel={vi.fn()}
        onOverrideCast={vi.fn()}
      />,
    )
    expect(screen.getByTestId('cast-as-ritual')).toBeDefined()
  })

  it('should display "+10 minutes" note for ritual casting', () => {
    render(
      <CastSpellPrompt
        spell={mockDetectMagic}
        maxSlots={defaultMaxSlots}
        usedSlots={{}}
        onCastWithSlot={vi.fn()}
        onCastAsRitual={vi.fn()}
        onCancel={vi.fn()}
        onOverrideCast={vi.fn()}
      />,
    )
    const ritualButton = screen.getByTestId('cast-as-ritual')
    expect(ritualButton.textContent).toContain('+10 minutes')
  })

  it('should call onCastAsRitual when ritual button is clicked', async () => {
    const user = userEvent.setup()
    const onCastAsRitual = vi.fn()
    render(
      <CastSpellPrompt
        spell={mockDetectMagic}
        maxSlots={defaultMaxSlots}
        usedSlots={{}}
        onCastWithSlot={vi.fn()}
        onCastAsRitual={onCastAsRitual}
        onCancel={vi.fn()}
        onOverrideCast={vi.fn()}
      />,
    )
    await user.click(screen.getByTestId('cast-as-ritual'))
    expect(onCastAsRitual).toHaveBeenCalled()
  })

  it('should call onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup()
    const onCancel = vi.fn()
    render(
      <CastSpellPrompt
        spell={mockMagicMissile}
        maxSlots={defaultMaxSlots}
        usedSlots={{}}
        onCastWithSlot={vi.fn()}
        onCastAsRitual={vi.fn()}
        onCancel={onCancel}
        onOverrideCast={vi.fn()}
      />,
    )
    await user.click(screen.getByTestId('cancel-cast'))
    expect(onCancel).toHaveBeenCalled()
  })

  it('should return null for cantrips (level 0)', () => {
    const cantrip: Spell = { ...mockMagicMissile, id: 'fire-bolt', name: 'Fire Bolt', level: 0 }
    const { container } = render(
      <CastSpellPrompt
        spell={cantrip}
        maxSlots={defaultMaxSlots}
        usedSlots={{}}
        onCastWithSlot={vi.fn()}
        onCastAsRitual={vi.fn()}
        onCancel={vi.fn()}
        onOverrideCast={vi.fn()}
      />,
    )
    expect(container.innerHTML).toBe('')
  })
})

// ===========================================================================
// PactMagicTracker
// ===========================================================================

describe('PactMagicTracker', () => {
  it('should render with purple accent styling', () => {
    render(
      <PactMagicTracker
        pactMagic={defaultPactMagic}
        onToggleSlot={vi.fn()}
        onShortRestRecover={vi.fn()}
      />,
    )
    const section = screen.getByTestId('pact-magic-tracker')
    expect(section.className).toContain('purple')
  })

  it('should display "Pact Magic Slots" label', () => {
    render(
      <PactMagicTracker
        pactMagic={defaultPactMagic}
        onToggleSlot={vi.fn()}
        onShortRestRecover={vi.fn()}
      />,
    )
    expect(screen.getByText('Pact Magic Slots')).toBeDefined()
  })

  it('should display "Short Rest Recovery" text', () => {
    render(
      <PactMagicTracker
        pactMagic={defaultPactMagic}
        onToggleSlot={vi.fn()}
        onShortRestRecover={vi.fn()}
      />,
    )
    expect(screen.getAllByText('Short Rest Recovery').length).toBeGreaterThan(0)
  })

  it('should show slot format as "N x Level M Slots"', () => {
    render(
      <PactMagicTracker
        pactMagic={{ slotLevel: 3, totalSlots: 2, usedSlots: 0, mysticArcanum: {} }}
        onToggleSlot={vi.fn()}
        onShortRestRecover={vi.fn()}
      />,
    )
    expect(screen.getByTestId('pact-magic-format').textContent).toBe('2 x 3rd Level Slots')
  })

  it('should render clickable slot circles', () => {
    render(
      <PactMagicTracker
        pactMagic={defaultPactMagic}
        onToggleSlot={vi.fn()}
        onShortRestRecover={vi.fn()}
      />,
    )
    expect(screen.getByTestId('pact-slot-0')).toBeDefined()
    expect(screen.getByTestId('pact-slot-1')).toBeDefined()
  })

  it('should call onToggleSlot when a slot circle is clicked', async () => {
    const user = userEvent.setup()
    const onToggleSlot = vi.fn()
    render(
      <PactMagicTracker
        pactMagic={defaultPactMagic}
        onToggleSlot={onToggleSlot}
        onShortRestRecover={vi.fn()}
      />,
    )
    await user.click(screen.getByTestId('pact-slot-0'))
    expect(onToggleSlot).toHaveBeenCalledWith(0)
  })

  it('should call onShortRestRecover when short rest button is clicked', async () => {
    const user = userEvent.setup()
    const onShortRestRecover = vi.fn()
    render(
      <PactMagicTracker
        pactMagic={{ ...defaultPactMagic, usedSlots: 1 }}
        onToggleSlot={vi.fn()}
        onShortRestRecover={onShortRestRecover}
      />,
    )
    await user.click(screen.getByTestId('pact-short-rest'))
    expect(onShortRestRecover).toHaveBeenCalled()
  })

  it('should disable short rest button when no slots are expended', () => {
    render(
      <PactMagicTracker
        pactMagic={defaultPactMagic}
        onToggleSlot={vi.fn()}
        onShortRestRecover={vi.fn()}
      />,
    )
    const button = screen.getByTestId('pact-short-rest')
    expect(button.hasAttribute('disabled')).toBe(true)
  })

  it('should render Mystic Arcanum section when present', () => {
    const pactMagic: PactMagic = {
      ...defaultPactMagic,
      mysticArcanum: {
        6: { spellId: 'mass-suggestion', used: false },
        7: { spellId: 'plane-shift', used: true },
      },
    }
    render(
      <PactMagicTracker
        pactMagic={pactMagic}
        onToggleSlot={vi.fn()}
        onShortRestRecover={vi.fn()}
      />,
    )
    expect(screen.getByText('Mystic Arcanum')).toBeDefined()
    expect(screen.getByTestId('arcanum-level-6')).toBeDefined()
    expect(screen.getByTestId('arcanum-level-7')).toBeDefined()
  })
})

// ===========================================================================
// ArcaneRecoveryModal
// ===========================================================================

describe('ArcaneRecoveryModal', () => {
  const defaultArcaneProps = {
    wizardLevel: 5,
    maxSlots: { 1: 4, 2: 3, 3: 2 } as Record<number, number>,
    usedSlots: { 1: 2, 2: 1, 3: 1 } as Record<number, number>,
    usedToday: false,
    onConfirm: vi.fn(),
    onCancel: vi.fn(),
  }

  it('should display recovery budget (3 for level 5 Wizard)', () => {
    render(<ArcaneRecoveryModal {...defaultArcaneProps} />)
    const budget = screen.getByTestId('recovery-budget')
    expect(budget.textContent).toContain('3')
  })

  it('should show recoverable spell levels with expended slots', () => {
    render(<ArcaneRecoveryModal {...defaultArcaneProps} />)
    expect(screen.getByTestId('recovery-level-1')).toBeDefined()
    expect(screen.getByTestId('recovery-level-2')).toBeDefined()
    expect(screen.getByTestId('recovery-level-3')).toBeDefined()
  })

  it('should update budget remaining when slots are selected', async () => {
    const user = userEvent.setup()
    render(<ArcaneRecoveryModal {...defaultArcaneProps} />)
    await user.click(screen.getByTestId('recovery-add-1'))
    const budget = screen.getByTestId('recovery-budget')
    expect(budget.textContent).toContain('2') // 3 - 1 = 2 remaining
  })

  it('should disable add button when slot level exceeds remaining budget', async () => {
    const user = userEvent.setup()
    render(<ArcaneRecoveryModal {...defaultArcaneProps} />)
    // Select 1st level twice and 1 more 1st level (3/3 budget)
    await user.click(screen.getByTestId('recovery-add-1'))
    await user.click(screen.getByTestId('recovery-add-1'))
    // Budget is now 1 remaining, but level 2 costs 2 - should be disabled
    const addLevel3 = screen.getByTestId('recovery-add-3')
    expect(addLevel3.hasAttribute('disabled')).toBe(true)
  })

  it('should not show slots of 6th level or higher', () => {
    render(
      <ArcaneRecoveryModal
        {...defaultArcaneProps}
        maxSlots={{ 1: 4, 2: 3, 6: 1 }}
        usedSlots={{ 1: 2, 2: 1, 6: 1 }}
      />,
    )
    expect(screen.queryByTestId('recovery-level-6')).toBeNull()
  })

  it('should show "already used today" message when usedToday is true', () => {
    render(<ArcaneRecoveryModal {...defaultArcaneProps} usedToday={true} />)
    expect(screen.getByTestId('already-used-message')).toBeDefined()
  })

  it('should call onConfirm with selected slots when confirmed', async () => {
    const user = userEvent.setup()
    const onConfirm = vi.fn()
    render(<ArcaneRecoveryModal {...defaultArcaneProps} onConfirm={onConfirm} />)
    await user.click(screen.getByTestId('recovery-add-1'))
    await user.click(screen.getByTestId('recovery-add-2'))
    await user.click(screen.getByTestId('recovery-confirm'))
    expect(onConfirm).toHaveBeenCalledWith([1, 2])
  })

  it('should call onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup()
    const onCancel = vi.fn()
    render(<ArcaneRecoveryModal {...defaultArcaneProps} onCancel={onCancel} />)
    await user.click(screen.getByTestId('recovery-cancel'))
    expect(onCancel).toHaveBeenCalled()
  })

  it('should disable confirm button when no slots are selected', () => {
    render(<ArcaneRecoveryModal {...defaultArcaneProps} />)
    const confirm = screen.getByTestId('recovery-confirm')
    expect(confirm.hasAttribute('disabled')).toBe(true)
  })

  it('should show message when no expended slots to recover', () => {
    render(
      <ArcaneRecoveryModal
        {...defaultArcaneProps}
        usedSlots={{ 1: 0, 2: 0, 3: 0 }}
      />,
    )
    expect(screen.getByTestId('no-expended-message')).toBeDefined()
  })
})

// ===========================================================================
// SpellSlotTracker (orchestrator)
// ===========================================================================

describe('SpellSlotTracker', () => {
  it('should render slot summary', () => {
    render(
      <SpellSlotTracker
        maxSlots={defaultMaxSlots}
        usedSlots={defaultUsedSlots}
        onUsedSlotsChange={vi.fn()}
      />,
    )
    expect(screen.getByTestId('slot-summary')).toBeDefined()
  })

  it('should render slot circle rows for each level', () => {
    render(
      <SpellSlotTracker
        maxSlots={defaultMaxSlots}
        usedSlots={defaultUsedSlots}
        onUsedSlotsChange={vi.fn()}
      />,
    )
    expect(screen.getByTestId('slot-row-level-1')).toBeDefined()
    expect(screen.getByTestId('slot-row-level-2')).toBeDefined()
    expect(screen.getByTestId('slot-row-level-3')).toBeDefined()
  })

  it('should call onUsedSlotsChange when a slot is toggled (expend)', async () => {
    const user = userEvent.setup()
    const onUsedSlotsChange = vi.fn()
    render(
      <SpellSlotTracker
        maxSlots={{ 1: 4 }}
        usedSlots={{ 1: 0 }}
        onUsedSlotsChange={onUsedSlotsChange}
      />,
    )
    await user.click(screen.getByTestId('slot-circle-1-0'))
    expect(onUsedSlotsChange).toHaveBeenCalledWith({ 1: 1 })
  })

  it('should call onUsedSlotsChange when a slot is toggled (restore)', async () => {
    const user = userEvent.setup()
    const onUsedSlotsChange = vi.fn()
    render(
      <SpellSlotTracker
        maxSlots={{ 1: 4 }}
        usedSlots={{ 1: 2 }}
        onUsedSlotsChange={onUsedSlotsChange}
      />,
    )
    // Click slot index 0 which is < used count (2), so it restores
    await user.click(screen.getByTestId('slot-circle-1-0'))
    expect(onUsedSlotsChange).toHaveBeenCalledWith({ 1: 1 })
  })

  it('should render Pact Magic section when pactMagic is provided', () => {
    render(
      <SpellSlotTracker
        maxSlots={defaultMaxSlots}
        usedSlots={defaultUsedSlots}
        onUsedSlotsChange={vi.fn()}
        pactMagic={defaultPactMagic}
        onPactMagicChange={vi.fn()}
      />,
    )
    expect(screen.getByTestId('pact-magic-tracker')).toBeDefined()
  })

  it('should not render Pact Magic section when pactMagic is not provided', () => {
    render(
      <SpellSlotTracker
        maxSlots={defaultMaxSlots}
        usedSlots={defaultUsedSlots}
        onUsedSlotsChange={vi.fn()}
      />,
    )
    expect(screen.queryByTestId('pact-magic-tracker')).toBeNull()
  })

  it('should render Arcane Recovery button for Wizard', () => {
    render(
      <SpellSlotTracker
        maxSlots={defaultMaxSlots}
        usedSlots={defaultUsedSlots}
        onUsedSlotsChange={vi.fn()}
        wizardLevel={5}
      />,
    )
    expect(screen.getByTestId('arcane-recovery-button')).toBeDefined()
  })

  it('should disable Arcane Recovery button when already used', () => {
    render(
      <SpellSlotTracker
        maxSlots={defaultMaxSlots}
        usedSlots={defaultUsedSlots}
        onUsedSlotsChange={vi.fn()}
        wizardLevel={5}
        arcaneRecoveryUsed={true}
      />,
    )
    const button = screen.getByTestId('arcane-recovery-button')
    expect(button.hasAttribute('disabled')).toBe(true)
    expect(button.textContent).toContain('[Used]')
  })

  it('should render Long Rest button', () => {
    render(
      <SpellSlotTracker
        maxSlots={defaultMaxSlots}
        usedSlots={defaultUsedSlots}
        onUsedSlotsChange={vi.fn()}
      />,
    )
    expect(screen.getByTestId('long-rest-button')).toBeDefined()
  })

  it('should restore all slots on Long Rest', async () => {
    const user = userEvent.setup()
    const onUsedSlotsChange = vi.fn()
    render(
      <SpellSlotTracker
        maxSlots={defaultMaxSlots}
        usedSlots={defaultUsedSlots}
        onUsedSlotsChange={onUsedSlotsChange}
      />,
    )
    await user.click(screen.getByTestId('long-rest-button'))
    expect(onUsedSlotsChange).toHaveBeenCalledWith({ 1: 0, 2: 0, 3: 0 })
  })

  it('should dim spells with no available slots', () => {
    render(
      <SpellSlotTracker
        maxSlots={{ 1: 2 }}
        usedSlots={{ 1: 2 }}
        onUsedSlotsChange={vi.fn()}
        spells={[mockMagicMissile]}
      />,
    )
    const spellButton = screen.getByTestId('spell-cast-magic-missile')
    expect(spellButton.textContent).toContain('no slots')
  })

  it('should show spell list when spells are provided', () => {
    render(
      <SpellSlotTracker
        maxSlots={defaultMaxSlots}
        usedSlots={{}}
        onUsedSlotsChange={vi.fn()}
        spells={[mockMagicMissile, mockFireball]}
      />,
    )
    expect(screen.getByTestId('spell-cast-magic-missile')).toBeDefined()
    expect(screen.getByTestId('spell-cast-fireball')).toBeDefined()
  })

  it('should open cast prompt when a spell is clicked', async () => {
    const user = userEvent.setup()
    render(
      <SpellSlotTracker
        maxSlots={defaultMaxSlots}
        usedSlots={{}}
        onUsedSlotsChange={vi.fn()}
        spells={[mockMagicMissile]}
      />,
    )
    await user.click(screen.getByTestId('spell-cast-magic-missile'))
    expect(screen.getByTestId('cast-spell-prompt')).toBeDefined()
  })
})
