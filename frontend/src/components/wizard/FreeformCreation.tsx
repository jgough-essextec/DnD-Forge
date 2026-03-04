/**
 * FreeformCreation - Alternative character creation path.
 *
 * Displays the full character sheet as an accordion form where
 * sections can be filled in any order. Includes a sticky sidebar
 * for computed stats on desktop and a collapsible panel on mobile.
 *
 * Each section is a placeholder for now; full implementations will
 * arrive in Round 7.
 */

import { useState, useCallback } from 'react'
import {
  ChevronDown,
  ChevronRight,
  Check,
  AlertTriangle,
  Circle,
  Shield,
  Heart,
  Swords,
  Star,
  BookOpen,
  Wand2,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useWizardStore } from '@/stores/wizardStore'

type SectionStatus = 'empty' | 'warning' | 'complete'

interface AccordionSection {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  status: SectionStatus
  placeholder: string
}

const SECTIONS: AccordionSection[] = [
  {
    id: 'race',
    label: 'Race & Species',
    icon: Star,
    status: 'empty',
    placeholder: 'Race selection coming in Round 7',
  },
  {
    id: 'class',
    label: 'Class & Level',
    icon: Swords,
    status: 'empty',
    placeholder: 'Class selection coming in Round 7',
  },
  {
    id: 'abilities',
    label: 'Ability Scores',
    icon: Shield,
    status: 'empty',
    placeholder: 'Ability score assignment coming in Round 7',
  },
  {
    id: 'background',
    label: 'Background & Personality',
    icon: BookOpen,
    status: 'empty',
    placeholder: 'Background selection coming in Round 7',
  },
  {
    id: 'equipment',
    label: 'Equipment & Inventory',
    icon: Shield,
    status: 'empty',
    placeholder: 'Equipment selection coming in Round 7',
  },
  {
    id: 'spells',
    label: 'Spellcasting',
    icon: Wand2,
    status: 'empty',
    placeholder: 'Spell selection coming in Round 7',
  },
  {
    id: 'description',
    label: 'Description',
    icon: BookOpen,
    status: 'empty',
    placeholder: 'Character description coming in Round 7',
  },
]

function StatusIcon({ status }: { status: SectionStatus }) {
  switch (status) {
    case 'complete':
      return <Check className="h-4 w-4 text-healing-green" />
    case 'warning':
      return <AlertTriangle className="h-4 w-4 text-accent-gold" />
    case 'empty':
    default:
      return <Circle className="h-4 w-4 text-parchment/30" />
  }
}

interface FreeformCreationProps {
  onSwitchToGuided: () => void
}

export function FreeformCreation({ onSwitchToGuided }: FreeformCreationProps) {
  const [openSections, setOpenSections] = useState<Set<string>>(new Set())
  const [showSwitchConfirm, setShowSwitchConfirm] = useState(false)
  const [mobileStatsOpen, setMobileStatsOpen] = useState(false)

  const characterName = useWizardStore((s) => s.characterName)

  // Determine section statuses from store state
  const raceSelection = useWizardStore((s) => s.raceSelection)
  const classSelection = useWizardStore((s) => s.classSelection)
  const abilityScores = useWizardStore((s) => s.abilityScores)
  const backgroundSelection = useWizardStore((s) => s.backgroundSelection)

  const getSectionStatus = useCallback(
    (sectionId: string): SectionStatus => {
      switch (sectionId) {
        case 'race':
          return raceSelection ? 'complete' : 'empty'
        case 'class':
          return classSelection ? 'complete' : 'empty'
        case 'abilities':
          return abilityScores ? 'complete' : 'empty'
        case 'background':
          return backgroundSelection ? 'complete' : 'empty'
        default:
          return 'empty'
      }
    },
    [raceSelection, classSelection, abilityScores, backgroundSelection]
  )

  const warningCount = SECTIONS.filter(
    (s) => getSectionStatus(s.id) === 'empty'
  ).length

  function toggleSection(sectionId: string) {
    setOpenSections((prev) => {
      const next = new Set(prev)
      if (next.has(sectionId)) {
        next.delete(sectionId)
      } else {
        next.add(sectionId)
      }
      return next
    })
  }

  function handleSwitchToGuided() {
    setShowSwitchConfirm(true)
  }

  function confirmSwitch() {
    setShowSwitchConfirm(false)
    onSwitchToGuided()
  }

  return (
    <div className="flex flex-col md:flex-row gap-6 p-4 sm:p-6 max-w-6xl mx-auto">
      {/* Main accordion form */}
      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="mb-6">
          <h1 className="font-heading text-2xl sm:text-3xl text-accent-gold mb-2">
            {characterName ? characterName : 'New Character'}
          </h1>
          <p className="text-parchment/50 text-sm">
            Fill out each section in any order. All sections are optional until
            you save.
          </p>
        </div>

        {/* Accordion sections */}
        <div className="flex flex-col gap-2">
          {SECTIONS.map((section) => {
            const isOpen = openSections.has(section.id)
            const status = getSectionStatus(section.id)

            return (
              <div
                key={section.id}
                className="rounded-lg border border-parchment/10 bg-bg-secondary overflow-hidden"
              >
                {/* Section header */}
                <button
                  type="button"
                  onClick={() => toggleSection(section.id)}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-parchment/5 transition-colors"
                  aria-expanded={isOpen}
                >
                  <StatusIcon status={status} />
                  <section.icon className="h-4 w-4 text-parchment/50" />
                  <span className="flex-1 text-sm font-medium text-parchment">
                    {section.label}
                  </span>
                  {isOpen ? (
                    <ChevronDown className="h-4 w-4 text-parchment/40" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-parchment/40" />
                  )}
                </button>

                {/* Section body */}
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key={section.id}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 pt-1 border-t border-parchment/5">
                        <p className="text-sm text-parchment/40 py-8 text-center">
                          {section.placeholder}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>

        {/* Bottom actions */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mt-6">
          <button
            type="button"
            className="flex items-center gap-2 rounded-lg bg-accent-gold px-5 py-2.5 text-sm font-medium text-bg-primary hover:bg-accent-gold/90 transition-colors"
          >
            Save Character
            {warningCount > 0 && (
              <span className="rounded-full bg-bg-primary/20 px-2 py-0.5 text-xs">
                {warningCount} warnings
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={handleSwitchToGuided}
            className="text-sm text-parchment/50 hover:text-parchment underline underline-offset-2 transition-colors"
          >
            Switch to Guided Mode
          </button>
        </div>
      </div>

      {/* Desktop: Sticky computed stats sidebar */}
      <aside className="hidden md:block w-64 shrink-0">
        <div className="sticky top-4 rounded-lg border border-parchment/10 bg-bg-secondary p-4">
          <h3 className="font-heading text-sm text-accent-gold mb-4">
            Computed Stats
          </h3>
          <div className="flex flex-col gap-3">
            <StatRow icon={Shield} label="Armor Class" value="--" />
            <StatRow icon={Heart} label="Hit Points" value="--" />
            <StatRow icon={Swords} label="Initiative" value="--" />
            <StatRow icon={Star} label="Proficiency Bonus" value="--" />
            <StatRow icon={Wand2} label="Spell Save DC" value="--" />
          </div>
        </div>
      </aside>

      {/* Mobile: Collapsible computed stats panel */}
      <div className="md:hidden">
        <button
          type="button"
          onClick={() => setMobileStatsOpen(!mobileStatsOpen)}
          className="flex w-full items-center gap-2 rounded-lg border border-parchment/10 bg-bg-secondary px-4 py-3 text-sm text-parchment/70 hover:bg-parchment/5 transition-colors"
        >
          <Shield className="h-4 w-4 text-accent-gold" />
          <span className="flex-1 text-left font-medium">Computed Stats</span>
          {mobileStatsOpen ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </button>
        <AnimatePresence>
          {mobileStatsOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="flex flex-col gap-3 px-4 py-3 border border-t-0 border-parchment/10 rounded-b-lg bg-bg-secondary">
                <StatRow icon={Shield} label="Armor Class" value="--" />
                <StatRow icon={Heart} label="Hit Points" value="--" />
                <StatRow icon={Swords} label="Initiative" value="--" />
                <StatRow icon={Star} label="Proficiency Bonus" value="--" />
                <StatRow icon={Wand2} label="Spell Save DC" value="--" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Switch to guided confirmation dialog */}
      {showSwitchConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="rounded-xl border border-parchment/15 bg-bg-secondary p-6 max-w-sm w-full shadow-2xl">
            <h3 className="font-heading text-lg text-accent-gold mb-2">
              Switch to Guided Mode?
            </h3>
            <p className="text-sm text-parchment/60 mb-5">
              Your current progress will be preserved. The guided wizard will
              walk you through each step.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setShowSwitchConfirm(false)}
                className="rounded-lg px-4 py-2 text-sm text-parchment/60 hover:text-parchment transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmSwitch}
                className="rounded-lg bg-accent-gold px-4 py-2 text-sm font-medium text-bg-primary hover:bg-accent-gold/90 transition-colors"
              >
                Switch
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/** Small helper row for the stat sidebar. */
function StatRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="flex items-center gap-2 text-parchment/50">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </span>
      <span className="font-mono text-parchment">{value}</span>
    </div>
  )
}
