import { useState } from 'react'
import { X, Copy, Check, RefreshCw, AlertTriangle } from 'lucide-react'
import { CampaignForm, type CampaignFormData } from './CampaignForm'
import { useUpdateCampaign, useRegenerateCode } from '@/hooks/useCampaigns'
import { useUIStore } from '@/stores/uiStore'
import type { Campaign } from '@/types/campaign'

type Tab = 'details' | 'rules' | 'invite'

interface EditCampaignModalProps {
  isOpen: boolean
  onClose: () => void
  campaign: Campaign
}

export function EditCampaignModal({
  isOpen,
  onClose,
  campaign,
}: EditCampaignModalProps) {
  const updateCampaign = useUpdateCampaign()
  const regenerateCode = useRegenerateCode()
  const addToast = useUIStore((s) => s.addToast)

  const [activeTab, setActiveTab] = useState<Tab>('details')
  const [copied, setCopied] = useState(false)
  const [showRegenerateConfirm, setShowRegenerateConfirm] = useState(false)

  const handleSubmit = (data: CampaignFormData) => {
    updateCampaign.mutate(
      { id: campaign.id, data: { name: data.name, description: data.description, settings: data.settings } },
      {
        onSuccess: () => {
          addToast({ message: 'Campaign updated!', type: 'success' })
          onClose()
        },
        onError: () => {
          addToast({ message: 'Failed to update campaign.', type: 'error' })
        },
      }
    )
  }

  const handleCopyCode = async () => {
    await navigator.clipboard.writeText(campaign.joinCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleRegenerateCode = () => {
    regenerateCode.mutate(campaign.id, {
      onSuccess: () => {
        addToast({ message: 'Join code regenerated!', type: 'success' })
        setShowRegenerateConfirm(false)
      },
      onError: () => {
        addToast({ message: 'Failed to regenerate code.', type: 'error' })
      },
    })
  }

  if (!isOpen) return null

  const tabs: { key: Tab; label: string }[] = [
    { key: 'details', label: 'Details' },
    { key: 'rules', label: 'House Rules' },
    { key: 'invite', label: 'Invite' },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div
        className="bg-bg-secondary rounded-lg border-2 border-parchment/20 w-full max-w-lg max-h-[90vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-label="Edit Campaign"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-parchment/10">
          <h2 className="font-heading text-xl text-accent-gold">
            Edit Campaign
          </h2>
          <button
            onClick={onClose}
            className="text-parchment/60 hover:text-parchment transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-parchment/10">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? 'text-accent-gold border-b-2 border-accent-gold'
                  : 'text-parchment/60 hover:text-parchment'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Mid-campaign warning */}
        {activeTab === 'rules' && (
          <div className="mx-4 mt-4 p-3 rounded-lg bg-amber-900/20 border border-amber-500/30 flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-200">
              Changing house rules mid-campaign may affect existing characters.
              Review with your players before making changes.
            </p>
          </div>
        )}

        {/* Body */}
        <div className="p-4">
          {(activeTab === 'details' || activeTab === 'rules') && (
            <CampaignForm
              initialData={{
                name: campaign.name,
                description: campaign.description,
                settings: campaign.settings,
              }}
              onSubmit={handleSubmit}
              submitLabel={updateCampaign.isPending ? 'Saving...' : 'Save Changes'}
              isSubmitting={updateCampaign.isPending}
              showHouseRules={activeTab === 'rules'}
            />
          )}

          {activeTab === 'invite' && (
            <div className="space-y-6">
              <div className="text-center">
                <p className="text-parchment/80 text-sm mb-4">
                  Share this code with players to join your campaign:
                </p>
                <div className="inline-flex items-center gap-3 px-6 py-3 rounded-lg bg-bg-primary border-2 border-accent-gold/40">
                  <span className="font-heading text-3xl text-accent-gold tracking-widest">
                    {campaign.joinCode}
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

              <div className="border-t border-parchment/10 pt-4">
                {!showRegenerateConfirm ? (
                  <button
                    type="button"
                    onClick={() => setShowRegenerateConfirm(true)}
                    className="flex items-center gap-2 text-sm text-parchment/60 hover:text-parchment transition-colors mx-auto"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Generate New Code
                  </button>
                ) : (
                  <div className="text-center space-y-3">
                    <p className="text-sm text-amber-200">
                      This will invalidate the current join code. Players with the old
                      code will not be able to join.
                    </p>
                    <div className="flex justify-center gap-3">
                      <button
                        type="button"
                        onClick={() => setShowRegenerateConfirm(false)}
                        className="px-4 py-1.5 rounded-lg border border-parchment/20 text-sm text-parchment hover:bg-parchment/10 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleRegenerateCode}
                        disabled={regenerateCode.isPending}
                        className="px-4 py-1.5 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 disabled:opacity-50 transition-colors"
                      >
                        {regenerateCode.isPending
                          ? 'Regenerating...'
                          : 'Confirm Regenerate'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
