/**
 * Placeholder component for wizard steps that have not yet been implemented.
 * Shows the step name and a "Coming in Round 7" message.
 */

import { Construction } from 'lucide-react'
import type { WizardStepProps } from '@/components/wizard/types'

interface PlaceholderStepProps extends WizardStepProps {
  stepName: string
}

export function PlaceholderStep({ stepName }: PlaceholderStepProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <Construction className="h-16 w-16 text-accent-gold/40 mb-6" />
      <h2 className="font-heading text-2xl text-accent-gold mb-3">{stepName}</h2>
      <p className="text-parchment/60 text-lg">Coming in Round 7</p>
    </div>
  )
}
