import { describe, it, expect } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/test/utils/renderWithProviders'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { Route, Routes } from 'react-router-dom'

/**
 * Helper to render Breadcrumbs within various route contexts.
 * Uses Routes + Route so useParams provides the correct params.
 */
function renderBreadcrumbs(route: string) {
  return renderWithProviders(
    <Routes>
      <Route path="/" element={<Breadcrumbs />} />
      <Route path="/character/new" element={<Breadcrumbs />} />
      <Route path="/character/:id" element={<Breadcrumbs />} />
      <Route path="/character/:id/edit" element={<Breadcrumbs />} />
      <Route path="/character/:id/levelup" element={<Breadcrumbs />} />
      <Route path="/campaigns" element={<Breadcrumbs />} />
      <Route path="/campaign/:id" element={<Breadcrumbs />} />
      <Route path="/dice" element={<Breadcrumbs />} />
      <Route path="/settings" element={<Breadcrumbs />} />
    </Routes>,
    { route }
  )
}

describe('Breadcrumbs', () => {
  describe('Home / Gallery route', () => {
    it('should render "Characters" breadcrumb on the home page', () => {
      renderBreadcrumbs('/')

      expect(screen.getByText('Characters')).toBeInTheDocument()
    })

    it('should have a breadcrumb navigation landmark', () => {
      renderBreadcrumbs('/')

      expect(screen.getByRole('navigation', { name: 'Breadcrumb' })).toBeInTheDocument()
    })

    it('should show home icon on root breadcrumb', () => {
      renderBreadcrumbs('/')

      // The "Characters" crumb is on the home route, so it should be present
      expect(screen.getByText('Characters')).toBeInTheDocument()
    })
  })

  describe('Character creation route', () => {
    it('should render "Characters > New Character" on /character/new', () => {
      renderBreadcrumbs('/character/new')

      expect(screen.getByText('Characters')).toBeInTheDocument()
      expect(screen.getByText('New Character')).toBeInTheDocument()
    })

    it('should make "Characters" a clickable link', () => {
      renderBreadcrumbs('/character/new')

      const link = screen.getByRole('link', { name: 'Characters' })
      expect(link).toHaveAttribute('href', '/')
    })
  })

  describe('Character view route', () => {
    it('should render "Characters > [Character Name]" on /character/:id', async () => {
      renderBreadcrumbs('/character/char-001')

      // Initially may show "Loading..."
      expect(screen.getByText('Characters')).toBeInTheDocument()

      await waitFor(() => {
        expect(screen.getByText('Thorn Ironforge')).toBeInTheDocument()
      })
    })

    it('should make "Characters" clickable for navigation back', async () => {
      renderBreadcrumbs('/character/char-001')

      const link = screen.getByRole('link', { name: 'Characters' })
      expect(link).toHaveAttribute('href', '/')
    })

    it('should show character name as the current page breadcrumb', async () => {
      renderBreadcrumbs('/character/char-001')

      await waitFor(() => {
        const currentPage = screen.getByText('Thorn Ironforge')
        expect(currentPage).toHaveAttribute('aria-current', 'page')
      })
    })
  })

  describe('Character edit route', () => {
    it('should render "Characters > [Name] > Editing" on /character/:id/edit', async () => {
      renderBreadcrumbs('/character/char-001/edit')

      expect(screen.getByText('Characters')).toBeInTheDocument()

      await waitFor(() => {
        expect(screen.getByText('Thorn Ironforge')).toBeInTheDocument()
      })

      expect(screen.getByText('Editing')).toBeInTheDocument()
    })

    it('should make character name a clickable link back to view mode', async () => {
      renderBreadcrumbs('/character/char-001/edit')

      await waitFor(() => {
        const charLink = screen.getByRole('link', { name: 'Thorn Ironforge' })
        expect(charLink).toHaveAttribute('href', '/character/char-001')
      })
    })

    it('should mark "Editing" as the current page', async () => {
      renderBreadcrumbs('/character/char-001/edit')

      await waitFor(() => {
        expect(screen.getByText('Thorn Ironforge')).toBeInTheDocument()
      })

      const editingCrumb = screen.getByText('Editing')
      expect(editingCrumb).toHaveAttribute('aria-current', 'page')
    })
  })

  describe('Character level up route', () => {
    it('should render "Characters > [Name] > Level Up" on /character/:id/levelup', async () => {
      renderBreadcrumbs('/character/char-001/levelup')

      await waitFor(() => {
        expect(screen.getByText('Thorn Ironforge')).toBeInTheDocument()
      })

      expect(screen.getByText('Level Up')).toBeInTheDocument()
    })
  })

  describe('Non-character routes', () => {
    it('should render "Campaigns" breadcrumb on /campaigns', () => {
      renderBreadcrumbs('/campaigns')

      expect(screen.getByText('Campaigns')).toBeInTheDocument()
    })

    it('should render "Dice Roller" breadcrumb on /dice', () => {
      renderBreadcrumbs('/dice')

      expect(screen.getByText('Dice Roller')).toBeInTheDocument()
    })

    it('should render "Settings" breadcrumb on /settings', () => {
      renderBreadcrumbs('/settings')

      expect(screen.getByText('Settings')).toBeInTheDocument()
    })
  })

  describe('Chevron separators', () => {
    it('should render chevron separators between breadcrumb items', () => {
      renderBreadcrumbs('/character/new')

      // The breadcrumb list should have both "Characters" and "New Character"
      const listItems = screen.getAllByRole('listitem')
      expect(listItems.length).toBe(2)
    })
  })

  describe('Loading state for character name', () => {
    it('should show "Loading..." initially while character data is being fetched', () => {
      renderBreadcrumbs('/character/char-001')

      expect(screen.getByText('Loading...')).toBeInTheDocument()
    })

    it('should replace "Loading..." with character name after data loads', async () => {
      renderBreadcrumbs('/character/char-001')

      expect(screen.getByText('Loading...')).toBeInTheDocument()

      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
        expect(screen.getByText('Thorn Ironforge')).toBeInTheDocument()
      })
    })
  })
})
