import { describe, it, expect, beforeEach } from 'vitest'
import { useDiceStore } from '@/stores/diceStore'

describe('diceStore', () => {
  beforeEach(() => {
    useDiceStore.setState({ rolls: [] })
  })

  it('has correct initial state', () => {
    const state = useDiceStore.getState()
    expect(state.rolls).toEqual([])
    expect(state.maxHistory).toBe(50)
  })

  it('roll creates a dice roll entry', () => {
    const result = useDiceStore.getState().roll(
      [{ type: 'd20', count: 1 }],
      0,
      'Attack roll'
    )

    expect(result).toHaveProperty('id')
    expect(result).toHaveProperty('total')
    expect(result).toHaveProperty('timestamp')
    expect(result.label).toBe('Attack roll')
    expect(result.results).toHaveLength(1)
    expect(result.total).toBeGreaterThanOrEqual(1)
    expect(result.total).toBeLessThanOrEqual(20)
  })

  it('roll adds entry to history', () => {
    useDiceStore.getState().roll([{ type: 'd6', count: 2 }], 3)

    const rolls = useDiceStore.getState().rolls
    expect(rolls).toHaveLength(1)
    expect(rolls[0].modifier).toBe(3)
    expect(rolls[0].results).toHaveLength(2)
  })

  it('roll prepends new rolls to history', () => {
    useDiceStore.getState().roll([{ type: 'd6', count: 1 }], 0, 'First')
    useDiceStore.getState().roll([{ type: 'd6', count: 1 }], 0, 'Second')

    const rolls = useDiceStore.getState().rolls
    expect(rolls[0].label).toBe('Second')
    expect(rolls[1].label).toBe('First')
  })

  it('roll handles multiple dice types', () => {
    const result = useDiceStore.getState().roll([
      { type: 'd20', count: 1 },
      { type: 'd6', count: 2 },
    ], 5)

    expect(result.results).toHaveLength(3)
    expect(result.modifier).toBe(5)
  })

  it('roll respects maxHistory limit', () => {
    useDiceStore.setState({ maxHistory: 3 })

    for (let i = 0; i < 5; i++) {
      useDiceStore.getState().roll([{ type: 'd20', count: 1 }])
    }

    expect(useDiceStore.getState().rolls).toHaveLength(3)
  })

  it('roll calculates total correctly with modifier', () => {
    // Use a d4 and check the range
    const result = useDiceStore.getState().roll(
      [{ type: 'd4', count: 1 }],
      10
    )

    // d4 result is 1-4, plus modifier 10, so total should be 11-14
    expect(result.total).toBeGreaterThanOrEqual(11)
    expect(result.total).toBeLessThanOrEqual(14)
  })

  it('clearHistory removes all rolls', () => {
    useDiceStore.getState().roll([{ type: 'd20', count: 1 }])
    useDiceStore.getState().roll([{ type: 'd20', count: 1 }])

    expect(useDiceStore.getState().rolls).toHaveLength(2)

    useDiceStore.getState().clearHistory()
    expect(useDiceStore.getState().rolls).toEqual([])
  })

  it('removeRoll removes a specific roll by ID', () => {
    const roll1 = useDiceStore.getState().roll([{ type: 'd20', count: 1 }], 0, 'Keep')
    const roll2 = useDiceStore.getState().roll([{ type: 'd20', count: 1 }], 0, 'Remove')

    useDiceStore.getState().removeRoll(roll2.id)

    const rolls = useDiceStore.getState().rolls
    expect(rolls).toHaveLength(1)
    expect(rolls[0].id).toBe(roll1.id)
  })

  it('roll records advantage flag', () => {
    const result = useDiceStore.getState().roll(
      [{ type: 'd20', count: 1 }],
      0,
      'Advantage test',
      true,
      false
    )

    expect(result.advantage).toBe(true)
    expect(result.disadvantage).toBe(false)
  })

  it('roll records disadvantage flag', () => {
    const result = useDiceStore.getState().roll(
      [{ type: 'd20', count: 1 }],
      0,
      'Disadvantage test',
      false,
      true
    )

    expect(result.advantage).toBe(false)
    expect(result.disadvantage).toBe(true)
  })
})
