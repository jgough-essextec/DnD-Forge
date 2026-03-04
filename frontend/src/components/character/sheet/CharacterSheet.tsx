/**
 * CharacterSheet (Story 24.1)
 *
 * Main character sheet container with tab navigation between 3 pages.
 * Wraps children in CharacterSheetProvider and renders responsive layouts.
 *
 * Desktop (1024px+): Full multi-column layouts
 * Tablet (640-1024px): 2-column or single column
 * Mobile (<640px): Single column with optimized ordering
 */

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { CharacterSheetProvider, useCharacterSheet } from '@/components/character/CharacterSheetProvider'
import { Page1Layout } from './page1/Page1Layout'
import { AbilityScoresPanel } from './page1/AbilityScoresPanel'
import { SavingThrowsList } from './page1/SavingThrowsList'
import { SkillsList } from './page1/SkillsList'
import { CombatStatsBlock } from './page1/CombatStatsBlock'
import { HitPointsBlock } from './page1/HitPointsBlock'
import { HitDiceDeathSaves } from './page1/HitDiceDeathSaves'
import { AttacksSection } from './page1/AttacksSection'
import { PersonalityFeatures } from './page1/PersonalityFeatures'
import { ProficiencyBonusDisplay } from './page1/ProficiencyBonusDisplay'
import { Page2Layout } from './page2/Page2Layout'
import { Page3Layout } from './page3/Page3Layout'
import { PrintButton } from './PrintButton'
import { ExportPDFButton } from './ExportPDFButton'
import { FloatingActionBar } from './FloatingActionBar'

// ---------------------------------------------------------------------------
// Tab definitions
// ---------------------------------------------------------------------------

const TABS = [
  { id: 'core', label: 'Core Stats' },
  { id: 'backstory', label: 'Backstory & Details' },
  { id: 'spellcasting', label: 'Spellcasting' },
] as const

type TabId = (typeof TABS)[number]['id']

// ---------------------------------------------------------------------------
// CharacterSheet wrapper (with provider)
// ---------------------------------------------------------------------------

export interface CharacterSheetProps {
  characterId: string
  initialTab?: TabId
  readOnly?: boolean
}

export function CharacterSheet({ characterId, initialTab, readOnly }: CharacterSheetProps) {
  return (
    <CharacterSheetProvider characterId={characterId} readOnly={readOnly}>
      <CharacterSheetInner initialTab={initialTab} />
    </CharacterSheetProvider>
  )
}

// ---------------------------------------------------------------------------
// Inner sheet (consumes provider)
// ---------------------------------------------------------------------------

interface CharacterSheetInnerProps {
  initialTab?: TabId
}

function CharacterSheetInner({ initialTab }: CharacterSheetInnerProps) {
  const [activeTab, setActiveTab] = useState<TabId>(initialTab ?? 'core')
  const { character, isLoading, error, readOnly } = useCharacterSheet()

  if (isLoading) {
    return (
      <div
        className="flex min-h-[60vh] flex-col items-center justify-center p-8"
        role="status"
        aria-label="Loading character"
      >
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-accent-gold border-t-transparent" />
        <p className="mt-4 text-parchment/60">Loading character...</p>
      </div>
    )
  }

  if (error || !character) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-8 text-center">
        <h1 className="font-heading text-5xl text-accent-gold mb-4">Error</h1>
        <p className="text-parchment/80 mb-2">Failed to load character.</p>
        <p className="text-parchment/50 mb-6 text-sm">Please try again later.</p>
      </div>
    )
  }

  return (
    <div className="character-sheet" data-testid="character-sheet">
      {/* Sheet header with action buttons */}
      <div className="flex items-center justify-end gap-2 mb-4 print:hidden">
        <h2 className="sr-only">Character Sheet</h2>
        <ExportPDFButton characterId={character.id} characterName={character.name} />
        <PrintButton />
      </div>

      {/* Tab navigation */}
      <nav
        className="flex gap-1 mb-6 rounded-lg bg-bg-secondary p-1 print:hidden"
        role="tablist"
        aria-label="Character sheet pages"
        data-testid="sheet-tabs"
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`panel-${tab.id}`}
            id={`tab-${tab.id}`}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex-1 rounded-md px-4 py-2.5 text-sm font-medium transition-all',
              'min-h-[44px] touch-manipulation',
              activeTab === tab.id
                ? 'bg-accent-gold/20 text-accent-gold shadow-sm'
                : 'text-parchment/60 hover:text-parchment hover:bg-parchment/5'
            )}
            data-testid={`tab-${tab.id}`}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Tab panels — only the active panel is rendered at a time.
          For printing, users should visit each tab or use the print button
          which handles showing all pages via @media print CSS. */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
          role="tabpanel"
          id={`panel-${activeTab}`}
          aria-labelledby={`tab-${activeTab}`}
          data-testid={`panel-${activeTab}`}
        >
          {activeTab === 'core' && <CoreStatsPage />}
          {activeTab === 'backstory' && <BackstoryPage />}
          {activeTab === 'spellcasting' && <SpellcastingPage />}
        </motion.div>
      </AnimatePresence>

      {/* Floating action bar for mobile (hidden in read-only mode) */}
      {!readOnly && <FloatingActionBar />}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Page 1: Core Stats
// ---------------------------------------------------------------------------

function CoreStatsPage() {
  return (
    <div data-testid="core-stats-page">
      <Page1Layout>
        {/* Mobile layout: optimized order for play (default, single column) */}
        {/* Tablet: 2-column layout (md:) */}
        {/* Desktop: 3-column layout (lg:) */}

        {/* === MOBILE ORDER === */}
        {/* On mobile, combat stats come first for quick reference during play */}

        {/* Combat stats: visible first on mobile, center column on desktop */}
        <div
          className={cn(
            'order-1',
            'md:order-2 md:col-span-7',
            'lg:order-2 lg:col-span-4'
          )}
          data-testid="center-column"
        >
          <div className="space-y-4">
            <CombatStatsBlock />
            <HitPointsBlock />
            <HitDiceDeathSaves />
            <AttacksSection />
          </div>
        </div>

        {/* Left column: ability scores, saves, skills, passive, proficiency */}
        <div
          className={cn(
            'order-2',
            'md:order-1 md:col-span-5',
            'lg:order-1 lg:col-span-4'
          )}
          data-testid="left-column"
        >
          <div className="space-y-4">
            <ProficiencyBonusDisplay />
            {/* Mobile: 2-row x 3-col compact ability scores */}
            <div className="sm:hidden" data-testid="mobile-ability-scores">
              <AbilityScoresMobileCompact />
            </div>
            {/* Tablet+: standard vertical ability scores */}
            <div className="hidden sm:block">
              <AbilityScoresPanel />
            </div>
            <SavingThrowsList />
            {/* Mobile: collapsible skills */}
            <div className="sm:hidden">
              <CollapsibleSkills />
            </div>
            {/* Tablet+: always visible skills */}
            <div className="hidden sm:block">
              <SkillsList />
            </div>
          </div>
        </div>

        {/* Right column: personality and features */}
        <div
          className={cn(
            'order-3',
            'md:order-3 md:col-span-12',
            'lg:order-3 lg:col-span-4'
          )}
          data-testid="right-column"
        >
          {/* Mobile: collapsed by default */}
          <div className="sm:hidden">
            <CollapsiblePersonality />
          </div>
          {/* Tablet+: always visible */}
          <div className="hidden sm:block">
            <PersonalityFeatures />
          </div>
        </div>
      </Page1Layout>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Page 2: Backstory & Details
// ---------------------------------------------------------------------------

function BackstoryPage() {
  return (
    <div data-testid="backstory-page">
      <Page2Layout />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Page 3: Spellcasting
// ---------------------------------------------------------------------------

function SpellcastingPage() {
  return (
    <div data-testid="spellcasting-page">
      <Page3Layout />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Mobile-specific components
// ---------------------------------------------------------------------------

/**
 * AbilityScoresMobileCompact
 * Displays 6 ability scores in 2 rows of 3, showing modifiers only.
 */
function AbilityScoresMobileCompact() {
  const { derivedStats } = useCharacterSheet()

  const abilities = [
    { key: 'strength', label: 'STR' },
    { key: 'dexterity', label: 'DEX' },
    { key: 'constitution', label: 'CON' },
    { key: 'intelligence', label: 'INT' },
    { key: 'wisdom', label: 'WIS' },
    { key: 'charisma', label: 'CHA' },
  ] as const

  return (
    <div className="grid grid-cols-3 gap-2" data-testid="ability-scores-compact">
      {abilities.map(({ key, label }) => {
        const mod = derivedStats.abilityModifiers[key]
        const score = derivedStats.effectiveAbilityScores[key]
        return (
          <div
            key={key}
            className="flex flex-col items-center p-2 rounded-lg border border-parchment/20 bg-bg-secondary"
          >
            <span className="text-[10px] uppercase tracking-wider text-parchment/60">
              {label}
            </span>
            <span className="text-xl font-heading font-bold text-parchment">
              {mod >= 0 ? '+' : ''}{mod}
            </span>
            <span className="text-xs text-parchment/50">{score}</span>
          </div>
        )
      })}
    </div>
  )
}

/**
 * CollapsibleSkills
 * Mobile-only collapsible skills section, collapsed by default.
 */
function CollapsibleSkills() {
  const [isOpen, setIsOpen] = useState(false)
  const { character, editableCharacter } = useCharacterSheet()

  const displayCharacter = character ? { ...character, ...editableCharacter } : null
  const proficientCount = displayCharacter?.proficiencies.skills.filter(
    (s) => s.proficient
  ).length ?? 0

  return (
    <div className="rounded-lg border border-parchment/20 bg-bg-secondary" data-testid="collapsible-skills">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between p-3 min-h-[44px] touch-manipulation"
        aria-expanded={isOpen}
        aria-controls="skills-collapsible-content"
      >
        <span className="text-xs uppercase tracking-wider text-parchment/60 font-semibold">
          Skills ({proficientCount} proficient)
        </span>
        <span className="text-parchment/50 text-sm">{isOpen ? '-' : '+'}</span>
      </button>
      {isOpen && (
        <div id="skills-collapsible-content" className="px-3 pb-3">
          <SkillsList />
        </div>
      )}
    </div>
  )
}

/**
 * CollapsiblePersonality
 * Mobile-only collapsible personality section, collapsed by default.
 */
function CollapsiblePersonality() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="rounded-lg border border-parchment/20 bg-bg-secondary" data-testid="collapsible-personality">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between p-3 min-h-[44px] touch-manipulation"
        aria-expanded={isOpen}
        aria-controls="personality-collapsible-content"
      >
        <span className="text-xs uppercase tracking-wider text-parchment/60 font-semibold">
          Personality & Features
        </span>
        <span className="text-parchment/50 text-sm">{isOpen ? '-' : '+'}</span>
      </button>
      {isOpen && (
        <div id="personality-collapsible-content" className="px-3 pb-3">
          <PersonalityFeatures />
        </div>
      )}
    </div>
  )
}
