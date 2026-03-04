/**
 * ErrorBoundary (Story 46.3)
 *
 * Global React error boundary that catches unhandled render errors
 * and displays a friendly recovery page. Includes:
 * - "Reload App" button
 * - "Report Bug" link
 * - "Export All Data" emergency button (uses standalone fetch, not React)
 */

import { Component, type ReactNode, type ErrorInfo } from 'react'
import { AlertTriangle, RefreshCcw, Bug, Download } from 'lucide-react'
import { emergencyExportAllData } from '@/utils/errorHandler'

// ---------------------------------------------------------------------------
// Props & State
// ---------------------------------------------------------------------------

export interface ErrorBoundaryProps {
  children: ReactNode
  /** Fallback UI — if not provided, the built-in error page is used */
  fallback?: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  isExporting: boolean
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null, isExporting: false }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log to console in development
    if (import.meta.env.DEV) {
      console.error('[ErrorBoundary] Caught error:', error, errorInfo)
    }
  }

  handleReload = (): void => {
    window.location.reload()
  }

  handleExportData = async (): Promise<void> => {
    this.setState({ isExporting: true })
    try {
      const baseUrl =
        import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'
      await emergencyExportAllData(baseUrl)
    } catch {
      // Best-effort export — if this fails too, there is nothing more we can do
    } finally {
      this.setState({ isExporting: false })
    }
  }

  render(): ReactNode {
    if (!this.state.hasError) {
      return this.props.children
    }

    if (this.props.fallback) {
      return this.props.fallback
    }

    return (
      <div
        className="min-h-screen flex items-center justify-center bg-bg-primary p-4"
        data-testid="error-boundary"
      >
        <div className="max-w-md w-full rounded-xl border border-parchment/10 bg-bg-secondary p-8 text-center space-y-6">
          {/* Icon */}
          <div className="mx-auto w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
            <AlertTriangle className="h-8 w-8 text-red-400" />
          </div>

          {/* Message */}
          <div>
            <h1 className="font-heading text-2xl text-parchment mb-2">
              Something went wrong
            </h1>
            <p className="text-sm text-parchment/60">
              Your data is safe on the server. Try reloading the application.
            </p>
          </div>

          {/* Error detail (dev only) */}
          {import.meta.env.DEV && this.state.error && (
            <pre className="text-left text-xs text-red-400/70 bg-red-500/5 rounded-lg p-3 overflow-auto max-h-32">
              {this.state.error.message}
            </pre>
          )}

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={this.handleReload}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-accent-gold text-bg-primary font-semibold text-sm hover:bg-accent-gold/90 transition-colors"
              data-testid="reload-app-btn"
            >
              <RefreshCcw className="h-4 w-4" />
              Reload App
            </button>

            <button
              onClick={this.handleExportData}
              disabled={this.state.isExporting}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg border border-parchment/20 text-parchment text-sm hover:border-accent-gold/30 hover:text-accent-gold transition-colors disabled:opacity-50"
              data-testid="export-data-btn"
            >
              <Download className="h-4 w-4" />
              {this.state.isExporting ? 'Exporting...' : 'Export All Data'}
            </button>

            <a
              href="https://github.com/dnd-forge/issues/new"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-parchment/60 text-sm hover:text-parchment transition-colors"
              data-testid="report-bug-link"
            >
              <Bug className="h-4 w-4" />
              Report Bug
            </a>
          </div>
        </div>
      </div>
    )
  }
}
