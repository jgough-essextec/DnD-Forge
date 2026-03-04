// =============================================================================
// GalleryEmptyState (Story 21.1)
//
// Welcoming empty state shown when the gallery has no characters.
// Two variants:
// 1. No characters at all -> "Create your first adventurer!"
// 2. Filters returned no results -> "No characters match your filters"
// =============================================================================

import { Scroll, Plus, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GalleryEmptyStateProps {
  isFiltered: boolean;
  onCreateNew: () => void;
}

export function GalleryEmptyState({ isFiltered, onCreateNew }: GalleryEmptyStateProps) {
  if (isFiltered) {
    return (
      <div
        className="flex flex-col items-center justify-center py-20 text-center"
        data-testid="empty-state-filtered"
      >
        <div className="w-20 h-20 rounded-full bg-parchment/5 flex items-center justify-center mb-6">
          <Search size={36} className="text-parchment/30" />
        </div>
        <h2 className="font-heading text-2xl text-parchment/60 mb-2">
          No Characters Found
        </h2>
        <p className="text-parchment/40 max-w-md mb-6">
          No characters match your current filters. Try adjusting your search
          or clearing some filters.
        </p>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col items-center justify-center py-20 text-center"
      data-testid="empty-state-new"
    >
      {/* Illustration: scroll/parchment icon */}
      <div
        className={cn(
          'w-28 h-28 rounded-full flex items-center justify-center mb-8',
          'bg-gradient-to-br from-accent-gold/10 to-accent-gold/5',
          'border-2 border-accent-gold/20',
        )}
      >
        <Scroll size={48} className="text-accent-gold/60" />
      </div>

      <h2 className="font-heading text-3xl text-accent-gold mb-3">
        Begin Your Adventure
      </h2>
      <p className="text-parchment/60 max-w-md mb-8 text-lg">
        Create your first adventurer and embark on epic quests. Your character
        gallery awaits its first hero.
      </p>

      <button
        onClick={onCreateNew}
        className={cn(
          'inline-flex items-center gap-2 px-6 py-3 rounded-lg',
          'bg-accent-gold text-bg-primary font-semibold',
          'hover:bg-accent-gold/90 transition-colors',
          'shadow-lg shadow-accent-gold/25',
        )}
        data-testid="create-first-character-btn"
      >
        <Plus size={20} />
        Create Your First Adventurer
      </button>
    </div>
  );
}
