import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/test/utils/renderWithProviders'
import HomePage from '@/pages/HomePage'

describe('App', () => {
  it('renders the home page', () => {
    renderWithProviders(<HomePage />)
    expect(screen.getByText('D&D Character Forge')).toBeInTheDocument()
  })
})
