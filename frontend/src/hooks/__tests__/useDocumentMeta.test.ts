/**
 * useDocumentMeta Tests (Story 42.4)
 *
 * Tests for the document meta tag management hook:
 * - Title setting and cleanup
 * - Meta description
 * - Open Graph tags
 */

import { describe, it, expect, afterEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useDocumentMeta } from '@/hooks/useDocumentMeta'

describe('useDocumentMeta', () => {
  const originalTitle = document.title

  afterEach(() => {
    document.title = originalTitle
    // Clean up any meta tags
    document.querySelectorAll('meta[property^="og:"]').forEach((el) => el.remove())
    document.querySelectorAll('meta[name="description"]').forEach((el) => el.remove())
  })

  it('should set document title with app name suffix', () => {
    renderHook(() =>
      useDocumentMeta({ title: 'Character Gallery' })
    )

    expect(document.title).toBe('Character Gallery | D&D Character Forge')
  })

  it('should set meta description when provided', () => {
    renderHook(() =>
      useDocumentMeta({
        title: 'Gallery',
        description: 'Browse your characters',
      })
    )

    const descMeta = document.querySelector('meta[name="description"]')
    expect(descMeta).not.toBeNull()
    expect(descMeta?.getAttribute('content')).toBe('Browse your characters')
  })

  it('should set Open Graph title tag', () => {
    renderHook(() =>
      useDocumentMeta({ title: 'Test Page' })
    )

    const ogTitle = document.querySelector('meta[property="og:title"]')
    expect(ogTitle).not.toBeNull()
    expect(ogTitle?.getAttribute('content')).toBe('Test Page | D&D Character Forge')
  })

  it('should set Open Graph type tag', () => {
    renderHook(() =>
      useDocumentMeta({ title: 'Test', ogType: 'article' })
    )

    const ogType = document.querySelector('meta[property="og:type"]')
    expect(ogType).not.toBeNull()
    expect(ogType?.getAttribute('content')).toBe('article')
  })

  it('should default Open Graph type to website', () => {
    renderHook(() =>
      useDocumentMeta({ title: 'Test' })
    )

    const ogType = document.querySelector('meta[property="og:type"]')
    expect(ogType?.getAttribute('content')).toBe('website')
  })

  it('should set Open Graph description when provided', () => {
    renderHook(() =>
      useDocumentMeta({
        title: 'Test',
        description: 'A test page',
      })
    )

    const ogDesc = document.querySelector('meta[property="og:description"]')
    expect(ogDesc).not.toBeNull()
    expect(ogDesc?.getAttribute('content')).toBe('A test page')
  })

  it('should set Open Graph URL when provided', () => {
    renderHook(() =>
      useDocumentMeta({
        title: 'Test',
        url: 'https://example.com/test',
      })
    )

    const ogUrl = document.querySelector('meta[property="og:url"]')
    expect(ogUrl?.getAttribute('content')).toBe('https://example.com/test')
  })

  it('should clean up meta tags on unmount', () => {
    const { unmount } = renderHook(() =>
      useDocumentMeta({
        title: 'Temporary',
        description: 'Will be removed',
      })
    )

    expect(document.querySelector('meta[property="og:title"]')).not.toBeNull()

    unmount()

    expect(document.querySelector('meta[property="og:title"]')).toBeNull()
    expect(document.querySelector('meta[property="og:type"]')).toBeNull()
  })

  it('should restore previous title on unmount', () => {
    document.title = 'Original Title'

    const { unmount } = renderHook(() =>
      useDocumentMeta({ title: 'New Title' })
    )

    expect(document.title).toBe('New Title | D&D Character Forge')

    unmount()

    expect(document.title).toBe('Original Title')
  })
})
