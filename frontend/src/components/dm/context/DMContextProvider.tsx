/**
 * DMContextProvider (Story 38.2)
 *
 * React context that provides DM vs Player view state to the component tree.
 * When a character is viewed from the campaign dashboard, isDMView is true.
 * When viewed from the gallery (default), isDMView is false.
 *
 * Components use the useDMContext() hook to read the current context.
 */

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from 'react'
import type { ReactNode } from 'react'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface DMContextValue {
  /** Whether the current view is in DM mode (character viewed from campaign dashboard) */
  isDMView: boolean
  /** The campaign ID when in DM context, null otherwise */
  campaignId: string | null
  /** The campaign name when in DM context, null otherwise */
  campaignName: string | null
  /** Enter DM context for a specific campaign */
  enterDMView: (campaignId: string, campaignName: string) => void
  /** Exit DM context (return to player view) */
  exitDMView: () => void
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const DMContext = createContext<DMContextValue | null>(null)

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

interface DMContextProviderProps {
  children: ReactNode
  /** Optional initial state for testing */
  initialDMView?: boolean
  initialCampaignId?: string | null
  initialCampaignName?: string | null
}

export function DMContextProvider({
  children,
  initialDMView = false,
  initialCampaignId = null,
  initialCampaignName = null,
}: DMContextProviderProps) {
  const [isDMView, setIsDMView] = useState(initialDMView)
  const [campaignId, setCampaignId] = useState<string | null>(initialCampaignId)
  const [campaignName, setCampaignName] = useState<string | null>(initialCampaignName)

  const enterDMView = useCallback((id: string, name: string) => {
    setIsDMView(true)
    setCampaignId(id)
    setCampaignName(name)
  }, [])

  const exitDMView = useCallback(() => {
    setIsDMView(false)
    setCampaignId(null)
    setCampaignName(null)
  }, [])

  const value = useMemo<DMContextValue>(
    () => ({
      isDMView,
      campaignId,
      campaignName,
      enterDMView,
      exitDMView,
    }),
    [isDMView, campaignId, campaignName, enterDMView, exitDMView]
  )

  return <DMContext.Provider value={value}>{children}</DMContext.Provider>
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Hook to access the DM context. Returns the default player context
 * if used outside a DMContextProvider (isDMView = false).
 */
export function useDMContext(): DMContextValue {
  const ctx = useContext(DMContext)
  if (!ctx) {
    // Safe fallback: player context when no provider is present
    return {
      isDMView: false,
      campaignId: null,
      campaignName: null,
      enterDMView: () => {},
      exitDMView: () => {},
    }
  }
  return ctx
}
