import { describe, it, expect } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { server } from '@/mocks/server'
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

      const backLink = screen.getByRole('link', { name: 'Back to characters' })
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
