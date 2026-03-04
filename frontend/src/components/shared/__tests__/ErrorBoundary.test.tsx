/**
 * Tests for ErrorBoundary component (Story 46.3)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ErrorBoundary } from '@/components/shared/ErrorBoundary'

// Suppress console.error for error boundary tests
const originalConsoleError = console.error
beforeEach(() => {
  console.error = vi.fn()
})

afterEach(() => {
  console.error = originalConsoleError
})

// Component that throws on render
function ThrowingComponent({ shouldThrow = true }: { shouldThrow?: boolean }) {
  if (shouldThrow) {
    throw new Error('Test render error')
  }
  return <div>Child content</div>
}

describe('ErrorBoundary', () => {
  it('should render children when no error occurs', () => {
    render(
      <ErrorBoundary>
        <div>Normal content</div>
      </ErrorBoundary>,
    )
    expect(screen.getByText('Normal content')).toBeInTheDocument()
  })

  it('should catch errors and display error boundary UI', () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent />
      </ErrorBoundary>,
    )
    expect(screen.getByTestId('error-boundary')).toBeInTheDocument()
  })

  it('should display "Something went wrong" message', () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent />
      </ErrorBoundary>,
    )
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
  })

  it('should display data safety message', () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent />
      </ErrorBoundary>,
    )
    expect(
      screen.getByText('Your data is safe on the server. Try reloading the application.'),
    ).toBeInTheDocument()
  })

  it('should render "Reload App" button', () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent />
      </ErrorBoundary>,
    )
    expect(screen.getByTestId('reload-app-btn')).toBeInTheDocument()
    expect(screen.getByText('Reload App')).toBeInTheDocument()
  })

  it('should render "Export All Data" button', () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent />
      </ErrorBoundary>,
    )
    expect(screen.getByTestId('export-data-btn')).toBeInTheDocument()
    expect(screen.getByText('Export All Data')).toBeInTheDocument()
  })

  it('should render "Report Bug" link', () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent />
      </ErrorBoundary>,
    )
    const link = screen.getByTestId('report-bug-link')
    expect(link).toBeInTheDocument()
    expect(link.getAttribute('href')).toContain('github')
    expect(link.getAttribute('target')).toBe('_blank')
  })

  it('should call window.location.reload when "Reload App" is clicked', () => {
    // Mock window.location.reload
    const mockReload = vi.fn()
    Object.defineProperty(window, 'location', {
      value: { ...window.location, reload: mockReload },
      writable: true,
    })

    render(
      <ErrorBoundary>
        <ThrowingComponent />
      </ErrorBoundary>,
    )
    fireEvent.click(screen.getByTestId('reload-app-btn'))
    expect(mockReload).toHaveBeenCalled()
  })

  it('should render custom fallback when provided', () => {
    render(
      <ErrorBoundary fallback={<div>Custom fallback</div>}>
        <ThrowingComponent />
      </ErrorBoundary>,
    )
    expect(screen.getByText('Custom fallback')).toBeInTheDocument()
  })

  it('should not render error UI when no error occurs', () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent shouldThrow={false} />
      </ErrorBoundary>,
    )
    expect(screen.queryByTestId('error-boundary')).not.toBeInTheDocument()
    expect(screen.getByText('Child content')).toBeInTheDocument()
  })
})
