/**
 * IntroStep - Step 0 of the character creation wizard.
 *
 * Displays a welcoming header, character/player name inputs,
 * and two mode-selection cards:
 *   - Guided Creation (advances to step 1)
 *   - Freeform Creation (switches to freeform view)
 *
 * Also shows a resume banner if the wizard store has state from
 * a previous session.
 */

import { useCallback, useEffect, useState } from 'react'
import { Wand2, Edit3, RotateCcw, ArrowRight } from 'lucide-react'
import { useWizardStore } from '@/stores/wizardStore'
import type { WizardStepProps } from '@/components/wizard/types'

interface IntroStepProps extends WizardStepProps {
  onSelectFreeform: () => void
}

export function IntroStep({ onValidationChange, onSelectFreeform }: IntroStepProps) {
  const characterName = useWizardStore((s) => s.characterName)
  const setCharacterName = useWizardStore((s) => s.setCharacterName)
  const setStep = useWizardStore((s) => s.setStep)
  const reset = useWizardStore((s) => s.reset)
  const raceSelection = useWizardStore((s) => s.raceSelection)
  const classSelection = useWizardStore((s) => s.classSelection)

  const [playerName, setPlayerName] = useState('')

  // The intro step is always valid (name inputs are optional)
  useEffect(() => {
    onValidationChange?.({ valid: true, errors: [] })
  }, [onValidationChange])

  // Detect if there is a previous session to resume
  const hasExistingProgress = raceSelection !== null || classSelection !== null

  const handleGuidedCreation = useCallback(() => {
    setStep(1)
  }, [setStep])

  const handleStartFresh = useCallback(() => {
    reset()
  }, [reset])

  return (
    <div className="flex flex-col items-center px-4 py-8 sm:py-12 max-w-2xl mx-auto">
      {/* Welcome header */}
      <h1 className="font-heading text-3xl sm:text-4xl text-accent-gold text-center mb-3">
        Let's Build Your Adventurer!
      </h1>
      <p className="text-parchment/60 text-center mb-8 max-w-md">
        Choose how you'd like to create your character. You can always switch
        between modes later.
      </p>

      {/* Resume banner */}
      {hasExistingProgress && (
        <div className="w-full rounded-lg border border-accent-gold/30 bg-accent-gold/5 px-4 py-3 mb-8 flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="flex-1">
            <p className="text-parchment text-sm font-medium">
              Welcome back!{' '}
              {characterName
                ? `You were building ${characterName}.`
                : 'You have a character in progress.'}
            </p>
            <p className="text-parchment/50 text-xs mt-0.5">
              Resume where you left off or start fresh.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleGuidedCreation}
              className="flex items-center gap-1.5 rounded-lg bg-accent-gold/10 px-3 py-1.5 text-xs font-medium text-accent-gold hover:bg-accent-gold/20 transition-colors"
            >
              <ArrowRight className="h-3.5 w-3.5" />
              Resume
            </button>
            <button
              type="button"
              onClick={handleStartFresh}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs text-parchment/60 hover:text-parchment transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Start Fresh
            </button>
          </div>
        </div>
      )}

      {/* Name inputs */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <div>
          <label
            htmlFor="character-name"
            className="block text-sm text-parchment/70 mb-1.5"
          >
            Character Name{' '}
            <span className="text-parchment/30">(optional)</span>
          </label>
          <input
            id="character-name"
            type="text"
            value={characterName}
            onChange={(e) => setCharacterName(e.target.value)}
            placeholder="e.g. Thorn Ironforge"
            className="w-full rounded-lg border border-parchment/15 bg-bg-primary px-3 py-2.5 text-sm text-parchment placeholder:text-parchment/25 focus:border-accent-gold/50 focus:outline-none focus:ring-1 focus:ring-accent-gold/30 transition-colors"
          />
        </div>
        <div>
          <label
            htmlFor="player-name"
            className="block text-sm text-parchment/70 mb-1.5"
          >
            Player Name{' '}
            <span className="text-parchment/30">(optional)</span>
          </label>
          <input
            id="player-name"
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="Your name"
            className="w-full rounded-lg border border-parchment/15 bg-bg-primary px-3 py-2.5 text-sm text-parchment placeholder:text-parchment/25 focus:border-accent-gold/50 focus:outline-none focus:ring-1 focus:ring-accent-gold/30 transition-colors"
          />
        </div>
      </div>

      {/* Mode selection cards */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Guided Creation */}
        <button
          type="button"
          onClick={handleGuidedCreation}
          className="group flex flex-col items-center rounded-xl border border-parchment/15 bg-bg-secondary p-6 text-center transition-all hover:border-accent-gold/40 hover:bg-accent-gold/5"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent-gold/10 mb-4 group-hover:bg-accent-gold/20 transition-colors">
            <Wand2 className="h-7 w-7 text-accent-gold" />
          </div>
          <h3 className="font-heading text-lg text-parchment mb-2">
            Guided Creation
          </h3>
          <p className="text-sm text-parchment/50 leading-relaxed">
            Perfect for new players. We'll walk you through each choice
            step by step with helpful explanations.
          </p>
        </button>

        {/* Freeform Creation */}
        <button
          type="button"
          onClick={onSelectFreeform}
          className="group flex flex-col items-center rounded-xl border border-parchment/15 bg-bg-secondary p-6 text-center transition-all hover:border-spell-blue/40 hover:bg-spell-blue/5"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-spell-blue/10 mb-4 group-hover:bg-spell-blue/20 transition-colors">
            <Edit3 className="h-7 w-7 text-spell-blue" />
          </div>
          <h3 className="font-heading text-lg text-parchment mb-2">
            Freeform Creation
          </h3>
          <p className="text-sm text-parchment/50 leading-relaxed">
            For experienced players. Fill out an open character sheet form
            in any order you like.
          </p>
        </button>
      </div>
    </div>
  )
}
