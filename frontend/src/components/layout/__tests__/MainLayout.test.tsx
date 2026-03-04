import { describe, it, expect, vi } from 'vitest'
import { isNavActive } from '@/components/layout/MainLayout'

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
  motion: {
    div: ({
      children,
      ...props
    }: React.HTMLAttributes<HTMLDivElement> & { children?: React.ReactNode }) => {
      // Filter out motion-specific props that are not valid HTML attributes
      const {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        onAnimationStart: _a,
        ...htmlProps
      } = props as Record<string, unknown>
      const safeProps: Record<string, unknown> = {}
      for (const [key, value] of Object.entries(htmlProps)) {
        if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
          safeProps[key] = value
        }
      }
      return <div {...safeProps}>{children}</div>
    },
  },
}))

describe('isNavActive', () => {
  describe('Home route ("/")', () => {
    it('should be active only on exact "/"', () => {
      expect(isNavActive('/', '/')).toBe(true)
    })

    it('should NOT be active on /campaigns', () => {
      expect(isNavActive('/', '/campaigns')).toBe(false)
    })

    it('should NOT be active on /character/new', () => {
      expect(isNavActive('/', '/character/new')).toBe(false)
    })

    it('should NOT be active on /campaign/camp-001', () => {
      expect(isNavActive('/', '/campaign/camp-001')).toBe(false)
    })
  })

  describe('Campaigns nav item ("/campaigns")', () => {
    it('should be active on /campaigns', () => {
      expect(isNavActive('/campaigns', '/campaigns')).toBe(true)
    })

    it('should be active on /campaign/:id', () => {
      expect(isNavActive('/campaigns', '/campaign/camp-001')).toBe(true)
    })

    it('should be active on /campaign/:id/encounter/:eid', () => {
      expect(isNavActive('/campaigns', '/campaign/camp-001/encounter/enc-001')).toBe(true)
    })

    it('should be active on /campaign/:id/session/:sessionId', () => {
      expect(isNavActive('/campaigns', '/campaign/camp-001/session/5')).toBe(true)
    })

    it('should NOT be active on /', () => {
      expect(isNavActive('/campaigns', '/')).toBe(false)
    })

    it('should NOT be active on /dice', () => {
      expect(isNavActive('/campaigns', '/dice')).toBe(false)
    })
  })

  describe('Other nav items (exact match)', () => {
    it('should match /dice exactly', () => {
      expect(isNavActive('/dice', '/dice')).toBe(true)
    })

    it('should NOT match /dice on /dice/something', () => {
      expect(isNavActive('/dice', '/dice/something')).toBe(false)
    })

    it('should match /settings exactly', () => {
      expect(isNavActive('/settings', '/settings')).toBe(true)
    })

    it('should match /character/new exactly', () => {
      expect(isNavActive('/character/new', '/character/new')).toBe(true)
    })

    it('should NOT match /character/new on /character/123', () => {
      expect(isNavActive('/character/new', '/character/123')).toBe(false)
    })
  })
})
