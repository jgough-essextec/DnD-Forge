/**
 * Tests for errorHandler utility (Story 46.3)
 */

import { describe, it, expect } from 'vitest'
import {
  categorizeError,
  getImportErrorMessage,
} from '@/utils/errorHandler'

// ---------------------------------------------------------------------------
// Helper to create a mock Axios error
// ---------------------------------------------------------------------------

function makeAxiosError(status?: number, code?: string, data?: Record<string, unknown>) {
  return {
    isAxiosError: true,
    response: status
      ? { status, data: data ?? {} }
      : undefined,
    code: code ?? undefined,
    message: `Request failed with status ${status}`,
  }
}

// ---------------------------------------------------------------------------
// categorizeError
// ---------------------------------------------------------------------------

describe('categorizeError', () => {
  it('should categorize 401 as AUTH', () => {
    const result = categorizeError(makeAxiosError(401))
    expect(result.category).toBe('AUTH')
    expect(result.statusCode).toBe(401)
  })

  it('should categorize 403 as AUTH', () => {
    const result = categorizeError(makeAxiosError(403))
    expect(result.category).toBe('AUTH')
    expect(result.statusCode).toBe(403)
  })

  it('should categorize 400 as VALIDATION', () => {
    const result = categorizeError(makeAxiosError(400))
    expect(result.category).toBe('VALIDATION')
    expect(result.statusCode).toBe(400)
  })

  it('should categorize 422 as VALIDATION', () => {
    const result = categorizeError(makeAxiosError(422))
    expect(result.category).toBe('VALIDATION')
  })

  it('should extract detail message from validation error', () => {
    const result = categorizeError(
      makeAxiosError(400, undefined, { detail: 'Name is required' }),
    )
    expect(result.message).toBe('Name is required')
  })

  it('should categorize 500+ as NETWORK', () => {
    const result = categorizeError(makeAxiosError(500))
    expect(result.category).toBe('NETWORK')
    expect(result.statusCode).toBe(500)
  })

  it('should categorize 503 as NETWORK', () => {
    const result = categorizeError(makeAxiosError(503))
    expect(result.category).toBe('NETWORK')
  })

  it('should categorize network unreachable (no response) as NETWORK', () => {
    const result = categorizeError(makeAxiosError(undefined, 'ERR_NETWORK'))
    expect(result.category).toBe('NETWORK')
    expect(result.recoveryHint).toContain('internet connection')
  })

  it('should categorize timeout as NETWORK', () => {
    const result = categorizeError(makeAxiosError(undefined, 'ECONNABORTED'))
    expect(result.category).toBe('NETWORK')
  })

  it('should categorize generic Error as RENDER', () => {
    const result = categorizeError(new Error('Component crashed'))
    expect(result.category).toBe('RENDER')
    expect(result.recoveryHint).toContain('reloading')
  })

  it('should categorize unknown values as RENDER', () => {
    const result = categorizeError('string error')
    expect(result.category).toBe('RENDER')
  })

  it('should categorize null/undefined as RENDER', () => {
    const result = categorizeError(null)
    expect(result.category).toBe('RENDER')
  })

  it('should always include originalError', () => {
    const original = new Error('test')
    const result = categorizeError(original)
    expect(result.originalError).toBe(original)
  })

  it('should provide recovery hints for all categories', () => {
    const errors = [
      makeAxiosError(401),
      makeAxiosError(400),
      makeAxiosError(500),
      new Error('render'),
    ]
    for (const err of errors) {
      const result = categorizeError(err)
      expect(result.recoveryHint).toBeTruthy()
    }
  })
})

// ---------------------------------------------------------------------------
// getImportErrorMessage
// ---------------------------------------------------------------------------

describe('getImportErrorMessage', () => {
  it('should return version mismatch message', () => {
    const result = getImportErrorMessage('VERSION_MISMATCH')
    expect(result.type).toBe('VERSION_MISMATCH')
    expect(result.message).toContain('newer version')
    expect(result.message).toContain('update the app')
  })

  it('should return unknown class message with class name', () => {
    const result = getImportErrorMessage('UNKNOWN_CLASS', 'Artificer')
    expect(result.type).toBe('UNKNOWN_CLASS')
    expect(result.message).toContain('unrecognized class: Artificer')
    expect(result.message).toContain('imported without class features')
  })

  it('should return invalid format message', () => {
    const result = getImportErrorMessage('INVALID_FORMAT')
    expect(result.type).toBe('INVALID_FORMAT')
    expect(result.message).toContain('Invalid file format')
  })

  it('should return missing fields message', () => {
    const result = getImportErrorMessage('MISSING_FIELDS')
    expect(result.type).toBe('MISSING_FIELDS')
    expect(result.message).toContain('missing required fields')
  })

  it('should include details when provided', () => {
    const result = getImportErrorMessage('VERSION_MISMATCH', '2.0')
    expect(result.details).toBe('2.0')
  })
})
