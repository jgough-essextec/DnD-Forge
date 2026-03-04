import { describe, it, expect, beforeEach } from 'vitest'
import { useUIStore } from '@/stores/uiStore'

describe('uiStore', () => {
  beforeEach(() => {
    // Reset to default state
    useUIStore.setState({
      activeModal: null,
      sidebarOpen: true,
      editMode: false,
      mobileNavOpen: false,
      diceRollerOpen: false,
      theme: 'dark',
      toasts: [],
      modalState: {},
    })
  })

  it('has correct initial state', () => {
    const state = useUIStore.getState()
    expect(state.activeModal).toBeNull()
    expect(state.sidebarOpen).toBe(true)
    expect(state.editMode).toBe(false)
    expect(state.mobileNavOpen).toBe(false)
    expect(state.diceRollerOpen).toBe(false)
    expect(state.theme).toBe('dark')
    expect(state.toasts).toEqual([])
    expect(state.modalState).toEqual({})
  })

  it('toggleSidebar toggles sidebar open state', () => {
    expect(useUIStore.getState().sidebarOpen).toBe(true)
    useUIStore.getState().toggleSidebar()
    expect(useUIStore.getState().sidebarOpen).toBe(false)
    useUIStore.getState().toggleSidebar()
    expect(useUIStore.getState().sidebarOpen).toBe(true)
  })

  it('setSidebarOpen sets sidebar open state directly', () => {
    useUIStore.getState().setSidebarOpen(false)
    expect(useUIStore.getState().sidebarOpen).toBe(false)
    useUIStore.getState().setSidebarOpen(true)
    expect(useUIStore.getState().sidebarOpen).toBe(true)
  })

  it('setActiveModal sets modal and optional state', () => {
    useUIStore.getState().setActiveModal('confirmDelete', { characterId: '123' })
    expect(useUIStore.getState().activeModal).toBe('confirmDelete')
    expect(useUIStore.getState().modalState).toEqual({ characterId: '123' })
  })

  it('setActiveModal with null clears modal and state', () => {
    useUIStore.getState().setActiveModal('someModal', { key: 'val' })
    useUIStore.getState().setActiveModal(null)
    expect(useUIStore.getState().activeModal).toBeNull()
    expect(useUIStore.getState().modalState).toEqual({})
  })

  it('toggleEditMode toggles edit mode', () => {
    expect(useUIStore.getState().editMode).toBe(false)
    useUIStore.getState().toggleEditMode()
    expect(useUIStore.getState().editMode).toBe(true)
    useUIStore.getState().toggleEditMode()
    expect(useUIStore.getState().editMode).toBe(false)
  })

  it('toggleMobileNav toggles mobile nav', () => {
    expect(useUIStore.getState().mobileNavOpen).toBe(false)
    useUIStore.getState().toggleMobileNav()
    expect(useUIStore.getState().mobileNavOpen).toBe(true)
  })

  it('toggleDiceRoller toggles dice roller', () => {
    expect(useUIStore.getState().diceRollerOpen).toBe(false)
    useUIStore.getState().toggleDiceRoller()
    expect(useUIStore.getState().diceRollerOpen).toBe(true)
  })

  it('setTheme updates theme', () => {
    useUIStore.getState().setTheme('light')
    expect(useUIStore.getState().theme).toBe('light')
    useUIStore.getState().setTheme('dark')
    expect(useUIStore.getState().theme).toBe('dark')
  })

  it('addToast adds a toast with auto-generated ID', () => {
    useUIStore.getState().addToast({ message: 'Success!', type: 'success' })
    const toasts = useUIStore.getState().toasts
    expect(toasts).toHaveLength(1)
    expect(toasts[0].message).toBe('Success!')
    expect(toasts[0].type).toBe('success')
    expect(toasts[0].id).toBeTruthy()
  })

  it('addToast adds multiple toasts with unique IDs', () => {
    useUIStore.getState().addToast({ message: 'First', type: 'info' })
    useUIStore.getState().addToast({ message: 'Second', type: 'error' })
    const toasts = useUIStore.getState().toasts
    expect(toasts).toHaveLength(2)
    expect(toasts[0].id).not.toBe(toasts[1].id)
  })

  it('removeToast removes a toast by ID', () => {
    useUIStore.getState().addToast({ message: 'To remove', type: 'warning' })
    const toast = useUIStore.getState().toasts[0]
    useUIStore.getState().removeToast(toast.id)
    expect(useUIStore.getState().toasts).toHaveLength(0)
  })
})
