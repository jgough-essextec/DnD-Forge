/**
 * EditableSection - Wrapper that adds a pencil edit icon overlay to
 * preview sections. On click, opens the QuickEditModal with the
 * appropriate wizard step.
 */

import { cn } from '@/lib/utils'

interface EditableSectionProps {
  stepId: number
  label: string
  onEdit?: (stepId: number) => void
  children: React.ReactNode
}

export function EditableSection({ stepId, label, onEdit, children }: EditableSectionProps) {
  if (!onEdit) {
    return <>{children}</>
  }

  return (
    <div className="relative group" data-testid={`editable-section-${stepId}`}>
      {children}
      <button
        onClick={() => onEdit(stepId)}
        className={cn(
          'absolute top-2 right-2 p-1.5 rounded-md',
          'opacity-0 group-hover:opacity-100',
          'bg-bg-primary/80 border border-parchment/20',
          'text-parchment/50 hover:text-accent-gold hover:border-accent-gold/30',
          'transition-all focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-accent-gold/50',
        )}
        aria-label={`Edit ${label}`}
        data-testid={`edit-button-${stepId}`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
          <path d="m15 5 4 4" />
        </svg>
      </button>
    </div>
  )
}
