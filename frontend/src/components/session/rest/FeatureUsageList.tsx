/**
 * FeatureUsageList (Story 30.3)
 *
 * Displays all limited-use features with their usage counters,
 * grouped by recovery type (short rest / long rest).
 */

import { Coffee, Moon } from 'lucide-react'
import type { FeatureUsage } from '@/utils/rest-recovery'
import { FeatureUsageCounter } from './FeatureUsageCounter'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface FeatureUsageListProps {
  /** All limited-use features to display */
  features: FeatureUsage[]
  /** Called when a feature use is expended */
  onExpend?: (featureId: string) => void
  /** Called when a feature use is recovered */
  onRecover?: (featureId: string) => void
  /** Whether the list is read-only */
  readOnly?: boolean
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function FeatureUsageList({
  features,
  onExpend,
  onRecover,
  readOnly = false,
}: FeatureUsageListProps) {
  const shortRestFeatures = features.filter((f) => f.recoversOn === 'short_rest')
  const longRestFeatures = features.filter((f) => f.recoversOn === 'long_rest')

  if (features.length === 0) {
    return (
      <div
        className="text-sm text-parchment/50 text-center py-4"
        data-testid="feature-usage-list-empty"
      >
        No limited-use features
      </div>
    )
  }

  return (
    <div className="space-y-4" data-testid="feature-usage-list">
      {/* Short Rest Features */}
      {shortRestFeatures.length > 0 && (
        <div data-testid="short-rest-features-group">
          <div className="flex items-center gap-2 mb-2">
            <Coffee className="w-4 h-4 text-parchment/60" />
            <h4 className="text-xs uppercase tracking-wider text-parchment/60 font-semibold">
              Short Rest Recovery
            </h4>
          </div>
          <div className="space-y-2 pl-6">
            {shortRestFeatures.map((feature) => (
              <FeatureUsageCounter
                key={feature.featureId}
                featureId={feature.featureId}
                name={feature.name}
                maxUses={feature.maxUses}
                usesRemaining={feature.usesRemaining}
                onExpend={onExpend}
                onRecover={onRecover}
                readOnly={readOnly}
              />
            ))}
          </div>
        </div>
      )}

      {/* Long Rest Features */}
      {longRestFeatures.length > 0 && (
        <div data-testid="long-rest-features-group">
          <div className="flex items-center gap-2 mb-2">
            <Moon className="w-4 h-4 text-parchment/60" />
            <h4 className="text-xs uppercase tracking-wider text-parchment/60 font-semibold">
              Long Rest Recovery
            </h4>
          </div>
          <div className="space-y-2 pl-6">
            {longRestFeatures.map((feature) => (
              <FeatureUsageCounter
                key={feature.featureId}
                featureId={feature.featureId}
                name={feature.name}
                maxUses={feature.maxUses}
                usesRemaining={feature.usesRemaining}
                onExpend={onExpend}
                onRecover={onRecover}
                readOnly={readOnly}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
