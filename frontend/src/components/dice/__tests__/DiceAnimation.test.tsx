import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { DiceAnimation } from '../DiceAnimation'

// Mock matchMedia for jsdom
function mockMatchMedia(reducedMotion = false) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: reducedMotion && query === '(prefers-reduced-motion: reduce)',
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      onchange: null,
      dispatchEvent: vi.fn(),
    })),
  })
}

describe('DiceAnimation', () => {
  beforeEach(() => {
    mockMatchMedia(false)
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders empty state when no results', () => {
    render(
      <DiceAnimation
        results={[]}
        dieType="d20"
        isRolling={false}
        onAnimationComplete={vi.fn()}
      />
    )
    expect(screen.getByTestId('dice-tray-empty')).toBeInTheDocument()
    expect(screen.getByText('Roll some dice!')).toBeInTheDocument()
  })

  it('renders die faces for each result', () => {
    render(
      <DiceAnimation
        results={[15, 8]}
        dieType="d20"
        isRolling={false}
        onAnimationComplete={vi.fn()}
      />
    )
    expect(screen.getByTestId('die-result-0')).toBeInTheDocument()
    expect(screen.getByTestId('die-result-1')).toBeInTheDocument()
  })

  it('shows question marks while rolling', () => {
    render(
      <DiceAnimation
        results={[15]}
        dieType="d20"
        isRolling={true}
        onAnimationComplete={vi.fn()}
      />
    )
    expect(screen.getByTestId('die-result-0')).toHaveTextContent('?')
  })

  it('shows results after animation completes', () => {
    const onComplete = vi.fn()
    render(
      <DiceAnimation
        results={[15]}
        dieType="d20"
        isRolling={true}
        onAnimationComplete={onComplete}
      />
    )

    act(() => {
      vi.advanceTimersByTime(1400)
    })

    expect(onComplete).toHaveBeenCalled()
    expect(screen.getByTestId('die-result-0')).toHaveTextContent('15')
  })

  it('calls onAnimationComplete after the animation duration', () => {
    const onComplete = vi.fn()
    render(
      <DiceAnimation
        results={[10]}
        dieType="d6"
        isRolling={true}
        onAnimationComplete={onComplete}
      />
    )

    expect(onComplete).not.toHaveBeenCalled()

    act(() => {
      vi.advanceTimersByTime(1300)
    })

    expect(onComplete).toHaveBeenCalledTimes(1)
  })

  it('applies critical highlight styling for natural 20', () => {
    const onComplete = vi.fn()
    render(
      <DiceAnimation
        results={[20]}
        dieType="d20"
        isCritical
        isRolling={true}
        onAnimationComplete={onComplete}
      />
    )

    act(() => {
      vi.advanceTimersByTime(1400)
    })

    const die = screen.getByTestId('die-result-0')
    expect(die.className).toContain('ring-accent-gold')
  })

  it('applies fumble highlight styling for natural 1', () => {
    const onComplete = vi.fn()
    render(
      <DiceAnimation
        results={[1]}
        dieType="d20"
        isFumble
        isRolling={true}
        onAnimationComplete={onComplete}
      />
    )

    act(() => {
      vi.advanceTimersByTime(1400)
    })

    const die = screen.getByTestId('die-result-0')
    expect(die.className).toContain('ring-damage-red')
  })

  it('has aria-live attribute for accessibility', () => {
    render(
      <DiceAnimation
        results={[10]}
        dieType="d6"
        isRolling={false}
        onAnimationComplete={vi.fn()}
      />
    )
    expect(screen.getByTestId('dice-animation')).toHaveAttribute('aria-live', 'polite')
  })

  it('respects prefers-reduced-motion and completes immediately', () => {
    mockMatchMedia(true)

    const onComplete = vi.fn()
    render(
      <DiceAnimation
        results={[15]}
        dieType="d20"
        isRolling={true}
        onAnimationComplete={onComplete}
      />
    )

    // With reduced motion, should complete immediately
    expect(onComplete).toHaveBeenCalled()

    // Restore to non-reduced
    mockMatchMedia(false)
  })
})
