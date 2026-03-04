import { describe, it, expect, vi } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import { renderWithProviders } from '@/test/utils/renderWithProviders'
import { PartyMemberCard } from '../PartyMemberCard'
import type { PartyMember } from '@/types/campaign'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

function makePartyMember(overrides: Partial<PartyMember> = {}): PartyMember {
  return {
    id: 'char-001',
    name: 'Thorn Ironforge',
    race: 'Dwarf',
    class: 'Fighter',
    level: 5,
    hp: { current: 44, max: 52 },
    ac: 18,
    updatedAt: '2024-06-15T08:30:00Z',
    createdAt: '2024-06-01T12:00:00Z',
    isArchived: false,
    campaignId: 'camp-001',
    ...overrides,
  }
}

describe('PartyMemberCard', () => {
  beforeEach(() => {
    mockNavigate.mockClear()
  })

  it('renders member name, race, class, and level', () => {
    renderWithProviders(<PartyMemberCard member={makePartyMember()} />)
    expect(screen.getByText('Thorn Ironforge')).toBeInTheDocument()
    expect(screen.getByText(/Level 5 Dwarf Fighter/)).toBeInTheDocument()
  })

  it('shows HP bar with correct values', () => {
    renderWithProviders(<PartyMemberCard member={makePartyMember()} />)
    expect(screen.getByText('44/52')).toBeInTheDocument()
  })

  it('shows AC badge', () => {
    renderWithProviders(<PartyMemberCard member={makePartyMember()} />)
    expect(screen.getByText('18')).toBeInTheDocument()
    expect(screen.getByLabelText('AC: 18')).toBeInTheDocument()
  })

  it('shows "You" badge when isCurrentUser is true', () => {
    renderWithProviders(
      <PartyMemberCard member={makePartyMember()} isCurrentUser={true} />
    )
    expect(screen.getByText('You')).toBeInTheDocument()
  })

  it('does not show "You" badge by default', () => {
    renderWithProviders(<PartyMemberCard member={makePartyMember()} />)
    expect(screen.queryByText('You')).not.toBeInTheDocument()
  })

  it('navigates to character page on click', () => {
    renderWithProviders(<PartyMemberCard member={makePartyMember()} />)
    fireEvent.click(
      screen.getByRole('button', { name: /Thorn Ironforge/i })
    )
    expect(mockNavigate).toHaveBeenCalledWith('/character/char-001')
  })

  it('navigates with ?from query param when campaignId provided', () => {
    renderWithProviders(
      <PartyMemberCard member={makePartyMember()} campaignId="camp-001" />
    )
    fireEvent.click(
      screen.getByRole('button', { name: /Thorn Ironforge/i })
    )
    expect(mockNavigate).toHaveBeenCalledWith('/character/char-001?from=camp-001')
  })

  it('handles keyboard Enter navigation', () => {
    renderWithProviders(<PartyMemberCard member={makePartyMember()} />)
    fireEvent.keyDown(
      screen.getByRole('button', { name: /Thorn Ironforge/i }),
      { key: 'Enter' }
    )
    expect(mockNavigate).toHaveBeenCalledWith('/character/char-001')
  })
})
