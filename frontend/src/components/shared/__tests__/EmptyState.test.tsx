/**
 * Tests for EmptyState component (Story 46.2)
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { EmptyState } from '@/components/shared/EmptyState'
import {
  Sword,
  Shield,
  Users,
  BookOpen,
  UserCircle,
  Gem,
  Dice5,
  Swords,
  Wand2,
  StickyNote,
} from 'lucide-react'

describe('EmptyState', () => {
  it('should render the icon', () => {
    render(<EmptyState icon={Sword} title="No characters yet" />)
    expect(screen.getByTestId('empty-state')).toBeInTheDocument()
  })

  it('should render the title', () => {
    render(<EmptyState icon={Sword} title="No characters yet" />)
    expect(screen.getByText('No characters yet')).toBeInTheDocument()
  })

  it('should render the description', () => {
    render(
      <EmptyState
        icon={Sword}
        title="No characters yet"
        description="Create your first character to begin your adventure."
      />,
    )
    expect(
      screen.getByText('Create your first character to begin your adventure.'),
    ).toBeInTheDocument()
  })

  it('should render CTA button with label', () => {
    const onAction = vi.fn()
    render(
      <EmptyState
        icon={Sword}
        title="No characters yet"
        actionLabel="Create Your First Character"
        onAction={onAction}
      />,
    )
    expect(screen.getByTestId('empty-state-cta')).toBeInTheDocument()
    expect(screen.getByText('Create Your First Character')).toBeInTheDocument()
  })

  it('should call onAction when CTA is clicked', () => {
    const onAction = vi.fn()
    render(
      <EmptyState
        icon={Sword}
        title="No characters yet"
        actionLabel="Create Your First Character"
        onAction={onAction}
      />,
    )
    fireEvent.click(screen.getByTestId('empty-state-cta'))
    expect(onAction).toHaveBeenCalledTimes(1)
  })

  it('should not render CTA when no actionLabel provided', () => {
    render(<EmptyState icon={Sword} title="No characters yet" />)
    expect(screen.queryByTestId('empty-state-cta')).not.toBeInTheDocument()
  })

  it('should not render CTA when no onAction provided', () => {
    render(
      <EmptyState
        icon={Sword}
        title="No characters yet"
        actionLabel="Create"
      />,
    )
    expect(screen.queryByTestId('empty-state-cta')).not.toBeInTheDocument()
  })

  // -------------------------------------------------------------------------
  // Empty state instances (Story 46.2 acceptance criteria)
  // -------------------------------------------------------------------------

  it('should render gallery empty state', () => {
    render(
      <EmptyState
        icon={Sword}
        title="No characters yet"
        description="Your adventure starts here."
        actionLabel="Create Your First Character"
        onAction={vi.fn()}
      />,
    )
    expect(screen.getByText('No characters yet')).toBeInTheDocument()
    expect(screen.getByText('Create Your First Character')).toBeInTheDocument()
  })

  it('should render campaign list empty state', () => {
    render(
      <EmptyState
        icon={Shield}
        title="No campaigns yet"
        description="Create a campaign to organize your adventures."
        actionLabel="Create Your First Campaign"
        onAction={vi.fn()}
      />,
    )
    expect(screen.getByText('No campaigns yet')).toBeInTheDocument()
    expect(screen.getByText('Create Your First Campaign')).toBeInTheDocument()
  })

  it('should render campaign party empty state', () => {
    render(
      <EmptyState
        icon={Users}
        title="No characters in this campaign"
        actionLabel="Add Characters"
        onAction={vi.fn()}
      />,
    )
    expect(screen.getByText('No characters in this campaign')).toBeInTheDocument()
    expect(screen.getByText('Add Characters')).toBeInTheDocument()
  })

  it('should render session log empty state', () => {
    render(
      <EmptyState
        icon={BookOpen}
        title="No sessions recorded"
        actionLabel="Add Your First Session"
        onAction={vi.fn()}
      />,
    )
    expect(screen.getByText('No sessions recorded')).toBeInTheDocument()
    expect(screen.getByText('Add Your First Session')).toBeInTheDocument()
  })

  it('should render NPC tracker empty state', () => {
    render(
      <EmptyState
        icon={UserCircle}
        title="No NPCs tracked"
        actionLabel="Add an NPC"
        onAction={vi.fn()}
      />,
    )
    expect(screen.getByText('No NPCs tracked')).toBeInTheDocument()
    expect(screen.getByText('Add an NPC')).toBeInTheDocument()
  })

  it('should render loot tracker empty state', () => {
    render(
      <EmptyState
        icon={Gem}
        title="No loot recorded"
        actionLabel="Add Loot"
        onAction={vi.fn()}
      />,
    )
    expect(screen.getByText('No loot recorded')).toBeInTheDocument()
    expect(screen.getByText('Add Loot')).toBeInTheDocument()
  })

  it('should render roll history empty state', () => {
    render(
      <EmptyState
        icon={Dice5}
        title="No rolls yet"
        actionLabel="Roll some dice!"
        onAction={vi.fn()}
      />,
    )
    expect(screen.getByText('No rolls yet')).toBeInTheDocument()
    expect(screen.getByText('Roll some dice!')).toBeInTheDocument()
  })

  it('should render encounter list empty state', () => {
    render(
      <EmptyState
        icon={Swords}
        title="No encounters yet"
        actionLabel="Start an Encounter"
        onAction={vi.fn()}
      />,
    )
    expect(screen.getByText('No encounters yet')).toBeInTheDocument()
    expect(screen.getByText('Start an Encounter')).toBeInTheDocument()
  })

  it('should render spell page empty state for non-casters without CTA', () => {
    render(
      <EmptyState
        icon={Wand2}
        title="This character doesn't cast spells"
      />,
    )
    expect(screen.getByText("This character doesn't cast spells")).toBeInTheDocument()
    expect(screen.queryByTestId('empty-state-cta')).not.toBeInTheDocument()
  })

  it('should render DM notes empty state', () => {
    render(
      <EmptyState
        icon={StickyNote}
        title="No DM notes for this character"
        actionLabel="Add Notes"
        onAction={vi.fn()}
      />,
    )
    expect(screen.getByText('No DM notes for this character')).toBeInTheDocument()
    expect(screen.getByText('Add Notes')).toBeInTheDocument()
  })

  it('should render children content', () => {
    render(
      <EmptyState icon={Sword} title="Empty">
        <p>Custom content</p>
      </EmptyState>,
    )
    expect(screen.getByText('Custom content')).toBeInTheDocument()
  })
})
