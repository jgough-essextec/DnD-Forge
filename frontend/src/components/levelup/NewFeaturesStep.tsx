/**
 * NewFeaturesStep (Story 31.3)
 *
 * Lists all class features gained at this level, with inline selection
 * for choice-based features. Also displays proficiency bonus changes,
 * Extra Attack notifications, and auto-scaling feature updates.
 */

import { Star, Shield, TrendingUp } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import type { LevelUpChanges } from '@/utils/levelup'

interface NewFeaturesStepProps {
  changes: LevelUpChanges
}

export function NewFeaturesStep({ changes }: NewFeaturesStepProps) {
  const hasFeatures = changes.newFeatures.length > 0
  const hasProfBonus = !!changes.proficiencyBonusChange

  return (
    <div className="space-y-6" data-testid="new-features-step">
      <div className="text-center">
        <Star className="h-8 w-8 text-accent-gold mx-auto mb-2" />
        <h3 className="text-lg font-heading font-bold text-parchment">
          New Features
        </h3>
        <p className="text-sm text-parchment/60 mt-1">
          Your class grants you the following at level {changes.newLevel}.
        </p>
      </div>

      {/* Proficiency bonus increase */}
      {hasProfBonus && changes.proficiencyBonusChange && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className={cn(
            'flex items-center gap-3 rounded-lg border border-accent-gold/30',
            'bg-accent-gold/5 p-4',
          )}
          data-testid="proficiency-bonus-change"
        >
          <Shield className="h-5 w-5 text-accent-gold flex-shrink-0" />
          <div>
            <span className="text-sm font-semibold text-parchment">
              Proficiency Bonus Increase
            </span>
            <p className="text-xs text-parchment/60">
              +{changes.proficiencyBonusChange.from} &rarr;{' '}
              +{changes.proficiencyBonusChange.to}
            </p>
          </div>
        </motion.div>
      )}

      {/* Feature list */}
      {hasFeatures ? (
        <div className="space-y-3">
          {changes.newFeatures.map((feature, index) => (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                'rounded-lg border p-4',
                feature.hasChoices
                  ? 'border-accent-gold/30 bg-accent-gold/5'
                  : 'border-parchment/15 bg-parchment/5',
              )}
              data-testid={`feature-${feature.id}`}
            >
              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex-shrink-0">
                  {feature.hasChoices ? (
                    <TrendingUp className="h-4 w-4 text-accent-gold" />
                  ) : (
                    <Star className="h-4 w-4 text-accent-gold" />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-parchment">
                      {feature.name}
                    </span>
                    {feature.hasChoices && (
                      <span className="text-[10px] uppercase tracking-wider font-semibold text-accent-gold bg-accent-gold/10 px-1.5 py-0.5 rounded">
                        Choice
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-parchment/60 mt-1 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        !hasProfBonus && (
          <div
            className="text-center py-6 text-parchment/40 text-sm"
            data-testid="no-new-features"
          >
            No new features at this level.
          </div>
        )
      )}

      {/* Extra Attack notification (Fighter 5, etc.) */}
      {changes.newFeatures.some(
        (f) =>
          f.name.toLowerCase().includes('extra attack') ||
          f.id === 'extra-attack',
      ) && (
        <div
          className={cn(
            'rounded-lg border border-damage-red/30 bg-damage-red/5 p-3',
            'text-center',
          )}
          data-testid="extra-attack-notice"
        >
          <p className="text-sm font-semibold text-parchment">
            You can now attack twice when you take the Attack action!
          </p>
        </div>
      )}
    </div>
  )
}
