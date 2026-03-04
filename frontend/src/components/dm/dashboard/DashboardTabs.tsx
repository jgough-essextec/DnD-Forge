/**
 * DashboardTabs (Story 34.1)
 *
 * Tab navigation component for the campaign dashboard.
 * Tabs: Party (default), Sessions, Encounters, Notes.
 */

import { Swords, BookOpen, ScrollText, FileText } from 'lucide-react'

export type DashboardTab = 'party' | 'sessions' | 'encounters' | 'notes'

interface TabConfig {
  id: DashboardTab
  label: string
  icon: React.ReactNode
}

const TABS: TabConfig[] = [
  { id: 'party', label: 'Party', icon: <Swords className="w-4 h-4" /> },
  { id: 'sessions', label: 'Sessions', icon: <BookOpen className="w-4 h-4" /> },
  { id: 'encounters', label: 'Encounters', icon: <ScrollText className="w-4 h-4" /> },
  { id: 'notes', label: 'Notes', icon: <FileText className="w-4 h-4" /> },
]

interface DashboardTabsProps {
  activeTab: DashboardTab
  onTabChange: (tab: DashboardTab) => void
}

export function DashboardTabs({ activeTab, onTabChange }: DashboardTabsProps) {
  return (
    <nav
      className="flex gap-1 overflow-x-auto border-b border-parchment/10 scrollbar-hide"
      role="tablist"
      aria-label="Dashboard navigation"
    >
      {TABS.map((tab) => {
        const isActive = activeTab === tab.id
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            aria-controls={`tabpanel-${tab.id}`}
            id={`tab-${tab.id}`}
            onClick={() => onTabChange(tab.id)}
            className={`
              flex items-center gap-2 px-4 py-3 text-sm font-medium
              whitespace-nowrap transition-colors border-b-2
              ${
                isActive
                  ? 'text-accent-gold border-accent-gold'
                  : 'text-parchment/60 border-transparent hover:text-parchment hover:border-parchment/30'
              }
            `}
          >
            {tab.icon}
            {tab.label}
          </button>
        )
      })}
    </nav>
  )
}
