/**
 * useDocumentMeta Hook (Story 42.4)
 *
 * Manages document <title> and <meta> tags per page for SEO
 * and Open Graph support. Lightweight alternative to react-helmet-async.
 *
 * Sets:
 * - document.title
 * - <meta name="description">
 * - <meta property="og:title">
 * - <meta property="og:description">
 * - <meta property="og:type">
 * - <meta property="og:url">
 */

import { useEffect } from 'react'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface DocumentMetaOptions {
  /** Page title (will be appended with " | D&D Character Forge") */
  title: string
  /** Meta description for the page */
  description?: string
  /** Open Graph type (default: "website") */
  ogType?: string
  /** Canonical URL for the page */
  url?: string
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const APP_NAME = 'D&D Character Forge'

function setMetaTag(attribute: string, key: string, value: string): void {
  let element = document.querySelector(`meta[${attribute}="${key}"]`)
  if (!element) {
    element = document.createElement('meta')
    element.setAttribute(attribute, key)
    document.head.appendChild(element)
  }
  element.setAttribute('content', value)
}

function removeMetaTag(attribute: string, key: string): void {
  const element = document.querySelector(`meta[${attribute}="${key}"]`)
  if (element) {
    element.remove()
  }
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Set document meta tags for the current page.
 * Cleans up meta tags on unmount, restoring the default title.
 *
 * @example
 * useDocumentMeta({
 *   title: 'Character Gallery',
 *   description: 'Browse and manage your D&D 5e characters',
 * })
 */
export function useDocumentMeta(options: DocumentMetaOptions): void {
  const { title, description, ogType = 'website', url } = options

  useEffect(() => {
    // Set title
    const fullTitle = `${title} | ${APP_NAME}`
    const previousTitle = document.title
    document.title = fullTitle

    // Set meta description
    if (description) {
      setMetaTag('name', 'description', description)
    }

    // Set Open Graph tags
    setMetaTag('property', 'og:title', fullTitle)
    setMetaTag('property', 'og:type', ogType)

    if (description) {
      setMetaTag('property', 'og:description', description)
    }

    if (url) {
      setMetaTag('property', 'og:url', url)
    }

    // Cleanup: restore previous title, remove OG tags
    return () => {
      document.title = previousTitle
      removeMetaTag('property', 'og:title')
      removeMetaTag('property', 'og:type')
      removeMetaTag('property', 'og:description')
      removeMetaTag('property', 'og:url')
    }
  }, [title, description, ogType, url])
}
