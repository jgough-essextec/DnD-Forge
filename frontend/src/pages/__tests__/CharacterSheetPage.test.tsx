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
    it('should show 404 error for non-existent character ID', async () => {
      renderCharacterSheet('/character/nonexistent-id')

      await waitFor(() => {
        expect(screen.getByText('Character not found.')).toBeInTheDocument()
      })
    })

    it('should show "Go Home" button on 404 page', async () => {
      renderCharacterSheet('/character/nonexistent-id')

      await waitFor(() => {
        expect(screen.getByText('Go Home')).toBeInTheDocument()
      })
    })

    it('should show "Create New Character" button on 404 page', async () => {
      renderCharacterSheet('/character/nonexistent-id')

      await waitFor(() => {
        expect(screen.getByText('Create New Character')).toBeInTheDocument()
      })
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

  describe('Edit mode detection', () => {
    it('should detect view mode from /character/:id URL', async () => {
      renderCharacterSheet('/character/char-001')

      await waitFor(() => {
        expect(screen.getByText('Thorn Ironforge')).toBeInTheDocument()
      })

      // View link should be the active one (aria-current="page")
      const viewLink = screen.getByRole('link', { name: 'View' })
      expect(viewLink).toHaveAttribute('aria-current', 'page')

      // Edit link should NOT have aria-current
      const editLink = screen.getByRole('link', { name: 'Edit' })
      expect(editLink).not.toHaveAttribute('aria-current')
    })

    it('should detect edit mode from /character/:id/edit URL', async () => {
      renderCharacterSheet('/character/char-001/edit')

      await waitFor(() => {
        expect(screen.getByText('Thorn Ironforge')).toBeInTheDocument()
      })

      // Edit link should be active
      const editLink = screen.getByRole('link', { name: 'Edit' })
      expect(editLink).toHaveAttribute('aria-current', 'page')

      // View link should NOT be active
      const viewLink = screen.getByRole('link', { name: 'View' })
      expect(viewLink).not.toHaveAttribute('aria-current')
    })

    it('should show editing mode indicator banner in edit mode', async () => {
      renderCharacterSheet('/character/char-001/edit')

      await waitFor(() => {
        expect(screen.getByText('Thorn Ironforge')).toBeInTheDocument()
      })

      expect(
        screen.getByText(/Editing mode/)
      ).toBeInTheDocument()
    })

    it('should NOT show editing mode indicator banner in view mode', async () => {
      renderCharacterSheet('/character/char-001')

      await waitFor(() => {
        expect(screen.getByText('Thorn Ironforge')).toBeInTheDocument()
      })

      expect(screen.queryByText(/Editing mode/)).not.toBeInTheDocument()
    })
  })

  describe('Character sheet content', () => {
    it('should display Core Stats section with AC, initiative, and speed', async () => {
      renderCharacterSheet('/character/char-001')

      await waitFor(() => {
        expect(screen.getByText('Core Stats')).toBeInTheDocument()
      })

      expect(screen.getByText('AC')).toBeInTheDocument()
      expect(screen.getByText('Initiative')).toBeInTheDocument()
      expect(screen.getByText('Speed')).toBeInTheDocument()
    })

    it('should display Hit Points section', async () => {
      renderCharacterSheet('/character/char-001')

      await waitFor(() => {
        expect(screen.getByText('Hit Points')).toBeInTheDocument()
      })
    })

    it('should display character features', async () => {
      renderCharacterSheet('/character/char-001')

      await waitFor(() => {
        expect(screen.getByText('Features & Traits')).toBeInTheDocument()
      })

      expect(screen.getByText('second wind')).toBeInTheDocument()
      expect(screen.getByText('action surge')).toBeInTheDocument()
      expect(screen.getByText('extra attack')).toBeInTheDocument()
    })

    it('should include a back link to the characters gallery', async () => {
      renderCharacterSheet('/character/char-001')

      await waitFor(() => {
        expect(screen.getByText('Thorn Ironforge')).toBeInTheDocument()
      })

      const backLink = screen.getByRole('link', { name: 'Back to characters' })
      expect(backLink).toHaveAttribute('href', '/')
    })

    it('should provide view/edit mode toggle links with correct hrefs', async () => {
      renderCharacterSheet('/character/char-001')

      await waitFor(() => {
        expect(screen.getByText('Thorn Ironforge')).toBeInTheDocument()
      })

      const viewLink = screen.getByRole('link', { name: 'View' })
      expect(viewLink).toHaveAttribute('href', '/character/char-001')

      const editLink = screen.getByRole('link', { name: 'Edit' })
      expect(editLink).toHaveAttribute('href', '/character/char-001/edit')
    })
  })
})
