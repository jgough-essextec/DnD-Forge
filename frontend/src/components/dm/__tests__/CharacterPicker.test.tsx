import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import { renderWithProviders } from '@/test/utils/renderWithProviders'
import { CharacterPicker } from '../CharacterPicker'
import type { CharacterSummary } from '@/types/character'

function makeCharacter(overrides: Partial<CharacterSummary> = {}): CharacterSummary {
  return {
    id: 'char-1',
    name: 'Thorn Ironforge',
    race: 'Dwarf',
    class: 'Fighter',
    level: 5,
    hp: { current: 44, max: 52 },
    ac: 18,
    ...overrides,
  }
}

describe('CharacterPicker', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onSelect: vi.fn(),
    characters: [
      makeCharacter({ id: 'char-1', name: 'Thorn' }),
      makeCharacter({ id: 'char-2', name: 'Elara' }),
      makeCharacter({ id: 'char-3', name: 'Grim' }),
    ],
    currentCharacterCount: 2,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders when open', () => {
    renderWithProviders(<CharacterPicker {...defaultProps} />)
    expect(screen.getByText('Add Characters')).toBeInTheDocument()
  })

  it('does not render when closed', () => {
    renderWithProviders(
      <CharacterPicker {...defaultProps} isOpen={false} />
    )
    expect(screen.queryByText('Add Characters')).not.toBeInTheDocument()
  })

  it('shows all available characters', () => {
    renderWithProviders(<CharacterPicker {...defaultProps} />)
    expect(screen.getByText('Thorn')).toBeInTheDocument()
    expect(screen.getByText('Elara')).toBeInTheDocument()
    expect(screen.getByText('Grim')).toBeInTheDocument()
  })

  it('shows character details', () => {
    renderWithProviders(<CharacterPicker {...defaultProps} />)
    const details = screen.getAllByText('Level 5 Dwarf Fighter')
    expect(details.length).toBe(3)
  })

  it('allows selecting characters', () => {
    renderWithProviders(<CharacterPicker {...defaultProps} />)
    fireEvent.click(screen.getByText('Thorn'))
    expect(screen.getByText('1 selected')).toBeInTheDocument()
  })

  it('allows deselecting characters', () => {
    renderWithProviders(<CharacterPicker {...defaultProps} />)
    fireEvent.click(screen.getByText('Thorn'))
    expect(screen.getByText('1 selected')).toBeInTheDocument()
    fireEvent.click(screen.getByText('Thorn'))
    expect(screen.getByText('0 selected')).toBeInTheDocument()
  })

  it('allows selecting multiple characters', () => {
    renderWithProviders(<CharacterPicker {...defaultProps} />)
    fireEvent.click(screen.getByText('Thorn'))
    fireEvent.click(screen.getByText('Elara'))
    expect(screen.getByText('2 selected')).toBeInTheDocument()
  })

  it('calls onSelect with selected character IDs', () => {
    renderWithProviders(<CharacterPicker {...defaultProps} />)
    fireEvent.click(screen.getByText('Thorn'))
    fireEvent.click(screen.getByText('Elara'))
    fireEvent.click(screen.getByText('Add to Campaign'))
    expect(defaultProps.onSelect).toHaveBeenCalledWith(
      expect.arrayContaining(['char-1', 'char-2'])
    )
  })

  it('disables submit button when nothing selected', () => {
    renderWithProviders(<CharacterPicker {...defaultProps} />)
    expect(screen.getByText('Add to Campaign')).toBeDisabled()
  })

  it('closes when Cancel is clicked', () => {
    renderWithProviders(<CharacterPicker {...defaultProps} />)
    fireEvent.click(screen.getByText('Cancel'))
    expect(defaultProps.onClose).toHaveBeenCalled()
  })

  it('closes when X button is clicked', () => {
    renderWithProviders(<CharacterPicker {...defaultProps} />)
    fireEvent.click(screen.getByLabelText('Close'))
    expect(defaultProps.onClose).toHaveBeenCalled()
  })

  it('shows empty state when no characters available', () => {
    renderWithProviders(
      <CharacterPicker {...defaultProps} characters={[]} />
    )
    expect(
      screen.getByText('No available characters to add.')
    ).toBeInTheDocument()
  })

  it('shows warning when approaching character cap', () => {
    renderWithProviders(
      <CharacterPicker {...defaultProps} currentCharacterCount={6} />
    )
    fireEvent.click(screen.getByText('Thorn'))
    expect(
      screen.getByText(/approaching the recommended limit/)
    ).toBeInTheDocument()
  })

  it('shows cap exceeded warning', () => {
    renderWithProviders(
      <CharacterPicker {...defaultProps} currentCharacterCount={7} />
    )
    fireEvent.click(screen.getByText('Thorn'))
    fireEvent.click(screen.getByText('Elara'))
    expect(
      screen.getByText(/would exceed the recommended limit/)
    ).toBeInTheDocument()
  })

  it('shows Create New Character button when no characters', () => {
    renderWithProviders(
      <CharacterPicker {...defaultProps} characters={[]} />
    )
    expect(screen.getByText('Create New Character')).toBeInTheDocument()
  })

  it('has correct dialog role', () => {
    renderWithProviders(<CharacterPicker {...defaultProps} />)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('shows Adding... text when submitting', () => {
    renderWithProviders(
      <CharacterPicker {...defaultProps} isSubmitting={true} />
    )
    fireEvent.click(screen.getByText('Thorn'))
    expect(screen.getByText('Adding...')).toBeInTheDocument()
  })
})
