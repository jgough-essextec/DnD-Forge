// =============================================================================
// DeleteConfirmDialog (Story 21.3)
//
// Confirmation dialog for deleting a character. Shows the character name
// and a red Delete button. Can also handle batch delete with a count.
// =============================================================================

import { useEffect, useRef, useCallback } from 'react';
import { AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DeleteConfirmDialogProps {
  open: boolean;
  characterName?: string;
  batchCount?: number;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteConfirmDialog({
  open,
  characterName,
  batchCount,
  onConfirm,
  onCancel,
}: DeleteConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const cancelBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
      cancelBtnRef.current?.focus();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCancel();
      }
    },
    [onCancel],
  );

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === dialogRef.current) {
        onCancel();
      }
    },
    [onCancel],
  );

  const isBatch = batchCount !== undefined && batchCount > 1;
  const title = isBatch
    ? `Delete ${batchCount} Characters`
    : 'Delete Character';
  const description = isBatch
    ? `Are you sure you want to permanently delete ${batchCount} characters? This action cannot be undone.`
    : `Are you sure you want to permanently delete "${characterName ?? 'this character'}"? This action cannot be undone.`;

  return (
    <dialog
      ref={dialogRef}
      onKeyDown={handleKeyDown}
      onClick={handleBackdropClick}
      className={cn(
        'rounded-xl border border-parchment/20 bg-bg-primary p-0 shadow-2xl',
        'backdrop:bg-black/60 backdrop:backdrop-blur-sm',
        'max-w-md w-full',
      )}
      aria-labelledby="delete-dialog-title"
      data-testid="delete-confirm-dialog"
    >
      <div className="p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-damage-red/15 flex items-center justify-center flex-shrink-0">
            <AlertTriangle size={24} className="text-damage-red" />
          </div>

          <div className="flex-1">
            <h2
              id="delete-dialog-title"
              className="font-heading text-xl text-parchment mb-2"
            >
              {title}
            </h2>
            <p className="text-sm text-parchment/60">
              {description}
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            ref={cancelBtnRef}
            onClick={onCancel}
            className={cn(
              'px-4 py-2 rounded-lg text-sm',
              'border border-parchment/20 text-parchment/70',
              'hover:bg-parchment/10 hover:text-parchment transition-colors',
            )}
            data-testid="delete-cancel-btn"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-semibold',
              'bg-damage-red text-white',
              'hover:bg-damage-red/80 transition-colors',
            )}
            data-testid="delete-confirm-btn"
          >
            Delete
          </button>
        </div>
      </div>
    </dialog>
  );
}
