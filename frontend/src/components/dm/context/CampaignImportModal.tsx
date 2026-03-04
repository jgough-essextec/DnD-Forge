/**
 * CampaignImportModal (Story 38.4)
 *
 * Modal for importing campaign data from a JSON file.
 * Features:
 * - File picker for JSON import
 * - 5-stage validation display with progress
 * - Merge detection: "Merge (update existing)" vs "Import as new copy"
 * - Import summary and confirmation
 */

import { useState, useRef, useCallback } from 'react'
import {
  Upload,
  X,
  FileJson,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertTriangle,
  GitMerge,
  Copy,
} from 'lucide-react'
import type { Character } from '@/types/character'
import {
  validateCampaignImport,
  detectDuplicateCharacters,
  importCampaign,
} from '@/utils/campaign-export'
import type {
  ImportValidationResult,
  CampaignExportData,
  DuplicateCharacterMatch,
  MergeStrategy,
  CampaignImportResult,
} from '@/utils/campaign-export'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface CampaignImportModalProps {
  isOpen: boolean
  onClose: () => void
  existingCharacters: Character[]
  onImportComplete: (result: CampaignImportResult) => void
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ImportStep = 'upload' | 'validating' | 'merge-choice' | 'summary' | 'error'

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function CampaignImportModal({
  isOpen,
  onClose,
  existingCharacters,
  onImportComplete,
}: CampaignImportModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [step, setStep] = useState<ImportStep>('upload')
  const [fileName, setFileName] = useState('')
  const [_rawJson, setRawJson] = useState('')
  const [validation, setValidation] = useState<ImportValidationResult | null>(null)
  const [parsedData, setParsedData] = useState<CampaignExportData | null>(null)
  const [duplicates, setDuplicates] = useState<DuplicateCharacterMatch[]>([])
  const [mergeStrategy, setMergeStrategy] = useState<MergeStrategy>('new-copy')
  const [importResult, setImportResult] = useState<CampaignImportResult | null>(null)

  const reset = useCallback(() => {
    setStep('upload')
    setFileName('')
    setRawJson('')
    setValidation(null)
    setParsedData(null)
    setDuplicates([])
    setMergeStrategy('new-copy')
    setImportResult(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [])

  const handleClose = () => {
    reset()
    onClose()
  }

  if (!isOpen) return null

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setFileName(file.name)
    setStep('validating')

    try {
      const text = await file.text()
      setRawJson(text)

      // Run validation
      const result = validateCampaignImport(text)
      setValidation(result)

      if (!result.valid) {
        setStep('error')
        return
      }

      // Parse the data for import
      const data = JSON.parse(text) as CampaignExportData
      setParsedData(data)

      // Check for duplicates
      const dups = detectDuplicateCharacters(data.characters, existingCharacters)
      setDuplicates(dups)

      if (dups.length > 0) {
        setStep('merge-choice')
      } else {
        // No duplicates — go straight to summary
        const result = importCampaign(data, 'new-copy')
        setImportResult(result)
        setStep('summary')
      }
    } catch {
      setValidation({
        valid: false,
        stages: [
          {
            stage: 'File Read',
            passed: false,
            errors: ['Failed to read the file. Ensure it is a valid JSON file.'],
          },
        ],
      })
      setStep('error')
    }
  }

  const handleMergeChoice = (strategy: MergeStrategy) => {
    setMergeStrategy(strategy)
    if (parsedData) {
      const result = importCampaign(parsedData, strategy)
      setImportResult(result)
      setStep('summary')
    }
  }

  const handleConfirmImport = () => {
    if (importResult) {
      onImportComplete(importResult)
      handleClose()
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="import-modal-title"
      data-testid="campaign-import-modal"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Modal content */}
      <div className="relative z-10 w-full max-w-lg rounded-xl border border-parchment/20 bg-bg-secondary p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-accent-gold" />
            <h2
              id="import-modal-title"
              className="font-heading text-xl text-accent-gold"
            >
              Import Campaign
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="p-1 rounded hover:bg-parchment/10 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-parchment/60" />
          </button>
        </div>

        {/* Step: Upload */}
        {step === 'upload' && (
          <div className="space-y-4">
            <p className="text-parchment/60 text-sm">
              Select a campaign JSON file to import.
            </p>
            <div
              className="border-2 border-dashed border-parchment/20 rounded-lg p-8 text-center hover:border-accent-gold/30 transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  fileInputRef.current?.click()
                }
              }}
              data-testid="file-drop-zone"
            >
              <FileJson className="w-10 h-10 text-parchment/30 mx-auto mb-3" />
              <p className="text-parchment/60 text-sm mb-1">
                Click to select a JSON file
              </p>
              <p className="text-parchment/40 text-xs">
                Campaign export files (.json)
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              onChange={handleFileSelect}
              className="hidden"
              data-testid="file-input"
              aria-label="Campaign JSON file"
            />
          </div>
        )}

        {/* Step: Validating */}
        {step === 'validating' && (
          <div className="space-y-4" data-testid="validation-progress">
            <p className="text-parchment/60 text-sm">
              Validating <span className="font-mono text-parchment">{fileName}</span>...
            </p>
            <div className="flex items-center gap-2 text-parchment/60">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Running validation checks...</span>
            </div>
          </div>
        )}

        {/* Step: Validation Error */}
        {step === 'error' && validation && (
          <div className="space-y-4" data-testid="validation-errors">
            <p className="text-parchment/60 text-sm">
              Validation failed for{' '}
              <span className="font-mono text-parchment">{fileName}</span>.
            </p>

            {/* Validation stages */}
            <div className="space-y-2">
              {validation.stages.map((stage) => (
                <div
                  key={stage.stage}
                  className={`flex items-start gap-2 p-3 rounded-lg border ${
                    stage.passed
                      ? 'border-green-500/20 bg-green-500/5'
                      : 'border-red-500/20 bg-red-500/5'
                  }`}
                >
                  {stage.passed ? (
                    <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                  )}
                  <div>
                    <span className="text-sm font-medium text-parchment">
                      {stage.stage}
                    </span>
                    {stage.errors.length > 0 && (
                      <ul className="mt-1 space-y-0.5">
                        {stage.errors.map((err, i) => (
                          <li
                            key={i}
                            className="text-xs text-red-300"
                          >
                            {err}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={reset}
                className="flex-1 px-4 py-2 rounded-lg border border-parchment/20 text-parchment/60 hover:bg-parchment/10 text-sm transition-colors"
              >
                Try Another File
              </button>
              <button
                onClick={handleClose}
                className="flex-1 px-4 py-2 rounded-lg border border-parchment/20 text-parchment/60 hover:bg-parchment/10 text-sm transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Step: Merge Choice */}
        {step === 'merge-choice' && (
          <div className="space-y-4" data-testid="merge-choice">
            <div className="flex items-start gap-2 p-3 rounded-lg border border-amber-500/20 bg-amber-500/5">
              <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-parchment">
                  Duplicate Characters Detected
                </p>
                <p className="text-xs text-parchment/60 mt-0.5">
                  {duplicates.length} character{duplicates.length !== 1 ? 's' : ''}{' '}
                  in this import match existing characters by name, race, and class.
                </p>
              </div>
            </div>

            {/* Duplicate list */}
            <div className="space-y-1.5">
              {duplicates.map((dup, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 p-2 rounded bg-bg-primary text-sm"
                >
                  <span className="text-parchment font-medium">
                    {dup.importedName}
                  </span>
                  <span className="text-parchment/40 text-xs">
                    {dup.importedRace} {dup.importedClass}
                  </span>
                </div>
              ))}
            </div>

            {/* Merge options */}
            <div className="space-y-3">
              <button
                onClick={() => handleMergeChoice('merge')}
                className="w-full flex items-start gap-3 p-4 rounded-lg border border-parchment/20 bg-bg-primary hover:border-accent-gold/30 transition-colors text-left"
                data-testid="merge-option"
              >
                <GitMerge className="w-5 h-5 text-accent-gold mt-0.5 flex-shrink-0" />
                <div>
                  <span className="block font-semibold text-parchment text-sm">
                    Merge (update existing)
                  </span>
                  <span className="block text-xs text-parchment/50 mt-0.5">
                    Updates existing characters with imported data. Keeps their
                    current IDs.
                  </span>
                </div>
              </button>

              <button
                onClick={() => handleMergeChoice('new-copy')}
                className="w-full flex items-start gap-3 p-4 rounded-lg border border-parchment/20 bg-bg-primary hover:border-accent-gold/30 transition-colors text-left"
                data-testid="new-copy-option"
              >
                <Copy className="w-5 h-5 text-accent-gold mt-0.5 flex-shrink-0" />
                <div>
                  <span className="block font-semibold text-parchment text-sm">
                    Import as new copy
                  </span>
                  <span className="block text-xs text-parchment/50 mt-0.5">
                    Creates new character records with new IDs. Existing
                    characters are left unchanged.
                  </span>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Step: Summary */}
        {step === 'summary' && importResult && parsedData && (
          <div className="space-y-4" data-testid="import-summary">
            <div className="flex items-start gap-2 p-3 rounded-lg border border-green-500/20 bg-green-500/5">
              <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-parchment">
                  Ready to Import
                </p>
                <p className="text-xs text-parchment/60 mt-0.5">
                  All validation checks passed. Review the import summary below.
                </p>
              </div>
            </div>

            <div className="rounded-lg border border-parchment/10 bg-bg-primary p-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-parchment/60">Campaign</span>
                <span className="text-parchment font-medium">
                  {parsedData.campaign.name}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-parchment/60">Characters</span>
                <span className="text-parchment">
                  {importResult.characters.length}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-parchment/60">Sessions</span>
                <span className="text-parchment">
                  {parsedData.sessions.length}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-parchment/60">NPCs</span>
                <span className="text-parchment">
                  {parsedData.npcs.length}
                </span>
              </div>
              {duplicates.length > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-parchment/60">Merge Strategy</span>
                  <span className="text-accent-gold text-xs font-medium">
                    {mergeStrategy === 'merge'
                      ? 'Merge (update existing)'
                      : 'Import as new copy'}
                  </span>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleClose}
                className="flex-1 px-4 py-2 rounded-lg border border-parchment/20 text-parchment/60 hover:bg-parchment/10 text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmImport}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-accent-gold text-bg-primary font-semibold hover:bg-accent-gold/90 text-sm transition-colors"
                data-testid="confirm-import-button"
              >
                <Upload className="w-4 h-4" />
                Import Campaign
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
