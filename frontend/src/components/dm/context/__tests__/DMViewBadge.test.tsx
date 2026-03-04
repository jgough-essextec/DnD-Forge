import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/test/utils/renderWithProviders'
import { DMContextProvider } from '../DMContextProvider'
import { DMViewBadge } from '../DMViewBadge'

describe('DMViewBadge', () => {
  it('should render "DM View" badge in header when character is in DM context', () => {
    renderWithProviders(
      <DMContextProvider
        initialDMView={true}
        initialCampaignId="camp-1"
        initialCampaignName="Dragon Campaign"
      >
        <DMViewBadge />
      </DMContextProvider>
    )

    expect(screen.getByTestId('dm-view-badge')).toBeInTheDocument()
    expect(screen.getByText('DM View')).toBeInTheDocument()
  })

  it('should NOT render "DM View" badge in player context', () => {
    renderWithProviders(
      <DMContextProvider initialDMView={false}>
        <DMViewBadge />
      </DMContextProvider>
    )

    expect(screen.queryByTestId('dm-view-badge')).not.toBeInTheDocument()
    expect(screen.queryByText('DM View')).not.toBeInTheDocument()
  })

  it('should display campaign name with link back to dashboard in DM view', () => {
    renderWithProviders(
      <DMContextProvider
        initialDMView={true}
        initialCampaignId="camp-42"
        initialCampaignName="Lost Mines"
      >
        <DMViewBadge />
      </DMContextProvider>
    )

    const link = screen.getByRole('link', { name: /back to lost mines dashboard/i })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/campaign/camp-42')
    expect(screen.getByText('Lost Mines')).toBeInTheDocument()
  })

  it('should have accessible status role and label', () => {
    renderWithProviders(
      <DMContextProvider
        initialDMView={true}
        initialCampaignId="camp-1"
        initialCampaignName="Test Campaign"
      >
        <DMViewBadge />
      </DMContextProvider>
    )

    const badge = screen.getByTestId('dm-view-badge')
    expect(badge).toHaveAttribute('role', 'status')
    expect(badge).toHaveAttribute(
      'aria-label',
      'DM View for campaign Test Campaign'
    )
  })

  it('should not render when isDMView is true but campaignId is null', () => {
    renderWithProviders(
      <DMContextProvider
        initialDMView={true}
        initialCampaignId={null}
        initialCampaignName={null}
      >
        <DMViewBadge />
      </DMContextProvider>
    )

    expect(screen.queryByTestId('dm-view-badge')).not.toBeInTheDocument()
  })
})
