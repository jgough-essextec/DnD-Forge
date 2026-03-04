import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import {
  announce,
  cleanupLiveRegions,
  getContrastRatio,
  meetsContrastAA,
} from '@/utils/accessibility'

describe('accessibility utilities', () => {
  // ---- ScreenReaderAnnouncer ----

  describe('announce', () => {
    beforeEach(() => {
      cleanupLiveRegions()
    })

    afterEach(() => {
      cleanupLiveRegions()
    })

    it('should create a polite live region in the DOM on first call', () => {
      announce('Test message')

      const region = document.getElementById('sr-announcer')
      expect(region).not.toBeNull()
      expect(region?.getAttribute('aria-live')).toBe('polite')
      expect(region?.getAttribute('role')).toBe('status')
      expect(region?.getAttribute('aria-atomic')).toBe('true')
    })

    it('should create an assertive live region when priority is assertive', () => {
      announce('Urgent message', 'assertive')

      const region = document.getElementById('sr-announcer-assertive')
      expect(region).not.toBeNull()
      expect(region?.getAttribute('aria-live')).toBe('assertive')
      expect(region?.getAttribute('role')).toBe('alert')
    })

    it('should set the message text on the polite region by default', async () => {
      announce('Hello screen reader')

      // The message is set via requestAnimationFrame
      await new Promise((resolve) => requestAnimationFrame(resolve))

      const region = document.getElementById('sr-announcer')
      expect(region?.textContent).toBe('Hello screen reader')
    })

    it('should set the message text on the assertive region when specified', async () => {
      announce('Critical roll!', 'assertive')

      await new Promise((resolve) => requestAnimationFrame(resolve))

      const region = document.getElementById('sr-announcer-assertive')
      expect(region?.textContent).toBe('Critical roll!')
    })

    it('should clear the previous message before setting the new one', async () => {
      announce('First message')
      await new Promise((resolve) => requestAnimationFrame(resolve))

      const region = document.getElementById('sr-announcer')
      expect(region?.textContent).toBe('First message')

      announce('Second message')
      // After the clear, textContent should be empty before rAF
      expect(region?.textContent).toBe('')
    })

    it('should visually hide the live regions (sr-only style)', () => {
      announce('Hidden message')

      const region = document.getElementById('sr-announcer')
      expect(region?.style.position).toBe('absolute')
      expect(region?.style.width).toBe('1px')
      expect(region?.style.height).toBe('1px')
      expect(region?.style.overflow).toBe('hidden')
    })

    it('should not create duplicate live regions on multiple calls', () => {
      announce('First')
      announce('Second')
      announce('Third')

      const politeRegions = document.querySelectorAll('#sr-announcer')
      const assertiveRegions = document.querySelectorAll('#sr-announcer-assertive')
      expect(politeRegions.length).toBe(1)
      expect(assertiveRegions.length).toBe(1)
    })

    it('should create both polite and assertive regions on first call', () => {
      announce('test')

      expect(document.getElementById('sr-announcer')).not.toBeNull()
      expect(document.getElementById('sr-announcer-assertive')).not.toBeNull()
    })
  })

  describe('cleanupLiveRegions', () => {
    it('should remove live region elements from the DOM', () => {
      announce('Create regions')
      expect(document.getElementById('sr-announcer')).not.toBeNull()

      cleanupLiveRegions()

      expect(document.getElementById('sr-announcer')).toBeNull()
      expect(document.getElementById('sr-announcer-assertive')).toBeNull()
    })

    it('should not throw if regions do not exist', () => {
      expect(() => cleanupLiveRegions()).not.toThrow()
    })
  })

  // ---- Contrast Ratio Calculation ----

  describe('getContrastRatio', () => {
    it('should return high contrast for text-primary (#eee8d5) on bg-primary (#1a1a2e)', () => {
      const ratio = getContrastRatio('#eee8d5', '#1a1a2e')
      expect(ratio).toBeGreaterThan(11)
      expect(ratio).toBeLessThan(15)
    })

    it('should return ~5.8:1 for text-secondary (#93a1a1) on bg-primary (#1a1a2e)', () => {
      const ratio = getContrastRatio('#93a1a1', '#1a1a2e')
      expect(ratio).toBeGreaterThan(5.5)
      expect(ratio).toBeLessThan(6.5)
    })

    it('should return >= 4.5:1 for text-muted (#7d9199) on bg-primary (#1a1a2e)', () => {
      const ratio = getContrastRatio('#7d9199', '#1a1a2e')
      expect(ratio).toBeGreaterThanOrEqual(4.5)
    })

    it('should return ~3.5:1 for old text-muted (#657b83) on bg-primary (fails AA)', () => {
      const ratio = getContrastRatio('#657b83', '#1a1a2e')
      expect(ratio).toBeLessThan(4.5)
    })

    it('should return strong contrast for accent-gold (#e8b430) on bg-primary (#1a1a2e)', () => {
      const ratio = getContrastRatio('#e8b430', '#1a1a2e')
      expect(ratio).toBeGreaterThan(6.5)
      expect(ratio).toBeLessThan(10)
    })

    it('should return 21:1 for white on black', () => {
      const ratio = getContrastRatio('#ffffff', '#000000')
      expect(ratio).toBeCloseTo(21, 0)
    })

    it('should return 1:1 for identical colors', () => {
      const ratio = getContrastRatio('#1a1a2e', '#1a1a2e')
      expect(ratio).toBeCloseTo(1, 1)
    })

    it('should handle order of arguments (lighter/darker)', () => {
      const ratio1 = getContrastRatio('#eee8d5', '#1a1a2e')
      const ratio2 = getContrastRatio('#1a1a2e', '#eee8d5')
      expect(ratio1).toBeCloseTo(ratio2, 2)
    })
  })

  describe('meetsContrastAA', () => {
    it('should pass for normal text at 4.5:1', () => {
      expect(meetsContrastAA(4.5)).toBe(true)
    })

    it('should fail for normal text below 4.5:1', () => {
      expect(meetsContrastAA(4.4)).toBe(false)
    })

    it('should pass for large text at 3:1', () => {
      expect(meetsContrastAA(3, true)).toBe(true)
    })

    it('should fail for large text below 3:1', () => {
      expect(meetsContrastAA(2.9, true)).toBe(false)
    })

    it('should pass for normal text well above threshold', () => {
      expect(meetsContrastAA(11.2)).toBe(true)
    })
  })
})
