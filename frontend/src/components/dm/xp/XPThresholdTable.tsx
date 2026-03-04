/**
 * XPThresholdTable (Story 37.3)
 *
 * Collapsible reference card showing the SRD XP thresholds for all
 * 20 character levels. Accessible from the campaign dashboard.
 */

import { useState } from 'react'
import { ChevronDown, ChevronRight, BookOpen } from 'lucide-react'
import { XP_THRESHOLDS } from '@/utils/xp'

export function XPThresholdTable() {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div
      className="rounded-lg border border-parchment/10 bg-bg-primary"
      data-testid="xp-threshold-table"
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center gap-2 px-4 py-3 text-left hover:bg-parchment/5 transition-colors rounded-lg"
        aria-expanded={isExpanded}
        aria-controls="xp-threshold-content"
      >
        <BookOpen className="w-4 h-4 text-accent-gold" />
        <span className="text-sm font-medium text-parchment">
          XP Threshold Reference
        </span>
        {isExpanded ? (
          <ChevronDown className="w-4 h-4 text-parchment/50 ml-auto" />
        ) : (
          <ChevronRight className="w-4 h-4 text-parchment/50 ml-auto" />
        )}
      </button>

      {isExpanded && (
        <div
          id="xp-threshold-content"
          className="px-4 pb-4"
          role="region"
          aria-label="XP Threshold Reference Table"
        >
          <div className="grid grid-cols-2 gap-4">
            {/* Left column: Levels 1-10 */}
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-parchment/10">
                  <th className="py-1 text-left text-parchment/50 font-medium">
                    Level
                  </th>
                  <th className="py-1 text-right text-parchment/50 font-medium">
                    XP Required
                  </th>
                </tr>
              </thead>
              <tbody>
                {XP_THRESHOLDS.slice(0, 10).map((xp, index) => (
                  <tr
                    key={index}
                    className="border-b border-parchment/5"
                  >
                    <td className="py-1 text-parchment/80">
                      Level {index + 1}
                    </td>
                    <td className="py-1 text-right text-parchment font-mono">
                      {xp.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Right column: Levels 11-20 */}
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-parchment/10">
                  <th className="py-1 text-left text-parchment/50 font-medium">
                    Level
                  </th>
                  <th className="py-1 text-right text-parchment/50 font-medium">
                    XP Required
                  </th>
                </tr>
              </thead>
              <tbody>
                {XP_THRESHOLDS.slice(10, 20).map((xp, index) => (
                  <tr
                    key={index + 10}
                    className="border-b border-parchment/5"
                  >
                    <td className="py-1 text-parchment/80">
                      Level {index + 11}
                    </td>
                    <td className="py-1 text-right text-parchment font-mono">
                      {xp.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
