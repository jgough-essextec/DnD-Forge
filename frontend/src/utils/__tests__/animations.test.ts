/**
 * Tests for animation utilities (Story 46.4)
 */

import { describe, it, expect } from 'vitest'
import {
  TOAST_CONFIG,
  getToastDuration,
  getButtonPressStyle,
  getButtonReleaseStyle,
  getHPFlashClass,
  getCardHoverStyle,
  getCardRestStyle,
  getContentFadeInClass,
  animationsUseOnlyGPUProperties,
  ANIMATION_KEYFRAMES,
} from '@/utils/animations'

// ---------------------------------------------------------------------------
// Toast configuration
// ---------------------------------------------------------------------------

describe('Toast configuration', () => {
  it('should define success toast with green accent and 3s duration', () => {
    expect(TOAST_CONFIG.success.duration).toBe(3000)
    expect(TOAST_CONFIG.success.accentColor).toContain('green')
  })

  it('should define error toast with red accent and persistent (null) duration', () => {
    expect(TOAST_CONFIG.error.duration).toBeNull()
    expect(TOAST_CONFIG.error.accentColor).toContain('red')
  })

  it('should define info toast with blue accent and 5s duration', () => {
    expect(TOAST_CONFIG.info.duration).toBe(5000)
    expect(TOAST_CONFIG.info.accentColor).toContain('blue')
  })

  it('should define warning toast with amber accent and 5s duration', () => {
    expect(TOAST_CONFIG.warning.duration).toBe(5000)
    expect(TOAST_CONFIG.warning.accentColor).toContain('amber')
  })

  it('should return correct duration via getToastDuration', () => {
    expect(getToastDuration('success')).toBe(3000)
    expect(getToastDuration('error')).toBeNull()
    expect(getToastDuration('info')).toBe(5000)
  })

  it('should return fallback 5000 for unknown toast type', () => {
    expect(getToastDuration('unknown')).toBe(5000)
  })
})

// ---------------------------------------------------------------------------
// Button press animation
// ---------------------------------------------------------------------------

describe('Button press animation', () => {
  it('should return scale(0.98) when reduced motion is off', () => {
    const style = getButtonPressStyle(false)
    expect(style.transform).toBe('scale(0.98)')
  })

  it('should return empty object when reduced motion is on', () => {
    const style = getButtonPressStyle(true)
    expect(style.transform).toBeUndefined()
  })

  it('should return scale(1) on release when reduced motion is off', () => {
    const style = getButtonReleaseStyle(false)
    expect(style.transform).toBe('scale(1)')
  })

  it('should return empty object on release when reduced motion is on', () => {
    const style = getButtonReleaseStyle(true)
    expect(style.transform).toBeUndefined()
  })

  it('should include transition property for smooth animation', () => {
    const pressStyle = getButtonPressStyle(false)
    expect(pressStyle.transition).toContain('transform')
  })
})

// ---------------------------------------------------------------------------
// HP flash animation
// ---------------------------------------------------------------------------

describe('HP flash animation', () => {
  it('should return heal class for heal change type', () => {
    const cls = getHPFlashClass('heal', false)
    expect(cls).toContain('hp-heal')
  })

  it('should return damage class for damage change type', () => {
    const cls = getHPFlashClass('damage', false)
    expect(cls).toContain('hp-damage')
  })

  it('should return empty string for none change type', () => {
    const cls = getHPFlashClass('none', false)
    expect(cls).toBe('')
  })

  it('should return empty string when reduced motion is on', () => {
    expect(getHPFlashClass('heal', true)).toBe('')
    expect(getHPFlashClass('damage', true)).toBe('')
  })
})

// ---------------------------------------------------------------------------
// Gallery card hover
// ---------------------------------------------------------------------------

describe('Gallery card hover', () => {
  it('should return translateY(-2px) on hover when reduced motion is off', () => {
    const style = getCardHoverStyle(false)
    expect(style.transform).toBe('translateY(-2px)')
  })

  it('should return translateY(0) at rest when reduced motion is off', () => {
    const style = getCardRestStyle(false)
    expect(style.transform).toBe('translateY(0)')
  })

  it('should return empty object on hover when reduced motion is on', () => {
    const style = getCardHoverStyle(true)
    expect(style.transform).toBeUndefined()
  })

  it('should include transition for smooth animation', () => {
    const style = getCardHoverStyle(false)
    expect(style.transition).toContain('transform')
  })
})

// ---------------------------------------------------------------------------
// Content fade-in
// ---------------------------------------------------------------------------

describe('Content fade-in', () => {
  it('should return fade-in class when reduced motion is off', () => {
    const cls = getContentFadeInClass(false)
    expect(cls).toContain('fade-in')
  })

  it('should return empty string when reduced motion is on', () => {
    const cls = getContentFadeInClass(true)
    expect(cls).toBe('')
  })
})

// ---------------------------------------------------------------------------
// Animation property safety
// ---------------------------------------------------------------------------

describe('Animation safety', () => {
  it('should not use layout-triggering properties in animation keyframes', () => {
    expect(animationsUseOnlyGPUProperties()).toBe(true)
  })

  it('should only use transform and opacity in keyframes', () => {
    const layoutProps = ['width:', 'height:', ' top:', ' left:', 'margin:', 'padding:']
    for (const prop of layoutProps) {
      expect(ANIMATION_KEYFRAMES).not.toContain(prop)
    }
  })

  it('should define hp-heal keyframe', () => {
    expect(ANIMATION_KEYFRAMES).toContain('hp-heal')
  })

  it('should define hp-damage keyframe', () => {
    expect(ANIMATION_KEYFRAMES).toContain('hp-damage')
  })

  it('should define fade-in keyframe', () => {
    expect(ANIMATION_KEYFRAMES).toContain('fade-in')
  })

  it('should define level-up-particle keyframe', () => {
    expect(ANIMATION_KEYFRAMES).toContain('level-up-particle')
  })

  it('should define screen-edge-flash keyframe', () => {
    expect(ANIMATION_KEYFRAMES).toContain('screen-edge-flash')
  })
})
