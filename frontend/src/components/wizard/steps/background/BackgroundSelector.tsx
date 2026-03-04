/**
 * BackgroundSelector -- Background browsing and selection component.
 *
 * Displays all 13 SRD backgrounds in a selectable card grid with search,
 * skill overlap detection, and a detail slide panel for full background info.
 */

import { useState, useMemo, useCallback } from 'react'
import { Search, AlertTriangle, BookOpen, Wrench, Languages, Shield } from 'lucide-react'
import { cn } from '@/lib/utils'
import { BACKGROUNDS } from '@/data/backgrounds'
import { SelectableCardGrid } from '@/components/shared/SelectableCardGrid'
import { DetailSlidePanel } from '@/components/shared/DetailSlidePanel'
import type { Background } from '@/types/background'
import type { SkillName } from '@/types/core'
import { SKILL_NAMES } from '@/types/core'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Format a skill name for display (e.g. "sleight-of-hand" -> "Sleight of Hand") */
function formatSkillName(skill: string): string {
  return skill
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

/** Detect which background skills overlap with existing class skills */
export function detectSkillOverlaps(
  backgroundSkills: SkillName[],
  classSkills: SkillName[],
): SkillName[] {
  return backgroundSkills.filter((skill) => classSkills.includes(skill))
}

/** Get all skills available as replacements (excluding already-held skills) */
export function getReplacementSkills(
  existingSkills: SkillName[],
  backgroundSkills: SkillName[],
  currentReplacements: Record<string, SkillName | null>,
): SkillName[] {
  const usedSkills = new Set([
    ...existingSkills,
    ...backgroundSkills,
    ...Object.values(currentReplacements).filter(Boolean) as SkillName[],
  ])
  return SKILL_NAMES.filter((skill) => !usedSkills.has(skill))
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface BackgroundSelectorProps {
  selectedBackground: Background | null
  onSelect: (background: Background) => void
  classSkills: SkillName[]
  skillReplacements: Record<string, SkillName | null>
  onSkillReplacementChange: (overlappingSkill: string, replacement: SkillName | null) => void
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function BackgroundSelector({
  selectedBackground,
  onSelect,
  classSkills,
  skillReplacements,
  onSkillReplacementChange,
}: BackgroundSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [detailBackground, setDetailBackground] = useState<Background | null>(null)

  // Filter backgrounds by search query
  const filteredBackgrounds = useMemo(() => {
    if (!searchQuery.trim()) return BACKGROUNDS as Background[]
    const query = searchQuery.toLowerCase()
    return (BACKGROUNDS as Background[]).filter(
      (bg) =>
        bg.name.toLowerCase().includes(query) ||
        bg.description.toLowerCase().includes(query) ||
        bg.skillProficiencies.some((s) => s.toLowerCase().includes(query)),
    )
  }, [searchQuery])

  // Detect skill overlaps for the currently selected background
  const overlappingSkills = useMemo(() => {
    if (!selectedBackground) return []
    return detectSkillOverlaps(selectedBackground.skillProficiencies, classSkills)
  }, [selectedBackground, classSkills])

  const handleSelect = useCallback(
    (bg: Background) => {
      onSelect(bg)
    },
    [onSelect],
  )

  const handleViewDetails = useCallback((bg: Background, e: React.MouseEvent) => {
    e.stopPropagation()
    setDetailBackground(bg)
  }, [])

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-parchment/50" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search backgrounds..."
          aria-label="Search backgrounds"
          className={cn(
            'w-full rounded-lg border border-parchment/20 bg-bg-secondary pl-10 pr-4 py-2',
            'text-parchment placeholder:text-parchment/40',
            'focus:outline-none focus:border-accent-gold/50 focus:ring-1 focus:ring-accent-gold/30',
            'transition-colors',
          )}
        />
      </div>

      {/* Background Card Grid */}
      <SelectableCardGrid<Background>
        items={filteredBackgrounds}
        selectedItems={selectedBackground ? [selectedBackground] : []}
        onSelect={handleSelect}
        getKey={(bg) => bg.id}
        columns={{ sm: 1, md: 2, lg: 3 }}
        renderCard={(bg, isSelected) => (
          <BackgroundCard
            background={bg}
            isSelected={isSelected}
            hasOverlap={
              isSelected &&
              detectSkillOverlaps(bg.skillProficiencies, classSkills).length > 0
            }
            onViewDetails={(e) => handleViewDetails(bg, e)}
          />
        )}
      />

      {filteredBackgrounds.length === 0 && (
        <p className="text-center text-parchment/50 py-8">
          No backgrounds match your search.
        </p>
      )}

      {/* Skill Overlap Warning */}
      {selectedBackground && overlappingSkills.length > 0 && (
        <SkillOverlapWarning
          overlappingSkills={overlappingSkills}
          classSkills={classSkills}
          backgroundSkills={selectedBackground.skillProficiencies}
          skillReplacements={skillReplacements}
          onReplacementChange={onSkillReplacementChange}
        />
      )}

      {/* Detail Panel */}
      <DetailSlidePanel
        isOpen={detailBackground !== null}
        onClose={() => setDetailBackground(null)}
        title={detailBackground?.name ?? 'Background Details'}
      >
        {detailBackground && <BackgroundDetail background={detailBackground} />}
      </DetailSlidePanel>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Background Card
// ---------------------------------------------------------------------------

function BackgroundCard({
  background,
  isSelected: _isSelected,
  hasOverlap,
  onViewDetails,
}: {
  background: Background
  isSelected: boolean
  hasOverlap: boolean
  onViewDetails: (e: React.MouseEvent) => void
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-heading text-base font-semibold text-parchment">
          {background.name}
        </h3>
        {hasOverlap && (
          <AlertTriangle className="h-4 w-4 text-amber-400 flex-shrink-0" aria-label="Skill overlap" />
        )}
      </div>

      <p className="text-xs text-parchment/60 line-clamp-2">
        {background.description}
      </p>

      {/* Skill Proficiencies */}
      <div className="flex items-center gap-1.5 text-xs text-parchment/70">
        <Shield className="h-3.5 w-3.5 text-accent-gold/60 flex-shrink-0" />
        <span>{background.skillProficiencies.map(formatSkillName).join(', ')}</span>
      </div>

      {/* Tool Proficiencies */}
      {background.toolProficiencies.length > 0 && (
        <div className="flex items-center gap-1.5 text-xs text-parchment/70">
          <Wrench className="h-3.5 w-3.5 text-accent-gold/60 flex-shrink-0" />
          <span>{background.toolProficiencies.join(', ')}</span>
        </div>
      )}

      {/* Languages */}
      {(Array.isArray(background.languages)
        ? background.languages.length > 0
        : background.languages.choose > 0) && (
        <div className="flex items-center gap-1.5 text-xs text-parchment/70">
          <Languages className="h-3.5 w-3.5 text-accent-gold/60 flex-shrink-0" />
          <span>
            {Array.isArray(background.languages)
              ? background.languages.join(', ')
              : `Choose ${background.languages.choose} language${background.languages.choose > 1 ? 's' : ''}`}
          </span>
        </div>
      )}

      {/* Feature */}
      <div className="flex items-center gap-1.5 text-xs text-parchment/70">
        <BookOpen className="h-3.5 w-3.5 text-accent-gold/60 flex-shrink-0" />
        <span>{background.feature.name}</span>
      </div>

      <button
        onClick={onViewDetails}
        className="text-xs text-accent-gold hover:text-accent-gold/80 transition-colors mt-1"
      >
        View Details
      </button>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Skill Overlap Warning
// ---------------------------------------------------------------------------

function SkillOverlapWarning({
  overlappingSkills,
  classSkills,
  backgroundSkills,
  skillReplacements,
  onReplacementChange,
}: {
  overlappingSkills: SkillName[]
  classSkills: SkillName[]
  backgroundSkills: SkillName[]
  skillReplacements: Record<string, SkillName | null>
  onReplacementChange: (overlappingSkill: string, replacement: SkillName | null) => void
}) {
  return (
    <div
      className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 space-y-3"
      role="alert"
      aria-label="Skill overlap warning"
    >
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-5 w-5 text-amber-400" />
        <h4 className="font-heading text-sm font-semibold text-amber-300">
          Skill Overlap Detected
        </h4>
      </div>
      <p className="text-xs text-parchment/70">
        Your background grants skills you already have from your class.
        Choose replacement skills for each overlap.
      </p>
      {overlappingSkills.map((skill) => {
        const available = getReplacementSkills(
          classSkills,
          backgroundSkills,
          // Exclude the current skill's own replacement from the "used" set
          Object.fromEntries(
            Object.entries(skillReplacements).filter(([k]) => k !== skill),
          ),
        )
        return (
          <div key={skill} className="space-y-1">
            <label className="text-xs text-parchment/80">
              <span className="text-red-400 font-medium">{formatSkillName(skill)}</span>
              {' '}overlaps with your class skills. Choose a replacement:
            </label>
            <select
              value={skillReplacements[skill] ?? ''}
              onChange={(e) =>
                onReplacementChange(
                  skill,
                  e.target.value ? (e.target.value as SkillName) : null,
                )
              }
              aria-label={`Replacement for ${formatSkillName(skill)}`}
              className={cn(
                'w-full rounded-lg border border-parchment/20 bg-bg-secondary px-3 py-2',
                'text-sm text-parchment',
                'focus:outline-none focus:border-accent-gold/50 focus:ring-1 focus:ring-accent-gold/30',
              )}
            >
              <option value="">Select a replacement skill...</option>
              {available.map((s) => (
                <option key={s} value={s}>
                  {formatSkillName(s)}
                </option>
              ))}
            </select>
          </div>
        )
      })}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Background Detail Panel Content
// ---------------------------------------------------------------------------

function BackgroundDetail({ background }: { background: Background }) {
  return (
    <div className="space-y-6">
      <p className="text-sm text-parchment/80 leading-relaxed">
        {background.description}
      </p>

      {/* Skill Proficiencies */}
      <div>
        <h3 className="text-sm font-semibold text-accent-gold mb-1">Skill Proficiencies</h3>
        <p className="text-sm text-parchment/70">
          {background.skillProficiencies.map(formatSkillName).join(', ')}
        </p>
      </div>

      {/* Tool Proficiencies */}
      {background.toolProficiencies.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-accent-gold mb-1">Tool Proficiencies</h3>
          <p className="text-sm text-parchment/70">
            {background.toolProficiencies.join(', ')}
          </p>
        </div>
      )}

      {/* Languages */}
      <div>
        <h3 className="text-sm font-semibold text-accent-gold mb-1">Languages</h3>
        <p className="text-sm text-parchment/70">
          {Array.isArray(background.languages)
            ? background.languages.length > 0
              ? background.languages.join(', ')
              : 'None'
            : `Choose ${background.languages.choose} language${background.languages.choose > 1 ? 's' : ''}`}
        </p>
      </div>

      {/* Equipment */}
      <div>
        <h3 className="text-sm font-semibold text-accent-gold mb-1">Equipment</h3>
        <ul className="text-sm text-parchment/70 space-y-0.5">
          {background.equipment.map((item, i) => (
            <li key={i}>- {item}</li>
          ))}
        </ul>
      </div>

      {/* Feature */}
      <div>
        <h3 className="text-sm font-semibold text-accent-gold mb-1">
          Feature: {background.feature.name}
        </h3>
        <p className="text-sm text-parchment/70 leading-relaxed">
          {background.feature.description}
        </p>
      </div>
    </div>
  )
}
