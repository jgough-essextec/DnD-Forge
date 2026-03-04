import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/test/utils/renderWithProviders'
import { CampaignNotFound } from '@/components/layout/CampaignNotFound'

describe('CampaignNotFound', () => {
  it('should render the "Campaign Not Found" heading', () => {
    renderWithProviders(<CampaignNotFound />)

    expect(
      screen.getByRole('heading', { name: 'Campaign Not Found' })
    ).toBeInTheDocument()
  })

  it('should render an explanatory message', () => {
    renderWithProviders(<CampaignNotFound />)

    expect(
      screen.getByText(/may have been deleted/i)
    ).toBeInTheDocument()
  })

  it('should render a "Go to Campaigns" link', () => {
    renderWithProviders(<CampaignNotFound />)

    const link = screen.getByRole('link', { name: 'Go to Campaigns' })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/campaigns')
  })

  it('should render the map icon', () => {
    renderWithProviders(<CampaignNotFound />)

    // The Map icon is rendered with aria-hidden
    const container = screen.getByRole('heading', { name: 'Campaign Not Found' }).parentElement!
    expect(container.querySelector('svg')).toBeInTheDocument()
  })
})
