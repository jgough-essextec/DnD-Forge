import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { X, ChevronRight, ChevronLeft, Copy, Check } from 'lucide-react'
import { CampaignForm, type CampaignFormData } from './CampaignForm'
import { useCreateCampaign } from '@/hooks/useCampaigns'
import { useUIStore } from '@/stores/uiStore'
import { DEFAULT_CAMPAIGN_SETTINGS } from '@/utils/campaign'
import type { CampaignSettings } from '@/types/campaign'

type Step = 'basic' | 'rules' | 'invite'

interface CreateCampaignModalProps {
  isOpen: boolean
  onClose: () => void
}

export function CreateCampaignModal({ isOpen, onClose }: CreateCampaignModalProps) {
  const navigate = useNavigate()
  const createCampaign = useCreateCampaign()
  const addToast = useUIStore((s) => s.addToast)

  const [step, setStep] = useState<Step>('basic')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [settings, setSettings] = useState<CampaignSettings>(DEFAULT_CAMPAIGN_SETTINGS)
  const [createdJoinCode, setCreatedJoinCode] = useState<string | null>(null)
  const [createdCampaignId, setCreatedCampaignId] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const resetForm = useCallback(() => {
    setStep('basic')
    setName('')
    setDescription('')
    setSettings(DEFAULT_CAMPAIGN_SETTINGS)
    setCreatedJoinCode(null)
    setCreatedCampaignId(null)
    setCopied(false)
  }, [])

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const handleBasicSubmit = (data: CampaignFormData) => {
    setName(data.name)
    setDescription(data.description)
    setSettings(data.settings)
    setStep('rules')
  }

  const handleRulesNext = () => {
    createCampaign.mutate(
      { name, description, settings },
      {
        onSuccess: (campaign) => {
          setCreatedJoinCode(campaign.joinCode)
          setCreatedCampaignId(campaign.id)
          setStep('invite')
          addToast({ message: `Campaign "${campaign.name}" created!`, type: 'success' })
        },
        onError: () => {
          addToast({ message: 'Failed to create campaign.', type: 'error' })
        },
      }
    )
  }

  const handleCopyCode = async () => {
    if (createdJoinCode) {
      await navigator.clipboard.writeText(createdJoinCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleCopyUrl = async () => {
    if (createdJoinCode) {
      const url = `${window.location.origin}/join/${createdJoinCode}`
      await navigator.clipboard.writeText(url)
      setCopied(true)
      addToast({ message: 'Invite URL copied to clipboard!', type: 'success' })
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleGoToCampaign = () => {
    if (createdCampaignId) {
      handleClose()
      navigate(`/campaign/${createdCampaignId}`)
    }
  }

  if (!isOpen) return null

  const stepLabels: Record<Step, string> = {
    basic: 'Basic Info',
    rules: 'House Rules',
    invite: 'Invite Players',
  }

  const steps: Step[] = ['basic', 'rules', 'invite']
  const currentStepIndex = steps.indexOf(step)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div
        className="bg-bg-secondary rounded-lg border-2 border-parchment/20 w-full max-w-lg max-h-[90vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-label="Create Campaign"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-parchment/10">
          <h2 className="font-heading text-xl text-accent-gold">
            Create Campaign
          </h2>
          <button
            onClick={handleClose}
            className="text-parchment/60 hover:text-parchment transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 px-4 pt-4">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-semibold ${
                  i <= currentStepIndex
                    ? 'bg-accent-gold text-bg-primary'
                    : 'bg-parchment/10 text-parchment/40'
                }`}
              >
                {i + 1}
              </div>
              <span
                className={`text-sm ${
                  i <= currentStepIndex
                    ? 'text-parchment'
                    : 'text-parchment/40'
                }`}
              >
                {stepLabels[s]}
              </span>
              {i < steps.length - 1 && (
                <ChevronRight className="w-4 h-4 text-parchment/20" />
              )}
            </div>
          ))}
        </div>

        {/* Body */}
        <div className="p-4">
          {step === 'basic' && (
            <CampaignForm
              initialData={{ name, description, settings }}
              onSubmit={handleBasicSubmit}
              submitLabel="Next: House Rules"
              showHouseRules={false}
            />
          )}

          {step === 'rules' && (
            <div className="space-y-4">
              <CampaignForm
                initialData={{ name, description, settings }}
                onSubmit={(data) => {
                  setSettings(data.settings)
                  handleRulesNext()
                }}
                submitLabel={createCampaign.isPending ? 'Creating...' : 'Create Campaign'}
                isSubmitting={createCampaign.isPending}
                showHouseRules={true}
              />
              <button
                type="button"
                onClick={() => setStep('basic')}
                className="flex items-center gap-1 text-sm text-parchment/60 hover:text-parchment transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Back to Basic Info
              </button>
            </div>
          )}

          {step === 'invite' && (
            <div className="space-y-6">
              <div className="text-center">
                <p className="text-parchment mb-4">
                  Your campaign has been created! Share this code with your players:
                </p>
                <div className="inline-flex items-center gap-3 px-6 py-3 rounded-lg bg-bg-primary border-2 border-accent-gold/40">
                  <span className="font-heading text-3xl text-accent-gold tracking-widest">
                    {createdJoinCode}
                  </span>
                  <button
                    onClick={handleCopyCode}
                    className="p-2 rounded hover:bg-parchment/10 transition-colors"
                    aria-label="Copy join code"
                  >
                    {copied ? (
                      <Check className="w-5 h-5 text-green-400" />
                    ) : (
                      <Copy className="w-5 h-5 text-parchment/60" />
                    )}
                  </button>
                </div>
              </div>

              <div className="text-center">
                <button
                  type="button"
                  onClick={handleCopyUrl}
                  className="text-sm text-accent-gold hover:text-accent-gold/80 underline"
                >
                  Copy shareable invite URL
                </button>
              </div>

              <div className="flex justify-center pt-4">
                <button
                  type="button"
                  onClick={handleGoToCampaign}
                  className="px-6 py-2 rounded-lg bg-accent-gold text-bg-primary font-semibold hover:bg-accent-gold/90 transition-colors"
                >
                  Go to Campaign Dashboard
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
