/**
 * Bundle Analysis Tests (Story 42.1)
 *
 * Tests that verify tree-shaking, import patterns, and code splitting.
 * These are static analysis tests that verify code patterns rather than
 * runtime behavior.
 */

import { describe, it, expect } from 'vitest'
import * as fs from 'fs'
import * as path from 'path'

const SRC_DIR = path.resolve(__dirname, '../../')

function readFile(filePath: string): string {
  return fs.readFileSync(filePath, 'utf-8')
}

function findFilesRecursive(dir: string, ext: string): string[] {
  const results: string[] = []
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
      results.push(...findFilesRecursive(fullPath, ext))
    } else if (entry.isFile() && entry.name.endsWith(ext)) {
      results.push(fullPath)
    }
  }
  return results
}

describe('Bundle Analysis', () => {
  // =========================================================================
  // Tree-shaking: lucide-react
  // =========================================================================

  describe('lucide-react imports', () => {
    it('should use individual icon imports, not barrel import', () => {
      const tsxFiles = findFilesRecursive(SRC_DIR, '.tsx')
      const tsFiles = findFilesRecursive(SRC_DIR, '.ts').filter(
        (f) => !f.endsWith('.test.ts') && !f.endsWith('.test.tsx')
      )
      const allFiles = [...tsxFiles, ...tsFiles]

      for (const file of allFiles) {
        const content = readFile(file)
        // Check for barrel import like: import * as Icons from 'lucide-react'
        // or: import lucide from 'lucide-react'
        const barrelImportMatch = content.match(
          /import\s+\*\s+as\s+\w+\s+from\s+['"]lucide-react['"]/
        )
        expect(
          barrelImportMatch,
          `File ${file} has barrel import from lucide-react: ${barrelImportMatch?.[0]}`
        ).toBeNull()
      }
    })

    it('should only import named icons from lucide-react', () => {
      const tsxFiles = findFilesRecursive(SRC_DIR, '.tsx')

      for (const file of tsxFiles) {
        const content = readFile(file)
        const lucideImports = content.match(/from\s+['"]lucide-react['"]/g)
        if (lucideImports) {
          // Each import line should use destructured named imports (including type imports)
          const importStatements = content.match(
            /import\s+(?:type\s+)?\{[^}]+\}\s+from\s+['"]lucide-react['"]/g
          )
          expect(
            importStatements?.length ?? 0,
            `File ${file} should use destructured imports from lucide-react`
          ).toBe(lucideImports.length)
        }
      }
    })
  })

  // =========================================================================
  // Tree-shaking: lodash
  // =========================================================================

  describe('lodash imports', () => {
    it('should use lodash-es, not lodash', () => {
      const allSourceFiles = [
        ...findFilesRecursive(SRC_DIR, '.ts'),
        ...findFilesRecursive(SRC_DIR, '.tsx'),
      ].filter((f) => !f.endsWith('.test.ts') && !f.endsWith('.test.tsx'))

      for (const file of allSourceFiles) {
        const content = readFile(file)
        // Should not import from plain 'lodash' (non-ES module)
        const lodashImport = content.match(
          /from\s+['"]lodash['"](?!-es)/
        )
        expect(
          lodashImport,
          `File ${file} imports from 'lodash' instead of 'lodash-es'`
        ).toBeNull()
      }
    })
  })

  // =========================================================================
  // Code splitting: App.tsx
  // =========================================================================

  describe('code splitting', () => {
    it('should use React.lazy() for all major page routes in App.tsx', () => {
      const appContent = readFile(path.join(SRC_DIR, 'App.tsx'))

      // All major routes should use lazy loading
      const expectedLazyRoutes = [
        'HomePage',
        'CharacterNewPage',
        'CharacterSheetPage',
        'CampaignsPage',
        'CampaignDashboardPage',
        'EncounterPage',
        'DiceRollerPage',
        'SettingsPage',
      ]

      for (const route of expectedLazyRoutes) {
        const lazyPattern = new RegExp(`const\\s+${route}\\s*=\\s*lazy\\(`)
        expect(
          lazyPattern.test(appContent),
          `${route} should use React.lazy() in App.tsx`
        ).toBe(true)
      }
    })

    it('should wrap routes in Suspense with a fallback', () => {
      const appContent = readFile(path.join(SRC_DIR, 'App.tsx'))
      expect(appContent).toContain('Suspense')
      expect(appContent).toContain('fallback')
    })

    it('should have at least 10 lazy-loaded routes', () => {
      const appContent = readFile(path.join(SRC_DIR, 'App.tsx'))
      const lazyImports = appContent.match(/const\s+\w+\s*=\s*lazy\(/g)
      expect(lazyImports).not.toBeNull()
      expect(lazyImports!.length).toBeGreaterThanOrEqual(10)
    })
  })

  // =========================================================================
  // Font optimization
  // =========================================================================

  describe('font optimization', () => {
    it('should use display=swap for Google Fonts', () => {
      const indexHtml = readFile(
        path.resolve(SRC_DIR, '..', 'index.html')
      )
      expect(indexHtml).toContain('display=swap')
    })

    it('should preconnect to Google Fonts', () => {
      const indexHtml = readFile(
        path.resolve(SRC_DIR, '..', 'index.html')
      )
      expect(indexHtml).toContain('preconnect')
      expect(indexHtml).toContain('fonts.googleapis.com')
      expect(indexHtml).toContain('fonts.gstatic.com')
    })
  })

  // =========================================================================
  // Vite config
  // =========================================================================

  describe('vite build config', () => {
    it('should have manualChunks defined for vendor splitting', () => {
      const viteConfig = readFile(
        path.resolve(SRC_DIR, '..', 'vite.config.ts')
      )
      expect(viteConfig).toContain('manualChunks')
      expect(viteConfig).toContain('vendor-react')
      expect(viteConfig).toContain('vendor-data')
    })

    it('should have rollup-plugin-visualizer configured', () => {
      const viteConfig = readFile(
        path.resolve(SRC_DIR, '..', 'vite.config.ts')
      )
      expect(viteConfig).toContain('visualizer')
    })

    it('should have SRD data modules in manualChunks', () => {
      const viteConfig = readFile(
        path.resolve(SRC_DIR, '..', 'vite.config.ts')
      )
      expect(viteConfig).toContain('srd-reference')
      expect(viteConfig).toContain('srd-spells')
      expect(viteConfig).toContain('srd-classes')
      expect(viteConfig).toContain('srd-races')
    })
  })
})
