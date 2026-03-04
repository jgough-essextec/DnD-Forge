import { create } from 'zustand'

/**
 * Toast notification interface.
 */
export interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'info' | 'warning'
}

/**
 * UI store state for global application UI controls.
 */
export interface UIState {
  activeModal: string | null
  sidebarOpen: boolean
  editMode: boolean
  mobileNavOpen: boolean
  diceRollerOpen: boolean
  theme: 'dark' | 'light'
  toasts: Toast[]
  modalState: Record<string, unknown>
}

export interface UIActions {
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  setActiveModal: (modal: string | null, state?: Record<string, unknown>) => void
  toggleEditMode: () => void
  toggleMobileNav: () => void
  toggleDiceRoller: () => void
  setTheme: (theme: 'dark' | 'light') => void
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
}

let toastId = 0

export const useUIStore = create<UIState & UIActions>()((set) => ({
  activeModal: null,
  sidebarOpen: true,
  editMode: false,
  mobileNavOpen: false,
  diceRollerOpen: false,
  theme: 'dark',
  toasts: [],
  modalState: {},

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  setActiveModal: (modal, state) =>
    set({ activeModal: modal, modalState: state ?? {} }),

  toggleEditMode: () => set((state) => ({ editMode: !state.editMode })),

  toggleMobileNav: () => set((state) => ({ mobileNavOpen: !state.mobileNavOpen })),

  toggleDiceRoller: () =>
    set((state) => ({ diceRollerOpen: !state.diceRollerOpen })),

  setTheme: (theme) => set({ theme }),

  addToast: (toast) =>
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id: String(++toastId) }],
    })),

  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
}))
