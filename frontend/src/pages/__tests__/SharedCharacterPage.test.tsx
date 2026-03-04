import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, it, expect, beforeEach } from 'vitest'
import { AuthProvider } from '@/hooks/AuthContext'
import { setMockUser, resetMockUser } from '@/mocks/handlers'
import SharedCharacterPage from '../SharedCharacterPage'

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  })
}

function renderWithProviders(token: string) {
  const queryClient = createTestQueryClient()
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[`/shared/${token}`]}>
        <AuthProvider>
          <Routes>
            <Route path="/shared/:token" element={<SharedCharacterPage />} />
            <Route path="/character/:id" element={<div>Character Detail Page</div>} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    </QueryClientProvider>
  )
}

beforeEach(() => {
  resetMockUser()
})

describe('SharedCharacterPage', () => {
  it('shows loading spinner initially', () => {
    renderWithProviders('share-token-abc-123')
    // The spinner should be visible during loading
    expect(document.querySelector('.animate-spin')).toBeInTheDocument()
  })

  it('renders shared character data for a valid token', async () => {
    renderWithProviders('share-token-abc-123')

    await waitFor(() => {
      expect(screen.getByText('Thorn Ironforge')).toBeInTheDocument()
    })

    expect(screen.getByText(/level 5/i)).toBeInTheDocument()
    expect(screen.getByText(/dwarf/i)).toBeInTheDocument()
    expect(screen.getByText(/fighter/i)).toBeInTheDocument()
  })

  it('shows the shared character banner', async () => {
    renderWithProviders('share-token-abc-123')

    await waitFor(() => {
      expect(screen.getByText(/shared character/i)).toBeInTheDocument()
    })

    expect(screen.getByText(/read-only view/i)).toBeInTheDocument()
  })

  it('shows ability scores', async () => {
    renderWithProviders('share-token-abc-123')

    await waitFor(() => {
      expect(screen.getByText('Ability Scores')).toBeInTheDocument()
    })

    // Check that ability score labels are displayed
    expect(screen.getByText('strength')).toBeInTheDocument()
    // Multiple scores can have the same value (e.g. strength=16, constitution=16)
    expect(screen.getAllByText('16').length).toBeGreaterThanOrEqual(1)
  })

  it('shows error for not found token', async () => {
    renderWithProviders('nonexistent-token')

    await waitFor(() => {
      expect(screen.getByText(/not found/i)).toBeInTheDocument()
    })
  })

  it('shows error for expired token', async () => {
    renderWithProviders('expired-token')

    await waitFor(() => {
      expect(screen.getByText(/expired/i)).toBeInTheDocument()
    })
  })

  it('does not show import button for unauthenticated users', async () => {
    resetMockUser()
    renderWithProviders('share-token-abc-123')

    await waitFor(() => {
      expect(screen.getByText('Thorn Ironforge')).toBeInTheDocument()
    })

    expect(screen.queryByRole('button', { name: /import to my characters/i })).not.toBeInTheDocument()
  })

  it('shows import button for authenticated users', async () => {
    setMockUser({
      id: '550e8400-e29b-41d4-a716-446655440000',
      username: 'testuser',
      email: 'test@example.com',
      display_name: 'Test User',
      avatar_url: '',
      date_joined: '2024-01-01T00:00:00Z',
    })
    renderWithProviders('share-token-abc-123')

    await waitFor(() => {
      expect(screen.getByText('Thorn Ironforge')).toBeInTheDocument()
    })

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /import to my characters/i })).toBeInTheDocument()
    })
  })

  it('shows format version information', async () => {
    renderWithProviders('share-token-abc-123')

    await waitFor(() => {
      expect(screen.getByText(/format version 1.0/i)).toBeInTheDocument()
    })
  })
})
