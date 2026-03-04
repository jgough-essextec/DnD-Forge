/**
 * Error handler utility (Story 46.3)
 *
 * Categorized error handling for network, auth, validation, and
 * render errors. Provides user-friendly messages and recovery
 * guidance for each category.
 */

import type { AxiosError } from 'axios'

// ---------------------------------------------------------------------------
// Error categories
// ---------------------------------------------------------------------------

export type ErrorCategory = 'NETWORK' | 'AUTH' | 'VALIDATION' | 'RENDER'

export interface CategorizedError {
  category: ErrorCategory
  message: string
  recoveryHint: string
  originalError: unknown
  statusCode?: number
}

// ---------------------------------------------------------------------------
// Categorization logic
// ---------------------------------------------------------------------------

/**
 * Categorize an unknown error into one of the supported error categories
 * and produce a user-friendly message with recovery guidance.
 */
export function categorizeError(error: unknown): CategorizedError {
  // Axios/network errors
  if (isAxiosError(error)) {
    const status = error.response?.status

    // Auth errors
    if (status === 401 || status === 403) {
      return {
        category: 'AUTH',
        message: 'Your session has expired.',
        recoveryHint: 'Please log in again to continue.',
        originalError: error,
        statusCode: status,
      }
    }

    // Validation errors
    if (status === 400 || status === 422) {
      const detail = extractDetail(error)
      return {
        category: 'VALIDATION',
        message: detail || 'The request contained invalid data.',
        recoveryHint: 'Please check your input and try again.',
        originalError: error,
        statusCode: status,
      }
    }

    // Server errors
    if (status && status >= 500) {
      return {
        category: 'NETWORK',
        message: 'The server encountered an error.',
        recoveryHint: 'Please try again later. If the problem persists, contact support.',
        originalError: error,
        statusCode: status,
      }
    }

    // Network unreachable / timeout
    if (!error.response || error.code === 'ECONNABORTED' || error.code === 'ERR_NETWORK') {
      return {
        category: 'NETWORK',
        message: 'Connection error. Unable to reach the server.',
        recoveryHint: 'Please check your internet connection or try again later.',
        originalError: error,
      }
    }

    // Fallback for other HTTP errors
    return {
      category: 'NETWORK',
      message: `Request failed with status ${status}.`,
      recoveryHint: 'Please try again.',
      originalError: error,
      statusCode: status,
    }
  }

  // React render errors or generic JS errors
  if (error instanceof Error) {
    return {
      category: 'RENDER',
      message: 'Something went wrong while rendering the page.',
      recoveryHint: 'Try reloading the application.',
      originalError: error,
    }
  }

  // Unknown
  return {
    category: 'RENDER',
    message: 'An unexpected error occurred.',
    recoveryHint: 'Try reloading the application.',
    originalError: error,
  }
}

// ---------------------------------------------------------------------------
// Import error messages (Story 46.3 — T46.3.3)
// ---------------------------------------------------------------------------

export interface ImportError {
  type: 'VERSION_MISMATCH' | 'UNKNOWN_CLASS' | 'INVALID_FORMAT' | 'MISSING_FIELDS'
  message: string
  details?: string
}

export function getImportErrorMessage(
  type: ImportError['type'],
  details?: string,
): ImportError {
  switch (type) {
    case 'VERSION_MISMATCH':
      return {
        type,
        message:
          'This file was exported from a newer version of D&D Character Forge. Please update the app.',
        details,
      }
    case 'UNKNOWN_CLASS':
      return {
        type,
        message: `This file contains an unrecognized class: ${details ?? 'Unknown'}. The character will be imported without class features.`,
        details,
      }
    case 'INVALID_FORMAT':
      return {
        type,
        message: 'Invalid file format. The file does not appear to be a valid character export.',
        details,
      }
    case 'MISSING_FIELDS':
      return {
        type,
        message: 'The import file is missing required fields.',
        details,
      }
  }
}

// ---------------------------------------------------------------------------
// Emergency data export (standalone, no React dependency)
// ---------------------------------------------------------------------------

/**
 * Emergency export function that fetches all user data from the API
 * and triggers a JSON file download. Designed to work even when the
 * React app is in a broken state — it uses raw fetch() calls.
 */
export async function emergencyExportAllData(
  baseUrl: string = 'http://localhost:8000/api',
): Promise<void> {
  const results: Record<string, unknown> = {}

  const endpoints = [
    { key: 'characters', path: '/characters/' },
    { key: 'campaigns', path: '/campaigns/' },
    { key: 'preferences', path: '/preferences/' },
  ]

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`${baseUrl}${endpoint.path}`, {
        credentials: 'include',
      })
      if (response.ok) {
        results[endpoint.key] = await response.json()
      } else {
        results[endpoint.key] = { error: `HTTP ${response.status}` }
      }
    } catch (err) {
      results[endpoint.key] = {
        error: err instanceof Error ? err.message : 'Fetch failed',
      }
    }
  }

  const exportData = {
    exportedAt: new Date().toISOString(),
    emergencyExport: true,
    ...results,
  }

  const blob = new Blob([JSON.stringify(exportData, null, 2)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `dnd-forge-emergency-export-${new Date().toISOString().slice(0, 10)}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isAxiosError(error: unknown): error is AxiosError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'isAxiosError' in error &&
    (error as AxiosError).isAxiosError === true
  )
}

function extractDetail(error: AxiosError): string | null {
  const data = error.response?.data as Record<string, unknown> | undefined
  if (!data) return null
  if (typeof data.detail === 'string') return data.detail
  if (typeof data.message === 'string') return data.message
  return null
}
