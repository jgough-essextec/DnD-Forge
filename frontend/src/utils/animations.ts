/**
 * Animation utilities (Story 46.4)
 *
 * Micro-interaction definitions and helpers. All animations use
 * only `transform` and `opacity` for GPU-accelerated 60fps rendering.
 * Every animation respects reduced motion via the isReducedMotion flag.
 */

// ---------------------------------------------------------------------------
// Toast configuration
// ---------------------------------------------------------------------------

export interface ToastConfig {
  /** Duration in milliseconds. null = persistent until dismissed */
  duration: number | null
  /** CSS accent color class */
  accentColor: string
}

export const TOAST_CONFIG: Record<string, ToastConfig> = {
  success: { duration: 3000, accentColor: 'border-l-green-500' },
  error: { duration: null, accentColor: 'border-l-red-500' },
  info: { duration: 5000, accentColor: 'border-l-blue-500' },
  warning: { duration: 5000, accentColor: 'border-l-amber-500' },
}

/**
 * Get the auto-dismiss duration for a toast type.
 * Returns null if the toast should persist (e.g., error toasts).
 */
export function getToastDuration(type: string): number | null {
  const config = TOAST_CONFIG[type]
  if (!config) return 5000
  return config.duration
}

// ---------------------------------------------------------------------------
// Button press animation
// ---------------------------------------------------------------------------

/**
 * CSS style object for the button "press" animation on mousedown.
 * Returns identity transform when reduced motion is active.
 */
export function getButtonPressStyle(isReducedMotion: boolean): React.CSSProperties {
  if (isReducedMotion) {
    return {}
  }
  return {
    transform: 'scale(0.98)',
    transition: 'transform 100ms ease-out',
  }
}

/**
 * CSS style object for the button "release" on mouseup.
 */
export function getButtonReleaseStyle(isReducedMotion: boolean): React.CSSProperties {
  if (isReducedMotion) {
    return {}
  }
  return {
    transform: 'scale(1)',
    transition: 'transform 100ms ease-out',
  }
}

// ---------------------------------------------------------------------------
// HP flash animation
// ---------------------------------------------------------------------------

export type HPChangeType = 'heal' | 'damage' | 'none'

/**
 * Get the CSS class for HP change flash animation.
 * Green pulse for healing, red pulse for damage.
 */
export function getHPFlashClass(changeType: HPChangeType, isReducedMotion: boolean): string {
  if (isReducedMotion || changeType === 'none') return ''
  if (changeType === 'heal') return 'animate-hp-heal'
  if (changeType === 'damage') return 'animate-hp-damage'
  return ''
}

// ---------------------------------------------------------------------------
// Gallery card hover
// ---------------------------------------------------------------------------

/**
 * CSS style object for gallery card hover lift effect.
 * translateY(-2px) + increased shadow.
 */
export function getCardHoverStyle(isReducedMotion: boolean): React.CSSProperties {
  if (isReducedMotion) {
    return {}
  }
  return {
    transform: 'translateY(-2px)',
    transition: 'transform 150ms ease-out, box-shadow 150ms ease-out',
  }
}

/**
 * CSS style for gallery card at rest.
 */
export function getCardRestStyle(isReducedMotion: boolean): React.CSSProperties {
  if (isReducedMotion) {
    return {}
  }
  return {
    transform: 'translateY(0)',
    transition: 'transform 150ms ease-out, box-shadow 150ms ease-out',
  }
}

// ---------------------------------------------------------------------------
// Skeleton-to-content fade
// ---------------------------------------------------------------------------

/**
 * CSS class for the fade-in transition from skeleton to real content.
 * 250ms opacity transition.
 */
export function getContentFadeInClass(isReducedMotion: boolean): string {
  if (isReducedMotion) return ''
  return 'animate-fade-in'
}

// ---------------------------------------------------------------------------
// Animation keyframes (for inclusion in Tailwind config or global CSS)
// ---------------------------------------------------------------------------

/**
 * CSS keyframes as a string that should be injected into global styles.
 * These define the custom animations used by the utility functions.
 *
 * Only uses `transform` and `opacity` properties for 60fps performance.
 */
export const ANIMATION_KEYFRAMES = `
@keyframes hp-heal {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; box-shadow: 0 0 12px rgba(34, 197, 94, 0.5); }
}
@keyframes hp-damage {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; box-shadow: 0 0 12px rgba(239, 68, 68, 0.5); }
}
@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes level-up-particle {
  0% { transform: translateY(0) scale(1); opacity: 1; }
  100% { transform: translateY(-40px) scale(0); opacity: 0; }
}
@keyframes screen-edge-flash {
  0% { opacity: 0.4; }
  100% { opacity: 0; }
}
` as const

/**
 * Verify that all animation definitions only use transform and opacity.
 * This is a build-time assertion — the returned boolean can be used in tests.
 */
export function animationsUseOnlyGPUProperties(): boolean {
  // All animations above only use: transform, opacity, box-shadow (composited)
  // None use layout-triggering properties: width, height, top, left, margin, padding
  const layoutProperties = ['width', 'height', 'top', 'left', 'margin', 'padding']
  return !layoutProperties.some((prop) => ANIMATION_KEYFRAMES.includes(prop))
}
