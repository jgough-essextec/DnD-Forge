import { describe, it, expect, vi } from 'vitest'
import { screen, fireEvent, render } from '@testing-library/react'
import {
  DMContextProvider,
  useDMContext,
} from '../DMContextProvider'

// ---------------------------------------------------------------------------
// Helper: component that displays and interacts with DM context
// ---------------------------------------------------------------------------

function DMContextDisplay() {
  const { isDMView, campaignId, campaignName, enterDMView, exitDMView } =
    useDMContext()

  return (
    <div>
      <span data-testid="is-dm-view">{isDMView ? 'true' : 'false'}</span>
      <span data-testid="campaign-id">{campaignId ?? 'null'}</span>
      <span data-testid="campaign-name">{campaignName ?? 'null'}</span>
      <button
        onClick={() => enterDMView('camp-1', 'Test Campaign')}
        data-testid="enter-dm"
      >
        Enter DM
      </button>
      <button onClick={exitDMView} data-testid="exit-dm">
        Exit DM
      </button>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('DMContextProvider', () => {
  it('should provide default player context (isDMView = false)', () => {
    render(
      <DMContextProvider>
        <DMContextDisplay />
      </DMContextProvider>
    )

    expect(screen.getByTestId('is-dm-view').textContent).toBe('false')
    expect(screen.getByTestId('campaign-id').textContent).toBe('null')
    expect(screen.getByTestId('campaign-name').textContent).toBe('null')
  })

  it('should determine DM context when enterDMView is called', () => {
    render(
      <DMContextProvider>
        <DMContextDisplay />
      </DMContextProvider>
    )

    fireEvent.click(screen.getByTestId('enter-dm'))

    expect(screen.getByTestId('is-dm-view').textContent).toBe('true')
    expect(screen.getByTestId('campaign-id').textContent).toBe('camp-1')
    expect(screen.getByTestId('campaign-name').textContent).toBe(
      'Test Campaign'
    )
  })

  it('should determine player context when exitDMView is called', () => {
    render(
      <DMContextProvider initialDMView={true} initialCampaignId="camp-1" initialCampaignName="Test Campaign">
        <DMContextDisplay />
      </DMContextProvider>
    )

    // Starts in DM view
    expect(screen.getByTestId('is-dm-view').textContent).toBe('true')

    // Exit DM view
    fireEvent.click(screen.getByTestId('exit-dm'))

    expect(screen.getByTestId('is-dm-view').textContent).toBe('false')
    expect(screen.getByTestId('campaign-id').textContent).toBe('null')
    expect(screen.getByTestId('campaign-name').textContent).toBe('null')
  })

  it('should accept initial DM state via props', () => {
    render(
      <DMContextProvider
        initialDMView={true}
        initialCampaignId="camp-42"
        initialCampaignName="Dragon Lair"
      >
        <DMContextDisplay />
      </DMContextProvider>
    )

    expect(screen.getByTestId('is-dm-view').textContent).toBe('true')
    expect(screen.getByTestId('campaign-id').textContent).toBe('camp-42')
    expect(screen.getByTestId('campaign-name').textContent).toBe('Dragon Lair')
  })

  it('should share the same context across nested components', () => {
    function NestedChild() {
      const { isDMView, campaignName } = useDMContext()
      return (
        <span data-testid="nested">
          {isDMView ? campaignName : 'player'}
        </span>
      )
    }

    render(
      <DMContextProvider
        initialDMView={true}
        initialCampaignId="camp-1"
        initialCampaignName="Shared Campaign"
      >
        <DMContextDisplay />
        <NestedChild />
      </DMContextProvider>
    )

    expect(screen.getByTestId('nested').textContent).toBe('Shared Campaign')
  })
})

describe('useDMContext outside provider', () => {
  it('should return safe fallback player context when no provider is present', () => {
    // Suppress console warnings for this test
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})

    render(<DMContextDisplay />)

    expect(screen.getByTestId('is-dm-view').textContent).toBe('false')
    expect(screen.getByTestId('campaign-id').textContent).toBe('null')
    expect(screen.getByTestId('campaign-name').textContent).toBe('null')

    spy.mockRestore()
  })
})
