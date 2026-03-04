import { describe, it, expect, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { server } from '@/mocks/server'
import { setMockUser, resetMockUser } from '@/mocks/handlers'
import { renderWithProviders } from '@/test/utils/renderWithProviders'
import CharacterSheetPage from '@/pages/CharacterSheetPage'
import { Route, Routes } from 'react-router-dom'

const BASE_URL = 'http://localhost:8000/api'

/**
 * Helper to render CharacterSheetPage within a route context.
 * Uses Routes + Route to provide useParams context.
 */
function renderCharacterSheet(route: string) {
  return renderWithProviders(
    <Routes>
      <Route path="/character/:id" element={<CharacterSheetPage />} />
      <Route path="/character/:id/edit" element={<CharacterSheetPage />} />
      <Route path="/campaign/:campId" element={<div>Campaign Page</div>} />
      <Route path="/" element={<div>Home Page</div>} />
    </Routes>,
    { route }
  )
}

describe('CharacterSheetPage', () => {
  describe('Route parameter extraction', () => {
    it('should extract character ID from URL params and fetch character data', async () => {
      renderCharacterSheet('/character/char-001')

      await waitFor(() => {
        expect(screen.getByText('Thorn Ironforge')).toBeInTheDocument()
      })
    })

    it('should display character level and class information', async () => {
      renderCharacterSheet('/character/char-001')

      await waitFor(() => {
        expect(screen.getByText('Thorn Ironforge')).toBeInTheDocument()
      })

      expect(screen.getByText(/Level 5/)).toBeInTheDocument()
    })
  })

  describe('Loading state', () => {
    it('should show loading state while fetching character data', () => {
      renderCharacterSheet('/character/char-001')

      expect(screen.getByText('Loading character...')).toBeInTheDocument()
    })

    it('should display a loading spinner', () => {
      renderCharacterSheet('/character/char-001')

      expect(screen.getByRole('status')).toBeInTheDocument()
    })
  })

  describe('Error and 404 states', () => {
    it('should show error for non-existent character ID', async () => {
      renderCharacterSheet('/character/nonexistent-id')

      await waitFor(() => {
        expect(screen.getByText('Error')).toBeInTheDocument()
      })
      expect(screen.getByText('Failed to load character.')).toBeInTheDocument()
    })

    it('should display an error message when the API returns a server error', async () => {
      server.use(
        http.get(`${BASE_URL}/characters/:id/`, () => {
          return HttpResponse.json(
            { detail: 'Internal server error' },
            { status: 500 }
          )
        })
      )

      renderCharacterSheet('/character/char-001')

      await waitFor(() => {
        expect(
          screen.getByText('Failed to load character.')
        ).toBeInTheDocument()
      })
    })
  })

  describe('Read-only mode', () => {
    beforeEach(() => {
      // Set a logged-in user that is NOT the character owner
      setMockUser({
        id: 'user-other',
        username: 'otheruser',
        email: 'other@example.com',
        display_name: 'Other User',
        avatar_url: '',
        date_joined: '2024-01-01T00:00:00Z',
      })
      // Override character endpoint to include owner field
      server.use(
        http.get(`${BASE_URL}/characters/:id/`, ({ params }) => {
          if (params.id === 'char-001') {
            return HttpResponse.json({
              ...{
                id: 'char-001',
                name: 'Thorn Ironforge',
                owner: 'user-001',
                level: 5,
                race: { raceId: 'dwarf', subraceId: 'hill-dwarf' },
                classes: [{ classId: 'fighter', level: 5, subclassId: 'champion', hitDie: 10, skillProficiencies: [] }],
                background: { backgroundId: 'soldier', characterIdentity: { name: 'Thorn Ironforge' }, characterPersonality: { personalityTraits: [], ideal: '', bond: '', flaw: '' } },
                alignment: 'lawful-good',
                baseAbilityScores: { strength: 16, dexterity: 12, constitution: 14, intelligence: 10, wisdom: 13, charisma: 8 },
                abilityScores: { strength: 16, dexterity: 12, constitution: 16, intelligence: 10, wisdom: 14, charisma: 8 },
                abilityScoreMethod: 'standard',
                experiencePoints: 6500,
                hpMax: 52, hpCurrent: 44, tempHp: 0,
                hitDiceTotal: [5], hitDiceUsed: [1],
                speed: { walk: 25 },
                deathSaves: { successes: 0, failures: 0, stable: false },
                combatStats: { armorClass: { base: 18, formula: '16 + 2 (shield)', modifiers: [] }, initiative: 1, speed: { walk: 25 }, hitPoints: { current: 44, max: 52, temporary: 0 }, attacks: [], savingThrows: { strength: 6, constitution: 5 } },
                proficiencies: { armor: [], weapons: [], tools: [], languages: ['common'], skills: [], savingThrows: [] },
                inventory: [], currency: { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 }, attunedItems: [],
                spellcasting: null, features: [], feats: [],
                description: { name: 'Thorn Ironforge' },
                personality: { personalityTraits: [], ideal: '', bond: '', flaw: '' },
                conditions: [], inspiration: false, campaignId: null, isArchived: false,
              },
            })
          }
          return HttpResponse.json({ detail: 'Not found.' }, { status: 404 })
        })
      )
    })

    it('should show "Read Only" badge when viewing another user\'s character', async () => {
      renderCharacterSheet('/character/char-001')

      await waitFor(() => {
        expect(screen.getByText('Thorn Ironforge')).toBeInTheDocument()
      })

      expect(screen.getByText('Read Only')).toBeInTheDocument()
    })
  })

  describe('Campaign back link', () => {
    it('should show "Back to Campaign" link when ?from query param is present', async () => {
      renderCharacterSheet('/character/char-001?from=camp-001')

      await waitFor(() => {
        expect(screen.getByText('Thorn Ironforge')).toBeInTheDocument()
      })

      const backLink = screen.getByRole('link', { name: 'Back to Campaign' })
      expect(backLink).toHaveAttribute('href', '/campaign/camp-001')
    })
  })

  describe('Character sheet content', () => {
    it('should render the character sheet component with tabs', async () => {
      renderCharacterSheet('/character/char-001')

      await waitFor(() => {
        expect(screen.getByText('Thorn Ironforge')).toBeInTheDocument()
      })

      // Tab navigation should be present
      expect(screen.getByText('Core Stats')).toBeInTheDocument()
      expect(screen.getByText('Backstory & Details')).toBeInTheDocument()
      expect(screen.getByText('Spellcasting')).toBeInTheDocument()
    })

    it('should include a back link to the characters gallery', async () => {
      renderCharacterSheet('/character/char-001')

      await waitFor(() => {
        expect(screen.getByText('Thorn Ironforge')).toBeInTheDocument()
      })

      const backLink = screen.getByRole('link', { name: 'Back' })
      expect(backLink).toHaveAttribute('href', '/')
    })

    it('should display print button', async () => {
      renderCharacterSheet('/character/char-001')

      await waitFor(() => {
        expect(screen.getByText('Thorn Ironforge')).toBeInTheDocument()
      })

      expect(screen.getByTestId('print-button')).toBeInTheDocument()
    })

    it('should render Page 1 content by default', async () => {
      renderCharacterSheet('/character/char-001')

      await waitFor(() => {
        expect(screen.getByText('Thorn Ironforge')).toBeInTheDocument()
      })

      // Page 1 components should be visible
      expect(screen.getByTestId('core-stats-page')).toBeInTheDocument()
    })
  })
})
