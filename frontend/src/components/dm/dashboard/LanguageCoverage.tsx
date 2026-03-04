/**
 * LanguageCoverage (Story 34.4)
 *
 * Compact panel showing all unique languages and tool proficiencies
 * across the party, categorized into Common and Exotic, with gap identification.
 */

import { useState } from 'react'
import { Languages, Wrench, AlertTriangle, ChevronDown, ChevronRight } from 'lucide-react'
import type { Character } from '@/types/character'
import {
  getLanguageCoverage,
  getCoverageByCategory,
  getLanguageGaps,
  getToolCoverage,
  formatLanguageName,
} from '@/utils/party-analysis'
import type { LanguageCoverageEntry, ToolCoverageEntry } from '@/utils/party-analysis'

interface LanguageCoverageProps {
  characters: Character[]
}

export function LanguageCoverage({ characters }: LanguageCoverageProps) {
  const coverage = getLanguageCoverage(characters)
  const commonLangs = getCoverageByCategory(coverage, 'common')
  const exoticLangs = getCoverageByCategory(coverage, 'exotic')
  const gaps = getLanguageGaps(coverage)
  const tools = getToolCoverage(characters)

  return (
    <div className="space-y-6" data-testid="language-coverage">
      {/* Common Languages */}
      <LanguageSection
        title="Common Languages"
        icon={<Languages className="w-4 h-4" />}
        entries={commonLangs}
      />

      {/* Exotic Languages */}
      <LanguageSection
        title="Exotic Languages"
        icon={<Languages className="w-4 h-4" />}
        entries={exoticLangs}
      />

      {/* Gaps */}
      {gaps.length > 0 && (
        <div>
          <h3 className="flex items-center gap-2 text-sm font-medium text-amber-400 mb-3">
            <AlertTriangle className="w-4 h-4" />
            Language Gaps
          </h3>
          <div className="flex flex-wrap gap-2" data-testid="language-gaps">
            {gaps.map((entry) => (
              <span
                key={entry.language}
                className="text-xs px-2 py-1 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400"
              >
                {formatLanguageName(entry.language)} (0)
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Tool Proficiencies */}
      {tools.length > 0 && (
        <div>
          <h3 className="flex items-center gap-2 text-sm font-medium text-parchment/80 mb-3">
            <Wrench className="w-4 h-4" />
            Tool Proficiencies
          </h3>
          <div className="flex flex-wrap gap-2" data-testid="tool-proficiencies">
            {tools.map((entry) => (
              <ToolBadge key={entry.tool} entry={entry} />
            ))}
          </div>
        </div>
      )}

      {tools.length === 0 && (
        <div>
          <h3 className="flex items-center gap-2 text-sm font-medium text-parchment/80 mb-3">
            <Wrench className="w-4 h-4" />
            Tool Proficiencies
          </h3>
          <p className="text-parchment/40 text-xs">
            No tool proficiencies in the party.
          </p>
        </div>
      )}
    </div>
  )
}

interface LanguageSectionProps {
  title: string
  icon: React.ReactNode
  entries: LanguageCoverageEntry[]
}

function LanguageSection({ title, icon, entries }: LanguageSectionProps) {
  return (
    <div>
      <h3 className="flex items-center gap-2 text-sm font-medium text-parchment/80 mb-3">
        {icon}
        {title}
      </h3>
      <div className="flex flex-wrap gap-2">
        {entries.map((entry) => (
          <LanguageBadge key={entry.language} entry={entry} />
        ))}
      </div>
    </div>
  )
}

function LanguageBadge({ entry }: { entry: LanguageCoverageEntry }) {
  const [expanded, setExpanded] = useState(false)
  const hasSpoken = entry.count > 0

  return (
    <div className="inline-block">
      <button
        onClick={() => entry.count > 0 && setExpanded(!expanded)}
        className={`
          text-xs px-2 py-1 rounded-full border transition-colors
          flex items-center gap-1
          ${
            hasSpoken
              ? 'border-accent-gold/30 bg-accent-gold/10 text-accent-gold hover:bg-accent-gold/20'
              : 'border-parchment/15 bg-parchment/5 text-parchment/30'
          }
        `}
        aria-label={`${formatLanguageName(entry.language)}: ${entry.count} speaker${entry.count !== 1 ? 's' : ''}`}
        aria-expanded={expanded}
        disabled={entry.count === 0}
      >
        {formatLanguageName(entry.language)} ({entry.count})
        {entry.count > 0 && (
          expanded ? (
            <ChevronDown className="w-3 h-3" />
          ) : (
            <ChevronRight className="w-3 h-3" />
          )
        )}
      </button>
      {expanded && entry.count > 0 && (
        <div
          className="mt-1 ml-1 text-[11px] text-parchment/60"
          data-testid={`language-speakers-${entry.language}`}
        >
          {entry.speakers.join(', ')}
        </div>
      )}
    </div>
  )
}

function ToolBadge({ entry }: { entry: ToolCoverageEntry }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="inline-block">
      <button
        onClick={() => setExpanded(!expanded)}
        className="text-xs px-2 py-1 rounded-full border border-parchment/20 bg-parchment/5 text-parchment/70 hover:bg-parchment/10 transition-colors flex items-center gap-1"
        aria-expanded={expanded}
      >
        {entry.tool} ({entry.count})
        {expanded ? (
          <ChevronDown className="w-3 h-3" />
        ) : (
          <ChevronRight className="w-3 h-3" />
        )}
      </button>
      {expanded && (
        <div
          className="mt-1 ml-1 text-[11px] text-parchment/60"
          data-testid={`tool-users-${entry.tool}`}
        >
          {entry.users.join(', ')}
        </div>
      )}
    </div>
  )
}
