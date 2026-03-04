// =============================================================================
// BatchActionBar (Story 21.3)
//
// Floating action bar shown when in select mode with characters selected.
// Displays: "N selected -- Archive | Delete | Export All"
// =============================================================================

import { Archive, Trash2, Download, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BatchActionBarProps {
  selectedCount: number;
  onArchive: () => void;
  onDelete: () => void;
  onExport: () => void;
  onCancel: () => void;
}

export function BatchActionBar({
  selectedCount,
  onArchive,
  onDelete,
  onExport,
  onCancel,
}: BatchActionBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div
      className={cn(
        'fixed bottom-6 left-1/2 -translate-x-1/2 z-50',
        'flex items-center gap-3 px-5 py-3 rounded-xl',
        'bg-bg-secondary border border-parchment/20 shadow-2xl shadow-black/40',
        'backdrop-blur-sm',
      )}
      role="toolbar"
      aria-label="Batch actions"
      data-testid="batch-action-bar"
    >
      <span className="text-sm text-parchment/80 font-semibold whitespace-nowrap">
        {selectedCount} selected
      </span>

      <div className="w-px h-6 bg-parchment/20" />

      <button
        onClick={onArchive}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-parchment/70 hover:text-parchment hover:bg-parchment/10 transition-colors"
        aria-label="Archive selected"
      >
        <Archive size={16} />
        Archive
      </button>

      <button
        onClick={onExport}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-parchment/70 hover:text-parchment hover:bg-parchment/10 transition-colors"
        aria-label="Export selected"
      >
        <Download size={16} />
        Export
      </button>

      <button
        onClick={onDelete}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-damage-red hover:bg-damage-red/10 transition-colors"
        aria-label="Delete selected"
      >
        <Trash2 size={16} />
        Delete
      </button>

      <div className="w-px h-6 bg-parchment/20" />

      <button
        onClick={onCancel}
        className="p-1.5 rounded-lg text-parchment/50 hover:text-parchment hover:bg-parchment/10 transition-colors"
        aria-label="Cancel selection"
      >
        <X size={16} />
      </button>
    </div>
  );
}
